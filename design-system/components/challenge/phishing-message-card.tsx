"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, MessageSquare, Paperclip, Link2, User, AlertTriangle, Lightbulb } from "lucide-react";
import { FIRST_DEFENDER_ACTIONS, type ChallengeAction, type FirstDefenderStep, type HotspotKey } from "@/lib/challenges/first-defender";
import { cn } from "@/lib/utils";

export interface PhishingMessageCardProps {
  step: FirstDefenderStep;
  onChooseAction: (action: ChallengeAction) => void;
  onHotspotInspected: (hotspot: HotspotKey) => void;
  /** Hints are a separate, scored mechanic from the free hotspot inspections above. */
  hintUsed: boolean;
  onUseHint: () => void;
  disabled?: boolean;
  className?: string;
}

const hotspotIcon: Record<HotspotKey, typeof User> = {
  sender: User,
  link: Link2,
  tone: AlertTriangle,
  attachment: Paperclip,
};

const revealedKeyForHotspot: Record<HotspotKey, string> = {
  sender: "senderRevealed",
  link: "linkRevealed",
  tone: "toneRevealed",
  attachment: "attachmentRevealed",
};

/**
 * Renders one message of the First Defender scenario: the message
 * itself (email or SMS styling), inspection hotspots that reveal a
 * clue on tap rather than all at once, and the four fixed decision
 * buttons. This is the "interactive scenario rather than a simple
 * multiple-choice quiz" requirement: a visitor has to explore the
 * artifact, the same way a real analyst would, before answering.
 */
export function PhishingMessageCard({
  step,
  onChooseAction,
  onHotspotInspected,
  hintUsed,
  onUseHint,
  disabled,
  className,
}: PhishingMessageCardProps) {
  const t = useTranslations("challenge.firstDefender");
  const tStep = useTranslations(`challenge.firstDefender.steps.${step.id}`);
  const [revealed, setRevealed] = React.useState<Partial<Record<HotspotKey, boolean>>>({});

  function reveal(hotspot: HotspotKey) {
    if (!revealed[hotspot]) onHotspotInspected(hotspot);
    setRevealed((prev) => ({ ...prev, [hotspot]: true }));
  }

  const ChannelIcon = step.channel === "email" ? Mail : MessageSquare;
  const subject = step.channel === "email" ? tStep("subject") : "";

  return (
    <Card className={className}>
      <CardHeader className="flex-row items-center gap-3 space-y-0">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-700">
          <ChannelIcon className="h-4 w-4" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-text-primary">{tStep("from")}</p>
          <p className="truncate text-xs text-text-muted">{tStep("fromAddress")}</p>
        </div>
        <Badge variant="neutral">{tStep("channelLabel")}</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {subject && <p className="font-display font-semibold text-text-primary">{subject}</p>}
        <p className="whitespace-pre-line text-sm text-text-secondary">{tStep("preview")}</p>

        {step.hasLink && (
          <div className="rounded-md border border-border bg-surface-raised px-3 py-2 text-sm font-medium text-primary">
            {tStep("linkLabel")}
          </div>
        )}
        {step.hasAttachment && (
          <div className="flex items-center gap-2 rounded-md border border-border bg-surface-raised px-3 py-2 text-sm text-text-secondary">
            <Paperclip className="h-4 w-4" aria-hidden="true" />
            {tStep("attachmentName")}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {step.hotspots.map((hotspot) => {
            const Icon = hotspotIcon[hotspot];
            return (
              <Button
                key={hotspot}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => reveal(hotspot)}
                aria-pressed={Boolean(revealed[hotspot])}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                {t(`hotspots.${hotspot}`)}
              </Button>
            );
          })}
        </div>

        {step.hotspots
          .filter((hotspot) => revealed[hotspot])
          .map((hotspot) => (
            <p
              key={hotspot}
              className={cn(
                "rounded-md border border-warning-50 bg-warning-50 px-3 py-2 text-xs text-warning-600",
                "animate-in fade-in-0"
              )}
            >
              {tStep(revealedKeyForHotspot[hotspot])}
            </p>
          ))}

        <div>
          {hintUsed ? (
            <p className="flex items-start gap-2 rounded-md border border-info-50 bg-info-50 px-3 py-2 text-xs text-info-600">
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              {tStep("hint")}
            </p>
          ) : (
            <Button type="button" variant="ghost" size="sm" onClick={onUseHint} disabled={disabled}>
              <Lightbulb className="h-3.5 w-3.5" aria-hidden="true" />
              {t("hintCta")}
            </Button>
          )}
        </div>

        <fieldset className="grid gap-2 tablet:grid-cols-2" disabled={disabled}>
          <legend className="sr-only">{t("missionTitle")}</legend>
          {FIRST_DEFENDER_ACTIONS.map((action) => (
            <Button key={action} type="button" variant="secondary" onClick={() => onChooseAction(action)}>
              {t(`actions.${action}`)}
            </Button>
          ))}
        </fieldset>
      </CardContent>
    </Card>
  );
}
