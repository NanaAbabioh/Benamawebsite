import Image from "next/image";
import Link from "next/link";
import { siteConfig, formatAddress } from "@/lib/config";

/** "21:00" → "9pm", "11:30" → "11:30am" */
function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const suffix = h >= 12 ? "pm" : "am";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return m ? `${hour}:${String(m).padStart(2, "0")}${suffix}` : `${hour}${suffix}`;
}

/** Groups consecutive days sharing the same hours: "Mon–Thu 11am–9pm". */
function summarizeHours(): string[] {
  const groups: { start: string; end: string; open: string; close: string }[] = [];
  for (const h of siteConfig.hours) {
    const last = groups[groups.length - 1];
    if (last && last.open === h.open && last.close === h.close) {
      last.end = h.day;
    } else {
      groups.push({ start: h.day, end: h.day, open: h.open, close: h.close });
    }
  }
  return groups.map(
    (g) =>
      `${g.start === g.end ? g.start : `${g.start}–${g.end}`} ${formatTime(g.open)}–${formatTime(g.close)}`,
  );
}

export function SiteFooter() {
  const { contact } = siteConfig;

  return (
    <footer className="text-cream">
      {/* Wavy hand-off from the page into the cocoa footer. */}
      <div aria-hidden className="-mb-px text-cocoa">
        <svg
          viewBox="0 0 1440 90"
          preserveAspectRatio="none"
          className="block h-14 w-full sm:h-20"
        >
          <path
            fill="currentColor"
            d="M0,56 C160,88 340,14 540,30 C740,46 880,86 1060,68 C1220,52 1340,22 1440,46 L1440,90 L0,90 Z"
          />
        </svg>
      </div>

      <div className="bg-cocoa">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 md:flex-row md:items-start md:justify-between">
          {/* Brand */}
          <div className="space-y-3">
            <Image
              src="/brand/logo-reversed.png"
              alt={siteConfig.name}
              width={1024}
              height={1024}
              className="h-16 w-16 object-contain"
            />
            <p className="font-display text-lg text-gold">
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

          {/* Visit — kept to a few compact lines */}
          <div className="space-y-1.5 text-sm text-cream/80 md:text-right">
            <p>{formatAddress()}</p>
            <p>
              <a
                href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`}
                className="hover:text-gold"
              >
                {contact.phone}
              </a>{" "}
              ·{" "}
              <a href={`mailto:${contact.email}`} className="hover:text-gold">
                {contact.email}
              </a>
            </p>
            <p className="text-cream/70">{summarizeHours().join(" · ")}</p>
            <p className="text-xs text-cream/50">Pickup only — no delivery at launch.</p>
          </div>
        </div>

        <p className="pb-5 text-center text-xs text-cream/45">
          © {new Date().getFullYear()} {siteConfig.name} · Salt Lake City, UT
        </p>
      </div>
    </footer>
  );
}
