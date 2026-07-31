/**
 * Cybersecurity Posture Assessment — NIST CSF 2.0 self-scored maturity check.
 *
 * Migrated from the paid "Cybersecurity Posture Assessment Tool" sold on
 * abeergrc.netlify.app (Excel, $47). Question text, the 5-point maturity
 * scale, and the per-function scoring/rating thresholds are carried over
 * verbatim from the source workbook (Assessment + Dashboard tabs) so the
 * free web version produces the same result a buyer of the Excel file
 * would get. Only the delivery format changed: 30 questions across the
 * six NIST CSF 2.0 functions (Govern, Identify, Protect, Detect, Respond,
 * Recover), scored 0-4 per question, rolled up per function and overall.
 */

export type CyberPostureFunction =
  | "govern"
  | "identify"
  | "protect"
  | "detect"
  | "respond"
  | "recover";

export interface CyberPostureQuestion {
  id: string;
  fn: CyberPostureFunction;
  en: string;
  ar: string;
}

export interface MaturityLevel {
  value: string;
  score: number;
  en: string;
  ar: string;
}

export const MATURITY_LEVELS: MaturityLevel[] = [
  { value: "not_performed", score: 0, en: "Not Performed", ar: "غير مطبَّق" },
  { value: "ad_hoc", score: 1, en: "Ad-hoc", ar: "عشوائي" },
  { value: "repeatable", score: 2, en: "Repeatable", ar: "قابل للتكرار" },
  { value: "defined", score: 3, en: "Defined", ar: "موثَّق" },
  { value: "managed", score: 4, en: "Managed / Optimized", ar: "مُدار / محسَّن" },
];

export const CSF_FUNCTIONS: { key: CyberPostureFunction; en: string; ar: string }[] = [
  { key: "govern", en: "Govern", ar: "الحوكمة" },
  { key: "identify", en: "Identify", ar: "التحديد" },
  { key: "protect", en: "Protect", ar: "الحماية" },
  { key: "detect", en: "Detect", ar: "الاكتشاف" },
  { key: "respond", en: "Respond", ar: "الاستجابة" },
  { key: "recover", en: "Recover", ar: "التعافي" },
];

export const CYBER_POSTURE_QUESTIONS: CyberPostureQuestion[] = [
  { id: "g1", fn: "govern", en: "Does executive leadership formally approve and review the cybersecurity strategy at least annually?", ar: "هل تعتمد القيادة التنفيذية استراتيجية الأمن السيبراني رسميًا وتراجعها سنويًا على الأقل؟" },
  { id: "g2", fn: "govern", en: "Are cybersecurity roles, responsibilities and authorities clearly assigned across the organization?", ar: "هل أُسندت أدوار ومسؤوليات وصلاحيات الأمن السيبراني بوضوح عبر المؤسسة؟" },
  { id: "g3", fn: "govern", en: "Is cybersecurity risk integrated into enterprise risk management and reported to leadership?", ar: "هل تم دمج مخاطر الأمن السيبراني في إدارة المخاطر المؤسسية ويتم رفع تقارير بها للقيادة؟" },
  { id: "g4", fn: "govern", en: "Are cybersecurity policies communicated to all employees and contractors?", ar: "هل يتم إبلاغ جميع الموظفين والمتعاقدين بسياسات الأمن السيبراني؟" },
  { id: "g5", fn: "govern", en: "Are legal, regulatory and contractual cybersecurity obligations tracked and reviewed?", ar: "هل يتم تتبع ومراجعة الالتزامات القانونية والتنظيمية والتعاقدية المتعلقة بالأمن السيبراني؟" },
  { id: "i1", fn: "identify", en: "Is there a current inventory of critical hardware, software and data assets?", ar: "هل يوجد جرد محدَّث للأصول الحرجة من الأجهزة والبرمجيات والبيانات؟" },
  { id: "i2", fn: "identify", en: "Are cybersecurity risks to critical assets formally assessed and documented?", ar: "هل يتم تقييم وتوثيق مخاطر الأمن السيبراني على الأصول الحرجة رسميًا؟" },
  { id: "i3", fn: "identify", en: "Are critical third parties and supply-chain dependencies identified and risk-rated?", ar: "هل تم تحديد الأطراف الثالثة الحرجة واعتماديات سلسلة التوريد وتقييم مخاطرها؟" },
  { id: "i4", fn: "identify", en: "Is business context (critical processes and dependencies) documented to inform risk decisions?", ar: "هل تم توثيق السياق التجاري (العمليات الحرجة والاعتماديات) للاسترشاد به في قرارات المخاطر؟" },
  { id: "i5", fn: "identify", en: "Are vulnerabilities identified through regular scanning or assessment?", ar: "هل يتم تحديد الثغرات من خلال الفحص أو التقييم الدوري؟" },
  { id: "p1", fn: "protect", en: "Is access to systems and data controlled based on least privilege and reviewed periodically?", ar: "هل يُضبط الوصول إلى الأنظمة والبيانات وفق مبدأ الحد الأدنى من الصلاحيات ويُراجع دوريًا؟" },
  { id: "p2", fn: "protect", en: "Are critical systems and data protected with encryption where appropriate?", ar: "هل تُحمى الأنظمة والبيانات الحرجة بالتشفير عند الاقتضاء؟" },
  { id: "p3", fn: "protect", en: "Is security awareness training provided to all staff at least annually?", ar: "هل يُقدَّم تدريب توعوي أمني لجميع الموظفين سنويًا على الأقل؟" },
  { id: "p4", fn: "protect", en: "Are secure configuration baselines defined and enforced for critical systems?", ar: "هل تم تحديد وتطبيق خطوط أساس تكوين آمنة للأنظمة الحرجة؟" },
  { id: "p5", fn: "protect", en: "Is there a defined process for patching and updating systems on a risk-based timeline?", ar: "هل توجد عملية محددة لتحديث وترقيع الأنظمة وفق جدول زمني قائم على المخاطر؟" },
  { id: "d1", fn: "detect", en: "Are systems and networks monitored for anomalous or unauthorized activity?", ar: "هل تُراقَب الأنظمة والشبكات لرصد النشاط غير الطبيعي أو غير المصرح به؟" },
  { id: "d2", fn: "detect", en: "Are logs collected, protected and retained long enough to support investigations?", ar: "هل يتم جمع السجلات وحمايتها والاحتفاظ بها لمدة كافية لدعم التحقيقات؟" },
  { id: "d3", fn: "detect", en: "Are detection tools (e.g., EDR, IDS/IPS) deployed on critical systems?", ar: "هل تم نشر أدوات الاكتشاف (مثل EDR وIDS/IPS) على الأنظمة الحرجة؟" },
  { id: "d4", fn: "detect", en: "Is there a defined process for triaging and validating security alerts?", ar: "هل توجد عملية محددة لفرز والتحقق من التنبيهات الأمنية؟" },
  { id: "d5", fn: "detect", en: "Are detection capabilities tested periodically (e.g., red team or purple team exercises)?", ar: "هل تُختبر قدرات الاكتشاف دوريًا (مثل تمارين الفريق الأحمر أو الأرجواني)؟" },
  { id: "r1", fn: "respond", en: "Is there a documented, tested incident response plan?", ar: "هل توجد خطة استجابة للحوادث موثقة ومختبرة؟" },
  { id: "r2", fn: "respond", en: "Are roles and communication channels clearly defined for incident response?", ar: "هل الأدوار وقنوات التواصل محددة بوضوح للاستجابة للحوادث؟" },
  { id: "r3", fn: "respond", en: "Is there a defined process for containing and eradicating confirmed incidents?", ar: "هل توجد عملية محددة لاحتواء الحوادث المؤكدة والقضاء عليها؟" },
  { id: "r4", fn: "respond", en: "Are regulatory and customer notification obligations understood and actionable?", ar: "هل التزامات إخطار الجهات التنظيمية والعملاء مفهومة وقابلة للتنفيذ؟" },
  { id: "r5", fn: "respond", en: "Are lessons learned from incidents captured and used to improve controls?", ar: "هل يتم توثيق الدروس المستفادة من الحوادث واستخدامها لتحسين الضوابط؟" },
  { id: "rc1", fn: "recover", en: "Are backups of critical systems and data taken, protected and tested regularly?", ar: "هل تُؤخذ نسخ احتياطية للأنظمة والبيانات الحرجة وتُحمى وتُختبر بانتظام؟" },
  { id: "rc2", fn: "recover", en: "Is there a documented disaster recovery / business continuity plan?", ar: "هل توجد خطة موثقة للتعافي من الكوارث واستمرارية الأعمال؟" },
  { id: "rc3", fn: "recover", en: "Are recovery time and recovery point objectives defined for critical systems?", ar: "هل تم تحديد أهداف زمن التعافي ونقطة التعافي للأنظمة الحرجة؟" },
  { id: "rc4", fn: "recover", en: "Is recovery capability tested at least annually?", ar: "هل تُختبر قدرة التعافي سنويًا على الأقل؟" },
  { id: "rc5", fn: "recover", en: "Is there a plan for communicating with stakeholders during recovery?", ar: "هل توجد خطة للتواصل مع أصحاب المصلحة أثناء التعافي؟" },
];

export interface CyberPostureFunctionResult {
  fn: CyberPostureFunction;
  score: number;
  max: number;
  percent: number;
  rating: string;
}

export interface CyberPostureResult {
  functions: CyberPostureFunctionResult[];
  overall: CyberPostureFunctionResult;
}

function ratingFor(percent: number): string {
  if (percent >= 0.81) return "managed";
  if (percent >= 0.61) return "defined";
  if (percent >= 0.41) return "repeatable";
  if (percent >= 0.21) return "ad_hoc";
  return "not_performed";
}

/** answers: question id -> maturity level value (e.g. "defined") */
export function scoreCyberPosture(answers: Record<string, string>): CyberPostureResult {
  const byLevel = new Map(MATURITY_LEVELS.map((l) => [l.value, l.score]));
  const functions = CSF_FUNCTIONS.map(({ key }) => {
    const qs = CYBER_POSTURE_QUESTIONS.filter((q) => q.fn === key);
    let score = 0;
    let answered = 0;
    for (const q of qs) {
      const v = answers[q.id];
      if (v && byLevel.has(v)) {
        score += byLevel.get(v)!;
        answered += 1;
      }
    }
    const max = answered * 4;
    const percent = max > 0 ? score / max : 0;
    return { fn: key, score, max, percent, rating: max > 0 ? ratingFor(percent) : "not_performed" };
  });
  const totalScore = functions.reduce((s, f) => s + f.score, 0);
  const totalMax = functions.reduce((s, f) => s + f.max, 0);
  const overallPercent = totalMax > 0 ? totalScore / totalMax : 0;
  return {
    functions,
    overall: {
      fn: "govern",
      score: totalScore,
      max: totalMax,
      percent: overallPercent,
      rating: totalMax > 0 ? ratingFor(overallPercent) : "not_performed",
    },
  };
}
