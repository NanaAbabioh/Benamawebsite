"use client";

import { useCart } from "@/components/cart/cart-provider";

export function CartButton() {
  const { count, openCart } = useCart();

  return (
    <button
      type="button"
      onClick={openCart}
      aria-label={`Open cart${count ? `, ${count} item${count > 1 ? "s" : ""}` : ""}`}
      className="relative rounded-full p-2 text-cocoa transition-colors hover:bg-cream-deep"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="8" cy="21" r="1" />
        <circle cx="19" cy="21" r="1" />
        <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
      </svg>
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-pepper px-1 text-[11px] font-bold text-cream">
          {count}
        </span>
      )}
    </button>
  );
}
