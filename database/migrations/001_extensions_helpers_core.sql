-- =====================================================================
-- 001_extensions_helpers_core.sql
-- CyberAbeer / GreenTrust AI — Phase 3 Database
-- Extensions, shared enums, shared trigger functions, CORE domain
-- Target: Supabase-managed PostgreSQL (auth.users provided by Supabase Auth)
-- =====================================================================

-- ---------- Extensions ----------
create extension if not exists pgcrypto;      -- gen_random_uuid()
create extension if not exists "uuid-ossp";   -- fallback uuid functions
create extension if not exists citext;        -- case-insensitive email storage
create extension if not exists pg_trgm;       -- fuzzy/text search on titles & slugs

-- ---------- Shared enums ----------
create type locale_code as enum ('en','ar');
create type content_status as enum ('draft','in_review','published','archived');
create type org_type as enum ('enterprise','university','individual','government');
create type member_status as enum ('invited','active','suspended','removed');

-- ---------- Shared trigger: maintain updated_at ----------
create or replace function set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =====================================================================
-- CORE DOMAIN
-- =====================================================================

-- Organizations: represents both GreenTrust enterprise/government tenants
-- and CyberAbeer Labs university/team accounts. Individual learners never
-- get a row here (they operate as a bare auth.users + profiles record).
create table organizations (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  slug             text not null,
  org_type         org_type not null default 'individual',
  billing_email    citext,
  default_locale   locale_code not null default 'en',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  deleted_at       timestamptz,
  constraint organizations_slug_unique unique (slug)
);
create index organizations_deleted_at_idx on organizations (deleted_at);
create trigger trg_organizations_updated_at
  before update on organizations
  for each row execute function set_updated_at();

-- Profiles: 1:1 extension of Supabase auth.users. auth.users itself is
-- managed entirely by Supabase Auth (password hash, MFA factors, sessions,
-- refresh tokens) — we never duplicate that data here.
create table profiles (
  id             uuid primary key references auth.users(id) on delete cascade,
  full_name      text,
  avatar_url     text,
  locale         locale_code not null default 'en',
  timezone       text not null default 'UTC',
  platform_role  text not null default 'user'
                 check (platform_role in ('user','admin')),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  deleted_at     timestamptz
);
create trigger trg_profiles_updated_at
  before update on profiles
  for each row execute function set_updated_at();

-- Roles: fixed catalog, seeded, rarely written after launch.
create table roles (
  id           uuid primary key default gen_random_uuid(),
  key          text not null unique,   -- 'org_owner','org_admin','org_member','enterprise_lead','learner'
  name         text not null,
  scope        text not null default 'organization'
               check (scope in ('organization','platform')),
  description  text,
  created_at   timestamptz not null default now()
);

create table permissions (
  id           uuid primary key default gen_random_uuid(),
  key          text not null unique,  -- e.g. 'greentrust.agents.read'
  description  text,
  created_at   timestamptz not null default now()
);

create table role_permissions (
  role_id        uuid not null references roles(id) on delete cascade,
  permission_id  uuid not null references permissions(id) on delete cascade,
  primary key (role_id, permission_id)
);

-- Organization membership: the join between a user and an organization,
-- carrying the role used by every RLS policy in this schema.
create table organization_members (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references organizations(id) on delete cascade,
  user_id          uuid not null references auth.users(id) on delete cascade,
  role_id          uuid not null references roles(id) on delete restrict,
  status           member_status not null default 'invited',
  invited_by       uuid references auth.users(id) on delete set null,
  joined_at        timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  deleted_at       timestamptz,
  constraint organization_members_unique unique (organization_id, user_id)
);
create index organization_members_org_idx on organization_members (organization_id);
create index organization_members_user_idx on organization_members (user_id);
create trigger trg_organization_members_updated_at
  before update on organization_members
  for each row execute function set_updated_at();

-- Notifications: preferences + in-app log. Email delivery itself is handled
-- by the application's email module (Resend), not modeled here.
create table notification_preferences (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  channel     text not null check (channel in ('email','in_app')),
  category    text not null check (category in ('newsletter','product','security','billing')),
  enabled     boolean not null default true,
  updated_at  timestamptz not null default now(),
  constraint notification_preferences_unique unique (user_id, channel, category)
);

create table notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  type        text not null,
  payload     jsonb not null default '{}',
  read_at     timestamptz,
  created_at  timestamptz not null default now()
);
create index notifications_user_idx on notifications (user_id);
create index notifications_user_unread_idx on notifications (user_id) where read_at is null;

-- Note on "Sessions": Supabase Auth already stores sessions and refresh
-- tokens in its own auth schema. Duplicating that here would be redundant
-- and would create a second, easily-inconsistent source of truth. The
-- application-facing "recent activity" surface is covered instead by
-- security.login_history (see 004_schema_commerce_security.sql), which
-- records outcome/IP/user-agent for display and audit, not session state.

-- Note on "Language": there is no separate languages table. Locale is the
-- two-value enum `locale_code` used consistently across profiles,
-- organizations, contacts, and every *_translations table. Two locales are
-- in scope for the MVP; if a third is ever added, it is one enum value plus
-- new rows in *_translations tables — no schema redesign required.
