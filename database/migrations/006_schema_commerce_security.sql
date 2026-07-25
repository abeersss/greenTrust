-- =====================================================================
-- 006_schema_commerce_security.sql
-- COMMERCE domain (provider-agnostic per Phase 2 PaymentProvider design)
-- + SECURITY domain (platform audit trail, distinct from GreenTrust's
-- customer-facing lifecycle_events).
-- =====================================================================

-- ---------------------------------------------------------------------
-- COMMERCE
-- ---------------------------------------------------------------------

create table products (
  id           uuid primary key default gen_random_uuid(),
  key          text not null unique,
  product_type text not null
               check (product_type in ('labs_membership','greentrust_assessment','digital_download',
                                        'consulting','university_license')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create trigger trg_products_updated_at before update on products
  for each row execute function set_updated_at();

create table product_translations (
  product_id   uuid not null references products(id) on delete cascade,
  locale       locale_code not null,
  name         text not null,
  description  text,
  primary key (product_id, locale)
);

create table plans (
  id               uuid primary key default gen_random_uuid(),
  product_id       uuid not null references products(id) on delete cascade,
  key              text not null unique,
  billing_interval text not null default 'one_time' check (billing_interval in ('monthly','annual','one_time')),
  price_amount     numeric not null,
  currency         text not null default 'USD',
  is_active        boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index plans_product_idx on plans (product_id);
create trigger trg_plans_updated_at before update on plans
  for each row execute function set_updated_at();

create table entitlements (
  id          uuid primary key default gen_random_uuid(),
  key         text not null unique, -- 'labs_premium_content','greentrust_assessment_pro','university_seats'
  description text
);

create table plan_entitlements (
  plan_id        uuid not null references plans(id) on delete cascade,
  entitlement_id uuid not null references entitlements(id) on delete cascade,
  limit_value    int,
  primary key (plan_id, entitlement_id)
);

-- Exactly one of user_id / organization_id is set: an individual Labs
-- learner subscribes as a user; a GreenTrust or university account
-- subscribes as an organization.
create table subscriptions (
  id                       uuid primary key default gen_random_uuid(),
  user_id                  uuid references auth.users(id) on delete cascade,
  organization_id          uuid references organizations(id) on delete cascade,
  plan_id                  uuid not null references plans(id) on delete restrict,
  status                   text not null default 'active'
                           check (status in ('trialing','active','past_due','canceled','expired')),
  provider                 text not null default 'paypal',
  external_subscription_ref text,
  current_period_start    timestamptz,
  current_period_end      timestamptz,
  cancel_at_period_end    boolean not null default false,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now(),
  constraint subscriptions_owner_check check (
    (user_id is not null and organization_id is null) or
    (user_id is null and organization_id is not null)
  )
);
create index subscriptions_user_idx on subscriptions (user_id);
create index subscriptions_org_idx on subscriptions (organization_id);
create trigger trg_subscriptions_updated_at before update on subscriptions
  for each row execute function set_updated_at();

-- The resolved "what can this account do right now" table — what the app
-- actually checks at runtime, kept in sync with subscriptions/one-time
-- purchases rather than re-derived on every request.
create table user_entitlements (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid references auth.users(id) on delete cascade,
  organization_id  uuid references organizations(id) on delete cascade,
  entitlement_id   uuid not null references entitlements(id) on delete cascade,
  source           text not null default 'subscription'
                   check (source in ('subscription','one_time_purchase','manual_grant')),
  source_id        uuid,
  granted_at       timestamptz not null default now(),
  expires_at       timestamptz,
  constraint user_entitlements_owner_check check (
    (user_id is not null and organization_id is null) or
    (user_id is null and organization_id is not null)
  )
);
create index user_entitlements_user_idx on user_entitlements (user_id);
create index user_entitlements_org_idx on user_entitlements (organization_id);

-- Provider-agnostic order record. One-time digital-product purchases are
-- simply an order with an order_item referencing a product (product_type
-- = 'digital_download') — there is no separate one_time_purchases table.
create table orders (
  id               uuid primary key default gen_random_uuid(),
  order_number     text not null unique,
  contact_id       uuid references contacts(id) on delete set null,
  user_id          uuid references auth.users(id) on delete set null,
  organization_id  uuid references organizations(id) on delete set null,
  status           text not null default 'pending'
                   check (status in ('pending','paid','failed','refunded','canceled')),
  subtotal         numeric not null default 0,
  discount_total   numeric not null default 0,
  tax_total        numeric not null default 0,
  total            numeric not null default 0,
  currency         text not null default 'USD',
  method           text not null default 'paypal'
                   check (method in ('paypal','manual_invoice','bank_transfer','purchase_order')),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index orders_user_idx on orders (user_id);
create index orders_org_idx on orders (organization_id);
create trigger trg_orders_updated_at before update on orders
  for each row execute function set_updated_at();

create table order_items (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid not null references orders(id) on delete cascade,
  plan_id      uuid references plans(id) on delete set null,
  product_id   uuid references products(id) on delete set null,
  description  text,
  quantity     int not null default 1,
  unit_price   numeric not null,
  total_price  numeric not null
);
create index order_items_order_idx on order_items (order_id);

create table payments (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid not null references orders(id) on delete cascade,
  provider     text not null default 'paypal' check (provider in ('paypal','manual')),
  amount       numeric not null,
  currency     text not null default 'USD',
  status       text not null default 'pending' check (status in ('pending','completed','failed','refunded')),
  processed_at timestamptz,
  created_at   timestamptz not null default now()
);
create index payments_order_idx on payments (order_id);

-- PayPal-specific detail, kept out of the provider-agnostic `payments`
-- table so a future second provider does not inherit PayPal-only fields.
create table paypal_transactions (
  id                uuid primary key default gen_random_uuid(),
  payment_id        uuid not null references payments(id) on delete cascade,
  paypal_order_id   text not null,
  paypal_capture_id text,
  payer_email       citext,
  webhook_event_id  text,
  verified          boolean not null default false,
  raw_payload       jsonb,
  created_at        timestamptz not null default now(),
  constraint paypal_transactions_capture_unique unique (paypal_capture_id)
);
create index paypal_transactions_payment_idx on paypal_transactions (payment_id);

create table coupons (
  id              uuid primary key default gen_random_uuid(),
  code            text not null unique,
  discount_type   text not null default 'percent' check (discount_type in ('percent','fixed')),
  discount_value  numeric not null,
  max_redemptions int,
  redeemed_count  int not null default 0,
  valid_from      timestamptz,
  valid_until     timestamptz,
  created_at      timestamptz not null default now()
);

create table coupon_redemptions (
  id          uuid primary key default gen_random_uuid(),
  coupon_id   uuid not null references coupons(id) on delete cascade,
  order_id    uuid not null references orders(id) on delete cascade,
  redeemed_at timestamptz not null default now(),
  constraint coupon_redemptions_unique unique (coupon_id, order_id)
);

create table invoices (
  id             uuid primary key default gen_random_uuid(),
  order_id       uuid not null references orders(id) on delete cascade,
  invoice_number text not null unique,
  issued_to_name text,
  issued_to_address text,
  pdf_url        text,
  issued_at      timestamptz not null default now(),
  due_at         timestamptz,
  status         text not null default 'draft' check (status in ('draft','sent','paid','overdue','void'))
);
create index invoices_order_idx on invoices (order_id);

-- ---------------------------------------------------------------------
-- SECURITY
-- Platform-wide, ops-facing audit trail. Distinct from GreenTrust's
-- customer-facing lifecycle_events: audit_logs/security_events answer
-- "what happened on our platform" for CyberAbeer's own ops and incident
-- response; lifecycle_events answers "what happened to my agent" for a
-- customer's own auditors. Both are append-only; neither is ever updated
-- or deleted by the application.
-- ---------------------------------------------------------------------

create table audit_logs (
  id          uuid primary key default gen_random_uuid(),
  actor_type  text not null default 'user' check (actor_type in ('user','system','admin')),
  actor_id    uuid,
  action      text not null,
  entity_type text,
  entity_id   uuid,
  before_data jsonb,
  after_data  jsonb,
  ip_address  inet,
  user_agent  text,
  created_at  timestamptz not null default now()
);
create index audit_logs_entity_idx on audit_logs (entity_type, entity_id);
create index audit_logs_created_idx on audit_logs (created_at);
create index audit_logs_actor_idx on audit_logs (actor_id);

create table security_events (
  id         uuid primary key default gen_random_uuid(),
  event_type text not null,
  severity   text not null default 'info' check (severity in ('info','warning','critical')),
  user_id    uuid references auth.users(id) on delete set null,
  ip_address inet,
  metadata   jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create index security_events_user_idx on security_events (user_id);
create index security_events_created_idx on security_events (created_at);

-- Application-facing "recent login activity" — a slim, short-retention
-- complement to what Supabase Auth already tracks internally.
create table login_history (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  ip_address inet,
  user_agent text,
  success    boolean not null,
  mfa_used   boolean not null default false,
  created_at timestamptz not null default now()
);
create index login_history_user_idx on login_history (user_id, created_at desc);

-- Consent is append-only: a change in consent state is a new row, never
-- an update, so the platform can always show what consent was in force
-- at a given point in time (PDPL/GDPR-relevant).
create table consent_records (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users(id) on delete set null,
  contact_id   uuid references contacts(id) on delete set null,
  consent_type text not null
               check (consent_type in ('marketing_email','terms_of_service','privacy_policy','cookies')),
  version      text not null,
  granted      boolean not null,
  ip_address   inet,
  recorded_at  timestamptz not null default now(),
  constraint consent_records_owner_check check (user_id is not null or contact_id is not null)
);
create index consent_records_user_idx on consent_records (user_id);
create index consent_records_contact_idx on consent_records (contact_id);

create table privacy_records (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references auth.users(id) on delete set null,
  contact_id     uuid references contacts(id) on delete set null,
  request_type   text not null check (request_type in ('access','export','deletion','rectification')),
  status         text not null default 'received'
                 check (status in ('received','in_progress','completed','rejected')),
  requested_at   timestamptz not null default now(),
  completed_at   timestamptz,
  notes          text,
  constraint privacy_records_owner_check check (user_id is not null or contact_id is not null)
);
create index privacy_records_user_idx on privacy_records (user_id);
