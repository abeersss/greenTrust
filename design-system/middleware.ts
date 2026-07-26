import createMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "@/lib/i18n/config";

/**
 * Locale routing middleware. `localePrefix: "always"` means every page
 * lives at /en/... or /ar/... with no unprefixed default, which keeps
 * canonical URLs and hreflang mapping unambiguous (a bare "/" would
 * otherwise be two different pages depending on browser language,
 * which is exactly what hreflang exists to avoid).
 */
export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
});

export const config = {
  // Run on every path except Next.js internals, API routes, and
  // anything that looks like a static file (has a dot in the last
  // segment, e.g. sitemap.xml, robots.txt, favicon.ico, /og-image.png).
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
