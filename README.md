# CyberAbeer + GreenTrust AI

CyberAbeer is Dr. Abeer Alshammari's bilingual (Arabic/English) cybersecurity governance platform: a public marketing site, a free interactive cybersecurity challenge ("First Defender: Spot the Phish"), and GreenTrust AI, an AI agent governance assessment and (future) enterprise platform.

**This README reflects the actual state of the code as of Phase 8. Application code exists and is functional — the earlier claim in this file that "application code has not been written yet" is no longer accurate and has been removed.**

## What is implemented

**Public bilingual site** (English `/en/...`, Arabic `/ar/...`): Home, About, GreenTrust marketing page, CyberAbeer Labs marketing page, Free Tools, Research, Insights, Contact, with full SEO (hreflang, sitemap, robots.txt, structured data), RTL support, and self-hosted Arabic (Tajawal/Cairo) and Latin (Inter/Space Grotesk) fonts.

**Authentication**: register, login, logout, forgot password, reset password, and persistent sessions via Supabase Auth. A protected `/account` page shows a signed-in user's total XP, badges, challenge history, and saved GreenTrust assessment results — all read through Row Level Security, not application-level checks.

**CyberAbeer Free Challenge** ("First Defender: Spot the Phish"): a five-scenario phishing-detection game. Works fully anonymously (progress in `localStorage` plus a best-effort Supabase backup), and registering after completion claims the already-earned score, XP, and badge onto the new account without losing progress.

**GreenTrust Free Assessment**: a real, deterministic 16-question assessment across eight AI agent governance domains (Visibility, Ownership & Accountability, Agent Identity, Permissions, Human Oversight, Logging & Monitoring, Lifecycle Governance, Shadow AI). No LLM is used to score it — every result comes from a fixed, disclosed point formula (`lib/assessments/greentrust-free.ts`), computed server-side so a client can never fake a better score. Works anonymously; results are always saved (silently, tied to the visitor's account if logged in, otherwise anonymous until claimed); "Email me my results" and "Request an enterprise review" are optional follow-ups.

**Lead capture**: newsletter signup, contact form, enterprise enquiry, and GreenTrust assessment lead capture all persist to Postgres via Supabase, with honeypot spam protection, per-IP rate limiting, and duplicate-safe contact upserts (by email). No form ever reports success without a confirmed database write.

**Transactional email**: a small Resend-based module (`lib/email/send.ts`) sends a welcome email on registration, an enterprise enquiry confirmation, and GreenTrust result emails. Account confirmation and password-reset emails are sent natively by Supabase Auth instead (configure their sender in the Supabase dashboard, not in this codebase). Email sending is optional: if `RESEND_API_KEY` is unset, it logs and no-ops rather than crashing.

**Analytics**: privacy-conscious, cookie-free events via Plausible (`lib/analytics/track.ts`), covering page views, language switches, both funnels end to end, and every lead-capture form. See that file's doc comment for the full canonical event list.

**Database**: Postgres via Supabase, defined entirely in versioned SQL migrations (`database/migrations/001` through `011`) — nothing depends on a manually created table. Row Level Security is enabled and forced on every tenant- or user-scoped table.

## What remains

**No automated test suite yet.** No jest/vitest/playwright config exists. The pure-logic modules (`lib/challenges/first-defender.ts`, `lib/assessments/greentrust-free.ts`) have no React/Next.js dependency and are the natural place to start.

**PayPal / paid products are intentionally not built yet.** The database schema has tables ready for it (`006_schema_commerce_security.sql`), but no payment code exists, by design — the free funnels (challenge, assessment) are meant to be fully operational first.

**CyberAbeer Labs** is currently a marketing/waitlist page only; the interactive labs platform itself (beyond the standalone First Defender challenge) is a future milestone.

Rate limiting (`lib/rate-limit.ts`) requires `UPSTASH_REDIS_REST_URL`/`TOKEN` to actually enforce limits; without them it fails open (allows requests through) rather than blocking form submissions in an environment where Redis isn't configured.

## Architecture

**Framework**: Next.js 14 (App Router), React 18, TypeScript 5 (strict mode). **i18n**: next-intl, locale-prefixed routing (`/en/...`, `/ar/...`), middleware-based locale detection. **Database & Auth**: Supabase (Postgres + Auth). `@supabase/ssr` for cookie-based server sessions, `@supabase/supabase-js` for the service-role client used only in trusted server-side code. **Validation**: zod schemas for every form and server action input. **Styling**: Tailwind CSS with a token-based design system (`design-system/styles/tokens.css`, `tailwind.config.ts`). **Rate limiting**: Upstash Redis (optional, fails open). **Email**: Resend (optional, no-ops if unconfigured). **Analytics**: Plausible.

The Next.js application lives in `design-system/`. Database migrations live in `database/migrations/` (numbered, run in order).

## Development setup

```bash
cd design-system
cp .env.example .env.local
npm install
npm run dev
```

The app will not do anything useful without a Supabase project: create one at supabase.com, then run every file in `database/migrations/` against it in numeric order (the Supabase SQL editor, or `psql`, or the Supabase CLI's `db push` all work — there is nothing migration-tool-specific about these files).

## Environment variables

All documented in `design-system/.env.example`. Summary:

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon/public key (safe for the browser) |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Server-only. Never prefix with `NEXT_PUBLIC_`. Never commit a real value. |
| `NEXT_PUBLIC_SITE_URL` | Yes | Canonical site URL (`https://cyberabeer.com` in production) |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Optional | Rate limiting; forms fail open without it |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | Optional | Analytics; no-ops without it |
| `RESEND_API_KEY` | Optional | Transactional email; no-ops without it |
| `EMAIL_FROM_ADDRESS` | Optional | Sender for transactional email |

**Never commit real values for any of these.** `.env`, `.env.local`, and `.env.*.local` are all git-ignored. A repository-wide search for committed secrets (`SUPABASE_SERVICE_ROLE_KEY=`, `sk_live`, `BEGIN PRIVATE KEY`, `AKIA...`, any `.env`-named file) has been run against this repository's GitHub history and found nothing — if that ever changes, treat it as CRITICAL and rotate the credential immediately.

## Database setup

Create a Supabase project (a separate one for staging vs. production is recommended). Then run `database/migrations/001_extensions_helpers_core.sql` through `011_greentrust_free_assessment.sql`, in numeric order. `007_rls_policies.sql` must run after `001`–`006` (it references tables they create). Nothing in the application code depends on a manually created table or a skipped migration. `008_seed_data.sql` is safe for local development and staging; review its contents before running it against production.

## Running locally

```bash
cd design-system
npm run dev
npm run typecheck
npm run lint
```

## Building

```bash
cd design-system
npm run build
npm run start
```

## Deploying

Recommended: **Vercel** for the app (built by the Next.js maintainers, zero-config App Router + Server Actions support) and **Supabase** for the database, both already the natural fit for this stack. Connect the Vercel project to this GitHub repository for automatic deploys on every push to `main`, with preview deployments on every other branch/PR. DNS for `cyberabeer.com` can stay managed wherever it is today (e.g. Hostinger) — only the DNS records need to point at Vercel; there is no requirement to host the application itself there.
