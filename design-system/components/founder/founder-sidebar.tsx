import { Link } from "@/lib/i18n/navigation";
import type { AppLocale } from "@/lib/i18n/config";

/**
 * Founder Dashboard nav shell (CyberAbeer Platform Phase II). Batch 1
 * wired Content, Insights, and Cyber Intelligence to the real /founder
 * /content admin screen (all three are the same underlying `articles`
 * table, filtered by `?group=`); Batch 2 wired Subscribers, Newsletter,
 * and the homepage Banner to their real admin screens. Everything else
 * is still the founder's planned Phase II section list, shown so the
 * eventual structure is visible without pretending it already works.
 * Each becomes a real Link href as its own batch ships; until then it
 * renders as a disabled row with a "Coming soon" tag rather than a
 * link that would just 404.
 *
 * English-only for now (Arabic labels deferred to a follow-up pass);
 * locale is still threaded through and used for text direction so
 * localizing the labels later is a data-only change.
 */
const NAV_ITEMS: { key: string; label: string; href?: string }[] = [
  { key: "dashboard", label: "Dashboard", href: "/founder" },
  { key: "content", label: "Content", href: "/founder/content" },
  { key: "research", label: "Research" },
  { key: "books", label: "Books" },
  { key: "insights", label: "Insights", href: "/founder/content?group=insights" },
  { key: "intelligence", label: "Cyber Intelligence", href: "/founder/content?group=intelligence" },
  { key: "labs", label: "Labs", href: "/founder/labs" },
  { key: "orgTools", label: "Organization Tools" },
  { key: "freeTools", label: "Free Tools" },
  { key: "media", label: "Media Library", href: "/founder/media" },
  { key: "subscribers", label: "Subscribers", href: "/founder/subscribers" },
  { key: "newsletter", label: "Newsletter", href: "/founder/newsletter" },
  { key: "banner", label: "Homepage Banner", href: "/founder/banner" },
  { key: "seo", label: "SEO", href: "/founder/seo" },
  { key: "analytics", label: "Analytics" },
  { key: "settings", label: "Settings" },
];

export function FounderSidebar({ locale }: { locale: AppLocale }) {
  return (
    <nav
      aria-label="Founder dashboard navigation"
      dir={locale === "ar" ? "rtl" : "ltr"}
      className="shrink-0 tablet:w-56"
    >
      <p className="px-2 text-xs font-semibold uppercase tracking-wide text-text-muted">Founder</p>
      <ul className="mt-2 space-y-1">
        {NAV_ITEMS.map((item) => (
          <li key={item.key}>
            {item.href ? (
              <Link
                href={item.href}
                className="flex items-center rounded-lg px-3 py-2 text-sm font-medium text-text-primary hover:bg-surface-raised"
              >
                {item.label}
              </Link>
            ) : (
              <span
                aria-disabled="true"
                className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-text-muted"
              >
                <span>{item.label}</span>
                <span className="ms-2 shrink-0 rounded-full bg-surface-raised px-2 py-0.5 text-[10px] font-medium text-text-muted">
                  Coming soon
                </span>
              </span>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
