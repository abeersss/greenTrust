import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ForgotPasswordForm } from "@/components/forms/forgot-password-form";
import { buildMetadata } from "@/lib/seo/metadata";
import { isAppLocale, type AppLocale } from "@/lib/i18n/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  const t = await getTranslations({ locale, namespace: "auth.forgotPassword" });
  // Auth utility pages carry no unique public content and are
  // excluded from search indexing, matching login/register.
  return buildMetadata({ locale, path: "forgot-password", title: t("title"), description: t("subtitle"), noIndex: true });
}

export default async function ForgotPasswordPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  const l = locale as AppLocale;

  const t = await getTranslations({ locale, namespace: "auth.forgotPassword" });

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md items-center px-4 py-12 tablet:px-6">
      <h1 className="sr-only">{t("title")}</h1>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("subtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          <ForgotPasswordForm locale={l} />
        </CardContent>
      </Card>
    </div>
  );
}
