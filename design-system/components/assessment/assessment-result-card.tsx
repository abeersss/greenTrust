"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { ScoreGauge } from "@/components/greentrust/score-gauge";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

export interface AssessmentResultCardProps {
  title: string;
  score: number;
  scoreLabel: string;
  summary: string;
  /** True once the user has entered an email — flips the CTA from
   * "unlock full report" to "download report" per the Phase 1 rule:
   * show real value first, ask for an email only after. */
  emailCaptured: boolean;
  onRequestReport: () => void;
  onDownloadReport?: () => void;
}

/**
 * AssessmentResultCard — the shared result screen for GreenTrust's two
 * free assessments and the Labs skill assessment. The headline score
 * is ALWAYS visible without an email (Phase 1: "genuine value before
 * payment/email ask"); only the full detailed report is gated.
 */
export function AssessmentResultCard({
  title,
  score,
  scoreLabel,
  summary,
  emailCaptured,
  onRequestReport,
  onDownloadReport,
}: AssessmentResultCardProps) {
  return (
    <Card className="mx-auto max-w-md">
      <CardHeader className="items-center text-center">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{summary}</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        <ScoreGauge score={score} label={scoreLabel} size="lg" />
      </CardContent>
      <CardFooter className="flex-col gap-2">
        {emailCaptured ? (
          <Button className="w-full" onClick={onDownloadReport}>
            Download full report
          </Button>
        ) : (
          <Button className="w-full" onClick={onRequestReport}>
            <Mail className="h-4 w-4" aria-hidden="true" />
            Email me the full report
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
