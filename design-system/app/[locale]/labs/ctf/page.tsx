import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SiteBreadcrumb } from "@/components/site/site-breadcrumb";
import { JsonLd } from "@/components/site/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema } from "@/lib/seo/schema";
import { isAppLocale, type AppLocale } from "@/lib/i18n/config";
import { Flag } from "lucide-react";

const copy = {
  title: { en: "CyberAbeer CTF", ar: "تحديات CyberAbeer CTF" },
  description: {
    en: "Capture-the-flag style technical challenges for hands-on practice, separate from the Decision Labs simulations.",
    ar: "تحديات تقنية على طراز Capture the Flag للتدريب العملي، منفصلة عن محاكاة معامل القرار.",
  },
  breadcrumb: { en: "CTF Challenges", ar: "تحديات CTF" },
  intro: {
    en: "CyberAbeer CTF is a set of standalone, technical capture-the-flag challenges: find the flag, prove the exploit, submit the answer. It sits alongside Decision Labs as a more hands-on, technical track for learners who want to go deeper into a specific technique.",
    ar: "تحديات CyberAbeer CTF هي مجموعة من التحديات التقنية المستقلة على طراز Capture the Flag: ابحث عن العلَم، أثبت الاستغلال، وقدّم الإجابة. تأتي هذه التحديات إلى جانب معامل القرار كمسار تقني أكثر عملية للمتعلمين الراغبين في التعمق في تقنية محددة.",
  },
  statusHeading: { en: "Current status", ar: "الحالة الحالية" },
  statusBody: {
    en: "The first CTF challenges are in development. This page will list each one, with its category and difficulty, as soon as it is ready to play.",
    ar: "أول تحديات CTF قيد التطوير حاليًا. ستُدرج هذه الصفحة كل تحدٍ مع فئته ومستوى صعوبته فور جاهزيته للعب.",
  },
  comingSoon: { en: "Coming soon", ar: "قريبًا" },
  categories: [
    { en: "Web exploitation", ar: "استغلال الويب" },
    { en: "Forensics", ar: "التحليل الجنائي الرقمي" },
    { en: "Cryptography", ar: "التشفير" },
  ],
  backToLabs: { en: "← Back to CyberAbeer Labs", ar: "← العودة إلى CyberAbeer Labs" },
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  const l = locale as AppLocale;
  return buildMetadata({ locale, path: "labs/ctf", title: copy.title[l], description: copy.description[l] });
}

/**
 * Production UX fix (2026-07-27): the CTF card on the Labs landing
 * page previously went nowhere. Per the fix's explicit scope, this is
 * a real, honest landing page, not a fake empty destination and not a
 * "join the waitlist" page for a product that already exists in other
 * forms: it explains what CyberAbeer CTF is and states plainly that
 * challenges are still in development, with named categories shown so
 * a visitor knows what to expect rather than seeing a blank page.
 */
export default async function CtfPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  const l = locale as AppLocale;
  const tNav = await getTranslations({ locale, namespace: "nav" });

  return (
    <div data-brand="labs">
      <JsonLd
        data={breadcrumbSchema(l, [
          { name: tNav("labs"), path: "labs" },
          { name: copy.breadcrumb[l], path: "labs/ctf" },
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
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent/10 text-accent">
          <Flag className="h-7 w-7" aria-hidden="true" />
        </div>
        <h1 className="font-display text-3xl font-bold text-text-primary tablet:text-4xl">{copy.title[l]}</h1>
        <p className="mx-auto mt-4 text-lg text-text-secondary">{copy.intro[l]}</p>
      </section>

      <section className="mx-auto max-w-2xl px-4 pb-16 tablet:px-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>{copy.statusHeading[l]}</CardTitle>
              <Badge variant="neutral">{copy.comingSoon[l]}</Badge>
            </div>
            <CardDescription>{copy.statusBody[l]}</CardDescription>
          </CardHeader>
        </Card>
        <ul className="mt-6 flex flex-wrap justify-center gap-2">
          {copy.categories.map((category) => (
            <li key={category.en}>
              <Badge variant="neutral">{category[l]}</Badge>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-center">
          <a href={`/${l}/labs`} className="text-sm font-medium text-primary hover:underline">
            {copy.backToLabs[l]}
          </a>
        </p>
      </section>
    </div>
  );
}
