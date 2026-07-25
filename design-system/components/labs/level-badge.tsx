import * as React from "react";
import { cn } from "@/lib/utils";

export interface LevelBadgeProps {
  level: number;
  size?: "sm" | "md";
  className?: string;
}

/**
 * LevelBadge — compact numeric badge shown next to a learner's name
 * (leaderboard rows, profile header, comment attribution). Uses a
 * solid primary fill rather than the tinted Badge component: this is
 * an identity marker a learner earns, not a passive category label,
 * so it should read with more visual weight.
 */
export function LevelBadge({ level, size = "md", className }: LevelBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-primary font-display font-bold text-text-on-primary",
        size === "sm" ? "h-6 w-6 text-xs" : "h-8 w-8 text-sm",
        className
      )}
      title={`Level ${level}`}
      aria-label={`Level ${level}`}
    >
      {level}
    </span>
  );
}
