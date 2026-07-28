import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { SiteBreadcrumb } from "@/components/site/site-breadcrumb";
import { Link } from "@/lib/i18n/navigation";
import { JsonLd } from "@/components/site/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema, articleSchema } from "@/lib/seo/schema";
import { getArticleBySlug } from "@/lib/content/articles";
import { isAppLocale, type AppLocale } from "@/lib/i18n/config";
import { SourcesList } from "@/components/content/sources-list";
import { RelatedArticles } from "@/components/content/related-articles";
import { ComingSoonCta } from "@/components/content/coming-soon-cta";
import { ArticleMetaBadges } from "@/components/content/article-meta-badges";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isAppLocale(locale)) notFound();
  const article = await getArticleBySlug(locale, slug);
  if (!article) return {};

  return buildMetadata({
    locale,
    path: `insights/${slug}`,
    title: article.metaTitle ?? article.title,
    description: article.metaDescription ?? article.excerpt ?? "",
    ogImagePath: article.ogImageUrl ?? undefined,
    // Bilingual articles are independently translated, not
    // transliterated, so the English and Arabic slugs for the "same"
    // article can legitimately differ (see 013_content_seed_flagship_articles.sql).
    // Without this override, hreflang/canonical for the *other* locale
    // would silently point at a slug that doesn't exist in that locale.
  });
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isAppLocale(locale)) notFound();
  const l = locale as AppLocale;

  const article = await getArticleBySlug(l, slug);
  if (!article) notFound();

  const t = await getTranslations({ locale, namespace: "insights" });
  const tNav = await getTranslations({ locale, namespace: "nav" });

  const difficultyLabels = {
    beginner: t("difficulty.beginner"),
    intermediate: t("difficulty.intermediate"),
    advanced: t("difficulty.advanced"),
  } as const;
  const audienceLabels = {
    students: t("audience.students"),
    professionals: t("audience.professionals"),
    executives: t("audience.executives"),
    ciso: t("audience.ciso"),
    general: t("audience.general"),
  };

  return (
    <article className="mx-auto max-w-2xl px-4 py-12 tablet:px-6">
      <JsonLd
        data={[
          breadcrumbSchema(l, [
            { name: tNav("insights"), path: "insights" },
            { name: article.title, path: `insights/${slug}` },
          ]),
          articleSchema({
            locale: l,
            slug,
            title: article.title,
            description: article.excerpt,
            datePublished: article.publishedAt,
            dateModified: article.updatedAt,
            authorName: article.authorName,
            imageUrl: article.ogImageUrl,
          }),
        ]}
      />
      <SiteBreadcrumb
        items={[
          { label: tNav("home"), href: "/" },
          { label: tNav("insights"), href: "/insights" },
          { label: article.title },
        ]}
      />

      <h1 className="mt-6 font-display text-3xl font-bold text-text-primary">{article.title}</h1>
      <p className="mt-2 text-sm text-text-muted">
        {article.authorName && `${article.authorName} · `}
        {article.publishedAt &&
          `${t("publishedOn")} ${new Date(article.publishedAt).toLocaleDateString(locale)}`}
        {article.updatedAt &&
          article.updatedAt !== article.publishedAt &&
          ` · ${t("updatedOn")} ${new Date(article.updatedAt).toLocaleDateString(locale)}`}
      </p>
      <ArticleMetaBadges
        difficulty={article.difficulty}
        audience={article.audience}
        difficultyLabels={difficultyLabels}
        audienceLabels={audienceLabels}
      />

      <div className="prose prose-neutral mt-8 max-w-none dark:prose-invert">
        {/* `article.body` is authored content stored as HTML in the
            database by the (future) admin CMS, not user input, so
            rendering it directly here is safe from the same-origin
            content this route already trusts. It uses the shared
            .content-callout / .content-checklist / .content-comparison-table
            classes (styles/globals.css) for any visual pattern beyond
            plain prose. */}
        <div dangerouslySetInnerHTML={{ __html: article.body }} />
      </div>

      <SourcesList
        sources={article.sources}
        locale={l}
        title={t("sourcesTitle")}
        accessedLabel={t("accessedLabel")}
      />

      <ComingSoonCta
        relatedLabKey={article.relatedLabKey}
        title={t("tryItTitle")}
        liveDescription={t("tryItLiveDescription")}
        liveLinkLabel={t("tryItLiveLink")}
        comingSoonDescription={t("tryItComingSoonDescription")}
        comingSoonLabel={t("tryItComingSoon")}
      />

      <RelatedArticles articles={article.relatedArticles} title={t("relatedTitle")} />

      <Link href="/insights" className="mt-10 inline-block text-sm text-primary hover:underline">
        {t("backLink")}
      </Link>
    </article>
  );
}
