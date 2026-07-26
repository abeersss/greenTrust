"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FirstDefenderStep } from "@/lib/challenges/first-defender";

export interface ChallengeFeedbackPanelProps {
  step: FirstDefenderStep;
  /** "phished" only applies when the visitor chose the risky "click" action. */
  outcome: "correct" | "incorrect" | "phished";
  onContinue: () => void;
  className?: string;
}

/**
 * Shown after every step's decision, before the visitor can move on.
 * "phished" gets its own tone and copy (a safe, simulated consequence,
 * never alarming or shaming) rather than being folded into a generic
 * "incorrect", since teaching what the risky choice would have cost is
 * central to why this is a scenario and not a plain quiz.
 */
export function ChallengeFeedbackPanel({ step, outcome, onContinue, className }: ChallengeFeedbackPanelProps) {
  const t = useTranslations("challenge.firstDefender");
  const tStep = useTranslations(`challenge.firstDefender.steps.${step.id}`);

  const Icon = outcome === "correct" ? CheckCircle2 : outcome === "phished" ? ShieldAlert : XCircle;
  const tone =
    outcome === "correct"
      ? "border-success-50 bg-success-50 text-success-600"
      : outcome === "phished"
        ? "border-danger-50 bg-danger-50 text-danger-600"
        : "border-warning-50 bg-warning-50 text-warning-600";

  const headline =
    outcome === "correct" ? t("correctLabel") : outcome === "phished" ? t("phishedLabel") : t("incorrectLabel");
  const feedbackBody =
    outcome === "correct"
      ? tStep("feedbackCorrect")
      : outcome === "phished"
        ? tStep("feedbackPhished")
        : tStep("feedbackIncorrect");

  return (
    <Card className={className}>
      <CardContent className="space-y-4 pt-6">
        <div className={cn("flex items-start gap-3 rounded-md border px-4 py-3", tone)}>
          <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-display font-semibold">{headline}</p>
            <p className="mt-1 text-sm">{feedbackBody}</p>
          </div>
        </div>
        <p className="text-sm text-text-secondary">{tStep("explanation")}</p>
        <Button className="w-full" onClick={onContinue}>
          {t("continueCta")}
        </Button>
      </CardContent>
    </Card>
  );
}
