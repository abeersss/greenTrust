-- =====================================================================
-- 007_rls_policies.sql
-- Row Level Security: this file is what actually enforces "one
-- organization can never see another organization's GreenTrust or
-- Quantum data." Everything above just defines the shape; this is the
-- lock. Must run after all tables in 001-006 exist.
--
-- Trust model: the Next.js server uses the Supabase service-role key for
-- backend jobs (scoring, PDF generation, seeding, admin tooling), which
-- bypasses RLS by design — that is the one trusted path, and it only runs
-- in server-side code per the Phase 2 secrets policy. Every other path
-- (the browser, using the anon/authenticated key) is subject to every
-- policy below. FORCE ROW LEVEL SECURITY additionally applies these
-- policies even to the table owner role, closing the usual Postgres
-- superuser/owner bypass.
-- =====================================================================

-- ---------- Helper functions ----------

create or replace function is_org_member(target_org uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from organization_members m
    where m.organization_id = target_org
      and m.user_id = auth.uid()
      and m.status = 'active'
      and m.deleted_at is null
  );
$$;

create or replace function has_org_role(target_org uuid, allowed_roles text[]) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from organization_members m
    join roles r on r.id = m.role_id
    where m.organization_id = target_org
      and m.user_id = auth.uid()
      and m.status = 'active'
      and m.deleted_at is null
      and r.key = any(allowed_roles)
  );
$$;

create or replace function is_platform_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from profiles p where p.id = auth.uid() and p.platform_role = 'admin'
  );
$$;

-- ---------- CORE ----------

alter table organizations enable row level security;
alter table organizations force row level security;
create policy organizations_select on organizations for select
  using (is_org_member(id) or is_platform_admin());
create policy organizations_update on organizations for update
  using (has_org_role(id, array['org_owner','org_admin']) or is_platform_admin());

alter table organization_members enable row level security;
alter table organization_members force row level security;
create policy organization_members_select on organization_members for select
  using (is_org_member(organization_id) or is_platform_admin());
create policy organization_members_manage on organization_members for all
  using (has_org_role(organization_id, array['org_owner','org_admin']) or is_platform_admin())
  with check (has_org_role(organization_id, array['org_owner','org_admin']) or is_platform_admin());

alter table profiles enable row level security;
alter table profiles force row level security;
create policy profiles_self on profiles for select using (id = auth.uid() or is_platform_admin());
create policy profiles_self_update on profiles for update using (id = auth.uid() or is_platform_admin());

-- ---------- GREENTRUST + QUANTUM: tenant isolation ----------
-- Every table below carries a direct organization_id column. A single
-- policy per table: members of the owning organization (any active role)
-- may read/write; only the platform admin role can cross tenant lines.
-- Applied via DO block to guarantee every listed table gets the identical
-- policy — no hand-copy drift between 25 near-identical statements.

do $$
declare
  t text;
  tenant_tables text[] := array[
    'ai_agents','agent_owners','agent_identities','systems_accessed','agent_permissions',
    'risk_assessments','risk_assessment_factors','greentrust_scores','grcl_assessments',
    'agent_passports','control_mappings','evidence','exceptions','approvals','reviews',
    'lifecycle_events',
    'crypto_assets','crypto_certificates','protocols','crypto_dependencies',
    'quantum_risk_assessments','hndl_assessments','migration_plans','migration_actions',
    'quantum_readiness_scores'
  ];
begin
  foreach t in array tenant_tables loop
    execute format('alter table %I enable row level security;', t);
    execute format('alter table %I force row level security;', t);
    execute format(
      'create policy %I on %I for all using (is_org_member(organization_id) or is_platform_admin()) with check (is_org_member(organization_id) or is_platform_admin());',
      t || '_tenant_isolation', t
    );
  end loop;
end;
$$;

-- data_classifications and governance_controls are half-global: a null
-- organization_id is shared reference data readable by everyone signed
-- in; a non-null organization_id is that org's private custom extension.
alter table data_classifications enable row level security;
alter table data_classifications force row level security;
create policy data_classifications_select on data_classifications for select
  using (organization_id is null or is_org_member(organization_id) or is_platform_admin());
create policy data_classifications_insert on data_classifications for insert
  with check (organization_id is not null and has_org_role(organization_id, array['org_owner','org_admin']));
create policy data_classifications_update on data_classifications for update
  using (organization_id is not null and has_org_role(organization_id, array['org_owner','org_admin']));

alter table governance_controls enable row level security;
alter table governance_controls force row level security;
create policy governance_controls_select on governance_controls for select
  using (organization_id is null or is_org_member(organization_id) or is_platform_admin());
create policy governance_controls_insert on governance_controls for insert
  with check (organization_id is not null and has_org_role(organization_id, array['org_owner','org_admin']));

-- crypto_asset_algorithms has no direct organization_id (pure many-to-many
-- against the global algorithms catalog); isolation is enforced via the
-- parent crypto_assets row instead.
alter table crypto_asset_algorithms enable row level security;
alter table crypto_asset_algorithms force row level security;
create policy crypto_asset_algorithms_isolation on crypto_asset_algorithms for all
  using (exists (
    select 1 from crypto_assets ca
    where ca.id = crypto_asset_algorithms.crypto_asset_id
      and (is_org_member(ca.organization_id) or is_platform_admin())
  ));

-- ---------- COMMERCE: dual-owner (user OR organization) ----------

create policy subscriptions_isolation on subscriptions for all
  using (
    (user_id is not null and user_id = auth.uid())
    or (organization_id is not null and is_org_member(organization_id))
    or is_platform_admin()
  )
  with check (
    (user_id is not null and user_id = auth.uid())
    or (organization_id is not null and has_org_role(organization_id, array['org_owner','org_admin']))
    or is_platform_admin()
  );
alter table subscriptions enable row level security;
alter table subscriptions force row level security;

alter table user_entitlements enable row level security;
alter table user_entitlements force row level security;
create policy user_entitlements_isolation on user_entitlements for select
  using (
    (user_id is not null and user_id = auth.uid())
    or (organization_id is not null and is_org_member(organization_id))
    or is_platform_admin()
  );

alter table orders enable row level security;
alter table orders force row level security;
create policy orders_isolation on orders for all
  using (
    (user_id is not null and user_id = auth.uid())
    or (organization_id is not null and is_org_member(organization_id))
    or is_platform_admin()
  )
  with check (
    (user_id is not null and user_id = auth.uid())
    or (organization_id is not null and has_org_role(organization_id, array['org_owner','org_admin']))
    or is_platform_admin()
  );

alter table order_items enable row level security;
alter table order_items force row level security;
create policy order_items_isolation on order_items for select
  using (exists (
    select 1 from orders o where o.id = order_items.order_id
    and ((o.user_id is not null and o.user_id = auth.uid())
         or (o.organization_id is not null and is_org_member(o.organization_id))
         or is_platform_admin())
  ));

alter table invoices enable row level security;
alter table invoices force row level security;
create policy invoices_isolation on invoices for select
  using (exists (
    select 1 from orders o where o.id = invoices.order_id
    and ((o.user_id is not null and o.user_id = auth.uid())
         or (o.organization_id is not null and is_org_member(o.organization_id))
         or is_platform_admin())
  ));

-- payments / paypal_transactions / coupons / coupon_redemptions carry
-- financial detail beyond what a customer needs to see directly in the
-- database — the app surfaces receipts via orders/invoices instead, so
-- these tables get RLS enabled with NO select policy for regular users
-- (default-deny), readable only by the platform admin role or the
-- trusted service-role backend path.
alter table payments enable row level security;
alter table payments force row level security;
create policy payments_admin_only on payments for select using (is_platform_admin());

alter table paypal_transactions enable row level security;
alter table paypal_transactions force row level security;
create policy paypal_transactions_admin_only on paypal_transactions for select using (is_platform_admin());

alter table coupons enable row level security;
alter table coupons force row level security;
create policy coupons_admin_only on coupons for select using (is_platform_admin());

alter table coupon_redemptions enable row level security;
alter table coupon_redemptions force row level security;
create policy coupon_redemptions_admin_only on coupon_redemptions for select using (is_platform_admin());

-- ---------- LEADS/marketing data: internal by default ----------
-- Contacts, leads, campaigns, and enquiries are internal business data,
-- not something a signed-in learner or enterprise user should be able to
-- query directly. RLS is enabled with admin-only access; the application
-- writes to these tables exclusively through server-side code using the
-- service-role key (Server Actions / Route Handlers), which bypasses RLS.
do $$
declare
  t text;
  internal_tables text[] := array[
    'contacts','leads','newsletter_subscribers','campaigns','lead_sources',
    'enterprise_enquiries','assessment_leads','audit_logs','security_events'
  ];
begin
  foreach t in array internal_tables loop
    execute format('alter table %I enable row level security;', t);
    execute format('alter table %I force row level security;', t);
    execute format(
      'create policy %I on %I for select using (is_platform_admin());',
      t || '_admin_only', t
    );
  end loop;
end;
$$;

-- tool_submissions is a partial exception: a signed-in user should be able
-- to see their own past assessment results.
alter table tool_submissions enable row level security;
alter table tool_submissions force row level security;
create policy tool_submissions_select on tool_submissions for select
  using (
    (user_id is not null and user_id = auth.uid())
    or (organization_id is not null and is_org_member(organization_id))
    or is_platform_admin()
  );

-- ---------- LABS: user-owned personal data ----------

do $$
declare
  t text;
  user_owned_tables text[] := array[
    'attempts','user_learning_path_progress','user_course_progress',
    'user_module_progress','xp_events','user_xp_totals','user_badges',
    'streaks','certificates','notifications','notification_preferences',
    'login_history'
  ];
begin
  foreach t in array user_owned_tables loop
    execute format('alter table %I enable row level security;', t);
    execute format('alter table %I force row level security;', t);
    execute format(
      'create policy %I on %I for select using (user_id = auth.uid() or is_platform_admin());',
      t || '_owner_select', t
    );
  end loop;
end;
$$;

-- attempt_answers has no direct user_id; scope through its parent attempt.
alter table attempt_answers enable row level security;
alter table attempt_answers force row level security;
create policy attempt_answers_isolation on attempt_answers for select
  using (exists (
    select 1 from attempts a where a.id = attempt_answers.attempt_id
    and (a.user_id = auth.uid() or is_platform_admin())
  ));

-- consent_records / privacy_records: a user may read their own; contact-
-- only rows (pre-account) are admin-only since there is no session to
-- scope them to.
alter table consent_records enable row level security;
alter table consent_records force row level security;
create policy consent_records_select on consent_records for select
  using ((user_id is not null and user_id = auth.uid()) or is_platform_admin());

alter table privacy_records enable row level security;
alter table privacy_records force row level security;
create policy privacy_records_select on privacy_records for select
  using ((user_id is not null and user_id = auth.uid()) or is_platform_admin());

-- ---------- CONTENT/LABS catalog: public read, admin write ----------
-- Marketing content and Labs curriculum are meant to be publicly
-- readable (they render the public site); only admins write. Published
-- rows only are exposed — drafts stay invisible to anon/authenticated
-- roles. Server-side rendering for SSG/ISR uses the service-role key and
-- is unaffected by these policies.
do $$
declare
  t text;
  public_content_tables text[] := array[
    'articles','categories','tags','authors',
    'learning_paths','courses','modules','labs','challenges',
    'questions','answers','badges','levels'
  ];
begin
  foreach t in array public_content_tables loop
    execute format('alter table %I enable row level security;', t);
    execute format('alter table %I force row level security;', t);
  end loop;
end;
$$;

create policy articles_public_read on articles for select
  using (status = 'published' and deleted_at is null);
create policy articles_admin_write on articles for all
  using (is_platform_admin()) with check (is_platform_admin());

create policy categories_public_read on categories for select using (deleted_at is null);
create policy categories_admin_write on categories for all
  using (is_platform_admin()) with check (is_platform_admin());

create policy tags_public_read on tags for select using (true);
create policy authors_public_read on authors for select using (deleted_at is null);

create policy learning_paths_public_read on learning_paths for select
  using (status = 'published' and deleted_at is null);
create policy courses_public_read on courses for select
  using (status = 'published' and deleted_at is null);
create policy modules_public_read on modules for select
  using (status = 'published' and deleted_at is null);
create policy labs_public_read on labs for select
  using (status = 'published' and deleted_at is null);
create policy challenges_public_read on challenges for select
  using (status = 'published' and deleted_at is null);
create policy questions_public_read on questions for select using (true);
create policy answers_public_read on answers for select using (true);
create policy badges_public_read on badges for select using (true);
create policy levels_public_read on levels for select using (true);

create policy learning_paths_admin_write on learning_paths for all
  using (is_platform_admin()) with check (is_platform_admin());
create policy courses_admin_write on courses for all
  using (is_platform_admin()) with check (is_platform_admin());
create policy modules_admin_write on modules for all
  using (is_platform_admin()) with check (is_platform_admin());
create policy labs_admin_write on labs for all
  using (is_platform_admin()) with check (is_platform_admin());
create policy challenges_admin_write on challenges for all
  using (is_platform_admin()) with check (is_platform_admin());

-- Translation companion tables inherit read access via a join back to
-- their published parent, and are admin-write only.
create policy article_translations_public_read on article_translations for select
  using (exists (select 1 from articles a where a.id = article_translations.article_id
                 and a.status = 'published' and a.deleted_at is null));
alter table article_translations enable row level security;
alter table article_translations force row level security;
create policy article_translations_admin_write on article_translations for all
  using (is_platform_admin()) with check (is_platform_admin());

-- Note: every table above has been explicitly handled. Every remaining
-- table in the schema is covered by the three blocks below so that no
-- table in `public` is ever left with RLS disabled by omission.

-- ---------- Internal RBAC / SEO config: never exposed to the client API ----------
-- These are read by the application exclusively through the service-role
-- key (server-side); the anon/authenticated client roles get no policy at
-- all, which is a default-deny once RLS is enabled.
do $$
declare
  t text;
  admin_only_tables text[] := array['roles','permissions','role_permissions','seo_redirects'];
begin
  foreach t in array admin_only_tables loop
    execute format('alter table %I enable row level security;', t);
    execute format('alter table %I force row level security;', t);
    execute format(
      'create policy %I on %I for select using (is_platform_admin());',
      t || '_admin_only', t
    );
  end loop;
end;
$$;

-- ---------- Global catalogs: public read, admin write ----------
-- Referenced by public pricing/labs pages and by GreenTrust/Quantum UI
-- once a user is inside their own organization's data (the catalogs
-- themselves carry no organization_id and no sensitive detail).
do $$
declare
  t text;
  public_catalog_tables text[] := array[
    'algorithms','risk_factors','entitlements','plans','products',
    'plan_entitlements','leaderboard_snapshots'
  ];
begin
  foreach t in array public_catalog_tables loop
    execute format('alter table %I enable row level security;', t);
    execute format('alter table %I force row level security;', t);
    execute format(
      'create policy %I on %I for select using (true);',
      t || '_public_read', t
    );
    execute format(
      'create policy %I on %I for all using (is_platform_admin()) with check (is_platform_admin());',
      t || '_admin_write', t
    );
  end loop;
end;
$$;
-- plans/products intentionally expose only active/inactive pricing data —
-- no payment or customer detail lives on these tables (see COMMERCE
-- policies above for orders/payments, which stay locked down).

-- ---------- Translation companion tables: mirror their parent ----------
-- Simple case: the parent has an unconditional public-read policy already
-- (tags, authors, badges, levels, questions, answers, algorithms,
-- risk_factors, products, plan catalog) — the translation row is exactly
-- as sensitive as its parent, so it gets the same unconditional read.
do $$
declare
  t text;
  simple_translation_tables text[] := array[
    'tag_translations','author_translations','badge_translations','level_translations',
    'question_translations','answer_translations','algorithm_translations',
    'risk_factor_translations','product_translations'
  ];
begin
  foreach t in array simple_translation_tables loop
    execute format('alter table %I enable row level security;', t);
    execute format('alter table %I force row level security;', t);
    execute format(
      'create policy %I on %I for select using (true);',
      t || '_public_read', t
    );
    execute format(
      'create policy %I on %I for all using (is_platform_admin()) with check (is_platform_admin());',
      t || '_admin_write', t
    );
  end loop;
end;
$$;

-- Conditional case: the parent is only public once published/not-deleted,
-- so the translation must check that same condition via its parent table.
alter table category_translations enable row level security;
alter table category_translations force row level security;
create policy category_translations_public_read on category_translations for select
  using (exists (select 1 from categories c where c.id = category_translations.category_id and c.deleted_at is null));
create policy category_translations_admin_write on category_translations for all
  using (is_platform_admin()) with check (is_platform_admin());

alter table article_tags enable row level security;
alter table article_tags force row level security;
create policy article_tags_public_read on article_tags for select
  using (exists (select 1 from articles a where a.id = article_tags.article_id
                 and a.status = 'published' and a.deleted_at is null));
create policy article_tags_admin_write on article_tags for all
  using (is_platform_admin()) with check (is_platform_admin());

do $$
declare
  pair record;
begin
  for pair in
    select * from (values
      ('learning_path_translations','learning_paths','learning_path_id'),
      ('course_translations','courses','course_id'),
      ('module_translations','modules','module_id'),
      ('lab_translations','labs','lab_id'),
      ('challenge_translations','challenges','challenge_id')
    ) as v(child, parent, fk_col)
  loop
    execute format('alter table %I enable row level security;', pair.child);
    execute format('alter table %I force row level security;', pair.child);
    execute format(
      'create policy %I on %I for select using (exists (select 1 from %I p where p.id = %I.%I and p.status = ''published'' and p.deleted_at is null));',
      pair.child || '_public_read', pair.child, pair.parent, pair.child, pair.fk_col
    );
    execute format(
      'create policy %I on %I for all using (is_platform_admin()) with check (is_platform_admin());',
      pair.child || '_admin_write', pair.child
    );
  end loop;
end;
$$;

-- Org-scoped reference translations: readable only alongside their global-
-- or-own-org parent, same as data_classifications/governance_controls.
alter table data_classification_translations enable row level security;
alter table data_classification_translations force row level security;
create policy data_classification_translations_read on data_classification_translations for select
  using (exists (
    select 1 from data_classifications d where d.id = data_classification_translations.data_classification_id
    and (d.organization_id is null or is_org_member(d.organization_id) or is_platform_admin())
  ));

alter table governance_control_translations enable row level security;
alter table governance_control_translations force row level security;
create policy governance_control_translations_read on governance_control_translations for select
  using (exists (
    select 1 from governance_controls g where g.id = governance_control_translations.governance_control_id
    and (g.organization_id is null or is_org_member(g.organization_id) or is_platform_admin())
  ));

-- Final safety net: confirm nothing in `public` was missed. This query is
-- for manual verification after applying migrations — it should return
-- zero rows on a correctly-configured database.
-- select tablename from pg_tables
--   where schemaname = 'public'
--     and tablename not in (select tablename from pg_policies)
--     and tablename not in (
--       select relname from pg_class c join pg_namespace n on n.oid = c.relnamespace
--       where n.nspname = 'public' and c.relrowsecurity = false
--     );
