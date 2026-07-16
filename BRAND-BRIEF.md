# Benama Cuisines — Brand Brief

**Positioning:** Family-run Ghanaian kitchen bringing spicy, flavourful, tasty West African meals to Salt Lake City.
**Brand feeling:** heat, aroma, generosity, home.

**Primary tagline:** Bold West African Flavour. *(hero, ads, social bios)*
**Secondary line:** From Our Family Pot to Your Table. *(About page, packaging, receipts)*

---

## Color palette

| Role | Color | Hex |
|---|---|---|
| Primary | Pepper Red (deep, appetizing red) | `#B3261E` |
| Secondary | Palm-Oil Orange (jollof glow) | `#E86A17` |
| Accent | Kente Gold | `#E8A317` |
| Dark | Cocoa Brown (text, backgrounds) | `#2B1A12` |
| Light | Warm Cream (backgrounds) | `#FBF3E4` |
| Support | Leaf Green (fresh herbs, small accents) | `#3E7C3A` |

Red + orange carry the "spicy/tasty" promise; gold nods to kente and celebration; cream keeps it appetizing, not heavy.

## Typography

- **Headings:** a warm, characterful display serif — *Recoleta*, *Clash Display*, or *Fraunces* (Google Fonts: Fraunces)
- **Body/UI:** clean geometric sans — *Inter* or *Plus Jakarta Sans*

---

## ✅ Chosen logo

Concept A (asanka + steam-to-chili) — icon from the first generation, calligraphic wordmark from the second, composited. Files in `Images/`:

- `Benama Logo Final.png` — full color on brand cream (primary)
- `Benama Logo Transparent.png` — full color, transparent background (website header)
- `Benama Logo Mono Cocoa.png` — single color (receipts, stamps)
- `Benama Logo Reversed Dark.png` — cream on cocoa (dark backgrounds, footer)

Still to do: high-res upscale/vector pass before print use; simplified icon-only crop for favicon/app icon.

## Logo concepts (original exploration)

### Concept A — "The Asanka" (recommended)
The asanka (Ghanaian earthenware grinding bowl) with a wooden tapoli pestle, steam rising and curling into a chili-pepper silhouette. Instantly Ghanaian to those who know, warm and food-forward to everyone else. Wordmark "BENAMA" beneath, "CUISINES" letterspaced small.

**Prompt:**
> Minimal modern logo for a Ghanaian restaurant called "BENAMA CUISINES". Icon: a traditional Ghanaian asanka clay grinding bowl with wooden pestle, stylized steam rising from the bowl curling into the subtle shape of a chili pepper. Flat vector style, 2-color: deep pepper red (#B3261E) and kente gold (#E8A317) on warm cream background (#FBF3E4). Warm characterful serif wordmark "BENAMA" below the icon, "CUISINES" in small letterspaced caps underneath. Clean, appetizing, premium but friendly. No gradients, no photorealism, flat logo design, centered composition.

### Concept B — "Flame B" monogram
A bold letter "B" where the counters (holes) are shaped like a chili pepper and a flame lick. Compact, works at tiny sizes (favicon, packaging sticker, social avatar).

**Prompt:**
> Bold monogram logo, letter "B" for a spicy West African restaurant "Benama Cuisines". The negative space inside the B forms a chili pepper on top and a small flame below. Flat vector, single color deep red (#B3261E) with a kente gold (#E8A317) accent stroke on one edge inspired by kente cloth strip. On warm cream background. Modern, confident, appetizing. Wordmark "BENAMA CUISINES" to the right in a warm serif. Flat logo design, no gradients.

### Concept C — "Kente pot"
A round cooking pot seen from the front, its lid handle replaced by a rising steam swirl, with a thin kente-pattern band around the pot's belly. Most heritage-forward of the three.

**Prompt:**
> Logo for Ghanaian family restaurant "BENAMA CUISINES": a round traditional cooking pot, front view, gentle steam swirl rising from the lid, a thin decorative band of simplified kente cloth pattern (gold, red, green geometric strip) around the middle of the pot. Flat vector illustration, deep red pot (#B3261E), kente band in gold (#E8A317) and leaf green (#3E7C3A), warm cream background. Warm serif wordmark below. Friendly, premium, appetizing, flat logo design, no gradients, no photorealism.

**Tips when generating (any tool):** ask for a square 1:1 composition, request "flat vector logo, no gradients, no drop shadows," and generate 4+ variations per concept. The winner gets manually vectorized (I can rebuild it as clean SVG once you pick).

---

## Homepage hero animation

**Concept:** Dark warm background. Fresh ingredients — scotch bonnet peppers, tomatoes, red onions, ginger, garlic, thyme, spice powders — tumble from the top in slow motion into a sizzling black stir-fry bowl (or asanka). They mix and stir with steam and a gentle flame flare. Camera slowly pushes in. Then the shot settles, steam clears slightly, and the single CTA appears.

**Video prompt (v2):**
> Cinematic food commercial, side-profile camera at pan height, locked-off then slowly pushing in. Dark warm kitchen, moody amber rim lighting, dark cocoa-brown background. Shot sequence:
>
> **0–1.5s:** A large empty black wok/cast-iron pan seen from the side, gently heating, thin wisps of smoke rising off the hot oil, lens flare glint on the rim.
>
> **1.5–4s:** A colorful cascade of fresh vegetables falls into the pan in slow motion from above: red and yellow bell pepper strips, red scotch bonnet peppers, broccoli florets, orange carrot slices, purple red-onion slivers, green beans, sweet corn, halved cherry tomatoes, ginger and garlic pieces, a drifting cloud of red-gold spice powder. Each lands with a sizzle, oil droplets sparkle in the light.
>
> **4–7s:** High-heat action: the chef's hand tosses the wok — vegetables leap in an arc and fall back, the pan shakes rapidly back and forth like Chinese fried-rice cooking, a dramatic flame flare licks up the side, steam bursts upward, a spatula flips through the mix.
>
> **7–8s:** The tossing settles, vegetables glossy and steaming in the pan, gentle steam rising — hold for a loop-friendly ending.
>
> Rich reds, oranges and golds (#B3261E, #E86A17, #E8A317), vibrant multicolored vegetables, appetizing, premium, high detail, shallow depth of field, slow-motion emphasis on the falling and tossing.

**Implementation notes:**
- Generate at 4–8s, loop it muted with `autoplay loop playsinline` as the hero background video
- Keep a high-quality still frame as poster/fallback (mobile data, reduced-motion users)
- Overlay: logo + tagline ("Bold West African Flavour.") + one button ("Order Now"); menu preview directly below the fold
- Compress to webm/mp4 under ~2–3 MB so it doesn't slow the page

---

## Next steps

1. Pick a logo concept (A/B/C) — or I generate all three here and you compare
2. Generate the hero video (here or in your tool of choice)
3. I rebuild the chosen logo as clean SVG + build the full design system around it
