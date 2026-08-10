import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isAppLocale, type AppLocale } from "@/lib/i18n/config";
import { requireFounder } from "@/lib/auth/founder";
import { getToolsOverviewForFounder } from "@/lib/founder/tools-admin";
import { Card, CardContent } from "@/components/ui/card";
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
 * Founder Organization Tools + Free Tools admin (Phase II, Batch 4).
 * Every self-serve assessment (Free Tools hub, plus the free web
 * versions of the Cybersecurity Posture and ISO/IEC 27001 Gap
 * assessments) writes one row to tool_submissions, so this page lists
 * them live: a per-tool summary and the most recent 200 individual
 * submissions. The Excel-based downloadable tools (Risk Register, SoA
 * Tracker, Incident Response Log, Aegis GRC bundle) are static file
 * downloads with no server round-trip, so they have no submission
 * data -- that is stated rather than showing a fabricated number.
 */
export default async function FounderToolsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  const l = locale as AppLocale;

  await requireFounder(l);

  const overview = await getToolsOverviewForFounder();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-text-primary tablet:text-3xl">
        Organization Tools &amp; Free Tools
      </h1>
      <p className="mt-1 text-sm text-text-muted">
        Live self-serve assessment submissions from the Free Tools hub and the free web versions of the
        Organization Tools assessments. The four Excel-based downloadable tools (Risk Register, SoA Tracker,
        Incident Response Log, Aegis GRC bundle) are static file downloads with no server round-trip, so they
        have no submission data to show.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 tablet:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-text-muted">Total submissions</p>
            <p className="mt-1 text-2xl font-bold text-text-primary">{overview.totalSubmissions}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-text-muted">Distinct tools used</p>
            <p className="mt-1 text-2xl font-bold text-text-primary">{overview.summary.length}</p>
          </CardContent>
        </Card>
      </div>

      <h2 className="mt-8 font-display text-lg font-bold text-text-primary">Submissions by tool</h2>
      <Card className="mt-3">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tool</TableHead>
                <TableHead>Submissions</TableHead>
                <TableHead>Avg. score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {overview.summary.map((row) => (
                <TableRow key={row.toolKey}>
                  <TableCell className="font-medium text-text-primary">{row.toolLabel}</TableCell>
                  <TableCell>{row.submissions}</TableCell>
                  <TableCell>{row.averageScore === null ? "--" : row.averageScore}</TableCell>
                </TableRow>
              ))}
              {overview.summary.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-text-muted">
                    No tool submissions yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <h2 className="mt-8 font-display text-lg font-bold text-text-primary">Recent submissions</h2>
      <p className="mt-1 text-sm text-text-muted">Most recent 200 submissions, newest first.</p>
      <Card className="mt-3">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tool</TableHead>
                <TableHead>Locale</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Submitted</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {overview.submissions.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium text-text-primary">{row.toolLabel}</TableCell>
                  <TableCell>{row.locale ?? "--"}</TableCell>
                  <TableCell>{row.score === null ? "--" : row.score}</TableCell>
                  <TableCell>
                    {row.submittedAt ? new Date(row.submittedAt).toLocaleString("en-US") : "--"}
                  </TableCell>
                </TableRow>
              ))}
              {overview.submissions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-text-muted">
                    No tool submissions yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
