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
import { Link } from "@/lib/i18n/navigation";
import { Mail, ShieldCheck, Siren, Database, Scale, Bot } from "lucide-react";

const copy = {
  title: { en: "Decision Labs", ar: "معامل القرار" },
  description: {
    en: "Cybersecurity decision simulations: investigate real evidence, make a call, and see the consequence play out.",
    ar: "محاكاة قرارات الأمن السيبراني: افحص أدلة حقيقية، اتخذ قرارك، وشاهد نتيجته تتكشف أمامك.",
  },
  breadcrumb: { en: "Decision Labs", ar: "معامل القرار" },
  comingSoon: { en: "Coming soon", ar: "قريبًا" },
  tryNow: { en: "Start mission →", ar: "ابدأ المهمة ←" },
} as const;

interface LabEntry {
  key: string;
  icon: typeof Mail;
  title: { en: string; ar: string };
  body: { en: string; ar: string };
  href: string | null;
  accent: string;
}

const LABS: LabEntry[] = [
  {
    key: "phishing-hunter",
    icon: Mail,
    title: { en: "Phishing Hunter", ar: "صائد التصيد الاحتيالي" },
    body: {
      en: "Investigate a real-looking email: sender, headers, the link's true destination, and the attachment, then decide.",
      ar: "افحص رسالة بريدية واقعية: المرسل والترويسات والوجهة الحقيقية للرابط والمرفق، ثم اتخذ قرارك.",
    },
    href: "/challenge/first-defender",
    accent: "bg-primary-50 text-primary-700",
  },
  {
    key: "network-guardian",
    icon: ShieldCheck,
    title: { en: "Network Guardian", ar: "حارس الشبكة" },
    body: {
      en: "Place firewalls, a WAF, DMZ, and VLAN segmentation on a live network, then watch a simulated attack test your design.",
      ar: "ضع جدران الحماية وWAF وDMZ وتقسيم VLAN على شبكة فعلية، ثم شاهد هجومًا محاكى يختبر تصميمك.",
    },
    href: "/challenge/network-guardian",
    accent: "bg-accent/10 text-accent",
  },
  {
    key: "soc-night-shift",
    icon: Siren,
    title: { en: "SOC Night Shift", ar: "المناوبة الليلية لمركز العمليات الأمنية" },
    body: {
      en: "Triage a queue of real-looking alerts under time pressure and decide what actually needs escalation.",
      ar: "قم بفرز قائمة تنبيهات واقعية تحت ضغط الوقت وقرر ما الذي يحتاج فعلًا إلى التصعيد.",
    },
    href: "/challenge/soc-night-shift",
    accent: "bg-warning-50 text-warning-600",
  },
  {
    key: "data-guardian",
    icon: Database,
    title: { en: "Data Guardian", ar: "حارس البيانات" },
    body: {
      en: "Classify and protect sensitive data across a realistic set of documents and systems.",
      ar: "صنّف واحمِ البيانات الحساسة عبر مجموعة واقعية من المستندات والأنظمة.",
    },
    href: null,
    accent: "bg-success-50 text-success-600",
  },
  {
    key: "grcl-innovation",
    icon: Scale,
    title: { en: "GRCL: Innovation Under Fire", ar: "GRCL: الابتكار تحت الضغط" },
    body: {
      en: "Defend a governance decision before a review board using Dr. Abeer Alshammari's GRCL framework.",
      ar: "دافع عن قرار حوكمة أمام مجلس مراجعة باستخدام إطار GRCL للدكتورة عبير الشمري.",
    },
    href: null,
    accent: "bg-info-50 text-info-600",
  },
  {
    key: "agent-zero",
    icon: Bot,
    title: { en: "Agent Zero", ar: "العميل زيرو" },
    body: {
      en: "Contain a rogue AI agent before it escalates its own permissions.",
      ar: "احتوِ وكيل ذكاء اصطناعي مارقًا قبل أن يصعّد صلاحياته الخاصة.",
    },
    href: null,
    accent: "bg-danger-50 text-danger-600",
  },
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  const l = locale as AppLocale;
  return buildMetadata({ locale, path: "labs/decision-labs", title: copy.title[l], description: copy.description[l] });
}

/**
 * Production UX fix (2026-07-27): the "Scenario Labs" card on the main
 * Labs landing page previously went nowhere. This is its real
 * destination: every Decision Lab in the current build order, each
 * either a live link (Phishing Hunter) or clearly marked "Coming
 * soon" (never a dead link pretending to be live, and never hidden
 * entirely, so a visitor can see the full roadmap).
 */
export default async function DecisionLabsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  const l = locale as AppLocale;
  const tNav = await getTranslations({ locale, namespace: "nav" });

  return (
    <div data-brand="labs">
      <JsonLd
        data={breadcrumbSchema(l, [
          { name: tNav("labs"), path: "labs" },
          { name: copy.breadcrumb[l], path: "labs/decision-labs" },
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

      <section className="mx-auto max-w-3xl px-4 py-12 text-center tablet:py-16">
        <h1 className="font-display text-3xl font-bold text-text-primary tablet:text-5xl">{copy.title[l]}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-text-secondary">{copy.description[l]}</p>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 tablet:px-6">
        <div className="grid gap-6 tablet:grid-cols-2 desktop:grid-cols-3">
          {LABS.map((lab) => {
            const Icon = lab.icon;
            const isLive = Boolean(lab.href);
            const cardBody = (
              <>
                <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-md ${lab.accent}`}>
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="flex items-center gap-2">
                  <CardTitle>{lab.title[l]}</CardTitle>
                  {!isLive && (
                    <Badge variant="neutral" className="shrink-0">
                      {copy.comingSoon[l]}
                    </Badge>
                  )}
                </div>
                <CardDescription>{lab.body[l]}</CardDescription>
                {isLive && (
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                    {copy.tryNow[l]}
                  </span>
                )}
              </>
            );
            return isLive ? (
              <Link
                key={lab.key}
                href={lab.href!}
                className="group block rounded-lg border border-border bg-surface p-6 shadow-sm transition-all duration-fast hover:-translate-y-0.5 hover:border-border-strong hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                {cardBody}
              </Link>
            ) : (
              <Card key={lab.key} className="opacity-80">
                <CardHeader>{cardBody}</CardHeader>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
