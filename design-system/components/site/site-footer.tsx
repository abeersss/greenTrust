import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import { NewsletterForm } from "@/components/forms/newsletter-form";
import type { AppLocale } from "@/lib/i18n/config";

/**
 * Site-wide footer. Server Component: only the newsletter form inside
 * it needs interactivity, so that one piece is a separate "use client"
 * island rather than making the whole footer (and its translated
 * static links) part of the client bundle. Uses `getTranslations`
 * (the async, server-only API) rather than the `useTranslations`
 * hook, which requires a Client Component.
 */
export async function SiteFooter({ locale }: { locale: AppLocale }) {
  const tNav = await getTranslations({ locale, namespace: "nav" });
  const tFooter = await getTranslations({ locale, namespace: "footer" });
  const year = new Date().getFullYear();

  const siteLinks = [
    { label: tNav("home"), href: "/" },
    { label: tNav("about"), href: "/about" },
    { label: tNav("greentrust"), href: "/greentrust" },
    { label: tNav("labs"), href: "/labs" },
    { label: tNav("freeTools"), href: "/free-tools" },
    { label: tNav("research"), href: "/research" },
    { label: tNav("insights"), href: "/insights" },
    { label: tNav("contact"), href: "/contact" },
  ];

  // Creator credit for the site identity theme song and the CyberAbeer
  // Labs mascot character (2026-08-03, founder-supplied original
  // creative works). This is an honest, on-site attribution notice,
  // not a legal copyright registration -- registering copyright is a
  // real government filing (e.g. via a national copyright office) that
  // only the rights-holder can file themselves; this credit line is
  // the part of that request a code change can actually deliver.
  const creatorCredit =
    locale === "ar"
      ? "الهوية الصوتية للموقع وشخصية معامل CyberAbeer من إبداع الدكتورة عبير الشمري، مؤسسة CyberAbeer. جميع الحقوق محفوظة لصاحبتها."
      : "Site theme audio and the CyberAbeer Labs mascot character are original creative works by Dr. Abeer Alshammari, founder of CyberAbeer. All rights reserved to their creator.";

  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 tablet:grid-cols-3 tablet:px-6">
        <div className="space-y-2">
          <p className="font-display text-lg font-semibold text-text-primary">CyberAbeer</p>
          <p className="max-w-xs text-sm text-text-secondary">{tFooter("tagline")}</p>
        </div>

        <nav aria-label={tFooter("sitemapHeading")} className="space-y-2">
          <p className="text-sm font-semibold text-text-primary">{tFooter("sitemapHeading")}</p>
          <ul className="space-y-1.5">
            {siteLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-text-secondary hover:text-text-primary">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-2">
          <p className="text-sm font-semibold text-text-primary">{tFooter("newsletterHeading")}</p>
          <p className="text-sm text-text-secondary">{tFooter("newsletterBody")}</p>
          <NewsletterForm locale={locale} />
        </div>
      </div>

      <div className="border-t border-border px-4 py-4 text-center text-xs text-text-muted tablet:px-6">
        <p>
          © {year} CyberAbeer. {tFooter("rights")}
        </p>
        <p className="mt-1">{creatorCredit}</p>
      </div>
    </footer>
  );
}
