"use client";

import * as React from "react";
import { Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export interface ChallengeCardProps {
  title: string;
  description: string;
  xpReward: number;
  endsAt?: string; // pre-formatted, e.g. "Ends in 2 days" — i18n handled by caller
  attempted?: boolean;
  onStart: () => void;
}

/**
 * ChallengeCard — the "Free Challenge of the Week" surface (Phase 1
 * free-tools requirement). Larger and more prominent than LabCard
 * since it's usually the single hero element on the Labs landing
 * page and in the free-challenge acquisition funnel.
 */
export function ChallengeCard({ title, description, xpReward, endsAt, attempted, onStart }: ChallengeCardProps) {
  return (
    <Card className="relative overflow-hidden p-6">
      <div className="absolute inset-x-0 top-0 h-1 bg-accent" aria-hidden="true" />
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-accent">Weekly Challenge</p>
            <h3 className="mt-1 font-display text-xl font-semibold text-text-primary">{title}</h3>
          </div>
          <span className="shrink-0 rounded-full bg-xp/10 px-3 py-1 text-sm font-bold text-xp">
            +{xpReward} XP
          </span>
        </div>
        <p className="text-sm text-text-secondary">{description}</p>
        <div className="flex items-center justify-between">
          {endsAt && (
            <span className="inline-flex items-center gap-1.5 text-xs text-text-muted">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              {endsAt}
            </span>
          )}
          <Button onClick={onStart} size="md">
            {attempted ? "Try again" : "Start challenge"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
