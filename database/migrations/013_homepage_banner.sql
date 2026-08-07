-- Homepage banner settings (CyberAbeer Platform Phase II).
-- A single-row table the founder edits from /founder/banner: an
-- enabled flag plus a bilingual greeting shown in a scrolling ticker
-- on the homepage, alongside the visitor's current date (computed
-- client-side, not stored here). Public read via RLS so the homepage
-- can render it for anonymous visitors; update restricted to
-- is_platform_admin(), same gate as every other founder-only table.

create table if not exists public.homepage_banner_settings (
  id integer primary key default 1,
  enabled boolean not null default true,
  greeting_en text not null default 'Hello! Welcome to CyberAbeer.',
  greeting_ar text not null default 'أهلاً بك في سايبر عبير!',
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now(),
  constraint homepage_banner_settings_singleton check (id = 1)
);

insert into public.homepage_banner_settings (id)
values (1)
on conflict (id) do nothing;

alter table public.homepage_banner_settings enable row level security;

drop policy if exists "homepage_banner_settings_select_public" on public.homepage_banner_settings;
create policy "homepage_banner_settings_select_public"
  on public.homepage_banner_settings
  for select
  using (true);

drop policy if exists "homepage_banner_settings_update_admin" on public.homepage_banner_settings;
create policy "homepage_banner_settings_update_admin"
  on public.homepage_banner_settings
  for update
  using (is_platform_admin())
  with check (is_platform_admin());
