import * as React from "react";
import { riskLevelClasses } from "@/lib/utils";
import { cn } from "@/lib/utils";

export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface RiskIndicatorProps extends React.HTMLAttributes<HTMLSpanElement> {
  level: RiskLevel;
  /** Show the word ("High") or just the dot — tables with a dedicated
   * "Risk" column usually want the label; dense dashboards may want
   * dot-only with the label as a tooltip instead. */
  labelText?: string;
  showLabel?: boolean;
}

const defaultLabel: Record<RiskLevel, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

/**
 * RiskIndicator — the one place the low/medium/high/critical scale
 * used across risk_assessments, quantum_risk_assessments, and
 * hndl_assessments (Phase 3 schema) gets rendered. `critical` is the
 * only level that inverts to a solid fill rather than a tint — it
 * should visually read as more severe than a same-shaped "high" chip,
 * not just a different color of the same shape.
 */
export function RiskIndicator({ level, labelText, showLabel = true, className, ...props }: RiskIndicatorProps) {
  const c = riskLevelClasses[level];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        c.bg,
        c.text,
        className
      )}
      {...props}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", c.dot)} aria-hidden="true" />
      {showLabel && (labelText ?? defaultLabel[level])}
      <span className="sr-only">risk level</span>
    </span>
  );
}
