"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export interface ScoreTrendPoint {
  date: string; // pre-formatted label
  score: number;
}

export interface ScoreTrendChartProps {
  data: ScoreTrendPoint[];
  height?: number;
  ariaLabel: string;
}

/**
 * ScoreTrendChart — renders greentrust_scores / quantum_readiness_scores
 * history (Phase 3: both are append-only time series, so this is a
 * direct plot of that table). Colors are read from CSS variables at
 * render time so the same chart re-themes for brand + dark mode
 * without a re-render triggered by JS — Recharts accepts a CSS
 * `var(--...)` string directly as a stroke/fill color.
 *
 * Accessibility note: Recharts renders to SVG with no default text
 * alternative, so this wrapper requires `ariaLabel` and forwards it to
 * a wrapping `role="img"` div — screen reader users get the summary,
 * sighted keyboard users can tab past it since it carries no
 * interactive semantics of its own (no per-point tooltip access via
 * keyboard yet; see design-system doc's "future accessibility work"
 * note for reaching full WCAG parity on data visualization).
 */
export function ScoreTrendChart({ data, height = 240, ariaLabel }: ScoreTrendChartProps) {
  return (
    <div role="img" aria-label={ariaLabel} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="scoreTrendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.25} />
              <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="date"
            stroke="var(--color-text-muted)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="var(--color-text-muted)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            width={32}
            domain={[0, 100]}
          />
          <Tooltip
            contentStyle={{
              background: "var(--color-surface-raised)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              color: "var(--color-text-primary)",
              fontSize: 12,
            }}
          />
          <Area
            type="monotone"
            dataKey="score"
            stroke="var(--color-primary)"
            strokeWidth={2}
            fill="url(#scoreTrendFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
