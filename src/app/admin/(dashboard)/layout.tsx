import { redirect } from "next/navigation";
import Image from "next/image";
import { createAuthClient } from "@/lib/supabase/server-auth";
import { signOut } from "@/app/admin/actions";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createAuthClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "staff" && profile.role !== "admin")) {
    redirect("/admin/login?error=not-authorized");
  }

  return (
    <div className="min-h-screen bg-cocoa/[0.03]">
      <header className="border-b border-cream-deep bg-cream">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <Image
              src="/brand/logo-transparent.png"
              alt="Benama Cuisines"
              width={1024}
              height={1024}
              className="h-9 w-9 object-contain"
            />
            <span className="font-display text-lg font-semibold text-cocoa">
              Kitchen Dashboard
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-cocoa/60 sm:inline">
              {profile.full_name ?? user.email}
            </span>
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-md border border-cream-deep px-3 py-1.5 text-sm font-medium text-cocoa/80 transition-colors hover:bg-cream-deep"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
