import * as React from "react";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface ExecutiveCardProps {
  label: string;
  value: string | number;
  /** Percent change vs. the prior period; omit for values with no
   * meaningful trend (e.g. a static count). */
  trend?: { value: number; direction: "up" | "down" | "flat"; goodDirection?: "up" | "down" };
  helpText?: string;
  className?: string;
}

/**
 * ExecutiveCard — the KPI tile used across GreenTrust's executive
 * dashboard (agents governed, open exceptions, GreenTrust Score,
 * quantum readiness). Trend color is relative to which direction is
 * "good" for that specific metric — a rising exception count is bad,
 * a rising GreenTrust Score is good — so callers pass `goodDirection`
 * rather than this component assuming "up is always green."
 */
export function ExecutiveCard({ label, value, trend, helpText, className }: ExecutiveCardProps) {
  const goodDirection = trend?.goodDirection ?? "up";
  const isGood = trend && trend.direction !== "flat" && trend.direction === goodDirection;
  const isBad = trend && trend.direction !== "flat" && trend.direction !== goodDirection;

  return (
    <Card className={cn("p-5", className)}>
      <p className="text-sm font-medium text-text-muted">{label}</p>
      <p className="mt-2 font-display text-3xl font-semibold text-text-primary">{value}</p>
      {trend && (
        <div
          className={cn(
            "mt-2 inline-flex items-center gap-1 text-xs font-semibold",
            isGood && "text-success-600",
            isBad && "text-danger-600",
            !isGood && !isBad && "text-text-muted"
          )}
        >
          {trend.direction === "up" && <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />}
          {trend.direction === "down" && <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />}
          {trend.direction === "flat" && <Minus className="h-3.5 w-3.5" aria-hidden="true" />}
          <span>{Math.abs(trend.value)}%</span>
          <span className="font-normal text-text-muted">vs last period</span>
        </div>
      )}
      {helpText && <p className="mt-1 text-xs text-text-muted">{helpText}</p>}
    </Card>
  );
}
