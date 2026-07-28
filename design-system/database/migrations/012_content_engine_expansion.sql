-- =====================================================================
-- 012_content_engine_expansion.sql
-- CyberAbeer Content Intelligence Engine — schema expansion.
--
-- Extends the existing CONTENT domain (002_schema_content_leads.sql)
-- rather than replacing it: articles/categories/article_translations
-- already implement the translatable-entity + pillar/parent_id pattern
-- this spec calls for, so this migration only adds what is genuinely
-- missing —
--   1. a richer editorial workflow status (draft -> researched ->
--      founder_review -> approved -> published -> updated -> archived)
--   2. per-article difficulty/audience/related-lab metadata
--   3. a sources table (title/publisher/url/published_date/accessed_date)
--      so every claim can cite a real, checkable source
--   4. a relations table for internal linking / topic clusters
--   5. the pillar + hub taxonomy seeded into the existing `categories`
--      table (is_pillar + parent_id already support this natively)
--
-- IMPORTANT — run this file by itself first. Article seed data (see
-- 013_content_seed_flagship_articles.sql) intentionally uses only the
-- pre-existing 'draft' status value, never one of the values ADD VALUE'd
-- below, because Postgres will not let a newly added enum value be used
-- in the same transaction that added it. Keeping this file free of any
-- INSERT that uses the new statuses avoids that restriction entirely.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Editorial workflow: extend content_status
-- Existing: draft, in_review, published, archived (001_extensions...).
-- 'in_review' is left in place for backward compatibility but is
-- superseded going forward by the more granular states below, matching
-- Section 24 of the content spec: AI-generated drafts must never
-- auto-publish; founder approval is required before anything with
-- Dr. Abeer's name or the GRCL framework goes live.
-- ---------------------------------------------------------------------
alter type content_status add value if not exists 'researched';
alter type content_status add value if not exists 'founder_review';
alter type content_status add value if not exists 'approved';
alter type content_status add value if not exists 'updated';

-- ---------------------------------------------------------------------
-- 2. Article metadata additions
-- Pillar/hub assignment deliberately reuses the existing
-- articles.category_id -> categories(is_pillar, parent_id) relationship
-- instead of adding a redundant text column: a hub category's parent_id
-- already points at its pillar, so "which pillar is this article under"
-- is one join away, not a second source of truth to keep in sync.
-- ---------------------------------------------------------------------
alter table articles
  add column if not exists difficulty text
    check (difficulty in ('beginner','intermediate','advanced')),
  add column if not exists audience text[] not null default '{}'::text[]
    check (audience <@ array['students','professionals','executives','ciso','general']::text[]),
  add column if not exists reviewed_at timestamptz,
  add column if not exists reviewed_by uuid references profiles(id) on delete set null,
  add column if not exists related_lab_key text;

comment on column articles.reviewed_at is
  'Set when a platform admin (the founder) moves an article to founder_review/approved. Null means no human has reviewed it yet -- used to gate anything that must never auto-publish.';
comment on column articles.related_lab_key is
  'Optional challenges.key / future labs key this article should link to as a "try it" CTA. Left null when no matching interactive experience exists yet -- the article template renders a "Coming Soon" placeholder instead of a dead or fabricated link, never a link to something that does not exist.';

-- ---------------------------------------------------------------------
-- 3. Sources: every non-evergreen claim gets a checkable citation.
-- Mirrors the metadata the spec requires (title, publisher, url,
-- publication date, access date) -- never a bare inline claim with no
-- attribution trail.
-- ---------------------------------------------------------------------
create table if not exists article_sources (
  id             uuid primary key default gen_random_uuid(),
  article_id     uuid not null references articles(id) on delete cascade,
  title          text not null,
  publisher      text,
  url            text not null,
  published_date date,
  accessed_date  date not null default current_date,
  sort_order     int not null default 0,
  created_at     timestamptz not null default now()
);
create index if not exists article_sources_article_idx on article_sources (article_id);

-- ---------------------------------------------------------------------
-- 4. Relations: internal linking / topic clusters (Section 19).
-- Directed edge so an article can name its own "related reading" order
-- rather than relying purely on shared category.
-- ---------------------------------------------------------------------
create table if not exists article_relations (
  article_id         uuid not null references articles(id) on delete cascade,
  related_article_id uuid not null references articles(id) on delete cascade,
  sort_order         int not null default 0,
  created_at         timestamptz not null default now(),
  primary key (article_id, related_article_id),
  constraint article_relations_not_self check (article_id <> related_article_id)
);
create index if not exists article_relations_related_idx on article_relations (related_article_id);

-- ---------------------------------------------------------------------
-- 5. RLS -- new tables follow the exact 007_rls_policies.sql pattern:
-- public read gated on the owning article being published; admin write.
-- ---------------------------------------------------------------------
alter table article_sources enable row level security;
alter table article_sources force row level security;
create policy article_sources_public_read on article_sources for select
  using (exists (
    select 1 from articles a where a.id = article_sources.article_id
    and a.status = 'published' and a.deleted_at is null
  ));
create policy article_sources_admin_write on article_sources for all
  using (is_platform_admin()) with check (is_platform_admin());

alter table article_relations enable row level security;
alter table article_relations force row level security;
create policy article_relations_public_read on article_relations for select
  using (exists (
    select 1 from articles a where a.id = article_relations.article_id
    and a.status = 'published' and a.deleted_at is null
  ));
create policy article_relations_admin_write on article_relations for all
  using (is_platform_admin()) with check (is_platform_admin());

-- ---------------------------------------------------------------------
-- 6. Pillar + hub taxonomy
-- 6 top-level pillars (is_pillar = true, parent_id null) and 5 sub-hubs
-- (parent_id = their pillar). "Dr. Abeer Insights" is a cross-cutting
-- authorial voice, not a topic, so it is seeded as its own non-pillar,
-- parent-less category rather than nested under one pillar.
-- ---------------------------------------------------------------------
insert into categories (key, is_pillar, parent_id)
values
  ('pillar_cyber_defense', true, null),
  ('pillar_grc_governance', true, null),
  ('pillar_ai_security_governance', true, null),
  ('pillar_data_trust', true, null),
  ('pillar_future_security', true, null),
  ('pillar_learn_cybersecurity', true, null),
  ('category_dr_abeer_insights', false, null)
on conflict (key) do nothing;

insert into categories (key, is_pillar, parent_id)
select 'hub_grcl', false, id from categories where key = 'pillar_grc_governance'
on conflict (key) do nothing;
insert into categories (key, is_pillar, parent_id)
select 'hub_cybersecurity_governance', false, id from categories where key = 'pillar_grc_governance'
on conflict (key) do nothing;
insert into categories (key, is_pillar, parent_id)
select 'hub_ai_agent_governance', false, id from categories where key = 'pillar_ai_security_governance'
on conflict (key) do nothing;
insert into categories (key, is_pillar, parent_id)
select 'hub_post_quantum', false, id from categories where key = 'pillar_future_security'
on conflict (key) do nothing;
insert into categories (key, is_pillar, parent_id)
select 'hub_data_classification', false, id from categories where key = 'pillar_data_trust'
on conflict (key) do nothing;

-- English translations
insert into category_translations (category_id, locale, name, slug, description, meta_title, meta_description)
select id, 'en', v.name, v.slug, v.description, v.meta_title, v.meta_description
from categories c
join (values
  ('pillar_cyber_defense', 'Cyber Defense', 'cyber-defense',
   'Practical guidance on defending networks, endpoints, applications, and identities against real-world attacks.',
   'Cyber Defense | CyberAbeer', 'Cyber Defense articles, guides, and explainers from CyberAbeer: network security, endpoint defense, application security, and identity protection.'),
  ('pillar_grc_governance', 'GRC & Cyber Governance', 'grc-cyber-governance',
   'Governance, risk, and compliance content on how organizations structure accountability for cyber risk -- including the GRCL Knowledge Hub and Cybersecurity Governance Hub.',
   'GRC & Cyber Governance | CyberAbeer', 'Governance, risk and compliance content from CyberAbeer covering cybersecurity governance, board oversight, and the GRCL framework.'),
  ('pillar_ai_security_governance', 'AI Security & AI Governance', 'ai-security-ai-governance',
   'How organizations secure AI systems and govern autonomous AI agents, including the AI Agent Governance Hub.',
   'AI Security & AI Governance | CyberAbeer', 'AI security and AI governance articles from CyberAbeer: securing AI systems and governing autonomous AI agents.'),
  ('pillar_data_trust', 'Data Trust', 'data-trust',
   'Data classification, data protection, and building organizational trust in how data is handled, including the Data Classification Hub.',
   'Data Trust | CyberAbeer', 'Data trust articles from CyberAbeer on data classification, data protection, and privacy-by-design practices.'),
  ('pillar_future_security', 'Future Security', 'future-security',
   'Emerging and forward-looking security topics, including the Post-Quantum Hub.',
   'Future Security | CyberAbeer', 'Future security articles from CyberAbeer on post-quantum cryptography and other emerging security shifts.'),
  ('pillar_learn_cybersecurity', 'Learn Cybersecurity', 'learn-cybersecurity',
   'Beginner-friendly roadmaps, career guidance, and certification comparisons for people starting or advancing in cybersecurity.',
   'Learn Cybersecurity | CyberAbeer', 'Beginner cybersecurity guides, career roadmaps, and certification comparisons from CyberAbeer.'),
  ('category_dr_abeer_insights', 'Dr. Abeer Insights', 'dr-abeer-insights',
   'Founder-authority commentary and analysis from Dr. Abeer Alshammari, grounded in her own professional background and published research.',
   'Dr. Abeer Insights | CyberAbeer', 'Founder commentary and research-grounded analysis from Dr. Abeer Alshammari on cybersecurity governance.'),
  ('hub_grcl', 'GRCL Knowledge Hub', 'grcl-knowledge-hub',
   'The Governance, Risk and Compliance Layered (GRCL) architecture -- Dr. Abeer Alshammari''s doctoral research framework, explained and applied.',
   'GRCL Knowledge Hub | CyberAbeer', 'The GRCL (Governance, Risk and Compliance Layered) framework, developed through Dr. Abeer Alshammari''s doctoral research, explained.'),
  ('hub_cybersecurity_governance', 'Cybersecurity Governance Hub', 'cybersecurity-governance-hub',
   'How boards and executives structure accountability for cyber risk, and how cybersecurity governance differs from IT governance.',
   'Cybersecurity Governance Hub | CyberAbeer', 'Cybersecurity governance articles from CyberAbeer on board oversight, executive accountability, and governance frameworks.'),
  ('hub_ai_agent_governance', 'AI Agent Governance Hub', 'ai-agent-governance-hub',
   'Governance models for autonomous AI agents: identity, permissions, oversight, and accountability.',
   'AI Agent Governance Hub | CyberAbeer', 'AI agent governance articles from CyberAbeer on identity, permissions, and oversight for autonomous AI systems.'),
  ('hub_post_quantum', 'Post-Quantum Hub', 'post-quantum-hub',
   'Preparing for the transition to post-quantum cryptography: risk assessment, migration planning, and timelines.',
   'Post-Quantum Hub | CyberAbeer', 'Post-quantum cryptography articles from CyberAbeer on quantum risk assessment and migration planning.'),
  ('hub_data_classification', 'Data Classification Hub', 'data-classification-hub',
   'Practical frameworks for classifying and handling data by sensitivity, without disclosing any specific employer''s confidential practices.',
   'Data Classification Hub | CyberAbeer', 'Data classification articles from CyberAbeer on building a practical, sensitivity-based data classification framework.')
) as v(key, name, slug, description, meta_title, meta_description) on v.key = c.key
on conflict (category_id, locale) do nothing;

-- Arabic translations
insert into category_translations (category_id, locale, name, slug, description, meta_title, meta_description)
select id, 'ar', v.name, v.slug, v.description, v.meta_title, v.meta_description
from categories c
join (values
  ('pillar_cyber_defense', 'الدفاع السيبراني', 'الدفاع-السيبراني',
   'إرشادات عملية للدفاع عن الشبكات والأجهزة الطرفية والتطبيقات والهويات ضد الهجمات الواقعية.',
   'الدفاع السيبراني | CyberAbeer', 'مقالات وأدلة من CyberAbeer حول أمن الشبكات وحماية الأجهزة الطرفية وأمن التطبيقات وحماية الهوية.'),
  ('pillar_grc_governance', 'الحوكمة والمخاطر والامتثال', 'الحوكمة-والمخاطر-والامتثال',
   'محتوى حول كيفية بناء المؤسسات للمساءلة تجاه المخاطر السيبرانية، بما في ذلك مركز معرفة GRCL ومركز حوكمة الأمن السيبراني.',
   'الحوكمة والمخاطر والامتثال | CyberAbeer', 'محتوى من CyberAbeer حول حوكمة الأمن السيبراني ورقابة مجلس الإدارة وإطار GRCL.'),
  ('pillar_ai_security_governance', 'أمن الذكاء الاصطناعي وحوكمته', 'أمن-الذكاء-الاصطناعي-وحوكمته',
   'كيف تؤمّن المؤسسات أنظمة الذكاء الاصطناعي وتحوكم الوكلاء المستقلين، بما في ذلك مركز حوكمة وكلاء الذكاء الاصطناعي.',
   'أمن الذكاء الاصطناعي وحوكمته | CyberAbeer', 'مقالات من CyberAbeer حول أمن أنظمة الذكاء الاصطناعي وحوكمة الوكلاء المستقلين.'),
  ('pillar_data_trust', 'الثقة في البيانات', 'الثقة-في-البيانات',
   'تصنيف البيانات وحمايتها وبناء الثقة المؤسسية في طريقة التعامل معها، بما في ذلك مركز تصنيف البيانات.',
   'الثقة في البيانات | CyberAbeer', 'مقالات من CyberAbeer حول تصنيف البيانات وحمايتها وممارسات الخصوصية.'),
  ('pillar_future_security', 'أمن المستقبل', 'أمن-المستقبل',
   'مواضيع أمنية ناشئة واستشرافية، بما في ذلك مركز ما بعد الحوسبة الكمية.',
   'أمن المستقبل | CyberAbeer', 'مقالات من CyberAbeer حول التشفير ما بعد الكمي والتحولات الأمنية الناشئة الأخرى.'),
  ('pillar_learn_cybersecurity', 'تعلّم الأمن السيبراني', 'تعلم-الأمن-السيبراني',
   'خرائط طريق للمبتدئين، وإرشادات مهنية، ومقارنات الشهادات لمن يبدأ أو يتقدم في مجال الأمن السيبراني.',
   'تعلّم الأمن السيبراني | CyberAbeer', 'أدلة للمبتدئين وخرائط طريق مهنية ومقارنات شهادات من CyberAbeer.'),
  ('category_dr_abeer_insights', 'رؤى د. عبير', 'رؤى-د-عبير',
   'تحليلات ورؤى من د. عبير الشمري، مبنية على خلفيتها المهنية وأبحاثها المنشورة.',
   'رؤى د. عبير | CyberAbeer', 'تعليقات ورؤى مبنية على البحث من د. عبير الشمري حول حوكمة الأمن السيبراني.'),
  ('hub_grcl', 'مركز معرفة GRCL', 'مركز-معرفة-grcl',
   'إطار الحوكمة والمخاطر والامتثال الطبقي (GRCL) -- إطار بحث الدكتوراه الخاص بالدكتورة عبير الشمري، موضحاً ومطبقاً.',
   'مركز معرفة GRCL | CyberAbeer', 'إطار GRCL، المطوَّر من خلال بحث الدكتوراه للدكتورة عبير الشمري، موضحاً بالتفصيل.'),
  ('hub_cybersecurity_governance', 'مركز حوكمة الأمن السيبراني', 'مركز-حوكمة-الأمن-السيبراني',
   'كيف تبني مجالس الإدارة والتنفيذيون المساءلة تجاه المخاطر السيبرانية، وكيف تختلف حوكمة الأمن السيبراني عن حوكمة تقنية المعلومات.',
   'مركز حوكمة الأمن السيبراني | CyberAbeer', 'مقالات من CyberAbeer حول رقابة مجلس الإدارة والمساءلة التنفيذية وأطر الحوكمة.'),
  ('hub_ai_agent_governance', 'مركز حوكمة وكلاء الذكاء الاصطناعي', 'مركز-حوكمة-وكلاء-الذكاء-الاصطناعي',
   'نماذج حوكمة لوكلاء الذكاء الاصطناعي المستقلين: الهوية والصلاحيات والرقابة والمساءلة.',
   'مركز حوكمة وكلاء الذكاء الاصطناعي | CyberAbeer', 'مقالات من CyberAbeer حول الهوية والصلاحيات والرقابة لأنظمة الذكاء الاصطناعي المستقلة.'),
  ('hub_post_quantum', 'مركز ما بعد الحوسبة الكمية', 'مركز-ما-بعد-الحوسبة-الكمية',
   'الاستعداد للانتقال إلى التشفير ما بعد الكمي: تقييم المخاطر وتخطيط الانتقال والجداول الزمنية.',
   'مركز ما بعد الحوسبة الكمية | CyberAbeer', 'مقالات من CyberAbeer حول تقييم المخاطر الكمية وتخطيط الانتقال إلى التشفير ما بعد الكمي.'),
  ('hub_data_classification', 'مركز تصنيف البيانات', 'مركز-تصنيف-البيانات',
   'أطر عملية لتصنيف البيانات والتعامل معها حسب الحساسية، دون الكشف عن أي ممارسات سرية خاصة بأي جهة عمل.',
   'مركز تصنيف البيانات | CyberAbeer', 'مقالات من CyberAbeer حول بناء إطار عملي لتصنيف البيانات حسب الحساسية.')
) as v(key, name, slug, description, meta_title, meta_description) on v.key = c.key
on conflict (category_id, locale) do nothing;
