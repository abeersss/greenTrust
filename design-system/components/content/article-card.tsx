import { Clock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/lib/i18n/navigation";
import { getPillarIcon } from "@/lib/content/pillar-icons";
import { cn } from "@/lib/utils";
import type { ArticleSummary } from "@/lib/content/articles";

export interface ArticleCardProps {
  article: ArticleSummary;
  /** Pre-formatted, locale-correct published-date string (e.g. via `Intl.DateTimeFormat`), or null if unavailable. */
  dateLabel?: string | null;
  /** Pre-formatted reading-time string (e.g. `t("readingTimeMinutes", { minutes })`), or null if unknown. */
  readingTimeLabel?: string | null;
  /** Larger, two-column-spanning treatment for the single "Featured Insight" slot. */
  featured?: boolean;
  className?: string;
}

/**
 * The shared card for every article surface (Insights page's Latest/
 * Featured/Dr. Abeer rails, homepage's "Latest CyberAbeer Insights",
 * pillar/hub pages, related-reading). Replaces the plain
 * Badge+CardTitle+CardDescription stack the founder called "another
 * static wall of white cards" with a pillar icon chip, reading time,
 * and published date, plus a subtle lift-and-shadow hover motion
 * consistent with the site's existing `hover:shadow-md` card pattern
 * (LabCard, GreenTrust AgentCard).
 */
export function ArticleCard({ article, dateLabel, readingTimeLabel, featured = false, className }: ArticleCardProps) {
  const Icon = getPillarIcon(article.pillarKey ?? "");

  return (
    <Link href={`/insights/${article.slug}`} className="group block h-full">
      <Card
        className={cn(
          "h-full transition-all duration-200 hover:-translate-y-1 hover:shadow-lg",
          featured && "border-primary-300",
          className
        )}
      >
        <CardHeader className={cn("gap-3", featured && "tablet:p-8")}>
          <div className="flex items-center justify-between gap-2">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary-50 text-primary-700">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </div>
            {article.categoryName && (
              <Badge variant="outline" className="w-fit">
                {article.categoryName}
              </Badge>
            )}
          </div>

          <CardTitle
            className={cn(
              "transition-colors group-hover:text-primary-700",
              featured && "font-display text-xl tablet:text-2xl"
            )}
          >
            {article.title}
          </CardTitle>

          {article.excerpt && <CardDescription className={cn(featured && "tablet:text-base")}>{article.excerpt}</CardDescription>}

          {(readingTimeLabel || dateLabel) && (
            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-text-muted">
              {readingTimeLabel && (
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                  {readingTimeLabel}
                </span>
              )}
              {dateLabel && <span>{dateLabel}</span>}
            </div>
          )}
        </CardHeader>
      </Card>
    </Link>
  );
}
