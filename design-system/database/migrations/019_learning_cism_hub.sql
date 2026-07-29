-- Migration 019: CISM Hub -- 7 bilingual articles
-- =============================================================
-- Same conventions as 018: status='published' at insert time,
-- published_at set, only pre-existing body classes used.

-- =======================================================================
-- M1. What Is CISM?
-- =======================================================================
insert into articles (id, author_id, category_id, status, schema_type, difficulty, audience, reviewed_at, published_at)
select gen_random_uuid(), a.id, c.id, 'published', 'Article', 'beginner', array['professionals','ciso'], now(), now()
from authors a, categories c
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_cism'
  and not exists (select 1 from article_translations t where t.locale='en' and t.slug='what-is-cism');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'en',
  'What Is CISM?',
  'what-is-cism',
  'CISM (Certified Information Security Manager) is ISACA''s certification for people who manage, not just implement, an enterprise security program.',
  $m1en$
<p>CISM, issued by ISACA, certifies the ability to manage and govern an enterprise information security program: aligning security with business strategy, managing risk at a program level, and running governance and incident management functions. It assumes you are operating at or near a management level, not primarily hands-on technical work.</p>
<h2>Experience requirement</h2>
<p>ISACA requires five years of information security work experience, with at least three years in security management across three or more of the CISM domains. Unlike CISSP, there is less flexibility for substituting education for experience -- CISM is squarely built around demonstrated management experience.</p>
<div class="content-callout">
  <div class="content-callout-title">Who it is for</div>
  <p>CISM suits people already in, or moving toward, roles like security manager, security program lead, or CISO -- especially in organizations where security reports into risk, audit, or executive governance structures rather than IT operations.</p>
</div>
<p>See <a href="/insights/cissp-vs-cism">CISSP vs CISM</a> for how the two certifications differ in practice.</p>
  $m1en$,
  'What Is CISM? | CyberAbeer',
  'What CISM certifies, the experience requirement, and who the certification is built for.',
  4
from articles art
join authors a on a.id = art.author_id
join categories c on c.id = art.category_id
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_cism'
  and exists (select 1 from article_translations t2 where t2.article_id = art.id and t2.locale='en' and t2.slug='what-is-cism')
  and not exists (select 1 from article_translations t3 where t3.article_id = art.id and t3.locale='en');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'ar',
  'ما هي شهادة CISM؟',
  'ما-هي-شهادة-cism',
  'CISM (مدير أمن معلومات معتمد) شهادة من ISACA لمن يدير -- لا ينفّذ فقط -- برنامج أمن مؤسسي.',
  $m1ar$
<p>تشهد CISM، الصادرة عن ISACA، على القدرة على إدارة وحوكمة برنامج أمن معلومات مؤسسي: مواءمة الأمن مع استراتيجية الأعمال، وإدارة المخاطر على مستوى البرنامج، وتشغيل وظائف الحوكمة وإدارة الحوادث. تفترض أنك تعمل عند مستوى إداري أو قريب منه، لا في عمل تقني تنفيذي بشكل أساسي.</p>
<h2>متطلبات الخبرة</h2>
<p>تشترط ISACA خمس سنوات من خبرة العمل في أمن المعلومات، منها ثلاث سنوات على الأقل في إدارة الأمن عبر ثلاثة مجالات أو أكثر من مجالات CISM. على عكس CISSP، هناك مرونة أقل لاستبدال الخبرة بالتعليم -- فـCISM مبنية بشكل مباشر حول خبرة إدارية مُثبَتة.</p>
<div class="content-callout">
  <div class="content-callout-title">لمن هذه الشهادة</div>
  <p>تناسب CISM من هم بالفعل في أدوار مثل مدير أمن أو قائد برنامج أمني أو رئيس أمن معلومات، أو يتجهون إليها -- خاصة في المؤسسات التي يرفع فيها الأمن تقاريره إلى هياكل المخاطر أو التدقيق أو الحوكمة التنفيذية بدلاً من عمليات تقنية المعلومات.</p>
</div>
<p>راجع <a href="/ar/insights/cissp-مقابل-cism">CISSP مقابل CISM</a> لمعرفة كيف تختلف الشهادتان عملياً.</p>
  $m1ar$,
  'ما هي شهادة CISM؟ | CyberAbeer',
  'ما الذي تشهد عليه CISM، ومتطلبات الخبرة، ولمن صُممت هذه الشهادة.',
  4
from articles art
join authors a on a.id = art.author_id
join categories c on c.id = art.category_id
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_cism'
  and exists (select 1 from article_translations t2 where t2.article_id = art.id and t2.locale='en' and t2.slug='what-is-cism')
  and not exists (select 1 from article_translations t3 where t3.article_id = art.id and t3.locale='ar');

-- =======================================================================
-- M2. CISM Domains Explained
-- =======================================================================
insert into articles (id, author_id, category_id, status, schema_type, difficulty, audience, reviewed_at, published_at)
select gen_random_uuid(), a.id, c.id, 'published', 'Article', 'beginner', array['professionals','ciso'], now(), now()
from authors a, categories c
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_cism'
  and not exists (select 1 from article_translations t where t.locale='en' and t.slug='cism-domains-explained');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'en',
  'CISM Domains Explained',
  'cism-domains-explained',
  'CISM is organized into four domains, all oriented around managing a program rather than performing technical tasks.',
  $m2en$
<table class="content-comparison-table">
<thead><tr><th>Domain</th><th>Focus</th><th>Approx. weight</th></tr></thead>
<tbody>
<tr><td>1. Information Security Governance</td><td>Strategy, aligning security with business objectives, executive reporting</td><td>~17%</td></tr>
<tr><td>2. Information Security Risk Management</td><td>Program-level risk identification, assessment, and treatment</td><td>~20%</td></tr>
<tr><td>3. Information Security Program Development and Management</td><td>Building and running the security program itself</td><td>~33%</td></tr>
<tr><td>4. Information Security Incident Management</td><td>Program-level incident management design and readiness</td><td>~30%</td></tr>
</tbody>
</table>
<p>Note the weighting skews heavily toward Domains 3 and 4 combined (roughly 63%) -- CISM is much more concentrated than CISSP's relatively even eight-domain spread. Candidates who under-invest in program management and incident management content will feel it on exam day.</p>
<h2>Why the domains read differently from CISSP</h2>
<p>Where CISSP Domain 7 (Security Operations) tests hands-on incident response phases, CISM Domain 4 tests whether you can design and govern the incident management capability itself -- policies, roles, communication plans, and executive reporting -- rather than the technical response mechanics.</p>
  $m2en$,
  'CISM Domains Explained | CyberAbeer',
  'The 4 CISM domains, what each covers, and approximate exam weighting -- heavily concentrated in program and incident management.',
  4
from articles art
join authors a on a.id = art.author_id
join categories c on c.id = art.category_id
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_cism'
  and exists (select 1 from article_translations t2 where t2.article_id = art.id and t2.locale='en' and t2.slug='cism-domains-explained')
  and not exists (select 1 from article_translations t3 where t3.article_id = art.id and t3.locale='en');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'ar',
  'شرح مجالات CISM',
  'شرح-مجالات-cism',
  'تُنظَّم CISM في أربعة مجالات، جميعها موجَّهة نحو إدارة برنامج لا تنفيذ مهام تقنية.',
  $m2ar$
<table class="content-comparison-table">
<thead><tr><th>المجال</th><th>التركيز</th><th>الوزن التقريبي</th></tr></thead>
<tbody>
<tr><td>1. حوكمة أمن المعلومات</td><td>الاستراتيجية، مواءمة الأمن مع أهداف الأعمال، التقارير التنفيذية</td><td>~17%</td></tr>
<tr><td>2. إدارة مخاطر أمن المعلومات</td><td>تحديد وتقييم ومعالجة المخاطر على مستوى البرنامج</td><td>~20%</td></tr>
<tr><td>3. تطوير وإدارة برنامج أمن المعلومات</td><td>بناء وتشغيل برنامج الأمن نفسه</td><td>~33%</td></tr>
<tr><td>4. إدارة حوادث أمن المعلومات</td><td>تصميم وجاهزية إدارة الحوادث على مستوى البرنامج</td><td>~30%</td></tr>
</tbody>
</table>
<p>لاحظ أن الوزن يميل بشدة نحو المجالين 3 و4 مجتمعين (نحو 63%) -- فـCISM أكثر تركيزاً بكثير من توزيع CISSP شبه المتساوي عبر ثمانية مجالات. المرشحون الذين لا يستثمرون بما يكفي في محتوى إدارة البرنامج وإدارة الحوادث سيشعرون بذلك يوم الاختبار.</p>
<h2>لماذا تُقرأ المجالات بشكل مختلف عن CISSP</h2>
<p>بينما يختبر المجال السابع من CISSP (عمليات الأمن) مراحل الاستجابة التنفيذية للحوادث، يختبر المجال الرابع من CISM ما إذا كنت تستطيع تصميم وحوكمة قدرة إدارة الحوادث نفسها -- السياسات والأدوار وخطط التواصل والتقارير التنفيذية -- لا آليات الاستجابة التقنية.</p>
  $m2ar$,
  'شرح مجالات CISM | CyberAbeer',
  'مجالات CISM الأربعة وما يغطيه كل منها والوزن التقريبي في الاختبار -- مركّز بشدة في إدارة البرنامج والحوادث.',
  4
from articles art
join authors a on a.id = art.author_id
join categories c on c.id = art.category_id
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_cism'
  and exists (select 1 from article_translations t2 where t2.article_id = art.id and t2.locale='en' and t2.slug='cism-domains-explained')
  and not exists (select 1 from article_translations t3 where t3.article_id = art.id and t3.locale='ar');

-- =======================================================================
-- M3. CISSP vs CISM
-- =======================================================================
insert into articles (id, author_id, category_id, status, schema_type, difficulty, audience, reviewed_at, published_at)
select gen_random_uuid(), a.id, c.id, 'published', 'Article', 'beginner', array['professionals','ciso'], now(), now()
from authors a, categories c
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_cism'
  and not exists (select 1 from article_translations t where t.locale='en' and t.slug='cissp-vs-cism');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'en',
  'CISSP vs CISM',
  'cissp-vs-cism',
  'A focused, two-way comparison of CISSP and CISM: what each actually tests, and which fits your career direction better.',
  $m3en$
<p>CISSP and CISM overlap in subject matter but differ sharply in orientation. Neither is strictly "harder" or "better" -- they validate different things.</p>
<table class="content-comparison-table">
<thead><tr><th></th><th>CISSP</th><th>CISM</th></tr></thead>
<tbody>
<tr><td>Issuer</td><td>(ISC)&sup2;</td><td>ISACA</td></tr>
<tr><td>Orientation</td><td>Broad technical + governance, generalist</td><td>Management and governance of the program itself</td></tr>
<tr><td>Domains</td><td>8, relatively even weighting</td><td>4, concentrated in program/incident management</td></tr>
<tr><td>Best fit</td><td>Security architects, engineers moving into leadership, broad practitioners</td><td>Security managers, program leads, CISO-track candidates</td></tr>
<tr><td>Experience required</td><td>5 years across 2+ domains</td><td>5 years, 3+ in security management</td></tr>
</tbody>
</table>
<h2>How to choose</h2>
<p>If your work still touches technical architecture, network security, or hands-on assessment regularly, CISSP's breadth maps better to your day-to-day. If your work is primarily about running the program -- budget, policy, executive reporting, risk governance -- CISM maps more directly to what you actually do. Many senior GRC and CISO-track professionals eventually hold both; neither replaces the other.</p>
<p>For a three-way comparison including CEH, see <a href="/insights/cissp-vs-cism-vs-ceh-which-certification-first">CISSP vs CISM vs CEH</a>.</p>
  $m3en$,
  'CISSP vs CISM | CyberAbeer',
  'How CISSP and CISM differ in orientation, domains, and career fit, and how to decide which to pursue.',
  4
from articles art
join authors a on a.id = art.author_id
join categories c on c.id = art.category_id
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_cism'
  and exists (select 1 from article_translations t2 where t2.article_id = art.id and t2.locale='en' and t2.slug='cissp-vs-cism')
  and not exists (select 1 from article_translations t3 where t3.article_id = art.id and t3.locale='en');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'ar',
  'CISSP مقابل CISM',
  'cissp-مقابل-cism',
  'مقارنة مركّزة ثنائية بين CISSP وCISM: ما الذي يختبره كل منهما فعلياً، وأيهما يناسب اتجاهك المهني أكثر.',
  $m3ar$
<p>تتداخل CISSP وCISM في الموضوعات لكنهما تختلفان بشدة في التوجه. لا تُعد أي منهما "أصعب" أو "أفضل" بشكل مطلق -- بل تشهد كل منهما على أمر مختلف.</p>
<table class="content-comparison-table">
<thead><tr><th></th><th>CISSP</th><th>CISM</th></tr></thead>
<tbody>
<tr><td>الجهة المُصدرة</td><td>(ISC)&sup2;</td><td>ISACA</td></tr>
<tr><td>التوجه</td><td>تقني وحوكمي واسع، عام</td><td>إدارة وحوكمة البرنامج نفسه</td></tr>
<tr><td>المجالات</td><td>8، بوزن متساوٍ نسبياً</td><td>4، مركّزة في إدارة البرنامج والحوادث</td></tr>
<tr><td>الأنسب لـ</td><td>مهندسو أمن، ومهندسون متجهون للقيادة، وممارسون عامون</td><td>مديرو أمن، وقادة برامج، ومرشحون لمسار رئيس أمن المعلومات</td></tr>
<tr><td>الخبرة المطلوبة</td><td>5 سنوات عبر مجالين أو أكثر</td><td>5 سنوات، منها 3+ في إدارة الأمن</td></tr>
</tbody>
</table>
<h2>كيف تختار</h2>
<p>إذا كان عملك لا يزال يلامس البنية التقنية أو أمن الشبكات أو التقييم التطبيقي بانتظام، فاتساع CISSP يتماشى بشكل أفضل مع عملك اليومي. أما إذا كان عملك يتمحور بشكل أساسي حول تشغيل البرنامج -- الميزانية والسياسات والتقارير التنفيذية وحوكمة المخاطر -- فـCISM تتماشى بشكل أكثر مباشرة مع ما تفعله فعلياً. يحمل كثير من المهنيين البارزين في الحوكمة والمخاطر والامتثال ومسار رئيس أمن المعلومات كلتا الشهادتين في النهاية؛ فلا تحل إحداهما محل الأخرى.</p>
<p>لمقارنة ثلاثية تشمل CEH، راجع <a href="/ar/insights/cissp-مقابل-cism-مقابل-ceh">CISSP مقابل CISM مقابل CEH</a>.</p>
  $m3ar$,
  'CISSP مقابل CISM | CyberAbeer',
  'كيف تختلف CISSP وCISM في التوجه والمجالات والملاءمة المهنية، وكيف تقرر أيهما تسعى إليها.',
  4
from articles art
join authors a on a.id = art.author_id
join categories c on c.id = art.category_id
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_cism'
  and exists (select 1 from article_translations t2 where t2.article_id = art.id and t2.locale='en' and t2.slug='cissp-vs-cism')
  and not exists (select 1 from article_translations t3 where t3.article_id = art.id and t3.locale='ar');

-- =======================================================================
-- M4. How to Prepare for CISM
-- =======================================================================
insert into articles (id, author_id, category_id, status, schema_type, difficulty, audience, reviewed_at, published_at)
select gen_random_uuid(), a.id, c.id, 'published', 'Article', 'intermediate', array['professionals','ciso'], now(), now()
from authors a, categories c
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_cism'
  and not exists (select 1 from article_translations t where t.locale='en' and t.slug='how-to-prepare-for-cism');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'en',
  'How to Prepare for CISM',
  'how-to-prepare-for-cism',
  'CISM prep rewards program-level, governance-first thinking. Technical depth alone will not get you through it.',
  $m4en$
<p>CISM candidates coming from a strong technical background often prepare the same way they would for a technical certification -- and underperform, because CISM questions consistently reward the governance and program-management answer over the technically detailed one.</p>
<div class="content-checklist">
<p><strong>A realistic prep sequence:</strong></p>
<ul>
<li>Start with Domain 1 (Governance) even if it feels abstract -- it sets the reasoning frame for the other three domains</li>
<li>Study Domains 3 and 4 in the most depth, given their combined ~63% weighting</li>
<li>Practice reading each question from the perspective of "what would a security manager report to the board," not "what is the most technically correct fix"</li>
<li>Use ISACA's official review materials as your primary source -- CISM's question style is distinctive enough that generic security study guides can miss the mark</li>
</ul>
</div>
<h2>The mindset shift</h2>
<p>Where CISSP often asks "what should be done," CISM more often asks "who should decide, and how should it be governed." If you find yourself reasoning about specific technical controls, step back and ask what the governance answer is instead.</p>
  $m4en$,
  'How to Prepare for CISM | CyberAbeer',
  'A realistic CISM preparation approach centered on governance and program-management reasoning, not technical depth.',
  4
from articles art
join authors a on a.id = art.author_id
join categories c on c.id = art.category_id
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_cism'
  and exists (select 1 from article_translations t2 where t2.article_id = art.id and t2.locale='en' and t2.slug='how-to-prepare-for-cism')
  and not exists (select 1 from article_translations t3 where t3.article_id = art.id and t3.locale='en');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'ar',
  'كيف تستعد لاختبار CISM',
  'كيف-تستعد-لاختبار-cism',
  'يكافئ الاستعداد لـCISM التفكير القائم على البرنامج والحوكمة أولاً. العمق التقني وحده لن يوصلك.',
  $m4ar$
<p>غالباً ما يستعد مرشحو CISM ذوو الخلفية التقنية القوية بنفس طريقة استعدادهم لشهادة تقنية -- ويقصّرون، لأن أسئلة CISM تكافئ باستمرار إجابة الحوكمة وإدارة البرنامج على الإجابة المفصلة تقنياً.</p>
<div class="content-checklist">
<p><strong>تسلسل استعداد واقعي:</strong></p>
<ul>
<li>ابدأ بالمجال الأول (الحوكمة) حتى لو بدا مجرداً -- فهو يضع إطار التفكير للمجالات الثلاثة الأخرى</li>
<li>ادرس المجالين 3 و4 بعمق أكبر، نظراً لوزنهما المجمَّع البالغ نحو 63%</li>
<li>تدرّب على قراءة كل سؤال من منظور "ما الذي سيرفعه مدير الأمن تقريراً لمجلس الإدارة"، لا "ما الحل الأصح تقنياً"</li>
<li>استخدم مواد المراجعة الرسمية من ISACA كمصدرك الأساسي -- أسلوب أسئلة CISM مميز بما يكفي لتُخطئ أدلة الدراسة الأمنية العامة الهدف</li>
</ul>
</div>
<h2>تحوّل العقلية</h2>
<p>بينما تسأل CISSP غالباً "ما الذي ينبغي فعله"، تسأل CISM غالباً أكثر "من ينبغي أن يقرر، وكيف ينبغي حوكمة ذلك". إذا وجدت نفسك تفكر في ضوابط تقنية محددة، توقف واسأل ما هي إجابة الحوكمة بدلاً من ذلك.</p>
  $m4ar$,
  'كيف تستعد لاختبار CISM | CyberAbeer',
  'نهج واقعي للاستعداد لـCISM يركّز على التفكير القائم على الحوكمة وإدارة البرنامج، لا العمق التقني.',
  4
from articles art
join authors a on a.id = art.author_id
join categories c on c.id = art.category_id
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_cism'
  and exists (select 1 from article_translations t2 where t2.article_id = art.id and t2.locale='en' and t2.slug='how-to-prepare-for-cism')
  and not exists (select 1 from article_translations t3 where t3.article_id = art.id and t3.locale='ar');

-- =======================================================================
-- M5. Information Security Governance for CISM
-- =======================================================================
insert into articles (id, author_id, category_id, status, schema_type, difficulty, audience, reviewed_at, published_at)
select gen_random_uuid(), a.id, c.id, 'published', 'Article', 'intermediate', array['professionals','ciso'], now(), now()
from authors a, categories c
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_cism'
  and not exists (select 1 from article_translations t where t.locale='en' and t.slug='information-security-governance-for-cism');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'en',
  'Information Security Governance for CISM',
  'information-security-governance-for-cism',
  'CISM Domain 1 tests whether you understand governance as a structure of accountability -- not a synonym for "security policy."',
  $m5en$
<p>Information security governance is the framework of roles, accountability, and decision rights that ensures security supports business objectives and manages risk to an acceptable level -- decided and overseen at the executive/board level, not just documented by the security team.</p>
<h2>Core governance components CISM expects</h2>
<div class="content-checklist">
<ul>
<li><strong>Strategic alignment</strong> -- security objectives are derived from business objectives, not set independently</li>
<li><strong>Roles and accountability</strong> -- who owns risk decisions (typically business owners, with security as advisor), not just who implements controls</li>
<li><strong>Resource management</strong> -- budget and staffing decisions tied to risk priorities</li>
<li><strong>Performance measurement</strong> -- metrics that mean something to the board, not just technical KPIs</li>
<li><strong>Regulatory and legal alignment</strong> -- governance structures that demonstrate due diligence for compliance obligations</li>
</ul>
</div>
<h2>The exam trap</h2>
<p>A common wrong-answer pattern treats "governance" as equivalent to "the security team wrote a policy." Real governance requires a decision-making structure with actual authority and accountability behind it -- a policy document without an enforcement and accountability structure is not, by itself, governance.</p>
  $m5en$,
  'Information Security Governance for CISM | CyberAbeer',
  'CISM Domain 1 governance concepts: strategic alignment, accountability, resource management, and avoiding the "policy = governance" trap.',
  4
from articles art
join authors a on a.id = art.author_id
join categories c on c.id = art.category_id
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_cism'
  and exists (select 1 from article_translations t2 where t2.article_id = art.id and t2.locale='en' and t2.slug='information-security-governance-for-cism')
  and not exists (select 1 from article_translations t3 where t3.article_id = art.id and t3.locale='en');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'ar',
  'حوكمة أمن المعلومات لـCISM',
  'حوكمة-امن-المعلومات-لـcism',
  'يختبر المجال الأول من CISM ما إذا كنت تفهم الحوكمة كبنية للمساءلة -- لا كمرادف لـ"سياسة الأمن".',
  $m5ar$
<p>حوكمة أمن المعلومات هي إطار الأدوار والمساءلة وحقوق القرار الذي يضمن دعم الأمن لأهداف الأعمال وإدارة المخاطر إلى مستوى مقبول -- يُقرَّر ويُشرَف عليه على مستوى التنفيذيين/مجلس الإدارة، لا يُوثَّق فقط من قبل فريق الأمن.</p>
<h2>مكونات الحوكمة الأساسية التي تتوقعها CISM</h2>
<div class="content-checklist">
<ul>
<li><strong>المواءمة الاستراتيجية</strong> -- تُشتق أهداف الأمن من أهداف الأعمال، لا تُوضع باستقلالية</li>
<li><strong>الأدوار والمساءلة</strong> -- من يملك قرارات المخاطر (عادة مالكو الأعمال، والأمن كمستشار)، لا من ينفذ الضوابط فقط</li>
<li><strong>إدارة الموارد</strong> -- قرارات الميزانية والتوظيف مرتبطة بأولويات المخاطر</li>
<li><strong>قياس الأداء</strong> -- مقاييس ذات معنى لمجلس الإدارة، لا مؤشرات أداء تقنية فقط</li>
<li><strong>المواءمة التنظيمية والقانونية</strong> -- بنى حوكمية تُظهر العناية الواجبة لالتزامات الامتثال</li>
</ul>
</div>
<h2>فخ الاختبار</h2>
<p>يعامل نمط إجابة خاطئة شائع "الحوكمة" وكأنها تعادل "كتب فريق الأمن سياسة". تتطلب الحوكمة الحقيقية بنية اتخاذ قرار بصلاحية ومساءلة فعليتين خلفها -- وثيقة سياسة دون بنية إنفاذ ومساءلة ليست، بحد ذاتها، حوكمة.</p>
  $m5ar$,
  'حوكمة أمن المعلومات لـCISM | CyberAbeer',
  'مفاهيم حوكمة المجال الأول من CISM: المواءمة الاستراتيجية، والمساءلة، وإدارة الموارد، وتجنب فخ "السياسة تساوي الحوكمة".',
  4
from articles art
join authors a on a.id = art.author_id
join categories c on c.id = art.category_id
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_cism'
  and exists (select 1 from article_translations t2 where t2.article_id = art.id and t2.locale='en' and t2.slug='information-security-governance-for-cism')
  and not exists (select 1 from article_translations t3 where t3.article_id = art.id and t3.locale='ar');

-- =======================================================================
-- M6. CISM Risk Management Explained
-- =======================================================================
insert into articles (id, author_id, category_id, status, schema_type, difficulty, audience, reviewed_at, published_at)
select gen_random_uuid(), a.id, c.id, 'published', 'Article', 'intermediate', array['professionals','ciso'], now(), now()
from authors a, categories c
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_cism'
  and not exists (select 1 from article_translations t where t.locale='en' and t.slug='cism-risk-management-explained');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'en',
  'CISM Risk Management Explained',
  'cism-risk-management-explained',
  'CISM Domain 2 treats risk management as a program you build and run, not a calculation you perform on a single asset.',
  $m6en$
<p>CISSP's risk content (see <a href="/insights/cissp-risk-management-explained">CISSP Risk Management Explained</a>) centers on analyzing and treating individual risks. CISM Domain 2 asks a broader question: how do you build and operate a risk management program across the whole organization, consistently, over time?</p>
<h2>What "program-level" risk management includes</h2>
<div class="content-checklist">
<ul>
<li>A defined risk management framework and methodology applied consistently across business units</li>
<li>A risk register maintained and reviewed on a regular cadence, not built once and forgotten</li>
<li>Clear escalation thresholds: which risks require executive/board awareness versus operational-level acceptance</li>
<li>Integration with enterprise risk management (ERM) -- security risk is one input into overall organizational risk, not a separate silo</li>
</ul>
</div>
<h2>Risk appetite vs. individual risk decisions</h2>
<p>CISM expects you to distinguish an organization's overall risk appetite (a governance-set boundary) from a single risk acceptance decision (an operational action within that boundary). A program that lets individual teams set their own risk tolerance without reference to an organization-wide appetite is a program design flaw the exam expects you to recognize.</p>
  $m6en$,
  'CISM Risk Management Explained | CyberAbeer',
  'CISM Domain 2: building and operating a program-level risk management framework, risk appetite, and ERM integration.',
  4
from articles art
join authors a on a.id = art.author_id
join categories c on c.id = art.category_id
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_cism'
  and exists (select 1 from article_translations t2 where t2.article_id = art.id and t2.locale='en' and t2.slug='cism-risk-management-explained')
  and not exists (select 1 from article_translations t3 where t3.article_id = art.id and t3.locale='en');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'ar',
  'شرح إدارة المخاطر في CISM',
  'شرح-ادارة-المخاطر-في-cism',
  'يتعامل المجال الثاني من CISM مع إدارة المخاطر كبرنامج تبنيه وتشغّله، لا حساباً تجريه على أصل واحد.',
  $m6ar$
<p>يتمحور محتوى المخاطر في CISSP (راجع <a href="/insights/cissp-risk-management-explained">شرح إدارة المخاطر في CISSP</a>) حول تحليل ومعالجة مخاطر فردية. يطرح المجال الثاني من CISM سؤالاً أوسع: كيف تبني وتشغّل برنامج إدارة مخاطر عبر المؤسسة بأكملها، بثبات، عبر الزمن؟</p>
<h2>ما الذي تتضمنه إدارة المخاطر "على مستوى البرنامج"</h2>
<div class="content-checklist">
<ul>
<li>إطار ومنهجية محددة لإدارة المخاطر تُطبَّق بثبات عبر وحدات الأعمال</li>
<li>سجل مخاطر يُصان ويُراجَع بوتيرة منتظمة، لا يُبنى مرة واحدة ويُنسى</li>
<li>حدود تصعيد واضحة: أي المخاطر تتطلب علم التنفيذيين/مجلس الإدارة مقابل القبول على المستوى التشغيلي</li>
<li>التكامل مع إدارة المخاطر المؤسسية (ERM) -- مخاطر الأمن مُدخل واحد ضمن المخاطر التنظيمية الشاملة، لا وحدة معزولة</li>
</ul>
</div>
<h2>شهية المخاطرة مقابل قرارات المخاطرة الفردية</h2>
<p>تتوقع CISM منك التمييز بين شهية المخاطرة الإجمالية للمؤسسة (حد تضعه الحوكمة) وقرار قبول مخاطرة فردية (إجراء تشغيلي ضمن ذلك الحد). البرنامج الذي يسمح للفرق الفردية بتحديد تحمّلها الخاص للمخاطر دون الرجوع إلى شهية على مستوى المؤسسة هو عيب في تصميم البرنامج يتوقع الاختبار منك التعرف عليه.</p>
  $m6ar$,
  'شرح إدارة المخاطر في CISM | CyberAbeer',
  'المجال الثاني من CISM: بناء وتشغيل إطار إدارة مخاطر على مستوى البرنامج، وشهية المخاطرة، والتكامل مع إدارة المخاطر المؤسسية.',
  4
from articles art
join authors a on a.id = art.author_id
join categories c on c.id = art.category_id
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_cism'
  and exists (select 1 from article_translations t2 where t2.article_id = art.id and t2.locale='en' and t2.slug='cism-risk-management-explained')
  and not exists (select 1 from article_translations t3 where t3.article_id = art.id and t3.locale='ar');

-- =======================================================================
-- M7. CISM Incident Management Explained
-- =======================================================================
insert into articles (id, author_id, category_id, status, schema_type, difficulty, audience, reviewed_at, published_at)
select gen_random_uuid(), a.id, c.id, 'published', 'Article', 'intermediate', array['professionals','ciso'], now(), now()
from authors a, categories c
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_cism'
  and not exists (select 1 from article_translations t where t.locale='en' and t.slug='cism-incident-management-explained');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'en',
  'CISM Incident Management Explained',
  'cism-incident-management-explained',
  'CISM Domain 4 tests whether you can design the incident management capability itself -- not run a single incident response.',
  $m7en$
<p>Domain 4 is the largest single CISM domain alongside Domain 3, and it is frequently misread by candidates who assume it mirrors CISSP's technical incident response content. CISM tests program design and readiness, not step-by-step technical response.</p>
<h2>What CISM expects you to design</h2>
<div class="content-checklist">
<ul>
<li>An incident response plan with defined roles, escalation paths, and executive/board notification triggers</li>
<li>A tested plan -- tabletop exercises and simulations that validate readiness before a real incident, not just a document on a shelf</li>
<li>Business continuity and disaster recovery integration -- incident management does not operate independently of BCP/DR</li>
<li>Post-incident review that feeds structural improvements back into governance and risk management, closing the loop with Domains 1 and 2</li>
</ul>
</div>
<div class="content-callout">
  <div class="content-callout-title">Dr. Abeer Explains</div>
  <p>A capability that has never been tested is not a readiness plan -- it is an assumption. CISM questions frequently present a well-written incident plan that has never been exercised, and the correct answer usually flags the lack of testing as the actual gap, not the document's content.</p>
</div>
  $m7en$,
  'CISM Incident Management Explained | CyberAbeer',
  'CISM Domain 4: designing and testing an incident management program, BCP/DR integration, and post-incident governance feedback.',
  4
from articles art
join authors a on a.id = art.author_id
join categories c on c.id = art.category_id
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_cism'
  and exists (select 1 from article_translations t2 where t2.article_id = art.id and t2.locale='en' and t2.slug='cism-incident-management-explained')
  and not exists (select 1 from article_translations t3 where t3.article_id = art.id and t3.locale='en');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'ar',
  'شرح إدارة الحوادث في CISM',
  'شرح-ادارة-الحوادث-في-cism',
  'يختبر المجال الرابع من CISM ما إذا كنت تستطيع تصميم قدرة إدارة الحوادث نفسها -- لا تشغيل استجابة حادثة واحدة.',
  $m7ar$
<p>المجال الرابع هو أكبر مجال منفرد في CISM إلى جانب المجال الثالث، ويُساء فهمه غالباً من قبل المرشحين الذين يفترضون أنه يماثل محتوى الاستجابة التقنية للحوادث في CISSP. تختبر CISM تصميم البرنامج وجاهزيته، لا الاستجابة التقنية خطوة بخطوة.</p>
<h2>ما الذي تتوقع CISM منك تصميمه</h2>
<div class="content-checklist">
<ul>
<li>خطة استجابة للحوادث بأدوار محددة ومسارات تصعيد ومحفزات إشعار للتنفيذيين/مجلس الإدارة</li>
<li>خطة مُختبَرة -- تمارين محاكاة ومناورات تتحقق من الجاهزية قبل وقوع حادثة حقيقية، لا مجرد وثيقة على الرف</li>
<li>تكامل مع استمرارية الأعمال والتعافي من الكوارث -- لا تعمل إدارة الحوادث بمعزل عن BCP/DR</li>
<li>مراجعة ما بعد الحادثة تُغذّي تحسينات هيكلية إلى الحوكمة وإدارة المخاطر، لتُغلق الحلقة مع المجالين الأول والثاني</li>
</ul>
</div>
<div class="content-callout">
  <div class="content-callout-title">د. عبير توضح</div>
  <p>القدرة التي لم تُختبَر يوماً ليست خطة جاهزية -- بل افتراض. تعرض أسئلة CISM غالباً خطة حوادث مكتوبة جيداً لكنها لم تُمارَس قط، والإجابة الصحيحة عادة ما تشير إلى غياب الاختبار كالفجوة الفعلية، لا محتوى الوثيقة.</p>
</div>
  $m7ar$,
  'شرح إدارة الحوادث في CISM | CyberAbeer',
  'المجال الرابع من CISM: تصميم واختبار برنامج إدارة الحوادث، والتكامل مع BCP/DR، والتغذية الراجعة الحوكمية بعد الحادثة.',
  4
from articles art
join authors a on a.id = art.author_id
join categories c on c.id = art.category_id
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_cism'
  and exists (select 1 from article_translations t2 where t2.article_id = art.id and t2.locale='en' and t2.slug='cism-incident-management-explained')
  and not exists (select 1 from article_translations t3 where t3.article_id = art.id and t3.locale='ar');

-- =======================================================================
-- Sources + relations
-- =======================================================================
insert into article_sources (article_id, title, publisher, url, published_date, accessed_date, sort_order)
select t.article_id, v.title, v.publisher, v.url, v.published_date::date, current_date, v.sort_order
from (values
  ('cism-domains-explained', 'CISM Certification | Certified Information Security Manager', 'ISACA', 'https://www.isaca.org/credentialing/cism', null, 1)
) as v(slug, title, publisher, url, published_date, sort_order)
join article_translations t on t.locale='en' and t.slug = v.slug
on conflict do nothing;

insert into article_relations (article_id, related_article_id, sort_order)
select src.article_id, dst.article_id, r.sort_order
from (values
  ('what-is-cism', 'cism-domains-explained', 1),
  ('what-is-cism', 'cissp-vs-cism', 2),
  ('cism-domains-explained', 'information-security-governance-for-cism', 1),
  ('cism-domains-explained', 'how-to-prepare-for-cism', 2),
  ('cissp-vs-cism', 'cissp-vs-cism-vs-ceh-which-certification-first', 1),
  ('cissp-vs-cism', 'what-is-cissp', 2),
  ('how-to-prepare-for-cism', 'information-security-governance-for-cism', 1),
  ('information-security-governance-for-cism', 'cism-risk-management-explained', 1),
  ('cism-risk-management-explained', 'cissp-risk-management-explained', 1),
  ('cism-risk-management-explained', 'cism-incident-management-explained', 2),
  ('cism-incident-management-explained', 'cissp-security-operations-concepts', 1)
) as r(src_slug, dst_slug, sort_order)
join article_translations src on src.locale='en' and src.slug=r.src_slug
join article_translations dst on dst.locale='en' and dst.slug=r.dst_slug
on conflict (article_id, related_article_id) do nothing;
