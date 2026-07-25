import * as React from "react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export interface XPBarProps {
  currentXP: number;
  levelFloorXP: number;
  nextLevelXP: number;
  levelNumber: number;
  className?: string;
}

/**
 * XPBar — reads from the same append-only xp_events ledger as the
 * rest of the gamification engine (Phase 3), but only ever receives
 * already-computed totals as props; it does no XP math of its own.
 * Uses the `tone="xp"` gold accent regardless of active brand, since
 * XP is a Labs-only concept even if this bar is ever shown inside a
 * cross-sell widget on a non-Labs page.
 */
export function XPBar({ currentXP, levelFloorXP, nextLevelXP, levelNumber, className }: XPBarProps) {
  const span = Math.max(1, nextLevelXP - levelFloorXP);
  const progressed = Math.max(0, currentXP - levelFloorXP);
  const percent = Math.min(100, (progressed / span) * 100);

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="font-display font-semibold text-text-primary">Level {levelNumber}</span>
        <span className="text-text-muted">
          {currentXP.toLocaleString()} / {nextLevelXP.toLocaleString()} XP
        </span>
      </div>
      <Progress value={percent} tone="xp" aria-label={`Level ${levelNumber} progress`} />
    </div>
  );
}
