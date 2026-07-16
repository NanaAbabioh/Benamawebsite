"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/browser";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cocoa px-4">
      <div className="w-full max-w-sm rounded-2xl bg-cream p-8 shadow-2xl">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <Image
            src="/brand/logo-transparent.png"
            alt="Benama Cuisines"
            width={1024}
            height={1024}
            className="h-14 w-14 object-contain"
          />
          <div>
            <h1 className="font-display text-xl font-semibold text-cocoa">
              Kitchen Dashboard
            </h1>
            <p className="text-sm text-cocoa/60">Staff sign in</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-cocoa/80">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="staff@benamacuisines.com"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-cocoa/80">Password</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              placeholder="••••••••"
            />
          </label>

          {error && (
            <p className="rounded-md bg-pepper/10 px-3 py-2 text-sm text-pepper">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-brand bg-pepper px-5 py-3 text-sm font-semibold text-cream transition-colors hover:bg-pepper-dark disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-md border border-cream-deep bg-white px-3 py-2 text-sm text-cocoa placeholder:text-cocoa/40 focus:border-palm focus:outline-none";
