-- Migration 017: Learning & Careers hub taxonomy
-- =============================================================
-- Adds 4 new hub categories under the existing pillar_learn_cybersecurity
-- pillar (seeded in 012_content_engine_expansion.sql): CISSP, CISM,
-- ISO/IEC 27001, and Cybersecurity Careers. Follows the exact same
-- category/category_translations pattern as the other hubs in 012
-- (hub_grcl, hub_ai_agent_governance, etc.) -- no schema changes, no
-- new tables, per the founder's "do not change the website
-- architecture unnecessarily" instruction.

insert into categories (key, is_pillar, parent_id)
select 'hub_cissp', false, id from categories where key = 'pillar_learn_cybersecurity'
on conflict (key) do nothing;
insert into categories (key, is_pillar, parent_id)
select 'hub_cism', false, id from categories where key = 'pillar_learn_cybersecurity'
on conflict (key) do nothing;
insert into categories (key, is_pillar, parent_id)
select 'hub_iso_27001', false, id from categories where key = 'pillar_learn_cybersecurity'
on conflict (key) do nothing;
insert into categories (key, is_pillar, parent_id)
select 'hub_cybersecurity_careers', false, id from categories where key = 'pillar_learn_cybersecurity'
on conflict (key) do nothing;

-- English translations
insert into category_translations (category_id, locale, name, slug, description, meta_title, meta_description)
select id, 'en', v.name, v.slug, v.description, v.meta_title, v.meta_description
from categories c
join (values
  ('hub_cissp', 'CISSP Hub', 'cissp-hub',
   'Everything to prepare for the CISSP exam: domains, study plans, scenario-based reasoning, and exam-day strategy.',
   'CISSP Hub | CyberAbeer', 'CISSP study guide, domains, practice scenarios, and exam prep from CyberAbeer.'),
  ('hub_cism', 'CISM Hub', 'cism-hub',
   'CISM domains, governance-focused reasoning, and how CISM compares to CISSP for security leadership roles.',
   'CISM Hub | CyberAbeer', 'CISM study guide, domains, and exam prep from CyberAbeer for security management professionals.'),
  ('hub_iso_27001', 'ISO/IEC 27001 Hub', 'iso-27001-hub',
   'ISO/IEC 27001:2022 explained clause by clause, Annex A controls, the Statement of Applicability, and the certification journey.',
   'ISO/IEC 27001 Hub | CyberAbeer', 'ISO/IEC 27001:2022 explained: clauses, Annex A controls, SoA, audits, and certification from CyberAbeer.'),
  ('hub_cybersecurity_careers', 'Cybersecurity Careers Hub', 'cybersecurity-careers-hub',
   'Career roadmaps for SOC, GRC, audit, security engineering, and AI security, plus certification sequencing guidance.',
   'Cybersecurity Careers Hub | CyberAbeer', 'Cybersecurity career roadmaps and certification guidance from CyberAbeer.')
) as v(key, name, slug, description, meta_title, meta_description) on v.key = c.key
on conflict (category_id, locale) do nothing;

-- Arabic translations
insert into category_translations (category_id, locale, name, slug, description, meta_title, meta_description)
select id, 'ar', v.name, v.slug, v.description, v.meta_title, v.meta_description
from categories c
join (values
  ('hub_cissp', 'مركز CISSP', 'مركز-cissp',
   'كل ما يلزم للاستعداد لاختبار CISSP: المجالات وخطط الدراسة والتفكير القائم على السيناريوهات واستراتيجية يوم الاختبار.',
   'مركز CISSP | CyberAbeer', 'دليل دراسة CISSP والمجالات وأسئلة تدريبية واستراتيجية الاختبار من CyberAbeer.'),
  ('hub_cism', 'مركز CISM', 'مركز-cism',
   'مجالات CISM والتفكير القائم على الحوكمة، وكيف تختلف CISM عن CISSP لأدوار قيادة الأمن.',
   'مركز CISM | CyberAbeer', 'دليل دراسة CISM والمجالات والاستعداد للاختبار من CyberAbeer لمهنيي إدارة الأمن.'),
  ('hub_iso_27001', 'مركز ISO/IEC 27001', 'مركز-iso-iec-27001',
   'شرح ISO/IEC 27001:2022 بندًا بندًا، وضوابط الملحق A، وبيان قابلية التطبيق، ورحلة الحصول على الشهادة.',
   'مركز ISO/IEC 27001 | CyberAbeer', 'شرح ISO/IEC 27001:2022: البنود وضوابط الملحق A وبيان قابلية التطبيق والتدقيق والشهادة من CyberAbeer.'),
  ('hub_cybersecurity_careers', 'مركز المسارات المهنية للأمن السيبراني', 'مركز-المسارات-المهنية-للأمن-السيبراني',
   'خرائط طريق مهنية لمركز العمليات الأمنية والحوكمة والمخاطر والامتثال والتدقيق وهندسة الأمن وأمن الذكاء الاصطناعي، إضافة إلى إرشادات تسلسل الشهادات.',
   'مركز المسارات المهنية للأمن السيبراني | CyberAbeer', 'خرائط طريق مهنية للأمن السيبراني وإرشادات الشهادات من CyberAbeer.')
) as v(key, name, slug, description, meta_title, meta_description) on v.key = c.key
on conflict (category_id, locale) do nothing;
