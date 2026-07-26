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
import { getPublishedArticles } from "@/lib/content/articles";
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
  const articles = await getPublishedArticles(l);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 tablet:px-6">
      <JsonLd data={breadcrumbSchema(l, [{ name: tNav("insights"), path: "insights" }])} />
      <SiteBreadcrumb items={[{ label: tNav("home"), href: "/" }, { label: tNav("insights") }]} />

      <Badge variant="primary" className="mt-6">
        {t("kicker")}
      </Badge>
      <h1 className="mt-3 font-display text-3xl font-bold text-text-primary tablet:text-4xl">{t("title")}</h1>
      <p className="mt-3 max-w-2xl text-text-secondary">{t("intro")}</p>

      {articles.length === 0 ? (
        <div className="mt-12">
          <EmptyState title={t("emptyTitle")} description={t("emptyBody")} />
        </div>
      ) : (
        <div className="mt-10 grid gap-6 tablet:grid-cols-2">
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
    </div>
  );
}
