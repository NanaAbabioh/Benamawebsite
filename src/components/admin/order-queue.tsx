"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/browser";
import type { Database } from "@/lib/database.types";
import { spiceLabel } from "@/lib/spice";

type OrderRow = Database["public"]["Tables"]["orders"]["Row"];
type OrderItemRow = Database["public"]["Tables"]["order_items"]["Row"];
export type AdminOrder = OrderRow & { order_items: OrderItemRow[] };

type Status = "received" | "preparing" | "ready";

const COLUMNS: { status: Status; title: string; next: OrderRow["status"]; action: string }[] = [
  { status: "received", title: "New orders", next: "preparing", action: "Start preparing" },
  { status: "preparing", title: "Preparing", next: "ready", action: "Mark ready" },
  { status: "ready", title: "Ready for pickup", next: "picked_up", action: "Complete pickup" },
];

function timeStr(iso: string | null): string {
  if (!iso) return "";
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/Denver",
  }).format(new Date(iso));
}

function itemLine(item: OrderItemRow): string {
  const parts: string[] = [];
  if (item.size) parts.push(item.size === "large" ? "Large" : "Regular");
  if (item.spice_level) parts.push(`${spiceLabel(item.spice_level)} 🌶️`);
  const opts = (item.selected_options as { name?: string }[] | null) ?? [];
  for (const o of opts) if (o?.name) parts.push(o.name);
  return parts.join(" · ");
}

export function OrderQueue({ initialOrders }: { initialOrders: AdminOrder[] }) {
  const supabase = useMemo(() => createClient(), []);
  const [orders, setOrders] = useState<AdminOrder[]>(initialOrders);
  const [updating, setUpdating] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    const { data } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .in("status", ["received", "preparing", "ready"])
      .order("created_at", { ascending: true });
    if (data) setOrders(data as AdminOrder[]);
  }, [supabase]);

  // Realtime + a polling safety net so the board stays current even if a
  // realtime event is missed.
  useEffect(() => {
    const channel = supabase
      .channel("orders-queue")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        (payload) => {
          if (payload.eventType === "INSERT") beep();
          refetch();
        },
      )
      .subscribe();

    const interval = setInterval(refetch, 15000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [supabase, refetch]);

  async function advance(order: AdminOrder, next: OrderRow["status"]) {
    setUpdating(order.id);
    await supabase.from("orders").update({ status: next }).eq("id", order.id);
    await refetch();
    setUpdating(null);
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-cocoa">
          Live orders
        </h1>
        <span className="flex items-center gap-2 text-sm text-cocoa/60">
          <span className="h-2 w-2 animate-pulse rounded-full bg-leaf" />
          Live
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {COLUMNS.map((col) => {
          const colOrders = orders.filter((o) => o.status === col.status);
          return (
            <section key={col.status} className="rounded-brand bg-cream p-3">
              <div className="mb-3 flex items-center justify-between px-1">
                <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-cocoa/70">
                  {col.title}
                </h2>
                <span className="rounded-full bg-cocoa/10 px-2 py-0.5 text-xs font-semibold text-cocoa/70">
                  {colOrders.length}
                </span>
              </div>

              <div className="space-y-3">
                {colOrders.length === 0 && (
                  <p className="px-1 py-6 text-center text-xs text-cocoa/40">
                    Nothing here yet
                  </p>
                )}
                {colOrders.map((order) => (
                  <article
                    key={order.id}
                    className="rounded-lg border border-cream-deep bg-white p-3 shadow-sm"
                  >
                    <div className="flex items-baseline justify-between">
                      <span className="font-display font-semibold text-cocoa">
                        {order.order_number}
                      </span>
                      <span className="text-xs text-cocoa/50">
                        {timeStr(order.created_at)}
                      </span>
                    </div>
                    <p className="text-xs text-cocoa/60">
                      {order.contact_name} · {order.contact_phone}
                    </p>

                    <ul className="mt-2 space-y-1.5 border-t border-cream-deep pt-2">
                      {order.order_items.map((item) => (
                        <li key={item.id} className="text-sm">
                          <span className="font-medium text-cocoa">
                            {item.quantity}× {item.item_name}
                          </span>
                          {itemLine(item) && (
                            <span className="block text-xs text-cocoa/60">
                              {itemLine(item)}
                            </span>
                          )}
                          {item.special_instructions && (
                            <span className="block text-xs italic text-cocoa/50">
                              “{item.special_instructions}”
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>

                    {order.allergen_notes && (
                      <p className="mt-2 rounded bg-pepper/10 px-2 py-1 text-xs font-medium text-pepper">
                        ⚠ Allergies: {order.allergen_notes}
                      </p>
                    )}
                    {order.special_instructions && (
                      <p className="mt-1 text-xs text-cocoa/60">
                        Note: {order.special_instructions}
                      </p>
                    )}

                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs text-cocoa/50">
                        Ready ~{timeStr(order.estimated_ready_at)}
                      </span>
                      <button
                        type="button"
                        disabled={updating === order.id}
                        onClick={() => advance(order, col.next)}
                        className="rounded-md bg-pepper px-3 py-1.5 text-xs font-semibold text-cream transition-colors hover:bg-pepper-dark disabled:opacity-50"
                      >
                        {updating === order.id ? "…" : col.action}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

// Short chime on a new order. Best-effort — browsers may block audio until the
// staff interacts with the page.
function beep() {
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
  } catch {
    // ignore
  }
}
