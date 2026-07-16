"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/components/cart/cart-provider";
import { lineTotal } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { spiceLabel } from "@/lib/spice";
import { siteConfig } from "@/lib/config";
import { placeOrder } from "@/app/checkout/actions";

function summarize(size: string | null, spice: string | null, options: { name: string }[]): string {
  const parts: string[] = [];
  if (size) parts.push(size === "large" ? "Large" : "Regular");
  if (spice) parts.push(`${spiceLabel(spice as "low" | "medium" | "hot")} 🌶️`);
  for (const o of options) parts.push(o.name);
  return parts.join(" · ");
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clear } = useCart();

  const [contact, setContact] = useState({ name: "", email: "", phone: "" });
  const [allergenNotes, setAllergenNotes] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tax = Math.round(subtotal * siteConfig.salesTaxRate * 100) / 100;
  const total = subtotal + tax;

  const canSubmit =
    contact.name.trim() &&
    contact.email.trim() &&
    contact.phone.trim() &&
    items.length > 0 &&
    !submitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const result = await placeOrder({
      contact,
      allergenNotes: allergenNotes.trim(),
      specialInstructions: specialInstructions.trim(),
      items,
    });
    if (result.ok) {
      clear();
      router.push(`/order/${result.orderNumber}?t=${result.trackingToken}`);
    } else {
      setError(result.error);
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center">
        <h1 className="font-display text-2xl font-semibold text-cocoa">
          Your cart is empty
        </h1>
        <p className="text-cocoa/70">Add a dish before heading to checkout.</p>
        <Link
          href="/menu"
          className="rounded-brand bg-pepper px-6 py-3 text-sm font-semibold text-cream hover:bg-pepper-dark"
        >
          Browse the menu
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="mb-8 font-display text-3xl font-semibold text-cocoa">
        Checkout
      </h1>

      <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        {/* Left: details */}
        <div className="space-y-8">
          {/* Contact */}
          <section className="rounded-brand border border-cream-deep bg-white/60 p-5">
            <h2 className="mb-4 font-display text-lg font-semibold text-cocoa">
              Your details
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" className="sm:col-span-2">
                <input
                  type="text"
                  required
                  value={contact.name}
                  onChange={(e) => setContact({ ...contact, name: e.target.value })}
                  className={inputClass}
                  placeholder="Ama Mensah"
                />
              </Field>
              <Field label="Email">
                <input
                  type="email"
                  required
                  value={contact.email}
                  onChange={(e) => setContact({ ...contact, email: e.target.value })}
                  className={inputClass}
                  placeholder="you@email.com"
                />
              </Field>
              <Field label="Phone">
                <input
                  type="tel"
                  required
                  value={contact.phone}
                  onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                  className={inputClass}
                  placeholder="(801) 555-0123"
                />
              </Field>
            </div>
            <p className="mt-3 text-xs text-cocoa/50">
              We&apos;ll text and email you when your order is received and ready.
            </p>
          </section>

          {/* Pickup */}
          <section className="rounded-brand border border-cream-deep bg-white/60 p-5">
            <h2 className="mb-2 font-display text-lg font-semibold text-cocoa">
              Pickup
            </h2>
            <div className="flex items-center gap-3 rounded-md border border-pepper bg-pepper/5 px-4 py-3">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-pepper">
                <span className="h-2 w-2 rounded-full bg-cream" />
              </span>
              <div>
                <p className="text-sm font-semibold text-cocoa">
                  ASAP — ready in about {"~"}20 min
                </p>
                <p className="text-xs text-cocoa/60">
                  {siteConfig.contact.address.line1}, {siteConfig.contact.address.city}
                </p>
              </div>
            </div>
            <p className="mt-2 text-xs text-cocoa/50">
              Scheduled pickup times are coming soon.
            </p>
          </section>

          {/* Allergies + notes */}
          <section className="rounded-brand border border-cream-deep bg-white/60 p-5">
            <h2 className="mb-4 font-display text-lg font-semibold text-cocoa">
              Allergies &amp; notes
            </h2>
            <Field label="Allergies & dietary notes">
              <textarea
                value={allergenNotes}
                onChange={(e) => setAllergenNotes(e.target.value)}
                rows={2}
                maxLength={500}
                placeholder="Let the kitchen know about any allergies (nuts, shellfish, gluten, dairy…)"
                className={`${inputClass} resize-none`}
              />
            </Field>
            <div className="mt-4">
              <Field label="Order notes (optional)">
                <textarea
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  rows={2}
                  maxLength={500}
                  placeholder="Anything else for this order?"
                  className={`${inputClass} resize-none`}
                />
              </Field>
            </div>
          </section>

          {/* Payment (placeholder) */}
          <section className="rounded-brand border border-cream-deep bg-white/60 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-cocoa">
                Payment
              </h2>
              <span className="rounded-full bg-gold/25 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-cocoa/70">
                Test mode
              </span>
            </div>
            {/* Stripe Payment Element mounts here once keys are live. */}
            <div className="space-y-3 opacity-60">
              <div className="rounded-md border border-cream-deep bg-cream px-3 py-2.5 text-sm text-cocoa/50">
                Card number ····  ····  ····  ····
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-md border border-cream-deep bg-cream px-3 py-2.5 text-sm text-cocoa/50">
                  MM / YY
                </div>
                <div className="rounded-md border border-cream-deep bg-cream px-3 py-2.5 text-sm text-cocoa/50">
                  CVC
                </div>
              </div>
            </div>
            <p className="mt-3 text-xs text-cocoa/50">
              Payments are handled securely by Stripe. This is a placeholder — no
              card is charged yet.
            </p>
          </section>
        </div>

        {/* Right: summary */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-brand border border-cream-deep bg-white/60 p-5">
            <h2 className="mb-4 font-display text-lg font-semibold text-cocoa">
              Your order
            </h2>
            <div className="space-y-3">
              {items.map((item) => {
                const line = summarize(item.size, item.spice, item.options);
                return (
                  <div key={item.lineId} className="flex justify-between gap-3 text-sm">
                    <div>
                      <p className="font-medium text-cocoa">
                        {item.quantity}× {item.name}
                      </p>
                      {line && <p className="text-xs text-cocoa/60">{line}</p>}
                    </div>
                    <span className="whitespace-nowrap text-cocoa">
                      {formatPrice(lineTotal(item))}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 space-y-1 border-t border-cream-deep pt-4 text-sm">
              <Row label="Subtotal" value={formatPrice(subtotal)} />
              <Row label={`Tax (${(siteConfig.salesTaxRate * 100).toFixed(2)}%)`} value={formatPrice(tax)} />
              <div className="flex justify-between pt-2 text-base font-semibold text-cocoa">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            {error && (
              <p className="mt-4 rounded-md bg-pepper/10 px-3 py-2 text-sm text-pepper">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={!canSubmit}
              className="mt-5 w-full rounded-brand bg-pepper px-5 py-3.5 text-sm font-semibold text-cream transition-colors hover:bg-pepper-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Placing order…" : `Place order · ${formatPrice(total)}`}
            </button>
            <p className="mt-2 text-center text-[11px] text-cocoa/40">
              Pickup only · no tipping · {siteConfig.contact.address.city}
            </p>
          </div>
        </aside>
      </form>
    </div>
  );
}

const inputClass =
  "w-full rounded-md border border-cream-deep bg-white px-3 py-2 text-sm text-cocoa placeholder:text-cocoa/40 focus:border-palm focus:outline-none";

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-sm font-medium text-cocoa/80">{label}</span>
      {children}
    </label>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-cocoa/70">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
