-- Migration 030: Tool Resources CMS + media gallery for Books + Storage bucket
--
-- Replaces the hardcoded "Downloads" section on /free-tools with a
-- founder-manageable table: bilingual name + description, an optional
-- downloadable file (PDF/xlsx/zip), and up to 4 gallery images shown as a
-- sliding carousel on the public site. Also adds an image gallery (up to 4
-- images) to books, and creates the Supabase Storage bucket + RLS policies
-- both features upload into.

-- ---------------------------------------------------------------------
-- 1. tool_resources
-- ---------------------------------------------------------------------
create table if not exists tool_resources (
  id              uuid primary key default gen_random_uuid(),
  name_en         text not null,
  name_ar         text not null,
  description_en  text not null,
  description_ar  text not null,
  file_url        text,
  file_name       text,
  image_urls      text[] not null default '{}',
  display_order   int not null default 0,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint tool_resources_max_4_images check (
    image_urls is null or array_length(image_urls, 1) is null or array_length(image_urls, 1) <= 4
  )
);

create index if not exists tool_resources_display_order_idx on tool_resources (display_order);
create index if not exists tool_resources_is_active_idx on tool_resources (is_active);

alter table tool_resources enable row level security;
alter table tool_resources force row level security;

drop policy if exists tool_resources_public_read on tool_resources;
create policy tool_resources_public_read on tool_resources for select
  using (is_active = true);

drop policy if exists tool_resources_admin_all on tool_resources;
create policy tool_resources_admin_all on tool_resources for all
  using (is_platform_admin())
  with check (is_platform_admin());

-- Seed the 4 existing static downloads so nothing disappears when the
-- hardcoded array in free-tools/page.tsx is replaced by this table. The
-- founder can edit/reorder/hide these (or add new ones) from the new
-- admin UI going forward.
insert into tool_resources (name_en, name_ar, description_en, description_ar, file_url, file_name, display_order)
values
  (
    'Risk Register & Heat Map',
    'سجل المخاطر وخريطة الحرارة',
    'A ready-to-use Excel risk register with a built-in likelihood x impact heat map, so you can log, score, and prioritize risks in one place.',
    'سجل مخاطر جاهز على Excel مع خريطة حرارية للاحتمالية والتأثير، لتسجيل المخاطر وتقييمها وترتيب أولوياتها في مكان واحد.',
    '/downloads/CyberAbeer_Risk_Register_Heat_Map.xlsx',
    'CyberAbeer_Risk_Register_Heat_Map.xlsx',
    1
  ),
  (
    'ISO 27001:2022 SoA Tracker',
    'متتبع بيان قابلية التطبيق ISO 27001:2022',
    'Track every Annex A control from ISO/IEC 27001:2022 -- applicability, justification, implementation status, and owner -- in one spreadsheet.',
    'تتبع كل ضابط من الملحق A في المواصفة ISO/IEC 27001:2022 -- القابلية للتطبيق والمبرر وحالة التنفيذ والمسؤول -- في جدول بيانات واحد.',
    '/downloads/CyberAbeer_ISO27001_2022_SoA_Tracker.xlsx',
    'CyberAbeer_ISO27001_2022_SoA_Tracker.xlsx',
    2
  ),
  (
    'Incident Response Log & MTTR',
    'سجل الاستجابة للحوادث ومتوسط زمن الإصلاح',
    'Log security incidents from detection to closure and automatically calculate mean time to respond and resolve (MTTR/MTTD).',
    'سجّل حوادث الأمن من الاكتشاف حتى الإغلاق، مع حساب تلقائي لمتوسط زمن الاستجابة والإصلاح (MTTR/MTTD).',
    '/downloads/CyberAbeer_Incident_Response_Log_MTTR.xlsx',
    'CyberAbeer_Incident_Response_Log_MTTR.xlsx',
    3
  ),
  (
    'Aegis GRC Platform',
    'منصة Aegis لإدارة الحوكمة والمخاطر والالتزام',
    'A lightweight, self-hosted GRC starter kit for tracking governance, risk, and compliance activity beyond a single spreadsheet.',
    'مجموعة أدوات خفيفة ومستضافة ذاتيًا لإدارة الحوكمة والمخاطر والالتزام، تتجاوز حدود جدول البيانات الواحد.',
    '/downloads/CyberAbeer_Aegis_GRC_Platform.zip',
    'CyberAbeer_Aegis_GRC_Platform.zip',
    4
  )
on conflict do nothing;

-- ---------------------------------------------------------------------
-- 2. Books image gallery (up to 4 images per book)
-- ---------------------------------------------------------------------
alter table books add column if not exists image_urls text[] not null default '{}';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'books_max_4_images'
  ) then
    alter table books add constraint books_max_4_images check (
      image_urls is null or array_length(image_urls, 1) is null or array_length(image_urls, 1) <= 4
    );
  end if;
end $$;

-- ---------------------------------------------------------------------
-- 3. Storage bucket for founder-uploaded media (tool images/files, book images)
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

drop policy if exists "media public read" on storage.objects;
create policy "media public read" on storage.objects for select
  using (bucket_id = 'media');

drop policy if exists "media admin insert" on storage.objects;
create policy "media admin insert" on storage.objects for insert
  with check (bucket_id = 'media' and is_platform_admin());

drop policy if exists "media admin update" on storage.objects;
create policy "media admin update" on storage.objects for update
  using (bucket_id = 'media' and is_platform_admin());

drop policy if exists "media admin delete" on storage.objects;
create policy "media admin delete" on storage.objects for delete
  using (bucket_id = 'media' and is_platform_admin());
