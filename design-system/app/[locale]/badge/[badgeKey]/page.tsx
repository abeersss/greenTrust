import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/i18n/navigation";
import { isAppLocale } from "@/lib/i18n/config";
import { siteUrl } from "@/lib/seo/site";
import { Award } from "lucide-react";

interface PageProps {
  params: Promise<{ locale: string; badgeKey: string }>;
  searchParams: Promise<{ name?: string; number?: string; back?: string }>;
}

function resolveDisplayName(badgeKey: string, name: string | undefined) {
  return name && name.trim().length > 0 ? name : badgeKey;
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { locale, badgeKey } = await params;
  const sp = await searchParams;
  const name = resolveDisplayName(badgeKey, sp.name);
  const number = sp.number ?? "";

  const title = locale === "ar" ? `شارة "${name}" — CyberAbeer` : `"${name}" badge — CyberAbeer`;
  const description =
    locale === "ar"
      ? "شارة تم الحصول عليها على منصة CyberAbeer للتوعية الأمنية."
      : "A badge earned on the CyberAbeer security awareness platform.";
  const imageUrl = `${siteUrl}/badge-image/${encodeURIComponent(badgeKey)}?name=${encodeURIComponent(
    name,
  )}&number=${encodeURIComponent(number)}&locale=${locale}`;
  const pageUrl = `${siteUrl}/${locale}/badge/${encodeURIComponent(badgeKey)}?name=${encodeURIComponent(
    name,
  )}&number=${encodeURIComponent(number)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: pageUrl,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: name }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

/**
 * Public, unauthenticated badge-share landing page (founder
 * instruction, 2026-08-04: "the sharing will be with badge as image
 * in the post"). Social platforms (X, LinkedIn, Facebook) render a
 * post's image by scraping the target URL's Open Graph tags, not from
 * the intent link itself -- so every badge Share button on /account
 * now points here instead of straight at the challenge page. This
 * page's only job is to carry a real badge image in its OG/Twitter
 * meta tags (see app/badge-image/[badgeKey]/route.ts) and hand the
 * visitor back to the actual challenge.
 */
export default async function BadgeSharePage({ params, searchParams }: PageProps) {
  const { locale, badgeKey } = await params;
  if (!isAppLocale(locale)) notFound();
  const sp = await searchParams;
  const name = resolveDisplayName(badgeKey, sp.name);
  const number = sp.number ?? "";
  const backHref = sp.back && sp.back.startsWith("/") ? sp.back : "/account";

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-16 text-center">
      <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-yellow-400 to-yellow-600 text-lg font-bold text-yellow-950 shadow-md">
        {number ? number : <Award className="h-9 w-9" aria-hidden="true" />}
      </div>
      <h1 className="mt-6 font-display text-2xl font-bold text-text-primary">{name}</h1>
      <p className="mt-2 text-sm text-text-muted">
        {locale === "ar" ? "شارة تم الحصول عليها على منصة CyberAbeer." : "A badge earned on CyberAbeer."}
      </p>
      <Button asChild className="mt-8">
        <Link href={backHref}>{locale === "ar" ? "عرض التحدي" : "View the challenge"}</Link>
      </Button>
    </div>
  );
}
