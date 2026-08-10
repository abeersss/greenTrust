import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isAppLocale, type AppLocale } from "@/lib/i18n/config";
import { requireFounder } from "@/lib/auth/founder";
import { getAnalyticsOverview } from "@/lib/founder/analytics-admin";
import { Card, CardContent } from "@/components/ui/card";
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

/**
 * Founder Analytics Dashboard (Phase II, Batch 3). No third-party
 * traffic API is wired up (Plausible is client-side only, no paid
 * plan), so this page does not show visit/session counts. Instead it
 * surfaces real, live platform-engagement numbers already in
 * Supabase -- account growth, content reach, Labs/CTF play activity,
 * and Free Tools/lead capture -- pulled fresh on every load, same as
 * the SEO and Media Library dashboards.
 */
export default async function FounderAnalyticsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  const l = locale as AppLocale;

  await requireFounder(l);

  const overview = await getAnalyticsOverview();
  const { growth, content, labs, tools } = overview;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-text-primary tablet:text-3xl">
        Analytics Dashboard
      </h1>
      <p className="mt-1 text-sm text-text-muted">
        Live platform-engagement data: account growth, content reach, Labs/CTF play activity, and Free
        Tools/lead capture. No traffic-analytics API is configured for this project, so visit and session
        counts are intentionally not shown here.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 tablet:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-text-muted">Registered users</p>
            <p className="mt-1 text-2xl font-bold text-text-primary">{growth.totalUsers}</p>
            <p className="mt-1 text-xs text-text-muted">
              +{growth.newUsers7d} last 7d / +{growth.newUsers30d} last 30d
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-text-muted">Published articles</p>
            <p className="mt-1 text-2xl font-bold text-text-primary">{content.publishedArticles}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-text-muted">Newsletter subscribers</p>
            <p className="mt-1 text-2xl font-bold text-text-primary">{content.totalSubscribers}</p>
            <p className="mt-1 text-xs text-text-muted">+{content.newSubscribers30d} last 30d</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-text-muted">Free Tools submissions</p>
            <p className="mt-1 text-2xl font-bold text-text-primary">{tools.totalSubmissions}</p>
            <p className="mt-1 text-xs text-text-muted">{tools.totalLeads} leads captured</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 tablet:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-text-muted">Labs/CTF attempts</p>
            <p className="mt-1 text-2xl font-bold text-text-primary">{labs.totalAttempts}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-text-muted">Labs/CTF completions</p>
            <p className="mt-1 text-2xl font-bold text-text-primary">{labs.totalCompletions}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-text-muted">Completion rate</p>
            <p className="mt-1 text-2xl font-bold text-text-primary">
              {labs.completionRate === null ? "--" : labs.completionRate + "%"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-text-muted">Unique players</p>
            <p className="mt-1 text-2xl font-bold text-text-primary">{labs.uniquePlayers}</p>
          </CardContent>
        </Card>
      </div>

      <h2 className="mt-8 font-display text-lg font-bold text-text-primary">Labs &amp; CTF engagement</h2>
      <p className="mt-1 text-sm text-text-muted">
        Attempt and completion counts per challenge, most-attempted first.
      </p>
      <Card className="mt-3">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Challenge</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Attempts</TableHead>
                <TableHead>Completions</TableHead>
                <TableHead>Completion rate</TableHead>
                <TableHead>Avg. score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {labs.topChallenges.map((row) => (
                <TableRow key={row.key}>
                  <TableCell className="font-medium text-text-primary">{row.displayName}</TableCell>
                  <TableCell>{row.challengeType}</TableCell>
                  <TableCell>{row.attempts}</TableCell>
                  <TableCell>{row.completions}</TableCell>
                  <TableCell>
                    {row.completionRate === null ? "--" : row.completionRate + "%"}
                  </TableCell>
                  <TableCell>{row.averageScore === null ? "--" : row.averageScore}</TableCell>
                </TableRow>
              ))}
              {labs.topChallenges.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-text-muted">
                    No challenge data yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <h2 className="mt-8 font-display text-lg font-bold text-text-primary">Free Tools usage</h2>
      <p className="mt-1 text-sm text-text-muted">Submissions per tool.</p>
      <Card className="mt-3">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tool</TableHead>
                <TableHead>Submissions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tools.byTool.map((row) => (
                <TableRow key={row.toolKey}>
                  <TableCell className="font-medium text-text-primary">{row.toolKey}</TableCell>
                  <TableCell>{row.submissions}</TableCell>
                </TableRow>
              ))}
              {tools.byTool.length === 0 && (
                <TableRow>
                  <TableCell colSpan={2} className="text-center text-text-muted">
                    No tool submissions yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <h2 className="mt-8 font-display text-lg font-bold text-text-primary">Newsletter subscribers by status</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {content.subscribersByStatus.map((row) => (
          <Badge key={row.status} variant={row.status === "active" ? "success" : "danger"}>
            {row.status}: {row.count}
          </Badge>
        ))}
        {content.subscribersByStatus.length === 0 && (
          <p className="text-sm text-text-muted">No subscriber data yet.</p>
        )}
      </div>
    </div>
  );
}
