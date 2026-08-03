"use client";

import * as React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics/track";
import { cn } from "@/lib/utils";
import type { AppLocale } from "@/lib/i18n/config";
import { Link } from "@/lib/i18n/navigation";
import { CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import type { QuickCheckDef } from "@/lib/labs/quick-checks-data";

/**
 * Generic single-scenario / single-decision / immediate-feedback micro
 * check, shared by the five Quick Knowledge Checks that used to be
 * "Coming soon" placeholders (2026-08-03). Mirrors the exact
 * interaction pattern of the original SpotThePhishMicroCheck
 * (bespoke, left as-is) but is data-driven via QuickCheckDef so each
 * of the five new checks doesn't need its own component file. No
 * persistence, XP, or badge is attached, matching the format's scope
 * — it exists to be a real, working exercise and to route an
 * interested learner to the full Decision Lab that covers the topic.
 */
export function MicroCheck({ def, locale }: { def: QuickCheckDef; locale: AppLocale }) {
  const [selected, setSelected] = React.useState<string | null>(null);
  const startedRef = React.useRef(false);

  function handleSelect(id: string, correct: boolean) {
    if (selected) return;
    setSelected(id);
    if (!startedRef.current) {
      startedRef.current = true;
      trackEvent("quick_check_started", { locale, checkKey: def.key });
    }
    trackEvent("quick_check_completed", { locale, checkKey: def.key, correct });
  }

  const selectedOption = def.options.find((o) => o.id === selected);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{def.heading[locale]}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <pre className="whitespace-pre-wrap rounded-md border border-border bg-surface-raised p-3 font-sans text-sm text-text-secondary">
          {def.scenario[locale]}
        </pre>
        <p className="text-sm font-medium text-text-primary">{def.question[locale]}</p>
        <div className="grid gap-2">
          {def.options.map((option) => {
            const isSelected = selected === option.id;
            const showState = Boolean(selected);
            return (
              <Button
                key={option.id}
                type="button"
                variant={isSelected ? (option.correct ? "primary" : "destructive") : "outline"}
                className={cn("justify-between text-start", showState && !isSelected && "opacity-60")}
                onClick={() => handleSelect(option.id, option.correct)}
                disabled={showState}
              >
                {option.label[locale]}
                {isSelected && (option.correct ? <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" /> : <XCircle className="h-4 w-4 shrink-0" aria-hidden="true" />)}
              </Button>
            );
          })}
        </div>
        {selectedOption && (
          <p className="rounded-md border border-border bg-surface-raised px-3 py-2 text-sm text-text-secondary">
            {selectedOption.feedback[locale]}
          </p>
        )}
        {selectedOption && (
          <Link
            href={def.relatedLab.href}
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            {def.relatedLab.label[locale]}
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
