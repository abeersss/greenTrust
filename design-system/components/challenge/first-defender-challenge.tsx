"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AssessmentProgress } from "@/components/assessment/assessment-progress";
import { PhishingMessageCard } from "./phishing-message-card";
import { ChallengeFeedbackPanel } from "./challenge-feedback-panel";
import { ChallengeCompletionScreen } from "./challenge-completion-screen";
import {
  firstDefenderSteps,
  computeStepScore,
  computeXpFromScore,
  isRiskyChoice,
  totalScore,
  totalHintsUsed,
  FIRST_DEFENDER_CHALLENGE_KEY,
  type ChallengeAction,
  type FirstDefenderStepsState,
  type HotspotKey,
} from "@/lib/challenges/first-defender";
import {
  getOrCreateAnonId,
  loadChallengeProgress,
  saveChallengeProgress,
  clearChallengeProgress,
  type ChallengeLocalProgress,
} from "@/lib/challenges/anon-session";
import { saveAnonymousChallengeProgress } from "@/lib/actions/challenge";
import { trackEvent } from "@/lib/analytics/track";
import { ShieldCheck } from "lucide-react";
import type { AppLocale } from "@/lib/i18n/config";

export interface FirstDefenderChallengeProps {
  locale: AppLocale;
  shareUrl: string;
}

type Screen = "intro" | "step" | "feedback" | "completion";

/**
 * Orchestrates the whole First Defender journey: intro, five scored
 * scenario steps with hints and feedback, then a completion screen.
 * State lives in React state plus localStorage (lib/challenges/anon-session.ts),
 * never behind a login wall, so a visitor can play the entire thing,
 * reload the page mid-run, or come back tomorrow, all without an
 * account. `saveAnonymousChallengeProgress` mirrors that same state to
 * Supabase on every step so a completed-but-unregistered result
 * survives a cleared browser too; it is a best-effort backup, never a
 * blocking dependency for play.
 */
export function FirstDefenderChallenge({ locale, shareUrl }: FirstDefenderChallengeProps) {
  const t = useTranslations("challenge.firstDefender");
  const [screen, setScreen] = React.useState<Screen>("intro");
  const [anonId, setAnonId] = React.useState<string>("");
  const [stepIndex, setStepIndex] = React.useState(0);
  const [stepsState, setStepsState] = React.useState<FirstDefenderStepsState>({});
  const [hintUsedCurrent, setHintUsedCurrent] = React.useState(false);
  const [lastOutcome, setLastOutcome] = React.useState<"correct" | "incorrect" | "phished">("incorrect");
  const [startedAt, setStartedAt] = React.useState<string>("");
  const [claimed, setClaimed] = React.useState(false);
  const [claimedXp, setClaimedXp] = React.useState<number | undefined>(undefined);
  const hasStartedAnalytics = React.useRef(false);
  const hydrated = React.useRef(false);

  React.useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;

    const id = getOrCreateAnonId();
    setAnonId(id);
    const saved = loadChallengeProgress(FIRST_DEFENDER_CHALLENGE_KEY);
    if (saved) {
      setStepsState(saved.stepsState);
      setStartedAt(saved.startedAt);
      setClaimed(Boolean(saved.claimed));
      setClaimedXp(saved.claimedXp);
      if (saved.completedAt) {
        setScreen("completion");
        hasStartedAnalytics.current = true;
      } else if (Object.keys(saved.stepsState).length > 0) {
        setStepIndex(Math.min(saved.currentStepIndex, firstDefenderSteps.length - 1));
        setScreen("step");
        hasStartedAnalytics.current = true;
      }
    }
  }, []);

  function persist(nextStepsState: FirstDefenderStepsState, nextStepIndex: number, completed: boolean) {
    const progress: ChallengeLocalProgress = {
      currentStepIndex: nextStepIndex,
      stepsState: nextStepsState,
      startedAt: startedAt || new Date().toISOString(),
      completedAt: completed ? new Date().toISOString() : null,
      claimed,
      claimedXp,
    };
    saveChallengeProgress(FIRST_DEFENDER_CHALLENGE_KEY, progress);

    void saveAnonymousChallengeProgress({
      anonId,
      challengeKey: FIRST_DEFENDER_CHALLENGE_KEY,
      status: completed ? "completed" : "in_progress",
      currentStep: nextStepIndex,
      score: totalScore(nextStepsState),
      xpEarned: computeXpFromScore(totalScore(nextStepsState)),
      hintsUsed: totalHintsUsed(nextStepsState),
      stepsState: nextStepsState,
      locale,
    });
  }

  function handleStart() {
    const now = new Date().toISOString();
    setStartedAt(now);
    setScreen("step");
    if (!hasStartedAnalytics.current) {
      hasStartedAnalytics.current = true;
      trackEvent("challenge_started", { locale, challengeKey: FIRST_DEFENDER_CHALLENGE_KEY });
    }
    saveChallengeProgress(FIRST_DEFENDER_CHALLENGE_KEY, {
      currentStepIndex: 0,
      stepsState: {},
      startedAt: now,
      completedAt: null,
    });
  }

  function handleUseHint() {
    if (hintUsedCurrent) return;
    setHintUsedCurrent(true);
    trackEvent("hint_used", {
      locale,
      challengeKey: FIRST_DEFENDER_CHALLENGE_KEY,
      // Non-null: stepIndex is only ever set to 0, stepIndex + 1 (guarded
      // by isLastStep in handleContinue), or clamped via Math.min on
      // hydration, so it always indexes a real step.
      step: firstDefenderSteps[stepIndex]!.id,
    });
  }

  function handleHotspotInspected(hotspot: HotspotKey) {
    trackEvent("challenge_hotspot_inspected", {
      locale,
      challengeKey: FIRST_DEFENDER_CHALLENGE_KEY,
      step: firstDefenderSteps[stepIndex]!.id,
      hotspot,
    });
  }

  function handleChooseAction(action: ChallengeAction) {
    const step = firstDefenderSteps[stepIndex]!;
    const score = computeStepScore(step, action, hintUsedCurrent);
    const outcome: "correct" | "incorrect" | "phished" =
      score > 0 ? "correct" : isRiskyChoice(action) ? "phished" : "incorrect";
    setLastOutcome(outcome);

    const nextStepsState: FirstDefenderStepsState = {
      ...stepsState,
      [step.id]: { action, usedHint: hintUsedCurrent, score },
    };
    setStepsState(nextStepsState);
    setScreen("feedback");

    trackEvent("challenge_step_completed", {
      locale,
      challengeKey: FIRST_DEFENDER_CHALLENGE_KEY,
      step: step.id,
      correct: score > 0,
      hintUsed: hintUsedCurrent,
    });

    persist(nextStepsState, stepIndex, false);
  }

  function handleContinue() {
    const isLastStep = stepIndex >= firstDefenderSteps.length - 1;
    setHintUsedCurrent(false);

    if (isLastStep) {
      setScreen("completion");
      persist(stepsState, stepIndex, true);
      trackEvent("challenge_completed", {
        locale,
        challengeKey: FIRST_DEFENDER_CHALLENGE_KEY,
        score: totalScore(stepsState),
        xp: computeXpFromScore(totalScore(stepsState)),
      });
    } else {
      const nextIndex = stepIndex + 1;
      setStepIndex(nextIndex);
      setScreen("step");
      persist(stepsState, nextIndex, false);
    }
  }

  function handleClaimed(result: { xpAwarded: number; badgeAwarded: boolean }) {
    setClaimed(true);
    setClaimedXp(result.xpAwarded);
    saveChallengeProgress(FIRST_DEFENDER_CHALLENGE_KEY, {
      currentStepIndex: stepIndex,
      stepsState,
      startedAt,
      completedAt: new Date().toISOString(),
      claimed: true,
      claimedXp: result.xpAwarded,
    });
  }

  function handleRestart() {
    setStepIndex(0);
    setStepsState({});
    setHintUsedCurrent(false);
    setClaimed(false);
    setClaimedXp(undefined);
    setScreen("intro");
    clearChallengeProgress(FIRST_DEFENDER_CHALLENGE_KEY);
  }

  // Brief hydration gate: avoids flashing the intro screen for a
  // returning visitor before localStorage has been read on mount.
  if (!anonId) return null;

  if (screen === "intro") {
    return (
      <Card className="mx-auto max-w-lg">
        <CardHeader className="items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 text-primary-700">
            <ShieldCheck className="h-7 w-7" aria-hidden="true" />
          </div>
          <CardTitle className="font-display text-2xl">{t("heroTitle")}</CardTitle>
          <CardDescription>{t("heroSubtitle")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <div className="rounded-md bg-surface-raised p-4 text-start">
            <h3 className="font-display text-sm font-semibold text-text-primary">{t("missionTitle")}</h3>
            <p className="mt-1 text-sm text-text-secondary">{t("missionBody")}</p>
          </div>
          <p className="text-xs text-text-muted">{t("estimatedTime")}</p>
          <Button className="w-full" size="lg" onClick={handleStart}>
            {t("startCta")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const step = firstDefenderSteps[stepIndex]!;
  const progressLabel = t("progressLabel", { current: stepIndex + 1, total: firstDefenderSteps.length });

  if (screen === "step") {
    return (
      <div className="mx-auto max-w-lg space-y-4">
        <AssessmentProgress currentStep={stepIndex + 1} totalSteps={firstDefenderSteps.length} label={progressLabel} />
        <PhishingMessageCard
          step={step}
          onChooseAction={handleChooseAction}
          onHotspotInspected={handleHotspotInspected}
          hintUsed={hintUsedCurrent}
          onUseHint={handleUseHint}
        />
      </div>
    );
  }

  if (screen === "feedback") {
    return (
      <div className="mx-auto max-w-lg space-y-4">
        <AssessmentProgress currentStep={stepIndex + 1} totalSteps={firstDefenderSteps.length} label={progressLabel} />
        <ChallengeFeedbackPanel step={step} outcome={lastOutcome} onContinue={handleContinue} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <ChallengeCompletionScreen
        locale={locale}
        score={totalScore(stepsState)}
        xpEarned={computeXpFromScore(totalScore(stepsState))}
        anonId={anonId}
        shareUrl={shareUrl}
        onRestart={handleRestart}
        alreadyRegistered={claimed}
        claimedXp={claimedXp}
        onClaimed={handleClaimed}
      />
    </div>
  );
}
