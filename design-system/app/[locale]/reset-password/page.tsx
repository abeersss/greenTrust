import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ResetPasswordForm } from "@/components/forms/reset-password-form";
import { buildMetadata } from "@/lib/seo/metadata";
import { createSupabaseServerClient } from "@/lib/supabase/server";
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
 * Landing point for the Supabase password-recovery email link. The
 * link carries a one-time `code` query param (PKCE recovery flow);
 * exchanging it here, in a Server Component, establishes a short-lived
 * recovery session via the auth cookie before the password form
 * renders, so `updatePassword` (lib/actions/auth.ts) has an
 * authenticated user to act on. An invalid or already-used code simply
 * fails the exchange silently here; `updatePassword` then reports the
 * clear "link expired" error itself rather than this page guessing.
 */
export default async function ResetPasswordPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ code?: string }>;
}) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  const l = locale as AppLocale;

  const { code } = await searchParams;
  if (code) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

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
