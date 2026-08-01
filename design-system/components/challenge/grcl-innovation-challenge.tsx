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
  GRCL_CHALLENGE_KEY,
  BOARD_CASES,
  REVIEW_BUDGET,
  computeGRCLScore,
  getGRCLConsequenceCopy,
  type CaseId,
  type Decision,
  type GRCLSubmission,
} from "@/lib/challenges/grcl-innovation";
import {
  getOrCreateAnonId,
  loadChallengeProgress,
  saveChallengeProgress,
  clearChallengeProgress,
} from "@/lib/challenges/anon-session";
import { saveAnonymousChallengeProgress, claimChallengeForCurrentUser } from "@/lib/actions/challenge";
import { trackEvent } from "@/lib/analytics/track";
import type { AppLocale } from "@/lib/i18n/config";
import { Scale, Clock, Search, CheckCircle2, XCircle, Eye, Sparkles, Share2, ShieldCheck, Undo2 } from "lucide-react";

type Screen = "briefing" | "boardroom" | "consequence" | "complete";

const DECISION_ICON: Record<Decision, React.ReactNode> = {
  approve: <CheckCircle2 className="h-4 w-4" aria-hidden="true" />,
  approve_with_conditions: <ShieldCheck className="h-4 w-4" aria-hidden="true" />,
  send_back: <Undo2 className="h-4 w-4" aria-hidden="true" />,
  reject: <XCircle className="h-4 w-4" aria-hidden="true" />,
};

const COPY = {
  caseIdLabel: { en: "CASE", ar: "القضية" },
  beginShift: { en: "CONVENE BOARD", ar: "انعقاد المجلس" },
  missionTitle: { en: "CyberAbeer Decision Labs™ — GRCL: Innovation Under Fire™", ar: "CyberAbeer Decision Labs™ — GRCL: الابتكار تحت الضغط™" },
  briefingBody: {
    en: "You're the GRC officer on the company's Innovation Review Board, using Dr. Abeer Alshammari's GRCL framework: governance, risk, and compliance as one layered, connected decision, not three separate checkboxes. Five teams are pitching a fast-track, an exception, or a waiver this session. You only have enough time to fully investigate some of them — the rest you'll have to decide with whatever you already know. Approve what genuinely deserves it, condition what needs safeguards, send back what needs more work, and reject what should not proceed. A board that says no to everything isn't practicing governance, it's practicing risk-aversion.",
    ar: "أنتِ مسؤولة الحوكمة والمخاطر والامتثال في مجلس مراجعة الابتكار بالشركة، وتستخدمين إطار GRCL للدكتورة عبير الشمري: الحوكمة والمخاطر والامتثال كقرار واحد متكامل ومترابط، لا ثلاثة بنود منفصلة. تعرض خمسة فرق طلب تسريع أو استثناء أو تنازل عن سياسة في هذه الجلسة. لديك وقت يكفي للتحقيق الكامل في بعضها فقط، أما البقية فعليك حسمها بما تعرفينه بالفعل. وافقي على ما يستحق ذلك فعليًا، واشترطي ضوابط على ما يحتاجها، وأعيدي ما يحتاج مزيدًا من العمل، وارفضي ما لا ينبغي له أن يمضي قدمًا. المجلس الذي يرفض كل شيء لا يمارس الحوكمة، بل يمارس تجنب المخاطرة.",
  },
  shiftClockLabel: { en: "Review budget", ar: "ميزانية المراجعة" },
  shiftClockRemaining: { en: "remaining", ar: "متبقٍّ" },
  queueHeading: { en: "Case docket", ar: "جدول القضايا" },
  reportedSeverity: { en: "First impression", ar: "الانطباع الأول" },
  severityLow: { en: "Looks low-risk", ar: "يبدو منخفض المخاطر" },
  severityMedium: { en: "Looks contested", ar: "يبدو مثار جدل" },
  severityHigh: { en: "Looks high-risk", ar: "يبدو عالي المخاطر" },
  investigate: { en: "Investigate", ar: "تحقيق" },
  investigated: { en: "Investigated", ar: "تم التحقيق" },
  budgetExhausted: { en: "No review time left", ar: "لم يتبقَّ وقت للمراجعة" },
  decisionApprove: { en: "Approve", ar: "موافقة" },
  decisionApproveConditions: { en: "Approve w/ Conditions", ar: "موافقة مشروطة" },
  decisionSendBack: { en: "Send Back", ar: "إعادة للمراجعة" },
  decisionReject: { en: "Reject", ar: "رفض" },
  decided: { en: "Decision logged", ar: "تم تسجيل القرار" },
  decisionsRemaining: { en: "decisions remaining", ar: "قرارات متبقية" },
  endShift: { en: "ADJOURN BOARD", ar: "إنهاء الجلسة" },
  endShiftHint: { en: "Decide on every case to adjourn the board.", ar: "قرر بشأن كل قضية لإنهاء الجلسة." },
  continue: { en: "Continue", ar: "متابعة" },
  debriefHeading: { en: "Board debrief", ar: "ملخص الجلسة" },
  debriefYourCall: { en: "Your call", ar: "قرارك" },
  debriefCorrectCall: { en: "Correct call", ar: "القرار الصحيح" },
  whatHappenedLabel: { en: "What happened", ar: "ما الذي حدث" },
  whyItMatteredLabel: { en: "Why it mattered", ar: "لماذا كان هذا مهمًا" },
  keyDecisionLabel: { en: "The key decision", ar: "القرار الحاسم" },
  missionComplete: { en: "REVIEW COMPLETE", ar: "انتهت المراجعة" },
  completeTitle: { en: "GRCL: Innovation Under Fire™", ar: "GRCL: الابتكار تحت الضغط™" },
  scoreLabel: { en: "Score", ar: "النتيجة" },
  xpLabel: { en: "XP Earned", ar: "نقاط الخبرة" },
  badgeName: { en: "GRC Strategist", ar: "استراتيجي الحوكمة والمخاطر والامتثال" },
  badgeDescription: { en: "Governance decisions defended", ar: "تم الدفاع عن قرارات الحوكمة" },
  badgeUnlocked: { en: "Badge unlocked", ar: "تم فتح الشارة" },
  breachStat: { en: "Governance failures", ar: "إخفاقات حوكمية" },
  fatigueStat: { en: "Innovation blocked unnecessarily", ar: "ابتكار أُوقف دون داعٍ" },
  skillsPracticed: { en: "Skills Practiced", ar: "المهارات المُمارَسة" },
  skillLabels: [
    { en: "Weighing governance, risk, and compliance together", ar: "موازنة الحوكمة والمخاطر والامتثال معًا" },
    { en: "Evidence-based board decisions under time pressure", ar: "قرارات مجلس مبنية على الأدلة تحت ضغط الوقت" },
    { en: "Spotting authority bypass and rubber-stamping", ar: "اكتشاف تجاوز الصلاحيات والموافقة الشكلية" },
    { en: "Balancing innovation speed against real risk", ar: "موازنة سرعة الابتكار مقابل المخاطر الحقيقية" },
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
  nextMission: { en: "Next Mission: Agent Zero", ar: "المهمة التالية: العميل زيرو" },
  nextMissionComingSoon: { en: "Agent Zero — coming soon", ar: "العميل زيرو — قريبًا" },
  backToLabs: { en: "Back to Decision Labs", ar: "العودة إلى معامل القرار" },
  restart: { en: "Convene Another Board", ar: "انعقاد جلسة أخرى" },
} as const;

export function GRCLInnovationChallenge({
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
  const [decisions, setDecisions] = React.useState<Partial<Record<CaseId, Decision>>>({});
  const [investigatedClueIds, setInvestigatedClueIds] = React.useState<string[]>([]);
  const [startedAt, setStartedAt] = React.useState("");
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
    const saved = loadChallengeProgress<GRCLSubmission & { completed?: boolean }>(GRCL_CHALLENGE_KEY);
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
    claimChallengeForCurrentUser({ anonId, challengeKey: GRCL_CHALLENGE_KEY }).then((result) => {
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

  function persist(submission: GRCLSubmission, completed: boolean) {
    const nowIso = new Date().toISOString();
    const progress = {
      currentStepIndex: Object.keys(submission.decisions).length,
      stepsState: submission,
      startedAt: startedAt || nowIso,
      completedAt: completed ? nowIso : null,
      claimed,
      claimedXp,
    };
    saveChallengeProgress(GRCL_CHALLENGE_KEY, progress);
    if (completed) setCompletedAt(nowIso);

    const result = computeGRCLScore(submission);
    void saveAnonymousChallengeProgress({
      anonId,
      challengeKey: GRCL_CHALLENGE_KEY,
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
    setScreen("boardroom");
    if (!startedAnalytics.current) {
      startedAnalytics.current = true;
      trackEvent("challenge_started", { locale, challengeKey: GRCL_CHALLENGE_KEY });
    }
  }

  function handleInvestigate(clueId: string) {
    if (investigatedClueIds.includes(clueId)) return;
    if (investigatedClueIds.length >= REVIEW_BUDGET) return;
    const next = [...investigatedClueIds, clueId];
    setInvestigatedClueIds(next);
    persist({ decisions, investigatedClueIds: next }, false);
  }

  function handleDecide(caseId: CaseId, decision: Decision) {
    const next = { ...decisions, [caseId]: decision };
    setDecisions(next);
    persist({ decisions: next, investigatedClueIds }, false);
  }

  function handleEndShift() {
    const submission: GRCLSubmission = { decisions, investigatedClueIds };
    const result = computeGRCLScore(submission);
    persist(submission, false);
    trackEvent("challenge_result_computed", { locale, challengeKey: GRCL_CHALLENGE_KEY, score: result.score, outcome: result.outcome });
    setScreen("consequence");
  }

  function handleFinishConsequence() {
    const submission: GRCLSubmission = { decisions, investigatedClueIds };
    const result = computeGRCLScore(submission);
    persist(submission, true);
    trackEvent("challenge_completed", { locale, challengeKey: GRCL_CHALLENGE_KEY, score: result.score, xp: result.xp, outcome: result.outcome });
    setScreen("complete");
  }

  function handleClaimed(result: { xpAwarded: number; badgeAwarded: boolean }) {
    setClaimed(true);
    setClaimedXp(result.xpAwarded);
    setRegisteredResult(result);
    saveChallengeProgress(GRCL_CHALLENGE_KEY, {
      currentStepIndex: Object.keys(decisions).length,
      stepsState: { decisions, investigatedClueIds },
      startedAt: startedAt || new Date().toISOString(),
      completedAt: completedAt ?? new Date().toISOString(),
      claimed: true,
      claimedXp: result.xpAwarded,
    });
    if (result.badgeAwarded) {
      trackEvent("badge_awarded", { locale, challengeKey: GRCL_CHALLENGE_KEY });
    }
  }

  async function handleShare() {
    const result = computeGRCLScore({ decisions, investigatedClueIds });
    const shareText =
      locale === "ar"
        ? `أكملت CyberAbeer Decision Labs™ — GRCL: الابتكار تحت الضغط — النتيجة: ${result.score}% | نقاط الخبرة: ${result.xp}`
        : `I completed CyberAbeer Decision Labs™ GRCL: Innovation Under Fire™ — Score: ${result.score}% | XP: ${result.xp}`;
    trackEvent("challenge_result_shared", { locale, challengeKey: GRCL_CHALLENGE_KEY, score: result.score });
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
    clearChallengeProgress(GRCL_CHALLENGE_KEY);
  }

  if (!anonId) return null;

  if (screen === "briefing") {
    return <BriefingScreen locale={locale} onBegin={handleBeginShift} />;
  }

  if (screen === "boardroom") {
    return (
      <BoardroomScreen
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

  const result = computeGRCLScore({ decisions, investigatedClueIds });
  return (
    <CompleteScreen
      locale={locale}
      result={result}
      anonId={anonId}
      isSaved={claimed || Boolean(registeredResult) || isAuthenticated}
      displayXp={registeredResult ? registeredResult.xpAwarded : claimed ? claimedXp ?? result.xp : result.xp}
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
          <Scale className="h-7 w-7" aria-hidden="true" />
        </div>
        <Badge variant="primary">{pick(COPY.caseIdLabel, locale)}</Badge>
        <CardTitle className="font-display text-2xl">{pick(COPY.missionTitle, locale)}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-center">
        <div className="rounded-md bg-surface-raised p-4 text-start">
          <p className="text-sm text-text-secondary">{pick(COPY.briefingBody, locale)}</p>
        </div>
        <Button className="w-full" size="lg" onClick={onBegin}>
          {pick(COPY.beginShift, locale)}
        </Button>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Boardroom / workstation
// ---------------------------------------------------------------------------

function severityLabel(risk: "low" | "medium" | "high", locale: AppLocale) {
  if (risk === "low") return pick(COPY.severityLow, locale);
  if (risk === "medium") return pick(COPY.severityMedium, locale);
  return pick(COPY.severityHigh, locale);
}

function severityVariant(risk: "low" | "medium" | "high"): "outline" | "warning" | "danger" {
  if (risk === "low") return "outline";
  if (risk === "medium") return "warning";
  return "danger";
}

function decisionLabel(decision: Decision, locale: AppLocale) {
  if (decision === "approve") return pick(COPY.decisionApprove, locale);
  if (decision === "approve_with_conditions") return pick(COPY.decisionApproveConditions, locale);
  if (decision === "send_back") return pick(COPY.decisionSendBack, locale);
  return pick(COPY.decisionReject, locale);
}

function BoardroomScreen({
  locale,
  decisions,
  investigatedClueIds,
  onInvestigate,
  onDecide,
  onEndShift,
}: {
  locale: AppLocale;
  decisions: Partial<Record<CaseId, Decision>>;
  investigatedClueIds: string[];
  onInvestigate: (clueId: string) => void;
  onDecide: (caseId: CaseId, decision: Decision) => void;
  onEndShift: () => void;
}) {
  const budgetRemaining = REVIEW_BUDGET - investigatedClueIds.length;
  const decidedCount = Object.keys(decisions).length;
  const allDecided = decidedCount === BOARD_CASES.length;

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
              {decidedCount}/{BOARD_CASES.length}
            </p>
          </div>
        </CardContent>
      </Card>

      {BOARD_CASES.map((boardCase) => {
        const decision = decisions[boardCase.id];
        return (
          <Card key={boardCase.id} data-brand="labs">
            <CardHeader className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Badge variant={severityVariant(boardCase.apparentRisk)}>{severityLabel(boardCase.apparentRisk, locale)}</Badge>
                {decision && (
                  <Badge variant="outline" className="gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                    {pick(COPY.decided, locale)}
                  </Badge>
                )}
              </div>
              <CardTitle className="text-lg">{pick(boardCase.title, locale)}</CardTitle>
              <p className="text-xs text-text-muted">{pick(boardCase.pitchTeam, locale)}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-text-secondary">{pick(boardCase.summary, locale)}</p>

              <div className="space-y-2">
                {boardCase.clues.map((clue) => {
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

              <div className="grid grid-cols-2 gap-2 tablet:grid-cols-4">
                {(["approve", "approve_with_conditions", "send_back", "reject"] as Decision[]).map((d) => (
                  <Button
                    key={d}
                    type="button"
                    variant={decision === d ? "primary" : "outline"}
                    size="sm"
                    className="gap-1.5"
                    onClick={() => onDecide(boardCase.id, d)}
                  >
                    {DECISION_ICON[d]}
                    {decisionLabel(d, locale)}
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
  submission: GRCLSubmission;
  onContinue: () => void;
}) {
  const result = computeGRCLScore(submission);
  const copy = getGRCLConsequenceCopy(result);
  const outcomeVariant: "success" | "warning" | "danger" =
    result.outcome === "sound_governance" ? "success" : result.outcome === "mixed_judgment" ? "warning" : "danger";

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
          {result.caseOutcomes.map((outcome) => {
            const boardCase = BOARD_CASES.find((c) => c.id === outcome.caseId)!;
            return (
              <div key={outcome.caseId} className="flex items-center justify-between gap-3 rounded-md border border-border p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-text-primary">{pick(boardCase.title, locale)}</p>
                  <p className="text-xs text-text-muted">
                    {pick(COPY.debriefYourCall, locale)}: {decisionLabel(outcome.decision, locale)}
                    {" · "}
                    {pick(COPY.debriefCorrectCall, locale)}: {decisionLabel(outcome.correctDecision, locale)}
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
  result: ReturnType<typeof computeGRCLScore>;
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
      <Card>
        <CardHeader className="items-center text-center">
          <Badge variant="primary" className="mb-2">
            {pick(COPY.missionComplete, locale)}
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
              <AchievementBadge name={pick(COPY.badgeName, locale)} description={pick(COPY.badgeDescription, locale)} unlocked size="lg" />
              <p className="text-sm text-text-muted">{pick(COPY.badgeUnlocked, locale)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center text-sm">
            <div className="rounded-md bg-surface-raised p-3">
              <p className="text-text-muted">{pick(COPY.breachStat, locale)}</p>
              <p className="font-display text-lg font-bold text-text-primary">{result.governanceFailureCount}</p>
            </div>
            <div className="rounded-md bg-surface-raised p-3">
              <p className="text-text-muted">{pick(COPY.fatigueStat, locale)}</p>
              <p className="font-display text-lg font-bold text-text-primary">{result.overCautionCount}</p>
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
              challengeKey={GRCL_CHALLENGE_KEY}
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
