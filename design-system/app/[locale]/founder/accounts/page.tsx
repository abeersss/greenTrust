import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isAppLocale, type AppLocale } from "@/lib/i18n/config";
import { requireFounder } from "@/lib/auth/founder";
import { getAccountsForFounder } from "@/lib/founder/accounts-admin";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

function formatDateTime(value: string | null): string {
  if (!value) return "Never";
  return new Date(value).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Founder Accounts admin (CyberAbeer Platform Phase II). Every
 * account that has ever registered on the site, most recent first --
 * this answers "who has actually signed up," which is a different
 * question (and a different data source, Supabase Auth) from
 * Subscribers (newsletter opt-ins, a separate table entirely).
 */
export default async function FounderAccountsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  const l = locale as AppLocale;

  await requireFounder(l);

  const accounts = await getAccountsForFounder();
  const now = Date.now();
  const newAccounts = accounts.filter(
    (a) => now - new Date(a.createdAt).getTime() <= SEVEN_DAYS_MS
  ).length;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-text-primary tablet:text-3xl">Accounts</h1>
      <p className="mt-1 text-sm text-text-muted">
        Everyone who has registered on the site, most recent first.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 tablet:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-text-muted">Total accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="font-display text-3xl font-bold text-primary">{accounts.length}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-text-muted">New accounts (last 7 days)</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="font-display text-3xl font-bold text-primary">{newAccounts}</span>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardContent className="p-0">
          {accounts.length === 0 ? (
            <p className="p-6 text-sm text-text-muted">No accounts yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Locale</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Last login</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium text-text-primary">{a.email}</TableCell>
                    <TableCell className="text-text-muted">{a.fullName ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant={a.platformRole === "admin" ? "primary" : "neutral"}>
                        {a.platformRole ?? "member"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-text-muted uppercase">{a.locale ?? "—"}</TableCell>
                    <TableCell className="text-text-muted">{formatDateTime(a.createdAt)}</TableCell>
                    <TableCell className="text-text-muted">{formatDateTime(a.lastSignInAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
