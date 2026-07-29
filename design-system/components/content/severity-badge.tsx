import { RiskIndicator, type RiskLevel } from "@/components/ui/risk-indicator";
import type { IntelSeverity } from "@/lib/content/articles";

/**
 * Cyber Intelligence severity (Section 2 of the spec: CRITICAL / HIGH /
 * IMPORTANT / INFORMATIONAL, meant to reflect real impact and never be
 * inflated for engagement) rendered through the site's existing
 * RiskIndicator scale rather than a new color language. "important"
 * maps to the same visual weight as "medium" and "informational" to
 * "low" -- the four-tier intelligence vocabulary and the pre-existing
 * four-tier risk vocabulary describe the same underlying severity
 * gradient, just with domain-appropriate labels.
 */
const SEVERITY_TO_RISK_LEVEL: Record<IntelSeverity, RiskLevel> = {
  critical: "critical",
  high: "high",
  important: "medium",
  informational: "low",
};

export interface SeverityBadgeProps {
  severity: IntelSeverity;
  label: string;
  className?: string;
}

export function SeverityBadge({ severity, label, className }: SeverityBadgeProps) {
  return <RiskIndicator level={SEVERITY_TO_RISK_LEVEL[severity]} labelText={label} className={className} />;
}
