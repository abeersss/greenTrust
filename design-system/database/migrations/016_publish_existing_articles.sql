-- Migration 016: Publish the 13 pre-existing articles
-- =============================================================
-- The founder's "Phase 2" content-strategy directive (July 2026):
-- publish everything already written rather than holding it at
-- founder_review indefinitely. This migration flips the 12 flagship
-- articles seeded by 013_content_seed_flagship_articles.sql (status =
-- 'draft') and the 1 cornerstone article seeded by
-- 014_content_ai_agent_security_cornerstone.sql (status =
-- 'founder_review') to status = 'published'.
--
-- IMPORTANT: `published_at` must be set here, not just `status`.
-- `getPublishedArticles()` in lib/content/articles.ts filters on
-- `articles.status = 'published' AND articles.published_at <= now()`,
-- and neither 013 nor 014 set `published_at` at insert time (it has no
-- default -- see 002_schema_content_leads.sql). Flipping only `status`
-- would leave these articles matching the RLS policy but silently
-- invisible to every page query, exactly the "published in the
-- database but not visible on the site" failure mode this whole
-- directive exists to close out. The same gap was caught and fixed in
-- 015_content_expansion_20_articles.sql before this migration was
-- written.
--
-- Run after 012, 013, 014, and 015.

update articles
set status = 'published',
    published_at = coalesce(published_at, now()),
    reviewed_at = coalesce(reviewed_at, now())
where status <> 'published'
  and id in (
    select a.id
    from articles a
    join article_translations t on t.article_id = a.id
    where t.locale = 'en'
      and t.slug in (
        -- 12 flagship articles (013_content_seed_flagship_articles.sql)
        'cybersecurity-governance-vs-it-governance',
        'what-is-the-grcl-framework',
        'ai-agent-governance-why-autonomous-ai-needs-its-own-model',
        'post-quantum-cryptography-what-security-teams-need-to-know',
        'data-classification-101-practical-framework',
        'phishing-in-2026-ai-attacks',
        'cybersecurity-governance-frameworks-compared',
        'cybersecurity-for-beginners-first-year-roadmap',
        'cissp-vs-cism-vs-ceh-which-certification-first',
        'zero-trust-architecture-explained',
        'the-ciso-reporting-line-why-it-matters',
        'third-party-risk-management-framework',
        -- 1 cornerstone article (014_content_ai_agent_security_cornerstone.sql)
        'ai-agent-security-identity-permissions-governance'
      )
  );
