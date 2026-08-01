import type { Bilingual } from "./bilingual";

export const GRCL_CHALLENGE_KEY = "grcl_innovation_under_fire" as const;
export const GRCL_MAX_SCORE = 100;

/**
 * The review clock: the board has enough time to fully investigate
 * some, but not all, of the clues across the case docket. Exactly
 * like Data Guardian's AUDIT_BUDGET, this is a UI constraint only
 * (see grcl-innovation-challenge.tsx), not a scoring input -- the
 * score is entirely about whether the final board decisions were
 * right, whether they were reached with full evidence or a guess
 * based on how exciting or how bureaucratic-sounding the pitch was.
 */
export const REVIEW_BUDGET = 7;

export type CaseId =
  | "ai_chatbot_escalation"
  | "vendor_data_partnership"
  | "hotfix_change_bypass"
  | "country_launch_residency"
  | "ai_vendor_provenance";

/**
 * Four board decisions on a spectrum from "let it proceed as pitched"
 * to "stop it here." GroundTruth (below) only ever names three of
 * them as the ideal call -- "send_back" is a legitimate hedge under
 * genuine uncertainty, the GRCL equivalent of Data Guardian's
 * "monitor_access," and is scored as partial credit rather than as
 * an ideal outcome in its own right.
 */
export type Decision = "approve" | "approve_with_conditions" | "send_back" | "reject";
export type GroundTruth = "approve" | "approve_with_conditions" | "reject";

/**
 * How risky or how routine the pitch looks on its face, before any
 * investigation -- purely a surface impression for the board-decision
 * UI, deliberately uncorrelated with groundTruth. A pitch framed by
 * its sponsor as low-risk can hide a real governance bypass, and a
 * pitch that sounds reckless can turn out to already have the right
 * sign-offs and safeguards in place. That mismatch is the entire
 * point of the "layered" GRCL lens: the label on a decision is not
 * the decision.
 */
export type ApparentRisk = "low" | "medium" | "high";

export interface CaseClue {
  id: string;
  action: Bilingual;
  reveal: Bilingual;
}

export interface BoardCase {
  id: CaseId;
  pitchTeam: Bilingual;
  title: Bilingual;
  summary: Bilingual;
  apparentRisk: ApparentRisk;
  groundTruth: GroundTruth;
  clues: [CaseClue, CaseClue];
}

export const BOARD_CASES: BoardCase[] = [
  {
    id: "ai_chatbot_escalation",
    pitchTeam: {
      en: "Product & Customer Experience — AI Support Initiative",
      ar: "المنتج وتجربة العملاء — مبادرة الدعم بالذكاء الاصطناعي",
    },
    title: {
      en: "Customer-facing AI chatbot requesting fast-track launch",
      ar: "طلب إطلاق سريع لروبوت محادثة بالذكاء الاصطناعي موجّه للعملاء",
    },
    summary: {
      en: "The CX team wants to launch a generative-AI chatbot as the first line of customer support next week, ahead of the standard AI review cycle, arguing competitors already have one live.",
      ar: "يريد فريق تجربة العملاء إطلاق روبوت محادثة يعمل بالذكاء الاصطناعي التوليدي كخط الدعم الأول للعملاء الأسبوع المقبل، متجاوزًا دورة مراجعة الذكاء الاصطناعي المعتادة، بحجة أن المنافسين أطلقوا روبوتات مشابهة بالفعل.",
    },
    apparentRisk: "high",
    groundTruth: "approve_with_conditions",
    clues: [
      {
        id: "ai_chatbot_escalation_path",
        action: { en: "Check the human-escalation runbook", ar: "تحقق من دليل التصعيد إلى موظف بشري" },
        reveal: {
          en: "GOVERNANCE — An escalation path already exists: the bot hands off to a live agent after two failed resolution attempts or on request, using the same queue as the current live-chat tool. This was signed off by the support-ops director six weeks ago.",
          ar: "الحوكمة — يوجد بالفعل مسار تصعيد: يُحوّل الروبوت المحادثة إلى موظف بشري بعد محاولتين فاشلتين لحل المشكلة أو عند طلب العميل ذلك، باستخدام قائمة الانتظار نفسها المعتمدة في أداة الدردشة الحية الحالية، وقد اعتمد هذا المسار مدير عمليات الدعم قبل ستة أسابيع.",
        },
      },
      {
        id: "ai_chatbot_scripted_language",
        action: { en: "Sample transcripts of the chatbot's draft responses", ar: "افحص عيّنة من نصوص محادثات الروبوت التجريبية" },
        reveal: {
          en: "COMPLIANCE — In several sampled transcripts, the bot tells customers which specific insurance add-on or credit plan to choose, phrased as a recommendation, without the disclosure language the financial-products policy requires whenever a recommendation of that kind is made.",
          ar: "الامتثال — في عدة نصوص من العيّنة، ينصح الروبوت العملاء بشكل مباشر باختيار إضافة تأمينية أو خطة ائتمان معينة، بصيغة توصية، دون عبارات الإفصاح التي تفرضها سياسة المنتجات المالية عند تقديم أي توصية من هذا النوع.",
        },
      },
    ],
  },
  {
    id: "vendor_data_partnership",
    pitchTeam: {
      en: "Growth — Marketing Data Partnership",
      ar: "النمو — شراكة بيانات تسويقية",
    },
    title: {
      en: "Fast-tracked data-sharing deal with a marketing analytics vendor",
      ar: "صفقة مشاركة بيانات معجّلة مع مزوّد تحليلات تسويقية",
    },
    summary: {
      en: "Growth wants to share customer contact and purchase-history data with a marketing analytics vendor this quarter to power a lookalike-audience campaign, and is asking the board to waive the standard privacy review since the vendor is 'just doing analytics.'",
      ar: "يريد فريق النمو مشاركة بيانات التواصل وسجل الشراء الخاصة بالعملاء مع مزوّد تحليلات تسويقية هذا الربع لتشغيل حملة جمهور مشابه، ويطلب من المجلس التنازل عن مراجعة الخصوصية المعتادة بحجة أن المزوّد 'يقوم بالتحليل فقط.'",
    },
    apparentRisk: "low",
    groundTruth: "reject",
    clues: [
      {
        id: "vendor_data_partnership_dpa",
        action: { en: "Read the vendor's data processing terms", ar: "اطّلع على شروط معالجة البيانات لدى المزوّد" },
        reveal: {
          en: "COMPLIANCE — The vendor's terms permit it to combine our customer data with data from other clients to build shared advertising profiles, and the data is processed in a country with no data-transfer adequacy agreement in place with ours.",
          ar: "الامتثال — تسمح شروط المزوّد بدمج بيانات عملائنا مع بيانات عملاء آخرين لبناء ملفات إعلانية مشتركة، وتتم معالجة البيانات في دولة لا توجد معها اتفاقية كفاية لنقل البيانات مع دولتنا.",
        },
      },
      {
        id: "vendor_data_partnership_signoff",
        action: { en: "Check who approved the data-sharing exception", ar: "تحقق من الجهة التي وافقت على استثناء مشاركة البيانات" },
        reveal: {
          en: "GOVERNANCE — The growth VP approved the exception directly to hit this quarter's campaign date. Company policy requires the Chief Privacy Officer to sign off on any third-party sharing of customer PII, and that sign-off was never requested.",
          ar: "الحوكمة — وافق نائب رئيس النمو على هذا الاستثناء مباشرة لإدراك موعد حملة هذا الربع. تشترط سياسة الشركة حصول موافقة كبير مسؤولي الخصوصية على أي مشاركة لبيانات تعريف العملاء الشخصية مع طرف ثالث، ولم يُطلب هذا الاعتماد إطلاقًا.",
        },
      },
    ],
  },
  {
    id: "hotfix_change_bypass",
    pitchTeam: {
      en: "Engineering — Production Reliability",
      ar: "الهندسة — موثوقية الإنتاج",
    },
    title: {
      en: "Making the 'temporary' emergency hotfix bypass permanent",
      ar: "تحويل مسار الإصلاح الطارئ 'المؤقت' إلى مسار دائم",
    },
    summary: {
      en: "Engineering wants the board to formally bless a fast-path that lets an on-call engineer push a production hotfix without the usual two-reviewer change-management approval, arguing it has already been in informal use during incidents.",
      ar: "تطلب الهندسة من المجلس اعتماد مسار سريع يتيح لمهندس المناوبة نشر إصلاح طارئ في بيئة الإنتاج دون الحصول على موافقة مراجعَيْن كما تتطلب عملية إدارة التغيير المعتادة، بحجة أن هذا المسار مستخدم فعليًا بشكل غير رسمي أثناء الحوادث.",
    },
    apparentRisk: "low",
    groundTruth: "approve_with_conditions",
    clues: [
      {
        id: "hotfix_bypass_history",
        action: { en: "Check how long the informal bypass has been in use", ar: "تحقق منذ متى يُستخدم هذا المسار غير الرسمي" },
        reveal: {
          en: "GOVERNANCE — The bypass has quietly been in use for 14 months, originally approved verbally by one engineering manager for a single incident, with no expiration, no usage log, and no CISO sign-off despite policy requiring it for any change-management exception.",
          ar: "الحوكمة — كان هذا المسار غير الرسمي مستخدمًا بهدوء منذ 14 شهرًا، وقد وافق عليه شفهيًا مدير هندسة واحد لحادثة واحدة فقط، دون تاريخ انتهاء أو سجل استخدام أو اعتماد من كبير مسؤولي أمن المعلومات رغم أن السياسة تفرض ذلك على أي استثناء من إدارة التغيير.",
        },
      },
      {
        id: "hotfix_bypass_sample",
        action: { en: "Sample recent changes pushed through the bypass", ar: "افحص عيّنة من التغييرات الأخيرة التي مرّت عبر هذا المسار" },
        reveal: {
          en: "RISK — Of the last 12 changes pushed through this path, one disabled multi-factor authentication on an internal admin tool 'temporarily' during an incident and was never re-enabled for three weeks until a routine audit caught it.",
          ar: "المخاطر — من أصل آخر 12 تغييرًا مرّت عبر هذا المسار، عطّل أحدها المصادقة الثنائية على أداة إدارية داخلية 'بشكل مؤقت' أثناء أحد الحوادث، ولم تتم إعادة تفعيلها لمدة ثلاثة أسابيع إلى أن رصدها تدقيق روتيني.",
        },
      },
    ],
  },
  {
    id: "country_launch_residency",
    pitchTeam: {
      en: "International Expansion — New Market Launch",
      ar: "التوسع الدولي — إطلاق سوق جديد",
    },
    title: {
      en: "Launching in a new market ahead of the formal data-residency checklist",
      ar: "الإطلاق في سوق جديد قبل إتمام قائمة التحقق الرسمية للإقامة الجغرافية للبيانات",
    },
    summary: {
      en: "The international expansion team wants to launch in a new country next month without having completed the standard data-residency review checklist, which normally takes ten weeks, arguing the market window will close.",
      ar: "يريد فريق التوسع الدولي الإطلاق في دولة جديدة الشهر المقبل دون إتمام قائمة التحقق الرسمية لمراجعة الإقامة الجغرافية للبيانات، التي تستغرق عادة عشرة أسابيع، بحجة أن نافذة السوق ستُغلق.",
    },
    apparentRisk: "high",
    groundTruth: "approve",
    clues: [
      {
        id: "country_launch_scoping_memo",
        action: { en: "Ask regional counsel whether the residency law even applies here", ar: "اسأل المستشار القانوني الإقليمي عمّا إذا كان قانون الإقامة الجغرافية ينطبق أصلًا هنا" },
        reveal: {
          en: "COMPLIANCE — Regional counsel already produced a scoping memo confirming the country's data-residency law applies only to health and financial-services data. This product processes neither category, so the full checklist is not actually required for this launch.",
          ar: "الامتثال — أعدّ المستشار القانوني الإقليمي بالفعل مذكرة نطاق تؤكد أن قانون الإقامة الجغرافية للبيانات في هذه الدولة ينطبق فقط على بيانات الرعاية الصحية والخدمات المالية. هذا المنتج لا يعالج أيًا من هاتين الفئتين، وبالتالي فإن القائمة الكاملة غير مطلوبة فعليًا لهذا الإطلاق.",
        },
      },
      {
        id: "country_launch_regional_signoff",
        action: { en: "Check whether the regional compliance lead has actually reviewed this", ar: "تحقق مما إذا كان مسؤول الامتثال الإقليمي قد راجع هذا الأمر فعليًا" },
        reveal: {
          en: "GOVERNANCE — The regional compliance lead reviewed the scoping memo, agreed with its conclusion in writing, and recommended proceeding with a lightweight monitoring note instead of the full checklist -- exactly the authority this decision needed.",
          ar: "الحوكمة — راجع مسؤول الامتثال الإقليمي مذكرة النطاق، ووافق على استنتاجها كتابيًا، وأوصى بالمضي قدمًا مع مذكرة مراقبة مبسطة بدلًا من القائمة الكاملة -- وهذا هو بالضبط صاحب الصلاحية الذي يحتاجه هذا القرار.",
        },
      },
    ],
  },
  {
    id: "ai_vendor_provenance",
    pitchTeam: {
      en: "Executive Sponsor — New AI Vendor Partnership",
      ar: "الراعي التنفيذي — شراكة مزوّد ذكاء اصطناعي جديد",
    },
    title: {
      en: "An SVP wants to fast-track a new AI vendor into production",
      ar: "نائب رئيس أول يريد تسريع اعتماد مزوّد ذكاء اصطناعي جديد في بيئة الإنتاج",
    },
    summary: {
      en: "An SVP personally championing a new generative-AI vendor wants the board to approve integrating its model into a core product feature this month, describing the standard vendor risk assessment as 'a formality we can complete after launch.'",
      ar: "يريد نائب رئيس أول يتبنى شخصيًا مزوّد ذكاء اصطناعي توليدي جديد من المجلس الموافقة على دمج نموذجه في ميزة أساسية بالمنتج هذا الشهر، ويصف تقييم مخاطر المزوّدين المعتاد بأنه 'إجراء شكلي يمكن إتمامه بعد الإطلاق.'",
    },
    apparentRisk: "low",
    groundTruth: "reject",
    clues: [
      {
        id: "ai_vendor_provenance_warranty",
        action: { en: "Read the vendor contract's data-provenance warranty", ar: "اطّلع على ضمان مصدر البيانات في عقد المزوّد" },
        reveal: {
          en: "COMPLIANCE — The vendor's contract contains only a generic warranty that training data was 'lawfully obtained,' with no indemnification clause covering intellectual-property claims, and no disclosure of which datasets were actually used.",
          ar: "الامتثال — يتضمن عقد المزوّد ضمانًا عامًا فقط بأن بيانات التدريب 'تم الحصول عليها بشكل قانوني'، دون أي بند تعويض يغطي مطالبات الملكية الفكرية، ودون الإفصاح عن مجموعات البيانات المستخدمة فعليًا.",
        },
      },
      {
        id: "ai_vendor_provenance_litigation",
        action: { en: "Search for public disclosures about the vendor's model", ar: "ابحث عن أي إفصاحات عامة بشأن نموذج المزوّد" },
        reveal: {
          en: "RISK — The vendor is currently named in two pending lawsuits alleging its model was trained on copyrighted material without a license, and it declined our request to add indemnification when asked directly last month.",
          ar: "المخاطر — المزوّد طرف حاليًا في دعويين قضائيتين معلّقتين تدّعيان أن نموذجه دُرّب على مواد محمية بحقوق نشر دون ترخيص، وقد رفض طلبنا بإضافة بند تعويض عندما طُلب منه ذلك مباشرة الشهر الماضي.",
        },
      },
    ],
  },
];

function correctDecisionFor(groundTruth: GroundTruth): Decision {
  return groundTruth;
}

/**
 * Scoring is deliberately symmetric across both failure directions.
 * Rubber-stamping a governance bypass (approving a "reject" case)
 * loses more than blocking a good-faith pitch (rejecting an "approve"
 * case) because a live governance/compliance failure is a standing
 * liability the moment it ships, while a wrongly blocked pitch can
 * still be brought back to the board -- but both are penalized, and
 * neither is scored as "safe." A board that always says no is not
 * rewarded here.
 */
function pointsFor(groundTruth: GroundTruth, decision: Decision): number {
  if (groundTruth === "approve") {
    if (decision === "approve") return 20;
    if (decision === "approve_with_conditions") return 12;
    if (decision === "send_back") return -5;
    return -8; // rejected a good-faith pitch that deserved to move forward
  }
  if (groundTruth === "approve_with_conditions") {
    if (decision === "approve_with_conditions") return 20;
    if (decision === "send_back") return 10;
    if (decision === "approve") return -8; // rubber-stamped without addressing a real gap
    return -5; // over-caution: blocked something that was fixable with conditions
  }
  // groundTruth === "reject"
  if (decision === "reject") return 20;
  if (decision === "send_back") return 12;
  if (decision === "approve_with_conditions") return -8;
  return -10; // approved a genuine governance failure outright
}

export interface GRCLSubmission {
  decisions: Partial<Record<CaseId, Decision>>;
  investigatedClueIds: string[];
}

export interface CaseOutcome {
  caseId: CaseId;
  decision: Decision;
  groundTruth: GroundTruth;
  correctDecision: Decision;
  wasCorrect: boolean;
  points: number;
  fullyInvestigated: boolean;
}

export interface GRCLResult {
  score: number;
  xp: number;
  caseOutcomes: CaseOutcome[];
  governanceFailureCount: number;
  overCautionCount: number;
  outcome: "sound_governance" | "mixed_judgment" | "governance_failure";
}

export function computeGRCLScore(submission: GRCLSubmission): GRCLResult {
  let rawPoints = 0;
  let governanceFailureCount = 0;
  let overCautionCount = 0;

  const caseOutcomes: CaseOutcome[] = BOARD_CASES.map((boardCase) => {
    const decision = submission.decisions[boardCase.id] ?? "send_back";
    const correctDecision = correctDecisionFor(boardCase.groundTruth);
    const points = pointsFor(boardCase.groundTruth, decision);
    const wasCorrect = decision === correctDecision;
    const fullyInvestigated = boardCase.clues.every((c) => submission.investigatedClueIds.includes(c.id));

    rawPoints += points;
    if (boardCase.groundTruth === "reject" && (decision === "approve" || decision === "approve_with_conditions")) {
      governanceFailureCount += 1;
    }
    if (boardCase.groundTruth === "approve" && (decision === "reject" || decision === "send_back")) {
      overCautionCount += 1;
    }

    return { caseId: boardCase.id, decision, groundTruth: boardCase.groundTruth, correctDecision, wasCorrect, points, fullyInvestigated };
  });

  const score = Math.min(GRCL_MAX_SCORE, Math.max(0, Math.round(rawPoints)));
  const xp = Math.round(score * 1.5);

  const outcome: "sound_governance" | "mixed_judgment" | "governance_failure" =
    governanceFailureCount > 0
      ? "governance_failure"
      : caseOutcomes.every((c) => c.wasCorrect)
      ? "sound_governance"
      : "mixed_judgment";

  return { score, xp, caseOutcomes, governanceFailureCount, overCautionCount, outcome };
}

export interface GRCLConsequenceCopy {
  outcomeLabel: Bilingual;
  headline: Bilingual;
  whatHappened: Bilingual;
  whyItMattered: Bilingual;
  keyDecision: Bilingual;
}

export function getGRCLConsequenceCopy(result: GRCLResult): GRCLConsequenceCopy {
  if (result.outcome === "governance_failure") {
    return {
      outcomeLabel: { en: "Governance failure", ar: "إخفاق حوكمي" },
      headline: {
        en: "At least one pitch that should have been stopped was waved through instead.",
        ar: "تمت الموافقة على مبادرة واحدة على الأقل كان ينبغي إيقافها بدلًا من ذلك.",
      },
      whatHappened: {
        en: "A case carrying a real authority bypass or an unresolved compliance gap was approved, outright or with conditions that didn't actually address the gap, letting it move forward as if the board had signed off on something it never actually reviewed.",
        ar: "تمت الموافقة على قضية تنطوي على تجاوز حقيقي للصلاحيات أو ثغرة امتثال لم تُحل، سواء بشكل كامل أو بشروط لم تعالج الثغرة فعليًا، مما سمح لها بالمضي قدمًا وكأن المجلس اعتمد أمرًا لم يراجعه فعليًا قط.",
      },
      whyItMattered: {
        en: "A rubber-stamped exception doesn't stay contained to one case: it becomes the precedent the next team points to when they want to skip the same review, and a regulator or a courtroom will not accept 'the board approved it' as a substitute for the board actually having done the review.",
        ar: "الاستثناء الذي يُمنح كإجراء شكلي لا يبقى محصورًا في قضية واحدة: بل يصبح السابقة التي يستشهد بها الفريق التالي عندما يريد تجاوز المراجعة نفسها، ولن تقبل الجهة الرقابية أو المحكمة بعبارة 'وافق المجلس عليه' بديلًا عن قيام المجلس فعليًا بالمراجعة.",
      },
      keyDecision: {
        en: "Authority that is being bypassed, and compliance obligations that are only superficially satisfied, are exactly what the investigation budget exists to surface before a decision is logged, not after.",
        ar: "الصلاحية التي يتم تجاوزها، والتزامات الامتثال التي تُستوفى شكليًا فقط، هي بالضبط ما وُجدت ميزانية التحقيق للكشف عنه قبل تسجيل القرار، لا بعده.",
      },
    };
  }
  if (result.outcome === "sound_governance") {
    return {
      outcomeLabel: { en: "Sound governance judgment", ar: "حكم حوكمي سليم" },
      headline: {
        en: "Every case on the docket was decided correctly, weighing governance, risk, and compliance together.",
        ar: "تم البت في كل قضية على جدول الأعمال بالقرار الصحيح، بموازنة الحوكمة والمخاطر والامتثال معًا.",
      },
      whatHappened: {
        en: "Pitches that looked alarming were approved once the evidence showed the authority, risk, and compliance picture was actually sound, and pitches that looked routine were stopped or conditioned once the same evidence showed a real gap.",
        ar: "تمت الموافقة على المبادرات التي بدت مثيرة للقلق حال أظهرت الأدلة أن صورة الصلاحية والمخاطر والامتثال سليمة فعليًا، وتم إيقاف أو تقييد المبادرات التي بدت روتينية حال كشفت الأدلة نفسها عن ثغرة حقيقية.",
      },
      whyItMattered: {
        en: "A review board that reflexively says no to anything unfamiliar isn't practicing governance, it's practicing risk-aversion, and it trains the rest of the company to stop bringing hard calls to the board at all. Getting both directions right, protecting the company without freezing it, is the actual job.",
        ar: "مجلس المراجعة الذي يرفض تلقائيًا كل ما هو غير مألوف لا يمارس الحوكمة، بل يمارس تجنب المخاطرة، وهذا يدرّب بقية الشركة على التوقف عن عرض القرارات الصعبة على المجلس من الأساس. إتقان الاتجاهين معًا، حماية الشركة دون تجميدها، هو جوهر هذه المهمة.",
      },
      keyDecision: {
        en: "The cases worth the review budget's time were the ones where the pitch's framing, as either obviously safe or obviously reckless, didn't match what the underlying authority, risk, and compliance evidence actually showed.",
        ar: "القضايا التي استحقت وقت ميزانية المراجعة كانت تلك التي لم يتطابق فيها إطار العرض، سواء بدا آمنًا بوضوح أو متهورًا بوضوح، مع ما أظهرته أدلة الصلاحية والمخاطر والامتثال الفعلية.",
      },
    };
  }
  return {
    outcomeLabel: { en: "Mixed judgment", ar: "حكم متفاوت" },
    headline: {
      en: "The board avoided a genuine governance failure, but its judgment wasn't fully calibrated.",
      ar: "تجنّب المجلس وقوع إخفاق حوكمي حقيقي، لكن أحكامه لم تكن معايرة بالكامل.",
    },
    whatHappened:
      result.overCautionCount > 0
        ? {
            en: "No genuine governance failure made it through, but at least one pitch that actually deserved to move forward was blocked or sent back anyway.",
            ar: "لم يمرّ أي إخفاق حوكمي حقيقي، لكن مبادرة واحدة على الأقل كانت تستحق فعليًا المضي قدمًا تم إيقافها أو إعادتها دون داعٍ.",
          }
        : {
            en: "No genuinely bad decision went through, but the board's calls weren't fully sharp either: some cases were approved without the conditions they actually needed, or sent back further than the evidence justified.",
            ar: "لم يمرّ أي قرار سيئ فعليًا، لكن أحكام المجلس لم تكن حادة تمامًا أيضًا: فقد تمت الموافقة على بعض القضايا دون الشروط التي كانت تحتاجها فعليًا، أو أُعيدت قضايا أخرى إلى مسافة أبعد مما تبرره الأدلة.",
          },
    whyItMattered: {
      en: "Both errors cost the company something real: waving through what should have been stopped creates liability, and stopping what should have gone through trains good-faith teams to stop asking for the board's blessing at all. Neither failure mode is the safe one.",
      ar: "كلا الخطأين يكلّف الشركة شيئًا حقيقيًا: فالموافقة على ما كان ينبغي إيقافه يخلق مسؤولية قانونية، وإيقاف ما كان ينبغي الموافقة عليه يدرّب الفرق ذات النية الحسنة على التوقف عن طلب مباركة المجلس من الأساس. لا يوجد نمط فشل آمن هنا.",
    },
    keyDecision: {
      en: "On a board weighing governance, risk, and compliance together, 'send it back for more controls' is a legitimate call when the evidence is genuinely mixed, but it stops being governance and starts being reflexive caution the moment it becomes the answer to every case regardless of what the evidence showed.",
      ar: "في مجلس يوازن بين الحوكمة والمخاطر والامتثال معًا، يُعد قرار 'إعادتها للمزيد من الضوابط' استجابة مشروعة عندما تكون الأدلة متضاربة فعليًا، لكنه يتوقف عن كونه حوكمة ويتحول إلى حذر تلقائي بمجرد أن يصبح الإجابة على كل قضية بصرف النظر عمّا أظهرته الأدلة.",
    },
  };
}
