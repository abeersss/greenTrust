import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/lib/i18n/navigation";

export interface ComingSoonCtaProps {
  /** `articles.related_lab_key`, e.g. "phishing-hunter" -- matches the
   * `challengeKey` in lib/achievements/catalog.ts / the live challenge
   * catalog. Null/undefined means no interactive experience exists yet. */
  relatedLabKey: string | null;
  title: string;
  liveDescription: string;
  liveLinkLabel: string;
  comingSoonDescription: string;
  comingSoonLabel: string;
}

/**
 * "Article -> interaction" CTA (Section 20 of the content spec). The
 * rule this exists to enforce is absolute: an article must never link
 * to an interactive CyberAbeer experience that doesn't exist yet. When
 * `relatedLabKey` is set, this links to the real `/challenge/[key]`
 * route; when it's null, it renders an honest "Coming Soon" badge
 * instead of a dead link or a fabricated one.
 */
export function ComingSoonCta({
  relatedLabKey,
  title,
  liveDescription,
  liveLinkLabel,
  comingSoonDescription,
  comingSoonLabel,
}: ComingSoonCtaProps) {
  return (
    <section className="mt-10 rounded-card border border-border bg-surface-raised p-6">
      <h2 className="font-display text-lg font-semibold text-text-primary">{title}</h2>
      {relatedLabKey ? (
        <>
          <p className="mt-2 text-sm text-text-secondary">{liveDescription}</p>
          <Button asChild className="mt-4">
            <Link href={`/challenge/${relatedLabKey}`}>{liveLinkLabel}</Link>
          </Button>
        </>
      ) : (
        <>
          <p className="mt-2 text-sm text-text-secondary">{comingSoonDescription}</p>
          <Badge variant="outline" className="mt-4 w-fit">
            {comingSoonLabel}
          </Badge>
        </>
      )}
    </section>
  );
}
