import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { SiteBreadcrumb } from "@/components/site/site-breadcrumb";
import { ArticleCard } from "@/components/content/article-card";
import { Link } from "@/lib/i18n/navigation";
import { JsonLd } from "@/components/site/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema } from "@/lib/seo/schema";
import { getPublishedArticles, getTopLevelPillars, getArticlesByTag } from "@/lib/content/articles";
import { formatArticleDate } from "@/lib/content/format";
import { getPillarIcon } from "@/lib/content/pillar-icons";
import { isAppLocale, type AppLocale } from "@/lib/i18n/config";

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
    path: "insights",
    title: t("insightsTitle"),
    description: t("insightsDescription"),
  });
}

export default async function InsightsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  const l = locale as AppLocale;

  const t = await getTranslations({ locale, namespace: "insights" });
  const tNav = await getTranslations({ locale, namespace: "nav" });

  const [articles, pillars, drAbeerArticles] = await Promise.all([
    getPublishedArticles(l),
    getTopLevelPillars(l),
    getArticlesByTag(l, "dr-abeer-insights"),
  ]);

  // Most recently published article anchors the "Featured Insight" slot;
  // the rest of the feed (minus that one) becomes "Latest Insights" so
  // nothing appears twice on the page.
  const [featured, ...rest] = articles;
  const latest = rest.slice(0, 6);

  const readingTime = (minutes: number | null) => (minutes ? t("readingTimeMinutes", { minutes }) : null);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 tablet:px-6">
      <JsonLd data={breadcrumbSchema(l, [{ name: tNav("insights"), path: "insights" }])} />
      <SiteBreadcrumb items={[{ label: tNav("home"), href: "/" }, { label: tNav("insights") }]} />

      <Badge variant="primary" className="mt-6">
        {t("kicker")}
      </Badge>
      <h1 className="mt-3 font-display text-3xl font-bold text-text-primary tablet:text-4xl">{t("title")}</h1>
      <p className="mt-3 max-w-2xl text-text-secondary">{t("intro")}</p>

      {articles.length === 0 && pillars.length === 0 ? (
        <div className="mt-12">
          <EmptyState title={t("emptyTitle")} description={t("emptyBody")} />
        </div>
      ) : (
        <div className="mt-10 flex flex-col gap-14">
          {featured && (
            <section>
              <h2 className="mb-4 font-display text-lg font-semibold text-text-primary">{t("featuredLabel")}</h2>
              <ArticleCard
                article={featured}
                featured
                dateLabel={formatArticleDate(l, featured.publishedAt)}
                readingTimeLabel={readingTime(featured.readingTimeMinutes)}
              />
            </section>
          )}

          {pillars.length > 0 && (
            <section>
              <h2 className="mb-4 font-display text-lg font-semibold text-text-primary">{t("popularTopicsTitle")}</h2>
              <div className="grid grid-cols-2 gap-3 tablet:grid-cols-3 desktop:grid-cols-6">
                {pillars.map((pillar) => {
                  const Icon = getPillarIcon(pillar.key);
                  return (
                    <Link
                      key={pillar.id}
                      href={`/topics/${pillar.slug}`}
                      className="group flex flex-col items-center gap-2 rounded-card border border-border bg-surface-raised p-4 text-center transition-all duration-200 hover:-translate-y-1 hover:border-primary-300 hover:shadow-md"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary-50 text-primary-700 transition-colors group-hover:bg-primary-700 group-hover:text-white">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <span className="text-xs font-medium text-text-primary tablet:text-sm">{pillar.name}</span>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {latest.length > 0 && (
            <section>
              <div className="mb-4 flex items-baseline justify-between">
                <h2 className="font-display text-lg font-semibold text-text-primary">{t("latestTitle")}</h2>
              </div>
              <div className="grid gap-6 tablet:grid-cols-2 desktop:grid-cols-3">
                {latest.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    dateLabel={formatArticleDate(l, article.publishedAt)}
                    readingTimeLabel={readingTime(article.readingTimeMinutes)}
                  />
                ))}
              </div>
            </section>
          )}

          {drAbeerArticles.length > 0 && (
            <section>
              <h2 className="mb-4 font-display text-lg font-semibold text-text-primary">{t("drAbeerTitle")}</h2>
              <div className="grid gap-6 tablet:grid-cols-2 desktop:grid-cols-3">
                {drAbeerArticles.slice(0, 3).map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    dateLabel={formatArticleDate(l, article.publishedAt)}
                    readingTimeLabel={readingTime(article.readingTimeMinutes)}
                  />
                ))}
              </div>
            </section>
          )}

          {articles.length === 0 && (
            <EmptyState title={t("emptyTitle")} description={t("emptyBody")} />
          )}
        </div>
      )}
    </div>
  );
}
