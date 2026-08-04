"use client";

import * as React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics/track";
import { cn } from "@/lib/utils";
import type { AppLocale } from "@/lib/i18n/config";
import { CheckCircle2, XCircle } from "lucide-react";

const copy = {
  heading: { en: "Spot the phishing clue", ar: "اكتشف علامة التصيد الاحتيالي" },
  scenario: {
    en: 'From: "IT Support" <helpdesk@company-verify-account.com>\nSubject: Your mailbox is 98% full, verify now to avoid suspension',
    ar: 'من: "الدعم الفني" <helpdesk@company-verify-account.com>\nالموضوع: صندوق بريدك ممتلئ بنسبة 98%، تحقق الآن لتجنب الإيقاف',
  },
  question: { en: "What is the single biggest red flag here?", ar: "ما هي أبرز علامة تحذير هنا؟" },
  options: [
    {
      id: "domain",
      label: { en: "The sender's domain", ar: "نطاق المرسل" },
      correct: true,
      feedback: {
        en: "Correct. \"company-verify-account.com\" is not the company's real domain; a genuine IT team emails from the company's own domain.",
        ar: "صحيح. \"company-verify-account.com\" ليس النطاق الحقيقي للشركة؛ فريق تقنية المعلومات الحقيقي يراسل من نطاق الشركة نفسه.",
      },
    },
    {
      id: "font",
      label: { en: "The font used in the subject", ar: "الخط المستخدم في الموضوع" },
      correct: false,
      feedback: {
        en: "Not quite. Fonts are rendered by your mail client, not chosen meaningfully by the sender; they are not a security signal.",
        ar: "ليس تمامًا. يتم عرض الخطوط بواسطة برنامج البريد لديك، ولا يختارها المرسل بشكل ذي دلالة أمنية.",
      },
    },
    {
      id: "length",
      label: { en: "The length of the subject line", ar: "طول سطر الموضوع" },
      correct: false,
      feedback: {
        en: "Not quite. Legitimate subject lines can be short or long; length alone tells you nothing.",
        ar: "ليس تمامًا. يمكن أن تكون سطور الموضوع الشرعية قصيرة أو طويلة؛ الطول وحده لا يدل على شيء.",
      },
    },
  ],
  tryFullLab: { en: "This is one clue out of many. Phishing Hunter walks through a full investigation.", ar: "هذه علامة واحدة من علامات كثيرة. يأخذك صائد التصيد الاحتيالي عبر تحقيق كامل." },
} as const;

/**
 * The one real, working interactive example on the Quick Checks page
 * (production UX fix, 2026-07-27's explicit scope: "lightweight but
 * interactive", and its DO NOT list rules out building dozens of these
 * right now). No persistence, XP, or badge is attached; it exists to
 * prove the "3-5 minute exercise" format is real rather than a
 * placeholder, and to point an interested learner at the full
 * Phishing Hunter investigation.
 */
export function SpotThePhishMicroCheck({ locale }: { locale: AppLocale }) {
  const [selected, setSelected] = React.useState<string | null>(null);
  const startedRef = React.useRef(false);

  function handleSelect(id: string, correct: boolean) {
    if (selected) return;
    setSelected(id);
    if (!startedRef.current) {
      startedRef.current = true;
      trackEvent("quick_check_started", { locale, checkKey: "spot_the_phish_micro" });
    }
    trackEvent("quick_check_completed", { locale, checkKey: "spot_the_phish_micro", correct });
  }

  const selectedOption = copy.options.find((o) => o.id === selected);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{copy.heading[locale]}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <pre className="whitespace-pre-wrap rounded-md border border-border bg-surface-raised p-3 font-sans text-sm text-text-secondary">
          {copy.scenario[locale]}
        </pre>
        <p className="text-sm font-medium text-text-primary">{copy.question[locale]}</p>
        <div className="grid gap-2">
          {copy.options.map((option) => {
            const isSelected = selected === option.id;
            const showState = Boolean(selected);
            return (
              <Button
                key={option.id}
                type="button"
                variant={isSelected ? (option.correct ? "primary" : "destructive") : "outline"}
                // Same overflow fix as MicroCheck (2026-08-04): a
                // nowrap grid-item button forces its track wider than
                // the card once a label is long enough, which shows
                // up as the option row visibly overflowing the card's
                // right edge. min-w-0 + whitespace-normal + h-auto
                // let it shrink and wrap instead.
                className={cn(
                  "h-auto min-h-10 w-full min-w-0 items-center justify-between gap-3 whitespace-normal py-2.5 text-start",
                  showState && !isSelected && "opacity-60",
                )}
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
        <p className="text-xs text-text-muted">{copy.tryFullLab[locale]}</p>
      </CardContent>
    </Card>
  );
}
