import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import {
  ShieldCheck,
  Award,
  FileCheck2,
  GraduationCap,
  Radar,
  Scale,
  Wrench,
  ClipboardCheck,
  Bot,
  FlaskConical,
  Zap,
  HelpCircle,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SiteBreadcrumb } from "@/components/site/site-breadcrumb";
import { Link } from "@/lib/i18n/navigation";
import { JsonLd } from "@/components/site/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema } from "@/lib/seo/schema";
import { getTopLevelPillars, getCategoryBySlug } from "@/lib/content/articles";
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
    path: "learn",
    title: t("learnTitle"),
    description: t("learnDescription"),
  });
}

interface PathCard {
  key: string;
  icon: LucideIcon;
  title: string;
  description: string;
  href: string | null;
}

/**
 * Learning Center -- the visual index over certification paths, career
 * paths, and practice, per the founder's Learning & Careers content
 * directive. This is deliberately a hand-built landing page (progress
 * paths, icons, difficulty language) rather than a generic
 * category-listing template, so it doesn't read as a blog archive.
 *
 * Every card link is resolved against real, live DB data
 * (getTopLevelPillars / getCategoryBySlug, the same functions
 * /topics/[pillar] already uses) rather than hardcoded paths. Hubs
 * that don't exist yet in the live database -- including all four new
 * ones (CISSP, CISM, ISO 27001, Careers) until their migrations are
 * actually run against Supabase -- render as "Coming Soon" instead of
 * a link that would 404, exactly like every other coming-soon
 * treatment in this codebase (see components/content/coming-soon-cta.tsx).
 */
export default async function LearnPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  const l = locale as AppLocale;

  const t = await getTranslations({ locale, namespace: "learn" });
  const tNav = await getTranslations({ locale, namespace: "nav" });

  const pillars = await getTopLevelPillars(l);
  const learnPillar = pillars.find((p) => p.key === "pillar_learn_cybersecurity");
  const aiPillar = pillars.find((p) => p.key === "pillar_ai_security_governance");

  const learnCategory = learnPillar ? await getCategoryBySlug(l, learnPillar.slug) : null;
  const hubsByKey = new Map((learnCategory?.hubs ?? []).map((h) => [h.key, h]));

  const cissp = hubsByKey.get("hub_cissp");
  const cism = hubsByKey.get("hub_cism");
  const iso = hubsByKey.get("hub_iso_27001");
  const careers = hubsByKey.get("hub_cybersecurity_careers");

  const certPaths: PathCard[] = [
    {
      key: "cissp",
      icon: ShieldCheck,
      title: t("certCisspTitle"),
      description: t("certCisspBody"),
      href: cissp ? `/topics/${cissp.slug}` : null,
    },
    {
      key: "cism",
      icon: Award,
      title: t("certCismTitle"),
      description: t("certCismBody"),
      href: cism ? `/topics/${cism.slug}` : null,
    },
    {
      key: "iso",
      icon: FileCheck2,
      title: t("certIsoTitle"),
      description: t("certIsoBody"),
      href: iso ? `/topics/${iso.slug}` : null,
    },
    {
      key: "ceh",
      icon: HelpCircle,
      title: t("certCehTitle"),
      description: t("certCehBody"),
      href: null,
    },
  ];

  const careerPaths: PathCard[] = [
    {
      key: "soc",
      icon: Radar,
      title: t("careerSocTitle"),
      description: t("careerSocBody"),
      href: careers ? `/topics/${careers.slug}` : null,
    },
    {
      key: "grc",
      icon: Scale,
      title: t("careerGrcTitle"),
      description: t("careerGrcBody"),
      href: careers ? `/topics/${careers.slug}` : null,
    },
    {
      key: "engineering",
      icon: Wrench,
      title: t("careerEngineeringTitle"),
      description: t("careerEngineeringBody"),
      href: careers ? `/topics/${careers.slug}` : null,
    },
    {
      key: "audit",
      icon: ClipboardCheck,
      title: t("careerAuditTitle"),
      description: t("careerAuditBody"),
      href: careers ? `/topics/${careers.slug}` : null,
    },
    {
      key: "aiSecurity",
      icon: Bot,
      title: t("careerAiSecurityTitle"),
      description: t("careerAiSecurityBody"),
      href: aiPillar ? `/topics/${aiPillar.slug}` : null,
    },
  ];

  const practiceCards: (PathCard & { xp?: boolean })[] = [
    {
      key: "decisionLabs",
      icon: FlaskConical,
      title: t("practiceDecisionLabsTitle"),
      description: t("practiceDecisionLabsBody"),
      href: null,
    },
    {
      key: "quickChallenges",
      icon: Zap,
      title: t("practiceQuickChallengesTitle"),
      description: t("practiceQuickChallengesBody"),
      href: "/challenge/first-defender",
      xp: true,
    },
    {
      key: "practiceQuestions",
      icon: HelpCircle,
      title: t("practiceQuestionsTitle"),
      description: t("practiceQuestionsBody"),
      href: cissp ? `/topics/${cissp.slug}` : null,
    },
  ];

  function renderCard(card: PathCard & { xp?: boolean }) {
    const Icon = card.icon;
    const content = (
      <Card
        className={
          "h-full transition-all duration-200 " +
          (card.href ? "hover:-translate-y-1 hover:shadow-md" : "opacity-80")
        }
      >
        <CardHeader>
          <div className="mb-1 flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary-50 text-primary-700">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </div>
            {card.href ? (
              card.xp && (
                <Badge variant="success" className="w-fit">
                  {t("xpBadge")}
                </Badge>
              )
            ) : (
              <Badge variant="outline" className="w-fit">
                {t("comingSoon")}
              </Badge>
            )}
          </div>
          <CardTitle className="text-base">{card.title}</CardTitle>
          <CardDescription>{card.description}</CardDescription>
        </CardHeader>
      </Card>
    );
    return card.href ? (
      <Link key={card.key} href={card.href} className="block h-full">
        {content}
      </Link>
    ) : (
      <div key={card.key} className="h-full">
        {content}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 tablet:px-6">
      <JsonLd data={breadcrumbSchema(l, [{ name: t("kicker"), path: "learn" }])} />
      <SiteBreadcrumb items={[{ label: tNav("home"), href: "/" }, { label: t("kicker") }]} />

      <Badge variant="primary" className="mt-6">
        {t("kicker")}
      </Badge>
      <h1 className="mt-3 font-display text-3xl font-bold text-text-primary tablet:text-4xl">{t("title")}</h1>
      <p className="mt-3 max-w-2xl text-text-secondary">{t("intro")}</p>

      {/* Certification Paths */}
      <section className="mt-12">
        <div className="mb-1 flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-primary-700" aria-hidden="true" />
          <h2 className="font-display text-lg font-semibold text-text-primary">{t("certPathsTitle")}</h2>
        </div>
        <p className="mb-5 text-sm text-text-secondary">{t("certPathsIntro")}</p>
        <div className="grid gap-4 tablet:grid-cols-2 desktop:grid-cols-4">
          {certPaths.map(renderCard)}
        </div>
      </section>

      {/* Career Paths */}
      <section className="mt-14">
        <div className="mb-1 flex items-center gap-2">
          <Radar className="h-5 w-5 text-primary-700" aria-hidden="true" />
          <h2 className="font-display text-lg font-semibold text-text-primary">{t("careerPathsTitle")}</h2>
        </div>
        <p className="mb-5 text-sm text-text-secondary">{t("careerPathsIntro")}</p>
        <div className="grid gap-4 tablet:grid-cols-2 desktop:grid-cols-3">
          {careerPaths.map(renderCard)}
        </div>
      </section>

      {/* Practice */}
      <section className="mt-14 rounded-card border border-border bg-surface-raised p-6 tablet:p-8">
        <div className="mb-1 flex items-center gap-2">
          <FlaskConical className="h-5 w-5 text-primary-700" aria-hidden="true" />
          <h2 className="font-display text-lg font-semibold text-text-primary">{t("practiceTitle")}</h2>
        </div>
        <p className="mb-5 text-sm text-text-secondary">{t("practiceIntro")}</p>
        <div className="grid gap-4 tablet:grid-cols-3">
          {practiceCards.map(renderCard)}
        </div>
      </section>
    </div>
  );
}
