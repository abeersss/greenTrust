-- =====================================================================
-- 024_newsletter_cyber_brief_segment.sql
--
-- Section 22 of the Cyber Intelligence directive: connect the
-- intelligence section to a "CyberAbeer Cyber Brief" newsletter
-- subscription, and prepare (architecturally only) for a weekly
-- bilingual digest -- explicitly WITHOUT wiring any automatic sending.
--
-- This adds one new allowed value to the existing
-- newsletter_subscribers.segment check constraint (migration 002)
-- rather than creating a parallel subscription table -- the existing
-- contacts/newsletter_subscribers pipeline, rate limiting, and
-- honeypot handling already work correctly and don't need
-- reinventing. No cron job, email template, or send trigger is added
-- here: subscribers accumulate in this segment and nothing emails
-- them automatically, consistent with the directive's explicit "do
-- NOT automatically email subscribers yet" instruction. Wiring an
-- actual weekly send is a distinct, future decision that requires the
-- founder's production email sending to already be configured, which
-- it is not as of this migration.
-- =====================================================================

alter table newsletter_subscribers drop constraint if exists newsletter_subscribers_segment_check;
alter table newsletter_subscribers
  add constraint newsletter_subscribers_segment_check
  check (segment in ('enterprise_ai_governance','quantum','students','certification','cyber_intelligence_brief'));
