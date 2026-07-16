import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/lib/config";
import { CartButton } from "@/components/cart/cart-button";

const navLinks = [
  { href: "/menu", label: "Menu" },
  { href: "/about", label: "Our Story" },
  { href: "/contact", label: "Visit" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-cream-deep bg-cream/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2"
          aria-label={`${siteConfig.name} home`}
        >
          <Image
            src="/brand/logo-transparent.png"
            alt={siteConfig.name}
            width={1024}
            height={1024}
            priority
            className="h-11 w-11 object-contain"
          />
          <span className="hidden font-display text-lg font-semibold text-cocoa sm:inline">
            {siteConfig.name}
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-cocoa/80 transition-colors hover:text-pepper"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/menu"
            className="inline-flex items-center rounded-brand bg-pepper px-4 py-2 text-sm font-semibold text-cream shadow-sm transition-colors hover:bg-pepper-dark"
          >
            Order Now
          </Link>
          <CartButton />
        </div>
      </div>
    </header>
  );
}
