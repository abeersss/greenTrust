import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/lib/i18n/navigation";
import type { ArticleSummary } from "@/lib/content/articles";

export interface RelatedArticlesProps {
  articles: ArticleSummary[];
  title: string;
}

/**
 * Internal-linking block (Section 19 of the content spec: every major
 * article should surface its topic-cluster neighbors). Only renders
 * articles that are actually published and actually linked via
 * `article_relations` -- no "you might also like" heuristic guessing.
 */
export function RelatedArticles({ articles, title }: RelatedArticlesProps) {
  if (articles.length === 0) return null;

  return (
    <section className="mt-10 border-t border-border pt-6">
      <h2 className="font-display text-lg font-semibold text-text-primary">{title}</h2>
      <div className="mt-4 grid gap-4 tablet:grid-cols-2">
        {articles.map((article) => (
          <Link key={article.id} href={`/insights/${article.slug}`}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardHeader>
                {article.categoryName && (
                  <Badge variant="outline" className="w-fit">
                    {article.categoryName}
                  </Badge>
                )}
                <CardTitle className="text-base">{article.title}</CardTitle>
                {article.excerpt && <CardDescription>{article.excerpt}</CardDescription>}
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
