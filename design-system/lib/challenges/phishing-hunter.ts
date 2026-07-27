import type { Bilingual } from "./bilingual";

export const PHISHING_HUNTER_CHALLENGE_KEY = "first_defender_spot_the_phish" as const;

export const PHISHING_HUNTER_MAX_SCORE = 100;
export const PHISHING_HUNTER_HINT_PENALTY = 8;

export type EvidenceId =
  | "sender_display_name"
| "sender_domain"
| "reply_to"
| "subject_tone"
| "link_destination"
| "attachment_name"
| "auth_headers"
| "received_chain";

export type EvidenceCategory = "sender" | "content" | "link" | "attachment" | "headers";

export interface EvidenceItem {
  id: EvidenceId;
  category: EvidenceCategory;
  hotspotLabel: Bilingual;
  revealed: Bilingual;
  finding: Bilingual;
  isSuspicious: boolean;
  weight: number;
  principle: Bilingual;
}

export const PHISHING_HUNTER_EVIDENCE: EvidenceItem[] = [
  {
    id: "sender_display_name",
    category: "sender",
    hotspotLabel: { en: "Sender name", ar: "اسم المرسل" },
    revealed: { en: '"Rami Al-Otaibi" <r.alotaibi@vendorco-support.com>', ar: '"رامي العتيبي" <r.alotaibi@vendorco-support.com>' },
    finding: {
      en: "A friendly, plausible display name. Display names are free text the sender chooses; they prove nothing about who actually sent the message.",
      ar: "اسم عرض ودود ومقنع. اسم العرض نص حر يختاره المرسل بنفسه، ولا يثبت شيئًا عن الجهة الفعلية التي أرسلت الرسالة.",
    },
    isSuspicious: false,
    weight: 8,
    principle: {
      en: "Never trust a display name alone; verify the underlying address and domain.",
      ar: "لا تثق باسم العرض وحده؛ تحقق من العنوان والنطاق الفعليين.",
    },
  },
  {
    id: "sender_domain",
    category: "sender",
    hotspotLabel: { en: "Sender domain", ar: "نطاق المرسل" },
    revealed: { en: "vendorco-support.com", ar: "vendorco-support.com" },
    finding: {
      en: "This company's real domain is vendorco.com. \"vendorco-support.com\" is a look-alike domain registered to imitate it, not the same organization.",
      ar: "النطاق الحقيقي لهذه الشركة هو vendorco.com. أما \"vendorco-support.com\" فهو نطاق مشابه تم تسجيله لتقليده، وليس تابعًا للمنظمة الفعلية.",
    },
    isSuspicious: true,
    weight: 16,
    principle: {
      en: "Look-alike domains are a primary business email compromise technique; always compare the exact domain to the organization's known one.",
      ar: "النطاقات المشابهة هي أسلوب أساسي في اختراق البريد الإلكتروني للأعمال؛ قارن دائمًا النطاق بدقة مع نطاق المنظمة المعروف.",
    },
  },
  {
    id: "reply_to",
    category: "sender",
    hotspotLabel: { en: "Reply-To address", ar: "عنوان الرد على" },
    revealed: { en: "accounts@vendorco-billing.net", ar: "accounts@vendorco-billing.net" },
    finding: {
      en: "Replies are routed to a third domain, different from both the From address and the real vendor. Legitimate mail rarely needs a Reply-To on a different domain than the sender.",
      ar: "الردود يتم توجيهها إلى نطاق ثالث مختلف عن عنوان المرسل وعن نطاق المورد الحقيقي. البريد الشرعي نادرًا ما يحتاج إلى عنوان رد مختلف عن نطاق المرسل.",
    },
    isSuspicious: true,
    weight: 16,
    principle: {
      en: "A Reply-To mismatch quietly redirects the conversation to an attacker-controlled inbox even if the From address looks fine.",
      ar: "اختلاف عنوان الرد على يعيد توجيه المحادثة بهدوء إلى صندوق بريد يتحكم به المهاجم حتى لو بدا عنوان المرسل سليمًا.",
    },
  },
  {
    id: "subject_tone",
    category: "content",
    hotspotLabel: { en: "Subject and tone", ar: "الموضوع ونبرة الرسالة" },
    revealed: {
      en: '"Urgent: Updated Bank Details for Invoice #4471" the body demands the change be confirmed within the hour "to avoid payment delay."',
      ar: '"عاجل: تحديث بيانات الحساب البنكي للفاتورة رقم 4471" يطالب نص الرسالة بتأكيد التغيير خلال ساعة "لتفادي تأخير الدفع".',
    },
    finding: {
      en: "Manufactured urgency and a financial-consequence threat, both designed to make the reader act before checking anything.",
      ar: "استعجال مصطنع وتهديد بعواقب مالية، وكلاهما مصمم لدفع القارئ للتصرف قبل التحقق من أي شيء.",
    },
    isSuspicious: true,
    weight: 12,
    principle: {
      en: "Urgency and fear are social-engineering levers, not evidence; slowing down is itself a defense.",
      ar: "الاستعجال والخوف أدوات هندسة اجتماعية وليسا دليلاً؛ التمهل بحد ذاته وسيلة دفاع.",
    },
  },
  {
    id: "link_destination",
    category: "link",
    hotspotLabel: { en: "Link destination", ar: "وجهة الرابط" },
    revealed: {
      en: 'Displayed text: "vendorco.com/invoice/4471" actual destination: "http://vendorco-support.verify-payment.io/invoice471"',
      ar: 'النص المعروض: "vendorco.com/invoice/4471" الوجهة الفعلية: "http://vendorco-support.verify-payment.io/invoice471"',
    },
    finding: {
      en: "The visible text and the real target are different domains entirely, on a third-party hosting domain, over plain HTTP.",
      ar: "النص الظاهر والوجهة الفعلية نطاقان مختلفان تمامًا، على نطاق استضافة خارجي، وعبر HTTP غير المشفر.",
    },
    isSuspicious: true,
    weight: 18,
    principle: {
      en: "Always check a link's real destination, never the display text; hovering or long-pressing reveals the true URL before clicking.",
      ar: "تحقق دائمًا من الوجهة الحقيقية للرابط وليس النص المعروض؛ المرور بالمؤشر أو الضغط المطول يكشف الرابط الحقيقي قبل النقر.",
    },
  },
  {
    id: "attachment_name",
    category: "attachment",
    hotspotLabel: { en: "Attachment", ar: "المرفق" },
    revealed: { en: "Invoice_4471.pdf.exe", ar: "Invoice_4471.pdf.exe" },
    finding: {
      en: "A double extension: it looks like a PDF at a glance, but the real, executed file type is .exe, a Windows program.",
      ar: "امتداد مزدوج: يبدو كملف PDF للوهلة الأولى، لكن نوع الملف الفعلي الذي سيُنفَّذ هو .exe، وهو برنامج تنفيذي لنظام ويندوز.",
    },
    isSuspicious: true,
    weight: 16,
    principle: {
      en: "Windows hides known file extensions by default, which is exactly what a double-extension attachment like this exploits.",
      ar: "يخفي ويندوز الامتدادات المعروفة افتراضيًا، وهذا بالضبط ما يستغله مرفق ذو امتداد مزدوج كهذا.",
    },
  },
  {
    id: "auth_headers",
    category: "headers",
    hotspotLabel: { en: "Authentication headers", ar: "ترويسات المصادقة" },
    revealed: { en: "SPF: fail   DKIM: none   DMARC: fail", ar: "SPF: fail   DKIM: none   DMARC: fail" },
    finding: {
      en: "All three sender-authentication checks fail. A legitimate message from the real vendor domain would normally pass at least SPF and DKIM.",
      ar: "فشلت جميع فحوصات مصادقة المرسل الثلاثة. الرسالة الشرعية من نطاق المورد الحقيقي تنجح عادة في اجتياز SPF و DKIM على الأقل.",
    },
    isSuspicious: true,
    weight: 14,
    principle: {
      en: "SPF, DKIM, and DMARC exist specifically to prove a message really originated from the domain it claims; three failures together is a strong technical signal, not a coincidence.",
      ar: "توجد بروتوكولات SPF و DKIM و DMARC خصيصًا لإثبات أن الرسالة صادرة فعلًا من النطاق الذي تدّعيه؛ وفشل الثلاثة معًا إشارة تقنية قوية وليس مصادفة.",
    },
  },
  {
    id: "received_chain",
    category: "headers",
    hotspotLabel: { en: "Received chain", ar: "سلسلة التسليم (Received)" },
    revealed: {
      en: "First hop originates from an IP block with no prior relationship to the vendor's known mail infrastructure.",
      ar: "أول محطة في السلسلة صادرة من نطاق عناوين IP لا علاقة سابقة له ببنية البريد المعروفة للمورد.",
    },
    finding: {
      en: "The raw delivery path confirms the message did not travel through the vendor's real mail servers at any point.",
      ar: "مسار التسليم الفعلي يؤكد أن الرسالة لم تمر عبر خوادم البريد الحقيقية للمورد في أي مرحلة.",
    },
    isSuspicious: true,
    weight: 10,
    principle: {
      en: "The Received header chain is harder to forge convincingly than the From address, which is why analysts read it bottom-up when a message is in doubt.",
      ar: "سلسلة ترويسة Received أصعب في التزوير المقنع من عنوان المرسل، ولهذا يقرأها المحللون من الأسفل للأعلى عند الشك في رسالة ما.",
    },
  },
  ];

export const PHISHING_HUNTER_EMAIL = {
  channel: "email" as const,
  fromDisplayName: "Rami Al-Otaibi",
  fromAddress: "r.alotaibi@vendorco-support.com",
  subject: {
    en: "Urgent: Updated Bank Details for Invoice #4471",
    ar: "عاجل: تحديث بيانات الحساب البنكي للفاتورة رقم 4471",
  } as Bilingual,
  body: {
    en: "Hello,\n\nOur finance team has changed banking providers. Please confirm the new account details below and update your records within the hour to avoid a delay on Invoice #4471.\n\nRegards,\nRami Al-Otaibi\nAccounts, VendorCo",
    ar: "مرحبًا،\n\nقام فريقنا المالي بتغيير مزود الخدمات المصرفية. يرجى تأكيد بيانات الحساب الجديدة أدناه وتحديث سجلاتكم خلال ساعة لتفادي تأخير الفاتورة رقم 4471.\n\nمع التحية،\nرامي العتيبي\nقسم الحسابات، VendorCo",
  } as Bilingual,
  linkDisplayText: "vendorco.com/invoice/4471",
  attachmentDisplayName: "Invoice_4471.pdf.exe",
};

export type Verdict = "phishing" | "legitimate" | "uncertain";
export type ResponseAction = "report_and_block" | "quarantine_and_verify" | "click_to_verify" | "ignore";
export type Confidence = "low" | "medium" | "high";

export const PHISHING_HUNTER_VERDICTS: Verdict[] = ["phishing", "legitimate", "uncertain"];
export const PHISHING_HUNTER_RESPONSES: ResponseAction[] = [
  "report_and_block",
  "quarantine_and_verify",
  "click_to_verify",
  "ignore",
  ];
export const PHISHING_HUNTER_CONFIDENCE_LEVELS: Confidence[] = ["low", "medium", "high"];

export const CORRECT_VERDICT: Verdict = "phishing";
export const CORRECT_RESPONSE: ResponseAction = "report_and_block";

export interface PhishingHunterSubmission {
  discoveredEvidence: EvidenceId[];
  hintsUsed: number;
  verdict: Verdict;
  response: ResponseAction;
  confidence: Confidence;
}

export interface PhishingHunterResult {
  score: number;
  xp: number;
  evidenceScore: number;
  verdictCorrect: boolean;
  responseCorrect: boolean;
  confidenceWellCalibrated: boolean;
  outcome: "contained" | "partial" | "breach";
}

const EVIDENCE_MAX_WEIGHT = PHISHING_HUNTER_EVIDENCE.reduce((sum, item) => sum + item.weight, 0);

export function computePhishingHunterScore(submission: PhishingHunterSubmission): PhishingHunterResult {
  const discoveredSuspicious = PHISHING_HUNTER_EVIDENCE.filter(
    (item) => item.isSuspicious && submission.discoveredEvidence.includes(item.id)
    );
  const discoveredWeight = discoveredSuspicious.reduce((sum, item) => sum + item.weight, 0);
  const evidenceScoreRaw = (discoveredWeight / EVIDENCE_MAX_WEIGHT) * 40;
  const evidenceScore = Math.max(0, Math.round(evidenceScoreRaw - submission.hintsUsed * PHISHING_HUNTER_HINT_PENALTY * 0.01 * 40));

const verdictCorrect = submission.verdict === CORRECT_VERDICT;
  const responseCorrect = submission.response === CORRECT_RESPONSE;

const verdictScore = verdictCorrect ? 30 : submission.verdict === "uncertain" ? 10 : 0;
  const responseScore = responseCorrect ? 30 : submission.response === "quarantine_and_verify" ? 12 : 0;

const confidenceWellCalibrated =
  (verdictCorrect && submission.confidence !== "low") || (!verdictCorrect && submission.confidence === "low");

const rawScore = evidenceScore + verdictScore + responseScore;
  const score = Math.min(PHISHING_HUNTER_MAX_SCORE, Math.max(0, Math.round(rawScore)));
  const xp = Math.round(score * 1.5);

const investigatedEnough = evidenceScore >= 20;
  const outcome: "contained" | "partial" | "breach" =
    verdictCorrect && responseCorrect && investigatedEnough
  ? "contained"
    : verdictCorrect || responseCorrect
  ? "partial"
    : "breach";

return { score, xp, evidenceScore: Math.round(evidenceScore), verdictCorrect, responseCorrect, confidenceWellCalibrated, outcome };
}

export interface ConsequenceCopy {
  outcomeLabel: Bilingual;
  headline: Bilingual;
  whatHappened: Bilingual;
  whyItMattered: Bilingual;
  keyDecision: Bilingual;
}

export function getConsequenceCopy(result: PhishingHunterResult, submission: PhishingHunterSubmission): ConsequenceCopy {
  if (result.outcome === "contained") {
    return {
      outcomeLabel: { en: "Incident contained", ar: "تم احتواء الحادثة" },
      headline: {
        en: "You correctly identified the phishing attempt and reported it before any damage occurred.",
        ar: "لقد حددت محاولة التصيد بشكل صحيح وأبلغت عنها قبل حدوث أي ضرر.",
                                   },
      whatHappened: {
        en: "The message was quarantined and the look-alike domain was blocked at the mail gateway. VendorCo's finance team was never contacted through the fraudulent channel.",
        ar: "تم حجز الرسالة وحظر النطاق المشابه على بوابة البريد. لم يتم التواصل مع فريق VendorCo المالي عبر القناة الاحتيالية إطلاقًا.",
      },
      whyItMattered: {
        en: "Reporting and blocking, rather than just deleting the message, stops the same sender from reaching other employees.",
        ar: "الإبلاغ والحظر، وليس مجرد حذف الرسالة، يمنع المرسل نفسه من الوصول إلى موظفين آخرين.",
      },
      keyDecision: {
        en: "The domain and Reply-To mismatch, together with the failed authentication headers, were enough on their own to call this phishing with high confidence.",
        ar: "كان اختلاف النطاق وعنوان الرد على، إلى جانب فشل ترويسات المصادقة، كافيًا وحده للحكم على أنها رسالة تصيد بثقة عالية.",
      },
    };
  }
  if (result.outcome === "partial") {
    const lowEvidence = result.evidenceScore < 20 && result.verdictCorrect && result.responseCorrect;
    return {
      outcomeLabel: { en: "Partially contained", ar: "تم الاحتواء جزئيًا" },
      headline: lowEvidence
      ? {
        en: "You reached the right call, but with little of the evidence actually inspected first.",
        ar: "توصلت إلى القرار الصحيح، لكن مع فحص قليل جدًا من الأدلة أولًا.",
      }
        : {
          en: submission.verdict === CORRECT_VERDICT
          ? "You correctly called this phishing, but the response chosen let the message keep circulating."
            : "The response chosen would have limited the damage, but the verdict itself was not confident enough.",
          ar: submission.verdict === CORRECT_VERDICT
          ? "لقد حكمت بشكل صحيح على أنها رسالة تصيد، لكن الإجراء المختار سمح للرسالة بالاستمرار في الانتشار."
            : "الإجراء المختار كان سيحد من الضرر، لكن الحكم نفسه لم يكن بثقة كافية.",
        },
      whatHappened: lowEvidence
      ? {
        en: "This time the guess happened to match the right response. In a real inbox, a decision made without checking the domain, the link, or the headers is a coin flip that will not always land this way.",
        ar: "هذه المرة صادف أن التخمين طابق الاستجابة الصحيحة. في صندوق بريد حقيقي، القرار المتخذ دون التحقق من النطاق أو الرابط أو الترويسات هو رهان لن يكون نتيجته دائمًا بهذا الشكل.",
      }
        : {
          en: "The immediate mailbox was safe, but without a report-and-block action the same look-alike domain can still reach other employees at VendorCo's partners.",
          ar: "كان صندوق البريد المباشر آمنًا، لكن بدون إجراء الإبلاغ والحظر لا يزال بإمكان النطاق المشابه نفسه الوصول إلى موظفين آخرين لدى شركاء VendorCo.",
        },
      whyItMattered: lowEvidence
      ? {
        en: "A verdict is only reliable when it is backed by evidence; the right answer for the wrong reason will not generalize to the next, less obvious attempt.",
        ar: "لا يكون الحكم موثوقًا إلا إذا استند إلى أدلة؛ فالإجابة الصحيحة لسبب خاطئ لن تتكرر مع المحاولة التالية الأقل وضوحًا.",
      }
        : {
          en: "A correct verdict without the right response, or the right response without real conviction in the verdict, both leave gaps an attacker can reuse.",
          ar: "الحكم الصحيح بدون الإجراء المناسب، أو الإجراء المناسب بدون قناعة حقيقية بالحكم، كلاهما يترك ثغرات يمكن للمهاجم إعادة استغلالها.",
        },
      keyDecision: lowEvidence
      ? {
        en: "Inspecting the sender domain and the link destination before deciding would have turned this from a guess into a verified call.",
        ar: "فحص نطاق المرسل ووجهة الرابط قبل اتخاذ القرار كان سيحوّل هذا من تخمين إلى قرار موثّق.",
      }
        : {
          en: "Report-and-block is the only response that removes the sender's ability to try again, not just this one message.",
          ar: "الإبلاغ والحظر هو الإجراء الوحيد الذي يزيل قدرة المرسل على المحاولة مجددًا، وليس فقط هذه الرسالة الواحدة.",
        },
    };
  }
  return {
    outcomeLabel: { en: "Breach in progress", ar: "اختراق قيد الحدوث" },
    headline: {
      en: "The banking details were updated as requested. VendorCo's next payment is now routed to the attacker's account.",
      ar: "تم تحديث بيانات الحساب البنكي كما طُلب. أصبحت دفعة VendorCo القادمة موجهة الآن إلى حساب المهاجم.",
    },
    whatHappened: {
      en: "Because the sender domain, Reply-To mismatch, and failed authentication headers were not weighed together, the message was treated as routine finance correspondence.",
      ar: "لأن اختلاف نطاق المرسل وعنوان الرد على وفشل ترويسات المصادقة لم تُقيَّم معًا، عُوملت الرسالة كمراسلة مالية روتينية.",
    },
    whyItMattered: {
      en: "Business email compromise like this one relies on exactly one hurried decision; the financial loss is rarely recoverable once the transfer clears.",
      ar: "يعتمد اختراق البريد الإلكتروني للأعمال مثل هذا على قرار واحد متسرع فقط؛ نادرًا ما يمكن استرداد الخسارة المالية بعد إتمام التحويل.",
    },
    keyDecision: {
      en: "Checking the link's real destination or the domain alone, before acting on the urgency in the subject line, would have changed this outcome.",
      ar: "التحقق من الوجهة الحقيقية للرابط أو من النطاق وحده، قبل التصرف بناءً على الاستعجال في سطر الموضوع، كان سيغيّر هذه النتيجة.",
    },
  };
}
