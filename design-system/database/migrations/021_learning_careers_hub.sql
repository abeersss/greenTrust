-- Migration 021: Cybersecurity Careers Hub -- 7 new bilingual articles
-- =============================================================
-- "How to Start a Cybersecurity Career" and "Cybersecurity Career
-- Roadmap" are deliberately scoped to not duplicate the existing
-- "Cybersecurity for Beginners: First-Year Roadmap"
-- (013_content_seed_flagship_articles.sql, slug
-- cybersecurity-for-beginners-first-year-roadmap): that article is a
-- month-by-month plan for someone already starting; "How to Start"
-- here covers the upstream decision points (education path, first
-- job type) and "Cybersecurity Career Roadmap" covers the multi-year,
-- cross-specialization arc. All three are cross-linked, not merged.

-- =======================================================================
-- CR1. How to Start a Cybersecurity Career
-- =======================================================================
insert into articles (id, author_id, category_id, status, schema_type, difficulty, audience, reviewed_at, published_at)
select gen_random_uuid(), a.id, c.id, 'published', 'Article', 'beginner', array['students','general'], now(), now()
from authors a, categories c
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_cybersecurity_careers'
  and not exists (select 1 from article_translations t where t.locale='en' and t.slug='how-to-start-a-cybersecurity-career');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'en',
  'How to Start a Cybersecurity Career',
  'how-to-start-a-cybersecurity-career',
  'The decisions that actually matter before your first cybersecurity job: education path, entry point, and how to get real experience with no experience.',
  $c1en$
<p>Most "how to start" advice jumps straight to certifications. The decisions that matter more come earlier.</p>
<h2>Decision 1: Education path</h2>
<table class="content-comparison-table">
<thead><tr><th>Path</th><th>Best for</th><th>Tradeoff</th></tr></thead>
<tbody>
<tr><td>Degree (CS, IT, cybersecurity)</td><td>Those who want breadth and a traditional hiring filter to clear easily</td><td>Slower, more expensive, not strictly required by most employers</td></tr>
<tr><td>Bootcamp / intensive program</td><td>Career changers wanting a fast, structured on-ramp</td><td>Quality varies widely; vet the specific program's outcomes</td></tr>
<tr><td>Self-taught + certifications</td><td>Self-motivated learners, especially those already in adjacent IT roles</td><td>Requires more discipline; no built-in peer network or credential recognition</td></tr>
</tbody>
</table>
<h2>Decision 2: Entry point</h2>
<p>Very few people are hired directly into "cybersecurity" as a first job. Common real entry points: IT helpdesk/support, sysadmin or network administration, software development, or a SOC analyst tier-1 role. Each builds different foundational knowledge that later security work depends on -- helpdesk builds troubleshooting and user-facing communication, sysadmin builds infrastructure literacy, development builds an understanding of how the things you'll later secure are actually built.</p>
<div class="content-callout">
  <div class="content-callout-title">Dr. Abeer Explains</div>
  <p>The "no experience for an entry-level job" complaint usually means "no cybersecurity-titled experience." Adjacent IT experience is not a detour -- it is often exactly what makes a security analyst effective, because they already understand how the systems they are protecting actually behave under normal operation.</p>
</div>
<h2>Decision 3: Get real signal, not just credentials</h2>
<div class="content-checklist">
<ul>
<li>Build a home lab and document what you built (a public writeup is a portfolio, not just practice)</li>
<li>Work through structured practice -- CyberAbeer's <a href="/labs">Decision Labs</a> and Quick Challenges are built for exactly this stage</li>
<li>Contribute to CTFs or open-source security tooling if genuinely interested, not just for the resume line</li>
<li>Talk to people already in the specific role you want -- roadmap details differ a lot between SOC, GRC, and engineering paths</li>
</ul>
</div>
<p>For the full multi-year picture once you have started, see the <a href="/insights/cybersecurity-career-roadmap">Cybersecurity Career Roadmap</a>. For a structured first-year plan, see <a href="/insights/cybersecurity-for-beginners-first-year-roadmap">Cybersecurity for Beginners: First-Year Roadmap</a>.</p>
  $c1en$,
  'How to Start a Cybersecurity Career | CyberAbeer',
  'How to start a cybersecurity career: choosing an education path, realistic entry points, and how to build real signal with no prior experience.',
  5
from articles art
join authors a on a.id = art.author_id
join categories c on c.id = art.category_id
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_cybersecurity_careers'
  and exists (select 1 from article_translations t2 where t2.article_id = art.id and t2.locale='en' and t2.slug='how-to-start-a-cybersecurity-career')
  and not exists (select 1 from article_translations t3 where t3.article_id = art.id and t3.locale='en');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'ar',
  'كيف تبدأ مهنة في الأمن السيبراني',
  'كيف-تبدأ-مهنة-في-الأمن-السيبراني',
  'القرارات المهمة فعلاً قبل وظيفتك الأولى في الأمن السيبراني: مسار التعليم، ونقطة الدخول، وكيف تبني خبرة حقيقية دون خبرة سابقة.',
  $c1ar$
<p>معظم نصائح "كيف تبدأ" تقفز مباشرة إلى الشهادات. القرارات الأهم تأتي قبل ذلك.</p>
<h2>القرار الأول: مسار التعليم</h2>
<table class="content-comparison-table">
<thead><tr><th>المسار</th><th>الأنسب لـ</th><th>المقايضة</th></tr></thead>
<tbody>
<tr><td>شهادة جامعية (علوم حاسوب، تقنية معلومات، أمن سيبراني)</td><td>من يريد اتساعاً في المعرفة ومرشح توظيف تقليدي سهل الاجتياز</td><td>أبطأ وأكثر تكلفة، وليست مطلوبة بشكل صارم من معظم أصحاب العمل</td></tr>
<tr><td>معسكر تدريبي مكثف</td><td>المتحولون المهنيون الراغبون في بداية سريعة ومنظمة</td><td>الجودة تتفاوت كثيراً؛ تحقق من نتائج البرنامج المحدد</td></tr>
<tr><td>التعلم الذاتي + الشهادات</td><td>المتعلمون ذاتيو الدافع، خاصة العاملون بالفعل في أدوار تقنية معلومات مجاورة</td><td>يتطلب انضباطاً أكبر؛ لا شبكة أقران مدمجة أو اعتراف تلقائي بالشهادة</td></tr>
</tbody>
</table>
<h2>القرار الثاني: نقطة الدخول</h2>
<p>قلة قليلة يُوظَّفون مباشرة في "الأمن السيبراني" كوظيفة أولى. نقاط الدخول الشائعة فعلياً: دعم/مكتب مساعدة تقنية المعلومات، أو إدارة الأنظمة أو الشبكات، أو تطوير البرمجيات، أو دور محلل مركز عمليات أمنية من المستوى الأول. كل منها يبني معرفة أساسية مختلفة يعتمد عليها عمل الأمن لاحقاً -- مكتب المساعدة يبني مهارات استكشاف الأخطاء والتواصل مع المستخدمين، وإدارة الأنظمة تبني إلماماً بالبنية التحتية، والتطوير يبني فهماً لكيفية بناء الأشياء التي ستؤمّنها لاحقاً فعلياً.</p>
<div class="content-callout">
  <div class="content-callout-title">د. عبير توضح</div>
  <p>شكوى "لا خبرة لوظيفة مبتدئ" تعني عادة "لا خبرة بمسمى أمن سيبراني". الخبرة في تقنية المعلومات المجاورة ليست التفافاً -- بل غالباً ما تجعل محلل الأمن فعالاً بالضبط، لأنه يفهم بالفعل كيف تتصرف الأنظمة التي سيحميها فعلياً في التشغيل العادي.</p>
</div>
<h2>القرار الثالث: احصل على إشارة حقيقية لا شهادات فقط</h2>
<div class="content-checklist">
<ul>
<li>ابنِ مختبراً منزلياً ووثّق ما بنيته (التقرير العلني معرض أعمال لا مجرد تدريب)</li>
<li>اعمل من خلال تدريب منظم -- مختبرات القرار وتحديات CyberAbeer السريعة مصممة تحديداً لهذه المرحلة</li>
<li>ساهم في مسابقات التقاط العلم أو أدوات الأمن مفتوحة المصدر إن كنت مهتماً فعلياً، لا لمجرد سطر في السيرة الذاتية</li>
<li>تحدث إلى أشخاص يعملون بالفعل في الدور الذي تريده تحديداً -- تفاصيل خارطة الطريق تختلف كثيراً بين مسارات مركز العمليات والحوكمة والهندسة</li>
</ul>
</div>
<p>للصورة الكاملة متعددة السنوات بمجرد أن تبدأ، راجع <a href="/insights/cybersecurity-career-roadmap">خارطة طريق المسار المهني في الأمن السيبراني</a>. لخطة منظمة للسنة الأولى، راجع <a href="/insights/cybersecurity-for-beginners-first-year-roadmap">الأمن السيبراني للمبتدئين: خارطة طريق السنة الأولى</a>.</p>
  $c1ar$,
  'كيف تبدأ مهنة في الأمن السيبراني | CyberAbeer',
  'كيف تبدأ مهنة في الأمن السيبراني: اختيار مسار التعليم ونقاط الدخول الواقعية وكيفية بناء إشارة حقيقية دون خبرة سابقة.',
  5
from articles art
join authors a on a.id = art.author_id
join categories c on c.id = art.category_id
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_cybersecurity_careers'
  and exists (select 1 from article_translations t2 where t2.article_id = art.id and t2.locale='en' and t2.slug='how-to-start-a-cybersecurity-career')
  and not exists (select 1 from article_translations t3 where t3.article_id = art.id and t3.locale='ar');

-- =======================================================================
-- CR2. Cybersecurity Career Roadmap
-- =======================================================================
insert into articles (id, author_id, category_id, status, schema_type, difficulty, audience, reviewed_at, published_at)
select gen_random_uuid(), a.id, c.id, 'published', 'Article', 'beginner', array['students','professionals','general'], now(), now()
from authors a, categories c
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_cybersecurity_careers'
  and not exists (select 1 from article_translations t where t.locale='en' and t.slug='cybersecurity-career-roadmap');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'en',
  'Cybersecurity Career Roadmap',
  'cybersecurity-career-roadmap',
  'The multi-year shape of a cybersecurity career: entry-level, mid-level specialization, and senior/leadership tracks, across the major disciplines.',
  $c2en$
<p>Cybersecurity is not one career -- it is a set of related disciplines that fork early and rarely fully merge back together. This roadmap shows the shared entry stage and where paths diverge.</p>
<table class="content-decision-table">
<thead><tr><th>Stage</th><th>Typical roles</th><th>Focus</th></tr></thead>
<tbody>
<tr><td>Entry (0-2 yrs)</td><td>SOC Analyst Tier 1, IT/security support, junior GRC analyst</td><td>Learn how systems and controls actually behave; build fundamentals</td></tr>
<tr><td>Specialization (2-5 yrs)</td><td>SOC Tier 2/3, security engineer, GRC analyst, IT auditor, pen tester</td><td>Pick a discipline; depth over breadth; first certifications (Security+, CySA+, or discipline-specific)</td></tr>
<tr><td>Senior IC or lead (5-8 yrs)</td><td>Senior analyst, security architect, lead auditor, GRC manager</td><td>Own a domain end-to-end; mentor juniors; CISSP/CISM-level certifications become relevant</td></tr>
<tr><td>Leadership (8+ yrs)</td><td>Security manager, Director of GRC, CISO track</td><td>Cross-functional influence, budget/resourcing, board-level communication</td></tr>
</tbody>
</table>
<h2>Two broad tracks after entry level</h2>
<p>Most careers eventually lean toward one of two broad tracks: <strong>technical</strong> (SOC, engineering, penetration testing, incident response -- hands-on with systems) or <strong>GRC</strong> (governance, risk, compliance, audit -- process, policy, and organizational risk). See <a href="/insights/technical-cybersecurity-vs-grc-careers">Technical Cybersecurity vs GRC Careers</a> for how to decide between them. Neither track is "more real" security work -- they solve different halves of the same problem.</p>
<p>For discipline-specific detail, see the <a href="/insights/soc-analyst-career-roadmap">SOC Analyst Career Roadmap</a>, <a href="/insights/grc-career-roadmap">GRC Career Roadmap</a>, and <a href="/insights/how-to-become-a-cybersecurity-auditor">How to Become a Cybersecurity Auditor</a>.</p>
  $c2en$,
  'Cybersecurity Career Roadmap | CyberAbeer',
  'The multi-year cybersecurity career roadmap: entry-level, specialization, senior, and leadership stages across technical and GRC tracks.',
  5
from articles art
join authors a on a.id = art.author_id
join categories c on c.id = art.category_id
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_cybersecurity_careers'
  and exists (select 1 from article_translations t2 where t2.article_id = art.id and t2.locale='en' and t2.slug='cybersecurity-career-roadmap')
  and not exists (select 1 from article_translations t3 where t3.article_id = art.id and t3.locale='en');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'ar',
  'خارطة طريق المسار المهني في الأمن السيبراني',
  'خارطة-طريق-المسار-المهني-في-الأمن-السيبراني',
  'الشكل متعدد السنوات لمهنة الأمن السيبراني: مستوى الدخول، والتخصص في المستوى المتوسط، والمسارات القيادية العليا، عبر التخصصات الرئيسية.',
  $c2ar$
<p>الأمن السيبراني ليس مهنة واحدة -- بل مجموعة تخصصات مترابطة تتفرع مبكراً ونادراً ما تندمج مجدداً بالكامل. توضح خارطة الطريق هذه مرحلة الدخول المشتركة وأين تتباعد المسارات.</p>
<table class="content-decision-table">
<thead><tr><th>المرحلة</th><th>الأدوار النموذجية</th><th>التركيز</th></tr></thead>
<tbody>
<tr><td>الدخول (0-2 سنة)</td><td>محلل مركز عمليات أمنية مستوى أول، دعم تقنية معلومات/أمن، محلل حوكمة ومخاطر وامتثال مبتدئ</td><td>تعلّم كيف تتصرف الأنظمة والضوابط فعلياً؛ بناء الأساسيات</td></tr>
<tr><td>التخصص (2-5 سنوات)</td><td>مركز عمليات مستوى 2/3، مهندس أمن، محلل حوكمة ومخاطر وامتثال، مدقق تقنية معلومات، مختبر اختراق</td><td>اختيار تخصص؛ العمق قبل الاتساع؛ أولى الشهادات (+Security أو +CySA أو شهادات خاصة بالتخصص)</td></tr>
<tr><td>خبير أول أو قائد فريق (5-8 سنوات)</td><td>محلل أول، مهندس معماري أمن، مدقق رئيسي، مدير حوكمة ومخاطر وامتثال</td><td>امتلاك مجال كامل؛ توجيه المبتدئين؛ تصبح شهادات CISSP/CISM ذات صلة</td></tr>
<tr><td>القيادة (8+ سنوات)</td><td>مدير أمن، مدير الحوكمة والمخاطر والامتثال، مسار كبير مسؤولي أمن المعلومات</td><td>تأثير متعدد الوظائف، الميزانية والموارد، التواصل على مستوى مجلس الإدارة</td></tr>
</tbody>
</table>
<h2>مساران عريضان بعد مستوى الدخول</h2>
<p>تميل معظم المسارات المهنية في النهاية إلى أحد مسارين عريضين: <strong>تقني</strong> (مركز العمليات، الهندسة، اختبار الاختراق، الاستجابة للحوادث -- عملي مع الأنظمة) أو <strong>الحوكمة والمخاطر والامتثال</strong> (الحوكمة والمخاطر والامتثال والتدقيق -- العملية والسياسة ومخاطر المؤسسة). راجع <a href="/insights/technical-cybersecurity-vs-grc-careers">الأمن السيبراني التقني مقابل مهن الحوكمة والمخاطر والامتثال</a> لمعرفة كيفية الاختيار بينهما. لا يُعد أي مسار "عملاً أمنياً أكثر واقعية" -- كلاهما يحل نصفاً مختلفاً من المشكلة ذاتها.</p>
<p>لتفاصيل خاصة بكل تخصص، راجع <a href="/insights/soc-analyst-career-roadmap">خارطة طريق محلل مركز العمليات الأمنية</a>، و<a href="/insights/grc-career-roadmap">خارطة طريق الحوكمة والمخاطر والامتثال</a>، و<a href="/insights/how-to-become-a-cybersecurity-auditor">كيف تصبح مدقق أمن سيبراني</a>.</p>
  $c2ar$,
  'خارطة طريق المسار المهني في الأمن السيبراني | CyberAbeer',
  'خارطة طريق المسار المهني متعدد السنوات في الأمن السيبراني: مراحل الدخول والتخصص والأول والقيادة عبر المسارين التقني والحوكمي.',
  5
from articles art
join authors a on a.id = art.author_id
join categories c on c.id = art.category_id
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_cybersecurity_careers'
  and exists (select 1 from article_translations t2 where t2.article_id = art.id and t2.locale='en' and t2.slug='cybersecurity-career-roadmap')
  and not exists (select 1 from article_translations t3 where t3.article_id = art.id and t3.locale='ar');

-- =======================================================================
-- CR3. SOC Analyst Career Roadmap
-- =======================================================================
insert into articles (id, author_id, category_id, status, schema_type, difficulty, audience, reviewed_at, published_at)
select gen_random_uuid(), a.id, c.id, 'published', 'Article', 'intermediate', array['students','professionals'], now(), now()
from authors a, categories c
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_cybersecurity_careers'
  and not exists (select 1 from article_translations t where t.locale='en' and t.slug='soc-analyst-career-roadmap');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'en',
  'SOC Analyst Career Roadmap',
  'soc-analyst-career-roadmap',
  'From Tier 1 alert triage to SOC leadership: the tiers, skills, and typical timeline of a Security Operations Center career.',
  $c3en$
<table class="content-comparison-table">
<thead><tr><th>Tier</th><th>What they do</th><th>Core skill</th></tr></thead>
<tbody>
<tr><td>Tier 1</td><td>Triage alerts, follow runbooks, escalate confirmed incidents</td><td>Pattern recognition, tooling familiarity (SIEM), discipline under alert volume</td></tr>
<tr><td>Tier 2</td><td>Deeper investigation, correlate across data sources, tune detection rules</td><td>Log analysis depth, understanding attacker techniques (MITRE ATT&amp;CK)</td></tr>
<tr><td>Tier 3 / Threat Hunter</td><td>Proactive hunting, complex incident response, detection engineering</td><td>Independent hypothesis-driven investigation, scripting/automation</td></tr>
<tr><td>SOC Lead / Manager</td><td>Team performance, process design, escalation to leadership</td><td>People management, metrics, cross-team coordination</td></tr>
</tbody>
</table>
<h2>Realistic timeline and traps</h2>
<p>Tier 1 to Tier 2 typically takes 1-2 years of genuinely engaged work -- not just time served, but demonstrated ability to investigate beyond the runbook. A common trap is staying in Tier 1 too long at an organization that does not invest in analyst development; if promotion and skill growth stall past 18-24 months, moving employers is often more effective than waiting.</p>
<div class="content-checklist">
<ul>
<li>Practice log analysis and alert triage in a realistic setting -- CyberAbeer's SOC Night Shift lab (coming soon) is built for exactly this</li>
<li>Learn one SIEM deeply rather than several shallowly</li>
<li>Study MITRE ATT&amp;CK as a shared vocabulary for attacker behavior, not just a reference chart</li>
<li>Security+ or CySA+ are reasonable early certifications; GCIH/GCFA become relevant at Tier 2/3</li>
</ul>
</div>
  $c3en$,
  'SOC Analyst Career Roadmap | CyberAbeer',
  'The SOC analyst career path from Tier 1 alert triage through Tier 3 threat hunting to SOC leadership, with realistic timelines and skills.',
  4
from articles art
join authors a on a.id = art.author_id
join categories c on c.id = art.category_id
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_cybersecurity_careers'
  and exists (select 1 from article_translations t2 where t2.article_id = art.id and t2.locale='en' and t2.slug='soc-analyst-career-roadmap')
  and not exists (select 1 from article_translations t3 where t3.article_id = art.id and t3.locale='en');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'ar',
  'خارطة طريق مهنة محلل مركز العمليات الأمنية',
  'خارطة-طريق-مهنة-محلل-مركز-العمليات-الأمنية',
  'من فرز التنبيهات في المستوى الأول إلى قيادة مركز العمليات: المستويات والمهارات والجدول الزمني النموذجي لمهنة مركز العمليات الأمنية.',
  $c3ar$
<table class="content-comparison-table">
<thead><tr><th>المستوى</th><th>ماذا يفعلون</th><th>المهارة الأساسية</th></tr></thead>
<tbody>
<tr><td>المستوى الأول</td><td>فرز التنبيهات، اتباع الإجراءات المعيارية، تصعيد الحوادث المؤكدة</td><td>التعرف على الأنماط، الإلمام بالأدوات (SIEM)، الانضباط تحت ضغط حجم التنبيهات</td></tr>
<tr><td>المستوى الثاني</td><td>تحقيق أعمق، الربط بين مصادر البيانات، ضبط قواعد الكشف</td><td>عمق تحليل السجلات، فهم تقنيات المهاجمين (MITRE ATT&amp;CK)</td></tr>
<tr><td>المستوى الثالث / صائد التهديدات</td><td>الصيد الاستباقي، الاستجابة المعقدة للحوادث، هندسة الكشف</td><td>تحقيق مستقل قائم على الفرضيات، البرمجة النصية والأتمتة</td></tr>
<tr><td>قائد/مدير مركز العمليات</td><td>أداء الفريق، تصميم العمليات، التصعيد للقيادة</td><td>إدارة الأفراد، المقاييس، التنسيق بين الفرق</td></tr>
</tbody>
</table>
<h2>جدول زمني واقعي وأخطاء شائعة</h2>
<p>الانتقال من المستوى الأول إلى الثاني يستغرق عادة 1-2 سنة من العمل المنخرط فعلياً -- لا مجرد قضاء الوقت، بل إثبات قدرة على التحقيق تتجاوز الإجراء المعياري. الخطأ الشائع هو البقاء في المستوى الأول طويلاً في مؤسسة لا تستثمر في تطوير المحللين؛ فإذا توقفت الترقية ونمو المهارات بعد 18-24 شهراً، فغالباً ما يكون تغيير جهة العمل أكثر فعالية من الانتظار.</p>
<div class="content-checklist">
<ul>
<li>تدرّب على تحليل السجلات وفرز التنبيهات في بيئة واقعية -- مختبر "المناوبة الليلية لمركز العمليات" من CyberAbeer (قريباً) مصمم تحديداً لهذا</li>
<li>تعلّم نظام SIEM واحداً بعمق بدلاً من عدة أنظمة بشكل سطحي</li>
<li>ادرس MITRE ATT&amp;CK كمفردات مشتركة لسلوك المهاجمين، لا كمخطط مرجعي فقط</li>
<li>+Security أو +CySA شهادات مبكرة معقولة؛ تصبح GCIH/GCFA ذات صلة في المستوى الثاني/الثالث</li>
</ul>
</div>
  $c3ar$,
  'خارطة طريق مهنة محلل مركز العمليات الأمنية | CyberAbeer',
  'مسار مهنة محلل مركز العمليات الأمنية من فرز التنبيهات في المستوى الأول إلى صيد التهديدات في المستوى الثالث والقيادة، بجداول زمنية واقعية.',
  4
from articles art
join authors a on a.id = art.author_id
join categories c on c.id = art.category_id
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_cybersecurity_careers'
  and exists (select 1 from article_translations t2 where t2.article_id = art.id and t2.locale='en' and t2.slug='soc-analyst-career-roadmap')
  and not exists (select 1 from article_translations t3 where t3.article_id = art.id and t3.locale='ar');

-- =======================================================================
-- CR4. GRC Career Roadmap
-- =======================================================================
insert into articles (id, author_id, category_id, status, schema_type, difficulty, audience, reviewed_at, published_at)
select gen_random_uuid(), a.id, c.id, 'published', 'Article', 'intermediate', array['students','professionals'], now(), now()
from authors a, categories c
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_cybersecurity_careers'
  and not exists (select 1 from article_translations t where t.locale='en' and t.slug='grc-career-roadmap');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'en',
  'GRC Career Roadmap',
  'grc-career-roadmap',
  'From GRC analyst to CISO: the roles, skills, and certifications that shape a governance, risk, and compliance career.',
  $c4en$
<table class="content-comparison-table">
<thead><tr><th>Stage</th><th>Typical role</th><th>Core skill</th></tr></thead>
<tbody>
<tr><td>Entry</td><td>GRC Analyst / Compliance Analyst</td><td>Framework literacy (ISO 27001, NIST, SOC 2), evidence collection, control testing</td></tr>
<tr><td>Mid</td><td>GRC Specialist / Risk Analyst / Internal Auditor</td><td>Risk assessment, control design evaluation, cross-team facilitation</td></tr>
<tr><td>Senior</td><td>GRC Manager / Compliance Manager</td><td>Program ownership, audit management, board/executive reporting</td></tr>
<tr><td>Leadership</td><td>Director of GRC / CISO (governance-track)</td><td>Enterprise risk strategy, regulatory relationships, budget ownership</td></tr>
</tbody>
</table>
<h2>What makes GRC different to grow in</h2>
<p>Unlike technical security roles where depth in one tool or technique is a clear ladder, GRC growth is largely about widening organizational influence and judgment -- knowing which risks actually matter to a specific business, and being able to communicate that persuasively to people who do not have a security background.</p>
<div class="content-checklist">
<ul>
<li>CISSP or CISM become genuinely relevant by the mid-to-senior stage (see <a href="/insights/cissp-vs-cism">CISSP vs CISM</a> for which to prioritize)</li>
<li>ISO 27001 lead implementer/auditor training is valuable for hands-on ISMS work</li>
<li>Practice reasoning about tradeoffs, not just frameworks -- CyberAbeer's Decision Labs are built around exactly this kind of judgment</li>
<li>Writing and presentation skills matter more in GRC than in most technical security roles -- most of the job is translating risk into decisions other people make</li>
</ul>
</div>
  $c4en$,
  'GRC Career Roadmap | CyberAbeer',
  'The GRC career path from analyst to CISO: roles, skills, and certifications (CISSP, CISM, ISO 27001) at each stage.',
  4
from articles art
join authors a on a.id = art.author_id
join categories c on c.id = art.category_id
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_cybersecurity_careers'
  and exists (select 1 from article_translations t2 where t2.article_id = art.id and t2.locale='en' and t2.slug='grc-career-roadmap')
  and not exists (select 1 from article_translations t3 where t3.article_id = art.id and t3.locale='en');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'ar',
  'خارطة طريق مهنة الحوكمة والمخاطر والامتثال',
  'خارطة-طريق-مهنة-الحوكمة-والمخاطر-والامتثال',
  'من محلل حوكمة ومخاطر وامتثال إلى كبير مسؤولي أمن المعلومات: الأدوار والمهارات والشهادات التي تشكّل مهنة الحوكمة والمخاطر والامتثال.',
  $c4ar$
<table class="content-comparison-table">
<thead><tr><th>المرحلة</th><th>الدور النموذجي</th><th>المهارة الأساسية</th></tr></thead>
<tbody>
<tr><td>الدخول</td><td>محلل حوكمة ومخاطر وامتثال / محلل امتثال</td><td>الإلمام بالأطر (ISO 27001، NIST، SOC 2)، جمع الأدلة، اختبار الضوابط</td></tr>
<tr><td>المتوسطة</td><td>أخصائي حوكمة ومخاطر وامتثال / محلل مخاطر / مدقق داخلي</td><td>تقييم المخاطر، تقييم تصميم الضوابط، التيسير بين الفرق</td></tr>
<tr><td>الأولى</td><td>مدير حوكمة ومخاطر وامتثال / مدير امتثال</td><td>امتلاك البرنامج، إدارة التدقيق، رفع التقارير للمجلس/التنفيذيين</td></tr>
<tr><td>القيادة</td><td>مدير الحوكمة والمخاطر والامتثال / كبير مسؤولي أمن المعلومات (مسار حوكمي)</td><td>استراتيجية مخاطر المؤسسة، العلاقات التنظيمية، امتلاك الميزانية</td></tr>
</tbody>
</table>
<h2>ما الذي يجعل النمو في الحوكمة والمخاطر والامتثال مختلفاً</h2>
<p>على عكس الأدوار الأمنية التقنية حيث يكون العمق في أداة أو تقنية واحدة سلماً واضحاً، يتمحور نمو الحوكمة والمخاطر والامتثال إلى حد كبير حول توسيع التأثير التنظيمي والحكم -- معرفة أي المخاطر تهم فعلاً عملاً محدداً، والقدرة على التواصل بذلك بإقناع مع من لا خلفية أمنية لديهم.</p>
<div class="content-checklist">
<ul>
<li>تصبح CISSP أو CISM ذات صلة فعلية بحلول المرحلة المتوسطة إلى الأولى (راجع <a href="/insights/cissp-vs-cism">CISSP مقابل CISM</a> لمعرفة أيهما تُعطي الأولوية له)</li>
<li>تدريب المنفّذ/المدقق الرئيسي لـ ISO 27001 قيّم للعمل العملي على نظام إدارة أمن المعلومات</li>
<li>تدرّب على التفكير في المقايضات لا الأطر فقط -- مختبرات القرار من CyberAbeer مبنية بالضبط حول هذا النوع من الحكم</li>
<li>مهارات الكتابة والعرض أهم في الحوكمة والمخاطر والامتثال منها في معظم الأدوار الأمنية التقنية -- معظم العمل هو ترجمة المخاطرة إلى قرارات يتخذها آخرون</li>
</ul>
</div>
  $c4ar$,
  'خارطة طريق مهنة الحوكمة والمخاطر والامتثال | CyberAbeer',
  'مسار مهنة الحوكمة والمخاطر والامتثال من محلل إلى كبير مسؤولي أمن المعلومات: الأدوار والمهارات والشهادات في كل مرحلة.',
  4
from articles art
join authors a on a.id = art.author_id
join categories c on c.id = art.category_id
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_cybersecurity_careers'
  and exists (select 1 from article_translations t2 where t2.article_id = art.id and t2.locale='en' and t2.slug='grc-career-roadmap')
  and not exists (select 1 from article_translations t3 where t3.article_id = art.id and t3.locale='ar');

-- =======================================================================
-- CR5. How to Become a Cybersecurity Auditor
-- =======================================================================
insert into articles (id, author_id, category_id, status, schema_type, difficulty, audience, reviewed_at, published_at)
select gen_random_uuid(), a.id, c.id, 'published', 'Article', 'intermediate', array['students','professionals'], now(), now()
from authors a, categories c
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_cybersecurity_careers'
  and not exists (select 1 from article_translations t where t.locale='en' and t.slug='how-to-become-a-cybersecurity-auditor');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'en',
  'How to Become a Cybersecurity Auditor',
  'how-to-become-a-cybersecurity-auditor',
  'What cybersecurity auditors actually do, the skills that separate good ones from checkbox auditors, and the certification path (CISA and beyond).',
  $c5en$
<p>Cybersecurity/IT auditors evaluate whether an organization's controls actually work as designed -- independently of the teams that built them. It is a distinct discipline from being a GRC analyst who helps design and run controls.</p>
<h2>What the role actually involves</h2>
<div class="content-checklist">
<ul>
<li>Planning audit scope and criteria against a framework (ISO 27001, SOX ITGCs, SOC 2)</li>
<li>Sampling evidence and testing whether controls operated as documented (see <a href="/insights/internal-audit-explained">Internal Audit Explained</a>)</li>
<li>Distinguishing a real control failure from a documentation gap</li>
<li>Writing findings that are accurate, defensible, and actionable -- not just a compliance checklist result</li>
</ul>
</div>
<div class="content-callout">
  <div class="content-callout-title">Dr. Abeer Explains</div>
  <p>The best auditors I have worked with are not the strictest -- they are the most precise. A weak auditor either rubber-stamps everything or flags everything as a finding. A strong one can tell you exactly why a specific control gap matters to the business and what evidence would change their conclusion.</p>
</div>
<h2>Certification path</h2>
<p>CISA (Certified Information Systems Auditor, ISACA) is the most recognized audit-specific certification. CISSP or CISM add breadth for auditors who want to move toward GRC leadership rather than staying purely audit-focused. See <a href="/insights/cybersecurity-certifications-roadmap">Cybersecurity Certifications Roadmap</a> for sequencing guidance across all of these.</p>
  $c5en$,
  'How to Become a Cybersecurity Auditor | CyberAbeer',
  'What cybersecurity auditors do, the skills that separate strong auditors from checkbox auditors, and the CISA certification path.',
  4
from articles art
join authors a on a.id = art.author_id
join categories c on c.id = art.category_id
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_cybersecurity_careers'
  and exists (select 1 from article_translations t2 where t2.article_id = art.id and t2.locale='en' and t2.slug='how-to-become-a-cybersecurity-auditor')
  and not exists (select 1 from article_translations t3 where t3.article_id = art.id and t3.locale='en');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'ar',
  'كيف تصبح مدقق أمن سيبراني',
  'كيف-تصبح-مدقق-أمن-سيبراني',
  'ما الذي يفعله مدققو الأمن السيبراني فعلياً، والمهارات التي تفصل المدققين الجيدين عن مدققي قوائم التحقق، ومسار الشهادات (CISA وما بعدها).',
  $c5ar$
<p>يُقيّم مدققو الأمن السيبراني/تقنية المعلومات ما إذا كانت ضوابط المؤسسة تعمل فعلاً كما صُممت -- بشكل مستقل عن الفرق التي بنتها. هذا تخصص متمايز عن كونك محلل حوكمة ومخاطر وامتثال يساعد في تصميم الضوابط وتشغيلها.</p>
<h2>ما الذي ينطوي عليه الدور فعلياً</h2>
<div class="content-checklist">
<ul>
<li>تخطيط نطاق ومعايير التدقيق مقابل إطار عمل (ISO 27001، ضوابط تقنية المعلومات العامة لقانون ساربينز-أوكسلي، SOC 2)</li>
<li>أخذ عينات الأدلة واختبار ما إذا كانت الضوابط تعمل كما هو موثَّق (راجع <a href="/insights/internal-audit-explained">شرح التدقيق الداخلي</a>)</li>
<li>التمييز بين فشل ضابط حقيقي وفجوة توثيق</li>
<li>كتابة نتائج دقيقة وقابلة للدفاع عنها وقابلة للتنفيذ -- لا مجرد نتيجة قائمة تحقق امتثال</li>
</ul>
</div>
<div class="content-callout">
  <div class="content-callout-title">د. عبير توضح</div>
  <p>أفضل المدققين الذين عملت معهم ليسوا الأكثر صرامة -- بل الأكثر دقة. المدقق الضعيف إما يوافق على كل شيء تلقائياً أو يعتبر كل شيء ملاحظة. أما القوي فيستطيع أن يخبرك بالضبط لماذا تهم فجوة ضابط محددة العمل وما الدليل الذي سيغيّر استنتاجه.</p>
</div>
<h2>مسار الشهادات</h2>
<p>CISA (مدقق نظم المعلومات المعتمد، ISACA) هي الشهادة الأكثر اعترافاً بها الخاصة بالتدقيق. تضيف CISSP أو CISM اتساعاً للمدققين الراغبين في التوجه نحو قيادة الحوكمة والمخاطر والامتثال بدلاً من البقاء مركّزين على التدقيق فقط. راجع <a href="/insights/cybersecurity-certifications-roadmap">خارطة طريق شهادات الأمن السيبراني</a> لإرشادات ترتيب هذه الشهادات جميعها.</p>
  $c5ar$,
  'كيف تصبح مدقق أمن سيبراني | CyberAbeer',
  'ما يفعله مدققو الأمن السيبراني، والمهارات التي تفصل المدققين الأقوياء عن مدققي قوائم التحقق، ومسار شهادة CISA.',
  4
from articles art
join authors a on a.id = art.author_id
join categories c on c.id = art.category_id
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_cybersecurity_careers'
  and exists (select 1 from article_translations t2 where t2.article_id = art.id and t2.locale='en' and t2.slug='how-to-become-a-cybersecurity-auditor')
  and not exists (select 1 from article_translations t3 where t3.article_id = art.id and t3.locale='ar');

-- =======================================================================
-- CR6. Cybersecurity Certifications Roadmap
-- =======================================================================
insert into articles (id, author_id, category_id, status, schema_type, difficulty, audience, reviewed_at, published_at)
select gen_random_uuid(), a.id, c.id, 'published', 'Article', 'beginner', array['students','professionals','general'], now(), now()
from authors a, categories c
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_cybersecurity_careers'
  and not exists (select 1 from article_translations t where t.locale='en' and t.slug='cybersecurity-certifications-roadmap');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'en',
  'Cybersecurity Certifications Roadmap',
  'cybersecurity-certifications-roadmap',
  'Which certifications to get, and in what order, depending on your career stage and track -- technical or GRC.',
  $c6en$
<p>Certifications are most useful when sequenced to match real experience -- getting an experience-gated senior certification before you have the underlying job history to back it up rarely helps.</p>
<table class="content-decision-table">
<thead><tr><th>Stage</th><th>Technical track</th><th>GRC track</th></tr></thead>
<tbody>
<tr><td>Entry (0-2 yrs)</td><td>CompTIA Security+</td><td>CompTIA Security+, ISO 27001 Foundation</td></tr>
<tr><td>Early specialization (2-4 yrs)</td><td>CompTIA CySA+, GCIH (SOC/IR track)</td><td>ISO 27001 Lead Implementer</td></tr>
<tr><td>Mid-senior (4-6 yrs)</td><td>OSCP (offensive track), GCFA (forensics)</td><td>CISA, ISO 27001 Lead Auditor</td></tr>
<tr><td>Senior/leadership (5+ yrs, experience-gated)</td><td>CISSP</td><td>CISM, CISSP</td></tr>
</tbody>
</table>
<h2>A common sequencing mistake</h2>
<p>Attempting CISSP or CISM before you have enough qualifying professional experience (both require 4-5 years, with limited waivers) means you either cannot sit the exam yet, or you pass the exam but cannot activate full certification until experience requirements are met. It is usually more effective to build foundational certifications and real experience first, and treat CISSP/CISM as a capstone rather than a starting point. See <a href="/insights/cissp-vs-cism">CISSP vs CISM</a> for how to choose between them when you get there.</p>
  $c6en$,
  'Cybersecurity Certifications Roadmap | CyberAbeer',
  'Which cybersecurity certifications to pursue and in what order, by career stage, for both technical and GRC tracks.',
  4
from articles art
join authors a on a.id = art.author_id
join categories c on c.id = art.category_id
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_cybersecurity_careers'
  and exists (select 1 from article_translations t2 where t2.article_id = art.id and t2.locale='en' and t2.slug='cybersecurity-certifications-roadmap')
  and not exists (select 1 from article_translations t3 where t3.article_id = art.id and t3.locale='en');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'ar',
  'خارطة طريق شهادات الأمن السيبراني',
  'خارطة-طريق-شهادات-الأمن-السيبراني',
  'أي شهادات تحصل عليها، وبأي ترتيب، حسب مرحلة مسارك المهني ومساره -- التقني أو الحوكمي.',
  $c6ar$
<p>تكون الشهادات أكثر فائدة عندما تُرتَّب لتتوافق مع الخبرة الفعلية -- الحصول على شهادة أولى مشروطة بالخبرة قبل أن يكون لديك التاريخ الوظيفي الأساسي لدعمها نادراً ما يساعد.</p>
<table class="content-decision-table">
<thead><tr><th>المرحلة</th><th>المسار التقني</th><th>مسار الحوكمة والمخاطر والامتثال</th></tr></thead>
<tbody>
<tr><td>الدخول (0-2 سنة)</td><td>+CompTIA Security</td><td>+CompTIA Security، أساسيات ISO 27001</td></tr>
<tr><td>التخصص المبكر (2-4 سنوات)</td><td>+CompTIA CySA، GCIH (مسار مركز العمليات/الاستجابة للحوادث)</td><td>منفّذ رئيسي لـ ISO 27001</td></tr>
<tr><td>المتوسطة إلى الأولى (4-6 سنوات)</td><td>OSCP (المسار الهجومي)، GCFA (الطب الشرعي الرقمي)</td><td>CISA، مدقق رئيسي لـ ISO 27001</td></tr>
<tr><td>الأولى/القيادة (5+ سنوات، مشروطة بالخبرة)</td><td>CISSP</td><td>CISM، CISSP</td></tr>
</tbody>
</table>
<h2>خطأ ترتيب شائع</h2>
<p>محاولة الحصول على CISSP أو CISM قبل أن يكون لديك خبرة مهنية كافية مؤهِّلة (كلاهما يتطلب 4-5 سنوات، بإعفاءات محدودة) تعني إما أنك لا تستطيع أداء الاختبار بعد، أو أنك تجتاز الاختبار لكن لا يمكنك تفعيل الاعتماد الكامل حتى تُستوفى متطلبات الخبرة. عادة ما يكون بناء الشهادات الأساسية والخبرة الحقيقية أولاً أكثر فعالية، ومعاملة CISSP/CISM كتتويج لا كنقطة بداية. راجع <a href="/insights/cissp-vs-cism">CISSP مقابل CISM</a> لمعرفة كيفية الاختيار بينهما عند وصولك لتلك المرحلة.</p>
  $c6ar$,
  'خارطة طريق شهادات الأمن السيبراني | CyberAbeer',
  'أي شهادات أمن سيبراني تسعى للحصول عليها وبأي ترتيب، حسب مرحلة المسار المهني، للمسارين التقني والحوكمي.',
  4
from articles art
join authors a on a.id = art.author_id
join categories c on c.id = art.category_id
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_cybersecurity_careers'
  and exists (select 1 from article_translations t2 where t2.article_id = art.id and t2.locale='en' and t2.slug='cybersecurity-certifications-roadmap')
  and not exists (select 1 from article_translations t3 where t3.article_id = art.id and t3.locale='ar');

-- =======================================================================
-- CR7. Technical Cybersecurity vs GRC Careers
-- =======================================================================
insert into articles (id, author_id, category_id, status, schema_type, difficulty, audience, reviewed_at, published_at)
select gen_random_uuid(), a.id, c.id, 'published', 'Article', 'beginner', array['students','general'], now(), now()
from authors a, categories c
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_cybersecurity_careers'
  and not exists (select 1 from article_translations t where t.locale='en' and t.slug='technical-cybersecurity-vs-grc-careers');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'en',
  'Technical Cybersecurity vs GRC Careers',
  'technical-cybersecurity-vs-grc-careers',
  'Two broad tracks, two different daily realities. A practical comparison to help you decide which fits your strengths.',
  $c7en$
<table class="content-comparison-table">
<thead><tr><th></th><th>Technical track</th><th>GRC track</th></tr></thead>
<tbody>
<tr><td>Daily work</td><td>Hands-on with systems: logs, code, network traffic, tools</td><td>Hands-on with process: policy, evidence, risk assessments, conversations</td></tr>
<tr><td>Core question answered</td><td>"Is this system secure, and how would an attacker break it?"</td><td>"Is this risk acceptable, and can we prove our controls work?"</td></tr>
<tr><td>Strong fit if you</td><td>Enjoy deep technical problem-solving and continuous tool/technique learning</td><td>Enjoy structured reasoning, writing, and organizational influence</td></tr>
<tr><td>Typical entry roles</td><td>SOC Analyst, security engineer, pen tester</td><td>GRC analyst, compliance analyst, IT auditor</td></tr>
<tr><td>Key certifications</td><td>Security+, CySA+, OSCP, later CISSP</td><td>Security+, ISO 27001, CISA, later CISM/CISSP</td></tr>
</tbody>
</table>
<h2>It is not a permanent choice</h2>
<p>Movement between tracks happens, especially mid-career -- a technical security engineer who develops strong communication and process skills can move into GRC leadership; a GRC analyst who wants deeper technical grounding can move toward security engineering. Early career, picking one track to build depth in is usually more effective than trying to stay generalist across both.</p>
<div class="content-callout">
  <div class="content-callout-title">Dr. Abeer Explains</div>
  <p>I get asked "which track pays more" often. In my experience, seniority and organizational scope matter far more than track choice -- a senior GRC leader and a senior security architect are typically compensated comparably. Choose based on what kind of problem-solving actually engages you, because that is what sustains a multi-decade career.</p>
</div>
  $c7en$,
  'Technical Cybersecurity vs GRC Careers | CyberAbeer',
  'Technical security careers vs GRC careers compared: daily work, core skills, entry roles, and certifications for each track.',
  4
from articles art
join authors a on a.id = art.author_id
join categories c on c.id = art.category_id
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_cybersecurity_careers'
  and exists (select 1 from article_translations t2 where t2.article_id = art.id and t2.locale='en' and t2.slug='technical-cybersecurity-vs-grc-careers')
  and not exists (select 1 from article_translations t3 where t3.article_id = art.id and t3.locale='en');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'ar',
  'الأمن السيبراني التقني مقابل مهن الحوكمة والمخاطر والامتثال',
  'الأمن-السيبراني-التقني-مقابل-مهن-الحوكمة-والمخاطر-والامتثال',
  'مساران عريضان، وواقعان يوميان مختلفان. مقارنة عملية لمساعدتك على تحديد أيهما يناسب نقاط قوتك.',
  $c7ar$
<table class="content-comparison-table">
<thead><tr><th></th><th>المسار التقني</th><th>مسار الحوكمة والمخاطر والامتثال</th></tr></thead>
<tbody>
<tr><td>العمل اليومي</td><td>عملي مع الأنظمة: السجلات، الشيفرة البرمجية، حركة الشبكة، الأدوات</td><td>عملي مع العملية: السياسة، الأدلة، تقييمات المخاطر، المحادثات</td></tr>
<tr><td>السؤال الأساسي المُجاب عنه</td><td>"هل هذا النظام آمن، وكيف سيخترقه مهاجم؟"</td><td>"هل هذه المخاطرة مقبولة، وهل يمكننا إثبات أن ضوابطنا تعمل؟"</td></tr>
<tr><td>مناسب بقوة إذا كنت</td><td>تستمتع بحل المشكلات التقنية العميقة والتعلم المستمر للأدوات/التقنيات</td><td>تستمتع بالتفكير المنظم والكتابة والتأثير التنظيمي</td></tr>
<tr><td>أدوار الدخول النموذجية</td><td>محلل مركز عمليات أمنية، مهندس أمن، مختبر اختراق</td><td>محلل حوكمة ومخاطر وامتثال، محلل امتثال، مدقق تقنية معلومات</td></tr>
<tr><td>الشهادات الرئيسية</td><td>+Security، +CySA، OSCP، لاحقاً CISSP</td><td>+Security، ISO 27001، CISA، لاحقاً CISM/CISSP</td></tr>
</tbody>
</table>
<h2>ليس اختياراً دائماً</h2>
<p>يحدث الانتقال بين المسارين، خاصة في منتصف المسار المهني -- يمكن لمهندس أمن تقني طوّر مهارات تواصل وعملية قوية أن ينتقل إلى قيادة الحوكمة والمخاطر والامتثال؛ ويمكن لمحلل حوكمة ومخاطر وامتثال يريد أساساً تقنياً أعمق أن ينتقل نحو هندسة الأمن. في بداية المسار المهني، اختيار مسار واحد لبناء عمق فيه عادة أكثر فعالية من محاولة البقاء عاماً في كليهما.</p>
<div class="content-callout">
  <div class="content-callout-title">د. عبير توضح</div>
  <p>يُسألني كثيراً "أي مسار يدفع أكثر". في تجربتي، الأقدمية والنطاق التنظيمي أهم بكثير من اختيار المسار -- عادة ما يُكافَأ قائد حوكمة ومخاطر وامتثال أول ومهندس معماري أمن أول بشكل متقارب. اختر بناءً على نوع حل المشكلات الذي يشغلك فعلياً، لأن هذا ما يديم مهنة تمتد لعقود.</p>
</div>
  $c7ar$,
  'الأمن السيبراني التقني مقابل مهن الحوكمة والمخاطر والامتثال | CyberAbeer',
  'مقارنة بين مهن الأمن التقني ومهن الحوكمة والمخاطر والامتثال: العمل اليومي والمهارات الأساسية وأدوار الدخول والشهادات لكل مسار.',
  4
from articles art
join authors a on a.id = art.author_id
join categories c on c.id = art.category_id
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_cybersecurity_careers'
  and exists (select 1 from article_translations t2 where t2.article_id = art.id and t2.locale='en' and t2.slug='technical-cybersecurity-vs-grc-careers')
  and not exists (select 1 from article_translations t3 where t3.article_id = art.id and t3.locale='ar');

-- =======================================================================
-- Relations (cross-hub links included: careers -> CISSP/CISM/ISO hubs)
-- =======================================================================
insert into article_relations (article_id, related_article_id, sort_order)
select src.article_id, dst.article_id, r.sort_order
from (values
  ('how-to-start-a-cybersecurity-career', 'cybersecurity-for-beginners-first-year-roadmap', 1),
  ('how-to-start-a-cybersecurity-career', 'cybersecurity-career-roadmap', 2),
  ('cybersecurity-career-roadmap', 'technical-cybersecurity-vs-grc-careers', 1),
  ('cybersecurity-career-roadmap', 'soc-analyst-career-roadmap', 2),
  ('cybersecurity-career-roadmap', 'grc-career-roadmap', 3),
  ('cybersecurity-career-roadmap', 'how-to-become-a-cybersecurity-auditor', 4),
  ('soc-analyst-career-roadmap', 'cybersecurity-certifications-roadmap', 1),
  ('grc-career-roadmap', 'cissp-vs-cism', 1),
  ('grc-career-roadmap', 'cybersecurity-certifications-roadmap', 2),
  ('how-to-become-a-cybersecurity-auditor', 'internal-audit-explained', 1),
  ('how-to-become-a-cybersecurity-auditor', 'cybersecurity-certifications-roadmap', 2),
  ('cybersecurity-certifications-roadmap', 'cissp-vs-cism', 1),
  ('cybersecurity-certifications-roadmap', 'what-is-cissp', 2),
  ('cybersecurity-certifications-roadmap', 'what-is-cism', 3),
  ('technical-cybersecurity-vs-grc-careers', 'grc-career-roadmap', 1),
  ('technical-cybersecurity-vs-grc-careers', 'soc-analyst-career-roadmap', 2)
) as r(src_slug, dst_slug, sort_order)
join article_translations src on src.locale='en' and src.slug=r.src_slug
join article_translations dst on dst.locale='en' and dst.slug=r.dst_slug
on conflict (article_id, related_article_id) do nothing;
