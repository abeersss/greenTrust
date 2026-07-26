import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ResetPasswordForm } from "@/components/forms/reset-password-form";
import { buildMetadata } from "@/lib/seo/metadata";
import { isAppLocale, type AppLocale } from "@/lib/i18n/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  const t = await getTranslations({ locale, namespace: "auth.resetPassword" });
  return buildMetadata({ locale, path: "reset-password", title: t("title"), description: t("subtitle"), noIndex: true });
}

/**
 * Landing point after the Supabase password-recovery email link.
 * The link itself now points to /auth/confirm (see that route),
 * which exchanges the one-time recovery token for a session - via a
 * writable Route Handler cookie, not a Server Component render - and
 * only then redirects the browser here. By the time this page runs,
 * the recovery session already exists as a cookie, so there is
 * nothing left for this Server Component to exchange; it just renders
 * the form. updatePassword (lib/actions/auth.ts) checks for that
 * session itself and reports a clear "link expired" error if it's
 * missing, e.g. because the link was already used or has timed out.
 */
export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  const l = locale as AppLocale;

  const t = await getTranslations({ locale, namespace: "auth.resetPassword" });

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md items-center px-4 py-12 tablet:px-6">
      <h1 className="sr-only">{t("title")}</h1>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("subtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          <ResetPasswordForm locale={l} />
        </CardContent>
      </Card>
    </div>
  );
}
