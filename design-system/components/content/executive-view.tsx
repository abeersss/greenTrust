import { Briefcase } from "lucide-react";

export interface ExecutiveViewProps {
  summary: string | null;
  title: string;
}

/**
 * Executive View (Section 15): a short, forwardable business-impact
 * summary distinct from the full analysis body. Renders nothing when
 * an article has no `executive_summary` set -- not every intelligence
 * item warrants a separate executive framing, and this must never
 * fabricate one to fill the slot.
 */
export function ExecutiveView({ summary, title }: ExecutiveViewProps) {
  if (!summary) return null;

  return (
    <div className="not-prose mt-8 rounded-card border border-primary-200 bg-primary-50 p-5 tablet:p-6">
      <div className="flex items-center gap-2">
        <Briefcase className="h-5 w-5 text-primary-700" aria-hidden="true" />
        <h2 className="font-display text-base font-semibold text-primary-900">{title}</h2>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-primary-900">{summary}</p>
    </div>
  );
}
