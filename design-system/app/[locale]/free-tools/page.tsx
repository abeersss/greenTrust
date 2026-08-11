import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SiteBreadcrumb } from "@/components/site/site-breadcrumb";
import { Link } from "@/lib/i18n/navigation";
import { JsonLd } from "@/components/site/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema } from "@/lib/seo/schema";
import { isAppLocale, type AppLocale } from "@/lib/i18n/config";
import { ShieldCheck, Atom, Award } from "lucide-react";
import { getPublishedToolResources } from "@/lib/tools/tool-resources";
import { ToolResourcesGrid } from "@/components/site/tool-resources-grid";

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
    path: "free-tools",
    title: t("freeToolsTitle"),
    description: t("freeToolsDescription"),
  });
}

/**
 * Public Free Tools hub (CyberAbeer Platform). Founder-requested
 * ordering: the founder-managed Downloads section (migration 030,
 * /founder/tool-resources) leads the page since it's the
 * highest-intent content, with the self-assessment cards following.
 * The Downloads heading is now the page's single <h1> since it's
 * visually first; the assessments heading drops to <h2> to keep one
 * meaningful H1 per page for SEO. Each download card can carry an
 * image gallery AND a file together, with long descriptions capped
 * and expandable via a "More" popup (ToolResourcesGrid).
 */
export default async function FreeToolsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  const l = locale as AppLocale;

  const t = await getTranslations({ locale, namespace: "freeTools" });
  const tNav = await getTranslations({ locale, namespace: "nav" });
  const tChallenge = await getTranslations({ locale, namespace: "challenge.firstDefender" });

  const toolResources = await getPublishedToolResources(l);
  const moreLabel = l === "ar" ? "\u0627\u0644\u0645\u0632\u064a\u062f" : "More";

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 tablet:px-6">
      <JsonLd data={breadcrumbSchema(l, [{ name: tNav("freeTools"), path: "free-tools" }])} />
      <SiteBreadcrumb items={[{ label: tNav("home"), href: "/" }, { label: tNav("freeTools") }]} />

      <Badge variant="primary" className="mt-6">
        {t("downloadsKicker")}
      </Badge>
      <h1 className="mt-3 font-display text-3xl font-bold text-text-primary tablet:text-4xl">
        {t("downloadsTitle")}
      </h1>
      <p className="mt-3 max-w-2xl text-text-secondary">{t("downloadsIntro")}</p>

      <ToolResourcesGrid items={toolResources} downloadLabel={t("downloadCta")} moreLabel={moreLabel} />

      <div className="mt-16">
        <Badge variant="primary">{t("kicker")}</Badge>
        <h2 className="mt-3 font-display text-2xl font-bold text-text-primary tablet:text-3xl">{t("title")}</h2>
        <p className="mt-3 max-w-2xl text-text-secondary">{t("intro")}</p>

        <div className="mt-10 grid gap-6 tablet:grid-cols-2">
          <Card data-brand="greentrust">
            <CardHeader>
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-md bg-primary-50 text-primary-700">
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              </div>
              <CardTitle>{t("governanceTitle")}</CardTitle>
              <CardDescription>{t("governanceBody")}</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button asChild>
                <Link href="/free-tools/ai-governance-quick-check">{t("startCta")}</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card data-brand="greentrust">
            <CardHeader>
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-md bg-primary-50 text-primary-700">
                <Atom className="h-5 w-5" aria-hidden="true" />
              </div>
              <CardTitle>{t("quantumTitle")}</CardTitle>
              <CardDescription>{t("quantumBody")}</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button asChild>
                <Link href="/free-tools/quantum-readiness-quick-check">{t("startCta")}</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card data-brand="labs">
            <CardHeader>
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-md bg-primary-50 text-primary-700">
                <Award className="h-5 w-5" aria-hidden="true" />
              </div>
              <CardTitle>{tChallenge("heroTitle")}</CardTitle>
              <CardDescription>{tChallenge("heroSubtitle")}</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button asChild>
                <Link href="/challenge/first-defender">{tChallenge("startCta")}</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        <p className="mt-8 text-sm text-text-muted">{t("disclaimer")}</p>
      </div>
    </div>
  );
}
