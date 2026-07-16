-- Benama Cuisines — Row Level Security
-- Model: menu + store settings are public-read; staff manage everything;
-- customers see only their own profile/orders. Order writes happen server-side
-- via the service role (which bypasses RLS), so no public insert policies here.

-- Staff check used across policies. security definer so it can read profiles
-- regardless of the caller's own row-level access.
create or replace function is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role in ('staff', 'admin')
  );
$$;

alter table profiles           enable row level security;
alter table menu_categories    enable row level security;
alter table menu_items         enable row level security;
alter table item_option_groups enable row level security;
alter table item_options       enable row level security;
alter table orders             enable row level security;
alter table order_items        enable row level security;
alter table store_settings     enable row level security;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create policy "profiles: read own" on profiles
  for select using (id = auth.uid());
create policy "profiles: staff read all" on profiles
  for select using (is_staff());
create policy "profiles: update own" on profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- ---------------------------------------------------------------------------
-- Menu — public read, staff write
-- ---------------------------------------------------------------------------
create policy "menu_categories: public read" on menu_categories
  for select using (true);
create policy "menu_categories: staff write" on menu_categories
  for all using (is_staff()) with check (is_staff());

create policy "menu_items: public read" on menu_items
  for select using (true);
create policy "menu_items: staff write" on menu_items
  for all using (is_staff()) with check (is_staff());

create policy "item_option_groups: public read" on item_option_groups
  for select using (true);
create policy "item_option_groups: staff write" on item_option_groups
  for all using (is_staff()) with check (is_staff());

create policy "item_options: public read" on item_options
  for select using (true);
create policy "item_options: staff write" on item_options
  for all using (is_staff()) with check (is_staff());

-- ---------------------------------------------------------------------------
-- store_settings — public read (hours, pause state), staff update
-- ---------------------------------------------------------------------------
create policy "store_settings: public read" on store_settings
  for select using (true);
create policy "store_settings: staff write" on store_settings
  for all using (is_staff()) with check (is_staff());

-- ---------------------------------------------------------------------------
-- Orders — customers read their own; staff read/manage all.
-- Inserts/guest tracking are handled by server routes using the service role.
-- ---------------------------------------------------------------------------
create policy "orders: read own" on orders
  for select using (user_id = auth.uid());
create policy "orders: staff read all" on orders
  for select using (is_staff());
create policy "orders: staff update" on orders
  for update using (is_staff()) with check (is_staff());

create policy "order_items: read own" on order_items
  for select using (
    exists (
      select 1 from orders o
      where o.id = order_items.order_id and o.user_id = auth.uid()
    )
  );
create policy "order_items: staff read all" on order_items
  for select using (is_staff());
