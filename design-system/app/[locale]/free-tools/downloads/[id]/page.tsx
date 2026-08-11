import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteBreadcrumb } from "@/components/site/site-breadcrumb";
import { Link } from "@/lib/i18n/navigation";
import { JsonLd } from "@/components/site/json-ld";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema } from "@/lib/seo/schema";
import { isAppLocale, type AppLocale } from "@/lib/i18n/config";
import { getToolResourceById } from "@/lib/tools/tool-resources";
import { ImageCarousel } from "@/components/site/image-carousel";
import { ShareToolButton } from "@/components/site/share-tool-button";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  if (!isAppLocale(locale)) notFound();
  const tool = await getToolResourceById(locale, id);
  if (!tool) return {};

  return buildMetadata({
    locale,
    path: `free-tools/downloads/${id}`,
    title: tool.name,
    description: tool.description,
    ogImagePath: tool.imageUrls[0] ?? undefined,
  });
}

/**
 * Per-tool shareable landing page (CyberAbeer Platform). Exists so the
 * Share button on /free-tools can point at a URL with correct,
 * per-tool OpenGraph/Twitter image tags -- the shared /free-tools hub
 * page itself can only carry one OG image, which would show the wrong
 * picture (or none) when a specific tool card is shared to LinkedIn/X.
 * Uses the tool's own first uploaded image as ogImagePath so shared
 * links render an actual product screenshot in the link preview.
 */
export default async function ToolDownloadPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  if (!isAppLocale(locale)) notFound();
  const l = locale as AppLocale;

  const tool = await getToolResourceById(l, id);
  if (!tool) notFound();

  const t = await getTranslations({ locale, namespace: "freeTools" });
  const tNav = await getTranslations({ locale, namespace: "nav" });

  const shareLabels = {
    share: t("shareCta"),
    copyLink: t("copyLink"),
    linkCopied: t("linkCopied"),
    linkedIn: t("shareOnLinkedIn"),
    x: t("shareOnX"),
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 tablet:px-6">
      <JsonLd
        data={breadcrumbSchema(l, [
          { name: tNav("freeTools"), path: "free-tools" },
          { name: tool.name, path: `free-tools/downloads/${id}` },
        ])}
      />
      <SiteBreadcrumb
        items={[
          { label: tNav("home"), href: "/" },
          { label: tNav("freeTools"), href: "/free-tools" },
          { label: tool.name },
        ]}
      />

      {tool.imageUrls.length > 0 && (
        <div className="mt-6">
          <ImageCarousel images={tool.imageUrls} alt={tool.name} heightClassName="h-72" />
        </div>
      )}

      <div className="mt-6 flex items-start justify-between gap-4">
        <h1 className="font-display text-3xl font-bold text-text-primary">{tool.name}</h1>
        <ShareToolButton
          path={`/${locale}/free-tools/downloads/${id}`}
          title={tool.name}
          shareLabel={shareLabels.share}
          copyLabel={shareLabels.copyLink}
          copiedLabel={shareLabels.linkCopied}
          linkedInLabel={shareLabels.linkedIn}
          xLabel={shareLabels.x}
        />
      </div>
      <p className="mt-3 text-text-secondary">{tool.description}</p>

      {tool.fileUrl && (
        <Button asChild className="mt-6">
          <a href={tool.fileUrl} download>
            <Download className="me-2 h-4 w-4" aria-hidden="true" />
            {t("downloadCta")}
          </a>
        </Button>
      )}

      <Link href="/free-tools" className="mt-10 block text-sm text-primary hover:underline">
        {t("backToFreeTools")}
      </Link>
    </div>
  );
}
