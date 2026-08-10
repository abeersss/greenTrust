import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isAppLocale, type AppLocale } from "@/lib/i18n/config";
import { requireFounder } from "@/lib/auth/founder";
import { getAllMediaFiles } from "@/lib/founder/media-admin";
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

function formatSize(kb: number | null): string {
  if (kb === null) return "--";
  if (kb < 1024) return kb + " KB";
  return (kb / 1024).toFixed(1) + " MB";
}

/**
 * Founder Media Library (CyberAbeer Platform Phase II, Batch 3). There
 * is no CMS-managed upload system or storage bucket in this codebase
 * -- every media asset the site links to lives in design-system/public
 * and ships as part of the Next.js build. This page catalogs those
 * files and shows a live reachability + size check against production
 * (see lib/founder/media-admin.ts), rather than a static list a
 * founder cannot verify is accurate.
 */
export default async function FounderMediaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  const l = locale as AppLocale;

  await requireFounder(l);

  const files = await getAllMediaFiles();
  const reachableCount = files.filter((f) => f.reachable).length;
  const totalKB = files.reduce((sum, f) => sum + (f.sizeKB ?? 0), 0);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-text-primary">Media Library</h1>
      <p className="mt-1 text-sm text-text-muted">
        Every static asset the site links to, with a live reachability check against production.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-text-muted">Total files</p>
            <p className="mt-1 text-2xl font-semibold text-text-primary">{files.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-text-muted">Reachable</p>
            <p className="mt-1 text-2xl font-semibold text-text-primary">{reachableCount} / {files.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-text-muted">Total size</p>
            <p className="mt-1 text-2xl font-semibold text-text-primary">{formatSize(totalKB)}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Content type</TableHead>
                  <TableHead>Link</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {files.map((file) => (
                  <TableRow key={file.path}>
                    <TableCell className="font-medium text-text-primary">{file.label}</TableCell>
                    <TableCell className="text-text-muted">{file.category}</TableCell>
                    <TableCell>
                      <Badge variant={file.reachable ? "success" : "danger"}>
                        {file.reachable ? "Reachable" : "Unreachable"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-text-muted">{formatSize(file.sizeKB)}</TableCell>
                    <TableCell className="text-text-muted">{file.contentType ?? "--"}</TableCell>
                    <TableCell>
                      <a
                        href={file.path}
                        target="_blank"
                        rel="noreferrer"
                        className="text-brand-primary underline"
                      >
                        View
                      </a>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
