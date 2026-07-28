-- =====================================================================
-- 013_content_seed_flagship_articles.sql
-- First content batch: 12 flagship articles, bilingual (EN/AR), seeded
-- as status = 'draft'. Run 012_content_engine_expansion.sql first.
--
-- IMPORTANT: every insert here uses status = 'draft' (the pre-existing
-- content_status value), never one of the values 012 just ADD VALUE'd
-- (researched/founder_review/approved/updated) -- Postgres will not
-- allow a new enum value to be used in the same transaction that added
-- it, and 012/013 may be pasted into the SQL editor back to back. A
-- platform admin moves these through the workflow by hand from the
-- (future) admin CMS once founder review happens; nothing here
-- auto-publishes. RLS (articles_public_read: status = 'published') means
-- these rows are invisible to anon/authenticated visitors until then --
-- verify with: select key, status from articles join ... where status != 'published';
--
-- Sourcing: article #01 and #11 are grounded in Dr. Abeer Alshammari's
-- own real, verifiable preprints (Zenodo, CC BY 4.0, DOIs cited in
-- article_sources below). #04 cites her real Turbo-NAFS preprint by
-- title only (no abstract is published for it, so no findings are
-- attributed beyond "this preprint exists and addresses X"). No
-- statistics, findings, or quotes are invented anywhere in this file;
-- claims about well-known public standards (NIST, ISO, ISACA, ISC2,
-- EC-Council) are limited to the fact of the standard's existence and
-- its publisher, not fabricated figures.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Author
-- ---------------------------------------------------------------------
insert into authors (id, display_name)
select gen_random_uuid(), 'Dr. Abeer Alshammari'
where not exists (select 1 from authors where display_name = 'Dr. Abeer Alshammari');

insert into author_translations (author_id, locale, bio)
select a.id, 'en',
  'Founder of CyberAbeer. Cybersecurity governance, risk, and compliance practitioner with more than 20 years of experience, holding a doctorate in Cybersecurity and Information Assurance, CISM, CISSP, and ISO/IEC 27001:2022 Lead Auditor credentials.'
from authors a where a.display_name = 'Dr. Abeer Alshammari'
on conflict (author_id, locale) do nothing;

insert into author_translations (author_id, locale, bio)
select a.id, 'ar',
  'مؤسسة CyberAbeer. ممارسة في حوكمة الأمن السيبراني وإدارة المخاطر والامتثال بخبرة تفوق 20 عاماً، حاصلة على درجة الدكتوراه في الأمن السيبراني وضمان المعلومات، وشهادات CISM وCISSP، ومدقق رئيسي معتمد لمعيار ISO/IEC 27001:2022.'
from authors a where a.display_name = 'Dr. Abeer Alshammari'
on conflict (author_id, locale) do nothing;

-- ---------------------------------------------------------------------
-- Tag: cross-cutting "Dr. Abeer Insights" label (Section 3). A tag,
-- not a category, because it cuts across pillars rather than naming a
-- topic -- an article can be *in* the GRC pillar *and* tagged as
-- founder-authority content at the same time.
-- ---------------------------------------------------------------------
insert into tags (key) values ('dr-abeer-insights') on conflict (key) do nothing;
insert into tag_translations (tag_id, locale, name, slug)
select id, 'en', 'Dr. Abeer Insights', 'dr-abeer-insights' from tags where key = 'dr-abeer-insights'
on conflict (tag_id, locale) do nothing;
insert into tag_translations (tag_id, locale, name, slug)
select id, 'ar', 'رؤى د. عبير', 'رؤى-د-عبير' from tags where key = 'dr-abeer-insights'
on conflict (tag_id, locale) do nothing;

-- =====================================================================
-- ARTICLE 01 (flagship) -- Cybersecurity Governance vs IT Governance
-- Grounded in: Alshammari, A. (2026). "Cybersecurity Governance vs IT
-- Governance: Why Conflating the Two Weakens Organizational
-- Resilience." Zenodo preprint, DOI 10.5281/zenodo.18526815.
-- =====================================================================
insert into articles (id, author_id, category_id, status, schema_type, difficulty, audience, reviewed_at)
select gen_random_uuid(), a.id, c.id, 'draft', 'Article', 'intermediate',
  array['professionals','executives','ciso'], null
from authors a, categories c
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_cybersecurity_governance';

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'en',
  'Cybersecurity Governance vs IT Governance: Why Confusing the Two Weakens Organizational Resilience',
  'cybersecurity-governance-vs-it-governance',
  'IT governance and cybersecurity governance are often treated as the same function under a different name. They are not, and the gap between them is where major incidents start.',
  $en1$
<p>Cybersecurity governance and IT governance get discussed as though they are the same discipline wearing two different name tags. In most organizations, cybersecurity still reports up through the same structures built for IT service delivery: uptime, infrastructure, project delivery. That arrangement made sense when security was mostly a technical function bolted onto operations. It does not hold up against how cyber risk actually behaves today.</p>

<h2>Two different jobs</h2>
<p>IT governance is about directing and controlling how technology delivers value: infrastructure reliability, service levels, project prioritization, budget efficiency. Cybersecurity governance is about how an organization directs and controls its exposure to cyber risk: who is accountable when something goes wrong, how risk appetite is set, how the board gets assurance that the risk picture it's being shown is accurate. One is an operations discipline. The other is a risk and accountability discipline. Folding the second into the first quietly demotes cyber risk into an IT problem, which is exactly the framing that lets a board treat a ransomware exposure as a line item instead of an enterprise risk.</p>

<h2>Board oversight and who owns cyber risk</h2>
<p>Governance research on this question keeps landing on the same conclusion from different angles: organizations with clearer role definitions, stronger board engagement, and more mature governance structures manage cyber risk more effectively. That is not a call for boards to become technical. It is a call for boards to treat cyber risk the way they already treat financial or legal risk, with a named owner, a defined appetite, and regular reporting that does not route entirely through the same function being asked to grade its own work.</p>

<h2>The CISO-CIO relationship is the fault line</h2>
<p>Most of the friction shows up in one relationship: where the CISO sits relative to the CIO. When the security function reports into IT, budget, priorities, and incident narratives all pass through a lens optimized for keeping systems running, not for surfacing uncomfortable risk. That is not a claim that CIOs act in bad faith. It is a structural conflict of interest, and structural conflicts of interest do not resolve themselves through good intentions.</p>

<h2>What actually changes when governance is separated</h2>
<ul class="content-checklist">
  <li>Reporting lines are restructured so the CISO has a path to the board or audit committee that does not run exclusively through IT leadership.</li>
  <li>Cyber risk is embedded into enterprise risk management instead of tracked as a standalone technical register.</li>
  <li>A Three Lines model is applied to cybersecurity specifically: operational security teams as the first line, an independent risk/governance function as the second, and internal audit as the third, so no single function is grading its own homework.</li>
</ul>

<h2>Why this matters beyond the org chart</h2>
<p>Research into major cyber incidents keeps surfacing the same pattern: the root cause is rarely a purely technical failure. It is a leadership and accountability gap, a place where risk was visible to someone but did not reach the people with authority to act on it in time. That is a governance failure wearing a technical costume. Fixing it starts with refusing to let "cybersecurity governance" and "IT governance" be used interchangeably, because they are not solving the same problem, and treating them as one quietly leaves the real one unowned.</p>
$en1$,
  'Cybersecurity Governance vs IT Governance | CyberAbeer',
  'Cybersecurity governance and IT governance are not the same discipline. Learn why conflating them weakens board oversight, CISO independence, and organizational resilience.',
  6
from articles art join authors a on a.id = art.author_id
join categories c on c.id = art.category_id
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_cybersecurity_governance'
  and not exists (select 1 from article_translations t where t.article_id = art.id and t.locale = 'en');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'ar',
  'حوكمة الأمن السيبراني مقابل حوكمة تقنية المعلومات: لماذا يضعف الخلط بينهما مرونة المؤسسة',
  'حوكمة-الامن-السيبراني-مقابل-حوكمة-تقنية-المعلومات',
  'كثيراً ما يُنظر إلى حوكمة تقنية المعلومات وحوكمة الأمن السيبراني على أنهما الوظيفة نفسها بمسمى مختلف. الحقيقة غير ذلك، والفجوة بينهما هي حيث تبدأ الحوادث الكبرى.',
  $ar1$
<p>يُطرح موضوع حوكمة الأمن السيبراني وحوكمة تقنية المعلومات وكأنهما تخصص واحد بمسميين مختلفين. في معظم المؤسسات، ما زال الأمن السيبراني يتبع نفس الهياكل التي بُنيت أصلاً لتقديم خدمات تقنية المعلومات: استمرارية التشغيل، البنية التحتية، تسليم المشاريع. كان هذا الترتيب منطقياً حين كان الأمن مجرد وظيفة تقنية مضافة على العمليات. لكنه لم يعد يصمد أمام الطريقة التي تتصرف بها المخاطر السيبرانية اليوم.</p>

<h2>وظيفتان مختلفتان</h2>
<p>حوكمة تقنية المعلومات تتعلق بتوجيه ومراقبة الطريقة التي تحقق بها التقنية القيمة: موثوقية البنية التحتية، مستويات الخدمة، أولويات المشاريع، كفاءة الميزانية. أما حوكمة الأمن السيبراني فتتعلق بكيفية توجيه المؤسسة ومراقبتها لتعرضها للمخاطر السيبرانية: من المسؤول عند حدوث خلل، وكيف تُحدَّد شهية المخاطر، وكيف يحصل مجلس الإدارة على تأكيد بأن الصورة المعروضة عليه دقيقة. الأولى تخصص تشغيلي، والثانية تخصص في المخاطر والمساءلة. دمج الثانية داخل الأولى يُنزل المخاطر السيبرانية بهدوء إلى مرتبة مشكلة تقنية، وهو بالضبط الإطار الذي يسمح لمجلس الإدارة بالتعامل مع التعرض لهجمات الفدية كبند ميزانية بدلاً من مخاطرة مؤسسية.</p>

<h2>رقابة مجلس الإدارة وملكية المخاطر السيبرانية</h2>
<p>تصل أبحاث الحوكمة إلى الاستنتاج نفسه من زوايا مختلفة: المؤسسات ذات الأدوار الأوضح، والمشاركة الأقوى من مجلس الإدارة، وهياكل الحوكمة الأنضج، تدير المخاطر السيبرانية بفعالية أكبر. هذا ليس دعوة لتحويل أعضاء مجلس الإدارة إلى تقنيين. إنه دعوة لأن يتعامل المجلس مع المخاطر السيبرانية كما يتعامل بالفعل مع المخاطر المالية أو القانونية: بمالك محدد، وشهية مخاطر معرَّفة، وتقارير دورية لا تمر بالكامل عبر الجهة نفسها المطلوب منها تقييم عملها.</p>

<h2>العلاقة بين رئيس أمن المعلومات ورئيس تقنية المعلومات هي خط الصدع</h2>
<p>يظهر معظم الاحتكاك في علاقة واحدة: موقع رئيس أمن المعلومات بالنسبة لرئيس تقنية المعلومات. حين تتبع وظيفة الأمن إدارة تقنية المعلومات، تمر الميزانية والأولويات وروايات الحوادث كلها عبر عدسة مصممة للحفاظ على تشغيل الأنظمة، لا لإظهار المخاطر غير المريحة. هذا ليس اتهاماً لرؤساء تقنية المعلومات بسوء النية، بل تضارب مصالح هيكلي، وتضارب المصالح الهيكلي لا يُحل بحسن النية وحدها.</p>

<h2>ما الذي يتغير فعلياً عند فصل الحوكمة</h2>
<ul class="content-checklist">
  <li>إعادة هيكلة خطوط التقارير بحيث يملك رئيس أمن المعلومات مساراً إلى مجلس الإدارة أو لجنة التدقيق لا يمر حصرياً عبر إدارة تقنية المعلومات.</li>
  <li>دمج المخاطر السيبرانية ضمن إدارة المخاطر المؤسسية بدلاً من تتبعها كسجل تقني منفصل.</li>
  <li>تطبيق نموذج الخطوط الثلاثة على الأمن السيبراني تحديداً: فرق الأمن التشغيلية كخط أول، ووظيفة حوكمة/مخاطر مستقلة كخط ثانٍ، والتدقيق الداخلي كخط ثالث، بحيث لا تقيّم أي جهة عملها بنفسها.</li>
</ul>

<h2>لماذا يهم هذا الأمر خارج الهيكل التنظيمي</h2>
<p>تكشف الأبحاث المتعلقة بالحوادث السيبرانية الكبرى النمط نفسه مراراً: السبب الجذري نادراً ما يكون فشلاً تقنياً بحتاً، بل فجوة في القيادة والمساءلة، حيث كانت المخاطرة مرئية لجهة ما لكنها لم تصل إلى من يملك صلاحية التصرف بشأنها في الوقت المناسب. هذا فشل حوكمي يرتدي زياً تقنياً. وتبدأ معالجته برفض استخدام "حوكمة الأمن السيبراني" و"حوكمة تقنية المعلومات" كمترادفين، لأنهما لا يعالجان المشكلة نفسها، والتعامل معهما كوظيفة واحدة يترك المشكلة الحقيقية بلا مالك بهدوء.</p>
$ar1$,
  'حوكمة الأمن السيبراني مقابل حوكمة تقنية المعلومات | CyberAbeer',
  'حوكمة الأمن السيبراني وحوكمة تقنية المعلومات ليستا تخصصاً واحداً. تعرّف على سبب إضعاف الخلط بينهما لرقابة مجلس الإدارة واستقلالية رئيس أمن المعلومات ومرونة المؤسسة.',
  6
from articles art join authors a on a.id = art.author_id
join categories c on c.id = art.category_id
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_cybersecurity_governance'
  and not exists (select 1 from article_translations t where t.article_id = art.id and t.locale = 'ar');

-- From here on, sources/tags are looked up via the article's unique
-- English slug (through article_translations), not via author+category
-- -- several articles below intentionally share the same hub category
-- (e.g. hub_cybersecurity_governance is used by #01, #07, #11), so a
-- category-based lookup would silently attach sources/tags to the
-- wrong article once more than one shares that category.
insert into article_sources (article_id, title, publisher, url, published_date, accessed_date)
select t.article_id,
  'Cybersecurity Governance vs IT Governance: Why Conflating the Two Weakens Organizational Resilience',
  'Zenodo (preprint)', 'https://zenodo.org/records/18526815', '2026-02-08', current_date
from article_translations t
where t.locale = 'en' and t.slug = 'cybersecurity-governance-vs-it-governance'
  and not exists (select 1 from article_sources s where s.article_id = t.article_id);

insert into article_tags (article_id, tag_id)
select t.article_id, tg.id
from article_translations t, tags tg
where t.locale = 'en' and t.slug = 'cybersecurity-governance-vs-it-governance' and tg.key = 'dr-abeer-insights'
on conflict do nothing;

-- =====================================================================
-- ARTICLE 02 -- What Is the GRCL Framework?
-- GRCL Knowledge Hub. Attributed explicitly to Dr. Abeer's doctoral
-- dissertation by its real, publicly listed title (see the Research
-- page: "Designing Adaptive Cybersecurity Governance Architectures: A
-- Layered GRC Framework for Resilient Digital Transformation"). This
-- article deliberately stays conceptual -- it explains the motivation
-- for a layered GRC approach and names GRCL as Dr. Abeer's own
-- doctoral contribution, without asserting specific internal
-- mechanics of the dissertation that have not been sourced from the
-- actual text (per the spec's "do not fabricate the paper" rule) --
-- and is explicit throughout that GRCL is original doctoral research,
-- not a published industry standard like ISO or NIST.
-- =====================================================================
insert into articles (id, author_id, category_id, status, schema_type, difficulty, audience, related_lab_key)
select gen_random_uuid(), a.id, c.id, 'draft', 'Article', 'intermediate',
  array['professionals','executives'], null
from authors a, categories c
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_grcl';

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'en',
  'What Is the GRCL Framework? A Layered Approach to Governance, Risk and Compliance',
  'what-is-the-grcl-framework',
  'GRCL is not an industry standard. It is Dr. Abeer Alshammari''s own doctoral framework for structuring governance, risk, and compliance as connected layers instead of separate silos.',
  $en2$
<p>Most organizations run governance, risk management, and compliance as three separate functions that occasionally exchange spreadsheets. Governance sets policy. Risk assesses exposure. Compliance checks boxes against a framework. Each does its job reasonably well in isolation, and yet the organization can still be surprised by a risk none of the three functions individually owned. GRCL, short for Governance, Risk and Compliance Layered, is the name Dr. Abeer Alshammari gave to the architecture she developed in her doctoral dissertation, <em>Designing Adaptive Cybersecurity Governance Architectures: A Layered GRC Framework for Resilient Digital Transformation</em>, to address exactly that gap.</p>

<div class="content-callout">
  <p class="content-callout-title">A note on what GRCL is</p>
  <p>GRCL is original doctoral research, developed by Dr. Abeer Alshammari and presented here as her own framework. It is not an ISO, NIST, or COBIT standard, and it is not positioned as one. Where this hub references published standards, they are cited separately and by name.</p>
</div>

<h2>Why "layered" instead of "separate"</h2>
<p>The core idea behind GRCL is that governance, risk, and compliance should be modeled as layers that inform each other continuously, rather than departments that meet quarterly. A policy decision made at the governance layer should visibly change what the risk layer treats as material. A new risk identified at the risk layer should be traceable to which compliance obligations it touches. When these three are structurally connected instead of loosely coordinated, an organization can trace a straight line from "why do we have this control" back to the governance decision that justified it, and forward to the risk it is meant to reduce.</p>

<h2>The problem it responds to</h2>
<p>Adaptive digital transformation, cloud migration, AI adoption, third-party dependency, moves faster than most GRC programs are structured to track. A layered architecture is meant to make governance adaptive rather than static: built to absorb new categories of risk (an AI agent, a new cloud dependency) without requiring the whole GRC program to be redesigned from scratch each time.</p>

<h2>Where GRCL shows up at CyberAbeer</h2>
<p>GreenTrust AI's risk assessment model and the CyberAbeer Labs governance curriculum both draw on the layered thinking behind GRCL: treating governance decisions, risk findings, and compliance obligations as connected records rather than independent artifacts. As more of the GRCL Knowledge Hub is published, later articles will go deeper into specific layers and how they apply to AI governance, data trust, and cybersecurity governance individually.</p>

<p>The full dissertation is not yet published in the CyberAbeer Insights library. A publication list is available on request via the <a href="/en/research">Research page</a>.</p>
$en2$,
  'What Is the GRCL Framework? | CyberAbeer',
  'GRCL (Governance, Risk and Compliance Layered) is Dr. Abeer Alshammari''s doctoral framework for connecting governance, risk, and compliance instead of running them as separate silos.',
  4
from articles art join authors a on a.id = art.author_id join categories c on c.id = art.category_id
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_grcl'
  and not exists (select 1 from article_translations t where t.article_id = art.id and t.locale = 'en');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'ar',
  'ما هو إطار GRCL؟ نهج طبقي للحوكمة وإدارة المخاطر والامتثال',
  'ما-هو-اطار-grcl',
  'إطار GRCL ليس معياراً صناعياً. إنه إطار الدكتوراه الخاص بالدكتورة عبير الشمري لبناء الحوكمة وإدارة المخاطر والامتثال كطبقات مترابطة بدلاً من وحدات منفصلة.',
  $ar2$
<p>تدير معظم المؤسسات الحوكمة وإدارة المخاطر والامتثال كثلاث وظائف منفصلة تتبادل جداول البيانات من حين لآخر. الحوكمة تضع السياسات. إدارة المخاطر تقيّم التعرض. الامتثال يتحقق من المربعات مقابل إطار معين. كل وظيفة تؤدي عملها بشكل معقول بمعزل عن الأخرى، ومع ذلك قد تتفاجأ المؤسسة بمخاطرة لم تكن أي من الوظائف الثلاث تملكها فعلياً. إطار GRCL، اختصاراً لـ"الحوكمة وإدارة المخاطر والامتثال الطبقي"، هو الاسم الذي أطلقته الدكتورة عبير الشمري على البنية التي طوّرتها في أطروحة الدكتوراه الخاصة بها، بعنوان <em>تصميم بنى حوكمة أمن سيبراني تكيفية: إطار متعدد الطبقات للحوكمة وإدارة المخاطر والامتثال من أجل تحول رقمي مرن</em>، لمعالجة هذه الفجوة تحديداً.</p>

<div class="content-callout">
  <p class="content-callout-title">ملاحظة حول طبيعة إطار GRCL</p>
  <p>إطار GRCL بحث دكتوراه أصيل، طوّرته الدكتورة عبير الشمري ويُعرض هنا كإطار خاص بها. وهو ليس معيار ISO أو NIST أو COBIT، ولا يُقدَّم على أنه كذلك. وحين يشير هذا المحور إلى معايير منشورة، تُذكر تلك المعايير بشكل منفصل وباسمها الصريح.</p>
</div>

<h2>لماذا "طبقي" لا "منفصل"</h2>
<p>الفكرة الجوهرية وراء إطار GRCL هي أن الحوكمة وإدارة المخاطر والامتثال ينبغي أن تُصمَّم كطبقات تتبادل التأثير باستمرار، لا كإدارات تجتمع كل ربع سنة. القرار السياسي الذي يُتخذ على مستوى الحوكمة ينبغي أن يُغيّر بوضوح ما تعتبره طبقة المخاطر جوهرياً. والمخاطرة الجديدة التي تُكتشف على مستوى إدارة المخاطر ينبغي أن يمكن تتبعها إلى الالتزامات الامتثالية التي تمسّها. حين تكون هذه الطبقات الثلاث مترابطة هيكلياً بدلاً من منسقة بشكل فضفاض، تستطيع المؤسسة رسم خط مباشر من "لماذا لدينا هذا الضابط" رجوعاً إلى القرار الحوكمي الذي بررّه، وتقدماً إلى المخاطرة التي يُفترض أن يخفّضها.</p>

<h2>المشكلة التي يستجيب لها</h2>
<p>التحول الرقمي التكيفي، والانتقال إلى الحوسبة السحابية، وتبني الذكاء الاصطناعي، والاعتماد على أطراف ثالثة، كلها تتحرك أسرع مما يمكن لمعظم برامج الحوكمة والمخاطر والامتثال تتبعه هيكلياً. الهدف من البنية الطبقية هو جعل الحوكمة تكيفية بدلاً من ثابتة: مصممة لاستيعاب فئات جديدة من المخاطر (وكيل ذكاء اصطناعي، اعتماد سحابي جديد) دون الحاجة لإعادة تصميم برنامج الحوكمة والمخاطر والامتثال بالكامل في كل مرة.</p>

<h2>أين يظهر إطار GRCL في CyberAbeer</h2>
<p>يستند نموذج تقييم المخاطر في GreenTrust AI ومنهج الحوكمة في CyberAbeer Labs إلى التفكير الطبقي الذي يقوم عليه إطار GRCL: التعامل مع قرارات الحوكمة ونتائج تقييم المخاطر والالتزامات الامتثالية كسجلات مترابطة بدلاً من عناصر مستقلة. ومع نشر المزيد من محتوى مركز معرفة GRCL، ستتناول المقالات القادمة كل طبقة بتفصيل أكبر وتطبيقها على حوكمة الذكاء الاصطناعي والثقة في البيانات وحوكمة الأمن السيبراني.</p>

<p>الأطروحة الكاملة لم تُنشر بعد في مكتبة رؤى CyberAbeer. قائمة المنشورات الكاملة متاحة عند الطلب عبر <a href="/ar/research">صفحة الأبحاث</a>.</p>
$ar2$,
  'ما هو إطار GRCL؟ | CyberAbeer',
  'إطار GRCL (الحوكمة وإدارة المخاطر والامتثال الطبقي) هو إطار الدكتوراه الخاص بالدكتورة عبير الشمري لربط الحوكمة وإدارة المخاطر والامتثال بدلاً من إدارتها كوحدات منفصلة.',
  4
from articles art join authors a on a.id = art.author_id join categories c on c.id = art.category_id
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_grcl'
  and not exists (select 1 from article_translations t where t.article_id = art.id and t.locale = 'ar');

insert into article_tags (article_id, tag_id)
select t.article_id, tg.id
from article_translations t, tags tg
where t.locale = 'en' and t.slug = 'what-is-the-grcl-framework' and tg.key = 'dr-abeer-insights'
on conflict do nothing;

-- =====================================================================
-- ARTICLE 03 -- AI Agent Governance
-- AI Agent Governance Hub. General practitioner guidance; source is
-- the public NIST AI Risk Management Framework (well-established,
-- stable, official URL), not a Dr. Abeer preprint -- no confirmed
-- source of hers on this exact topic exists yet, so none is invented.
-- =====================================================================
insert into articles (id, author_id, category_id, status, schema_type, difficulty, audience)
select gen_random_uuid(), a.id, c.id, 'draft', 'Article', 'intermediate', array['professionals','ciso']
from authors a, categories c
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_ai_agent_governance';

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'en',
  'AI Agent Governance: Why Autonomous AI Systems Need Their Own Governance Model',
  'ai-agent-governance-why-autonomous-ai-needs-its-own-model',
  'An AI agent that can act on its own, call tools, and make decisions is not just software. Governing it like a regular application misses the risk that actually matters.',
  $en3$
<p>Most application security programs assume the software does what it was told, in the order it was told to do it. An AI agent breaks that assumption by design. It decides which tool to call, in what order, based on a prompt and a model, and it can be wrong in ways that are hard to predict from the code alone. Treating an AI agent like a regular application in your asset inventory means governing the container and missing the actual risk, which lives in what the agent is allowed to do once it is running.</p>

<h2>Identity: who, or what, is acting</h2>
<p>Every AI agent needs an identity distinct from the human who deployed it and distinct from the service account it runs under. Without that, "the agent did it" and "someone using the agent's credentials did it" become indistinguishable in your logs, which is exactly the ambiguity an incident response process cannot afford.</p>

<h2>Permissions: least privilege applies here too</h2>
<p>An agent's permissions should be scoped to the narrowest set of systems and actions it actually needs, reviewed on a schedule, not granted once and forgotten. The NIST AI Risk Management Framework frames this as part of the broader discipline of mapping an AI system's context and governing it accordingly, rather than assuming a one-time approval covers an agent for its operational lifetime.</p>

<h2>Oversight: who reviews what the agent decided</h2>
<p>Autonomy without review is the actual governance gap. An agent that can take an action, not just recommend one, needs a defined point where a human or a control reviews outcomes, especially for anything irreversible: sending an email, moving money, deleting data, changing a permission.</p>

<table class="content-comparison-table">
  <thead><tr><th>Governance question</th><th>Traditional application</th><th>Autonomous AI agent</th></tr></thead>
  <tbody>
    <tr><td>Who is accountable for an action taken?</td><td>The user who triggered it</td><td>Needs an explicit owner; the agent alone cannot be held accountable</td></tr>
    <tr><td>Can behavior be fully predicted from code review?</td><td>Largely yes</td><td>No; model behavior varies by prompt and context</td></tr>
    <tr><td>How often should permissions be reviewed?</td><td>Periodically</td><td>More frequently, and after any change to the agent's tools or scope</td></tr>
  </tbody>
</table>

<h2>Accountability: a passport, not a one-time approval</h2>
<p>A practical governance model treats each AI agent like it carries a passport: a durable, inspectable record of who owns it, what it's allowed to touch, what it has done, and when it was last reviewed. That record should be queryable independent of the agent itself, so governance does not depend on the agent accurately reporting on its own behavior.</p>

<p>Autonomous AI agents are still new enough that most organizations are governing them with policies written for regular software. That gap is exactly what an AI agent governance program needs to close first, before scale makes it expensive to fix.</p>
$en3$,
  'AI Agent Governance | CyberAbeer',
  'Autonomous AI agents need governance built for identity, permissions, and oversight, not the application security model built for traditional software.',
  5
from articles art join authors a on a.id = art.author_id join categories c on c.id = art.category_id
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_ai_agent_governance'
  and not exists (select 1 from article_translations t where t.article_id = art.id and t.locale = 'en');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'ar',
  'حوكمة وكلاء الذكاء الاصطناعي: لماذا تحتاج الأنظمة المستقلة نموذج حوكمة خاصاً بها',
  'حوكمة-وكلاء-الذكاء-الاصطناعي',
  'وكيل الذكاء الاصطناعي القادر على التصرف بمفرده واستدعاء الأدوات واتخاذ القرارات ليس مجرد برمجية عادية. حوكمته كتطبيق عادي تُغفل المخاطرة الحقيقية.',
  $ar3$
<p>تفترض معظم برامج أمن التطبيقات أن البرمجية تنفّذ ما طُلب منها، بالترتيب الذي طُلب به. وكيل الذكاء الاصطناعي يكسر هذا الافتراض بتصميمه. فهو يقرر أي أداة يستدعي، وبأي ترتيب، بناءً على موجّه ونموذج، وقد يخطئ بطرق يصعب التنبؤ بها من الشيفرة وحدها. التعامل مع وكيل الذكاء الاصطناعي كتطبيق عادي في سجل الأصول يعني حوكمة الحاوية مع إغفال المخاطرة الفعلية، والتي تكمن فيما يُسمح للوكيل بفعله بمجرد أن يبدأ التشغيل.</p>

<h2>الهوية: من، أو ما الذي يتصرف</h2>
<p>يحتاج كل وكيل ذكاء اصطناعي إلى هوية مستقلة عن الشخص الذي نشره ومستقلة عن حساب الخدمة الذي يعمل تحته. بدون ذلك، يصبح "الوكيل هو من فعل ذلك" و"شخص استخدم بيانات اعتماد الوكيل" أمرين لا يمكن تمييزهما في السجلات، وهو بالضبط الغموض الذي لا تحتمله عملية الاستجابة للحوادث.</p>

<h2>الصلاحيات: مبدأ الحد الأدنى ينطبق هنا أيضاً</h2>
<p>ينبغي أن تقتصر صلاحيات الوكيل على أضيق مجموعة من الأنظمة والإجراءات التي يحتاجها فعلاً، وأن تُراجَع بشكل دوري، لا أن تُمنح مرة واحدة ثم تُنسى. يؤطر إطار NIST لإدارة مخاطر الذكاء الاصطناعي هذا كجزء من انضباط أوسع يتمثل في رسم سياق نظام الذكاء الاصطناعي وحوكمته وفقاً لذلك، بدلاً من افتراض أن موافقة لمرة واحدة تغطي الوكيل طوال دورة تشغيله.</p>

<h2>الرقابة: من يراجع ما قرره الوكيل</h2>
<p>الاستقلالية بلا مراجعة هي الفجوة الحوكمية الحقيقية. الوكيل القادر على اتخاذ إجراء، لا مجرد التوصية به، يحتاج نقطة محددة يراجع فيها إنسان أو ضابط تحكم النتائج، خصوصاً في أي إجراء لا رجعة فيه: إرسال بريد إلكتروني، تحريك أموال، حذف بيانات، تغيير صلاحية.</p>

<table class="content-comparison-table">
  <thead><tr><th>سؤال الحوكمة</th><th>التطبيق التقليدي</th><th>وكيل الذكاء الاصطناعي المستقل</th></tr></thead>
  <tbody>
    <tr><td>من المسؤول عن إجراء تم اتخاذه؟</td><td>المستخدم الذي أطلقه</td><td>يحتاج مالكاً صريحاً؛ لا يمكن مساءلة الوكيل وحده</td></tr>
    <tr><td>هل يمكن التنبؤ الكامل بالسلوك من مراجعة الشيفرة؟</td><td>غالباً نعم</td><td>لا؛ يتغير سلوك النموذج حسب الموجّه والسياق</td></tr>
    <tr><td>كم مرة ينبغي مراجعة الصلاحيات؟</td><td>دورياً</td><td>بشكل أكثر تكراراً، وبعد أي تغيير في أدوات الوكيل أو نطاقه</td></tr>
  </tbody>
</table>

<h2>المساءلة: جواز سفر لا موافقة لمرة واحدة</h2>
<p>يتعامل نموذج الحوكمة العملي مع كل وكيل ذكاء اصطناعي وكأنه يحمل جواز سفر: سجل دائم وقابل للتدقيق يوضح من يملكه، وما يُسمح له بلمسه، وما فعله، ومتى آخر مراجعة له. ينبغي أن يكون هذا السجل قابلاً للاستعلام بشكل مستقل عن الوكيل نفسه، بحيث لا تعتمد الحوكمة على دقة تقرير الوكيل عن سلوكه الخاص.</p>

<p>ما زالت وكلاء الذكاء الاصطناعي المستقلة جديدة بما يكفي لتحكم معظم المؤسسات فيها بسياسات كُتبت للبرمجيات العادية. هذه الفجوة بالضبط هي ما يحتاج برنامج حوكمة وكلاء الذكاء الاصطناعي إلى سدّه أولاً، قبل أن يجعل النمو تكلفة إصلاحها باهظة.</p>
$ar3$,
  'حوكمة وكلاء الذكاء الاصطناعي | CyberAbeer',
  'تحتاج وكلاء الذكاء الاصطناعي المستقلة حوكمة مبنية على الهوية والصلاحيات والرقابة، لا نموذج أمن التطبيقات المصمم للبرمجيات التقليدية.',
  5
from articles art join authors a on a.id = art.author_id join categories c on c.id = art.category_id
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_ai_agent_governance'
  and not exists (select 1 from article_translations t where t.article_id = art.id and t.locale = 'ar');

insert into article_sources (article_id, title, publisher, url, published_date, accessed_date)
select t.article_id, 'AI Risk Management Framework (AI RMF 1.0)', 'National Institute of Standards and Technology (NIST)',
  'https://www.nist.gov/itl/ai-risk-management-framework', '2023-01-26', current_date
from article_translations t
where t.locale = 'en' and t.slug = 'ai-agent-governance-why-autonomous-ai-needs-its-own-model'
  and not exists (select 1 from article_sources s where s.article_id = t.article_id);

-- =====================================================================
-- ARTICLE 04 -- Post-Quantum Cryptography
-- Post-Quantum Hub. Cites Dr. Abeer's real Turbo-NAFS preprint (title
-- only -- no abstract is published for it, so no findings from it are
-- claimed beyond the fact of its existence and topic) plus the public
-- NIST Post-Quantum Cryptography project.
-- =====================================================================
insert into articles (id, author_id, category_id, status, schema_type, difficulty, audience)
select gen_random_uuid(), a.id, c.id, 'draft', 'Article', 'intermediate', array['professionals','ciso']
from authors a, categories c
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_post_quantum';

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'en',
  'Post-Quantum Cryptography: What Security Teams Need to Know Before 2030',
  'post-quantum-cryptography-what-security-teams-need-to-know',
  'A cryptographically relevant quantum computer does not need to exist yet for post-quantum migration to be urgent. Encrypted data being harvested today is the risk.',
  $en4$
<p>The argument for starting post-quantum migration now, before a cryptographically relevant quantum computer exists, is not speculative. It is "harvest now, decrypt later": data encrypted today with RSA or ECC can be captured and stored by an adversary, sitting inert until a sufficiently capable quantum computer can break it. For data that needs to stay confidential for years, health records, government communications, long-lived intellectual property, that future decryption risk is already live today, regardless of when the quantum computer itself arrives.</p>

<h2>What "quantum-vulnerable" actually means</h2>
<p>RSA and ECC, the asymmetric algorithms underpinning most of today's key exchange and digital signatures, are the ones at risk. Symmetric algorithms like AES-256 and hash functions like SHA-256 are far more resistant and are not the priority for migration, though key sizes may still warrant review.</p>

<h2>NIST has already standardized the replacements</h2>
<p>NIST's Post-Quantum Cryptography project has published standardized algorithms, including Kyber for key encapsulation and Dilithium for digital signatures, giving organizations concrete targets to migrate toward rather than a moving research target. This is a rare case where the "what do we migrate to" question already has an authoritative answer; the harder question is "where in our environment is the vulnerable cryptography actually deployed."</p>

<h2>Migration starts with an inventory you probably don't have</h2>
<ul class="content-checklist">
  <li>Build a cryptographic asset inventory: which systems use RSA/ECC, where certificates and keys live, which vendors and protocols depend on them.</li>
  <li>Run a HNDL (harvest-now-decrypt-later) assessment focused on data with a long confidentiality shelf life.</li>
  <li>Prioritize migration by exposure and data sensitivity, not by convenience.</li>
  <li>Build migration into normal certificate and system refresh cycles instead of treating it as a standalone emergency project.</li>
</ul>

<h2>Ongoing research into new schemes</h2>
<p>Post-quantum cryptography research is still active well beyond the NIST-standardized set. Dr. Abeer Alshammari's own preprint, <em>Design of Turbo-NAFS: A Quantum-Resilient Encryption Scheme Based on Functional Superposition</em>, is one example of the kind of exploratory work happening in this space, proposing an additional encryption approach designed with quantum resistance in mind. Research like this matters for the field even before (or if) it becomes a standardized, deployable algorithm, because the standardized set NIST has published today is not guaranteed to be the final word.</p>

<p>The organizations that will handle this transition well are the ones that start the inventory now, while there is no deadline pressure, rather than waiting for a forcing event.</p>
$en4$,
  'Post-Quantum Cryptography Guide | CyberAbeer',
  'Why post-quantum migration is urgent before a cryptographically relevant quantum computer exists, what NIST has standardized, and how to start a realistic migration plan.',
  5
from articles art join authors a on a.id = art.author_id join categories c on c.id = art.category_id
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_post_quantum'
  and not exists (select 1 from article_translations t where t.article_id = art.id and t.locale = 'en');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'ar',
  'التشفير ما بعد الكمي: ما تحتاج فرق الأمن معرفته قبل عام 2030',
  'التشفير-ما-بعد-الكمي',
  'لا يحتاج الانتقال إلى التشفير ما بعد الكمي إلى وجود حاسوب كمي قادر على كسر التشفير الحالي كي يصبح أمراً ملحاً. البيانات المشفّرة التي تُجمع اليوم هي المخاطرة.',
  $ar4$
<p>الحجة وراء بدء الانتقال إلى التشفير ما بعد الكمي الآن، قبل وجود حاسوب كمي قادر فعلياً على كسر التشفير، ليست افتراضية. إنها استراتيجية "اجمع الآن، فك التشفير لاحقاً": يمكن لخصم أن يلتقط ويخزّن البيانات المشفّرة اليوم بخوارزميات RSA أو ECC، لتبقى خاملة إلى أن يصبح حاسوب كمي قادراً بما يكفي على كسرها. بالنسبة للبيانات التي يجب أن تبقى سرية لسنوات، كالسجلات الصحية والاتصالات الحكومية والملكية الفكرية طويلة الأمد، فإن مخاطرة فك التشفير المستقبلية قائمة بالفعل اليوم، بغض النظر عن موعد وصول الحاسوب الكمي نفسه.</p>

<h2>ماذا يعني "عرضة للحوسبة الكمية" فعلياً</h2>
<p>خوارزميات RSA وECC، وهي الخوارزميات غير المتماثلة التي يقوم عليها معظم تبادل المفاتيح والتوقيعات الرقمية اليوم، هي المعرّضة للخطر. أما الخوارزميات المتماثلة مثل AES-256 ودوال التجزئة مثل SHA-256 فهي أكثر مقاومة بكثير وليست أولوية للانتقال، وإن كان حجم المفاتيح قد يستحق المراجعة.</p>

<h2>NIST وضعت البدائل المعيارية بالفعل</h2>
<p>نشر مشروع NIST للتشفير ما بعد الكمي خوارزميات معيارية، من بينها Kyber لتغليف المفاتيح وDilithium للتوقيعات الرقمية، ما يمنح المؤسسات أهدافاً محددة للانتقال إليها بدلاً من هدف بحثي متحرك. هذه حالة نادرة تكون فيها إجابة سؤال "إلى ماذا ننتقل" متوفرة بالفعل من جهة موثوقة؛ والسؤال الأصعب هو "أين يُنشر فعلياً التشفير المعرَّض للخطر في بيئتنا".</p>

<h2>الانتقال يبدأ بجرد لا تملكه غالباً</h2>
<ul class="content-checklist">
  <li>بناء سجل جرد للأصول التشفيرية: أي الأنظمة تستخدم RSA/ECC، وأين توجد الشهادات والمفاتيح، وأي الموردين والبروتوكولات تعتمد عليها.</li>
  <li>إجراء تقييم "اجمع الآن، فك التشفير لاحقاً" يركّز على البيانات ذات العمر السري الطويل.</li>
  <li>ترتيب أولويات الانتقال حسب التعرض وحساسية البيانات، لا حسب السهولة.</li>
  <li>دمج الانتقال ضمن دورات تجديد الشهادات والأنظمة الاعتيادية بدلاً من التعامل معه كمشروع طارئ منفصل.</li>
</ul>

<h2>أبحاث مستمرة حول مخططات جديدة</h2>
<p>لا يزال البحث في التشفير ما بعد الكمي نشطاً إلى حد كبير يتجاوز المجموعة المعيارية التي حددتها NIST. تُعد ورقة الدكتورة عبير الشمري نفسها، <em>تصميم Turbo-NAFS: مخطط تشفير مقاوم للحوسبة الكمية قائم على التراكب الوظيفي</em>، مثالاً على نوع العمل الاستكشافي الجاري في هذا المجال، إذ تقترح نهج تشفير إضافي مصمم مع مراعاة المقاومة الكمية. تكتسب أبحاث كهذه أهمية للمجال حتى قبل (أو إن) أصبحت خوارزمية معيارية قابلة للنشر، لأن المجموعة المعيارية التي نشرتها NIST اليوم ليست بالضرورة الكلمة الأخيرة.</p>

<p>المؤسسات التي ستدير هذا الانتقال بنجاح هي تلك التي تبدأ الجرد الآن، بينما لا يوجد ضغط زمني، بدلاً من انتظار حدث يفرض ذلك عليها.</p>
$ar4$,
  'دليل التشفير ما بعد الكمي | CyberAbeer',
  'لماذا يُعد الانتقال إلى التشفير ما بعد الكمي ملحاً قبل وجود حاسوب كمي قادر على كسر التشفير، وماذا حددت NIST كمعيار، وكيف تبدأ خطة انتقال واقعية.',
  5
from articles art join authors a on a.id = art.author_id join categories c on c.id = art.category_id
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_post_quantum'
  and not exists (select 1 from article_translations t where t.article_id = art.id and t.locale = 'ar');

insert into article_sources (article_id, title, publisher, url, published_date, accessed_date)
select t.article_id, s.title, s.publisher, s.url, s.published_date, current_date
from article_translations t
join (values
  ('Design of Turbo-NAFS: A Quantum-Resilient Encryption Scheme Based on Functional Superposition', 'Zenodo (preprint)', 'https://zenodo.org/records/18532048', '2026-02-09'::date),
  ('Post-Quantum Cryptography (PQC) Project', 'National Institute of Standards and Technology (NIST)', 'https://www.nist.gov/pqcrypto', null)
) as s(title, publisher, url, published_date) on true
where t.locale = 'en' and t.slug = 'post-quantum-cryptography-what-security-teams-need-to-know'
  and not exists (select 1 from article_sources src where src.article_id = t.article_id);

-- =====================================================================
-- ARTICLE 05 -- Data Classification 101
-- Data Classification Hub. General practitioner framework, matching
-- the platform's own real data_classifications seed data (public /
-- internal / confidential / restricted, 008_seed_data.sql) rather than
-- any specific employer's confidential scheme -- satisfies the "use
-- generalized professional knowledge" constraint directly.
-- =====================================================================
insert into articles (id, author_id, category_id, status, schema_type, difficulty, audience)
select gen_random_uuid(), a.id, c.id, 'draft', 'Article', 'beginner', array['professionals','students']
from authors a, categories c
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_data_classification';

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'en',
  'Data Classification 101: Building a Practical Framework for Any Organization',
  'data-classification-101-practical-framework',
  'You cannot protect data you have not classified. A simple, consistently applied classification scheme does more for data security than most advanced tooling.',
  $en5$
<p>Data classification is one of the least glamorous parts of a security program and one of the most consequential. If you don't know which data is sensitive, every downstream control, encryption, access restrictions, retention policy, is guessing. A classification scheme does not need to be elaborate to be effective. It needs to be consistent, and it needs people to actually use it.</p>

<h2>A four-tier model that works for most organizations</h2>
<table class="content-comparison-table">
  <thead><tr><th>Tier</th><th>Example data</th><th>Typical handling</th></tr></thead>
  <tbody>
    <tr><td>Public</td><td>Marketing content, published reports</td><td>No special handling required</td></tr>
    <tr><td>Internal</td><td>Internal memos, non-sensitive process docs</td><td>Restricted to employees, not for external sharing</td></tr>
    <tr><td>Confidential</td><td>Customer data, contracts, financial detail</td><td>Access limited by role, encrypted at rest and in transit</td></tr>
    <tr><td>Restricted</td><td>Credentials, health data, regulated personal data</td><td>Strict need-to-know access, logged and audited</td></tr>
  </tbody>
</table>
<p>This is deliberately generic. It is not any specific organization's actual classification policy, it is a starting structure any organization can adapt to its own regulatory context and risk appetite.</p>

<h2>Classification only works if it is enforced somewhere real</h2>
<ul class="content-checklist">
  <li>Every new system or data store gets a classification assigned before data enters it, not after an incident forces the question.</li>
  <li>Access controls, encryption requirements, and retention rules are tied directly to classification tier, not decided case by case.</li>
  <li>Classification labels are visible where people actually work: file properties, database schemas, data catalogs, not buried in a policy document nobody reads.</li>
  <li>Reclassification is a defined process, not a one-time exercise. Data sensitivity changes as regulations, products, and partnerships change.</li>
</ul>

<h2>The most common failure mode</h2>
<p>The classification scheme is rarely the problem. The failure is almost always that classification lives in a policy PDF while actual data handling decisions get made ad hoc, by whoever provisioned the system. Closing that gap is a governance problem before it is a technical one: classification needs an owner, a review cadence, and a way to check that what's documented matches what's actually deployed.</p>
$en5$,
  'Data Classification 101 | CyberAbeer',
  'A practical, four-tier data classification framework any organization can adapt, and why classification schemes fail without enforcement.',
  4
from articles art join authors a on a.id = art.author_id join categories c on c.id = art.category_id
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_data_classification'
  and not exists (select 1 from article_translations t where t.article_id = art.id and t.locale = 'en');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'ar',
  'أساسيات تصنيف البيانات: بناء إطار عملي لأي مؤسسة',
  'اساسيات-تصنيف-البيانات',
  'لا يمكنك حماية بيانات لم تصنّفها. نظام تصنيف بسيط ومطبَّق بثبات يقدم لأمن البيانات أكثر مما تقدمه معظم الأدوات المتقدمة.',
  $ar5$
<p>تصنيف البيانات من أقل أجزاء برنامج الأمن بريقاً ومن أكثرها أهمية. إن لم تعرف أي البيانات حساسة، فإن كل ضابط تحكم لاحق، التشفير، قيود الوصول، سياسة الاحتفاظ، يصبح تخميناً. لا يحتاج نظام التصنيف إلى أن يكون معقداً كي يكون فعالاً. يحتاج فقط إلى الاتساق، وإلى أن يستخدمه الناس فعلياً.</p>

<h2>نموذج من أربع مستويات يناسب معظم المؤسسات</h2>
<table class="content-comparison-table">
  <thead><tr><th>المستوى</th><th>مثال على البيانات</th><th>التعامل المعتاد</th></tr></thead>
  <tbody>
    <tr><td>عام</td><td>محتوى تسويقي، تقارير منشورة</td><td>لا يتطلب معاملة خاصة</td></tr>
    <tr><td>داخلي</td><td>مذكرات داخلية، وثائق عمليات غير حساسة</td><td>مقتصر على الموظفين، غير قابل للمشاركة الخارجية</td></tr>
    <tr><td>سري</td><td>بيانات العملاء، العقود، التفاصيل المالية</td><td>وصول مقيّد حسب الدور، مشفّر أثناء التخزين والنقل</td></tr>
    <tr><td>مقيّد</td><td>بيانات الاعتماد، البيانات الصحية، البيانات الشخصية المنظّمة</td><td>وصول صارم على أساس الحاجة للمعرفة، مسجَّل ومدقَّق</td></tr>
  </tbody>
</table>
<p>هذا النموذج عام بشكل متعمد. إنه ليس سياسة التصنيف الفعلية لأي مؤسسة محددة، بل بنية بداية يمكن لأي مؤسسة تكييفها مع سياقها التنظيمي وشهية المخاطر الخاصة بها.</p>

<h2>التصنيف لا يعمل إلا إذا فُرض في مكان حقيقي</h2>
<ul class="content-checklist">
  <li>يُمنح كل نظام أو مخزن بيانات جديد تصنيفاً قبل دخول البيانات إليه، لا بعد أن يفرض حادث ما هذا السؤال.</li>
  <li>تُربط ضوابط الوصول ومتطلبات التشفير وقواعد الاحتفاظ مباشرة بمستوى التصنيف، لا أن تُقرَّر حالة بحالة.</li>
  <li>تكون علامات التصنيف مرئية حيث يعمل الناس فعلياً: خصائص الملفات، مخططات قواعد البيانات، كتالوجات البيانات، لا مدفونة في وثيقة سياسات لا يقرأها أحد.</li>
  <li>إعادة التصنيف عملية محددة، لا تمرين لمرة واحدة. حساسية البيانات تتغير مع تغير الأنظمة والمنتجات والشراكات.</li>
</ul>

<h2>نمط الفشل الأكثر شيوعاً</h2>
<p>نظام التصنيف نادراً ما يكون هو المشكلة. الفشل يكمن غالباً في أن التصنيف يعيش في مستند سياسة بصيغة PDF بينما تُتخذ قرارات التعامل الفعلي مع البيانات بشكل عشوائي، من قِبل من قام بتوفير النظام. سد هذه الفجوة مشكلة حوكمية قبل أن تكون تقنية: يحتاج التصنيف إلى مالك، ودورة مراجعة، وطريقة للتحقق من أن ما هو موثّق يطابق ما هو منشور فعلياً.</p>
$ar5$,
  'أساسيات تصنيف البيانات | CyberAbeer',
  'إطار عملي من أربعة مستويات لتصنيف البيانات يمكن لأي مؤسسة تكييفه، ولماذا تفشل أنظمة التصنيف دون تطبيق فعلي.',
  4
from articles art join authors a on a.id = art.author_id join categories c on c.id = art.category_id
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_data_classification'
  and not exists (select 1 from article_translations t where t.article_id = art.id and t.locale = 'ar');

-- =====================================================================
-- ARTICLE 06 -- Phishing in 2026
-- Cyber Defense pillar. Ties to the real, live Phishing Hunter
-- challenge as its "try it" CTA (relatedLabKey = a real challengeKey,
-- not a placeholder).
-- =====================================================================
insert into articles (id, author_id, category_id, status, schema_type, difficulty, audience, related_lab_key)
select gen_random_uuid(), a.id, c.id, 'draft', 'Article', 'beginner', array['general','professionals'], 'phishing-hunter'
from authors a, categories c
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'pillar_cyber_defense';

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'en',
  'Phishing in 2026: How Attackers Are Using AI to Bypass Human Judgment',
  'phishing-in-2026-ai-attacks',
  'The tells that used to give phishing away, bad grammar, generic greetings, awkward formatting, are disappearing. Detection now has to rely on different signals.',
  $en6$
<p>For years, the standard phishing advice was "look for the mistakes": spelling errors, odd phrasing, a greeting that doesn't use your name. Generative AI has quietly removed most of those tells. A phishing email drafted with an AI writing tool reads as fluently as a message from a real colleague, and it can be personalized using information scraped from a LinkedIn profile or a company's own website in a way that used to take real manual effort.</p>

<h2>What's actually changed</h2>
<ul class="content-checklist">
  <li>Language quality no longer signals fraud. Grammar and tone are no longer reliable tells.</li>
  <li>Personalization is cheaper. Attackers can reference a real project, a real manager's name, or a real recent company announcement without manually researching a target.</li>
  <li>Voice and video impersonation is now within reach of non-sophisticated attackers, not just nation-state actors, raising the stakes for phone-based "verification" as a control.</li>
  <li>Volume and targeting can scale together. What used to be a tradeoff, mass phishing versus tailored spear phishing, is less of a tradeoff now.</li>
</ul>

<h2>What still works as a defense</h2>
<p>Detection has to shift from "does this look wrong" to "does this request make sense in context." Does this sender normally ask for this kind of action? Does the urgency match how this person or system actually communicates? Is there a second channel to verify an unusual request, especially anything involving payment, credentials, or access changes?</p>

<h2>Practice against a realistic scenario</h2>
<p>Reading about phishing indicators is a poor substitute for actually working through a realistic scenario and seeing where your own judgment gets tested. CyberAbeer's free Phishing Hunter challenge puts you through five realistic messages and asks you to decide what to do with each one, the same decision process a phishing email actually demands, without any of the real consequences.</p>
$en6$,
  'Phishing in 2026 | CyberAbeer',
  'AI has removed most of the old phishing tells. Learn what actually changed in phishing attacks and what detection has to rely on now.',
  4
from articles art join authors a on a.id = art.author_id join categories c on c.id = art.category_id
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'pillar_cyber_defense'
  and not exists (select 1 from article_translations t where t.article_id = art.id and t.locale = 'en' and t.slug = 'phishing-in-2026-ai-attacks');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'ar',
  'التصيد الاحتيالي في 2026: كيف يستخدم المهاجمون الذكاء الاصطناعي لتجاوز الحكم البشري',
  'التصيد-الاحتيالي-في-2026',
  'العلامات التي كانت تكشف التصيد الاحتيالي سابقاً، الأخطاء الإملائية، التحيات العامة، التنسيق المتعثر، بدأت تختفي. أصبح الكشف يعتمد الآن على إشارات مختلفة.',
  $ar6$
<p>لسنوات، كانت النصيحة القياسية بشأن التصيد الاحتيالي هي "ابحث عن الأخطاء": أخطاء إملائية، صياغة غريبة، تحية لا تستخدم اسمك. أزال الذكاء الاصطناعي التوليدي بهدوء معظم هذه العلامات. رسالة تصيد صيغت بأداة كتابة تعمل بالذكاء الاصطناعي تُقرأ بطلاقة كرسالة من زميل حقيقي، ويمكن تخصيصها باستخدام معلومات مُستقاة من ملف LinkedIn أو من موقع الشركة نفسه بطريقة كانت تتطلب سابقاً جهداً يدوياً حقيقياً.</p>

<h2>ما الذي تغيّر فعلياً</h2>
<ul class="content-checklist">
  <li>جودة اللغة لم تعد تدل على الاحتيال. القواعد والأسلوب لم يعودا علامات موثوقة.</li>
  <li>التخصيص أصبح أرخص. يمكن للمهاجمين الإشارة إلى مشروع حقيقي، أو اسم مدير حقيقي، أو إعلان حديث فعلي للشركة دون بحث يدوي عن الهدف.</li>
  <li>انتحال الصوت والفيديو أصبح متاحاً الآن لمهاجمين غير متطورين، لا لجهات فاعلة تابعة لدول فقط، ما يرفع المخاطر على "التحقق" الهاتفي كضابط تحكم.</li>
  <li>يمكن للحجم والاستهداف أن يتوسعا معاً. ما كان مفاضلة سابقاً، بين التصيد الجماعي والتصيد الموجّه الدقيق، لم يعد كذلك بالقدر نفسه.</li>
</ul>

<h2>ما الذي ما زال فعالاً كدفاع</h2>
<p>يجب أن ينتقل الكشف من "هل يبدو هذا خاطئاً" إلى "هل هذا الطلب منطقي في سياقه". هل يطلب هذا المرسل عادة هذا النوع من الإجراءات؟ هل تتطابق درجة الإلحاح مع طريقة تواصل هذا الشخص أو النظام فعلياً؟ هل توجد قناة ثانية للتحقق من طلب غير معتاد، خصوصاً أي طلب يتعلق بالدفع أو بيانات الاعتماد أو تغيير الصلاحيات؟</p>

<h2>تدرّب على سيناريو واقعي</h2>
<p>قراءة مؤشرات التصيد الاحتيالي بديل ضعيف عن خوض سيناريو واقعي فعلياً ورؤية أين يُختبر حكمك الخاص. يضعك تحدي "المدافع الأول" المجاني من CyberAbeer أمام خمس رسائل واقعية ويطلب منك أن تقرر ماذا تفعل مع كل واحدة، نفس عملية اتخاذ القرار التي تتطلبها رسالة تصيد فعلية، دون أي من العواقب الحقيقية.</p>
$ar6$,
  'التصيد الاحتيالي في 2026 | CyberAbeer',
  'أزال الذكاء الاصطناعي معظم علامات التصيد الاحتيالي القديمة. تعرّف على ما تغيّر فعلياً في هجمات التصيد وما يجب أن يعتمد عليه الكشف الآن.',
  4
from articles art join authors a on a.id = art.author_id join categories c on c.id = art.category_id
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'pillar_cyber_defense'
  and not exists (select 1 from article_translations t where t.article_id = art.id and t.locale = 'ar' and t.slug = 'التصيد-الاحتيالي-في-2026');

insert into article_sources (article_id, title, publisher, url, published_date, accessed_date)
select t.article_id, 'Avoiding Social Engineering and Phishing Attacks', 'Cybersecurity and Infrastructure Security Agency (CISA)',
  'https://www.cisa.gov/news-events/news/avoiding-social-engineering-and-phishing-attacks', null, current_date
from article_translations t
where t.locale = 'en' and t.slug = 'phishing-in-2026-ai-attacks'
  and not exists (select 1 from article_sources s where s.article_id = t.article_id);

-- =====================================================================
-- ARTICLE 07 -- Governance Frameworks Compared
-- Cybersecurity Governance Hub. Sources are the three frameworks'
-- real, stable official pages -- claims are limited to what each
-- framework is and who publishes it, not fabricated adoption figures.
-- =====================================================================
insert into articles (id, author_id, category_id, status, schema_type, difficulty, audience)
select gen_random_uuid(), a.id, c.id, 'draft', 'Article', 'intermediate', array['professionals','ciso']
from authors a, categories c
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_cybersecurity_governance';

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'en',
  'Cybersecurity Governance Frameworks Compared: NIST CSF, ISO 27001, and COBIT',
  'cybersecurity-governance-frameworks-compared',
  'NIST CSF, ISO 27001, and COBIT solve overlapping but distinct problems. Picking one, or combining them, depends on what you actually need a framework to do.',
  $en7$
<p>Organizations often ask which cybersecurity governance framework they should adopt as though there is one right answer. There isn't, because NIST CSF, ISO/IEC 27001, and COBIT aren't really competing for the same job.</p>

<h2>What each one is actually for</h2>
<table class="content-comparison-table">
  <thead><tr><th>Framework</th><th>Publisher</th><th>Primary purpose</th></tr></thead>
  <tbody>
    <tr><td>NIST Cybersecurity Framework (CSF)</td><td>National Institute of Standards and Technology</td><td>A risk-based structure (Identify, Protect, Detect, Respond, Recover, Govern) for organizing a security program; voluntary and not certifiable</td></tr>
    <tr><td>ISO/IEC 27001</td><td>International Organization for Standardization</td><td>A certifiable information security management system (ISMS) standard with formal audit and certification</td></tr>
    <tr><td>COBIT</td><td>ISACA</td><td>An IT governance and management framework connecting business goals to IT and security objectives</td></tr>
  </tbody>
</table>

<h2>The decision that actually matters</h2>
<p>The real question is not "which framework" but "what do we need it to do." If a customer or regulator needs third-party proof of a certified security management system, ISO 27001 is the one built for that. If the goal is a practical, risk-based structure to organize security work without pursuing certification, NIST CSF fits more naturally. If the gap is connecting IT and security decisions to business objectives and governance accountability, COBIT is built specifically for that connective layer.</p>

<h2>They are not mutually exclusive</h2>
<p>Many mature programs use more than one: NIST CSF or COBIT to structure governance and risk decisions, ISO 27001 as the certifiable control layer that gives customers and auditors something to verify. Treating them as competing choices usually means picking the wrong one for the actual business problem.</p>

<h2>Start with the requirement, not the framework</h2>
<p>Before choosing, get specific about what's actually being asked: a customer contract requiring certification, a board asking for a maturity baseline, a regulator requiring a named framework. The framework choice should follow from that requirement, not the other way around.</p>
$en7$,
  'Governance Frameworks Compared | CyberAbeer',
  'NIST CSF, ISO 27001, and COBIT compared: what each is actually for, who publishes it, and how to choose based on your real requirement.',
  4
from articles art join authors a on a.id = art.author_id join categories c on c.id = art.category_id
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_cybersecurity_governance'
  and not exists (select 1 from article_translations t where t.article_id = art.id and t.locale = 'en');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'ar',
  'مقارنة أطر حوكمة الأمن السيبراني: NIST CSF وISO 27001 وCOBIT',
  'مقارنة-اطر-حوكمة-الامن-السيبراني',
  'تحل NIST CSF وISO 27001 وCOBIT مشكلات متداخلة لكنها مختلفة. يعتمد اختيار أحدها، أو الجمع بينها، على ما تحتاجه فعلياً من الإطار.',
  $ar7$
<p>كثيراً ما تسأل المؤسسات عن إطار حوكمة الأمن السيبراني الذي ينبغي أن تتبناه وكأن هناك إجابة واحدة صحيحة. لا توجد إجابة كهذه، لأن NIST CSF وISO/IEC 27001 وCOBIT لا تتنافس فعلياً على المهمة نفسها.</p>

<h2>ما الغرض الفعلي من كل إطار</h2>
<table class="content-comparison-table">
  <thead><tr><th>الإطار</th><th>الجهة الناشرة</th><th>الغرض الأساسي</th></tr></thead>
  <tbody>
    <tr><td>إطار الأمن السيبراني NIST (CSF)</td><td>المعهد الوطني الأمريكي للمعايير والتقنية</td><td>بنية قائمة على المخاطر (تحديد، حماية، كشف، استجابة، تعافي، حوكمة) لتنظيم برنامج الأمن؛ اختياري وغير قابل للاعتماد</td></tr>
    <tr><td>ISO/IEC 27001</td><td>المنظمة الدولية للمعايير</td><td>معيار قابل للاعتماد لنظام إدارة أمن المعلومات (ISMS) مع تدقيق واعتماد رسميين</td></tr>
    <tr><td>COBIT</td><td>ISACA</td><td>إطار لحوكمة وإدارة تقنية المعلومات يربط أهداف الأعمال بأهداف تقنية المعلومات والأمن</td></tr>
  </tbody>
</table>

<h2>القرار الذي يهم فعلياً</h2>
<p>السؤال الحقيقي ليس "أي إطار" بل "ماذا نحتاج منه أن يفعل". إذا كان عميل أو جهة تنظيمية تطلب إثباتاً من طرف ثالث لنظام إدارة أمن معتمد، فإن ISO 27001 هو المصمم لذلك. وإذا كان الهدف بنية عملية قائمة على المخاطر لتنظيم عمل الأمن دون السعي للاعتماد، فإن NIST CSF يناسب أكثر بشكل طبيعي. وإذا كانت الفجوة هي ربط قرارات تقنية المعلومات والأمن بأهداف الأعمال والمساءلة الحوكمية، فإن COBIT مصمم تحديداً لتلك الطبقة الرابطة.</p>

<h2>ليست متنافية</h2>
<p>تستخدم كثير من البرامج الناضجة أكثر من إطار واحد: NIST CSF أو COBIT لتنظيم قرارات الحوكمة والمخاطر، وISO 27001 كطبقة ضوابط قابلة للاعتماد تمنح العملاء والمدققين ما يمكن التحقق منه. التعامل معها كخيارات متنافسة يعني غالباً اختيار الإطار الخاطئ لمشكلة العمل الفعلية.</p>

<h2>ابدأ بالمتطلب لا بالإطار</h2>
<p>قبل الاختيار، حدّد بدقة ما هو المطلوب فعلياً: عقد عميل يتطلب اعتماداً، أو مجلس إدارة يطلب خط أساس للنضج، أو جهة تنظيمية تطلب إطاراً محدداً بالاسم. ينبغي أن يُبنى اختيار الإطار على هذا المتطلب، لا العكس.</p>
$ar7$,
  'مقارنة أطر حوكمة الأمن السيبراني | CyberAbeer',
  'مقارنة NIST CSF وISO 27001 وCOBIT: الغرض الفعلي من كل إطار، والجهة الناشرة له، وكيفية الاختيار بناءً على متطلبك الحقيقي.',
  4
from articles art join authors a on a.id = art.author_id join categories c on c.id = art.category_id
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_cybersecurity_governance'
  and not exists (select 1 from article_translations t where t.article_id = art.id and t.locale = 'ar');

insert into article_sources (article_id, title, publisher, url, published_date, accessed_date)
select t.article_id, s.title, s.publisher, s.url, s.published_date, current_date
from article_translations t
join (values
  ('The NIST Cybersecurity Framework (CSF) 2.0', 'National Institute of Standards and Technology (NIST)', 'https://www.nist.gov/cyberframework', '2024-02-26'::date),
  ('ISO/IEC 27001:2022 Information security management systems', 'International Organization for Standardization (ISO)', 'https://www.iso.org/standard/27001', '2022-10-25'::date),
  ('COBIT', 'ISACA', 'https://www.isaca.org/resources/cobit', null)
) as s(title, publisher, url, published_date) on true
where t.locale = 'en' and t.slug = 'cybersecurity-governance-frameworks-compared'
  and not exists (select 1 from article_sources src where src.article_id = t.article_id);

-- =====================================================================
-- ARTICLE 08 -- Cybersecurity for Beginners
-- Learn Cybersecurity pillar. Ties to the real Phishing Hunter
-- challenge as a concrete first step.
-- =====================================================================
insert into articles (id, author_id, category_id, status, schema_type, difficulty, audience, related_lab_key)
select gen_random_uuid(), a.id, c.id, 'draft', 'Article', 'beginner', array['students','general'], 'phishing-hunter'
from authors a, categories c
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'pillar_learn_cybersecurity';

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'en',
  'Cybersecurity for Beginners: A Practical Roadmap for Your First Year',
  'cybersecurity-for-beginners-first-year-roadmap',
  'You do not need a degree to start learning cybersecurity, but you do need a sequence. Here is a realistic first-year path that does not start with buying a certification.',
  $en8$
<p>The most common mistake people make starting out in cybersecurity is starting with a certification exam before they have hands-on context for what the material actually means. A certification proves you know the vocabulary. It does not by itself teach you to think like a defender. A better sequence builds the thinking first.</p>

<h2>Months 1 to 3: fundamentals that actually transfer</h2>
<ul class="content-checklist">
  <li>Networking basics: how traffic actually moves, what a port and protocol are, how DNS resolution works.</li>
  <li>Operating system fundamentals: how permissions, processes, and logs work on both Windows and Linux.</li>
  <li>How the web works: HTTP requests, cookies, sessions, what actually happens when you log into a website.</li>
</ul>

<h2>Months 4 to 6: think like an attacker, briefly</h2>
<p>Understanding common attack patterns, phishing, credential stuffing, privilege escalation, is what makes defensive controls make sense instead of feeling arbitrary. This does not require breaking real systems. Guided, legal, hands-on scenarios are enough to build real intuition.</p>

<h2>Months 7 to 9: pick a direction</h2>
<p>Cybersecurity is not one job. Security operations (SOC analysis, detection, incident response), governance/risk/compliance, application security, and cloud security are meaningfully different day-to-day work. Trying a scenario or two from each area before committing to a specialization saves a lot of wasted effort later.</p>

<h2>Months 10 to 12: now a certification makes sense</h2>
<p>Once you have hands-on context, an entry-level certification (Security+ is a common starting point) becomes a way to formalize and prove what you already understand, rather than a first attempt to memorize unfamiliar material.</p>

<h2>Start today, not after you feel ready</h2>
<p>CyberAbeer's free Phishing Hunter challenge is a realistic, no-signup-required first scenario: five phishing messages, real decisions, immediate feedback. It's a reasonable place to find out whether this kind of thinking is something you enjoy, before investing months into a learning path.</p>
$en8$,
  'Cybersecurity for Beginners | CyberAbeer',
  'A practical, sequenced first-year roadmap into cybersecurity: fundamentals first, attacker thinking second, specialization third, certification last.',
  5
from articles art join authors a on a.id = art.author_id join categories c on c.id = art.category_id
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'pillar_learn_cybersecurity'
  and not exists (select 1 from article_translations t where t.article_id = art.id and t.locale = 'en');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'ar',
  'الأمن السيبراني للمبتدئين: خارطة طريق عملية لعامك الأول',
  'الامن-السيبراني-للمبتدئين',
  'لست بحاجة إلى شهادة جامعية لتبدأ تعلّم الأمن السيبراني، لكنك بحاجة إلى تسلسل. إليك مساراً واقعياً للعام الأول لا يبدأ بشراء شهادة مهنية.',
  $ar8$
<p>الخطأ الأكثر شيوعاً لدى المبتدئين في الأمن السيبراني هو البدء باختبار شهادة مهنية قبل امتلاك سياق عملي لما تعنيه المادة فعلياً. الشهادة المهنية تثبت أنك تعرف المصطلحات. لكنها لا تعلّمك بمفردها التفكير كمدافع. التسلسل الأفضل يبني طريقة التفكير أولاً.</p>

<h2>الأشهر 1 إلى 3: أساسيات تنتقل فعلياً</h2>
<ul class="content-checklist">
  <li>أساسيات الشبكات: كيف تتحرك حركة البيانات فعلياً، وما هو المنفذ والبروتوكول، وكيف يعمل تحليل أسماء النطاقات DNS.</li>
  <li>أساسيات أنظمة التشغيل: كيف تعمل الصلاحيات والعمليات والسجلات على أنظمة Windows وLinux.</li>
  <li>كيف يعمل الويب: طلبات HTTP، ملفات تعريف الارتباط، الجلسات، وما يحدث فعلياً عند تسجيل الدخول إلى موقع.</li>
</ul>

<h2>الأشهر 4 إلى 6: فكّر كمهاجم، لفترة وجيزة</h2>
<p>فهم أنماط الهجوم الشائعة، كالتصيد الاحتيالي وحشو بيانات الاعتماد وتصعيد الصلاحيات، هو ما يجعل ضوابط التحكم الدفاعية منطقية بدلاً من أن تبدو عشوائية. هذا لا يتطلب اختراق أنظمة حقيقية. سيناريوهات عملية موجَّهة وقانونية كافية لبناء حدس حقيقي.</p>

<h2>الأشهر 7 إلى 9: اختر اتجاهاً</h2>
<p>الأمن السيبراني ليس وظيفة واحدة. عمليات الأمن (تحليل مركز العمليات الأمنية، الكشف، الاستجابة للحوادث)، والحوكمة وإدارة المخاطر والامتثال، وأمن التطبيقات، وأمن السحابة، كلها أعمال يومية مختلفة جوهرياً. تجربة سيناريو أو اثنين من كل مجال قبل الالتزام بتخصص يوفر الكثير من الجهد المهدر لاحقاً.</p>

<h2>الأشهر 10 إلى 12: الآن أصبحت الشهادة المهنية منطقية</h2>
<p>بمجرد امتلاك سياق عملي، تصبح شهادة مهنية للمستوى المبتدئ (Security+ نقطة بداية شائعة) طريقة لتوثيق وإثبات ما تفهمه بالفعل، بدلاً من محاولة أولى لحفظ مادة غير مألوفة.</p>

<h2>ابدأ اليوم، لا بعد أن تشعر بالجاهزية</h2>
<p>يمثل تحدي "المدافع الأول" المجاني من CyberAbeer سيناريو أول واقعياً لا يتطلب تسجيلاً: خمس رسائل تصيد احتيالي، قرارات حقيقية، وتغذية راجعة فورية. إنه مكان معقول لاكتشاف ما إذا كنت تستمتع بهذا النوع من التفكير، قبل استثمار أشهر في مسار تعليمي.</p>
$ar8$,
  'الأمن السيبراني للمبتدئين | CyberAbeer',
  'خارطة طريق عملية ومتسلسلة للعام الأول في الأمن السيبراني: الأساسيات أولاً، تفكير المهاجم ثانياً، التخصص ثالثاً، والشهادة المهنية أخيراً.',
  5
from articles art join authors a on a.id = art.author_id join categories c on c.id = art.category_id
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'pillar_learn_cybersecurity'
  and not exists (select 1 from article_translations t where t.article_id = art.id and t.locale = 'ar');

-- =====================================================================
-- ARTICLE 09 -- CISSP vs CISM vs CEH
-- Learn Cybersecurity pillar / certification content. No exam
-- questions or dumps -- compares scope and audience only, sourced from
-- each body's own real, stable official certification page.
-- =====================================================================
insert into articles (id, author_id, category_id, status, schema_type, difficulty, audience)
select gen_random_uuid(), a.id, c.id, 'draft', 'Article', 'beginner', array['students','professionals']
from authors a, categories c
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'pillar_learn_cybersecurity';

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'en',
  'CISSP vs CISM vs CEH: Which Cybersecurity Certification Should You Pursue First?',
  'cissp-vs-cism-vs-ceh-which-certification-first',
  'These three certifications get compared constantly because people assume they compete. They mostly don''t. They validate different kinds of work.',
  $en9$
<p>CISSP, CISM, and CEH show up on almost every "which certification should I get" list, usually compared as if choosing one rules out the others. In practice they validate different types of expertise, and which one makes sense first depends on the kind of role you're aiming at, not which one is "better."</p>

<table class="content-comparison-table">
  <thead><tr><th>Certification</th><th>Publisher</th><th>Primarily validates</th><th>Typical audience</th></tr></thead>
  <tbody>
    <tr><td>CISSP</td><td>ISC2</td><td>Broad security architecture and management knowledge across 8 domains</td><td>Experienced practitioners (5 years' cumulative paid experience required for full certification) moving toward senior/architect roles</td></tr>
    <tr><td>CISM</td><td>ISACA</td><td>Information security management, governance, and program leadership</td><td>People moving toward security management or CISO-track roles</td></tr>
    <tr><td>CEH</td><td>EC-Council</td><td>Ethical hacking methodology and offensive security tooling</td><td>People moving toward penetration testing or offensive security roles</td></tr>
  </tbody>
</table>

<h2>The actual decision factor: what work do you want to do</h2>
<p>If the target role is hands-on offensive security or penetration testing, CEH's focus on attacker methodology is the closer match. If the target is security leadership, program management, or governance, CISM is built for exactly that. CISSP sits broader than either, useful once you have enough cross-domain experience to actually meet its experience requirement, and is often treated as a credential for senior or architect-level roles rather than an entry point.</p>

<h2>Sequencing, not competition</h2>
<p>It's common, and reasonable, to pursue more than one of these over a career: CEH or a hands-on foundation early, CISSP as broad experience accumulates, CISM if the career path bends toward management. None of them substitute for the others; they're answering different questions about what you know how to do.</p>

<p>CyberAbeer does not publish practice exam questions or dumps for any certification. Preparing properly means studying the body of knowledge each certifying body publishes directly, not memorizing leaked or recycled questions.</p>
$en9$,
  'CISSP vs CISM vs CEH | CyberAbeer',
  'CISSP, CISM, and CEH compared by what they actually validate and who they''re for, not ranked as if one certification beats the others.',
  4
from articles art join authors a on a.id = art.author_id join categories c on c.id = art.category_id
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'pillar_learn_cybersecurity'
  and not exists (select 1 from article_translations t where t.article_id = art.id and t.locale = 'en' and t.slug = 'cissp-vs-cism-vs-ceh-which-certification-first');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'ar',
  'CISSP مقابل CISM مقابل CEH: أي شهادة مهنية في الأمن السيبراني تبدأ بها؟',
  'cissp-مقابل-cism-مقابل-ceh',
  'تُقارن هذه الشهادات الثلاث باستمرار لأن الناس يفترضون أنها تتنافس. في الغالب لا تتنافس. إنها تُثبت أنواعاً مختلفة من العمل.',
  $ar9$
<p>تظهر CISSP وCISM وCEH في كل قائمة تقريباً بعنوان "أي شهادة مهنية أحصل عليها"، وغالباً ما تُقارن وكأن اختيار واحدة يستبعد الأخريين. في الواقع، تُثبت كل منها نوعاً مختلفاً من الخبرة، والشهادة المناسبة أولاً تعتمد على نوع الدور الذي تستهدفه، لا على أيها "أفضل".</p>

<table class="content-comparison-table">
  <thead><tr><th>الشهادة</th><th>الجهة المانحة</th><th>تُثبت أساساً</th><th>الجمهور المعتاد</th></tr></thead>
  <tbody>
    <tr><td>CISSP</td><td>ISC2</td><td>معرفة واسعة في هندسة وإدارة الأمن عبر 8 مجالات</td><td>ممارسون ذوو خبرة (تتطلب الشهادة الكاملة 5 سنوات خبرة مدفوعة تراكمية) يتجهون نحو أدوار كبيرة أو معمارية</td></tr>
    <tr><td>CISM</td><td>ISACA</td><td>إدارة أمن المعلومات، الحوكمة، وقيادة البرامج</td><td>من يتجهون نحو أدوار إدارة الأمن أو مسار رئيس أمن المعلومات</td></tr>
    <tr><td>CEH</td><td>EC-Council</td><td>منهجية الاختراق الأخلاقي وأدوات الأمن الهجومي</td><td>من يتجهون نحو اختبار الاختراق أو الأمن الهجومي</td></tr>
  </tbody>
</table>

<h2>عامل القرار الفعلي: أي عمل تريد القيام به</h2>
<p>إذا كان الدور المستهدف هو الأمن الهجومي العملي أو اختبار الاختراق، فإن تركيز CEH على منهجية المهاجم أقرب ملاءمة. وإذا كان الهدف قيادة الأمن أو إدارة البرامج أو الحوكمة، فإن CISM مصممة تحديداً لذلك. أما CISSP فهي أوسع من كليهما، ومفيدة بمجرد امتلاك خبرة كافية عبر المجالات لتلبية متطلب الخبرة الفعلي، وغالباً ما تُعامل كشهادة لأدوار كبيرة أو معمارية لا كنقطة بداية.</p>

<h2>تسلسل، لا تنافس</h2>
<p>من الشائع، والمنطقي، السعي للحصول على أكثر من واحدة من هذه الشهادات خلال المسيرة المهنية: CEH أو أساس عملي مبكراً، ثم CISSP مع تراكم الخبرة عبر المجالات، ثم CISM إذا انحنى المسار المهني نحو الإدارة. لا تحل أي منها محل الأخرى؛ فهي تجيب على أسئلة مختلفة حول ما تعرف كيف تفعله.</p>

<p>لا تنشر CyberAbeer أسئلة اختبار تجريبية أو "دمبات" لأي شهادة مهنية. التحضير السليم يعني دراسة مجموعة المعرفة التي تنشرها كل جهة مانحة مباشرة، لا حفظ أسئلة مسرَّبة أو معاد تدويرها.</p>
$ar9$,
  'CISSP مقابل CISM مقابل CEH | CyberAbeer',
  'مقارنة بين CISSP وCISM وCEH من حيث ما تُثبته كل منها فعلياً ولمن هي موجَّهة، دون ترتيبها وكأن شهادة تتفوق على الأخرى.',
  4
from articles art join authors a on a.id = art.author_id join categories c on c.id = art.category_id
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'pillar_learn_cybersecurity'
  and not exists (select 1 from article_translations t where t.article_id = art.id and t.locale = 'ar' and t.slug = 'cissp-مقابل-cism-مقابل-ceh');

insert into article_sources (article_id, title, publisher, url, published_date, accessed_date)
select t.article_id, s.title, s.publisher, s.url, s.published_date, current_date
from article_translations t
join (values
  ('CISSP - Certified Information Systems Security Professional', 'ISC2', 'https://www.isc2.org/certifications/cissp', null::date),
  ('CISM Certification', 'ISACA', 'https://www.isaca.org/credentialing/cism', null),
  ('Certified Ethical Hacker (CEH)', 'EC-Council', 'https://www.eccouncil.org/train-certify/certified-ethical-hacker-ceh/', null)
) as s(title, publisher, url, published_date) on true
where t.locale = 'en' and t.slug = 'cissp-vs-cism-vs-ceh-which-certification-first'
  and not exists (select 1 from article_sources src where src.article_id = t.article_id);

-- =====================================================================
-- ARTICLE 10 -- Zero Trust Architecture Explained
-- Cyber Defense pillar. Source: NIST SP 800-207, the real, stable
-- official publication defining zero trust architecture.
-- =====================================================================
insert into articles (id, author_id, category_id, status, schema_type, difficulty, audience)
select gen_random_uuid(), a.id, c.id, 'draft', 'Article', 'intermediate', array['professionals','ciso']
from authors a, categories c
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'pillar_cyber_defense';

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'en',
  'Zero Trust Architecture Explained: Principles, Myths, and Implementation Steps',
  'zero-trust-architecture-explained',
  'Zero trust is not a product you buy. It is an architecture principle, defined formally by NIST, that most organizations implement piece by piece over years.',
  $en10$
<p>"Zero trust" gets used as a marketing label often enough that the actual definition gets lost. NIST Special Publication 800-207 defines it precisely: a set of principles built around the idea that no user, device, or network location should be trusted by default, access is granted per-session, based on verified identity and context, not on which network segment a request came from.</p>

<h2>What zero trust is not</h2>
<ul class="content-checklist">
  <li>It is not a single product. No vendor sells "zero trust" the way you'd buy a firewall.</li>
  <li>It is not "no trust ever." It's "no implicit trust based on network location," verified continuously instead of granted once at login.</li>
  <li>It is not a weekend project. NIST's own guidance describes zero trust as a journey most organizations implement incrementally, migrating specific workflows and systems over time.</li>
</ul>

<h2>The core principles</h2>
<p>Every access request is authenticated and authorized based on identity, device posture, and context, not network location. Access is scoped to the minimum required for the specific task (least privilege), and sessions are re-verified rather than trusted indefinitely once granted.</p>

<h2>Where organizations actually start</h2>
<p>Most zero trust implementations begin with identity: strong multi-factor authentication and centralized identity management, since almost everything else depends on being able to verify who or what is making a request. From there, organizations typically move to device posture checks, network micro-segmentation, and finally continuous verification across sessions rather than one-time login checks.</p>

<h2>A realistic expectation</h2>
<p>Treating zero trust as a checklist to complete misses the point. It's an ongoing architecture principle applied to new systems as they're built and retrofitted into existing ones as resources allow, not a project with a defined end date.</p>
$en10$,
  'Zero Trust Architecture Explained | CyberAbeer',
  'What zero trust actually means per NIST SP 800-207, what it is not, and where organizations realistically start implementing it.',
  4
from articles art join authors a on a.id = art.author_id join categories c on c.id = art.category_id
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'pillar_cyber_defense'
  and not exists (select 1 from article_translations t where t.article_id = art.id and t.locale = 'en' and t.slug = 'zero-trust-architecture-explained');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'ar',
  'شرح بنية الثقة المعدومة: المبادئ والمفاهيم الخاطئة وخطوات التطبيق',
  'شرح-بنية-الثقة-المعدومة',
  'الثقة المعدومة ليست منتجاً تشتريه. إنها مبدأ معماري، حدّدته NIST رسمياً، تطبّقه معظم المؤسسات قطعة قطعة على مدى سنوات.',
  $ar10$
<p>يُستخدم مصطلح "الثقة المعدومة" (Zero Trust) كشعار تسويقي بكثرة لدرجة ضياع تعريفه الفعلي. يحدد المنشور الخاص رقم 800-207 من NIST هذا المفهوم بدقة: مجموعة مبادئ مبنية على فكرة أنه لا ينبغي الوثوق افتراضياً بأي مستخدم أو جهاز أو موقع شبكي، بل يُمنح الوصول لكل جلسة على حدة، بناءً على هوية مُتحقق منها وسياق فعلي، لا بناءً على أي جزء من الشبكة صدر منه الطلب.</p>

<h2>ما ليست عليه الثقة المعدومة</h2>
<ul class="content-checklist">
  <li>ليست منتجاً واحداً. لا يبيع أي مورّد "ثقة معدومة" بالطريقة التي تشتري بها جداراً نارياً.</li>
  <li>ليست "لا ثقة أبداً". إنها "لا ثقة ضمنية مبنية على موقع الشبكة"، تُتحقق باستمرار بدلاً من أن تُمنح مرة واحدة عند تسجيل الدخول.</li>
  <li>ليست مشروع عطلة نهاية أسبوع. تصف إرشادات NIST نفسها الثقة المعدومة كرحلة تطبقها معظم المؤسسات تدريجياً، بنقل مهام سير عمل وأنظمة محددة بمرور الوقت.</li>
</ul>

<h2>المبادئ الجوهرية</h2>
<p>يُصادَق على كل طلب وصول ويُصرَّح به بناءً على الهوية وحالة الجهاز والسياق، لا موقع الشبكة. يُحدَّد نطاق الوصول بالحد الأدنى المطلوب للمهمة تحديداً (مبدأ الحد الأدنى من الصلاحيات)، ويُعاد التحقق من الجلسات بدلاً من الوثوق بها إلى أجل غير مسمى بمجرد منحها.</p>

<h2>أين تبدأ المؤسسات فعلياً</h2>
<p>تبدأ معظم تطبيقات الثقة المعدومة بالهوية: مصادقة متعددة العوامل قوية وإدارة هوية مركزية، لأن كل شيء آخر تقريباً يعتمد على القدرة على التحقق من هوية من أو ما يقدم الطلب. من هناك، تنتقل المؤسسات عادة إلى فحص حالة الجهاز، وتقسيم الشبكة الدقيق، وأخيراً التحقق المستمر عبر الجلسات بدلاً من فحوصات تسجيل الدخول لمرة واحدة.</p>

<h2>توقّع واقعي</h2>
<p>التعامل مع الثقة المعدومة كقائمة مهام يجب إنجازها يفوّت الفكرة الجوهرية. إنها مبدأ معماري مستمر يُطبَّق على الأنظمة الجديدة عند بنائها ويُعاد تركيبه في الأنظمة القائمة كلما سمحت الموارد، لا مشروعاً بتاريخ انتهاء محدد.</p>
$ar10$,
  'شرح بنية الثقة المعدومة | CyberAbeer',
  'ما تعنيه الثقة المعدومة فعلياً وفق المنشور NIST SP 800-207، وما ليست عليه، وأين تبدأ المؤسسات تطبيقها واقعياً.',
  4
from articles art join authors a on a.id = art.author_id join categories c on c.id = art.category_id
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'pillar_cyber_defense'
  and not exists (select 1 from article_translations t where t.article_id = art.id and t.locale = 'ar' and t.slug = 'شرح-بنية-الثقة-المعدومة');

insert into article_sources (article_id, title, publisher, url, published_date, accessed_date)
select t.article_id, 'Zero Trust Architecture (NIST Special Publication 800-207)', 'National Institute of Standards and Technology (NIST)',
  'https://csrc.nist.gov/pubs/sp/800/207/final', '2020-08-11', current_date
from article_translations t
where t.locale = 'en' and t.slug = 'zero-trust-architecture-explained'
  and not exists (select 1 from article_sources s where s.article_id = t.article_id);

-- =====================================================================
-- ARTICLE 11 -- The CISO Reporting Line
-- Cybersecurity Governance Hub, Dr. Abeer Insights. Grounded in
-- Alshammari, A. (2026), "Defining Cybersecurity Roles and
-- Responsibilities Across Organizational Size and Criticality: A
-- Governance-Oriented Framework for Public and Private Sectors."
-- =====================================================================
insert into articles (id, author_id, category_id, status, schema_type, difficulty, audience)
select gen_random_uuid(), a.id, c.id, 'draft', 'Article', 'advanced', array['executives','ciso']
from authors a, categories c
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_cybersecurity_governance';

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'en',
  'The CISO Reporting Line: Why Where Security Sits in the Org Chart Matters',
  'the-ciso-reporting-line-why-it-matters',
  'Whether the CISO reports to the CIO, the CEO, or the board changes what gets prioritized, what gets funded, and what gets said out loud in a risk conversation.',
  $en11$
<p>Where a CISO sits in the org chart is treated as an administrative detail more often than it should be. It is a governance decision with direct consequences for what risks actually get surfaced, funded, and acted on.</p>

<h2>Governance functions are not operational functions</h2>
<p>Dr. Abeer Alshammari's research on cybersecurity role structuring draws a specific distinction between cybersecurity governance functions, executive accountability, policy direction, risk ownership, and cybersecurity operational functions, SOC operations, identity and access management, vulnerability management, DevSecOps, incident response. Both are essential. They are not the same job, and collapsing them into one reporting line tends to let the operational function's priorities quietly set the governance agenda.</p>

<h2>What changes when the CISO reports through IT</h2>
<p>When security reports to the CIO, budget requests compete directly against infrastructure and delivery priorities inside the same function, and risk framing gets filtered through a lens optimized for keeping systems running rather than surfacing what's uncomfortable. This is not a claim about individual CIOs acting in bad faith. It's a structural incentive problem: the person the CISO reports to is also the person most exposed if a security finding implicates how IT has been run.</p>

<h2>What a governance-oriented structure looks like</h2>
<ul class="content-checklist">
  <li>A reporting line to the CEO, COO, chief risk officer, or directly to the board/audit committee, not exclusively through the CIO.</li>
  <li>A defined path for the CISO to escalate a disagreement with IT leadership without that disagreement being filtered before it reaches decision-makers.</li>
  <li>Budget and headcount decisions for security made independently of IT's own budget cycle, so security priorities aren't simply whatever's left over.</li>
</ul>

<h2>Scaling by organizational size and criticality</h2>
<p>This research explicitly frames role structuring as something that should scale with organizational size, sector, and operational criticality, not a single fixed template. A small organization may not have the headcount for a fully independent security function, but even there, the governance/operational distinction should shape how limited resources are structured and how risk gets escalated, rather than being abandoned entirely for convenience.</p>

<p>The reporting line question is rarely framed as a governance decision because it looks like an HR chart detail. It is one of the highest-leverage governance decisions an organization makes about cyber risk.</p>
$en11$,
  'The CISO Reporting Line | CyberAbeer',
  'Why the CISO''s reporting line is a governance decision, not an org chart detail, and what a governance-oriented reporting structure looks like.',
  5
from articles art join authors a on a.id = art.author_id join categories c on c.id = art.category_id
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_cybersecurity_governance'
  and not exists (select 1 from article_translations t where t.article_id = art.id and t.locale = 'en' and t.slug = 'the-ciso-reporting-line-why-it-matters');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'ar',
  'خط تقارير رئيس أمن المعلومات: لماذا يهم موقع الأمن في الهيكل التنظيمي',
  'خط-تقارير-رئيس-امن-المعلومات',
  'سواء رفع رئيس أمن المعلومات تقاريره إلى رئيس تقنية المعلومات أو الرئيس التنفيذي أو مجلس الإدارة، فإن ذلك يغيّر ما تُعطى له الأولوية، وما يُموَّل، وما يُقال بصراحة في نقاش المخاطر.',
  $ar11$
<p>غالباً ما يُعامَل موقع رئيس أمن المعلومات في الهيكل التنظيمي كتفصيلة إدارية أكثر مما ينبغي. إنه قرار حوكمي له عواقب مباشرة على المخاطر التي تُكشف فعلياً وتُموَّل ويُتصرف بشأنها.</p>

<h2>وظائف الحوكمة ليست وظائف تشغيلية</h2>
<p>يرسم بحث الدكتورة عبير الشمري حول هيكلة أدوار الأمن السيبراني تمييزاً محدداً بين وظائف حوكمة الأمن السيبراني، المساءلة التنفيذية، وتوجيه السياسات، وملكية المخاطر، ووظائف الأمن السيبراني التشغيلية، عمليات مركز العمليات الأمنية، وإدارة الهوية والوصول، وإدارة الثغرات، وDevSecOps، والاستجابة للحوادث. كلاهما أساسي. لكنهما ليسا الوظيفة نفسها، ودمجهما في خط تقارير واحد يميل إلى ترك أولويات الوظيفة التشغيلية تُحدد بهدوء أجندة الحوكمة.</p>

<h2>ما الذي يتغير حين يتبع رئيس أمن المعلومات تقنية المعلومات</h2>
<p>حين يرفع الأمن تقاريره إلى رئيس تقنية المعلومات، تتنافس طلبات الميزانية مباشرة مع أولويات البنية التحتية والتسليم داخل الوظيفة نفسها، وتُصفّى صياغة المخاطر عبر عدسة مُحسَّنة للحفاظ على تشغيل الأنظمة لا لإظهار ما هو غير مريح. هذا ليس اتهاماً لرؤساء تقنية المعلومات الأفراد بسوء النية. إنها مشكلة حافز هيكلية: الشخص الذي يرفع له رئيس أمن المعلومات تقاريره هو أيضاً الأكثر تعرضاً إذا كشف تقييم أمني عن قصور في إدارة تقنية المعلومات.</p>

<h2>كيف تبدو البنية الموجَّهة حوكمياً</h2>
<ul class="content-checklist">
  <li>خط تقارير إلى الرئيس التنفيذي أو رئيس العمليات أو مسؤول المخاطر الرئيسي، أو مباشرة إلى مجلس الإدارة/لجنة التدقيق، لا حصرياً عبر رئيس تقنية المعلومات.</li>
  <li>مسار محدد يتيح لرئيس أمن المعلومات تصعيد خلاف مع قيادة تقنية المعلومات دون تصفية ذلك الخلاف قبل وصوله إلى صناع القرار.</li>
  <li>قرارات الميزانية والملاك الوظيفي للأمن تُتخذ بشكل مستقل عن دورة ميزانية تقنية المعلومات، بحيث لا تكون أولويات الأمن مجرد ما تبقى.</li>
</ul>

<h2>التوسع حسب حجم المؤسسة وحرجيتها</h2>
<p>يؤطر هذا البحث صراحة هيكلة الأدوار كأمر ينبغي أن يتوسع مع حجم المؤسسة وقطاعها وحرجية عملياتها، لا كقالب واحد ثابت. قد لا تملك مؤسسة صغيرة الملاك الوظيفي لوظيفة أمن مستقلة تماماً، لكن حتى فيها، ينبغي أن يشكّل التمييز بين الحوكمة والتشغيل كيفية هيكلة الموارد المحدودة وكيفية تصعيد المخاطر، بدلاً من التخلي عنه كلياً من أجل الراحة.</p>

<p>نادراً ما يُصاغ سؤال خط التقارير كقرار حوكمي لأنه يبدو تفصيلة في مخطط الموارد البشرية. إنه في الواقع أحد أعلى قرارات الحوكمة تأثيراً التي تتخذها المؤسسة بشأن المخاطر السيبرانية.</p>
$ar11$,
  'خط تقارير رئيس أمن المعلومات | CyberAbeer',
  'لماذا يُعد خط تقارير رئيس أمن المعلومات قراراً حوكمياً لا تفصيلة في الهيكل التنظيمي، وكيف تبدو بنية التقارير الموجَّهة حوكمياً.',
  5
from articles art join authors a on a.id = art.author_id join categories c on c.id = art.category_id
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_cybersecurity_governance'
  and not exists (select 1 from article_translations t where t.article_id = art.id and t.locale = 'ar' and t.slug = 'خط-تقارير-رئيس-امن-المعلومات');

insert into article_sources (article_id, title, publisher, url, published_date, accessed_date)
select t.article_id,
  'Defining Cybersecurity Roles and Responsibilities Across Organizational Size and Criticality: A Governance-Oriented Framework for Public and Private Sectors',
  'Zenodo (preprint)', 'https://zenodo.org/records/18520086', '2026-02-07', current_date
from article_translations t
where t.locale = 'en' and t.slug = 'the-ciso-reporting-line-why-it-matters'
  and not exists (select 1 from article_sources s where s.article_id = t.article_id);

insert into article_tags (article_id, tag_id)
select t.article_id, tg.id
from article_translations t, tags tg
where t.locale = 'en' and t.slug = 'the-ciso-reporting-line-why-it-matters' and tg.key = 'dr-abeer-insights'
on conflict do nothing;

-- =====================================================================
-- ARTICLE 12 -- Third-Party Risk Management
-- GRC & Cyber Governance pillar. General practitioner framework,
-- informed by the same governance/operational role distinction as
-- article #11 -- cited to the same real preprint where directly
-- relevant (vendor risk ownership is a governance accountability
-- question), not fabricated as a separate finding.
-- =====================================================================
insert into articles (id, author_id, category_id, status, schema_type, difficulty, audience)
select gen_random_uuid(), a.id, c.id, 'draft', 'Article', 'intermediate', array['professionals','ciso']
from authors a, categories c
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'pillar_grc_governance';

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'en',
  'Third-Party Risk Management: A GRC Practitioner''s Framework for Vendor Security',
  'third-party-risk-management-framework',
  'A vendor security questionnaire is not a risk management program. Real third-party risk management requires ongoing ownership, not a one-time checklist at signing.',
  $en12$
<p>Third-party risk management gets reduced, in a lot of organizations, to a security questionnaire sent once during procurement. That approach treats vendor risk as a gate to pass through rather than a relationship to manage, and it misses most of where the actual risk lives: after the contract is signed, when the vendor's access, data handling, and own security posture can all change without anyone re-asking the original questions.</p>

<h2>Tiering vendors by actual exposure</h2>
<p>Not every vendor needs the same level of scrutiny. A vendor with access to production systems or sensitive customer data warrants a materially different review than one providing an office supplies contract. Tiering by data access, system access, and business criticality, not by contract size, is what makes a third-party risk program scale without becoming a rubber-stamp exercise for every vendor regardless of actual exposure.</p>

<h2>Governance ownership, not just a questionnaire</h2>
<p>Consistent with the broader governance-versus-operational distinction in cybersecurity role structuring, someone specific needs to own third-party risk as an ongoing governance responsibility, not a procurement checkbox. That means a named owner, a defined review cadence tied to vendor tier, and a real escalation path when a vendor's risk profile changes mid-contract.</p>

<h2>What ongoing monitoring actually looks like</h2>
<ul class="content-checklist">
  <li>Reassessment triggers tied to events, not just a calendar: a vendor discloses a breach, changes subprocessors, or expands the scope of data they access.</li>
  <li>Contractual rights to audit or request evidence, not just a one-time attestation at signing.</li>
  <li>A documented offboarding process that actually revokes access when a vendor relationship ends, not just when someone remembers to do it.</li>
  <li>Risk owner sign-off tracked per vendor tier, so accountability doesn't dissolve into "IT probably handled it."</li>
</ul>

<h2>The real failure mode</h2>
<p>Most third-party risk incidents don't happen because no questionnaire was sent. They happen because the questionnaire was the entire program: a snapshot in time, treated as if it stayed accurate for the life of the relationship. Third-party risk management works when it's built as continuous governance, with a clear owner, not a procurement formality.</p>
$en12$,
  'Third-Party Risk Management Framework | CyberAbeer',
  'A practical third-party risk management framework: tiering vendors by exposure, governance ownership, and continuous monitoring instead of a one-time questionnaire.',
  4
from articles art join authors a on a.id = art.author_id join categories c on c.id = art.category_id
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'pillar_grc_governance'
  and not exists (select 1 from article_translations t where t.article_id = art.id and t.locale = 'en');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'ar',
  'إدارة مخاطر الأطراف الثالثة: إطار عملي لأمن الموردين من منظور الحوكمة والمخاطر والامتثال',
  'ادارة-مخاطر-الاطراف-الثالثة',
  'استبيان أمن المورّدين ليس برنامج إدارة مخاطر. إدارة مخاطر الأطراف الثالثة الحقيقية تتطلب ملكية مستمرة، لا قائمة تحقق لمرة واحدة عند التوقيع.',
  $ar12$
<p>تُختزل إدارة مخاطر الأطراف الثالثة، في كثير من المؤسسات، إلى استبيان أمني يُرسل مرة واحدة أثناء الشراء. يتعامل هذا النهج مع مخاطر المورّدين كبوابة يجب تجاوزها بدلاً من علاقة يجب إدارتها، ويُغفل معظم مكان المخاطرة الفعلية: بعد توقيع العقد، حين يمكن أن يتغير وصول المورّد وتعامله مع البيانات ووضعه الأمني الخاص دون أن يعيد أحد طرح الأسئلة الأصلية.</p>

<h2>تصنيف المورّدين حسب التعرض الفعلي</h2>
<p>لا يحتاج كل مورّد المستوى نفسه من التدقيق. المورّد الذي يملك وصولاً إلى أنظمة الإنتاج أو بيانات العملاء الحساسة يستحق مراجعة مختلفة جوهرياً عن مورّد يقدم عقد مستلزمات مكتبية. التصنيف حسب الوصول إلى البيانات والوصول إلى الأنظمة وحرجية العمل، لا حسب حجم العقد، هو ما يجعل برنامج مخاطر الأطراف الثالثة قابلاً للتوسع دون أن يتحول إلى إجراء شكلي لكل مورّد بغض النظر عن تعرضه الفعلي.</p>

<h2>ملكية حوكمية، لا مجرد استبيان</h2>
<p>اتساقاً مع التمييز الأوسع بين الحوكمة والتشغيل في هيكلة أدوار الأمن السيبراني، يحتاج شخص محدد إلى ملكية مخاطر الأطراف الثالثة كمسؤولية حوكمية مستمرة، لا كمربع اختيار في الشراء. يعني ذلك مالكاً محدداً بالاسم، ودورة مراجعة معرَّفة مرتبطة بمستوى المورّد، ومساراً حقيقياً للتصعيد عند تغيّر ملف مخاطر المورّد أثناء سريان العقد.</p>

<h2>كيف تبدو المراقبة المستمرة فعلياً</h2>
<ul class="content-checklist">
  <li>محفّزات إعادة تقييم مرتبطة بأحداث، لا بالتقويم فقط: إفصاح المورّد عن اختراق، أو تغيير معالجين فرعيين، أو توسيع نطاق البيانات التي يصل إليها.</li>
  <li>حقوق تعاقدية بالتدقيق أو طلب أدلة، لا مجرد إقرار لمرة واحدة عند التوقيع.</li>
  <li>عملية إنهاء تعامل موثّقة تُلغي الوصول فعلياً عند انتهاء علاقة المورّد، لا فقط حين يتذكر أحد فعل ذلك.</li>
  <li>توقيع مالك المخاطرة متتبَّع حسب مستوى المورّد، بحيث لا تذوب المساءلة في "تقنية المعلومات تولّت الأمر على الأرجح".</li>
</ul>

<h2>نمط الفشل الحقيقي</h2>
<p>معظم حوادث مخاطر الأطراف الثالثة لا تحدث لأن الاستبيان لم يُرسل. تحدث لأن الاستبيان كان هو البرنامج بأكمله: لقطة في لحظة زمنية، عومِلت وكأنها تبقى دقيقة طوال حياة العلاقة. تنجح إدارة مخاطر الأطراف الثالثة حين تُبنى كحوكمة مستمرة، بمالك واضح، لا كإجراء شكلي في الشراء.</p>
$ar12$,
  'إطار إدارة مخاطر الأطراف الثالثة | CyberAbeer',
  'إطار عملي لإدارة مخاطر الأطراف الثالثة: تصنيف المورّدين حسب التعرض، والملكية الحوكمية، والمراقبة المستمرة بدلاً من استبيان لمرة واحدة.',
  4
from articles art join authors a on a.id = art.author_id join categories c on c.id = art.category_id
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'pillar_grc_governance'
  and not exists (select 1 from article_translations t where t.article_id = art.id and t.locale = 'ar');

-- =====================================================================
-- Internal linking / topic clusters (Section 19)
-- =====================================================================
insert into article_relations (article_id, related_article_id, sort_order)
select src.article_id, dst.article_id, r.sort_order
from (values
  ('cybersecurity-governance-vs-it-governance', 'the-ciso-reporting-line-why-it-matters', 1),
  ('cybersecurity-governance-vs-it-governance', 'what-is-the-grcl-framework', 2),
  ('cybersecurity-governance-vs-it-governance', 'cybersecurity-governance-frameworks-compared', 3),
  ('what-is-the-grcl-framework', 'cybersecurity-governance-vs-it-governance', 1),
  ('what-is-the-grcl-framework', 'third-party-risk-management-framework', 2),
  ('cybersecurity-governance-frameworks-compared', 'cybersecurity-governance-vs-it-governance', 1),
  ('cybersecurity-governance-frameworks-compared', 'zero-trust-architecture-explained', 2),
  ('the-ciso-reporting-line-why-it-matters', 'cybersecurity-governance-vs-it-governance', 1),
  ('the-ciso-reporting-line-why-it-matters', 'third-party-risk-management-framework', 2),
  ('third-party-risk-management-framework', 'the-ciso-reporting-line-why-it-matters', 1),
  ('third-party-risk-management-framework', 'what-is-the-grcl-framework', 2),
  ('phishing-in-2026-ai-attacks', 'cybersecurity-for-beginners-first-year-roadmap', 1),
  ('phishing-in-2026-ai-attacks', 'zero-trust-architecture-explained', 2),
  ('zero-trust-architecture-explained', 'phishing-in-2026-ai-attacks', 1),
  ('zero-trust-architecture-explained', 'cybersecurity-governance-frameworks-compared', 2),
  ('cybersecurity-for-beginners-first-year-roadmap', 'phishing-in-2026-ai-attacks', 1),
  ('cybersecurity-for-beginners-first-year-roadmap', 'cissp-vs-cism-vs-ceh-which-certification-first', 2),
  ('cissp-vs-cism-vs-ceh-which-certification-first', 'cybersecurity-for-beginners-first-year-roadmap', 1),
  ('ai-agent-governance-why-autonomous-ai-needs-its-own-model', 'what-is-the-grcl-framework', 1),
  ('post-quantum-cryptography-what-security-teams-need-to-know', 'zero-trust-architecture-explained', 1),
  ('data-classification-101-practical-framework', 'cybersecurity-governance-vs-it-governance', 1)
) as r(src_slug, dst_slug, sort_order)
join article_translations src on src.locale = 'en' and src.slug = r.src_slug
join article_translations dst on dst.locale = 'en' and dst.slug = r.dst_slug
on conflict (article_id, related_article_id) do nothing;

-- =====================================================================
-- Verification queries (run manually after this file to confirm
-- everything landed as drafts and nothing is publicly visible yet)
-- =====================================================================
-- select at.locale, at.title, at.slug, a.status, c.key as category_key
-- from articles a
-- join article_translations at on at.article_id = a.id
-- join categories c on c.id = a.category_id
-- join authors au on au.id = a.author_id
-- where au.display_name = 'Dr. Abeer Alshammari'
-- order by at.locale, at.title;
--
-- -- should return 0 rows (RLS: nothing with status != 'published' is public)
-- select count(*) from articles where status = 'published'
--   and author_id = (select id from authors where display_name = 'Dr. Abeer Alshammari');
