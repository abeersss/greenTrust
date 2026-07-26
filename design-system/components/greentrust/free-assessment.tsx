"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { AssessmentProgress } from "@/components/assessment/assessment-progress";
import { AssessmentQuestion } from "@/components/assessment/assessment-question";
import { FreeAssessmentResults } from "@/components/greentrust/free-assessment-results";
import { submitGreenTrustAssessment } from "@/lib/actions/greentrust-assessment";
import { GREENTRUST_TOTAL_QUESTIONS, type GreenTrustAssessmentResult } from "@/lib/assessments/greentrust-free";
import { trackEvent } from "@/lib/analytics/track";
import type { AppLocale } from "@/lib/i18n/config";
import { ShieldCheck } from "lucide-react";

export interface FreeAssessmentProps {
  locale: AppLocale;
  isLoggedIn: boolean;
}

type Screen = "intro" | "question" | "submitting" | "results";

/**
 * Orchestrates the GreenTrust Free Assessment: intro, sixteen
 * questions (two per governance domain), then results. On completing
 * the last question this calls `submitGreenTrustAssessment` with no
 * email (silent persistence: `tool_key = 'greentrust_free_assessment'`,
 * `user_id` set automatically server-side if the visitor is already
 * logged in) so the result is durably saved before the results screen
 * ever renders — "Never show successful if the database write
 * failed" means the results screen itself reflects whether that save
 * succeeded (see `persisted` prop), not just the deterministic score,
 * which is always correct regardless of persistence.
 */
export function FreeAssessment({ locale, isLoggedIn }: FreeAssessmentProps) {
  const t = useTranslations("greentrustAssessment");
  const [screen, setScreen] = React.useState<Screen>("intro");
  const [step, setStep] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<number, string>>({});
  const [result, setResult] = React.useState<GreenTrustAssessmentResult | null>(null);
  const [submissionId, setSubmissionId] = React.useState<string>("");
  const [persisted, setPersisted] = React.useState(false);
  const [saveError, setSaveError] = React.useState(false);
  const hasStartedAnalytics = React.useRef(false);

  const questions = t.raw("questions") as { prompt: string; options: string[] }[];

  function handleStart() {
    setScreen("question");
    if (!hasStartedAnalytics.current) {
      hasStartedAnalytics.current = true;
      trackEvent("assessment_started", { locale, tool: "greentrust_free_assessment" });
    }
  }

  async function handleAnswer(questionIndex: number, value: string) {
    const nextAnswers = { ...answers, [questionIndex]: value };
    setAnswers(nextAnswers);

    if (questionIndex < questions.length - 1) {
      setStep((s) => s + 1);
      return;
    }

    // Last question answered: score and persist server-side.
    setScreen("submitting");
    const numericAnswers = Array.from({ length: GREENTRUST_TOTAL_QUESTIONS }, (_, i) => Number(nextAnswers[i] ?? 0));

    const response = await submitGreenTrustAssessment({ answers: numericAnswers, locale });
    if (response.status === "success" && response.data) {
      setResult(response.data.result);
      setSubmissionId(response.data.submissionId);
      setPersisted(true);
      setSaveError(false);
      trackEvent("assessment_completed", {
        locale,
        tool: "greentrust_free_assessment",
        score: response.data.result.overallScore,
      });
    } else {
      // The score is still deterministic and computable client-side even
      // if the save failed; show it, but flag that persistence did not
      // succeed rather than silently pretending it did.
      const { scoreGreenTrustAssessment } = await import("@/lib/assessments/greentrust-free");
      setResult(scoreGreenTrustAssessment(numericAnswers));
      setPersisted(false);
      setSaveError(true);
    }
    setScreen("results");
  }

  function handleRestart() {
    setStep(0);
    setAnswers({});
    setResult(null);
    setSubmissionId("");
    setPersisted(false);
    setSaveError(false);
    hasStartedAnalytics.current = false;
    setScreen("intro");
  }

  if (screen === "intro") {
    return (
      <Card className="mx-auto max-w-lg">
        <CardHeader className="items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 text-primary-700">
            <ShieldCheck className="h-7 w-7" aria-hidden="true" />
          </div>
          <CardTitle className="font-display text-2xl">{t("title")}</CardTitle>
          <CardDescription>{t("intro")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-xs text-text-muted">{t("estimatedTime")}</p>
          <Button className="w-full" size="lg" onClick={handleStart}>
            {t("startCta")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (screen === "question") {
    // Non-null: this branch only runs while step < questions.length
    // (handleAnswer never advances step past the last index), so step
    // always indexes a real entry.
    const question = questions[step]!;
    return (
      <div className="mx-auto max-w-lg space-y-4">
        <AssessmentProgress
          currentStep={step + 1}
          totalSteps={questions.length}
          label={t("progressLabel", { current: step + 1, total: questions.length })}
        />
        <AssessmentQuestion
          id={`greentrust-q${step}`}
          prompt={question.prompt}
          mode="single"
          value={answers[step] ?? ""}
          onChange={(value) => handleAnswer(step, value as string)}
          options={question.options.map((label, index) => ({ id: String(index), label }))}
        />
      </div>
    );
  }

  if (screen === "submitting") {
    return (
      <div className="mx-auto max-w-lg py-16 text-center text-sm text-text-muted">
        {t("estimatedTime")}
      </div>
    );
  }

  if (result) {
    return (
      <div className="space-y-3">
        {saveError && (
          <p className="mx-auto max-w-lg text-center text-sm text-danger-600">
            {t("results.saveError")}
          </p>
        )}
        <FreeAssessmentResults
          locale={locale}
          result={result}
          submissionId={submissionId}
          answers={Array.from({ length: GREENTRUST_TOTAL_QUESTIONS }, (_, i) => Number(answers[i] ?? 0))}
          isLoggedIn={isLoggedIn}
          persisted={persisted}
          onRestart={handleRestart}
        />
      </div>
    );
  }

  return null;
}
