import type { CtfChallenge } from "./types";

/**
 * The 6 CyberAbeer CTF challenges: 3 categories (web, forensics, crypto),
 * 2 challenges each. Every challenge is now a 2-3 step chain (see
 * lib/ctf/types.ts CtfStage) rather than a single flat artifact -- the
 * player extracts a real value from each non-final stage's artifact and
 * types it in to unlock the next one, and only the final stage's
 * artifact contains the flag itself. Every encoded/hex artifact string
 * below (base64, Caesar ciphertext, hex dump bytes) was generated and
 * round-trip verified with real code before being hardcoded here. None
 * of this talks to a real backend: every artifact is static data
 * rendered client-side by components/ctf/ctf-challenge.tsx.
 */
export const CTF_CHALLENGES: CtfChallenge[] = [
  // ---------------------------------------------------------------------
  // 1. Web -- Hidden in Plain Sight (beginner) -- 2 stages
  // ---------------------------------------------------------------------
  {
    slug: "web-hidden-in-plain-sight",
    challengeKey: "ctf_web_hidden_in_plain_sight",
    category: "web",
    difficulty: "beginner",
    xpReward: 100,
    title: { en: "Hidden in Plain Sight", ar: "مخفي في العلن" },
    shortDescription: {
      en: "Read the raw HTML of a staff login page, find a hidden staging path, then read that page's source too.",
      ar: "اقرأ شيفرة HTML الخام لصفحة تسجيل دخول الموظفين، اعثر على مسار تجريبي مخفي، ثم اقرأ مصدر تلك الصفحة أيضًا.",
    },
    briefing: {
      en: "Northwind Logistics just pushed a new staff login page to production. Before it went live, a developer left themselves a note directly in the page's HTML -- and forgot to take it out. That note points somewhere else. Follow the trail.",
      ar: "أطلقت شركة Northwind Logistics للتو صفحة تسجيل دخول جديدة للموظفين إلى بيئة الإنتاج. وقبل إطلاقها، ترك أحد المطورين لنفسه ملاحظة مباشرة داخل شيفرة HTML للصفحة — ونسي إزالتها. تلك الملاحظة تشير إلى مكان آخر. تتبّع الأثر.",
    },
    flag: "CTF{HIDDEN_IN_PLAIN_SIGHT}",
    stages: [
      {
        id: "recon",
        title: { en: "Recon", ar: "استطلاع" },
        instruction: {
          en: "Open the raw page source below. Comments never render on the page but are still sent to every visitor's browser -- look for one left in by a developer.",
          ar: "افتح مصدر الصفحة الخام أدناه. التعليقات لا تظهر أبدًا على الصفحة لكنها تُرسل إلى متصفح كل زائر — ابحث عن تعليق تركه أحد المطورين.",
        },
        artifact: {
          kind: "html_source",
          pageTitle: { en: "staff-login.html — View Source", ar: "staff-login.html — عرض المصدر" },
          lines: [
            { content: "<!DOCTYPE html>" },
            { content: '<html lang="en">' },
            { content: "<head>" },
            { content: '  <meta charset="UTF-8">' },
            { content: '  <meta name="viewport" content="width=device-width, initial-scale=1.0">' },
            { content: "  <title>Staff Portal — Sign In</title>" },
            { content: '  <link rel="stylesheet" href="/assets/portal.css">' },
            { content: "</head>" },
            { content: "<body>" },
            { content: '  <div class="login-card">' },
            { content: '    <img src="/assets/logo.svg" alt="Northwind Staff Portal">' },
            { content: "    <h1>Staff Sign In</h1>" },
            { content: "    <!-- staging build still live -- token SB-2291, ask ops before removing -->" },
            { content: '    <form action="/api/staff/login" method="POST">' },
            { content: '      <label for="username">Username</label>' },
            { content: '      <input type="text" id="username" name="username" autocomplete="username">' },
            { content: '      <label for="password">Password</label>' },
            { content: '      <input type="password" id="password" name="password" autocomplete="current-password">' },
            { content: "      <button type=\"submit\">Sign In</button>" },
            { content: "    </form>" },
            { content: '    <a href="/staff/forgot-password">Forgot your password?</a>' },
            { content: "  </div>" },
            { content: "  <footer>" },
            { content: "    <p>&copy; 2026 Northwind Logistics. Internal use only.</p>" },
            { content: "  </footer>" },
            { content: "</body>" },
            { content: "</html>" },
          ],
        },
        unlockAnswer: "sb-2291",
        unlockLabel: {
          en: "Enter the staging token you found in the comment",
          ar: "أدخل رمز الإصدار التجريبي الذي وجدته في التعليق",
        },
        wrongUnlockFeedback: {
          en: "That's not it -- check the HTML comments again, right above the login form.",
          ar: "هذا ليس صحيحًا — تحقق من تعليقات HTML مرة أخرى، فوق نموذج تسجيل الدخول مباشرة.",
        },
      },
      {
        id: "staging-mirror",
        title: { en: "Staging Mirror", ar: "نسخة تجريبية" },
        instruction: {
          en: "That token unlocks an older staging build of the same page. It's a leftover build -- read its source too.",
          ar: "يفتح هذا الرمز نسخة أقدم من نفس الصفحة على بيئة الإصدار التجريبي. إنها نسخة متبقية — اقرأ مصدرها أيضًا.",
        },
        artifact: {
          kind: "html_source",
          pageTitle: { en: "staff-login-staging.html — View Source", ar: "staff-login-staging.html — عرض المصدر" },
          lines: [
            { content: "<!DOCTYPE html>" },
            { content: '<html lang="en">' },
            { content: "<head>" },
            { content: '  <meta charset="UTF-8">' },
            { content: '  <meta name="viewport" content="width=device-width, initial-scale=1.0">' },
            { content: "  <title>Staff Portal — Sign In (staging)</title>" },
            { content: '  <link rel="stylesheet" href="/assets/portal.css">' },
            { content: "</head>" },
            { content: "<body>" },
            { content: '  <div class="login-card">' },
            { content: '    <img src="/assets/logo.svg" alt="Northwind Staff Portal">' },
            { content: "    <h1>Staff Sign In</h1>" },
            { content: "    <!-- dev note: temp bypass token CTF{HIDDEN_IN_PLAIN_SIGHT} — remove before launch -->" },
            { content: '    <form action="/api/staff/login" method="POST">' },
            { content: '      <label for="username">Username</label>' },
            { content: '      <input type="text" id="username" name="username" autocomplete="username">' },
            { content: '      <label for="password">Password</label>' },
            { content: '      <input type="password" id="password" name="password" autocomplete="current-password">' },
            { content: "      <button type=\"submit\">Sign In</button>" },
            { content: "    </form>" },
            { content: '    <a href="/staff/forgot-password">Forgot your password?</a>' },
            { content: "  </div>" },
            { content: "  <footer>" },
            { content: "    <p>&copy; 2026 Northwind Logistics. Staging environment.</p>" },
            { content: "  </footer>" },
            { content: "</body>" },
            { content: "</html>" },
          ],
        },
      },
    ],
    hints: [
      {
        id: "web-hips-1",
        cost: 10,
        text: {
          en: "Comments never render on the page but are still sent to the browser in the raw response — have you looked at the raw HTML, not just what's visually on the page?",
          ar: "التعليقات لا تظهر أبدًا في الصفحة المرئية، لكنها تُرسل مع الاستجابة الخام إلى المتصفح — هل تفقّدت شيفرة HTML الخام، لا ما تراه بصريًا فقط؟",
        },
      },
    ],
    debrief: {
      headline: { en: "Comments ship to production too", ar: "التعليقات تُشحن إلى الإنتاج أيضًا" },
      whatHappened: {
        en: "A comment in the live page pointed to a leftover staging build, and that staging build's own comment held the actual flag -- left in by a developer as a personal note. Browsers never render comments, but they are still part of the raw HTML response every visitor's browser downloads — anyone who opens \"View Page Source\" or inspects the network response sees exactly what you just saw, on either page.",
        ar: "أشار تعليق في الصفحة المباشرة إلى نسخة تجريبية متبقية، وكان تعليق تلك النسخة التجريبية نفسها يحمل العلم الفعلي — تركه أحد المطورين كملاحظة شخصية. المتصفحات لا تعرض التعليقات أبدًا على الشاشة، لكنها تظل جزءًا من استجابة HTML الخام التي يُحمّلها متصفح كل زائر — وأي شخص يفتح \"عرض مصدر الصفحة\" أو يفحص استجابة الشبكة يرى بالضبط ما رأيته للتو، في كلتا الصفحتين.",
      },
      whyItMattered: {
        en: "This is a genuinely common, low-severity-but-real information disclosure: developer notes, temporary bypass tokens, internal URLs, and even credentials have shipped to production inside HTML and JavaScript comments more than once -- and forgotten staging mirrors are exactly the kind of unlinked, unmonitored surface where these notes survive longest. The fix is process, not cleverness — scrub comments in CI before deploying, tear down staging builds when they're done, and never treat \"the user can't see it\" as the same thing as \"the user can't read it\".",
        ar: "هذا نوع شائع فعليًا من الإفصاح عن المعلومات، منخفض الخطورة لكنه حقيقي: ملاحظات المطورين، ورموز التجاوز المؤقتة، والروابط الداخلية، وحتى بيانات الاعتماد، وصلت إلى بيئة الإنتاج داخل تعليقات HTML وJavaScript أكثر من مرة — والنسخ التجريبية المنسية غير المرتبطة وغير المراقبة هي بالضبط النوع من الأسطح التي تبقى فيها هذه الملاحظات لأطول فترة. الحل إجرائي وليس تقنيًا معقدًا — نظّف التعليقات ضمن خط أنابيب CI قبل النشر، وأزل النسخ التجريبية عند الانتهاء منها، ولا تعامل أبدًا \"المستخدم لا يراها\" على أنها نفس معنى \"المستخدم لا يمكنه قراءتها\".",
      },
    },
    badge: {
      key: "flag_hidden_in_plain_sight",
      name: { en: "Hidden in Plain Sight", ar: "مخفي في العلن" },
      description: { en: "Found a flag hidden in HTML source", ar: "عثر على علم مخفي في مصدر HTML" },
    },
  },

  // ---------------------------------------------------------------------
  // 2. Web -- Broken Access Control (intermediate) -- 2 stages
  // ---------------------------------------------------------------------
  {
    slug: "web-broken-access-control",
    challengeKey: "ctf_web_broken_access_control",
    category: "web",
    difficulty: "intermediate",
    xpReward: 150,
    title: { en: "Broken Access Control", ar: "تحكم وصول مكسور" },
    shortDescription: {
      en: "Enumerate the admin's user ID through a search endpoint, then use it against a billing API that trusts whatever ID it's given.",
      ar: "استكشف معرّف مستخدم المسؤول عبر نقطة بحث، ثم استخدمه ضد واجهة برمجة فوترة تثق بأي معرّف يُرسل إليها.",
    },
    briefing: {
      en: "You're logged into Northwind's billing portal and can see your own invoice, #1042. Before you go after the invoice API directly, see if the billing portal leaks anything else useful first.",
      ar: "لقد سجّلت دخولك إلى بوابة الفوترة الخاصة بـ Northwind ويمكنك رؤية فاتورتك الخاصة رقم 1042. قبل أن تهاجم واجهة برمجة الفواتير مباشرة، تحقق مما إذا كانت بوابة الفوترة تسرّب أي شيء آخر مفيد أولاً.",
    },
    flag: "CTF{BROKEN_OBJECT_LEVEL_AUTH}",
    stages: [
      {
        id: "enumerate",
        title: { en: "Enumerate Users", ar: "سرد المستخدمين" },
        instruction: {
          en: "The billing portal has a user search endpoint. Try searching for \"admin\" and see what comes back.",
          ar: "تحتوي بوابة الفوترة على نقطة بحث عن المستخدمين. جرّب البحث عن \"admin\" وانظر ما الذي ستحصل عليه.",
        },
        artifact: {
          kind: "api_console",
          endpointLabel: { en: "GET /api/users/search?name={query}", ar: "GET /api/users/search?name={query}" },
          defaultInvoiceId: "",
          records: [
            {
              id: "admin",
              json: JSON.stringify({ id: "1", username: "admin", role: "administrator" }, null, 2),
            },
          ],
          notFoundJson: JSON.stringify({ error: "No matching user" }, null, 2),
        },
        unlockAnswer: "1",
        unlockLabel: {
          en: "Enter the admin's user ID you discovered",
          ar: "أدخل معرّف مستخدم المسؤول الذي اكتشفته",
        },
        wrongUnlockFeedback: {
          en: "Search the directory for \"admin\" first, then read the id field in the JSON response.",
          ar: "ابحث في الدليل عن \"admin\" أولاً، ثم اقرأ حقل id في استجابة JSON.",
        },
      },
      {
        id: "exploit",
        title: { en: "Exploit the Invoice API", ar: "استغلال واجهة برمجة الفواتير" },
        instruction: {
          en: "You can already see your own invoice, #1042. The API that fetches an invoice takes the ID straight from the request — nothing stops you from asking for the admin's invoice ID you just found. What happens if you just... change the number?",
          ar: "يمكنك بالفعل رؤية فاتورتك الخاصة رقم 1042. تأخذ واجهة البرمجة التي تجلب الفاتورة المعرّف مباشرة من الطلب — ولا شيء يمنعك من طلب معرّف فاتورة المسؤول الذي وجدته للتو. ماذا سيحدث لو غيّرت الرقم فحسب؟",
        },
        artifact: {
          kind: "api_console",
          endpointLabel: { en: "GET /api/invoices/{id}", ar: "GET /api/invoices/{id}" },
          defaultInvoiceId: "1042",
          records: [
            {
              id: "1042",
              json: JSON.stringify(
                {
                  invoiceId: "1042",
                  owner: "you@northwind-demo.test",
                  amount: "$482.10",
                  status: "paid",
                  note: "Thanks for your business!",
                },
                null,
                2
              ),
            },
            {
              id: "1",
              json: JSON.stringify(
                {
                  invoiceId: "1",
                  owner: "admin@cyberabeer-demo.test",
                  amount: "$999,999.00",
                  status: "paid",
                  note: "CTF{BROKEN_OBJECT_LEVEL_AUTH}",
                },
                null,
                2
              ),
            },
          ],
          notFoundJson: JSON.stringify({ error: "Invoice not found" }, null, 2),
        },
      },
    ],
    hints: [
      {
        id: "web-boac-1",
        cost: 15,
        text: {
          en: "The request only proves who's logged in, it never proves the invoice actually belongs to them — what happens if you just ask for someone else's record by changing the ID?",
          ar: "الطلب يثبت فقط من قام بتسجيل الدخول، لكنه لا يثبت أبدًا أن الفاتورة تخصه فعلاً — ماذا يحدث لو طلبت ببساطة سجل شخص آخر عبر تغيير المعرّف؟",
        },
      },
    ],
    debrief: {
      headline: { en: "Your session proves who you are, not what you own", ar: "جلستك تثبت هويتك، لا ملكيتك" },
      whatHappened: {
        en: "A quick user-search leaked the admin account's ID, and changing the invoice ID from 1042 to that ID returned someone else's invoice in full, including their email and amount, because the API only checked that a valid session existed, never that the session's owner actually matched the requested invoice.",
        ar: "سرّب بحث سريع عن المستخدمين معرّف حساب المسؤول، وأدى تغيير معرّف الفاتورة من 1042 إلى ذلك المعرّف إلى إرجاع فاتورة شخص آخر بالكامل، بما في ذلك بريده الإلكتروني والمبلغ، لأن واجهة البرمجة اكتفت بالتحقق من وجود جلسة صالحة، دون أن تتحقق أبدًا من أن صاحب الجلسة هو فعلاً صاحب الفاتورة المطلوبة.",
      },
      whyItMattered: {
        en: "This is IDOR / Broken Object Level Authorization (BOLA) — OWASP API Security's #1 risk. It is one of the most common real-world API vulnerabilities because it is invisible in a functional test: the endpoint works perfectly for the legitimate user, and only fails when someone deliberately requests an object that isn't theirs, often after a small information leak (like a user search) hands them the ID to try. Every object-level endpoint needs a server-side ownership check on every request, never an assumption inferred from a valid login alone.",
        ar: "هذه ثغرة IDOR / تحكم وصول مكسور على مستوى الكائن (BOLA) — وهي المخاطرة الأولى في قائمة OWASP لأمن واجهات البرمجة. تُعد من أكثر ثغرات الواجهات البرمجية شيوعًا في الواقع لأنها غير مرئية في أي اختبار وظيفي عادي: تعمل نقطة النهاية بشكل مثالي مع المستخدم الشرعي، ولا تفشل إلا عندما يطلب شخص ما عمدًا كائنًا لا يملكه، وغالبًا بعد تسرّب معلومات بسيط (كبحث عن مستخدم) يمنحه المعرّف الذي يجرّبه. كل نقطة نهاية تتعامل مع كائن محدد تحتاج إلى فحص ملكية من جهة الخادم في كل طلب، لا أن تُستنتج الملكية بمجرد وجود جلسة دخول صالحة.",
      },
    },
    badge: {
      key: "flag_broken_access_control",
      name: { en: "Broken Access Control", ar: "تحكم وصول مكسور" },
      description: { en: "Exploited an IDOR to read another user's data", ar: "استغل ثغرة IDOR لقراءة بيانات مستخدم آخر" },
    },
  },

  // ---------------------------------------------------------------------
  // 3. Forensics -- Suspicious Log (beginner) -- 2 stages
  // ---------------------------------------------------------------------
  {
    slug: "forensics-suspicious-log",
    challengeKey: "ctf_forensics_suspicious_log",
    category: "forensics",
    difficulty: "beginner",
    xpReward: 100,
    title: { en: "Suspicious Log", ar: "سجل مشبوه" },
    shortDescription: {
      en: "Find the one log line that doesn't belong, confirm which IP sent it, then decode its hidden header.",
      ar: "اعثر على السطر الوحيد في السجل الذي لا ينتمي إلى النمط، وأكّد عنوان IP الذي أرسله، ثم فكّ ترميز ترويسته المخفية.",
    },
    briefing: {
      en: "A junior analyst flagged this access log as \"probably nothing\" during a routine review. Most of it is normal traffic — but one line doesn't quite fit the pattern. Find it first, then decode what it's really saying.",
      ar: "صنّف محلل مبتدئ هذا السجل بأنه \"على الأرجح لا شيء يستدعي القلق\" أثناء مراجعة روتينية. معظم محتواه حركة مرور اعتيادية — لكن سطرًا واحدًا لا يتوافق تمامًا مع النمط العام. اعثر عليه أولاً، ثم فكّ ترميز ما يقوله فعلاً.",
    },
    flag: "CTF{L0G_HIDDEN_IN_BASE64}",
    stages: [
      {
        id: "triage",
        title: { en: "Triage the Log", ar: "فرز السجل" },
        instruction: {
          en: "Scan the access log below. One request doesn't fit the pattern — its status line has an unusual header value instead of a normal user-agent string. Which IP sent it?",
          ar: "تصفّح سجل الوصول أدناه. طلب واحد لا يتوافق مع النمط — يحتوي سطر حالته على قيمة ترويسة غير عادية بدلاً من سلسلة وكيل مستخدم طبيعية. ما عنوان IP الذي أرسله؟",
        },
        artifact: {
          kind: "access_log",
          lines: [
            '192.168.1.14 - - [02/Aug/2026:03:11:02 +0000] "GET /account/dashboard HTTP/1.1" 200 "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"',
            '192.168.1.22 - - [02/Aug/2026:03:11:47 +0000] "POST /api/login HTTP/1.1" 200 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"',
            '10.0.4.9 - - [02/Aug/2026:03:12:15 +0000] "GET /assets/app.js HTTP/1.1" 200 "-" "Mozilla/5.0 (X11; Linux x86_64)"',
            '192.168.1.14 - - [02/Aug/2026:03:12:30 +0000] "GET /account/settings HTTP/1.1" 200 "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"',
            '10.0.4.12 - - [02/Aug/2026:03:14:07 +0000] "GET /account/settings HTTP/1.1" 200 X-Debug-Token: Q1RGe0wwR19ISURERU5fSU5fQkFTRTY0fQ==',
            '203.0.113.45 - - [02/Aug/2026:03:15:02 +0000] "GET /favicon.ico HTTP/1.1" 404 "-" "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X)"',
            '192.168.1.31 - - [02/Aug/2026:03:15:33 +0000] "POST /api/invoices HTTP/1.1" 201 "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"',
            '10.0.4.9 - - [02/Aug/2026:03:16:02 +0000] "GET /assets/style.css HTTP/1.1" 200 "-" "Mozilla/5.0 (X11; Linux x86_64)"',
            '192.168.1.14 - - [02/Aug/2026:03:16:41 +0000] "GET /account/invoices HTTP/1.1" 200 "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"',
            '198.51.100.7 - - [02/Aug/2026:03:17:19 +0000] "GET /robots.txt HTTP/1.1" 200 "-" "Googlebot/2.1 (+http://www.google.com/bot.html)"',
            '192.168.1.22 - - [02/Aug/2026:03:18:03 +0000] "GET /api/notifications HTTP/1.1" 200 "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"',
            '10.0.4.12 - - [02/Aug/2026:03:18:55 +0000] "GET /account/logout HTTP/1.1" 302 "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"',
            '203.0.113.45 - - [02/Aug/2026:03:19:10 +0000] "GET / HTTP/1.1" 200 "-" "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X)"',
            '192.168.1.31 - - [02/Aug/2026:03:20:02 +0000] "GET /api/invoices/1042 HTTP/1.1" 200 "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"',
            '10.0.4.9 - - [02/Aug/2026:03:20:47 +0000] "GET /assets/logo.svg HTTP/1.1" 200 "-" "Mozilla/5.0 (X11; Linux x86_64)"',
            '192.168.1.14 - - [02/Aug/2026:03:21:30 +0000] "GET /account/dashboard HTTP/1.1" 200 "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"',
          ],
        },
        unlockAnswer: "10.0.4.12",
        unlockLabel: { en: "Which IP address sent the suspicious request?", ar: "ما عنوان IP الذي أرسل الطلب المشبوه؟" },
        wrongUnlockFeedback: {
          en: "That IP's traffic looks normal — look for the line with an X-Debug-Token header instead of a normal status code ending.",
          ar: "حركة مرور هذا العنوان تبدو طبيعية — ابحث عن السطر الذي يحتوي على ترويسة X-Debug-Token بدلاً من نهاية رمز حالة طبيعية.",
        },
      },
      {
        id: "decode",
        title: { en: "Decode the Header", ar: "فك ترميز الترويسة" },
        instruction: {
          en: "Good catch. That line's X-Debug-Token header isn't a normal token — it's base64. Decode it below.",
          ar: "اكتشاف جيد. ترويسة X-Debug-Token في ذلك السطر ليست رمزًا عاديًا — إنها base64. فكّ ترميزها أدناه.",
        },
        artifact: {
          kind: "access_log",
          lines: [
            '10.0.4.12 - - [02/Aug/2026:03:14:07 +0000] "GET /account/settings HTTP/1.1" 200 X-Debug-Token: Q1RGe0wwR19ISURERU5fSU5fQkFTRTY0fQ==',
          ],
        },
      },
    ],
    hints: [
      {
        id: "forensics-log-1",
        cost: 10,
        text: {
          en: "One of these lines has a header value that isn't normal readable text — that's usually a sign of encoding, not a hash; try the decoder on it.",
          ar: "أحد هذه الأسطر يحتوي على قيمة ترويسة ليست نصًا عاديًا قابلاً للقراءة — هذا عادة ما يكون علامة على وجود ترميز، وليس تجزئة (hash)؛ جرّب أداة فك الترميز عليها.",
        },
      },
    ],
    debrief: {
      headline: { en: "Base64 hides from your eyes, not from a decoder", ar: "الترميز base64 يخفي عن عينيك، لا عن أداة فك الترميز" },
      whatHappened: {
        en: "One access-log line carried a custom header whose value was base64-encoded text rather than a hash or session token. Running it through a plain decoder — the same one-line operation any script or tool can do — revealed the flag in clear text.",
        ar: "احتوى أحد أسطر سجل الوصول على ترويسة مخصصة كانت قيمتها نصًا مُرمّزًا بـ base64 بدلاً من كونها تجزئة (hash) أو رمز جلسة. وعند تمريرها عبر أداة فك ترميز بسيطة — وهي عملية بسيطة يمكن لأي سكربت أو أداة القيام بها — ظهر العلم بنص واضح.",
      },
      whyItMattered: {
        en: "Attackers and malware routinely obfuscate exfiltrated data or command-and-control instructions as base64 inside otherwise ordinary-looking log fields, headers, or DNS queries, betting that a human reviewer will skim past it. Log review tooling should flag high-entropy or base64-shaped values automatically rather than relying on someone noticing a string that \"looks a little off\".",
        ar: "يقوم المهاجمون والبرمجيات الخبيثة بشكل روتيني بإخفاء البيانات المسروقة أو تعليمات القيادة والتحكم بترميز base64 داخل حقول سجلات أو ترويسات أو استعلامات DNS تبدو عادية تمامًا، مراهنين على أن المراجع البشري سيتجاوزها دون تدقيق. يجب أن تقوم أدوات مراجعة السجلات تلقائيًا بالإبلاغ عن القيم عالية العشوائية أو التي تشبه base64، بدلاً من الاعتماد على ملاحظة شخص أن نصًا ما \"يبدو غريبًا قليلاً\".",
      },
    },
    badge: {
      key: "flag_suspicious_log",
      name: { en: "Suspicious Log", ar: "سجل مشبوه" },
      description: { en: "Decoded a base64 flag hidden in a log file", ar: "فكّ تشفير علم base64 مخفي في ملف سجل" },
    },
  },

  // ---------------------------------------------------------------------
  // 4. Forensics -- The Deleted File (intermediate) -- 2 stages
  // ---------------------------------------------------------------------
  {
    slug: "forensics-deleted-file",
    challengeKey: "ctf_forensics_deleted_file",
    category: "forensics",
    difficulty: "intermediate",
    xpReward: 150,
    title: { en: "The Deleted File", ar: "الملف المحذوف" },
    shortDescription: {
      en: "Pick the right recovered fragment out of three candidates, then read its full ASCII column to reconstruct a \"deleted\" flag.",
      ar: "اختر الجزء المسترجَع الصحيح من بين ثلاثة مرشحين، ثم اقرأ عمود ASCII الكامل لإعادة بناء علم \"محذوف\".",
    },
    briefing: {
      en: "A forensic scan recovered three fragments of unallocated space from a decommissioned laptop's disk image. The files that used to live there are gone — but \"gone\" on a filesystem rarely means what people think it means. Only one fragment is worth pulling on a thread.",
      ar: "استرجع فحص جنائي ثلاثة أجزاء من مساحة غير مخصصة من صورة قرص جهاز محمول تمت إزالته من الخدمة. الملفات التي كانت موجودة هناك اختفت — لكن كلمة \"اختفت\" على نظام الملفات نادرًا ما تعني ما يظنه الناس. جزء واحد فقط يستحق المتابعة.",
    },
    flag: "CTF{DELETED_BUT_NOT_GONE}",
    stages: [
      {
        id: "locate",
        title: { en: "Locate the Fragment", ar: "تحديد الجزء" },
        instruction: {
          en: "Three fragments were recovered. Two are unallocated noise; one has readable text in its ASCII column. Check the ASCII column of each row and enter the offset of the readable one.",
          ar: "تم استرجاع ثلاثة أجزاء. اثنان منهما ضجيج غير مخصص؛ وواحد يحتوي على نص قابل للقراءة في عمود ASCII. تحقق من عمود ASCII لكل صف وأدخل إزاحة الجزء القابل للقراءة.",
        },
        artifact: {
          kind: "hex_dump",
          rows: [
            {
              offset: "00003c40",
              hexGroup1: ["0c", "03", "90", "8e", "70", "0c", "90", "fe"],
              hexGroup2: ["1b", "7f", "0c", "d3", "33", "d3", "02", "d3"],
              ascii: "....p.......3...",
            },
            {
              offset: "00003da0",
              hexGroup1: ["fe", "03", "7f", "78", "d3", "43", "54", "46"],
              hexGroup2: ["7b", "44", "45", "4c", "45", "54", "45", "44"],
              ascii: "...x.CTF{DELETED",
            },
            {
              offset: "00003fe0",
              hexGroup1: ["33", "0b", "d3", "6e", "01", "6c", "6a", "03"],
              hexGroup2: ["01", "73", "33", "a0", "90", "90", "65", "72"],
              ascii: "3..n.lj..s3...er",
            },
          ],
        },
        unlockAnswer: "00003da0",
        unlockLabel: { en: "Which offset shows readable text?", ar: "أي إزاحة تُظهر نصًا قابلاً للقراءة؟" },
        wrongUnlockFeedback: {
          en: "That offset is still unallocated noise — check the ASCII column for actual letters, not just symbols and dots.",
          ar: "هذه الإزاحة لا تزال ضجيجًا غير مخصص — ابحث عن أحرف فعلية في عمود ASCII، لا رموزًا ونقاطًا فقط.",
        },
      },
      {
        id: "extract",
        title: { en: "Extract the Full Fragment", ar: "استخراج الجزء الكامل" },
        instruction: {
          en: "Good catch. Here's the full recovered region around that offset — read the ASCII column across the rows, in order, to reconstruct the flag.",
          ar: "اكتشاف جيد. هذه هي المنطقة الكاملة المسترجعة حول تلك الإزاحة — اقرأ عمود ASCII عبر الصفوف، بالترتيب، لإعادة بناء العلم.",
        },
        artifact: {
          kind: "hex_dump",
          rows: [
            {
              offset: "00003d80",
              hexGroup1: ["0c", "03", "90", "8e", "70", "0c", "90", "fe"],
              hexGroup2: ["1b", "7f", "0c", "d3", "33", "d3", "02", "d3"],
              ascii: "....p.......3...",
            },
            {
              offset: "00003d90",
              hexGroup1: ["00", "0b", "01", "02", "90", "6d", "30", "6e"],
              hexGroup2: ["90", "63", "8e", "71", "7f", "fe", "90", "7f"],
              ascii: ".....m0n.c.q....",
            },
            {
              offset: "00003da0",
              hexGroup1: ["fe", "03", "7f", "78", "d3", "43", "54", "46"],
              hexGroup2: ["7b", "44", "45", "4c", "45", "54", "45", "44"],
              ascii: "...x.CTF{DELETED",
            },
            {
              offset: "00003db0",
              hexGroup1: ["5f", "42", "55", "54", "5f", "4e", "4f", "54"],
              hexGroup2: ["5f", "47", "4f", "4e", "45", "7d", "1b", "7f"],
              ascii: "_BUT_NOT_GONE}..",
            },
            {
              offset: "00003dc0",
              hexGroup1: ["33", "0b", "d3", "6e", "01", "6c", "6a", "03"],
              hexGroup2: ["01", "73", "33", "a0", "90", "90", "65", "72"],
              ascii: "3..n.lj..s3...er",
            },
            {
              offset: "00003dd0",
              hexGroup1: ["2f", "ff", "6e", "8e", "ff", "7f", "0c", "00"],
              hexGroup2: ["0b", "0c", "0b", "6f", "69", "03", "fe", "ff"],
              ascii: "/.n........oi...",
            },
            {
              offset: "00003de0",
              hexGroup1: ["35", "0c", "66", "67", "fe", "fe", "fe", "6c"],
              hexGroup2: ["7f", "72", "64", "3a", "0c", "6e", "a0", "75"],
              ascii: "5.fg...l.rd:.n.u",
            },
          ],
        },
      },
    ],
    hints: [
      {
        id: "forensics-deleted-1",
        cost: 15,
        text: {
          en: "Real forensic tools like strings don't care about file structure, they just pull anything that looks like readable text out of raw bytes — read the ASCII column, not the hex, and read it in row order.",
          ar: "أدوات التحليل الجنائي الحقيقية مثل strings لا تهتم ببنية الملف، بل تستخرج فقط أي شيء يشبه نصًا قابلاً للقراءة من البايتات الخام — اقرأ عمود ASCII وليس القيم السداسية عشرية، واقرأه حسب ترتيب الصفوف.",
        },
      },
    ],
    debrief: {
      headline: { en: "Deleting a file doesn't delete its bytes", ar: "حذف الملف لا يحذف بايتاته" },
      whatHappened: {
        en: "Of the three recovered fragments, only one had printable text in its ASCII column -- a quick way real triage tools use to separate noise from something worth pulling. The flag's characters were sitting in what forensic tooling calls unallocated or slack space — bytes still physically present on the disk image even though no active file currently points to them. Reading the printable-ASCII column of the full hex dump in order reconstructed the flag exactly.",
        ar: "من بين الأجزاء الثلاثة المسترجعة، كان جزء واحد فقط يحتوي على نص قابل للطباعة في عمود ASCII — وهي طريقة سريعة تستخدمها أدوات الفرز الحقيقية للتمييز بين الضجيج وما يستحق المتابعة. كانت أحرف العلم موجودة فيما تسميه أدوات التحليل الجنائي المساحة غير المخصصة أو مساحة الفائض (slack space) — بايتات لا تزال موجودة فعليًا على صورة القرص رغم أنه لا يوجد أي ملف نشط يشير إليها حاليًا. أدت قراءة عمود ASCII القابل للطباعة في التفريغ السداسي عشري الكامل بالترتيب إلى إعادة بناء العلم بدقة.",
      },
      whyItMattered: {
        en: "\"Deleting\" a file on most filesystems only removes the pointer/directory entry that says the space is in use — the underlying bytes remain until something else happens to overwrite them, sometimes for a long time. This is exactly why digital forensics can recover \"deleted\" evidence, and exactly why sensitive data needs real secure-deletion or full-disk encryption, not just pressing delete.",
        ar: "إن \"حذف\" ملف ما في معظم أنظمة الملفات يزيل فقط المؤشر أو إدخال الفهرس الذي يشير إلى أن تلك المساحة مستخدمة — أما البايتات الفعلية فتبقى موجودة إلى أن يقوم شيء آخر بالكتابة فوقها، وقد يستغرق ذلك وقتًا طويلاً أحيانًا. هذا بالضبط ما يجعل التحليل الجنائي الرقمي قادرًا على استرجاع أدلة \"محذوفة\"، وهذا بالضبط سبب حاجة البيانات الحساسة إلى حذف آمن حقيقي أو تشفير كامل للقرص، لا مجرد الضغط على زر الحذف.",
      },
    },
    badge: {
      key: "flag_deleted_file",
      name: { en: "The Deleted File", ar: "الملف المحذوف" },
      description: { en: "Recovered a flag from unallocated disk space", ar: "استرجع علمًا من مساحة قرص غير مخصصة" },
    },
  },

  // ---------------------------------------------------------------------
  // 5. Crypto -- Caesar's Mistake (beginner) -- 2 stages
  // ---------------------------------------------------------------------
  {
    slug: "crypto-caesars-mistake",
    challengeKey: "ctf_crypto_caesars_mistake",
    category: "crypto",
    difficulty: "beginner",
    xpReward: 100,
    title: { en: "Caesar's Mistake", ar: "خطأ قيصر" },
    shortDescription: {
      en: "Recover the shift from a known-plaintext crib, then use that same shift to decode the full flag.",
      ar: "استرجع الإزاحة من نص معروف يُستخدم كمفتاح تحليل، ثم استخدم نفس الإزاحة لفك تشفير العلم كاملاً.",
    },
    briefing: {
      en: "An old internal tool encrypted its config values with \"a cipher\", according to a comment left by whoever wrote it years ago. It turns out to be the oldest and weakest cipher in the book. You don't even have to brute-force all 25 shifts -- there's a shortcut sitting right there.",
      ar: "قامت أداة داخلية قديمة بتشفير قيم إعداداتها بـ\"شفرة ما\"، وفقًا لتعليق تركه من كتبها قبل سنوات. تبيّن أنها أقدم وأضعف شفرة في الكتاب. لست مضطرًا حتى لتجربة كل الإزاحات الـ25 — هناك اختصار في متناول يدك.",
    },
    flag: "CTF{CAESAR_NEVER_LEARNS}",
    stages: [
      {
        id: "crib",
        title: { en: "Known-Plaintext Crib", ar: "نص معروف كمفتاح تحليل" },
        instruction: {
          en: "Before decoding the flag, recover the shift. This tool's config always starts with the literal word CONFIG. Encrypted with the same cipher, that word becomes the ciphertext below. Slide the tool until it reads CONFIG, then enter that shift value.",
          ar: "قبل فك تشفير العلم، استرجع قيمة الإزاحة أولاً. تبدأ إعدادات هذه الأداة دائمًا بالكلمة الحرفية CONFIG. عند تشفيرها بنفس الشفرة، تصبح تلك الكلمة النص المشفر أدناه. حرّك الأداة حتى تقرأ CONFIG، ثم أدخل قيمة تلك الإزاحة.",
        },
        artifact: {
          kind: "caesar_shift",
          ciphertext: "JVUMPN",
        },
        unlockAnswer: "19",
        unlockLabel: { en: "What shift value makes CONFIG appear?", ar: "ما قيمة الإزاحة التي تُظهر كلمة CONFIG؟" },
        wrongUnlockFeedback: {
          en: "Not yet — slide the tool above until JVUMPN reads CONFIG, then enter that shift value.",
          ar: "ليس بعد — حرّك الأداة أعلاه حتى تقرأ JVUMPN ككلمة CONFIG، ثم أدخل قيمة تلك الإزاحة.",
        },
      },
      {
        id: "decode",
        title: { en: "Decode the Flag", ar: "فك تشفير العلم" },
        instruction: {
          en: "Same tool, same cipher, same shift. Slide the decoder to the shift you just found to reveal the full message.",
          ar: "نفس الأداة، نفس الشفرة، نفس الإزاحة. حرّك أداة فك التشفير إلى الإزاحة التي وجدتها للتو للكشف عن الرسالة الكاملة.",
        },
        artifact: {
          kind: "caesar_shift",
          ciphertext: "JAM{JHLZHY_ULCLY_SLHYUZ}",
        },
      },
    ],
    hints: [
      {
        id: "crypto-caesar-1",
        cost: 10,
        text: {
          en: "Caesar ciphers only have 25 possible shifts — if the crib doesn't click, just try each one; real attackers brute-force this by hand or script in seconds either way.",
          ar: "شفرات قيصر لا تملك سوى 25 إزاحة ممكنة فقط — إن لم ينجح النص المرجعي، جرّب كل واحدة منها؛ المهاجمون الحقيقيون يكتفون بتجربتها جميعًا يدويًا أو عبر سكربت في ثوانٍ على أي حال.",
        },
      },
    ],
    debrief: {
      headline: { en: "25 tries beats any cipher this simple", ar: "25 محاولة تكفي لكسر أي شفرة بهذه البساطة" },
      whatHappened: {
        en: "Both texts were produced with the same Caesar shift — every letter moved a fixed number of places through the alphabet. A known-plaintext crib (a short piece of ciphertext whose original wording you already know, CONFIG in this case) let you recover the exact shift directly instead of trying all 25; from there the same shift decoded the full flag instantly.",
        ar: "تم إنتاج كلا النصين باستخدام نفس إزاحة قيصر — حيث تُنقل كل حرف عددًا ثابتًا من المواضع عبر الأبجدية. سمح لك نص مرجعي معروف (جزء قصير من النص المشفر تعرف صياغته الأصلية مسبقًا، وهو CONFIG في هذه الحالة) باسترجاع الإزاحة الدقيقة مباشرة بدلاً من تجربة كل الإزاحات الـ25؛ ومن هناك فكّت نفس الإزاحة تشفير العلم الكامل فورًا.",
      },
      whyItMattered: {
        en: "Any single-alphabet substitution cipher, Caesar included, is trivially breakable by brute force in seconds or, faster still, by a known-plaintext attack whenever an attacker can guess or already knows a fragment of the original message — a very common situation with predictable config keys, headers, or greetings. It has no place protecting anything real. ROT13 (a Caesar shift of 13) is the same idea used honestly, as a convention to obscure spoilers or answers from a casual glance — never as a security control.",
        ar: "أي شفرة استبدال أحادية الأبجدية، بما فيها شفرة قيصر، يمكن كسرها بسهولة تامة عبر تجربة كل الاحتمالات في ثوانٍ، أو بشكل أسرع عبر هجوم النص المعروف كلما تمكن المهاجم من تخمين أو معرفة جزء من الرسالة الأصلية مسبقًا — وهو موقف شائع جدًا مع مفاتيح الإعدادات أو الترويسات أو التحيات القابلة للتنبؤ. ولا مكان لها في حماية أي شيء حقيقي. أما ROT13 (وهي إزاحة قيصر بمقدار 13) فتُستخدم بنفس الفكرة لكن بصدق وأمانة، كعرف يُستخدم لإخفاء حرق الأحداث أو الإجابات عن نظرة عابرة — وليست أبدًا وسيلة أمان حقيقية.",
      },
    },
    badge: {
      key: "flag_caesars_mistake",
      name: { en: "Caesar's Mistake", ar: "خطأ قيصر" },
      description: { en: "Brute-forced a Caesar cipher to recover the flag", ar: "كسر شفرة قيصر بتجربة كل الاحتمالات لاسترجاع العلم" },
    },
  },

  // ---------------------------------------------------------------------
  // 6. Crypto -- The Weak Key (intermediate) -- 3 stages
  // ---------------------------------------------------------------------
  {
    slug: "crypto-weak-key",
    challengeKey: "ctf_crypto_weak_key",
    category: "crypto",
    difficulty: "intermediate",
    xpReward: 150,
    title: { en: "The Weak Key", ar: "المفتاح الضعيف" },
    shortDescription: {
      en: "Call out a false claim of \"encryption\", find the real config key, then peel back two stacked encodings to recover the flag.",
      ar: "فنّد ادعاءً كاذبًا بـ\"التشفير\"، اعثر على مفتاح الإعداد الحقيقي، ثم أزل طبقتين متراكبتين من الترميز لاسترجاع العلم.",
    },
    briefing: {
      en: "A config file comment insists \"don't worry, it's encrypted.\" It isn't -- and once you know what to call that, you still need to find which key it's talking about before you can peel anything back.",
      ar: "يؤكد تعليق في ملف إعدادات أن \"لا داعي للقلق، إنه مشفّر.\" لكنه ليس كذلك — وبمجرد أن تعرف الاسم الحقيقي لهذا الأسلوب، لا تزال بحاجة إلى إيجاد المفتاح الذي يتحدث عنه قبل أن تتمكن من إزالة أي طبقة.",
    },
    flag: "CTF{ENCODING_IS_NOT_ENCRYPTION}",
    stages: [
      {
        id: "concept",
        title: { en: "Spot the Claim", ar: "حدد الادعاء" },
        instruction: {
          en: "Here's the comment left in the config file. In two words, what's it actually called when someone hides data with reversible encodings instead of real cryptography and calls it secure?",
          ar: "هذا هو التعليق المتروك في ملف الإعدادات. بكلمتين، ما الاسم الحقيقي لهذا الأسلوب عندما يُخفي شخص ما بيانات باستخدام ترميزات قابلة للعكس بدلاً من تشفير حقيقي ويدّعي أنها آمنة؟",
        },
        artifact: {
          kind: "html_source",
          pageTitle: { en: "config.env — comment", ar: "config.env — تعليق" },
          lines: [
            { content: "# NOTE: value below is encrypted, do not worry about it" },
            { content: 'session_secret = "UEdTe1JBUEJRVkFUX1ZGX0FCR19SQVBFTENHVkJBfQ=="' },
          ],
        },
        unlockAnswer: "security through obscurity",
        unlockLabel: {
          en: "What's this practice actually called? (two words)",
          ar: "ما الاسم الحقيقي لهذه الممارسة؟ (بكلمتين)",
        },
        wrongUnlockFeedback: {
          en: "Think about what encoding without a secret key is actually worth — it's a well-known phrase, two words.",
          ar: "فكّر في قيمة الترميز بدون مفتاح سري فعلي — إنها عبارة معروفة، بكلمتين.",
        },
      },
      {
        id: "locate",
        title: { en: "Locate the Config Key", ar: "تحديد مفتاح الإعداد" },
        instruction: {
          en: "Exactly right. The config file actually has three keys. Only one holds that suspicious, non-obvious value. Which key is it?",
          ar: "بالضبط. يحتوي ملف الإعدادات فعليًا على ثلاثة مفاتيح. واحد فقط منها يحمل تلك القيمة المشبوهة وغير الواضحة. ما هو ذلك المفتاح؟",
        },
        artifact: {
          kind: "html_source",
          pageTitle: { en: "config.env — Recovered", ar: "config.env — تمت الاسترجاع" },
          lines: [
            { content: "timeout_seconds = 30" },
            { content: "max_retries = 5" },
            { content: 'session_secret = "UEdTe1JBUEJRVkFUX1ZGX0FCR19SQVBFTENHVkJBfQ=="' },
          ],
        },
        unlockAnswer: "session_secret",
        unlockLabel: { en: "Which config key holds the suspicious value?", ar: "ما المفتاح الذي يحمل القيمة المشبوهة؟" },
        wrongUnlockFeedback: {
          en: "Look for the key whose value doesn't look like a plain number or word — it's the odd one out.",
          ar: "ابحث عن المفتاح الذي لا تبدو قيمته رقمًا أو كلمة عادية — إنه المختلف عن البقية.",
        },
      },
      {
        id: "decode",
        title: { en: "Peel the Layers", ar: "إزالة الطبقات" },
        instruction: {
          en: "Here's session_secret's value. Base64-decode it first, then run the result through the shift tool at shift 13 -- the same trick used for ROT13.",
          ar: "هذه هي قيمة session_secret. فكّ ترميز base64 لها أولاً، ثم مرّر النتيجة عبر أداة الإزاحة عند القيمة 13 — نفس حيلة ROT13.",
        },
        artifact: {
          kind: "stacked_encoding",
          encodedText: "UEdTe1JBUEJRVkFUX1ZGX0FCR19SQVBFTENHVkJBfQ==",
        },
      },
    ],
    hints: [
      {
        id: "crypto-weak-1",
        cost: 10,
        text: {
          en: "Base64 is not encryption, it's just a different way of writing the same bytes — decode it first and see what you get.",
          ar: "الترميز base64 ليس تشفيرًا، إنه ببساطة طريقة مختلفة لكتابة نفس البايتات — فك ترميزه أولاً وانظر ما الذي ستحصل عليه.",
        },
      },
      {
        id: "crypto-weak-2",
        cost: 15,
        requiresHintId: "crypto-weak-1",
        text: {
          en: "What you get after the first decode still isn't readable — that's a second, different kind of transformation layered underneath; you already have a tool on this page that undoes it.",
          ar: "ما ستحصل عليه بعد فك الترميز الأول لا يزال غير قابل للقراءة — هذا يعني وجود تحويل آخر مختلف موضوع تحته؛ لديك بالفعل أداة في هذه الصفحة قادرة على التراجع عنه.",
        },
      },
    ],
    debrief: {
      headline: { en: "Stacking encodings is not encryption", ar: "تكديس طبقات الترميز ليس تشفيرًا" },
      whatHappened: {
        en: "The config comment's claim of \"encrypted\" was actually security through obscurity: the value was the flag run through ROT13 and then base64-encoded on top, with no key involved at all. Once you knew which config key to target, base64-decoding it revealed ROT13'd gibberish, and running that gibberish back through the shift tool at shift 13 — the same tool used for Caesar's Mistake — recovered the flag exactly, since ROT13 is its own inverse.",
        ar: "كان ادعاء التعليق بأن القيمة \"مشفّرة\" في الواقع أمانًا من خلال الغموض: كانت القيمة هي العلم بعد تمريره عبر ROT13 ثم ترميزه بـ base64 فوق ذلك، دون وجود أي مفتاح فعلي على الإطلاق. وبمجرد معرفة مفتاح الإعداد المستهدف، كشف فك ترميز base64 عن نص مشوَّه بـ ROT13، وأدى تمرير ذلك النص المشوَّه مرة أخرى عبر أداة الإزاحة عند القيمة 13 — وهي نفس الأداة المستخدمة في تحدي \"خطأ قيصر\" — إلى استعادة العلم بدقة، لأن ROT13 هي عكس نفسها.",
      },
      whyItMattered: {
        en: "Stacking multiple non-cryptographic encodings — base64, ROT13, hex, URL-encoding, any combination — gives zero real security no matter how many layers are added: every one of them is a publicly known, reversible transformation with no secret involved. That is \"security through obscurity\", and it contrasts sharply with actual encryption, which combines a real cipher with a secret key that an attacker does not have. This artifact was deliberately not that.",
        ar: "إن تكديس عدة طبقات من الترميز غير التشفيري — base64، وROT13، والترميز السداسي عشري، وترميز URL، أو أي مزيج منها — لا يوفر أي أمان حقيقي مهما زاد عدد الطبقات: فكل واحدة منها تحويل معروف للعامة وقابل للعكس دون أي سر فعلي فيه. هذا ما يُعرف بـ\"الأمان من خلال الغموض\" (security through obscurity)، ويتناقض تمامًا مع التشفير الحقيقي الذي يجمع بين خوارزمية تشفير فعلية ومفتاح سري لا يملكه المهاجم. وهذه القطعة صُممت عمدًا لتكون بعيدة تمامًا عن ذلك.",
      },
    },
    badge: {
      key: "flag_weak_key",
      name: { en: "The Weak Key", ar: "المفتاح الضعيف" },
      description: { en: "Unwound two stacked encodings to recover the flag", ar: "فكّ طبقتين متراكبتين من الترميز لاسترجاع العلم" },
    },
  },
];

export function getCtfChallengeBySlug(slug: string): CtfChallenge | undefined {
  return CTF_CHALLENGES.find((challenge) => challenge.slug === slug);
}

export function getCtfChallengesByCategory(category: CtfChallenge["category"]): CtfChallenge[] {
  return CTF_CHALLENGES.filter((challenge) => challenge.category === category);
}


export function getCtfBadgeName(badgeKey: string, locale: "en" | "ar"): string | undefined {
    const challenge = CTF_CHALLENGES.find((c) => c.badge.key === badgeKey);
    return challenge?.badge.name[locale];
}
