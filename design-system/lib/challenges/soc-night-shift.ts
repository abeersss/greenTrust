import type { Bilingual } from "./bilingual";

export const SOC_NIGHT_SHIFT_CHALLENGE_KEY = "soc_alert_triage_shift_one" as const;
export const SOC_NIGHT_SHIFT_MAX_SCORE = 100;

/**
 * The shift clock: the analyst has enough time to fully investigate
 * some, but not all, of the clues across the queue. This is what
 * forces real prioritization instead of "check everything, then
 * decide" -- exactly like an actual overnight SOC shift. It is a UI
 * constraint only (see soc-night-shift-challenge.tsx), not a scoring
 * input: the score is entirely about whether the final decisions were
 * right, whether they were reached with full evidence or a hunch.
 */
export const SOC_INVESTIGATION_BUDGET = 7;

export type AlertId =
  | "impossible_travel"
  | "encoded_powershell"
  | "after_hours_admin"
  | "exfil_traffic"
  | "eicar_test";

export type Decision = "escalate" | "monitor" | "close";
export type GroundTruth = "true_positive" | "false_positive";

export interface AlertClue {
  id: string;
  action: Bilingual;
  reveal: Bilingual;
}

export interface SocAlert {
  id: AlertId;
  source: Bilingual;
  title: Bilingual;
  summary: Bilingual;
  reportedSeverity: "low" | "medium" | "high";
  groundTruth: GroundTruth;
  clues: [AlertClue, AlertClue];
}

export const SOC_ALERTS: SocAlert[] = [
  {
    id: "impossible_travel",
    source: { en: "Identity provider - login analytics", ar: "مزوّد الهوية - تحليلات تسجيل الدخول" },
    title: { en: "Impossible travel: same account, two countries in 40 minutes", ar: "سفر مستحيل: نفس الحساب من دولتين خلال 40 دقيقة" },
    summary: {
      en: "finance.controller@ logged in from Amman, then again from Bucharest 40 minutes later. No MFA prompt was recorded for either session.",
      ar: "سجّل حساب finance.controller@ الدخول من عمّان، ثم مرة أخرى من بوخارست بعد 40 دقيقة. لم يُسجَّل أي طلب تحقق ثنائي لأي من الجلستين.",
    },
    reportedSeverity: "medium",
    groundTruth: "true_positive",
    clues: [
      {
        id: "impossible_travel_ip",
        action: { en: "Check source IP reputation", ar: "تحقق من سمعة عنوان IP المصدر" },
        reveal: {
          en: "The Bucharest IP is already listed in this month's threat feed as infrastructure used to replay stolen session tokens. The Amman IP is the employee's normal home connection.",
          ar: "عنوان IP في بوخارست مدرج بالفعل في قائمة تهديدات هذا الشهر كبنية تحتية تُستخدم لإعادة استخدام رموز جلسات مسروقة. أما عنوان عمّان فهو اتصال المنزل المعتاد للموظف.",
        },
      },
      {
        id: "impossible_travel_baseline",
        action: { en: "Check user baseline / HR calendar", ar: "تحقق من نمط سلوك المستخدم / تقويم الموارد البشرية" },
        reveal: {
          en: "The employee is logged as on approved leave starting yesterday and is not expected to touch any system until next week.",
          ar: "الموظف مسجَّل في إجازة معتمدة اعتبارًا من أمس، ولا يُتوقَّع أن يستخدم أي نظام حتى الأسبوع المقبل.",
        },
      },
    ],
  },
  {
    id: "encoded_powershell",
    source: { en: "EDR - Finance-WS-14", ar: "EDR - جهاز الموظف Finance-WS-14" },
    title: { en: "Base64-encoded PowerShell command executed", ar: "تنفيذ أمر PowerShell مشفّر بصيغة Base64" },
    summary: {
      en: "A long, encoded PowerShell command ran on a finance workstation nine minutes ago. The EDR agent scored it low-confidence because the binary itself is signed and legitimate.",
      ar: "تم تنفيذ أمر PowerShell طويل ومشفّر على جهاز أحد موظفي المالية قبل تسع دقائق. صنّفه عامل EDR بثقة منخفضة لأن الملف التنفيذي نفسه موقّع وشرعي.",
    },
    reportedSeverity: "low",
    groundTruth: "true_positive",
    clues: [
      {
        id: "encoded_powershell_tree",
        action: { en: "Check process ancestry", ar: "تحقق من سلسلة العمليات الأصلية" },
        reveal: {
          en: "PowerShell was spawned by WINWORD.EXE two seconds after the user opened an emailed invoice. Legitimate finance workflows never launch PowerShell from Word.",
          ar: "تم إطلاق PowerShell من WINWORD.EXE بعد ثانيتين فقط من فتح المستخدم لفاتورة أُرسلت عبر البريد. سير العمل المالي الشرعي لا يُطلق PowerShell من Word إطلاقًا.",
        },
      },
      {
        id: "encoded_powershell_decode",
        action: { en: "Decode the command and check threat intel", ar: "فك تشفير الأمر وتحقق من معلومات التهديدات" },
        reveal: {
          en: "The decoded string reaches out to a domain flagged three days ago as a known malware staging server. This matches a documented macro-dropper technique.",
          ar: "يتصل النص بعد فك تشفيره بنطاق تم رصده قبل ثلاثة أيام كخادم معروف لاستضافة برمجيات خبيثة. هذا يطابق أسلوبًا موثّقًا لإسقاط البرمجيات عبر الوحدات النمطية (macros).",
        },
      },
    ],
  },
  {
    id: "after_hours_admin",
    source: { en: "Active Directory - account provisioning", ar: "خدمة الدليل النشط - تزويد الحسابات" },
    title: { en: "New domain admin account created at 2:47 AM", ar: "تم إنشاء حساب مسؤول نطاق جديد في الساعة 2:47 صباحًا" },
    summary: {
      en: "A new account with domain admin rights was created outside business hours. No analyst on this shift remembers approving it.",
      ar: "تم إنشاء حساب جديد بصلاحيات مسؤول النطاق خارج ساعات العمل. لا يتذكر أي محلل في هذه المناوبة الموافقة عليه.",
    },
    reportedSeverity: "high",
    groundTruth: "false_positive",
    clues: [
      {
        id: "after_hours_admin_ticket",
        action: { en: "Check the change management calendar", ar: "تحقق من تقويم إدارة التغيير" },
        reveal: {
          en: "There is an approved change ticket for tonight: the identity team's quarterly service-account rotation was delayed from 10 PM to nearly 3 AM after an unrelated maintenance window ran long.",
          ar: "توجد تذكرة تغيير معتمدة لهذه الليلة: تأخّر تدوير حسابات الخدمة الفصلي التابع لفريق الهوية من الساعة 10 مساءً إلى ما يقارب الساعة 3 فجرًا بسبب امتداد نافذة صيانة أخرى غير مرتبطة.",
        },
      },
      {
        id: "after_hours_admin_actor",
        action: { en: "Check which account created it", ar: "تحقق من الحساب الذي أنشأه" },
        reveal: {
          en: "The account was created by svc-identity-automation, the standard service account the identity team's rotation script always runs as. No interactive human login was involved.",
          ar: "تم إنشاء الحساب بواسطة svc-identity-automation، وهو حساب الخدمة القياسي الذي يعمل من خلاله سكربت التدوير الخاص بفريق الهوية دائمًا. لم يكن هناك أي تسجيل دخول بشري تفاعلي.",
        },
      },
    ],
  },
  {
    id: "exfil_traffic",
    source: { en: "Network DLP - database segment", ar: "منع تسرب البيانات على مستوى الشبكة - قطاع قواعد البيانات" },
    title: { en: "Sustained outbound transfer from the customer database server", ar: "نقل بيانات صادر مستمر من خادم قاعدة بيانات العملاء" },
    summary: {
      en: "The primary customer database server has been sending a steady stream of traffic to an external domain for the last twenty minutes. The destination is not on any approved backup or replication list.",
      ar: "يرسل خادم قاعدة بيانات العملاء الرئيسي تدفقًا ثابتًا من البيانات إلى نطاق خارجي منذ عشرين دقيقة. الوجهة غير مدرجة في أي قائمة نسخ احتياطي أو تكرار معتمدة.",
    },
    reportedSeverity: "high",
    groundTruth: "true_positive",
    clues: [
      {
        id: "exfil_traffic_domain",
        action: { en: "Check the destination domain", ar: "تحقق من النطاق الوجهة" },
        reveal: {
          en: "The domain was registered four days ago and was added to a threat feed this morning as suspected exfiltration infrastructure. It has no legitimate business relationship with the company.",
          ar: "تم تسجيل النطاق قبل أربعة أيام، وأُضيف إلى قائمة تهديدات هذا الصباح باعتباره بنية تحتية يُشتبه في استخدامها لتسريب البيانات. لا توجد له أي علاقة عمل مشروعة مع الشركة.",
        },
      },
      {
        id: "exfil_traffic_process",
        action: { en: "Check the sending process's file hash", ar: "تحقق من بصمة الملف الخاص بالعملية المرسلة" },
        reveal: {
          en: "The traffic is coming from what appears to be the nightly backup service, but its file hash was replaced two days ago and no longer matches the vendor's signed binary.",
          ar: "تصدر البيانات مما يبدو أنه خدمة النسخ الاحتياطي الليلية، لكن بصمة ملفها استُبدلت قبل يومين ولم تعد تطابق الملف التنفيذي الموقّع من المزوّد.",
        },
      },
    ],
  },
  {
    id: "eicar_test",
    source: { en: "Endpoint antivirus - developer laptop", ar: "برنامج مكافحة الفيروسات على الطرف - حاسوب أحد المطورين" },
    title: { en: "Malicious test file blocked and quarantined", ar: "تم حظر ملف اختباري ضار وعزله" },
    summary: {
      en: "Antivirus blocked and quarantined a file flagged as malicious on a developer's laptop. Only one file was involved, and no other activity followed.",
      ar: "قام برنامج مكافحة الفيروسات بحظر وعزل ملف مصنَّف كضار على حاسوب أحد المطورين. تعلّق الأمر بملف واحد فقط، ولم يتبعه أي نشاط آخر.",
    },
    reportedSeverity: "low",
    groundTruth: "false_positive",
    clues: [
      {
        id: "eicar_test_baseline",
        action: { en: "Check the user's team and role", ar: "تحقق من فريق المستخدم ودوره" },
        reveal: {
          en: "This user is a member of the internal red team. Their laptop is explicitly exempted from the standard 'no security tools' policy for testing purposes.",
          ar: "هذا المستخدم عضو في فريق الاختراق الداخلي (Red Team). حاسوبه مستثنى صراحة من سياسة 'عدم استخدام أدوات أمنية' القياسية لأغراض الاختبار.",
        },
      },
      {
        id: "eicar_test_ticket",
        action: { en: "Check active engagement records", ar: "تحقق من سجلات المهام الجارية" },
        reveal: {
          en: "There is an active, approved penetration-testing engagement scheduled for this exact asset and time window. The blocked file matches a standard EICAR-style test signature, not real malware.",
          ar: "توجد مهمة اختبار اختراق نشطة ومعتمدة لهذا الجهاز تحديدًا خلال هذه الفترة الزمنية. الملف المحظور يطابق توقيع ملف اختباري قياسي (بأسلوب EICAR)، وليس برمجية خبيثة حقيقية.",
        },
      },
    ],
  },
];

function correctDecisionFor(groundTruth: GroundTruth): Decision {
  return groundTruth === "true_positive" ? "escalate" : "close";
}

function pointsFor(groundTruth: GroundTruth, decision: Decision): number {
  if (groundTruth === "true_positive") {
    if (decision === "escalate") return 20;
    if (decision === "monitor") return 10;
    return -5; // closed a real intrusion
  }
  // false_positive
  if (decision === "close") return 20;
  if (decision === "monitor") return 8;
  return -8; // escalated a false alarm, paged someone for nothing
}

export interface SocNightShiftSubmission {
  decisions: Partial<Record<AlertId, Decision>>;
  investigatedClueIds: string[];
}

export interface AlertOutcome {
  alertId: AlertId;
  decision: Decision;
  groundTruth: GroundTruth;
  correctDecision: Decision;
  wasCorrect: boolean;
  points: number;
  fullyInvestigated: boolean;
}

export interface SocNightShiftResult {
  score: number;
  xp: number;
  alertOutcomes: AlertOutcome[];
  breachCount: number;
  fatigueCount: number;
  outcome: "clean_shift" | "contained" | "breach";
}

export function computeSocNightShiftScore(submission: SocNightShiftSubmission): SocNightShiftResult {
  let rawPoints = 0;
  let breachCount = 0;
  let fatigueCount = 0;

  const alertOutcomes: AlertOutcome[] = SOC_ALERTS.map((alert) => {
    const decision = submission.decisions[alert.id] ?? "monitor";
    const correctDecision = correctDecisionFor(alert.groundTruth);
    const points = pointsFor(alert.groundTruth, decision);
    const wasCorrect = decision === correctDecision;
    const fullyInvestigated = alert.clues.every((c) => submission.investigatedClueIds.includes(c.id));

    rawPoints += points;
    if (alert.groundTruth === "true_positive" && decision === "close") breachCount += 1;
    if (alert.groundTruth === "false_positive" && decision === "escalate") fatigueCount += 1;

    return { alertId: alert.id, decision, groundTruth: alert.groundTruth, correctDecision, wasCorrect, points, fullyInvestigated };
  });

  const score = Math.min(SOC_NIGHT_SHIFT_MAX_SCORE, Math.max(0, Math.round(rawPoints)));
  const xp = Math.round(score * 1.5);

  const outcome: "clean_shift" | "contained" | "breach" =
    breachCount > 0 ? "breach" : alertOutcomes.every((a) => a.wasCorrect) ? "clean_shift" : "contained";

  return { score, xp, alertOutcomes, breachCount, fatigueCount, outcome };
}

export interface SocConsequenceCopy {
  outcomeLabel: Bilingual;
  headline: Bilingual;
  whatHappened: Bilingual;
  whyItMattered: Bilingual;
  keyDecision: Bilingual;
}

export function getSocConsequenceCopy(result: SocNightShiftResult): SocConsequenceCopy {
  if (result.outcome === "breach") {
    return {
      outcomeLabel: { en: "Incident missed", ar: "تم تفويت حادثة" },
      headline: {
        en: "At least one real intrusion was closed out as benign and kept running past the end of the shift.",
        ar: "تم إغلاق حادثة اختراق حقيقية واحدة على الأقل باعتبارها غير ضارة، واستمرت بعد نهاية المناوبة.",
      },
      whatHappened: {
        en: "Without the right evidence in hand, a genuine attack looked routine enough to dismiss. It will still be running when the day shift arrives.",
        ar: "دون توفر الأدلة الصحيحة، بدت هجمة حقيقية روتينية بما يكفي لتجاهلها. ستظل مستمرة عند وصول مناوبة النهار.",
      },
      whyItMattered: {
        en: "A missed true positive is the single most expensive outcome in a SOC: the cost of investigating and being wrong is minutes, the cost of not investigating and being wrong is a breach.",
        ar: "تفويت حادثة إيجابية حقيقية هو أبهظ نتيجة ممكنة في مركز العمليات الأمنية: تكلفة التحقيق والخطأ هي دقائق، أما تكلفة عدم التحقيق والخطأ فهي اختراق كامل.",
      },
      keyDecision: {
        en: "The alerts that looked low-severity on the surface (an encoded command from a signed binary, a stale-looking login) were exactly the ones worth spending investigation budget on.",
        ar: "التنبيهات التي بدت منخفضة الخطورة ظاهريًا (أمر مشفّر من ملف موقّع، أو تسجيل دخول يبدو قديمًا) كانت بالتحديد الأجدر بإنفاق ميزانية التحقيق عليها.",
      },
    };
  }
  if (result.outcome === "clean_shift") {
    return {
      outcomeLabel: { en: "Clean shift", ar: "مناوبة نظيفة" },
      headline: {
        en: "Every alert in the queue was resolved correctly before shift end.",
        ar: "تم حل كل تنبيه في القائمة بشكل صحيح قبل نهاية المناوبة.",
      },
      whatHappened: {
        en: "The real intrusions were escalated while there was still time to contain them, and the false alarms were closed without paging anyone unnecessarily.",
        ar: "تم تصعيد الاختراقات الحقيقية بينما كان لا يزال هناك وقت لاحتوائها، وتم إغلاق الإنذارات الكاذبة دون استدعاء أي شخص دون داعٍ.",
      },
      whyItMattered: {
        en: "Correctly closing a false positive is just as valuable as correctly escalating a true one: every unnecessary page trains the on-call team to trust the queue a little less.",
        ar: "إغلاق الإنذار الكاذب بشكل صحيح لا يقل قيمة عن تصعيد الحادثة الحقيقية بشكل صحيح: فكل استدعاء غير ضروري يُضعف قليلًا ثقة فريق الطوارئ بجودة قائمة التنبيهات.",
      },
      keyDecision: {
        en: "Spending the limited investigation budget on the alerts with the most misleading surface description, rather than the ones that simply sounded scariest, is what separated this shift.",
        ar: "إنفاق ميزانية التحقيق المحدودة على التنبيهات ذات الوصف الظاهري الأكثر تضليلًا، بدلًا من تلك التي بدت الأكثر إثارة للقلق فقط، هو ما ميّز هذه المناوبة.",
      },
    };
  }
  return {
    outcomeLabel: { en: "Contained, with cost", ar: "تم الاحتواء، بتكلفة" },
    headline: {
      en: "No real intrusion got through, but the shift wasn't clean.",
      ar: "لم تنجح أي اختراق حقيقي، لكن المناوبة لم تكن مثالية.",
    },
    whatHappened: {
      en: result.fatigueCount > 0
        ? "At least one false alarm was escalated and paged the on-call engineer for nothing."
        : "At least one alert was left on 'monitor' instead of being resolved with a clear decision.",
      ar: result.fatigueCount > 0
        ? "تم تصعيد إنذار كاذب واحد على الأقل، مما استدعى مهندس الطوارئ دون داعٍ."
        : "تم ترك تنبيه واحد على الأقل في وضع 'مراقبة' بدلًا من حسمه بقرار واضح.",
    },
    whyItMattered: {
      en: "Nobody got breached tonight, but repeated false pages or repeated indecision both erode the same thing: how much the rest of the organization trusts this queue.",
      ar: "لم يتعرض أحد للاختراق الليلة، لكن الاستدعاءات الكاذبة المتكررة أو التردد المتكرر كلاهما يُضعف الشيء نفسه: مدى ثقة بقية المؤسسة بهذه القائمة.",
    },
    keyDecision: {
      en: "A 'monitor' verdict is a legitimate call under real uncertainty, but it should be the exception used when investigation budget ran out, not the default for every ambiguous alert.",
      ar: "قرار 'المراقبة' خيار مشروع في حالات عدم اليقين الحقيقي، لكن ينبغي أن يكون الاستثناء عند نفاد ميزانية التحقيق، لا الخيار الافتراضي لكل تنبيه غامض.",
    },
  };
}
