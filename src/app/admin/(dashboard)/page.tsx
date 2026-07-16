import { createAuthClient } from "@/lib/supabase/server-auth";
import { OrderQueue, type AdminOrder } from "@/components/admin/order-queue";

export const dynamic = "force-dynamic";

const ACTIVE_STATUSES = ["received", "preparing", "ready"] as const;

export default async function AdminDashboardPage() {
  const supabase = await createAuthClient();

  const { data } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .in("status", ACTIVE_STATUSES)
    .order("created_at", { ascending: true });

  return <OrderQueue initialOrders={(data as AdminOrder[] | null) ?? []} />;
}
