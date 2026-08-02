import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { CtfChallenge } from "@/components/ctf/ctf-challenge";
import { SiteBreadcrumb } from "@/components/site/site-breadcrumb";
import { JsonLd } from "@/components/site/json-ld";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema, learningResourceSchema } from "@/lib/seo/schema";
import { siteUrl } from "@/lib/seo/site";
import { isAppLocale, type AppLocale } from "@/lib/i18n/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCtfChallengeBySlug, CTF_CHALLENGES } from "@/lib/ctf/challenges";
import { pick } from "@/lib/challenges/bilingual";

const copy = {
  breadcrumbCtf: { en: "CTF Challenges", ar: "تحديات CTF" },
  titleSuffix: { en: "CyberAbeer CTF", ar: "تحديات CyberAbeer CTF" },
} as const;

export function generateStaticParams() {
  return CTF_CHALLENGES.map((challenge) => ({ slug: challenge.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isAppLocale(locale)) notFound();
  const challenge = getCtfChallengeBySlug(slug);
  if (!challenge) notFound();
  const l = locale as AppLocale;
  const title = `${pick(challenge.title, l)} | ${copy.titleSuffix[l]}`;
  const description = pick(challenge.shortDescription, l);
  return buildMetadata({ locale, path: `labs/ctf/${slug}`, title, description });
}

/**
 * Dynamic route for a single CTF challenge, following the same
 * generateMetadata + breadcrumb/learningResource JSON-LD + page-view
 * tracker pattern used by the Decision Labs challenge pages (see
 * app/[locale]/challenge/grcl-innovation/page.tsx), but nested under
 * /labs/ctf/[slug] rather than /challenge/[slug] since CTF is its own
 * track alongside Decision Labs, not one of its scenarios. Also keeps
 * the visible SiteBreadcrumb trail used by the /labs/ctf listing page
 * and the /labs/decision-labs listing page, so a visitor always knows
 * they are inside the CTF track and can navigate back up.
 */
export default async function CtfChallengePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isAppLocale(locale)) notFound();
  const l = locale as AppLocale;
  const challenge = getCtfChallengeBySlug(slug);
  if (!challenge) notFound();

  const tNav = await getTranslations({ locale, namespace: "nav" });
  const shareUrl = `${siteUrl}/${l}/labs/ctf/${slug}`;
  const supabase = await createSupabaseServerClient();
  const authResult = await supabase.auth.getUser();
  const user = authResult.data.user;

  const title = pick(challenge.title, l);
  const description = pick(challenge.shortDescription, l);

  return (
    <div data-brand="labs" className="mx-auto max-w-6xl px-4 py-8 tablet:px-6 tablet:py-12">
      <PageViewTracker event="challenge_viewed" props={{ locale: l, challengeKey: challenge.challengeKey }} />
      <JsonLd
        data={[
          breadcrumbSchema(l, [
            { name: tNav("labs"), path: "labs" },
            { name: copy.breadcrumbCtf[l], path: "labs/ctf" },
            { name: title, path: `labs/ctf/${slug}` },
          ]),
          learningResourceSchema({
            locale: l,
            path: `labs/ctf/${slug}`,
            name: title,
            description,
            isFree: true,
          }),
        ]}
      />
      <SiteBreadcrumb
        items={[
          { label: tNav("home"), href: "/" },
          { label: tNav("labs"), href: "/labs" },
          { label: copy.breadcrumbCtf[l], href: "/labs/ctf" },
          { label: title },
        ]}
      />
      <div className="mt-6">
        <CtfChallenge challengeSlug={slug} locale={l} shareUrl={shareUrl} isAuthenticated={Boolean(user)} />
      </div>
    </div>
  );
}
