import { Link } from "@/lib/i18n/navigation";
import type { AppLocale } from "@/lib/i18n/config";

/**
 * Founder Dashboard nav shell (CyberAbeer Platform Phase II). Every
 * section below now has a real /founder page and a real Link href --
 * Content, Insights, and Cyber Intelligence share the /founder/content
 * screen (same underlying `articles` table, filtered by `?group=`);
 * Organization Tools reads live tool_submissions at /founder/tools;
 * Free Tools manages the Downloads section at /founder/tool-resources.
 * Nothing here renders as a disabled "Coming soon" row anymore --
 * every batch that was built got wired up here too.
 *
 * Accounts (added 2026-08-15): every registered account, sourced from
 * Supabase Auth via lib/founder/accounts-admin.ts -- distinct from
 * Subscribers, which is newsletter opt-ins only. Placed right under
 * Dashboard since "who has an account" is core admin visibility, not
 * a later-batch nice-to-have.
 *
 * English-only for now (Arabic labels deferred to a follow-up pass);
 * locale is still threaded through and used for text direction so
 * localizing the labels later is a data-only change.
 */
const NAV_ITEMS: { key: string; label: string; href?: string }[] = [
  { key: "dashboard", label: "Dashboard", href: "/founder" },
  { key: "accounts", label: "Accounts", href: "/founder/accounts" },
  { key: "content", label: "Content", href: "/founder/content" },
  { key: "research", label: "Research", href: "/founder/research" },
  { key: "books", label: "Books", href: "/founder/books" },
  { key: "insights", label: "Insights", href: "/founder/content?group=insights" },
  { key: "intelligence", label: "Cyber Intelligence", href: "/founder/content?group=intelligence" },
  { key: "labs", label: "Labs", href: "/founder/labs" },
  { key: "orgTools", label: "Organization Tools", href: "/founder/tools" },
  { key: "freeTools", label: "Free Tools", href: "/founder/tool-resources" },
  { key: "media", label: "Media Library", href: "/founder/media" },
  { key: "subscribers", label: "Subscribers", href: "/founder/subscribers" },
  { key: "newsletter", label: "Newsletter", href: "/founder/newsletter" },
  { key: "banner", label: "Homepage Banner", href: "/founder/banner" },
  { key: "seo", label: "SEO", href: "/founder/seo" },
  { key: "analytics", label: "Analytics", href: "/founder/analytics" },
  { key: "settings", label: "Settings", href: "/founder/settings" },
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
