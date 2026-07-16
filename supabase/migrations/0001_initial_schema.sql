-- Benama Cuisines — initial schema
-- Source of truth: STRATEGY.md §6 (data model) + HANDOFF.md build decisions.
-- Money stored as numeric(10,2); Stripe amounts are derived at charge time.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type user_role as enum ('customer', 'staff', 'admin');
create type order_status as enum (
  'pending_payment', -- created, awaiting Stripe confirmation
  'received',        -- paid, shown on the kitchen queue
  'preparing',       -- accepted by kitchen
  'ready',           -- ready for pickup (customer notified)
  'picked_up',
  'cancelled'
);
create type pickup_type as enum ('asap', 'scheduled');
-- Heat meter: Low (1/3), Medium (2/3), Spicy Hot (full).
create type spice_level as enum ('low', 'medium', 'hot');

-- ---------------------------------------------------------------------------
-- Shared helpers
-- ---------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles — links to Supabase auth.users
-- ---------------------------------------------------------------------------
create table profiles (
  id                 uuid primary key references auth.users (id) on delete cascade,
  full_name          text,
  phone              text,
  role               user_role not null default 'customer',
  stripe_customer_id text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on profiles
  for each row execute function set_updated_at();

-- Auto-create a profile row whenever an auth user signs up.
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (new.id, new.raw_user_meta_data ->> 'full_name', new.phone);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ---------------------------------------------------------------------------
-- Menu
-- ---------------------------------------------------------------------------
create table menu_categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  description text,
  sort_order  int not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

create table menu_items (
  id               uuid primary key default gen_random_uuid(),
  category_id      uuid not null references menu_categories (id) on delete restrict,
  name             text not null,                    -- crave-first name
  local_name       text,                             -- e.g. "Jollof"
  description      text,
  base_price       numeric(10,2) not null check (base_price >= 0),
  -- Spice: when spice_selectable is false the dish is N/A (default_spice null).
  spice_selectable boolean not null default true,
  default_spice    spice_level,
  -- Sizing: mains come Regular / Large; Large is a flat surcharge.
  has_sizes        boolean not null default false,
  large_surcharge  numeric(10,2) not null default 6.00,
  image_url        text,
  is_available     boolean not null default true,    -- hard on/off (menu manager)
  is_sold_out      boolean not null default false,   -- temporary sold-out toggle
  sort_order       int not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  constraint menu_items_name_unique unique (name),
  constraint spice_default_requires_selectable
    check (default_spice is null or spice_selectable)
);

create index menu_items_category_idx on menu_items (category_id);
create index menu_items_sort_idx on menu_items (sort_order);

create trigger menu_items_set_updated_at
  before update on menu_items
  for each row execute function set_updated_at();

-- Option groups + choices (price deltas). Flexible so protein choices, extras,
-- add-ons can be attached per item later (HANDOFF open item).
create table item_option_groups (
  id          uuid primary key default gen_random_uuid(),
  item_id     uuid not null references menu_items (id) on delete cascade,
  name        text not null,                    -- e.g. "Choose your protein"
  min_select  int not null default 0,
  max_select  int not null default 1,
  is_required boolean not null default false,
  sort_order  int not null default 0
);

create index item_option_groups_item_idx on item_option_groups (item_id);

create table item_options (
  id           uuid primary key default gen_random_uuid(),
  group_id     uuid not null references item_option_groups (id) on delete cascade,
  name         text not null,                   -- e.g. "Chicken"
  price_delta  numeric(10,2) not null default 0,
  is_default   boolean not null default false,
  is_available boolean not null default true,
  sort_order   int not null default 0
);

create index item_options_group_idx on item_options (group_id);

-- ---------------------------------------------------------------------------
-- Orders
-- ---------------------------------------------------------------------------
create table orders (
  id                       uuid primary key default gen_random_uuid(),
  order_number             text not null unique,          -- human-facing, e.g. BEN-4821
  user_id                  uuid references auth.users (id) on delete set null, -- null = guest
  status                   order_status not null default 'pending_payment',
  pickup_type              pickup_type not null default 'asap',
  scheduled_for            timestamptz,                   -- scheduled slot start
  estimated_ready_at       timestamptz,                   -- ASAP estimate
  -- Contact (guest or signed-in), also used for SMS/email notifications.
  contact_name             text not null,
  contact_email            text not null,
  contact_phone            text not null,
  -- Money snapshot.
  subtotal                 numeric(10,2) not null default 0,
  tax                      numeric(10,2) not null default 0,
  tip                      numeric(10,2) not null default 0, -- no tipping at launch; kept for later
  total                    numeric(10,2) not null default 0,
  tax_rate                 numeric(6,4) not null default 0.0885,
  stripe_payment_intent_id text,
  special_instructions     text,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

create index orders_user_idx on orders (user_id);
create index orders_status_idx on orders (status);
create index orders_created_idx on orders (created_at);

create trigger orders_set_updated_at
  before update on orders
  for each row execute function set_updated_at();

-- Line items snapshot name/price at time of order (item may change/vanish later).
create table order_items (
  id                   uuid primary key default gen_random_uuid(),
  order_id             uuid not null references orders (id) on delete cascade,
  menu_item_id         uuid references menu_items (id) on delete set null,
  item_name            text not null,                   -- snapshot
  unit_price           numeric(10,2) not null,          -- base + size + options, per unit
  quantity             int not null check (quantity > 0),
  size                 text,                            -- 'regular' | 'large' | null
  spice_level          spice_level,                     -- selected; null when N/A
  selected_options     jsonb not null default '[]'::jsonb, -- [{group,name,price_delta}]
  special_instructions text,
  line_total           numeric(10,2) not null,
  created_at           timestamptz not null default now()
);

create index order_items_order_idx on order_items (order_id);

-- ---------------------------------------------------------------------------
-- store_settings — single-row config (hours, capacity, pause switch, prep time)
-- ---------------------------------------------------------------------------
create table store_settings (
  id                    boolean primary key default true,
  hours                 jsonb not null default '[]'::jsonb,
  slot_capacity         int not null default 6,       -- orders per scheduled slot
  slot_interval_minutes int not null default 15,
  prep_time_minutes     int not null default 20,      -- default ASAP lead time
  is_accepting_orders   boolean not null default true, -- "kitchen slammed" pause switch
  tax_rate              numeric(6,4) not null default 0.0885,
  updated_at            timestamptz not null default now(),
  constraint store_settings_singleton check (id)
);

create trigger store_settings_set_updated_at
  before update on store_settings
  for each row execute function set_updated_at();
