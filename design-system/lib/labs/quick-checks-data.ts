export type QuickCheckOption = {
  id: string;
  label: { en: string; ar: string };
  correct: boolean;
  feedback: { en: string; ar: string };
};

export type QuickCheckDef = {
  key: string;
  heading: { en: string; ar: string };
  scenario: { en: string; ar: string };
  question: { en: string; ar: string };
  options: QuickCheckOption[];
  relatedLab: { href: string; label: { en: string; ar: string } };
};

/**
 * Quick Knowledge Checks (2026-08-03): the five items that previously
 * sat under "More on the way" / "Coming soon" on the Quick Checks
 * page are now real, working micro-checks, built on the same
 * single-scenario / single-decision / immediate-feedback pattern as
 * SpotThePhishMicroCheck. Each one links back to the full Decision Lab
 * that covers its topic in depth, so a learner who wants more than a
 * 3-5 minute exercise has somewhere to go next.
 */
export const QUICK_CHECKS: QuickCheckDef[] = [
  {
    key: "firewall_placement",
    heading: { en: "Choose the correct firewall placement", ar: "اختر موضع جدار الحماية الصحيح" },
    scenario: {
      en: "Network layout:\nInternet\n   ↓\n   ???\n   ↓\nInternal LAN (finance servers, employee workstations)",
      ar: "مخطط الشبكة:\nالإنترنت\n   ↓\n   ???\n   ↓\nالشبكة المحلية الداخلية (خوادم المالية، أجهزة الموظفين)",
    },
    question: { en: "Where should the firewall go?", ar: "أين يجب وضع جدار الحماية؟" },
    options: [
      {
        id: "boundary",
        label: { en: "At the boundary, between the Internet and the internal LAN", ar: "عند الحد الفاصل، بين الإنترنت والشبكة المحلية الداخلية" },
        correct: true,
        feedback: {
          en: "Correct. The firewall's job is to filter traffic before it ever reaches internal systems, so it belongs at the boundary between the untrusted network (Internet) and the trusted one (internal LAN).",
          ar: "صحيح. مهمة جدار الحماية هي تصفية الحركة قبل وصولها إلى الأنظمة الداخلية، لذا يجب وضعه عند الحد الفاصل بين الشبكة غير الموثوقة (الإنترنت) والشبكة الموثوقة (الشبكة المحلية الداخلية).",
        },
      },
      {
        id: "workstation",
        label: { en: "On each individual employee workstation only", ar: "على كل جهاز موظف بمفرده فقط" },
        correct: false,
        feedback: {
          en: "Not quite. Endpoint firewalls are a useful extra layer, but they don't replace a perimeter firewall — without one, every workstation is directly exposed to the Internet.",
          ar: "ليس تمامًا. جدران حماية الأجهزة الطرفية طبقة إضافية مفيدة، لكنها لا تغني عن جدار حماية محيطي؛ فبدونه يكون كل جهاز معرضًا مباشرة للإنترنت.",
        },
      },
      {
        id: "none",
        label: { en: "Nowhere — internal LANs don't need one if they use strong passwords", ar: "لا مكان له — الشبكات الداخلية لا تحتاجه إذا استُخدمت كلمات مرور قوية" },
        correct: false,
        feedback: {
          en: "Not quite. Strong passwords protect accounts, not network traffic. Without a firewall, the internal LAN has no boundary control at all.",
          ar: "ليس تمامًا. كلمات المرور القوية تحمي الحسابات وليس حركة الشبكة. بدون جدار حماية، لا توجد أي ضوابط على حدود الشبكة الداخلية إطلاقًا.",
        },
      },
    ],
    relatedLab: { href: "/challenge/network-guardian", label: { en: "Practice full network defense in Network Guardian", ar: "تدرّب على الدفاع الكامل عن الشبكة في حارس الشبكة" } },
  },
  {
    key: "classify_soc_alert",
    heading: { en: "Classify one SOC alert", ar: "صنّف تنبيهًا واحدًا لمركز العمليات الأمنية" },
    scenario: {
      en: "02:14:07 — Failed login for user \"admin\" from IP 41.222.13.9 (external, unrecognized country)\n47 attempts in 60 seconds. Account not yet locked.",
      ar: "02:14:07 — محاولة دخول فاشلة للمستخدم \"admin\" من عنوان IP خارجي 41.222.13.9 (بلد غير معروف)\n47 محاولة خلال 60 ثانية. الحساب لم يُقفل بعد.",
    },
    question: { en: "How should you classify this alert?", ar: "كيف يجب تصنيف هذا التنبيه؟" },
    options: [
      {
        id: "high",
        label: { en: "High priority — likely brute-force attack", ar: "أولوية عالية — يُحتمل أنه هجوم تخمين كلمة مرور" },
        correct: true,
        feedback: {
          en: "Correct. 47 failed logins in 60 seconds from an unfamiliar external IP against a privileged account is the textbook signature of an automated brute-force attempt — it needs immediate attention before the account locks or succeeds.",
          ar: "صحيح. 47 محاولة دخول فاشلة خلال 60 ثانية من عنوان IP خارجي غير مألوف على حساب صلاحيات عالية هو النمط الكلاسيكي لهجوم تخمين آلي — يحتاج اهتمامًا فوريًا قبل أن يُقفل الحساب أو ينجح الهجوم.",
        },
      },
      {
        id: "low",
        label: { en: "Low priority — normal user mistyping their password", ar: "أولوية منخفضة — مستخدم عادي أخطأ في كتابة كلمة المرور" },
        correct: false,
        feedback: {
          en: "Not quite. A person mistyping a password produces a handful of attempts at most, not 47 in a single minute from an external IP — the volume and source rule out simple human error.",
          ar: "ليس تمامًا. الشخص الذي يخطئ في كلمة المرور يُنتج بضع محاولات على الأكثر، وليس 47 محاولة خلال دقيقة واحدة من IP خارجي — الحجم والمصدر يستبعدان الخطأ البشري البسيط.",
        },
      },
      {
        id: "info",
        label: { en: "Informational — no action needed since the account didn't lock", ar: "إعلامي فقط — لا حاجة لإجراء لأن الحساب لم يُقفل" },
        correct: false,
        feedback: {
          en: "Not quite. \"Not locked yet\" means the attack is still in progress, not that it's harmless — this is exactly when action (blocking the IP, forcing a password reset) matters most.",
          ar: "ليس تمامًا. \"لم يُقفل بعد\" تعني أن الهجوم لا يزال جاريًا، لا أنه غير ضار — وهذه بالضبط اللحظة التي يكون فيها الإجراء (حظر IP، فرض إعادة تعيين كلمة المرور) الأكثر أهمية.",
        },
      },
    ],
    relatedLab: { href: "/challenge/soc-night-shift", label: { en: "Triage a full shift of alerts in SOC Night Shift", ar: "تعامل مع نوبة كاملة من التنبيهات في نوبة مركز العمليات الليلية" } },
  },
  {
    key: "risky_permission",
    heading: { en: "Identify the risky permission", ar: "حدد الصلاحية عالية الخطورة" },
    scenario: {
      en: "A new note-taking app requests these permissions on install:\nCamera · Storage · Contacts · Location (while using app) · Device Admin (full device control)",
      ar: "يطلب تطبيق تدوين ملاحظات جديد هذه الصلاحيات عند التثبيت:\nالكاميرا · التخزين · جهات الاتصال · الموقع (أثناء الاستخدام) · مسؤول الجهاز (تحكم كامل بالجهاز)",
    },
    question: { en: "Which permission is the biggest red flag for a simple note-taking app?", ar: "أي صلاحية تُعد أكبر علامة تحذير لتطبيق تدوين ملاحظات بسيط؟" },
    options: [
      {
        id: "device_admin",
        label: { en: "Device Admin (full device control)", ar: "مسؤول الجهاز (تحكم كامل بالجهاز)" },
        correct: true,
        feedback: {
          en: "Correct. Device Admin can wipe the device, enforce lock-screen policies, and block uninstall — far beyond anything a note-taking app legitimately needs. This is the kind of over-permissioning that turns a simple app into serious risk if compromised.",
          ar: "صحيح. صلاحية مسؤول الجهاز يمكنها مسح الجهاز، وفرض سياسات قفل الشاشة، ومنع إلغاء التثبيت — وهذا يتجاوز بكثير ما يحتاجه تطبيق تدوين ملاحظات فعليًا. هذا النوع من الصلاحيات المفرطة يحوّل تطبيقًا بسيطًا إلى خطر حقيقي إذا تم اختراقه.",
        },
      },
      {
        id: "camera",
        label: { en: "Camera", ar: "الكاميرا" },
        correct: false,
        feedback: {
          en: "Not quite. Camera access is a reasonable, expected permission for a notes app that lets you attach photos — it's not the outlier here.",
          ar: "ليس تمامًا. صلاحية الكاميرا معقولة ومتوقعة لتطبيق ملاحظات يتيح إرفاق الصور — وليست الصلاحية الشاذة هنا.",
        },
      },
      {
        id: "location",
        label: { en: "Location (while using app)", ar: "الموقع (أثناء الاستخدام)" },
        correct: false,
        feedback: {
          en: "Not quite. \"While using app\" location is a common, relatively low-risk permission tier (e.g., for location-tagging a note) — it's meaningfully less concerning than full device control.",
          ar: "ليس تمامًا. صلاحية الموقع \"أثناء الاستخدام\" شائعة ومنخفضة الخطورة نسبيًا (مثل وضع علامة موقع على ملاحظة) — وهي أقل خطورة بكثير من التحكم الكامل بالجهاز.",
        },
      },
    ],
    relatedLab: { href: "/challenge/grcl-innovation", label: { en: "Weigh risk trade-offs in GRCL: Innovation Under Fire", ar: "وازن بين مخاطر القرارات في معمل الابتكار تحت الضغط" } },
  },
  {
    key: "classify_document",
    heading: { en: "Classify a document", ar: "صنّف مستندًا" },
    scenario: {
      en: "File: \"Q3_Customer_List.xlsx\"\nContains: full names, email addresses, phone numbers, and partial payment card numbers for 12,000 customers.",
      ar: "الملف: \"Q3_Customer_List.xlsx\"\nيحتوي على: أسماء كاملة، عناوين بريد إلكتروني، أرقام هواتف، وأرقام بطاقات دفع جزئية لـ 12,000 عميل.",
    },
    question: { en: "How should this document be classified?", ar: "كيف يجب تصنيف هذا المستند؟" },
    options: [
      {
        id: "restricted",
        label: { en: "Confidential / Restricted", ar: "سري / مقيّد" },
        correct: true,
        feedback: {
          en: "Correct. This file combines personal identifiers (names, emails, phone numbers) with partial payment card data — that combination demands the highest handling tier: strict access control, encryption, and no casual sharing.",
          ar: "صحيح. يجمع هذا الملف بين معرّفات شخصية (أسماء، بريد إلكتروني، هواتف) وبيانات بطاقة دفع جزئية — هذا المزيج يتطلب أعلى مستوى تعامل: ضوابط وصول صارمة، تشفير، وعدم المشاركة العرضية.",
        },
      },
      {
        id: "internal",
        label: { en: "Internal use only", ar: "للاستخدام الداخلي فقط" },
        correct: false,
        feedback: {
          en: "Not quite. \"Internal use only\" fits data that would be mildly inconvenient if leaked (like an internal org chart) — it understates the risk of exposed payment-card data, which is regulated and high-impact if breached.",
          ar: "ليس تمامًا. تصنيف \"للاستخدام الداخلي فقط\" يناسب بيانات يكون تسريبها مزعجًا بشكل بسيط (مثل هيكل تنظيمي داخلي) — وهو يقلل من خطورة تسريب بيانات بطاقات الدفع، وهي بيانات منظمة وذات تأثير كبير عند اختراقها.",
        },
      },
      {
        id: "public",
        label: { en: "Public", ar: "عام" },
        correct: false,
        feedback: {
          en: "Not quite — and this is the most dangerous option. Publishing customer PII and payment data would be a serious breach with legal and regulatory consequences.",
          ar: "ليس تمامًا — وهذا الخيار الأخطر. نشر بيانات العملاء الشخصية وبيانات الدفع سيكون خرقًا خطيرًا له تبعات قانونية وتنظيمية.",
        },
      },
    ],
    relatedLab: { href: "/challenge/data-guardian", label: { en: "Practice full data classification in Data Guardian", ar: "تدرّب على تصنيف البيانات الكامل في حارس البيانات" } },
  },
  {
    key: "incident_first_action",
    heading: { en: "Select the best incident action", ar: "اختر أفضل إجراء للحادثة" },
    scenario: {
      en: "Your laptop screen shows a ransom note. Files on the shared drive are visibly being renamed and encrypted right now, in real time.",
      ar: "تظهر على شاشة حاسوبك المحمول رسالة فدية. الملفات على القرص المشترك تُعاد تسميتها وتُشفَّر أمامك مباشرة، في الوقت الفعلي.",
    },
    question: { en: "What's the first action you should take?", ar: "ما هو أول إجراء يجب اتخاذه؟" },
    options: [
      {
        id: "disconnect",
        label: { en: "Disconnect the device from the network immediately", ar: "افصل الجهاز عن الشبكة فورًا" },
        correct: true,
        feedback: {
          en: "Correct. Cutting network access (unplug the cable, disable Wi-Fi) stops the ransomware from encrypting more files over the shared drive and from spreading to other machines — the single fastest way to limit damage before anything else.",
          ar: "صحيح. قطع الاتصال بالشبكة (فصل الكابل، تعطيل الواي فاي) يوقف برنامج الفدية عن تشفير المزيد من الملفات على القرص المشترك وعن الانتشار إلى أجهزة أخرى — أسرع طريقة للحد من الضرر قبل أي شيء آخر.",
        },
      },
      {
        id: "restart",
        label: { en: "Restart the computer", ar: "أعد تشغيل الحاسوب" },
        correct: false,
        feedback: {
          en: "Not quite. A restart doesn't stop encryption already in progress and can trigger the malware's persistence mechanism to relaunch — it also risks losing volatile evidence responders need.",
          ar: "ليس تمامًا. إعادة التشغيل لا توقف التشفير الجاري بالفعل وقد تُشغّل آلية بقاء البرنامج الخبيث من جديد — كما تُخاطر بفقدان أدلة متطايرة يحتاجها المستجيبون.",
        },
      },
      {
        id: "self_decrypt",
        label: { en: "Try to decrypt the files yourself using tools you find online", ar: "حاول فك تشفير الملفات بنفسك باستخدام أدوات تجدها عبر الإنترنت" },
        correct: false,
        feedback: {
          en: "Not quite. Encryption is still actively spreading — stopping it comes first. Untrusted \"decryptor\" tools from the internet can also be malware themselves, and this step skips notifying the incident response team.",
          ar: "ليس تمامًا. التشفير لا يزال ينتشر بفعالية — يجب إيقافه أولًا. أدوات \"فك التشفير\" غير الموثوقة من الإنترنت قد تكون هي نفسها برمجيات خبيثة، كما أن هذه الخطوة تتخطى إبلاغ فريق الاستجابة للحوادث.",
        },
      },
    ],
    relatedLab: { href: "/challenge/agent-zero", label: { en: "Run a full incident response in Agent Zero", ar: "نفّذ استجابة كاملة لحادثة في العميل صفر" } },
  },
];
