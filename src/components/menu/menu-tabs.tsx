"use client";

import { useCallback, useEffect, useState } from "react";
import type { MenuCategory } from "@/lib/menu";
import { ItemCard } from "@/components/menu/item-card";

/**
 * Category tabs for the menu. One section shows at a time (Main Meals first)
 * so the page stays tidy as the menu grows. Supports #hash deep links,
 * e.g. /menu#drinks opens the Drinks tab.
 */
export function MenuTabs({ categories }: { categories: MenuCategory[] }) {
  const [activeSlug, setActiveSlug] = useState(categories[0]?.slug ?? "");

  const applyHash = useCallback(() => {
    const slug = window.location.hash.replace("#", "");
    if (slug && categories.some((c) => c.slug === slug)) setActiveSlug(slug);
  }, [categories]);

  // Intentional post-mount setState: the hash only exists client-side, so SSR
  // renders the default tab and the deep-link applies after hydration.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, [applyHash]);

  const active = categories.find((c) => c.slug === activeSlug) ?? categories[0];

  function select(slug: string) {
    setActiveSlug(slug);
    window.history.replaceState(null, "", `#${slug}`);
  }

  if (!active) return null;

  return (
    <div>
      <div
        role="tablist"
        aria-label="Menu categories"
        className="mb-8 flex flex-wrap justify-center gap-2"
      >
        {categories.map((category) => {
          const selected = category.slug === active.slug;
          return (
            <button
              key={category.slug}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => select(category.slug)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                selected
                  ? "bg-pepper text-cream shadow-sm"
                  : "bg-white/60 text-cocoa/70 hover:bg-cream-deep hover:text-cocoa"
              }`}
            >
              {category.name}
            </button>
          );
        })}
      </div>

      <div role="tabpanel" aria-label={active.name}>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {active.items.map((item) => (
            <ItemCard key={item.id} item={item} categorySlug={active.slug} />
          ))}
        </div>
      </div>
    </div>
  );
}
