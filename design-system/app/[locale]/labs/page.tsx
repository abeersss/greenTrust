import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SiteBreadcrumb } from "@/components/site/site-breadcrumb";
import { NewsletterForm } from "@/components/forms/newsletter-form";
import { JsonLd } from "@/components/site/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema } from "@/lib/seo/schema";
import { getVerifiedTestimonials } from "@/lib/content/social-proof";
import { isAppLocale, type AppLocale } from "@/lib/i18n/config";
import { FlaskConical, Flag, ListChecks, Flame } from "lucide-react";

const trackIcons = [FlaskConical, Flag, ListChecks];

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
  const tracks = t.raw("tracks") as { title: string; body: string }[];
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

      {/* Tracks */}
      <section className="mx-auto max-w-6xl px-4 py-12 tablet:px-6">
        <h2 className="text-center font-display text-xl font-semibold text-text-primary">
          {t("tracksHeading")}
        </h2>
        <div className="mt-8 grid gap-6 tablet:grid-cols-3">
          {tracks.map((track, index) => {
            const Icon = trackIcons[index] ?? FlaskConical;
            return (
              <Card key={track.title}>
                <CardHeader>
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-md bg-accent/10 text-accent">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <CardTitle>{track.title}</CardTitle>
                  <CardDescription>{track.body}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
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
                  <CardDescription className="text-base italic">"{testimonial.quote}"</CardDescription>
                  <p className="mt-2 text-sm font-semibold text-text-primary">{testimonial.authorName}</p>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Waitlist */}
      <section className="mx-auto max-w-xl px-4 py-16 tablet:px-6">
        <h2 className="text-center font-display text-2xl font-semibold text-text-primary">
          {t("formHeading")}
        </h2>
        <p className="mt-2 text-center text-text-secondary">{t("formBody")}</p>
        <div className="mt-8 flex justify-center">
          <NewsletterForm locale={l} segment="students" submitLabel={t("cta")} />
        </div>
        <p className="mt-6 text-center text-xs text-text-muted">{t("waitlistNote")}</p>
      </section>
    </div>
  );
}
