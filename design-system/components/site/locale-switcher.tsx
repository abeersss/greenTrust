"use client";

import { usePathname, useRouter } from "next/navigation";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { trackEvent } from "@/lib/analytics/track";
import type { AppLocale } from "@/lib/i18n/config";

/**
 * Wires the design system's routing-agnostic LanguageSwitcher to
 * actual navigation: swaps the leading /en or /ar segment of the
 * current path and pushes the result, so switching language keeps
 * the visitor on the equivalent page (e.g. /en/greentrust ->
 * /ar/greentrust) instead of bouncing them to the home page.
 */
export function LocaleSwitcher({ locale }: { locale: AppLocale }) {
  const pathname = usePathname();
  const router = useRouter();

  function handleChange(next: string) {
    trackEvent("language_selected", { from: locale, to: next });
    const segments = pathname.split("/");
    // segments[0] is "" (leading slash), segments[1] is the locale.
    segments[1] = next;
    router.push(segments.join("/") || "/");
  }

  return <LanguageSwitcher locale={locale} onLocaleChange={handleChange} />;
}
