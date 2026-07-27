import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { SiteBreadcrumb } from "@/components/site/site-breadcrumb";
import { JsonLd } from "@/components/site/json-ld";
import { SpotThePhishMicroCheck } from "@/components/labs/spot-the-phish-micro-check";
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
    en: "Quick Checks are short, single-scenario exercises for a spare few minutes, lighter than a full Decision Lab. Try the one below now.",
    ar: "الاختبارات السريعة تمارين قصيرة أحادية السيناريو لبضع دقائق فارغة، وهي أخف من معمل قرار كامل. جرّب المثال أدناه الآن.",
  },
  upcomingHeading: { en: "More on the way", ar: "المزيد قريبًا" },
  comingSoon: { en: "Coming soon", ar: "قريبًا" },
  upcoming: [
    { en: "Choose the correct firewall placement", ar: "اختر موضع جدار الحماية الصحيح" },
    { en: "Classify one SOC alert", ar: "صنّف تنبيهًا واحدًا لمركز العمليات الأمنية" },
    { en: "Identify the risky permission", ar: "حدد الصلاحية عالية الخطورة" },
    { en: "Classify a document", ar: "صنّف مستندًا" },
    { en: "Select the best incident action", ar: "اختر أفضل إجراء للحادثة" },
  ],
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
 * Production UX fix (2026-07-27): the Quick Checks card on the Labs
 * landing page previously went nowhere. This page's scope is
 * deliberately narrow per the fix's explicit DO NOT list (no "dozens
 * of quick quizzes" yet): one real, working example
 * (SpotThePhishMicroCheck) so the format is genuinely interactive
 * rather than a placeholder, plus the rest of the planned exercises
 * listed honestly as "Coming soon".
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

      <section className="mx-auto max-w-lg px-4 pb-10 tablet:px-6">
        <SpotThePhishMicroCheck locale={l} />
      </section>

      <section className="mx-auto max-w-lg px-4 pb-16 tablet:px-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{copy.upcomingHeading[l]}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="space-y-2">
              {copy.upcoming.map((item) => (
                <li key={item.en} className="flex items-center justify-between gap-2 text-sm text-text-secondary">
                  <span>{item[l]}</span>
                  <Badge variant="neutral" className="shrink-0">
                    {copy.comingSoon[l]}
                  </Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
