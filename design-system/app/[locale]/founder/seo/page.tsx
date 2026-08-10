import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isAppLocale, type AppLocale } from "@/lib/i18n/config";
import { requireFounder } from "@/lib/auth/founder";
import { getSeoOverview } from "@/lib/founder/seo-admin";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * Founder SEO Dashboard (CyberAbeer Platform Phase II, Batch 3). Backed
 * by lib/founder/seo-admin.ts, which live-fetches sitemap.xml,
 * robots.txt, and a curated set of real indexable routes from
 * production and parses the actual HTML returned, rather than showing
 * static or estimated scores a founder could not verify.
 */
export default async function FounderSeoPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  const l = locale as AppLocale;

  await requireFounder(l);

  const overview = await getSeoOverview();
  const pagesWithIssues = overview.pages.filter((p) => p.issues.length > 0).length;
  const routeCount = overview.pages.length / 2;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-text-primary">SEO Dashboard</h1>
      <p className="mt-1 text-sm text-text-muted">
        Live checks against production: sitemap, robots.txt, and on-page metadata for key routes in both languages.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-text-muted">Sitemap URLs</p>
            <p className="mt-1 text-2xl font-semibold text-text-primary">{overview.sitemap.totalUrls}</p>
            <p className="mt-1 text-xs text-text-muted">{overview.sitemap.enUrls} EN / {overview.sitemap.arUrls} AR</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-text-muted">Robots.txt</p>
            <p className="mt-1 text-2xl font-semibold text-text-primary">
              {overview.robots.reachable ? (overview.robots.allowsIndexing ? "Allows" : "Blocks") : "Down"}
            </p>
            <p className="mt-1 text-xs text-text-muted">{overview.robots.referencesSitemap ? "References sitemap" : "No sitemap reference"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-text-muted">Pages checked</p>
            <p className="mt-1 text-2xl font-semibold text-text-primary">{overview.pages.length}</p>
            <p className="mt-1 text-xs text-text-muted">{routeCount} routes x 2 locales</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-text-muted">Pages with issues</p>
            <p className="mt-1 text-2xl font-semibold text-text-primary">{pagesWithIssues} / {overview.pages.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Page</TableHead>
              <TableHead>Locale</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Canonical</TableHead>
              <TableHead>Hreflang</TableHead>
              <TableHead>Schema</TableHead>
              <TableHead>Issues</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {overview.pages.map((page) => (
              <TableRow key={page.locale + page.path}>
                <TableCell className="font-medium text-text-primary">{page.label}</TableCell>
                <TableCell className="text-text-muted">{page.locale.toUpperCase()}</TableCell>
                <TableCell>
                  <Badge variant={page.reachable ? (page.issues.length > 0 ? "warning" : "success") : "danger"}>
                    {page.reachable ? (page.statusCode ?? "OK") : "Down"}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-[220px] truncate text-text-muted" title={page.title ?? ""}>
                  {page.titleLength !== null ? page.titleLength + " chars" : "--"}
                </TableCell>
                <TableCell className="max-w-[220px] truncate text-text-muted" title={page.description ?? ""}>
                  {page.descriptionLength !== null ? page.descriptionLength + " chars" : "--"}
                </TableCell>
                <TableCell className="text-text-muted">{page.hasCanonical ? "Yes" : "No"}</TableCell>
                <TableCell className="text-text-muted">{page.hreflangCount}</TableCell>
                <TableCell className="text-text-muted">{page.hasJsonLd ? "Yes" : "No"}</TableCell>
                <TableCell className="max-w-[260px] text-xs text-text-muted">
                  {page.issues.length > 0 ? page.issues.join("; ") : "None"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
