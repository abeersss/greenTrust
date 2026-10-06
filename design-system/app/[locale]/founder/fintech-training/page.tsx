import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isAppLocale, type AppLocale } from "@/lib/i18n/config";
import { requireFounder } from "@/lib/auth/founder";
import { getFintechTrainingProgress } from "@/lib/founder/fintech-training-admin";
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

const DAY_LABELS: Record<string, string> = {
  day1: "Day 1",
  day2: "Day 2",
  day3: "Day 3",
  day4: "Day 4",
  day5: "Day 5",
};

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function FounderFintechTrainingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  const l = locale as AppLocale;

  await requireFounder(l);

  const trainees = await getFintechTrainingProgress();
  const completedAllCount = trainees.filter((t) => t.daysCompletedCount === 5).length;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-text-primary tablet:text-3xl">
        FinTech for Banks Training
      </h1>
      <p className="mt-1 text-sm text-text-muted">
        Trainee progress through the 5-day ISO 20022 and CBPR plus interactive training site.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 tablet:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-text-muted">Trainees started</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="font-display text-3xl font-bold text-primary">{trainees.length}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-text-muted">Completed all 5 days</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="font-display text-3xl font-bold text-primary">{completedAllCount}</span>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardContent className="p-0">
          {trainees.length === 0 ? (
            <p className="p-6 text-sm text-text-muted">
              No trainees yet. Progress appears here once someone completes the simulations for a day on the
              training site.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Trainee</TableHead>
                  <TableHead>Days completed</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Last activity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trainees.map((t) => (
                  <TableRow key={t.traineeName}>
                    <TableCell className="font-medium text-text-primary">{t.traineeName}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {t.daysCompleted.map((d) => (
                          <Badge key={d} variant="success">
                            {DAY_LABELS[d] ?? d}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-text-muted">{t.daysCompletedCount} of 5</TableCell>
                    <TableCell className="text-text-muted">{formatDate(t.lastActivity)}</TableCell>
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
