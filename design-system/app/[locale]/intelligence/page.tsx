import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SiteBreadcrumb } from "@/components/site/site-breadcrumb";
import { Link } from "@/lib/i18n/navigation";
import { JsonLd } from "@/components/site/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema } from "@/lib/seo/schema";
import { getCategoryBySlug, getArticlesByCategoryIds, getLatestIntelligenceArticles } from "@/lib/content/articles";
import { isAppLocale, type AppLocale } from "@/lib/i18n/config";
import { DailyBrief } from "@/components/content/daily-brief";
import { IntelligenceCard } from "@/components/content/intelligence-card";
import { NewsletterForm } from "@/components/forms/newsletter-form";
import type { IntelSeverity, IntelStoryStatus } from "@/lib/content/articles";

/**
 * /intelligence and /ar/intelligence -- the Cyber Intelligence hub
 * (Section 1 of the founder's directive). Uses a fixed "intelligence"
 * path segment in both locales, the same pattern /learn already uses,
 * since this is a standalone top-level section rather than translated
 * per-locale content taxonomy. The pillar category itself is still
 * resolved from the DB via its locale-specific slug (set in
 * 022_cyber_intelligence_schema.sql) so the page degrades to an honest
 * empty state if the schema migration hasn't been run yet, exactly
 * like every other content page in this codebase.
 */
const PILLAR_SLUG_BY_LOCALE: Record<AppLocale, string> = {
  en: "intelligence",
  ar: "استخبارات-الأمن-السيبراني",
};

// ISR: same reasoning as /insights -- this page makes no dynamic API
// calls (cookies/headers), so Next.js would otherwise cache it fully
// static at build time and never pick up newly auto-published
// intelligence articles without a full redeploy. Revalidating
// periodically keeps "Today's Cyber Brief" and the latest-articles
// grid current between deploys.
export const revalidate = 1800;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  const t = await getTranslations({ locale, namespace: "seo" });
  return buildMetadata({
    locale,
    path: "intelligence",
    title: t("intelligenceTitle"),
    description: t("intelligenceDescription"),
  });
}

export default async function IntelligencePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  const l = locale as AppLocale;

  const t = await getTranslations({ locale, namespace: "intelligence" });
  const tNav = await getTranslations({ locale, namespace: "nav" });

  const category = await getCategoryBySlug(l, PILLAR_SLUG_BY_LOCALE[l]);
  const hubs = category?.hubs ?? [];
  const categoryIds = category ? [category.id, ...hubs.map((h) => h.id)] : [];
  const [articles, brief] = await Promise.all([
    getArticlesByCategoryIds(l, categoryIds),
    getLatestIntelligenceArticles(l, 5),
  ]);

  const severityLabels = {
    critical: t("severity.critical"),
    high: t("severity.high"),
    important: t("severity.important"),
    informational: t("severity.informational"),
  } as Record<IntelSeverity, string>;
  const storyStatusLabels = {
    developing: t("storyStatus.developing"),
    confirmed: t("storyStatus.confirmed"),
    updated: t("storyStatus.updated"),
    resolved: t("storyStatus.resolved"),
  } as Record<IntelStoryStatus, string>;

  const dateFormatter = new Intl.DateTimeFormat(locale, { year: "numeric", month: "short", day: "numeric" });

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 tablet:px-6">
      <JsonLd data={breadcrumbSchema(l, [{ name: t("kicker"), path: "intelligence" }])} />
      <SiteBreadcrumb items={[{ label: tNav("home"), href: "/" }, { label: t("kicker") }]} />

      <Badge variant="primary" className="mt-6">
        {t("kicker")}
      </Badge>
      <h1 className="mt-3 font-display text-3xl font-bold text-text-primary tablet:text-4xl">{t("title")}</h1>
      <p className="mt-3 max-w-2xl text-text-secondary">{t("intro")}</p>

      <DailyBrief
        articles={brief}
        title={t("dailyBriefTitle")}
        readingTimeLabel={t("dailyBriefReadingTime")}
        severityLabels={severityLabels}
        emptyText={t("dailyBriefEmpty")}
      />

      {hubs.length > 0 && (
        <section className="mt-12">
          <h2 className="font-display text-lg font-semibold text-text-primary">{t("hubsTitle")}</h2>
          <div className="mt-4 grid gap-4 tablet:grid-cols-2 desktop:grid-cols-3">
            {hubs.map((hub) => (
              <Link key={hub.id} href={`/topics/${hub.slug}`}>
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardHeader>
                    <CardTitle className="text-base">{hub.name}</CardTitle>
                    {hub.description && <CardDescription>{hub.description}</CardDescription>}
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mt-12">
        <h2 className="font-display text-lg font-semibold text-text-primary">{t("latestTitle")}</h2>
        {articles.length === 0 ? (
          <div className="mt-6">
            <EmptyState title={t("emptyTitle")} description={t("emptyBody")} />
          </div>
        ) : (
          <div className="mt-6 grid gap-6 tablet:grid-cols-2 desktop:grid-cols-3">
            {articles.map((article) => (
              <IntelligenceCard
                key={article.id}
                article={article}
                publishedLabel={article.publishedAt ? `${t("publishedOn")} ${dateFormatter.format(new Date(article.publishedAt))}` : null}
                updatedLabel={
                  article.updatedAt && article.updatedAt !== article.publishedAt
                    ? `${t("updatedOn")} ${dateFormatter.format(new Date(article.updatedAt))}`
                    : null
                }
                severityLabels={severityLabels}
                storyStatusLabels={storyStatusLabels}
                menaRelevanceLabel={t("menaRelevanceLabel")}
              />
            ))}
          </div>
        )}
      </section>

      {/* Section 22: CyberAbeer Cyber Brief subscription. Reuses the
          existing newsletter_subscribers pipeline with a new segment
          (024_newsletter_cyber_brief_segment.sql) -- subscribers
          accumulate here but nothing auto-emails them yet. */}
      <section className="mt-14 rounded-card border border-border bg-surface-raised p-6 tablet:p-8">
        <h2 className="font-display text-lg font-semibold text-text-primary">{t("newsletterTitle")}</h2>
        <p className="mt-2 max-w-xl text-sm text-text-secondary">{t("newsletterBody")}</p>
        <div className="mt-4">
          <NewsletterForm locale={l} segment="cyber_intelligence_brief" />
        </div>
      </section>

      <Link href="/insights" className="mt-10 inline-block text-sm text-primary hover:underline">
        {tNav("insights")}
      </Link>
    </div>
  );
}
