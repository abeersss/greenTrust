import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isAppLocale, type AppLocale } from "@/lib/i18n/config";
import { requireFounder } from "@/lib/auth/founder";
import { getSegmentSubscriberCounts, getCampaignsForFounder } from "@/lib/founder/newsletter-admin";
import { NewsletterComposeForm } from "@/components/founder/newsletter-compose-form";
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
  all: "All segments",
  enterprise_ai_governance: "Enterprise / AI governance",
  quantum: "Post-quantum",
  students: "Students",
  certification: "Certification",
  cyber_intelligence_brief: "CyberAbeer Cyber Brief",
};

const STATUS_VARIANT: Record<string, "success" | "warning" | "neutral" | "danger"> = {
  sent: "success",
  sending: "warning",
  draft: "neutral",
  failed: "danger",
};

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Founder Newsletter admin (CyberAbeer Platform Phase II, Batch 2).
 * Lets the founder compose a plain-text update and send it to real
 * newsletter_subscribers rows via the existing Resend module
 * (lib/email/send.ts). Sending requires RESEND_API_KEY to be set in
 * Vercel; without it every send is logged as a campaign but no email
 * actually goes out, and the compose form surfaces that explicitly
 * rather than reporting a false success.
 */
export default async function FounderNewsletterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  const l = locale as AppLocale;

  await requireFounder(l);

  const [subscriberCounts, campaigns] = await Promise.all([
    getSegmentSubscriberCounts(),
    getCampaignsForFounder(),
  ]);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-text-primary tablet:text-3xl">Newsletter</h1>
      <p className="mt-1 text-sm text-text-muted">
        Compose an update and send it to real subscribers. Sending requires RESEND_API_KEY to be set in
        Vercel -- without it, sends are logged but no email actually goes out.
      </p>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Compose</CardTitle>
        </CardHeader>
        <CardContent>
          <NewsletterComposeForm locale={l} subscriberCounts={subscriberCounts} />
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardContent className="p-0">
          {campaigns.length === 0 ? (
            <p className="p-6 text-sm text-text-muted">No campaigns sent yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Audience</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent / Recipients</TableHead>
                  <TableHead>Sent at</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="max-w-xs font-medium text-text-primary">{c.subject}</TableCell>
                    <TableCell className="text-text-muted">{SEGMENT_LABELS[c.segment] ?? c.segment}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[c.status] ?? "neutral"}>{c.status}</Badge>
                    </TableCell>
                    <TableCell className="text-text-muted">
                      {c.sentCount} / {c.recipientCount}
                    </TableCell>
                    <TableCell className="text-text-muted">{formatDate(c.sentAt)}</TableCell>
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
