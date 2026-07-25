-- =====================================================================
-- 008_seed_data.sql
-- Reference/catalog data required for the app to function on day one.
-- Safe to re-run: every insert is keyed off a unique business key.
-- =====================================================================

-- ---------- Roles & permissions ----------
insert into roles (key, name, scope, description) values
  ('org_owner',      'Organization Owner',   'organization', 'Full control of an organization, billing, and membership'),
  ('org_admin',       'Organization Admin',    'organization', 'Manage agents, assessments, and members within an organization'),
  ('org_member',      'Organization Member',   'organization', 'Read/contribute within an organization, no billing or member management'),
  ('enterprise_lead', 'Enterprise Lead',       'organization', 'Enterprise contact prior to full account setup'),
  ('learner',         'Learner',               'platform',     'Individual CyberAbeer Labs learner account')
on conflict (key) do nothing;

insert into permissions (key, description) values
  ('greentrust.agents.read',   'View AI agent inventory'),
  ('greentrust.agents.write',  'Create/update AI agent records'),
  ('greentrust.risk.read',     'View risk assessments and scores'),
  ('greentrust.risk.write',    'Create/finalize risk assessments'),
  ('greentrust.controls.write','Manage governance control mappings'),
  ('quantum.assets.read',      'View cryptographic inventory'),
  ('quantum.assets.write',     'Create/update cryptographic inventory'),
  ('billing.manage',           'Manage subscriptions and payment methods'),
  ('members.manage',           'Invite/remove organization members')
on conflict (key) do nothing;

-- ---------- Labs: XP levels ----------
insert into levels (level_number, xp_required) values
  (1, 0), (2, 100), (3, 250), (4, 500), (5, 900),
  (6, 1400), (7, 2000), (8, 2800), (9, 3800), (10, 5000)
on conflict (level_number) do nothing;

-- ---------- Labs: starter badges ----------
insert into badges (key, criteria, xp_bonus) values
  ('first_challenge_completed', '{"type":"challenge_count","min":1}', 25),
  ('week_one_streak',           '{"type":"streak_days","min":7}',      50),
  ('foundations_path_complete', '{"type":"path_complete","path":"foundations"}', 100)
on conflict (key) do nothing;

-- ---------- Leads: sources ----------
insert into lead_sources (key, description) values
  ('organic',   'Organic search'),
  ('instagram', 'Instagram'),
  ('linkedin',  'LinkedIn'),
  ('youtube',   'YouTube'),
  ('referral',  'Referral / word of mouth'),
  ('direct',    'Direct / type-in traffic')
on conflict (key) do nothing;

-- ---------- GreenTrust: global data classifications ----------
insert into data_classifications (organization_id, key, sensitivity_level) values
  (null, 'public',       0),
  (null, 'internal',     1),
  (null, 'confidential', 2),
  (null, 'restricted',   3)
on conflict (organization_id, key) do nothing;

-- ---------- GreenTrust: risk factor catalog ----------
insert into risk_factors (key, category, default_weight) values
  ('unowned_agent',            'governance', 1.5),
  ('excessive_permissions',    'technical',  1.5),
  ('no_periodic_review',       'governance', 1.0),
  ('shadow_ai_discovery',      'operational',1.5),
  ('sensitive_data_access',    'compliance', 1.5),
  ('credential_never_rotated', 'technical',  1.0)
on conflict (key) do nothing;

-- ---------- GreenTrust: governance control catalog (starter set) ----------
insert into governance_controls (organization_id, key, framework, category) values
  (null, 'iso27001.a.5.1',  'iso27001',   'Policies for information security'),
  (null, 'iso27001.a.8.2',  'iso27001',   'Privileged access rights'),
  (null, 'iso27001.a.5.23', 'iso27001',   'Information security for cloud services'),
  (null, 'nist_ai_rmf.govern.1', 'nist_ai_rmf', 'AI governance policies and accountability'),
  (null, 'nist_ai_rmf.map.1',    'nist_ai_rmf', 'AI system context and inventory')
on conflict (organization_id, key) do nothing;

-- ---------- Quantum: algorithm catalog ----------
insert into algorithms (key, family, quantum_vulnerable, nist_pqc_status) values
  ('rsa-2048',      'asymmetric', true,  'not_applicable'),
  ('ecdsa-p256',     'signature',  true,  'not_applicable'),
  ('aes-256',        'symmetric',  false, 'not_applicable'),
  ('sha-256',        'hash',       false, 'not_applicable'),
  ('sha-1',          'hash',       true,  'deprecated'),
  ('kyber-768',      'kem',        false, 'standardized'),
  ('dilithium-3',    'signature',  false, 'standardized')
on conflict (key) do nothing;

-- ---------- Commerce: products & plans ----------
insert into products (key, product_type) values
  ('labs_membership',        'labs_membership'),
  ('greentrust_assessment',  'greentrust_assessment'),
  ('greentrust_consulting',  'consulting'),
  ('digital_resource_pack',  'digital_download'),
  ('university_license',     'university_license')
on conflict (key) do nothing;

insert into plans (product_id, key, billing_interval, price_amount, currency, is_active)
select p.id, v.key, v.billing_interval, v.price_amount, 'USD', true
from (values
  ('labs_free',                'one_time', 0),
  ('labs_premium_monthly',     'monthly',  9),
  ('labs_premium_annual',      'annual',   79),
  ('greentrust_free_assessment','one_time', 0),
  ('greentrust_professional',  'one_time', 1500),
  ('greentrust_sme_annual',    'annual',   6000)
) as v(key, billing_interval, price_amount)
join products p on
  p.key = case
    when v.key like 'labs%' then 'labs_membership'
    else 'greentrust_assessment'
  end
on conflict (key) do nothing;

-- ---------- Entitlements ----------
insert into entitlements (key, description) values
  ('labs_premium_content',      'Access to premium learning paths and labs'),
  ('greentrust_assessment_pro', 'Full GreenTrust professional assessment report'),
  ('university_seats',          'Seat allocation for a university/team license')
on conflict (key) do nothing;
