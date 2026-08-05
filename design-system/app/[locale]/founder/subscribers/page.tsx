import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isAppLocale, type AppLocale } from "@/lib/i18n/config";
import { requireFounder } from "@/lib/auth/founder";
import { getSubscribersForFounder } from "@/lib/founder/subscribers-admin";
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

const SEGMENT_LABELS: Record<string, string> = {
  enterprise_ai_governance: "Enterprise / AI governance",
  quantum: "Post-quantum",
  students: "Students",
  certification: "Certification",
};

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Founder Subscribers admin (CyberAbeer Platform Phase II, Batch 2).
 * Read-only list of real newsletter_subscribers rows -- sending is a
 * separate, not-yet-built piece (the Newsletter sidebar entry), this
 * page only answers "who has actually subscribed, and to what."
 */
export default async function FounderSubscribersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  const l = locale as AppLocale;

  await requireFounder(l);

  const subscribers = await getSubscribersForFounder();
  const activeCount = subscribers.filter((s) => s.status === "subscribed").length;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-text-primary tablet:text-3xl">Subscribers</h1>
      <p className="mt-1 text-sm text-text-muted">
        Real newsletter signups from the site footer, by segment and status.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 tablet:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-text-muted">Active subscribers</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="font-display text-3xl font-bold text-primary">{activeCount}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-text-muted">Total signups</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="font-display text-3xl font-bold text-primary">{subscribers.length}</span>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardContent className="p-0">
          {subscribers.length === 0 ? (
            <p className="p-6 text-sm text-text-muted">No subscribers yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Segment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Locale</TableHead>
                  <TableHead>Subscribed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscribers.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium text-text-primary">{s.email}</TableCell>
                    <TableCell className="text-text-muted">{SEGMENT_LABELS[s.segment] ?? s.segment}</TableCell>
                    <TableCell>
                      <Badge variant={s.status === "subscribed" ? "success" : "neutral"}>{s.status}</Badge>
                    </TableCell>
                    <TableCell className="text-text-muted uppercase">{s.locale ?? "—"}</TableCell>
                    <TableCell className="text-text-muted">{formatDate(s.subscribedAt)}</TableCell>
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
