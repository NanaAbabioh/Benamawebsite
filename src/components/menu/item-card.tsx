"use client";

import { useState } from "react";
import type { MenuItem } from "@/lib/menu";
import { formatPrice } from "@/lib/format";
import { spiceLabel } from "@/components/menu/spice-meter";
import { CustomizeModal } from "@/components/menu/customize-modal";

export function ItemCard({ item }: { item: MenuItem }) {
  const [open, setOpen] = useState(false);

  const hasUpcharge =
    item.hasSizes ||
    item.optionGroups.some((g) => g.options.some((o) => o.priceDelta > 0));

  return (
    <>
      <div className="flex flex-col overflow-hidden rounded-brand border border-cream-deep bg-white/60">
        {/* Placeholder art until food photography is shot. */}
        <div className="relative flex h-32 items-center justify-center bg-gradient-to-br from-palm/25 via-gold/20 to-pepper/25">
          <span className="font-display text-lg font-semibold text-cocoa/40">
            {item.localName ?? item.name}
          </span>
          {item.isSoldOut && (
            <span className="absolute right-2 top-2 rounded-full bg-cocoa px-2.5 py-1 text-xs font-semibold text-cream">
              Sold out
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-4">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="font-display text-lg font-semibold leading-tight text-cocoa">
              {item.name}
            </h3>
            <span className="whitespace-nowrap text-sm font-semibold text-pepper">
              {hasUpcharge ? "from " : ""}
              {formatPrice(item.basePrice)}
            </span>
          </div>
          {item.localName && (
            <p className="text-xs text-cocoa/50">{item.localName}</p>
          )}
          {item.description && (
            <p className="mt-2 line-clamp-3 text-sm text-cocoa/70">
              {item.description}
            </p>
          )}

          <div className="mt-3 flex items-center gap-2">
            {item.spiceSelectable && item.defaultSpice && (
              <span className="rounded-full bg-pepper/10 px-2 py-0.5 text-xs font-medium text-pepper">
                🌶️ {spiceLabel(item.defaultSpice)}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => setOpen(true)}
            disabled={item.isSoldOut}
            className="mt-4 w-full rounded-brand bg-pepper px-4 py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-pepper-dark disabled:cursor-not-allowed disabled:bg-cocoa/30"
          >
            {item.isSoldOut ? "Unavailable" : "Add to order"}
          </button>
        </div>
      </div>

      {open && <CustomizeModal item={item} onClose={() => setOpen(false)} />}
    </>
  );
}
