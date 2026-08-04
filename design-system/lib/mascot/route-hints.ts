import type { MascotHint } from "./mascot-context";

/**
 * Per-page fallback explanations for the Labs mascot's tap-to-explain
 * bubble. These are what the mascot shows when a lab/CTF/knowledge-check
 * page hasn't (yet) registered a more specific, stage-by-stage hint via
 * useMascotHint(). Matched by longest pathname-prefix so a more specific
 * route (e.g. "/labs/ctf/certificate") wins over a broader one
 * (e.g. "/labs/ctf" or "/labs").
 *
 * Keys are locale-stripped paths, matching what next-intl's usePathname
 * (from "@/lib/i18n/navigation") returns.
 */
const ROUTE_HINTS: Array<{ prefix: string; hint: MascotHint }> = [
  {
    prefix: "/challenge/network-guardian",
    hint: {
      title: { en: "Network Guardian", ar: "حارس الشبكة" },
      body: {
        en: "The core idea here is defense in depth: no single control should be the only thing standing between the internet and your crown-jewel data. Layer controls so one failure doesn't mean total compromise.",
        ar: "الفكرة الأساسية هنا هي الدفاع المتعدد الطبقات: لا ينبغي أن يكون أي ضابط واحد هو الحاجز الوحيد بين الإنترنت وبياناتك الأهم. رتّب الضوابط في طبقات حتى لا يؤدي فشل واحد إلى اختراق كامل.",
      },
    },
  },
  {
    prefix: "/challenge/first-defender",
    hint: {
      title: { en: "Phishing Hunter", ar: "صائد التصيّد" },
      body: {
        en: "You're practicing the same triage a real analyst does: check the sender domain, hover before you click, and ask whether the message is manufacturing urgency to stop you from thinking it through.",
        ar: "أنت تتدرب على نفس الفرز الذي يقوم به المحلل الحقيقي: تحقق من نطاق المرسل، مرّر المؤشر قبل النقر، واسأل نفسك هل تخلق الرسالة إلحاحًا لمنعك من التفكير جيدًا.",
      },
    },
  },
  {
    prefix: "/challenge/soc-night-shift",
    hint: {
      title: { en: "SOC Night Shift", ar: "الوردية الليلية لمركز العمليات" },
      body: {
        en: "A SOC analyst can't investigate every alert equally -- the skill is triage: which alerts are noise, which need a closer look, and which mean drop everything right now.",
        ar: "لا يستطيع محلل مركز العمليات التحقيق في كل تنبيه بنفس القدر -- المهارة هي الفرز: أي التنبيهات ضجيج، وأيها يحتاج فحصًا أدق، وأيها يعني ترك كل شيء والتصرف فورًا.",
      },
    },
  },
  {
    prefix: "/challenge/grcl-innovation",
    hint: {
      title: { en: "GRC: Innovation Under Fire", ar: "الحوكمة: الابتكار تحت الضغط" },
      body: {
        en: "Governance isn't about blocking the business -- it's about finding the version of a new idea that still gets shipped without creating unacceptable risk.",
        ar: "الحوكمة ليست عن عرقلة الأعمال -- بل عن إيجاد نسخة من الفكرة الجديدة يمكن إطلاقها دون خلق مخاطر غير مقبولة.",
      },
    },
  },
  {
    prefix: "/challenge/agent-zero",
    hint: {
      title: { en: "Agent Zero: AI Trust Officer", ar: "الوكيل زيرو: مسؤول الثقة في الذكاء الاصطناعي" },
      body: {
        en: "AI agents that can take real actions need the same least-privilege thinking as any other system account: only the access it truly needs, logged, and reversible.",
        ar: "وكلاء الذكاء الاصطناعي القادرون على اتخاذ إجراءات فعلية يحتاجون نفس مبدأ الحد الأدنى من الصلاحيات مثل أي حساب نظام آخر: فقط الصلاحية التي يحتاجها فعلًا، مع تسجيل وإمكانية التراجع.",
      },
    },
  },
  {
    prefix: "/challenge/data-guardian",
    hint: {
      title: { en: "Data Guardian", ar: "حارس البيانات" },
      body: {
        en: "Not all data deserves the same protection. Classifying data correctly first is what tells you which controls actually matter for it.",
        ar: "لا تستحق كل البيانات نفس مستوى الحماية. تصنيف البيانات بشكل صحيح أولًا هو ما يحدد الضوابط المهمة فعلًا لها.",
      },
    },
  },
  {
    prefix: "/labs/ctf/certificate",
    hint: {
      title: { en: "CTF Certificate", ar: "شهادة CTF" },
      body: {
        en: "This certificate is earned, not given -- it only unlocks once every flag has been captured at a genuinely passing score.",
        ar: "هذه الشهادة تُكتسب ولا تُمنح -- لا تُفتح إلا بعد التقاط جميع الأعلام بدرجة نجاح حقيقية.",
      },
    },
  },
  {
    prefix: "/labs/ctf",
    hint: {
      title: { en: "Capture the Flag", ar: "التقاط العلم" },
      body: {
        en: "Each challenge hides a flag behind a real technique -- exposed files, weak encoding, tampered logs. Look for what's slightly off, not just what's broken.",
        ar: "يخفي كل تحدٍ علمًا خلف أسلوب حقيقي -- ملفات مكشوفة، تشفير ضعيف، سجلات مُعدَّلة. ابحث عمّا هو غير طبيعي قليلًا، لا عمّا هو معطوب فقط.",
      },
    },
  },
  {
    prefix: "/labs/quick-checks",
    hint: {
      title: { en: "Quick Knowledge Check", ar: "اختبار معرفي سريع" },
      body: {
        en: "These are short, single-concept checks -- read the scenario once, trust your first instinct, and use the explanation afterward to lock the concept in.",
        ar: "هذه اختبارات قصيرة تركّز على فكرة واحدة -- اقرأ السيناريو مرة واحدة، ثق بأول انطباع لديك، واستخدم الشرح بعد ذلك لترسيخ الفكرة.",
      },
    },
  },
  {
    prefix: "/labs/decision-labs",
    hint: {
      title: { en: "Decision Labs", ar: "مختبرات القرار" },
      body: {
        en: "Every Decision Lab drops you into a realistic scenario with consequences -- there's rarely one perfectly safe choice, only better and worse trade-offs.",
        ar: "يضعك كل مختبر قرار في سيناريو واقعي له عواقب -- نادرًا ما يوجد خيار آمن تمامًا، بل مفاضلات أفضل وأسوأ فقط.",
      },
    },
  },
  {
    prefix: "/achievements",
    hint: {
      title: { en: "Achievements", ar: "الإنجازات" },
      body: {
        en: "Badges and XP track real, demonstrated skill -- each one maps back to a specific lab or CTF challenge you can revisit anytime.",
        ar: "تعكس الشارات ونقاط الخبرة مهارة حقيقية مُثبتة -- كل شارة ترتبط بمختبر أو تحدٍ محدد يمكنك العودة إليه في أي وقت.",
      },
    },
  },
  {
    prefix: "/account",
    hint: {
      title: { en: "Your Progress", ar: "تقدمك" },
      body: {
        en: "This is your full record across CyberAbeer Labs -- XP, badges, challenge history, and certificates, all in one place.",
        ar: "هذا سجلك الكامل عبر مختبرات CyberAbeer -- نقاط الخبرة، الشارات، سجل التحديات، والشهادات، كلها في مكان واحد.",
      },
    },
  },
  {
    prefix: "/labs",
    hint: {
      title: { en: "CyberAbeer Labs", ar: "مختبرات CyberAbeer" },
      body: {
        en: "I'm your Labs guide -- tap me on any lab, CTF challenge, or knowledge check for a quick explanation of the concept behind it.",
        ar: "أنا مرشدك في المختبرات -- اضغط عليّ في أي مختبر أو تحدٍ CTF أو اختبار معرفي لشرح موجز للفكرة وراءه.",
      },
    },
  },
];

const DEFAULT_HINT: MascotHint = {
  title: { en: "CyberAbeer Labs", ar: "مختبرات CyberAbeer" },
  body: {
    en: "I'm your Labs guide -- tap me on any lab, CTF challenge, or knowledge check for a quick explanation of the concept behind it.",
    ar: "أنا مرشدك في المختبرات -- اضغط عليّ في أي مختبر أو تحدٍ CTF أو اختبار معرفي لشرح موجز للفكرة وراءه.",
  },
};

export function getRouteHint(pathname: string): MascotHint {
  const match = ROUTE_HINTS.filter((entry) => pathname.startsWith(entry.prefix)).sort(
    (a, b) => b.prefix.length - a.prefix.length
  )[0];
  return match ? match.hint : DEFAULT_HINT;
}
