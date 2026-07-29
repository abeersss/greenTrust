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
import { getArticlesByCategoryIds, getCategoryBySlug, getCategoryLocaleSlugs } from "@/lib/content/articles";
import { isAppLocale, type AppLocale } from "@/lib/i18n/config";

/**
 * Single generic route for every pillar and hub landing page (Sections
 * 4-10 of the content spec: GRCL Knowledge Hub, AI Agent Governance
 * Hub, Post-Quantum Hub, Data Classification Hub, Cybersecurity
 * Governance Hub, plus the 6 top-level pillars). One template instead
 * of 11 near-identical page files, resolved at request time by slug
 * against the `categories` table seeded in
 * 012_content_engine_expansion.sql.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; pillar: string }>;
}): Promise<Metadata> {
  const { locale, pillar } = await params;
  if (!isAppLocale(locale)) notFound();
  const category = await getCategoryBySlug(locale, pillar);
  if (!category) return {};
  const t = await getTranslations({ locale, namespace: "seo" });

  // Category slugs are independently translated per locale (see
  // getCategoryLocaleSlugs), so hreflang must use each locale's own
  // slug rather than reusing the current locale's `pillar` param.
  const localeSlugs = await getCategoryLocaleSlugs(category.id);

  return buildMetadata({
    locale,
    path: `topics/${pillar}`,
    title: category.metaTitle ?? `${category.name} | ${t("topicsTitleSuffix")}`,
    description: category.metaDescription ?? category.description ?? "",
    alternatePaths: Object.fromEntries(
      Object.entries(localeSlugs).map(([l, s]) => [l, `topics/${s}`])
    ),
  });
}

export default async function TopicPage({
  params,
}: {
  params: Promise<{ locale: string; pillar: string }>;
}) {
  const { locale, pillar } = await params;
  if (!isAppLocale(locale)) notFound();
  const l = locale as AppLocale;

  const category = await getCategoryBySlug(l, pillar);
  if (!category) notFound();

  const t = await getTranslations({ locale, namespace: "topics" });
  const tNav = await getTranslations({ locale, namespace: "nav" });

  const articleCategoryIds = [category.id, ...category.hubs.map((h) => h.id)];
  const articles = await getArticlesByCategoryIds(l, articleCategoryIds);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 tablet:px-6">
      <JsonLd
        data={breadcrumbSchema(l, [
          { name: tNav("insights"), path: "insights" },
          { name: category.name, path: `topics/${pillar}` },
        ])}
      />
      <SiteBreadcrumb
        items={[
          { label: tNav("home"), href: "/" },
          { label: tNav("insights"), href: "/insights" },
          { label: category.name },
        ]}
      />

      <Badge variant="primary" className="mt-6">
        {t("kicker")}
      </Badge>
      <h1 className="mt-3 font-display text-3xl font-bold text-text-primary tablet:text-4xl">{category.name}</h1>
      {category.description && <p className="mt-3 max-w-2xl text-text-secondary">{category.description}</p>}

      {category.hubs.length > 0 && (
        <section className="mt-8">
          <h2 className="font-display text-lg font-semibold text-text-primary">{t("hubsTitle")}</h2>
          <div className="mt-4 grid gap-4 tablet:grid-cols-2">
            {category.hubs.map((hub) => (
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

      <section className="mt-10">
        <h2 className="font-display text-lg font-semibold text-text-primary">{t("articlesTitle")}</h2>
        {articles.length === 0 ? (
          <div className="mt-6">
            <EmptyState title={t("emptyTitle")} description={t("emptyBody")} />
          </div>
        ) : (
          <div className="mt-6 grid gap-6 tablet:grid-cols-2">
            {articles.map((article) => (
              <Link key={article.id} href={`/insights/${article.slug}`}>
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardHeader>
                    {article.categoryName && (
                      <Badge variant="outline" className="w-fit">
                        {article.categoryName}
                      </Badge>
                    )}
                    <CardTitle>{article.title}</CardTitle>
                    {article.excerpt && <CardDescription>{article.excerpt}</CardDescription>}
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      <Link href="/insights" className="mt-10 inline-block text-sm text-primary hover:underline">
        {t("backLink")}
      </Link>
    </div>
  );
}
