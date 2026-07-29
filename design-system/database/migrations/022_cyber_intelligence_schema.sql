-- =====================================================================
-- 022_cyber_intelligence_schema.sql
-- CyberAbeer Cyber Intelligence -- schema extension.
--
-- Extends the existing content engine (002, 012) rather than building a
-- parallel system: intelligence items ARE articles (same table, same
-- article_translations/article_sources/article_relations, same
-- pillar/hub taxonomy via categories), with a set of intelligence-only
-- nullable columns added on top. A non-intelligence article simply
-- never sets these columns.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. schema_type gains NewsArticle (Section 27: NewsArticle schema
-- where applicable -- developing/time-sensitive intelligence items use
-- it; evergreen explainer-style intelligence pieces keep 'Article').
-- ---------------------------------------------------------------------
alter table articles drop constraint if exists articles_schema_type_check;
alter table articles add constraint articles_schema_type_check
  check (schema_type in ('Article','FAQPage','HowTo','NewsArticle'));

-- ---------------------------------------------------------------------
-- 2. Intelligence-only metadata on articles. All nullable: a normal
-- Learning/GRC/AI-governance article never touches these.
-- ---------------------------------------------------------------------
alter table articles
  add column if not exists intel_severity text
    check (intel_severity in ('critical','high','important','informational')),
  add column if not exists intel_story_status text
    check (intel_story_status in ('developing','confirmed','updated','resolved')),
  add column if not exists cve_ids text[],
  add column if not exists cvss_score numeric(3,1)
    check (cvss_score is null or (cvss_score >= 0 and cvss_score <= 10)),
  add column if not exists affected_product text,
  add column if not exists exploit_status text
    check (exploit_status in ('actively_exploited','poc_available','no_known_exploit','unknown')),
  add column if not exists kev_listed boolean not null default false,
  add column if not exists vendor_advisory_url text,
  add column if not exists patch_status text,
  add column if not exists cyberabeer_priority text
    check (cyberabeer_priority in ('immediate','urgent','planned','monitor')),
  add column if not exists mena_relevance boolean not null default false,
  add column if not exists sources_checked_at timestamptz;

comment on column articles.intel_severity is
  'CyberAbeer-assigned severity for Cyber Intelligence items only. Must reflect actual impact, not engagement -- see content spec Section 2.';
comment on column articles.intel_story_status is
  'Developing-story label (Section 13), independent of the editorial publish-workflow `status` column. Null = not a developing story (e.g. an evergreen PQC explainer).';
comment on column articles.cyberabeer_priority is
  'CyberAbeer prioritization guidance (Section 5) -- explicitly NOT an official vendor/CISA rating. Only set for vulnerability-intelligence items with enough verified context (severity, exploitation, exposure) to support a recommendation.';
comment on column articles.sources_checked_at is
  'When sources were last verified against primary/authoritative references. Distinct from articles.updated_at, which also changes on copy edits.';

create index if not exists articles_intel_severity_idx on articles (intel_severity) where deleted_at is null;
create index if not exists articles_kev_listed_idx on articles (kev_listed) where kev_listed = true;

-- ---------------------------------------------------------------------
-- 3. Executive View (Section 15): a short, separately-authored 60-120
-- word summary per locale, distinct from the excerpt (which is for
-- listing cards) and the full body (which contains the Technical View
-- inline as a labeled section, matching the existing Dr. Abeer Explains
-- / content-callout pattern rather than a new column per view).
-- ---------------------------------------------------------------------
alter table article_translations
  add column if not exists executive_summary text;
comment on column article_translations.executive_summary is
  'Executive View (Section 15): business impact / risk / decision required / action, 60-120 words, written to be forwarded directly to leadership. Null for non-intelligence articles.';

-- ---------------------------------------------------------------------
-- 4. Pillar + hub taxonomy for Cyber Intelligence, following the exact
-- pattern from 012_content_engine_expansion.sql.
-- ---------------------------------------------------------------------
insert into categories (key, is_pillar, parent_id)
values ('pillar_cyber_intelligence', true, null)
on conflict (key) do nothing;

insert into categories (key, is_pillar, parent_id)
select v.key, false, id from categories, (values
  ('hub_vulnerability_intel'),
  ('hub_ai_security_watch'),
  ('hub_agent_watch'),
  ('hub_grc_watch'),
  ('hub_quantum_watch'),
  ('hub_threat_intel'),
  ('hub_data_identity_watch')
) as v(key)
where categories.key = 'pillar_cyber_intelligence'
on conflict (key) do nothing;

insert into category_translations (category_id, locale, name, slug, description, meta_title, meta_description)
select id, 'en', v.name, v.slug, v.description, v.meta_title, v.meta_description
from categories c
join (values
  ('pillar_cyber_intelligence', 'Cyber Intelligence', 'intelligence',
   'CyberAbeer analysis of important cybersecurity, AI security, and GRC developments -- verified, sourced, and explained, not reproduced.',
   'Cyber Intelligence | CyberAbeer', 'Bilingual cybersecurity, AI security, and GRC intelligence and analysis from CyberAbeer, verified against authoritative sources.'),
  ('hub_vulnerability_intel', 'Vulnerability Intelligence', 'vulnerability-intelligence',
   'Critical vulnerabilities, active exploitation, and CyberAbeer prioritization guidance.',
   'Vulnerability Intelligence | CyberAbeer', 'CVE, CVSS, exploit status, and CyberAbeer prioritization guidance for critical vulnerabilities.'),
  ('hub_ai_security_watch', 'AI Security Watch', 'ai-security-watch',
   'AI agents, prompt injection, AI data leakage, AI identity, and AI governance developments.',
   'AI Security Watch | CyberAbeer', 'Tracking important AI security and agentic AI developments with CyberAbeer analysis.'),
  ('hub_agent_watch', 'Agent Watch', 'agent-watch',
   'What changed, what the agent can access, what identity and permissions are involved, and what to govern.',
   'Agent Watch | CyberAbeer', 'CyberAbeer analysis of agentic AI capability, identity, permission, and governance developments.'),
  ('hub_grc_watch', 'GRC & Governance Watch', 'grc-governance-watch',
   'Regulatory and framework developments that actually change organizational decisions.',
   'GRC & Governance Watch | CyberAbeer', 'ISO, NIST, CISA, and regulatory developments affecting cybersecurity governance, tracked by CyberAbeer.'),
  ('hub_quantum_watch', 'Quantum Security Watch', 'quantum-security-watch',
   'Post-quantum cryptography standards, migration, and crypto-agility developments.',
   'Quantum Security Watch | CyberAbeer', 'Post-quantum cryptography migration developments and CyberAbeer guidance on what to inventory and migrate.'),
  ('hub_threat_intel', 'Threat Intelligence', 'threat-intelligence',
   'Active threats, exploitation trends, and campaign analysis.',
   'Threat Intelligence | CyberAbeer', 'CyberAbeer threat intelligence analysis of active campaigns and exploitation trends.'),
  ('hub_data_identity_watch', 'Data & Identity Watch', 'data-identity-watch',
   'Identity security, non-human identity, and data security developments.',
   'Data & Identity Watch | CyberAbeer', 'Identity security and data security developments tracked and analyzed by CyberAbeer.')
) as v(key, name, slug, description, meta_title, meta_description) on v.key = c.key
on conflict (category_id, locale) do nothing;

insert into category_translations (category_id, locale, name, slug, description, meta_title, meta_description)
select id, 'ar', v.name, v.slug, v.description, v.meta_title, v.meta_description
from categories c
join (values
  ('pillar_cyber_intelligence', 'استخبارات الأمن السيبراني', 'استخبارات-الأمن-السيبراني',
   'تحليل CyberAbeer لأهم تطورات الأمن السيبراني وأمن الذكاء الاصطناعي والحوكمة والمخاطر والامتثال -- موثَّق ومُتحقَّق منه، لا مُعاد نشره.',
   'استخبارات الأمن السيبراني | CyberAbeer', 'استخبارات وتحليل ثنائي اللغة للأمن السيبراني وأمن الذكاء الاصطناعي والحوكمة من CyberAbeer، موثَّق مقابل مصادر رسمية.'),
  ('hub_vulnerability_intel', 'استخبارات الثغرات الأمنية', 'استخبارات-الثغرات-الأمنية',
   'الثغرات الحرجة والاستغلال الفعلي وإرشادات الأولوية من CyberAbeer.',
   'استخبارات الثغرات الأمنية | CyberAbeer', 'CVE وCVSS وحالة الاستغلال وإرشادات أولوية CyberAbeer للثغرات الحرجة.'),
  ('hub_ai_security_watch', 'رصد أمن الذكاء الاصطناعي', 'رصد-أمن-الذكاء-الاصطناعي',
   'تطورات وكلاء الذكاء الاصطناعي وحقن التوجيهات وتسرب بيانات الذكاء الاصطناعي وهوية الذكاء الاصطناعي وحوكمته.',
   'رصد أمن الذكاء الاصطناعي | CyberAbeer', 'تتبع تطورات أمن الذكاء الاصطناعي والذكاء الاصطناعي الوكيل مع تحليل CyberAbeer.'),
  ('hub_agent_watch', 'رصد الوكلاء', 'رصد-الوكلاء',
   'ما الذي تغيّر، وما الذي يستطيع الوكيل الوصول إليه، وما الهوية والصلاحيات المعنية، وما الذي يجب حوكمته.',
   'رصد الوكلاء | CyberAbeer', 'تحليل CyberAbeer لتطورات قدرات وهوية وصلاحيات وحوكمة الذكاء الاصطناعي الوكيل.'),
  ('hub_grc_watch', 'رصد الحوكمة والمخاطر والامتثال', 'رصد-الحوكمة-والمخاطر-والامتثال',
   'التطورات التنظيمية وتطورات الأطر التي تغيّر فعلاً قرارات المؤسسات.',
   'رصد الحوكمة والمخاطر والامتثال | CyberAbeer', 'تطورات ISO وNIST وCISA والتنظيم المؤثرة في حوكمة الأمن السيبراني، تتبعها CyberAbeer.'),
  ('hub_quantum_watch', 'رصد الأمن الكمومي', 'رصد-الأمن-الكمومي',
   'معايير التشفير ما بعد الكمومي والترحيل ومرونة التشفير.',
   'رصد الأمن الكمومي | CyberAbeer', 'تطورات ترحيل التشفير ما بعد الكمومي وإرشادات CyberAbeer حول ما يجب جرده وترحيله.'),
  ('hub_threat_intel', 'استخبارات التهديدات', 'استخبارات-التهديدات',
   'التهديدات النشطة واتجاهات الاستغلال وتحليل الحملات.',
   'استخبارات التهديدات | CyberAbeer', 'تحليل CyberAbeer الاستخباراتي للحملات النشطة واتجاهات الاستغلال.'),
  ('hub_data_identity_watch', 'رصد البيانات والهوية', 'رصد-البيانات-والهوية',
   'أمن الهوية والهوية غير البشرية وتطورات أمن البيانات.',
   'رصد البيانات والهوية | CyberAbeer', 'تطورات أمن الهوية وأمن البيانات التي ترصدها وتحللها CyberAbeer.')
) as v(key, name, slug, description, meta_title, meta_description) on v.key = c.key
on conflict (category_id, locale) do nothing;
