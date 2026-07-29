import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { JsonLd } from "@/components/site/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";
import { isAppLocale, type AppLocale } from "@/lib/i18n/config";
import { notFound } from "next/navigation";
import { Building2, GraduationCap, ArrowRight } from "lucide-react";
import { ArticleCard } from "@/components/content/article-card";
import { getPublishedArticles } from "@/lib/content/articles";
import { formatArticleDate } from "@/lib/content/format";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  const t = await getTranslations({ locale, namespace: "seo" });
  return buildMetadata({ locale, path: "", title: t("homeTitle"), description: t("homeDescription") });
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  const l = locale as AppLocale;

  const t = await getTranslations({ locale, namespace: "home" });
  const tCommon = await getTranslations({ locale, namespace: "common" });
  const tInsights = await getTranslations({ locale, namespace: "insights" });

  const latestArticles = (await getPublishedArticles(l)).slice(0, 3);

  return (
    <div className="flex flex-col">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: t("heroTitle"),
        }}
      />

      {/* Hero */}
      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center tablet:py-24">
          <Badge variant="primary" className="mb-4">
            {t("heroKicker")}
          </Badge>
          <h1 className="font-display text-3xl font-bold text-text-primary tablet:text-5xl">
            {t("heroTitle")}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-text-secondary">{t("heroSubtitle")}</p>
        </div>
      </section>

      {/* Two journeys */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 tablet:px-6">
        <h2 className="text-center font-display text-2xl font-semibold text-text-primary">
          {t("journeysHeading")}
        </h2>
        <div className="mt-8 grid gap-6 tablet:grid-cols-2">
          <Card data-brand="greentrust" className="flex flex-col p-2">
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-md bg-primary-50 text-primary-700">
                <Building2 className="h-6 w-6" aria-hidden="true" />
              </div>
              <CardTitle className="font-display text-xl">{t("orgTitle")}</CardTitle>
              <CardDescription>{t("orgBody")}</CardDescription>
            </CardHeader>
            <CardFooter className="mt-auto">
              <Button asChild>
                <Link href="/greentrust">
                  {t("orgCta")}
                  <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card data-brand="labs" className="flex flex-col p-2">
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-md bg-accent/10 text-accent">
                <GraduationCap className="h-6 w-6" aria-hidden="true" />
              </div>
              <CardTitle className="font-display text-xl">{t("learnerTitle")}</CardTitle>
              <CardDescription>{t("learnerBody")}</CardDescription>
            </CardHeader>
            <CardFooter className="mt-auto">
              <Button asChild>
                <Link href="/labs">
                  {t("learnerCta")}
                  <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* Founder */}
      <section className="border-y border-border bg-surface-raised">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center tablet:px-6">
          <h2 className="font-display text-2xl font-semibold text-text-primary">{t("founderHeading")}</h2>
          <p className="mt-3 text-text-secondary">{t("founderBody")}</p>
          <Button asChild variant="outline" className="mt-6">
            <Link href="/about">{t("founderCta")}</Link>
          </Button>
        </div>
      </section>

      {/* Free tools / Research / Insights teasers */}
      <section className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-16 tablet:grid-cols-3 tablet:px-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("toolsHeading")}</CardTitle>
            <CardDescription>{t("toolsBody")}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild variant="ghost" size="sm">
              <Link href="/free-tools">{tCommon("learnMore")}</Link>
            </Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("researchHeading")}</CardTitle>
            <CardDescription>{t("researchBody")}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild variant="ghost" size="sm">
              <Link href="/research">{tCommon("learnMore")}</Link>
            </Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("insightsHeading")}</CardTitle>
            <CardDescription>{t("insightsBody")}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild variant="ghost" size="sm">
              <Link href="/insights">{tCommon("learnMore")}</Link>
            </Button>
          </CardFooter>
        </Card>
      </section>

      {/* Latest CyberAbeer Insights */}
      {latestArticles.length > 0 && (
        <section className="border-t border-border bg-surface-raised">
          <div className="mx-auto max-w-6xl px-4 py-16 tablet:px-6">
            <div className="flex flex-col items-start justify-between gap-4 tablet:flex-row tablet:items-end">
              <div>
                <h2 className="font-display text-2xl font-semibold text-text-primary">
                  {t("latestInsightsHeading")}
                </h2>
                <p className="mt-2 max-w-2xl text-text-secondary">{t("latestInsightsIntro")}</p>
              </div>
              <Button asChild variant="outline" className="shrink-0">
                <Link href="/insights">
                  {t("exploreAllInsightsCta")}
                  <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
                </Link>
              </Button>
            </div>
            <div className="mt-8 grid gap-6 tablet:grid-cols-3">
              {latestArticles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  dateLabel={formatArticleDate(l, article.publishedAt)}
                  readingTimeLabel={
                    article.readingTimeMinutes
                      ? tInsights("readingTimeMinutes", { minutes: article.readingTimeMinutes })
                      : null
                  }
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
