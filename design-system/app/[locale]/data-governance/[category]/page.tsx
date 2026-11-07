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
import { getDgCopy, isDgCategoryRoute } from "@/lib/data-governance/config";
import { getDgResources } from "@/lib/data-governance/resources";
import { CategoryIllustration } from "@/components/data-governance/category-illustration";
import { ResourceGrid } from "@/components/data-governance/resource-grid";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; category: string }>;
}): Promise<Metadata> {
  const { locale, category } = await params;
  if (!isAppLocale(locale) || !isDgCategoryRoute(category)) return {};
  const copy = getDgCopy(locale);
  const cc = copy.categories[category];
  return buildMetadata({
    locale,
    path: `data-governance/${category}`,
    title: `${cc.title} | CyberAbeer`,
    description: cc.description,
  });
}

export default async function DataGovernanceCategoryPage({
  params,
}: {
  params: Promise<{ locale: string; category: string }>;
}) {
  const { locale, category } = await params;
  if (!isAppLocale(locale) || !isDgCategoryRoute(category)) notFound();
  const l = locale as AppLocale;
  const copy = getDgCopy(l);
  const cc = copy.categories[category];
  const tNav = await getTranslations({ locale, namespace: "nav" });
  const resources = (await getDgResources(l)).filter((r) => r.category === category);

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: cc.title,
    description: cc.description,
    url: `${siteUrl}/${l}/data-governance/${category}`,
    inLanguage: l,
    isPartOf: { "@type": "WebSite", name: siteName, url: siteUrl },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: resources.map((r, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: r.title,
        url: `${siteUrl}/${l}/data-governance/${category}/${r.slug}`,
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
            { name: cc.short, path: `data-governance/${category}` },
          ]),
          collectionSchema,
        ]}
      />

      <section className="border-b border-white/10 bg-gradient-to-b from-[#0a2342] via-[#08182d] to-[#06121f]">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 pb-12 pt-8 tablet:px-6 desktop:grid-cols-[3fr_2fr] desktop:items-center">
          <div>
            <SiteBreadcrumb
              items={[
                { label: tNav("home"), href: "/" },
                { label: copy.hub.breadcrumb, href: "/data-governance" },
                { label: cc.short },
              ]}
            />
            <h1 className="mt-6 font-display text-3xl font-bold leading-tight text-white tablet:text-4xl">{cc.title}</h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-200">{cc.description}</p>
            <p className="mt-3 text-sm text-emerald-300">{cc.theme}</p>
          </div>
          <div className="overflow-hidden rounded-2xl border border-white/10">
            <CategoryIllustration kind={category} className="aspect-[8/5] w-full" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 pb-[max(4rem,env(safe-area-inset-bottom))] tablet:px-6">
        <h2 className="font-display text-2xl font-bold text-white">{copy.categoryPage.resources}</h2>
        <div className="mt-6">
          <ResourceGrid locale={l} resources={resources} lockedCategory={category} />
        </div>
        <Link
          href="/data-governance"
          className="mt-10 inline-block text-sm font-medium text-cyan-200 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300"
        >
          {copy.categoryPage.back}
        </Link>
      </section>
    </div>
  );
}
