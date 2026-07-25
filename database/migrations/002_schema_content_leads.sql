-- =====================================================================
-- 002_schema_content_leads.sql
-- CONTENT domain (translatable-entity pattern) + LEADS domain
-- =====================================================================

-- ---------------------------------------------------------------------
-- CONTENT
-- Pattern: one language-neutral parent row (identity, workflow, relations)
-- plus one *_translations row per locale (title, slug, body, SEO fields).
-- This is deliberately NOT one table per language — a single parent keeps
-- publishing workflow, authorship, and pillar/cluster relationships in one
-- place, while translations can be added, edited, or left in-progress
-- independently per locale (matching the Phase 1 requirement that Arabic
-- and English content strategies are independent, not mirrored).
-- ---------------------------------------------------------------------

create table authors (
  id           uuid primary key default gen_random_uuid(),
  profile_id   uuid references profiles(id) on delete set null,
  display_name text not null,
  avatar_url   text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  deleted_at   timestamptz
);
create trigger trg_authors_updated_at before update on authors
  for each row execute function set_updated_at();

create table author_translations (
  author_id  uuid not null references authors(id) on delete cascade,
  locale     locale_code not null,
  bio        text,
  primary key (author_id, locale)
);

create table categories (
  id         uuid primary key default gen_random_uuid(),
  key        text not null unique,
  is_pillar  boolean not null default false,
  parent_id  uuid references categories(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create trigger trg_categories_updated_at before update on categories
  for each row execute function set_updated_at();

create table category_translations (
  category_id      uuid not null references categories(id) on delete cascade,
  locale           locale_code not null,
  name             text not null,
  slug             text not null,
  description      text,
  meta_title       text,
  meta_description text,
  primary key (category_id, locale),
  constraint category_translations_slug_locale_unique unique (locale, slug)
);

create table tags (
  id         uuid primary key default gen_random_uuid(),
  key        text not null unique,
  created_at timestamptz not null default now()
);

create table tag_translations (
  tag_id  uuid not null references tags(id) on delete cascade,
  locale  locale_code not null,
  name    text not null,
  slug    text not null,
  primary key (tag_id, locale),
  constraint tag_translations_slug_locale_unique unique (locale, slug)
);

create table articles (
  id            uuid primary key default gen_random_uuid(),
  author_id     uuid references authors(id) on delete set null,
  category_id   uuid references categories(id) on delete set null,
  status        content_status not null default 'draft',
  schema_type   text not null default 'Article'
                check (schema_type in ('Article','FAQPage','HowTo')),
  published_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz
);
create index articles_status_idx on articles (status) where deleted_at is null;
create index articles_category_idx on articles (category_id);
create trigger trg_articles_updated_at before update on articles
  for each row execute function set_updated_at();

create table article_translations (
  article_id           uuid not null references articles(id) on delete cascade,
  locale               locale_code not null,
  title                text not null,
  slug                 text not null,
  excerpt              text,
  body                 text not null,
  meta_title           text,
  meta_description     text,
  og_image_url         text,
  reading_time_minutes int,
  primary key (article_id, locale),
  constraint article_translations_slug_locale_unique unique (locale, slug)
);
create index article_translations_locale_idx on article_translations (locale);
create index article_translations_title_trgm_idx on article_translations
  using gin (title gin_trgm_ops);

create table article_tags (
  article_id  uuid not null references articles(id) on delete cascade,
  tag_id      uuid not null references tags(id) on delete cascade,
  primary key (article_id, tag_id)
);

-- Pillar <-> supporting-article linking is expressed through categories
-- (is_pillar = true marks the pillar category; supporting articles share
-- that category_id), matching the Phase 1 content-cluster model directly.

create table seo_redirects (
  id         uuid primary key default gen_random_uuid(),
  locale     locale_code not null,
  old_path   text not null,
  new_path   text not null,
  created_at timestamptz not null default now(),
  constraint seo_redirects_unique unique (locale, old_path)
);

-- ---------------------------------------------------------------------
-- LEADS
-- One pipeline serves both the GreenTrust and CyberAbeer Labs funnels.
-- ---------------------------------------------------------------------

create table lead_sources (
  id          uuid primary key default gen_random_uuid(),
  key         text not null unique, -- 'organic','instagram','linkedin','youtube','referral','direct'
  description text
);

create table campaigns (
  id           uuid primary key default gen_random_uuid(),
  key          text not null unique,
  name         text not null,
  utm_source   text,
  utm_medium   text,
  utm_campaign text,
  starts_at    timestamptz,
  ends_at      timestamptz,
  created_at   timestamptz not null default now()
);

-- A contact is the pre-account identity of a person (visitor who gave an
-- email). If they later register, contacts.user_id is backfilled so lead
-- history merges with their account instead of forking into two records.
create table contacts (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete set null,
  email      citext not null,
  first_name text,
  last_name  text,
  phone      text,
  company    text,
  locale     locale_code not null default 'en',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint contacts_email_unique unique (email)
);
create index contacts_user_idx on contacts (user_id);
create trigger trg_contacts_updated_at before update on contacts
  for each row execute function set_updated_at();

create table newsletter_subscribers (
  id              uuid primary key default gen_random_uuid(),
  contact_id      uuid not null references contacts(id) on delete cascade,
  segment         text not null
                  check (segment in ('enterprise_ai_governance','quantum','students','certification')),
  status          text not null default 'subscribed'
                  check (status in ('subscribed','unsubscribed','bounced')),
  subscribed_at   timestamptz not null default now(),
  unsubscribed_at timestamptz,
  constraint newsletter_subscribers_unique unique (contact_id, segment)
);

create table leads (
  id          uuid primary key default gen_random_uuid(),
  contact_id  uuid not null references contacts(id) on delete cascade,
  source_id   uuid references lead_sources(id) on delete set null,
  campaign_id uuid references campaigns(id) on delete set null,
  page_path   text,
  locale      locale_code,
  segment     text,
  consent_at  timestamptz,
  created_at  timestamptz not null default now()
);
create index leads_contact_idx on leads (contact_id);
create index leads_created_idx on leads (created_at);

-- Free-tool interaction log: GreenTrust quick assessments, quantum
-- assessments, and the beginner skill assessment all write here. Kept
-- domain-neutral (tool_key discriminates) rather than one table per tool,
-- since the shape (inputs -> result/score) is identical across all three.
create table tool_submissions (
  id              uuid primary key default gen_random_uuid(),
  tool_key        text not null
                  check (tool_key in ('greentrust_quick_assessment','quantum_quick_assessment','skill_assessment')),
  user_id         uuid references auth.users(id) on delete set null,
  contact_id      uuid references contacts(id) on delete set null,
  organization_id uuid references organizations(id) on delete set null,
  locale          locale_code not null default 'en',
  inputs          jsonb not null,
  result          jsonb not null,
  score           numeric,
  created_at      timestamptz not null default now()
);
create index tool_submissions_tool_idx on tool_submissions (tool_key);
create index tool_submissions_org_idx on tool_submissions (organization_id);
create index tool_submissions_user_idx on tool_submissions (user_id);

create table assessment_leads (
  id                  uuid primary key default gen_random_uuid(),
  lead_id             uuid not null references leads(id) on delete cascade,
  tool_submission_id  uuid not null references tool_submissions(id) on delete cascade,
  created_at          timestamptz not null default now(),
  constraint assessment_leads_unique unique (lead_id, tool_submission_id)
);

create table enterprise_enquiries (
  id                uuid primary key default gen_random_uuid(),
  contact_id        uuid not null references contacts(id) on delete cascade,
  organization_name text,
  role_title        text,
  use_case          text,
  timeline          text,
  message           text,
  status            text not null default 'new'
                    check (status in ('new','contacted','qualified','closed')),
  assigned_to       uuid references profiles(id) on delete set null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index enterprise_enquiries_status_idx on enterprise_enquiries (status);
create trigger trg_enterprise_enquiries_updated_at before update on enterprise_enquiries
  for each row execute function set_updated_at();
