import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isAppLocale, type AppLocale } from "@/lib/i18n/config";
import { requireFounder } from "@/lib/auth/founder";
import { getAllLabsForFounder } from "@/lib/founder/labs-admin";
import { setChallengeStatus } from "@/lib/actions/founder-labs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

const STATUS_VARIANT: Record<string, "success" | "warning" | "neutral" | "danger"> = {
  published: "success",
  in_review: "warning",
  draft: "neutral",
  archived: "danger",
};

const TYPE_LABEL: Record<string, string> = {
  decision_lab: "Decision Lab",
  ctf: "CTF",
};

function formatDate(value: string | null): string {
  if (!value) return "--";
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatPercent(value: number | null): string {
  if (value === null) return "--";
  return Math.round(value) + "%";
}

function formatScore(value: number | null): string {
  if (value === null) return "--";
  return Math.round(value) + "%";
}

/**
 * Founder Labs admin (CyberAbeer Platform Phase II, Batch 1 remainder).
 * One combined table across every Decision Lab and CTF challenge --
 * deliberately not split into two Card sections, since founders care
 * about play data (attempts, completion, score) across the whole
 * catalog at once, and a Type column already distinguishes the two.
 * Publish/Unpublish/Archive mirror the Content admin's status
 * actions exactly, via setChallengeStatus.
 */
export default async function FounderLabsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  const l = locale as AppLocale;

  await requireFounder(l);

  const labs = await getAllLabsForFounder();

  const totals = {
    count: labs.length,
    published: labs.filter((lab) => lab.status === "published").length,
    attempts: labs.reduce((sum, lab) => sum + lab.attemptCount, 0),
    completions: labs.reduce((sum, lab) => sum + lab.completedCount, 0),
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-text-primary">Labs</h1>
      <p className="mt-1 text-sm text-text-muted">
        Every Decision Lab and CTF challenge, with live play data and publish controls.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-text-muted">Total labs</p>
            <p className="mt-1 text-2xl font-semibold text-text-primary">{totals.count}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-text-muted">Published</p>
            <p className="mt-1 text-2xl font-semibold text-text-primary">{totals.published}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-text-muted">Total attempts</p>
            <p className="mt-1 text-2xl font-semibold text-text-primary">{totals.attempts}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-text-muted">Total completions</p>
            <p className="mt-1 text-2xl font-semibold text-text-primary">{totals.completions}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lab</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Attempts</TableHead>
                  <TableHead>Completed</TableHead>
                  <TableHead>Avg score</TableHead>
                  <TableHead>Players</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {labs.map((lab) => {
                  // Same wrapper pattern as the Content admin: a <form
                  // action> needs (formData: FormData) => void | Promise<void>,
                  // while setChallengeStatus resolves to Promise<ActionResult>.
                  // These thin async wrappers discard that return value so the
                  // form action's inferred type checks.
                  const challengeId = lab.id;
                  async function publish() {
                    "use server";
                    await setChallengeStatus(l, challengeId, "published");
                  }
                  async function unpublish() {
                    "use server";
                    await setChallengeStatus(l, challengeId, "draft");
                  }
                  async function archive() {
                    "use server";
                    await setChallengeStatus(l, challengeId, "archived");
                  }

                  return (
                    <TableRow key={lab.id}>
                      <TableCell className="font-medium text-text-primary">{lab.displayName}</TableCell>
                      <TableCell className="text-text-muted">
                        {TYPE_LABEL[lab.challengeType] ?? lab.challengeType}
                      </TableCell>
                      <TableCell className="text-text-muted">{lab.difficulty}</TableCell>
                      <TableCell>
                        <Badge variant={STATUS_VARIANT[lab.status] ?? "neutral"}>{lab.status}</Badge>
                      </TableCell>
                      <TableCell className="text-text-muted">{lab.attemptCount}</TableCell>
                      <TableCell className="text-text-muted">
                        {lab.completedCount} ({formatPercent(lab.completionRate)})
                      </TableCell>
                      <TableCell className="text-text-muted">{formatScore(lab.averageScore)}</TableCell>
                      <TableCell className="text-text-muted">{lab.uniqueUserCount}</TableCell>
                      <TableCell className="text-text-muted">{formatDate(lab.updatedAt)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {lab.status !== "published" && (
                            <form action={publish}>
                              <Button type="submit" size="sm" variant="primary">
                                Publish
                              </Button>
                            </form>
                          )}
                          {lab.status === "published" && (
                            <form action={unpublish}>
                              <Button type="submit" size="sm" variant="outline">
                                Unpublish
                              </Button>
                            </form>
                          )}
                          {lab.status !== "archived" && (
                            <form action={archive}>
                              <Button type="submit" size="sm" variant="outline">
                                Archive
                              </Button>
                            </form>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
