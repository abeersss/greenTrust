"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AssessmentProgress } from "@/components/assessment/assessment-progress";
import { AssessmentQuestion } from "@/components/assessment/assessment-question";
import { submitCyberPostureAssessment } from "@/lib/actions/organizational-tools";
import {
  CYBER_POSTURE_QUESTIONS,
  MATURITY_LEVELS,
  CSF_FUNCTIONS,
  type CyberPostureResult,
} from "@/lib/organizational-tools/cybersecurity-posture";
import { trackEvent } from "@/lib/analytics/track";
import type { AppLocale } from "@/lib/i18n/config";
import { ShieldCheck, RotateCcw } from "lucide-react";

export interface CyberPostureAssessmentProps {
  locale: AppLocale;
}

type Screen = "intro" | "question" | "submitting" | "results";

const COPY = {
  en: {
    title: "Cybersecurity Posture Assessment",
    intro:
      "A free, 30-question self-assessment across the six NIST CSF 2.0 functions: Govern, Identify, Protect, Detect, Respond, Recover. Answer honestly to see where your organization's cybersecurity program is strong and where it needs investment.",
    estimatedTime: "Takes about 10 minutes. Your answers are never shared.",
    emailLabel: "Email (optional, to save your results)",
    startCta: "Start assessment",
    progressLabel: (current: number, total: number) => `Question ${current} of ${total}`,
    submitting: "Scoring your assessment...",
    saveError: "We could not save your result, but your score below is accurate.",
    restart: "Retake assessment",
    overall: "Overall maturity",
    perFunction: "Results by NIST CSF 2.0 function",
    ratingLabels: {
      not_performed: "Not Performed",
      ad_hoc: "Ad-hoc",
      repeatable: "Repeatable",
      defined: "Defined",
      managed: "Managed / Optimized",
    } as Record<string, string>,
  },
  ar: {
    title: "تقييم النضج الأمني السيبراني",
    intro:
      "تقييم ذاتي مجاني من 30 سؤالًا يغطي وظائف إطار NIST CSF 2.0 الست: الحوكمة، التحديد، الحماية، الاكتشاف، الاستجابة، التعافي. أجب بصدق لمعرفة مواطن القوة واحتياجات الاستثمار في برنامج الأمن السيبراني لمؤسستك.",
    estimatedTime: "يستغرق حوالي 10 دقائق. إجاباتك لا تُشارك أبدًا.",
    emailLabel: "البريد الإلكتروني (اختياري، لحفظ نتائجك)",
    startCta: "ابدأ التقييم",
    progressLabel: (current: number, total: number) => `السؤال ${current} من ${total}`,
    submitting: "جارٍ احتساب نتيجتك...",
    saveError: "تعذر حفظ نتيجتك، لكن النتيجة أدناه دقيقة.",
    restart: "إعادة التقييم",
    overall: "النضج العام",
    perFunction: "النتائج حسب وظائف NIST CSF 2.0",
    ratingLabels: {
      not_performed: "غير مطبَّق",
      ad_hoc: "عشوائي",
      repeatable: "قابل للتكرار",
      defined: "موثَّق",
      managed: "مُدار / محسَّن",
    } as Record<string, string>,
  },
} as const;

/**
 * Free web version of the paid "Cybersecurity Posture Assessment Tool"
 * ($47 on abeergrc.netlify.app). Orchestrates intro (with optional
 * email capture) -> 30 questions -> results, mirroring the flow
 * established by components/greentrust/free-assessment.tsx. All copy
 * is embedded bilingually here rather than via next-intl, matching
 * how lib/organizational-tools/cybersecurity-posture.ts already
 * stores its 30 questions bilingually inline.
 */
export function CyberPostureAssessment({ locale }: CyberPostureAssessmentProps) {
  const c = COPY[locale];
  const [screen, setScreen] = React.useState<Screen>("intro");
  const [step, setStep] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<string, string>>({});
  const [email, setEmail] = React.useState("");
  const [result, setResult] = React.useState<CyberPostureResult | null>(null);
  const [saveError, setSaveError] = React.useState(false);
  const hasStartedAnalytics = React.useRef(false);

  const questions = CYBER_POSTURE_QUESTIONS;
  const options = MATURITY_LEVELS.map((l) => ({ id: l.value, label: locale === "ar" ? l.ar : l.en }));

  function handleStart() {
    setScreen("question");
    if (!hasStartedAnalytics.current) {
      hasStartedAnalytics.current = true;
      trackEvent("assessment_started", { locale, tool: "cyber_posture_assessment" });
    }
  }

  async function handleAnswer(questionId: string, value: string) {
    const nextAnswers = { ...answers, [questionId]: value };
    setAnswers(nextAnswers);

    // Let the selected option paint before advancing, so the user
    // sees their choice register instead of the screen silently
    // jumping to the next question.
    await new Promise((resolve) => setTimeout(resolve, 350));

    if (step < questions.length - 1) {
      setStep((s) => s + 1);
      return;
    }

    setScreen("submitting");
    const response = await submitCyberPostureAssessment({
      toolKey: "cyber_posture_assessment",
      answers: nextAnswers,
      email: email || undefined,
      locale,
    });

    if (response.status === "success" && response.data) {
      setResult(response.data.result);
      setSaveError(false);
      trackEvent("assessment_completed", {
        locale,
        tool: "cyber_posture_assessment",
        score: Math.round(response.data.result.overall.percent * 100),
      });
    } else {
      const { scoreCyberPosture } = await import("@/lib/organizational-tools/cybersecurity-posture");
      setResult(scoreCyberPosture(nextAnswers));
      setSaveError(true);
    }
    setScreen("results");
  }

  function handleRestart() {
    setStep(0);
    setAnswers({});
    setResult(null);
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
          <CardTitle className="font-display text-2xl">{c.title}</CardTitle>
          <CardDescription>{c.intro}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-xs text-text-muted">{c.estimatedTime}</p>
          <div className="space-y-1.5">
            <Label htmlFor="cyber-posture-email">{c.emailLabel}</Label>
            <Input
              id="cyber-posture-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              dir="ltr"
            />
          </div>
          <Button className="w-full" size="lg" onClick={handleStart}>
            {c.startCta}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (screen === "question") {
    const question = questions[step]!;
    return (
      <div className="mx-auto max-w-lg space-y-4">
        <AssessmentProgress
          currentStep={step + 1}
          totalSteps={questions.length}
          label={c.progressLabel(step + 1, questions.length)}
        />
        <AssessmentQuestion
          id={`cyber-posture-${question.id}`}
          prompt={locale === "ar" ? question.ar : question.en}
          mode="single"
          value={answers[question.id] ?? ""}
          onChange={(value) => handleAnswer(question.id, value as string)}
          options={options}
        />
      </div>
    );
  }

  if (screen === "submitting") {
    return <div className="mx-auto max-w-lg py-16 text-center text-sm text-text-muted">{c.submitting}</div>;
  }

  if (result) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        {saveError && <p className="text-center text-sm text-danger-600">{c.saveError}</p>}
        <Card>
          <CardHeader className="items-center text-center">
            <CardTitle className="font-display text-2xl">{c.overall}</CardTitle>
            <CardDescription className="font-display text-4xl font-bold text-primary-700">
              {Math.round(result.overall.percent * 100)}%
            </CardDescription>
            <p className="text-text-secondary">{c.ratingLabels[result.overall.rating]}</p>
          </CardHeader>
        </Card>
        <div>
          <h3 className="mb-3 font-display text-lg font-semibold text-text-primary">{c.perFunction}</h3>
          <div className="space-y-3">
            {result.functions.map((f) => {
              const meta = CSF_FUNCTIONS.find((cf) => cf.key === f.fn)!;
              return (
                <div key={f.fn} className="rounded-md border border-border p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-text-primary">{locale === "ar" ? meta.ar : meta.en}</span>
                    <span className="text-text-muted">
                      {Math.round(f.percent * 100)}% - {c.ratingLabels[f.rating]}
                    </span>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-surface-raised">
                    <div
                      className="h-full rounded-full bg-primary-600"
                      style={{ width: `${Math.round(f.percent * 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <Button variant="outline" className="w-full" onClick={handleRestart}>
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          {c.restart}
        </Button>
      </div>
    );
  }

  return null;
}
