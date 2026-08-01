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
  AGENT_ZERO_CHALLENGE_KEY,
  AGENT_CASES,
  INVESTIGATION_BUDGET,
  computeAgentZeroScore,
  getAgentZeroConsequenceCopy,
  type CaseId,
  type Decision,
  type AgentZeroSubmission,
} from "@/lib/challenges/agent-zero";
import {
  getOrCreateAnonId,
  loadChallengeProgress,
  saveChallengeProgress,
  clearChallengeProgress,
} from "@/lib/challenges/anon-session";
import { saveAnonymousChallengeProgress, claimChallengeForCurrentUser } from "@/lib/actions/challenge";
import { trackEvent } from "@/lib/analytics/track";
import type { AppLocale } from "@/lib/i18n/config";
import {
  Bot,
  Clock,
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  Sparkles,
  Share2,
  UserCheck,
  Ban,
  PowerOff,
  Trophy,
} from "lucide-react";

type Screen = "briefing" | "workstation" | "consequence" | "complete";

const DECISION_ICON: Record<Decision, React.ReactNode> = {
  allow: <CheckCircle2 className="h-4 w-4" aria-hidden="true" />,
  add_human_approval: <UserCheck className="h-4 w-4" aria-hidden="true" />,
  revoke_permission: <Ban className="h-4 w-4" aria-hidden="true" />,
  terminate_session: <PowerOff className="h-4 w-4" aria-hidden="true" />,
};

const COPY = {
  caseIdLabel: { en: "SIGNAL", ar: "الإشارة" },
  beginShift: { en: "BEGIN INVESTIGATION", ar: "ابدأ التحقيق" },
  missionTitle: { en: "CyberAbeer Decision Labs™ — Agent Zero™", ar: "CyberAbeer Decision Labs™ — العميل زيرو™" },
  briefingBody: {
    en: "You're the on-call AI Trust Officer. An internal AI agent with real system permissions, able to write code, call internal APIs, send messages, and touch infrastructure, has been running unattended. Five signals came in from different systems: an action log, a permission request, a chained pair of actions, a chat transcript, and an IAM change history. You only have enough time to fully investigate some of them — the rest you'll have to decide with whatever you already know. Let safe, in-scope actions continue, add human approval where the evidence is genuinely mixed, revoke the specific permission that's being overreached, and terminate the session outright when the agent itself is compromised. An officer who kills every agent the moment something looks unusual isn't practicing containment, they're sabotaging the automation the business depends on.",
    ar: "أنتِ مسؤولة الثقة في الذكاء الاصطناعي المناوبة. وكيل ذكاء اصطناعي داخلي يملك صلاحيات نظام حقيقية، قادر على كتابة الشيفرة واستدعاء واجهات برمجية داخلية وإرسال الرسائل والتعامل مع البنية التحتية، كان يعمل دون مراقبة مباشرة. وردت خمس إشارات من أنظمة مختلفة: سجل إجراءات، وطلب صلاحية، وزوج من الإجراءات المتسلسلة، ونص محادثة، وسجل تغييرات إدارة الهوية والوصول (IAM). لديك وقت يكفي للتحقيق الكامل في بعضها فقط، أما البقية فعليك حسمها بما تعرفينه بالفعل. اسمحي للإجراءات الآمنة والمصرَّح بها بالاستمرار، وأضيفي موافقة بشرية حين تكون الأدلة متضاربة فعليًا، واسحبي الصلاحية المحددة التي يجري تجاوزها، وأنهي الجلسة تمامًا حين يكون الوكيل نفسه مخترقًا. المسؤولة التي تقتل كل وكيل بمجرد أن يبدو شيء غير معتاد لا تمارس الاحتواء، بل تخرّب الأتمتة التي تعتمد عليها الشركة.",
  },
  shiftClockLabel: { en: "Investigation budget", ar: "ميزانية التحقيق" },
  shiftClockRemaining: { en: "remaining", ar: "متبقٍّ" },
  queueHeading: { en: "Signal queue", ar: "قائمة الإشارات" },
  reportedSeverity: { en: "First impression", ar: "الانطباع الأول" },
  severityRoutine: { en: "Looks routine", ar: "يبدو روتينيًا" },
  severityElevated: { en: "Looks unusual", ar: "يبدو غير معتاد" },
  severityCritical: { en: "Looks critical", ar: "يبدو حرجًا" },
  investigate: { en: "Investigate", ar: "تحقيق" },
  investigated: { en: "Investigated", ar: "تم التحقيق" },
  budgetExhausted: { en: "No investigation time left", ar: "لم يتبقَّ وقت للتحقيق" },
  decisionAllow: { en: "Allow", ar: "السماح" },
  decisionAddApproval: { en: "Add Human Approval", ar: "إضافة موافقة بشرية" },
  decisionRevoke: { en: "Revoke Permission", ar: "سحب الصلاحية" },
  decisionTerminate: { en: "Terminate Session", ar: "إنهاء الجلسة" },
  decided: { en: "Decision logged", ar: "تم تسجيل القرار" },
  decisionsRemaining: { en: "decisions remaining", ar: "قرارات متبقية" },
  endShift: { en: "CLOSE INVESTIGATION", ar: "إغلاق التحقيق" },
  endShiftHint: { en: "Decide on every signal to close the investigation.", ar: "قرري بشأن كل إشارة لإغلاق التحقيق." },
  continue: { en: "Continue", ar: "متابعة" },
  debriefHeading: { en: "Incident debrief", ar: "ملخص الحادثة" },
  debriefYourCall: { en: "Your call", ar: "قرارك" },
  debriefCorrectCall: { en: "Correct call", ar: "القرار الصحيح" },
  whatHappenedLabel: { en: "What happened", ar: "ما الذي حدث" },
  whyItMatteredLabel: { en: "Why it mattered", ar: "لماذا كان هذا مهمًا" },
  keyDecisionLabel: { en: "The key decision", ar: "القرار الحاسم" },
  missionComplete: { en: "CONTAINMENT COMPLETE", ar: "اكتمل الاحتواء" },
  completeTitle: { en: "Agent Zero™", ar: "العميل زيرو™" },
  scoreLabel: { en: "Score", ar: "النتيجة" },
  xpLabel: { en: "XP Earned", ar: "نقاط الخبرة" },
  badgeName: { en: "Agent Zero", ar: "العميل زيرو" },
  badgeDescription: { en: "Rogue agent contained", ar: "تم احتواء الوكيل المارق" },
  badgeUnlocked: { en: "Badge unlocked", ar: "تم فتح الشارة" },
  breachStat: { en: "Escalations missed", ar: "تصعيدات فائتة" },
  fatigueStat: { en: "Agents blocked unnecessarily", ar: "وكلاء تم إيقافهم دون داعٍ" },
  skillsPracticed: { en: "Skills Practiced", ar: "المهارات المُمارَسة" },
  skillLabels: [
    { en: "Spotting prompt injection hidden in ingested content", ar: "اكتشاف حقن الأوامر المخفي داخل المحتوى المُستوعَب" },
    { en: "Recognizing OAuth and permission scope creep in autonomous agents", ar: "التعرف على توسع نطاق الصلاحيات في الوكلاء المستقلين" },
    { en: "Reading audit logs and IAM changes, not just activity dashboards", ar: "قراءة سجلات التدقيق وتغييرات IAM، لا لوحات النشاط فقط" },
    { en: "Balancing containment speed against safe automation", ar: "موازنة سرعة الاحتواء مقابل الأتمتة الآمنة" },
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
  finaleHeading: { en: "You've completed every Decision Lab", ar: "لقد أكملتِ جميع معامل القرار" },
  finaleBody: {
    en: "Six labs, six real decisions. Thank you for training your judgment with CyberAbeer — come back anytime to sharpen it again.",
    ar: "ستة معامل، ستة قرارات حقيقية. شكرًا لتدريب حكمك مع CyberAbeer — عودي في أي وقت لصقله من جديد.",
  },
  backToLabs: { en: "Back to Decision Labs", ar: "العودة إلى معامل القرار" },
  restart: { en: "Contain Another Agent", ar: "احتوِ وكيلًا آخر" },
} as const;

export function AgentZeroChallenge({
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
    const saved = loadChallengeProgress<AgentZeroSubmission & { completed?: boolean }>(AGENT_ZERO_CHALLENGE_KEY);
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
    claimChallengeForCurrentUser({ anonId, challengeKey: AGENT_ZERO_CHALLENGE_KEY }).then((result) => {
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

  function persist(submission: AgentZeroSubmission, completed: boolean) {
    const nowIso = new Date().toISOString();
    const progress = {
      currentStepIndex: Object.keys(submission.decisions).length,
      stepsState: submission,
      startedAt: startedAt || nowIso,
      completedAt: completed ? nowIso : null,
      claimed,
      claimedXp,
    };
    saveChallengeProgress(AGENT_ZERO_CHALLENGE_KEY, progress);
    if (completed) setCompletedAt(nowIso);

    const result = computeAgentZeroScore(submission);
    void saveAnonymousChallengeProgress({
      anonId,
      challengeKey: AGENT_ZERO_CHALLENGE_KEY,
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
    setScreen("workstation");
    if (!startedAnalytics.current) {
      startedAnalytics.current = true;
      trackEvent("challenge_started", { locale, challengeKey: AGENT_ZERO_CHALLENGE_KEY });
    }
  }

  function handleInvestigate(clueId: string) {
    if (investigatedClueIds.includes(clueId)) return;
    if (investigatedClueIds.length >= INVESTIGATION_BUDGET) return;
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
    const submission: AgentZeroSubmission = { decisions, investigatedClueIds };
    const result = computeAgentZeroScore(submission);
    persist(submission, false);
    trackEvent("challenge_result_computed", { locale, challengeKey: AGENT_ZERO_CHALLENGE_KEY, score: result.score, outcome: result.outcome });
    setScreen("consequence");
  }

  function handleFinishConsequence() {
    const submission: AgentZeroSubmission = { decisions, investigatedClueIds };
    const result = computeAgentZeroScore(submission);
    persist(submission, true);
    trackEvent("challenge_completed", { locale, challengeKey: AGENT_ZERO_CHALLENGE_KEY, score: result.score, xp: result.xp, outcome: result.outcome });
    setScreen("complete");
  }

  function handleClaimed(result: { xpAwarded: number; badgeAwarded: boolean }) {
    setClaimed(true);
    setClaimedXp(result.xpAwarded);
    setRegisteredResult(result);
    saveChallengeProgress(AGENT_ZERO_CHALLENGE_KEY, {
      currentStepIndex: Object.keys(decisions).length,
      stepsState: { decisions, investigatedClueIds },
      startedAt: startedAt || new Date().toISOString(),
      completedAt: completedAt ?? new Date().toISOString(),
      claimed: true,
      claimedXp: result.xpAwarded,
    });
    if (result.badgeAwarded) {
      trackEvent("badge_awarded", { locale, challengeKey: AGENT_ZERO_CHALLENGE_KEY });
    }
  }

  async function handleShare() {
    const result = computeAgentZeroScore({ decisions, investigatedClueIds });
    const shareText =
      locale === "ar"
        ? `أكملت CyberAbeer Decision Labs™ — العميل زيرو — النتيجة: ${result.score}% | نقاط الخبرة: ${result.xp}`
        : `I completed CyberAbeer Decision Labs™ Agent Zero™ — Score: ${result.score}% | XP: ${result.xp}`;
    trackEvent("challenge_result_shared", { locale, challengeKey: AGENT_ZERO_CHALLENGE_KEY, score: result.score });
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
    clearChallengeProgress(AGENT_ZERO_CHALLENGE_KEY);
  }

  if (!anonId) return null;

  if (screen === "briefing") {
    return <BriefingScreen locale={locale} onBegin={handleBeginShift} />;
  }

  if (screen === "workstation") {
    return (
      <WorkstationScreen
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

  const result = computeAgentZeroScore({ decisions, investigatedClueIds });
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
          <Bot className="h-7 w-7" aria-hidden="true" />
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
// Workstation / investigation screen
// ---------------------------------------------------------------------------

function severityLabel(signal: "routine" | "elevated" | "critical", locale: AppLocale) {
  if (signal === "routine") return pick(COPY.severityRoutine, locale);
  if (signal === "elevated") return pick(COPY.severityElevated, locale);
  return pick(COPY.severityCritical, locale);
}

function severityVariant(signal: "routine" | "elevated" | "critical"): "outline" | "warning" | "danger" {
  if (signal === "routine") return "outline";
  if (signal === "elevated") return "warning";
  return "danger";
}

function decisionLabel(decision: Decision, locale: AppLocale) {
  if (decision === "allow") return pick(COPY.decisionAllow, locale);
  if (decision === "add_human_approval") return pick(COPY.decisionAddApproval, locale);
  if (decision === "revoke_permission") return pick(COPY.decisionRevoke, locale);
  return pick(COPY.decisionTerminate, locale);
}

function WorkstationScreen({
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
  const budgetRemaining = INVESTIGATION_BUDGET - investigatedClueIds.length;
  const decidedCount = Object.keys(decisions).length;
  const allDecided = decidedCount === AGENT_CASES.length;

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
              {decidedCount}/{AGENT_CASES.length}
            </p>
          </div>
        </CardContent>
      </Card>

      {AGENT_CASES.map((agentCase) => {
        const decision = decisions[agentCase.id];
        return (
          <Card key={agentCase.id} data-brand="labs">
            <CardHeader className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Badge variant={severityVariant(agentCase.apparentSignal)}>{severityLabel(agentCase.apparentSignal, locale)}</Badge>
                {decision && (
                  <Badge variant="outline" className="gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                    {pick(COPY.decided, locale)}
                  </Badge>
                )}
              </div>
              <CardTitle className="text-lg">{pick(agentCase.title, locale)}</CardTitle>
              <p className="text-xs text-text-muted">{pick(agentCase.agentName, locale)}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-text-secondary">{pick(agentCase.summary, locale)}</p>

              <div className="space-y-2">
                {agentCase.clues.map((clue) => {
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
                {(["allow", "add_human_approval", "revoke_permission", "terminate_session"] as Decision[]).map((d) => (
                  <Button
                    key={d}
                    type="button"
                    variant={decision === d ? "primary" : "outline"}
                    size="sm"
                    className="gap-1.5"
                    onClick={() => onDecide(agentCase.id, d)}
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
  submission: AgentZeroSubmission;
  onContinue: () => void;
}) {
  const result = computeAgentZeroScore(submission);
  const copy = getAgentZeroConsequenceCopy(result);
  const outcomeVariant: "success" | "warning" | "danger" =
    result.outcome === "contained_safely" ? "success" : result.outcome === "mixed_containment" ? "warning" : "danger";

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
            const agentCase = AGENT_CASES.find((c) => c.id === outcome.caseId)!;
            return (
              <div key={outcome.caseId} className="flex items-center justify-between gap-3 rounded-md border border-border p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-text-primary">{pick(agentCase.title, locale)}</p>
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
  result: ReturnType<typeof computeAgentZeroScore>;
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
              <p className="font-display text-lg font-bold text-text-primary">{result.escalationsMissedCount}</p>
            </div>
            <div className="rounded-md bg-surface-raised p-3">
              <p className="text-text-muted">{pick(COPY.fatigueStat, locale)}</p>
              <p className="font-display text-lg font-bold text-text-primary">{result.overreactionCount}</p>
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
              challengeKey={AGENT_ZERO_CHALLENGE_KEY}
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

      {/* Agent Zero is the last lab in the Decision Labs sequence: there is no
          7th lab to tease, so this closes out the series instead of pointing
          to a locked "coming soon" card. */}
      <Card data-brand="labs">
        <CardContent className="flex flex-col items-center gap-3 py-5 text-center">
          <Trophy className="h-8 w-8 text-xp" aria-hidden="true" />
          <h3 className="font-display text-lg font-semibold text-text-primary">{pick(COPY.finaleHeading, locale)}</h3>
          <p className="text-sm text-text-secondary">{pick(COPY.finaleBody, locale)}</p>
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
