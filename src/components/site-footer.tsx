import Image from "next/image";
import Link from "next/link";
import { siteConfig, formatAddress } from "@/lib/config";

export function SiteFooter() {
  const { contact, hours } = siteConfig;

  return (
    <footer className="bg-cocoa text-cream">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
        {/* Brand */}
        <div className="space-y-4">
          <Image
            src="/brand/logo-reversed.png"
            alt={siteConfig.name}
            width={1024}
            height={1024}
            className="h-20 w-20 object-contain"
          />
          <p className="max-w-xs font-display text-lg text-gold">
            Bold Authentic West African Flavour
          </p>
          <div className="flex gap-4 text-sm text-cream/70">
            <Link href={siteConfig.social.instagram} className="hover:text-gold">
              Instagram
            </Link>
            <Link href={siteConfig.social.facebook} className="hover:text-gold">
              Facebook
            </Link>
            <Link href={siteConfig.social.tiktok} className="hover:text-gold">
              TikTok
            </Link>
          </div>
        </div>

        {/* Visit */}
        <div className="space-y-3 text-sm">
          <h3 className="font-display text-base font-semibold text-cream">
            Visit &amp; Pickup
          </h3>
          <p className="text-cream/80">{formatAddress()}</p>
          <p className="text-cream/80">
            <a href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`} className="hover:text-gold">
              {contact.phone}
            </a>
          </p>
          <p className="text-cream/80">
            <a href={`mailto:${contact.email}`} className="hover:text-gold">
              {contact.email}
            </a>
          </p>
          <p className="text-xs text-cream/50">Pickup only — no delivery at launch.</p>
        </div>

        {/* Hours */}
        <div className="space-y-3 text-sm">
          <h3 className="font-display text-base font-semibold text-cream">Hours</h3>
          <ul className="space-y-1 text-cream/80">
            {hours.map((h) => (
              <li key={h.day} className="flex justify-between gap-4">
                <span>{h.day}</span>
                <span>
                  {h.open}–{h.close}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-cocoa-soft">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-4 py-4 text-xs text-cream/50 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
          <p>Salt Lake City, UT</p>
        </div>
      </div>
    </footer>
  );
}
