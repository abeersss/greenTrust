"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScoreGauge } from "@/components/greentrust/score-gauge";
import { AchievementBadge } from "@/components/labs/achievement-badge";
import { InlineRegisterForm } from "./inline-register-form";
import { Link } from "@/lib/i18n/navigation";
import { pick } from "@/lib/challenges/bilingual";
import {
  SOC_NIGHT_SHIFT_CHALLENGE_KEY,
  SOC_ALERTS,
  SOC_INVESTIGATION_BUDGET,
  computeSocNightShiftScore,
  getSocConsequenceCopy,
  type AlertId,
  type Decision,
  type SocNightShiftSubmission,
} from "@/lib/challenges/soc-night-shift";
import {
  getOrCreateAnonId,
  loadChallengeProgress,
  saveChallengeProgress,
  clearChallengeProgress,
} from "@/lib/challenges/anon-session";
import { saveAnonymousChallengeProgress, claimChallengeForCurrentUser } from "@/lib/actions/challenge";
import { BADGE_PASS_SCORE } from "@/lib/challenges/keys";
import { WinCelebration } from "@/components/shared/win-celebration";
import { trackEvent } from "@/lib/analytics/track";
import type { AppLocale } from "@/lib/i18n/config";
import { Siren, Clock, Search, CheckCircle2, XCircle, Eye, Sparkles, Share2, ArrowUpCircle, PauseCircle, XOctagon, ShieldAlert } from "lucide-react";

type Screen = "briefing" | "queue" | "consequence" | "complete";

const DECISION_ICON: Record<Decision, React.ReactNode> = {
  escalate: <ArrowUpCircle className="h-4 w-4" aria-hidden="true" />,
  monitor: <PauseCircle className="h-4 w-4" aria-hidden="true" />,
  close: <XOctagon className="h-4 w-4" aria-hidden="true" />,
};

const COPY = {
  caseIdLabel: { en: "SCENARIO", ar: "السيناريو" },
  beginShift: { en: "BEGIN SHIFT", ar: "ابدأ المناوبة" },
  missionTitle: { en: "CyberAbeer Decision Labs™ — SOC Night Shift™", ar: "CyberAbeer Decision Labs™ — مناوبة مركز العمليات الليلية™" },
  briefingBody: {
    en: "It's 2 AM and you are the only analyst covering the security operations center. Five alerts came in over the last hour. You only have enough time in this shift to fully investigate some of them — the rest you will have to decide on with whatever you already know. Escalate the real intrusions, close the false alarms, and don't page anyone for nothing.",
    ar: "الساعة الثانية فجرًا وأنت المحلل الوحيد المسؤول عن مركز العمليات الأمنية. وصلت خمسة تنبيهات خلال الساعة الماضية. لديك وقت في هذه المناوبة يكفي للتحقيق الكامل في بعضها فقط، أما البقية فعليك أن تقرر بشأنها بما تعرفه بالفعل. صعّد الاختراقات الحقيقية، أغلق الإنذارات الكاذبة، ولا تستدعِ أحدًا دون داعٍ.",
  },
  shiftClockLabel: { en: "Investigation budget", ar: "ميزانية التحقيق" },
  shiftClockRemaining: { en: "remaining", ar: "متبقٍّ" },
  queueHeading: { en: "Alert queue", ar: "قائمة التنبيهات" },
  reportedSeverity: { en: "Reported severity", ar: "الخطورة المُبلَّغ عنها" },
  severityLow: { en: "Low", ar: "منخفضة" },
  severityMedium: { en: "Medium", ar: "متوسطة" },
  severityHigh: { en: "High", ar: "عالية" },
  investigate: { en: "Investigate", ar: "تحقيق" },
  investigated: { en: "Investigated", ar: "تم التحقيق" },
  budgetExhausted: { en: "No investigation time left", ar: "لا يوجد وقت تحقيق متبقٍّ" },
  decisionEscalate: { en: "Escalate", ar: "تصعيد" },
  decisionMonitor: { en: "Monitor", ar: "مراقبة" },
  decisionClose: { en: "Close", ar: "إغلاق" },
  decided: { en: "Decision logged", ar: "تم تسجيل القرار" },
  decisionsRemaining: { en: "decisions remaining", ar: "قرارات متبقية" },
  endShift: { en: "END SHIFT", ar: "إنهاء المناوبة" },
  endShiftHint: { en: "Decide on every alert to end the shift.", ar: "قرر بشأن كل تنبيه لإنهاء المناوبة." },
  continue: { en: "Continue", ar: "متابعة" },
  debriefHeading: { en: "Shift debrief", ar: "ملخص المناوبة" },
  debriefYourCall: { en: "Your call", ar: "قرارك" },
  debriefCorrectCall: { en: "Correct call", ar: "القرار الصحيح" },
  whatHappenedLabel: { en: "What happened", ar: "ما الذي حدث" },
  whyItMatteredLabel: { en: "Why it mattered", ar: "لماذا كان هذا مهمًا" },
  keyDecisionLabel: { en: "The key decision", ar: "القرار الحاسم" },
  missionComplete: { en: "SHIFT COMPLETE", ar: "انتهت المناوبة" },
  completeTitle: { en: "SOC Night Shift™", ar: "مناوبة مركز العمليات الليلية™" },
  scoreLabel: { en: "Score", ar: "النتيجة" },
  xpLabel: { en: "XP Earned", ar: "نقاط الخبرة" },
  badgeName: { en: "SOC Night Shift", ar: "مناوبة مركز العمليات الليلية" },
  badgeDescription: { en: "Alerts triaged", ar: "تم فرز التنبيهات" },
  badgeUnlocked: { en: "Badge unlocked", ar: "تم فتح الشارة" },
  breachStat: { en: "Missed intrusions", ar: "اختراقات مفوَّتة" },
  fatigueStat: { en: "False escalations", ar: "تصعيدات كاذبة" },
  skillsPracticed: { en: "Skills Practiced", ar: "المهارات المُمارَسة" },
  skillLabels: [
    { en: "Alert triage under time pressure", ar: "فرز التنبيهات تحت ضغط الوقت" },
    { en: "Evidence-based decision making", ar: "اتخاذ القرار المبني على الأدلة" },
    { en: "Investigation prioritization", ar: "تحديد أولويات التحقيق" },
    { en: "False-positive management", ar: "إدارة الإنذارات الكاذبة" },
  ],
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
  nextMission: { en: "Next Mission: Data Guardian", ar: "المهمة التالية: حارس البيانات" },
  nextMissionComingSoon: { en: "Data Guardian — coming soon", ar: "حارس البيانات — قريبًا" },
  backToLabs: { en: "Back to Decision Labs", ar: "العودة إلى معامل القرار" },
  restart: { en: "Work Another Shift", ar: "اعمل مناوبة أخرى" },
  strictEvaluationNote: {
    en: `This mission is strictly evaluated. You need a score of ${BADGE_PASS_SCORE}% or higher to earn the badge and trigger the win celebration.`,
    ar: `يتم تقييم هذه المهمة بصرامة. تحتاج إلى نتيجة ${BADGE_PASS_SCORE}% أو أعلى للحصول على الشارة وتفعيل احتفال الفوز.`,
  },
  passedHeading: { en: "SHIFT COMPLETE — PASSED", ar: "انتهت المناوبة — نجاح" },
  notPassedHeading: { en: "Below passing score", ar: "أقل من درجة النجاح" },
  notPassedBody: {
    en: `You scored below the ${BADGE_PASS_SCORE}% threshold required for the badge. Work another shift with sharper triage calls to raise your score.`,
    ar: `حصلت على نتيجة أقل من الحد المطلوب البالغ ${BADGE_PASS_SCORE}% للحصول على الشارة. اعمل مناوبة أخرى بقرارات فرز أدق لرفع نتيجتك.`,
  },
  badgeLockedNote: {
    en: `Score ${BADGE_PASS_SCORE}%+ to unlock`,
    ar: `احصل على ${BADGE_PASS_SCORE}%+ لفتحها`,
  },
} as const;

export function SocNightShiftChallenge({
  locale,
  shareUrl,
  isAuthenticated,
}: {
  locale: AppLocale;
  shareUrl: string;
  isAuthenticated: boolean;
}) {
  const [screen, setScreen] = React.useState<Screen>("briefing");
  const [anonId, setAnonId] = React.useState("");
  const [decisions, setDecisions] = React.useState<Partial<Record<AlertId, Decision>>>({});
  const [investigatedClueIds, setInvestigatedClueIds] = React.useState<string[]>([]);
  const [startedAt, setStartedAt] = React.useState<string | null>(null);
  const [completedAt, setCompletedAt] = React.useState<string | null>(null);
  const [claimed, setClaimed] = React.useState(false);
  const [claimedXp, setClaimedXp] = React.useState<number | undefined>(undefined);
  const [registeredResult, setRegisteredResult] = React.useState<{ xpAwarded: number; badgeAwarded: boolean } | null>(null);
  const [showRegisterForm, setShowRegisterForm] = React.useState(true);
  const [shareStatus, setShareStatus] = React.useState<"idle" | "copied">("idle");
  const hydrated = React.useRef(false);
  const startedAnalytics = React.useRef(false);
  const autoClaimAttempted = React.useRef(false);

  React.useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    const id = getOrCreateAnonId();
    setAnonId(id);
    const saved = loadChallengeProgress<SocNightShiftSubmission & { completed?: boolean }>(SOC_NIGHT_SHIFT_CHALLENGE_KEY);
    if (saved && saved.stepsState?.decisions) {
      setDecisions(saved.stepsState.decisions);
      setInvestigatedClueIds(saved.stepsState.investigatedClueIds ?? []);
      setStartedAt(saved.startedAt);
      setClaimed(Boolean(saved.claimed));
      setClaimedXp(saved.claimedXp);
      if (saved.completedAt) {
        setCompletedAt(saved.completedAt);
        setScreen("complete");
        startedAnalytics.current = true;
      }
    }
  }, []);

  React.useEffect(() => {
    if (screen !== "complete") return;
    if (!isAuthenticated) return;
    if (claimed) return;
    if (autoClaimAttempted.current) return;
    autoClaimAttempted.current = true;
    let cancelled = false;
    claimChallengeForCurrentUser({ anonId, challengeKey: SOC_NIGHT_SHIFT_CHALLENGE_KEY }).then((result) => {
      if (cancelled) return;
      if (result.status === "success" && result.data) {
        handleClaimed(result.data);
      }
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, isAuthenticated, claimed, anonId]);

  function persist(submission: SocNightShiftSubmission, completed: boolean) {
    const nowIso = new Date().toISOString();
    const progress = {
      currentStepIndex: Object.keys(submission.decisions).length,
      stepsState: submission,
      startedAt: startedAt || nowIso,
      completedAt: completed ? nowIso : null,
      claimed,
      claimedXp,
    };
    saveChallengeProgress(SOC_NIGHT_SHIFT_CHALLENGE_KEY, progress);
    if (completed) setCompletedAt(nowIso);

    const result = computeSocNightShiftScore(submission);
    void saveAnonymousChallengeProgress({
      anonId,
      challengeKey: SOC_NIGHT_SHIFT_CHALLENGE_KEY,
      status: completed ? "completed" : "in_progress",
      currentStep: Object.keys(submission.decisions).length,
      score: result.score,
      xpEarned: result.xp,
      hintsUsed: 0,
      stepsState: submission,
      locale,
    });
  }

  function handleBeginShift() {
    const now = new Date().toISOString();
    setStartedAt(now);
    setScreen("queue");
    if (!startedAnalytics.current) {
      startedAnalytics.current = true;
      trackEvent("challenge_started", { locale, challengeKey: SOC_NIGHT_SHIFT_CHALLENGE_KEY });
    }
  }

  function handleInvestigate(clueId: string) {
    if (investigatedClueIds.includes(clueId)) return;
    if (investigatedClueIds.length >= SOC_INVESTIGATION_BUDGET) return;
    const next = [...investigatedClueIds, clueId];
    setInvestigatedClueIds(next);
    persist({ decisions, investigatedClueIds: next }, false);
  }

  function handleDecide(alertId: AlertId, decision: Decision) {
    const next = { ...decisions, [alertId]: decision };
    setDecisions(next);
    persist({ decisions: next, investigatedClueIds }, false);
  }

  function handleEndShift() {
    const submission: SocNightShiftSubmission = { decisions, investigatedClueIds };
    const result = computeSocNightShiftScore(submission);
    persist(submission, false);
    trackEvent("challenge_result_computed", { locale, challengeKey: SOC_NIGHT_SHIFT_CHALLENGE_KEY, score: result.score, outcome: result.outcome });
    setScreen("consequence");
  }

  function handleFinishConsequence() {
    const submission: SocNightShiftSubmission = { decisions, investigatedClueIds };
    const result = computeSocNightShiftScore(submission);
    persist(submission, true);
    trackEvent("challenge_completed", { locale, challengeKey: SOC_NIGHT_SHIFT_CHALLENGE_KEY, score: result.score, xp: result.xp, outcome: result.outcome });
    setScreen("complete");
  }

  function handleClaimed(result: { xpAwarded: number; badgeAwarded: boolean }) {
    setClaimed(true);
    const localResult = computeSocNightShiftScore({ decisions, investigatedClueIds });
    const safeXp = result.xpAwarded || localResult.xp;
    setClaimedXp(safeXp);
    setRegisteredResult({ ...result, xpAwarded: safeXp });
    saveChallengeProgress(SOC_NIGHT_SHIFT_CHALLENGE_KEY, {
      currentStepIndex: Object.keys(decisions).length,
      stepsState: { decisions, investigatedClueIds },
      startedAt: startedAt || new Date().toISOString(),
      completedAt: completedAt ?? new Date().toISOString(),
      claimed: true,
      claimedXp: safeXp,
    });
    if (result.badgeAwarded) {
      trackEvent("badge_awarded", { locale, challengeKey: SOC_NIGHT_SHIFT_CHALLENGE_KEY });
    }
  }

  async function handleShare() {
    const result = computeSocNightShiftScore({ decisions, investigatedClueIds });
    const shareText =
      locale === "ar"
        ? `أكملت CyberAbeer Decision Labs™ مناوبة مركز العمليات الليلية — النتيجة: ${result.score}% | نقاط الخبرة: ${result.xp}`
        : `I completed CyberAbeer Decision Labs™ SOC Night Shift™ — Score: ${result.score}% | XP: ${result.xp}`;
    trackEvent("challenge_result_shared", { locale, challengeKey: SOC_NIGHT_SHIFT_CHALLENGE_KEY, score: result.score });
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
    setDecisions({});
    setInvestigatedClueIds([]);
    setCompletedAt(null);
    setClaimed(false);
    setClaimedXp(undefined);
    setRegisteredResult(null);
    setScreen("briefing");
    clearChallengeProgress(SOC_NIGHT_SHIFT_CHALLENGE_KEY);
  }

  if (!anonId) return null;

  if (screen === "briefing") {
    return <BriefingScreen locale={locale} onBegin={handleBeginShift} />;
  }

  if (screen === "queue") {
    return (
      <QueueScreen
        locale={locale}
        decisions={decisions}
        investigatedClueIds={investigatedClueIds}
        onInvestigate={handleInvestigate}
        onDecide={handleDecide}
        onEndShift={handleEndShift}
      />
    );
  }

  if (screen === "consequence") {
    return (
      <ConsequenceScreen
        locale={locale}
        submission={{ decisions, investigatedClueIds }}
        onContinue={handleFinishConsequence}
      />
    );
  }

  const result = computeSocNightShiftScore({ decisions, investigatedClueIds });
  const passed = result.score >= BADGE_PASS_SCORE;
  return (
    <CompleteScreen
      locale={locale}
      result={result}
      passed={passed}
      anonId={anonId}
      isSaved={claimed || Boolean(registeredResult) || isAuthenticated}
      displayXp={registeredResult ? registeredResult.xpAwarded || result.xp : claimed ? claimedXp || result.xp : result.xp}
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

function BriefingScreen({ locale, onBegin }: { locale: AppLocale; onBegin: () => void }) {
  return (
    <Card className="mx-auto max-w-lg" data-brand="labs">
      <CardHeader className="items-center text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 text-primary-700">
          <Siren className="h-7 w-7" aria-hidden="true" />
        </div>
        <Badge variant="primary">{pick(COPY.caseIdLabel, locale)}</Badge>
        <CardTitle className="font-display text-2xl">{pick(COPY.missionTitle, locale)}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-center">
        <div className="rounded-md bg-surface-raised p-4 text-start">
          <p className="text-sm text-text-secondary">{pick(COPY.briefingBody, locale)}</p>
        </div>
        <div className="flex items-start gap-2 rounded-md border border-warning-200 bg-warning-50 p-3 text-start">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-warning-600" aria-hidden="true" />
          <p className="text-xs text-text-secondary">{pick(COPY.strictEvaluationNote, locale)}</p>
        </div>
        <Button className="w-full" size="lg" onClick={onBegin}>
          {pick(COPY.beginShift, locale)}
        </Button>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Queue / workstation
// ---------------------------------------------------------------------------

function severityLabel(severity: "low" | "medium" | "high", locale: AppLocale) {
  if (severity === "low") return pick(COPY.severityLow, locale);
  if (severity === "medium") return pick(COPY.severityMedium, locale);
  return pick(COPY.severityHigh, locale);
}

function severityVariant(severity: "low" | "medium" | "high"): "outline" | "warning" | "danger" {
  if (severity === "low") return "outline";
  if (severity === "medium") return "warning";
  return "danger";
}

function QueueScreen({
  locale,
  decisions,
  investigatedClueIds,
  onInvestigate,
  onDecide,
  onEndShift,
}: {
  locale: AppLocale;
  decisions: Partial<Record<AlertId, Decision>>;
  investigatedClueIds: string[];
  onInvestigate: (clueId: string) => void;
  onDecide: (alertId: AlertId, decision: Decision) => void;
  onEndShift: () => void;
}) {
  const budgetRemaining = SOC_INVESTIGATION_BUDGET - investigatedClueIds.length;
  const decidedCount = Object.keys(decisions).length;
  const allDecided = decidedCount === SOC_ALERTS.length;

  return (
    <div className="mx-auto max-w-3xl space-y-4" dir={locale === "ar" ? "rtl" : "ltr"} data-brand="labs">
      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-warning-600" aria-hidden="true" />
            <div>
              <p className="text-xs text-text-muted">{pick(COPY.shiftClockLabel, locale)}</p>
              <p className="font-display text-lg font-bold text-text-primary">
                {budgetRemaining} {pick(COPY.shiftClockRemaining, locale)}
              </p>
            </div>
          </div>
          <div className="text-end">
            <p className="text-xs text-text-muted">{pick(COPY.queueHeading, locale)}</p>
            <p className="font-display text-lg font-bold text-text-primary">
              {decidedCount}/{SOC_ALERTS.length}
            </p>
          </div>
        </CardContent>
      </Card>

      {SOC_ALERTS.map((alert) => {
        const decision = decisions[alert.id];
        return (
          <Card key={alert.id} data-brand="labs">
            <CardHeader className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Badge variant={severityVariant(alert.reportedSeverity)}>{severityLabel(alert.reportedSeverity, locale)}</Badge>
                {decision && (
                  <Badge variant="outline" className="gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                    {pick(COPY.decided, locale)}
                  </Badge>
                )}
              </div>
              <CardTitle className="text-lg">{pick(alert.title, locale)}</CardTitle>
              <p className="text-xs text-text-muted">{pick(alert.source, locale)}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-text-secondary">{pick(alert.summary, locale)}</p>

              <div className="space-y-2">
                {alert.clues.map((clue) => {
                  const revealed = investigatedClueIds.includes(clue.id);
                  return (
                    <div key={clue.id} className="rounded-md border border-border p-3">
                      {revealed ? (
                        <p className="flex items-start gap-2 text-sm text-text-primary">
                          <Eye className="mt-0.5 h-4 w-4 shrink-0 text-primary-700" aria-hidden="true" />
                          {pick(clue.reveal, locale)}
                        </p>
                      ) : (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={budgetRemaining <= 0}
                          onClick={() => onInvestigate(clue.id)}
                          className="gap-2"
                        >
                          <Search className="h-4 w-4" aria-hidden="true" />
                          {pick(clue.action, locale)}
                        </Button>
                      )}
                    </div>
                  );
                })}
                {budgetRemaining <= 0 && (
                  <p className="text-xs text-text-muted">{pick(COPY.budgetExhausted, locale)}</p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2">
                {(["escalate", "monitor", "close"] as Decision[]).map((d) => (
                  <Button
                    key={d}
                    type="button"
                    variant={decision === d ? "primary" : "outline"}
                    size="sm"
                    className="gap-1.5"
                    onClick={() => onDecide(alert.id, d)}
                  >
                    {DECISION_ICON[d]}
                    {d === "escalate" ? pick(COPY.decisionEscalate, locale) : d === "monitor" ? pick(COPY.decisionMonitor, locale) : pick(COPY.decisionClose, locale)}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}

      <Card>
        <CardContent className="flex flex-col items-center gap-2 py-5 text-center">
          {!allDecided && <p className="text-sm text-text-muted">{pick(COPY.endShiftHint, locale)}</p>}
          <Button className="w-full tablet:w-auto" size="lg" disabled={!allDecided} onClick={onEndShift}>
            {pick(COPY.endShift, locale)}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Consequence
// ---------------------------------------------------------------------------

function ConsequenceScreen({
  locale,
  submission,
  onContinue,
}: {
  locale: AppLocale;
  submission: SocNightShiftSubmission;
  onContinue: () => void;
}) {
  const result = computeSocNightShiftScore(submission);
  const copy = getSocConsequenceCopy(result);
  const outcomeVariant: "success" | "warning" | "danger" =
    result.outcome === "clean_shift" ? "success" : result.outcome === "contained" ? "warning" : "danger";

  return (
    <div className="mx-auto max-w-2xl space-y-4" dir={locale === "ar" ? "rtl" : "ltr"} data-brand="labs">
      <Card>
        <CardHeader className="items-center text-center">
          <Badge variant={outcomeVariant} className="mb-2">
            {pick(copy.outcomeLabel, locale)}
          </Badge>
          <CardTitle className="font-display text-xl">{pick(copy.headline, locale)}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-text-primary">{pick(COPY.whatHappenedLabel, locale)}</h3>
            <p className="mt-1 text-sm text-text-secondary">{pick(copy.whatHappened, locale)}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-primary">{pick(COPY.whyItMatteredLabel, locale)}</h3>
            <p className="mt-1 text-sm text-text-secondary">{pick(copy.whyItMattered, locale)}</p>
          </div>
          <div className="rounded-md bg-surface-raised p-4">
            <h3 className="text-sm font-semibold text-text-primary">{pick(COPY.keyDecisionLabel, locale)}</h3>
            <p className="mt-1 text-sm text-text-secondary">{pick(copy.keyDecision, locale)}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{pick(COPY.debriefHeading, locale)}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {result.alertOutcomes.map((outcome) => {
            const alert = SOC_ALERTS.find((a) => a.id === outcome.alertId)!;
            return (
              <div key={outcome.alertId} className="flex items-center justify-between gap-3 rounded-md border border-border p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-text-primary">{pick(alert.title, locale)}</p>
                  <p className="text-xs text-text-muted">
                    {pick(COPY.debriefYourCall, locale)}:{" "}
                    {outcome.decision === "escalate" ? pick(COPY.decisionEscalate, locale) : outcome.decision === "monitor" ? pick(COPY.decisionMonitor, locale) : pick(COPY.decisionClose, locale)}
                    {" · "}
                    {pick(COPY.debriefCorrectCall, locale)}:{" "}
                    {outcome.correctDecision === "escalate" ? pick(COPY.decisionEscalate, locale) : pick(COPY.decisionClose, locale)}
                  </p>
                </div>
                {outcome.wasCorrect ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-success-600" aria-hidden="true" />
                ) : (
                  <XCircle className="h-5 w-5 shrink-0 text-danger-600" aria-hidden="true" />
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="text-center">
        <Button size="lg" onClick={onContinue}>
          {pick(COPY.continue, locale)}
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
  result,
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
  result: ReturnType<typeof computeSocNightShiftScore>;
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
            {passed ? pick(COPY.passedHeading, locale) : pick(COPY.missionComplete, locale)}
          </Badge>
          <CardTitle className="font-display text-2xl">{pick(COPY.completeTitle, locale)}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center gap-6 tablet:flex-row tablet:justify-center tablet:gap-10">
            <ScoreGauge score={result.score} label={pick(COPY.scoreLabel, locale)} size="lg" />
            <div className="flex flex-col items-center gap-2">
              <Sparkles className="h-6 w-6 text-xp" aria-hidden="true" />
              <p className="font-display text-3xl font-bold text-text-primary">{displayXp}</p>
              <p className="text-sm text-text-muted">{pick(COPY.xpLabel, locale)}</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <AchievementBadge name={pick(COPY.badgeName, locale)} description={pick(COPY.badgeDescription, locale)} unlocked={passed} size="lg" />
              <p className="text-sm text-text-muted">{passed ? pick(COPY.badgeUnlocked, locale) : pick(COPY.badgeLockedNote, locale)}</p>
            </div>
          </div>

          {!passed && (
            <div className="flex items-start gap-2 rounded-md border border-warning-200 bg-warning-50 p-3 text-start">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-warning-600" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold text-text-primary">{pick(COPY.notPassedHeading, locale)}</p>
                <p className="mt-1 text-xs text-text-secondary">{pick(COPY.notPassedBody, locale)}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 text-center text-sm">
            <div className="rounded-md bg-surface-raised p-3">
              <p className="text-text-muted">{pick(COPY.breachStat, locale)}</p>
              <p className="font-display text-lg font-bold text-text-primary">{result.breachCount}</p>
            </div>
            <div className="rounded-md bg-surface-raised p-3">
              <p className="text-text-muted">{pick(COPY.fatigueStat, locale)}</p>
              <p className="font-display text-lg font-bold text-text-primary">{result.fatigueCount}</p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-text-primary">{pick(COPY.skillsPracticed, locale)}</h3>
            <ul className="mt-2 space-y-1.5">
              {COPY.skillLabels.map((skill, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                  {pick(skill, locale)}
                </li>
              ))}
            </ul>
          </div>

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
              challengeKey={SOC_NIGHT_SHIFT_CHALLENGE_KEY}
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
          <h3 className="font-display text-lg font-semibold text-text-primary">{pick(COPY.nextMission, locale)}</h3>
          <Badge variant="outline">{pick(COPY.nextMissionComingSoon, locale)}</Badge>
          <Button asChild variant="outline" className="w-full tablet:w-auto">
            <Link href="/labs/decision-labs">{pick(COPY.backToLabs, locale)}</Link>
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
