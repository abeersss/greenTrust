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
  computeNetworkGuardianScore,
  getNetworkConsequenceCopy,
  type NodeId,
  type ControlId,
  type NetworkGuardianSubmission,
} from "@/lib/challenges/network-guardian";
import {
  getOrCreateAnonId,
  loadChallengeProgress,
  saveChallengeProgress,
  clearChallengeProgress,
  type ChallengeLocalProgress,
} from "@/lib/challenges/anon-session";
import { saveAnonymousChallengeProgress, claimChallengeForCurrentUser } from "@/lib/actions/challenge";
import { trackEvent } from "@/lib/analytics/track";
import type { AppLocale } from "@/lib/i18n/config";
import {
  ShieldAlert,
  Globe,
  Server,
  Database,
  Users,
  Lightbulb,
  CheckCircle2,
  Sparkles,
  Share2,
  Info,
Flame,
ShieldCheck,
Layers,
Network,
} from "lucide-react";

export interface NetworkGuardianChallengeProps {
  locale: AppLocale;
  shareUrl: string;
  isAuthenticated: boolean;
}

type Screen = "briefing" | "workstation" | "consequence" | "complete";

interface EdgeDef {
  id: string;
  from: NodeId;
  to: NodeId;
  blockedBy: ControlId;
}

/**
 * Mirrors the private TOPOLOGY_EDGES list inside
 * lib/challenges/network-guardian.ts exactly, so the diagram this
 * component draws always shows the same connections the scoring
 * engine's simulateAttack() actually traverses. Kept as a local,
 * presentation-only copy (positions + labels are UI concerns) rather
 * than exporting the private array from the data-model file, so the
 * scoring module never has to know anything about SVG coordinates.
 */
const EDGES: EdgeDef[] = [
  { id: "internet_to_database", from: "internet", to: "database_server", blockedBy: "firewall" },
  { id: "internet_to_workstations", from: "internet", to: "workstations", blockedBy: "firewall" },
  { id: "internet_to_web", from: "internet", to: "web_server", blockedBy: "waf" },
  { id: "web_to_database", from: "web_server", to: "database_server", blockedBy: "dmz" },
  { id: "workstations_to_database", from: "workstations", to: "database_server", blockedBy: "vlan_segmentation" },
];

const NODE_POS: Record<NodeId, { x: number; y: number; w: number; h: number }> = {
  internet: { x: 220, y: 16, w: 160, h: 52 },
  web_server: { x: 24, y: 156, w: 172, h: 60 },
  workstations: { x: 404, y: 156, w: 172, h: 60 },
  database_server: { x: 220, y: 288, w: 160, h: 60 },
};

const SLOT_POS: Record<ControlId, { x: number; y: number; w: number; h: number }> = {
  firewall: { x: 254, y: 78, w: 92, h: 34 },
  waf: { x: 159, y: 100, w: 92, h: 34 },
  dmz: { x: 159, y: 236, w: 92, h: 34 },
  vlan_segmentation: { x: 349, y: 236, w: 92, h: 34 },
};

const NODE_ICON: Record<NodeId, React.ReactNode> = {
  internet: <Globe className="h-5 w-5" aria-hidden="true" />,
  web_server: <Server className="h-5 w-5" aria-hidden="true" />,
  workstations: <Users className="h-5 w-5" aria-hidden="true" />,
  database_server: <Database className="h-5 w-5" aria-hidden="true" />,
};

const NODE_ACCENT: Record<NodeId, { badgeBg: string; iconColor: string }> = {
  internet: { badgeBg: "fill-neutral-700", iconColor: "text-white" },
  web_server: { badgeBg: "fill-primary-50", iconColor: "text-primary-600" },
  workstations: { badgeBg: "fill-info-50", iconColor: "text-info-600" },
  database_server: { badgeBg: "fill-success-50", iconColor: "text-success-600" },
};

const CONTROL_ICON: Record<ControlId, React.ReactNode> = {
  firewall: <Flame className="h-4 w-4" aria-hidden="true" />,
  waf: <ShieldCheck className="h-4 w-4" aria-hidden="true" />,
  dmz: <Layers className="h-4 w-4" aria-hidden="true" />,
  vlan_segmentation: <Network className="h-4 w-4" aria-hidden="true" />,
};

const CONTROL_ACCENT: Record<ControlId, { chipBg: string; chipText: string; activeBorder: string }> = {
  firewall: { chipBg: "bg-danger-50", chipText: "text-danger-600", activeBorder: "border-danger-500" },
  waf: { chipBg: "bg-primary-50", chipText: "text-primary-600", activeBorder: "border-primary" },
  dmz: { chipBg: "bg-warning-50", chipText: "text-warning-600", activeBorder: "border-warning-500" },
  vlan_segmentation: { chipBg: "bg-info-50", chipText: "text-info-600", activeBorder: "border-info-500" },
};

const CONTROL_SLOT_FILL: Record<ControlId, string> = {
  firewall: "fill-danger-50",
  waf: "fill-primary-50",
  dmz: "fill-warning-50",
  vlan_segmentation: "fill-info-50",
};

function TopologyLegend({ locale }: { locale: AppLocale }) {
  const items: { color: string; label: { en: string; ar: string } }[] = [
    { color: "bg-neutral-700", label: { en: "Internet", ar: "الإنترنت" } },
    { color: "bg-primary-500", label: { en: "Web server", ar: "خادم الويب" } },
    { color: "bg-info-500", label: { en: "Workstations", ar: "محطات العمل" } },
    { color: "bg-success-500", label: { en: "Database", ar: "قاعدة البيانات" } },
  ];
  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-border pt-3 text-xs text-text-muted">
      {items.map((item) => (
        <span key={item.label.en} className="flex items-center gap-1.5">
          <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} aria-hidden="true" />
          {pick(item.label, locale)}
        </span>
      ))}
    </div>
  );
}

function center(id: NodeId) {
  const p = NODE_POS[id];
  return { x: p.x + p.w / 2, y: p.y + p.h / 2 };
}

const COPY = {
  caseIdLabel: { en: "SCENARIO", ar: "السيناريو" },
  beginDefense: { en: "BEGIN DEFENSE", ar: "ابدأ الدفاع" },
  missionTitle: { en: "CyberAbeer Decision Labs™ — Network Guardian™", ar: "CyberAbeer Decision Labs™ — حارس الشبكة™" },
  briefingBody: {
    en: "A red-team penetration test begins in ten minutes. Your public web server, customer database, and employee workstations all currently sit reachable from the open internet. Decide which security controls to place before the test starts — you will not get a second chance once it begins.",
    ar: "يبدأ اختبار اختراق من فريق أحمر خلال عشر دقائق. خادم الويب العام وقاعدة بيانات العملاء وأجهزة الموظفين جميعها متاحة حاليًا من الإنترنت المفتوح. قرّر أي ضوابط أمنية ستضعها قبل بدء الاختبار — لن تحصل على فرصة ثانية بعد بدئه.",
  },
  workstationTitle: { en: "Network Operations Center", ar: "مركز عمليات الشبكة" },
  topologyHeading: { en: "Network Topology", ar: "بنية الشبكة" },
  controlsHeading: { en: "Available Controls", ar: "الضوابط المتاحة" },
  controlsPlaced: { en: "Controls placed", ar: "الضوابط الموضوعة" },
  inspectHint: { en: "Tap a system to read its brief.", ar: "اضغط على أي نظام لقراءة موجزه." },
  dragHint: {
    en: "Drag each control from the list below onto its labeled position on the diagram — or tap a control, then tap its slot.",
    ar: "اسحب كل ضابط من القائمة أدناه إلى موضعه المُسمّى في المخطط — أو اضغط على الضابط ثم اضغط على موضعه.",
  },
  hint1: { en: "Hint 1", ar: "تلميح 1" },
  hint2: { en: "Hint 2", ar: "تلميح 2" },
  hintText1: {
    en: "Nothing reaches an internal system without first crossing the boundary between your network and the internet.",
    ar: "لا شيء يصل إلى نظام داخلي دون أن يعبر أولاً الحد الفاصل بين شبكتك والإنترنت.",
  },
  hintText2: {
    en: "The public web server can never be fully cut off from the internet — but what it is allowed to reach afterward is still your decision.",
    ar: "لا يمكن عزل خادم الويب العام عن الإنترنت بالكامل أبدًا — لكن ما يُسمح له بالوصول إليه لاحقًا لا يزال قرارك.",
  },
  runTest: { en: "RUN THE PENTEST", ar: "شغّل اختبار الاختراق" },
  runTestHint: { en: "Place at least one control before running the test.", ar: "ضع ضابطًا واحدًا على الأقل قبل تشغيل الاختبار." },
  continueCta: { en: "Continue", ar: "متابعة" },
  whatHappenedHeading: { en: "What Happened", ar: "ما الذي حدث" },
  whyItMatteredHeading: { en: "Why It Mattered", ar: "لماذا كان هذا مهمًا" },
  keyDecisionHeading: { en: "Key Decision", ar: "القرار الحاسم" },
  missionComplete: { en: "MISSION COMPLETE", ar: "اكتملت المهمة" },
  completeTitle: { en: "Network Guardian™", ar: "حارس الشبكة™" },
  scoreLabel: { en: "Score", ar: "النتيجة" },
  xpLabel: { en: "XP Earned", ar: "نقاط الخبرة" },
  badgeUnlocked: { en: "Badge Unlocked", ar: "تم فتح الشارة" },
  badgeName: { en: "Network Guardian", ar: "حارس الشبكة" },
  badgeDescription: {
    en: "Defended a customer database against a simulated network intrusion.",
    ar: "دافع عن قاعدة بيانات العملاء ضد اختراق شبكي محاكى.",
  },
  outcomeSecured: { en: "Database secured", ar: "تم تأمين قاعدة البيانات" },
  outcomePartial: { en: "Attack partially contained", ar: "تم احتواء الهجمة جزئيًا" },
  outcomeBreached: { en: "Full breach", ar: "اختراق كامل" },
  controlsPlacedStat: { en: "Controls Placed", ar: "الضوابط الموضوعة" },
  databaseStat: { en: "Database Outcome", ar: "نتيجة قاعدة البيانات" },
  protectedStat: { en: "Systems Protected", ar: "الأنظمة المحمية" },
  hintsUsedStat: { en: "Hints Used", ar: "التلميحات المستخدمة" },
  protected_: { en: "Protected", ar: "محمية" },
  compromised: { en: "Compromised", ar: "مخترقة" },
  skillsPracticed: { en: "Skills Practiced", ar: "المهارات المُمارَسة" },
  skillLabels: [
    { en: "Network segmentation", ar: "تقسيم الشبكة" },
    { en: "Defense in depth", ar: "الدفاع المتعدد الطبقات" },
    { en: "Perimeter security", ar: "الأمن المحيطي" },
    { en: "Risk-based prioritization", ar: "تحديد الأولويات القائم على المخاطر" },
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
  nextMissionComingSoon: { en: "SOC Night Shift — coming soon", ar: "مناوبة مركز العمليات الليلية — قريبًا" },
  backToLabs: { en: "Back to Decision Labs", ar: "العودة إلى معامل القرار" },
  restart: { en: "Defend Again", ar: "دافع مرة أخرى" },
} as const;

function nodeLabel(id: NodeId, locale: AppLocale) {
  const node = NETWORK_GUARDIAN_NODES.find((n) => n.id === id)!;
  return pick(node.label, locale);
}

/**
 * Orchestrates the full CyberAbeer Decision Labs™ Network Guardian™
 * mission: a briefing, a network-topology workstation where the
 * visitor decides which controls to place (with a live, purely local
 * preview of which direct connections each control removes), a
 * consequence screen that reveals the actual simulated attack against
 * the chosen loadout via lib/challenges/network-guardian.ts's
 * simulateAttack(), and a Mission Complete screen. Follows the exact
 * same self-contained pattern as phishing-hunter-challenge.tsx: inline
 * bilingual copy via pick(), the anon-session localStorage-first
 * persistence layer, and the generic saveAnonymousChallengeProgress /
 * claimChallengeForCurrentUser server actions keyed by
 * NETWORK_GUARDIAN_CHALLENGE_KEY.
 */
export function NetworkGuardianChallenge({ locale, shareUrl, isAuthenticated }: NetworkGuardianChallengeProps) {
  const [screen, setScreen] = React.useState<Screen>("briefing");
  const [anonId, setAnonId] = React.useState("");
  const [placedControls, setPlacedControls] = React.useState<ControlId[]>([]);
  const [hintsUsed, setHintsUsed] = React.useState(0);
  const [inspectedNode, setInspectedNode] = React.useState<NodeId | null>(null);
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
    const saved = loadChallengeProgress<NetworkGuardianSubmission & { completed?: boolean }>(NETWORK_GUARDIAN_CHALLENGE_KEY);
    if (saved && Array.isArray(saved.stepsState?.placedControls)) {
      setPlacedControls(saved.stepsState.placedControls);
      setHintsUsed(saved.stepsState.hintsUsed ?? 0);
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

  function persist(submission: NetworkGuardianSubmission, completed: boolean) {
    const nowIso = completed ? new Date().toISOString() : null;
    const progress: ChallengeLocalProgress<NetworkGuardianSubmission> = {
      currentStepIndex: submission.placedControls.length,
      stepsState: submission,
      startedAt: startedAt || new Date().toISOString(),
      completedAt: nowIso,
      claimed,
      claimedXp,
    };
    saveChallengeProgress(NETWORK_GUARDIAN_CHALLENGE_KEY, progress);
    if (completed) setCompletedAt(nowIso);

    const result = computeNetworkGuardianScore(submission);
    void saveAnonymousChallengeProgress({
      anonId,
      challengeKey: NETWORK_GUARDIAN_CHALLENGE_KEY,
      status: completed ? "completed" : "in_progress",
      currentStep: submission.placedControls.length,
      score: result.score,
      xpEarned: result.xp,
      hintsUsed: submission.hintsUsed,
      stepsState: submission,
      locale,
    });
  }

  function handleBeginDefense() {
    const now = new Date().toISOString();
    setStartedAt(now);
    setScreen("workstation");
    if (!startedAnalytics.current) {
      startedAnalytics.current = true;
      trackEvent("challenge_started", { locale, challengeKey: NETWORK_GUARDIAN_CHALLENGE_KEY });
    }
  }

  function toggleControl(id: ControlId) {
    setPlacedControls((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
    trackEvent("challenge_hotspot_inspected", { locale, challengeKey: NETWORK_GUARDIAN_CHALLENGE_KEY, hotspot: id });
  }

  function handleUseHint() {
    if (hintsUsed >= 2) return;
    const next = hintsUsed + 1;
    setHintsUsed(next);
    trackEvent("hint_used", { locale, challengeKey: NETWORK_GUARDIAN_CHALLENGE_KEY, hintLevel: next });
  }

  function handleRunTest() {
    if (placedControls.length === 0) return;
    const submission: NetworkGuardianSubmission = { placedControls, hintsUsed };
    const result = computeNetworkGuardianScore(submission);
    trackEvent("challenge_step_completed", {
      locale,
      challengeKey: NETWORK_GUARDIAN_CHALLENGE_KEY,
      score: result.score,
      outcome: result.outcome,
    });
    persist(submission, false);
    setScreen("consequence");
  }

  function handleFinishConsequence() {
    const submission: NetworkGuardianSubmission = { placedControls, hintsUsed };
    const result = computeNetworkGuardianScore(submission);
    persist(submission, true);
    trackEvent("challenge_completed", {
      locale,
      challengeKey: NETWORK_GUARDIAN_CHALLENGE_KEY,
      score: result.score,
      xp: result.xp,
      outcome: result.outcome,
    });
    setScreen("complete");
  }

  function handleClaimed(result: { xpAwarded: number; badgeAwarded: boolean }) {
    setClaimed(true);
    setClaimedXp(result.xpAwarded);
    setRegisteredResult(result);
    saveChallengeProgress(NETWORK_GUARDIAN_CHALLENGE_KEY, {
      currentStepIndex: placedControls.length,
      stepsState: { placedControls, hintsUsed },
      startedAt,
      completedAt: completedAt ?? new Date().toISOString(),
      claimed: true,
      claimedXp: result.xpAwarded,
    });
    if (result.badgeAwarded) {
      trackEvent("badge_earned", { locale, challengeKey: NETWORK_GUARDIAN_CHALLENGE_KEY });
    }
  }

  async function handleShare() {
    const result = computeNetworkGuardianScore({ placedControls, hintsUsed });
    const shareText =
      locale === "ar"
        ? `أكملت CyberAbeer Decision Labs™ حارس الشبكة — النتيجة: ${result.score}% | نقاط الخبرة: ${result.xp}`
        : `I completed CyberAbeer Decision Labs™ Network Guardian™ — Score: ${result.score}% | XP: ${result.xp}`;
    trackEvent("challenge_result_shared", { locale, challengeKey: NETWORK_GUARDIAN_CHALLENGE_KEY, score: result.score });
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
    setPlacedControls([]);
    setHintsUsed(0);
    setCompletedAt(null);
    setClaimed(false);
    setClaimedXp(undefined);
    setRegisteredResult(null);
    setScreen("briefing");
    clearChallengeProgress(NETWORK_GUARDIAN_CHALLENGE_KEY);
  }

  if (!anonId) return null;

  if (screen === "briefing") {
    return <BriefingScreen locale={locale} onBegin={handleBeginDefense} />;
  }

  if (screen === "workstation") {
    return (
      <WorkstationScreen
        locale={locale}
        placedControls={placedControls}
        hintsUsed={hintsUsed}
        inspectedNode={inspectedNode}
        onInspectNode={setInspectedNode}
        onToggleControl={toggleControl}
        onUseHint={handleUseHint}
        onRunTest={handleRunTest}
      />
    );
  }

  if (screen === "consequence") {
    const submission: NetworkGuardianSubmission = { placedControls, hintsUsed };
    return <ConsequenceScreen locale={locale} submission={submission} onContinue={handleFinishConsequence} />;
  }

  const result = computeNetworkGuardianScore({ placedControls, hintsUsed });
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
          <ShieldAlert className="h-7 w-7" aria-hidden="true" />
        </div>
        <Badge variant="primary">{pick(COPY.caseIdLabel, locale)}</Badge>
        <CardTitle className="font-display text-2xl">{pick(COPY.missionTitle, locale)}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-center">
        <div className="rounded-md bg-surface-raised p-4 text-start">
          <p className="text-sm text-text-secondary">{pick(COPY.briefingBody, locale)}</p>
        </div>
        <Button className="w-full" size="lg" onClick={onBegin}>
          {pick(COPY.beginDefense, locale)}
        </Button>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Workstation (topology + controls)
// ---------------------------------------------------------------------------

function TopologyDiagram({
  locale,
  placedControls,
  inspectedNode,
  onInspectNode,
  mode,
  compromisedNodes,
  protectedNodes,
  attackPath,
  onToggleControl,
}: {
  locale: AppLocale;
  placedControls: ControlId[];
  inspectedNode: NodeId | null;
  onInspectNode: (id: NodeId) => void;
  mode: "decide" | "result";
  compromisedNodes?: NodeId[];
  protectedNodes?: NodeId[];
  attackPath?: NodeId[] | null;
  onToggleControl?: (id: ControlId) => void;
}) {
  const [dragOverId, setDragOverId] = React.useState<ControlId | null>(null);

  const blockedEdgeIds =
    mode === "decide"
      ? EDGES.filter((e) => placedControls.includes(e.blockedBy)).map((e) => e.id)
      : EDGES.filter((e) => placedControls.includes(e.blockedBy)).map((e) => e.id);

  const attackPathEdgeIds = new Set<string>();
  if (attackPath && attackPath.length > 1) {
    for (let i = 0; i < attackPath.length - 1; i++) {
      const a = attackPath[i];
      const b = attackPath[i + 1];
      const edge = EDGES.find((e) => (e.from === a && e.to === b) || (e.from === b && e.to === a));
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
    <svg viewBox="0 0 600 360" className="h-auto w-full" style={{ direction: "ltr" }} role="img" aria-label={pick(COPY.topologyHeading, locale)}>
      <defs>
        <marker id="ng-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" className="fill-danger-500" />
        </marker>
      </defs>

      {EDGES.map((edge) => {
        const from = center(edge.from);
        const to = center(edge.to);
        const isBlocked = blockedEdgeIds.includes(edge.id);
        const isAttackPath = mode === "result" && attackPathEdgeIds.has(edge.id) && !isBlocked;
        const isDirect = edge.id === "internet_to_database";
        const path = isDirect
          ? `M${from.x},${from.y + 26} C ${from.x + 90},${from.y + 120} ${to.x + 90},${to.y - 40} ${to.x},${to.y - 30}`
          : `M${from.x},${from.y} L${to.x},${to.y}`;
        return (
          <path
            key={edge.id}
            d={path}
            fill="none"
            strokeWidth={isAttackPath ? 4 : 2.5}
            strokeLinecap="round"
            strokeDasharray={isBlocked ? "6 5" : undefined}
            className={
              isAttackPath
                ? "stroke-danger-500"
                : isBlocked
                  ? "stroke-neutral-300"
                  : mode === "result"
                    ? "stroke-neutral-300"
                    : "stroke-neutral-400"
            }
            markerEnd={isAttackPath ? "url(#ng-arrow)" : undefined}
          />
        );
      })}

      {NETWORK_GUARDIAN_NODES.map((node) => {
        const pos = NODE_POS[node.id];
        const isInspected = inspectedNode === node.id;
        const accent = NODE_ACCENT[node.id];
        return (
          <g key={node.id} className="cursor-pointer" onClick={() => onInspectNode(node.id)}>
            <rect
              x={pos.x}
              y={pos.y}
              width={pos.w}
              height={pos.h}
              rx={12}
              strokeWidth={isInspected ? 3 : 1.5}
              className={`${nodeFill(node.id)} ${nodeStroke(node.id)} transition-all`}
              style={{
                filter: isInspected
                  ? "drop-shadow(0 4px 10px rgb(0 0 0 / 0.18))"
                  : "drop-shadow(0 1px 3px rgb(0 0 0 / 0.08))",
              }}
            />
            <circle cx={pos.x + 24} cy={pos.y + pos.h / 2} r={14} className={accent.badgeBg} />
            <g transform={`translate(${pos.x + 24 - 10}, ${pos.y + pos.h / 2 - 10})`} className={accent.iconColor}>
              {NODE_ICON[node.id]}
            </g>
            <text
              x={pos.x + 46}
              y={pos.y + pos.h / 2 + 5}
              textAnchor="start"
              className={`text-[11px] font-semibold ${node.id === "internet" ? "fill-white" : "fill-text-primary"}`}
            >
              {nodeLabel(node.id, locale).slice(0, 20)}
            </text>
          </g>
        );
      })}
      {onToggleControl &&
        NETWORK_GUARDIAN_CONTROLS.map((control) => {
          const slot = SLOT_POS[control.id];
          const filled = placedControls.includes(control.id);
          const accent = CONTROL_ACCENT[control.id];
          const isDragOver = dragOverId === control.id;
          return (
            <g key={`slot-${control.id}`}>
              <rect
                x={slot.x}
                y={slot.y}
                width={slot.w}
                height={slot.h}
                rx={8}
                strokeDasharray={filled ? undefined : "4 3"}
                strokeWidth={isDragOver ? 2.5 : 1.5}
                className={
                  filled
                    ? `${CONTROL_SLOT_FILL[control.id]} stroke-transparent`
                    : isDragOver
                    ? "fill-primary-50 stroke-primary"
                    : "fill-surface stroke-border"
                }
                style={{ cursor: "pointer" }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverId(control.id);
                }}
                onDragLeave={() => setDragOverId((prev) => (prev === control.id ? null : prev))}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOverId(null);
                  const droppedId = e.dataTransfer.getData("text/plain");
                  if (droppedId === control.id && !placedControls.includes(control.id)) {
                    onToggleControl(control.id);
                  }
                }}
                onClick={() => {
                  if (filled) onToggleControl(control.id);
                }}
              />
              <text
                x={slot.x + slot.w / 2}
                y={slot.y + slot.h / 2 + 4}
                textAnchor="middle"
                className={`pointer-events-none text-[9px] font-semibold ${
                  filled ? accent.chipText : "fill-text-muted"
                }`}
              >
                {pick(control.name, locale).slice(0, 14).toUpperCase()}
              </text>
            </g>
          );
        })}
      </svg>
  );
}

function WorkstationScreen({
  locale,
  placedControls,
  hintsUsed,
  inspectedNode,
  onInspectNode,
  onToggleControl,
  onUseHint,
  onRunTest,
}: {
  locale: AppLocale;
  placedControls: ControlId[];
  hintsUsed: number;
  inspectedNode: NodeId | null;
  onInspectNode: (id: NodeId) => void;
  onToggleControl: (id: ControlId) => void;
  onUseHint: () => void;
  onRunTest: () => void;
}) {
  const dir = locale === "ar" ? "rtl" : "ltr";
  const inspected = inspectedNode ? NETWORK_GUARDIAN_NODES.find((n) => n.id === inspectedNode) : null;
  const ready = placedControls.length > 0;

  return (
    <div className="mx-auto max-w-4xl space-y-4" dir={dir} data-brand="labs">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-lg font-semibold text-text-primary">{pick(COPY.workstationTitle, locale)}</h1>
        <Badge variant="outline">
          {pick(COPY.controlsPlaced, locale)}: {placedControls.length}/{NETWORK_GUARDIAN_CONTROLS.length}
        </Badge>
      </div>

      <Card className="overflow-hidden py-0">
        <div className="flex items-center gap-2 bg-neutral-900 px-4 py-3">
          <ShieldAlert className="h-4 w-4 text-white" aria-hidden="true" />
          <p className="text-sm font-semibold uppercase tracking-wide text-white">{pick(COPY.topologyHeading, locale)}</p>
        </div>
        <CardContent className="pt-4">
          <p className="mb-3 text-xs text-text-secondary">{pick(COPY.inspectHint, locale)}</p>
          <p className="mb-3 text-xs text-text-muted">{pick(COPY.dragHint, locale)}</p>
          <TopologyDiagram
            locale={locale}
            placedControls={placedControls}
            inspectedNode={inspectedNode}
            onInspectNode={onInspectNode}
            onToggleControl={onToggleControl}
            mode="decide"
          />
          <TopologyLegend locale={locale} />
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
          {NETWORK_GUARDIAN_CONTROLS.map((control) => {
          const active = placedControls.includes(control.id);
          const accent = CONTROL_ACCENT[control.id];
          return (
            <button
              key={control.id}
              type="button"
              onClick={() => onToggleControl(control.id)}
      draggable={!active}
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", control.id);
        e.dataTransfer.effectAllowed = "move";
      }}
              className={`flex w-full items-start gap-3 rounded-md border p-3 text-start transition-colors ${
                active ? `${accent.activeBorder} bg-primary-50` : "border-border bg-surface hover:bg-surface-raised"
              }`}
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${accent.chipBg} ${accent.chipText}`}
              >
                {CONTROL_ICON[control.id]}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-text-primary">{pick(control.name, locale)}</p>
                <p className="text-xs text-text-secondary">{pick(control.description, locale)}</p>
              </div>
              <div
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                  active ? "border-primary bg-primary text-white" : "border-border"
                }`}
              >
                {active && <CheckCircle2 className="h-4 w-4" aria-hidden="true" />}
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
              <p className="rounded-md bg-surface-raised p-2 text-xs text-text-secondary">{pick(COPY.hintText1, locale)}</p>
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
              <p className="rounded-md bg-surface-raised p-2 text-xs text-text-secondary">{pick(COPY.hintText2, locale)}</p>
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
  submission,
  onContinue,
}: {
  locale: AppLocale;
  submission: NetworkGuardianSubmission;
  onContinue: () => void;
}) {
  const result = computeNetworkGuardianScore(submission);
  const copy = getNetworkConsequenceCopy(result, submission);
  const outcomeVariant: "success" | "warning" | "danger" =
    result.outcome === "secured" ? "success" : result.outcome === "partial" ? "warning" : "danger";

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
          <TopologyDiagram
            locale={locale}
            placedControls={submission.placedControls}
            inspectedNode={null}
            onInspectNode={() => {}}
            mode="result"
            compromisedNodes={result.simulation.compromisedNodes}
            protectedNodes={result.simulation.protectedNodes}
            attackPath={result.simulation.attackPath}
          />
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
              {pick(COPY.whatHappenedHeading, locale)}
            </h3>
            <p className="mt-1 text-sm text-text-secondary">{pick(copy.whatHappened, locale)}</p>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
              {pick(COPY.whyItMatteredHeading, locale)}
            </h3>
            <p className="mt-1 text-sm text-text-secondary">{pick(copy.whyItMattered, locale)}</p>
          </div>
          <div className="rounded-md bg-surface-raised p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
              {pick(COPY.keyDecisionHeading, locale)}
            </p>
            <p className="mt-1 text-sm text-text-primary">{pick(copy.keyDecision, locale)}</p>
          </div>
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
  result: ReturnType<typeof computeNetworkGuardianScore>;
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
  const outcomeLabel =
    result.outcome === "secured" ? COPY.outcomeSecured : result.outcome === "partial" ? COPY.outcomePartial : COPY.outcomeBreached;

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
              <p className="text-text-muted">{pick(COPY.controlsPlacedStat, locale)}</p>
              <p className="font-display text-lg font-bold text-text-primary">
                {result.simulation.protectedNodes.length + result.simulation.compromisedNodes.length > 0
                  ? Math.round((result.simulation.protectedNodes.length / 3) * 100) + "%"
                  : "0%"}
              </p>
            </div>
            <div className="rounded-md bg-surface-raised p-3">
              <p className="text-text-muted">{pick(COPY.databaseStat, locale)}</p>
              <p className="font-display text-lg font-bold text-text-primary">
                {result.simulation.databaseProtected ? pick(COPY.protected_, locale) : pick(COPY.compromised, locale)}
              </p>
            </div>
            <div className="rounded-md bg-surface-raised p-3">
              <p className="text-text-muted">{pick(COPY.protectedStat, locale)}</p>
              <p className="font-display text-lg font-bold text-text-primary">{result.simulation.protectedNodes.length}/3</p>
            </div>
            <div className="rounded-md bg-surface-raised p-3">
              <p className="text-text-muted">{pick(outcomeLabel, locale)}</p>
              <p className="font-display text-lg font-bold text-text-primary">{result.score}%</p>
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
