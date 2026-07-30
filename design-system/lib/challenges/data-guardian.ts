import type { Bilingual } from "./bilingual";

export const DATA_GUARDIAN_CHALLENGE_KEY = "data_guardian_classify_and_protect" as const;
export const DATA_GUARDIAN_MAX_SCORE = 100;

/**
 * The audit clock: the analyst has enough time to fully investigate
 * some, but not all, of the clues across the queue of data assets.
 * Exactly like SOC Night Shift's investigation budget, this is a UI
 * constraint only (see data-guardian-challenge.tsx), not a scoring
 * input -- the score is entirely about whether the final handling
 * decisions were right, whether they were reached with full evidence
 * or a guess based on the asset's name and folder alone.
 */
export const AUDIT_BUDGET = 7;

export type AssetId =
  | "feedback_export"
  | "legal_archive"
  | "qa_snapshot_bucket"
  | "onboarding_folder"
  | "survey_export";

export type Decision = "restrict" | "monitor_access" | "leave_open";
export type GroundTruth = "needs_lockdown" | "already_safe";

export interface AssetClue {
  id: string;
  action: Bilingual;
  reveal: Bilingual;
}

export interface DataAsset {
  id: AssetId;
  source: Bilingual;
  title: Bilingual;
  summary: Bilingual;
  apparentSensitivity: "public" | "internal" | "confidential";
  groundTruth: GroundTruth;
  clues: [AssetClue, AssetClue];
}

export const DATA_ASSETS: DataAsset[] = [
  {
    id: "feedback_export",
    source: { en: "Marketing analytics - customer feedback platform", ar: "تحليلات التسويق - منصة آراء العملاء" },
    title: { en: "Quarterly customer feedback export flagged for review", ar: "تصدير ربع سنوي لآراء العملاء تم تمييزه للمراجعة" },
    summary: {
      en: "A CSV of open-ended product feedback comments was exported from the support platform and dropped into a shared marketing drive that the whole company can view.",
      ar: "تم تصدير ملف CSV يحتوي على تعليقات مفتوحة حول المنتج من منصة الدعم، ووُضع في مجلد تسويقي مشترك يمكن ليملعع موظفي الشركة الطلاظ عليه.",
    },
    apparentSensitivity: "internal",
    groundTruth: "needs_lockdown",
    clues: [
      {
        id: "feedback_export_access",
        action: { en: "Check who can access the drive", ar: "تحقق من صلاحيات الوصول إلى المجلد" },
        reveal: {
          en: "The folder inherits 'view' access for every employee in the company, including contractors, with no expiration.",
          ar: "يرث المجلد صلاحية 'عرض' لمجلع موظفي الشركة، بمن فيهم المتعاقدون، دون أي تاريخ انتهاء.",
        },
      },
      {
        id: "feedback_export_content",
        action: { en: "Sample the file's free-text fields", ar: "تحقق من عيّنة من حقول النص الحر في الملف" },
        reveal: {
          en: "Row 482 is a forwarded support transcript in which a customer pasted their full card number and CVV while describing a failed charge.",
          ar: "يحتوي السطر 482 على نسخة من محادثة دعم أعاد فيها أحد العملاء لصق رقم بطاقته الكامل ورمز التحقق (CVV) أثناء وصف عملية دفع فاشلة.",
        },
      },
    ],
  },
  {
    id: "legal_archive",
    source: { en: "Legal - litigation hold archive", ar: "الشؤون القانونية - أرشيف الحجز القضائي" },
    title: { en: "Attorney-client privileged case archive up for annual review", ar: "أرشيف قضايا محمي بامتياز السرية بين المحامي والموكل معروض للمراجعة السنوية" },
    summary: {
      en: "A legal server holds several years of HR investigation files and attorney correspondence related to closed cases.",
      ar: "يحتفظ خادم قانوني بسنوات من ملفات تحقيقات الموارد البشرية ومراسلات المحامين المتعلقة بقضايا مغلقة.",
    },
    apparentSensitivity: "confidential",
    groundTruth: "already_safe",
    clues: [
      {
        id: "legal_archive_access",
        action: { en: "Pull the access log", ar: "استعرض سجل الوصول" },
        reveal: {
          en: "In the past 18 months, exactly two named attorneys opened the archive, both with matching case assignments on file.",
          ar: "خلال الأشهر الثمانية عشر الماضية، فتح الأرشيف محاميان اثنان فقط بالاسم، وكلاهما لديه تكليف مطابق بالقضية مسجَّل.",
        },
      },
      {
        id: "legal_archive_encryption",
        action: { en: "Check the storage's encryption status", ar: "تحقق من حالة تشفير وحدة التخزين" },
        reveal: {
          en: "Volume-level encryption was independently verified during last year's SOC 2 audit, with keys held by a separate custodian team.",
          ar: "تم التحقق بشكل مستقل من التشفير على مستوى وحدة التخزين خلال تدقيق SOC 2 للعام الماضي، وتُدار مفاتيحه من قبل فريق أمين منفصل.",
        },
      },
    ],
  },
  {
    id: "qa_snapshot_bucket",
    source: { en: "Engineering - QA cloud storage", ar: "الهندسة - تخزين سحابي لضمان الجودة" },
    title: { en: "'prod-mirror-temp' bucket surfaced in a routine cost report", ar: "ظهور حاوية 'prod-mirror-temp' في تقرير تكاليف روتيني" },
    summary: {
      en: "A cloud storage bucket named for QA load testing shows heavier-than-expected read traffic this month.",
      ar: "أظهرت حاوية تخزين سحابي مخصصة لاختبار الأحمال في ضمان الجودة حركة قراءة أعلى من المتوقع هذا الشهر.",
    },
    apparentSensitivity: "public",
    groundTruth: "needs_lockdown",
    clues: [
      {
        id: "qa_snapshot_permissions",
        action: { en: "Check the bucket's permissions history", ar: "تحقق من سجل صلاحيات الحاوية" },
        reveal: {
          en: "'Public-read' was enabled eight months ago so contractor laptops could run load-testing scripts without VPN setup.",
          ar: "تم تفعيل صلاحية 'قراءة عامة' قبل ثمانية أشهر لتسهيل تشغيل سكربتات اختبار الأحمال من أجهزة المتعاقدين دون إعداد VPN.",
        },
      },
      {
        id: "qa_snapshot_sample",
        action: { en: "Sample the largest file in the bucket", ar: "افحص عيّنة من أكبر ملف في الحاوية" },
        reveal: {
          en: "The file is an unredacted nightly copy of the production customer table, including national ID numbers, matching last month's live export.",
          ar: "الملف نسخة ليلية غير مُنقّحة من جدول عملاء الإنتاج، وتطابق تصدير الإنتاج الفعلي للشهر الماضي.",
        },
      },
    ],
  },
  {
    id: "onboarding_folder",
    source: { en: "HR - new-hire onboarding share", ar: "الموارد البشرية - مجلد إعداد الموظفين الجدد" },
    title: { en: "New-hire onboarding folder shared with all people managers", ar: "مجلد إعداد الموظفين الجدد مشارك مع جميع مديري الفرق" },
    summary: {
      en: "The folder holds signed offer letters and government ID copies collected during onboarding, shared with everyone on a manager distribution list.",
      ar: "يحتوي المجلد على خطابات العرض الموقّعة ونسخ من الهويات الحكومية التي تُجمع أثناء الإعدادون، وهب مشارك مع الجميع ضمن قائمة توزيع المديرين.",
    },
    apparentSensitivity: "confidential",
    groundTruth: "needs_lockdown",
    clues: [
      {
        id: "onboarding_folder_group",
        action: { en: "Check how the sharing list is maintained", ar: "تحقق من كيفية إدارة قائمة المشاركة" },
        reveal: {
          en: "Access is granted through a static distribution group named 'All-Managers-2019' that has never been reviewed since it was created.",
          ar: "يُم٠ح الوصول عبر مجموعة توزيع ثابتة باسم 'All-Managers-2019' لم تُراج٘�e منذ إنشائها.",
        },
      },
      {
        id: "onboarding_folder_roster",
        action: { en: "Cross-check the group's members against HR", ar: "قارن أعضاء المجموعة بسجلات الموارد البشرية" },
        reveal: {
          en: "40 of the 96 people in the group left the company more than a year ago, several now at competitors.",
          ar: "غادر 40 من أصل 96 عضوًا في المجموعة الشركة منذ أكثر من عام، ويعمل بعضهم حاليًا لدى شركات منافسة.",
        },
      },
    ],
  },
  {
    id: "survey_export",
    source: { en: "Marketing - discontinued product survey", ar: "التسويق - استبيان منتج متوقف" },
    title: { en: "Three-year-old customer satisfaction survey results", ar: "نتائج استبيان رضا العملاء منذ ثلاث سنوات" },
    summary: {
      en: "A spreadsheet of survey results from a product line that was discontinued two years ago is still sitting in a shared drive.",
      ar: "لا يزال جدول بيانات لنتائج استبيان من خط*"منتج تم إيقافه قبل عامين موجودًا في مجلد مشترك.",
    },
    apparentSensitivity: "internal",
    groundTruth: "already_safe",
    clues: [
      {
        id: "survey_export_dpa",
        action: { en: "Check the vendor data processing agreement", ar: "تحقق من اتفاقية معالجة البيانات مع المزوّد" },
        reveal: {
          en: "The agreement on file states individual responses are deleted after 90 days; only regional aggregates are delivered to the company.",
          ar: "تنص الاتفاقية المسجَّلة على حذف الردود الفردية بعف 90 يومًا، ولا تُسلَّم للشركة سوى مجاميع إقليمية.",
        },
      },
      {
        id: "survey_export_content",
        action: { en: "Open the file and inspect its columns", ar: "افتح الملف وافحص أعمدته" },
        reveal: {
          en: "Every row is a region, an average score, and a response count -- no names, emails, or free-text fields anywhere in the file.",
          ar: "كل سطر يحتوي على منطقة ومتوسط درجة وعدد الردود فقط، دون أي أسماء أو بريد إلكتروني أو حقول نص حر في الملف بأكمله.",
        },
      },
    ],
  },
];

function correctDecisionFor(groundTruth: GroundTruth): Decision {
  return groundTruth === "needs_lockdown" ? "restrict" : "leave_open";
}

function pointsFor(groundTruth: GroundTruth, decision: Decision): number {
  if (groundTruth === "needs_lockdown") {
    if (decision === "restrict") return 20;
    if (decision === "monitor_access") return 10;
    return -5; // left a genuinely exposed asset open
  }
  // already_safe
  if (decision === "leave_open") return 20;
  if (decision === "monitor_access") return 8;
  return -8; // restricted an asset that was already handled correctly
}

export interface DataGuardianSubmission {
  decisions: Partial<Record<AssetId, Decision>>;
  investigatedClueIds: string[];
}

export interface AssetOutcome {
  assetId: AssetId;
  decision: Decision;
  groundTruth: GroundTruth;
  correctDecision: Decision;
  wasCorrect: boolean;
  points: number;
  fullyInvestigated: boolean;
}

export interface DataGuardianResult {
  score: number;
  xp: number;
  assetOutcomes: AssetOutcome[];
  exposureCount: number;
  frictionCount: number;
  outcome: "fully_protected" | "partially_protected" | "data_exposed";
}

export function computeDataGuardianScore(submission: DataGuardianSubmission): DataGuardianResult {
  let rawPoints = 0;
  let exposureCount = 0;
  let frictionCount = 0;

  const assetOutcomes: AssetOutcome[] = DATA_ASSETS.map((asset) => {
    const decision = submission.decisions[asset.id] ?? "monitor_access";
    const correctDecision = correctDecisionFor(asset.groundTruth);
    const points = pointsFor(asset.groundTruth, decision);
    const wasCorrect = decision === correctDecision;
    const fullyInvestigated = asset.clues.every((c) => submission.investigatedClueIds.includes(c.id));

    rawPoints += points;
    if (asset.groundTruth === "needs_lockdown" && decision === "leave_open") exposureCount += 1;
    if (asset.groundTruth === "already_safe" && decision === "restrict") frictionCount += 1;

    return { assetId: asset.id, decision, groundTruth: asset.groundTruth, correctDecision, wasCorrect, points, fullyInvestigated };
  });

  const score = Math.min(DATA_GUARDIAN_MAX_SCORE, Math.max(0, Math.round(rawPoints)));
  const xp = Math.round(score * 1.5);

  const outcome: "fully_protected" | "partially_protected" | "data_exposed" =
    exposureCount > 0 ? "data_exposed" : assetOutcomes.every((a) => a.wasCorrect) ? "fully_protected" : "partially_protected";

  return { score, xp, assetOutcomes, exposureCount, frictionCount, outcome };
}

export interface DataGuardianConsequenceCopy {
  outcomeLabel: Bilingual;
  headline: Bilingual;
  whatHappened: Bilingual;
  whyItMattered: Bilingual;
  keyDecision: Bilingual;
}

export function getDataGuardianConsequenceCopy(result: DataGuardianResult): DataGuardianConsequenceCopy {
  if (result.outcome === "data_exposed") {
    return {
      outcomeLabel: { en: "Data left exposed", ar: "بيانات ظلت مكشوفة" },
      headline: {
        en: "At least one genuinely sensitive dataset was left open instead of restricted.",
        ar: "تم ترك مجموعة بيانات حساسة فعليًا مفتوحة الوصول بدلًا من تقييدها.",
      },
      whatHappened: {
        en: "An asset that looked routine on the surface was actually carrying real exposure, and it was left exactly as found.",
        ar: "كان أحد الأصول يبدو روتينيًا في ظاهره لكنه يحمل خطر تسرب فعلي، وتم تركه كما وُجد دون أي إجراء.",
      },
      whyItMattered: {
        en: "An unrestricted asset holding real personal or payment data is a live liability the moment anyone with access decides to misuse it, or the moment a breach elsewhere gives an attacker a path to it.",
        ar: "الأصل غير المقيَّد الذي يحمل بيانات شخصية أو مالية حقيقية هو مسؤولية قائمة فور أن يقرر أي شخص لديه صلاحية وصول إساءة استخدامها، أو فور أن يمنح اختراق آخر مهاجمًا طريقًا إليه.",
      },
      keyDecision: {
        en: "The assets worth spending audit time on were the ones whose name or folder made them sound boring, not the ones whose label already said 'legal' or 'HR'.",
        ar: "الأصول التي تستحق إنفاق وقت التدقيق عليها كانت تلك التي يوحي اسمها أو مجلدها بأنها عادية، لا تلك التي يحمل تصنيفها بالفعل كلمة 'قانوني' أو 'موارد بشرية'.",
      },
    };
  }
  if (result.outcome === "fully_protected") {
    return {
      outcomeLabel: { en: "Fully protected", ar: "محمي بالكامل" },
      headline: {
        en: "Every asset in the queue was classified and handled correctly.",
        ar: "تم تصنيف كل أصل في القائمة والتعامل معه بشكل صحيح.",
      },
      whatHappened: {
        en: "Genuinely exposed data was locked down while there was still time, and data that was already handled correctly was left alone instead of being restricted for no reason.",
        ar: "تم تقييد البيانات المكشوفة فعليًا في الوقت المناسب، وتُركت البيانات التي كانت تُدار بشكل صحيح بالفعل دون تقييدها دون داعٍ.",
      },
      whyItMattered: {
        en: "Correctly leaving well-handled data alone matters just as much as locking down real exposure: over-restricting access that people legitimately need trains teams to route around security instead of through it.",
        ar: "ترك البيانات المُدارة بشكل صحيح كما هي يوازي في أهميته تقييد البيانات المكشوفة فعليًا: فتقييد الوصول الذي يحتاجه الأشخاص فعليًا دون داعٍ يدفع الفرق إلى الالتفاف حول الأمن بدلًا من العمل من خلاله.",
      },
      keyDecision: {
        en: "Spending the limited audit budget on the assets whose surface label was the most misleading, rather than the ones that simply sounded the most alarming, is what separated this audit.",
        ar: "إنفاق ميزانية التدقيق المحدودة على الأصول التي كان تصنيفها الظاهري الأكثر تضليلًا، بدلًا من تلك التي يحمل تصنيفها بالفعل كلمة 'قانوني' أو 'موارد بشرية'.",
      },
    };
  }
  return {
    outcomeLabel: { en: "Protected, with friction", ar: "محمي، مع بعض الاحتكاك" },
    headline: {
      en: "No genuinely sensitive data was left exposed, but the audit wasn't clean.",
      ar: "لم تُترك أي بيانات حساسة فعليًا مكشوفة لكن التدقيق لم يكن مثاليًا.",
    },
    whatHappened: result.frictionCount > 0
      ? {
          en: "At least one already-safe asset was restricted anyway, adding unnecessary access friction for the team that legitimately needed it.",
          ar: "تم تقييد أصل واحد كان آمنًا بالفعل على أية حالة آخرى، مص ظوة اصلياٍ محليا.",
        }
      : {
          en: "At least one asset was left on 'monitor access' instead of being resolved with a clear decision.",
          ar: "تم ترك أصل واحد على أقل في وضع 'مراقبة الوصول' بدلًا من حسمه بقرار واضح.",
        },
    whyItMattered: {
      en: "Nobody's data was exposed tonight, but repeated unnecessary lockdowns or repeated indecision both erode the same thing: how much the rest of the company trusts the data classification process.",
      ar: "لم تتعرض بيانات أي شخص للكشف الليلة، لكن التقييد غير الضروري المتكرر أي التردد المتكرر كلاهما يُضعف الشيء نفسه: مدى ثقة بقية الشركة بعملية تصنيف البيانات.",
    },
    keyDecision: {
      en: "A 'monitor access' call is a legitimate response under real uncertainty, but it should be the exception used when audit budget ran out, not the default for every ambiguous asset.",
      ar: "قرار 'مراقبة الوصول' استجابة مشروعة في حالات عدم اليقين الحقيقي، لكن ينبغي أن يكون الاستثناء عند نفاد ميزانية التدقيق، لا الخيار الافتراضي لكل أصل غامض.",
    },
  };
}
