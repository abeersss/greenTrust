import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isAppLocale, type AppLocale } from "@/lib/i18n/config";
import { requireFounder } from "@/lib/auth/founder";
import { getHomepageBannerForFounder } from "@/lib/actions/founder-banner";
import { BannerSettingsForm } from "@/components/founder/banner-settings-form";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * Founder admin for the homepage scrolling banner (CyberAbeer
 * Platform Phase II). Controls the on/off flag and bilingual greeting
 * stored in homepage_banner_settings (migration 013); the current
 * date is always appended automatically on the public side, never
 * editable here.
 */
export default async function FounderBannerPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  const l = locale as AppLocale;

  await requireFounder(l);

  const initial = await getHomepageBannerForFounder(l);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-text-primary tablet:text-3xl">Homepage banner</h1>
      <p className="mt-1 text-sm text-text-muted">
        A scrolling banner shown at the top of the homepage. It always shows the current date, in the
        visitor&apos;s language -- you control whether it&apos;s on and what the greeting says.
      </p>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <BannerSettingsForm locale={l} initial={initial} />
        </CardContent>
      </Card>
    </div>
  );
}
