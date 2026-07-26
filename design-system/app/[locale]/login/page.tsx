import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { LoginForm } from "@/components/forms/login-form";
import { buildMetadata } from "@/lib/seo/metadata";
import { isAppLocale, type AppLocale } from "@/lib/i18n/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  const t = await getTranslations({ locale, namespace: "seo" });
  // Auth pages are excluded from search indexing: they carry no
  // unique public content and shouldn't compete with the marketing
  // pages for the same queries.
  return buildMetadata({ locale, path: "login", title: t("loginTitle"), description: t("loginTitle"), noIndex: true });
}

export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  const l = locale as AppLocale;

  const t = await getTranslations({ locale, namespace: "auth.login" });

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md items-center px-4 py-12 tablet:px-6">
      {/* Visually hidden h1: keeps the heading hierarchy starting at h1
          for screen reader and outline navigation, while the visible
          Card title (an h3, by design) stays the on-screen heading. */}
      <h1 className="sr-only">{t("title")}</h1>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("subtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm locale={l} />
        </CardContent>
      </Card>
    </div>
  );
}
