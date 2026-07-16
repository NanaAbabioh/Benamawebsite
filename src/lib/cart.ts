import type { SpiceLevel } from "@/lib/menu";

export type CartSize = "regular" | "large";

export type CartOption = {
  groupName: string;
  name: string;
  priceDelta: number;
};

export type CartItem = {
  lineId: string;
  menuItemId: string;
  name: string;
  localName: string | null;
  size: CartSize | null;
  spice: SpiceLevel | null;
  options: CartOption[];
  specialInstructions: string;
  /** base price + size surcharge + option deltas, per unit */
  unitPrice: number;
  quantity: number;
};

export function lineTotal(item: CartItem): number {
  return item.unitPrice * item.quantity;
}

export function cartSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + lineTotal(item), 0);
}

export function cartCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}
