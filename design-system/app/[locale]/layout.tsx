import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Inter, Space_Grotesk } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import "@/styles/globals.css";
import { BrandProvider } from "@/components/shared/brand-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { SiteNavbar } from "@/components/site/site-navbar";
import { SiteFooter } from "@/components/site/site-footer";
import { JsonLd } from "@/components/site/json-ld";
import { AnalyticsScript } from "@/components/site/analytics-script";
import { organizationSchema, websiteSchema } from "@/lib/seo/schema";
import { buildMetadata } from "@/lib/seo/metadata";
import { isAppLocale, localeDir, type AppLocale } from "@/lib/i18n/config";
import { getTranslations } from "next-intl/server";

const inter = Inter({ subsets: ["latin"], variable: "--font-latin-body", display: "swap" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-labs-display", display: "swap" });

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

  const messages = await getMessages();
  const dir = localeDir[locale as AppLocale];
  const t = await getTranslations({ locale, namespace: "common" });

  return (
    <html lang={locale} dir={dir} className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <BrandProvider brand="cyberabeer">
            <TooltipProvider>
              <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:[inset-inline-start:1rem] focus:z-toast focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-text-on-primary"
              >
                {t("skipToContent")}
              </a>
              <SiteNavbar locale={locale as AppLocale} />
              <main id="main-content">{children}</main>
              <SiteFooter locale={locale as AppLocale} />
              <Toaster />
            </TooltipProvider>
          </BrandProvider>
        </NextIntlClientProvider>
        <JsonLd data={[organizationSchema(), websiteSchema(locale as AppLocale)]} />
        <AnalyticsScript />
      </body>
    </html>
  );
}
