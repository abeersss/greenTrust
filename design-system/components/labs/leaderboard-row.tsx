import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LevelBadge } from "./level-badge";
import { cn } from "@/lib/utils";

export interface LeaderboardRowProps {
  rank: number;
  name: string;
  avatarUrl?: string;
  level: number;
  xp: number;
  isCurrentUser?: boolean;
}

const medalColor: Record<1 | 2 | 3, string> = {
  1: "text-xp",
  2: "text-neutral-400",
  3: "text-accent-600",
};

export function LeaderboardRow({ rank, name, avatarUrl, level, xp, isCurrentUser }: LeaderboardRowProps) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2.5",
        isCurrentUser && "bg-primary-50 ring-1 ring-primary-100"
      )}
    >
      <span
        className={cn(
          "w-6 text-center font-display text-sm font-bold",
          rank <= 3 ? medalColor[rank as 1 | 2 | 3] : "text-text-muted"
        )}
      >
        {rank}
      </span>
      <Avatar className="h-8 w-8">
        <AvatarImage src={avatarUrl} alt="" />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <span className="flex-1 truncate text-sm font-medium text-text-primary">
        {name}
        {isCurrentUser && <span className="ms-1.5 text-xs font-normal text-primary">(you)</span>}
      </span>
      <LevelBadge level={level} size="sm" />
      <span className="w-20 text-end text-sm font-semibold text-text-secondary">{xp.toLocaleString()} XP</span>
    </div>
  );
}
