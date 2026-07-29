import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Globe2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SiteBreadcrumb } from "@/components/site/site-breadcrumb";
import { Link } from "@/lib/i18n/navigation";
import { JsonLd } from "@/components/site/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema, articleSchema } from "@/lib/seo/schema";
import { getArticleBySlug, getArticleLocaleSlugs } from "@/lib/content/articles";
import { isAppLocale, type AppLocale } from "@/lib/i18n/config";
import { SourcesList } from "@/components/content/sources-list";
import { RelatedArticles } from "@/components/content/related-articles";
import { SeverityBadge } from "@/components/content/severity-badge";
import { StoryStatusBadge } from "@/components/content/story-status-badge";
import { ExecutiveView } from "@/components/content/executive-view";
import { VulnerabilityPanel } from "@/components/content/vulnerability-panel";
import type { ExploitStatus, CyberAbeerPriority } from "@/lib/content/articles";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isAppLocale(locale)) notFound();
  const article = await getArticleBySlug(locale, slug);
  if (!article) return {};

  const localeSlugs = await getArticleLocaleSlugs(article.id);

  return buildMetadata({
    locale,
    path: `intelligence/${slug}`,
    title: article.metaTitle ?? article.title,
    description: article.metaDescription ?? article.excerpt ?? "",
    ogImagePath: article.ogImageUrl ?? undefined,
    alternatePaths: Object.fromEntries(
      Object.entries(localeSlugs).map(([l, s]) => [l, `intelligence/${s}`])
    ),
  });
}

/**
 * Cyber Intelligence article detail page. Mirrors /insights/[slug]
 * (same body-rendering / sources / related-articles pattern) but adds
 * the intelligence-specific surfaces the founder's directive requires:
 * severity + developing-story status at the top, an Executive View
 * callout before the full analysis, a structured Vulnerability
 * Intelligence panel for CVE-bearing items, and NewsArticle schema
 * (Section 27) instead of Article. A regular Insights article routed
 * here would 404 via getArticleBySlug returning null for any slug
 * that doesn't exist -- this route only ever resolves real published
 * articles, intelligence or not, same as /insights/[slug].
 */
export default async function IntelligenceArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isAppLocale(locale)) notFound();
  const l = locale as AppLocale;

  const article = await getArticleBySlug(l, slug);
  if (!article) notFound();

  const t = await getTranslations({ locale, namespace: "intelligence" });
  const tNav = await getTranslations({ locale, namespace: "nav" });

  const severityLabels = {
    critical: t("severity.critical"),
    high: t("severity.high"),
    important: t("severity.important"),
    informational: t("severity.informational"),
  } as const;
  const storyStatusLabels = {
    developing: t("storyStatus.developing"),
    confirmed: t("storyStatus.confirmed"),
    updated: t("storyStatus.updated"),
    resolved: t("storyStatus.resolved"),
  } as const;
  const exploitStatusLabels = {
    actively_exploited: t("exploitStatus.actively_exploited"),
    poc_available: t("exploitStatus.poc_available"),
    no_known_exploit: t("exploitStatus.no_known_exploit"),
    unknown: t("exploitStatus.unknown"),
  } as Record<ExploitStatus, string>;
  const priorityLabels = {
    immediate: t("priority.immediate"),
    urgent: t("priority.urgent"),
    planned: t("priority.planned"),
    monitor: t("priority.monitor"),
  } as Record<CyberAbeerPriority, string>;

  return (
    <article className="mx-auto max-w-2xl px-4 py-12 tablet:px-6">
      <JsonLd
        data={[
          breadcrumbSchema(l, [
            { name: t("kicker"), path: "intelligence" },
            { name: article.title, path: `intelligence/${slug}` },
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
            basePath: "intelligence",
            schemaType: "NewsArticle",
          }),
        ]}
      />
      <SiteBreadcrumb
        items={[
          { label: tNav("home"), href: "/" },
          { label: t("kicker"), href: "/intelligence" },
          { label: article.title },
        ]}
      />

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {article.intelSeverity && <SeverityBadge severity={article.intelSeverity} label={severityLabels[article.intelSeverity]} />}
        {article.intelStoryStatus && (
          <StoryStatusBadge status={article.intelStoryStatus} label={storyStatusLabels[article.intelStoryStatus]} />
        )}
        {article.menaRelevance && (
          <Badge variant="outline" className="inline-flex items-center gap-1">
            <Globe2 className="h-3 w-3" aria-hidden="true" />
            {t("menaRelevanceLabel")}
          </Badge>
        )}
      </div>

      <h1 className="mt-3 font-display text-3xl font-bold text-text-primary">{article.title}</h1>
      <p className="mt-2 text-sm text-text-muted">
        {article.authorName && `${article.authorName} · `}
        {article.publishedAt && `${t("publishedOn")} ${new Date(article.publishedAt).toLocaleDateString(locale)}`}
        {article.updatedAt &&
          article.updatedAt !== article.publishedAt &&
          ` · ${t("updatedOn")} ${new Date(article.updatedAt).toLocaleDateString(locale)}`}
      </p>

      <ExecutiveView summary={article.executiveSummary} title={t("executiveViewTitle")} />

      <VulnerabilityPanel
        cveIds={article.cveIds}
        cvssScore={article.cvssScore}
        affectedProduct={article.affectedProduct}
        exploitStatus={article.exploitStatus}
        kevListed={article.kevListed}
        vendorAdvisoryUrl={article.vendorAdvisoryUrl}
        patchStatus={article.patchStatus}
        cyberabeerPriority={article.cyberabeerPriority}
        sourcesCheckedAt={article.sourcesCheckedAt}
        locale={locale}
        labels={{
          title: t("vulnerabilityPanel.title"),
          cve: t("vulnerabilityPanel.cve"),
          cvss: t("vulnerabilityPanel.cvss"),
          affectedProduct: t("vulnerabilityPanel.affectedProduct"),
          exploitStatus: t("vulnerabilityPanel.exploitStatus"),
          kevListed: t("vulnerabilityPanel.kevListed"),
          kevYes: t("vulnerabilityPanel.kevYes"),
          kevNo: t("vulnerabilityPanel.kevNo"),
          vendorAdvisory: t("vulnerabilityPanel.vendorAdvisory"),
          patchStatus: t("vulnerabilityPanel.patchStatus"),
          priority: t("vulnerabilityPanel.priority"),
          priorityDisclaimer: t("vulnerabilityPanel.priorityDisclaimer"),
          lastChecked: t("vulnerabilityPanel.lastChecked"),
          exploitStatusLabels,
          priorityLabels,
        }}
      />

      <div className="prose prose-neutral mt-8 max-w-none dark:prose-invert">
        {/* article.body is authored HTML from the (future) admin CMS /
            this migration pipeline, not user input -- same trust model
            as /insights/[slug]. Uses the shared .content-callout /
            .content-checklist / .content-comparison-table classes. */}
        <div dangerouslySetInnerHTML={{ __html: article.body }} />
      </div>

      <SourcesList sources={article.sources} locale={l} title={t("sourcesTitle")} accessedLabel={t("accessedLabel")} />

      <RelatedArticles articles={article.relatedArticles} title={t("relatedTitle")} />

      <Link href="/intelligence" className="mt-10 inline-block text-sm text-primary hover:underline">
        {t("backLink")}
      </Link>
    </article>
  );
}
