import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Inter, Space_Grotesk, Tajawal, Cairo } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import "@/styles/globals.css";
import { BrandProvider } from "@/components/shared/brand-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { SiteNavbar } from "@/components/site/site-navbar";
import { SiteFooter } from "@/components/site/site-footer";
import { MotionProvider, PageTransition } from "@/components/motion";
import { JsonLd } from "@/components/site/json-ld";
import { AnalyticsScript } from "@/components/site/analytics-script";
import { RoutePageView } from "@/components/analytics/route-page-view";
import { organizationSchema, websiteSchema } from "@/lib/seo/schema";
import { buildMetadata } from "@/lib/seo/metadata";
import { isAppLocale, localeDir, type AppLocale } from "@/lib/i18n/config";
import { getTranslations } from "next-intl/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const inter = Inter({ subsets: ["latin"], variable: "--font-latin-body", display: "swap" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-labs-display", display: "swap" });
// Arabic brand fonts (Phase 7 fix): tokens.css already names "Tajawal"
// and "Cairo" as the Arabic body/display stacks, but until now nothing
// actually loaded those font files, so every Arabic page silently fell
// back to the browser's default system font. next/font self-hosts and
// subsets these to only the Arabic glyphs actually needed, and only
// downloads them on pages that use the font-arabic/font-arabic-display
// Tailwind classes, so this adds no weight to English pages.
const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["400", "500", "700"],
  variable: "--font-arabic-body",
  display: "swap",
});
const cairo = Cairo({
  subsets: ["arabic"],
  weight: ["600", "700", "800"],
  variable: "--font-arabic-display",
  display: "swap",
});

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "ar" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  // Required for next-intl to resolve the locale statically instead of
  // reading it from request headers, which is what was forcing every
  // route under this layout into dynamic (non-prerendered) rendering.
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "seo" });

  return buildMetadata({
    locale,
    path: "",
    title: t("defaultTitle"),
    description: t("defaultDescription"),
  });
}

/**
 * Root layout for the whole public site (there is no app/layout.tsx;
 * this is the topmost layout for every /en/... and /ar/... route, per
 * next-intl's documented App Router pattern). Sets `lang`/`dir` from
 * the locale segment so RTL/LTR is correct on first paint with no
 * client-side flash, wraps children in NextIntlClientProvider so
 * useTranslations works in Client Components, and renders the
 * site-wide Organization/WebSite JSON-LD once here rather than
 * per-page.
 */
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  // Same fix as generateMetadata above, and for the same reason: must
  // run before any other next-intl server API call in this component.
  setRequestLocale(locale);

  const messages = await getMessages();
  const dir = localeDir[locale as AppLocale];
  const t = await getTranslations({ locale, namespace: "common" });

  // Production auth-recovery fix (2026-07-29): the header previously
  // never reflected auth state at all (SiteNavbar always rendered
  // "Log in"/"Register", even for a signed-in user, because nothing
  // ever told it who was signed in). Resolving the session here, in
  // the one layout every route under it shares, and passing a plain
  // boolean down is the only way to guarantee the header is correct
  // on first paint for every route, including a hard refresh and
  // direct navigation, not just on client-side navigations. This does
  // mean every route under this layout now reads cookies and can no
  // longer be fully static-prerendered (the same tradeoff the account
  // page already accepts) -- a correct header is worth that cost.
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${inter.variable} ${spaceGrotesk.variable} ${tajawal.variable} ${cairo.variable}`}
    >
      <body>
        <NextIntlClientProvider messages={messages}>
          <BrandProvider brand="cyberabeer">
            <MotionProvider locale={locale as AppLocale}>
            <TooltipProvider>
              <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:[inset-inline-start:1rem] focus:z-toast focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-text-on-primary"
              >
                {t("skipToContent")}
              </a>
              <SiteNavbar locale={locale as AppLocale} isAuthenticated={Boolean(user)} />
              <main id="main-content">
                <PageTransition>{children}</PageTransition>
              </main>
              <SiteFooter locale={locale as AppLocale} />
              <Toaster />
            </TooltipProvider>
            </MotionProvider>
          </BrandProvider>
        </NextIntlClientProvider>
        <JsonLd data={[organizationSchema(), websiteSchema(locale as AppLocale)]} />
        <AnalyticsScript />
        <RoutePageView />
      </body>
    </html>
  );
}
