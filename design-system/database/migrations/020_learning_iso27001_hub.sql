-- Migration 020: ISO/IEC 27001 Hub -- 7 new bilingual articles
-- =============================================================
-- The founder's list included "Statement of Applicability Explained,"
-- which duplicates "What Is a Statement of Applicability?" already
-- published under the GRC pillar (015_content_expansion_20_articles.sql,
-- slug what-is-a-statement-of-applicability). Per the founder's own
-- "no thin SEO pages / no duplicate content" quality rule, that item is
-- NOT recreated here -- it is instead cross-linked into this hub via
-- article_relations at the end of this file, so it appears in the
-- ISO 27001 hub's related reading without a duplicate page competing
-- with it in search results.
--
-- "ISO/IEC 27001:2022 Explained" (below) is deliberately differentiated
-- from the existing "ISO 27001 Explained for Beginners" (015): this one
-- is a hub-overview piece centered on the 2022 revision and structure,
-- the other is a beginner glossary entry. Cross-linked, not duplicated.

-- =======================================================================
-- I1. ISO/IEC 27001:2022 Explained
-- =======================================================================
insert into articles (id, author_id, category_id, status, schema_type, difficulty, audience, reviewed_at, published_at)
select gen_random_uuid(), a.id, c.id, 'published', 'Article', 'beginner', array['professionals','general'], now(), now()
from authors a, categories c
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_iso_27001'
  and not exists (select 1 from article_translations t where t.locale='en' and t.slug='iso-27001-2022-explained');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'en',
  'ISO/IEC 27001:2022 Explained',
  'iso-27001-2022-explained',
  'ISO/IEC 27001:2022 is the current version of the international information security management system standard. Here is its structure and what changed from the 2013 version.',
  $i1en$
<p>ISO/IEC 27001 is the international standard for an Information Security Management System (ISMS) -- a systematic, documented approach to managing information security risk. The current version, published in October 2022, replaced the 2013 version, and organizations certified under 2013 had a transition deadline to migrate.</p>
<h2>Structure</h2>
<p>The standard has two main parts: the main clauses (4-10), which define ISMS requirements an organization must meet to be certified, and Annex A, a reference list of security controls an organization selects from based on its risk assessment. See <a href="/insights/iso-27001-clauses-explained">ISO 27001 Clauses Explained</a> and <a href="/insights/annex-a-controls-explained">Annex A Controls Explained</a> for each in detail.</p>
<h2>What changed in the 2022 revision</h2>
<div class="content-checklist">
<ul>
<li>Annex A was restructured from 14 categories/114 controls (2013) into 4 themes/93 controls (2022) -- largely a consolidation, not a wholesale rewrite</li>
<li>11 new controls were introduced, including threat intelligence, cloud security, and data masking, reflecting how the threat and technology landscape shifted since 2013</li>
<li>Controls gained "attributes" (control type, security properties, cybersecurity concepts, operational capabilities, security domains) to support filtering and mapping to other frameworks</li>
</ul>
</div>
<h2>Why the ISMS approach matters</h2>
<p>ISO 27001 does not mandate a fixed list of controls for every organization -- it mandates a risk-based process for deciding which controls apply, documenting that decision, and continually improving. This is why two ISO 27001-certified organizations can have meaningfully different control sets and both be legitimately compliant.</p>
  $i1en$,
  'ISO/IEC 27001:2022 Explained | CyberAbeer',
  'ISO/IEC 27001:2022 structure, the ISMS approach, and what changed from the 2013 version -- Annex A restructuring and new controls.',
  5
from articles art
join authors a on a.id = art.author_id
join categories c on c.id = art.category_id
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_iso_27001'
  and exists (select 1 from article_translations t2 where t2.article_id = art.id and t2.locale='en' and t2.slug='iso-27001-2022-explained')
  and not exists (select 1 from article_translations t3 where t3.article_id = art.id and t3.locale='en');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'ar',
  'شرح ISO/IEC 27001:2022',
  'شرح-iso-iec-27001-2022',
  'ISO/IEC 27001:2022 هي النسخة الحالية من المعيار الدولي لنظام إدارة أمن المعلومات. إليك بنيتها وما تغيّر عن نسخة 2013.',
  $i1ar$
<p>ISO/IEC 27001 هي المعيار الدولي لنظام إدارة أمن المعلومات (ISMS) -- نهج منهجي وموثَّق لإدارة مخاطر أمن المعلومات. حلّت النسخة الحالية، الصادرة في أكتوبر 2022، محل نسخة 2013، وكان على المؤسسات المعتمدة بموجب نسخة 2013 موعد نهائي للانتقال.</p>
<h2>البنية</h2>
<p>يتكون المعيار من جزأين رئيسيين: البنود الرئيسية (4-10)، التي تحدد متطلبات نظام إدارة أمن المعلومات التي يجب على المؤسسة استيفاءها للحصول على الشهادة، والملحق A، قائمة مرجعية للضوابط الأمنية تختار المؤسسة منها بناءً على تقييم مخاطرها. راجع <a href="/insights/iso-27001-clauses-explained">شرح بنود ISO 27001</a> و<a href="/insights/annex-a-controls-explained">شرح ضوابط الملحق A</a> لتفصيل كل منهما.</p>
<h2>ما الذي تغيّر في نسخة 2022</h2>
<div class="content-checklist">
<ul>
<li>أُعيد هيكلة الملحق A من 14 فئة/114 ضابطاً (2013) إلى 4 محاور/93 ضابطاً (2022) -- دمج إلى حد كبير، لا إعادة كتابة شاملة</li>
<li>أُدخل 11 ضابطاً جديداً، تشمل استخبارات التهديدات وأمن الحوسبة السحابية وإخفاء البيانات، تعكس تحول مشهد التهديدات والتقنية منذ 2013</li>
<li>اكتسبت الضوابط "سمات" (نوع الضابط، خصائص الأمن، مفاهيم الأمن السيبراني، القدرات التشغيلية، النطاقات الأمنية) لدعم التصفية والربط بأطر أخرى</li>
</ul>
</div>
<h2>لماذا يهم نهج نظام إدارة أمن المعلومات</h2>
<p>لا تفرض ISO 27001 قائمة ثابتة من الضوابط على كل مؤسسة -- بل تفرض عملية قائمة على المخاطر لتحديد الضوابط المنطبقة وتوثيق ذلك القرار والتحسين المستمر. لهذا يمكن أن تختلف مجموعات الضوابط بشكل ملموس بين مؤسستين معتمدتين بموجب ISO 27001، وتكون كلتاهما ملتزمة بشكل مشروع.</p>
  $i1ar$,
  'شرح ISO/IEC 27001:2022 | CyberAbeer',
  'بنية ISO/IEC 27001:2022 ونهج نظام إدارة أمن المعلومات وما تغيّر عن نسخة 2013 -- إعادة هيكلة الملحق A والضوابط الجديدة.',
  5
from articles art
join authors a on a.id = art.author_id
join categories c on c.id = art.category_id
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_iso_27001'
  and exists (select 1 from article_translations t2 where t2.article_id = art.id and t2.locale='en' and t2.slug='iso-27001-2022-explained')
  and not exists (select 1 from article_translations t3 where t3.article_id = art.id and t3.locale='ar');

-- =======================================================================
-- I2. ISO 27001 Clauses Explained
-- =======================================================================
insert into articles (id, author_id, category_id, status, schema_type, difficulty, audience, reviewed_at, published_at)
select gen_random_uuid(), a.id, c.id, 'published', 'Article', 'intermediate', array['professionals','ciso'], now(), now()
from authors a, categories c
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_iso_27001'
  and not exists (select 1 from article_translations t where t.locale='en' and t.slug='iso-27001-clauses-explained');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'en',
  'ISO 27001 Clauses Explained',
  'iso-27001-clauses-explained',
  'Clauses 4-10 are the mandatory ISMS requirements every certified organization must meet -- separate from the optional Annex A controls.',
  $i2en$
<p>Clauses 4 through 10 are what an auditor certifies against directly. Unlike Annex A controls (which are selected based on applicability), every clause requirement applies to every certified organization.</p>
<table class="content-comparison-table">
<thead><tr><th>Clause</th><th>Requirement area</th></tr></thead>
<tbody>
<tr><td>4. Context of the Organization</td><td>Understanding internal/external issues, interested parties, and ISMS scope</td></tr>
<tr><td>5. Leadership</td><td>Top management commitment, policy, roles and responsibilities</td></tr>
<tr><td>6. Planning</td><td>Risk assessment and treatment, information security objectives</td></tr>
<tr><td>7. Support</td><td>Resources, competence, awareness, communication, documented information</td></tr>
<tr><td>8. Operation</td><td>Operational planning and control, risk assessment/treatment execution</td></tr>
<tr><td>9. Performance Evaluation</td><td>Monitoring, measurement, internal audit, management review</td></tr>
<tr><td>10. Improvement</td><td>Nonconformity handling, corrective action, continual improvement</td></tr>
</tbody>
</table>
<h2>Why clause structure matters for audits</h2>
<p>Auditors trace evidence against specific clauses. A documented risk assessment satisfies Clause 6; management review meeting minutes satisfy Clause 9; a corrective action log satisfies Clause 10. Organizations that treat ISO 27001 purely as "which Annex A controls do we have" often struggle at audit because the clause-level ISMS process evidence is thin or missing.</p>
  $i2en$,
  'ISO 27001 Clauses Explained | CyberAbeer',
  'ISO 27001 clauses 4-10 explained: context, leadership, planning, support, operation, performance evaluation, and improvement.',
  5
from articles art
join authors a on a.id = art.author_id
join categories c on c.id = art.category_id
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_iso_27001'
  and exists (select 1 from article_translations t2 where t2.article_id = art.id and t2.locale='en' and t2.slug='iso-27001-clauses-explained')
  and not exists (select 1 from article_translations t3 where t3.article_id = art.id and t3.locale='en');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'ar',
  'شرح بنود ISO 27001',
  'شرح-بنود-iso-27001',
  'البنود 4-10 هي متطلبات نظام إدارة أمن المعلومات الإلزامية التي يجب على كل مؤسسة معتمدة استيفاؤها -- منفصلة عن ضوابط الملحق A الاختيارية.',
  $i2ar$
<p>البنود من 4 إلى 10 هي ما يعتمد المدقق مقابله مباشرة. على عكس ضوابط الملحق A (التي تُختار بناءً على قابلية التطبيق)، ينطبق كل متطلب من متطلبات البنود على كل مؤسسة معتمدة.</p>
<table class="content-comparison-table">
<thead><tr><th>البند</th><th>مجال المتطلب</th></tr></thead>
<tbody>
<tr><td>4. سياق المؤسسة</td><td>فهم القضايا الداخلية/الخارجية وأصحاب المصلحة ونطاق نظام إدارة أمن المعلومات</td></tr>
<tr><td>5. القيادة</td><td>التزام الإدارة العليا والسياسة والأدوار والمسؤوليات</td></tr>
<tr><td>6. التخطيط</td><td>تقييم ومعالجة المخاطر، وأهداف أمن المعلومات</td></tr>
<tr><td>7. الدعم</td><td>الموارد والكفاءة والتوعية والاتصال والمعلومات الموثَّقة</td></tr>
<tr><td>8. التشغيل</td><td>التخطيط والتحكم التشغيلي، وتنفيذ تقييم/معالجة المخاطر</td></tr>
<tr><td>9. تقييم الأداء</td><td>المراقبة والقياس والتدقيق الداخلي ومراجعة الإدارة</td></tr>
<tr><td>10. التحسين</td><td>التعامل مع حالات عدم المطابقة، والإجراء التصحيحي، والتحسين المستمر</td></tr>
</tbody>
</table>
<h2>لماذا تهم بنية البنود في التدقيق</h2>
<p>يتتبع المدققون الأدلة مقابل بنود محددة. تقييم مخاطر موثَّق يستوفي البند 6؛ ومحاضر اجتماع مراجعة الإدارة تستوفي البند 9؛ وسجل الإجراءات التصحيحية يستوفي البند 10. المؤسسات التي تعامل ISO 27001 فقط كـ"أي ضوابط ملحق A لدينا" غالباً ما تواجه صعوبة في التدقيق لأن أدلة عملية نظام إدارة أمن المعلومات على مستوى البنود تكون ضئيلة أو غائبة.</p>
  $i2ar$,
  'شرح بنود ISO 27001 | CyberAbeer',
  'شرح بنود ISO 27001 من 4 إلى 10: السياق والقيادة والتخطيط والدعم والتشغيل وتقييم الأداء والتحسين.',
  5
from articles art
join authors a on a.id = art.author_id
join categories c on c.id = art.category_id
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_iso_27001'
  and exists (select 1 from article_translations t2 where t2.article_id = art.id and t2.locale='en' and t2.slug='iso-27001-clauses-explained')
  and not exists (select 1 from article_translations t3 where t3.article_id = art.id and t3.locale='ar');

-- =======================================================================
-- I3. Annex A Controls Explained
-- =======================================================================
insert into articles (id, author_id, category_id, status, schema_type, difficulty, audience, reviewed_at, published_at)
select gen_random_uuid(), a.id, c.id, 'published', 'Article', 'intermediate', array['professionals','ciso'], now(), now()
from authors a, categories c
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_iso_27001'
  and not exists (select 1 from article_translations t where t.locale='en' and t.slug='annex-a-controls-explained');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'en',
  'Annex A Controls Explained',
  'annex-a-controls-explained',
  'Annex A in the 2022 revision groups 93 controls into 4 themes. Here is what each theme covers and how organizations select controls from it.',
  $i3en$
<table class="content-comparison-table">
<thead><tr><th>Theme</th><th>Approx. controls</th><th>Covers</th></tr></thead>
<tbody>
<tr><td>A.5 Organizational</td><td>37</td><td>Policies, roles, supplier relationships, incident management, BCP</td></tr>
<tr><td>A.6 People</td><td>8</td><td>Screening, terms of employment, awareness training, disciplinary process</td></tr>
<tr><td>A.7 Physical</td><td>14</td><td>Secure areas, equipment protection, clear desk/screen, media disposal</td></tr>
<tr><td>A.8 Technological</td><td>34</td><td>Access control, cryptography, logging, malware protection, secure development</td></tr>
</tbody>
</table>
<h2>Controls are selected, not mandated wholesale</h2>
<p>An organization does not implement all 93 controls automatically -- it selects applicable controls based on its risk assessment (Clause 6), documents that selection and rationale in the Statement of Applicability, and justifies exclusions. A control can be legitimately excluded if it does not apply to the organization's context (for example, physical media disposal controls for a fully cloud-native company with no physical media).</p>
<div class="content-callout">
  <div class="content-callout-title">Common misconception</div>
  <p>Annex A is a reference control catalog, not a checklist to implement item by item without judgment. Auditors expect to see the risk-based reasoning behind each inclusion and exclusion, not just a completed checkbox list.</p>
</div>
  $i3en$,
  'Annex A Controls Explained | CyberAbeer',
  'ISO 27001:2022 Annex A: the 4 control themes (organizational, people, physical, technological) and how controls are selected, not mandated wholesale.',
  5
from articles art
join authors a on a.id = art.author_id
join categories c on c.id = art.category_id
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_iso_27001'
  and exists (select 1 from article_translations t2 where t2.article_id = art.id and t2.locale='en' and t2.slug='annex-a-controls-explained')
  and not exists (select 1 from article_translations t3 where t3.article_id = art.id and t3.locale='en');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'ar',
  'شرح ضوابط الملحق A',
  'شرح-ضوابط-الملحق-a',
  'يجمّع الملحق A في نسخة 2022 ثلاثة وتسعين ضابطاً في أربعة محاور. إليك ما يغطيه كل محور وكيف تختار المؤسسات الضوابط منه.',
  $i3ar$
<table class="content-comparison-table">
<thead><tr><th>المحور</th><th>عدد الضوابط التقريبي</th><th>يغطي</th></tr></thead>
<tbody>
<tr><td>A.5 تنظيمي</td><td>37</td><td>السياسات والأدوار وعلاقات الموردين وإدارة الحوادث واستمرارية الأعمال</td></tr>
<tr><td>A.6 بشري</td><td>8</td><td>الفحص وشروط التوظيف وتدريب التوعية والإجراء التأديبي</td></tr>
<tr><td>A.7 مادي</td><td>14</td><td>المناطق الآمنة وحماية المعدات ومكتب/شاشة نظيفة والتخلص من الوسائط</td></tr>
<tr><td>A.8 تقني</td><td>34</td><td>التحكم بالوصول والتشفير والتسجيل والحماية من البرمجيات الخبيثة والتطوير الآمن</td></tr>
</tbody>
</table>
<h2>تُختار الضوابط، لا تُفرض بالكامل</h2>
<p>لا تُطبّق المؤسسة الثلاثة والتسعين ضابطاً تلقائياً -- بل تختار الضوابط المنطبقة بناءً على تقييم مخاطرها (البند 6)، وتوثّق ذلك الاختيار وتبريره في بيان قابلية التطبيق، وتبرر الاستثناءات. يمكن استبعاد ضابط بشكل مشروع إذا لم ينطبق على سياق المؤسسة (مثلاً، ضوابط التخلص من الوسائط المادية لشركة سحابية بالكامل دون وسائط مادية).</p>
<div class="content-callout">
  <div class="content-callout-title">مفهوم خاطئ شائع</div>
  <p>الملحق A كتالوج ضوابط مرجعي، لا قائمة تحقق تُطبَّق بنداً بنداً دون حكم. يتوقع المدققون رؤية المنطق القائم على المخاطر خلف كل تضمين واستبعاد، لا مجرد قائمة مربعات مكتملة.</p>
</div>
  $i3ar$,
  'شرح ضوابط الملحق A | CyberAbeer',
  'الملحق A في ISO 27001:2022: المحاور الأربعة (تنظيمي، بشري، مادي، تقني) وكيف تُختار الضوابط، لا تُفرض بالكامل.',
  5
from articles art
join authors a on a.id = art.author_id
join categories c on c.id = art.category_id
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_iso_27001'
  and exists (select 1 from article_translations t2 where t2.article_id = art.id and t2.locale='en' and t2.slug='annex-a-controls-explained')
  and not exists (select 1 from article_translations t3 where t3.article_id = art.id and t3.locale='ar');

-- =======================================================================
-- I4. ISO 27001 Risk Assessment
-- =======================================================================
insert into articles (id, author_id, category_id, status, schema_type, difficulty, audience, reviewed_at, published_at)
select gen_random_uuid(), a.id, c.id, 'published', 'Article', 'intermediate', array['professionals','ciso'], now(), now()
from authors a, categories c
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_iso_27001'
  and not exists (select 1 from article_translations t where t.locale='en' and t.slug='iso-27001-risk-assessment');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'en',
  'ISO 27001 Risk Assessment',
  'iso-27001-risk-assessment',
  'The ISO 27001 risk assessment process (Clauses 6.1.2 and 8.2) is what everything else in the standard -- Annex A selection, the SoA -- derives from.',
  $i4en$
<p>ISO 27001 does not prescribe a specific risk assessment methodology -- it requires that you have a consistent, repeatable, documented one that identifies risks to confidentiality, integrity, and availability of information.</p>
<h2>The process, at a minimum</h2>
<div class="content-checklist">
<ul>
<li>Establish and document risk criteria (how likelihood and impact are rated, and what counts as an "acceptable" risk level)</li>
<li>Identify risks -- typically through asset identification, threat identification, and vulnerability identification</li>
<li>Analyze and evaluate risk against the established criteria</li>
<li>Identify risk treatment options and select applicable Annex A controls (or other controls) to address them</li>
<li>Produce a risk treatment plan and get risk owner sign-off</li>
<li>Repeat on a defined cycle (typically annually, or when significant changes occur) -- risk assessment is not a one-time exercise</li>
</ul>
</div>
<h2>How this feeds the Statement of Applicability</h2>
<p>The risk assessment output directly determines which Annex A controls are marked applicable in the SoA and why. An SoA that does not visibly trace back to risk assessment findings is a common audit finding -- auditors expect to see the logical thread from identified risk to selected control.</p>
  $i4en$,
  'ISO 27001 Risk Assessment | CyberAbeer',
  'The ISO 27001 risk assessment process: establishing criteria, identifying and evaluating risk, and how it drives Annex A control selection.',
  5
from articles art
join authors a on a.id = art.author_id
join categories c on c.id = art.category_id
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_iso_27001'
  and exists (select 1 from article_translations t2 where t2.article_id = art.id and t2.locale='en' and t2.slug='iso-27001-risk-assessment')
  and not exists (select 1 from article_translations t3 where t3.article_id = art.id and t3.locale='en');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'ar',
  'تقييم المخاطر في ISO 27001',
  'تقييم-المخاطر-في-iso-27001',
  'عملية تقييم المخاطر في ISO 27001 (البندان 6.1.2 و8.2) هي ما يُشتق منه كل شيء آخر في المعيار -- اختيار الملحق A وبيان قابلية التطبيق.',
  $i4ar$
<p>لا تفرض ISO 27001 منهجية تقييم مخاطر محددة -- بل تشترط أن تكون لديك منهجية متسقة وقابلة للتكرار وموثَّقة تحدد المخاطر على سرية وسلامة وتوافر المعلومات.</p>
<h2>العملية، كحد أدنى</h2>
<div class="content-checklist">
<ul>
<li>وضع وتوثيق معايير المخاطرة (كيف تُقيَّم الاحتمالية والأثر، وما الذي يُعد مستوى مخاطرة "مقبولاً")</li>
<li>تحديد المخاطر -- عادة من خلال تحديد الأصول والتهديدات والثغرات</li>
<li>تحليل وتقييم المخاطرة مقابل المعايير الموضوعة</li>
<li>تحديد خيارات معالجة المخاطر واختيار ضوابط الملحق A المنطبقة (أو ضوابط أخرى) لمعالجتها</li>
<li>إعداد خطة معالجة مخاطر والحصول على موافقة مالك المخاطرة</li>
<li>التكرار وفق دورة محددة (عادة سنوياً، أو عند حدوث تغييرات جوهرية) -- تقييم المخاطر ليس تمريناً لمرة واحدة</li>
</ul>
</div>
<h2>كيف يُغذّي هذا بيان قابلية التطبيق</h2>
<p>تحدد مخرجات تقييم المخاطر مباشرة أي ضوابط الملحق A تُوسَم كمنطبقة في بيان قابلية التطبيق ولماذا. بيان قابلية تطبيق لا يعود بوضوح إلى نتائج تقييم المخاطر هو ملاحظة تدقيق شائعة -- يتوقع المدققون رؤية الخيط المنطقي من المخاطرة المحددة إلى الضابط المختار.</p>
  $i4ar$,
  'تقييم المخاطر في ISO 27001 | CyberAbeer',
  'عملية تقييم المخاطر في ISO 27001: وضع المعايير، وتحديد وتقييم المخاطر، وكيف تقود اختيار ضوابط الملحق A.',
  5
from articles art
join authors a on a.id = art.author_id
join categories c on c.id = art.category_id
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_iso_27001'
  and exists (select 1 from article_translations t2 where t2.article_id = art.id and t2.locale='en' and t2.slug='iso-27001-risk-assessment')
  and not exists (select 1 from article_translations t3 where t3.article_id = art.id and t3.locale='ar');

-- =======================================================================
-- I5. Internal Audit Explained
-- =======================================================================
insert into articles (id, author_id, category_id, status, schema_type, difficulty, audience, reviewed_at, published_at)
select gen_random_uuid(), a.id, c.id, 'published', 'Article', 'intermediate', array['professionals','ciso'], now(), now()
from authors a, categories c
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_iso_27001'
  and not exists (select 1 from article_translations t where t.locale='en' and t.slug='internal-audit-explained');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'en',
  'Internal Audit Explained',
  'internal-audit-explained',
  'Clause 9.2 requires internal audits at planned intervals. Here is how ISO 27001 internal audits actually work and why independence matters.',
  $i5en$
<p>Internal audit is the organization checking its own ISMS conformance before the external certification body does. It is not optional -- Clause 9.2 requires it at planned intervals, with results feeding Clause 9.3 management review.</p>
<h2>Core requirements</h2>
<div class="content-checklist">
<ul>
<li>An audit programme covering frequency, methods, responsibilities, and reporting</li>
<li>Audit criteria and scope defined for each audit</li>
<li>Auditor objectivity and impartiality -- auditors cannot audit their own work</li>
<li>Results reported to relevant management</li>
<li>Findings tracked to closure, feeding corrective action under Clause 10</li>
</ul>
</div>
<h2>Why "auditors cannot audit their own work" matters in practice</h2>
<p>In smaller organizations, this often means using a trained internal auditor from a different department, rotating audit assignments, or bringing in an external party to perform internal audits. A security manager auditing the ISMS they personally designed and run is a common independence gap that certification auditors will flag.</p>
  $i5en$,
  'Internal Audit Explained | CyberAbeer',
  'ISO 27001 Clause 9.2 internal audit requirements: the audit programme, auditor independence, and how findings feed corrective action.',
  4
from articles art
join authors a on a.id = art.author_id
join categories c on c.id = art.category_id
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_iso_27001'
  and exists (select 1 from article_translations t2 where t2.article_id = art.id and t2.locale='en' and t2.slug='internal-audit-explained')
  and not exists (select 1 from article_translations t3 where t3.article_id = art.id and t3.locale='en');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'ar',
  'شرح التدقيق الداخلي',
  'شرح-التدقيق-الداخلي',
  'يشترط البند 9.2 إجراء تدقيق داخلي بفواصل زمنية مخططة. إليك كيف يعمل التدقيق الداخلي في ISO 27001 فعلياً ولماذا يهم الاستقلال.',
  $i5ar$
<p>التدقيق الداخلي هو تحقق المؤسسة من مطابقة نظام إدارة أمن المعلومات الخاص بها قبل أن تفعل جهة الاعتماد الخارجية ذلك. وهو ليس اختيارياً -- يشترطه البند 9.2 بفواصل زمنية مخططة، وتُغذّي نتائجه مراجعة الإدارة في البند 9.3.</p>
<h2>المتطلبات الأساسية</h2>
<div class="content-checklist">
<ul>
<li>برنامج تدقيق يغطي التكرار والأساليب والمسؤوليات والتقارير</li>
<li>معايير ونطاق تدقيق محددان لكل عملية تدقيق</li>
<li>موضوعية ونزاهة المدقق -- لا يمكن للمدققين تدقيق عملهم الخاص</li>
<li>رفع النتائج للإدارة المعنية</li>
<li>تتبع النتائج حتى الإغلاق، تغذي الإجراء التصحيحي بموجب البند 10</li>
</ul>
</div>
<h2>لماذا يهم "لا يمكن للمدققين تدقيق عملهم الخاص" عملياً</h2>
<p>في المؤسسات الأصغر، يعني هذا غالباً استخدام مدقق داخلي مدرَّب من قسم مختلف، أو تناوب مهام التدقيق، أو الاستعانة بجهة خارجية لإجراء التدقيق الداخلي. مدير أمن يدقق نظام إدارة أمن المعلومات الذي صممه وشغّله بنفسه فجوة استقلال شائعة سيشير إليها مدققو الاعتماد.</p>
  $i5ar$,
  'شرح التدقيق الداخلي | CyberAbeer',
  'متطلبات التدقيق الداخلي في البند 9.2 من ISO 27001: برنامج التدقيق واستقلال المدقق وكيف تغذي النتائج الإجراء التصحيحي.',
  4
from articles art
join authors a on a.id = art.author_id
join categories c on c.id = art.category_id
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_iso_27001'
  and exists (select 1 from article_translations t2 where t2.article_id = art.id and t2.locale='en' and t2.slug='internal-audit-explained')
  and not exists (select 1 from article_translations t3 where t3.article_id = art.id and t3.locale='ar');

-- =======================================================================
-- I6. Nonconformity vs Observation vs OFI
-- =======================================================================
insert into articles (id, author_id, category_id, status, schema_type, difficulty, audience, reviewed_at, published_at)
select gen_random_uuid(), a.id, c.id, 'published', 'Article', 'intermediate', array['professionals','ciso'], now(), now()
from authors a, categories c
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_iso_27001'
  and not exists (select 1 from article_translations t where t.locale='en' and t.slug='nonconformity-vs-observation-vs-ofi');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'en',
  'Nonconformity vs Observation vs OFI',
  'nonconformity-vs-observation-vs-ofi',
  'Audit findings come in three tiers with different required responses. Confusing them leads to either overreacting or under-responding to audit results.',
  $i6en$
<table class="content-comparison-table">
<thead><tr><th>Finding type</th><th>What it means</th><th>Required response</th></tr></thead>
<tbody>
<tr><td>Nonconformity (Major)</td><td>A systemic failure to meet a requirement -- the process is broken or absent</td><td>Formal corrective action required; can block or suspend certification</td></tr>
<tr><td>Nonconformity (Minor)</td><td>An isolated instance of not meeting a requirement, without systemic failure</td><td>Corrective action required, typically with a defined timeline before the next audit</td></tr>
<tr><td>Observation</td><td>A potential future nonconformity -- something trending toward a gap but not yet one</td><td>No mandatory corrective action, but should be tracked and addressed proactively</td></tr>
<tr><td>Opportunity for Improvement (OFI)</td><td>The requirement is met, but the auditor sees a way to do it better</td><td>Optional -- purely advisory, not a compliance issue</td></tr>
</tbody>
</table>
<h2>Why the distinction matters</h2>
<p>Organizations sometimes treat every audit comment as equally urgent, or conversely dismiss real nonconformities as "just a suggestion." Both are wrong. A major nonconformity threatens certification and needs immediate, documented action; an OFI can reasonably sit on a backlog. Reading findings at the correct severity level is itself a governance skill the exam and real audits both test.</p>
  $i6en$,
  'Nonconformity vs Observation vs OFI | CyberAbeer',
  'The difference between major/minor nonconformities, observations, and opportunities for improvement in ISO 27001 audits, and the required response to each.',
  4
from articles art
join authors a on a.id = art.author_id
join categories c on c.id = art.category_id
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_iso_27001'
  and exists (select 1 from article_translations t2 where t2.article_id = art.id and t2.locale='en' and t2.slug='nonconformity-vs-observation-vs-ofi')
  and not exists (select 1 from article_translations t3 where t3.article_id = art.id and t3.locale='en');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'ar',
  'عدم المطابقة مقابل الملاحظة مقابل فرصة التحسين',
  'عدم-المطابقة-مقابل-الملاحظة-مقابل-فرصة-التحسين',
  'تأتي نتائج التدقيق في ثلاث مستويات باستجابات مطلوبة مختلفة. الخلط بينها يؤدي إلى المبالغة في رد الفعل أو التقصير في الاستجابة لنتائج التدقيق.',
  $i6ar$
<table class="content-comparison-table">
<thead><tr><th>نوع النتيجة</th><th>ماذا تعني</th><th>الاستجابة المطلوبة</th></tr></thead>
<tbody>
<tr><td>عدم مطابقة (كبرى)</td><td>فشل منهجي في تلبية متطلب -- العملية معطلة أو غائبة</td><td>إجراء تصحيحي رسمي مطلوب؛ يمكن أن يوقف أو يعلّق الاعتماد</td></tr>
<tr><td>عدم مطابقة (صغرى)</td><td>حالة معزولة من عدم تلبية متطلب، دون فشل منهجي</td><td>إجراء تصحيحي مطلوب، عادة بجدول زمني محدد قبل التدقيق التالي</td></tr>
<tr><td>ملاحظة</td><td>عدم مطابقة محتملة مستقبلاً -- أمر يتجه نحو فجوة لكنه ليس كذلك بعد</td><td>لا إجراء تصحيحي إلزامي، لكن ينبغي تتبعه ومعالجته استباقياً</td></tr>
<tr><td>فرصة للتحسين (OFI)</td><td>المتطلب مستوفى، لكن المدقق يرى طريقة لتحسين الأداء</td><td>اختياري -- استشاري بحت، وليس قضية امتثال</td></tr>
</tbody>
</table>
<h2>لماذا يهم التمييز</h2>
<p>تعامل المؤسسات أحياناً كل ملاحظة تدقيق بنفس الإلحاح، أو على العكس تتجاهل حالات عدم مطابقة حقيقية باعتبارها "مجرد اقتراح". كلاهما خاطئ. عدم المطابقة الكبرى يهدد الاعتماد ويحتاج إجراءً فورياً وموثَّقاً؛ بينما يمكن أن تبقى فرصة التحسين في قائمة انتظار معقولة. قراءة النتائج بمستوى الخطورة الصحيح مهارة حوكمية بحد ذاتها يختبرها الاختبار والتدقيقات الحقيقية معاً.</p>
  $i6ar$,
  'عدم المطابقة مقابل الملاحظة مقابل فرصة التحسين | CyberAbeer',
  'الفرق بين عدم المطابقة الكبرى والصغرى والملاحظات وفرص التحسين في تدقيقات ISO 27001، والاستجابة المطلوبة لكل منها.',
  4
from articles art
join authors a on a.id = art.author_id
join categories c on c.id = art.category_id
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_iso_27001'
  and exists (select 1 from article_translations t2 where t2.article_id = art.id and t2.locale='en' and t2.slug='nonconformity-vs-observation-vs-ofi')
  and not exists (select 1 from article_translations t3 where t3.article_id = art.id and t3.locale='ar');

-- =======================================================================
-- I7. ISO 27001 Certification Journey
-- =======================================================================
insert into articles (id, author_id, category_id, status, schema_type, difficulty, audience, reviewed_at, published_at)
select gen_random_uuid(), a.id, c.id, 'published', 'Article', 'beginner', array['professionals','executives','ciso'], now(), now()
from authors a, categories c
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_iso_27001'
  and not exists (select 1 from article_translations t where t.locale='en' and t.slug='iso-27001-certification-journey');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'en',
  'ISO 27001 Certification Journey',
  'iso-27001-certification-journey',
  'From gap analysis to a certificate: the realistic stages and timeline of an ISO 27001 certification project.',
  $i7en$
<table class="content-decision-table">
<thead><tr><th>Stage</th><th>What happens</th></tr></thead>
<tbody>
<tr><td>Gap analysis</td><td>Assess current state against ISO 27001 requirements to scope the project</td></tr>
<tr><td>ISMS design and implementation</td><td>Build the policy suite, risk assessment, Statement of Applicability, and evidence base -- typically the longest phase</td></tr>
<tr><td>Internal audit + management review</td><td>Required before external certification audit -- confirms the ISMS is actually operating, not just documented</td></tr>
<tr><td>Stage 1 audit</td><td>Certification body reviews documentation and readiness; identifies gaps before Stage 2</td></tr>
<tr><td>Stage 2 audit</td><td>Certification body verifies the ISMS is implemented and effective in practice, not just on paper</td></tr>
<tr><td>Certificate issued</td><td>Valid for 3 years, subject to ongoing surveillance</td></tr>
<tr><td>Surveillance audits</td><td>Typically annual, checking continued conformance</td></tr>
<tr><td>Recertification audit</td><td>Full re-audit at the end of the 3-year cycle</td></tr>
</tbody>
</table>
<h2>Realistic timeline</h2>
<p>For an organization starting from limited existing documentation, 6-12 months from gap analysis to certificate is a realistic range, heavily dependent on organizational size and how mature existing security practices already are. Organizations that already run informal but genuine security practices (regular risk discussions, access reviews, incident handling) move faster, since the work is largely formalizing and documenting existing behavior rather than building from zero.</p>
<div class="content-callout">
  <div class="content-callout-title">Dr. Abeer Explains</div>
  <p>The most common project failure I see is not a lack of security controls -- it is a lack of evidence. Organizations often do the right things but do not document that they did them consistently, and an ISMS lives or dies on demonstrable evidence, not on what actually happened informally.</p>
</div>
  $i7en$,
  'ISO 27001 Certification Journey | CyberAbeer',
  'The ISO 27001 certification stages from gap analysis through Stage 1/2 audits, certificate issuance, surveillance, and recertification.',
  5
from articles art
join authors a on a.id = art.author_id
join categories c on c.id = art.category_id
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_iso_27001'
  and exists (select 1 from article_translations t2 where t2.article_id = art.id and t2.locale='en' and t2.slug='iso-27001-certification-journey')
  and not exists (select 1 from article_translations t3 where t3.article_id = art.id and t3.locale='en');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'ar',
  'رحلة الحصول على شهادة ISO 27001',
  'رحلة-الحصول-على-شهادة-iso-27001',
  'من تحليل الفجوات إلى الشهادة: المراحل والجدول الزمني الواقعي لمشروع الحصول على شهادة ISO 27001.',
  $i7ar$
<table class="content-decision-table">
<thead><tr><th>المرحلة</th><th>ماذا يحدث</th></tr></thead>
<tbody>
<tr><td>تحليل الفجوات</td><td>تقييم الوضع الحالي مقابل متطلبات ISO 27001 لتحديد نطاق المشروع</td></tr>
<tr><td>تصميم وتنفيذ نظام إدارة أمن المعلومات</td><td>بناء مجموعة السياسات وتقييم المخاطر وبيان قابلية التطبيق وقاعدة الأدلة -- عادة أطول مرحلة</td></tr>
<tr><td>التدقيق الداخلي + مراجعة الإدارة</td><td>مطلوبان قبل تدقيق الاعتماد الخارجي -- يؤكدان أن نظام إدارة أمن المعلومات يعمل فعلياً لا موثَّقاً فقط</td></tr>
<tr><td>تدقيق المرحلة 1</td><td>تراجع جهة الاعتماد الوثائق والجاهزية؛ وتحدد الفجوات قبل المرحلة 2</td></tr>
<tr><td>تدقيق المرحلة 2</td><td>تتحقق جهة الاعتماد من أن نظام إدارة أمن المعلومات مطبَّق وفعّال عملياً، لا على الورق فقط</td></tr>
<tr><td>إصدار الشهادة</td><td>سارية لثلاث سنوات، خاضعة لمراقبة مستمرة</td></tr>
<tr><td>تدقيقات المراقبة</td><td>عادة سنوية، تتحقق من استمرار المطابقة</td></tr>
<tr><td>تدقيق إعادة الاعتماد</td><td>إعادة تدقيق كاملة في نهاية دورة الثلاث سنوات</td></tr>
</tbody>
</table>
<h2>جدول زمني واقعي</h2>
<p>بالنسبة لمؤسسة تبدأ من توثيق محدود، يُعد نطاق 6-12 شهراً من تحليل الفجوات حتى الشهادة نطاقاً واقعياً، يعتمد بشدة على حجم المؤسسة ومدى نضج ممارسات الأمن الحالية. المؤسسات التي تُشغّل بالفعل ممارسات أمنية غير رسمية لكن حقيقية (مناقشات مخاطر منتظمة، مراجعات وصول، تعامل مع الحوادث) تتحرك أسرع، لأن العمل يتمثل في توثيق وإضفاء الطابع الرسمي على سلوك قائم بالفعل بدلاً من البناء من الصفر.</p>
<div class="content-callout">
  <div class="content-callout-title">د. عبير توضح</div>
  <p>أكثر فشل مشروع أراه ليس نقص الضوابط الأمنية -- بل نقص الأدلة. غالباً ما تفعل المؤسسات الأمور الصحيحة لكنها لا توثق أنها فعلتها بثبات، ويحيا نظام إدارة أمن المعلومات أو يموت بناءً على أدلة قابلة للإثبات، لا على ما حدث فعلياً بشكل غير رسمي.</p>
</div>
  $i7ar$,
  'رحلة الحصول على شهادة ISO 27001 | CyberAbeer',
  'مراحل الحصول على شهادة ISO 27001 من تحليل الفجوات عبر تدقيقي المرحلة 1/2، وإصدار الشهادة، والمراقبة، وإعادة الاعتماد.',
  5
from articles art
join authors a on a.id = art.author_id
join categories c on c.id = art.category_id
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_iso_27001'
  and exists (select 1 from article_translations t2 where t2.article_id = art.id and t2.locale='en' and t2.slug='iso-27001-certification-journey')
  and not exists (select 1 from article_translations t3 where t3.article_id = art.id and t3.locale='ar');

-- =======================================================================
-- Sources + relations (including cross-link to existing SoA article)
-- =======================================================================
insert into article_sources (article_id, title, publisher, url, published_date, accessed_date, sort_order)
select t.article_id, v.title, v.publisher, v.url, v.published_date::date, current_date, v.sort_order
from (values
  ('iso-27001-2022-explained', 'ISO/IEC 27001:2022 -- Information security management systems', 'ISO', 'https://www.iso.org/standard/27001', '2022-10-25', 1),
  ('annex-a-controls-explained', 'ISO/IEC 27001:2022 -- Information security management systems', 'ISO', 'https://www.iso.org/standard/27001', '2022-10-25', 1)
) as v(slug, title, publisher, url, published_date, sort_order)
join article_translations t on t.locale='en' and t.slug = v.slug
on conflict do nothing;

insert into article_relations (article_id, related_article_id, sort_order)
select src.article_id, dst.article_id, r.sort_order
from (values
  ('iso-27001-2022-explained', 'iso-27001-explained-for-beginners', 1),
  ('iso-27001-2022-explained', 'iso-27001-clauses-explained', 2),
  ('iso-27001-2022-explained', 'annex-a-controls-explained', 3),
  ('iso-27001-clauses-explained', 'iso-27001-risk-assessment', 1),
  ('iso-27001-clauses-explained', 'internal-audit-explained', 2),
  ('annex-a-controls-explained', 'what-is-a-statement-of-applicability', 1),
  ('annex-a-controls-explained', 'iso-27001-risk-assessment', 2),
  ('iso-27001-risk-assessment', 'what-is-a-statement-of-applicability', 1),
  ('iso-27001-risk-assessment', 'what-is-residual-cyber-risk', 2),
  ('internal-audit-explained', 'nonconformity-vs-observation-vs-ofi', 1),
  ('nonconformity-vs-observation-vs-ofi', 'iso-27001-certification-journey', 1),
  ('iso-27001-certification-journey', 'iso-27001-2022-explained', 1),
  ('iso-27001-certification-journey', 'what-is-a-statement-of-applicability', 2)
) as r(src_slug, dst_slug, sort_order)
join article_translations src on src.locale='en' and src.slug=r.src_slug
join article_translations dst on dst.locale='en' and dst.slug=r.dst_slug
on conflict (article_id, related_article_id) do nothing;
