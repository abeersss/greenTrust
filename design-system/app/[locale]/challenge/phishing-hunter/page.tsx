import { redirect, notFound } from "next/navigation";
import { isAppLocale } from "@/lib/i18n/config";

/**
 * Broken-link fix found while building the Learning Center (Learning &
 * Careers content phase): `related_lab_key = 'phishing-hunter'` was
 * seeded onto several articles in 013_content_seed_flagship_articles.sql,
 * and both `components/content/coming-soon-cta.tsx` (the article
 * "Try it yourself" CTA) and `lib/achievements/catalog.ts`
 * (`challengeKey: "phishing-hunter"`) build/reference that same key as
 * a route segment: `/challenge/${relatedLabKey}`. The actual live
 * route for that challenge is `/challenge/first-defender` (the folder
 * name predates the later "Phishing Hunter" branding and was never
 * renamed). Rather than rename the live, auth/XP-wired route -- a
 * much larger blast radius touching a subsystem with a long history of
 * fragile bugs in this project -- this is a thin, permanent redirect
 * so every existing and future `/challenge/phishing-hunter` link
 * resolves correctly instead of 404ing.
 */
export default async function PhishingHunterRedirect({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  redirect(`/${locale}/challenge/first-defender`);
}
