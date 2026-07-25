import * as React from "react";
import { Award, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface AchievementBadgeProps {
  name: string;
  description: string;
  icon?: React.ReactNode;
  unlocked: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeMap = { sm: "h-12 w-12", md: "h-16 w-16", lg: "h-20 w-20" } as const;

/**
 * AchievementBadge — the visual for the `badges`/`user_badges` tables
 * (Phase 3). Distinct from the generic <Badge> chip component: this is
 * a circular medallion meant to be shown in a grid on a learner's
 * profile, locked ones rendered desaturated with a lock glyph rather
 * than hidden — showing what's still achievable is part of the
 * gamification loop, not just what's already earned.
 */
export function AchievementBadge({ name, description, icon, unlocked, size = "md" }: AchievementBadgeProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex flex-col items-center gap-1.5 text-center" tabIndex={0}>
          <div
            className={cn(
              "flex items-center justify-center rounded-full border-2",
              sizeMap[size],
              unlocked
                ? "border-xp bg-xp/10 text-xp shadow-glow-labs"
                : "border-neutral-200 bg-neutral-100 text-neutral-400"
            )}
          >
            {unlocked ? icon ?? <Award className="h-1/2 w-1/2" aria-hidden="true" /> : <Lock className="h-1/3 w-1/3" aria-hidden="true" />}
          </div>
          <span className={cn("max-w-[5rem] truncate text-xs font-medium", unlocked ? "text-text-primary" : "text-text-muted")}>
            {name}
          </span>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p className="font-medium">{name}</p>
        <p className="text-xs opacity-80">{unlocked ? description : `Locked — ${description}`}</p>
      </TooltipContent>
    </Tooltip>
  );
}
