"use client";

import Link from "next/link";
import { useCart } from "@/components/cart/cart-provider";
import { lineTotal, type CartItem } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { spiceLabel } from "@/lib/spice";

function summarize(item: CartItem): string {
  const parts: string[] = [];
  if (item.size) parts.push(item.size === "large" ? "Large" : "Regular");
  if (item.spice) parts.push(`${spiceLabel(item.spice)} 🌶️`);
  for (const opt of item.options) parts.push(opt.name);
  return parts.join(" · ");
}

export function CartDrawer() {
  const { items, subtotal, isOpen, closeCart, setQuantity, removeItem } = useCart();

  // Gentle upsell: cart has food but nothing beyond the mains yet.
  // (Items saved before categories were tracked count as mains.)
  const mainsOnly =
    items.length > 0 &&
    items.every((i) => (i.categorySlug ?? "main-meals") === "main-meals");

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className={`fixed inset-0 z-40 bg-cocoa/50 transition-opacity ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!isOpen}
      />

      {/* Panel */}
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-cream shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Your order"
      >
        <div className="flex items-center justify-between border-b border-cream-deep px-5 py-4">
          <h2 className="font-display text-xl font-semibold text-cocoa">
            Your order
          </h2>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Close cart"
            className="rounded-full p-1 text-cocoa/50 hover:bg-cream-deep hover:text-cocoa"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
            <p className="font-display text-lg text-cocoa">Your cart is empty</p>
            <p className="text-sm text-cocoa/60">
              Add a dish from the menu to get started.
            </p>
          </div>
        ) : (
          <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
            {items.map((item) => (
              <div
                key={item.lineId}
                className="flex gap-3 border-b border-cream-deep pb-4"
              >
                <div className="flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="font-medium text-cocoa">{item.name}</p>
                    <span className="whitespace-nowrap text-sm font-semibold text-cocoa">
                      {formatPrice(lineTotal(item))}
                    </span>
                  </div>
                  {summarize(item) && (
                    <p className="mt-0.5 text-xs text-cocoa/60">{summarize(item)}</p>
                  )}
                  {item.specialInstructions && (
                    <p className="mt-0.5 text-xs italic text-cocoa/50">
                      “{item.specialInstructions}”
                    </p>
                  )}

                  <div className="mt-2 flex items-center gap-3">
                    <div className="flex items-center rounded-md border border-cream-deep bg-white">
                      <button
                        type="button"
                        onClick={() => setQuantity(item.lineId, item.quantity - 1)}
                        aria-label="Decrease quantity"
                        className="px-2.5 py-1 text-cocoa/70 hover:text-pepper"
                      >
                        −
                      </button>
                      <span className="w-7 text-center text-sm font-semibold text-cocoa">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity(item.lineId, item.quantity + 1)}
                        aria-label="Increase quantity"
                        className="px-2.5 py-1 text-cocoa/70 hover:text-pepper"
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.lineId)}
                      className="text-xs text-cocoa/50 underline hover:text-pepper"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {items.length > 0 && (
          <div className="border-t border-cream-deep px-5 py-4">
            {mainsOnly && (
              <div className="mb-4 rounded-md bg-gold/15 px-3 py-2.5">
                <p className="text-sm font-semibold text-cocoa">
                  Complete the feast 🍽️
                </p>
                <p className="mt-0.5 text-xs text-cocoa/70">
                  How about a crispy side, something ice-cold, or a sweet finish?
                </p>
                {/* Plain anchors (not next/link): native hash navigation fires
                    the hashchange event MenuTabs listens for when the customer
                    is already on /menu. */}
                <div className="mt-2 flex gap-4 text-xs font-semibold text-pepper">
                  <a href="/menu#sides" onClick={closeCart} className="underline hover:text-pepper-dark">
                    Sides
                  </a>
                  <a href="/menu#drinks" onClick={closeCart} className="underline hover:text-pepper-dark">
                    Drinks
                  </a>
                  <a href="/menu#desserts" onClick={closeCart} className="underline hover:text-pepper-dark">
                    Desserts
                  </a>
                </div>
              </div>
            )}
            <div className="mb-1 flex items-center justify-between text-sm text-cocoa/70">
              <span>Subtotal</span>
              <span className="font-semibold text-cocoa">
                {formatPrice(subtotal)}
              </span>
            </div>
            <p className="mb-3 text-xs text-cocoa/50">
              Tax calculated at checkout. Pickup only.
            </p>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="block w-full rounded-brand bg-pepper px-5 py-3 text-center text-sm font-semibold text-cream transition-colors hover:bg-pepper-dark"
            >
              Go to checkout
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
