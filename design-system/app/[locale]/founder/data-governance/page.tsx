import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isAppLocale, type AppLocale } from "@/lib/i18n/config";
import { requireFounder } from "@/lib/auth/founder";
import { getDgAdminList } from "@/lib/founder/dg-admin";
import { setArticleStatus } from "@/lib/actions/founder-content";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

export const metadata: Metadata = { robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const STATUS_VARIANT: Record<string, "success" | "warning" | "neutral" | "danger"> = {
  published: "success",
  founder_review: "warning",
  in_review: "warning",
  draft: "neutral",
  archived: "danger",
};

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export default async function FounderDataGovernancePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  const l = locale as AppLocale;
  await requireFounder(l);

  const rows = await getDgAdminList();

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-text-primary tablet:text-3xl">Data Governance Center</h1>
          <p className="mt-1 text-sm text-text-muted">
            Create and edit guides in English and Arabic. Changes go live as soon as a resource is set to Published.
          </p>
        </div>
        <Button asChild variant="primary">
          <a href={`/${locale}/founder/data-governance/new`}>New resource</a>
        </Button>
      </div>

      <Card className="mt-6">
        <CardContent className="p-0">
          {rows.length === 0 ? (
            <p className="p-6 text-sm text-text-muted">No resources yet. Create the first one.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Languages</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => {
                  const id = r.id;
                  async function publish() {
                    "use server";
                    await setArticleStatus(l, id, "published");
                  }
                  async function unpublish() {
                    "use server";
                    await setArticleStatus(l, id, "draft");
                  }
                  return (
                    <TableRow key={r.id}>
                      <TableCell className="max-w-xs font-medium text-text-primary">
                        {r.titleEn ?? r.titleAr ?? "(untitled)"}
                        {r.isFeatured && <span className="ms-2 text-xs text-primary-600">Featured</span>}
                      </TableCell>
                      <TableCell className="text-text-muted">{r.category}</TableCell>
                      <TableCell className="text-text-muted">{r.resourceType}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Badge variant={r.titleEn ? "info" : "outline"}>EN</Badge>
                          <Badge variant={r.titleAr ? "info" : "outline"}>AR</Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={STATUS_VARIANT[r.status] ?? "neutral"}>{r.status}</Badge>
                      </TableCell>
                      <TableCell className="text-text-muted">{formatDate(r.updatedAt)}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          <Button asChild size="sm" variant="outline">
                            <a href={`/${locale}/founder/data-governance/${r.id}`}>Edit</a>
                          </Button>
                          {r.status === "published" ? (
                            <>
                              <Button asChild size="sm" variant="ghost">
                                <a
                                  href={`/${locale === "ar" && r.slugAr ? "ar" : "en"}/data-governance/${r.category}/${encodeURIComponent(
                                    (locale === "ar" && r.slugAr ? r.slugAr : r.slugEn ?? r.slugAr) ?? ""
                                  )}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  View
                                </a>
                              </Button>
                              <form action={unpublish}>
                                <Button type="submit" size="sm" variant="outline">
                                  Unpublish
                                </Button>
                              </form>
                            </>
                          ) : (
                            <form action={publish}>
                              <Button type="submit" size="sm" variant="primary">
                                Publish
                              </Button>
                            </form>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
