import * as React from "react";
import { cn } from "@/lib/utils";

export interface ScoreGaugeProps {
  /** 0-100 */
  score: number;
  label: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = { sm: 80, md: 120, lg: 160 } as const;

function bandForScore(score: number): "low" | "medium" | "high" {
  if (score >= 80) return "high";
  if (score >= 50) return "medium";
  return "low";
}

const bandColor: Record<"low" | "medium" | "high", string> = {
  low: "var(--status-danger-500)",
  medium: "var(--status-warning-500)",
  high: "var(--status-success-500)",
};

/**
 * ScoreGauge — the visual for GreenTrust Score and Quantum Readiness
 * Score alike (Phase 3: greentrust_scores / quantum_readiness_scores).
 * Pure SVG, no charting library dependency, so it's cheap to render
 * dozens of times on an executive dashboard. Color band follows score
 * value, not brand — a 92 always reads as "good" whether it's shown
 * on a GreenTrust or Quantum panel.
 */
export function ScoreGauge({ score, label, size = "md", className }: ScoreGaugeProps) {
  const dimension = sizeMap[size];
  const stroke = dimension * 0.09;
  const radius = (dimension - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, score));
  const offset = circumference * (1 - clamped / 100);
  const band = bandForScore(clamped);

  return (
    <div className={cn("inline-flex flex-col items-center gap-2", className)}>
      <div className="relative" style={{ width: dimension, height: dimension }}>
        <svg
          width={dimension}
          height={dimension}
          viewBox={`0 0 ${dimension} ${dimension}`}
          className="-rotate-90"
          role="img"
          aria-label={`${label}: ${clamped} out of 100`}
        >
          <circle
            cx={dimension / 2}
            cy={dimension / 2}
            r={radius}
            fill="none"
            stroke="var(--color-border)"
            strokeWidth={stroke}
          />
          <circle
            cx={dimension / 2}
            cy={dimension / 2}
            r={radius}
            fill="none"
            stroke={bandColor[band]}
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset var(--duration-slow) var(--ease-standard)" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-2xl font-bold text-text-primary">{Math.round(clamped)}</span>
        </div>
      </div>
      <span className="text-sm font-medium text-text-secondary">{label}</span>
    </div>
  );
}
