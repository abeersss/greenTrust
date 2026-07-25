import * as React from "react";
import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StreakIndicatorProps {
  days: number;
  /** true when today's activity is still pending — dims the flame so
   * it reads as "at risk" rather than "achieved today". */
  atRisk?: boolean;
  className?: string;
}

export function StreakIndicator({ days, atRisk, className }: StreakIndicatorProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-1 text-sm font-semibold",
        atRisk ? "text-text-muted" : "text-streak",
        className
      )}
      title={atRisk ? `${days}-day streak — complete a challenge today to keep it` : `${days}-day streak`}
    >
      <Flame className={cn("h-4 w-4", atRisk ? "opacity-50" : "fill-streak")} aria-hidden="true" />
      {days}
      <span className="sr-only">day streak{atRisk ? ", at risk" : ""}</span>
    </span>
  );
}
