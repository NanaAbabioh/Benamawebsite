"use client";

import { useEffect, useMemo, useState } from "react";
import type { MenuItem, SpiceLevel } from "@/lib/menu";
import type { CartOption, CartSize } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { useCart } from "@/components/cart/cart-provider";
import { SpiceMeter } from "@/components/menu/spice-meter";
import { siteConfig } from "@/lib/config";

function defaultSelections(item: MenuItem): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  for (const group of item.optionGroups) {
    const preset = group.options.find((o) => o.isDefault) ?? group.options[0];
    result[group.id] = group.isRequired && preset ? [preset.id] : [];
  }
  return result;
}

export function CustomizeModal({
  item,
  categorySlug,
  onClose,
}: {
  item: MenuItem;
  categorySlug?: string;
  onClose: () => void;
}) {
  const { addItem } = useCart();

  const [size, setSize] = useState<CartSize | null>(
    item.hasSizes ? "regular" : null,
  );
  const [spice, setSpice] = useState<SpiceLevel | null>(
    item.spiceSelectable ? (item.defaultSpice ?? "low") : null,
  );
  const [selections, setSelections] = useState<Record<string, string[]>>(() =>
    defaultSelections(item),
  );
  const [quantity, setQuantity] = useState(1);
  const [instructions, setInstructions] = useState("");

  // Close on Escape; lock background scroll while open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const toggleOption = (groupId: string, optionId: string, maxSelect: number) => {
    setSelections((prev) => {
      const current = prev[groupId] ?? [];
      if (maxSelect <= 1) return { ...prev, [groupId]: [optionId] };
      if (current.includes(optionId))
        return { ...prev, [groupId]: current.filter((id) => id !== optionId) };
      if (current.length >= maxSelect) return prev;
      return { ...prev, [groupId]: [...current, optionId] };
    });
  };

  const chosenOptions = useMemo<CartOption[]>(() => {
    const out: CartOption[] = [];
    for (const group of item.optionGroups) {
      for (const id of selections[group.id] ?? []) {
        const opt = group.options.find((o) => o.id === id);
        if (opt)
          out.push({
            groupName: group.name,
            name: opt.name,
            priceDelta: opt.priceDelta,
          });
      }
    }
    return out;
  }, [item.optionGroups, selections]);

  const unitPrice = useMemo(() => {
    const sizeAdd = size === "large" ? item.largeSurcharge : 0;
    const optionsAdd = chosenOptions.reduce((s, o) => s + o.priceDelta, 0);
    return item.basePrice + sizeAdd + optionsAdd;
  }, [item.basePrice, item.largeSurcharge, size, chosenOptions]);

  const unmetRequired = item.optionGroups.some(
    (g) => g.isRequired && (selections[g.id]?.length ?? 0) < Math.max(1, g.minSelect),
  );

  const handleAdd = () => {
    if (unmetRequired) return;
    addItem({
      menuItemId: item.id,
      name: item.name,
      localName: item.localName,
      categorySlug,
      size,
      spice,
      options: chosenOptions,
      specialInstructions: instructions.trim(),
      unitPrice,
      quantity,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-cocoa/60 p-0 sm:items-center sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Customize ${item.name}`}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-cream shadow-2xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-cream-deep px-5 py-4">
          <div>
            <h2 className="font-display text-xl font-semibold text-cocoa">
              {item.name}
            </h2>
            {item.localName && (
              <p className="text-sm text-cocoa/60">{item.localName}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1 text-cocoa/50 hover:bg-cream-deep hover:text-cocoa"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
          {item.description && (
            <p className="text-sm leading-relaxed text-cocoa/75">
              {item.description}
            </p>
          )}

          {/* Size */}
          {item.hasSizes && (
            <div>
              <span className="mb-1.5 block text-sm font-semibold text-cocoa">
                Size
              </span>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { key: "regular" as const, label: "Regular", add: 0 },
                  { key: "large" as const, label: "Large", add: item.largeSurcharge },
                ]).map((opt) => {
                  const selected = size === opt.key;
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setSize(opt.key)}
                      aria-pressed={selected}
                      className={`flex items-center justify-between rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                        selected
                          ? "border-pepper bg-pepper text-cream"
                          : "border-cream-deep bg-white text-cocoa/80 hover:border-palm"
                      }`}
                    >
                      <span>{opt.label}</span>
                      {opt.add > 0 && (
                        <span className={selected ? "text-cream" : "text-cocoa/60"}>
                          +{formatPrice(opt.add)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Spice */}
          {item.spiceSelectable && spice && (
            <SpiceMeter value={spice} onChange={setSpice} />
          )}

          {/* Option groups (protein, etc.) */}
          {item.optionGroups.map((group) => (
            <div key={group.id}>
              <div className="mb-1.5 flex items-center gap-2">
                <span className="text-sm font-semibold text-cocoa">
                  {group.name}
                </span>
                {group.isRequired && (
                  <span className="rounded-full bg-gold/25 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-cocoa/70">
                    Required
                  </span>
                )}
              </div>
              <div className="space-y-2">
                {group.options.map((opt) => {
                  const selected = (selections[group.id] ?? []).includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => toggleOption(group.id, opt.id, group.maxSelect)}
                      aria-pressed={selected}
                      className={`flex w-full items-center justify-between rounded-md border px-3 py-2.5 text-sm transition-colors ${
                        selected
                          ? "border-pepper bg-pepper/5 text-cocoa"
                          : "border-cream-deep bg-white text-cocoa/80 hover:border-palm"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                            selected ? "border-pepper bg-pepper" : "border-cocoa/30"
                          }`}
                        >
                          {selected && (
                            <span className="h-1.5 w-1.5 rounded-full bg-cream" />
                          )}
                        </span>
                        {opt.name}
                      </span>
                      {opt.priceDelta > 0 && (
                        <span className="text-cocoa/60">
                          +{formatPrice(opt.priceDelta)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Special instructions */}
          <div>
            <label
              htmlFor="special-instructions"
              className="mb-1.5 block text-sm font-semibold text-cocoa"
            >
              Special instructions
            </label>
            <textarea
              id="special-instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={2}
              maxLength={280}
              placeholder="Anything we should know? (e.g. extra shito on the side)"
              className="w-full resize-none rounded-md border border-cream-deep bg-white px-3 py-2 text-sm text-cocoa placeholder:text-cocoa/40 focus:border-palm focus:outline-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 border-t border-cream-deep px-5 py-4">
          <div className="flex items-center rounded-md border border-cream-deep bg-white">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              aria-label="Decrease quantity"
              className="px-3 py-2 text-lg text-cocoa/70 hover:text-pepper"
            >
              −
            </button>
            <span className="w-8 text-center text-sm font-semibold text-cocoa">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(20, q + 1))}
              aria-label="Increase quantity"
              className="px-3 py-2 text-lg text-cocoa/70 hover:text-pepper"
            >
              +
            </button>
          </div>
          <button
            type="button"
            onClick={handleAdd}
            disabled={unmetRequired}
            className="flex flex-1 items-center justify-between rounded-brand bg-pepper px-5 py-3 text-sm font-semibold text-cream transition-colors hover:bg-pepper-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span>Add to cart</span>
            <span>{formatPrice(unitPrice * quantity)}</span>
          </button>
        </div>

        <p className="pb-3 text-center text-[11px] text-cocoa/40">
          Pickup only · {siteConfig.contact.address.city}
        </p>
      </div>
    </div>
  );
}
