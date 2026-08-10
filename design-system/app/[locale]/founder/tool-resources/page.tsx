import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isAppLocale, type AppLocale } from "@/lib/i18n/config";
import { requireFounder } from "@/lib/auth/founder";
import { getToolResourcesForFounder } from "@/lib/founder/tool-resources-admin";
import { FounderToolResourcesForm } from "@/components/founder/founder-tool-resources-form";
import { FounderToolResourceRowActions } from "@/components/founder/founder-tool-resource-row-actions";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ImageIcon, FileIcon } from "lucide-react";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * Founder Tool Resources admin (CyberAbeer Platform, migration 030).
 * Replaces the hardcoded Downloads array that used to live in
 * free-tools/page.tsx: bilingual name + description, then either up
 * to 4 gallery images or one downloadable file. "Hide" unpublishes
 * without deleting -- the public /free-tools page only shows
 * is_active rows.
 */
export default async function FounderToolResourcesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  const l = locale as AppLocale;

  await requireFounder(l);
  const tools = await getToolResourcesForFounder();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-text-primary tablet:text-3xl">Free Tools</h1>
      <p className="mt-1 text-sm text-text-muted">
        Add and manage the tools shown in the "Downloads" section of the public Free Tools page. Give each one a
        bilingual name and description, then either up to 4 images (shown as a sliding carousel) or one
        downloadable file.
      </p>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Add a tool</CardTitle>
        </CardHeader>
        <CardContent>
          <FounderToolResourcesForm locale={l} />
        </CardContent>
      </Card>

      <h2 className="mt-8 font-display text-lg font-bold text-text-primary">Your tools</h2>
      <div className="mt-3 space-y-4">
        {tools.map((tool) => (
          <Card key={tool.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-text-primary">{tool.nameEn}</p>
                    <span className="text-text-muted" dir="rtl">
                      {tool.nameAr}
                    </span>
                    <Badge variant={tool.isActive ? "success" : "danger"}>{tool.isActive ? "Live" : "Hidden"}</Badge>
                    {tool.imageUrls.length > 0 ? (
                      <Badge variant="primary">
                        <ImageIcon className="me-1 inline h-3 w-3" aria-hidden="true" />
                        {tool.imageUrls.length} image{tool.imageUrls.length > 1 ? "s" : ""}
                      </Badge>
                    ) : tool.fileUrl ? (
                      <Badge variant="primary">
                        <FileIcon className="me-1 inline h-3 w-3" aria-hidden="true" />
                        {tool.fileName ?? "File"}
                      </Badge>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm text-text-muted">{tool.descriptionEn}</p>
                </div>
                <FounderToolResourceRowActions locale={l} id={tool.id} isActive={tool.isActive} />
              </div>
            </CardContent>
          </Card>
        ))}
        {tools.length === 0 && <p className="text-sm text-text-muted">No tools yet. Add one above.</p>}
      </div>
    </div>
  );
}
