# Handoff — Benama Cuisines Website Build

You are picking up a fully planned project. Strategy, brand, and content phases are complete. Your job is the build.

## Read first (in this folder)

1. `STRATEGY.md` — full plan: site map, user flows, data model, roadmap, decisions locked
2. `MENU.md` — final menu v1 with names, descriptions, prices, spice defaults
3. `BRAND-BRIEF.md` — tagline, palette (hex codes), typography, chosen logo

## Assets

- `Images/` — logo kit: `Benama Logo Final.png` (primary), `Benama Logo Transparent.png` (header), `Benama Logo Reversed Dark.png` (dark bg/footer), `Benama Logo Mono Cocoa.png` (receipts)
- `Videos/` — `Hero Loop Mobile.mp4` (720×1280, 6.5s seamless loop), `Hero Loop Desktop 16x9.mp4` (1920×1080, same footage), `Hero Poster.jpg` + `Hero Poster Desktop.jpg` (poster/fallback frames)

## Build summary

Online-ordering site for a Ghanaian restaurant in Salt Lake City. Customers order and pay online, pick up in store. Opens Sept 1, 2026.

**Stack (decided):** Next.js (App Router) + Supabase (Postgres, Auth, Realtime, RLS) + Stripe, deploy on Vercel.

**Key implementation decisions:**
- Guest checkout + optional accounts (order history, favorites, saved cards via Stripe Customers)
- Pickup: ASAP (estimated ready time) + scheduled slots
- Mains: Regular / Large sizes, Large = +$6.00 flat; protein choice included with price deltas (Crispy Fried Chicken +$0, Boiled Egg +$0, Seasoned Beef +$2.00, Tender Goat +$3.00, Grilled Tilapia +$4.00)
- Spice selector: horizontal fill-bar heat meter with chili 🌶️ icon — Low (⅓ fill), Medium (⅔), Spicy Hot (full); per-dish defaults in MENU.md
- No tipping at checkout
- Notifications: SMS (Twilio) + email (Resend) for order received / food ready
- Utah sales tax on prepared food (~8.85% SLC combined — verify current rate)
- Staff admin dashboard: live order queue via Supabase Realtime (received → preparing → ready → picked up), menu manager, sold-out toggles, pause-ordering switch
- Homepage: hero video loop (autoplay muted, poster fallback, portrait video on mobile / 16:9 on desktop), single CTA "Order Now", menu below
- Address placeholder: "123 Main St, Salt Lake City, UT 84101" (real one comes later — keep it a config value)

## Build order (from STRATEGY.md Phase 1 → 2)

1. Scaffold Next.js project, brand tokens (colors/fonts from BRAND-BRIEF.md), layout with logo
2. Supabase schema per STRATEGY.md §6 + seed with MENU.md data
3. Menu browsing + item customization (size, spice meter, special instructions)
4. Cart → Stripe checkout (guest first) → order confirmation + tracking page
5. Staff dashboard (protected) with realtime order queue
6. Accounts, scheduled slots, notifications, menu manager

## Known open items (don't block on these)

- Real address, hours, phone — use config placeholders
- Allergen labels — placeholders for now
- Menu photos: DONE — use `Images/Menu/watermarked-4x3/` (1200×900, 4:3, logo watermarked) for `menu_items.image_url`; `Images/Menu/site-4x3/` is the clean unwatermarked set if ever needed
- Domain: eatbenama.com shortlisted (not yet purchased)
