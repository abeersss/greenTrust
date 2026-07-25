import * as React from "react";
import { Progress } from "@/components/ui/progress";

export interface AssessmentProgressProps {
  currentStep: number;
  totalSteps: number;
  /** e.g. "Question 3 of 8" pre-localized by the caller (next-intl) */
  label: string;
}

/**
 * AssessmentProgress — shared by the GreenTrust Quick Assessment, the
 * Quantum Readiness Assessment, and the Labs Skill Assessment (Phase 1
 * free-tools list). One component so all three feel like the same
 * "genuine value before the ask" experience regardless of brand.
 */
export function AssessmentProgress({ currentStep, totalSteps, label }: AssessmentProgressProps) {
  const percent = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-xs text-text-muted">
        <span>{label}</span>
        <span>{Math.round(percent)}%</span>
      </div>
      <Progress value={percent} tone="brand" aria-label={label} />
    </div>
  );
}
