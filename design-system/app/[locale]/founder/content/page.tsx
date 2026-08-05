import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isAppLocale, type AppLocale } from "@/lib/i18n/config";
import { requireFounder } from "@/lib/auth/founder";
import { getAllArticlesForFounder, type FounderContentGroup } from "@/lib/founder/content-admin";
import { setArticleStatus } from "@/lib/actions/founder-content";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

const GROUP_LABELS: Record<FounderContentGroup, string> = {
  all: "All",
  insights: "Insights",
  intelligence: "Cyber Intelligence",
  learn: "Learn hub",
  other: "Other",
};

const STATUS_VARIANT: Record<string, "success" | "warning" | "neutral" | "danger"> = {
  published: "success",
  in_review: "warning",
  draft: "neutral",
  archived: "danger",
};

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Founder Content admin (CyberAbeer Platform Phase II, Batch 1). One
 * screen covers Content, Insights, Cyber Intelligence, and the Learn
 * hub sidebar entries, because all four are the same underlying
 * `articles` table (see lib/founder/content-admin.ts) -- a real,
 * unfiltered admin list beats four thin pages pointed at fake
 * distinctions. `?group=` scopes the table to one surface; the
 * sidebar links for Insights/Cyber Intelligence pass it directly.
 */
export default async function FounderContentPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ group?: string }>;
}) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  const l = locale as AppLocale;

  await requireFounder(l);

  const { group: groupParam } = await searchParams;
  const activeGroup: FounderContentGroup = (
    ["all", "insights", "intelligence", "learn", "other"] as const
  ).includes(groupParam as FounderContentGroup)
    ? (groupParam as FounderContentGroup)
    : "all";

  const allArticles = await getAllArticlesForFounder();
  const articles = activeGroup === "all" ? allArticles : allArticles.filter((a) => a.group === activeGroup);

  const counts: Record<FounderContentGroup, number> = {
    all: allArticles.length,
    insights: allArticles.filter((a) => a.group === "insights").length,
    intelligence: allArticles.filter((a) => a.group === "intelligence").length,
    learn: allArticles.filter((a) => a.group === "learn").length,
    other: allArticles.filter((a) => a.group === "other").length,
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-text-primary tablet:text-3xl">Content</h1>
      <p className="mt-1 text-sm text-text-muted">
        Every article across Insights, Cyber Intelligence, and the Learn hub, in one place. Publish or
        unpublish directly -- writes go straight to the live site.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {(["all", "insights", "intelligence", "learn", "other"] as const).map((g) => (
          <Button key={g} asChild size="sm" variant={g === activeGroup ? "primary" : "outline"}>
            <a href={g === "all" ? `/${locale}/founder/content` : `/${locale}/founder/content?group=${g}`}>
              {GROUP_LABELS[g]} ({counts[g]})
            </a>
          </Button>
        ))}
      </div>

      <Card className="mt-4">
        <CardContent className="p-0">
          {articles.length === 0 ? (
            <p className="p-6 text-sm text-text-muted">No articles in this group yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Locales</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {articles.map((article) => {
                  const publish = setArticleStatus.bind(null, l, article.id, "published");
                  const unpublish = setArticleStatus.bind(null, l, article.id, "draft");
                  const archive = setArticleStatus.bind(null, l, article.id, "archived");
                  return (
                    <TableRow key={article.id}>
                      <TableCell className="max-w-xs font-medium text-text-primary">
                        {article.titleEn ?? article.titleAr ?? "(untitled)"}
                      </TableCell>
                      <TableCell className="text-text-muted">{article.categoryName ?? "—"}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Badge variant={article.titleEn ? "info" : "outline"}>EN</Badge>
                          <Badge variant={article.titleAr ? "info" : "outline"}>AR</Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={STATUS_VARIANT[article.status] ?? "neutral"}>{article.status}</Badge>
                      </TableCell>
                      <TableCell className="text-text-muted">{formatDate(article.publishedAt)}</TableCell>
                      <TableCell className="text-text-muted">{formatDate(article.updatedAt)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {article.status !== "published" && (
                            <form action={publish}>
                              <Button type="submit" size="sm" variant="primary">
                                Publish
                              </Button>
                            </form>
                          )}
                          {article.status === "published" && (
                            <form action={unpublish}>
                              <Button type="submit" size="sm" variant="outline">
                                Unpublish
                              </Button>
                            </form>
                          )}
                          {article.status !== "archived" && (
                            <form action={archive}>
                              <Button type="submit" size="sm" variant="ghost">
                                Archive
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
