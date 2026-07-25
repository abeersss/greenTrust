import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RiskIndicator, type RiskLevel } from "@/components/ui/risk-indicator";
import { Progress } from "@/components/ui/progress";

export interface RiskFactorScore {
  name: string;
  score: number; // 0-100, already weighted
}

export interface RiskAssessmentCardProps {
  agentName: string;
  overallScore: number;
  overallLevel: RiskLevel;
  assessedAt: string;
  factors: RiskFactorScore[];
  status: "draft" | "final";
}

/**
 * RiskAssessmentCard — summarizes one risk_assessments row (Phase 3)
 * plus its risk_assessment_factors line items. A "draft" badge is
 * shown prominently because a draft assessment must never be mistaken
 * for the finalized, audit-relevant version.
 */
export function RiskAssessmentCard({
  agentName,
  overallScore,
  overallLevel,
  assessedAt,
  factors,
  status,
}: RiskAssessmentCardProps) {
  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle>{agentName}</CardTitle>
          <CardDescription>Assessed {assessedAt}</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          {status === "draft" && (
            <span className="rounded-full bg-warning-50 px-2.5 py-0.5 text-xs font-semibold text-warning-600">
              Draft
            </span>
          )}
          <RiskIndicator level={overallLevel} labelText={`${overallLevel} (${Math.round(overallScore)})`} />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {factors.map((factor) => (
          <div key={factor.name} className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">{factor.name}</span>
              <span className="font-medium text-text-primary">{Math.round(factor.score)}</span>
            </div>
            <Progress
              value={factor.score}
              tone={factor.score >= 70 ? "danger" : factor.score >= 40 ? "brand" : "success"}
              aria-label={factor.name}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
