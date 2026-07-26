"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScoreGauge } from "@/components/greentrust/score-gauge";
import { AchievementBadge } from "@/components/labs/achievement-badge";
import { InlineRegisterForm } from "./inline-register-form";
import { Link } from "@/lib/i18n/navigation";
import { trackEvent } from "@/lib/analytics/track";
import { FIRST_DEFENDER_SKILLS, FIRST_DEFENDER_CHALLENGE_KEY } from "@/lib/challenges/first-defender";
import { Share2, Sparkles } from "lucide-react";
import type { AppLocale } from "@/lib/i18n/config";

export interface ChallengeCompletionScreenProps {
  locale: AppLocale;
  score: number;
  xpEarned: number;
  anonId: string;
  shareUrl: string;
  onRestart: () => void;
  /** True if this result was already claimed by an account in a previous
   *  visit (read back from localStorage), so the register form should
   *  not be shown again. */
  alreadyRegistered?: boolean;
  /** True if the visitor already has a session; suppresses the
  * "create an account" prompt so a logged-in user never sees it. */
  isAuthenticated?: boolean;
  /** The XP total recorded at claim time, shown instead of `xpEarned`
   *  once `alreadyRegistered` is true so a reload reflects the badge
   *  bonus that was actually awarded. */
  claimedXp?: number;
  /** Bubbles the claim result up so the orchestrator can persist
   *  `claimed`/`claimedXp` into localStorage; never destroys progress,
   *  only adds to it. */
  onClaimed: (result: { xpAwarded: number; badgeAwarded: boolean }) => void;
}

/**
 * The completion screen this milestone's spec calls for in one place:
 * score, XP, badge, skills practiced, a share action, the inline
 * "save this to your profile" registration invite, and the "Continue
 * Your Cyber Journey" CTA into the CyberAbeer Labs waitlist (the only
 * honest "next challenge" to recommend, since Labs itself is still
 * waitlist-only per Milestone 1's scope). Registering here never
 * navigates away from this screen, so a visitor keeps seeing their
 * result the whole time.
 */
export function ChallengeCompletionScreen({
  locale,
  score,
  xpEarned,
  anonId,
  shareUrl,
  onRestart,
  alreadyRegistered,
  claimedXp,
  onClaimed,
  isAuthenticated,
}: ChallengeCompletionScreenProps) {
  const t = useTranslations("challenge.firstDefender.completion");
  const tBadge = useTranslations("challenge.firstDefender");
  const [registeredState, setRegisteredState] = React.useState<{
    xpAwarded: number;
    badgeAwarded: boolean;
  } | null>(null);
  const [showRegisterForm, setShowRegisterForm] = React.useState(true);
  const [shareStatus, setShareStatus] = React.useState<"idle" | "copied">("idle");

      const isSaved = alreadyRegistered || Boolean(registeredState) || Boolean(isAuthenticated);
  const displayXp = registeredState ? registeredState.xpAwarded : alreadyRegistered ? (claimedXp ?? xpEarned) : xpEarned;

  function handleRegistered(result: { xpAwarded: number; badgeAwarded: boolean }) {
    setRegisteredState(result);
    onClaimed(result);
  }

  async function handleShare() {
    const shareText = t("shareText");
    trackEvent("challenge_result_shared", { locale, challengeKey: FIRST_DEFENDER_CHALLENGE_KEY, score });
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ text: shareText, url: shareUrl });
        return;
      } catch {
        // Visitor cancelled the native share sheet; fall through to clipboard.
      }
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      setShareStatus("copied");
      setTimeout(() => setShareStatus("idle"), 3000);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="items-center text-center">
          <CardTitle className="font-display text-2xl">{t("title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center gap-6 tablet:flex-row tablet:justify-center tablet:gap-10">
            <ScoreGauge score={score} label={t("scoreLabel")} size="lg" />
            <div className="flex flex-col items-center gap-2">
              <Sparkles className="h-6 w-6 text-xp" aria-hidden="true" />
              <p className="font-display text-3xl font-bold text-text-primary">{displayXp}</p>
              <p className="text-sm text-text-muted">{t("xpLabel")}</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <AchievementBadge
                name={tBadge("badgeName")}
                description={tBadge("badgeDescription")}
                unlocked
                size="lg"
              />
              <p className="text-sm text-text-muted">{t("badgeUnlockedLabel")}</p>
            </div>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold text-text-primary">{t("skillsHeading")}</h3>
            <ul className="mt-2 space-y-1.5">
              {FIRST_DEFENDER_SKILLS.map((skill) => (
                <li key={skill} className="flex items-start gap-2 text-sm text-text-secondary">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                  {t(`skills.${skill}`)}
                </li>
              ))}
            </ul>
          </div>

          <Button type="button" variant="outline" className="w-full" onClick={handleShare}>
            <Share2 className="h-4 w-4" aria-hidden="true" />
            {shareStatus === "copied" ? t("shareCopied") : t("shareCta")}
          </Button>
        </CardContent>
      </Card>

      {!isSaved && showRegisterForm && (
        <Card data-brand="labs">
          <CardHeader>
            <CardTitle className="text-lg">{t("registerHeading")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-text-secondary">{t("registerBody")}</p>
            <InlineRegisterForm locale={locale} anonId={anonId} onRegistered={handleRegistered} />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => setShowRegisterForm(false)}
            >
              {t("registerLater")}
            </Button>
          </CardContent>
        </Card>
      )}

      {!isSaved && !showRegisterForm && (
        <p className="text-center text-xs text-text-muted">{t("anonymousNote")}</p>
      )}

      {isSaved && (
        <p className="text-center text-sm font-medium text-success-600">{t("registeredConfirmation")}</p>
      )}

      <Card data-brand="labs">
        <CardContent className="flex flex-col items-center gap-3 pt-6 text-center">
          <h3 className="font-display text-lg font-semibold text-text-primary">{t("nextStepHeading")}</h3>
          <p className="text-sm text-text-secondary">{t("nextStepBody")}</p>
          <Button asChild className="w-full tablet:w-auto">
            <Link href="/labs">{t("nextStepCta")}</Link>
          </Button>
        </CardContent>
      </Card>

      <div className="text-center">
        <Button type="button" variant="ghost" size="sm" onClick={onRestart}>
          {tBadge("restartCta")}
        </Button>
      </div>
    </div>
  );
}
