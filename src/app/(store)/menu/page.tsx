import type { Metadata } from "next";
import { getMenu } from "@/lib/menu";
import { ItemCard } from "@/components/menu/item-card";

export const metadata: Metadata = {
  title: "Menu",
  description:
    "Order Ghanaian favourites for pickup — jollof, waakye, kelewele and more.",
};

// Menu comes from Supabase; revalidate periodically so price/sold-out edits show.
export const revalidate = 60;

export default async function MenuPage() {
  const menu = await getMenu();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <header className="mb-8 text-center">
        <h1 className="font-display text-4xl font-semibold text-cocoa">
          Our Menu
        </h1>
        <p className="mt-2 text-cocoa/70">
          Come hungry — every dish made to order, ready for pickup.
        </p>
      </header>

      {menu.length === 0 ? (
        <p className="py-20 text-center text-cocoa/60">
          Our menu is being updated. Please check back soon.
        </p>
      ) : (
        <div className="space-y-12">
          {menu.map((category) => (
            <section key={category.id} id={category.slug} className="scroll-mt-20">
              <h2 className="mb-5 font-display text-2xl font-semibold text-cocoa">
                {category.name}
              </h2>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {category.items.map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
