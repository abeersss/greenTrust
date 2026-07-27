import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardDescription } from "@/components/ui/card";
import { SiteBreadcrumb } from "@/components/site/site-breadcrumb";
import { JsonLd } from "@/components/site/json-ld";
import { LabsTrackCard } from "@/components/labs/labs-track-card";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema } from "@/lib/seo/schema";
import { getVerifiedTestimonials } from "@/lib/content/social-proof";
import { isAppLocale, type AppLocale } from "@/lib/i18n/config";
import { Link } from "@/lib/i18n/navigation";
import { trackEvent } from "@/lib/analytics/track";
import { FlaskConical, Flag, ListChecks, Flame } from "lucide-react";

/**
 * Production UX fix (2026-07-27): inline bilingual copy for the tracks
 * section and the closing CTA section, rather than routed through
 * messages/en.json and messages/ar.json. The previous version of this
 * page pulled the three cards from t.raw("tracks"), which is why they
 * had no href, no onClick, and no way to carry a category for
 * analytics: raw translated JSON has no room for that. Everything
 * else on this page (hero, "what it is", gamification, testimonials)
 * is unchanged and still uses the shared "labs" message namespace.
 *
 * Visual hierarchy revision (2026-07-27, same day): CyberAbeer Decision
 * Labs is the flagship product and must read as the dominant featured
 * experience, not one of three equally-weighted cards. This section
 * now renders Decision Labs as a large featured banner with its own
 * prominent CTA button, followed by a "Other ways to practice"
 * subheading and two visually secondary cards for CTF and Quick
 * Checks (smaller, lighter, using the existing LabsTrackCard).
 */
const featuredCopy = {
  kicker: { en: "Flagship experience", ar: "التجربة الرئيسية" },
  title: { en: "CyberAbeer Decision Labs", ar: "معامل قرار CyberAbeer" },
  body: {
    en: "Learn by investigating, deciding, and seeing the consequence. Full cybersecurity decision simulations, not quizzes.",
    ar: "تعلّم من خلال التحقيق واتخاذ القرار ومشاهدة النتيجة. محاكاة قرارات أمن سيبراني كاملة، وليست اختبارات.",
  },
  cta: { en: "Explore Decision Labs", ar: "استكشف معامل القرار" },
} as const;

const secondaryHeading = { en: "Other ways to practice", ar: "طرق أخرى للتدرب" } as const;

const trackCopy = {
  ctf: {
    title: { en: "Capture-the-Flag Challenges", ar: "تحديات Capture the Flag" },
    body: {
      en: "Standalone technical challenges: find the flag, prove the exploit.",
      ar: "تحديات تقنية مستقلة: ابحث عن العلَم وأثبت الاستغلال.",
    },
    cta: { en: "Explore CTF Challenges", ar: "استكشف تحديات CTF" },
  },
  quickCheck: {
    title: { en: "Quick Knowledge Checks", ar: "اختبارات سريعة للمعرفة" },
    body: {
      en: "3-5 minute exercises: one clue, one decision, immediate feedback.",
      ar: "تمارين مدتها 3-5 دقائق: علامة واحدة، قرار واحد، وتغذية راجعة فورية.",
    },
    cta: { en: "Try a Quick Challenge", ar: "جرّب اختبارًا سريعًا" },
  },
} as const;

const journeyCopy = {
  heading: { en: "Start Your Cyber Defender Journey", ar: "ابدأ رحلتك كمدافع سيبراني" },
  body: {
    en: "Practice cybersecurity through interactive simulations, visual investigations, and decision-based missions.",
    ar: "مارس الأمن السيبراني من خلال محاكاة تفاعلية وتحقيقات مرئية ومهام قائمة على اتخاذ القرار.",
  },
  primaryCta: { en: "Explore CyberAbeer Labs", ar: "استكشف CyberAbeer Labs" },
  secondaryCta: { en: "Try a Free Mission", ar: "جرّب مهمة مجانية" },
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  const t = await getTranslations({ locale, namespace: "seo" });
  return buildMetadata({ locale, path: "labs", title: t("labsTitle"), description: t("labsDescription") });
}

export default async function LabsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  const l = locale as AppLocale;

  const t = await getTranslations({ locale, namespace: "labs" });
  const tNav = await getTranslations({ locale, namespace: "nav" });
  const testimonials = await getVerifiedTestimonials("labs");

  return (
    <div data-brand="labs">
      <JsonLd data={breadcrumbSchema(l, [{ name: tNav("labs"), path: "labs" }])} />

      <div className="mx-auto max-w-6xl px-4 pt-8 tablet:px-6">
        <SiteBreadcrumb items={[{ label: tNav("home"), href: "/" }, { label: tNav("labs") }]} />
      </div>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-4 py-12 text-center tablet:py-16">
        <Badge variant="primary" className="mb-4">
          {t("kicker")}
        </Badge>
        <h1 className="font-display text-3xl font-bold text-text-primary tablet:text-5xl">
          {t("heroTitle")}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-text-secondary">{t("heroSubtitle")}</p>
      </section>

      {/* What it is */}
      <section className="mx-auto max-w-3xl px-4 pb-4 text-center tablet:px-6">
        <h2 className="font-display text-2xl font-semibold text-text-primary">{t("whatHeading")}</h2>
        <p className="mt-3 text-text-secondary">{t("whatBody")}</p>
      </section>

      {/* Tracks: Decision Labs is the flagship and must dominate this
          section visually. CTF and Quick Checks are secondary practice
          modes, shown smaller and below a "Other ways to practice"
          subheading (hierarchy directive, 2026-07-27). */}
      <section className="mx-auto max-w-6xl px-4 py-12 tablet:px-6">
        <Link
          href="/labs/decision-labs"
          onClick={() => trackEvent("labs_category_clicked", { locale: l, category: "scenario" })}
          className="group block overflow-hidden rounded-2xl border border-primary-200 bg-gradient-to-br from-primary-50 to-surface p-8 shadow-sm transition-all duration-fast hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 tablet:p-12"
        >
          <Badge variant="primary" className="mb-4">
            {featuredCopy.kicker[l]}
          </Badge>
          <div className="flex flex-col items-start gap-6 tablet:flex-row tablet:items-center tablet:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
                <FlaskConical className="h-7 w-7" aria-hidden="true" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold text-text-primary tablet:text-3xl">
                  {featuredCopy.title[l]}
                </h2>
                <p className="mt-2 max-w-xl text-text-secondary">{featuredCopy.body[l]}</p>
              </div>
            </div>
            <span className="inline-flex shrink-0 items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-white transition-transform duration-fast group-hover:gap-3">
              {featuredCopy.cta[l]}
              <span aria-hidden="true">{l === "ar" ? "←" : "→"}</span>
            </span>
          </div>
        </Link>

        <h3 className="mt-10 text-center text-sm font-semibold uppercase tracking-wide text-text-muted">
          {secondaryHeading[l]}
        </h3>
        <div className="mt-4 grid gap-6 tablet:grid-cols-2">
          <LabsTrackCard
            locale={l}
            category="ctf"
            href="/labs/ctf"
            icon={<Flag className="h-5 w-5" aria-hidden="true" />}
            title={trackCopy.ctf.title[l]}
            body={trackCopy.ctf.body[l]}
            ctaLabel={trackCopy.ctf.cta[l]}
            accent="accent"
          />
          <LabsTrackCard
            locale={l}
            category="quick_check"
            href="/labs/quick-checks"
            icon={<ListChecks className="h-5 w-5" aria-hidden="true" />}
            title={trackCopy.quickCheck.title[l]}
            body={trackCopy.quickCheck.body[l]}
            ctaLabel={trackCopy.quickCheck.cta[l]}
            accent="success"
          />
        </div>
      </section>

      {/* Gamification */}
      <section className="border-y border-border bg-surface-raised">
        <div className="mx-auto max-w-3xl px-4 py-12 text-center tablet:px-6">
          <Flame className="mx-auto h-8 w-8 text-streak" aria-hidden="true" />
          <h2 className="mt-3 font-display text-xl font-semibold text-text-primary">
            {t("gamificationHeading")}
          </h2>
          <p className="mt-3 text-text-secondary">{t("gamificationBody")}</p>
        </div>
      </section>

      {/* Testimonials: only rendered if real, verified ones exist. */}
      {testimonials.length > 0 && (
        <section className="mx-auto max-w-4xl px-4 py-12 tablet:px-6">
          <div className="grid gap-6 tablet:grid-cols-2">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id}>
                <CardHeader>
                  <CardDescription className="text-base italic">&ldquo;{testimonial.quote}&rdquo;</CardDescription>
                  <p className="mt-2 text-sm font-semibold text-text-primary">{testimonial.authorName}</p>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Start Your Cyber Defender Journey: replaces the outdated
          "join the waitlist" section now that Decision Labs has live
          content (production UX fix, 2026-07-27). */}
      <section className="mx-auto max-w-xl px-4 py-16 text-center tablet:px-6">
        <h2 className="font-display text-2xl font-semibold text-text-primary">{journeyCopy.heading[l]}</h2>
        <p className="mt-3 text-text-secondary">{journeyCopy.body[l]}</p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 tablet:flex-row">
          <Button asChild size="lg" className="w-full tablet:w-auto">
            <Link href="/labs/decision-labs">{journeyCopy.primaryCta[l]}</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full tablet:w-auto">
            <Link href="/challenge/first-defender">{journeyCopy.secondaryCta[l]}</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
