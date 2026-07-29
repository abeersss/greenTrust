import type { AppLocale } from "@/lib/i18n/config";

/**
 * Locale-correct "published" date for article cards, matching the
 * `Intl.DateTimeFormat` convention already used for `memberSince` on
 * the account page. Returns null (rather than an empty string) when
 * there's no date to show, so callers can conditionally render.
 */
export function formatArticleDate(locale: AppLocale, iso: string | null): string | null {
  if (!iso) return null;
  return new Intl.DateTimeFormat(locale, { year: "numeric", month: "long", day: "numeric" }).format(new Date(iso));
}
