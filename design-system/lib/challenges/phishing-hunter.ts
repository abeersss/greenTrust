import type { Bilingual } from "./bilingual";

/**
 * CyberAbeer Decision Labs™ — PHISHING HUNTER™
 *
 * Full rewrite (2026-07-27) of the First Defender data model to match
 * the Batch A mission spec: a Microsoft 365 account-security phishing
 * email investigated as a real SOC case, not a "read paragraph, pick
 * A/B/C/D" quiz. An earlier local draft of this file (VendorCo invoice
 * fraud) was a snapshot of the old, never-wired-in file kept for
 * reference; it is fully replaced here. This module is pure data +
 * pure functions (no React, no server calls) so it can be unit-tested
 * standalone the same way lib/challenges/network-guardian.ts was.
 *
 * The challenge key is unchanged from the old file
 * ("first_defender_spot_the_phish"): it already matches the seeded
 * `challenges` row and CHALLENGE_KEYS/CHALLENGE_BADGE_KEYS entry (badge
 * "phishing_hunter"), so no new migration is needed for this rename.
 */
export const PHISHING_HUNTER_CHALLENGE_KEY = "first_defender_spot_the_phish" as const;
export const PHISHING_HUNTER_BADGE_KEY = "phishing_hunter" as const;

export const PHISHING_HUNTER_SKILLS = [
  "email_analysis",
  "threat_investigation",
  "social_engineering",
  "incident_response",
] as const;
export type PhishingHunterSkill = (typeof PHISHING_HUNTER_SKILLS)[number];

// ---------------------------------------------------------------------------
// Case briefing
// ---------------------------------------------------------------------------

export interface CaseBriefing {
  caseId: string;
  time: string;
  employeeQuote: Bilingual;
}

export const CASE_BRIEFING: CaseBriefing = {
  caseId: "CA-PH-001",
  time: "08:42",
  employeeQuote: {
    en: "I received this email saying my Microsoft account will be disabled. I almost clicked the link. Can you check it?",
    ar: "استلمت هذا البريد الإلكتروني يقول إن حساب Microsoft الخاص بي سيتم تعطيله. كدت أن أضغط على الرابط. هل يمكنك التحقق منه؟",
  },
};

// ---------------------------------------------------------------------------
// The email itself
// ---------------------------------------------------------------------------

export interface EmailAuthenticationResult {
  spf: "pass" | "fail" | "none";
  dkim: "pass" | "fail" | "none";
  dmarc: "pass" | "fail" | "none";
}

export interface EmailHeaders {
  returnPath: string;
  messageId: string;
  receivedChain: string[];
}

export interface CaseEmail {
  displayName: string;
  senderAddress: string;
  replyToAddress: string;
  recipientAddress: string;
  timestamp: string;
  subject: Bilingual;
  bodyParagraphs: Bilingual[];
  ctaLabel: Bilingual;
  ctaUrl: string;
  hasAttachment: boolean;
  headers: EmailHeaders;
  authentication: EmailAuthenticationResult;
  /** A fictional, safe sign-in log entry surfaced through the
   * Authentication Check tool, not a separate tool of its own — it is
   * how the learner discovers the true exposure level even though the
   * reporting employee believes they "almost" clicked. */
  signInLogEntry: Bilingual;
}

/**
 * Fictional lookalike domain, never a real brand's real domain and
 * never an actual malicious URL: "microsoft-onlineaccess.com" reads as
 * plausible at a glance (keeps "microsoft" and "online" and "access")
 * but is not microsoft.com or microsoftonline.com, which is exactly
 * the kind of subtle typosquat a junior analyst needs to learn to
 * check rather than something cartoonishly fake.
 */
export const CASE_EMAIL: CaseEmail = {
  displayName: "Microsoft 365 Security Team",
  senderAddress: "security-noreply@microsoft-onlineaccess.com",
  replyToAddress: "support@account-response-center.net",
  recipientAddress: "layla.haddad@cyberabeer-client.com",
  timestamp: "2026-07-24 08:42",
  subject: {
    en: "Action required: unusual sign-in activity on your account",
    ar: "مطلوب اتخاذ إجراء: نشاط تسجيل دخول غير معتاد على حسابك",
  },
  bodyParagraphs: [
    {
      en: "We detected unusual sign-in activity on your Microsoft 365 account. To protect your account, we have temporarily limited access.",
      ar: "رصدنا نشاط تسجيل دخول غير معتاد على حساب Microsoft 365 الخاص بك. لحماية حسابك، قمنا بتقييد الوصول مؤقتًا.",
    },
    {
      en: "You must verify your identity within 24 hours or your account will be permanently disabled.",
      ar: "يجب عليك التحقق من هويتك خلال 24 ساعة وإلا سيتم تعطيل حسابك بشكل دائم.",
    },
  ],
  ctaLabel: {
    en: "Verify My Account",
    ar: "تحقق من حسابي",
  },
  ctaUrl: "https://microsoft-onlineaccess.com/verify?session=8841",
  hasAttachment: false,
  headers: {
    returnPath: "bounce@mail-relay-service9.net",
    messageId: "<a12f9e-002@mail-relay-service9.net>",
    receivedChain: [
      "from mail-relay-service9.net (198.51.100.42)",
      "by edge-mx.cyberabeer-client.com",
      "for layla.haddad@cyberabeer-client.com",
    ],
  },
  authentication: {
    spf: "fail",
    dkim: "fail",
    dmarc: "fail",
  },
  signInLogEntry: {
    en: "08:47 — Sign-in to layla.haddad@cyberabeer-client.com from an unfamiliar location (203.0.113.77), device not previously seen. MFA prompt approved 08:49.",
    ar: "08:47 — تسجيل دخول إلى layla.haddad@cyberabeer-client.com من موقع غير مألوف (203.0.113.77)، وجهاز لم يُسجَّل من قبل. تمت الموافقة على طلب MFA في 08:49.",
  },
};

// ---------------------------------------------------------------------------
// Evidence
// ---------------------------------------------------------------------------

export type EvidenceTool = "sender" | "url" | "headers" | "auth" | "attachment" | "body";
export type EvidenceSignal = "suspicious" | "neutral";

export interface EvidenceItem {
  id: string;
  tool: EvidenceTool;
  signal: EvidenceSignal;
  label: Bilingual;
  detail: Bilingual;
  xp: number;
}

/**
 * 11 items: 7 suspicious, 4 neutral/legitimate-looking. The neutral
 * ones exist specifically so the learner cannot pass by clicking every
 * red flag with no discrimination — per spec, "include at least two
 * neutral or legitimate-looking observations so the learner cannot
 * simply click everything suspicious."
 */
export const EVIDENCE_ITEMS: EvidenceItem[] = [
  {
    id: "sender_domain_mismatch",
    tool: "sender",
    signal: "suspicious",
    label: { en: "Sender domain is not a real Microsoft domain", ar: "نطاق المُرسل ليس نطاق Microsoft حقيقيًا" },
    detail: {
      en: "microsoft-onlineaccess.com is not microsoft.com or microsoftonline.com. This is a lookalike domain.",
      ar: "microsoft-onlineaccess.com ليس microsoft.com ولا microsoftonline.com. هذا نطاق مُقلِّد.",
    },
    xp: 40,
  },
  {
    id: "display_name_lookalike",
    tool: "sender",
    signal: "neutral",
    label: { en: "Display name looks like a real Microsoft team", ar: "اسم العرض يشبه فريق Microsoft حقيقيًا" },
    detail: {
      en: "\"Microsoft 365 Security Team\" reads as legitimate on its own. Display names are not proof of identity; only the address is.",
      ar: "\"Microsoft 365 Security Team\" يبدو شرعيًا بحد ذاته. أسماء العرض ليست دليلًا على الهوية؛ العنوان فقط هو الدليل.",
    },
    xp: 10,
  },
  {
    id: "recipient_correct",
    tool: "sender",
    signal: "neutral",
    label: { en: "Recipient address is correct and not spoofed", ar: "عنوان المستلم صحيح وغير منتحل" },
    detail: {
      en: "The message was sent directly to the employee's real, correctly spelled work address — nothing unusual here.",
      ar: "أُرسلت الرسالة مباشرة إلى عنوان العمل الحقيقي والمكتوب بشكل صحيح للموظف — لا شيء غير معتاد هنا.",
    },
    xp: 10,
  },
  {
    id: "reply_to_mismatch",
    tool: "sender",
    signal: "suspicious",
    label: { en: "Reply-To goes to an unrelated domain", ar: "الرد إلى (Reply-To) يذهب إلى نطاق غير ذي صلة" },
    detail: {
      en: "Replies would go to account-response-center.net, a domain with no relationship to the sending domain or Microsoft.",
      ar: "سيتم إرسال الردود إلى account-response-center.net، وهو نطاق لا علاقة له بنطاق الإرسال أو بـ Microsoft.",
    },
    xp: 40,
  },
  {
    id: "url_mismatch",
    tool: "url",
    signal: "suspicious",
    label: { en: "Link destination does not match Microsoft's sign-in domain", ar: "وجهة الرابط لا تطابق نطاق تسجيل الدخول الخاص بـ Microsoft" },
    detail: {
      en: "The button points to microsoft-onlineaccess.com/verify, not login.microsoftonline.com.",
      ar: "يشير الزر إلى microsoft-onlineaccess.com/verify، وليس login.microsoftonline.com.",
    },
    xp: 40,
  },
  {
    id: "url_https_present",
    tool: "url",
    signal: "neutral",
    label: { en: "Link uses HTTPS with a valid certificate", ar: "الرابط يستخدم HTTPS بشهادة صالحة" },
    detail: {
      en: "The page loads over a secure connection. HTTPS only proves the connection is encrypted, not that the destination is trustworthy — attackers get certificates too.",
      ar: "تُحمَّل الصفحة عبر اتصال آمن. HTTPS يثبت فقط أن الاتصال مشفّر، وليس أن الوجهة موثوقة — يحصل المهاجمون على الشهادات أيضًا.",
    },
    xp: 10,
  },
  {
    id: "header_relay_mismatch",
    tool: "headers",
    signal: "suspicious",
    label: { en: "Received-from chain shows an unrelated relay server", ar: "سلسلة \"Received-from\" تُظهر خادم ترحيل غير ذي صلة" },
    detail: {
      en: "The message was relayed through mail-relay-service9.net, not any Microsoft-owned infrastructure.",
      ar: "تم ترحيل الرسالة عبر mail-relay-service9.net، وليس عبر أي بنية تحتية مملوكة لـ Microsoft.",
    },
    xp: 30,
  },
  {
    id: "attachment_absent",
    tool: "attachment",
    signal: "neutral",
    label: { en: "No attachment is present in this message", ar: "لا يوجد مرفق في هذه الرسالة" },
    detail: {
      en: "This message carries no attachment. Not every phishing email needs one — the link alone is the payload here.",
      ar: "لا تحمل هذه الرسالة أي مرفق. ليس كل بريد تصيّد يحتاج إلى مرفق — الرابط وحده هو الحمولة هنا.",
    },
    xp: 5,
  },
  {
    id: "auth_failures",
    tool: "auth",
    signal: "suspicious",
    label: { en: "SPF, DKIM, and DMARC all fail", ar: "فشل SPF وDKIM وDMARC جميعًا" },
    detail: {
      en: "None of the three authentication checks pass for this sending domain — a strong technical signal of spoofing.",
      ar: "لا يجتاز أي من فحوصات التوثيق الثلاثة لهذا النطاق المُرسل — إشارة تقنية قوية على الانتحال.",
    },
    xp: 40,
  },
  {
    id: "suspicious_signin",
    tool: "auth",
    signal: "suspicious",
    label: { en: "Sign-in log shows a login from an unfamiliar location", ar: "سجل تسجيل الدخول يُظهر دخولًا من موقع غير مألوف" },
    detail: {
      en: "Minutes after the email was sent, the account signed in from a device and location never seen before, and an MFA prompt was approved. The employee's account may already be compromised, whatever they remember clicking.",
      ar: "بعد دقائق من إرسال البريد، سجّل الحساب الدخول من جهاز وموقع لم يُشاهدا من قبل، وتمت الموافقة على طلب MFA. قد يكون حساب الموظف مُخترقًا بالفعل، بغض النظر عمّا يتذكر أنه ضغط عليه.",
    },
    xp: 60,
  },
  {
    id: "urgency_language",
    tool: "body",
    signal: "suspicious",
    label: { en: "Urgent, threatening language pressures quick action", ar: "لغة عاجلة ومهدِّدة تضغط لاتخاذ إجراء سريع" },
    detail: {
      en: "\"Permanently disabled within 24 hours\" is designed to make the reader act before thinking — a classic social-engineering pressure tactic.",
      ar: "\"سيتم تعطيله بشكل دائم خلال 24 ساعة\" مصمَّمة لدفع القارئ للتصرف قبل التفكير — أسلوب ضغط كلاسيكي في الهندسة الاجتماعية.",
    },
    xp: 20,
  },
];

export const TOTAL_EVIDENCE_COUNT = EVIDENCE_ITEMS.length;
export const SUSPICIOUS_EVIDENCE_COUNT = EVIDENCE_ITEMS.filter((e) => e.signal === "suspicious").length;

// ---------------------------------------------------------------------------
// Verdict
// ---------------------------------------------------------------------------

export type EmailClassification = "legitimate" | "suspicious" | "phishing";
export type ExposureLevel = "not_clicked" | "link_clicked" | "credentials_entered" | "unknown";
export type ResponseAction =
  | "quarantine_email"
  | "block_sender"
  | "reset_credentials"
  | "revoke_sessions"
  | "scan_endpoint"
  | "notify_soc"
  | "search_similar"
  | "no_action";

export const RESPONSE_ACTIONS: ResponseAction[] = [
  "quarantine_email",
  "block_sender",
  "reset_credentials",
  "revoke_sessions",
  "scan_endpoint",
  "notify_soc",
  "search_similar",
  "no_action",
];

export interface VerdictSubmission {
  classification: EmailClassification;
  exposure: ExposureLevel;
  responseActions: ResponseAction[];
}

/**
 * The canonical ground truth for case CA-PH-001, used both for scoring
 * and for the closing attack-timeline reveal. The reporting employee's
 * own account ("I almost clicked") understates what actually happened
 * — the sign-in log evidence is what reveals the real exposure level,
 * which is the whole point of teaching "verify, don't just trust the
 * self-report."
 */
export const GROUND_TRUTH = {
  classification: "phishing" as EmailClassification,
  exposure: "credentials_entered" as ExposureLevel,
  criticalResponseActions: ["revoke_sessions", "reset_credentials", "notify_soc"] as ResponseAction[],
  idealResponseActions: [
    "quarantine_email",
    "block_sender",
    "reset_credentials",
    "revoke_sessions",
    "scan_endpoint",
    "notify_soc",
    "search_similar",
  ] as ResponseAction[],
};

export interface TimelineEvent {
  time: string;
  label: Bilingual;
}

export const ATTACK_TIMELINE: TimelineEvent[] = [
  { time: "08:42", label: { en: "Phishing email received", ar: "استلام بريد التصيّد" } },
  { time: "08:44", label: { en: "Link clicked", ar: "تم الضغط على الرابط" } },
  { time: "08:45", label: { en: "Credentials entered on the fake sign-in page", ar: "تم إدخال بيانات الاعتماد على صفحة تسجيل الدخول المزيفة" } },
  { time: "08:47", label: { en: "Suspicious sign-in from an unfamiliar location", ar: "تسجيل دخول مريب من موقع غير مألوف" } },
  { time: "08:49", label: { en: "MFA prompt approved", ar: "تمت الموافقة على طلب MFA" } },
  { time: "08:53", label: { en: "Malicious inbox rule created for persistence", ar: "تم إنشاء قاعدة صندوق وارد ضارة لضمان الاستمرارية" } },
];

// ---------------------------------------------------------------------------
// Hints
// ---------------------------------------------------------------------------

export interface HintLevel {
  level: 1 | 2;
  penalty: number;
  text: Bilingual;
}

export const HINTS: HintLevel[] = [
  {
    level: 1,
    penalty: 10,
    text: {
      en: "Start with the sender. Compare the sending address and the Reply-To address to Microsoft's real domains.",
      ar: "ابدأ بالمُرسل. قارن عنوان الإرسال وعنوان الرد إلى بنطاقات Microsoft الحقيقية.",
    },
  },
  {
    level: 2,
    penalty: 20,
    text: {
      en: "Open Authentication Check. SPF, DKIM, and DMARC results — and the account's recent sign-in activity — tell you more than the employee's memory does.",
      ar: "افتح فحص التوثيق. نتائج SPF وDKIM وDMARC — ونشاط تسجيل الدخول الأخير للحساب — تخبرك أكثر مما تتذكره ذاكرة الموظف.",
    },
  },
];

export const REVEAL_PENALTY = 40;

export const REVEAL_TEXT: Bilingual = {
  en: "This is a phishing email sent from a lookalike domain. Authentication fails across the board, and the sign-in log shows the employee's credentials were entered and the account was accessed by an attacker, who then created a persistent inbox rule. Full containment requires resetting credentials, revoking active sessions, and notifying the SOC — not just deleting the email.",
  ar: "هذا بريد تصيّد أُرسل من نطاق مُقلِّد. يفشل التوثيق بالكامل، ويُظهر سجل تسجيل الدخول أن بيانات اعتماد الموظف قد أُدخلت وتم الوصول إلى الحساب من قِبل مهاجم، الذي أنشأ بعدها قاعدة صندوق وارد لضمان الاستمرارية. الاحتواء الكامل يتطلب إعادة تعيين بيانات الاعتماد، وإلغاء الجلسات النشطة، وإخطار مركز العمليات الأمنية (SOC) — وليس مجرد حذف البريد.",
};

// ---------------------------------------------------------------------------
// Investigation state + pure state-transition helpers
// ---------------------------------------------------------------------------

export interface PhishingHunterStepsState {
  investigatedEvidenceIds: string[];
  toolOpens: Partial<Record<EvidenceTool, number>>;
  hintsUsed: 0 | 1 | 2;
  revealed: boolean;
  verdict: VerdictSubmission | null;
}

export function createInitialState(): PhishingHunterStepsState {
  return {
    investigatedEvidenceIds: [],
    toolOpens: {},
    hintsUsed: 0,
    revealed: false,
    verdict: null,
  };
}

/** Opening a tool always increments its open-count (used for the
 * "unnecessary actions" efficiency penalty), and returns any evidence
 * items tied to that tool not yet discovered so the caller can animate
 * them into the Evidence Board one at a time. */
export function openTool(
  state: PhishingHunterStepsState,
  tool: EvidenceTool
): { nextState: PhishingHunterStepsState; newlyDiscovered: EvidenceItem[] } {
  const newlyDiscovered = EVIDENCE_ITEMS.filter(
    (e) => e.tool === tool && !state.investigatedEvidenceIds.includes(e.id)
  );
  const nextState: PhishingHunterStepsState = {
    ...state,
    investigatedEvidenceIds: [...state.investigatedEvidenceIds, ...newlyDiscovered.map((e) => e.id)],
    toolOpens: { ...state.toolOpens, [tool]: (state.toolOpens[tool] ?? 0) + 1 },
  };
  return { nextState, newlyDiscovered };
}

export function useHint(state: PhishingHunterStepsState): PhishingHunterStepsState {
  if (state.hintsUsed >= 2) return state;
  return { ...state, hintsUsed: (state.hintsUsed + 1) as 0 | 1 | 2 };
}

export function revealAnswer(state: PhishingHunterStepsState): PhishingHunterStepsState {
  return {
    ...state,
    revealed: true,
    investigatedEvidenceIds: EVIDENCE_ITEMS.map((e) => e.id),
  };
}

export function submitVerdict(state: PhishingHunterStepsState, verdict: VerdictSubmission): PhishingHunterStepsState {
  return { ...state, verdict };
}

export function canSubmitVerdict(state: PhishingHunterStepsState): boolean {
  // At least half the evidence (rounding up) must be investigated
  // before a verdict can be submitted, so the learner has actually
  // built a case rather than guessing immediately.
  return state.investigatedEvidenceIds.length >= Math.ceil(TOTAL_EVIDENCE_COUNT / 2);
}

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function computeInvestigationScore(state: PhishingHunterStepsState): number {
  return Math.round((state.investigatedEvidenceIds.length / TOTAL_EVIDENCE_COUNT) * 100);
}

export function computeThreatAnalysisScore(verdict: VerdictSubmission | null): number {
  if (!verdict) return 0;
  let score = 0;
  if (verdict.classification === "phishing") score += 60;
  else if (verdict.classification === "suspicious") score += 30;

  if (verdict.exposure === "credentials_entered") score += 40;
  else if (verdict.exposure === "link_clicked") score += 20;
  return score;
}

export function computeResponseScore(verdict: VerdictSubmission | null): number {
  if (!verdict || verdict.responseActions.length === 0) return 0;
  if (verdict.responseActions.includes("no_action")) {
    // Selecting "no action" on a live compromise is always wrong,
    // regardless of what else is selected alongside it.
    return verdict.responseActions.length === 1 ? 0 : 10;
  }
  const ideal = new Set(GROUND_TRUTH.idealResponseActions);
  const selected = new Set(verdict.responseActions);
  const correct = [...selected].filter((a) => ideal.has(a)).length;
  const precision = correct / selected.size;
  const recall = correct / ideal.size;
  if (precision + recall === 0) return 0;
  const f1 = (2 * precision * recall) / (precision + recall);
  return Math.round(f1 * 100);
}

export function computeEfficiencyScore(state: PhishingHunterStepsState): number {
  if (state.revealed) return 0;
  let score = 100;
  if (state.hintsUsed >= 1) score -= HINTS[0]!.penalty;
  if (state.hintsUsed >= 2) score -= HINTS[1]!.penalty;

  // Redundant clicks: a tool opened more times than it has evidence
  // items (or more than once, for tools with only one item) suggests
  // undirected clicking rather than a deliberate investigation.
  let redundantOpens = 0;
  for (const tool of Object.keys(state.toolOpens) as EvidenceTool[]) {
    const opensForTool = state.toolOpens[tool] ?? 0;
    const evidenceForTool = EVIDENCE_ITEMS.filter((e) => e.tool === tool).length;
    redundantOpens += Math.max(0, opensForTool - Math.max(1, evidenceForTool));
  }
  score -= clamp(redundantOpens * 5, 0, 20);
  return clamp(score, 0, 100);
}

export type PhishingHunterOutcome = "contained" | "partial" | "breach";

export interface PhishingHunterScoreResult {
  investigationScore: number;
  threatAnalysisScore: number;
  responseScore: number;
  efficiencyScore: number;
  score: number;
  xp: number;
  evidenceDiscovered: number;
  totalEvidence: number;
  outcome: PhishingHunterOutcome;
}

export function computePhishingHunterScore(state: PhishingHunterStepsState): PhishingHunterScoreResult {
  const investigationScore = computeInvestigationScore(state);
  const threatAnalysisScore = computeThreatAnalysisScore(state.verdict);
  const responseScore = computeResponseScore(state.verdict);
  const efficiencyScore = computeEfficiencyScore(state);

  const score = clamp(
    Math.round(
      investigationScore * 0.35 + threatAnalysisScore * 0.25 + responseScore * 0.3 + efficiencyScore * 0.1
    ),
    0,
    100
  );
  const xp = clamp(Math.round(score * 5), 0, 500);

  const outcome = computeOutcome(state.verdict);

  return {
    investigationScore,
    threatAnalysisScore,
    responseScore,
    efficiencyScore,
    score,
    xp,
    evidenceDiscovered: state.investigatedEvidenceIds.length,
    totalEvidence: TOTAL_EVIDENCE_COUNT,
    outcome,
  };
}

function computeOutcome(verdict: VerdictSubmission | null): PhishingHunterOutcome {
  if (!verdict) return "breach";

  const identifiedThreat = verdict.classification === "phishing";
  const identifiedExposure = verdict.exposure === "credentials_entered";
  const hasAllCritical = GROUND_TRUTH.criticalResponseActions.every((a) => verdict.responseActions.includes(a));

  if (!identifiedThreat || verdict.exposure === "not_clicked") {
    return "breach";
  }
  if (identifiedThreat && identifiedExposure && hasAllCritical) {
    return "contained";
  }
  return "partial";
}

// ---------------------------------------------------------------------------
// Consequence copy
// ---------------------------------------------------------------------------

export interface ConsequenceCopy {
  outcome: PhishingHunterOutcome;
  headline: Bilingual;
  body: Bilingual;
  keyDecision: Bilingual;
}

export function getPhishingHunterConsequenceCopy(
  result: PhishingHunterScoreResult,
  state: PhishingHunterStepsState
): ConsequenceCopy {
  const verdict = state.verdict;

  if (result.outcome === "contained") {
    return {
      outcome: "contained",
      headline: { en: "THREAT CONTAINED", ar: "تم احتواء التهديد" },
      body: {
        en: `The phishing campaign was identified before it could cause further damage. Your investigation found ${result.evidenceDiscovered}/${result.totalEvidence} pieces of evidence, correctly identified the account as compromised, and your response revoked the attacker's session before real harm was done.`,
        ar: `تم تحديد حملة التصيّد قبل أن تتسبب في مزيد من الضرر. اكتشف تحقيقك ${result.evidenceDiscovered}/${result.totalEvidence} من الأدلة، وحدد بشكل صحيح أن الحساب مُخترق، وأدت استجابتك إلى إلغاء جلسة المهاجم قبل وقوع ضرر حقيقي.`,
      },
      keyDecision: {
        en: "Revoking active sessions and resetting credentials together is what actually locks an attacker out after credentials are entered — quarantining the email alone would not have been enough.",
        ar: "إلغاء الجلسات النشطة وإعادة تعيين بيانات الاعتماد معًا هو ما يُقصي المهاجم فعليًا بعد إدخال بيانات الاعتماد — عزل البريد وحده لم يكن كافيًا.",
      },
    };
  }

  if (result.outcome === "partial") {
    const missingCritical = GROUND_TRUTH.criticalResponseActions.filter(
      (a) => !(verdict?.responseActions.includes(a) ?? false)
    );
    return {
      outcome: "partial",
      headline: { en: "ACCOUNT COMPROMISE", ar: "اختراق الحساب" },
      body: {
        en: "You correctly identified the email as suspicious or phishing, but the response did not fully contain it. The attacker retained an active session and was able to continue using the compromised account.",
        ar: "لقد حددت البريد بشكل صحيح كمشبوه أو تصيّد، لكن الاستجابة لم تحتوِه بالكامل. احتفظ المهاجم بجلسة نشطة واستطاع مواصلة استخدام الحساب المُخترق.",
      },
      keyDecision: {
        en: missingCritical.includes("revoke_sessions")
          ? "Without revoking active sessions, resetting the password alone does not log the attacker out of a session that is already open."
          : "Once credentials are entered, containment needs more than deleting the email — the account itself has to be secured.",
        ar: missingCritical.includes("revoke_sessions")
          ? "بدون إلغاء الجلسات النشطة، لا تؤدي إعادة تعيين كلمة المرور وحدها إلى إخراج المهاجم من جلسة مفتوحة بالفعل."
          : "بمجرد إدخال بيانات الاعتماد، يتطلب الاحتواء أكثر من حذف البريد — يجب تأمين الحساب نفسه.",
      },
    };
  }

  return {
    outcome: "breach",
    headline: { en: "BREACH UNDETECTED", ar: "اختراق لم يُكتشف" },
    body: {
      en: "The investigation missed the true severity of this incident. The account was actually compromised — credentials were entered, the attacker signed in, and a persistent inbox rule was created — but the response did not reflect that, leaving the attacker's access in place.",
      ar: "فوّت التحقيق الخطورة الحقيقية لهذا الحادث. تم اختراق الحساب فعليًا — أُدخلت بيانات الاعتماد، وسجّل المهاجم الدخول، وأُنشئت قاعدة صندوق وارد دائمة — لكن الاستجابة لم تعكس ذلك، مما أبقى وصول المهاجم قائمًا.",
    },
    keyDecision: {
      en: "The employee's own account of \"I almost clicked\" was incomplete. The sign-in log — not the self-report — was the evidence that revealed what actually happened.",
      ar: "رواية الموظف نفسه \"كدت أن أضغط\" كانت غير مكتملة. سجل تسجيل الدخول — وليس الرواية الذاتية — هو الدليل الذي كشف ما حدث فعليًا.",
    },
  };
}

// ---------------------------------------------------------------------------
// "Why this matters" closing copy
// ---------------------------------------------------------------------------

export const WHY_THIS_MATTERS: Bilingual = {
  en: "One phishing email is rarely just one phishing email. A single set of entered credentials can become session hijacking, a persistent inbox rule that exfiltrates future mail, and a foothold for lateral movement across the organization. Investigating quickly and responding completely — not just deleting the message — is what turns a phishing report into a contained incident instead of a breach.",
  ar: "نادرًا ما يكون بريد التصيّد الواحد مجرد بريد تصيّد واحد. مجموعة واحدة من بيانات الاعتماد المُدخَلة يمكن أن تتحول إلى اختطاف جلسة، وقاعدة صندوق وارد دائمة تُسرّب البريد المستقبلي، وموطئ قدم للتحرك الجانبي عبر المؤسسة. التحقيق السريع والاستجابة الكاملة — وليس مجرد حذف الرسالة — هو ما يحوّل بلاغًا عن تصيّد إلى حادثة مُحتواة بدلًا من اختراق.",
};
