"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScoreGauge } from "@/components/greentrust/score-gauge";
import { AchievementBadge } from "@/components/labs/achievement-badge";
import { WinCelebration } from "@/components/shared/win-celebration";
import { InlineRegisterForm } from "@/components/challenge/inline-register-form";
import { Link } from "@/lib/i18n/navigation";
import { pick } from "@/lib/challenges/bilingual";
import { getCtfChallengeBySlug } from "@/lib/ctf/challenges";
import type {
  Bilingual,
  CtfCategory,
  CtfChallenge as CtfChallengeData,
  CtfDifficulty,
  CtfHint,
  CtfStage,
  CtfStepsState,
  CtfWorkstationState,
  CryptoArtifact,
  ForensicsArtifact,
  WebArtifact,
} from "@/lib/ctf/types";
import {
  getOrCreateAnonId,
  loadChallengeProgress,
  saveChallengeProgress,
  clearChallengeProgress,
} from "@/lib/challenges/anon-session";
import { saveAnonymousChallengeProgress, claimChallengeForCurrentUser, BADGE_PASS_SCORE } from "@/lib/actions/challenge";
import { trackEvent } from "@/lib/analytics/track";
import type { AppLocale } from "@/lib/i18n/config";
import type { ChallengeKey } from "@/lib/challenges/keys";
import {
  Flag,
  Globe,
  FileSearch,
  KeyRound,
  Lightbulb,
  Send,
  XCircle,
  Sparkles,
  Share2,
  ChevronRight,
  Lock,
  ShieldAlert,
  RotateCcw,
} from "lucide-react";

type Screen = "briefing" | "workstation" | "consequence" | "complete";

const CATEGORY_ICON: Record<CtfCategory, React.ReactNode> = {
  web: <Globe className="h-6 w-6" aria-hidden="true" />,
  forensics: <FileSearch className="h-6 w-6" aria-hidden="true" />,
  crypto: <KeyRound className="h-6 w-6" aria-hidden="true" />,
};

const CATEGORY_LABEL: Record<CtfCategory, Bilingual> = {
  web: { en: "Web Exploitation", ar: "استغلال الويب" },
  forensics: { en: "Forensics", ar: "التحليل الجنائي الرقمي" },
  crypto: { en: "Cryptography", ar: "التشفير" },
};

const DIFFICULTY_LABEL: Record<CtfDifficulty, Bilingual> = {
  beginner: { en: "Beginner", ar: "مبتدئ" },
  intermediate: { en: "Intermediate", ar: "متوسط" },
};

const COPY = {
  beginChallenge: { en: "Start Challenge", ar: "ابدأ التحدي" },
  stepsSuffix: { en: "steps", ar: "خطوات" },
  artifactHeading: { en: "Artifact", ar: "القطعة" },
  hintsHeading: { en: "Hints", ar: "تلميحات" },
  revealHint: { en: "Reveal hint", ar: "أظهر التلميح" },
  pointsAbbrev: { en: "pts", ar: "نقطة" },
  submitFlagHeading: { en: "Submit the flag", ar: "أرسل العلم" },
  flagInputLabel: { en: "Flag", ar: "العلم" },
  submitFlag: { en: "Submit Flag", ar: "إرسال العلم" },
  incorrectFlag: { en: "Incorrect, try again.", ar: "غير صحيح، حاول مرة أخرى." },
  flagCaptured: { en: "FLAG CAPTURED", ar: "تم التقاط العلم" },
  whatHappenedLabel: { en: "What happened", ar: "ما الذي حدث" },
  whyItMatteredLabel: { en: "Why it mattered", ar: "لماذا كان هذا مهمًا" },
  finalScoreLabel: { en: "Final score", ar: "النتيجة النهائية" },
  hintsUsedLabel: { en: "Hints used", ar: "التلميحات المستخدمة" },
  continueLabel: { en: "Continue", ar: "متابعة" },
  challengeComplete: { en: "CHALLENGE COMPLETE", ar: "اكتمل التحدي" },
  scoreLabel: { en: "Score", ar: "النتيجة" },
  xpLabel: { en: "XP", ar: "نقاط الخبرة" },
  badgeUnlocked: { en: "Badge unlocked", ar: "تم فتح الشارة" },
  shareAchievement: { en: "Share Achievement", ar: "مشاركة الإنجاز" },
  shareCopied: { en: "Copied!", ar: "تم النسخ!" },
  savedToAccount: { en: "Saved to your account.", ar: "تم الحفظ في حسابك." },
  registerHeading: { en: "Keep this result", ar: "احتفظ بهذه النتيجة" },
  registerBody: {
    en: "Create a free account to save your XP and badge, and pick up where you left off.",
    ar: "أنشئ حسابًا مجانيًا لحفظ نقاط خبرتك وشارتك، ومتابعة تقدمك لاحقًا.",
  },
  registerCta: { en: "Save my result", ar: "احفظ نتيجتي" },
  registerLater: { en: "Maybe later", ar: "لاحقًا" },
  anonymousNote: {
    en: "Your progress is saved on this device. Register anytime to keep it permanently.",
    ar: "يتم حفظ تقدمك على هذا الجهاز. سجّل في أي وقت للاحتفاظ به بشكل دائم.",
  },
  tryAnother: { en: "Try another CTF challenge", ar: "جرّب تحدي CTF آخر" },
  restart: { en: "Restart This Challenge", ar: "أعد هذا التحدي" },
  apiConsolePrompt: { en: "Send a request to see the response.", ar: "أرسل طلبًا لرؤية الاستجابة." },
  sendRequest: { en: "Send Request", ar: "إرسال الطلب" },
  base64DecoderLabel: { en: "Base64 decoder", ar: "أداة فك ترميز Base64" },
  base64DecoderPlaceholder: { en: "Paste the suspicious value here", ar: "الصق القيمة المشبوهة هنا" },
  decodeButton: { en: "Decode", ar: "فك الترميز" },
  decodeError: { en: "That doesn't look like valid base64.", ar: "هذا لا يبدو ترميز base64 صالحًا." },
  shiftLabel: { en: "Shift", ar: "الإزاحة" },
  ciphertextLabel: { en: "Ciphertext", ar: "النص المشفر" },
  encodedArtifactLabel: { en: "Encoded artifact", ar: "القطعة المرمّزة" },
  decodedPreviewLabel: { en: "Decoded preview", ar: "معاينة فك الترميز" },
  stepBadge: { en: "Step", ar: "الخطوة" },
  unlockStep: { en: "Unlock Next Step", ar: "افتح الخطوة التالية" },
  incorrectUnlock: { en: "Not quite, try again.", ar: "ليس تمامًا، حاول مرة أخرى." },
  stepUnlockedNote: { en: "Step unlocked below.", ar: "تم فتح الخطوة أدناه." },
  completeStepsNote: {
    en: "Complete the steps above to unlock flag submission.",
    ar: "أكمل الخطوات أعلاه لفتح إرسال العلم.",
  },
  // Strict-evaluation copy (founder instruction, 2026-08-02): every CTF
  // challenge must state up front that scoring is strict and that the
  // CTF badge only unlocks at BADGE_PASS_SCORE (80%) or higher.
  strictEvaluationNote: {
    en: `Scoring is strict: every hint you reveal costs points, and the CyberAbeer CTF badge only unlocks at ${BADGE_PASS_SCORE}% or higher. Solve it clean for the win.`,
    ar: `التقييم صارم: كل تلميح تكشفه يخصم نقاطًا، وشارة CyberAbeer CTF لا تُفتح إلا بنتيجة ${BADGE_PASS_SCORE}% أو أعلى. حلّها بإتقان للفوز.`,
  },
  passedHeading: { en: "You passed", ar: "لقد نجحت" },
  notPassedHeading: { en: "Not quite a pass", ar: "لم تصل لحد النجاح بعد" },
  notPassedBody: {
    en: `Strict evaluation: this challenge needs a score of ${BADGE_PASS_SCORE}% or higher to count as a win and unlock the badge. Restart and solve it with fewer hints to earn it.`,
    ar: `تقييم صارم: يتطلب هذا التحدي نتيجة ${BADGE_PASS_SCORE}% أو أعلى ليُحتسب فوزًا ويفتح الشارة. أعد المحاولة واستخدم تلميحات أقل لكسبها.`,
  },
  badgeLockedNote: {
    en: `Score ${BADGE_PASS_SCORE}%+ to unlock this badge`,
    ar: `احصل على ${BADGE_PASS_SCORE}%+ لفتح هذه الشارة`,
  },
} as const;

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

/** Applies a forward Caesar shift (A-Z / a-z only, case preserved, all
 * other characters including digits/{/}/_ left untouched). Used both to
 * brute-force a Caesar-enciphered flag and, at shift 13, to undo ROT13. */
function caesarShiftText(text: string, shift: number): string {
  const normalized = ((shift % 26) + 26) % 26;
  let result = "";
  for (const ch of text) {
    const code = ch.charCodeAt(0);
    if (code >= 65 && code <= 90) {
      result += String.fromCharCode(((code - 65 + normalized) % 26) + 65);
    } else if (code >= 97 && code <= 122) {
      result += String.fromCharCode(((code - 97 + normalized) % 26) + 97);
    } else {
      result += ch;
    }
  }
  return result;
}

function computeScore(hintsUsed: string[], challenge: CtfChallengeData): number {
  const cost = hintsUsed.reduce((sum, id) => {
    const hint = challenge.hints.find((h) => h.id === id);
    return sum + (hint?.cost ?? 0);
  }, 0);
  return Math.max(0, 100 - cost);
}

function computeXp(score: number, challenge: CtfChallengeData): number {
  return Math.round(challenge.xpReward * (score / 100));
}

function normalizeFlag(value: string): string {
  return value.trim().toUpperCase();
}

/** Case-insensitive, whitespace-normalized comparison for stage-unlock
 * answers -- lets " Session_Secret " or "0x00003DA0" match a stored
 * lowercase, un-prefixed answer without being fussy about it. */
function normalizeStageAnswer(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/^0x/, "")
    .replace(/\s+/g, " ");
}

/** Players often type or paste the whole request line shown in the
 * endpoint label above the input (e.g. "GET /api/users/search?name=admin"
 * or "GET /api/invoices/1042") rather than just the bare identifier the
 * console actually looks records up by -- which is exactly what the
 * label makes it look like you should do. This pulls the real lookup
 * value out of whatever was typed: prefers the text after the last "="
 * (covers ?name=admin), falls back to the last "/"-separated path
 * segment (covers /api/invoices/1042), and otherwise falls back to the
 * raw trimmed input untouched. */
function extractLookupValue(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.includes("=")) {
    return trimmed.slice(trimmed.lastIndexOf("=") + 1).trim();
  }
  if (trimmed.includes("/")) {
    const segments = trimmed.split("/").filter(Boolean);
    return (segments[segments.length - 1] ?? trimmed).trim();
  }
  return trimmed;
}

/** Reads only the keys namespaced to this stage (`${stageId}:${key}`) out
 * of the shared workstation state bag, stripped of their prefix, so each
 * stage's artifact sub-tools (shift value, decoded text, last API
 * response, etc.) never collide with another stage's, even when two
 * stages in the same challenge reuse the same artifact kind. */
function scopedWorkstationState(state: CtfWorkstationState, stageId: string): CtfWorkstationState {
  const prefix = `${stageId}:`;
  const scoped: CtfWorkstationState = {};
  for (const [key, value] of Object.entries(state)) {
    if (key.startsWith(prefix)) scoped[key.slice(prefix.length)] = value;
  }
  return scoped;
}

function scopedOnWorkstationChange(
  onChange: (patch: CtfWorkstationState) => void,
  stageId: string
): (patch: CtfWorkstationState) => void {
  return (patch: CtfWorkstationState) => {
    const prefixed: CtfWorkstationState = {};
    for (const [key, value] of Object.entries(patch)) prefixed[`${stageId}:${key}`] = value;
    onChange(prefixed);
  };
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function CtfChallenge({
  challengeSlug,
  locale,
  shareUrl,
  isAuthenticated,
}: {
  challengeSlug: string;
  locale: AppLocale;
  shareUrl: string;
  isAuthenticated: boolean;
}) {
  const challenge = getCtfChallengeBySlug(challengeSlug);

  const [screen, setScreen] = React.useState<Screen>("briefing");
  const [anonId, setAnonId] = React.useState("");
  const [hintsUsed, setHintsUsed] = React.useState<string[]>([]);
  const [solved, setSolved] = React.useState(false);
  const [workstationState, setWorkstationState] = React.useState<CtfWorkstationState>({});
  const [unlockedStageIndex, setUnlockedStageIndex] = React.useState(0);
  const [stageUnlockInput, setStageUnlockInput] = React.useState("");
  const [stageUnlockFeedback, setStageUnlockFeedback] = React.useState<"idle" | "incorrect">("idle");
  const [flagInput, setFlagInput] = React.useState("");
  const [flagFeedback, setFlagFeedback] = React.useState<"idle" | "incorrect">("idle");
  const [startedAt, setStartedAt] = React.useState("");
  const [completedAt, setCompletedAt] = React.useState<string | null>(null);
  const [claimed, setClaimed] = React.useState(false);
  const [claimedXp, setClaimedXp] = React.useState<number | undefined>(undefined);
  const [registeredResult, setRegisteredResult] = React.useState<{ xpAwarded: number; badgeAwarded: boolean } | null>(
    null
  );
  const [showRegisterForm, setShowRegisterForm] = React.useState(true);
  const [shareStatus, setShareStatus] = React.useState<"idle" | "copied">("idle");
  const hydrated = React.useRef(false);
  const startedAnalytics = React.useRef(false);
  const autoClaimAttempted = React.useRef(false);

  React.useEffect(() => {
    if (!challenge) return;
    if (hydrated.current) return;
    hydrated.current = true;
    const id = getOrCreateAnonId();
    setAnonId(id);
    const saved = loadChallengeProgress<CtfStepsState>(challenge.challengeKey);
    if (saved && saved.stepsState) {
      setHintsUsed(saved.stepsState.hintsUsed ?? []);
      setSolved(Boolean(saved.stepsState.solved));
      setWorkstationState(saved.stepsState.workstationState ?? {});
      setUnlockedStageIndex(
        Math.min(saved.stepsState.unlockedStageIndex ?? 0, challenge.stages.length - 1)
      );
      setStartedAt(saved.startedAt);
      setClaimed(Boolean(saved.claimed));
      setClaimedXp(saved.claimedXp);
      if (saved.completedAt) {
        setCompletedAt(saved.completedAt);
        setScreen("complete");
        startedAnalytics.current = true;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [challenge?.challengeKey]);

  React.useEffect(() => {
    if (!challenge) return;
    if (screen !== "complete") return;
    if (!isAuthenticated) return;
    if (claimed) return;
    if (autoClaimAttempted.current) return;
    autoClaimAttempted.current = true;
    let cancelled = false;
    claimChallengeForCurrentUser({ anonId, challengeKey: challenge.challengeKey as ChallengeKey }).then((result) => {
      if (cancelled) return;
      if (result.status === "success" && result.data) {
        handleClaimed(result.data);
      }
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, isAuthenticated, claimed, anonId, challenge?.challengeKey]);

  if (!challenge) return null;

  function persistLocal(
    nextHintsUsed: string[],
    nextSolved: boolean,
    nextWorkstationState: CtfWorkstationState,
    nextUnlockedStageIndex: number
  ) {
    const nowIso = new Date().toISOString();
    const stepsState: CtfStepsState = {
      hintsUsed: nextHintsUsed,
      solved: nextSolved,
      workstationState: nextWorkstationState,
      unlockedStageIndex: nextUnlockedStageIndex,
    };
    saveChallengeProgress<CtfStepsState>(challenge!.challengeKey, {
      currentStepIndex: nextSolved ? 1 : 0,
      stepsState,
      startedAt: startedAt || nowIso,
      completedAt: nextSolved ? completedAt ?? nowIso : null,
      claimed,
      claimedXp,
    });
    if (nextSolved) setCompletedAt((prev) => prev ?? nowIso);
  }

  function persistServer(
    nextHintsUsed: string[],
    nextSolved: boolean,
    nextWorkstationState: CtfWorkstationState,
    nextUnlockedStageIndex: number
  ) {
    const stepsState: CtfStepsState = {
      hintsUsed: nextHintsUsed,
      solved: nextSolved,
      workstationState: nextWorkstationState,
      unlockedStageIndex: nextUnlockedStageIndex,
    };
    const score = computeScore(nextHintsUsed, challenge!);
    const xp = computeXp(score, challenge!);
    void saveAnonymousChallengeProgress({
      anonId,
      challengeKey: challenge!.challengeKey as ChallengeKey,
      status: nextSolved ? "completed" : "in_progress",
      currentStep: nextSolved ? 1 : 0,
      score,
      xpEarned: xp,
      hintsUsed: nextHintsUsed.length,
      stepsState,
      locale,
    });
  }

  function handleBegin() {
    const now = new Date().toISOString();
    setStartedAt((prev) => prev || now);
    setScreen("workstation");
    if (!startedAnalytics.current) {
      startedAnalytics.current = true;
      trackEvent("challenge_started", { locale, challengeKey: challenge!.challengeKey });
    }
  }

  function handleWorkstationChange(patch: CtfWorkstationState) {
    setWorkstationState((prev) => {
      const next = { ...prev, ...patch };
      persistLocal(hintsUsed, solved, next, unlockedStageIndex);
      return next;
    });
  }

  function handleStageUnlockInputChange(value: string) {
    setStageUnlockInput(value);
    if (stageUnlockFeedback !== "idle") setStageUnlockFeedback("idle");
  }

  function handleUnlockStage() {
    const stage = challenge!.stages[unlockedStageIndex];
    if (!stage || !stage.unlockAnswer) return;
    if (normalizeStageAnswer(stageUnlockInput) !== stage.unlockAnswer) {
      setStageUnlockFeedback("incorrect");
      return;
    }
    const nextIndex = Math.min(unlockedStageIndex + 1, challenge!.stages.length - 1);
    setUnlockedStageIndex(nextIndex);
    setStageUnlockInput("");
    setStageUnlockFeedback("idle");
    persistLocal(hintsUsed, solved, workstationState, nextIndex);
    persistServer(hintsUsed, solved, workstationState, nextIndex);
    trackEvent("ctf_stage_unlocked", { locale, challengeKey: challenge!.challengeKey, stageIndex: nextIndex });
  }

  function handleUseHint(hint: CtfHint, index: number) {
    if (hintsUsed.includes(hint.id)) return;
    if (hint.requiresHintId && !hintsUsed.includes(hint.requiresHintId)) return;
    const next = [...hintsUsed, hint.id];
    setHintsUsed(next);
    persistLocal(next, solved, workstationState, unlockedStageIndex);
    persistServer(next, solved, workstationState, unlockedStageIndex);
    trackEvent("ctf_hint_used", { locale, challengeKey: challenge!.challengeKey, hintIndex: index });
  }

  function handleFlagInputChange(value: string) {
    setFlagInput(value);
    if (flagFeedback !== "idle") setFlagFeedback("idle");
  }

  function handleSubmitFlag() {
    if (normalizeFlag(flagInput) !== challenge!.flag.toUpperCase()) {
      setFlagFeedback("incorrect");
      return;
    }
    setSolved(true);
    persistLocal(hintsUsed, true, workstationState, unlockedStageIndex);
    persistServer(hintsUsed, true, workstationState, unlockedStageIndex);
    const score = computeScore(hintsUsed, challenge!);
    const xp = computeXp(score, challenge!);
    trackEvent("challenge_result_computed", { locale, challengeKey: challenge!.challengeKey, score });
    trackEvent("challenge_completed", { locale, challengeKey: challenge!.challengeKey, score, xp });
    setFlagFeedback("idle");
    setScreen("consequence");
  }

  function handleFinishConsequence() {
    setScreen("complete");
  }

  function handleClaimed(result: { xpAwarded: number; badgeAwarded: boolean }) {
    setClaimed(true);
    setClaimedXp(result.xpAwarded);
    setRegisteredResult(result);
    saveChallengeProgress<CtfStepsState>(challenge!.challengeKey, {
      currentStepIndex: 1,
      stepsState: { hintsUsed, solved, workstationState, unlockedStageIndex },
      startedAt: startedAt || new Date().toISOString(),
      completedAt: completedAt ?? new Date().toISOString(),
      claimed: true,
      claimedXp: result.xpAwarded,
    });
    if (result.badgeAwarded) {
      trackEvent("badge_awarded", { locale, challengeKey: challenge!.challengeKey });
    }
  }

  async function handleShare() {
    const score = computeScore(hintsUsed, challenge!);
    const xp = computeXp(score, challenge!);
    const title = pick(challenge!.title, locale);
    const shareText =
      locale === "ar"
        ? `أكملت تحدي CyberAbeer CTF: ${title} — النتيجة: ${score}% | نقاط الخبرة: ${xp}`
        : `I completed CyberAbeer CTF: ${title} — Score: ${score}% | XP: ${xp}`;
    trackEvent("challenge_result_shared", { locale, challengeKey: challenge!.challengeKey, score });
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ text: shareText, url: shareUrl });
        return;
      } catch {
        // visitor cancelled the native share sheet; fall through to clipboard
      }
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      setShareStatus("copied");
      setTimeout(() => setShareStatus("idle"), 2000);
    }
  }

  function handleRestart() {
    setHintsUsed([]);
    setSolved(false);
    setWorkstationState({});
    setUnlockedStageIndex(0);
    setStageUnlockInput("");
    setStageUnlockFeedback("idle");
    setFlagInput("");
    setFlagFeedback("idle");
    setCompletedAt(null);
    setClaimed(false);
    setClaimedXp(undefined);
    setRegisteredResult(null);
    setScreen("briefing");
    clearChallengeProgress(challenge!.challengeKey);
  }

  if (!anonId) return null;

  if (screen === "briefing") {
    return <BriefingScreen locale={locale} challenge={challenge} onBegin={handleBegin} />;
  }

  if (screen === "workstation") {
    return (
      <WorkstationScreen
        locale={locale}
        challenge={challenge}
        hintsUsed={hintsUsed}
        workstationState={workstationState}
        onUseHint={handleUseHint}
        onWorkstationChange={handleWorkstationChange}
        unlockedStageIndex={unlockedStageIndex}
        stageUnlockInput={stageUnlockInput}
        onStageUnlockInputChange={handleStageUnlockInputChange}
        stageUnlockFeedback={stageUnlockFeedback}
        onUnlockStage={handleUnlockStage}
        flagInput={flagInput}
        onFlagInputChange={handleFlagInputChange}
        flagFeedback={flagFeedback}
        onSubmitFlag={handleSubmitFlag}
        onRestart={handleRestart}
      />
    );
  }

  if (screen === "consequence") {
    const score = computeScore(hintsUsed, challenge);
    return (
      <ConsequenceScreen
        locale={locale}
        challenge={challenge}
        hintsUsed={hintsUsed}
        score={score}
        onContinue={handleFinishConsequence}
      />
    );
  }

  const score = computeScore(hintsUsed, challenge);
  const xp = computeXp(score, challenge);
  const passed = score >= BADGE_PASS_SCORE;
  return (
    <CompleteScreen
      locale={locale}
      challenge={challenge}
      score={score}
      passed={passed}
      anonId={anonId}
      isSaved={claimed || Boolean(registeredResult) || isAuthenticated}
      displayXp={registeredResult ? registeredResult.xpAwarded || xp : claimed ? claimedXp || xp : xp}
      showRegisterForm={showRegisterForm}
      onHideRegisterForm={() => setShowRegisterForm(false)}
      onRegistered={handleClaimed}
      onShare={handleShare}
      shareStatus={shareStatus}
      onRestart={handleRestart}
    />
  );
}

// ---------------------------------------------------------------------------
// Briefing
// ---------------------------------------------------------------------------

function BriefingScreen({
  locale,
  challenge,
  onBegin,
}: {
  locale: AppLocale;
  challenge: CtfChallengeData;
  onBegin: () => void;
}) {
  return (
    <Card className="mx-auto max-w-lg" data-brand="labs">
      <CardHeader className="items-center text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 text-primary-700">
          {CATEGORY_ICON[challenge.category]}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Badge variant="primary">{pick(CATEGORY_LABEL[challenge.category], locale)}</Badge>
          <Badge variant={challenge.difficulty === "beginner" ? "success" : "warning"}>
            {pick(DIFFICULTY_LABEL[challenge.difficulty], locale)}
          </Badge>
          <Badge variant="outline">
            {challenge.stages.length} {pick(COPY.stepsSuffix, locale)}
          </Badge>
        </div>
        <CardTitle className="font-display text-2xl">{pick(challenge.title, locale)}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-center">
        <div className="rounded-md bg-surface-raised p-4 text-start">
          <p className="text-sm text-text-secondary">{pick(challenge.briefing, locale)}</p>
        </div>
        <div className="flex items-start gap-2 rounded-md border border-warning-200 bg-warning-50 p-3 text-start text-xs text-warning-800">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{pick(COPY.strictEvaluationNote, locale)}</span>
        </div>
        <div className="flex items-center justify-center gap-2 text-sm text-text-muted">
          <Flag className="h-4 w-4" aria-hidden="true" />
          <span>
            {challenge.xpReward} {pick(COPY.xpLabel, locale)}
          </span>
        </div>
        <Button className="w-full" size="lg" onClick={onBegin}>
          {pick(COPY.beginChallenge, locale)}
        </Button>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Workstation
// ---------------------------------------------------------------------------

function WorkstationScreen({
  locale,
  challenge,
  hintsUsed,
  workstationState,
  onUseHint,
  onWorkstationChange,
  unlockedStageIndex,
  stageUnlockInput,
  onStageUnlockInputChange,
  stageUnlockFeedback,
  onUnlockStage,
  flagInput,
  onFlagInputChange,
  flagFeedback,
  onSubmitFlag,
  onRestart,
}: {
  locale: AppLocale;
  challenge: CtfChallengeData;
  hintsUsed: string[];
  workstationState: CtfWorkstationState;
  onUseHint: (hint: CtfHint, index: number) => void;
  onWorkstationChange: (patch: CtfWorkstationState) => void;
  unlockedStageIndex: number;
  stageUnlockInput: string;
  onStageUnlockInputChange: (value: string) => void;
  stageUnlockFeedback: "idle" | "incorrect";
  onUnlockStage: () => void;
  flagInput: string;
  onFlagInputChange: (value: string) => void;
  flagFeedback: "idle" | "incorrect";
  onSubmitFlag: () => void;
  onRestart: () => void;
}) {
  const score = computeScore(hintsUsed, challenge);
  const stages = challenge.stages;
  const isFinalStageUnlocked = unlockedStageIndex >= stages.length - 1;
  const visibleStages = stages.slice(0, unlockedStageIndex + 1);

  return (
    <div className="mx-auto max-w-3xl space-y-4" dir={locale === "ar" ? "rtl" : "ltr"} data-brand="labs">
      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary-50 text-primary-700">
              {CATEGORY_ICON[challenge.category]}
            </div>
            <div>
              <p className="text-xs text-text-muted">{pick(CATEGORY_LABEL[challenge.category], locale)}</p>
              <p className="font-display text-lg font-bold text-text-primary">{pick(challenge.title, locale)}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">
              {pick(COPY.stepBadge, locale)} {unlockedStageIndex + 1}/{stages.length}
            </Badge>
            <Badge variant={challenge.difficulty === "beginner" ? "success" : "warning"}>
              {pick(DIFFICULTY_LABEL[challenge.difficulty], locale)}
            </Badge>
            <Badge variant={score >= BADGE_PASS_SCORE ? "success" : "primary"}>{score} / 100</Badge>
            <Button type="button" variant="ghost" size="sm" className="gap-1.5" onClick={onRestart}>
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              {pick(COPY.restart, locale)}
            </Button>
          </div>
        </CardContent>
      </Card>

      {visibleStages.map((stage, index) => {
        const stageState = scopedWorkstationState(workstationState, stage.id);
        const stageOnChange = scopedOnWorkstationChange(onWorkstationChange, stage.id);
        const isActiveUnlockStage = index === unlockedStageIndex && Boolean(stage.unlockAnswer);

        return (
          <Card key={stage.id}>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle className="text-base">{pick(stage.title, locale)}</CardTitle>
                <Badge variant="outline" className="shrink-0">
                  {pick(COPY.stepBadge, locale)} {index + 1}/{stages.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-text-secondary">{pick(stage.instruction, locale)}</p>

              {challenge.category === "web" && (
                <WebArtifactPanel
                  artifact={stage.artifact as WebArtifact}
                  locale={locale}
                  workstationState={stageState}
                  onWorkstationChange={stageOnChange}
                />
              )}
              {challenge.category === "forensics" && (
                <ForensicsArtifactPanel
                  artifact={stage.artifact as ForensicsArtifact}
                  locale={locale}
                  workstationState={stageState}
                  onWorkstationChange={stageOnChange}
                />
              )}
              {challenge.category === "crypto" && (
                <CryptoArtifactPanel
                  artifact={stage.artifact as CryptoArtifact}
                  locale={locale}
                  workstationState={stageState}
                  onWorkstationChange={stageOnChange}
                />
              )}

              {isActiveUnlockStage && (
                <div className="space-y-2 rounded-md border border-dashed border-border-strong p-3">
                  <p className="flex items-center gap-2 text-xs font-medium text-text-muted">
                    <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                    {pick(stage.unlockLabel ?? COPY.unlockStep, locale)}
                  </p>
                  <div className="flex flex-col gap-2 tablet:flex-row">
                    <Input
                      dir="ltr"
                      value={stageUnlockInput}
                      onChange={(e) => onStageUnlockInputChange(e.target.value)}
                      className="font-mono"
                      aria-label={pick(stage.unlockLabel ?? COPY.unlockStep, locale)}
                    />
                    <Button type="button" onClick={onUnlockStage} className="gap-2 shrink-0">
                      <ChevronRight className="h-4 w-4" aria-hidden="true" />
                      {pick(COPY.unlockStep, locale)}
                    </Button>
                  </div>
                  {stageUnlockFeedback === "incorrect" && (
                    <p className="flex items-center gap-2 text-sm text-danger-600">
                      <XCircle className="h-4 w-4" aria-hidden="true" />
                      {pick(stage.wrongUnlockFeedback ?? COPY.incorrectUnlock, locale)}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{pick(COPY.hintsHeading, locale)}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {challenge.hints.map((hint, index) => {
            const revealed = hintsUsed.includes(hint.id);
            const gated = Boolean(hint.requiresHintId) && !hintsUsed.includes(hint.requiresHintId as string);
            if (revealed) {
              return (
                <div
                  key={hint.id}
                  className="flex w-full items-start gap-2 rounded-md bg-warning-50 p-3 text-sm text-text-primary"
                >
                  <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-warning-600" aria-hidden="true" />
                  <span>{pick(hint.text, locale)}</span>
                </div>
              );
            }
            return (
              <Button
                key={hint.id}
                type="button"
                variant="outline"
                size="sm"
                disabled={gated}
                onClick={() => onUseHint(hint, index)}
                className="gap-2"
              >
                <Lightbulb className="h-4 w-4" aria-hidden="true" />
                {pick(COPY.revealHint, locale)} (-{hint.cost} {pick(COPY.pointsAbbrev, locale)})
              </Button>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{pick(COPY.submitFlagHeading, locale)}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isFinalStageUnlocked ? (
            <>
              <div className="flex flex-col gap-2 tablet:flex-row">
                <Input
                  dir="ltr"
                  value={flagInput}
                  onChange={(e) => onFlagInputChange(e.target.value)}
                  placeholder="CTF{...}"
                  className="font-mono"
                  aria-label={pick(COPY.flagInputLabel, locale)}
                />
                <Button type="button" onClick={onSubmitFlag} className="gap-2 shrink-0">
                  <Send className="h-4 w-4" aria-hidden="true" />
                  {pick(COPY.submitFlag, locale)}
                </Button>
              </div>
              {flagFeedback === "incorrect" && (
                <p className="flex items-center gap-2 text-sm text-danger-600">
                  <XCircle className="h-4 w-4" aria-hidden="true" />
                  {pick(COPY.incorrectFlag, locale)}
                </p>
              )}
            </>
          ) : (
            <p className="flex items-center gap-2 text-sm text-text-muted">
              <Lock className="h-4 w-4 shrink-0" aria-hidden="true" />
              {pick(COPY.completeStepsNote, locale)}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Web artifact panels
// ---------------------------------------------------------------------------

function WebArtifactPanel({
  artifact,
  locale,
  workstationState,
  onWorkstationChange,
}: {
  artifact: WebArtifact;
  locale: AppLocale;
  workstationState: CtfWorkstationState;
  onWorkstationChange: (patch: CtfWorkstationState) => void;
}) {
  if (artifact.kind === "html_source") {
    return <WebSourcePanel artifact={artifact} locale={locale} />;
  }
  return (
    <WebApiPanel
      artifact={artifact}
      locale={locale}
      workstationState={workstationState}
      onWorkstationChange={onWorkstationChange}
    />
  );
}

function WebSourcePanel({
  artifact,
  locale,
}: {
  artifact: Extract<WebArtifact, { kind: "html_source" }>;
  locale: AppLocale;
}) {
  return (
    <div dir="ltr" className="overflow-x-auto rounded-md border border-neutral-800 bg-neutral-950 font-mono text-xs">
      <div className="border-b border-neutral-800 bg-neutral-900 px-4 py-2 text-neutral-400">
        {pick(artifact.pageTitle, locale)}
      </div>
      <div className="p-4">
        {artifact.lines.map((line, i) => (
          <div key={i} className="flex gap-4">
            <span className="w-8 shrink-0 select-none text-end text-neutral-600">{i + 1}</span>
            <span className="whitespace-pre text-neutral-100">{line.content}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function WebApiPanel({
  artifact,
  locale,
  workstationState,
  onWorkstationChange,
}: {
  artifact: Extract<WebArtifact, { kind: "api_console" }>;
  locale: AppLocale;
  workstationState: CtfWorkstationState;
  onWorkstationChange: (patch: CtfWorkstationState) => void;
}) {
  const initialId = typeof workstationState.invoiceId === "string" ? workstationState.invoiceId : artifact.defaultInvoiceId;
  const [invoiceIdInput, setInvoiceIdInput] = React.useState(initialId);
  const [lastResponse, setLastResponse] = React.useState<string | null>(null);

  function handleSend() {
    const lookupValue = extractLookupValue(invoiceIdInput);
    const record = artifact.records.find((r) => r.id === lookupValue);
    const json = record ? record.json : artifact.notFoundJson;
    setLastResponse(json);
    onWorkstationChange({ invoiceId: invoiceIdInput.trim() });
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium text-text-muted">{pick(artifact.endpointLabel, locale)}</p>
      <div className="flex flex-col gap-2 tablet:flex-row">
        <Input
          dir="ltr"
          value={invoiceIdInput}
          onChange={(e) => setInvoiceIdInput(e.target.value)}
          className="font-mono"
        />
        <Button type="button" variant="outline" onClick={handleSend}>
          {pick(COPY.sendRequest, locale)}
        </Button>
      </div>
      <pre
        dir="ltr"
        className="overflow-x-auto whitespace-pre-wrap break-all rounded-md bg-neutral-950 p-4 font-mono text-xs text-neutral-100"
      >
        {lastResponse ?? pick(COPY.apiConsolePrompt, locale)}
      </pre>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Forensics artifact panels
// ---------------------------------------------------------------------------

function ForensicsArtifactPanel({
  artifact,
  locale,
  workstationState,
  onWorkstationChange,
}: {
  artifact: ForensicsArtifact;
  locale: AppLocale;
  workstationState: CtfWorkstationState;
  onWorkstationChange: (patch: CtfWorkstationState) => void;
}) {
  if (artifact.kind === "access_log") {
    return (
      <ForensicsLogPanel
        artifact={artifact}
        locale={locale}
        workstationState={workstationState}
        onWorkstationChange={onWorkstationChange}
      />
    );
  }
  return <ForensicsHexPanel artifact={artifact} />;
}

function ForensicsLogPanel({
  artifact,
  locale,
  workstationState,
  onWorkstationChange,
}: {
  artifact: Extract<ForensicsArtifact, { kind: "access_log" }>;
  locale: AppLocale;
  workstationState: CtfWorkstationState;
  onWorkstationChange: (patch: CtfWorkstationState) => void;
}) {
  const initialInput = typeof workstationState.decoderInput === "string" ? workstationState.decoderInput : "";
  const [decoderInput, setDecoderInput] = React.useState(initialInput);
  const [decoderOutput, setDecoderOutput] = React.useState<string | null>(null);
  const [decodeError, setDecodeError] = React.useState(false);

  function handleDecode() {
    try {
      const decoded = window.atob(decoderInput.trim());
      setDecoderOutput(decoded);
      setDecodeError(false);
    } catch {
      setDecoderOutput(null);
      setDecodeError(true);
    }
    onWorkstationChange({ decoderInput });
  }

  return (
    <div className="space-y-4">
      <div
        dir="ltr"
        className="max-h-72 overflow-y-auto rounded-md border border-neutral-800 bg-black p-4 font-mono text-xs text-success-500"
      >
        {artifact.lines.map((line, i) => (
          <div key={i} className="whitespace-pre-wrap break-all py-0.5">
            {line}
          </div>
        ))}
      </div>
      <div className="space-y-2 rounded-md border border-border p-3">
        <p className="text-xs font-medium text-text-muted">{pick(COPY.base64DecoderLabel, locale)}</p>
        <Input
          dir="ltr"
          value={decoderInput}
          onChange={(e) => setDecoderInput(e.target.value)}
          placeholder={pick(COPY.base64DecoderPlaceholder, locale)}
          className="font-mono"
        />
        <Button type="button" variant="outline" size="sm" onClick={handleDecode}>
          {pick(COPY.decodeButton, locale)}
        </Button>
        {decoderOutput !== null && (
          <p dir="ltr" className="break-all rounded-md bg-surface-raised p-2 font-mono text-xs text-text-primary">
            {decoderOutput}
          </p>
        )}
        {decodeError && <p className="text-xs text-danger-600">{pick(COPY.decodeError, locale)}</p>}
      </div>
    </div>
  );
}

function ForensicsHexPanel({ artifact }: { artifact: Extract<ForensicsArtifact, { kind: "hex_dump" }> }) {
  return (
    <div
      dir="ltr"
      className="overflow-x-auto rounded-md border border-neutral-800 bg-neutral-950 p-4 font-mono text-xs text-neutral-100"
    >
      {artifact.rows.map((row, i) => (
        <div key={i} className="whitespace-pre">
          {`${row.offset} ${row.hexGroup1.join(" ")} ${row.hexGroup2.join(" ")} |${row.ascii}|`}
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Crypto artifact panels
// ---------------------------------------------------------------------------

function CryptoArtifactPanel({
  artifact,
  locale,
  workstationState,
  onWorkstationChange,
}: {
  artifact: CryptoArtifact;
  locale: AppLocale;
  workstationState: CtfWorkstationState;
  onWorkstationChange: (patch: CtfWorkstationState) => void;
}) {
  if (artifact.kind === "caesar_shift") {
    return (
      <CryptoCaesarPanel
        artifact={artifact}
        locale={locale}
        workstationState={workstationState}
        onWorkstationChange={onWorkstationChange}
      />
    );
  }
  return (
    <CryptoStackedPanel
      artifact={artifact}
      locale={locale}
      workstationState={workstationState}
      onWorkstationChange={onWorkstationChange}
    />
  );
}

function CryptoCaesarPanel({
  artifact,
  locale,
  workstationState,
  onWorkstationChange,
}: {
  artifact: Extract<CryptoArtifact, { kind: "caesar_shift" }>;
  locale: AppLocale;
  workstationState: CtfWorkstationState;
  onWorkstationChange: (patch: CtfWorkstationState) => void;
}) {
  const initialShift = typeof workstationState.shift === "number" ? workstationState.shift : 0;
  return (
    <div className="space-y-4">
      <div>
        <p className="mb-1 text-xs font-medium text-text-muted">{pick(COPY.ciphertextLabel, locale)}</p>
        <p dir="ltr" className="break-all rounded-md bg-neutral-950 p-3 font-mono text-sm text-neutral-100">
          {artifact.ciphertext}
        </p>
      </div>
      <ShiftDecoderTool
        locale={locale}
        sourceText={artifact.ciphertext}
        initialShift={initialShift}
        onShiftChange={(shift) => onWorkstationChange({ shift })}
      />
    </div>
  );
}

function CryptoStackedPanel({
  artifact,
  locale,
  workstationState,
  onWorkstationChange,
}: {
  artifact: Extract<CryptoArtifact, { kind: "stacked_encoding" }>;
  locale: AppLocale;
  workstationState: CtfWorkstationState;
  onWorkstationChange: (patch: CtfWorkstationState) => void;
}) {
  const [decodedBase64, setDecodedBase64] = React.useState<string | null>(
    typeof workstationState.decodedBase64 === "string" ? workstationState.decodedBase64 : null
  );
  const [decodeError, setDecodeError] = React.useState(false);
  const initialShift = typeof workstationState.shift === "number" ? workstationState.shift : 0;

  function handleDecodeBase64() {
    try {
      const decoded = window.atob(artifact.encodedText);
      setDecodedBase64(decoded);
      setDecodeError(false);
      onWorkstationChange({ decodedBase64: decoded });
    } catch {
      setDecodedBase64(null);
      setDecodeError(true);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-1 text-xs font-medium text-text-muted">{pick(COPY.encodedArtifactLabel, locale)}</p>
        <p dir="ltr" className="break-all rounded-md bg-neutral-950 p-3 font-mono text-sm text-neutral-100">
          {artifact.encodedText}
        </p>
      </div>
      <div className="space-y-2 rounded-md border border-border p-3">
        <p className="text-xs font-medium text-text-muted">{pick(COPY.base64DecoderLabel, locale)}</p>
        <Button type="button" variant="outline" size="sm" onClick={handleDecodeBase64}>
          {pick(COPY.decodeButton, locale)}
        </Button>
        {decodedBase64 !== null && (
          <p dir="ltr" className="break-all rounded-md bg-surface-raised p-2 font-mono text-xs text-text-primary">
            {decodedBase64}
          </p>
        )}
        {decodeError && <p className="text-xs text-danger-600">{pick(COPY.decodeError, locale)}</p>}
      </div>
      {decodedBase64 !== null && (
        <ShiftDecoderTool
          locale={locale}
          sourceText={decodedBase64}
          initialShift={initialShift}
          onShiftChange={(shift) => onWorkstationChange({ shift })}
        />
      )}
    </div>
  );
}

/** Shared by both crypto artifacts: a 0-25 shift slider with a live
 * Caesar-shifted preview of whatever source text is passed in. */
function ShiftDecoderTool({
  locale,
  sourceText,
  initialShift,
  onShiftChange,
}: {
  locale: AppLocale;
  sourceText: string;
  initialShift: number;
  onShiftChange: (shift: number) => void;
}) {
  const [shift, setShift] = React.useState(initialShift);
  const preview = caesarShiftText(sourceText, shift);

  function handleChange(value: number) {
    const clamped = Math.max(0, Math.min(25, value));
    setShift(clamped);
    onShiftChange(clamped);
  }

  return (
    <div className="space-y-2 rounded-md border border-border p-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-medium text-text-muted">{pick(COPY.shiftLabel, locale)}</span>
        <span className="font-mono text-sm font-semibold text-text-primary">{shift}</span>
      </div>
      <input
        type="range"
        min={0}
        max={25}
        value={shift}
        onChange={(e) => handleChange(Number(e.target.value))}
        className="w-full accent-primary"
        aria-label={pick(COPY.shiftLabel, locale)}
      />
      <div>
        <p className="mb-1 text-xs font-medium text-text-muted">{pick(COPY.decodedPreviewLabel, locale)}</p>
        <p dir="ltr" className="break-all rounded-md bg-surface-raised p-2 font-mono text-xs text-text-primary">
          {preview}
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Consequence
// ---------------------------------------------------------------------------

function ConsequenceScreen({
  locale,
  challenge,
  hintsUsed,
  score,
  onContinue,
}: {
  locale: AppLocale;
  challenge: CtfChallengeData;
  hintsUsed: string[];
  score: number;
  onContinue: () => void;
}) {
  return (
    <div className="mx-auto max-w-2xl space-y-4" dir={locale === "ar" ? "rtl" : "ltr"} data-brand="labs">
      <Card>
        <CardHeader className="items-center text-center">
          <Badge variant="success" className="mb-2">
            {pick(COPY.flagCaptured, locale)}
          </Badge>
          <CardTitle className="font-display text-xl">{pick(challenge.debrief.headline, locale)}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-text-primary">{pick(COPY.whatHappenedLabel, locale)}</h3>
            <p className="mt-1 text-sm text-text-secondary">{pick(challenge.debrief.whatHappened, locale)}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-primary">{pick(COPY.whyItMatteredLabel, locale)}</h3>
            <p className="mt-1 text-sm text-text-secondary">{pick(challenge.debrief.whyItMattered, locale)}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-center text-sm">
            <div className="rounded-md bg-surface-raised p-3">
              <p className="text-text-muted">{pick(COPY.finalScoreLabel, locale)}</p>
              <p className="font-display text-lg font-bold text-text-primary">{score}/100</p>
            </div>
            <div className="rounded-md bg-surface-raised p-3">
              <p className="text-text-muted">{pick(COPY.hintsUsedLabel, locale)}</p>
              <p className="font-display text-lg font-bold text-text-primary">{hintsUsed.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-center">
        <Button size="lg" onClick={onContinue}>
          {pick(COPY.continueLabel, locale)}
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Complete
// ---------------------------------------------------------------------------

function CompleteScreen({
  locale,
  challenge,
  score,
  passed,
  anonId,
  isSaved,
  displayXp,
  showRegisterForm,
  onHideRegisterForm,
  onRegistered,
  onShare,
  shareStatus,
  onRestart,
}: {
  locale: AppLocale;
  challenge: CtfChallengeData;
  score: number;
  passed: boolean;
  anonId: string;
  isSaved: boolean;
  displayXp: number;
  showRegisterForm: boolean;
  onHideRegisterForm: () => void;
  onRegistered: (result: { xpAwarded: number; badgeAwarded: boolean }) => void;
  onShare: () => void;
  shareStatus: "idle" | "copied";
  onRestart: () => void;
}) {
  return (
    <div className="mx-auto max-w-lg space-y-6" dir={locale === "ar" ? "rtl" : "ltr"} data-brand="labs">
      <WinCelebration active={passed} />
      <Card>
        <CardHeader className="items-center text-center">
          <Badge variant={passed ? "success" : "primary"} className="mb-2">
            {passed ? pick(COPY.passedHeading, locale) : pick(COPY.challengeComplete, locale)}
          </Badge>
          <CardTitle className="font-display text-2xl">{pick(challenge.title, locale)}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center gap-6 tablet:flex-row tablet:justify-center tablet:gap-10">
            <ScoreGauge score={score} label={pick(COPY.scoreLabel, locale)} size="lg" />
            <div className="flex flex-col items-center gap-2">
              <Sparkles className="h-6 w-6 text-xp" aria-hidden="true" />
              <p className="font-display text-3xl font-bold text-text-primary">{displayXp}</p>
              <p className="text-sm text-text-muted">{pick(COPY.xpLabel, locale)}</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <AchievementBadge
                name={pick(challenge.badge.name, locale)}
                description={pick(challenge.badge.description, locale)}
                icon={CATEGORY_ICON[challenge.category]}
                unlocked={passed}
                size="lg"
              />
              <p className="text-sm text-text-muted">
                {passed ? pick(COPY.badgeUnlocked, locale) : pick(COPY.badgeLockedNote, locale)}
              </p>
            </div>
          </div>

          {!passed && (
            <div className="flex items-start gap-2 rounded-md border border-warning-200 bg-warning-50 p-3 text-start text-sm text-warning-800">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <div>
                <p className="font-semibold">{pick(COPY.notPassedHeading, locale)}</p>
                <p className="mt-1 text-xs">{pick(COPY.notPassedBody, locale)}</p>
              </div>
            </div>
          )}

          <Button type="button" variant="outline" className="w-full" onClick={onShare}>
            <Share2 className="h-4 w-4" aria-hidden="true" />
            {shareStatus === "copied" ? pick(COPY.shareCopied, locale) : pick(COPY.shareAchievement, locale)}
          </Button>

          {isSaved && <p className="text-center text-xs text-text-muted">{pick(COPY.savedToAccount, locale)}</p>}
        </CardContent>
      </Card>

      {!isSaved && showRegisterForm && (
        <Card data-brand="labs">
          <CardHeader>
            <CardTitle className="text-lg">{pick(COPY.registerHeading, locale)}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-text-secondary">{pick(COPY.registerBody, locale)}</p>
            <InlineRegisterForm
              locale={locale}
              anonId={anonId}
              challengeKey={challenge.challengeKey as ChallengeKey}
              registerCta={pick(COPY.registerCta, locale)}
              onRegistered={onRegistered}
            />
            <Button type="button" variant="ghost" size="sm" className="w-full" onClick={onHideRegisterForm}>
              {pick(COPY.registerLater, locale)}
            </Button>
          </CardContent>
        </Card>
      )}
      {!isSaved && !showRegisterForm && <p className="text-center text-xs text-text-muted">{pick(COPY.anonymousNote, locale)}</p>}

      <Card data-brand="labs">
        <CardContent className="flex flex-col items-center gap-3 py-5 text-center">
          <Button asChild className="w-full tablet:w-auto">
            <Link href="/labs/ctf">{pick(COPY.tryAnother, locale)}</Link>
          </Button>
        </CardContent>
      </Card>

      <div className="text-center">
        <Button type="button" variant="ghost" size="sm" onClick={onRestart}>
          {pick(COPY.restart, locale)}
        </Button>
      </div>
    </div>
  );
}
