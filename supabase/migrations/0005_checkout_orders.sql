-- Benama Cuisines — guest checkout support.
--
-- Order writes and guest order-tracking reads go through two SECURITY DEFINER
-- RPCs so the browser never needs the service-role key and customer PII is
-- never publicly readable:
--   * create_order — inserts an order + items, returns an unguessable token
--   * get_order    — returns an order ONLY when the matching token is supplied
--
-- These are intentionally anon-executable (guest checkout), so the security
-- advisor will flag them as public SECURITY DEFINER functions — that is by
-- design here, unlike the is_staff/handle_new_user helpers in 0003.
--
-- Placeholder-payment note: totals trust the client-supplied unit_price for
-- now. Before real Stripe charges, re-derive prices from the menu server-side.

alter table orders add column allergen_notes text;
alter table orders add column tracking_token uuid not null default gen_random_uuid();
alter table orders add constraint orders_tracking_token_unique unique (tracking_token);

-- create_order ---------------------------------------------------------------
create or replace function create_order(
  p_contact jsonb,
  p_pickup_type text default 'asap',
  p_special_instructions text default null,
  p_allergen_notes text default null,
  p_items jsonb default '[]'::jsonb
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_settings     store_settings;
  v_subtotal     numeric(10,2) := 0;
  v_tax          numeric(10,2);
  v_total        numeric(10,2);
  v_order_number text;
  v_token        uuid := gen_random_uuid();
  v_order_id     uuid;
  v_ready        timestamptz;
begin
  if jsonb_array_length(coalesce(p_items, '[]'::jsonb)) = 0 then
    raise exception 'Cannot place an empty order';
  end if;

  select * into v_settings from store_settings where id = true;
  if not found then
    raise exception 'Store is not configured';
  end if;
  if not v_settings.is_accepting_orders then
    raise exception 'The kitchen is not accepting orders right now';
  end if;

  select coalesce(sum((i ->> 'unit_price')::numeric * (i ->> 'quantity')::int), 0)
    into v_subtotal
  from jsonb_array_elements(p_items) as i;

  v_tax   := round(v_subtotal * v_settings.tax_rate, 2);
  v_total := v_subtotal + v_tax;
  v_ready := now() + (v_settings.prep_time_minutes || ' minutes')::interval;

  -- Human-facing order number; retry on the rare collision.
  loop
    v_order_number := 'BEN-' || upper(substr(md5(gen_random_uuid()::text), 1, 6));
    begin
      insert into orders (
        order_number, status, pickup_type, estimated_ready_at,
        contact_name, contact_email, contact_phone,
        subtotal, tax, tax_rate, total,
        special_instructions, allergen_notes, tracking_token
      ) values (
        v_order_number, 'received', p_pickup_type::pickup_type, v_ready,
        p_contact ->> 'name', p_contact ->> 'email', p_contact ->> 'phone',
        v_subtotal, v_tax, v_settings.tax_rate, v_total,
        p_special_instructions, p_allergen_notes, v_token
      ) returning id into v_order_id;
      exit;
    exception when unique_violation then
      -- collision on order_number: loop and try another
    end;
  end loop;

  insert into order_items (
    order_id, menu_item_id, item_name, unit_price, quantity,
    size, spice_level, selected_options, special_instructions, line_total
  )
  select
    v_order_id,
    nullif(i ->> 'menu_item_id', '')::uuid,
    i ->> 'name',
    (i ->> 'unit_price')::numeric,
    (i ->> 'quantity')::int,
    nullif(i ->> 'size', ''),
    nullif(i ->> 'spice', '')::spice_level,
    coalesce(i -> 'options', '[]'::jsonb),
    nullif(i ->> 'special_instructions', ''),
    (i ->> 'unit_price')::numeric * (i ->> 'quantity')::int
  from jsonb_array_elements(p_items) as i;

  return jsonb_build_object('order_number', v_order_number, 'tracking_token', v_token);
end;
$$;

-- get_order ------------------------------------------------------------------
create or replace function get_order(p_order_number text, p_token uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order orders;
  v_items jsonb;
begin
  select * into v_order from orders
  where order_number = p_order_number and tracking_token = p_token;
  if not found then
    return null;
  end if;

  select coalesce(jsonb_agg(to_jsonb(oi) order by oi.created_at), '[]'::jsonb)
    into v_items
  from order_items oi
  where oi.order_id = v_order.id;

  -- Only fields the customer needs; contact email/phone are omitted.
  return jsonb_build_object(
    'order_number', v_order.order_number,
    'status', v_order.status,
    'pickup_type', v_order.pickup_type,
    'estimated_ready_at', v_order.estimated_ready_at,
    'contact_name', v_order.contact_name,
    'subtotal', v_order.subtotal,
    'tax', v_order.tax,
    'total', v_order.total,
    'special_instructions', v_order.special_instructions,
    'allergen_notes', v_order.allergen_notes,
    'created_at', v_order.created_at,
    'items', v_items
  );
end;
$$;

grant execute on function create_order(jsonb, text, text, text, jsonb) to anon, authenticated;
grant execute on function get_order(text, uuid) to anon, authenticated;
