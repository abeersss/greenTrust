-- 012_certificates.sql
-- CTF Completion Certificates (2026-08-03, founder instruction)
--
-- A learner who has earned all six CyberAbeer CTF badges (each only
-- awarded server-side at score >= 80, see claimForUser in
-- design-system/lib/actions/challenge.ts) can claim a signed
-- completion certificate under their own chosen display name. The
-- certificate is viewable/verifiable by anyone with its reference
-- code or QR code at /certificate/[referenceCode] on cyberabeer.com --
-- that public verification is the entire point of a shareable
-- certificate -- while issuing a new one requires being logged in as
-- the account that actually earned the badges (enforced in
-- design-system/lib/actions/certificate.ts, not by this schema alone).
--
-- certificate_type is present (rather than a single-purpose table)
-- so a future certificate type (e.g. completing all Decision Labs)
-- can reuse this same table without a new migration.

create table if not exists certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  certificate_type text not null default 'ctf_completion',
  full_name text not null,
  reference_code text not null,
  issued_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  unique (reference_code),
  unique (user_id, certificate_type)
);

create index if not exists certificates_user_id_idx on certificates (user_id);
create index if not exists certificates_reference_code_idx on certificates (reference_code);

alter table certificates enable row level security;
alter table certificates force row level security;

-- Defense in depth only: every read/write this app performs against
-- this table goes through the service-role client in
-- lib/actions/certificate.ts (never the anon/authenticated client
-- directly), which bypasses RLS by design, same as every other
-- server-action-mediated table in this schema (attempts, xp_events,
-- user_badges, etc.). This policy exists so a signed-in user could
-- still see their own certificate row if some future client-side
-- feature ever queries this table directly.
create policy "Users can view their own certificates"
  on certificates for select
  using (auth.uid() = user_id);
