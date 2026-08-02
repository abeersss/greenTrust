import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { CardTitle } from "@/components/ui/card";
import { SiteBreadcrumb } from "@/components/site/site-breadcrumb";
import { JsonLd } from "@/components/site/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema } from "@/lib/seo/schema";
import { isAppLocale, type AppLocale } from "@/lib/i18n/config";
import { Link } from "@/lib/i18n/navigation";
import { pick } from "@/lib/challenges/bilingual";
import { getCtfChallengesByCategory } from "@/lib/ctf/challenges";
import type { CtfCategory, CtfChallenge, CtfDifficulty } from "@/lib/ctf/types";
import { Flag, Globe, FileSearch, KeyRound, Sparkles } from "lucide-react";

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
  xpSuffix: { en: "XP", ar: "نقطة خبرة" },
  playChallenge: { en: "Play challenge →", ar: "العب التحدي ←" },
  backToLabs: { en: "← Back to CyberAbeer Labs", ar: "← العودة إلى CyberAbeer Labs" },
} as const;

const CATEGORY_LABEL: Record<CtfCategory, { en: string; ar: string }> = {
  web: { en: "Web Exploitation", ar: "استغلال الويب" },
  forensics: { en: "Forensics", ar: "التحليل الجنائي الرقمي" },
  crypto: { en: "Cryptography", ar: "التشفير" },
};

const CATEGORY_ICON: Record<CtfCategory, typeof Globe> = {
  web: Globe,
  forensics: FileSearch,
  crypto: KeyRound,
};

const CATEGORY_ACCENT: Record<CtfCategory, string> = {
  web: "bg-primary-50 text-primary-700",
  forensics: "bg-accent/10 text-accent",
  crypto: "bg-info-50 text-info-600",
};

const DIFFICULTY_LABEL: Record<CtfDifficulty, { en: string; ar: string }> = {
  beginner: { en: "Beginner", ar: "مبتدئ" },
  intermediate: { en: "Intermediate", ar: "متوسط" },
};

const CATEGORY_ORDER: CtfCategory[] = ["web", "forensics", "crypto"];

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

function ChallengeCard({ challenge, locale }: { challenge: CtfChallenge; locale: AppLocale }) {
  return (
    <Link
      href={`/labs/ctf/${challenge.slug}`}
      className="group block rounded-lg border border-border bg-surface p-6 shadow-sm transition-all duration-fast hover:-translate-y-0.5 hover:border-border-strong hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      <div className="flex items-start justify-between gap-2">
        <CardTitle className="text-base">{pick(challenge.title, locale)}</CardTitle>
        <Badge variant={challenge.difficulty === "beginner" ? "success" : "warning"} className="shrink-0">
          {pick(DIFFICULTY_LABEL[challenge.difficulty], locale)}
        </Badge>
      </div>
      <p className="mt-2 text-sm text-text-secondary">{pick(challenge.shortDescription, locale)}</p>
      <div className="mt-4 flex items-center justify-between">
        <span className="flex items-center gap-1 text-xs font-medium text-xp">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          {challenge.xpReward} {pick(copy.xpSuffix, locale)}
        </span>
        <span className="text-sm font-medium text-primary">{pick(copy.playChallenge, locale)}</span>
      </div>
    </Link>
  );
}

/**
 * Real listing page for the CyberAbeer CTF track, replacing the
 * previous honest-but-empty "coming soon" placeholder now that all 6
 * challenges (2 each across web, forensics, crypto) are live. Keeps
 * the intro section, breadcrumb, and JSON-LD pattern from the
 * placeholder version; only the body below the intro changes, from a
 * single "in development" status card to a real grid of playable
 * challenges grouped by category, matching the Decision Labs landing
 * page's card visual language (see app/[locale]/labs/decision-labs/page.tsx).
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

      <section className="mx-auto max-w-6xl px-4 pb-16 tablet:px-6">
        <div className="space-y-12">
          {CATEGORY_ORDER.map((category) => {
            const CategoryIcon = CATEGORY_ICON[category];
            const challenges = getCtfChallengesByCategory(category);
            return (
              <div key={category}>
                <div className="mb-4 flex items-center gap-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-md ${CATEGORY_ACCENT[category]}`}>
                    <CategoryIcon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h2 className="font-display text-xl font-bold text-text-primary">{pick(CATEGORY_LABEL[category], l)}</h2>
                </div>
                <div className="grid gap-6 tablet:grid-cols-2">
                  {challenges.map((challenge) => (
                    <ChallengeCard key={challenge.slug} challenge={challenge} locale={l} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-12 text-center">
          <a href={`/${l}/labs`} className="text-sm font-medium text-primary hover:underline">
            {copy.backToLabs[l]}
          </a>
        </p>
      </section>
    </div>
  );
}
