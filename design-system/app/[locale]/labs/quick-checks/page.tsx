import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { SiteBreadcrumb } from "@/components/site/site-breadcrumb";
import { JsonLd } from "@/components/site/json-ld";
import { SpotThePhishMicroCheck } from "@/components/labs/spot-the-phish-micro-check";
import { MicroCheck } from "@/components/labs/micro-check";
import { QUICK_CHECKS } from "@/lib/labs/quick-checks-data";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema } from "@/lib/seo/schema";
import { isAppLocale, type AppLocale } from "@/lib/i18n/config";
import { ListChecks } from "lucide-react";

const copy = {
  title: { en: "Quick Knowledge Checks", ar: "اختبارات سريعة للمعرفة" },
  description: {
    en: "3-5 minute cybersecurity exercises: one clue, one decision, immediate feedback.",
    ar: "تمارين أمن سيبراني مدتها 3-5 دقائق: علامة واحدة، قرار واحد، وتغذية راجعة فورية.",
  },
  breadcrumb: { en: "Quick Checks", ar: "اختبارات سريعة" },
  intro: {
    en: "Quick Checks are short, single-scenario exercises for a spare few minutes, lighter than a full Decision Lab. Six are live below — pick any one and go.",
    ar: "الاختبارات السريعة تمارين قصيرة أحادية السيناريو لبضع دقائق فارغة، وهي أخف من معمل قرار كامل. ستة اختبارات متاحة الآن أدناه — اختر أيًا منها وابدأ.",
  },
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  const l = locale as AppLocale;
  return buildMetadata({ locale, path: "labs/quick-checks", title: copy.title[l], description: copy.description[l] });
}

/**
 * Full activation (2026-08-03): the five items that previously sat
 * under "More on the way" / "Coming soon" (firewall placement, SOC
 * alert triage, risky permission, document classification, incident
 * response action) are now real, working micro-checks rendered via
 * the shared MicroCheck component + lib/labs/quick-checks-data.ts, on
 * the same one-clue/one-decision/immediate-feedback pattern as the
 * original SpotThePhishMicroCheck. Every quick check on this page is
 * now genuinely interactive; there is no more "coming soon" list.
 */
export default async function QuickChecksPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  const l = locale as AppLocale;
  const tNav = await getTranslations({ locale, namespace: "nav" });

  return (
    <div data-brand="labs">
      <JsonLd
        data={breadcrumbSchema(l, [
          { name: tNav("labs"), path: "labs" },
          { name: copy.breadcrumb[l], path: "labs/quick-checks" },
        ])}
      />
      <div className="mx-auto max-w-6xl px-4 pt-8 tablet:px-6">
        <SiteBreadcrumb
          items={[
            { label: tNav("home"), href: "/" },
            { label: tNav("labs"), href: "/labs" },
            { label: copy.breadcrumb[l] },
          ]}
        />
      </div>

      <section className="mx-auto max-w-2xl px-4 py-12 text-center tablet:py-16">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success-50 text-success-600">
          <ListChecks className="h-7 w-7" aria-hidden="true" />
        </div>
        <h1 className="font-display text-3xl font-bold text-text-primary tablet:text-4xl">{copy.title[l]}</h1>
        <p className="mx-auto mt-4 text-lg text-text-secondary">{copy.intro[l]}</p>
      </section>

      <section className="mx-auto max-w-lg space-y-8 px-4 pb-16 tablet:px-6">
        <SpotThePhishMicroCheck locale={l} />
        {QUICK_CHECKS.map((def) => (
          <MicroCheck key={def.key} def={def} locale={l} />
        ))}
      </section>
    </div>
  );
}
