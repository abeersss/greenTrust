-- =====================================================================
-- 028_newsletter_campaigns.sql
--
-- CyberAbeer Platform Phase II, Batch 2: Newsletter. Founder-composed
-- campaigns sent to real newsletter_subscribers rows (migration 002,
-- extended by 024) via the existing Resend email module
-- (design-system/lib/email/send.ts). One row per send attempt:
-- inserted with status 'sending' right before the loop starts, then
-- flipped to 'sent' or 'failed' with final counts once it completes.
--
-- Delivery itself happens application-side (the founder's own
-- authenticated session loops the current subscriber list and calls
-- the Resend HTTP API per recipient) -- there is no DB-level cron or
-- trigger here, consistent with migration 024's explicit "no
-- automatic sending" note. This migration only adds the table that
-- lets the founder actually trigger and log a send by hand.
-- =====================================================================

create table newsletter_campaigns (
  id              uuid primary key default gen_random_uuid(),
  created_by      uuid references profiles(id) on delete set null,
  segment         text not null
                  check (segment in ('all','enterprise_ai_governance','quantum','students','certification','cyber_intelligence_brief')),
  subject         text not null,
  body_html       text not null,
  status          text not null default 'draft'
                  check (status in ('draft','sending','sent','failed')),
  recipient_count int not null default 0,
  sent_count      int not null default 0,
  failed_count    int not null default 0,
  created_at      timestamptz not null default now(),
  sent_at         timestamptz
);
create index newsletter_campaigns_status_idx on newsletter_campaigns (status);
create index newsletter_campaigns_created_idx on newsletter_campaigns (created_at);

-- Founder-only, same as every other internal marketing table (see
-- migration 007's internal_tables block) -- except this one also needs
-- INSERT/UPDATE from the founder's own cookie-bound session (to log the
-- send), not just SELECT, so it gets its own explicit "for all" policy
-- rather than joining the generic admin-read-only array.
alter table newsletter_campaigns enable row level security;
alter table newsletter_campaigns force row level security;
create policy newsletter_campaigns_admin_all on newsletter_campaigns for all
  using (is_platform_admin()) with check (is_platform_admin());
