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
      </p>

      <div className="prose prose-neutral mt-8 max-w-none dark:prose-invert">
        {/* `article.body` is authored content stored as HTML in the
            database by the (future) admin CMS, not user input, so
            rendering it directly here is safe from the same-origin
            content this route already trusts. */}
        <div dangerouslySetInnerHTML={{ __html: article.body }} />
      </div>

      <Link href="/insights" className="mt-10 inline-block text-sm text-primary hover:underline">
        {t("backLink")}
      </Link>
    </article>
  );
}
