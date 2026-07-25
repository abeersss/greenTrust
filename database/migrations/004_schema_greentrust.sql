-- =====================================================================
-- 004_schema_greentrust.sql
-- GREENTRUST domain — every table below carries organization_id and is
-- locked down in 006_rls_policies.sql. This is the domain where a tenant-
-- isolation bug would be most damaging, so every child/detail table is
-- given its own organization_id column (denormalized from its parent)
-- rather than relying on a join through a parent table for row security.
-- =====================================================================

create table ai_agents (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name            text not null,
  description     text,
  agent_type      text not null default 'chatbot'
                  check (agent_type in ('chatbot','automation','copilot','autonomous')),
  status          text not null default 'active'
                  check (status in ('active','inactive','deprecated','shadow')),
  environment     text not null default 'production'
                  check (environment in ('production','staging','development')),
  discovered_at   timestamptz not null default now(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz
);
create index ai_agents_org_idx on ai_agents (organization_id);
create index ai_agents_org_status_idx on ai_agents (organization_id, status);
create trigger trg_ai_agents_updated_at before update on ai_agents
  for each row execute function set_updated_at();

-- Human accountability: who owns / is accountable for each agent. Owner
-- may be an internal profile or, before onboarding, an external contact.
create table agent_owners (
  id                  uuid primary key default gen_random_uuid(),
  organization_id     uuid not null references organizations(id) on delete cascade,
  agent_id            uuid not null references ai_agents(id) on delete cascade,
  profile_id          uuid references profiles(id) on delete set null,
  external_contact_id uuid references contacts(id) on delete set null,
  accountable         boolean not null default false,
  owner_role          text not null default 'owner' check (owner_role in ('owner','delegate')),
  assigned_at         timestamptz not null default now(),
  constraint agent_owners_owner_ref check (profile_id is not null or external_contact_id is not null)
);
create index agent_owners_agent_idx on agent_owners (agent_id);
create index agent_owners_org_idx on agent_owners (organization_id);

-- Non-human identity registry: credentials/identities held by an agent.
create table agent_identities (
  id                  uuid primary key default gen_random_uuid(),
  organization_id     uuid not null references organizations(id) on delete cascade,
  agent_id            uuid not null references ai_agents(id) on delete cascade,
  identity_type       text not null
                      check (identity_type in ('api_key','service_account','oauth_client','certificate')),
  external_identifier text not null,
  issued_at           timestamptz,
  expires_at          timestamptz,
  status              text not null default 'active' check (status in ('active','revoked','expired')),
  created_at          timestamptz not null default now()
);
create index agent_identities_agent_idx on agent_identities (agent_id);
create index agent_identities_org_idx on agent_identities (organization_id);
-- Note: external_identifier stores a reference/label (e.g. key ID, client
-- ID prefix), never the credential secret itself — secrets remain in the
-- customer's own secrets manager. This is a deliberate "avoid storing
-- unnecessary sensitive information" decision.

-- data_classifications: organization_id null = a global standard
-- (Public/Internal/Confidential/Restricted, seeded); non-null rows are an
-- organization's own custom classification.
create table data_classifications (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid references organizations(id) on delete cascade,
  key              text not null,
  sensitivity_level int not null default 0,
  created_at       timestamptz not null default now(),
  constraint data_classifications_unique unique (organization_id, key)
);

create table data_classification_translations (
  data_classification_id  uuid not null references data_classifications(id) on delete cascade,
  locale                  locale_code not null,
  name                    text not null,
  description             text,
  primary key (data_classification_id, locale)
);

create table systems_accessed (
  id                      uuid primary key default gen_random_uuid(),
  organization_id         uuid not null references organizations(id) on delete cascade,
  name                    text not null,
  system_type             text not null default 'saas'
                          check (system_type in ('saas','internal','database','api')),
  data_classification_id  uuid references data_classifications(id) on delete set null,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  deleted_at              timestamptz
);
create index systems_accessed_org_idx on systems_accessed (organization_id);
create trigger trg_systems_accessed_updated_at before update on systems_accessed
  for each row execute function set_updated_at();

create table agent_permissions (
  id                uuid primary key default gen_random_uuid(),
  organization_id   uuid not null references organizations(id) on delete cascade,
  agent_id          uuid not null references ai_agents(id) on delete cascade,
  system_id         uuid not null references systems_accessed(id) on delete cascade,
  permission_level  text not null default 'read'
                    check (permission_level in ('read','write','admin','execute')),
  granted_at        timestamptz not null default now(),
  granted_by        uuid references profiles(id) on delete set null,
  expires_at        timestamptz,
  status            text not null default 'active' check (status in ('active','revoked')),
  created_at        timestamptz not null default now()
);
create index agent_permissions_agent_idx on agent_permissions (agent_id);
create index agent_permissions_org_idx on agent_permissions (organization_id);
create index agent_permissions_system_idx on agent_permissions (system_id);

-- Risk factor catalog: global reference data (seeded), not org-scoped.
create table risk_factors (
  id             uuid primary key default gen_random_uuid(),
  key            text not null unique,
  category       text not null check (category in ('governance','technical','compliance','operational')),
  default_weight numeric not null default 1.0,
  created_at     timestamptz not null default now()
);

create table risk_factor_translations (
  risk_factor_id  uuid not null references risk_factors(id) on delete cascade,
  locale          locale_code not null,
  name            text not null,
  description     text,
  primary key (risk_factor_id, locale)
);

-- Risk assessments are immutable once status = 'final': the application
-- layer must not update a finalized row, only insert a new assessment.
-- This is the primary audit guarantee for GreenTrust's risk methodology.
create table risk_assessments (
  id                  uuid primary key default gen_random_uuid(),
  organization_id     uuid not null references organizations(id) on delete cascade,
  agent_id            uuid not null references ai_agents(id) on delete cascade,
  assessed_by         uuid references profiles(id) on delete set null,
  methodology_version text not null default 'v1',
  overall_score       numeric,
  status              text not null default 'draft' check (status in ('draft','final')),
  assessed_at         timestamptz,
  created_at          timestamptz not null default now()
);
create index risk_assessments_org_idx on risk_assessments (organization_id);
create index risk_assessments_agent_idx on risk_assessments (agent_id);

create table risk_assessment_factors (
  id                  uuid primary key default gen_random_uuid(),
  organization_id     uuid not null references organizations(id) on delete cascade,
  risk_assessment_id  uuid not null references risk_assessments(id) on delete cascade,
  risk_factor_id      uuid not null references risk_factors(id) on delete restrict,
  score               numeric not null,
  weight              numeric not null,
  notes               text,
  constraint risk_assessment_factors_unique unique (risk_assessment_id, risk_factor_id)
);
create index risk_assessment_factors_org_idx on risk_assessment_factors (organization_id);

-- Score history is an append-only time series — never overwritten — so
-- trend charts and "what did we tell the auditor last quarter" both work
-- from the same table.
create table greentrust_scores (
  id                  uuid primary key default gen_random_uuid(),
  organization_id     uuid not null references organizations(id) on delete cascade,
  agent_id            uuid references ai_agents(id) on delete cascade, -- null = org-level rollup
  score               numeric not null,
  score_breakdown     jsonb not null default '{}',
  methodology_version text not null default 'v1',
  calculated_at       timestamptz not null default now()
);
create index greentrust_scores_org_idx on greentrust_scores (organization_id, calculated_at desc);
create index greentrust_scores_agent_idx on greentrust_scores (agent_id, calculated_at desc);

create table grcl_assessments (
  id                  uuid primary key default gen_random_uuid(),
  organization_id     uuid not null references organizations(id) on delete cascade,
  agent_id            uuid references ai_agents(id) on delete cascade,
  framework_version   text not null default 'v1',
  status              text not null default 'draft' check (status in ('draft','final')),
  overall_rating      text,
  assessed_by         uuid references profiles(id) on delete set null,
  assessed_at         timestamptz,
  created_at          timestamptz not null default now()
);
create index grcl_assessments_org_idx on grcl_assessments (organization_id);

-- Agent passports are versioned, not mutated: each reissue inserts a new
-- row with a frozen snapshot of identity/permissions/owner/score at that
-- moment, and only one row per agent may have is_current = true.
create table agent_passports (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references organizations(id) on delete cascade,
  agent_id         uuid not null references ai_agents(id) on delete cascade,
  passport_number  text not null unique,
  version          int not null default 1,
  is_current       boolean not null default true,
  snapshot         jsonb not null,
  issued_at        timestamptz not null default now(),
  created_at       timestamptz not null default now()
);
create index agent_passports_agent_idx on agent_passports (agent_id, version desc);
create unique index agent_passports_current_unique on agent_passports (agent_id) where is_current;

-- Governance control catalog: global reference data (ISO 27001, NIST AI
-- RMF, seeded), extendable per organization via org_id (null = global).
create table governance_controls (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  key             text not null,
  framework       text not null check (framework in ('iso27001','nist_ai_rmf','custom')),
  category        text,
  created_at      timestamptz not null default now(),
  constraint governance_controls_unique unique (organization_id, key)
);

create table governance_control_translations (
  governance_control_id  uuid not null references governance_controls(id) on delete cascade,
  locale                 locale_code not null,
  name                   text not null,
  description            text,
  primary key (governance_control_id, locale)
);

create table control_mappings (
  id                uuid primary key default gen_random_uuid(),
  organization_id   uuid not null references organizations(id) on delete cascade,
  agent_id          uuid references ai_agents(id) on delete cascade,
  control_id        uuid not null references governance_controls(id) on delete restrict,
  status            text not null default 'not_started'
                    check (status in ('not_started','in_place','partial','not_applicable')),
  owner_id          uuid references profiles(id) on delete set null,
  last_reviewed_at  timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index control_mappings_org_idx on control_mappings (organization_id);
create trigger trg_control_mappings_updated_at before update on control_mappings
  for each row execute function set_updated_at();

-- Evidence is append-only: replacing a document creates a new row and
-- points the old row's superseded_by at it, rather than overwriting —
-- an auditor must be able to see what evidence existed at any past date.
create table evidence (
  id                  uuid primary key default gen_random_uuid(),
  organization_id     uuid not null references organizations(id) on delete cascade,
  control_mapping_id  uuid references control_mappings(id) on delete cascade,
  risk_assessment_id  uuid references risk_assessments(id) on delete cascade,
  storage_path        text not null,
  description         text,
  uploaded_by         uuid references profiles(id) on delete set null,
  superseded_by       uuid references evidence(id) on delete set null,
  uploaded_at         timestamptz not null default now()
);
create index evidence_org_idx on evidence (organization_id);

create table exceptions (
  id                  uuid primary key default gen_random_uuid(),
  organization_id     uuid not null references organizations(id) on delete cascade,
  agent_id            uuid references ai_agents(id) on delete cascade,
  control_mapping_id  uuid references control_mappings(id) on delete set null,
  reason              text not null,
  requested_by        uuid references profiles(id) on delete set null,
  status              text not null default 'pending'
                      check (status in ('pending','approved','rejected','expired')),
  expires_at          timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create index exceptions_org_idx on exceptions (organization_id);
create trigger trg_exceptions_updated_at before update on exceptions
  for each row execute function set_updated_at();

-- Generic approval log. approvable_type/approvable_id is a soft
-- (application-enforced) reference rather than a native FK, since it can
-- point at exceptions, risk_assessments, or agent_passports; every table
-- it can reference is itself organization-scoped and RLS-protected, so the
-- lack of a native FK does not create a tenant-isolation gap.
create table approvals (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references organizations(id) on delete cascade,
  approvable_type  text not null check (approvable_type in ('exception','risk_assessment','passport_reissue')),
  approvable_id    uuid not null,
  approver_id      uuid references profiles(id) on delete set null,
  decision         text not null check (decision in ('approved','rejected')),
  comments         text,
  decided_at       timestamptz not null default now()
);
create index approvals_org_idx on approvals (organization_id);
create index approvals_approvable_idx on approvals (approvable_type, approvable_id);

create table reviews (
  id                   uuid primary key default gen_random_uuid(),
  organization_id      uuid not null references organizations(id) on delete cascade,
  agent_id             uuid not null references ai_agents(id) on delete cascade,
  reviewer_id          uuid references profiles(id) on delete set null,
  review_type          text not null default 'periodic' check (review_type in ('periodic','triggered')),
  outcome              text,
  notes                text,
  reviewed_at          timestamptz not null default now(),
  next_review_due_at   timestamptz
);
create index reviews_org_idx on reviews (organization_id);
create index reviews_agent_idx on reviews (agent_id);

-- Lifecycle/audit trail: append-only, customer-facing compliance history
-- for a single agent (distinct from the platform-wide, ops-facing
-- audit_logs table in 005_schema_commerce_security.sql). No update or
-- delete path should ever be exposed for this table.
create table lifecycle_events (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references organizations(id) on delete cascade,
  agent_id         uuid not null references ai_agents(id) on delete cascade,
  event_type       text not null
                   check (event_type in ('created','activated','permission_changed','owner_changed',
                                          'risk_reassessed','deprecated','deleted')),
  actor_id         uuid references profiles(id) on delete set null,
  event_data       jsonb not null default '{}',
  occurred_at      timestamptz not null default now()
);
create index lifecycle_events_org_idx on lifecycle_events (organization_id);
create index lifecycle_events_agent_idx on lifecycle_events (agent_id, occurred_at);
