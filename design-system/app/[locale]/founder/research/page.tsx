import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isAppLocale, type AppLocale } from "@/lib/i18n/config";
import { requireFounder } from "@/lib/auth/founder";
import { getResearchSettingsForFounder } from "@/lib/actions/founder-research";
import { getResearchAreasForFounder, getResearchPublicationsForFounder } from "@/lib/founder/research-admin";
import { ResearchSettingsForm } from "@/components/founder/research-settings-form";
import { ResearchAreaForm } from "@/components/founder/research-area-form";
import { ResearchAreaRowActions } from "@/components/founder/research-area-row-actions";
import { ResearchPublicationForm } from "@/components/founder/research-publication-form";
import { ResearchPublicationRowActions } from "@/components/founder/research-publication-row-actions";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * Founder Research admin (CyberAbeer Platform Phase II, migration
 * 031). Three pieces of content that were previously static (next-
 * intl translations plus a hardcoded lib/research/publications.ts
 * constant): the intro paragraph (singleton, same pattern as the
 * homepage banner), the research areas list, and publications --
 * both ordered lists with the same hide/delete row actions as Books.
 */
export default async function FounderResearchPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  const l = locale as AppLocale;

  await requireFounder(l);

  const [settings, areas, publications] = await Promise.all([
    getResearchSettingsForFounder(l),
    getResearchAreasForFounder(),
    getResearchPublicationsForFounder(),
  ]);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-text-primary tablet:text-3xl">Research</h1>
      <p className="mt-1 text-sm text-text-muted">
        Manage the intro paragraph, research areas, and publications shown on the public Research page.
      </p>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Intro paragraph</CardTitle>
        </CardHeader>
        <CardContent>
          <ResearchSettingsForm locale={l} initial={settings} />
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Add a research area</CardTitle>
        </CardHeader>
        <CardContent>
          <ResearchAreaForm locale={l} />
        </CardContent>
      </Card>

      <h2 className="mt-8 font-display text-lg font-bold text-text-primary">
        Research areas ({areas.length})
      </h2>
      <div className="mt-3 space-y-2">
        {areas.map((area) => (
          <Card key={area.id}>
            <CardContent className="flex items-center justify-between gap-4 p-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-text-primary">{area.textEn}</p>
                  <Badge variant={area.isActive ? "success" : "danger"}>
                    {area.isActive ? "Live" : "Hidden"}
                  </Badge>
                </div>
                <p className="mt-0.5 text-sm text-text-muted" dir="rtl">
                  {area.textAr}
                </p>
              </div>
              <ResearchAreaRowActions locale={l} areaId={area.id} isActive={area.isActive} />
            </CardContent>
          </Card>
        ))}
        {areas.length === 0 && <p className="text-sm text-text-muted">No research areas yet.</p>}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-base">Add a publication</CardTitle>
        </CardHeader>
        <CardContent>
          <ResearchPublicationForm locale={l} />
        </CardContent>
      </Card>

      <h2 className="mt-8 font-display text-lg font-bold text-text-primary">
        Publications ({publications.length})
      </h2>
      <div className="mt-3 space-y-4">
        {publications.map((pub) => (
          <Card key={pub.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-text-primary">{pub.title}</p>
                    <Badge variant={pub.isActive ? "success" : "danger"}>
                      {pub.isActive ? "Live" : "Hidden"}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-text-muted">
                    {pub.venue} · {pub.year}
                  </p>
                  <a
                    href={pub.doiUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-block text-sm text-primary underline underline-offset-4"
                  >
                    {pub.doiUrl}
                  </a>
                </div>
                <ResearchPublicationRowActions locale={l} publicationId={pub.id} isActive={pub.isActive} />
              </div>
            </CardContent>
          </Card>
        ))}
        {publications.length === 0 && <p className="text-sm text-text-muted">No publications yet.</p>}
      </div>
    </div>
  );
}
