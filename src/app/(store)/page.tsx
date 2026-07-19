import type { Viewport } from "next";
import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/lib/config";

// Dark status bar so iOS Safari's top area matches the dark hero.
export const viewport: Viewport = {
  themeColor: "#2B1A12",
};

export default function HomePage() {
  return (
    <>
      {/* ---------- Hero ---------- */}
      {/* Dark base so the page's top background (what iOS Safari samples for
          the status bar) is dark, not cream. The hero→steps seam is handled
          by the bottom fade + the steps section's negative top margin. */}
      <section className="relative isolate overflow-hidden bg-cocoa">
        {/* Background video: portrait loop on mobile, 16:9 on desktop.
            autoplay + muted + playsinline keeps it decorative; poster is the
            fallback for reduced-motion / slow connections. */}
        <video
          className="absolute inset-0 h-full w-full object-cover opacity-90 md:hidden"
          autoPlay
          muted
          loop
          playsInline
          poster="/video/hero-poster-mobile.jpg"
        >
          <source src="/video/hero-mobile.mp4" type="video/mp4" />
        </video>
        <video
          className="absolute inset-0 hidden h-full w-full object-cover opacity-90 md:block"
          autoPlay
          muted
          loop
          playsInline
          poster="/video/hero-poster-desktop.jpg"
        >
          <source src="/video/hero-desktop.mp4" type="video/mp4" />
        </video>

        {/* Warm scrim so the text stays legible over the footage. */}
        <div className="absolute inset-0 bg-gradient-to-b from-cocoa/75 via-cocoa/45 to-cocoa/80" />
        {/* Melt the footage into the page background — solid cream at the
            junction (explicit stops) so no seam or gray band shows. */}
        <div className="absolute inset-x-0 bottom-0 h-44 bg-[linear-gradient(to_top,#FBF3E4_0%,#FBF3E4_18%,rgba(251,243,228,0)_100%)] sm:h-64" />

        <div className="relative mx-auto flex min-h-[80vh] w-full max-w-7xl flex-col items-center justify-center gap-6 px-4 py-24 text-center sm:px-6 lg:min-h-[88vh] lg:gap-8">
          <Image
            src="/brand/logo-reversed.png"
            alt={siteConfig.name}
            width={1024}
            height={1024}
            priority
            className="h-28 w-28 object-contain sm:h-36 sm:w-36 lg:h-44 lg:w-44"
          />
          <h1 className="max-w-5xl font-display text-4xl font-semibold text-cream sm:text-6xl lg:text-7xl xl:text-8xl">
            {siteConfig.tagline}
          </h1>
          <Link
            href="/menu"
            className="mt-2 inline-flex items-center rounded-brand bg-pepper px-8 py-3.5 text-base font-semibold text-cream shadow-lg transition-colors hover:bg-pepper-dark lg:px-10 lg:py-4 lg:text-lg"
          >
            Order Now
          </Link>
        </div>
      </section>

      {/* ---------- How pickup works ---------- */}
      {/* Pulled up into the hero's solid-cream fade zone so the two sections
          physically overlap — no hairline seam can render between them. */}
      <section className="relative mx-auto -mt-12 w-full max-w-7xl px-4 pb-16 pt-4 sm:px-6 lg:pb-24">
        <h2 className="text-center font-display text-3xl font-semibold text-cocoa lg:text-4xl xl:text-5xl">
          Order in minutes, pick up hot
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3 lg:mt-14 lg:gap-8">
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
              className="rounded-brand border border-cream-deep bg-white/50 p-6 lg:p-9"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold font-display text-lg font-bold text-cocoa lg:h-12 lg:w-12 lg:text-xl">
                {s.step}
              </div>
              <h3 className="mt-4 font-display text-xl font-semibold text-cocoa lg:text-2xl">
                {s.title}
              </h3>
              <p className="mt-2 text-sm text-cocoa/75 lg:text-base">{s.body}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
