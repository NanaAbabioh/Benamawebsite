import Link from "next/link";
import type { Metadata } from "next";
import { createServerClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";
import { spiceLabel } from "@/lib/spice";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = { title: "Order status" };

type OrderItem = {
  item_name: string;
  quantity: number;
  line_total: number;
  size: string | null;
  spice_level: "low" | "medium" | "hot" | null;
  selected_options: { name: string }[];
  special_instructions: string | null;
};

type Order = {
  order_number: string;
  status: "pending_payment" | "received" | "preparing" | "ready" | "picked_up" | "cancelled";
  estimated_ready_at: string | null;
  contact_name: string;
  subtotal: number;
  tax: number;
  total: number;
  special_instructions: string | null;
  allergen_notes: string | null;
  items: OrderItem[];
};

const STEPS = [
  { key: "received", label: "Received" },
  { key: "preparing", label: "Preparing" },
  { key: "ready", label: "Ready for pickup" },
  { key: "picked_up", label: "Picked up" },
] as const;

function readyTime(iso: string | null): string {
  if (!iso) return "";
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/Denver",
  }).format(new Date(iso));
}

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderNumber: string }>;
  searchParams: Promise<{ t?: string }>;
}) {
  const { orderNumber } = await params;
  const { t: token } = await searchParams;

  let order: Order | null = null;
  if (token) {
    const supabase = createServerClient();
    const { data } = await supabase.rpc("get_order", {
      p_order_number: orderNumber,
      p_token: token,
    });
    order = (data as Order | null) ?? null;
  }

  if (!order) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-24 text-center">
        <h1 className="font-display text-2xl font-semibold text-cocoa">
          Order not found
        </h1>
        <p className="text-cocoa/70">
          This tracking link looks incomplete or expired. Please use the link
          from your confirmation.
        </p>
        <Link
          href="/menu"
          className="rounded-brand bg-pepper px-6 py-3 text-sm font-semibold text-cream hover:bg-pepper-dark"
        >
          Back to menu
        </Link>
      </div>
    );
  }

  const cancelled = order.status === "cancelled";
  const currentStep = STEPS.findIndex((s) => s.key === order.status);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6">
      {/* Confirmation header */}
      <div className="text-center">
        <p className="font-display text-lg text-pepper">Thank you, {order.contact_name}!</p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-cocoa">
          Order {order.order_number}
        </h1>
        {!cancelled && order.estimated_ready_at && (
          <p className="mt-2 text-cocoa/70">
            Ready for pickup around{" "}
            <span className="font-semibold text-cocoa">
              {readyTime(order.estimated_ready_at)}
            </span>
          </p>
        )}
      </div>

      {/* Status */}
      {cancelled ? (
        <p className="mt-8 rounded-brand bg-pepper/10 px-4 py-3 text-center text-sm font-medium text-pepper">
          This order was cancelled.
        </p>
      ) : (
        <ol className="mt-10 grid grid-cols-4 gap-2">
          {STEPS.map((step, i) => {
            const done = i <= currentStep;
            return (
              <li key={step.key} className="flex flex-col items-center text-center">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                    done ? "bg-pepper text-cream" : "bg-cream-deep text-cocoa/40"
                  }`}
                >
                  {i + 1}
                </span>
                <span
                  className={`mt-2 text-xs ${done ? "font-semibold text-cocoa" : "text-cocoa/50"}`}
                >
                  {step.label}
                </span>
              </li>
            );
          })}
        </ol>
      )}

      <p className="mt-4 text-center text-xs text-cocoa/50">
        We&apos;ll text and email you as your order progresses. Live updates on
        this page are coming soon — refresh to see the latest.
      </p>

      {/* Items */}
      <div className="mt-10 rounded-brand border border-cream-deep bg-white/60 p-5">
        <h2 className="mb-4 font-display text-lg font-semibold text-cocoa">
          Order summary
        </h2>
        <div className="space-y-3">
          {order.items.map((item, idx) => {
            const parts: string[] = [];
            if (item.size) parts.push(item.size === "large" ? "Large" : "Regular");
            if (item.spice_level) parts.push(`${spiceLabel(item.spice_level)} 🌶️`);
            for (const o of item.selected_options ?? []) parts.push(o.name);
            return (
              <div key={idx} className="flex justify-between gap-3 text-sm">
                <div>
                  <p className="font-medium text-cocoa">
                    {item.quantity}× {item.item_name}
                  </p>
                  {parts.length > 0 && (
                    <p className="text-xs text-cocoa/60">{parts.join(" · ")}</p>
                  )}
                  {item.special_instructions && (
                    <p className="text-xs italic text-cocoa/50">
                      “{item.special_instructions}”
                    </p>
                  )}
                </div>
                <span className="whitespace-nowrap text-cocoa">
                  {formatPrice(item.line_total)}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-4 space-y-1 border-t border-cream-deep pt-4 text-sm">
          <div className="flex justify-between text-cocoa/70">
            <span>Subtotal</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-cocoa/70">
            <span>Tax</span>
            <span>{formatPrice(order.tax)}</span>
          </div>
          <div className="flex justify-between pt-2 text-base font-semibold text-cocoa">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>

        {(order.allergen_notes || order.special_instructions) && (
          <div className="mt-4 space-y-2 border-t border-cream-deep pt-4 text-sm">
            {order.allergen_notes && (
              <p className="text-cocoa/70">
                <span className="font-semibold text-cocoa">Allergies:</span>{" "}
                {order.allergen_notes}
              </p>
            )}
            {order.special_instructions && (
              <p className="text-cocoa/70">
                <span className="font-semibold text-cocoa">Notes:</span>{" "}
                {order.special_instructions}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="mt-8 text-center text-sm text-cocoa/70">
        <p className="font-medium text-cocoa">Pickup location</p>
        <p>
          {siteConfig.contact.address.line1}, {siteConfig.contact.address.city},{" "}
          {siteConfig.contact.address.state} {siteConfig.contact.address.zip}
        </p>
      </div>
    </div>
  );
}
