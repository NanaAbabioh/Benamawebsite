# Benama Cuisines — Website Strategy

**West African online restaurant · Salt Lake City, UT · Order + pay online, pick up in store**
*Last updated: July 15, 2026*

---

## 1. Vision

A warm, vibrant online storefront where SLC customers discover West African food, order and pay in minutes, and pick up hot at the restaurant. The site is also the kitchen's command center: every order lands on a live staff dashboard.

## 2. Decisions locked

| Area | Decision |
|---|---|
| Market | Salt Lake City region, USD, pickup only (no delivery at launch) |
| Payments | Stripe (cards, Apple Pay, Google Pay) |
| Pickup timing | ASAP (with estimated ready time) + scheduled slots |
| Accounts | Optional accounts (order history, favorites, saved payment via Stripe) + guest checkout |
| Order management | Staff admin dashboard with live updates |
| Stack | Next.js + Supabase (DB, auth, realtime) + Stripe, deployed on Vercel |
| Brand | Warm & vibrant African heritage — built from scratch |
| Timeline | Launch alongside restaurant opening |

## 3. Brand direction — "Warm & vibrant heritage"

**Story:** Family-run business — "Benama" combines the spouses' names. Mission: bring the rich flavour and taste of West African (mainly Ghanaian) meals to all. Brand must project **spicy, flavourful, tasty**.


- **Palette:** deep reds/burgundy, burnt orange, gold, warm cream; dark chocolate for text
- **Motifs:** kente-inspired accent strips, subtle adinkra symbols as icons/dividers — used sparingly so food stays the hero
- **Typography:** a characterful display face for headings, clean readable sans for body/UI
- **Photography:** rich, close-up, steam-and-texture food shots on warm backgrounds (plan a photo shoot before launch; styled placeholders until then)
- **Voice:** welcoming, proud, generous — "come hungry, leave family"

Deliverables in the brand phase: logo (wordmark + mark), color/type system, photo style guide.

## 4. Site map

**Customer-facing**
1. **Home** — hero, signature dishes, how pickup works, hours/location, story teaser
2. **Menu** — categories: Meals, Extras/Sides, Sauces, Drinks (structure flexible for your list). Item photos, descriptions, spice level, options/variants (size, protein, spice), sold-out states
3. **Item detail / customization** — options, quantity, special instructions → add to cart
4. **Cart & checkout** — pickup time (ASAP or slot), contact info, tip (optional), tax, Stripe payment
5. **Order confirmation & tracking** — order number, live status (received → preparing → ready), pickup instructions
6. **Account** — order history, reorder in one tap, favorites, saved payment methods
7. **About / Story** — the Benama story, the cuisine, the people
8. **Contact / Location** — map, hours, phone, parking/pickup notes

**Staff-facing (protected)**
9. **Orders dashboard** — live queue, sound on new order, status buttons (accept → preparing → ready → picked up), scheduled orders view
10. **Menu manager** — edit items/prices, toggle sold out, set daily specials
11. **Settings** — hours, pickup slot capacity, pause ordering ("kitchen slammed" switch), prep-time defaults

## 5. Core flows

**Customer:** browse → customize item → cart → choose ASAP/slot → pay (guest or signed in) → confirmation with ready time → status updates (on-page + SMS/email) → pick up.

**Kitchen:** new order alert → accept (confirms ready time) → preparing → ready (customer notified) → picked up. Scheduled orders surface automatically at the right prep lead time.

## 6. Data model (Supabase)

- `profiles` — user info (links to Supabase auth)
- `menu_categories`, `menu_items`, `item_options` (option groups + choices, price deltas)
- `orders` — status, pickup type/time, totals, tax, tip, Stripe payment ref, guest contact info
- `order_items` — item snapshot (name/price at time of order), selected options, instructions
- `store_settings` — hours, slot capacity, pause flag, prep times

Realtime subscriptions power the live dashboard and customer order tracking. Row-level security separates customer data from staff access.

## 7. Payments & compliance

- Stripe Checkout/Payment Element; saved cards via Stripe Customer objects (we never store card data — PCI stays Stripe's problem)
- **Utah sales tax:** prepared food in SLC is taxed (~8.85% combined incl. restaurant tax — confirm current rate with the Utah State Tax Commission before launch); collected at checkout, reported by the business
- Refund flow handled from Stripe dashboard at launch (admin-panel refunds later)
- **No tipping** at checkout (decided; can add later if wanted)
- **Notifications:** SMS + email for order received / food ready (Twilio + Resend)
- **Spice levels:** heat meter UI — horizontal fill bar with chili-pepper 🌶️ gauge; fills to Low (⅓), Medium (⅔), Spicy Hot (full); customer selects per dish, each dish has a default
- **Portions:** Main Meals in Regular / Large (Large = +$6.00 flat)

## 8. Build roadmap

**Phase 0 — Brand & content (1–2 wks)**
Logo, palette, type, homepage design direction. You provide: menu items with prices/descriptions, hours, address, story copy. Register domain (e.g. benamacuisines.com) + Google Business Profile.

**Phase 1 — Core ordering MVP (2–3 wks)**
Menu browsing, cart, guest checkout with Stripe, ASAP pickup, order confirmation, basic staff dashboard with live orders. *This alone is launchable.*

**Phase 2 — Full experience (1–2 wks)**
Accounts (history, reorder, saved cards), scheduled pickup slots, SMS/email notifications (Twilio/Resend), menu manager, sold-out toggles, pause-ordering switch.

**Phase 3 — Post-launch**
Specials/promos, loyalty, catering inquiries, analytics (best sellers, peak hours), reviews, SEO content. Delivery integration only if demand justifies it.

## 9. Pre-launch checklist

- [ ] Business: LLC/registration, EIN, Utah sales tax license, food service permits
- [ ] Stripe account activated (business verification takes a few days — start early)
- [ ] Domain + professional email (orders@, hello@)
- [ ] Menu finalized: names, descriptions, prices, options, spice levels, allergens
- [ ] Food photography shoot
- [ ] Hours, address, pickup instructions, phone
- [ ] Test orders end-to-end (incl. refund, sold-out, pause)
- [ ] Google Business Profile + Maps listing
- [ ] Staff trained on dashboard

## 10. Key details

- **Opening date:** September 1, 2026 (site launches with it)
- **Address:** placeholder for now — using "123 Main St, Salt Lake City, UT 84101" until the real one is confirmed
- **Cuisine:** Ghanaian-led West African
- **Homepage hero:** motion video — spices/vegetables/ingredients dropping into a stir-fry bowl, mixing and stirring; single CTA (Order Now / View Menu), then menu items below

**Still needed from you**

1. **Menu content** — items, categories, prices, descriptions, options
2. **Hours + phone** — and the real address when you have it
3. **Domain** — action-oriented lane chosen; shortlist: eatbenama.com (top pick), tastebenama.com, benamaeats.com, orderbenama.com. Buy the .com + benamacuisines.com as redirect; grab matching social handles same day
4. **Stripe** — create the account when ready; verification takes days, not hours

---

*Next step once you send the menu: I'll draft the brand identity (logo directions + palette) and a homepage design mockup for your review.*
