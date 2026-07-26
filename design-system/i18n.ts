import { getRequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";
import { isAppLocale } from "@/lib/i18n/config";

/**
 * next-intl request config. Called once per request by the App Router
 * integration to resolve which message catalog to load. A locale that
 * isn't "en" or "ar" (someone hand-typing /fr/... for example) 404s
 * rather than silently falling back, since a silent fallback would
 * mean a wrong-language page could get indexed under the wrong URL.
 */
export default getRequestConfig(async ({ locale }) => {
  if (!isAppLocale(locale)) notFound();

  return {
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
