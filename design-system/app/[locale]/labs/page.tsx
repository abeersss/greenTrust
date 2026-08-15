import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardDescription } from "@/components/ui/card";
import { SiteBreadcrumb } from "@/components/site/site-breadcrumb";
import { JsonLd } from "@/components/site/json-ld";
import { LabsTrackCard } from "@/components/labs/labs-track-card";
import { DecisionLabsFeaturedCard } from "@/components/labs/decision-labs-featured-card";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema } from "@/lib/seo/schema";
import { getVerifiedTestimonials } from "@/lib/content/social-proof";
import { isAppLocale, type AppLocale } from "@/lib/i18n/config";
import { Link } from "@/lib/i18n/navigation";
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
    en: "Learn cybersecurity by doing.",
    ar: "تعلّم الأمن السيبراني بالممارسة.",
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

/**
 * Book promo (2026-08-15): locale-matched infographic linking out to the
 * corresponding Amazon edition of Dr. Abeer's book. English readers see
 * the English infographic linking to the English edition; Arabic readers
 * see the Arabic infographic linking to the Arabic edition. Images live
 * in design-system/public/images (en-book.webp / ar-book.webp).
 */
const bookPromoCopy = {
  src: { en: "/images/en-book.webp", ar: "/images/ar-book.webp" },
  href: {
    en: "https://www.amazon.co.uk/dp/B0HDMJZ8PV",
    ar: "https://www.amazon.co.uk/dp/B0HDM96XVT",
  },
  alt: {
    en: "Think Like a Defender: CyberAbeer's Method for Security Decision-Making — available on Amazon",
    ar: "بعقلية المُدافع: منهج سايبر عبير لاتخاذ القرار الأمني — متوفر على أمازون",
  },
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
        <DecisionLabsFeaturedCard
          locale={l}
          href="/labs/decision-labs"
          icon={<FlaskConical className="h-7 w-7" aria-hidden="true" />}
          kicker={featuredCopy.kicker[l]}
          title={featuredCopy.title[l]}
          body={featuredCopy.body[l]}
          ctaLabel={featuredCopy.cta[l]}
        />

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

      {/* Book promo: locale-matched infographic linking to the
          corresponding Amazon book edition (2026-08-15). */}
      <section className="mx-auto max-w-3xl px-4 pb-16 text-center tablet:px-6">
        <a
          href={bookPromoCopy.href[l]}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block"
        >
          <img
            src={bookPromoCopy.src[l]}
            alt={bookPromoCopy.alt[l]}
            className="mx-auto w-full max-w-md rounded-lg shadow-md transition-transform hover:scale-[1.02]"
            loading="lazy"
          />
        </a>
      </section>
    </div>
  );
}
