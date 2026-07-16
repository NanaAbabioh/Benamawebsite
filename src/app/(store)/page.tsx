import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/lib/config";

export default function HomePage() {
  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="relative isolate overflow-hidden bg-cocoa">
        {/* Background video: portrait loop on mobile, 16:9 on desktop.
            autoplay + muted + playsinline keeps it decorative; poster is the
            fallback for reduced-motion / slow connections. */}
        <video
          className="absolute inset-0 h-full w-full object-cover opacity-70 md:hidden"
          autoPlay
          muted
          loop
          playsInline
          poster="/video/hero-poster-mobile.jpg"
        >
          <source src="/video/hero-mobile.mp4" type="video/mp4" />
        </video>
        <video
          className="absolute inset-0 hidden h-full w-full object-cover opacity-70 md:block"
          autoPlay
          muted
          loop
          playsInline
          poster="/video/hero-poster-desktop.jpg"
        >
          <source src="/video/hero-desktop.mp4" type="video/mp4" />
        </video>

        {/* Warm scrim so the text stays legible over the footage. */}
        <div className="absolute inset-0 bg-gradient-to-b from-cocoa/70 via-cocoa/40 to-cocoa/85" />
        {/* Melt the footage into the page background — no hard section edge. */}
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent to-cream" />

        <div className="relative mx-auto flex min-h-[80vh] w-full max-w-6xl flex-col items-center justify-center gap-6 px-4 py-24 text-center sm:px-6">
          <Image
            src="/brand/logo-reversed.png"
            alt={siteConfig.name}
            width={1024}
            height={1024}
            priority
            className="h-28 w-28 object-contain sm:h-36 sm:w-36"
          />
          <h1 className="max-w-2xl font-display text-4xl font-semibold text-cream sm:text-6xl">
            {siteConfig.tagline}
          </h1>
          <Link
            href="/menu"
            className="mt-2 inline-flex items-center rounded-brand bg-pepper px-8 py-3.5 text-base font-semibold text-cream shadow-lg transition-colors hover:bg-pepper-dark"
          >
            Order Now
          </Link>
        </div>
      </section>

      {/* ---------- How pickup works ---------- */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-center font-display text-3xl font-semibold text-cocoa">
          Order in minutes, pick up hot
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            {
              step: "1",
              title: "Browse the menu",
              body: "Explore our assorted menu of main dishes, sides, desserts, and drinks.",
            },
            {
              step: "2",
              title: "Order & pay online",
              body: "Secure checkout with card, Apple Pay or Google Pay. No account required.",
            },
            {
              step: "3",
              title: "Pick up in store",
              body: "We'll text you the moment your food is ready.",
            },
          ].map((s) => (
            <div
              key={s.step}
              className="rounded-brand border border-cream-deep bg-white/50 p-6"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold font-display text-lg font-bold text-cocoa">
                {s.step}
              </div>
              <h3 className="mt-4 font-display text-xl font-semibold text-cocoa">
                {s.title}
              </h3>
              <p className="mt-2 text-sm text-cocoa/75">{s.body}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
