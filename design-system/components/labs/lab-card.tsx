"use client";

import * as React from "react";
import { Terminal, ShieldCheck, Flag } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export interface LabCardProps {
  title: string;
  description: string;
  labType: "scenario" | "quiz" | "flag";
  difficulty: "beginner" | "intermediate" | "advanced";
  xpReward: number;
  progressPercent?: number; // omit for not-yet-started
  onClick?: () => void;
}

const typeIcon = { scenario: ShieldCheck, quiz: Terminal, flag: Flag } as const;
const difficultyVariant = {
  beginner: "success",
  intermediate: "warning",
  advanced: "danger",
} as const;

/**
 * LabCard — the visual anchor of the "energetic, gamified, but
 * professional rather than childish" brief: energy comes from the
 * accent-colored icon chip and the XP reward pill, not from
 * illustration or bright card backgrounds. The card surface itself is
 * as restrained as a GreenTrust card — same border, same shadow scale.
 */
export function LabCard({ title, description, labType, difficulty, xpReward, progressPercent, onClick }: LabCardProps) {
  const Icon = typeIcon[labType];
  return (
    <Card
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={cn(
        "flex flex-col gap-3 p-5 transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring",
        onClick && "cursor-pointer"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent/10 text-accent">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <span className="inline-flex items-center rounded-full bg-xp/10 px-2.5 py-0.5 text-xs font-bold text-xp">
          +{xpReward} XP
        </span>
      </div>
      <div>
        <h3 className="font-display font-semibold text-text-primary">{title}</h3>
        <p className="mt-1 text-sm text-text-muted line-clamp-2">{description}</p>
      </div>
      <div className="flex items-center justify-between">
        <Badge variant={difficultyVariant[difficulty]} className="capitalize">
          {difficulty}
        </Badge>
        <span className="text-xs uppercase tracking-wide text-text-muted">{labType}</span>
      </div>
      {typeof progressPercent === "number" && (
        <Progress value={progressPercent} tone="brand" aria-label={`${title} progress`} />
      )}
    </Card>
  );
}
