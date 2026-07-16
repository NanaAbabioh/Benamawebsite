-- Benama Cuisines — menu seed (MENU.md v1)
-- Idempotent: safe to re-run. Categories keyed by slug; items keyed by name.
--
-- Not seeded (open items in MENU.md / HANDOFF.md):
--   * Protein choice for mains — undecided; schema supports it via
--     item_option_groups / item_options when confirmed.
--   * Waakye extras are described as included, so no add-on group.
--   * Allergen labels — pending.

-- Categories -----------------------------------------------------------------
insert into menu_categories (name, slug, sort_order) values
  ('Main Meals', 'main-meals', 1),
  ('Sides',      'sides',      2),
  ('Drinks',     'drinks',     3),
  ('Desserts',   'desserts',   4)
on conflict (slug) do update
  set name = excluded.name, sort_order = excluded.sort_order;

-- Store settings singleton ---------------------------------------------------
insert into store_settings (id, hours, prep_time_minutes, is_accepting_orders, tax_rate)
values (
  true,
  '[
    {"day":"Mon","open":"11:00","close":"21:00"},
    {"day":"Tue","open":"11:00","close":"21:00"},
    {"day":"Wed","open":"11:00","close":"21:00"},
    {"day":"Thu","open":"11:00","close":"21:00"},
    {"day":"Fri","open":"11:00","close":"22:00"},
    {"day":"Sat","open":"11:00","close":"22:00"},
    {"day":"Sun","open":"12:00","close":"20:00"}
  ]'::jsonb,
  20,
  true,
  0.0885
)
on conflict (id) do nothing;

-- Items ----------------------------------------------------------------------
-- Main Meals: has_sizes = true (Regular / Large, +$6.00).
insert into menu_items
  (category_id, name, local_name, description, base_price, spice_selectable, default_spice, has_sizes, sort_order)
values
  (
    (select id from menu_categories where slug = 'main-meals'),
    'Smoky Fire-Kissed Party Rice', 'Jollof',
    'Long-grain rice slow-simmered in a rich, smoky tomato and scotch-bonnet sauce until every grain glows red-gold — the taste of every Ghanaian celebration, straight from the party pot.',
    24.99, true, 'medium', true, 1
  ),
  (
    (select id from menu_categories where slug = 'main-meals'),
    'The Street King''s Rice & Beans', 'Waakye',
    'Tender rice and black-eyed beans steamed with millet leaves for that deep, earthy signature color — Ghana''s most beloved street breakfast, served fully dressed with all the traditional extras included: boiled egg, gari, shito and spaghetti.',
    19.99, true, 'low', true, 2
  ),
  (
    (select id from menu_categories where slug = 'main-meals'),
    'Golden Wok-Tossed Rice', 'Ghanaian Fried Rice',
    'Fluffy rice flash-tossed over high flame with sweet peppers, spring onions and a whisper of soy and ginger — smoky, golden, and impossible to put down.',
    24.99, true, 'low', true, 3
  ),
  -- Sides
  (
    (select id from menu_categories where slug = 'sides'),
    'Ginger-Fire Plantain Bites', 'Kelewele',
    'Ripe, honey-sweet plantain cubes tossed in fresh ginger, cloves and a kick of pepper, then fried to caramelized perfection — crispy edges, molten-soft centers.',
    7.99, true, 'medium', false, 1
  ),
  (
    (select id from menu_categories where slug = 'sides'),
    'Garden-Crisp Rainbow Salad', null,
    'Crunchy fresh greens, tomatoes, cucumbers and peppers tossed bright — the cool, crisp counterpoint to all that fire.',
    9.99, false, null, false, 2
  ),
  -- Drinks (spice N/A)
  (
    (select id from menu_categories where slug = 'drinks'),
    'Chilled Hibiscus-Ginger Brew', 'Sobolo',
    'Deep-crimson hibiscus petals steeped with ginger and secret spices, served ice-cold — tangy, refreshing, and famously addictive.',
    4.99, false, null, false, 1
  ),
  (
    (select id from menu_categories where slug = 'drinks'),
    'Creamy Iced Corn Cooler', 'Mushed Kenkey',
    'Fermented corn blended silky-smooth with milk and a touch of sugar over ice — Ghana''s original milkshake, tangy and satisfying.',
    4.99, false, null, false, 2
  ),
  (
    (select id from menu_categories where slug = 'drinks'),
    'Freshly-Pressed Juice of the Day', null,
    'Whatever''s ripest, pressed fresh that morning — ask what''s flowing today.',
    4.99, false, null, false, 3
  ),
  -- Desserts (spice N/A)
  (
    (select id from menu_categories where slug = 'desserts'),
    'Golden Cloud Drops', 'Puff Puff / Bofrot',
    'Pillowy-soft dough balls fried to a deep golden brown and dusted with sugar — warm, airy, and dangerously poppable.',
    5.99, false, null, false, 1
  ),
  (
    (select id from menu_categories where slug = 'desserts'),
    'Flaky Golden Beef Pie', 'Meat Pie',
    'Buttery, flaky pastry wrapped around richly seasoned minced beef and onions — baked golden, best eaten warm.',
    5.99, false, null, false, 2
  )
on conflict (name) do update set
  category_id      = excluded.category_id,
  local_name       = excluded.local_name,
  description       = excluded.description,
  base_price        = excluded.base_price,
  spice_selectable = excluded.spice_selectable,
  default_spice    = excluded.default_spice,
  has_sizes        = excluded.has_sizes,
  sort_order       = excluded.sort_order;

-- Options ---------------------------------------------------------------------
-- Every Main Meal includes one protein of choice (required, pick exactly one).
-- Waakye's traditional extras (boiled egg, gari, shito, spaghetti) are already
-- part of the dish and are separate from this protein selection.
insert into item_option_groups (item_id, name, min_select, max_select, is_required, sort_order)
select mi.id, 'Choose your protein', 1, 1, true, 1
from menu_items mi
where mi.name in (
  'Smoky Fire-Kissed Party Rice',
  'The Street King''s Rice & Beans',
  'Golden Wok-Tossed Rice'
)
on conflict (item_id, name) do update set
  min_select  = excluded.min_select,
  max_select  = excluded.max_select,
  is_required = excluded.is_required,
  sort_order  = excluded.sort_order;

insert into item_options (group_id, name, price_delta, is_default, sort_order)
select g.id, o.name, o.price_delta, o.is_default, o.sort_order
from item_option_groups g
cross join (values
  ('Crispy Fried Chicken', 0.00, true,  1),
  ('Boiled Egg',           0.00, false, 2),
  ('Seasoned Beef',        2.00, false, 3),
  ('Tender Goat',          3.00, false, 4),
  ('Grilled Tilapia',      4.00, false, 5)
) as o(name, price_delta, is_default, sort_order)
where g.name = 'Choose your protein'
on conflict (group_id, name) do update set
  price_delta = excluded.price_delta,
  is_default  = excluded.is_default,
  sort_order  = excluded.sort_order;
