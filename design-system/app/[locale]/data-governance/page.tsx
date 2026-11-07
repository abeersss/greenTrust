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
import { DG_CATEGORIES, getDgCopy } from "@/lib/data-governance/config";
import { getDgResources } from "@/lib/data-governance/resources";
import { NetworkHero } from "@/components/data-governance/network-hero";
import { CategoryIllustration } from "@/components/data-governance/category-illustration";
import { ResourceGrid } from "@/components/data-governance/resource-grid";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  const copy = getDgCopy(locale);
  return buildMetadata({
    locale,
    path: "data-governance",
    title: copy.hub.metaTitle,
    description: copy.hub.metaDescription,
  });
}

export default async function DataGovernanceHubPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  const l = locale as AppLocale;
  const sp = await searchParams;
  const rawQ = sp?.q;
  const initialQuery = (Array.isArray(rawQ) ? rawQ[0] : rawQ) ?? "";

  const copy = getDgCopy(l);
  const tNav = await getTranslations({ locale, namespace: "nav" });
  const resources = await getDgResources(l);

  const countByCategory = new Map<string, number>();
  for (const r of resources) countByCategory.set(r.category, (countByCategory.get(r.category) ?? 0) + 1);
  const featured = resources.find((r) => r.isFeatured) ?? resources[0] ?? null;

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: copy.hub.title,
    description: copy.hub.metaDescription,
    url: `${siteUrl}/${l}/data-governance`,
    inLanguage: l,
    isPartOf: { "@type": "WebSite", name: siteName, url: siteUrl },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: DG_CATEGORIES.map((c, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: copy.categories[c.route].title,
        url: `${siteUrl}/${l}/data-governance/${c.route}`,
      })),
    },
  };

  return (
    <div className="bg-[#06121f] text-white">
      <JsonLd
        data={[
          breadcrumbSchema(l, [
            { name: tNav("home"), path: "" },
            { name: copy.hub.breadcrumb, path: "data-governance" },
          ]),
          collectionSchema,
        ]}
      />

      <section className="relative overflow-hidden border-b border-white/10 bg-gradient-to-b from-[#0a2342] via-[#08182d] to-[#06121f]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_top,black,transparent_75%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 start-1/2 h-80 w-[40rem] -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl rtl:translate-x-1/2"
        />
        <div className="relative mx-auto max-w-6xl px-4 pb-12 pt-8 tablet:px-6 tablet:pb-20">
          <SiteBreadcrumb
            items={[{ label: tNav("home"), href: "/" }, { label: copy.hub.breadcrumb }]}
          />
          <p className="mt-8 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
            {copy.hub.eyebrow}
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-bold leading-[1.1] tracking-tight text-white tablet:text-5xl desktop:text-6xl">
            {copy.hub.title}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-300 tablet:text-lg">{copy.hub.subtitle}</p>

          <form action={`/${l}/data-governance#resources`} method="get" role="search" className="mt-6 flex max-w-xl gap-2">
            <label htmlFor="dg-hero-search" className="sr-only">
              {copy.hero.searchLabel}
            </label>
            <input
              id="dg-hero-search"
              name="q"
              type="search"
              defaultValue={initialQuery}
              placeholder={copy.hero.searchPlaceholder}
              className="min-w-0 flex-1 rounded-lg border border-white/20 bg-[#0d2240] px-4 py-3 text-sm text-white placeholder:text-slate-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300"
            />
            <button
              type="submit"
              className="rounded-lg bg-emerald-400 px-5 py-3 text-sm font-semibold text-[#06121f] hover:bg-emerald-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
            >
              {copy.hero.searchButton}
            </button>
          </form>

          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-4 tablet:p-6">
            <NetworkHero locale={l} />
          </div>

          <div className="mt-8 grid gap-4 desktop:grid-cols-[2fr_1fr]">
            <nav aria-label={copy.hero.categoriesLabel}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{copy.hero.categoriesLabel}</p>
              <ul className="grid grid-cols-1 gap-2 tablet:grid-cols-2">
                {DG_CATEGORIES.map((c) => (
                  <li key={c.route}>
                    <Link
                      href={`/data-governance/${c.route}`}
                      className="flex min-h-[3rem] items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white transition-colors hover:border-emerald-400/60 hover:bg-white/[0.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300"
                    >
                      <span>{copy.categories[c.route].short}</span>
                      <span aria-hidden="true" className="text-emerald-300 rtl:rotate-180">
                        &rarr;
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/[0.06] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">{copy.hero.featuredLabel}</p>
              {featured ? (
                <>
                  <p className="mt-2 text-sm font-semibold leading-snug text-white">{featured.title}</p>
                  <Link
                    href={`/data-governance/${featured.category}/${featured.slug}`}
                    className="mt-3 inline-block text-sm font-semibold text-cyan-200 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300"
                  >
                    {copy.hero.readFeatured} <span aria-hidden="true" className="inline-block rtl:rotate-180">&rarr;</span>
                  </Link>
                </>
              ) : (
                <p className="mt-2 text-sm text-slate-300">{copy.hero.featuredEmpty}</p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 tablet:px-6 tablet:py-20">
        <span aria-hidden="true" className="mb-4 block h-1 w-12 rounded-full bg-emerald-400" />
        <h2 className="max-w-2xl font-display text-3xl font-bold leading-tight tracking-tight text-white tablet:text-4xl">
          {copy.panels.heading}
        </h2>
        <ul className="mt-10 grid gap-6 tablet:grid-cols-2">
          {DG_CATEGORIES.map((c, index) => {
            const cc = copy.categories[c.route];
            const count = countByCategory.get(c.route) ?? 0;
            const featuredForCategory = resources.find((r) => r.category === c.route && r.isFeatured) ?? resources.find((r) => r.category === c.route);
            return (
              <li
                key={c.route}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#0e2442] to-[#0a1b33] shadow-lg shadow-black/20 transition duration-base hover:border-emerald-400/40 motion-reduce:transition-none"
              >
                <div className="relative aspect-[8/5] w-full overflow-hidden border-b border-white/10">
                  <CategoryIllustration kind={c.route} className="h-full w-full" />
                  <span
                    aria-hidden="true"
                    className="absolute start-4 top-4 rounded-md bg-[#06121f]/80 px-2 py-1 font-mono text-xs font-semibold tracking-widest text-emerald-300"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-200/80">{cc.theme}</p>
                    <span className="shrink-0 rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-xs font-medium text-slate-200">
                      {copy.panels.resourcesCount(count)}
                    </span>
                  </div>
                  <h3 className="mt-4 font-display text-xl font-semibold leading-snug text-white tablet:text-2xl">{cc.title}</h3>
                  <p className="mt-3 text-base leading-relaxed text-slate-300">{cc.description}</p>
                  <div className="mt-6 rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300">{copy.panels.featuredGuide}</p>
                    {featuredForCategory ? (
                      <Link
                        href={`/data-governance/${c.route}/${featuredForCategory.slug}`}
                        className="mt-1.5 block text-base font-medium leading-snug text-white hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300"
                      >
                        {featuredForCategory.title}
                      </Link>
                    ) : (
                      <p className="mt-1.5 text-base text-slate-400">{copy.panels.noFeatured}</p>
                    )}
                  </div>
                  <div className="mt-auto pt-6">
                    <Link
                      href={`/data-governance/${c.route}`}
                      className="inline-flex w-fit items-center gap-2 rounded-lg bg-emerald-400 px-5 py-3 text-sm font-semibold text-[#06121f] transition-colors hover:bg-emerald-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                    >
                      {copy.panels.explore}
                      <span aria-hidden="true" className="rtl:rotate-180">
                        &rarr;
                      </span>
                    </Link>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section id="resources" className="mx-auto max-w-6xl scroll-mt-24 px-4 pb-[max(4rem,env(safe-area-inset-bottom))] tablet:px-6">
        <span aria-hidden="true" className="mb-4 block h-1 w-12 rounded-full bg-emerald-400" />
        <h2 className="font-display text-3xl font-bold tracking-tight text-white tablet:text-4xl">{copy.grid.heading}</h2>
        <p className="mt-3 max-w-2xl text-base text-slate-300">{copy.grid.subheading}</p>
        <div className="mt-6">
          <ResourceGrid locale={l} resources={resources} initialQuery={initialQuery} />
        </div>
      </section>
    </div>
  );
}
