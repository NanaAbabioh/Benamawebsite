import { createServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/database.types";

export type SpiceLevel = Database["public"]["Enums"]["spice_level"];

export type MenuOption = {
  id: string;
  name: string;
  priceDelta: number;
  isDefault: boolean;
  isAvailable: boolean;
};

export type MenuOptionGroup = {
  id: string;
  name: string;
  minSelect: number;
  maxSelect: number;
  isRequired: boolean;
  options: MenuOption[];
};

export type MenuItem = {
  id: string;
  name: string;
  localName: string | null;
  description: string | null;
  basePrice: number;
  spiceSelectable: boolean;
  defaultSpice: SpiceLevel | null;
  hasSizes: boolean;
  largeSurcharge: number;
  isSoldOut: boolean;
  optionGroups: MenuOptionGroup[];
};

export type MenuCategory = {
  id: string;
  name: string;
  slug: string;
  items: MenuItem[];
};

const bySortOrder = <T extends { sort_order: number }>(a: T, b: T) =>
  a.sort_order - b.sort_order;

/**
 * Loads the full active menu (categories → available items → option groups →
 * choices), shaped into camelCase domain types and ordered by sort_order.
 */
export async function getMenu(): Promise<MenuCategory[]> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("menu_categories")
    .select(
      `
      id, name, slug, sort_order, is_active,
      menu_items (
        id, name, local_name, description, base_price, spice_selectable,
        default_spice, has_sizes, large_surcharge, is_sold_out, is_available, sort_order,
        item_option_groups (
          id, name, min_select, max_select, is_required, sort_order,
          item_options ( id, name, price_delta, is_default, is_available, sort_order )
        )
      )
    `,
    )
    .eq("is_active", true)
    .order("sort_order");

  if (error) throw error;

  return (data ?? [])
    .sort(bySortOrder)
    .map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      items: (category.menu_items ?? [])
        .filter((item) => item.is_available)
        .sort(bySortOrder)
        .map((item) => ({
          id: item.id,
          name: item.name,
          localName: item.local_name,
          description: item.description,
          basePrice: item.base_price,
          spiceSelectable: item.spice_selectable,
          defaultSpice: item.default_spice,
          hasSizes: item.has_sizes,
          largeSurcharge: item.large_surcharge,
          isSoldOut: item.is_sold_out,
          optionGroups: (item.item_option_groups ?? [])
            .sort(bySortOrder)
            .map((group) => ({
              id: group.id,
              name: group.name,
              minSelect: group.min_select,
              maxSelect: group.max_select,
              isRequired: group.is_required,
              options: (group.item_options ?? [])
                .filter((opt) => opt.is_available)
                .sort(bySortOrder)
                .map((opt) => ({
                  id: opt.id,
                  name: opt.name,
                  priceDelta: opt.price_delta,
                  isDefault: opt.is_default,
                  isAvailable: opt.is_available,
                })),
            })),
        })),
    }))
    .filter((category) => category.items.length > 0);
}
