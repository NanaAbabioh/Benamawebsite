/**
 * Site-wide configuration.
 *
 * Placeholders live here so the real values (address, phone, hours) can be
 * swapped in one place when confirmed — see HANDOFF.md "Known open items".
 */

export const siteConfig = {
  name: "Benama Cuisines",
  tagline: "Bold West African Flavour.",
  secondaryLine: "From Our Family Pot to Your Table.",
  description:
    "Family-run Ghanaian kitchen in Salt Lake City. Order spicy, flavourful West African meals online and pick up in store.",

  // Launch — restaurant and site go live together.
  openingDate: "2026-09-01",

  // --- Placeholders: replace when confirmed (HANDOFF.md open items) ---
  contact: {
    // Real address TBD — keep as config value.
    address: {
      line1: "123 Main St",
      city: "Salt Lake City",
      state: "UT",
      zip: "84101",
    },
    phone: "(801) 555-0123", // placeholder
    email: "hello@eatbenama.com", // domain shortlisted, not purchased
    orderingEmail: "orders@eatbenama.com",
  },

  // Placeholder hours — confirm before launch.
  hours: [
    { day: "Mon", open: "11:00", close: "21:00" },
    { day: "Tue", open: "11:00", close: "21:00" },
    { day: "Wed", open: "11:00", close: "21:00" },
    { day: "Thu", open: "11:00", close: "21:00" },
    { day: "Fri", open: "11:00", close: "22:00" },
    { day: "Sat", open: "11:00", close: "22:00" },
    { day: "Sun", open: "12:00", close: "20:00" },
  ],

  // Utah / SLC combined prepared-food rate — VERIFY with Utah State Tax
  // Commission before launch (STRATEGY.md §7). Stored as a decimal fraction.
  salesTaxRate: 0.0885,

  // Fulfilment model at launch.
  fulfilment: "pickup" as const, // no delivery at launch

  // Mains sizing (MENU.md): Large is a flat surcharge on any main.
  largeSizeSurcharge: 6.0,

  social: {
    instagram: "https://instagram.com/eatbenama",
    facebook: "https://facebook.com/eatbenama",
    tiktok: "https://tiktok.com/@eatbenama",
  },
} as const;

export type SiteConfig = typeof siteConfig;

/** Formats the placeholder address as a single line. */
export function formatAddress(): string {
  const a = siteConfig.contact.address;
  return `${a.line1}, ${a.city}, ${a.state} ${a.zip}`;
}
