"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScoreGauge } from "@/components/greentrust/score-gauge";
import { AchievementBadge } from "@/components/labs/achievement-badge";
import { InlineRegisterForm } from "./inline-register-form";
import { Link } from "@/lib/i18n/navigation";
import { pick } from "@/lib/challenges/bilingual";
import {
  CASE_BRIEFING,
  CASE_EMAIL,
  EVIDENCE_ITEMS,
  TOTAL_EVIDENCE_COUNT,
  HINTS,
  REVEAL_TEXT,
  ATTACK_TIMELINE,
  RESPONSE_ACTIONS,
  WHY_THIS_MATTERS,
  PHISHING_HUNTER_SKILLS,
  PHISHING_HUNTER_CHALLENGE_KEY,
  createInitialState,
  openTool,
  useHint as advanceHint,
  revealAnswer,
  submitVerdict,
  canSubmitVerdict,
  computePhishingHunterScore,
  getPhishingHunterConsequenceCopy,
  type EvidenceTool,
  type EvidenceItem,
  type EmailClassification,
  type ExposureLevel,
  type ResponseAction,
  type PhishingHunterStepsState,
} from "@/lib/challenges/phishing-hunter";
import {
  getOrCreateAnonId,
  loadChallengeProgress,
  saveChallengeProgress,
  clearChallengeProgress,
  type ChallengeLocalProgress,
} from "@/lib/challenges/anon-session";
import { saveAnonymousChallengeProgress, claimChallengeForCurrentUser, BADGE_PASS_SCORE } from "@/lib/actions/challenge";
import { WinCelebration } from "@/components/shared/win-celebration";
import { trackEvent } from "@/lib/analytics/track";
import type { AppLocale } from "@/lib/i18n/config";
import {
  ShieldAlert,
  Mail,
  Link2,
  FileSearch,
  Paperclip,
  KeyRound,
  Lightbulb,
  CheckCircle2,
  Sparkles,
  Share2,
  Clock,
  X,
} from "lucide-react";

export interface PhishingHunterChallengeProps {
  locale: AppLocale;
  shareUrl: string;
  isAuthenticated: boolean;
}

type Screen = "briefing" | "workstation" | "verdict" | "consequence" | "complete";
type MobileTab = "case" | "email" | "tools" | "evidence";

const COPY = {
  caseIdLabel: { en: "CASE ID", ar: "رقم الحالة" },
  acceptCase: { en: "ACCEPT CASE", ar: "قبول الحالة" },
  workstationTitle: { en: "Investigation Workstation", ar: "محطة عمل التحقيق" },
  caseInfo: { en: "Case Info", ar: "معلومات الحالة" },
  emailClient: { en: "Email", ar: "البريد الإلكتروني" },
  tools: { en: "Tools", ar: "الأدوات" },
  evidenceBoard: { en: "Evidence Board", ar: "لوحة الأدلة" },
  from: { en: "From", ar: "من" },
  replyTo: { en: "Reply-To", ar: "الرد إلى" },
  to: { en: "To", ar: "إلى" },
  subject: { en: "Subject", ar: "الموضوع" },
  viewHeaders: { en: "View Headers", ar: "عرض الترويسات" },
  checkAuthentication: { en: "Authentication", ar: "التوثيق" },
  attachment: { en: "Attachment", ar: "المرفق" },
  noAttachment: { en: "No attachment", ar: "لا يوجد مرفق" },
  domainCheck: { en: "Domain Check", ar: "فحص النطاق" },
  urlInspector: { en: "URL Inspector", ar: "فاحص الرابط" },
  headerAnalyzer: { en: "Header Analyzer", ar: "محلل الترويسات" },
  attachmentAnalyzer: { en: "Attachment Analyzer", ar: "محلل المرفقات" },
  authCheck: { en: "Authentication Check", ar: "فحص التوثيق" },
  evidenceProgress: { en: "Evidence collected", ar: "الأدلة المُجمَّعة" },
  hint1: { en: "Hint 1", ar: "تلميح 1" },
  hint2: { en: "Hint 2", ar: "تلميح 2" },
  reveal: { en: "Reveal Answer", ar: "كشف الإجابة" },
  revealConfirm: {
    en: "Revealing the answer skips the rest of the investigation and applies a major score penalty. Continue?",
    ar: "كشف الإجابة يتخطى بقية التحقيق ويطبق خصمًا كبيرًا من النتيجة. هل تريد المتابعة؟",
  },
  submitVerdict: { en: "SUBMIT VERDICT", ar: "تقديم الحكم" },
  submitVerdictHint: {
    en: "Investigate at least half the case before submitting a verdict.",
    ar: "حقّق في نصف الحالة على الأقل قبل تقديم الحكم.",
  },
  verdictTitle: { en: "Submit Your Verdict", ar: "قدّم حكمك" },
  classificationLabel: { en: "EMAIL CLASSIFICATION", ar: "تصنيف البريد الإلكتروني" },
  exposureLabel: { en: "USER EXPOSURE", ar: "درجة التعرّض للمستخدم" },
  responseLabel: { en: "RECOMMENDED RESPONSE (select all that apply)", ar: "الاستجابة الموصى بها (اختر كل ما ينطبق)" },
  submit: { en: "Submit", ar: "إرسال" },
  legitimate: { en: "Legitimate", ar: "شرعي" },
  suspicious: { en: "Suspicious", ar: "مشبوه" },
  phishing: { en: "Phishing", ar: "تصيّد" },
  notClicked: { en: "Not clicked", ar: "لم يُضغط عليه" },
  linkClicked: { en: "Link clicked", ar: "تم الضغط على الرابط" },
  credentialsEntered: { en: "Credentials entered", ar: "تم إدخال بيانات الاعتماد" },
  unknown: { en: "Unknown", ar: "غير معروف" },
  responseActionLabels: {
    quarantine_email: { en: "Quarantine email", ar: "عزل البريد الإلكتروني" },
    block_sender: { en: "Block sender / domain", ar: "حظر المُرسل / النطاق" },
    reset_credentials: { en: "Reset credentials", ar: "إعادة تعيين بيانات الاعتماد" },
    revoke_sessions: { en: "Revoke sessions", ar: "إلغاء الجلسات" },
    scan_endpoint: { en: "Scan endpoint", ar: "فحص الجهاز الطرفي" },
    notify_soc: { en: "Notify SOC", ar: "إخطار مركز العمليات الأمنية" },
    search_similar: { en: "Search for similar messages", ar: "البحث عن رسائل مشابهة" },
    no_action: { en: "No action", ar: "لا إجراء" },
  } as Record<ResponseAction, { en: string; ar: string }>,
  attackTimelineTitle: { en: "What Actually Happened", ar: "ما حدث فعليًا" },
  continueCta: { en: "Continue", ar: "متابعة" },
  missionComplete: { en: "MISSION COMPLETE", ar: "اكتملت المهمة" },
  scoreLabel: { en: "Score", ar: "النتيجة" },
  xpLabel: { en: "XP Earned", ar: "نقاط الخبرة" },
  evidenceDiscoveredLabel: { en: "Evidence Discovered", ar: "الأدلة المكتشفة" },
  investigationAccuracy: { en: "Investigation Accuracy", ar: "دقة التحقيق" },
  responseAccuracy: { en: "Response Accuracy", ar: "دقة الاستجابة" },
  badgeUnlocked: { en: "Badge Unlocked", ar: "تم فتح الشارة" },
  badgeName: { en: "Phishing Hunter", ar: "صائد التصيّد" },
  badgeDescription: {
    en: "Investigated and correctly classified a real-world-style phishing incident.",
    ar: "حقّق في حادثة تصيّد واقعية وصنّفها بشكل صحيح.",
  },
  skillsPracticed: { en: "Skills Practiced", ar: "المهارات المُمارَسة" },
  skillLabels: {
    email_analysis: { en: "Email Analysis", ar: "تحليل البريد الإلكتروني" },
    threat_investigation: { en: "Threat Investigation", ar: "التحقيق في التهديدات" },
    social_engineering: { en: "Social Engineering", ar: "الهندسة الاجتماعية" },
    incident_response: { en: "Incident Response", ar: "الاستجابة للحوادث" },
  } as Record<string, { en: string; ar: string }>,
  shareAchievement: { en: "Share Achievement", ar: "مشاركة الإنجاز" },
  shareCopied: { en: "Copied to clipboard", ar: "تم النسخ إلى الحافظة" },
  nextMission: { en: "Next Mission: Network Guardian", ar: "المهمة التالية: حارس الشبكة" },
  nextMissionComingSoon: { en: "Network Guardian — coming soon", ar: "حارس الشبكة — قريبًا" },
  whyThisMatters: { en: "WHY THIS MATTERS", ar: "لماذا يهم هذا" },
  restart: { en: "Investigate Again", ar: "حقّق مرة أخرى" },
  registerHeading: { en: "Save this result to your profile", ar: "احفظ هذه النتيجة في ملفك الشخصي" },
  registerBody: {
    en: "Create a free account to keep your XP and badge across every CyberAbeer Decision Lab.",
    ar: "أنشئ حسابًا مجانيًا للاحتفاظ بنقاط خبرتك وشارتك عبر كل معامل قرار CyberAbeer.",
  },
  registerCta: { en: "Save My Result", ar: "احفظ نتيجتي" },
  registeredConfirmation: { en: "Saved to your account.", ar: "تم الحفظ في حسابك." },
  anonymousNote: {
    en: "Your progress is saved on this device. Register any time to keep it permanently.",
    ar: "تُحفظ تقدُّماتك على هذا الجهاز. سجّل في أي وقت للاحتفاظ بها بشكل دائم.",
  },
  suspiciousTag: { en: "Suspicious", ar: "مشبوه" },
  neutralTag: { en: "Neutral", ar: "محايد" },
  evidenceUndiscovered: { en: "Not yet investigated", ar: "لم يُحقَّق فيه بعد" },
  strictEvaluationNote: {
    en: `This mission is strictly evaluated. You need a score of ${BADGE_PASS_SCORE}% or higher to earn the badge and trigger the win celebration.`,
    ar: `يتم تقييم هذه المهمة بصرامة. تحتاج إلى نتيجة ${BADGE_PASS_SCORE}% أو أعلى للحصول على الشارة وتفعيل احتفال الفوز.`,
  },
  passedHeading: { en: "MISSION COMPLETE — PASSED", ar: "اكتملت المهمة — نجاح" },
  notPassedHeading: { en: "Below passing score", ar: "أقل من درجة النجاح" },
  notPassedBody: {
    en: `You scored below the ${BADGE_PASS_SCORE}% threshold required for the badge. Investigate again with fewer hints to raise your score.`,
    ar: `حصلت على نتيجة أقل من الحد المطلوب البالغ ${BADGE_PASS_SCORE}% للحصول على الشارة. حقّق مرة أخرى باستخدام تلميحات أقل لرفع نتيجتك.`,
  },
  badgeLockedNote: {
    en: `Score ${BADGE_PASS_SCORE}%+ to unlock`,
    ar: `احصل على ${BADGE_PASS_SCORE}%+ لفتحها`,
  },
} as const;

const TOOL_META: Record<EvidenceTool, { icon: React.ReactNode; title: { en: string; ar: string } }> = {
  sender: { icon: <Mail className="h-5 w-5" aria-hidden="true" />, title: COPY.domainCheck },
  url: { icon: <Link2 className="h-5 w-5" aria-hidden="true" />, title: COPY.urlInspector },
  headers: { icon: <FileSearch className="h-5 w-5" aria-hidden="true" />, title: COPY.headerAnalyzer },
  attachment: { icon: <Paperclip className="h-5 w-5" aria-hidden="true" />, title: COPY.attachmentAnalyzer },
  auth: { icon: <KeyRound className="h-5 w-5" aria-hidden="true" />, title: COPY.authCheck },
  // "body" (the urgency-language hotspot inside the email text) is not
  // one of the 5 canonical analyst tools per spec — it is only reachable
  // by clicking the highlighted phrase in the Email panel, never listed
  // in the mobile Tools grid (see TOOLS_GRID below).
  body: { icon: <ShieldAlert className="h-5 w-5" aria-hidden="true" />, title: { en: "Message Tone", ar: "نبرة الرسالة" } },
};

/** The 5 canonical analyst tools shown in the mobile Tools tab grid. */
const TOOLS_GRID: EvidenceTool[] = ["sender", "url", "headers", "attachment", "auth"];

function Ltr({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span dir="ltr" className={className}>
      {children}
    </span>
  );
}

/**
 * Orchestrates the full CyberAbeer Decision Labs™ Phishing Hunter™
 * mission: a case briefing, an investigation workstation with
 * click-to-inspect evidence, a verdict panel, a consequence + attack
 * timeline reveal, and a Mission Complete screen. Persists to
 * localStorage (anon-session.ts, genericized to support this state
 * shape) and best-effort mirrors to Supabase exactly like the older
 * First Defender quiz, so the same anonymous-first, claim-on-register
 * architecture is reused rather than forked.
 */
export function PhishingHunterChallenge({ locale, shareUrl, isAuthenticated }: PhishingHunterChallengeProps) {
  const [screen, setScreen] = React.useState<Screen>("briefing");
  const [anonId, setAnonId] = React.useState("");
  const [state, setState] = React.useState<PhishingHunterStepsState>(createInitialState());
  const [activeTool, setActiveTool] = React.useState<EvidenceTool | null>(null);
  const [toast, setToast] = React.useState<{ label: string; xp: number } | null>(null);
  const [mobileTab, setMobileTab] = React.useState<MobileTab>("case");
  const [classification, setClassification] = React.useState<EmailClassification | null>(null);
  const [exposure, setExposure] = React.useState<ExposureLevel | null>(null);
  const [responseActions, setResponseActions] = React.useState<ResponseAction[]>([]);
  const [startedAt, setStartedAt] = React.useState("");
  const [claimed, setClaimed] = React.useState(false);
  const [claimedXp, setClaimedXp] = React.useState<number | undefined>(undefined);
  const [registeredResult, setRegisteredResult] = React.useState<{ xpAwarded: number; badgeAwarded: boolean } | null>(null);
  const [showRegisterForm, setShowRegisterForm] = React.useState(true);
  const [shareStatus, setShareStatus] = React.useState<"idle" | "copied">("idle");
  const hydrated = React.useRef(false);
  const startedAnalytics = React.useRef(false);
  const autoClaimAttempted = React.useRef(false);
  const toastTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    const id = getOrCreateAnonId();
    setAnonId(id);
    const saved = loadChallengeProgress<PhishingHunterStepsState>(PHISHING_HUNTER_CHALLENGE_KEY);
    // Defensive shape check: this challenge key was previously used by
    // the old First Defender quiz, whose stepsState was a completely
    // different shape (an object keyed by step id, no
    // investigatedEvidenceIds array). A returning visitor's browser may
    // still hold that old localStorage entry; blindly trusting it here
    // crashed the page in production ("Cannot read properties of
    // undefined (reading 'length')") the first time this shipped.
    // Anything that doesn't look like real Phishing Hunter state is
    // treated as absent, and play just starts fresh from the briefing.
    if (saved && Array.isArray(saved.stepsState?.investigatedEvidenceIds)) {
      setState(saved.stepsState);
      setStartedAt(saved.startedAt);
      setClaimed(Boolean(saved.claimed));
      setClaimedXp(saved.claimedXp);
      if (saved.stepsState.verdict) {
        setClassification(saved.stepsState.verdict.classification);
        setExposure(saved.stepsState.verdict.exposure);
        setResponseActions(saved.stepsState.verdict.responseActions);
      }
      if (saved.completedAt) {
        setScreen("complete");
        startedAnalytics.current = true;
      } else if (saved.stepsState.investigatedEvidenceIds.length > 0) {
        setScreen("workstation");
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
    // Guard against a stale response clobbering fresher local state: since
    // Next.js client-side navigation doesn't tear down the JS runtime, an
    // in-flight claim request from a page instance the visitor has since
    // navigated away from (e.g. a prior playthrough, or Investigate Again
    // starting a new attempt before this resolved) can still resolve later.
    // Without this flag its .then callback would call handleClaimed with a
    // closure over that old render's `state`, silently overwriting a more
    // recent attempt's evidence/verdict in localStorage. The cleanup
    // function flips `cancelled` whenever this effect's dependencies
    // change or the component unmounts, so a late response is discarded.
    let cancelled = false;
    claimChallengeForCurrentUser({ anonId, challengeKey: PHISHING_HUNTER_CHALLENGE_KEY }).then((result) => {
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

  React.useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  function persist(nextState: PhishingHunterStepsState, completed: boolean) {
    const progress: ChallengeLocalProgress<PhishingHunterStepsState> = {
      currentStepIndex: nextState.investigatedEvidenceIds.length,
      stepsState: nextState,
      startedAt: startedAt || new Date().toISOString(),
      completedAt: completed ? new Date().toISOString() : null,
      claimed,
      claimedXp,
    };
    saveChallengeProgress(PHISHING_HUNTER_CHALLENGE_KEY, progress);

    const result = computePhishingHunterScore(nextState);
    void saveAnonymousChallengeProgress({
      anonId,
      challengeKey: PHISHING_HUNTER_CHALLENGE_KEY,
      status: completed ? "completed" : "in_progress",
      currentStep: nextState.investigatedEvidenceIds.length,
      score: result.score,
      xpEarned: result.xp,
      hintsUsed: nextState.hintsUsed,
      stepsState: nextState,
      locale,
    });
  }

  function handleAcceptCase() {
    const now = new Date().toISOString();
    setStartedAt(now);
    setScreen("workstation");
    if (!startedAnalytics.current) {
      startedAnalytics.current = true;
      trackEvent("challenge_started", { locale, challengeKey: PHISHING_HUNTER_CHALLENGE_KEY });
    }
  }

  function handleOpenTool(tool: EvidenceTool) {
    setActiveTool(tool);
    const { nextState, newlyDiscovered } = openTool(state, tool);
    setState(nextState);
    trackEvent("challenge_hotspot_inspected", { locale, challengeKey: PHISHING_HUNTER_CHALLENGE_KEY, hotspot: tool });
    if (newlyDiscovered.length > 0) {
      showEvidenceToast(newlyDiscovered);
      persist(nextState, false);
    }
  }

  function showEvidenceToast(items: EvidenceItem[]) {
    const totalXp = items.reduce((sum, item) => sum + item.xp, 0);
    const label = items.map((item) => pick(item.label, locale)).join(" · ");
    setToast({ label, xp: totalXp });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  }

  function handleUseHint() {
    if (state.hintsUsed >= 2) return;
    const nextState = advanceHint(state);
    setState(nextState);
    trackEvent("hint_used", { locale, challengeKey: PHISHING_HUNTER_CHALLENGE_KEY, hintLevel: nextState.hintsUsed });
    persist(nextState, false);
  }

  function handleReveal() {
    if (typeof window !== "undefined" && !window.confirm(pick(COPY.revealConfirm, locale))) return;
    const nextState = revealAnswer(state);
    setState(nextState);
    trackEvent("hint_used", { locale, challengeKey: PHISHING_HUNTER_CHALLENGE_KEY, hintLevel: "reveal" });
    persist(nextState, false);
  }

  function toggleResponseAction(action: ResponseAction) {
    setResponseActions((prev) => (prev.includes(action) ? prev.filter((a) => a !== action) : [...prev, action]));
  }

  function handleSubmitVerdict() {
    if (!classification || !exposure || responseActions.length === 0) return;
    const nextState = submitVerdict(state, { classification, exposure, responseActions });
    setState(nextState);
    const result = computePhishingHunterScore(nextState);
    trackEvent("challenge_step_completed", {
      locale,
      challengeKey: PHISHING_HUNTER_CHALLENGE_KEY,
      classification,
      exposure,
      score: result.score,
    });
    persist(nextState, false);
    setScreen("consequence");
  }

  function handleFinishConsequence() {
    const result = computePhishingHunterScore(state);
    persist(state, true);
    trackEvent("challenge_completed", {
      locale,
      challengeKey: PHISHING_HUNTER_CHALLENGE_KEY,
      score: result.score,
      xp: result.xp,
      outcome: result.outcome,
    });
    setScreen("complete");
  }

  function handleClaimed(result: { xpAwarded: number; badgeAwarded: boolean }) {
    setClaimed(true);
    // Never let a server-reported 0 (already-claimed idempotent replay,
    // or a rare timing race with the fire-and-forget progress save)
    // regress the displayed XP below what this run actually earned.
    const localResult = computePhishingHunterScore(state);
    const safeXp = result.xpAwarded || localResult.xp;
    setClaimedXp(safeXp);
    setRegisteredResult({ ...result, xpAwarded: safeXp });
    saveChallengeProgress(PHISHING_HUNTER_CHALLENGE_KEY, {
      currentStepIndex: state.investigatedEvidenceIds.length,
      stepsState: state,
      startedAt,
      completedAt: new Date().toISOString(),
      claimed: true,
      claimedXp: safeXp,
    });
    if (result.badgeAwarded) {
      trackEvent("badge_earned", { locale, challengeKey: PHISHING_HUNTER_CHALLENGE_KEY });
    }
  }

  async function handleShare() {
    const result = computePhishingHunterScore(state);
    const shareText =
      locale === "ar"
        ? `أكملت CyberAbeer Decision Labs™ صائد التصيّد — النتيجة: ${result.score}% | نقاط الخبرة: ${result.xp}`
        : `I completed CyberAbeer Decision Labs™ Phishing Hunter™ — Score: ${result.score}% | XP: ${result.xp}`;
    trackEvent("challenge_result_shared", { locale, challengeKey: PHISHING_HUNTER_CHALLENGE_KEY, score: result.score });
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ text: shareText, url: shareUrl });
        return;
      } catch {
        // cancelled; fall through to clipboard
      }
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      setShareStatus("copied");
      setTimeout(() => setShareStatus("idle"), 3000);
    }
  }

  function handleRestart() {
    setState(createInitialState());
    setClassification(null);
    setExposure(null);
    setResponseActions([]);
    setClaimed(false);
    setClaimedXp(undefined);
    setRegisteredResult(null);
    setScreen("briefing");
    clearChallengeProgress(PHISHING_HUNTER_CHALLENGE_KEY);
  }

  if (!anonId) return null;

  if (screen === "briefing") {
    return <BriefingScreen locale={locale} onAccept={handleAcceptCase} />;
  }

  if (screen === "workstation") {
    return (
      <WorkstationScreen
        locale={locale}
        state={state}
        activeTool={activeTool}
        toast={toast}
        mobileTab={mobileTab}
        onMobileTabChange={setMobileTab}
        onOpenTool={handleOpenTool}
        onCloseTool={() => setActiveTool(null)}
        onUseHint={handleUseHint}
        onReveal={handleReveal}
        onSubmitReady={() => setScreen("verdict")}
      />
    );
  }

  if (screen === "verdict") {
    return (
      <VerdictScreen
        locale={locale}
        classification={classification}
        exposure={exposure}
        responseActions={responseActions}
        onClassification={setClassification}
        onExposure={setExposure}
        onToggleResponse={toggleResponseAction}
        onSubmit={handleSubmitVerdict}
        canSubmit={Boolean(classification && exposure && responseActions.length > 0)}
      />
    );
  }

  if (screen === "consequence") {
    return <ConsequenceScreen locale={locale} state={state} onContinue={handleFinishConsequence} />;
  }

  const result = computePhishingHunterScore(state);
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

function BriefingScreen({ locale, onAccept }: { locale: AppLocale; onAccept: () => void }) {
  return (
    <Card className="mx-auto max-w-lg" data-brand="labs">
      <CardHeader className="items-center text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 text-primary-700">
          <ShieldAlert className="h-7 w-7" aria-hidden="true" />
        </div>
        <Badge variant="primary">
          {pick(COPY.caseIdLabel, locale)}: <Ltr className="ms-1">{CASE_BRIEFING.caseId}</Ltr>
        </Badge>
        <CardTitle className="font-display text-2xl">
          {locale === "ar" ? "CyberAbeer Decision Labs™ — صائد التصيّد" : "CyberAbeer Decision Labs™ — Phishing Hunter™"}
        </CardTitle>
        <CardDescription>
          <Ltr>{CASE_BRIEFING.time}</Ltr>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-center">
        <div className="rounded-md bg-surface-raised p-4 text-start">
          <p className="text-sm italic text-text-secondary">&ldquo;{pick(CASE_BRIEFING.employeeQuote, locale)}&rdquo;</p>
        </div>
        <div className="flex items-start gap-2 rounded-md border border-warning-200 bg-warning-50 p-3 text-start">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-warning-600" aria-hidden="true" />
          <p className="text-xs text-text-secondary">{pick(COPY.strictEvaluationNote, locale)}</p>
        </div>
        <Button className="w-full" size="lg" onClick={onAccept}>
          {pick(COPY.acceptCase, locale)}
        </Button>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Workstation
// ---------------------------------------------------------------------------

interface WorkstationScreenProps {
  locale: AppLocale;
  state: PhishingHunterStepsState;
  activeTool: EvidenceTool | null;
  toast: { label: string; xp: number } | null;
  mobileTab: MobileTab;
  onMobileTabChange: (tab: MobileTab) => void;
  onOpenTool: (tool: EvidenceTool) => void;
  onCloseTool: () => void;
  onUseHint: () => void;
  onReveal: () => void;
  onSubmitReady: () => void;
}

function WorkstationScreen({
  locale,
  state,
  activeTool,
  toast,
  mobileTab,
  onMobileTabChange,
  onOpenTool,
  onCloseTool,
  onUseHint,
  onReveal,
  onSubmitReady,
}: WorkstationScreenProps) {
  const ready = canSubmitVerdict(state);
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <div className="mx-auto max-w-6xl space-y-4" dir={dir} data-brand="labs">
      {toast && (
        <div className="fixed inset-x-0 top-4 z-50 mx-auto w-fit rounded-md border border-primary-200 bg-surface px-4 py-2 shadow-lg">
          <p className="flex items-center gap-2 text-sm font-medium text-text-primary">
            <CheckCircle2 className="h-4 w-4 text-success-600" aria-hidden="true" />
            {toast.label}
            <span className="font-display font-bold text-xp">+{toast.xp} XP</span>
          </p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="font-display text-lg font-semibold text-text-primary">{pick(COPY.workstationTitle, locale)}</h1>
        <Badge variant="outline">
          {pick(COPY.evidenceProgress, locale)}: {state.investigatedEvidenceIds.length}/{TOTAL_EVIDENCE_COUNT}
        </Badge>
      </div>

      {/* Mobile tab nav */}
      <div className="grid grid-cols-4 gap-2 tablet:hidden">
        {(["case", "email", "tools", "evidence"] as MobileTab[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => onMobileTabChange(tab)}
            className={`rounded-md border px-2 py-3 text-xs font-semibold ${
              mobileTab === tab
                ? "border-primary bg-primary-50 text-primary-700"
                : "border-border bg-surface text-text-secondary"
            }`}
          >
            {tab === "case" && pick(COPY.caseInfo, locale)}
            {tab === "email" && pick(COPY.emailClient, locale)}
            {tab === "tools" && pick(COPY.tools, locale)}
            {tab === "evidence" && pick(COPY.evidenceBoard, locale)}
          </button>
        ))}
      </div>

      <div className="grid gap-4 tablet:grid-cols-[minmax(0,220px)_minmax(0,1fr)_minmax(0,280px)]">
        <div className={mobileTab === "case" ? "block" : "hidden tablet:block"}>
          <CasePanel locale={locale} state={state} onUseHint={onUseHint} onReveal={onReveal} />
        </div>

        <div className={mobileTab === "email" || mobileTab === "tools" ? "block" : "hidden tablet:block"}>
          <EmailPanel locale={locale} onOpenTool={onOpenTool} mobileTab={mobileTab} />
        </div>

        <div className={mobileTab === "evidence" ? "block" : "hidden tablet:block"}>
          <EvidenceBoardPanel locale={locale} state={state} />
        </div>
      </div>

      <div className="sticky bottom-4 flex justify-center">
        <Button size="lg" disabled={!ready} onClick={onSubmitReady} className="shadow-lg">
          {pick(COPY.submitVerdict, locale)}
        </Button>
      </div>
      {!ready && <p className="text-center text-xs text-text-muted">{pick(COPY.submitVerdictHint, locale)}</p>}

      {activeTool && <ToolPanelModal locale={locale} tool={activeTool} onClose={onCloseTool} />}
    </div>
  );
}

function CasePanel({
  locale,
  state,
  onUseHint,
  onReveal,
}: {
  locale: AppLocale;
  state: PhishingHunterStepsState;
  onUseHint: () => void;
  onReveal: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{pick(COPY.caseInfo, locale)}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div>
          <p className="text-text-muted">{pick(COPY.caseIdLabel, locale)}</p>
          <Ltr className="font-semibold text-text-primary">{CASE_BRIEFING.caseId}</Ltr>
        </div>
        <p className="italic text-text-secondary">&ldquo;{pick(CASE_BRIEFING.employeeQuote, locale)}&rdquo;</p>
        <div className="space-y-2 border-t border-border pt-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2"
            disabled={state.hintsUsed >= 1}
            onClick={onUseHint}
          >
            <Lightbulb className="h-4 w-4" aria-hidden="true" />
            {pick(COPY.hint1, locale)}
          </Button>
          {state.hintsUsed >= 1 && (
            <p className="rounded-md bg-surface-raised p-2 text-xs text-text-secondary">{pick(HINTS[0]!.text, locale)}</p>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2"
            disabled={state.hintsUsed >= 2}
            onClick={onUseHint}
          >
            <Lightbulb className="h-4 w-4" aria-hidden="true" />
            {pick(COPY.hint2, locale)}
          </Button>
          {state.hintsUsed >= 2 && (
            <p className="rounded-md bg-surface-raised p-2 text-xs text-text-secondary">{pick(HINTS[1]!.text, locale)}</p>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full text-danger-600"
            disabled={state.revealed}
            onClick={onReveal}
          >
            {pick(COPY.reveal, locale)}
          </Button>
          {state.revealed && (
            <p className="rounded-md border border-danger-200 bg-danger-50 p-2 text-xs text-danger-700">
              {pick(REVEAL_TEXT, locale)}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function EmailPanel({
  locale,
  onOpenTool,
  mobileTab,
}: {
  locale: AppLocale;
  onOpenTool: (tool: EvidenceTool) => void;
  mobileTab: MobileTab;
}) {
  if (mobileTab === "tools") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">{pick(COPY.tools, locale)}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-2">
          {TOOLS_GRID.map((tool) => (
            <Button key={tool} type="button" variant="outline" className="flex-col gap-1 py-4" onClick={() => onOpenTool(tool)}>
              {TOOL_META[tool].icon}
              <span className="text-xs">{pick(TOOL_META[tool].title, locale)}</span>
            </Button>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{pick(COPY.emailClient, locale)}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="space-y-1 rounded-md border border-border p-3">
          <button type="button" onClick={() => onOpenTool("sender")} className="block w-full text-start hover:underline">
            <span className="text-text-muted">{pick(COPY.from, locale)}: </span>
            <span className="font-semibold text-text-primary">{CASE_EMAIL.displayName}</span>{" "}
            <Ltr className="text-text-secondary">&lt;{CASE_EMAIL.senderAddress}&gt;</Ltr>
          </button>
          <button type="button" onClick={() => onOpenTool("sender")} className="block w-full text-start hover:underline">
            <span className="text-text-muted">{pick(COPY.replyTo, locale)}: </span>
            <Ltr className="text-text-secondary">{CASE_EMAIL.replyToAddress}</Ltr>
          </button>
          <p>
            <span className="text-text-muted">{pick(COPY.to, locale)}: </span>
            <Ltr className="text-text-secondary">{CASE_EMAIL.recipientAddress}</Ltr>
          </p>
          <p>
            <span className="text-text-muted">{pick(COPY.subject, locale)}: </span>
            <span className="font-medium text-text-primary">{pick(CASE_EMAIL.subject, locale)}</span>
          </p>
          <p className="text-text-muted">
            <Ltr>{CASE_EMAIL.timestamp}</Ltr>
          </p>
        </div>

        <div className="space-y-2 rounded-md border border-border p-3">
          {CASE_EMAIL.bodyParagraphs.map((p, i) => (
            <p key={i} className={i === CASE_EMAIL.bodyParagraphs.length - 1 ? "text-text-primary" : "text-text-secondary"}>
              {i === CASE_EMAIL.bodyParagraphs.length - 1 ? (
                <button type="button" onClick={() => onOpenTool("body")} className="text-start hover:underline">
                  {pick(p, locale)}
                </button>
              ) : (
                pick(p, locale)
              )}
            </p>
          ))}
          <Button type="button" size="sm" onClick={() => onOpenTool("url")}>
            {pick(CASE_EMAIL.ctaLabel, locale)}
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => onOpenTool("headers")}>
            <FileSearch className="h-3.5 w-3.5" aria-hidden="true" />
            {pick(COPY.viewHeaders, locale)}
          </Button>
          <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => onOpenTool("auth")}>
            <KeyRound className="h-3.5 w-3.5" aria-hidden="true" />
            {pick(COPY.checkAuthentication, locale)}
          </Button>
          <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => onOpenTool("attachment")}>
            <Paperclip className="h-3.5 w-3.5" aria-hidden="true" />
            {pick(COPY.attachment, locale)}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function EvidenceBoardPanel({ locale, state }: { locale: AppLocale; state: PhishingHunterStepsState }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{pick(COPY.evidenceBoard, locale)}</CardTitle>
        <CardDescription>
          {state.investigatedEvidenceIds.length}/{TOTAL_EVIDENCE_COUNT}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {EVIDENCE_ITEMS.map((item) => {
          const found = state.investigatedEvidenceIds.includes(item.id);
          return (
            <div
              key={item.id}
              className={`rounded-md border p-2 text-xs transition-opacity ${
                found ? "border-border bg-surface-raised opacity-100" : "border-dashed border-border opacity-40"
              }`}
            >
              {found ? (
                <div className="flex items-start justify-between gap-2">
                  <span className="text-text-primary">{pick(item.label, locale)}</span>
                  <Badge variant={item.signal === "suspicious" ? "danger" : "success"} className="shrink-0 text-[10px]">
                    {item.signal === "suspicious" ? pick(COPY.suspiciousTag, locale) : pick(COPY.neutralTag, locale)}
                  </Badge>
                </div>
              ) : (
                <span className="text-text-muted">{pick(COPY.evidenceUndiscovered, locale)}</span>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function ToolPanelModal({ locale, tool, onClose }: { locale: AppLocale; tool: EvidenceTool; onClose: () => void }) {
  const items = EVIDENCE_ITEMS.filter((e) => e.tool === tool);
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 tablet:items-center tablet:p-4">
      <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-t-xl bg-surface p-5 shadow-2xl tablet:rounded-xl">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-base font-semibold text-text-primary">
            {TOOL_META[tool].icon}
            {pick(TOOL_META[tool].title, locale)}
          </h2>
          <button type="button" onClick={onClose} aria-label="Close" className="text-text-muted hover:text-text-primary">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {tool === "sender" && (
          <div className="mb-4 space-y-2 rounded-md bg-surface-raised p-3 text-sm">
            <p>
              <span className="text-text-muted">{pick(COPY.from, locale)}: </span>
              <Ltr className="font-mono text-text-primary">{CASE_EMAIL.senderAddress}</Ltr>
            </p>
            <p>
              <span className="text-text-muted">{pick(COPY.replyTo, locale)}: </span>
              <Ltr className="font-mono text-text-primary">{CASE_EMAIL.replyToAddress}</Ltr>
            </p>
            <p>
              <span className="text-text-muted">{pick(COPY.to, locale)}: </span>
              <Ltr className="font-mono text-text-primary">{CASE_EMAIL.recipientAddress}</Ltr>
            </p>
          </div>
        )}
        {tool === "url" && (
          <div className="mb-4 rounded-md bg-surface-raised p-3 text-sm">
            <p className="text-text-muted">{pick(COPY.urlInspector, locale)}</p>
            <Ltr className="break-all font-mono text-text-primary">{CASE_EMAIL.ctaUrl}</Ltr>
          </div>
        )}
        {tool === "headers" && (
          <div className="mb-4 space-y-1 rounded-md bg-surface-raised p-3 font-mono text-xs text-text-primary">
            <Ltr className="block">Return-Path: {CASE_EMAIL.headers.returnPath}</Ltr>
            <Ltr className="block">Message-Id: {CASE_EMAIL.headers.messageId}</Ltr>
            {CASE_EMAIL.headers.receivedChain.map((line, i) => (
              <Ltr key={i} className="block">
                Received: {line}
              </Ltr>
            ))}
          </div>
        )}
        {tool === "auth" && (
          <div className="mb-4 space-y-2 rounded-md bg-surface-raised p-3 text-sm">
            <Ltr className="block font-mono">
              SPF: {CASE_EMAIL.authentication.spf.toUpperCase()} · DKIM: {CASE_EMAIL.authentication.dkim.toUpperCase()} · DMARC:{" "}
              {CASE_EMAIL.authentication.dmarc.toUpperCase()}
            </Ltr>
            <p className="border-t border-border pt-2 text-text-secondary">{pick(CASE_EMAIL.signInLogEntry, locale)}</p>
          </div>
        )}
        {tool === "attachment" && (
          <div className="mb-4 rounded-md bg-surface-raised p-3 text-sm text-text-secondary">
            {pick(COPY.noAttachment, locale)}
          </div>
        )}
        {tool === "body" && (
          <div className="mb-4 rounded-md bg-surface-raised p-3 text-sm text-text-secondary">
            {pick(CASE_EMAIL.bodyParagraphs[CASE_EMAIL.bodyParagraphs.length - 1]!, locale)}
          </div>
        )}

        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="rounded-md border border-border p-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-text-primary">{pick(item.label, locale)}</span>
                <Badge variant={item.signal === "suspicious" ? "danger" : "success"} className="text-[10px]">
                  {item.signal === "suspicious" ? pick(COPY.suspiciousTag, locale) : pick(COPY.neutralTag, locale)}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-text-secondary">{pick(item.detail, locale)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Verdict
// ---------------------------------------------------------------------------

function VerdictScreen({
  locale,
  classification,
  exposure,
  responseActions,
  onClassification,
  onExposure,
  onToggleResponse,
  onSubmit,
  canSubmit,
}: {
  locale: AppLocale;
  classification: EmailClassification | null;
  exposure: ExposureLevel | null;
  responseActions: ResponseAction[];
  onClassification: (v: EmailClassification) => void;
  onExposure: (v: ExposureLevel) => void;
  onToggleResponse: (v: ResponseAction) => void;
  onSubmit: () => void;
  canSubmit: boolean;
}) {
  const classifications: { value: EmailClassification; label: { en: string; ar: string } }[] = [
    { value: "legitimate", label: COPY.legitimate },
    { value: "suspicious", label: COPY.suspicious },
    { value: "phishing", label: COPY.phishing },
  ];
  const exposures: { value: ExposureLevel; label: { en: string; ar: string } }[] = [
    { value: "not_clicked", label: COPY.notClicked },
    { value: "link_clicked", label: COPY.linkClicked },
    { value: "credentials_entered", label: COPY.credentialsEntered },
    { value: "unknown", label: COPY.unknown },
  ];

  return (
    <Card className="mx-auto max-w-lg" data-brand="labs">
      <CardHeader>
        <CardTitle className="font-display text-xl">{pick(COPY.verdictTitle, locale)}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">
            {pick(COPY.classificationLabel, locale)}
          </h3>
          <div className="flex flex-wrap gap-2">
            {classifications.map((c) => (
              <Button
                key={c.value}
                type="button"
                variant={classification === c.value ? "primary" : "outline"}
                size="sm"
                onClick={() => onClassification(c.value)}
              >
                {pick(c.label, locale)}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">{pick(COPY.exposureLabel, locale)}</h3>
          <div className="flex flex-wrap gap-2">
            {exposures.map((e) => (
              <Button
                key={e.value}
                type="button"
                variant={exposure === e.value ? "primary" : "outline"}
                size="sm"
                onClick={() => onExposure(e.value)}
              >
                {pick(e.label, locale)}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">{pick(COPY.responseLabel, locale)}</h3>
          <div className="grid grid-cols-1 gap-2 tablet:grid-cols-2">
            {RESPONSE_ACTIONS.map((action) => (
              <label
                key={action}
                className={`flex cursor-pointer items-center gap-2 rounded-md border p-2.5 text-sm ${
                  responseActions.includes(action) ? "border-primary bg-primary-50" : "border-border"
                }`}
              >
                <input
                  type="checkbox"
                  checked={responseActions.includes(action)}
                  onChange={() => onToggleResponse(action)}
                  className="h-4 w-4"
                />
                {pick(COPY.responseActionLabels[action], locale)}
              </label>
            ))}
          </div>
        </div>

        <Button className="w-full" size="lg" disabled={!canSubmit} onClick={onSubmit}>
          {pick(COPY.submit, locale)}
        </Button>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Consequence + timeline
// ---------------------------------------------------------------------------

function ConsequenceScreen({
  locale,
  state,
  onContinue,
}: {
  locale: AppLocale;
  state: PhishingHunterStepsState;
  onContinue: () => void;
}) {
  const result = computePhishingHunterScore(state);
  const copy = getPhishingHunterConsequenceCopy(result, state);
  const outcomeVariant: "success" | "warning" | "danger" =
    copy.outcome === "contained" ? "success" : copy.outcome === "partial" ? "warning" : "danger";

  return (
    <div className="mx-auto max-w-lg space-y-4" data-brand="labs">
      <Card>
        <CardHeader className="items-center text-center">
          <Badge variant={outcomeVariant} className="mb-2">
            {pick(copy.headline, locale)}
          </Badge>
          <CardTitle className="font-display text-xl">{pick(copy.headline, locale)}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-text-secondary">{pick(copy.body, locale)}</p>
          <div className="rounded-md bg-surface-raised p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
              {locale === "ar" ? "القرار الحاسم" : "Key Decision"}
            </p>
            <p className="mt-1 text-sm text-text-primary">{pick(copy.keyDecision, locale)}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4" aria-hidden="true" />
            {pick(COPY.attackTimelineTitle, locale)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3 border-s-2 border-border ps-4">
            {ATTACK_TIMELINE.map((event, i) => (
              <li key={i} className="relative">
                <span className="absolute -start-[21px] top-1 h-2.5 w-2.5 rounded-full bg-primary" aria-hidden="true" />
                <Ltr className="text-xs font-mono text-text-muted">{event.time}</Ltr>
                <p className="text-sm text-text-primary">{pick(event.label, locale)}</p>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <Card data-brand="labs">
        <CardHeader>
          <CardTitle className="text-base">{pick(COPY.whyThisMatters, locale)}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-text-secondary">{pick(WHY_THIS_MATTERS, locale)}</p>
        </CardContent>
      </Card>

      <Button className="w-full" size="lg" onClick={onContinue}>
        {pick(COPY.continueCta, locale)}
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Mission complete
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
  result: ReturnType<typeof computePhishingHunterScore>;
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
    <div className="mx-auto max-w-lg space-y-6" data-brand="labs">
      <WinCelebration active={passed} />
      <Card>
        <CardHeader className="items-center text-center">
          <Badge variant={passed ? "success" : "primary"} className="mb-2">
            {passed ? pick(COPY.passedHeading, locale) : pick(COPY.missionComplete, locale)}
          </Badge>
          <CardTitle className="font-display text-2xl">
            {locale === "ar" ? "صائد التصيّد™" : "Phishing Hunter™"}
          </CardTitle>
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
              <p className="text-text-muted">{pick(COPY.evidenceDiscoveredLabel, locale)}</p>
              <p className="font-display text-lg font-bold text-text-primary">
                {result.evidenceDiscovered}/{result.totalEvidence}
              </p>
            </div>
            <div className="rounded-md bg-surface-raised p-3">
              <p className="text-text-muted">{pick(COPY.investigationAccuracy, locale)}</p>
              <p className="font-display text-lg font-bold text-text-primary">{result.investigationScore}%</p>
            </div>
            <div className="rounded-md bg-surface-raised p-3">
              <p className="text-text-muted">{pick(COPY.responseAccuracy, locale)}</p>
              <p className="font-display text-lg font-bold text-text-primary">{result.responseScore}%</p>
            </div>
            <div className="rounded-md bg-surface-raised p-3">
              <p className="text-text-muted">{locale === "ar" ? "تحليل التهديد" : "Threat Analysis"}</p>
              <p className="font-display text-lg font-bold text-text-primary">{result.threatAnalysisScore}%</p>
            </div>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold text-text-primary">{pick(COPY.skillsPracticed, locale)}</h3>
            <ul className="mt-2 space-y-1.5">
              {PHISHING_HUNTER_SKILLS.map((skill) => (
                <li key={skill} className="flex items-start gap-2 text-sm text-text-secondary">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                  {pick(COPY.skillLabels[skill]!, locale)}
                </li>
              ))}
            </ul>
          </div>

          <Button type="button" variant="outline" className="w-full" onClick={onShare}>
            <Share2 className="h-4 w-4" aria-hidden="true" />
            {shareStatus === "copied" ? pick(COPY.shareCopied, locale) : pick(COPY.shareAchievement, locale)}
          </Button>
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
              challengeKey={PHISHING_HUNTER_CHALLENGE_KEY}
              registerCta={pick(COPY.registerCta, locale)}
              onRegistered={onRegistered}
            />
            <Button type="button" variant="ghost" size="sm" className="w-full" onClick={onHideRegisterForm}>
              {locale === "ar" ? "لاحقًا" : "Maybe later"}
            </Button>
          </CardContent>
        </Card>
      )}
      {!isSaved && !showRegisterForm && <p className="text-center text-xs text-text-muted">{pick(COPY.anonymousNote, locale)}</p>}
      {isSaved && <p className="text-center text-sm font-medium text-success-600">{pick(COPY.registeredConfirmation, locale)}</p>}

      <Card data-brand="labs">
        <CardContent className="flex flex-col items-center gap-3 pt-6 text-center">
          <h3 className="font-display text-lg font-semibold text-text-primary">{pick(COPY.nextMission, locale)}</h3>
          <Badge variant="outline">{pick(COPY.nextMissionComingSoon, locale)}</Badge>
          <Button asChild variant="outline" className="w-full tablet:w-auto">
            <Link href="/labs/decision-labs">{locale === "ar" ? "العودة إلى معامل القرار" : "Back to Decision Labs"}</Link>
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
