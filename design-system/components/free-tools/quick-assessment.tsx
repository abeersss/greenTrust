"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { AssessmentProgress } from "@/components/assessment/assessment-progress";
import { AssessmentQuestion } from "@/components/assessment/assessment-question";
import { AssessmentResultCard } from "@/components/assessment/assessment-result-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { submitToolResult } from "@/lib/actions/tool-submission";
import { trackEvent } from "@/lib/analytics/track";
import { usePathname } from "next/navigation";
import type { AppLocale } from "@/lib/i18n/config";

export interface QuickAssessmentQuestion {
  prompt: string;
  options: string[]; // ordered best-practice-first: index 0 = strongest answer
}

export interface QuickAssessmentProps {
  toolKey: "greentrust_quick_assessment" | "quantum_quick_assessment";
  locale: AppLocale;
  questions: QuickAssessmentQuestion[];
  intro: string;
  resultHeading: string;
  resultLow: string;
  resultMedium: string;
  resultHigh: string;
  ctaReportLabel: string;
}

/**
 * Client-only self-assessment: works fully anonymously (no network
 * call at all) while the visitor is answering, so it's instant and
 * never blocks on Supabase being reachable. A submission only happens
 * if the visitor chooses to email themselves the result, at which
 * point `submitToolResult` writes to `tool_submissions` (Phase 3
 * LEADS domain). Scoring is a simple, disclosed heuristic (first
 * option per question is worth the most), not a validated
 * psychometric instrument, matching the "educational self-assessment,
 * not a certified audit" framing on the Free Tools page.
 */
export function QuickAssessment({
  toolKey,
  locale,
  questions,
  intro,
  resultHeading,
  resultLow,
  resultMedium,
  resultHigh,
  ctaReportLabel,
}: QuickAssessmentProps) {
  const tCommon = useTranslations("common");
  const pathname = usePathname();
  const [step, setStep] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<number, string>>({});
  const [showEmailForm, setShowEmailForm] = React.useState(false);
  const [emailStatus, setEmailStatus] = React.useState<"idle" | "loading" | "success" | "error">("idle");

  const isComplete = step >= questions.length;

  const score = React.useMemo(() => {
    const total = questions.length * 2;
    const earned = Object.values(answers).reduce((sum, value) => sum + (2 - Number(value)), 0);
    return Math.round((earned / total) * 100);
  }, [answers, questions.length]);

  const resultSummary = score >= 75 ? resultHigh : score >= 40 ? resultMedium : resultLow;

  const hasStartedRef = React.useRef(false);
  const hasCompletedRef = React.useRef(false);

  React.useEffect(() => {
    if (isComplete && !hasCompletedRef.current) {
      hasCompletedRef.current = true;
      trackEvent("assessment_completed", { toolKey, locale, score });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isComplete]);

  function handleAnswer(questionIndex: number, value: string) {
    if (!hasStartedRef.current) {
      hasStartedRef.current = true;
      trackEvent("assessment_started", { toolKey, locale });
    }
    setAnswers((prev) => ({ ...prev, [questionIndex]: value }));
    trackEvent("assessment_question_completed", { toolKey, locale, question: questionIndex });
    setTimeout(() => setStep((s) => s + 1), 150);
  }

  async function handleEmailSubmit(formData: FormData) {
    setEmailStatus("loading");
    const numericAnswers = questions.map((_, i) => Number(answers[i] ?? 0));
    const result = await submitToolResult(
      {
        toolKey,
        answers: numericAnswers,
        score,
        email: String(formData.get("email") ?? ""),
        locale,
      },
      pathname
    );
    if (result.status === "success") {
      setEmailStatus("success");
      trackEvent("lead_created", { toolKey, locale, score });
    } else {
      setEmailStatus("error");
    }
  }

  if (!isComplete) {
    // Non-null: this branch only runs while step < questions.length
    // (the isComplete check above), so step always indexes a real entry.
    const question = questions[step]!;
    return (
      <div className="space-y-6">
        <AssessmentProgress
          currentStep={step + 1}
          totalSteps={questions.length}
          label={`${step + 1} / ${questions.length}`}
        />
        <p className="text-sm text-text-muted">{intro}</p>
        <AssessmentQuestion
          id={`${toolKey}-q${step}`}
          prompt={question.prompt}
          mode="single"
          value={answers[step] ?? ""}
          onChange={(value) => handleAnswer(step, value as string)}
          options={question.options.map((label, index) => ({ id: String(index), label }))}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AssessmentResultCard
        title={resultHeading}
        score={score}
        scoreLabel={resultHeading}
        summary={resultSummary}
        emailCaptured={emailStatus === "success"}
        onRequestReport={() => setShowEmailForm(true)}
      />

      {showEmailForm && emailStatus !== "success" && (
        <form action={handleEmailSubmit} className="mx-auto flex max-w-sm gap-2">
          <Input type="email" name="email" required placeholder={tCommon("email")} />
          <Button type="submit" loading={emailStatus === "loading"}>
            {ctaReportLabel}
          </Button>
        </form>
      )}
      {emailStatus === "error" && (
        <p className="text-center text-sm text-danger-600">{tCommon("errorGeneric")}</p>
      )}

      <div className="text-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setStep(0);
            setAnswers({});
            setShowEmailForm(false);
            setEmailStatus("idle");
          }}
        >
          {tCommon("backToHome")}
        </Button>
      </div>
    </div>
  );
}
