-- =====================================================================
-- 015_content_expansion_20_articles.sql
-- Content Phase 3 -- strategy change per founder directive: publish
-- immediately, no per-article founder_review gate. All 20 articles
-- below are inserted directly as status = 'published', reviewed_at =
-- now() (founder-directed bulk publish, not an individual review).
--
-- House style matches articles 02-12 in 013 (concise, 350-550 words,
-- one table/checklist/callout, not the elaborate multi-SVG treatment
-- used for the two cornerstone pieces #01 and #13) -- per the explicit
-- instruction to prefer practical tables/checklists over word count.
--
-- Sourcing: definitional GRC/data-governance topics (risk appetite vs
-- tolerance, risk register, data owners vs custodians, shadow AI vs
-- shadow agents, human-in-the-loop, AI inventory) are standard
-- practitioner concepts and are not statistics-dependent, so (like
-- articles 02 and 07 in 013) they carry no external source row -- this
-- matches this codebase's existing pattern of only sourcing claims that
-- need a checkable citation. Standards-dependent topics (ISO/IEC 27001,
-- NIST post-quantum FIPS 203/204/205, crypto-agility, AI agent
-- governance) each cite real, currently-live sources in article_sources.
-- No fabricated statistics or invented standards appear anywhere below.
-- =====================================================================

-- =====================================================================
-- SECTION A: AI SECURITY & GOVERNANCE (hub_ai_agent_governance)
-- =====================================================================

-- ---------------------------------------------------------------------
-- A1. AI Agent Governance Explained (101-style explainer -- distinct
-- angle from the existing argumentative "why autonomous AI needs its
-- own model" article; cross-linked to it, not duplicating it)
-- ---------------------------------------------------------------------
insert into articles (id, author_id, category_id, status, schema_type, difficulty, audience, reviewed_at, published_at)
select gen_random_uuid(), a.id, c.id, 'published', 'Article', 'beginner', array['professionals','general'], now(), now()
from authors a, categories c
where a.display_name = 'Dr. Abeer Alshammari' and c.key = 'hub_ai_agent_governance'
  and not exists (select 1 from article_translations t where t.locale='en' and t.slug='ai-agent-governance-explained');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'en', 'AI Agent Governance Explained', 'ai-agent-governance-explained',
  'AI agent governance is the set of rules, roles, and controls that decide what an autonomous AI system is allowed to do, under whose authority, and how it is checked.',
  $b1en$
<p>AI agent governance is the combination of rules, roles, and controls an organization puts around an AI agent so its actions stay within intended, accountable limits. It is not a single tool or checklist; it is the answer to five recurring questions: who owns the agent, what is it allowed to do, who approved that scope, how is it monitored, and how is it stopped if something goes wrong.</p>
<h2>The four building blocks</h2>
<ul class="content-checklist">
  <li><strong>Identity</strong> -- the agent has its own distinguishable, auditable identity, not a borrowed human login.</li>
  <li><strong>Permissions</strong> -- access is scoped to the task, time-limited, and reviewed on a schedule.</li>
  <li><strong>Oversight</strong> -- a human is in, on, or appropriately out of the loop depending on the impact of the action.</li>
  <li><strong>Accountability</strong> -- a named business owner and technical owner exist before the agent goes live, not after an incident.</li>
</ul>
<h2>Why this differs from ordinary application governance</h2>
<p>Ordinary software governance mostly asks "does this code do what it's supposed to." AI agent governance adds a harder question: "given that this system decides its own next step, what stops it from taking an action nobody explicitly authorized?" That is why agent governance leans more heavily on runtime controls (scoped permissions, monitoring, kill-switches) than on pre-release testing alone.</p>
<h2>Key takeaways</h2>
<ul class="content-checklist">
  <li>Governance is the ongoing system of controls around an agent, not a one-time approval.</li>
  <li>It rests on identity, permissions, oversight, and accountability together -- missing one weakens the rest.</li>
  <li>For a deeper look at why this matters and a full governance model, see the companion pieces linked below.</li>
</ul>
$b1en$,
  'AI Agent Governance Explained | CyberAbeer',
  'A clear, practical explainer on what AI agent governance means: identity, permissions, oversight, and accountability, in plain terms.', 4
from articles art join authors a on a.id=art.author_id join categories c on c.id=art.category_id
where a.display_name='Dr. Abeer Alshammari' and c.key='hub_ai_agent_governance'
  and not exists (select 1 from article_translations t where t.article_id=art.id and t.locale='en' and t.slug='ai-agent-governance-explained')
  and not exists (select 1 from article_translations t3 where t3.article_id=art.id and t3.locale='en');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'ar', 'شرح حوكمة وكلاء الذكاء الاصطناعي', 'شرح-حوكمة-وكلاء-الذكاء-الاصطناعي',
  'حوكمة وكلاء الذكاء الاصطناعي هي مجموعة القواعد والأدوار والضوابط التي تحدد ما يُسمح لنظام ذكاء اصطناعي مستقل بفعله، وبأي صلاحية، وكيف تتم مراقبته.',
  $b1ar$
<p>حوكمة وكلاء الذكاء الاصطناعي هي مزيج من القواعد والأدوار والضوابط التي تضعها المؤسسة حول وكيل الذكاء الاصطناعي كي تبقى أفعاله ضمن حدود مقصودة وخاضعة للمساءلة. إنها ليست أداة واحدة أو قائمة مراجعة، بل إجابة عن خمسة أسئلة متكررة: من يملك الوكيل، وما المسموح له بفعله، ومن وافق على هذا النطاق، وكيف تتم مراقبته، وكيف يُوقَف إن حدث خلل.</p>
<h2>اللبنات الأربع الأساسية</h2>
<ul class="content-checklist">
  <li><strong>الهوية</strong> — للوكيل هوية مستقلة وقابلة للتدقيق، لا حساب دخول بشري مستعار.</li>
  <li><strong>الصلاحيات</strong> — محددة النطاق حسب المهمة، ومحدودة زمنياً، ومُراجَعة دورياً.</li>
  <li><strong>الرقابة</strong> — إنسان داخل الحلقة أو عليها أو خارجها بحسب أثر الإجراء.</li>
  <li><strong>المساءلة</strong> — مالك أعمال ومالك تقني محددان قبل التشغيل، لا بعد وقوع حادثة.</li>
</ul>
<h2>لماذا يختلف هذا عن حوكمة التطبيقات العادية</h2>
<p>حوكمة البرمجيات العادية تسأل غالباً "هل يفعل هذا الكود ما يُفترض به؟". أما حوكمة وكلاء الذكاء الاصطناعي فتضيف سؤالاً أصعب: "بما أن هذا النظام يقرر خطوته التالية بنفسه، ما الذي يمنعه من اتخاذ إجراء لم يصرّح به أحد صراحة؟". لهذا تعتمد حوكمة الوكلاء على ضوابط وقت التشغيل (صلاحيات محددة، مراقبة، مفتاح إيقاف طارئ) أكثر من اعتمادها على الاختبار قبل الإطلاق وحده.</p>
<h2>أهم النقاط</h2>
<ul class="content-checklist">
  <li>الحوكمة نظام ضوابط مستمر حول الوكيل، لا موافقة تُمنح مرة واحدة.</li>
  <li>تقوم على الهوية والصلاحيات والرقابة والمساءلة معاً — إغفال أحدها يُضعف البقية.</li>
  <li>لمزيد من التفصيل حول أهمية هذا الموضوع ونموذج حوكمة كامل، راجع المقالات المرتبطة أدناه.</li>
</ul>
$b1ar$,
  'شرح حوكمة وكلاء الذكاء الاصطناعي | CyberAbeer',
  'شرح عملي وواضح لمعنى حوكمة وكلاء الذكاء الاصطناعي: الهوية والصلاحيات والرقابة والمساءلة، بلغة مبسطة.', 4
from articles art join authors a on a.id=art.author_id join categories c on c.id=art.category_id
where a.display_name='Dr. Abeer Alshammari' and c.key='hub_ai_agent_governance'
  and exists (select 1 from article_translations t where t.article_id=art.id and t.locale='en' and t.slug='ai-agent-governance-explained')
  and not exists (select 1 from article_translations t4 where t4.article_id=art.id and t4.locale='ar');

-- ---------------------------------------------------------------------
-- A2. AI Agent Identity and Non-Human Identities
-- ---------------------------------------------------------------------
insert into articles (id, author_id, category_id, status, schema_type, difficulty, audience, reviewed_at, published_at)
select gen_random_uuid(), a.id, c.id, 'published', 'Article', 'intermediate', array['professionals','ciso'], now(), now()
from authors a, categories c
where a.display_name='Dr. Abeer Alshammari' and c.key='hub_ai_agent_governance'
  and not exists (select 1 from article_translations t where t.locale='en' and t.slug='ai-agent-identity-non-human-identities');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'en', 'AI Agent Identity and Non-Human Identities', 'ai-agent-identity-non-human-identities',
  'A non-human identity is credentials issued to a piece of software rather than a person. AI agents need one of their own -- sharing a human login breaks attribution, audit, and revocation.',
  $b2en$
<p>A non-human identity (NHI) is an identity issued to a service, workload, or agent rather than to a person, so its actions can be authenticated and audited independently of anyone's personal login. AI agents are the newest, fastest-growing category of non-human identity, and treating them like a regular service account misses what makes them different: they decide their own next action, so knowing exactly which agent did what, under which credential, matters more than it does for a static script.</p>
<h2>Why "just use my login" breaks down</h2>
<table class="content-comparison-table">
  <thead><tr><th>Failure mode</th><th>What breaks</th></tr></thead>
  <tbody>
    <tr><td>Attribution</td><td>Logs show a human login, not whether the agent or the person acted</td></tr>
    <tr><td>Auditability</td><td>No way to reconstruct the agent's specific instruction or reasoning</td></tr>
    <tr><td>Revocation</td><td>Disabling the agent means disabling the person's own access, or vice versa</td></tr>
  </tbody>
</table>
<p>NIST's AI Agent Standards Initiative and the related NCCoE concept paper on software and AI agent identity frame the fix the same way: treat each agent as its own non-human identity, with a named owner, a documented credential type, a rotation schedule, and a defined authorized scope, using existing identity patterns (OAuth 2.0, OpenID Connect, workload-identity standards such as SPIFFE/SPIRE) rather than inventing something new. Microsoft's Entra Agent ID implements this same pattern in production, issuing agents their own principal rather than a borrowed one.</p>
<h2>Key takeaways</h2>
<ul class="content-checklist">
  <li>An agent needs an identity distinguishable from any human's, not a shared login.</li>
  <li>Existing identity standards (OAuth 2.0, OIDC, SPIFFE/SPIRE) can usually be extended to agents rather than replaced.</li>
  <li>Skipping this step is what breaks attribution, auditing, and clean revocation later.</li>
</ul>
$b2en$,
  'AI Agent Identity & Non-Human Identities | CyberAbeer',
  'What a non-human identity is and why AI agents need their own, not a borrowed human login -- grounded in NIST and Microsoft Entra guidance.', 4
from articles art join authors a on a.id=art.author_id join categories c on c.id=art.category_id
where a.display_name='Dr. Abeer Alshammari' and c.key='hub_ai_agent_governance'
  and not exists (select 1 from article_translations t where t.article_id=art.id and t.locale='en' and t.slug='ai-agent-identity-non-human-identities')
  and not exists (select 1 from article_translations t3 where t3.article_id=art.id and t3.locale='en');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'ar', 'هوية وكلاء الذكاء الاصطناعي والهويات غير البشرية', 'هوية-وكلاء-الذكاء-الاصطناعي-والهويات-غير-البشرية',
  'الهوية غير البشرية هي بيانات اعتماد تُمنح لبرمجية لا لشخص. يحتاج وكيل الذكاء الاصطناعي هويته الخاصة — فمشاركة حساب بشري تكسر الإسناد والتدقيق والإلغاء.',
  $b2ar$
<p>الهوية غير البشرية هي هوية تُمنح لخدمة أو حمل عمل أو وكيل لا لشخص، بحيث يمكن مصادقة أفعاله وتدقيقها بمعزل عن أي حساب دخول شخصي. وكلاء الذكاء الاصطناعي هم أحدث فئات الهوية غير البشرية وأسرعها نمواً، والتعامل معهم كحساب خدمة عادي يغفل ما يميزهم: فهم يقررون خطوتهم التالية بأنفسهم، لذا معرفة أي وكيل فعل ماذا، وبأي بيانات اعتماد، أهم مما هي عليه بالنسبة لسكربت ثابت.</p>
<h2>لماذا يفشل "استخدم حسابي فقط"</h2>
<table class="content-comparison-table">
  <thead><tr><th>نمط الفشل</th><th>ما الذي ينكسر</th></tr></thead>
  <tbody>
    <tr><td>الإسناد</td><td>تُظهر السجلات تسجيل دخول بشري، لا ما إذا كان الوكيل أو الشخص من تصرف</td></tr>
    <tr><td>قابلية التدقيق</td><td>لا يمكن إعادة بناء تعليمة الوكيل أو منطقه المحدد</td></tr>
    <tr><td>الإلغاء</td><td>تعطيل الوكيل يعني تعطيل وصول الشخص نفسه، أو العكس</td></tr>
  </tbody>
</table>
<p>تتعامل مبادرة NIST لمعايير وكلاء الذكاء الاصطناعي، وورقة NCCoE المرتبطة بهوية وكلاء البرمجيات والذكاء الاصطناعي، مع الحل بالطريقة نفسها: معاملة كل وكيل كهوية غير بشرية مستقلة، بمالك محدد، ونوع اعتماد موثّق، وجدول تدوير، ونطاق صلاحية معرَّف، باستخدام أنماط هوية قائمة (OAuth 2.0، OpenID Connect، معايير هوية أحمال العمل مثل SPIFFE/SPIRE) بدلاً من ابتكار شيء جديد. وتطبق ميزة Entra Agent ID من مايكروسوفت النمط نفسه في بيئات الإنتاج، إذ تمنح الوكيل هويته الخاصة لا هوية مستعارة.</p>
<h2>أهم النقاط</h2>
<ul class="content-checklist">
  <li>يحتاج الوكيل هوية قابلة للتمييز عن أي إنسان، لا حساباً مشتركاً.</li>
  <li>يمكن غالباً توسيع معايير الهوية القائمة (OAuth 2.0، OIDC، SPIFFE/SPIRE) لتشمل الوكلاء بدلاً من استبدالها.</li>
  <li>تجاوز هذه الخطوة هو ما يكسر الإسناد والتدقيق والإلغاء النظيف لاحقاً.</li>
</ul>
$b2ar$,
  'هوية وكلاء الذكاء الاصطناعي | CyberAbeer',
  'ما هي الهوية غير البشرية ولماذا يحتاج وكيل الذكاء الاصطناعي هويته الخاصة لا حساباً بشرياً مستعاراً — استناداً إلى إرشادات NIST ومايكروسوفت.', 4
from articles art join authors a on a.id=art.author_id join categories c on c.id=art.category_id
where a.display_name='Dr. Abeer Alshammari' and c.key='hub_ai_agent_governance'
  and exists (select 1 from article_translations t where t.article_id=art.id and t.locale='en' and t.slug='ai-agent-identity-non-human-identities')
  and not exists (select 1 from article_translations t4 where t4.article_id=art.id and t4.locale='ar');

-- ---------------------------------------------------------------------
-- A3. AI Agent Permissions and Least Privilege
-- ---------------------------------------------------------------------
insert into articles (id, author_id, category_id, status, schema_type, difficulty, audience, reviewed_at, published_at)
select gen_random_uuid(), a.id, c.id, 'published', 'Article', 'intermediate', array['professionals','ciso'], now(), now()
from authors a, categories c
where a.display_name='Dr. Abeer Alshammari' and c.key='hub_ai_agent_governance'
  and not exists (select 1 from article_translations t where t.locale='en' and t.slug='ai-agent-permissions-least-privilege');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'en', 'AI Agent Permissions and Least Privilege', 'ai-agent-permissions-least-privilege',
  '"The agent needs broad access to be useful" is the most common reason for over-provisioning, and the wrong conclusion from a true premise.',
  $b3en$
<p>Least privilege means an AI agent gets the minimum access required for its specific task, for a limited time, reviewed on a schedule -- not the broadest role available because "it's only automation." AWS's own prescriptive guidance for agentic AI is direct about the failure mode: teams reach for an existing broad IAM role out of convenience, and that is exactly how intended boundaries get erased.</p>
<h2>Applying least privilege in practice</h2>
<table class="content-decision-table">
  <thead><tr><th>Dimension</th><th>Default position</th></tr></thead>
  <tbody>
    <tr><td>Read vs. write</td><td>Read by default; write only where the task genuinely requires it</td></tr>
    <tr><td>Transaction authority</td><td>Capped at a defined threshold; anything above needs human sign-off</td></tr>
    <tr><td>Administrative privilege</td><td>Never by default; an explicit, reviewed exception</td></tr>
    <tr><td>Duration</td><td>Short-lived, time-limited credentials over standing access</td></tr>
    <tr><td>Review cadence</td><td>Scheduled reviews; unused grants are revoked, not accumulated</td></tr>
  </tbody>
</table>
<p>The pattern holds across AWS, Microsoft, and Google's public guidance alike: task-scoped, time-limited access evaluated at runtime, not a static role assumed once at deployment and never revisited.</p>
<h2>Key takeaways</h2>
<ul class="content-checklist">
  <li>Flexibility is not a reason for breadth -- scope permissions to the task, not the agent's potential.</li>
  <li>Cap transaction and administrative authority explicitly; treat exceptions as reviewed, not default.</li>
  <li>Review on a schedule -- unused access is a standing risk, not a convenience.</li>
</ul>
$b3en$,
  'AI Agent Permissions & Least Privilege | CyberAbeer',
  'Why AI agents should never get broad access "to be useful," and the practical least-privilege defaults that keep them safe.', 3
from articles art join authors a on a.id=art.author_id join categories c on c.id=art.category_id
where a.display_name='Dr. Abeer Alshammari' and c.key='hub_ai_agent_governance'
  and not exists (select 1 from article_translations t where t.article_id=art.id and t.locale='en' and t.slug='ai-agent-permissions-least-privilege')
  and not exists (select 1 from article_translations t3 where t3.article_id=art.id and t3.locale='en');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'ar', 'صلاحيات وكلاء الذكاء الاصطناعي ومبدأ أقل الصلاحيات', 'صلاحيات-وكلاء-الذكاء-الاصطناعي-ومبدا-اقل-الصلاحيات',
  '"يحتاج الوكيل صلاحيات واسعة ليكون مفيداً" هو التبرير الأكثر شيوعاً للتوسع المفرط في الصلاحيات، وهو استنتاج خاطئ من مقدمة صحيحة.',
  $b3ar$
<p>مبدأ أقل الصلاحيات يعني أن يحصل وكيل الذكاء الاصطناعي على الحد الأدنى من الوصول اللازم لمهمته المحددة، لمدة محدودة، ومُراجَع دورياً — لا أوسع دور متاح بحجة "أنه مجرد أتمتة". إرشادات AWS التوجيهية الخاصة بالذكاء الاصطناعي الوكيلي صريحة بشأن نمط الفشل: تلجأ الفرق إلى دور IAM واسع موجود مسبقاً طلباً للراحة، وهذه بالضبط الطريقة التي تُمحى بها الحدود المقصودة.</p>
<h2>تطبيق مبدأ أقل الصلاحيات عملياً</h2>
<table class="content-decision-table">
  <thead><tr><th>البُعد</th><th>الموقف الافتراضي</th></tr></thead>
  <tbody>
    <tr><td>القراءة مقابل الكتابة</td><td>القراءة افتراضياً؛ والكتابة فقط حين تتطلبها المهمة فعلياً</td></tr>
    <tr><td>صلاحية المعاملات</td><td>محدودة بسقف معيّن؛ وأي مبلغ أعلى يتطلب موافقة بشرية</td></tr>
    <tr><td>الامتياز الإداري</td><td>لا يُمنح افتراضياً أبداً؛ استثناء صريح ومُراجَع</td></tr>
    <tr><td>المدة</td><td>بيانات اعتماد قصيرة الأجل ومحدودة زمنياً بدل الوصول الدائم</td></tr>
    <tr><td>وتيرة المراجعة</td><td>مراجعات مجدولة؛ تُلغى الصلاحيات غير المستخدمة بدل تراكمها</td></tr>
  </tbody>
</table>
<p>هذا النمط ثابت عبر إرشادات AWS ومايكروسوفت وجوجل العامة على حد سواء: صلاحيات محددة النطاق حسب المهمة ومحدودة زمنياً تُقيَّم وقت التنفيذ، لا دوراً ثابتاً يُفترض مرة عند النشر ولا تتم مراجعته أبداً.</p>
<h2>أهم النقاط</h2>
<ul class="content-checklist">
  <li>المرونة ليست سبباً للتوسع — حدّد الصلاحيات حسب المهمة، لا حسب إمكانات الوكيل.</li>
  <li>حدّد صلاحية المعاملات والامتياز الإداري صراحة؛ عامل الاستثناءات كمراجَعة لا كافتراض.</li>
  <li>راجع دورياً — الوصول غير المستخدم مخاطرة قائمة، لا راحة إضافية.</li>
</ul>
$b3ar$,
  'صلاحيات وكلاء الذكاء الاصطناعي | CyberAbeer',
  'لماذا لا ينبغي منح وكلاء الذكاء الاصطناعي صلاحيات واسعة "ليكونوا مفيدين"، والإعدادات الافتراضية العملية لمبدأ أقل الصلاحيات.', 3
from articles art join authors a on a.id=art.author_id join categories c on c.id=art.category_id
where a.display_name='Dr. Abeer Alshammari' and c.key='hub_ai_agent_governance'
  and exists (select 1 from article_translations t where t.article_id=art.id and t.locale='en' and t.slug='ai-agent-permissions-least-privilege')
  and not exists (select 1 from article_translations t4 where t4.article_id=art.id and t4.locale='ar');

-- ---------------------------------------------------------------------
-- A4. Shadow AI vs Shadow Agents
-- ---------------------------------------------------------------------
insert into articles (id, author_id, category_id, status, schema_type, difficulty, audience, reviewed_at, published_at)
select gen_random_uuid(), a.id, c.id, 'published', 'Article', 'beginner', array['professionals','general','ciso'], now(), now()
from authors a, categories c
where a.display_name='Dr. Abeer Alshammari' and c.key='hub_ai_agent_governance'
  and not exists (select 1 from article_translations t where t.locale='en' and t.slug='shadow-ai-vs-shadow-agents');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'en', 'Shadow AI vs. Shadow Agents', 'shadow-ai-vs-shadow-agents',
  'Shadow AI is any AI use outside approved governance. A shadow agent is the sharper version of the same problem, because it can act, not just generate text.',
  $b4en$
<p>Shadow AI is any AI use that exists outside an organization's approved governance process: a personal AI account used for work, a department-built automation nobody registered, an unapproved browser extension with broad page access. A shadow agent is the same problem with higher stakes, because an agent does not just produce content, it can call tools, touch systems, and change records.</p>
<h2>Shadow AI vs. shadow agent</h2>
<table class="content-comparison-table">
  <thead><tr><th></th><th>Shadow AI</th><th>Shadow agent</th></tr></thead>
  <tbody>
    <tr><td>Typical form</td><td>Personal chatbot account, browser extension</td><td>An unregistered automation with tool/API access</td></tr>
    <tr><td>Worst-case impact</td><td>Data exposure through a prompt</td><td>Unauthorized action: a transaction, a record change, an external message</td></tr>
    <tr><td>Discovery method</td><td>Network/traffic and account audits</td><td>Same, plus API and permission-grant audits</td></tr>
  </tbody>
</table>
<p>Cloud Security Alliance research on this found a striking gap: a majority of organizations surveyed expect AI agents to become vital within a year, while a similar majority could not clearly distinguish AI agent activity from human activity in their own systems. That gap is the real risk -- you cannot govern what you cannot first see. Discovery and inventory has to come before any conversation about permissions or autonomy.</p>
<h2>Key takeaways</h2>
<ul class="content-checklist">
  <li>Shadow AI and shadow agents both mean "operating outside approved governance," but agents carry action-level risk.</li>
  <li>Inventory and discovery come first -- least privilege cannot be applied to something you don't know is running.</li>
  <li>Treat any unregistered automation with tool access as a shadow agent until proven otherwise.</li>
</ul>
$b4en$,
  'Shadow AI vs. Shadow Agents | CyberAbeer',
  'The difference between shadow AI and shadow agents, and why discovery and inventory have to come before any governance conversation.', 3
from articles art join authors a on a.id=art.author_id join categories c on c.id=art.category_id
where a.display_name='Dr. Abeer Alshammari' and c.key='hub_ai_agent_governance'
  and not exists (select 1 from article_translations t where t.article_id=art.id and t.locale='en' and t.slug='shadow-ai-vs-shadow-agents')
  and not exists (select 1 from article_translations t3 where t3.article_id=art.id and t3.locale='en');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'ar', 'الذكاء الاصطناعي الخفي مقابل وكلاء الظل', 'الذكاء-الاصطناعي-الخفي-مقابل-وكلاء-الظل',
  'الذكاء الاصطناعي الخفي هو أي استخدام يقع خارج الحوكمة المعتمدة. أما وكيل الظل فهو النسخة الأكثر حدّة من المشكلة نفسها، لأنه قادر على التصرف لا توليد نص فقط.',
  $b4ar$
<p>الذكاء الاصطناعي الخفي هو أي استخدام للذكاء الاصطناعي يقع خارج عملية الحوكمة المعتمدة للمؤسسة: حساب شخصي يُستخدم للعمل، أو أتمتة بناها قسم ما دون تسجيلها، أو امتداد متصفح غير معتمد بصلاحيات وصول واسعة. أما وكيل الظل فهو المشكلة نفسها بمخاطر أعلى، لأن الوكيل لا يولّد محتوى فقط، بل يمكنه استدعاء أدوات ولمس أنظمة وتغيير سجلات.</p>
<h2>الذكاء الاصطناعي الخفي مقابل وكيل الظل</h2>
<table class="content-comparison-table">
  <thead><tr><th></th><th>الذكاء الاصطناعي الخفي</th><th>وكيل الظل</th></tr></thead>
  <tbody>
    <tr><td>الشكل المعتاد</td><td>حساب محادثة شخصي، امتداد متصفح</td><td>أتمتة غير مسجلة بوصول لأدوات وواجهات برمجية</td></tr>
    <tr><td>أسوأ سيناريو</td><td>تسريب بيانات عبر طلب</td><td>إجراء غير مصرح به: معاملة، تعديل سجل، رسالة خارجية</td></tr>
    <tr><td>طريقة الاكتشاف</td><td>تدقيق الشبكة والحسابات</td><td>الطريقة نفسها، إضافة لتدقيق الواجهات ومنح الصلاحيات</td></tr>
  </tbody>
</table>
<p>وجدت أبحاث Cloud Security Alliance فجوة لافتة: غالبية المؤسسات المستطلعة تتوقع أن تصبح وكلاء الذكاء الاصطناعي أساسية خلال عام، بينما لم تستطع غالبية مماثلة التمييز بوضوح بين نشاط الوكيل والنشاط البشري داخل أنظمتها. هذه الفجوة هي المخاطرة الحقيقية — لا يمكنك حوكمة ما لا تراه أولاً. الاكتشاف والجرد يجب أن يسبقا أي حوار عن الصلاحيات أو الاستقلالية.</p>
<h2>أهم النقاط</h2>
<ul class="content-checklist">
  <li>يعني كلٌّ من الذكاء الاصطناعي الخفي ووكيل الظل "العمل خارج الحوكمة المعتمدة"، لكن الوكيل يحمل مخاطرة على مستوى الفعل.</li>
  <li>الجرد والاكتشاف أولاً — لا يمكن تطبيق أقل الصلاحيات على شيء لا تعلم أنه يعمل.</li>
  <li>عامل أي أتمتة غير مسجلة لها وصول للأدوات كوكيل ظل حتى يثبت العكس.</li>
</ul>
$b4ar$,
  'الذكاء الاصطناعي الخفي مقابل وكلاء الظل | CyberAbeer',
  'الفرق بين الذكاء الاصطناعي الخفي ووكلاء الظل، ولماذا يجب أن يسبق الاكتشاف والجرد أي حوار حوكمي.', 3
from articles art join authors a on a.id=art.author_id join categories c on c.id=art.category_id
where a.display_name='Dr. Abeer Alshammari' and c.key='hub_ai_agent_governance'
  and exists (select 1 from article_translations t where t.article_id=art.id and t.locale='en' and t.slug='shadow-ai-vs-shadow-agents')
  and not exists (select 1 from article_translations t4 where t4.article_id=art.id and t4.locale='ar');

-- ---------------------------------------------------------------------
-- A5. Human-in-the-Loop for AI Agents
-- ---------------------------------------------------------------------
insert into articles (id, author_id, category_id, status, schema_type, difficulty, audience, reviewed_at, published_at)
select gen_random_uuid(), a.id, c.id, 'published', 'Article', 'beginner', array['professionals','general'], now(), now()
from authors a, categories c
where a.display_name='Dr. Abeer Alshammari' and c.key='hub_ai_agent_governance'
  and not exists (select 1 from article_translations t where t.locale='en' and t.slug='human-in-the-loop-for-ai-agents');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'en', 'Human-in-the-Loop for AI Agents', 'human-in-the-loop-for-ai-agents',
  'Human-in-the-loop, on-the-loop, and out-of-the-loop describe three different levels of real-time human involvement in what an AI agent does.',
  $b5en$
<p>Human-in-the-loop means a person approves an action before it executes. Human-on-the-loop means a person can observe and intervene, but the agent proceeds by default. Human-out-of-the-loop means the agent acts with no real-time human checkpoint at all. None of the three is universally "correct" -- the right one depends on what the action actually does.</p>
<h2>Matching the model to the stakes</h2>
<table class="content-decision-table">
  <thead><tr><th>Example task</th><th>Concern level</th><th>Fitting model</th></tr></thead>
  <tbody>
    <tr><td>Summarizing supplier bids for a human buyer</td><td>Low -- nothing is decided</td><td>Out-of-the-loop</td></tr>
    <tr><td>Recommending which supplier to select</td><td>Medium -- reasoning needs to be inspectable</td><td>On-the-loop</td></tr>
    <tr><td>Signing a contract or initiating a payment</td><td>High -- real financial/legal consequence</td><td>In-the-loop</td></tr>
  </tbody>
</table>
<p>Google's own public framework for agent security makes a related point directly: agents should have well-defined human controllers, with explicit confirmation required for critical or irreversible actions. That is a description of when to insist on human-in-the-loop, not a case for it everywhere -- over-using it just recreates the bottleneck agents were meant to remove.</p>
<h2>Key takeaways</h2>
<ul class="content-checklist">
  <li>Choose the oversight model by the action's real-world consequence, not by default habit.</li>
  <li>Irreversible, financial, or legal actions belong in-the-loop regardless of the agent's track record.</li>
  <li>Low-stakes, easily reversible actions can run out-of-the-loop without meaningfully increasing risk.</li>
</ul>
$b5en$,
  'Human-in-the-Loop for AI Agents | CyberAbeer',
  'In-the-loop, on-the-loop, or out-of-the-loop -- how to match human oversight to the real stakes of what an AI agent is doing.', 3
from articles art join authors a on a.id=art.author_id join categories c on c.id=art.category_id
where a.display_name='Dr. Abeer Alshammari' and c.key='hub_ai_agent_governance'
  and not exists (select 1 from article_translations t where t.article_id=art.id and t.locale='en' and t.slug='human-in-the-loop-for-ai-agents')
  and not exists (select 1 from article_translations t3 where t3.article_id=art.id and t3.locale='en');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'ar', 'الإنسان داخل الحلقة لوكلاء الذكاء الاصطناعي', 'الانسان-داخل-الحلقة-لوكلاء-الذكاء-الاصطناعي',
  'داخل الحلقة، وعلى الحلقة، وخارج الحلقة — ثلاثة مستويات مختلفة لمشاركة الإنسان الآنية فيما يفعله وكيل الذكاء الاصطناعي.',
  $b5ar$
<p>الإنسان داخل الحلقة يعني أن شخصاً يوافق على الإجراء قبل تنفيذه. الإنسان على الحلقة يعني أن شخصاً يمكنه المراقبة والتدخل، لكن الوكيل يمضي افتراضياً. الإنسان خارج الحلقة يعني أن الوكيل يتصرف دون أي نقطة تحقق بشرية آنية. لا يوجد نموذج "صحيح" على الإطلاق من بين الثلاثة — يعتمد الاختيار الصحيح على ما يفعله الإجراء فعلياً.</p>
<h2>مطابقة النموذج مع حجم المخاطرة</h2>
<table class="content-decision-table">
  <thead><tr><th>مثال المهمة</th><th>مستوى القلق</th><th>النموذج المناسب</th></tr></thead>
  <tbody>
    <tr><td>تلخيص عروض الموردين لمشترٍ بشري</td><td>منخفض — لا شيء يُقرَّر</td><td>خارج الحلقة</td></tr>
    <tr><td>التوصية بأي مورّد يُختار</td><td>متوسط — يحتاج المنطق إلى إمكانية الفحص</td><td>على الحلقة</td></tr>
    <tr><td>توقيع عقد أو بدء عملية دفع</td><td>مرتفع — عاقبة مالية أو قانونية حقيقية</td><td>داخل الحلقة</td></tr>
  </tbody>
</table>
<p>يطرح إطار جوجل العام لأمن الوكلاء نقطة مرتبطة مباشرة: ينبغي أن يكون للوكلاء متحكمون بشريون محددون بوضوح، مع اشتراط تأكيد صريح للإجراءات الحرجة أو التي لا يمكن التراجع عنها. هذا وصف لمتى يجب الإصرار على وجود الإنسان داخل الحلقة، لا حجة لتطبيقه في كل مكان — فالإفراط في استخدامه يعيد خلق العائق نفسه الذي صُمم الوكيل ليزيله.</p>
<h2>أهم النقاط</h2>
<ul class="content-checklist">
  <li>اختر نموذج الرقابة حسب العاقبة الواقعية للإجراء، لا حسب العادة الافتراضية.</li>
  <li>الإجراءات المالية أو القانونية أو التي لا يمكن التراجع عنها تنتمي إلى "داخل الحلقة" بصرف النظر عن سجل الوكيل.</li>
  <li>يمكن للإجراءات منخفضة المخاطر والقابلة للتراجع أن تعمل "خارج الحلقة" دون زيادة المخاطرة فعلياً.</li>
</ul>
$b5ar$,
  'الإنسان داخل الحلقة لوكلاء الذكاء الاصطناعي | CyberAbeer',
  'داخل الحلقة أو عليها أو خارجها — كيف تطابق الرقابة البشرية مع حجم مخاطرة ما يفعله وكيل الذكاء الاصطناعي فعلياً.', 3
from articles art join authors a on a.id=art.author_id join categories c on c.id=art.category_id
where a.display_name='Dr. Abeer Alshammari' and c.key='hub_ai_agent_governance'
  and exists (select 1 from article_translations t where t.article_id=art.id and t.locale='en' and t.slug='human-in-the-loop-for-ai-agents')
  and not exists (select 1 from article_translations t4 where t4.article_id=art.id and t4.locale='ar');

-- ---------------------------------------------------------------------
-- A6. AI Agent Risk Assessment
-- ---------------------------------------------------------------------
insert into articles (id, author_id, category_id, status, schema_type, difficulty, audience, reviewed_at, published_at)
select gen_random_uuid(), a.id, c.id, 'published', 'Article', 'intermediate', array['professionals','ciso','executives'], now(), now()
from authors a, categories c
where a.display_name='Dr. Abeer Alshammari' and c.key='hub_ai_agent_governance'
  and not exists (select 1 from article_translations t where t.locale='en' and t.slug='ai-agent-risk-assessment');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'en', 'AI Agent Risk Assessment', 'ai-agent-risk-assessment',
  'Assessing an AI agent means scoring what it can access and do, not just how good its outputs look in a demo.',
  $b6en$
<p>A useful AI agent risk assessment does not start with "is the model accurate." It starts with "what can this agent reach, and what happens if it reaches it incorrectly." Demo-quality output quality and real-world blast radius are two different questions, and only the second one determines how much governance the agent needs.</p>
<h2>A practical assessment checklist</h2>
<ul class="content-checklist">
  <li>What systems, tools, and APIs can the agent invoke, and which of those allow write access?</li>
  <li>What is the most sensitive data classification tier the agent can reach?</li>
  <li>What is the maximum financial or operational impact of a single incorrect action?</li>
  <li>Is the action reversible, and how quickly?</li>
  <li>Does a human approve before the action, observe it, or have no real-time visibility at all?</li>
  <li>Is there a named business owner and technical owner on record?</li>
  <li>Can the action be reconstructed after the fact from logs alone?</li>
</ul>
<p>MITRE ATLAS, the AI-focused counterpart to the ATT&amp;CK framework, is a useful reference point here: it increasingly documents attack paths at the orchestration and execution layer -- the identities and services adjacent to an agent, not the model itself -- which is exactly where this checklist is aimed.</p>
<h2>Key takeaways</h2>
<ul class="content-checklist">
  <li>Score reach and consequence, not just output quality.</li>
  <li>The riskiest agents are usually the ones with write access to sensitive systems and no clear owner.</li>
  <li>Pair this checklist with CyberAbeer's autonomy-levels model to decide how much oversight each agent needs.</li>
</ul>
$b6en$,
  'AI Agent Risk Assessment | CyberAbeer',
  'A practical checklist for assessing AI agent risk: reach, data sensitivity, reversibility, oversight, and ownership.', 3
from articles art join authors a on a.id=art.author_id join categories c on c.id=art.category_id
where a.display_name='Dr. Abeer Alshammari' and c.key='hub_ai_agent_governance'
  and not exists (select 1 from article_translations t where t.article_id=art.id and t.locale='en' and t.slug='ai-agent-risk-assessment')
  and not exists (select 1 from article_translations t3 where t3.article_id=art.id and t3.locale='en');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'ar', 'تقييم مخاطر وكلاء الذكاء الاصطناعي', 'تقييم-مخاطر-وكلاء-الذكاء-الاصطناعي',
  'تقييم وكيل الذكاء الاصطناعي يعني قياس ما يستطيع الوصول إليه وفعله، لا مجرد مدى جودة مخرجاته في عرض تجريبي.',
  $b6ar$
<p>تقييم مخاطر وكيل الذكاء الاصطناعي المفيد لا يبدأ بسؤال "هل النموذج دقيق؟"، بل بسؤال "ما الذي يستطيع هذا الوكيل الوصول إليه، وماذا يحدث إن وصل إليه بشكل خاطئ؟". جودة المخرجات في عرض تجريبي ونطاق الأثر الواقعي سؤالان مختلفان، والثاني وحده هو ما يحدد مقدار الحوكمة التي يحتاجها الوكيل.</p>
<h2>قائمة تقييم عملية</h2>
<ul class="content-checklist">
  <li>ما الأنظمة والأدوات والواجهات البرمجية التي يستطيع الوكيل استدعاءها، وأيها يسمح بالكتابة؟</li>
  <li>ما أعلى مستوى حساسية بيانات يستطيع الوكيل الوصول إليه؟</li>
  <li>ما أقصى أثر مالي أو تشغيلي لإجراء خاطئ واحد؟</li>
  <li>هل الإجراء قابل للتراجع، وبأي سرعة؟</li>
  <li>هل يوافق إنسان قبل الإجراء، أم يراقبه، أم لا رؤية آنية له إطلاقاً؟</li>
  <li>هل يوجد مالك أعمال ومالك تقني مسجلان بالاسم؟</li>
  <li>هل يمكن إعادة بناء الإجراء لاحقاً من السجلات وحدها؟</li>
</ul>
<p>إطار MITRE ATLAS، النظير المتخصص بالذكاء الاصطناعي لإطار ATT&amp;CK، مرجع مفيد هنا: فهو يوثّق بشكل متزايد مسارات الهجوم عند طبقة التنسيق والتنفيذ — أي الهويات والخدمات المجاورة للوكيل، لا النموذج نفسه — وهو بالضبط ما تستهدفه هذه القائمة.</p>
<h2>أهم النقاط</h2>
<ul class="content-checklist">
  <li>قِس نطاق الوصول والعاقبة، لا جودة المخرجات فقط.</li>
  <li>أخطر الوكلاء عادة هم من لديهم صلاحية كتابة على أنظمة حساسة دون مالك واضح.</li>
  <li>اقرن هذه القائمة بنموذج مستويات الاستقلالية من CyberAbeer لتحديد مقدار الرقابة التي يحتاجها كل وكيل.</li>
</ul>
$b6ar$,
  'تقييم مخاطر وكلاء الذكاء الاصطناعي | CyberAbeer',
  'قائمة عملية لتقييم مخاطر وكلاء الذكاء الاصطناعي: نطاق الوصول، وحساسية البيانات، وقابلية التراجع، والرقابة، والملكية.', 3
from articles art join authors a on a.id=art.author_id join categories c on c.id=art.category_id
where a.display_name='Dr. Abeer Alshammari' and c.key='hub_ai_agent_governance'
  and exists (select 1 from article_translations t where t.article_id=art.id and t.locale='en' and t.slug='ai-agent-risk-assessment')
  and not exists (select 1 from article_translations t4 where t4.article_id=art.id and t4.locale='ar');

-- ---------------------------------------------------------------------
-- A7. How Organizations Should Inventory AI Agents
-- ---------------------------------------------------------------------
insert into articles (id, author_id, category_id, status, schema_type, difficulty, audience, reviewed_at, published_at)
select gen_random_uuid(), a.id, c.id, 'published', 'Article', 'intermediate', array['professionals','ciso'], now(), now()
from authors a, categories c
where a.display_name='Dr. Abeer Alshammari' and c.key='hub_ai_agent_governance'
  and not exists (select 1 from article_translations t where t.locale='en' and t.slug='how-to-inventory-ai-agents');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'en', 'How Organizations Should Inventory AI Agents', 'how-to-inventory-ai-agents',
  'You cannot govern an AI agent you do not know exists. A real inventory is the first, non-negotiable step in any agent governance program.',
  $b7en$
<p>Most organizations already have more AI agents running than their asset inventory shows, because agents are often built by individual teams to solve a local problem and never formally registered. An inventory has to actively look for them, not just wait for teams to self-report.</p>
<h2>What a real inventory captures, per agent</h2>
<ul class="content-checklist">
  <li>A named business owner and a named technical owner.</li>
  <li>The systems, tools, and APIs it can invoke, and whether each is read or write.</li>
  <li>The data classification tier it can reach.</li>
  <li>Its autonomy level and whether a human approves, observes, or is out of the loop.</li>
  <li>When it was last reviewed, and by whom.</li>
</ul>
<h2>Where to look</h2>
<p>Discovery methods worth combining: reviewing API and integration logs for unfamiliar service accounts, auditing browser-extension and SaaS-connector permissions, checking cloud IAM roles with unusually broad scopes, and simply asking every team lead directly whether they've built or connected any automation that calls external tools. No single method finds everything; the combination does.</p>
<h2>Key takeaways</h2>
<ul class="content-checklist">
  <li>Assume your current agent inventory is incomplete until proven otherwise.</li>
  <li>Discovery is active, not passive -- self-reporting alone misses shadow agents by definition.</li>
  <li>An inventory without owner, access, and review-date fields is a list, not a governance tool.</li>
</ul>
$b7en$,
  'How to Inventory AI Agents | CyberAbeer',
  'A practical approach to discovering and inventorying every AI agent running in your organization, not just the registered ones.', 3
from articles art join authors a on a.id=art.author_id join categories c on c.id=art.category_id
where a.display_name='Dr. Abeer Alshammari' and c.key='hub_ai_agent_governance'
  and not exists (select 1 from article_translations t where t.article_id=art.id and t.locale='en' and t.slug='how-to-inventory-ai-agents')
  and not exists (select 1 from article_translations t3 where t3.article_id=art.id and t3.locale='en');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'ar', 'كيف ينبغي للمؤسسات جرد وكلاء الذكاء الاصطناعي', 'كيف-ينبغي-للمؤسسات-جرد-وكلاء-الذكاء-الاصطناعي',
  'لا يمكنك حوكمة وكيل ذكاء اصطناعي لا تعلم بوجوده. الجرد الحقيقي هو الخطوة الأولى غير القابلة للتفاوض في أي برنامج حوكمة للوكلاء.',
  $b7ar$
<p>لدى معظم المؤسسات وكلاء ذكاء اصطناعي يعملون أكثر مما يُظهره جرد أصولها، لأن الوكلاء غالباً ما تبنيها فرق فردية لحل مشكلة محلية دون تسجيلها رسمياً أبداً. يجب أن يبحث الجرد عنها فعلياً، لا أن ينتظر إبلاغ الفرق طواعية.</p>
<h2>ما الذي يوثقه الجرد الحقيقي لكل وكيل</h2>
<ul class="content-checklist">
  <li>مالك أعمال محدد ومالك تقني محدد.</li>
  <li>الأنظمة والأدوات والواجهات البرمجية التي يستطيع استدعاءها، وما إذا كانت قراءة أو كتابة.</li>
  <li>مستوى تصنيف البيانات الذي يستطيع الوصول إليه.</li>
  <li>مستوى استقلاليته وما إذا كان إنسان يوافق أو يراقب أو خارج الحلقة تماماً.</li>
  <li>متى آخر مراجعة له، ومن أجراها.</li>
</ul>
<h2>أين تبحث</h2>
<p>طرق اكتشاف يستحق الجمع بينها: مراجعة سجلات الواجهات البرمجية والتكاملات بحثاً عن حسابات خدمة غير مألوفة، وتدقيق صلاحيات امتدادات المتصفح وموصلات SaaS، وفحص أدوار IAM السحابية ذات النطاقات الواسعة بشكل غير معتاد، وسؤال كل قائد فريق مباشرة عمّا إذا بنى أو ربط أي أتمتة تستدعي أدوات خارجية. لا تجد طريقة واحدة كل شيء؛ الجمع بينها هو ما يفعل.</p>
<h2>أهم النقاط</h2>
<ul class="content-checklist">
  <li>افترض أن جرد الوكلاء الحالي لديك غير مكتمل حتى يثبت العكس.</li>
  <li>الاكتشاف فعل نشط لا سلبي — الإبلاغ الذاتي وحده يغفل وكلاء الظل بحكم التعريف.</li>
  <li>الجرد بلا حقول للمالك والوصول وتاريخ المراجعة قائمة فحسب، لا أداة حوكمة.</li>
</ul>
$b7ar$,
  'جرد وكلاء الذكاء الاصطناعي | CyberAbeer',
  'نهج عملي لاكتشاف وجرد كل وكيل ذكاء اصطناعي يعمل في مؤسستك، لا المسجل منها فقط.', 3
from articles art join authors a on a.id=art.author_id join categories c on c.id=art.category_id
where a.display_name='Dr. Abeer Alshammari' and c.key='hub_ai_agent_governance'
  and exists (select 1 from article_translations t where t.article_id=art.id and t.locale='en' and t.slug='how-to-inventory-ai-agents')
  and not exists (select 1 from article_translations t4 where t4.article_id=art.id and t4.locale='ar');

-- =====================================================================
-- SECTION B: CYBERSECURITY & GRC
-- =====================================================================

-- ---------------------------------------------------------------------
-- B1. Cybersecurity Governance Framework Explained (hub_cybersecurity_governance)
-- ---------------------------------------------------------------------
insert into articles (id, author_id, category_id, status, schema_type, difficulty, audience, reviewed_at, published_at)
select gen_random_uuid(), a.id, c.id, 'published', 'Article', 'beginner', array['professionals','executives','general'], now(), now()
from authors a, categories c
where a.display_name='Dr. Abeer Alshammari' and c.key='hub_cybersecurity_governance'
  and not exists (select 1 from article_translations t where t.locale='en' and t.slug='cybersecurity-governance-framework-explained');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'en', 'Cybersecurity Governance Framework Explained', 'cybersecurity-governance-framework-explained',
  'A cybersecurity governance framework is the structure that decides who sets policy, who owns risk, and how the board gets real assurance -- not a list of technical controls.',
  $b8en$
<p>A cybersecurity governance framework defines the structure around cyber risk decisions: who sets policy, who owns risk at each level, how risk appetite is set, and how assurance reaches the board. It is a layer above technical controls, not a replacement for them -- a framework tells you who decides to require multi-factor authentication; it doesn't configure it.</p>
<h2>What a governance framework typically covers</h2>
<ul class="content-checklist">
  <li>Roles and reporting lines: where the CISO sits, and who they report to.</li>
  <li>Risk appetite and tolerance: how much risk the organization is willing to accept, set explicitly, not assumed.</li>
  <li>Policy structure: who approves policy, and how exceptions are tracked.</li>
  <li>Assurance: how the board confirms the risk picture it's shown is accurate, not self-reported without check.</li>
  <li>The three lines model: operational security, independent risk/governance oversight, and internal audit, kept distinct.</li>
</ul>
<p>Widely used reference frameworks (NIST CSF, ISO/IEC 27001, COBIT) each formalize pieces of this differently, but the underlying governance question is the same across all of them: who is accountable, and how is that accountability checked independently.</p>
<h2>Key takeaways</h2>
<ul class="content-checklist">
  <li>Governance is about decision rights and accountability, not the technical controls themselves.</li>
  <li>A named risk owner and an independent assurance path to the board are the two most commonly missing pieces.</li>
  <li>See "Cybersecurity Governance vs IT Governance" for why this often gets folded into IT by mistake.</li>
</ul>
$b8en$,
  'Cybersecurity Governance Framework Explained | CyberAbeer',
  'What a cybersecurity governance framework actually structures: roles, risk appetite, policy, and board assurance.', 3
from articles art join authors a on a.id=art.author_id join categories c on c.id=art.category_id
where a.display_name='Dr. Abeer Alshammari' and c.key='hub_cybersecurity_governance'
  and not exists (select 1 from article_translations t where t.article_id=art.id and t.locale='en' and t.slug='cybersecurity-governance-framework-explained')
  and not exists (select 1 from article_translations t3 where t3.article_id=art.id and t3.locale='en');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'ar', 'شرح إطار حوكمة الأمن السيبراني', 'شرح-اطار-حوكمة-الامن-السيبراني',
  'إطار حوكمة الأمن السيبراني هو البنية التي تحدد من يضع السياسات، ومن يملك المخاطر، وكيف يحصل مجلس الإدارة على تأكيد حقيقي — لا قائمة ضوابط تقنية.',
  $b8ar$
<p>يحدد إطار حوكمة الأمن السيبراني البنية المحيطة بقرارات المخاطر السيبرانية: من يضع السياسات، ومن يملك المخاطرة على كل مستوى، وكيف تُحدَّد شهية المخاطرة، وكيف يصل التأكيد إلى مجلس الإدارة. إنه طبقة فوق الضوابط التقنية، لا بديل عنها — الإطار يخبرك من يقرر اشتراط المصادقة متعددة العوامل؛ لا يقوم بضبطها.</p>
<h2>ما الذي يغطيه إطار الحوكمة عادة</h2>
<ul class="content-checklist">
  <li>الأدوار وخطوط التقارير: أين يقع رئيس أمن المعلومات، ولمن يتبع.</li>
  <li>شهية المخاطرة وتحملها: مقدار المخاطرة التي تقبل المؤسسة تحملها، محددة صراحة لا مفترضة.</li>
  <li>بنية السياسات: من يعتمد السياسة، وكيف تُتَتبع الاستثناءات.</li>
  <li>التأكيد: كيف يتحقق مجلس الإدارة من دقة صورة المخاطر المعروضة عليه، لا بإبلاغ ذاتي دون تدقيق.</li>
  <li>نموذج الخطوط الثلاثة: الأمن التشغيلي، والرقابة المستقلة للحوكمة والمخاطر، والتدقيق الداخلي، منفصلة بوضوح.</li>
</ul>
<p>تُضفي أطر مرجعية شائعة الاستخدام (NIST CSF، ISO/IEC 27001، COBIT) الطابع الرسمي على أجزاء من هذا بطرق مختلفة، لكن سؤال الحوكمة الجوهري واحد عبرها جميعاً: من المسؤول، وكيف يُتحقق من تلك المسؤولية بشكل مستقل.</p>
<h2>أهم النقاط</h2>
<ul class="content-checklist">
  <li>الحوكمة تتعلق بحقوق القرار والمساءلة، لا الضوابط التقنية نفسها.</li>
  <li>مالك مخاطرة محدد ومسار تأكيد مستقل إلى مجلس الإدارة هما أكثر عنصرين مفقودين شيوعاً.</li>
  <li>راجع مقال "حوكمة الأمن السيبراني مقابل حوكمة تقنية المعلومات" لمعرفة سبب دمج هذا خطأً ضمن تقنية المعلومات غالباً.</li>
</ul>
$b8ar$,
  'شرح إطار حوكمة الأمن السيبراني | CyberAbeer',
  'ما الذي يبنيه إطار حوكمة الأمن السيبراني فعلياً: الأدوار، وشهية المخاطرة، والسياسات، وتأكيد مجلس الإدارة.', 3
from articles art join authors a on a.id=art.author_id join categories c on c.id=art.category_id
where a.display_name='Dr. Abeer Alshammari' and c.key='hub_cybersecurity_governance'
  and exists (select 1 from article_translations t where t.article_id=art.id and t.locale='en' and t.slug='cybersecurity-governance-framework-explained')
  and not exists (select 1 from article_translations t4 where t4.article_id=art.id and t4.locale='ar');

-- ---------------------------------------------------------------------
-- B2. Risk Appetite vs Risk Tolerance (pillar_grc_governance)
-- ---------------------------------------------------------------------
insert into articles (id, author_id, category_id, status, schema_type, difficulty, audience, reviewed_at, published_at)
select gen_random_uuid(), a.id, c.id, 'published', 'Article', 'beginner', array['professionals','executives'], now(), now()
from authors a, categories c
where a.display_name='Dr. Abeer Alshammari' and c.key='pillar_grc_governance'
  and not exists (select 1 from article_translations t where t.locale='en' and t.slug='risk-appetite-vs-risk-tolerance');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'en', 'Risk Appetite vs. Risk Tolerance', 'risk-appetite-vs-risk-tolerance',
  'Risk appetite is how much risk you choose to pursue. Risk tolerance is how much variation around that you can absorb before it becomes a problem. Confusing the two produces vague risk statements.',
  $b9en$
<p>Risk appetite is a strategic statement: how much risk the organization is willing to accept in pursuit of its objectives. Risk tolerance is the practical boundary: the acceptable range of variation around that appetite for a specific risk, expressed in terms you can actually measure against.</p>
<h2>Side by side</h2>
<table class="content-comparison-table">
  <thead><tr><th></th><th>Risk appetite</th><th>Risk tolerance</th></tr></thead>
  <tbody>
    <tr><td>Level</td><td>Strategic, board-level</td><td>Operational, measurable</td></tr>
    <tr><td>Example statement</td><td>"We accept moderate risk to enable faster digital transformation"</td><td>"System downtime must not exceed 4 hours per quarter"</td></tr>
    <tr><td>Who sets it</td><td>Board / executive leadership</td><td>Risk owners, informed by appetite</td></tr>
    <tr><td>How it's used</td><td>Frames which risks are worth taking</td><td>Triggers action when a specific metric is breached</td></tr>
  </tbody>
</table>
<p>A common failure mode: an organization states a risk appetite ("we are risk-averse on customer data") but never translates it into a measurable tolerance (a specific breach-notification SLA, a maximum acceptable number of unpatched critical vulnerabilities). Without that translation, the appetite statement cannot actually be checked against real operations.</p>
<h2>Key takeaways</h2>
<ul class="content-checklist">
  <li>Appetite is the strategic "how much risk are we willing to take"; tolerance is the operational "how far can this specific metric drift."</li>
  <li>Every appetite statement needs at least one measurable tolerance underneath it, or it's just a slogan.</li>
  <li>Use this pairing to build your cyber risk register's thresholds, not just its risk list.</li>
</ul>
$b9en$,
  'Risk Appetite vs. Risk Tolerance | CyberAbeer',
  'The practical difference between risk appetite and risk tolerance, with a side-by-side comparison and real examples.', 3
from articles art join authors a on a.id=art.author_id join categories c on c.id=art.category_id
where a.display_name='Dr. Abeer Alshammari' and c.key='pillar_grc_governance'
  and not exists (select 1 from article_translations t where t.article_id=art.id and t.locale='en' and t.slug='risk-appetite-vs-risk-tolerance')
  and not exists (select 1 from article_translations t3 where t3.article_id=art.id and t3.locale='en');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'ar', 'شهية المخاطرة مقابل تحمل المخاطرة', 'شهية-المخاطرة-مقابل-تحمل-المخاطرة',
  'شهية المخاطرة هي مقدار المخاطرة التي تختار السعي إليها. تحمل المخاطرة هو مقدار التذبذب حولها الذي يمكنك استيعابه قبل أن يصبح مشكلة. الخلط بينهما ينتج بيانات مخاطر غامضة.',
  $b9ar$
<p>شهية المخاطرة بيان استراتيجي: مقدار المخاطرة التي تقبل المؤسسة تحملها سعياً لتحقيق أهدافها. أما تحمل المخاطرة فهو الحد العملي: نطاق التذبذب المقبول حول تلك الشهية لمخاطرة محددة، معبَّراً عنه بمقاييس يمكنك فعلياً القياس عليها.</p>
<h2>مقارنة جنباً إلى جنب</h2>
<table class="content-comparison-table">
  <thead><tr><th></th><th>شهية المخاطرة</th><th>تحمل المخاطرة</th></tr></thead>
  <tbody>
    <tr><td>المستوى</td><td>استراتيجي، على مستوى المجلس</td><td>تشغيلي، قابل للقياس</td></tr>
    <tr><td>مثال بيان</td><td>"نقبل مخاطرة معتدلة لتمكين تحول رقمي أسرع"</td><td>"يجب ألا يتجاوز توقف الأنظمة 4 ساعات كل ربع سنة"</td></tr>
    <tr><td>من يضعها</td><td>مجلس الإدارة / القيادة التنفيذية</td><td>مالكو المخاطر، بالاسترشاد بالشهية</td></tr>
    <tr><td>كيف تُستخدم</td><td>تؤطر أي المخاطر يستحق تحملها</td><td>تُفعِّل إجراءً عند تجاوز مقياس محدد</td></tr>
  </tbody>
</table>
<p>نمط فشل شائع: تعلن مؤسسة شهية مخاطرة ("نتجنب المخاطرة في بيانات العملاء") لكن لا تترجمها أبداً إلى تحمل قابل للقياس (اتفاقية مستوى خدمة محددة للإبلاغ عن الاختراق، حد أقصى مقبول لعدد الثغرات الحرجة غير المرقّعة). دون هذه الترجمة، لا يمكن فعلياً التحقق من بيان الشهية مقابل العمليات الواقعية.</p>
<h2>أهم النقاط</h2>
<ul class="content-checklist">
  <li>الشهية هي "كم مخاطرة نقبل تحملها" الاستراتيجي؛ والتحمل هو "كم يمكن لهذا المقياس المحدد أن ينحرف" التشغيلي.</li>
  <li>يحتاج كل بيان شهية إلى تحمل قابل للقياس واحد على الأقل تحته، وإلا فهو شعار فقط.</li>
  <li>استخدم هذا الاقتران لبناء عتبات سجل المخاطر السيبرانية لديك، لا قائمة المخاطر فقط.</li>
</ul>
$b9ar$,
  'شهية المخاطرة مقابل تحمل المخاطرة | CyberAbeer',
  'الفرق العملي بين شهية المخاطرة وتحمل المخاطرة، مع مقارنة جنباً إلى جنب وأمثلة واقعية.', 3
from articles art join authors a on a.id=art.author_id join categories c on c.id=art.category_id
where a.display_name='Dr. Abeer Alshammari' and c.key='pillar_grc_governance'
  and exists (select 1 from article_translations t where t.article_id=art.id and t.locale='en' and t.slug='risk-appetite-vs-risk-tolerance')
  and not exists (select 1 from article_translations t4 where t4.article_id=art.id and t4.locale='ar');

-- ---------------------------------------------------------------------
-- B3. How to Build a Cyber Risk Register
-- ---------------------------------------------------------------------
insert into articles (id, author_id, category_id, status, schema_type, difficulty, audience, reviewed_at, published_at)
select gen_random_uuid(), a.id, c.id, 'published', 'Article', 'intermediate', array['professionals','ciso'], now(), now()
from authors a, categories c
where a.display_name='Dr. Abeer Alshammari' and c.key='pillar_grc_governance'
  and not exists (select 1 from article_translations t where t.locale='en' and t.slug='how-to-build-a-cyber-risk-register');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'en', 'How to Build a Cyber Risk Register', 'how-to-build-a-cyber-risk-register',
  'A cyber risk register is only useful if every entry has an owner, a likelihood, an impact, and a treatment decision -- not just a description of what could go wrong.',
  $b10en$
<p>A cyber risk register is a structured, living record of identified risks, not a one-time list assembled for an audit. Its value comes from what's attached to each risk, not from how many risks it lists.</p>
<h2>What each entry needs</h2>
<ul class="content-checklist">
  <li>A clear risk statement (cause, event, and consequence -- not just a threat name).</li>
  <li>A named risk owner, accountable for tracking and treatment, not just recording it.</li>
  <li>Likelihood and impact ratings, scored consistently against the same scale every time.</li>
  <li>A treatment decision: accept, mitigate, transfer, or avoid, with a rationale.</li>
  <li>A review date, so risks don't sit unreviewed after conditions change.</li>
</ul>
<h2>A common mistake</h2>
<p>Registers that list only the risk description and a color-coded severity look complete but aren't actionable -- nobody can act on a red cell without knowing who owns it and what "mitigate" specifically means for that entry. The register should be reviewable by someone outside the team that built it and still make sense.</p>
<h2>Key takeaways</h2>
<ul class="content-checklist">
  <li>Every entry needs an owner and a treatment decision, not just a severity score.</li>
  <li>Score likelihood and impact on a consistent scale so risks are comparable across the register.</li>
  <li>Review on a schedule -- a stale register is functionally the same as no register.</li>
</ul>
$b10en$,
  'How to Build a Cyber Risk Register | CyberAbeer',
  'A practical structure for a cyber risk register: what each entry needs to actually be actionable, not just documented.', 3
from articles art join authors a on a.id=art.author_id join categories c on c.id=art.category_id
where a.display_name='Dr. Abeer Alshammari' and c.key='pillar_grc_governance'
  and not exists (select 1 from article_translations t where t.article_id=art.id and t.locale='en' and t.slug='how-to-build-a-cyber-risk-register')
  and not exists (select 1 from article_translations t3 where t3.article_id=art.id and t3.locale='en');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'ar', 'كيفية بناء سجل المخاطر السيبرانية', 'كيفية-بناء-سجل-المخاطر-السيبرانية',
  'سجل المخاطر السيبرانية مفيد فقط إذا كان لكل إدخال فيه مالك، واحتمال، وأثر، وقرار معالجة — لا مجرد وصف لما قد يحدث خطأً.',
  $b10ar$
<p>سجل المخاطر السيبرانية سجل حي ومنظم للمخاطر المحددة، لا قائمة تُجمع مرة واحدة لأغراض التدقيق. تأتي قيمته مما يُرفق بكل مخاطرة، لا من عدد المخاطر المدرجة فيه.</p>
<h2>ما يحتاجه كل إدخال</h2>
<ul class="content-checklist">
  <li>بيان مخاطرة واضح (السبب، والحدث، والعاقبة — لا مجرد اسم تهديد).</li>
  <li>مالك مخاطرة محدد، مسؤول عن التتبع والمعالجة، لا تسجيلها فقط.</li>
  <li>تقييمات احتمال وأثر، مُقيَّمة باستمرار وفق المقياس نفسه في كل مرة.</li>
  <li>قرار معالجة: قبول، أو تخفيف، أو نقل، أو تجنب، مع تبرير.</li>
  <li>تاريخ مراجعة، كي لا تبقى المخاطر دون مراجعة بعد تغيّر الظروف.</li>
</ul>
<h2>خطأ شائع</h2>
<p>السجلات التي تدرج وصف المخاطرة فقط مع شدة مرمّزة بالألوان تبدو مكتملة لكنها غير قابلة للتنفيذ — لا يستطيع أحد التصرف حيال خلية حمراء دون معرفة من يملكها وماذا تعني "التخفيف" تحديداً لذلك الإدخال. ينبغي أن يكون السجل قابلاً للمراجعة من قِبل شخص خارج الفريق الذي بناه ومع ذلك يكون مفهوماً.</p>
<h2>أهم النقاط</h2>
<ul class="content-checklist">
  <li>يحتاج كل إدخال مالكاً وقرار معالجة، لا درجة شدة فقط.</li>
  <li>قيّم الاحتمال والأثر وفق مقياس ثابت كي تكون المخاطر قابلة للمقارنة عبر السجل.</li>
  <li>راجع دورياً — السجل القديم يعادل عملياً عدم وجود سجل.</li>
</ul>
$b10ar$,
  'كيفية بناء سجل المخاطر السيبرانية | CyberAbeer',
  'بنية عملية لسجل المخاطر السيبرانية: ما الذي يحتاجه كل إدخال ليكون قابلاً للتنفيذ فعلياً، لا موثّقاً فقط.', 3
from articles art join authors a on a.id=art.author_id join categories c on c.id=art.category_id
where a.display_name='Dr. Abeer Alshammari' and c.key='pillar_grc_governance'
  and exists (select 1 from article_translations t where t.article_id=art.id and t.locale='en' and t.slug='how-to-build-a-cyber-risk-register')
  and not exists (select 1 from article_translations t4 where t4.article_id=art.id and t4.locale='ar');

-- ---------------------------------------------------------------------
-- B4. ISO 27001 Explained for Beginners
-- ---------------------------------------------------------------------
insert into articles (id, author_id, category_id, status, schema_type, difficulty, audience, reviewed_at, published_at)
select gen_random_uuid(), a.id, c.id, 'published', 'Article', 'beginner', array['students','professionals','general'], now(), now()
from authors a, categories c
where a.display_name='Dr. Abeer Alshammari' and c.key='pillar_grc_governance'
  and not exists (select 1 from article_translations t where t.locale='en' and t.slug='iso-27001-explained-for-beginners');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'en', 'ISO 27001 Explained for Beginners', 'iso-27001-explained-for-beginners',
  'ISO/IEC 27001 certifies your information security management system, not a fixed checklist of technical controls. Here is what that actually means.',
  $b11en$
<p>ISO/IEC 27001 is the international standard for an information security management system (ISMS): a structured, ongoing process for identifying information security risks and treating them, not a one-time checklist of technical controls. Certification confirms the management system works, not that every possible control is switched on.</p>
<h2>The core pieces, in plain terms</h2>
<ul class="content-checklist">
  <li><strong>Risk assessment</strong> -- identify what could go wrong and how severe it would be.</li>
  <li><strong>Annex A controls</strong> -- a reference list of 93 controls across People, Organizational, Technological, and Physical categories, used to select relevant safeguards, not a mandatory checklist to implement in full.</li>
  <li><strong>Statement of Applicability (SoA)</strong> -- the required document justifying which Annex A controls apply and which don't, and why.</li>
  <li><strong>Continual improvement</strong> -- the ISMS is audited and updated on a cycle, not certified once and left alone.</li>
</ul>
<p>A common misconception is that ISO 27001 requires implementing all 93 Annex A controls. It does not -- what it requires is that every inclusion or exclusion be justified against your own risk assessment, documented in the Statement of Applicability.</p>
<h2>Key takeaways</h2>
<ul class="content-checklist">
  <li>ISO 27001 certifies a management system and its risk-based decisions, not a fixed control checklist.</li>
  <li>Annex A's 93 controls are a reference menu; the Statement of Applicability records what you chose and why.</li>
  <li>See "What Is a Statement of Applicability?" for how to actually write one.</li>
</ul>
$b11en$,
  'ISO 27001 Explained for Beginners | CyberAbeer',
  'A plain-language introduction to ISO/IEC 27001: what it actually certifies, Annex A controls, and the Statement of Applicability.', 4
from articles art join authors a on a.id=art.author_id join categories c on c.id=art.category_id
where a.display_name='Dr. Abeer Alshammari' and c.key='pillar_grc_governance'
  and not exists (select 1 from article_translations t where t.article_id=art.id and t.locale='en' and t.slug='iso-27001-explained-for-beginners')
  and not exists (select 1 from article_translations t3 where t3.article_id=art.id and t3.locale='en');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'ar', 'شرح ISO 27001 للمبتدئين', 'شرح-iso-27001-للمبتدئين',
  'يشهد معيار ISO/IEC 27001 على نظام إدارة أمن المعلومات لديك، لا على قائمة ثابتة من الضوابط التقنية. إليك ما يعنيه هذا فعلياً.',
  $b11ar$
<p>ISO/IEC 27001 هو المعيار الدولي لنظام إدارة أمن المعلومات (ISMS): عملية منظمة ومستمرة لتحديد مخاطر أمن المعلومات ومعالجتها، لا قائمة مراجعة تُنفَّذ مرة واحدة من الضوابط التقنية. تؤكد الشهادة أن نظام الإدارة يعمل، لا أن كل ضابط ممكن مُفعَّل.</p>
<h2>العناصر الجوهرية بلغة مبسطة</h2>
<ul class="content-checklist">
  <li><strong>تقييم المخاطر</strong> — تحديد ما قد يحدث خطأً ومدى شدته.</li>
  <li><strong>ضوابط الملحق أ</strong> — قائمة مرجعية من 93 ضابطاً موزعة على فئات الأفراد والتنظيم والتقنية والمادية، تُستخدم لاختيار الضمانات المناسبة، لا كقائمة إلزامية للتنفيذ الكامل.</li>
  <li><strong>بيان قابلية التطبيق (SoA)</strong> — الوثيقة المطلوبة التي تبرر أي ضوابط الملحق أ تنطبق وأيها لا تنطبق، ولماذا.</li>
  <li><strong>التحسين المستمر</strong> — يُدقَّق نظام إدارة أمن المعلومات ويُحدَّث دورياً، لا أن يُعتمد مرة ويُترك.</li>
</ul>
<p>من المفاهيم الخاطئة الشائعة أن ISO 27001 يشترط تنفيذ جميع ضوابط الملحق أ الـ93. هذا غير صحيح — ما يشترطه هو تبرير كل تضمين أو استبعاد استناداً إلى تقييم المخاطر الخاص بك، موثّقاً في بيان قابلية التطبيق.</p>
<h2>أهم النقاط</h2>
<ul class="content-checklist">
  <li>يشهد ISO 27001 على نظام إدارة وقراراته المبنية على المخاطر، لا على قائمة ضوابط ثابتة.</li>
  <li>ضوابط الملحق أ الـ93 قائمة مرجعية؛ ويوثّق بيان قابلية التطبيق ما اخترته ولماذا.</li>
  <li>راجع مقال "ما هو بيان قابلية التطبيق؟" لمعرفة كيفية كتابته فعلياً.</li>
</ul>
$b11ar$,
  'شرح ISO 27001 للمبتدئين | CyberAbeer',
  'مقدمة بلغة مبسطة عن ISO/IEC 27001: ما الذي يشهد عليه فعلياً، وضوابط الملحق أ، وبيان قابلية التطبيق.', 4
from articles art join authors a on a.id=art.author_id join categories c on c.id=art.category_id
where a.display_name='Dr. Abeer Alshammari' and c.key='pillar_grc_governance'
  and exists (select 1 from article_translations t where t.article_id=art.id and t.locale='en' and t.slug='iso-27001-explained-for-beginners')
  and not exists (select 1 from article_translations t4 where t4.article_id=art.id and t4.locale='ar');

-- ---------------------------------------------------------------------
-- B5. What Is a Statement of Applicability?
-- ---------------------------------------------------------------------
insert into articles (id, author_id, category_id, status, schema_type, difficulty, audience, reviewed_at, published_at)
select gen_random_uuid(), a.id, c.id, 'published', 'Article', 'intermediate', array['professionals'], now(), now()
from authors a, categories c
where a.display_name='Dr. Abeer Alshammari' and c.key='pillar_grc_governance'
  and not exists (select 1 from article_translations t where t.locale='en' and t.slug='what-is-a-statement-of-applicability');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'en', 'What Is a Statement of Applicability?', 'what-is-a-statement-of-applicability',
  'The Statement of Applicability is the mandatory ISO 27001 document listing every Annex A control, whether it applies, and why -- the single artifact auditors check first.',
  $b12en$
<p>The Statement of Applicability (SoA) is a mandatory document under ISO/IEC 27001:2022 clause 6.1.3(d). It lists all 93 Annex A controls, states whether each is applicable to your organization, and justifies the decision -- and for applicable controls, describes how they are implemented.</p>
<h2>What a defensible SoA entry looks like</h2>
<table class="content-decision-table">
  <thead><tr><th>Field</th><th>What it must show</th></tr></thead>
  <tbody>
    <tr><td>Control reference</td><td>The specific Annex A control number and name</td></tr>
    <tr><td>Applicable? (yes/no)</td><td>A clear decision, not left blank</td></tr>
    <tr><td>Justification</td><td>Tied back to your actual risk assessment, not a generic statement</td></tr>
    <tr><td>Implementation status</td><td>How the control is implemented, if applicable</td></tr>
  </tbody>
</table>
<p>The most common audit finding on an SoA isn't a missing control -- it's a justification that doesn't trace back to anything in the risk assessment. "Not applicable" is a legitimate answer for plenty of controls; an unsupported "not applicable" is not.</p>
<h2>Key takeaways</h2>
<ul class="content-checklist">
  <li>The SoA covers all 93 Annex A controls -- applicable or not, every one needs a documented decision.</li>
  <li>Every justification should trace back to your risk assessment, not stand alone.</li>
  <li>Treat it as a living document, updated whenever your risk assessment or control implementation changes.</li>
</ul>
$b12en$,
  'What Is a Statement of Applicability? | CyberAbeer',
  'What the ISO 27001 Statement of Applicability actually requires, and what a defensible entry looks like.', 3
from articles art join authors a on a.id=art.author_id join categories c on c.id=art.category_id
where a.display_name='Dr. Abeer Alshammari' and c.key='pillar_grc_governance'
  and not exists (select 1 from article_translations t where t.article_id=art.id and t.locale='en' and t.slug='what-is-a-statement-of-applicability')
  and not exists (select 1 from article_translations t3 where t3.article_id=art.id and t3.locale='en');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'ar', 'ما هو بيان قابلية التطبيق؟', 'ما-هو-بيان-قابلية-التطبيق',
  'بيان قابلية التطبيق هو الوثيقة الإلزامية في ISO 27001 التي تدرج كل ضوابط الملحق أ، وما إذا كانت تنطبق، ولماذا — الوثيقة الأولى التي يراجعها المدققون.',
  $b12ar$
<p>بيان قابلية التطبيق (SoA) وثيقة إلزامية بموجب البند 6.1.3(د) من ISO/IEC 27001:2022. يدرج جميع ضوابط الملحق أ الـ93، ويوضح ما إذا كان كل ضابط ينطبق على مؤسستك، ويبرر القرار — وللضوابط المنطبقة، يصف كيفية تنفيذها.</p>
<h2>كيف يبدو إدخال مدافَع عنه في بيان قابلية التطبيق</h2>
<table class="content-decision-table">
  <thead><tr><th>الحقل</th><th>ما يجب أن يُظهره</th></tr></thead>
  <tbody>
    <tr><td>مرجع الضابط</td><td>رقم واسم ضابط الملحق أ المحدد</td></tr>
    <tr><td>ينطبق؟ (نعم/لا)</td><td>قرار واضح، لا فارغاً</td></tr>
    <tr><td>التبرير</td><td>مرتبط فعلياً بتقييم المخاطر لديك، لا بيان عام</td></tr>
    <tr><td>حالة التنفيذ</td><td>كيفية تنفيذ الضابط، إن كان منطبقاً</td></tr>
  </tbody>
</table>
<p>أكثر ملاحظات التدقيق شيوعاً على بيان قابلية التطبيق ليست ضابطاً مفقوداً — بل تبريراً لا يعود إلى أي شيء في تقييم المخاطر. "لا ينطبق" إجابة مشروعة للعديد من الضوابط؛ أما "لا ينطبق" غير المدعوم فليس كذلك.</p>
<h2>أهم النقاط</h2>
<ul class="content-checklist">
  <li>يغطي بيان قابلية التطبيق جميع ضوابط الملحق أ الـ93 — سواء انطبقت أم لا، يحتاج كل ضابط قراراً موثقاً.</li>
  <li>ينبغي أن يعود كل تبرير إلى تقييم المخاطر لديك، لا أن يقف وحده.</li>
  <li>عامله كوثيقة حية، تُحدَّث كلما تغيّر تقييم المخاطر أو تنفيذ الضوابط.</li>
</ul>
$b12ar$,
  'ما هو بيان قابلية التطبيق؟ | CyberAbeer',
  'ما الذي يشترطه بيان قابلية التطبيق في ISO 27001 فعلياً، وكيف يبدو الإدخال المدافَع عنه.', 3
from articles art join authors a on a.id=art.author_id join categories c on c.id=art.category_id
where a.display_name='Dr. Abeer Alshammari' and c.key='pillar_grc_governance'
  and exists (select 1 from article_translations t where t.article_id=art.id and t.locale='en' and t.slug='what-is-a-statement-of-applicability')
  and not exists (select 1 from article_translations t4 where t4.article_id=art.id and t4.locale='ar');

-- ---------------------------------------------------------------------
-- B6. What Is Residual Cyber Risk?
-- ---------------------------------------------------------------------
insert into articles (id, author_id, category_id, status, schema_type, difficulty, audience, reviewed_at, published_at)
select gen_random_uuid(), a.id, c.id, 'published', 'Article', 'beginner', array['professionals','executives'], now(), now()
from authors a, categories c
where a.display_name='Dr. Abeer Alshammari' and c.key='pillar_grc_governance'
  and not exists (select 1 from article_translations t where t.locale='en' and t.slug='what-is-residual-cyber-risk');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'en', 'What Is Residual Cyber Risk?', 'what-is-residual-cyber-risk',
  'Residual risk is what remains after controls are applied. It is never zero, and pretending otherwise is how organizations get surprised.',
  $b13en$
<p>Residual risk is the risk that remains after you have applied controls to the original ("inherent") risk. No control set reduces risk to zero -- the point of a risk assessment is to make the residual level a deliberate, accepted decision, not an unexamined leftover.</p>
<h2>Inherent risk, controls, residual risk</h2>
<table class="content-comparison-table">
  <thead><tr><th>Concept</th><th>What it means</th></tr></thead>
  <tbody>
    <tr><td>Inherent risk</td><td>The risk level before any controls are applied</td></tr>
    <tr><td>Controls</td><td>What you put in place to reduce likelihood or impact</td></tr>
    <tr><td>Residual risk</td><td>What remains after controls -- the level you actually live with</td></tr>
  </tbody>
</table>
<p>The decision that matters is whether the residual risk sits within your stated risk appetite and tolerance. If it doesn't, the choice is to add more controls, transfer the risk (insurance, contractual terms), or formally accept it at the appropriate authority level -- not to leave it undocumented and hope it doesn't surface.</p>
<h2>Key takeaways</h2>
<ul class="content-checklist">
  <li>Residual risk is never zero -- treat "fully mitigated" claims with skepticism.</li>
  <li>Every residual risk should be explicitly compared against your stated risk appetite.</li>
  <li>Accepting residual risk should be a documented decision at the right authority level, not a default.</li>
</ul>
$b13en$,
  'What Is Residual Cyber Risk? | CyberAbeer',
  'Residual risk explained: what remains after controls, and why it should always be a deliberate, documented decision.', 3
from articles art join authors a on a.id=art.author_id join categories c on c.id=art.category_id
where a.display_name='Dr. Abeer Alshammari' and c.key='pillar_grc_governance'
  and not exists (select 1 from article_translations t where t.article_id=art.id and t.locale='en' and t.slug='what-is-residual-cyber-risk')
  and not exists (select 1 from article_translations t3 where t3.article_id=art.id and t3.locale='en');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'ar', 'ما هي المخاطرة السيبرانية المتبقية؟', 'ما-هي-المخاطرة-السيبرانية-المتبقية',
  'المخاطرة المتبقية هي ما يبقى بعد تطبيق الضوابط. لا تصل أبداً إلى الصفر، وادعاء عكس ذلك هو كيف تتفاجأ المؤسسات.',
  $b13ar$
<p>المخاطرة المتبقية هي المخاطرة الباقية بعد تطبيق الضوابط على المخاطرة الأصلية ("الكامنة"). لا تُخفِّض أي مجموعة ضوابط المخاطرة إلى الصفر — الهدف من تقييم المخاطر هو جعل المستوى المتبقي قراراً واعياً ومقبولاً، لا بقية لم تُفحص.</p>
<h2>المخاطرة الكامنة، والضوابط، والمخاطرة المتبقية</h2>
<table class="content-comparison-table">
  <thead><tr><th>المفهوم</th><th>ماذا يعني</th></tr></thead>
  <tbody>
    <tr><td>المخاطرة الكامنة</td><td>مستوى المخاطرة قبل تطبيق أي ضوابط</td></tr>
    <tr><td>الضوابط</td><td>ما تضعه لتقليل الاحتمال أو الأثر</td></tr>
    <tr><td>المخاطرة المتبقية</td><td>ما يبقى بعد الضوابط — المستوى الذي تتعايش معه فعلياً</td></tr>
  </tbody>
</table>
<p>القرار المهم هو ما إذا كانت المخاطرة المتبقية تقع ضمن شهية المخاطرة وتحملها المعلنين. إن لم تكن كذلك، فالخيار هو إضافة ضوابط أخرى، أو نقل المخاطرة (تأمين، شروط تعاقدية)، أو قبولها رسمياً على مستوى السلطة المناسب — لا تركها دون توثيق على أمل ألا تظهر.</p>
<h2>أهم النقاط</h2>
<ul class="content-checklist">
  <li>المخاطرة المتبقية لا تصل أبداً إلى الصفر — تعامل مع ادعاءات "التخفيف الكامل" بحذر.</li>
  <li>ينبغي مقارنة كل مخاطرة متبقية صراحة بشهية المخاطرة المعلنة.</li>
  <li>ينبغي أن يكون قبول المخاطرة المتبقية قراراً موثقاً على مستوى السلطة الصحيح، لا افتراضاً.</li>
</ul>
$b13ar$,
  'ما هي المخاطرة السيبرانية المتبقية؟ | CyberAbeer',
  'شرح المخاطرة المتبقية: ما يبقى بعد الضوابط، ولماذا ينبغي أن تكون دائماً قراراً واعياً وموثقاً.', 3
from articles art join authors a on a.id=art.author_id join categories c on c.id=art.category_id
where a.display_name='Dr. Abeer Alshammari' and c.key='pillar_grc_governance'
  and exists (select 1 from article_translations t where t.article_id=art.id and t.locale='en' and t.slug='what-is-residual-cyber-risk')
  and not exists (select 1 from article_translations t4 where t4.article_id=art.id and t4.locale='ar');

-- =====================================================================
-- SECTION C: DATA SECURITY (hub_data_classification)
-- =====================================================================

-- ---------------------------------------------------------------------
-- C1. Data Classification Explained (definitional companion to the
-- existing "Data Classification 101: A Practical Framework" -- distinct
-- angle: what the levels mean, not how to run the program; cross-linked)
-- ---------------------------------------------------------------------
insert into articles (id, author_id, category_id, status, schema_type, difficulty, audience, reviewed_at, published_at)
select gen_random_uuid(), a.id, c.id, 'published', 'Article', 'beginner', array['students','professionals','general'], now(), now()
from authors a, categories c
where a.display_name='Dr. Abeer Alshammari' and c.key='hub_data_classification'
  and not exists (select 1 from article_translations t where t.locale='en' and t.slug='data-classification-explained');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'en', 'Data Classification Explained', 'data-classification-explained',
  'Data classification means sorting information into sensitivity tiers so that protection, access, and handling rules can scale with how much damage exposure would actually cause.',
  $c1en$
<p>Data classification is the practice of sorting information into tiers based on how much harm its exposure, loss, or misuse would cause -- so that security controls scale with actual sensitivity instead of applying the same rules to a public price list and a customer database.</p>
<h2>A common tier structure</h2>
<table class="content-comparison-table">
  <thead><tr><th>Tier</th><th>Example</th><th>Typical handling</th></tr></thead>
  <tbody>
    <tr><td>Public</td><td>Marketing content, published prices</td><td>No special controls needed</td></tr>
    <tr><td>Internal</td><td>Internal policies, org charts</td><td>Not for external sharing; basic access control</td></tr>
    <tr><td>Confidential</td><td>Contracts, financial forecasts</td><td>Restricted access, encryption in transit</td></tr>
    <tr><td>Highly sensitive</td><td>Customer PII, credentials, source code</td><td>Strict access control, encryption at rest and in transit, logging</td></tr>
  </tbody>
</table>
<p>The tiers themselves matter less than the discipline of applying them consistently: every dataset should have an assigned tier, a named owner, and handling rules that follow automatically from the tier, rather than being decided case by case.</p>
<h2>Key takeaways</h2>
<ul class="content-checklist">
  <li>Classification exists so protection matches actual sensitivity, not so every dataset gets the same treatment.</li>
  <li>An unclassified dataset defaults to the strictest handling until proven otherwise.</li>
  <li>See "Data Classification 101: A Practical Framework" for how to actually run a classification program end to end.</li>
</ul>
$c1en$,
  'Data Classification Explained | CyberAbeer',
  'What data classification means and a practical tier structure, from public to highly sensitive.', 3
from articles art join authors a on a.id=art.author_id join categories c on c.id=art.category_id
where a.display_name='Dr. Abeer Alshammari' and c.key='hub_data_classification'
  and not exists (select 1 from article_translations t where t.article_id=art.id and t.locale='en' and t.slug='data-classification-explained')
  and not exists (select 1 from article_translations t3 where t3.article_id=art.id and t3.locale='en');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'ar', 'شرح تصنيف البيانات', 'شرح-تصنيف-البيانات',
  'تصنيف البيانات يعني فرز المعلومات إلى مستويات حساسية بحيث تتناسب قواعد الحماية والوصول والتعامل مع حجم الضرر الذي قد يسببه تسريبها فعلياً.',
  $c1ar$
<p>تصنيف البيانات هو ممارسة فرز المعلومات إلى مستويات بناءً على حجم الضرر الذي قد يسببه تسريبها أو فقدانها أو إساءة استخدامها — بحيث تتناسب الضوابط الأمنية مع الحساسية الفعلية بدلاً من تطبيق القواعد نفسها على قائمة أسعار عامة وقاعدة بيانات عملاء.</p>
<h2>بنية مستويات شائعة</h2>
<table class="content-comparison-table">
  <thead><tr><th>المستوى</th><th>مثال</th><th>التعامل المعتاد</th></tr></thead>
  <tbody>
    <tr><td>عام</td><td>محتوى تسويقي، أسعار منشورة</td><td>لا حاجة لضوابط خاصة</td></tr>
    <tr><td>داخلي</td><td>سياسات داخلية، هياكل تنظيمية</td><td>غير مخصص للمشاركة الخارجية؛ ضبط وصول أساسي</td></tr>
    <tr><td>سري</td><td>عقود، توقعات مالية</td><td>وصول مقيّد، تشفير أثناء النقل</td></tr>
    <tr><td>شديد الحساسية</td><td>بيانات تعريف العملاء، بيانات الاعتماد، الشيفرة المصدرية</td><td>ضبط وصول صارم، تشفير أثناء التخزين والنقل، تسجيل</td></tr>
  </tbody>
</table>
<p>المستويات نفسها أقل أهمية من انضباط تطبيقها باستمرار: ينبغي أن يكون لكل مجموعة بيانات مستوى محدد، ومالك محدد، وقواعد تعامل تتبع المستوى تلقائياً، بدلاً من أن تُقرَّر حالة بحالة.</p>
<h2>أهم النقاط</h2>
<ul class="content-checklist">
  <li>التصنيف موجود كي تتناسب الحماية مع الحساسية الفعلية، لا كي تحصل كل مجموعة بيانات على المعاملة نفسها.</li>
  <li>تفترض مجموعة البيانات غير المصنّفة أشد مستويات التعامل حتى يثبت العكس.</li>
  <li>راجع مقال "تصنيف البيانات 101: إطار عملي" لمعرفة كيفية تشغيل برنامج تصنيف كامل فعلياً.</li>
</ul>
$c1ar$,
  'شرح تصنيف البيانات | CyberAbeer',
  'ما الذي يعنيه تصنيف البيانات وبنية مستويات عملية، من العام إلى شديد الحساسية.', 3
from articles art join authors a on a.id=art.author_id join categories c on c.id=art.category_id
where a.display_name='Dr. Abeer Alshammari' and c.key='hub_data_classification'
  and exists (select 1 from article_translations t where t.article_id=art.id and t.locale='en' and t.slug='data-classification-explained')
  and not exists (select 1 from article_translations t4 where t4.article_id=art.id and t4.locale='ar');

-- ---------------------------------------------------------------------
-- C2. DLP Explained
-- ---------------------------------------------------------------------
insert into articles (id, author_id, category_id, status, schema_type, difficulty, audience, reviewed_at, published_at)
select gen_random_uuid(), a.id, c.id, 'published', 'Article', 'beginner', array['professionals','general'], now(), now()
from authors a, categories c
where a.display_name='Dr. Abeer Alshammari' and c.key='hub_data_classification'
  and not exists (select 1 from article_translations t where t.locale='en' and t.slug='dlp-explained');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'en', 'DLP Explained', 'dlp-explained',
  'Data Loss Prevention (DLP) is a set of controls that detect and block sensitive data from leaving an organization improperly -- and it only works as well as your classification does.',
  $c2en$
<p>Data Loss Prevention (DLP) refers to tools and controls that detect sensitive data in motion, at rest, or in use, and block or flag improper attempts to move it outside approved boundaries -- an email with a customer database attached, a file upload to an unapproved cloud service, a USB copy of source code.</p>
<h2>What DLP depends on</h2>
<ul class="content-checklist">
  <li>Accurate data classification -- DLP rules are only as good as knowing what's sensitive in the first place.</li>
  <li>Defined boundaries -- which destinations, channels, and recipients are approved.</li>
  <li>A response process -- a blocked transfer needs a defined next step, not just a log entry nobody reviews.</li>
  <li>Tuning over time -- overly strict rules get bypassed by frustrated employees; overly loose rules miss real exfiltration.</li>
</ul>
<p>DLP is a control that enforces classification decisions, not a substitute for making them. An organization that deploys DLP without first classifying its data ends up writing rules by guesswork, which is exactly the gap "How AI Changes Data Classification" and "Data Classification Explained" address.</p>
<h2>Key takeaways</h2>
<ul class="content-checklist">
  <li>DLP enforces classification; it does not replace the need to classify data first.</li>
  <li>Every DLP block needs a defined response process, not just a silent log entry.</li>
  <li>Expect to tune rules regularly -- both false positives and missed detections carry real cost.</li>
</ul>
$c2en$,
  'DLP Explained | CyberAbeer',
  'What Data Loss Prevention actually does, what it depends on, and why it only works as well as your classification.', 3
from articles art join authors a on a.id=art.author_id join categories c on c.id=art.category_id
where a.display_name='Dr. Abeer Alshammari' and c.key='hub_data_classification'
  and not exists (select 1 from article_translations t where t.article_id=art.id and t.locale='en' and t.slug='dlp-explained')
  and not exists (select 1 from article_translations t3 where t3.article_id=art.id and t3.locale='en');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'ar', 'شرح منع تسرب البيانات (DLP)', 'شرح-منع-تسرب-البيانات-dlp',
  'منع تسرب البيانات (DLP) مجموعة ضوابط تكتشف البيانات الحساسة وتمنع خروجها من المؤسسة بشكل غير سليم — ولا يعمل إلا بقدر جودة تصنيفك للبيانات.',
  $c2ar$
<p>يشير منع تسرب البيانات (DLP) إلى أدوات وضوابط تكتشف البيانات الحساسة أثناء الحركة أو التخزين أو الاستخدام، وتمنع أو تُنبّه على محاولات نقلها غير السليمة خارج الحدود المعتمدة — بريد إلكتروني مرفق به قاعدة بيانات عملاء، أو رفع ملف إلى خدمة سحابية غير معتمدة، أو نسخ شيفرة مصدرية على USB.</p>
<h2>على ماذا يعتمد DLP</h2>
<ul class="content-checklist">
  <li>تصنيف بيانات دقيق — قواعد DLP لا تكون أفضل من معرفة ما هو حساس أصلاً.</li>
  <li>حدود محددة — أي الوجهات والقنوات والمستلمين معتمدون.</li>
  <li>عملية استجابة — يحتاج النقل المحظور خطوة تالية محددة، لا مجرد إدخال سجل لا يراجعه أحد.</li>
  <li>ضبط مستمر — القواعد الصارمة جداً يتحايل عليها الموظفون المحبطون؛ والقواعد الفضفاضة جداً تفوت التسريب الفعلي.</li>
</ul>
<p>DLP ضابط يُنفّذ قرارات التصنيف، لا بديل عن اتخاذها. المؤسسة التي تنشر DLP دون تصنيف بياناتها أولاً تنتهي بكتابة قواعد بالتخمين، وهذه بالضبط الفجوة التي يعالجها مقالا "كيف يغيّر الذكاء الاصطناعي تصنيف البيانات" و"شرح تصنيف البيانات".</p>
<h2>أهم النقاط</h2>
<ul class="content-checklist">
  <li>ينفّذ DLP التصنيف؛ ولا يغني عن الحاجة لتصنيف البيانات أولاً.</li>
  <li>يحتاج كل حظر من DLP عملية استجابة محددة، لا مجرد إدخال سجل صامت.</li>
  <li>توقع ضبط القواعد بانتظام — كل من الإيجابيات الكاذبة وحالات التسريب الفائتة تحمل تكلفة حقيقية.</li>
</ul>
$c2ar$,
  'شرح منع تسرب البيانات (DLP) | CyberAbeer',
  'ما الذي يفعله منع تسرب البيانات فعلياً، وعلى ماذا يعتمد، ولماذا لا يعمل إلا بقدر جودة تصنيفك.', 3
from articles art join authors a on a.id=art.author_id join categories c on c.id=art.category_id
where a.display_name='Dr. Abeer Alshammari' and c.key='hub_data_classification'
  and exists (select 1 from article_translations t where t.article_id=art.id and t.locale='en' and t.slug='dlp-explained')
  and not exists (select 1 from article_translations t4 where t4.article_id=art.id and t4.locale='ar');

-- ---------------------------------------------------------------------
-- C3. Data Owners vs Data Custodians
-- ---------------------------------------------------------------------
insert into articles (id, author_id, category_id, status, schema_type, difficulty, audience, reviewed_at, published_at)
select gen_random_uuid(), a.id, c.id, 'published', 'Article', 'beginner', array['professionals'], now(), now()
from authors a, categories c
where a.display_name='Dr. Abeer Alshammari' and c.key='hub_data_classification'
  and not exists (select 1 from article_translations t where t.locale='en' and t.slug='data-owners-vs-data-custodians');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'en', 'Data Owners vs. Data Custodians', 'data-owners-vs-data-custodians',
  'A data owner decides who can access data and why. A data custodian implements that decision technically. Confusing the two roles is why access reviews stall.',
  $c3en$
<p>A data owner is accountable for a dataset's classification, access decisions, and business use -- typically a business role, not an IT one. A data custodian implements those decisions technically: provisioning access, applying encryption, maintaining backups. The owner decides who should have access and why; the custodian makes sure the system reflects that decision.</p>
<h2>Side by side</h2>
<table class="content-comparison-table">
  <thead><tr><th></th><th>Data owner</th><th>Data custodian</th></tr></thead>
  <tbody>
    <tr><td>Typical role</td><td>Business unit lead, department head</td><td>IT/security/database administrator</td></tr>
    <tr><td>Decides</td><td>Classification, who gets access, retention</td><td>How access is technically enforced</td></tr>
    <tr><td>Accountable for</td><td>Appropriate use and business risk</td><td>Technical implementation and safeguards</td></tr>
  </tbody>
</table>
<p>The most common failure is having no named owner at all, so access requests get approved by whichever custodian is easiest to reach -- which quietly turns a business decision into a technical default, with nobody actually accountable for whether the access made sense.</p>
<h2>Key takeaways</h2>
<ul class="content-checklist">
  <li>Owners decide; custodians implement -- both roles are needed, and they are not interchangeable.</li>
  <li>Every classified dataset should have a named owner who is not the same person as its custodian.</li>
  <li>Access reviews should be signed off by the owner, not rubber-stamped by the custodian.</li>
</ul>
$c3en$,
  'Data Owners vs. Data Custodians | CyberAbeer',
  'The difference between a data owner and a data custodian, and why missing a named owner breaks access reviews.', 3
from articles art join authors a on a.id=art.author_id join categories c on c.id=art.category_id
where a.display_name='Dr. Abeer Alshammari' and c.key='hub_data_classification'
  and not exists (select 1 from article_translations t where t.article_id=art.id and t.locale='en' and t.slug='data-owners-vs-data-custodians')
  and not exists (select 1 from article_translations t3 where t3.article_id=art.id and t3.locale='en');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'ar', 'مالكو البيانات مقابل أمناء البيانات', 'مالكو-البيانات-مقابل-امناء-البيانات',
  'مالك البيانات يقرر من يستطيع الوصول إليها ولماذا. أما أمين البيانات فينفّذ ذلك القرار تقنياً. الخلط بين الدورين هو سبب تعثر مراجعات الوصول.',
  $c3ar$
<p>مالك البيانات مسؤول عن تصنيف مجموعة البيانات وقرارات الوصول إليها واستخدامها في الأعمال — وهو عادة دور في جهة الأعمال لا في تقنية المعلومات. أما أمين البيانات فينفّذ تلك القرارات تقنياً: توفير الوصول، وتطبيق التشفير، والحفاظ على النسخ الاحتياطية. المالك يقرر من ينبغي أن يصل ولماذا؛ والأمين يتأكد أن النظام يعكس ذلك القرار.</p>
<h2>مقارنة جنباً إلى جنب</h2>
<table class="content-comparison-table">
  <thead><tr><th></th><th>مالك البيانات</th><th>أمين البيانات</th></tr></thead>
  <tbody>
    <tr><td>الدور المعتاد</td><td>قائد وحدة أعمال، رئيس قسم</td><td>مسؤول تقنية معلومات/أمن/قاعدة بيانات</td></tr>
    <tr><td>يقرر</td><td>التصنيف، من يحصل على الوصول، مدة الاحتفاظ</td><td>كيفية تطبيق الوصول تقنياً</td></tr>
    <tr><td>مسؤول عن</td><td>الاستخدام المناسب ومخاطرة الأعمال</td><td>التنفيذ التقني والضمانات</td></tr>
  </tbody>
</table>
<p>أكثر أنماط الفشل شيوعاً هو عدم وجود مالك محدد إطلاقاً، فتُعتمد طلبات الوصول من أي أمين يسهل الوصول إليه — ما يحوّل بهدوء قراراً تجارياً إلى إعداد تقني افتراضي، دون أن يكون أحد مسؤولاً فعلياً عن منطقية ذلك الوصول.</p>
<h2>أهم النقاط</h2>
<ul class="content-checklist">
  <li>المالكون يقررون؛ والأمناء ينفّذون — كلا الدورين ضروري، وهما غير قابلين للتبادل.</li>
  <li>ينبغي أن يكون لكل مجموعة بيانات مصنّفة مالك محدد ليس الشخص نفسه أمينها.</li>
  <li>ينبغي أن يعتمد مراجعات الوصول المالك، لا أن يوافق عليها الأمين شكلياً.</li>
</ul>
$c3ar$,
  'مالكو البيانات مقابل أمناء البيانات | CyberAbeer',
  'الفرق بين مالك البيانات وأمين البيانات، ولماذا يؤدي غياب مالك محدد إلى تعثر مراجعات الوصول.', 3
from articles art join authors a on a.id=art.author_id join categories c on c.id=art.category_id
where a.display_name='Dr. Abeer Alshammari' and c.key='hub_data_classification'
  and exists (select 1 from article_translations t where t.article_id=art.id and t.locale='en' and t.slug='data-owners-vs-data-custodians')
  and not exists (select 1 from article_translations t4 where t4.article_id=art.id and t4.locale='ar');

-- ---------------------------------------------------------------------
-- C4. How AI Changes Data Classification
-- ---------------------------------------------------------------------
insert into articles (id, author_id, category_id, status, schema_type, difficulty, audience, reviewed_at, published_at)
select gen_random_uuid(), a.id, c.id, 'published', 'Article', 'intermediate', array['professionals','ciso'], now(), now()
from authors a, categories c
where a.display_name='Dr. Abeer Alshammari' and c.key='hub_data_classification'
  and not exists (select 1 from article_translations t where t.locale='en' and t.slug='how-ai-changes-data-classification');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'en', 'How AI Changes Data Classification', 'how-ai-changes-data-classification',
  'AI systems combine and move data faster than manual classification programs were built to track -- and an AI agent''s permissions should never outrun the sensitivity tier of the data it touches.',
  $c4en$
<p>Traditional data classification assumes data mostly sits still: a file in a folder, a record in a database, each with a tier assigned once and revisited occasionally. AI changes two things about that assumption. First, AI systems combine data from multiple sources in ways that can produce a more sensitive output than any single input (aggregating "harmless" fields into an identifiable profile, for instance). Second, an AI agent with broad data access can move or expose data far faster than a human ever could, so a classification gap is discovered at machine speed, not audit speed.</p>
<h2>What this changes in practice</h2>
<ul class="content-checklist">
  <li>Classification needs to account for derived and combined outputs, not just source records.</li>
  <li>An agent's permissions should be capped at the sensitivity tier of the most sensitive data it can reach -- never granted more broadly "for flexibility."</li>
  <li>Review cycles need to be shorter where AI systems actively combine or transform classified data.</li>
</ul>
<p>This is exactly the principle behind CyberAbeer's Data Guardian concept and the AI agent permissions model: access should follow classification, not the other way around, and that discipline matters more, not less, once an AI system is doing the combining.</p>
<h2>Key takeaways</h2>
<ul class="content-checklist">
  <li>AI can create sensitive outputs from non-sensitive inputs -- classify outputs, not just sources.</li>
  <li>Never let an AI agent's permission scope exceed the classification of the most sensitive data it touches.</li>
  <li>Shorten review cycles for data actively used by AI systems.</li>
</ul>
$c4en$,
  'How AI Changes Data Classification | CyberAbeer',
  'Why AI systems require faster, output-aware data classification, and how agent permissions should follow it.', 3
from articles art join authors a on a.id=art.author_id join categories c on c.id=art.category_id
where a.display_name='Dr. Abeer Alshammari' and c.key='hub_data_classification'
  and not exists (select 1 from article_translations t where t.article_id=art.id and t.locale='en' and t.slug='how-ai-changes-data-classification')
  and not exists (select 1 from article_translations t3 where t3.article_id=art.id and t3.locale='en');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'ar', 'كيف يغيّر الذكاء الاصطناعي تصنيف البيانات', 'كيف-يغير-الذكاء-الاصطناعي-تصنيف-البيانات',
  'تجمع أنظمة الذكاء الاصطناعي البيانات وتنقلها أسرع مما صُممت برامج التصنيف اليدوية لتتبعه — ولا ينبغي أبداً أن تتجاوز صلاحيات وكيل الذكاء الاصطناعي مستوى حساسية البيانات التي يلامسها.',
  $c4ar$
<p>يفترض تصنيف البيانات التقليدي أن البيانات تبقى ثابتة غالباً: ملف في مجلد، سجل في قاعدة بيانات، لكل منهما مستوى يُحدَّد مرة ويُراجَع أحياناً. يغيّر الذكاء الاصطناعي أمرين في هذا الافتراض. أولاً، تجمع أنظمة الذكاء الاصطناعي بيانات من مصادر متعددة بطرق قد تنتج مخرجاً أكثر حساسية من أي مُدخل بمفرده (تجميع حقول "غير ضارة" في ملف تعريف قابل للتحديد، مثلاً). ثانياً، يستطيع وكيل ذكاء اصطناعي بوصول واسع للبيانات نقل أو كشف البيانات أسرع بكثير مما يستطيعه إنسان، فتُكتشف فجوة التصنيف بسرعة الآلة لا بسرعة التدقيق.</p>
<h2>ما الذي يتغير عملياً</h2>
<ul class="content-checklist">
  <li>يحتاج التصنيف لمراعاة المخرجات المشتقة والمجمّعة، لا السجلات المصدرية فقط.</li>
  <li>ينبغي أن تُحدَّد صلاحيات الوكيل بسقف مستوى حساسية أكثر البيانات حساسية التي يستطيع الوصول إليها — ولا تُمنح أوسع "من أجل المرونة" أبداً.</li>
  <li>تحتاج دورات المراجعة لأن تكون أقصر حيث تجمع أنظمة الذكاء الاصطناعي أو تحوّل البيانات المصنّفة بنشاط.</li>
</ul>
<p>هذا بالضبط المبدأ وراء مفهوم Data Guardian من CyberAbeer ونموذج صلاحيات وكلاء الذكاء الاصطناعي: يجب أن يتبع الوصول التصنيف، لا العكس، وهذا الانضباط يهم أكثر لا أقل بمجرد أن يتولى نظام ذكاء اصطناعي عملية التجميع.</p>
<h2>أهم النقاط</h2>
<ul class="content-checklist">
  <li>يستطيع الذكاء الاصطناعي إنشاء مخرجات حساسة من مدخلات غير حساسة — صنّف المخرجات لا المصادر فقط.</li>
  <li>لا تدع أبداً نطاق صلاحية وكيل الذكاء الاصطناعي يتجاوز تصنيف أكثر البيانات حساسية التي يلامسها.</li>
  <li>قصّر دورات المراجعة للبيانات التي تستخدمها أنظمة الذكاء الاصطناعي بنشاط.</li>
</ul>
$c4ar$,
  'كيف يغيّر الذكاء الاصطناعي تصنيف البيانات | CyberAbeer',
  'لماذا تتطلب أنظمة الذكاء الاصطناعي تصنيف بيانات أسرع وواعياً بالمخرجات، وكيف ينبغي أن تتبعه صلاحيات الوكلاء.', 3
from articles art join authors a on a.id=art.author_id join categories c on c.id=art.category_id
where a.display_name='Dr. Abeer Alshammari' and c.key='hub_data_classification'
  and exists (select 1 from article_translations t where t.article_id=art.id and t.locale='en' and t.slug='how-ai-changes-data-classification')
  and not exists (select 1 from article_translations t4 where t4.article_id=art.id and t4.locale='ar');

-- =====================================================================
-- SECTION D: FUTURE SECURITY (hub_post_quantum)
-- =====================================================================

-- ---------------------------------------------------------------------
-- D1. Post-Quantum Cybersecurity Explained
-- ---------------------------------------------------------------------
insert into articles (id, author_id, category_id, status, schema_type, difficulty, audience, reviewed_at, published_at)
select gen_random_uuid(), a.id, c.id, 'published', 'Article', 'beginner', array['professionals','executives','general'], now(), now()
from authors a, categories c
where a.display_name='Dr. Abeer Alshammari' and c.key='hub_post_quantum'
  and not exists (select 1 from article_translations t where t.locale='en' and t.slug='post-quantum-cybersecurity-explained');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'en', 'Post-Quantum Cybersecurity Explained', 'post-quantum-cybersecurity-explained',
  'NIST has already finalized three post-quantum cryptography standards. Post-quantum cybersecurity is the work of migrating to them before a quantum computer can break today''s encryption.',
  $d1en$
<p>Post-quantum cybersecurity is the practice of moving cryptographic systems to algorithms that remain secure against a sufficiently powerful quantum computer -- one capable of breaking the math behind today's most widely used public-key encryption (RSA and elliptic-curve cryptography). This is not speculative: NIST finalized three Federal Information Processing Standards for post-quantum cryptography in August 2024 -- FIPS 203 (ML-KEM, for key establishment) and FIPS 204 and 205 (ML-DSA and SLH-DSA, for digital signatures) -- with a fourth, FIPS 206, expected in 2026.</p>
<h2>Why act before a quantum computer exists</h2>
<p>The practical risk is "harvest now, decrypt later": encrypted data intercepted and stored today can be decrypted retroactively once quantum computers are capable enough, so data that needs to stay confidential for years is already at risk under current algorithms, regardless of when a capable quantum computer actually arrives. NIST's own transition plan (NIST IR 8547) calls for deprecating RSA-2048 and ECC P-256 by 2030 and removing quantum-vulnerable algorithms from NIST standards entirely by 2035.</p>
<h2>Key takeaways</h2>
<ul class="content-checklist">
  <li>Post-quantum standards already exist and are finalized -- this is a migration problem, not a research problem.</li>
  <li>Data with a long confidentiality requirement is at risk today under "harvest now, decrypt later," independent of quantum timelines.</li>
  <li>See "Crypto Agility Explained" and "How to Start Preparing for Quantum Risk" for the practical next steps.</li>
</ul>
$d1en$,
  'Post-Quantum Cybersecurity Explained | CyberAbeer',
  'What post-quantum cybersecurity means, NIST''s finalized FIPS 203/204/205 standards, and why "harvest now, decrypt later" makes this urgent today.', 4
from articles art join authors a on a.id=art.author_id join categories c on c.id=art.category_id
where a.display_name='Dr. Abeer Alshammari' and c.key='hub_post_quantum'
  and not exists (select 1 from article_translations t where t.article_id=art.id and t.locale='en' and t.slug='post-quantum-cybersecurity-explained')
  and not exists (select 1 from article_translations t3 where t3.article_id=art.id and t3.locale='en');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'ar', 'شرح الأمن السيبراني ما بعد الكم', 'شرح-الامن-السيبراني-ما-بعد-الكم',
  'أنهى NIST بالفعل ثلاثة معايير تشفير ما بعد الكم. الأمن السيبراني ما بعد الكم هو عمل الانتقال إليها قبل أن يتمكن حاسوب كمي من كسر التشفير الحالي.',
  $d1ar$
<p>الأمن السيبراني ما بعد الكم هو ممارسة نقل الأنظمة التشفيرية إلى خوارزميات تبقى آمنة أمام حاسوب كمي قوي بما يكفي — قادر على كسر الرياضيات وراء أكثر أنظمة التشفير العام استخداماً اليوم (RSA والتشفير بالمنحنيات الإهليلجية). هذا ليس افتراضياً: أنهى NIST ثلاثة معايير فيدرالية لمعالجة المعلومات لتشفير ما بعد الكم في أغسطس 2024 — FIPS 203 (ML-KEM، لتأسيس المفاتيح) وFIPS 204 وFIPS 205 (ML-DSA وSLH-DSA، للتوقيعات الرقمية) — مع توقع معيار رابع، FIPS 206، خلال 2026.</p>
<h2>لماذا التحرك قبل وجود حاسوب كمي</h2>
<p>المخاطرة العملية هي "احصد الآن، فك التشفير لاحقاً": يمكن فك تشفير البيانات المشفرة التي اعتُرضت وخُزّنت اليوم بأثر رجعي بمجرد أن تصبح الحواسيب الكمية قادرة بما يكفي، لذا فإن البيانات التي تحتاج للبقاء سرية لسنوات معرّضة للخطر بالفعل تحت الخوارزميات الحالية، بصرف النظر عن موعد وصول حاسوب كمي قادر فعلياً. تدعو خطة NIST الانتقالية نفسها (NIST IR 8547) إلى إيقاف RSA-2048 وECC P-256 تدريجياً بحلول 2030 وإزالة الخوارزميات الضعيفة أمام الكم من معايير NIST تماماً بحلول 2035.</p>
<h2>أهم النقاط</h2>
<ul class="content-checklist">
  <li>معايير ما بعد الكم موجودة بالفعل ومكتملة — هذه مشكلة انتقال، لا مشكلة بحث.</li>
  <li>البيانات ذات متطلب السرية الطويل معرّضة للخطر اليوم بموجب "احصد الآن، فك التشفير لاحقاً"، بصرف النظر عن الجداول الزمنية الكمية.</li>
  <li>راجع مقالي "شرح المرونة التشفيرية" و"كيف تبدأ المؤسسات الاستعداد لمخاطر الكم" للخطوات العملية التالية.</li>
</ul>
$d1ar$,
  'شرح الأمن السيبراني ما بعد الكم | CyberAbeer',
  'ما معنى الأمن السيبراني ما بعد الكم، ومعايير NIST المكتملة FIPS 203/204/205، ولماذا يجعل "احصد الآن، فك التشفير لاحقاً" هذا عاجلاً اليوم.', 4
from articles art join authors a on a.id=art.author_id join categories c on c.id=art.category_id
where a.display_name='Dr. Abeer Alshammari' and c.key='hub_post_quantum'
  and exists (select 1 from article_translations t where t.article_id=art.id and t.locale='en' and t.slug='post-quantum-cybersecurity-explained')
  and not exists (select 1 from article_translations t4 where t4.article_id=art.id and t4.locale='ar');

-- ---------------------------------------------------------------------
-- D2. Crypto Agility Explained
-- ---------------------------------------------------------------------
insert into articles (id, author_id, category_id, status, schema_type, difficulty, audience, reviewed_at, published_at)
select gen_random_uuid(), a.id, c.id, 'published', 'Article', 'intermediate', array['professionals','ciso'], now(), now()
from authors a, categories c
where a.display_name='Dr. Abeer Alshammari' and c.key='hub_post_quantum'
  and not exists (select 1 from article_translations t where t.locale='en' and t.slug='crypto-agility-explained');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'en', 'Crypto Agility Explained', 'crypto-agility-explained',
  'Crypto agility is the ability to swap cryptographic algorithms without redesigning the systems around them -- and NIST now treats it as a prerequisite for post-quantum migration.',
  $d2en$
<p>NIST defines crypto agility as the capabilities needed to replace and adapt cryptographic algorithms, parameters, processes, and technologies without introducing unacceptable security risk and without disrupting normal system operation. In plain terms: if swapping an encryption algorithm requires rebuilding the application around it, that system is not crypto-agile.</p>
<h2>Why it matters right now</h2>
<p>Crypto agility is the prerequisite for post-quantum migration, not a separate initiative. An organization that hard-codes specific algorithms throughout its systems will face a much harder, riskier migration when post-quantum algorithms need to go in. US National Security Memorandum 10 (NSM-10), NIST, and CISA all now explicitly call for cryptographic agility as groundwork for the quantum transition.</p>
<h2>The building blocks</h2>
<ul class="content-checklist">
  <li>An inventory of where and how cryptography is actually used across your systems -- you cannot swap what you haven't mapped.</li>
  <li>Abstraction between application logic and specific cryptographic implementations, so algorithms can change underneath without rewriting the application.</li>
  <li>A tested process for rotating algorithms, not just keys.</li>
</ul>
<h2>Key takeaways</h2>
<ul class="content-checklist">
  <li>Crypto agility means changing algorithms without redesigning the system -- it's an architecture property, not a one-time project.</li>
  <li>It is now a named prerequisite for post-quantum migration in US government guidance (NSM-10, NIST, CISA).</li>
  <li>Start with an inventory -- you cannot plan agility around cryptography you haven't located.</li>
</ul>
$d2en$,
  'Crypto Agility Explained | CyberAbeer',
  'What crypto agility means, NIST''s definition, and why it is now treated as a prerequisite for post-quantum migration.', 3
from articles art join authors a on a.id=art.author_id join categories c on c.id=art.category_id
where a.display_name='Dr. Abeer Alshammari' and c.key='hub_post_quantum'
  and not exists (select 1 from article_translations t where t.article_id=art.id and t.locale='en' and t.slug='crypto-agility-explained')
  and not exists (select 1 from article_translations t3 where t3.article_id=art.id and t3.locale='en');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'ar', 'شرح المرونة التشفيرية', 'شرح-المرونة-التشفيرية',
  'المرونة التشفيرية هي القدرة على استبدال الخوارزميات التشفيرية دون إعادة تصميم الأنظمة المحيطة بها — ويعتبرها NIST الآن شرطاً مسبقاً للانتقال إلى ما بعد الكم.',
  $d2ar$
<p>يعرّف NIST المرونة التشفيرية بأنها القدرات اللازمة لاستبدال وتكييف الخوارزميات والمعطيات والعمليات والتقنيات التشفيرية دون إدخال مخاطرة أمنية غير مقبولة ودون تعطيل التشغيل الطبيعي للنظام. بلغة مبسطة: إن كان استبدال خوارزمية تشفير يتطلب إعادة بناء التطبيق من حولها، فذلك النظام ليس مرناً تشفيرياً.</p>
<h2>لماذا يهم هذا الآن</h2>
<p>المرونة التشفيرية شرط مسبق للانتقال إلى ما بعد الكم، لا مبادرة منفصلة. المؤسسة التي تُثبّت خوارزميات محددة بشكل صلب عبر أنظمتها ستواجه انتقالاً أصعب وأشد مخاطرة بكثير حين يتوجب إدخال خوارزميات ما بعد الكم. تدعو مذكرة الأمن القومي الأمريكية رقم 10 (NSM-10) وNIST وCISA جميعها الآن صراحة إلى المرونة التشفيرية كأساس للانتقال الكمي.</p>
<h2>اللبنات الأساسية</h2>
<ul class="content-checklist">
  <li>جرد لأين وكيف يُستخدم التشفير فعلياً عبر أنظمتك — لا يمكنك استبدال ما لم تُحدده.</li>
  <li>فصل بين منطق التطبيق وتنفيذات التشفير المحددة، بحيث يمكن تغيير الخوارزميات من الأسفل دون إعادة كتابة التطبيق.</li>
  <li>عملية مُختبَرة لتدوير الخوارزميات، لا المفاتيح فقط.</li>
</ul>
<h2>أهم النقاط</h2>
<ul class="content-checklist">
  <li>تعني المرونة التشفيرية تغيير الخوارزميات دون إعادة تصميم النظام — إنها خاصية معمارية، لا مشروع لمرة واحدة.</li>
  <li>أصبحت الآن شرطاً مسبقاً مسمّى للانتقال إلى ما بعد الكم في إرشادات الحكومة الأمريكية (NSM-10، NIST، CISA).</li>
  <li>ابدأ بالجرد — لا يمكنك التخطيط للمرونة حول تشفير لم تحدد موقعه.</li>
</ul>
$d2ar$,
  'شرح المرونة التشفيرية | CyberAbeer',
  'ما معنى المرونة التشفيرية، وتعريف NIST لها، ولماذا تُعامَل الآن كشرط مسبق للانتقال إلى ما بعد الكم.', 3
from articles art join authors a on a.id=art.author_id join categories c on c.id=art.category_id
where a.display_name='Dr. Abeer Alshammari' and c.key='hub_post_quantum'
  and exists (select 1 from article_translations t where t.article_id=art.id and t.locale='en' and t.slug='crypto-agility-explained')
  and not exists (select 1 from article_translations t4 where t4.article_id=art.id and t4.locale='ar');

-- ---------------------------------------------------------------------
-- D3. How Organizations Can Start Preparing for Quantum Risk
-- ---------------------------------------------------------------------
insert into articles (id, author_id, category_id, status, schema_type, difficulty, audience, reviewed_at, published_at)
select gen_random_uuid(), a.id, c.id, 'published', 'Article', 'intermediate', array['professionals','ciso','executives'], now(), now()
from authors a, categories c
where a.display_name='Dr. Abeer Alshammari' and c.key='hub_post_quantum'
  and not exists (select 1 from article_translations t where t.locale='en' and t.slug='how-to-start-preparing-for-quantum-risk');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'en', 'How Organizations Can Start Preparing for Quantum Risk', 'how-to-start-preparing-for-quantum-risk',
  'You do not need a quantum computer to start quantum risk preparation. The first steps are an inventory and a prioritization exercise, and they are due now.',
  $d3en$
<p>Quantum risk preparation does not start with buying anything -- it starts with knowing what you have. Most organizations have never inventoried where cryptography is used across their systems, which makes any migration plan impossible to scope.</p>
<h2>A practical starting sequence</h2>
<ul class="content-checklist">
  <li>Inventory where cryptography is used: TLS, VPNs, code signing, stored data encryption, and third-party/vendor systems you depend on.</li>
  <li>Identify data with long confidentiality requirements (years, not months) -- this data is exposed to "harvest now, decrypt later" today.</li>
  <li>Prioritize by exposure: internet-facing systems and long-lived sensitive data first.</li>
  <li>Track vendor and supplier readiness -- your migration timeline is bound by theirs if you depend on their cryptography.</li>
  <li>Build crypto agility into new systems now, so future algorithm swaps don't require a rebuild.</li>
</ul>
<p>A June 2026 US executive order sets concrete federal milestones -- a migration pilot by 2027, key establishment migration by 2030, digital signature migration by 2031 -- which gives organizations that supply or work with federal systems a real deadline to plan against, not an open-ended "someday."</p>
<h2>Key takeaways</h2>
<ul class="content-checklist">
  <li>Inventory first -- you cannot plan a migration around cryptography you haven't located.</li>
  <li>Prioritize by data sensitivity and exposure duration, not by convenience.</li>
  <li>Real federal deadlines already exist (2030/2031) -- this is a planning problem with a clock, not an indefinite future concern.</li>
</ul>
$d3en$,
  'Preparing for Quantum Risk | CyberAbeer',
  'A practical starting sequence for quantum risk preparation: inventory, prioritization, vendor readiness, and crypto agility.', 3
from articles art join authors a on a.id=art.author_id join categories c on c.id=art.category_id
where a.display_name='Dr. Abeer Alshammari' and c.key='hub_post_quantum'
  and not exists (select 1 from article_translations t where t.article_id=art.id and t.locale='en' and t.slug='how-to-start-preparing-for-quantum-risk')
  and not exists (select 1 from article_translations t3 where t3.article_id=art.id and t3.locale='en');

insert into article_translations (article_id, locale, title, slug, excerpt, body, meta_title, meta_description, reading_time_minutes)
select art.id, 'ar', 'كيف تبدأ المؤسسات الاستعداد لمخاطر الكم', 'كيف-تبدا-المؤسسات-الاستعداد-لمخاطر-الكم',
  'لا تحتاج حاسوباً كمياً لتبدأ الاستعداد لمخاطر الكم. الخطوات الأولى هي الجرد وتمرين تحديد الأولويات، وهي مستحقة الآن.',
  $d3ar$
<p>لا يبدأ الاستعداد لمخاطر الكم بشراء أي شيء — بل بمعرفة ما لديك. لم تُجرِ معظم المؤسسات أبداً جرداً لأين يُستخدم التشفير عبر أنظمتها، ما يجعل أي خطة انتقال مستحيلة التحديد.</p>
<h2>تسلسل بداية عملي</h2>
<ul class="content-checklist">
  <li>جرد أين يُستخدم التشفير: TLS، الشبكات الخاصة الافتراضية، توقيع الكود، تشفير البيانات المخزنة، وأنظمة الأطراف الثالثة/الموردين التي تعتمد عليها.</li>
  <li>حدد البيانات ذات متطلبات السرية الطويلة (سنوات لا أشهر) — هذه البيانات معرّضة اليوم لـ"احصد الآن، فك التشفير لاحقاً".</li>
  <li>رتّب الأولويات حسب التعرض: الأنظمة المواجهة للإنترنت والبيانات الحساسة طويلة الأمد أولاً.</li>
  <li>تتبّع جاهزية الموردين والأطراف الثالثة — جدولك الزمني للانتقال مقيّد بجدولهم إن كنت تعتمد على تشفيرهم.</li>
  <li>ابنِ المرونة التشفيرية في الأنظمة الجديدة الآن، كي لا تتطلب استبدالات الخوارزميات المستقبلية إعادة بناء.</li>
</ul>
<p>يضع أمر تنفيذي أمريكي صدر في يونيو 2026 معالم فيدرالية ملموسة — تجربة انتقال بحلول 2027، وانتقال تأسيس المفاتيح بحلول 2030، وانتقال التوقيعات الرقمية بحلول 2031 — ما يمنح المؤسسات التي تورّد أو تعمل مع أنظمة فيدرالية موعداً نهائياً حقيقياً تخطط حوله، لا "يوماً ما" مفتوحاً.</p>
<h2>أهم النقاط</h2>
<ul class="content-checklist">
  <li>الجرد أولاً — لا يمكنك التخطيط لانتقال حول تشفير لم تحدد موقعه.</li>
  <li>رتّب الأولويات حسب حساسية البيانات ومدة التعرض، لا حسب الراحة.</li>
  <li>مواعيد فيدرالية حقيقية موجودة بالفعل (2030/2031) — هذه مشكلة تخطيط لها ساعة عد تنازلي، لا قلق مستقبلي غير محدد.</li>
</ul>
$d3ar$,
  'الاستعداد لمخاطر الكم | CyberAbeer',
  'تسلسل بداية عملي للاستعداد لمخاطر الكم: الجرد، وترتيب الأولويات، وجاهزية الموردين، والمرونة التشفيرية.', 3
from articles art join authors a on a.id=art.author_id join categories c on c.id=art.category_id
where a.display_name='Dr. Abeer Alshammari' and c.key='hub_post_quantum'
  and exists (select 1 from article_translations t where t.article_id=art.id and t.locale='en' and t.slug='how-to-start-preparing-for-quantum-risk')
  and not exists (select 1 from article_translations t4 where t4.article_id=art.id and t4.locale='ar');

-- =====================================================================
-- Sources (only for standards/statistics-dependent claims)
-- =====================================================================
insert into article_sources (article_id, title, publisher, url, published_date, accessed_date, sort_order)
select t.article_id, s.title, s.publisher, s.url, s.published_date::date, current_date, s.sort_order
from article_translations t
join (values
  ('ai-agent-identity-non-human-identities', 'NIST AI Agent Standards Initiative', 'NIST', 'https://www.nist.gov/artificial-intelligence/ai-agent-standards-initiative', '2026-02-17', 1),
  ('ai-agent-identity-non-human-identities', 'What is Microsoft Entra Agent ID?', 'Microsoft Learn', 'https://learn.microsoft.com/en-us/entra/agent-id/what-is-microsoft-entra-agent-id', null, 2),
  ('ai-agent-permissions-least-privilege', 'Security best practices for agentic AI systems on AWS', 'AWS Prescriptive Guidance', 'https://docs.aws.amazon.com/prescriptive-guidance/latest/agentic-ai-security/best-practices.html', null, 1),
  ('shadow-ai-vs-shadow-agents', 'Agentic AI Identity Management: A New Approach', 'Cloud Security Alliance', 'https://cloudsecurityalliance.org/blog/2025/03/11/agentic-ai-identity-management-approach', '2025-03-11', 1),
  ('human-in-the-loop-for-ai-agents', 'Cloud CISO Perspectives: How Google secures AI agents', 'Google Cloud', 'https://cloud.google.com/blog/products/identity-security/cloud-ciso-perspectives-how-google-secures-ai-agents', null, 1),
  ('ai-agent-risk-assessment', 'MITRE ATLAS', 'MITRE', 'https://atlas.mitre.org/', null, 1),
  ('iso-27001-explained-for-beginners', 'ISO/IEC 27001:2022 Requirements Explained', 'goteleport.com (summary of ISO/IEC 27001:2022)', 'https://goteleport.com/blog/iso-iec-27001-2022-explained/', null, 1),
  ('what-is-a-statement-of-applicability', 'How to write an ISO 27001 Statement of Applicability', 'ISMS.online', 'https://www.isms.online/iso-27001/statement-of-applicability/', null, 1),
  ('post-quantum-cybersecurity-explained', 'Post-Quantum Cryptography FIPS Approved', 'NIST / CSRC', 'https://csrc.nist.gov/news/2024/postquantum-cryptography-fips-approved', '2024-08-13', 1),
  ('crypto-agility-explained', 'What is Crypto Agility? How To Prepare For Post-Quantum Migration', 'Keyfactor', 'https://www.keyfactor.com/education-center/what-is-crypto-agility-how-to-prepare-for-post-quantum-migration/', null, 1),
  ('how-to-start-preparing-for-quantum-risk', 'Post-Quantum Cryptography FIPS Approved', 'NIST / CSRC', 'https://csrc.nist.gov/news/2024/postquantum-cryptography-fips-approved', '2024-08-13', 1)
) as s(slug, title, publisher, url, published_date, sort_order)
  on true
where t.locale='en' and t.slug = s.slug
  and not exists (select 1 from article_sources ex where ex.article_id = t.article_id);

-- =====================================================================
-- Internal linking / topic clusters for the 20 new articles
-- =====================================================================
insert into article_relations (article_id, related_article_id, sort_order)
select src.article_id, dst.article_id, r.sort_order
from (values
  ('ai-agent-governance-explained', 'ai-agent-governance-why-autonomous-ai-needs-its-own-model', 1),
  ('ai-agent-governance-explained', 'ai-agent-identity-non-human-identities', 2),
  ('ai-agent-identity-non-human-identities', 'ai-agent-security-identity-permissions-governance', 1),
  ('ai-agent-identity-non-human-identities', 'ai-agent-permissions-least-privilege', 2),
  ('ai-agent-permissions-least-privilege', 'ai-agent-security-identity-permissions-governance', 1),
  ('ai-agent-permissions-least-privilege', 'ai-agent-risk-assessment', 2),
  ('shadow-ai-vs-shadow-agents', 'how-to-inventory-ai-agents', 1),
  ('shadow-ai-vs-shadow-agents', 'ai-agent-security-identity-permissions-governance', 2),
  ('human-in-the-loop-for-ai-agents', 'ai-agent-security-identity-permissions-governance', 1),
  ('ai-agent-risk-assessment', 'ai-agent-security-identity-permissions-governance', 1),
  ('ai-agent-risk-assessment', 'how-to-inventory-ai-agents', 2),
  ('how-to-inventory-ai-agents', 'shadow-ai-vs-shadow-agents', 1),
  ('how-to-inventory-ai-agents', 'ai-agent-risk-assessment', 2),
  ('cybersecurity-governance-framework-explained', 'cybersecurity-governance-vs-it-governance', 1),
  ('cybersecurity-governance-framework-explained', 'cybersecurity-governance-frameworks-compared', 2),
  ('risk-appetite-vs-risk-tolerance', 'how-to-build-a-cyber-risk-register', 1),
  ('risk-appetite-vs-risk-tolerance', 'what-is-residual-cyber-risk', 2),
  ('how-to-build-a-cyber-risk-register', 'risk-appetite-vs-risk-tolerance', 1),
  ('how-to-build-a-cyber-risk-register', 'what-is-residual-cyber-risk', 2),
  ('iso-27001-explained-for-beginners', 'what-is-a-statement-of-applicability', 1),
  ('iso-27001-explained-for-beginners', 'cybersecurity-governance-frameworks-compared', 2),
  ('what-is-a-statement-of-applicability', 'iso-27001-explained-for-beginners', 1),
  ('what-is-residual-cyber-risk', 'risk-appetite-vs-risk-tolerance', 1),
  ('what-is-residual-cyber-risk', 'how-to-build-a-cyber-risk-register', 2),
  ('data-classification-explained', 'data-classification-101-practical-framework', 1),
  ('data-classification-explained', 'dlp-explained', 2),
  ('dlp-explained', 'data-classification-explained', 1),
  ('dlp-explained', 'how-ai-changes-data-classification', 2),
  ('data-owners-vs-data-custodians', 'data-classification-explained', 1),
  ('data-owners-vs-data-custodians', 'data-classification-101-practical-framework', 2),
  ('how-ai-changes-data-classification', 'ai-agent-security-identity-permissions-governance', 1),
  ('how-ai-changes-data-classification', 'data-classification-explained', 2),
  ('post-quantum-cybersecurity-explained', 'crypto-agility-explained', 1),
  ('post-quantum-cybersecurity-explained', 'how-to-start-preparing-for-quantum-risk', 2),
  ('post-quantum-cybersecurity-explained', 'post-quantum-cryptography-what-security-teams-need-to-know', 3),
  ('crypto-agility-explained', 'post-quantum-cybersecurity-explained', 1),
  ('crypto-agility-explained', 'how-to-start-preparing-for-quantum-risk', 2),
  ('how-to-start-preparing-for-quantum-risk', 'post-quantum-cybersecurity-explained', 1),
  ('how-to-start-preparing-for-quantum-risk', 'crypto-agility-explained', 2)
) as r(src_slug, dst_slug, sort_order)
join article_translations src on src.locale='en' and src.slug=r.src_slug
join article_translations dst on dst.locale='en' and dst.slug=r.dst_slug
on conflict (article_id, related_article_id) do nothing;
