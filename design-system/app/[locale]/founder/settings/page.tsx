import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isAppLocale, type AppLocale } from "@/lib/i18n/config";
import { requireFounder } from "@/lib/auth/founder";
import { getFounderSettingsOverview } from "@/lib/founder/settings-admin";
import { FounderSettingsForm } from "@/components/founder/founder-settings-form";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * Founder Settings (Phase II, Batch 4). Scoped to what genuinely
 * exists: the founder's own account info and display name (used on
 * certificates and badge shares), plus a live read of which optional
 * integrations are actually configured. The homepage banner already
 * has its own dedicated page (/founder/banner) and isn't duplicated
 * here.
 */
export default async function FounderSettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  const l = locale as AppLocale;

  const { userId } = await requireFounder(l);
  const overview = await getFounderSettingsOverview(userId);
  const { account, integrations } = overview;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-text-primary tablet:text-3xl">Settings</h1>
      <p className="mt-1 text-sm text-text-muted">
        Your founder account and the optional integrations configured for this environment.
      </p>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 tablet:grid-cols-3">
          <div>
            <p className="text-xs text-text-muted">Email</p>
            <p className="mt-1 text-sm font-medium text-text-primary">{account.email ?? "--"}</p>
          </div>
          <div>
            <p className="text-xs text-text-muted">Role</p>
            <p className="mt-1 text-sm font-medium text-text-primary">Founder / Admin</p>
          </div>
          <div>
            <p className="text-xs text-text-muted">Member since</p>
            <p className="mt-1 text-sm font-medium text-text-primary">
              {account.memberSince ? new Date(account.memberSince).toLocaleDateString("en-US") : "--"}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Display name</CardTitle>
        </CardHeader>
        <CardContent>
          <FounderSettingsForm locale={l} initialFullName={account.fullName ?? ""} />
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Integrations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {integrations.map((row) => (
            <div key={row.name} className="flex items-start justify-between gap-4 border-b border-border pb-4 last:border-0 last:pb-0">
              <div>
                <p className="text-sm font-medium text-text-primary">{row.name}</p>
                <p className="mt-1 text-xs text-text-muted">{row.detail}</p>
              </div>
              <Badge variant={row.configured ? "success" : "danger"}>
                {row.configured ? "Configured" : "Not configured"}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
