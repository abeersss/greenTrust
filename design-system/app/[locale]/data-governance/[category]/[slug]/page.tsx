import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import { SiteBreadcrumb } from "@/components/site/site-breadcrumb";
import { JsonLd } from "@/components/site/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema } from "@/lib/seo/schema";
import { siteUrl, siteName } from "@/lib/seo/site";
import { isAppLocale, type AppLocale } from "@/lib/i18n/config";
import { getArticleBySlug, getArticleLocaleSlugs } from "@/lib/content/articles";
import { getDgCopy, isDgCategoryRoute } from "@/lib/data-governance/config";
import { getDgResources } from "@/lib/data-governance/resources";

export const dynamic = "force-dynamic";

function decodeParam(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

const PROSE_CSS = `
.dg-prose{color:#cbd5e1;font-size:1.0625rem;line-height:1.85}
.dg-prose h2{margin:2.75rem 0 .85rem;font-size:1.65rem;line-height:1.3;font-weight:700;color:#fff;letter-spacing:-0.01em}
.dg-prose h3{margin:2rem 0 .6rem;font-size:1.25rem;line-height:1.35;font-weight:650;color:#fff}
.dg-prose p{margin:0 0 1.1rem}
.dg-prose ul,.dg-prose ol{margin:0 0 1.25rem;padding-inline-start:1.5rem}
.dg-prose ul{list-style:disc}
.dg-prose ol{list-style:decimal}
.dg-prose li{margin:.4rem 0}
.dg-prose a{color:#67e8f9;text-decoration:underline;text-underline-offset:3px}
.dg-prose strong{color:#fff}
.dg-prose .content-callout{margin:1.75rem 0;padding:1.1rem 1.35rem;border:1px solid rgba(52,211,153,.28);border-inline-start:4px solid #34d399;border-radius:.85rem;background:rgba(52,211,153,.07);color:#cbd5e1}
.dg-prose .content-callout p:last-child{margin-bottom:0}
.dg-prose .content-callout-title{margin-bottom:.35rem;font-weight:700;color:#6ee7b7}
.dg-prose .content-checklist{margin:1.75rem 0;padding:1.1rem 1.35rem;border:1px solid rgba(255,255,255,.12);border-radius:.85rem;background:rgba(255,255,255,.03);color:#cbd5e1}
.dg-prose .content-checklist ul{margin:0;padding:0;list-style:none}
.dg-prose .content-checklist li{position:relative;margin:.55rem 0;padding-inline-start:1.9rem}
.dg-prose .content-checklist li::before{content:"";position:absolute;inset-inline-start:0;top:.5rem;width:.95rem;height:.95rem;border:2px solid #34d399;border-radius:.3rem}
.dg-prose table{display:block;width:100%;margin:1.75rem 0;overflow-x:auto;border-collapse:collapse;font-size:.95rem}
.dg-prose th,.dg-prose td{padding:.65rem .85rem;border:1px solid rgba(255,255,255,.14);text-align:start;vertical-align:top;color:#cbd5e1}
.dg-prose th{background:rgba(34,211,238,.1);color:#fff;font-weight:650}
.dg-prose .dg-figure{margin:2.25rem 0;padding:1rem;border:1px solid rgba(255,255,255,.1);border-radius:1rem;background:#0a1b33}
.dg-prose .dg-figure svg{display:block;width:100%;height:auto}
.dg-prose .dg-figure figcaption{margin-top:.75rem;font-size:.875rem;color:#94a3b8;text-align:center}
`;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; category: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, category, slug } = await params;
  if (!isAppLocale(locale) || !isDgCategoryRoute(category)) return {};
  const article = await getArticleBySlug(locale, decodeParam(slug));
  if (!article) return {};
  const localeSlugs = await getArticleLocaleSlugs(article.id);
  return buildMetadata({
    locale,
    path: `data-governance/${category}/${article.slug}`,
    title: article.metaTitle ?? article.title,
    description: article.metaDescription ?? article.excerpt ?? "",
    ogImagePath: article.ogImageUrl ?? undefined,
    alternatePaths: Object.fromEntries(
      Object.entries(localeSlugs).map(([l, s]) => [l, `data-governance/${category}/${s}`])
    ),
  });
}

export default async function DataGovernanceResourcePage({
  params,
}: {
  params: Promise<{ locale: string; category: string; slug: string }>;
}) {
  const { locale, category, slug: rawSlug } = await params;
  if (!isAppLocale(locale) || !isDgCategoryRoute(category)) notFound();
  const l = locale as AppLocale;
  const slug = decodeParam(rawSlug);

  const resources = await getDgResources(l);
  const card = resources.find((r) => r.slug.normalize("NFC") === slug.normalize("NFC") && r.category === category);
  if (!card) notFound();
  const article = await getArticleBySlug(l, card.slug);
  if (!article) notFound();

  const copy = getDgCopy(l);
  const cc = copy.categories[category];
  const tNav = await getTranslations({ locale, namespace: "nav" });
  const related = resources.filter((r) => r.category === category && r.id !== card.id).slice(0, 3);
  const dateFmt = new Intl.DateTimeFormat(l === "ar" ? "ar" : "en", { year: "numeric", month: "long", day: "numeric" });
  const guidanceHref = `/contact?topic=${encodeURIComponent(article.title)}`;
  const url = `${siteUrl}/${l}/data-governance/${category}/${article.slug}`;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt ?? undefined,
    inLanguage: l,
    url,
    mainEntityOfPage: url,
    datePublished: article.publishedAt ?? undefined,
    dateModified: article.updatedAt ?? article.publishedAt ?? undefined,
    image: article.ogImageUrl ?? undefined,
    author: article.authorName ? { "@type": "Person", name: article.authorName } : undefined,
    publisher: { "@type": "Organization", name: siteName, url: siteUrl },
    articleSection: cc.title,
  };

  return (
    <div className="bg-[#06121f] text-white">
      <JsonLd
        data={[
          breadcrumbSchema(l, [
            { name: tNav("home"), path: "" },
            { name: copy.hub.breadcrumb, path: "data-governance" },
            { name: cc.short, path: `data-governance/${category}` },
            { name: article.title, path: `data-governance/${category}/${article.slug}` },
          ]),
          articleSchema,
        ]}
      />

      <header className="border-b border-white/10 bg-gradient-to-b from-[#0a2342] via-[#08182d] to-[#06121f]">
        <div className="mx-auto max-w-3xl px-4 pb-10 pt-8 tablet:px-6 tablet:pb-14">
          <SiteBreadcrumb
            items={[
              { label: tNav("home"), href: "/" },
              { label: copy.hub.breadcrumb, href: "/data-governance" },
              { label: cc.short, href: `/data-governance/${category}` },
              { label: article.title },
            ]}
          />
          <p className="mt-8 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
            {copy.types[card.resourceType]} &middot; {cc.short}
          </p>
          <h1 className="mt-4 font-display text-3xl font-bold leading-[1.15] tracking-tight text-white tablet:text-4xl desktop:text-5xl">
            {article.title}
          </h1>
          {article.excerpt && <p className="mt-5 text-lg leading-relaxed text-slate-300">{article.excerpt}</p>}
          <p className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-400">
            {article.authorName && <span>{article.authorName}</span>}
            {article.readingTimeMinutes ? <span>{copy.grid.minRead(article.readingTimeMinutes)}</span> : null}
            {article.publishedAt && (
              <span>
                {copy.resource.published} {dateFmt.format(new Date(article.publishedAt))}
              </span>
            )}
            {article.updatedAt && article.updatedAt !== article.publishedAt && (
              <span>
                {copy.resource.updated} {dateFmt.format(new Date(article.updatedAt))}
              </span>
            )}
          </p>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-4 py-12 tablet:px-6 tablet:py-16">
        <style>{PROSE_CSS}</style>
        {/* Body is founder-authored HTML from the content engine (not user input),
            the same trust model as the Insights article template. */}
        <div className="dg-prose" dangerouslySetInnerHTML={{ __html: article.body }} />

        <aside className="mt-14 rounded-2xl border border-emerald-400/30 bg-gradient-to-br from-emerald-400/10 to-cyan-400/5 p-6 tablet:p-8">
          <h2 className="font-display text-2xl font-bold text-white">{copy.resource.guidanceTitle}</h2>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-slate-300">{copy.resource.guidanceText}</p>
          <Link
            href={guidanceHref}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-emerald-400 px-6 py-3 text-sm font-semibold text-[#06121f] transition-colors hover:bg-emerald-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
          >
            {copy.resource.guidanceButton}
            <span aria-hidden="true" className="rtl:rotate-180">
              &rarr;
            </span>
          </Link>
        </aside>

        {article.sources.length > 0 && (
          <section className="mt-14" aria-labelledby="dg-sources-title">
            <h2 id="dg-sources-title" className="font-display text-xl font-bold text-white">
              {copy.resource.sourcesTitle}
            </h2>
            <ol className="mt-4 list-decimal space-y-3 ps-5 text-sm leading-relaxed text-slate-300">
              {article.sources.map((s) => (
                <li key={s.url}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-200 underline underline-offset-4 hover:text-cyan-100"
                  >
                    {s.title}
                  </a>
                  {s.publisher ? <span className="text-slate-400">{` (${s.publisher})`}</span> : null}
                  <span className="block text-xs text-slate-500">
                    {copy.resource.accessed} {dateFmt.format(new Date(s.accessedDate))}
                  </span>
                </li>
              ))}
            </ol>
          </section>
        )}

        {related.length > 0 && (
          <section className="mt-14" aria-labelledby="dg-related-title">
            <h2 id="dg-related-title" className="font-display text-xl font-bold text-white">
              {copy.resource.relatedTitle}
            </h2>
            <ul className="mt-4 grid gap-4 tablet:grid-cols-2">
              {related.map((r) => (
                <li key={r.id}>
                  <Link
                    href={`/data-governance/${r.category}/${r.slug}`}
                    className="block h-full rounded-xl border border-white/10 bg-white/[0.03] p-4 transition-colors hover:border-emerald-400/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300"
                  >
                    <span className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300">
                      {copy.types[r.resourceType]}
                    </span>
                    <span className="mt-1 block text-base font-semibold leading-snug text-white">{r.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <Link
          href={`/data-governance/${category}`}
          className="mt-12 inline-block text-sm font-medium text-cyan-200 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300"
        >
          {copy.resource.backToCategory} {cc.short}
        </Link>
      </article>
    </div>
  );
}
