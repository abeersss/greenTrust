-- =====================================================================
-- 005_schema_quantum.sql
-- QUANTUM domain — cryptographic inventory, HNDL and quantum risk,
-- migration planning. Same organization_id + RLS pattern as GreenTrust.
-- Note: the certificate-inventory table here is named `crypto_certificates`
-- (not `certificates`) to avoid colliding with the Labs domain's
-- learner-completion `certificates` table defined in 003_schema_labs.sql.
-- =====================================================================

-- Algorithm catalog: global reference data (seeded).
create table algorithms (
  id                 uuid primary key default gen_random_uuid(),
  key                text not null unique,
  family             text not null check (family in ('symmetric','asymmetric','hash','signature','kem')),
  quantum_vulnerable boolean not null default true,
  nist_pqc_status    text not null default 'not_applicable'
                     check (nist_pqc_status in ('not_applicable','candidate','standardized','deprecated')),
  created_at         timestamptz not null default now()
);

create table algorithm_translations (
  algorithm_id  uuid not null references algorithms(id) on delete cascade,
  locale        locale_code not null,
  name          text not null,
  description   text,
  primary key (algorithm_id, locale)
);

create table crypto_assets (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  system_id       uuid references systems_accessed(id) on delete set null,
  name            text not null,
  asset_type      text not null default 'certificate'
                  check (asset_type in ('certificate','key','library','protocol_impl')),
  discovered_at   timestamptz not null default now(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz
);
create index crypto_assets_org_idx on crypto_assets (organization_id);
create trigger trg_crypto_assets_updated_at before update on crypto_assets
  for each row execute function set_updated_at();

create table crypto_asset_algorithms (
  crypto_asset_id  uuid not null references crypto_assets(id) on delete cascade,
  algorithm_id     uuid not null references algorithms(id) on delete restrict,
  key_size         int,
  usage_context    text,
  primary key (crypto_asset_id, algorithm_id)
);

create table crypto_certificates (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references organizations(id) on delete cascade,
  crypto_asset_id  uuid references crypto_assets(id) on delete cascade,
  subject          text not null,
  issuer           text,
  serial_number    text,
  algorithm_id     uuid references algorithms(id) on delete set null,
  not_before       timestamptz,
  not_after        timestamptz,
  status           text not null default 'valid' check (status in ('valid','expired','revoked')),
  created_at       timestamptz not null default now()
);
create index crypto_certificates_org_idx on crypto_certificates (organization_id);
create index crypto_certificates_expiry_idx on crypto_certificates (not_after);

create table protocols (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  system_id       uuid references systems_accessed(id) on delete set null,
  name            text not null,
  protocol_type   text not null default 'tls' check (protocol_type in ('tls','ssh','ipsec','custom')),
  version         text,
  quantum_safe    boolean not null default false,
  created_at      timestamptz not null default now()
);
create index protocols_org_idx on protocols (organization_id);

create table crypto_dependencies (
  id                   uuid primary key default gen_random_uuid(),
  organization_id      uuid not null references organizations(id) on delete cascade,
  crypto_asset_id      uuid not null references crypto_assets(id) on delete cascade,
  depends_on_asset_id  uuid not null references crypto_assets(id) on delete cascade,
  dependency_type      text,
  notes                text,
  constraint crypto_dependencies_unique unique (crypto_asset_id, depends_on_asset_id),
  constraint crypto_dependencies_no_self check (crypto_asset_id <> depends_on_asset_id)
);
create index crypto_dependencies_org_idx on crypto_dependencies (organization_id);

create table quantum_risk_assessments (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references organizations(id) on delete cascade,
  crypto_asset_id  uuid references crypto_assets(id) on delete cascade,
  assessed_by      uuid references profiles(id) on delete set null,
  risk_level       text not null default 'medium' check (risk_level in ('low','medium','high','critical')),
  rationale        text,
  assessed_at      timestamptz not null default now(),
  created_at       timestamptz not null default now()
);
create index quantum_risk_assessments_org_idx on quantum_risk_assessments (organization_id);

-- "Harvest Now, Decrypt Later" is evaluated separately from general
-- quantum risk because it weighs data-longevity requirements against
-- migration timelines, not just algorithm strength.
create table hndl_assessments (
  id                          uuid primary key default gen_random_uuid(),
  organization_id             uuid not null references organizations(id) on delete cascade,
  crypto_asset_id             uuid references crypto_assets(id) on delete cascade,
  data_classification_id      uuid references data_classifications(id) on delete set null,
  hndl_risk                   text not null default 'medium' check (hndl_risk in ('low','medium','high','critical')),
  data_sensitivity_window_years int,
  rationale                   text,
  assessed_at                 timestamptz not null default now(),
  created_at                  timestamptz not null default now()
);
create index hndl_assessments_org_idx on hndl_assessments (organization_id);

create table migration_plans (
  id                      uuid primary key default gen_random_uuid(),
  organization_id         uuid not null references organizations(id) on delete cascade,
  name                    text not null,
  target_completion_date  date,
  status                  text not null default 'draft' check (status in ('draft','active','completed','on_hold')),
  owner_id                uuid references profiles(id) on delete set null,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);
create index migration_plans_org_idx on migration_plans (organization_id);
create trigger trg_migration_plans_updated_at before update on migration_plans
  for each row execute function set_updated_at();

create table migration_actions (
  id                  uuid primary key default gen_random_uuid(),
  organization_id     uuid not null references organizations(id) on delete cascade,
  migration_plan_id   uuid not null references migration_plans(id) on delete cascade,
  crypto_asset_id     uuid references crypto_assets(id) on delete set null,
  action_type         text not null
                      check (action_type in ('replace_algorithm','rotate_cert','update_library','retire_protocol')),
  target_algorithm_id uuid references algorithms(id) on delete set null,
  status              text not null default 'not_started'
                      check (status in ('not_started','in_progress','blocked','completed')),
  due_date            date,
  completed_at        timestamptz,
  assigned_to         uuid references profiles(id) on delete set null,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create index migration_actions_org_idx on migration_actions (organization_id);
create index migration_actions_plan_idx on migration_actions (migration_plan_id);
create trigger trg_migration_actions_updated_at before update on migration_actions
  for each row execute function set_updated_at();

create table quantum_readiness_scores (
  id                  uuid primary key default gen_random_uuid(),
  organization_id     uuid not null references organizations(id) on delete cascade,
  score               numeric not null,
  score_breakdown     jsonb not null default '{}',
  methodology_version text not null default 'v1',
  calculated_at       timestamptz not null default now()
);
create index quantum_readiness_scores_org_idx on quantum_readiness_scores (organization_id, calculated_at desc);
