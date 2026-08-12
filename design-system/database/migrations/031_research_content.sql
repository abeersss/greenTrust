-- =============================================================
-- 031_research_content.sql
--
-- CyberAbeer Platform Phase II -- Research page content. The
-- /research page has been fully static since Phase 1: the intro
-- paragraph, the 40-item research areas list, and the dissertation
-- note all live in next-intl translation files, and the publications
-- list is a hardcoded TS constant (lib/research/publications.ts).
-- None of it is founder-editable -- changing a single research area
-- or adding a new preprint has required a code deploy. This migration
-- gives the founder the same admin control over Research that she
-- already has over Books (migration 029): a singleton settings row
-- for the bilingual intro paragraph, plus two ordered lists (areas,
-- publications) she can add to, hide, or delete from
-- /founder/research, mirroring the books admin-all / public-active-
-- only RLS split throughout.
--
-- Seeded with the exact copy currently live on the public page (EN +
-- AR intro, all 40 research areas, all 6 publications) so switching
-- the public page's data source from next-intl/static-TS to this
-- table is a content-neutral change -- nothing regresses on deploy.
-- Publication titles stay English-only on both locales, matching the
-- existing academic-citation convention in lib/research/publications.ts.
-- =============================================================

create table research_settings (
  id smallint primary key default 1,
  intro_en text not null,
  intro_ar text not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id),
  constraint research_settings_singleton check (id = 1)
);

insert into research_settings (id, intro_en, intro_ar) values (
  1,
  'My research focuses on bridging academic theory with practical cybersecurity governance, enabling organizations to innovate securely while strengthening resilience, digital trust, and responsible adoption of emerging technologies.',
  'تركز أبحاثي على الربط بين الجانب الأكاديمي والتطبيق العملي في حوكمة الأمن السيبراني، بما يمكّن المؤسسات من الابتكار بأمان، وتعزيز المرونة الرقمية، وبناء الثقة الرقمية، ودعم الاستخدام المسؤول للتقنيات الناشئة.'
);

alter table research_settings enable row level security;
alter table research_settings force row level security;

-- The intro paragraph has no draft/published distinction -- it's
-- always shown, so public read is unconditional (same as the
-- homepage banner settings row, migration 013).
create policy research_settings_public_read on research_settings for select
  using (true);

create policy research_settings_admin_all on research_settings for all
  using (is_platform_admin()) with check (is_platform_admin());

create table research_areas (
  id uuid primary key default gen_random_uuid(),
  text_en text not null,
  text_ar text not null,
  display_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index research_areas_display_order_idx on research_areas (display_order);
create index research_areas_is_active_idx on research_areas (is_active);

alter table research_areas enable row level security;
alter table research_areas force row level security;

create policy research_areas_public_read on research_areas for select
  using (is_active = true);

create policy research_areas_admin_all on research_areas for all
  using (is_platform_admin()) with check (is_platform_admin());

create table research_publications (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  venue text not null,
  year text not null,
  doi_url text not null,
  display_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index research_publications_display_order_idx on research_publications (display_order);
create index research_publications_is_active_idx on research_publications (is_active);

alter table research_publications enable row level security;
alter table research_publications force row level security;

create policy research_publications_public_read on research_publications for select
  using (is_active = true);

create policy research_publications_admin_all on research_publications for all
  using (is_platform_admin()) with check (is_platform_admin());

-- Seed: the 40 research areas currently live on the public page
-- (en.json / ar.json "research.areas").
insert into research_areas (text_en, text_ar, display_order) values
('Cybersecurity Governance', 'حوكمة الأمن السيبراني', 0),
('Governance, Risk and Compliance (GRC)', 'الحوكمة وإدارة المخاطر والامتثال (GRC)', 1),
('AI Governance', 'حوكمة الذكاء الاصطناعي', 2),
('AI Security', 'أمن الذكاء الاصطناعي', 3),
('AI Risk Management', 'إدارة مخاطر الذكاء الاصطناعي', 4),
('Agent Governance', 'حوكمة الوكلاء الذكيين', 5),
('Digital Trust', 'الثقة الرقمية', 6),
('Digital Transformation Governance', 'حوكمة التحول الرقمي', 7),
('Information Security Governance', 'حوكمة أمن المعلومات', 8),
('Data Governance', 'حوكمة البيانات', 9),
('Data Classification and Information Protection', 'تصنيف البيانات وحماية المعلومات', 10),
('Privacy Engineering', 'هندسة الخصوصية', 11),
('Network Security', 'أمن الشبكات', 12),
('Security Architecture', 'هندسة الأمن', 13),
('Zero Trust Architecture', 'بنية الثقة المعدومة (Zero Trust)', 14),
('Cloud Security Governance', 'حوكمة أمن الحوسبة السحابية', 15),
('Identity and Access Management (IAM)', 'إدارة الهوية والوصول (IAM)', 16),
('Encryption and Cryptography', 'التشفير وعلم التعمية', 17),
('Post-Quantum Cryptography', 'التشفير المقاوم للحوسبة الكمّية', 18),
('Cyber Resilience', 'المرونة السيبرانية', 19),
('Enterprise Risk Management', 'إدارة المخاطر المؤسسية', 20),
('Security Metrics and Maturity Models', 'مؤشرات الأمن ونماذج النضج', 21),
('Regulatory Compliance', 'الامتثال التنظيمي', 22),
('ISO/IEC 27001', 'المعيار ISO/IEC 27001', 23),
('ISO/IEC 42001', 'المعيار ISO/IEC 42001', 24),
('NIST Cybersecurity Framework', 'إطار NIST للأمن السيبراني', 25),
('Secure Software Governance', 'حوكمة تطوير البرمجيات الآمنة', 26),
('Supply Chain Cybersecurity', 'أمن سلسلة التوريد', 27),
('Third-Party Risk Management', 'إدارة مخاطر الأطراف الثالثة', 28),
('Operational Technology (OT) Security Governance', 'حوكمة أمن التقنية التشغيلية (OT)', 29),
('Cybersecurity Strategy', 'استراتيجية الأمن السيبراني', 30),
('Innovation Governance', 'حوكمة الابتكار', 31),
('Emerging Technologies Governance', 'حوكمة التقنيات الناشئة', 32),
('Responsible AI', 'الذكاء الاصطناعي المسؤول', 33),
('Human-Centered Cybersecurity', 'الأمن السيبراني المتمحور حول الإنسان', 34),
('Leadership in Cybersecurity', 'القيادة في الأمن السيبراني', 35),
('Women in STEM Leadership', 'قيادة المرأة في مجالات STEM', 36),
('Youth STEM Leadership', 'قيادة الشباب في مجالات STEM', 37),
('Cybersecurity Education', 'التعليم في الأمن السيبراني', 38),
('Professional Development in Cybersecurity', 'التطوير المهني في الأمن السيبراني', 39);

-- Seed: the 6 publications currently live on the public page
-- (lib/research/publications.ts).
insert into research_publications (title, venue, year, doi_url, display_order) values
('A Practical Framework for Adaptive Data Classification in Cybersecurity', 'SSRN Preprint', '2026', 'https://doi.org/10.2139/ssrn.6163367', 0),
('AI-Driven Adaptive Data Classification for Quantum-Resilient Cybersecurity Architectures', 'SSRN Preprint', '2026', 'https://doi.org/10.2139/ssrn.6397219', 1),
('Challenges of Implementing Data Classification Frameworks in Large Organizations: A Practical Governance-Driven Approach', 'SSRN Preprint', '2026', 'https://doi.org/10.2139/ssrn.6163526', 2),
('Design of Turbo-NAFS: A Quantum-Resilient Encryption Scheme Based on Functional Superposition', 'SSRN Preprint', '2026', 'https://doi.org/10.2139/ssrn.6167526', 3),
('Cybersecurity Governance vs IT Governance: Why Conflating the Two Weakens Organizational Resilience', 'Zenodo Preprint', '2026', 'https://doi.org/10.5281/zenodo.18526815', 4),
('Defining Cybersecurity Roles and Responsibilities Across Organizational Size and Criticality: A Governance-Oriented Framework for Public and Private Sectors', 'Zenodo Preprint', '2026', 'https://doi.org/10.5281/zenodo.18520086', 5);
