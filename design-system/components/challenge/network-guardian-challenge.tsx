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
  NETWORK_GUARDIAN_CHALLENGE_KEY,
  NETWORK_GUARDIAN_NODES,
  NETWORK_GUARDIAN_CONTROLS,
  NETWORK_GUARDIAN_MISSIONS,
  computeMissionScore,
  computeOverallResult,
  getNetworkConsequenceCopy,
  getNode,
  type NodeId,
  type ControlId,
  type MissionId,
  type MissionDefinition,
  type MissionResult,
  type MissionSubmission,
  type OverallResult,
} from "@/lib/challenges/network-guardian";
import {
  getOrCreateAnonId,
  loadChallengeProgress,
  saveChallengeProgress,
  clearChallengeProgress,
  type ChallengeLocalProgress,
} from "@/lib/challenges/anon-session";
import { saveAnonymousChallengeProgress, claimChallengeForCurrentUser } from "@/lib/actions/challenge";
import { BADGE_PASS_SCORE } from "@/lib/challenges/keys";
import { WinCelebration } from "@/components/shared/win-celebration";
import { trackEvent } from "@/lib/analytics/track";
import type { AppLocale } from "@/lib/i18n/config";
import {
  ShieldAlert,
  Globe,
  Router,
  Server,
  Cpu,
  Database,
  Users,
  HardDrive,
  KeyRound,
  Wifi,
  Laptop,
  Cloud,
  Lightbulb,
  CheckCircle2,
  Sparkles,
  Share2,
  Info,
  Lock,
  MapPin,
} from "lucide-react";

export interface NetworkGuardianChallengeProps {
  locale: AppLocale;
  shareUrl: string;
  isAuthenticated: boolean;
}

type Screen = "overview" | "briefing" | "workstation" | "consequence" | "complete";

// ---------------------------------------------------------------------------
// Per-mission diagram layout (presentation-only; positions + which edges
// look curved vs. straight are UI concerns, so this stays local to the
// component rather than living in the data-model file. The node IDs and
// edge blockedBy pairs below always mirror NETWORK_GUARDIAN_MISSIONS in
// lib/challenges/network-guardian.ts exactly, so the diagram never shows
// a connection the scoring engine doesn't actually simulate.)
// ---------------------------------------------------------------------------

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface MissionLayout {
  viewBox: string;
  positions: Partial<Record<NodeId, Box>>;
}

const MISSION_LAYOUTS: Record<MissionId, MissionLayout> = {
  basic_perimeter: {
    viewBox: "0 0 640 380",
    positions: {
      internet: { x: 240, y: 14, w: 160, h: 48 },
      web_server: { x: 30, y: 140, w: 175, h: 58 },
      workstations: { x: 435, y: 140, w: 175, h: 58 },
      database_server: { x: 225, y: 280, w: 190, h: 60 },
    },
  },
  internal_segmentation: {
    viewBox: "0 0 640 460",
    positions: {
      internet: { x: 240, y: 10, w: 160, h: 46 },
      web_server: { x: 20, y: 96, w: 175, h: 54 },
      workstations: { x: 445, y: 96, w: 175, h: 54 },
      app_server: { x: 20, y: 190, w: 175, h: 54 },
      file_server: { x: 445, y: 190, w: 175, h: 54 },
      identity_server: { x: 445, y: 284, w: 175, h: 54 },
      database_server: { x: 220, y: 372, w: 200, h: 60 },
    },
  },
  hybrid_cloud: {
    viewBox: "0 0 640 420",
    positions: {
      remote_users: { x: 20, y: 16, w: 175, h: 54 },
      internet: { x: 445, y: 16, w: 175, h: 54 },
      vpn_gateway: { x: 20, y: 116, w: 175, h: 54 },
      cloud_workload: { x: 445, y: 116, w: 175, h: 54 },
      workstations: { x: 20, y: 216, w: 175, h: 54 },
      database_server: { x: 220, y: 320, w: 200, h: 60 },
    },
  },
};

const NODE_ICON: Record<NodeId, React.ReactNode> = {
  internet: <Globe className="h-5 w-5" aria-hidden="true" />,
  router: <Router className="h-5 w-5" aria-hidden="true" />,
  web_server: <Server className="h-5 w-5" aria-hidden="true" />,
  app_server: <Cpu className="h-5 w-5" aria-hidden="true" />,
  database_server: <Database className="h-5 w-5" aria-hidden="true" />,
  workstations: <Users className="h-5 w-5" aria-hidden="true" />,
  file_server: <HardDrive className="h-5 w-5" aria-hidden="true" />,
  identity_server: <KeyRound className="h-5 w-5" aria-hidden="true" />,
  vpn_gateway: <Wifi className="h-5 w-5" aria-hidden="true" />,
  remote_users: <Laptop className="h-5 w-5" aria-hidden="true" />,
  cloud_workload: <Cloud className="h-5 w-5" aria-hidden="true" />,
};

function center(box: Box) {
  return { x: box.x + box.w / 2, y: box.y + box.h / 2 };
}

function nodeLabel(id: NodeId, locale: AppLocale) {
  return pick(getNode(id).label, locale);
}

// ---------------------------------------------------------------------------
// Copy
// ---------------------------------------------------------------------------

type Bilingual = { en: string; ar: string };

const COPY = {
  caseIdLabel: { en: "SCENARIO", ar: "السيناريو" },
  beginDefense: { en: "BEGIN MISSION", ar: "ابدأ المهمة" },
  seriesTitle: { en: "CyberAbeer Decision Labs™ — Network Guardian™", ar: "CyberAbeer Decision Labs™ — حارس الشبكة™" },
  seriesIntro: {
    en: "Three connected missions, one growing network. Defend the same customer database as it expands from a simple website to a segmented enterprise to a hybrid cloud with remote workers — each mission builds on what the last one taught you.",
    ar: "ثلاث مهام مترابطة، وشبكة واحدة تكبر. دافع عن نفس قاعدة بيانات العملاء وهي تتوسع من موقع بسيط إلى مؤسسة مقسّمة إلى سحابة هجينة بموظفين عن بُعد — كل مهمة تبني على ما علّمتك إياه سابقتها.",
  },
  missionOf: { en: "Mission {n} of 3", ar: "المهمة {n} من 3" },
  startSeries: { en: "START MISSION 1", ar: "ابدأ المهمة 1" },
  roadmapLocked: { en: "Unlocks after the previous mission", ar: "تُفتح بعد إنهاء المهمة السابقة" },
  roadmapDone: { en: "Complete", ar: "مكتملة" },
  roadmapCurrent: { en: "Up next", ar: "التالية" },
  workstationTitle: { en: "Network Operations Center", ar: "مركز عمليات الشبكة" },
  topologyHeading: { en: "Network Topology", ar: "بنية الشبكة" },
  controlsHeading: { en: "Available Controls", ar: "الضوابط المتاحة" },
  controlsPlaced: { en: "Slots used", ar: "الفتحات المستخدمة" },
  inspectHint: { en: "Tap a system to read its brief. Hover a control to see what it protects.", ar: "اضغط على أي نظام لقراءة موجزه. مرّر فوق ضابط لترى ما يحميه." },
  budgetIntro: {
    en: "You have {n} control slots — not enough to place every option. Trace every route into the database, then spend your slots covering each route rather than doubling up on one.",
    ar: "لديك {n} فتحات ضوابط — لا تكفي لوضع كل الخيارات. تتبّع كل مسار إلى قاعدة البيانات، ثم أنفق فتحاتك على تغطية كل مسار بدل تكرارها على مسار واحد.",
  },
  budgetFull: {
    en: "Slots full — remove a control before adding another.",
    ar: "الفتحات ممتلئة — أزل ضابطًا قبل إضافة آخر.",
  },
  hint1: { en: "Hint 1", ar: "تلميح 1" },
  hint2: { en: "Hint 2", ar: "تلميح 2" },
  runTest: { en: "RUN THE PENTEST", ar: "شغّل اختبار الاختراق" },
  runTestHint: { en: "Place at least one control before running the test.", ar: "ضع ضابطًا واحدًا على الأقل قبل تشغيل الاختبار." },
  continueCta: { en: "Continue", ar: "متابعة" },
  continueToMission: { en: "Continue to Mission {n}", ar: "المتابعة إلى المهمة {n}" },
  whatHappenedHeading: { en: "What Happened", ar: "ما الذي حدث" },
  whyItMatteredHeading: { en: "Why It Mattered", ar: "لماذا كان هذا مهمًا" },
  keyDecisionHeading: { en: "Key Decision", ar: "القرار الحاسم" },
  missionCompleteBadge: { en: "MISSION COMPLETE", ar: "اكتملت المهمة" },
  missionScoreLabel: { en: "Mission score", ar: "نتيجة المهمة" },
  completeTitle: { en: "Network Guardian™", ar: "حارس الشبكة™" },
  scoreLabel: { en: "Overall Score", ar: "النتيجة الإجمالية" },
  xpLabel: { en: "XP Earned", ar: "نقاط الخبرة" },
  badgeUnlocked: { en: "Badge Unlocked", ar: "تم فتح الشارة" },
  badgeName: { en: "Network Guardian", ar: "حارس الشبكة" },
  badgeDescription: {
    en: "Defended a growing network — perimeter, internal segmentation, and hybrid cloud — across three missions.",
    ar: "دافع عن شبكة متنامية — المحيط والتقسيم الداخلي والسحابة الهجينة — عبر ثلاث مهام.",
  },
  perMissionHeading: { en: "Mission Results", ar: "نتائج المهام" },
  controlsPlacedStat: { en: "Controls Placed", ar: "الضوابط الموضوعة" },
  outcomeStat: { en: "Outcome", ar: "النتيجة" },
  hintsUsedStat: { en: "Hints Used", ar: "التلميحات المستخدمة" },
  skillsPracticed: { en: "Skills Practiced", ar: "المهارات المُمارَسة" },
  skillLabels: [
    { en: "Network segmentation", ar: "تقسيم الشبكة" },
    { en: "Defense in depth", ar: "الدفاع المتعدد الطبقات" },
    { en: "Identity & access protection", ar: "حماية الهوية والوصول" },
    { en: "Zero Trust for hybrid & remote", ar: "الثقة الصفرية للعمل الهجين وعن بُعد" },
  ],
  shareAchievement: { en: "Share Achievement", ar: "مشاركة الإنجاز" },
  shareCopied: { en: "Copied to clipboard", ar: "تم النسخ إلى الحافظة" },
  registerHeading: { en: "Save this result to your profile", ar: "احفظ هذه النتيجة في ملفك الشخصي" },
  registerBody: {
    en: "Create a free account to keep your XP and badge across every CyberAbeer Decision Lab.",
    ar: "أنشئ حسابًا مجانيًا للاحتفاظ بنقاط خبرتك وشارتك عبر كل معمل قرار CyberAbeer.",
  },
  registerCta: { en: "Save My Result", ar: "احفظ نتيجتي" },
  registeredConfirmation: { en: "Saved to your account.", ar: "تم الحفظ في حسابك." },
  registerLater: { en: "Maybe later", ar: "لاحقًا" },
  anonymousNote: {
    en: "Your progress is saved on this device. Register any time to keep it permanently.",
    ar: "تُحفظ تقدُّماتك على هذا الجهاز. سجّل في أي وقت للاحتفاظ بها بشكل دائم.",
  },
  nextMission: { en: "Next Mission: SOC Night Shift", ar: "المهمة التالية: مناوبة مركز العمليات الليلية" },
  nextMissionCta: { en: "Start mission →", ar: "ابدأ المهمة ←" },
  backToLabs: { en: "Back to Decision Labs", ar: "العودة إلى معامل القرار" },
  restart: { en: "Defend Again", ar: "دافع مرة أخرى" },
  strictEvaluationNote: {
    en: `This is a strictly evaluated, three-mission series. You need an average score of ${BADGE_PASS_SCORE}% or higher across all three missions to earn the badge and trigger the win celebration.`,
    ar: `هذه سلسلة من ثلاث مهام تُقيَّم بصرامة. تحتاج إلى متوسط نتيجة ${BADGE_PASS_SCORE}% أو أعلى عبر المهام الثلاث للحصول على الشارة وتفعيل احتفال الفوز.`,
  },
  passedHeading: { en: "ALL MISSIONS COMPLETE — PASSED", ar: "اكتملت جميع المهام — نجاح" },
  notPassedHeading: { en: "Below passing average", ar: "أقل من متوسط النجاح" },
  notPassedBody: {
    en: `Your average across the three missions was below the ${BADGE_PASS_SCORE}% threshold required for the badge. Defend again with a stronger control loadout to raise your score.`,
    ar: `كان متوسطك عبر المهام الثلاث أقل من الحد المطلوب البالغ ${BADGE_PASS_SCORE}% للحصول على الشارة. دافع مرة أخرى بضوابط أقوى لرفع نتيجتك.`,
  },
  badgeLockedNote: {
    en: `Average ${BADGE_PASS_SCORE}%+ to unlock`,
    ar: `احصل على متوسط ${BADGE_PASS_SCORE}%+ لفتحها`,
  },
  always_open: { en: "Always reachable — not blockable", ar: "قابل للوصول دائمًا — لا يمكن حظره" },
} as const;

const OUTCOME_ICON_LABEL: Record<MissionResult["outcome"], Bilingual> = {
  secured: { en: "Secured", ar: "مؤمّنة" },
  breached: { en: "Breached", ar: "مخترقة" },
};

function fmt(template: Bilingual, locale: AppLocale, n: number) {
  return pick(template, locale).replace("{n}", String(n));
}

// ---------------------------------------------------------------------------
// Persisted shape
// ---------------------------------------------------------------------------

interface StoredMissionState {
  placedControls: ControlId[];
  hintsUsed: number;
}

interface NetworkGuardianProgress {
  currentMissionIndex: number;
  missionState: Partial<Record<MissionId, StoredMissionState>>;
  missionResults: MissionResult[];
}

function isValidProgress(value: unknown): value is NetworkGuardianProgress {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return typeof v.currentMissionIndex === "number" && typeof v.missionState === "object" && Array.isArray(v.missionResults);
}

/**
 * Orchestrates the CyberAbeer Decision Labs™ Network Guardian™
 * three-mission arc: an overview/roadmap screen, then for each mission
 * in turn a briefing, a network-topology workstation where the visitor
 * decides which controls to place, and a consequence screen revealing
 * the simulated attack (lib/challenges/network-guardian.ts's
 * simulateMissionAttack()) — finishing with an aggregate Mission
 * Complete screen once all three are done. All three missions persist
 * under the single existing NETWORK_GUARDIAN_CHALLENGE_KEY, so the
 * badge-claim / anon-session pipeline needs no changes.
 */
export function NetworkGuardianChallenge({ locale, shareUrl, isAuthenticated }: NetworkGuardianChallengeProps) {
  const missions = NETWORK_GUARDIAN_MISSIONS;
  const [screen, setScreen] = React.useState<Screen>("overview");
  const [anonId, setAnonId] = React.useState("");
  const [missionIndex, setMissionIndex] = React.useState(0);
  const [missionState, setMissionState] = React.useState<Partial<Record<MissionId, StoredMissionState>>>({});
  const [missionResults, setMissionResults] = React.useState<MissionResult[]>([]);
  const [inspectedNode, setInspectedNode] = React.useState<NodeId | null>(null);
  const [hoveredControl, setHoveredControl] = React.useState<ControlId | null>(null);
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

  const mission = missions[missionIndex] ?? missions[0]!;
  const current = missionState[mission.id] ?? { placedControls: [], hintsUsed: 0 };

  React.useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    const id = getOrCreateAnonId();
    setAnonId(id);
    const saved = loadChallengeProgress<NetworkGuardianProgress>(NETWORK_GUARDIAN_CHALLENGE_KEY);
    if (saved && isValidProgress(saved.stepsState)) {
      setMissionIndex(saved.stepsState.currentMissionIndex);
      setMissionState(saved.stepsState.missionState);
      setMissionResults(saved.stepsState.missionResults);
      setStartedAt(saved.startedAt);
      setClaimed(Boolean(saved.claimed));
      setClaimedXp(saved.claimedXp);
      if (saved.completedAt) {
        setCompletedAt(saved.completedAt);
        setScreen("complete");
        startedAnalytics.current = true;
      } else if (saved.stepsState.missionResults.length > 0) {
        setScreen("briefing");
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
    claimChallengeForCurrentUser({ anonId, challengeKey: NETWORK_GUARDIAN_CHALLENGE_KEY }).then((result) => {
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

  function persist(nextMissionIndex: number, nextMissionState: typeof missionState, nextResults: MissionResult[], completed: boolean) {
    const nowIso = completed ? new Date().toISOString() : null;
    const progress: NetworkGuardianProgress = {
      currentMissionIndex: nextMissionIndex,
      missionState: nextMissionState,
      missionResults: nextResults,
    };
    const localProgress: ChallengeLocalProgress<NetworkGuardianProgress> = {
      currentStepIndex: nextResults.length,
      stepsState: progress,
      startedAt: startedAt || new Date().toISOString(),
      completedAt: nowIso,
      claimed,
      claimedXp,
    };
    saveChallengeProgress(NETWORK_GUARDIAN_CHALLENGE_KEY, localProgress);
    if (completed) setCompletedAt(nowIso);

    const overall = computeOverallResult(nextResults);
    const totalHints = Object.values(nextMissionState).reduce((sum, m) => sum + (m?.hintsUsed ?? 0), 0);
    void saveAnonymousChallengeProgress({
      anonId,
      challengeKey: NETWORK_GUARDIAN_CHALLENGE_KEY,
      status: completed ? "completed" : "in_progress",
      currentStep: nextResults.length,
      score: overall.score,
      xpEarned: overall.xp,
      hintsUsed: totalHints,
      stepsState: progress,
      locale,
    });
  }

  function handleBeginSeries() {
    const now = new Date().toISOString();
    setStartedAt(now);
    setScreen("briefing");
    if (!startedAnalytics.current) {
      startedAnalytics.current = true;
      trackEvent("challenge_started", { locale, challengeKey: NETWORK_GUARDIAN_CHALLENGE_KEY });
    }
  }

  function toggleControl(id: ControlId) {
    let blockedByBudget = false;
    setMissionState((prev) => {
      const state = prev[mission.id] ?? { placedControls: [], hintsUsed: 0 };
      const isPlaced = state.placedControls.includes(id);
      if (!isPlaced && state.placedControls.length >= mission.controlBudget) {
        blockedByBudget = true;
        return prev;
      }
      const placedControls = isPlaced
        ? state.placedControls.filter((c) => c !== id)
        : [...state.placedControls, id];
      return { ...prev, [mission.id]: { ...state, placedControls } };
    });
    if (blockedByBudget) return;
    trackEvent("challenge_hotspot_inspected", { locale, challengeKey: NETWORK_GUARDIAN_CHALLENGE_KEY, hotspot: id });
  }

  function handleUseHint() {
    if (current.hintsUsed >= 2) return;
    const next = current.hintsUsed + 1;
    setMissionState((prev) => ({ ...prev, [mission.id]: { ...current, hintsUsed: next } }));
    trackEvent("hint_used", { locale, challengeKey: NETWORK_GUARDIAN_CHALLENGE_KEY, hintLevel: next });
  }

  function handleRunTest() {
    if (current.placedControls.length === 0) return;
    const submission: MissionSubmission = { missionId: mission.id, placedControls: current.placedControls, hintsUsed: current.hintsUsed };
    const result = computeMissionScore(submission);
    const nextResults = [...missionResults, result];
    setMissionResults(nextResults);
    trackEvent("challenge_step_completed", {
      locale,
      challengeKey: NETWORK_GUARDIAN_CHALLENGE_KEY,
      score: result.score,
      outcome: result.outcome,
    });
    persist(missionIndex, missionState, nextResults, false);
    setScreen("consequence");
  }

  function handleFinishConsequence() {
    const isLastMission = missionIndex === missions.length - 1;
    if (isLastMission) {
      const overall = computeOverallResult(missionResults);
      persist(missionIndex, missionState, missionResults, true);
      trackEvent("challenge_completed", {
        locale,
        challengeKey: NETWORK_GUARDIAN_CHALLENGE_KEY,
        score: overall.score,
        xp: overall.xp,
        outcome: overall.outcome,
      });
      setScreen("complete");
    } else {
      const nextIndex = missionIndex + 1;
      setMissionIndex(nextIndex);
      setInspectedNode(null);
      persist(nextIndex, missionState, missionResults, false);
      setScreen("briefing");
    }
  }

  function handleClaimed(result: { xpAwarded: number; badgeAwarded: boolean }) {
    setClaimed(true);
    const overall = computeOverallResult(missionResults);
    const safeXp = result.xpAwarded || overall.xp;
    setClaimedXp(safeXp);
    setRegisteredResult({ ...result, xpAwarded: safeXp });
    saveChallengeProgress(NETWORK_GUARDIAN_CHALLENGE_KEY, {
      currentStepIndex: missionResults.length,
      stepsState: { currentMissionIndex: missionIndex, missionState, missionResults },
      startedAt,
      completedAt: completedAt ?? new Date().toISOString(),
      claimed: true,
      claimedXp: safeXp,
    });
    if (result.badgeAwarded) {
      trackEvent("badge_earned", { locale, challengeKey: NETWORK_GUARDIAN_CHALLENGE_KEY });
    }
  }

  async function handleShare() {
    const overall = computeOverallResult(missionResults);
    const shareText =
      locale === "ar"
        ? `أكملت CyberAbeer Decision Labs™ حارس الشبكة (3 مهام) — النتيجة: ${overall.score}% | نقاط الخبرة: ${overall.xp}`
        : `I completed CyberAbeer Decision Labs™ Network Guardian™ (3 missions) — Score: ${overall.score}% | XP: ${overall.xp}`;
    trackEvent("challenge_result_shared", { locale, challengeKey: NETWORK_GUARDIAN_CHALLENGE_KEY, score: overall.score });
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
      setTimeout(() => setShareStatus("idle"), 3000);
    }
  }

  function handleRestart() {
    setMissionIndex(0);
    setMissionState({});
    setMissionResults([]);
    setInspectedNode(null);
    setCompletedAt(null);
    setClaimed(false);
    setClaimedXp(undefined);
    setRegisteredResult(null);
    setScreen("overview");
    clearChallengeProgress(NETWORK_GUARDIAN_CHALLENGE_KEY);
  }

  if (!anonId) return null;

  if (screen === "overview") {
    return <OverviewScreen locale={locale} missions={missions} onBegin={handleBeginSeries} />;
  }

  if (screen === "briefing") {
    return (
      <BriefingScreen
        locale={locale}
        mission={mission}
        missionNumber={missionIndex + 1}
        onBegin={() => setScreen("workstation")}
      />
    );
  }

  if (screen === "workstation") {
    return (
      <WorkstationScreen
        locale={locale}
        mission={mission}
        missionNumber={missionIndex + 1}
        placedControls={current.placedControls}
        hintsUsed={current.hintsUsed}
        inspectedNode={inspectedNode}
        hoveredControl={hoveredControl}
        onInspectNode={setInspectedNode}
        onHoverControl={setHoveredControl}
        onToggleControl={toggleControl}
        onUseHint={handleUseHint}
        onRunTest={handleRunTest}
      />
    );
  }

  if (screen === "consequence") {
    const submission: MissionSubmission = { missionId: mission.id, placedControls: current.placedControls, hintsUsed: current.hintsUsed };
    const result = missionResults[missionResults.length - 1] ?? computeMissionScore(submission);
    const isLastMission = missionIndex === missions.length - 1;
    return (
      <ConsequenceScreen
        locale={locale}
        mission={mission}
        result={result}
        placedControls={current.placedControls}
        isLastMission={isLastMission}
        nextMissionNumber={missionIndex + 2}
        onContinue={handleFinishConsequence}
      />
    );
  }

  const overall = computeOverallResult(missionResults);
  const passed = overall.allPassed;
  return (
    <CompleteScreen
      locale={locale}
      overall={overall}
      passed={passed}
      anonId={anonId}
      isSaved={claimed || Boolean(registeredResult) || isAuthenticated}
      displayXp={registeredResult ? registeredResult.xpAwarded || overall.xp : claimed ? claimedXp || overall.xp : overall.xp}
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
// Overview / roadmap
// ---------------------------------------------------------------------------

function OverviewScreen({
  locale,
  missions,
  onBegin,
}: {
  locale: AppLocale;
  missions: MissionDefinition[];
  onBegin: () => void;
}) {
  return (
    <Card className="mx-auto max-w-2xl" data-brand="labs">
      <CardHeader className="items-center text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 text-primary-700">
          <ShieldAlert className="h-7 w-7" aria-hidden="true" />
        </div>
        <Badge variant="primary">{pick(COPY.caseIdLabel, locale)}</Badge>
        <CardTitle className="font-display text-2xl">{pick(COPY.seriesTitle, locale)}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5 text-center">
        <div className="rounded-md bg-surface-raised p-4 text-start">
          <p className="text-sm text-text-secondary">{pick(COPY.seriesIntro, locale)}</p>
        </div>
        <ol className="space-y-2 text-start">
          {missions.map((m, i) => (
            <li key={m.id} className="flex items-start gap-3 rounded-md border border-border bg-surface p-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">
                {i + 1}
              </span>
              <div>
                <p className="text-sm font-semibold text-text-primary">{pick(m.title, locale)}</p>
                {i === 0 ? (
                  <p className="mt-0.5 text-xs text-primary-700">{pick(COPY.roadmapCurrent, locale)}</p>
                ) : (
                  <p className="mt-0.5 text-xs text-text-muted">{pick(COPY.roadmapLocked, locale)}</p>
                )}
              </div>
            </li>
          ))}
        </ol>
        <div className="flex items-start gap-2 rounded-md border border-warning-200 bg-warning-50 p-3 text-start">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-warning-600" aria-hidden="true" />
          <p className="text-xs text-text-secondary">{pick(COPY.strictEvaluationNote, locale)}</p>
        </div>
        <Button className="w-full" size="lg" onClick={onBegin}>
          {pick(COPY.startSeries, locale)}
        </Button>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Briefing
// ---------------------------------------------------------------------------

function BriefingScreen({
  locale,
  mission,
  missionNumber,
  onBegin,
}: {
  locale: AppLocale;
  mission: MissionDefinition;
  missionNumber: number;
  onBegin: () => void;
}) {
  return (
    <Card className="mx-auto max-w-lg" data-brand="labs">
      <CardHeader className="items-center text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 text-primary-700">
          <ShieldAlert className="h-7 w-7" aria-hidden="true" />
        </div>
        <Badge variant="primary">{fmt(COPY.missionOf, locale, missionNumber)}</Badge>
        <CardTitle className="font-display text-2xl">{pick(mission.title, locale)}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-center">
        <div className="rounded-md bg-surface-raised p-4 text-start">
          <p className="text-sm text-text-secondary">{pick(mission.briefing, locale)}</p>
        </div>
        <Button className="w-full" size="lg" onClick={onBegin}>
          {pick(COPY.beginDefense, locale)}
        </Button>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Topology diagram (shared between workstation "decide" mode and
// consequence "result" mode)
// ---------------------------------------------------------------------------

function TopologyDiagram({
  locale,
  mission,
  placedControls,
  inspectedNode,
  onInspectNode,
  hoveredControl,
  mode,
  compromisedNodes,
  protectedNodes,
  attackPath,
}: {
  locale: AppLocale;
  mission: MissionDefinition;
  placedControls: ControlId[];
  inspectedNode: NodeId | null;
  onInspectNode: (id: NodeId) => void;
  hoveredControl?: ControlId | null;
  mode: "decide" | "result";
  compromisedNodes?: NodeId[];
  protectedNodes?: NodeId[];
  attackPath?: NodeId[] | null;
}) {
  const layout = MISSION_LAYOUTS[mission.id];
  const nodes = NETWORK_GUARDIAN_NODES.filter((n) => mission.nodeIds.includes(n.id));

  const blockedEdgeIds = mission.edges.filter((e) => e.blockedBy && placedControls.includes(e.blockedBy)).map((e) => e.id);
  const highlightedEdgeIds =
    mode === "decide" && hoveredControl
      ? mission.edges.filter((e) => e.blockedBy === hoveredControl).map((e) => e.id)
      : [];

  const attackPathEdgeIds = new Set<string>();
  if (attackPath && attackPath.length > 1) {
    for (let i = 0; i < attackPath.length - 1; i++) {
      const a = attackPath[i];
      const b = attackPath[i + 1];
      const edge = mission.edges.find((e) => (e.from === a && e.to === b) || (e.from === b && e.to === a));
      if (edge) attackPathEdgeIds.add(edge.id);
    }
  }

  function nodeFill(id: NodeId): string {
    if (mode === "decide") return id === "internet" ? "fill-neutral-800" : "fill-surface";
    if (id === "internet") return "fill-neutral-800";
    if (compromisedNodes?.includes(id)) return "fill-danger-50";
    if (protectedNodes?.includes(id)) return "fill-success-50";
    return "fill-surface";
  }

  function nodeStroke(id: NodeId): string {
    if (mode === "decide") return "stroke-border";
    if (id === "internet") return "stroke-neutral-800";
    if (compromisedNodes?.includes(id)) return "stroke-danger-500";
    if (protectedNodes?.includes(id)) return "stroke-success-500";
    return "stroke-border";
  }

  return (
    <svg viewBox={layout.viewBox} className="h-auto w-full" style={{ direction: "ltr" }} role="img" aria-label={pick(COPY.topologyHeading, locale)}>
      <defs>
        <marker id="ng-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" className="fill-danger-500" />
        </marker>
      </defs>

      {mission.edges.map((edge) => {
        const fromBox = layout.positions[edge.from];
        const toBox = layout.positions[edge.to];
        if (!fromBox || !toBox) return null;
        const from = center(fromBox);
        const to = center(toBox);
        const isBlocked = blockedEdgeIds.includes(edge.id);
        const isAttackPath = mode === "result" && attackPathEdgeIds.has(edge.id) && !isBlocked;
        const isHighlighted = highlightedEdgeIds.includes(edge.id);
        const isUnblockable = !edge.blockedBy;
        const path = `M${from.x},${from.y} L${to.x},${to.y}`;
        return (
          <g key={edge.id}>
            <path
              d={path}
              fill="none"
              strokeWidth={isAttackPath ? 3.5 : isHighlighted ? 3 : 2}
              strokeDasharray={isBlocked ? "6 5" : isUnblockable ? "2 4" : undefined}
              className={
                isAttackPath
                  ? "stroke-danger-500"
                  : isHighlighted
                    ? "stroke-primary"
                    : isBlocked
                      ? "stroke-neutral-300"
                      : isUnblockable
                        ? "stroke-neutral-400"
                        : mode === "result"
                          ? "stroke-neutral-300"
                          : "stroke-neutral-400"
              }
              markerEnd={isAttackPath ? "url(#ng-arrow)" : undefined}
            />
            {isAttackPath && (
              <circle r={4} className="fill-danger-500">
                <animateMotion dur="1.4s" repeatCount="indefinite" path={path} />
              </circle>
            )}
          </g>
        );
      })}

      {nodes.map((node) => {
        const box = layout.positions[node.id];
        if (!box) return null;
        const isInspected = inspectedNode === node.id;
        const isOrigin = node.id === "internet";
        return (
          <g key={node.id} className="cursor-pointer" onClick={() => onInspectNode(node.id)}>
            <rect
              x={box.x}
              y={box.y}
              width={box.w}
              height={box.h}
              rx={10}
              strokeWidth={isInspected ? 3 : 2}
              className={`${nodeFill(node.id)} ${nodeStroke(node.id)}`}
            >
              {isOrigin && mode === "decide" && (
                <animate attributeName="opacity" values="1;0.75;1" dur="2.4s" repeatCount="indefinite" />
              )}
            </rect>
            <text
              x={box.x + box.w / 2}
              y={box.y + box.h / 2 + 5}
              textAnchor="middle"
              className={`text-[10.5px] font-semibold ${node.id === "internet" ? "fill-white" : "fill-text-primary"}`}
            >
              {nodeLabel(node.id, locale).slice(0, 26)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Workstation (topology + controls)
// ---------------------------------------------------------------------------

function WorkstationScreen({
  locale,
  mission,
  missionNumber,
  placedControls,
  hintsUsed,
  inspectedNode,
  hoveredControl,
  onInspectNode,
  onHoverControl,
  onToggleControl,
  onUseHint,
  onRunTest,
}: {
  locale: AppLocale;
  mission: MissionDefinition;
  missionNumber: number;
  placedControls: ControlId[];
  hintsUsed: number;
  inspectedNode: NodeId | null;
  hoveredControl: ControlId | null;
  onInspectNode: (id: NodeId) => void;
  onHoverControl: (id: ControlId | null) => void;
  onToggleControl: (id: ControlId) => void;
  onUseHint: () => void;
  onRunTest: () => void;
}) {
  const dir = locale === "ar" ? "rtl" : "ltr";
  const inspected = inspectedNode ? getNode(inspectedNode) : null;
  const ready = placedControls.length > 0;
  const controls = NETWORK_GUARDIAN_CONTROLS.filter((c) => mission.availableControls.includes(c.id));
  const hasUnblockableEdge = mission.edges.some((e) => !e.blockedBy);
  const budgetFull = placedControls.length >= mission.controlBudget;

  return (
    <div className="mx-auto max-w-4xl space-y-4" dir={dir} data-brand="labs">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">{fmt(COPY.missionOf, locale, missionNumber)}</p>
          <h1 className="font-display text-lg font-semibold text-text-primary">{pick(mission.title, locale)}</h1>
        </div>
        <Badge variant={budgetFull ? "warning" : "outline"}>
          {pick(COPY.controlsPlaced, locale)}: {placedControls.length}/{mission.controlBudget}
        </Badge>
      </div>

      <div className="flex items-start gap-2 rounded-md border border-warning-200 bg-warning-50 p-3 text-start">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-warning-600" aria-hidden="true" />
        <p className="text-xs text-text-secondary">{fmt(COPY.budgetIntro, locale, mission.controlBudget)}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">{pick(COPY.topologyHeading, locale)}</CardTitle>
          <CardDescription>{pick(COPY.inspectHint, locale)}</CardDescription>
        </CardHeader>
        <CardContent>
          <TopologyDiagram
            locale={locale}
            mission={mission}
            placedControls={placedControls}
            inspectedNode={inspectedNode}
            onInspectNode={onInspectNode}
            hoveredControl={hoveredControl}
            mode="decide"
          />
          {hasUnblockableEdge && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-text-muted">
              <span className="inline-block h-0 w-4 border-t-2 border-dotted border-neutral-400" aria-hidden="true" />
              {pick(COPY.always_open, locale)}
            </p>
          )}
          {inspected && (
            <div className="mt-3 flex items-start gap-2 rounded-md bg-surface-raised p-3 text-sm">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" aria-hidden="true" />
              <div>
                <p className="font-semibold text-text-primary">{pick(inspected.label, locale)}</p>
                <p className="text-text-secondary">{pick(inspected.description, locale)}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">{pick(COPY.controlsHeading, locale)}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {budgetFull && (
            <p className="rounded-md bg-warning-50 p-2 text-xs font-medium text-warning-700">{pick(COPY.budgetFull, locale)}</p>
          )}
          {controls.map((control) => {
            const active = placedControls.includes(control.id);
            const disabled = !active && budgetFull;
            return (
              <button
                key={control.id}
                type="button"
                disabled={disabled}
                onClick={() => onToggleControl(control.id)}
                onMouseEnter={() => onHoverControl(control.id)}
                onMouseLeave={() => onHoverControl(null)}
                onFocus={() => onHoverControl(control.id)}
                onBlur={() => onHoverControl(null)}
                className={`flex w-full items-start gap-3 rounded-md border p-3 text-start transition-colors ${
                  active ? "border-primary bg-primary-50" : disabled ? "border-border bg-surface opacity-50 cursor-not-allowed" : "border-border bg-surface"
                }`}
              >
                <div
                  className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                    active ? "border-primary bg-primary text-white" : "border-border"
                  }`}
                >
                  {active ? <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> : <Lock className="h-3 w-3 text-text-muted" aria-hidden="true" />}
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">{pick(control.name, locale)}</p>
                  <p className="text-xs text-text-secondary">{pick(control.description, locale)}</p>
                </div>
              </button>
            );
          })}

          <div className="space-y-2 border-t border-border pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2"
              disabled={hintsUsed >= 1}
              onClick={onUseHint}
            >
              <Lightbulb className="h-4 w-4" aria-hidden="true" />
              {pick(COPY.hint1, locale)}
            </Button>
            {hintsUsed >= 1 && (
              <p className="rounded-md bg-surface-raised p-2 text-xs text-text-secondary">{pick(mission.hint1, locale)}</p>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2"
              disabled={hintsUsed >= 2}
              onClick={onUseHint}
            >
              <Lightbulb className="h-4 w-4" aria-hidden="true" />
              {pick(COPY.hint2, locale)}
            </Button>
            {hintsUsed >= 2 && (
              <p className="rounded-md bg-surface-raised p-2 text-xs text-text-secondary">{pick(mission.hint2, locale)}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="sticky bottom-4 flex justify-center">
        <Button size="lg" disabled={!ready} onClick={onRunTest} className="shadow-lg">
          {pick(COPY.runTest, locale)}
        </Button>
      </div>
      {!ready && <p className="text-center text-xs text-text-muted">{pick(COPY.runTestHint, locale)}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Consequence
// ---------------------------------------------------------------------------

function ConsequenceScreen({
  locale,
  mission,
  result,
  placedControls,
  isLastMission,
  nextMissionNumber,
  onContinue,
}: {
  locale: AppLocale;
  mission: MissionDefinition;
  result: MissionResult;
  placedControls: ControlId[];
  isLastMission: boolean;
  nextMissionNumber: number;
  onContinue: () => void;
}) {
  const copy = getNetworkConsequenceCopy(mission.id, result);
  const outcomeVariant: "success" | "danger" = result.outcome === "secured" ? "success" : "danger";

  return (
    <div className="mx-auto max-w-2xl space-y-4" dir={locale === "ar" ? "rtl" : "ltr"} data-brand="labs">
      <Card>
        <CardHeader className="items-center text-center">
          <Badge variant={outcomeVariant} className="mb-2">
            {pick(copy.outcomeLabel, locale)}
          </Badge>
          <CardTitle className="font-display text-xl">{pick(copy.headline, locale)}</CardTitle>
          <p className="text-sm font-semibold text-text-muted">
            {pick(COPY.missionScoreLabel, locale)}: {result.score}%
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <TopologyDiagram
            locale={locale}
            mission={mission}
            placedControls={placedControls}
            inspectedNode={null}
            onInspectNode={() => {}}
            mode="result"
            compromisedNodes={result.simulation.compromisedNodes}
            protectedNodes={result.simulation.protectedNodes}
            attackPath={result.simulation.attackPath}
          />
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">{pick(COPY.whatHappenedHeading, locale)}</h3>
            <p className="mt-1 text-sm text-text-secondary">{pick(copy.whatHappened, locale)}</p>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">{pick(COPY.whyItMatteredHeading, locale)}</h3>
            <p className="mt-1 text-sm text-text-secondary">{pick(copy.whyItMattered, locale)}</p>
          </div>
          <div className="rounded-md bg-surface-raised p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">{pick(COPY.keyDecisionHeading, locale)}</p>
            <p className="mt-1 text-sm text-text-primary">{pick(copy.keyDecision, locale)}</p>
          </div>
        </CardContent>
      </Card>

      <Button className="w-full" size="lg" onClick={onContinue}>
        {isLastMission ? pick(COPY.continueCta, locale) : fmt(COPY.continueToMission, locale, nextMissionNumber)}
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Mission complete (aggregate across all three missions)
// ---------------------------------------------------------------------------

function CompleteScreen({
  locale,
  overall,
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
  overall: OverallResult;
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
            {passed ? pick(COPY.passedHeading, locale) : pick(COPY.missionCompleteBadge, locale)}
          </Badge>
          <CardTitle className="font-display text-2xl">{pick(COPY.completeTitle, locale)}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center gap-6 tablet:flex-row tablet:justify-center tablet:gap-10">
            <ScoreGauge score={overall.score} label={pick(COPY.scoreLabel, locale)} size="lg" />
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

          <div>
            <h3 className="font-display text-sm font-semibold text-text-primary">{pick(COPY.perMissionHeading, locale)}</h3>
            <div className="mt-2 space-y-2">
              {overall.missionResults.map((r, i) => {
                const missionDef = NETWORK_GUARDIAN_MISSIONS.find((m) => m.id === r.missionId)!;
                return (
                  <div key={r.missionId} className="flex items-center justify-between rounded-md bg-surface-raised p-3 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-text-muted" aria-hidden="true" />
                      <span className="text-text-primary">
                        {fmt(COPY.missionOf, locale, i + 1)}: {pick(missionDef.title, locale).replace(/^Mission \d+:\s*/, "").replace(/^المهمة \d+:\s*/, "")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-text-muted">{pick(OUTCOME_ICON_LABEL[r.outcome], locale)}</span>
                      <span className="font-display font-bold text-text-primary">{r.score}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold text-text-primary">{pick(COPY.skillsPracticed, locale)}</h3>
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
              challengeKey={NETWORK_GUARDIAN_CHALLENGE_KEY}
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
      {isSaved && <p className="text-center text-sm font-medium text-success-600">{pick(COPY.registeredConfirmation, locale)}</p>}

      <Card data-brand="labs">
        <CardContent className="flex flex-col items-center gap-3 pt-6 text-center">
          <h3 className="font-display text-lg font-semibold text-text-primary">{pick(COPY.nextMission, locale)}</h3>
          <Button asChild className="w-full tablet:w-auto">
            <Link href="/challenge/soc-night-shift">{pick(COPY.nextMissionCta, locale)}</Link>
          </Button>
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
