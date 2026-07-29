import { Globe2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/lib/i18n/navigation";
import { SeverityBadge } from "@/components/content/severity-badge";
import { StoryStatusBadge } from "@/components/content/story-status-badge";
import { cn } from "@/lib/utils";
import type { ArticleSummary, IntelSeverity, IntelStoryStatus } from "@/lib/content/articles";

export interface IntelligenceCardProps {
  article: ArticleSummary;
  publishedLabel: string | null;
  updatedLabel: string | null;
  severityLabels: Record<IntelSeverity, string>;
  storyStatusLabels: Record<IntelStoryStatus, string>;
  menaRelevanceLabel: string;
  className?: string;
}

/**
 * The card every /intelligence listing surface uses (hub grid, Today's
 * Cyber Brief strip, homepage "Latest Cyber Intelligence" rail).
 * Deliberately distinct from ArticleCard (Insights' evergreen-content
 * card): severity is the primary visual signal here rather than a
 * pillar icon, since Section 2 of the spec requires severity, topic,
 * headline, one-line summary, published/updated dates, source
 * category, and affected tech to all be scannable without opening the
 * article -- a plain white card wall (explicitly called out as
 * something to avoid in Section 20) would bury exactly that
 * information behind a click.
 */
export function IntelligenceCard({
  article,
  publishedLabel,
  updatedLabel,
  severityLabels,
  storyStatusLabels,
  menaRelevanceLabel,
  className,
}: IntelligenceCardProps) {
  return (
    <Link href={`/intelligence/${article.slug}`} className="group block h-full">
      <Card className={cn("h-full transition-all duration-200 hover:-translate-y-1 hover:shadow-lg", className)}>
        <CardHeader className="gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              {article.intelSeverity && (
                <SeverityBadge severity={article.intelSeverity} label={severityLabels[article.intelSeverity]} />
              )}
              {article.intelStoryStatus && (
                <StoryStatusBadge status={article.intelStoryStatus} label={storyStatusLabels[article.intelStoryStatus]} />
              )}
            </div>
            {article.menaRelevance && (
              <Badge variant="outline" className="inline-flex w-fit items-center gap-1">
                <Globe2 className="h-3 w-3" aria-hidden="true" />
                {menaRelevanceLabel}
              </Badge>
            )}
          </div>

          {article.categoryName && (
            <Badge variant="outline" className="w-fit">
              {article.categoryName}
            </Badge>
          )}

          <CardTitle className="transition-colors group-hover:text-primary-700">{article.title}</CardTitle>
          {article.excerpt && <CardDescription>{article.excerpt}</CardDescription>}

          {article.affectedProduct && (
            <p className="text-xs text-text-muted">
              <span className="font-medium">{article.affectedProduct}</span>
            </p>
          )}

          {(publishedLabel || updatedLabel) && (
            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-text-muted">
              {publishedLabel && <span>{publishedLabel}</span>}
              {updatedLabel && <span>{updatedLabel}</span>}
            </div>
          )}
        </CardHeader>
      </Card>
    </Link>
  );
}
