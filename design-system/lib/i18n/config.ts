/**
 * Single source of truth for supported locales. Everything that needs
 * to know about "en" and "ar" (middleware, metadata/hreflang builder,
 * sitemap, the language switcher) imports from here rather than
 * repeating the list, so adding a third locale later is a one-file
 * change.
 */
export const locales = ["en", "ar"] as const;
export type AppLocale = (typeof locales)[number];

export const defaultLocale: AppLocale = "en";

export const localeDir: Record<AppLocale, "ltr" | "rtl"> = {
  en: "ltr",
  ar: "rtl",
};

export const localeLabel: Record<AppLocale, string> = {
  en: "English",
  ar: "العربية",
};

/** BCP-47 tag used in hreflang / lang attributes. */
export const localeTag: Record<AppLocale, string> = {
  en: "en",
  ar: "ar",
};

export function isAppLocale(value: string): value is AppLocale {
  return (locales as readonly string[]).includes(value);
}
