"use server";

import { createServerClient } from "@/lib/supabase/server";
import type { CartItem } from "@/lib/cart";

export type PlaceOrderInput = {
  contact: { name: string; email: string; phone: string };
  specialInstructions: string;
  allergenNotes: string;
  items: CartItem[];
};

export type PlaceOrderResult =
  | { ok: true; orderNumber: string; trackingToken: string }
  | { ok: false; error: string };

/**
 * Creates a paid order.
 *
 * This is the seam where real Stripe lives: create a PaymentIntent, confirm
 * payment, and only then persist the order (ideally from a webhook). For now
 * payment is a placeholder that always succeeds, and the order is written via
 * the create_order RPC.
 */
export async function placeOrder(
  input: PlaceOrderInput,
): Promise<PlaceOrderResult> {
  const { contact, items } = input;

  if (!contact.name.trim() || !contact.email.trim() || !contact.phone.trim()) {
    return { ok: false, error: "Please fill in your name, email, and phone." };
  }
  if (items.length === 0) {
    return { ok: false, error: "Your cart is empty." };
  }

  // --- Stripe payment goes here (placeholder: assume success) ---
  // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  // const intent = await stripe.paymentIntents.create({ amount, currency: "usd", ... });
  // ...confirm, then persist below with intent.id.

  const supabase = createServerClient();

  const { data, error } = await supabase.rpc("create_order", {
    p_contact: contact,
    p_pickup_type: "asap",
    p_special_instructions: input.specialInstructions || undefined,
    p_allergen_notes: input.allergenNotes || undefined,
    p_items: items.map((i) => ({
      menu_item_id: i.menuItemId,
      name: i.name,
      unit_price: i.unitPrice,
      quantity: i.quantity,
      size: i.size,
      spice: i.spice,
      options: i.options,
      special_instructions: i.specialInstructions,
    })),
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  const result = data as { order_number: string; tracking_token: string };
  return {
    ok: true,
    orderNumber: result.order_number,
    trackingToken: result.tracking_token,
  };
}
