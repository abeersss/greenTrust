-- =====================================================================
-- Migration 026: Internal linking -- wire existing GRC and AI-agent
-- articles to the two newly-shipped Decision Labs (PHASE 8 SEO pass,
-- 2026-08-01).
--
-- Context: grcl-innovation and agent-zero both shipped as playable
-- labs, but no published article's `related_lab_key` pointed to
-- either one yet -- every article's "Try it yourself" CTA
-- (components/content/coming-soon-cta.tsx, rendered from
-- app/[locale]/insights/[slug]/page.tsx) was either null (honest
-- "coming soon") or pointed at an older lab, even on articles whose
-- entire subject is the GRCL framework or AI agent governance. This
-- is real internal linking, not decorative: `related_lab_key` is a
-- column on `articles` read by getArticleBySlug() and rendered as a
-- real `/challenge/${relatedLabKey}` link, so this directly increases
-- both labs' internal PageRank/crawl signal and gives readers of
-- directly-relevant articles a real "try it" path into the lab that
-- matches what they just read.
--
-- Only touches rows that are (a) already published and (b) currently
-- NULL, so it can never silently overwrite a `related_lab_key` some
-- earlier migration or admin action had already set on purpose.
-- =====================================================================

-- Agent Zero: articles about autonomous AI agent governance, identity/
-- permission scope, prompt injection, and real agent-breach incidents
-- -- exactly the containment scenarios the lab plays out.
update articles a
set related_lab_key = 'agent-zero'
from article_translations at
where at.article_id = a.id
  and at.locale = 'en'
  and at.slug in (
    'ai-agent-governance-why-autonomous-ai-needs-its-own-model',
    'ai-agent-security-identity-permissions-governance',
    'hugging-face-autonomous-ai-agent-breach',
    'prompt-injection-agentic-ai-guidance-department-of-war'
  )
  and a.status = 'published'
  and a.related_lab_key is null;

-- GRCL: Innovation Under Fire: articles about the GRCL framework
-- itself, GRC vs IT/cybersecurity governance, and GRC career content
-- -- the lab is a direct dramatization of Dr. Abeer Alshammari's GRCL
-- framework, so "What Is the GRCL Framework?" in particular is as
-- close to a 1:1 topical match as this site has.
update articles a
set related_lab_key = 'grcl-innovation'
from article_translations at
where at.article_id = a.id
  and at.locale = 'en'
  and at.slug in (
    'what-is-the-grcl-framework',
    'cybersecurity-governance-frameworks-compared',
    'cybersecurity-governance-vs-it-governance',
    'grc-career-roadmap'
  )
  and a.status = 'published'
  and a.related_lab_key is null;

-- Verification query (run manually after the two updates above to
-- confirm the expected 8 rows changed and nothing else moved):
-- select at.slug, a.related_lab_key
-- from article_translations at join articles a on a.id = at.article_id
-- where at.locale = 'en' and a.related_lab_key in ('agent-zero', 'grcl-innovation')
-- order by a.related_lab_key, at.slug;
