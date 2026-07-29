import { Badge } from "@/components/ui/badge";
import type { IntelStoryStatus } from "@/lib/content/articles";

/**
 * Developing Story label (Section 13 of the spec): DEVELOPING /
 * CONFIRMED / UPDATED / RESOLVED. Kept as a plain Badge rather than
 * RiskIndicator since story status is a *certainty* axis, not a
 * severity axis -- a DEVELOPING critical vulnerability and a RESOLVED
 * critical vulnerability carry the same severity but very different
 * confidence, and conflating the two scales would blur that
 * distinction the spec explicitly asks to preserve.
 */
const STATUS_VARIANT: Record<IntelStoryStatus, "warning" | "success" | "info" | "neutral"> = {
  developing: "warning",
  confirmed: "success",
  updated: "info",
  resolved: "neutral",
};

export interface StoryStatusBadgeProps {
  status: IntelStoryStatus;
  label: string;
  className?: string;
}

export function StoryStatusBadge({ status, label, className }: StoryStatusBadgeProps) {
  return (
    <Badge variant={STATUS_VARIANT[status]} className={className}>
      {label}
    </Badge>
  );
}
