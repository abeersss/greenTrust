-- Migration 018: CISSP Hub -- 10 bilingual articles
-- =============================================================
-- All articles: status='published', reviewed_at/published_at=now() at
-- insert time (the founder's "publish directly, no article-by-article
-- approval" directive from the Phase 2 content strategy). Practice
-- questions are 100% original CyberAbeer scenarios -- never reproduced,
-- recalled, or paraphrased real exam content -- and always followed by
-- reasoning (why best / why the others are weaker / exam mindset /
-- real-world application), per the founder's explicit instruction.
-- Uses only pre-existing body classes: content-callout,
-- content-callout-title, content-checklist, content-comparison-table,
-- content-decision-table. "Dr. Abeer Explains" and practice-question
-- blocks are content-callout variants distinguished by their title
-- text, not new CSS.

-- =======================================================================
-- C1. What Is CISSP?
-- =======================================================================
insert into articles (id, author_id, category_id, status, schema_type, difficulty, audience, reviewed_at, published_at)
select gen_random_uuid(), a.id, c.id, 'published', 'Article', 'beginner', array['students','professionals'], now(), now()
from authors a, categories c
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_cissp'
  and not exists (select 1 from article_translations t where t.locale='en' and t.slug='what-is-cissp');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'en',
  'What Is CISSP?',
  'what-is-cissp',
  'CISSP is a management-level certification for experienced security practitioners. Here is what it actually certifies, who it is for, and what it is not.',
  $c1en$
<p>CISSP (Certified Information Systems Security Professional) is a vendor-neutral certification issued by (ISC)&sup2;, aimed at people who design, implement, and manage an organization's overall security program rather than people who only configure a single tool. It is widely treated as the benchmark certification for senior security practitioners and is a common requirement for roles like security manager, security architect, and CISO-track positions.</p>
<h2>What it certifies</h2>
<p>CISSP tests breadth across eight domains that span governance, risk, architecture, network security, identity, and operations. It is deliberately a generalist certification: it does not certify that you can operate a specific firewall or SIEM, it certifies that you understand how all the pieces of a security program fit together and can make sound decisions across them.</p>
<div class="content-callout">
  <div class="content-callout-title">Who it is for</div>
  <p>(ISC)&sup2; requires a minimum of five years of paid work experience in at least two of the eight domains (four years with a relevant degree or approved credential). This is not an entry-level certification -- it assumes you have already done hands-on security work and are formalizing that experience into a recognized credential.</p>
</div>
<h2>What CISSP is not</h2>
<p>CISSP is not a technical deep-dive credential the way OSCP or a vendor-specific certification is. It will not teach you to write exploit code or configure a specific product. It also is not primarily a management certification the way CISM is -- CISSP sits between the two, covering technical concepts broadly enough that a hands-on practitioner will recognize them, while still being organized around governance and program management.</p>
<h2>Why it matters professionally</h2>
<p>Many government and enterprise security roles list CISSP as a hard requirement, particularly where compliance frameworks reference it directly (for example, U.S. federal DoD 8570/8140 requirements). Beyond specific requirements, it functions as a credible signal to employers that you have broad, verified security knowledge and five-plus years of relevant experience.</p>
  $c1en$,
  'What Is CISSP? | CyberAbeer',
  'What CISSP certifies, who it is for, the experience requirement, and how it differs from CISM and technical certifications.',
  5
from articles art
join authors a on a.id = art.author_id
join categories c on c.id = art.category_id
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_cissp'
  and exists (select 1 from article_translations t2 where t2.article_id = art.id and t2.locale='en' and t2.slug='what-is-cissp')
  and not exists (select 1 from article_translations t3 where t3.article_id = art.id and t3.locale='en');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'ar',
  'ما هي شهادة CISSP؟',
  'ما-هي-شهادة-cissp',
  'CISSP شهادة على مستوى إداري لممارسي الأمن ذوي الخبرة. إليك ما تشهد عليه فعلياً، ولمن هي موجهة، وما لا تشهد عليه.',
  $c1ar$
<p>CISSP (أخصائي أمن نظم المعلومات المعتمد) شهادة محايدة تجاه الموردين تصدرها (ISC)&sup2;، موجهة لمن يصمم وينفذ ويدير برنامج الأمن الشامل للمؤسسة، وليس فقط لمن يهيئ أداة واحدة. تُعد على نطاق واسع الشهادة المرجعية لممارسي الأمن كبار الخبرة، وهي شرط شائع لأدوار مثل مدير الأمن ومهندس الأمن والمسارات المؤدية إلى منصب رئيس أمن المعلومات.</p>
<h2>ما الذي تشهد عليه</h2>
<p>تختبر CISSP الاتساع المعرفي عبر ثمانية مجالات تشمل الحوكمة والمخاطر والبنية المعمارية وأمن الشبكات والهوية والعمليات. وهي عن قصد شهادة عامة: لا تشهد على قدرتك على تشغيل جدار حماية معين أو نظام SIEM محدد، بل تشهد على فهمك لكيفية ترابط أجزاء برنامج الأمن واتخاذ قرارات سليمة بشأنها جميعاً.</p>
<div class="content-callout">
  <div class="content-callout-title">لمن هذه الشهادة</div>
  <p>تشترط (ISC)&sup2; حد أدنى خمس سنوات من الخبرة العملية مدفوعة الأجر في مجالين على الأقل من المجالات الثمانية (أو أربع سنوات مع درجة علمية أو شهادة معتمدة ذات صلة). هذه ليست شهادة للمبتدئين -- فهي تفترض أنك قد مارست العمل الأمني الفعلي بالفعل وأنك الآن توثّق تلك الخبرة في شهادة معترف بها.</p>
</div>
<h2>ما لا تعنيه CISSP</h2>
<p>ليست CISSP شهادة تقنية معمّقة كما هو الحال في OSCP أو شهادات المورّدين المتخصصة. لن تعلّمك كتابة كود استغلال أو تهيئة منتج معين. كما أنها ليست شهادة إدارية بحتة مثل CISM -- بل تقع CISSP بين الاثنتين، إذ تغطي مفاهيم تقنية بما يكفي ليتعرف عليها الممارس التطبيقي، مع بقائها منظمة حول إدارة الحوكمة والبرنامج.</p>
<h2>لماذا تهم مهنياً</h2>
<p>تدرج العديد من الأدوار الأمنية الحكومية والمؤسسية CISSP كشرط إلزامي، خصوصاً حين تشير أطر الامتثال إليها مباشرة (مثل متطلبات وزارة الدفاع الأمريكية DoD 8570/8140). وبصرف النظر عن المتطلبات المحددة، فهي إشارة موثوقة لأصحاب العمل بأن لديك معرفة أمنية واسعة موثّقة وخبرة تتجاوز خمس سنوات.</p>
  $c1ar$,
  'ما هي شهادة CISSP؟ | CyberAbeer',
  'ما الذي تشهد عليه CISSP، ولمن هي موجهة، ومتطلبات الخبرة، وكيف تختلف عن CISM والشهادات التقنية.',
  5
from articles art
join authors a on a.id = art.author_id
join categories c on c.id = art.category_id
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_cissp'
  and exists (select 1 from article_translations t2 where t2.article_id = art.id and t2.locale='en' and t2.slug='what-is-cissp')
  and not exists (select 1 from article_translations t3 where t3.article_id = art.id and t3.locale='ar');

-- =======================================================================
-- C2. CISSP Domains Explained
-- =======================================================================
insert into articles (id, author_id, category_id, status, schema_type, difficulty, audience, reviewed_at, published_at)
select gen_random_uuid(), a.id, c.id, 'published', 'Article', 'beginner', array['students','professionals'], now(), now()
from authors a, categories c
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_cissp'
  and not exists (select 1 from article_translations t where t.locale='en' and t.slug='cissp-domains-explained');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'en',
  'CISSP Domains Explained',
  'cissp-domains-explained',
  'CISSP covers eight domains, weighted differently on the exam. Here is what each one covers and roughly how much of the exam it represents.',
  $c2en$
<p>The CISSP Common Body of Knowledge (CBK) is organized into eight domains. (ISC)&sup2; publishes approximate exam weightings, which shift slightly between exam outline revisions -- always check the current official outline before finalizing a study plan.</p>
<table class="content-comparison-table">
<thead><tr><th>Domain</th><th>Focus</th><th>Approx. weight</th></tr></thead>
<tbody>
<tr><td>1. Security and Risk Management</td><td>Governance, legal/regulatory, risk management, policy, BCP/DR</td><td>~15%</td></tr>
<tr><td>2. Asset Security</td><td>Classifying, owning, and protecting information and assets</td><td>~10%</td></tr>
<tr><td>3. Security Architecture and Engineering</td><td>Secure design principles, cryptography, physical security</td><td>~13%</td></tr>
<tr><td>4. Communication and Network Security</td><td>Network architecture, protocols, secure communications</td><td>~13%</td></tr>
<tr><td>5. Identity and Access Management (IAM)</td><td>Identity lifecycle, authentication, authorization models</td><td>~13%</td></tr>
<tr><td>6. Security Assessment and Testing</td><td>Audit strategies, vulnerability assessment, test types</td><td>~12%</td></tr>
<tr><td>7. Security Operations</td><td>Incident response, DFIR, logging/monitoring, recovery</td><td>~13%</td></tr>
<tr><td>8. Software Development Security</td><td>Secure SDLC, application security controls</td><td>~11%</td></tr>
</tbody>
</table>
<h2>Reading the weightings correctly</h2>
<p>No single domain dominates the exam -- the highest is around 15%, and most sit between 10-13%. This is intentional: (ISC)&sup2; is testing whether you can reason across the whole program, not whether you memorized one heavily weighted section. A study plan that skips a "smaller" domain to over-invest in a favorite one usually backfires.</p>
<div class="content-callout">
  <div class="content-callout-title">Dr. Abeer Explains</div>
  <p>Candidates who come from a technical background often assume Domain 4 (networking) or Domain 5 (IAM) will be the hard part, and are surprised when Domain 1 questions -- pure governance and risk reasoning -- are what trips them up. The domains you already do at work are rarely the ones that need the most study time; the domains outside your day-to-day are.</p>
</div>
  $c2en$,
  'CISSP Domains Explained | CyberAbeer',
  'The 8 CISSP domains, what each covers, and approximate exam weighting, with guidance on how to study across all of them.',
  5
from articles art
join authors a on a.id = art.author_id
join categories c on c.id = art.category_id
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_cissp'
  and exists (select 1 from article_translations t2 where t2.article_id = art.id and t2.locale='en' and t2.slug='cissp-domains-explained')
  and not exists (select 1 from article_translations t3 where t3.article_id = art.id and t3.locale='en');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'ar',
  'شرح مجالات CISSP',
  'شرح-مجالات-cissp',
  'تغطي CISSP ثمانية مجالات بأوزان مختلفة في الاختبار. إليك ما يغطيه كل مجال وحصته التقريبية من الاختبار.',
  $c2ar$
<p>تنظَّم مدونة المعرفة الشاملة (CBK) لشهادة CISSP في ثمانية مجالات. تنشر (ISC)&sup2; أوزاناً تقريبية للاختبار، تتغير قليلاً بين مراجعات مخطط الاختبار -- تحقق دائماً من المخطط الرسمي الحالي قبل وضع خطة الدراسة النهائية.</p>
<table class="content-comparison-table">
<thead><tr><th>المجال</th><th>التركيز</th><th>الوزن التقريبي</th></tr></thead>
<tbody>
<tr><td>1. إدارة الأمن والمخاطر</td><td>الحوكمة والجوانب القانونية والتنظيمية وإدارة المخاطر والسياسات واستمرارية الأعمال</td><td>~15%</td></tr>
<tr><td>2. أمن الأصول</td><td>تصنيف وامتلاك وحماية المعلومات والأصول</td><td>~10%</td></tr>
<tr><td>3. هندسة وبنية الأمن</td><td>مبادئ التصميم الآمن والتشفير والأمن المادي</td><td>~13%</td></tr>
<tr><td>4. أمن الاتصالات والشبكات</td><td>بنية الشبكة والبروتوكولات والاتصالات الآمنة</td><td>~13%</td></tr>
<tr><td>5. إدارة الهوية والوصول (IAM)</td><td>دورة حياة الهوية والمصادقة ونماذج التفويض</td><td>~13%</td></tr>
<tr><td>6. تقييم واختبار الأمن</td><td>استراتيجيات التدقيق وتقييم الثغرات وأنواع الاختبار</td><td>~12%</td></tr>
<tr><td>7. عمليات الأمن</td><td>الاستجابة للحوادث والتحقيق الجنائي الرقمي والمراقبة والتعافي</td><td>~13%</td></tr>
<tr><td>8. أمن تطوير البرمجيات</td><td>دورة حياة تطوير آمنة وضوابط أمن التطبيقات</td><td>~11%</td></tr>
</tbody>
</table>
<h2>القراءة الصحيحة للأوزان</h2>
<p>لا يهيمن مجال واحد على الاختبار -- أعلى وزن نحو 15%، ومعظم المجالات تتراوح بين 10-13%. هذا مقصود: تختبر (ISC)&sup2; قدرتك على التفكير عبر البرنامج بأكمله، لا حفظك لقسم واحد مرتفع الوزن. خطة الدراسة التي تتجاهل مجالاً "أصغر" لتستثمر أكثر في مجال مفضّل غالباً ما تأتي بنتائج عكسية.</p>
<div class="content-callout">
  <div class="content-callout-title">د. عبير توضح</div>
  <p>المرشحون ذوو الخلفية التقنية يفترضون غالباً أن المجال الرابع (الشبكات) أو الخامس (إدارة الهوية والوصول) سيكون الجزء الأصعب، ويتفاجؤون حين تكون أسئلة المجال الأول -- الحوكمة الصرفة والتفكير في المخاطر -- هي ما يعثرهم. المجالات التي تمارسها بالفعل في عملك نادراً ما تكون الأكثر حاجة لوقت الدراسة؛ بل المجالات خارج عملك اليومي.</p>
</div>
  $c2ar$,
  'شرح مجالات CISSP | CyberAbeer',
  'مجالات CISSP الثمانية وما يغطيه كل منها والوزن التقريبي في الاختبار، مع إرشادات للدراسة عبرها جميعاً.',
  5
from articles art
join authors a on a.id = art.author_id
join categories c on c.id = art.category_id
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_cissp'
  and exists (select 1 from article_translations t2 where t2.article_id = art.id and t2.locale='en' and t2.slug='cissp-domains-explained')
  and not exists (select 1 from article_translations t3 where t3.article_id = art.id and t3.locale='ar');

-- =======================================================================
-- C3. How to Prepare for CISSP
-- =======================================================================
insert into articles (id, author_id, category_id, status, schema_type, difficulty, audience, reviewed_at, published_at)
select gen_random_uuid(), a.id, c.id, 'published', 'Article', 'intermediate', array['students','professionals'], now(), now()
from authors a, categories c
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_cissp'
  and not exists (select 1 from article_translations t where t.locale='en' and t.slug='how-to-prepare-for-cissp');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'en',
  'How to Prepare for CISSP',
  'how-to-prepare-for-cissp',
  'CISSP prep fails most often for the same three reasons: passive reading, ignoring the "manager mindset," and skipping practice questions. Here is a realistic approach.',
  $c3en$
<p>Most CISSP candidates fail not because they lack the underlying knowledge, but because of how they prepared. The exam rewards a specific way of thinking, and preparation that does not train that thinking will underperform even for experienced practitioners.</p>
<h2>1. Learn the material, then unlearn "how we do it here"</h2>
<p>CISSP questions are written from a generic best-practice standpoint, not your employer's specific process. A control that works fine at your organization for pragmatic reasons is not automatically the "textbook correct" answer. Study the CBK's framing before assuming your workplace habits transfer directly.</p>
<h2>2. Read for the "manager mindset," not the technical answer</h2>
<p>CISSP consistently rewards the answer that a security manager balancing risk, cost, and business impact would choose -- not necessarily the most technically thorough option. If two answers are both technically valid, the one that best serves organizational risk management is usually correct.</p>
<h2>3. Practice questions are not optional</h2>
<p>Reading domain material without working through scenario questions leaves a gap between "I recognize this concept" and "I can apply it under exam conditions." Budget real time for practice questions, and review wrong answers for the reasoning, not just the correct choice.</p>
<div class="content-checklist">
<p><strong>A realistic prep sequence:</strong></p>
<ul>
<li>Read one domain at a time, in order of your personal weakest areas first</li>
<li>After each domain, do 25-50 scenario questions on that domain only</li>
<li>Keep a running list of concepts you get wrong twice -- that list becomes your final-week review</li>
<li>In the final two weeks, shift to full-length timed practice exams</li>
<li>Review every missed question for *why* the correct answer was correct, not just that it was</li>
</ul>
</div>
<p>See <a href="/insights/cissp-study-plan">CISSP Study Plan</a> for a suggested week-by-week timeline, and <a href="/insights/cissp-scenario-based-questions-think-like-a-manager">CISSP Scenario-Based Questions</a> to practice the reasoning pattern directly.</p>
  $c3en$,
  'How to Prepare for CISSP | CyberAbeer',
  'A realistic CISSP preparation approach: why most candidates fail, the manager mindset the exam rewards, and a practical study sequence.',
  6
from articles art
join authors a on a.id = art.author_id
join categories c on c.id = art.category_id
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_cissp'
  and exists (select 1 from article_translations t2 where t2.article_id = art.id and t2.locale='en' and t2.slug='how-to-prepare-for-cissp')
  and not exists (select 1 from article_translations t3 where t3.article_id = art.id and t3.locale='en');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'ar',
  'كيف تستعد لاختبار CISSP',
  'كيف-تستعد-لاختبار-cissp',
  'يفشل الاستعداد لـCISSP غالباً لثلاثة أسباب متكررة: القراءة السلبية، وتجاهل "عقلية المدير"، وتخطي الأسئلة التدريبية. إليك نهج واقعي.',
  $c3ar$
<p>لا يفشل معظم مرشحي CISSP بسبب نقص المعرفة الأساسية، بل بسبب طريقة استعدادهم. يكافئ الاختبار طريقة تفكير محددة، والاستعداد الذي لا يدرّب على تلك الطريقة سيقصّر حتى مع الممارسين ذوي الخبرة.</p>
<h2>1. تعلّم المادة ثم تخلَّ عن "هكذا نفعلها هنا"</h2>
<p>تُكتب أسئلة CISSP من منظور أفضل الممارسات العامة، لا عملية جهة عملك المحددة. الضابط الذي يعمل بشكل جيد في مؤسستك لأسباب عملية ليس بالضرورة "الإجابة الصحيحة الكتابية". ادرس إطار CBK قبل افتراض أن عادات مكان عملك تنتقل مباشرة.</p>
<h2>2. اقرأ من منظور "عقلية المدير"، لا الإجابة التقنية</h2>
<p>تكافئ CISSP باستمرار الإجابة التي يختارها مدير أمن يوازن بين المخاطر والتكلفة والأثر على الأعمال -- وليس بالضرورة الخيار الأكثر تفصيلاً تقنياً. إذا كانت إجابتان صحيحتين تقنياً، فالإجابة التي تخدم إدارة مخاطر المؤسسة بشكل أفضل هي عادة الصحيحة.</p>
<h2>3. الأسئلة التدريبية ليست اختيارية</h2>
<p>قراءة مادة المجال دون حل أسئلة سيناريو تترك فجوة بين "أتعرّف على هذا المفهوم" و"أستطيع تطبيقه تحت ظروف الاختبار". خصّص وقتاً حقيقياً للأسئلة التدريبية، وراجع الإجابات الخاطئة لفهم المنطق، لا فقط لمعرفة الخيار الصحيح.</p>
<div class="content-checklist">
<p><strong>تسلسل استعداد واقعي:</strong></p>
<ul>
<li>اقرأ مجالاً واحداً في كل مرة، مبتدئاً بأضعف مجالاتك الشخصية</li>
<li>بعد كل مجال، حل 25-50 سؤال سيناريو على ذلك المجال فقط</li>
<li>احتفظ بقائمة مستمرة بالمفاهيم التي تخطئ فيها مرتين -- تصبح هذه القائمة مراجعتك للأسبوع الأخير</li>
<li>في الأسبوعين الأخيرين، انتقل إلى اختبارات تدريبية كاملة محدَّدة زمنياً</li>
<li>راجع كل سؤال أخطأت فيه لفهم *لماذا* كانت الإجابة الصحيحة صحيحة، لا فقط أنها كانت كذلك</li>
</ul>
</div>
<p>راجع <a href="/ar/insights/خطة-دراسة-cissp">خطة دراسة CISSP</a> لجدول زمني مقترح أسبوعاً بأسبوع، و<a href="/ar/insights/اسئلة-cissp-السيناريو-التفكير-كمدير">أسئلة CISSP السيناريو</a> للتدرب مباشرة على نمط التفكير.</p>
  $c3ar$,
  'كيف تستعد لاختبار CISSP | CyberAbeer',
  'نهج واقعي للاستعداد لـCISSP: لماذا يفشل معظم المرشحين، وعقلية المدير التي يكافئها الاختبار، وتسلسل دراسة عملي.',
  6
from articles art
join authors a on a.id = art.author_id
join categories c on c.id = art.category_id
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_cissp'
  and exists (select 1 from article_translations t2 where t2.article_id = art.id and t2.locale='en' and t2.slug='how-to-prepare-for-cissp')
  and not exists (select 1 from article_translations t3 where t3.article_id = art.id and t3.locale='ar');

-- =======================================================================
-- C4. CISSP Study Plan
-- =======================================================================
insert into articles (id, author_id, category_id, status, schema_type, difficulty, audience, reviewed_at, published_at)
select gen_random_uuid(), a.id, c.id, 'published', 'Article', 'intermediate', array['students','professionals'], now(), now()
from authors a, categories c
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_cissp'
  and not exists (select 1 from article_translations t where t.locale='en' and t.slug='cissp-study-plan');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'en',
  'CISSP Study Plan',
  'cissp-study-plan',
  'A suggested 12-week CISSP study timeline for someone studying part-time alongside a full-time job. Adjust the pace, not the sequence.',
  $c4en$
<p>This plan assumes roughly 8-10 hours per week of study time, which is realistic for a working professional. If you have more or less time, compress or extend the weeks proportionally -- but keep the sequence, since later weeks depend on earlier ones.</p>
<table class="content-decision-table">
<thead><tr><th>Weeks</th><th>Focus</th></tr></thead>
<tbody>
<tr><td>1-2</td><td>Domain 1: Security and Risk Management (governance, legal, policy)</td></tr>
<tr><td>3</td><td>Domain 2: Asset Security</td></tr>
<tr><td>4-5</td><td>Domain 3: Security Architecture and Engineering (cryptography is dense -- give it real time)</td></tr>
<tr><td>6</td><td>Domain 4: Communication and Network Security</td></tr>
<tr><td>7</td><td>Domain 5: Identity and Access Management</td></tr>
<tr><td>8</td><td>Domain 6: Security Assessment and Testing</td></tr>
<tr><td>9</td><td>Domain 7: Security Operations</td></tr>
<tr><td>10</td><td>Domain 8: Software Development Security</td></tr>
<tr><td>11</td><td>Full review pass -- revisit your "missed twice" list from every domain</td></tr>
<tr><td>12</td><td>Full-length timed practice exams, exam-day logistics, rest before the exam</td></tr>
</tbody>
</table>
<h2>Where people go wrong with the schedule</h2>
<p>The most common failure is not the domain order -- it is skipping weeks 11-12. Candidates who study each domain well individually but never take a full-length timed exam are frequently surprised by exam pacing and question fatigue. Protect those final two weeks; do not let earlier domains bleed into them.</p>
<div class="content-callout">
  <div class="content-callout-title">Adjusting for your background</div>
  <p>If you have deep hands-on experience in a domain (for example, years running network operations), you can compress that week and reallocate the time to a domain that is genuinely new to you, such as legal/regulatory content in Domain 1 for a purely technical practitioner.</p>
</div>
  $c4en$,
  'CISSP Study Plan | CyberAbeer',
  'A realistic 12-week CISSP study schedule for working professionals, domain by domain, with guidance on adjusting the pace.',
  5
from articles art
join authors a on a.id = art.author_id
join categories c on c.id = art.category_id
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_cissp'
  and exists (select 1 from article_translations t2 where t2.article_id = art.id and t2.locale='en' and t2.slug='cissp-study-plan')
  and not exists (select 1 from article_translations t3 where t3.article_id = art.id and t3.locale='en');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'ar',
  'خطة دراسة CISSP',
  'خطة-دراسة-cissp',
  'جدول زمني مقترح لمدة 12 أسبوعاً لدراسة CISSP لمن يدرس بدوام جزئي إلى جانب وظيفة بدوام كامل. عدّل الوتيرة لا التسلسل.',
  $c4ar$
<p>تفترض هذه الخطة نحو 8-10 ساعات أسبوعياً من وقت الدراسة، وهو واقعي لموظف عامل. إذا كان لديك وقت أكثر أو أقل، اضغط الأسابيع أو مدّدها بشكل متناسب -- لكن حافظ على التسلسل، لأن الأسابيع اللاحقة تعتمد على السابقة.</p>
<table class="content-decision-table">
<thead><tr><th>الأسابيع</th><th>التركيز</th></tr></thead>
<tbody>
<tr><td>1-2</td><td>المجال 1: إدارة الأمن والمخاطر (الحوكمة، القانون، السياسات)</td></tr>
<tr><td>3</td><td>المجال 2: أمن الأصول</td></tr>
<tr><td>4-5</td><td>المجال 3: هندسة وبنية الأمن (التشفير كثيف -- امنحه وقتاً حقيقياً)</td></tr>
<tr><td>6</td><td>المجال 4: أمن الاتصالات والشبكات</td></tr>
<tr><td>7</td><td>المجال 5: إدارة الهوية والوصول</td></tr>
<tr><td>8</td><td>المجال 6: تقييم واختبار الأمن</td></tr>
<tr><td>9</td><td>المجال 7: عمليات الأمن</td></tr>
<tr><td>10</td><td>المجال 8: أمن تطوير البرمجيات</td></tr>
<tr><td>11</td><td>جولة مراجعة شاملة -- راجع قائمة "الأخطاء المتكررة" من كل مجال</td></tr>
<tr><td>12</td><td>اختبارات تدريبية كاملة محدَّدة زمنياً، ولوجستيات يوم الاختبار، والراحة قبل الاختبار</td></tr>
</tbody>
</table>
<h2>أين يخطئ الناس في الجدول</h2>
<p>الخطأ الأكثر شيوعاً ليس ترتيب المجالات -- بل تخطي الأسبوعين 11-12. المرشحون الذين يدرسون كل مجال جيداً على حدة لكن لا يخوضون أبداً اختباراً تدريبياً كاملاً محدَّداً زمنياً غالباً ما يُفاجَؤون بوتيرة الاختبار وإرهاق الأسئلة. احمِ هذين الأسبوعين الأخيرين؛ لا تدع المجالات السابقة تمتد إليهما.</p>
<div class="content-callout">
  <div class="content-callout-title">التعديل حسب خلفيتك</div>
  <p>إذا كانت لديك خبرة عملية عميقة في مجال معين (مثل سنوات في تشغيل الشبكات)، يمكنك ضغط ذلك الأسبوع وإعادة توزيع الوقت على مجال جديد فعلياً بالنسبة لك، مثل المحتوى القانوني والتنظيمي في المجال الأول لممارس تقني بحت.</p>
</div>
  $c4ar$,
  'خطة دراسة CISSP | CyberAbeer',
  'جدول دراسة واقعي لـCISSP لمدة 12 أسبوعاً للموظفين العاملين، مجالاً بمجال، مع إرشادات لتعديل الوتيرة.',
  5
from articles art
join authors a on a.id = art.author_id
join categories c on c.id = art.category_id
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_cissp'
  and exists (select 1 from article_translations t2 where t2.article_id = art.id and t2.locale='en' and t2.slug='cissp-study-plan')
  and not exists (select 1 from article_translations t3 where t3.article_id = art.id and t3.locale='ar');

-- =======================================================================
-- C5. CISSP Scenario-Based Questions: How to Think Like a Manager
-- (primary original-practice-question article for the CISSP hub)
-- =======================================================================
insert into articles (id, author_id, category_id, status, schema_type, difficulty, audience, reviewed_at, published_at)
select gen_random_uuid(), a.id, c.id, 'published', 'Article', 'intermediate', array['students','professionals'], now(), now()
from authors a, categories c
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_cissp'
  and not exists (select 1 from article_translations t where t.locale='en' and t.slug='cissp-scenario-based-questions-think-like-a-manager');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'en',
  'CISSP Scenario-Based Questions: How to Think Like a Manager',
  'cissp-scenario-based-questions-think-like-a-manager',
  'Three original CyberAbeer practice scenarios that train the reasoning CISSP actually rewards: balancing risk, cost, and business impact.',
  $c5en$
<p>CISSP scenario questions rarely have one "technically correct" answer among clearly wrong ones. Instead, several answers are technically defensible, and the exam wants the one a security manager would choose given limited budget, business context, and organizational risk appetite. These three original scenarios are written to train that specific skill. They are not recalled or paraphrased exam content -- they are CyberAbeer originals built to practice the same reasoning pattern.</p>

<div class="content-callout">
  <div class="content-callout-title">Scenario 1</div>
  <p>A mid-size company's security team identifies a moderate-severity vulnerability in an internal HR application. Patching requires a maintenance window that will take the system offline for four hours during business hours next week; the vendor's patch has not yet been tested in the company's staging environment. What should the security manager recommend?</p>
  <ol>
    <li>Apply the patch immediately in production to close the vulnerability as fast as possible</li>
    <li>Test the patch in staging first, then schedule the production maintenance window with the business, communicating the risk in the interim</li>
    <li>Wait for the next regularly scheduled quarterly patch cycle</li>
    <li>Take the HR application offline now until the patch is fully validated</li>
  </ol>
</div>
<p><strong>Best answer: 2.</strong></p>
<p><strong>Why this answer is best:</strong> it balances the actual severity (moderate, not critical/actively exploited) against operational impact, validates the change before touching production, and keeps the business informed rather than acting unilaterally or ignoring the risk.</p>
<p><strong>Why the other options are weaker:</strong> Option 1 skips validation and risks an outage or bug from an untested patch -- disproportionate for a moderate finding. Option 3 accepts risk for a potentially long window with no compensating control or communicated rationale. Option 4 is a business-impact-blind overreaction to a moderate (not critical) finding.</p>
<p><strong>Exam mindset:</strong> when severity is not "critical" or "actively exploited in the wild," the exam almost always rewards a controlled, tested, communicated response over the fastest possible one.</p>
<p><strong>Real-world application:</strong> this is the same judgment call security managers make constantly -- most vulnerabilities are not emergencies, and treating every one as an emergency erodes the business's trust in the security team's risk calibration.</p>

<div class="content-callout">
  <div class="content-callout-title">Scenario 2</div>
  <p>During an internal audit, you discover that a department has been sharing a single shared administrator account among six people for two years, with no individual accountability for actions taken. The department head argues that individual accounts would slow down their workflow. What is the most appropriate first step?</p>
  <ol>
    <li>Immediately disable the shared account without notice</li>
    <li>Document the finding as a control deficiency, and work with the department to design individual accounts with role-based access that meets their workflow needs</li>
    <li>Accept the risk since the department has operated this way for two years without incident</li>
    <li>Escalate directly to the department head's manager without first discussing options with the department</li>
  </ol>
</div>
<p><strong>Best answer: 2.</strong></p>
<p><strong>Why this answer is best:</strong> it treats this as a legitimate finding requiring remediation, while working collaboratively toward a fix that preserves both accountability and business function -- the core of good governance.</p>
<p><strong>Why the other options are weaker:</strong> Option 1 risks breaking business operations without warning or a transition plan. Option 3 ignores a real accountability gap simply because it has gone unnoticed -- "no incident yet" is not the same as "no risk." Option 4 skips collaborative problem-solving and escalates prematurely, which damages the working relationship the security function needs long-term.</p>
<p><strong>Exam mindset:</strong> CISSP consistently rewards remediation paths that are collaborative and business-aware over unilateral or purely punitive ones, unless there is active, ongoing harm.</p>
<p><strong>Real-world application:</strong> shared accounts are one of the most common real audit findings; the fix almost always requires working with the business on a workable alternative, not just issuing a mandate.</p>

<div class="content-callout">
  <div class="content-callout-title">Scenario 3</div>
  <p>Your organization is evaluating two vendors for a new cloud storage service. Vendor A is significantly cheaper and offers strong technical controls but has no independent third-party security certification. Vendor B costs more but holds a current SOC 2 Type II report. Data to be stored is customer PII. What should most heavily influence the decision?</p>
  <ol>
    <li>Choose Vendor A because internal technical review found their controls adequate</li>
    <li>Choose Vendor B because the independently verified attestation reduces third-party risk exposure that internal review alone cannot fully assess</li>
    <li>Choose whichever vendor the business stakeholders prefer, since this is a business decision</li>
    <li>Delay the decision indefinitely until a vendor with both low cost and certification appears</li>
  </ol>
</div>
<p><strong>Best answer: 2.</strong></p>
<p><strong>Why this answer is best:</strong> for PII specifically, independent, ongoing assurance (a current SOC 2 Type II) provides a level of verification and an audit trail that an internal one-time technical review cannot match, and it directly supports third-party risk management obligations.</p>
<p><strong>Why the other options are weaker:</strong> Option 1 substitutes internal opinion for independent assurance on a decision involving regulated personal data. Option 3 abdicates the security function's responsibility to inform the risk decision. Option 4 is not a realistic option in most business timelines and avoids making a risk-informed recommendation.</p>
<p><strong>Exam mindset:</strong> when the exam presents a cost-vs-assurance tradeoff involving sensitive data, it is almost always testing whether you recognize the value of independent third-party attestation over internal-only judgment.</p>
<p><strong>Real-world application:</strong> this is standard third-party risk management practice -- SOC 2 Type II, ISO 27001 certification, and similar attestations exist specifically to give customers assurance they cannot fully generate through their own review alone.</p>
  $c5en$,
  'CISSP Scenario-Based Questions | CyberAbeer',
  'Three original CISSP-style practice scenarios with full reasoning: why the best answer wins, why others are weaker, exam mindset, and real-world application.',
  9
from articles art
join authors a on a.id = art.author_id
join categories c on c.id = art.category_id
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_cissp'
  and exists (select 1 from article_translations t2 where t2.article_id = art.id and t2.locale='en' and t2.slug='cissp-scenario-based-questions-think-like-a-manager')
  and not exists (select 1 from article_translations t3 where t3.article_id = art.id and t3.locale='en');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'ar',
  'أسئلة CISSP السيناريو: كيف تفكر كمدير',
  'اسئلة-cissp-السيناريو-التفكير-كمدير',
  'ثلاثة سيناريوهات تدريبية أصلية من CyberAbeer تدرّب على نمط التفكير الذي تكافئه CISSP فعلياً: موازنة المخاطر والتكلفة والأثر على الأعمال.',
  $c5ar$
<p>نادراً ما تحتوي أسئلة سيناريو CISSP على إجابة "صحيحة تقنياً" واحدة وسط إجابات خاطئة بوضوح. بل تكون عدة إجابات مدافَعاً عنها تقنياً، ويريد الاختبار الإجابة التي يختارها مدير أمن في ظل ميزانية محدودة وسياق أعمال وشهية مخاطر مؤسسية. كُتبت هذه السيناريوهات الثلاثة الأصلية لتدريب هذه المهارة تحديداً. هي ليست محتوى اختبار مستذكَراً أو معاد صياغته -- بل سيناريوهات أصلية من CyberAbeer صُممت لممارسة نمط التفكير نفسه.</p>

<div class="content-callout">
  <div class="content-callout-title">السيناريو الأول</div>
  <p>اكتشف فريق أمن شركة متوسطة الحجم ثغرة متوسطة الخطورة في تطبيق داخلي للموارد البشرية. يتطلب التصحيح نافذة صيانة ستُخرج النظام عن الخدمة لأربع ساعات خلال ساعات العمل الأسبوع المقبل؛ ولم يُختبر تصحيح المورّد بعد في بيئة الاختبار الخاصة بالشركة. ماذا ينبغي أن يوصي به مدير الأمن؟</p>
  <ol>
    <li>تطبيق التصحيح فوراً في بيئة الإنتاج لإغلاق الثغرة بأسرع ما يمكن</li>
    <li>اختبار التصحيح أولاً في بيئة الاختبار، ثم جدولة نافذة صيانة الإنتاج مع الأعمال، مع توضيح المخاطرة في الفترة الانتقالية</li>
    <li>الانتظار حتى دورة التصحيح الفصلية المجدولة التالية</li>
    <li>إيقاف تطبيق الموارد البشرية الآن حتى يُتحقَّق من التصحيح بالكامل</li>
  </ol>
</div>
<p><strong>الإجابة الأفضل: 2.</strong></p>
<p><strong>لماذا هذه الإجابة هي الأفضل:</strong> توازن بين الخطورة الفعلية (متوسطة، وليست حرجة أو مستغَلة فعلياً) والأثر التشغيلي، وتتحقق من التغيير قبل لمس بيئة الإنتاج، وتُبقي الأعمال على اطلاع بدلاً من التصرف من جانب واحد أو تجاهل المخاطرة.</p>
<p><strong>لماذا الخيارات الأخرى أضعف:</strong> الخيار 1 يتخطى التحقق ويخاطر بتعطل أو خطأ من تصحيح غير مُختبَر -- غير متناسب مع نتيجة متوسطة. الخيار 3 يقبل المخاطرة لفترة قد تطول دون ضابط تعويضي أو تبرير موصَّل. الخيار 4 رد فعل مبالغ فيه يتجاهل الأثر على الأعمال لنتيجة متوسطة (لا حرجة).</p>
<p><strong>عقلية الاختبار:</strong> حين لا تكون الخطورة "حرجة" أو "مستغَلة فعلياً في البيئة الواقعية"، يكافئ الاختبار دائماً تقريباً الاستجابة المضبوطة والمُختبَرة والمُوصَّلة على أسرع استجابة ممكنة.</p>
<p><strong>التطبيق الواقعي:</strong> هذا هو نفس الحكم الذي يتخذه مديرو الأمن باستمرار -- معظم الثغرات ليست حالات طارئة، ومعاملة كل ثغرة كطارئة يقوّض ثقة الأعمال في معايرة فريق الأمن للمخاطر.</p>

<div class="content-callout">
  <div class="content-callout-title">السيناريو الثاني</div>
  <p>خلال تدقيق داخلي، تكتشف أن قسماً ما يشارك حساب مسؤول واحد بين ستة أشخاص منذ عامين، دون مساءلة فردية عن الإجراءات المتخذة. يجادل رئيس القسم بأن الحسابات الفردية ستبطئ سير العمل. ما الخطوة الأولى الأنسب؟</p>
  <ol>
    <li>تعطيل الحساب المشترك فوراً دون إشعار</li>
    <li>توثيق النتيجة كقصور في الضوابط، والعمل مع القسم لتصميم حسابات فردية بصلاحيات قائمة على الأدوار تلبي احتياجات سير عملهم</li>
    <li>قبول المخاطرة لأن القسم يعمل بهذه الطريقة منذ عامين دون حادثة</li>
    <li>التصعيد مباشرة إلى مدير رئيس القسم دون مناقشة الخيارات مع القسم أولاً</li>
  </ol>
</div>
<p><strong>الإجابة الأفضل: 2.</strong></p>
<p><strong>لماذا هذه الإجابة هي الأفضل:</strong> تتعامل مع هذا كنتيجة حقيقية تتطلب معالجة، مع العمل تعاونياً نحو حل يحافظ على المساءلة ووظيفة الأعمال معاً -- وهذا جوهر الحوكمة الجيدة.</p>
<p><strong>لماذا الخيارات الأخرى أضعف:</strong> الخيار 1 يخاطر بتعطيل العمليات دون إنذار أو خطة انتقالية. الخيار 3 يتجاهل فجوة مساءلة حقيقية لمجرد أنها لم تُلاحَظ -- "لا حادثة بعد" ليست كـ"لا مخاطرة". الخيار 4 يتخطى حل المشكلة تعاونياً ويصعّد مبكراً، مما يضر بعلاقة العمل التي تحتاجها وظيفة الأمن على المدى الطويل.</p>
<p><strong>عقلية الاختبار:</strong> تكافئ CISSP باستمرار مسارات المعالجة التعاونية والواعية بالأعمال على المسارات الأحادية أو العقابية البحتة، ما لم يكن هناك ضرر فعلي ومستمر.</p>
<p><strong>التطبيق الواقعي:</strong> الحسابات المشتركة من أكثر نتائج التدقيق الواقعية شيوعاً؛ والحل يتطلب دائماً تقريباً العمل مع الأعمال لإيجاد بديل عملي، لا مجرد إصدار توجيه.</p>

<div class="content-callout">
  <div class="content-callout-title">السيناريو الثالث</div>
  <p>تُقيّم مؤسستك مورّدَين لخدمة تخزين سحابي جديدة. المورّد أ أرخص بكثير ويقدّم ضوابط تقنية قوية لكن دون شهادة أمنية مستقلة من طرف ثالث. المورّد ب أعلى تكلفة لكنه يحمل تقرير SOC 2 من النوع الثاني ساري المفعول. البيانات المراد تخزينها هي معلومات تعريف شخصية للعملاء. ما الذي ينبغي أن يؤثر بشكل أكبر على القرار؟</p>
  <ol>
    <li>اختيار المورّد أ لأن المراجعة التقنية الداخلية وجدت ضوابطه كافية</li>
    <li>اختيار المورّد ب لأن الشهادة المستقلة المُتحقَّق منها تقلل من تعرّض مخاطر الطرف الثالث بما لا تستطيع المراجعة الداخلية وحدها تقييمه بالكامل</li>
    <li>اختيار المورّد الذي يفضله أصحاب المصلحة من جانب الأعمال، لأن هذا قرار أعمال</li>
    <li>تأجيل القرار إلى أجل غير مسمى حتى يظهر مورّد يجمع بين التكلفة المنخفضة والشهادة</li>
  </ol>
</div>
<p><strong>الإجابة الأفضل: 2.</strong></p>
<p><strong>لماذا هذه الإجابة هي الأفضل:</strong> بالنسبة للمعلومات الشخصية تحديداً، يوفر الضمان المستقل والمستمر (تقرير SOC 2 نوع ثانٍ ساري) مستوى من التحقق ومساراً للتدقيق لا تستطيع مراجعة داخلية لمرة واحدة مضاهاته، ويدعم مباشرة التزامات إدارة مخاطر الطرف الثالث.</p>
<p><strong>لماذا الخيارات الأخرى أضعف:</strong> الخيار 1 يستبدل الرأي الداخلي بالضمان المستقل في قرار يتعلق ببيانات شخصية منظَّمة. الخيار 3 يتخلى عن مسؤولية وظيفة الأمن في إثراء قرار المخاطرة. الخيار 4 ليس خياراً واقعياً في معظم جداول الأعمال الزمنية ويتجنب تقديم توصية مبنية على المخاطر.</p>
<p><strong>عقلية الاختبار:</strong> حين يقدّم الاختبار مفاضلة بين التكلفة والضمان تتعلق ببيانات حساسة، فهو يختبر تقريباً دائماً ما إذا كنت تدرك قيمة الشهادة المستقلة من طرف ثالث على الحكم الداخلي فقط.</p>
<p><strong>التطبيق الواقعي:</strong> هذه ممارسة قياسية لإدارة مخاطر الطرف الثالث -- توجد شهادات مثل SOC 2 نوع ثانٍ وISO 27001 خصيصاً لمنح العملاء ضماناً لا يستطيعون توليده بالكامل من مراجعتهم الخاصة وحدها.</p>
  $c5ar$,
  'أسئلة CISSP السيناريو: كيف تفكر كمدير | CyberAbeer',
  'ثلاثة سيناريوهات تدريبية أصلية على نمط CISSP مع التفكير الكامل: لماذا تفوز الإجابة الأفضل، ولماذا الأخريات أضعف، وعقلية الاختبار، والتطبيق الواقعي.',
  9
from articles art
join authors a on a.id = art.author_id
join categories c on c.id = art.category_id
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_cissp'
  and exists (select 1 from article_translations t2 where t2.article_id = art.id and t2.locale='en' and t2.slug='cissp-scenario-based-questions-think-like-a-manager')
  and not exists (select 1 from article_translations t3 where t3.article_id = art.id and t3.locale='ar');

-- =======================================================================
-- C6. CISSP Risk Management Explained
-- =======================================================================
insert into articles (id, author_id, category_id, status, schema_type, difficulty, audience, reviewed_at, published_at)
select gen_random_uuid(), a.id, c.id, 'published', 'Article', 'intermediate', array['students','professionals'], now(), now()
from authors a, categories c
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_cissp'
  and not exists (select 1 from article_translations t where t.locale='en' and t.slug='cissp-risk-management-explained');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'en',
  'CISSP Risk Management Explained',
  'cissp-risk-management-explained',
  'The risk management vocabulary CISSP expects: risk treatment options, qualitative vs quantitative analysis, and how residual risk fits together.',
  $c6en$
<p>Domain 1 risk management questions hinge on precise vocabulary. Mixing up these terms is one of the most common sources of missed points for otherwise well-prepared candidates.</p>
<h2>The four risk treatment options</h2>
<div class="content-checklist">
<ul>
<li><strong>Mitigate</strong> -- reduce likelihood or impact by implementing a control</li>
<li><strong>Transfer</strong> -- shift financial impact to another party, typically via insurance or contract</li>
<li><strong>Avoid</strong> -- eliminate the risk by not engaging in the activity that creates it</li>
<li><strong>Accept</strong> -- knowingly take no further action, usually because cost of treatment exceeds the risk</li>
</ul>
</div>
<h2>Qualitative vs. quantitative analysis</h2>
<p>Qualitative analysis uses relative ratings (low/medium/high) and is faster but subjective. Quantitative analysis assigns dollar values using formulas like Single Loss Expectancy (SLE = Asset Value &times; Exposure Factor) and Annualized Loss Expectancy (ALE = SLE &times; Annualized Rate of Occurrence). The exam expects you to recognize both approaches and when each is appropriate -- quantitative is more defensible for large capital decisions, qualitative is faster for routine triage.</p>
<h2>Residual risk</h2>
<p>Residual risk is what remains after controls are applied -- it is never zero. A common exam trap is an answer implying a control "eliminates" risk; the more defensible framing is that controls reduce risk to an acceptable residual level, which management then formally accepts.</p>
  $c6en$,
  'CISSP Risk Management Explained | CyberAbeer',
  'CISSP risk management vocabulary: the four risk treatment options, qualitative vs quantitative analysis, SLE/ALE, and residual risk.',
  5
from articles art
join authors a on a.id = art.author_id
join categories c on c.id = art.category_id
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_cissp'
  and exists (select 1 from article_translations t2 where t2.article_id = art.id and t2.locale='en' and t2.slug='cissp-risk-management-explained')
  and not exists (select 1 from article_translations t3 where t3.article_id = art.id and t3.locale='en');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'ar',
  'شرح إدارة المخاطر في CISSP',
  'شرح-ادارة-المخاطر-في-cissp',
  'مفردات إدارة المخاطر التي تتوقعها CISSP: خيارات معالجة المخاطر، التحليل الكيفي مقابل الكمي، وكيف تتلاءم المخاطرة المتبقية.',
  $c6ar$
<p>تتوقف أسئلة إدارة المخاطر في المجال الأول على مفردات دقيقة. الخلط بين هذه المصطلحات من أكثر مصادر فقدان النقاط شيوعاً حتى لدى المرشحين المستعدين جيداً.</p>
<h2>خيارات معالجة المخاطر الأربعة</h2>
<div class="content-checklist">
<ul>
<li><strong>التخفيف (Mitigate)</strong> -- تقليل الاحتمالية أو الأثر بتطبيق ضابط</li>
<li><strong>النقل (Transfer)</strong> -- تحويل الأثر المالي لطرف آخر، عادة عبر التأمين أو العقد</li>
<li><strong>التجنب (Avoid)</strong> -- إزالة المخاطرة بعدم الانخراط في النشاط الذي يسببها</li>
<li><strong>القبول (Accept)</strong> -- عدم اتخاذ إجراء إضافي عن علم، عادة لأن تكلفة المعالجة تتجاوز المخاطرة</li>
</ul>
</div>
<h2>التحليل الكيفي مقابل الكمي</h2>
<p>يستخدم التحليل الكيفي تقييمات نسبية (منخفض/متوسط/مرتفع) وهو أسرع لكن ذاتي. يحدد التحليل الكمي قيماً مالية باستخدام معادلات مثل التوقع المفرد للخسارة (SLE = قيمة الأصل &times; عامل التعرض) والتوقع السنوي للخسارة (ALE = SLE &times; المعدل السنوي للحدوث). يتوقع الاختبار منك التعرف على كلا النهجين ومتى يناسب كل منهما -- الكمي أكثر دفاعاً في قرارات الاستثمار الكبيرة، والكيفي أسرع للفرز الروتيني.</p>
<h2>المخاطرة المتبقية</h2>
<p>المخاطرة المتبقية هي ما يبقى بعد تطبيق الضوابط -- وهي لا تساوي صفراً أبداً. فخ شائع في الاختبار هو إجابة توحي بأن ضابطاً "يُزيل" المخاطرة؛ الصياغة الأكثر دفاعاً هي أن الضوابط تقلل المخاطرة إلى مستوى متبقٍ مقبول، تقبله الإدارة رسمياً بعد ذلك.</p>
  $c6ar$,
  'شرح إدارة المخاطر في CISSP | CyberAbeer',
  'مفردات إدارة المخاطر في CISSP: خيارات المعالجة الأربعة، التحليل الكيفي والكمي، SLE/ALE، والمخاطرة المتبقية.',
  5
from articles art
join authors a on a.id = art.author_id
join categories c on c.id = art.category_id
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_cissp'
  and exists (select 1 from article_translations t2 where t2.article_id = art.id and t2.locale='en' and t2.slug='cissp-risk-management-explained')
  and not exists (select 1 from article_translations t3 where t3.article_id = art.id and t3.locale='ar');

-- =======================================================================
-- C7. CISSP IAM Concepts
-- =======================================================================
insert into articles (id, author_id, category_id, status, schema_type, difficulty, audience, reviewed_at, published_at)
select gen_random_uuid(), a.id, c.id, 'published', 'Article', 'intermediate', array['students','professionals'], now(), now()
from authors a, categories c
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_cissp'
  and not exists (select 1 from article_translations t where t.locale='en' and t.slug='cissp-iam-concepts');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'en',
  'CISSP IAM Concepts',
  'cissp-iam-concepts',
  'Identity and Access Management (IAM) is CISSP Domain 5: identity lifecycle, authentication factors, and the access control models the exam expects you to distinguish.',
  $c6b_en$
<p>Identity and Access Management (IAM) governs who can access what, and how that access is proven, granted, and eventually revoked. It is one of the most operationally hands-on domains, but the exam tests it at the concept level, not the product level.</p>
<h2>Access control models</h2>
<table class="content-comparison-table">
<thead><tr><th>Model</th><th>How access is granted</th></tr></thead>
<tbody>
<tr><td>DAC (Discretionary)</td><td>The resource owner decides who gets access</td></tr>
<tr><td>MAC (Mandatory)</td><td>Access decided by system-enforced classification labels, not the owner</td></tr>
<tr><td>RBAC (Role-Based)</td><td>Access tied to a defined job role, not the individual</td></tr>
<tr><td>ABAC (Attribute-Based)</td><td>Access decided dynamically by attributes (department, time, location, device)</td></tr>
</tbody>
</table>
<h2>Authentication factors</h2>
<p>Something you know (password), something you have (token, phone), something you are (biometric). True multi-factor authentication requires factors from at least two different categories -- a password plus a security question is not MFA, since both are "something you know."</p>
<div class="content-callout">
  <div class="content-callout-title">Bilingual terminology</div>
  <p>إدارة الهوية والوصول (IAM) covers identity lifecycle management: provisioning access when someone joins, adjusting it as their role changes, and de-provisioning it promptly when they leave. Privileged accounts require extra scrutiny -- this is where إدارة الوصول المميز (PAM, Privileged Access Management) applies additional controls like session recording and just-in-time elevation.</p>
</div>
  $c6b_en$,
  'CISSP IAM Concepts | CyberAbeer',
  'CISSP Domain 5 IAM concepts: access control models (DAC/MAC/RBAC/ABAC), authentication factors, and identity lifecycle.',
  5
from articles art
join authors a on a.id = art.author_id
join categories c on c.id = art.category_id
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_cissp'
  and exists (select 1 from article_translations t2 where t2.article_id = art.id and t2.locale='en' and t2.slug='cissp-iam-concepts')
  and not exists (select 1 from article_translations t3 where t3.article_id = art.id and t3.locale='en');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'ar',
  'مفاهيم إدارة الهوية والوصول في CISSP',
  'مفاهيم-ادارة-الهوية-والوصول-في-cissp',
  'إدارة الهوية والوصول (IAM) هي المجال الخامس في CISSP: دورة حياة الهوية وعوامل المصادقة ونماذج التحكم بالوصول التي يتوقع الاختبار تمييزها.',
  $c6b_ar$
<p>تحكم إدارة الهوية والوصول (IAM) من يستطيع الوصول إلى ماذا، وكيف يُثبَت ويُمنح ويُلغى ذلك الوصول لاحقاً. هذا من أكثر المجالات عملية تشغيلياً، لكن الاختبار يختبره على مستوى المفهوم، لا مستوى المنتج.</p>
<h2>نماذج التحكم بالوصول</h2>
<table class="content-comparison-table">
<thead><tr><th>النموذج</th><th>كيف يُمنح الوصول</th></tr></thead>
<tbody>
<tr><td>DAC (تقديري)</td><td>مالك المورد يقرر من يحصل على الوصول</td></tr>
<tr><td>MAC (إلزامي)</td><td>يُحدَّد الوصول بواسطة تصنيفات يفرضها النظام، لا المالك</td></tr>
<tr><td>RBAC (قائم على الأدوار)</td><td>الوصول مرتبط بدور وظيفي محدد، لا بالفرد</td></tr>
<tr><td>ABAC (قائم على السمات)</td><td>يُحدَّد الوصول ديناميكياً بسمات (القسم، الوقت، الموقع، الجهاز)</td></tr>
</tbody>
</table>
<h2>عوامل المصادقة</h2>
<p>شيء تعرفه (كلمة مرور)، شيء تملكه (رمز، هاتف)، شيء أنت عليه (بصمة حيوية). المصادقة متعددة العوامل الحقيقية تتطلب عاملين من فئتين مختلفتين على الأقل -- كلمة مرور مع سؤال أمني ليست مصادقة متعددة العوامل، لأن كليهما "شيء تعرفه".</p>
<div class="content-callout">
  <div class="content-callout-title">مصطلحات ثنائية اللغة</div>
  <p>تغطي إدارة الهوية والوصول (IAM) إدارة دورة حياة الهوية: منح الوصول عند انضمام شخص، وتعديله مع تغيّر دوره، وإلغاؤه فوراً عند مغادرته. تتطلب الحسابات المميزة تدقيقاً إضافياً -- وهنا تنطبق إدارة الوصول المميز (PAM، Privileged Access Management) بضوابط إضافية مثل تسجيل الجلسات والرفع الآني للصلاحيات.</p>
</div>
  $c6b_ar$,
  'مفاهيم إدارة الهوية والوصول في CISSP | CyberAbeer',
  'مفاهيم إدارة الهوية والوصول في المجال الخامس من CISSP: نماذج التحكم بالوصول وعوامل المصادقة ودورة حياة الهوية.',
  5
from articles art
join authors a on a.id = art.author_id
join categories c on c.id = art.category_id
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_cissp'
  and exists (select 1 from article_translations t2 where t2.article_id = art.id and t2.locale='en' and t2.slug='cissp-iam-concepts')
  and not exists (select 1 from article_translations t3 where t3.article_id = art.id and t3.locale='ar');

-- =======================================================================
-- C8. CISSP Network Security Concepts
-- =======================================================================
insert into articles (id, author_id, category_id, status, schema_type, difficulty, audience, reviewed_at, published_at)
select gen_random_uuid(), a.id, c.id, 'published', 'Article', 'intermediate', array['students','professionals'], now(), now()
from authors a, categories c
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_cissp'
  and not exists (select 1 from article_translations t where t.locale='en' and t.slug='cissp-network-security-concepts');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'en',
  'CISSP Network Security Concepts',
  'cissp-network-security-concepts',
  'Domain 4 tests the OSI model, secure network architecture patterns, and common protocol-level security concepts -- at a conceptual, not configuration, level.',
  $c8en$
<p>Domain 4 candidates with strong hands-on networking backgrounds often over-study the wrong layer of detail. The exam does not ask you to configure a router; it asks whether you understand why a given architecture pattern reduces risk.</p>
<h2>The OSI model, exam-relevant view</h2>
<p>Know which layer common attacks and controls operate at: ARP spoofing (Layer 2), IP spoofing and routing attacks (Layer 3), TCP session hijacking (Layer 4), and application-layer attacks like SQL injection (Layer 7). Firewalls historically operated at Layers 3-4; modern next-gen firewalls and WAFs extend inspection to Layer 7.</p>
<h2>Segmentation and zero trust</h2>
<p>Network segmentation (VLANs, DMZs, microsegmentation) limits lateral movement after a breach -- a flat network means one compromised host can reach everything. Zero trust extends this principle: no implicit trust based on network location; every request is authenticated and authorized regardless of whether it originates "inside" the perimeter.</p>
<div class="content-callout">
  <div class="content-callout-title">Dr. Abeer Explains</div>
  <p>Candidates sometimes treat "firewall" as synonymous with "network security." On the exam, a firewall is one control among many in a defense-in-depth architecture -- segmentation, IDS/IPS, secure protocols, and monitoring all work together, and no single control is presented as sufficient on its own.</p>
</div>
  $c8en$,
  'CISSP Network Security Concepts | CyberAbeer',
  'CISSP Domain 4: OSI model attack/control mapping, network segmentation, zero trust, and defense-in-depth architecture concepts.',
  5
from articles art
join authors a on a.id = art.author_id
join categories c on c.id = art.category_id
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_cissp'
  and exists (select 1 from article_translations t2 where t2.article_id = art.id and t2.locale='en' and t2.slug='cissp-network-security-concepts')
  and not exists (select 1 from article_translations t3 where t3.article_id = art.id and t3.locale='en');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'ar',
  'مفاهيم أمن الشبكات في CISSP',
  'مفاهيم-امن-الشبكات-في-cissp',
  'يختبر المجال الرابع نموذج OSI وأنماط بنية الشبكة الآمنة ومفاهيم الأمن على مستوى البروتوكول -- على المستوى المفاهيمي لا مستوى التهيئة.',
  $c8ar$
<p>غالباً ما يفرط مرشحو المجال الرابع من ذوي الخلفية التقنية القوية في الشبكات في دراسة المستوى الخاطئ من التفاصيل. لا يطلب الاختبار منك تهيئة موجّه؛ بل يسأل ما إذا كنت تفهم لماذا يقلل نمط بنية معين من المخاطرة.</p>
<h2>نموذج OSI من منظور الاختبار</h2>
<p>اعرف أي طبقة تعمل عندها الهجمات والضوابط الشائعة: انتحال ARP (الطبقة 2)، انتحال IP وهجمات التوجيه (الطبقة 3)، اختطاف جلسة TCP (الطبقة 4)، وهجمات طبقة التطبيقات مثل حقن SQL (الطبقة 7). عملت جدران الحماية تاريخياً عند الطبقتين 3-4؛ توسّع جدران الحماية الحديثة من الجيل التالي وWAF الفحص ليشمل الطبقة 7.</p>
<h2>التجزئة والثقة المعدومة</h2>
<p>تحد تجزئة الشبكة (VLANs وDMZ والتجزئة الدقيقة) من الحركة الجانبية بعد الاختراق -- فالشبكة المسطحة تعني أن جهازاً واحداً مخترقاً يمكنه الوصول إلى كل شيء. تُوسّع الثقة المعدومة هذا المبدأ: لا ثقة ضمنية مبنية على موقع الشبكة؛ يُصادَق على كل طلب ويُفوَّض بصرف النظر عما إذا كان مصدره "داخل" المحيط.</p>
<div class="content-callout">
  <div class="content-callout-title">د. عبير توضح</div>
  <p>يعامل بعض المرشحين "جدار الحماية" كمرادف لـ"أمن الشبكة". في الاختبار، جدار الحماية ضابط واحد ضمن ضوابط متعددة في بنية دفاع متعدد الطبقات -- تعمل التجزئة وأنظمة كشف/منع التسلل والبروتوكولات الآمنة والمراقبة معاً، ولا يُقدَّم أي ضابط منفرد كافٍ بذاته.</p>
</div>
  $c8ar$,
  'مفاهيم أمن الشبكات في CISSP | CyberAbeer',
  'المجال الرابع من CISSP: ربط الهجمات والضوابط بطبقات OSI، وتجزئة الشبكة، والثقة المعدومة، ومفاهيم الدفاع متعدد الطبقات.',
  5
from articles art
join authors a on a.id = art.author_id
join categories c on c.id = art.category_id
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_cissp'
  and exists (select 1 from article_translations t2 where t2.article_id = art.id and t2.locale='en' and t2.slug='cissp-network-security-concepts')
  and not exists (select 1 from article_translations t3 where t3.article_id = art.id and t3.locale='ar');

-- =======================================================================
-- C9. CISSP Security Operations Concepts
-- =======================================================================
insert into articles (id, author_id, category_id, status, schema_type, difficulty, audience, reviewed_at, published_at)
select gen_random_uuid(), a.id, c.id, 'published', 'Article', 'intermediate', array['students','professionals'], now(), now()
from authors a, categories c
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_cissp'
  and not exists (select 1 from article_translations t where t.locale='en' and t.slug='cissp-security-operations-concepts');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'en',
  'CISSP Security Operations Concepts',
  'cissp-security-operations-concepts',
  'Domain 7 covers incident response phases, digital forensics principles, and the logging/monitoring practices that support both.',
  $c9en$
<p>Security operations is where most day-to-day defensive work happens, and Domain 7 tests whether you know the correct sequence and reasoning behind incident handling, not just the tools.</p>
<h2>Incident response phases</h2>
<div class="content-checklist">
<ul>
<li><strong>Preparation</strong> -- policies, tooling, and trained staff in place before anything happens</li>
<li><strong>Detection and Analysis</strong> -- identifying and confirming an incident occurred</li>
<li><strong>Containment</strong> -- limiting damage (short-term containment vs. long-term containment are distinct steps)</li>
<li><strong>Eradication</strong> -- removing the root cause, not just the symptom</li>
<li><strong>Recovery</strong> -- restoring systems to normal operation, with monitoring for recurrence</li>
<li><strong>Lessons Learned</strong> -- post-incident review that feeds back into Preparation</li>
</ul>
</div>
<h2>Forensics: preserving the chain of custody</h2>
<p>Digital forensics principles focus on preserving evidence integrity: documenting who handled evidence, when, and how, so it remains admissible if needed. Order of volatility matters -- capture RAM and network state before less volatile data like disk images, since volatile evidence disappears first.</p>
<h2>Logging and monitoring</h2>
<p>Centralized log collection (SIEM) supports both detection and forensic reconstruction after the fact. The exam expects you to recognize that logs need to be protected from tampering (write-once storage, restricted access) precisely because they may become evidence.</p>
  $c9en$,
  'CISSP Security Operations Concepts | CyberAbeer',
  'CISSP Domain 7: the six incident response phases, digital forensics and chain of custody, and logging/monitoring practices.',
  5
from articles art
join authors a on a.id = art.author_id
join categories c on c.id = art.category_id
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_cissp'
  and exists (select 1 from article_translations t2 where t2.article_id = art.id and t2.locale='en' and t2.slug='cissp-security-operations-concepts')
  and not exists (select 1 from article_translations t3 where t3.article_id = art.id and t3.locale='en');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'ar',
  'مفاهيم عمليات الأمن في CISSP',
  'مفاهيم-عمليات-الامن-في-cissp',
  'يغطي المجال السابع مراحل الاستجابة للحوادث ومبادئ التحقيق الجنائي الرقمي وممارسات التسجيل والمراقبة الداعمة لكليهما.',
  $c9ar$
<p>عمليات الأمن هي حيث يحدث معظم العمل الدفاعي اليومي، ويختبر المجال السابع ما إذا كنت تعرف التسلسل والمنطق الصحيحين للتعامل مع الحوادث، لا الأدوات فقط.</p>
<h2>مراحل الاستجابة للحوادث</h2>
<div class="content-checklist">
<ul>
<li><strong>الاستعداد</strong> -- السياسات والأدوات والموظفون المدرَّبون قبل حدوث أي شيء</li>
<li><strong>الكشف والتحليل</strong> -- تحديد وتأكيد وقوع حادثة</li>
<li><strong>الاحتواء</strong> -- الحد من الضرر (الاحتواء قصير المدى وطويل المدى خطوتان متمايزتان)</li>
<li><strong>الاستئصال</strong> -- إزالة السبب الجذري، لا العرض فقط</li>
<li><strong>التعافي</strong> -- إعادة الأنظمة إلى التشغيل الطبيعي، مع مراقبة تكرار الحادثة</li>
<li><strong>الدروس المستفادة</strong> -- مراجعة ما بعد الحادثة تُغذّي مرحلة الاستعداد مجدداً</li>
</ul>
</div>
<h2>التحقيق الجنائي: الحفاظ على سلسلة الحيازة</h2>
<p>تركز مبادئ التحقيق الجنائي الرقمي على الحفاظ على سلامة الأدلة: توثيق من تعامل مع الدليل ومتى وكيف، ليبقى مقبولاً إذا لزم الأمر. ترتيب التطاير مهم -- التقط ذاكرة الوصول العشوائي وحالة الشبكة قبل بيانات أقل تطايراً مثل نسخ الأقراص، لأن الأدلة المتطايرة تختفي أولاً.</p>
<h2>التسجيل والمراقبة</h2>
<p>يدعم جمع السجلات المركزي (SIEM) الكشف وإعادة البناء الجنائي بعد وقوع الحادثة. يتوقع الاختبار منك إدراك أن السجلات تحتاج للحماية من العبث (تخزين للكتابة مرة واحدة، وصول مقيّد) تحديداً لأنها قد تصبح دليلاً.</p>
  $c9ar$,
  'مفاهيم عمليات الأمن في CISSP | CyberAbeer',
  'المجال السابع من CISSP: مراحل الاستجابة للحوادث الست، والتحقيق الجنائي الرقمي وسلسلة الحيازة، وممارسات التسجيل والمراقبة.',
  5
from articles art
join authors a on a.id = art.author_id
join categories c on c.id = art.category_id
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_cissp'
  and exists (select 1 from article_translations t2 where t2.article_id = art.id and t2.locale='en' and t2.slug='cissp-security-operations-concepts')
  and not exists (select 1 from article_translations t3 where t3.article_id = art.id and t3.locale='ar');

-- =======================================================================
-- C10. CISSP Exam-Day Strategy
-- =======================================================================
insert into articles (id, author_id, category_id, status, schema_type, difficulty, audience, reviewed_at, published_at)
select gen_random_uuid(), a.id, c.id, 'published', 'Article', 'intermediate', array['students','professionals'], now(), now()
from authors a, categories c
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_cissp'
  and not exists (select 1 from article_translations t where t.locale='en' and t.slug='cissp-exam-day-strategy');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'en',
  'CISSP Exam-Day Strategy',
  'cissp-exam-day-strategy',
  'The CISSP exam uses adaptive testing (CAT), which changes how you should approach pacing, flagging, and second-guessing compared to a fixed-length exam.',
  $c10en$
<p>CISSP is delivered as a Computerized Adaptive Test (CAT) for the English exam: question difficulty adjusts based on your performance, and the exam ends once the system has enough confidence in a pass/fail result -- meaning length varies between 100 and 150 questions, and you cannot skip and return to a question once answered.</p>
<h2>What CAT changes about strategy</h2>
<div class="content-checklist">
<ul>
<li>You cannot review or change answers once submitted -- there is no "flag and return" like a fixed exam</li>
<li>Take real time on each question rather than rushing to "save time for review," since there is no review pass</li>
<li>A string of harder questions can mean you are doing well, not poorly -- the algorithm increases difficulty as you demonstrate competence</li>
<li>Do not spiral over one difficult question; answer your best reasoned choice and move forward deliberately</li>
</ul>
</div>
<h2>Logistics that matter more than people expect</h2>
<p>Confirm your testing center location and required ID in advance, arrive early, and expect a security check similar to other proctored exams (pockets emptied, no notes, no phone). Fatigue is a real factor over a multi-hour exam -- eat beforehand and stay hydrated, since breaks (if taken) still count against your total time.</p>
<div class="content-callout">
  <div class="content-callout-title">Dr. Abeer Explains</div>
  <p>The biggest exam-day mistake I see is candidates trying to "figure out" whether they are passing based on question difficulty. You cannot reliably read the algorithm from inside the exam, and trying to costs focus you need for the actual questions. Answer each question as if it is the only one that matters, because from a scoring standpoint, it is.</p>
</div>
  $c10en$,
  'CISSP Exam-Day Strategy | CyberAbeer',
  'How CISSP''s Computerized Adaptive Testing (CAT) format changes exam strategy, plus logistics and pacing guidance for exam day.',
  5
from articles art
join authors a on a.id = art.author_id
join categories c on c.id = art.category_id
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_cissp'
  and exists (select 1 from article_translations t2 where t2.article_id = art.id and t2.locale='en' and t2.slug='cissp-exam-day-strategy')
  and not exists (select 1 from article_translations t3 where t3.article_id = art.id and t3.locale='en');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'ar',
  'استراتيجية يوم اختبار CISSP',
  'استراتيجية-يوم-اختبار-cissp',
  'يستخدم اختبار CISSP الاختبار التكيفي المحوسب (CAT)، مما يغيّر طريقة التعامل مع الوتيرة والتأشير وإعادة النظر مقارنة باختبار ثابت الطول.',
  $c10ar$
<p>يُقدَّم اختبار CISSP باللغة الإنجليزية كاختبار تكيفي محوسب (CAT): تتكيف صعوبة الأسئلة بناءً على أدائك، وينتهي الاختبار حالما يصل النظام لثقة كافية في نتيجة النجاح أو الرسوب -- ما يعني أن الطول يتراوح بين 100 و150 سؤالاً، ولا يمكنك تخطي سؤال والعودة إليه بعد الإجابة عليه.</p>
<h2>ما الذي يغيّره CAT في الاستراتيجية</h2>
<div class="content-checklist">
<ul>
<li>لا يمكنك مراجعة أو تغيير الإجابات بعد إرسالها -- لا يوجد "تأشير وعودة" كما في اختبار ثابت</li>
<li>خذ وقتاً حقيقياً في كل سؤال بدلاً من الاستعجال "لتوفير وقت للمراجعة"، لأنه لا توجد جولة مراجعة</li>
<li>سلسلة من الأسئلة الأصعب قد تعني أنك تؤدي جيداً لا سيئاً -- يرفع الخوارزم الصعوبة كلما أظهرت كفاءة</li>
<li>لا تنشغل بسؤال صعب واحد؛ أجب بأفضل اختيار مدروس وامضِ قدماً بثبات</li>
</ul>
</div>
<h2>لوجستيات تهم أكثر مما يتوقع الناس</h2>
<p>تأكد من موقع مركز الاختبار والهوية المطلوبة مسبقاً، واحضر مبكراً، وتوقع فحصاً أمنياً مشابهاً للاختبارات الأخرى المُراقَبة (إفراغ الجيوب، لا ملاحظات، لا هاتف). الإرهاق عامل حقيقي خلال اختبار يمتد ساعات -- تناول الطعام مسبقاً وحافظ على الترطيب، لأن الاستراحات (إن أُخذت) تُحتسب من إجمالي وقتك.</p>
<div class="content-callout">
  <div class="content-callout-title">د. عبير توضح</div>
  <p>أكبر خطأ أراه يوم الاختبار هو محاولة المرشحين "معرفة" ما إذا كانوا ينجحون بناءً على صعوبة الأسئلة. لا يمكنك قراءة الخوارزم بموثوقية من داخل الاختبار، والمحاولة تكلفك التركيز الذي تحتاجه للأسئلة الفعلية. أجب عن كل سؤال وكأنه السؤال الوحيد المهم، لأنه من منظور التقييم، هو كذلك.</p>
</div>
  $c10ar$,
  'استراتيجية يوم اختبار CISSP | CyberAbeer',
  'كيف يغيّر تنسيق الاختبار التكيفي المحوسب (CAT) لـCISSP استراتيجية الاختبار، إضافة إلى إرشادات اللوجستيات والوتيرة ليوم الاختبار.',
  5
from articles art
join authors a on a.id = art.author_id
join categories c on c.id = art.category_id
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_cissp'
  and exists (select 1 from article_translations t2 where t2.article_id = art.id and t2.locale='en' and t2.slug='cissp-exam-day-strategy')
  and not exists (select 1 from article_translations t3 where t3.article_id = art.id and t3.locale='ar');

-- =======================================================================
-- Sources (only for claims that reference an external authoritative
-- standard/body -- domain weightings and exam format are (ISC)2 facts)
-- =======================================================================
insert into article_sources (article_id, title, publisher, url, published_date, accessed_date, sort_order)
select t.article_id, v.title, v.publisher, v.url, v.published_date::date, current_date, v.sort_order
from (values
  ('cissp-domains-explained', 'CISSP Certification Exam Outline', '(ISC)2', 'https://www.isc2.org/certifications/cissp/cissp-certification-exam-outline', null, 1),
  ('cissp-exam-day-strategy', 'CISSP Exam Information', '(ISC)2', 'https://www.isc2.org/certifications/cissp', null, 1)
) as v(slug, title, publisher, url, published_date, sort_order)
join article_translations t on t.locale='en' and t.slug = v.slug
on conflict do nothing;

-- =======================================================================
-- Internal relations: cross-link the CISSP hub, and to the existing
-- "CISSP vs CISM vs CEH" flagship article from 013 and the new CISM hub.
-- =======================================================================
insert into article_relations (article_id, related_article_id, sort_order)
select src.article_id, dst.article_id, r.sort_order
from (values
  ('what-is-cissp', 'cissp-domains-explained', 1),
  ('what-is-cissp', 'how-to-prepare-for-cissp', 2),
  ('what-is-cissp', 'cissp-vs-cism-vs-ceh-which-certification-first', 3),
  ('cissp-domains-explained', 'cissp-study-plan', 1),
  ('cissp-domains-explained', 'cissp-risk-management-explained', 2),
  ('how-to-prepare-for-cissp', 'cissp-study-plan', 1),
  ('how-to-prepare-for-cissp', 'cissp-scenario-based-questions-think-like-a-manager', 2),
  ('cissp-study-plan', 'cissp-exam-day-strategy', 1),
  ('cissp-scenario-based-questions-think-like-a-manager', 'cissp-risk-management-explained', 1),
  ('cissp-scenario-based-questions-think-like-a-manager', 'cissp-exam-day-strategy', 2),
  ('cissp-risk-management-explained', 'cissp-iam-concepts', 1),
  ('cissp-iam-concepts', 'cissp-network-security-concepts', 1),
  ('cissp-network-security-concepts', 'cissp-security-operations-concepts', 1),
  ('cissp-security-operations-concepts', 'cissp-exam-day-strategy', 1)
) as r(src_slug, dst_slug, sort_order)
join article_translations src on src.locale='en' and src.slug=r.src_slug
join article_translations dst on dst.locale='en' and dst.slug=r.dst_slug
on conflict (article_id, related_article_id) do nothing;
