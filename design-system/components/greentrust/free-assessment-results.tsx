"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScoreGauge } from "@/components/greentrust/score-gauge";
import { GreenTrustInlineRegisterForm } from "@/components/greentrust/greentrust-inline-register-form";
import { submitGreenTrustAssessment } from "@/lib/actions/greentrust-assessment";
import { trackEvent } from "@/lib/analytics/track";
import type { GreenTrustAssessmentResult, GreenTrustDomainKey } from "@/lib/assessments/greentrust-free";
import type { AppLocale } from "@/lib/i18n/config";
import { Mail, Building2, CheckCircle2 } from "lucide-react";

export interface FreeAssessmentResultsProps {
  locale: AppLocale;
  result: GreenTrustAssessmentResult;
  submissionId: string;
  answers: number[];
  isLoggedIn: boolean;
  persisted: boolean;
  onRestart: () => void;
}

const riskVariant: Record<string, "success" | "primary" | "warning" | "danger"> = {
  strong: "success",
  developing: "primary",
  emerging_risk: "warning",
  high_risk: "danger",
};

/**
 * Results screen for the GreenTrust Free Assessment. The score and
 * domain breakdown are always shown in full immediately (Phase 1's
 * "real value before an email ask" rule, same as AssessmentResultCard)
 * — email and enterprise review are optional follow-ups on top of an
 * already-complete, already-saved result, never gates on seeing it.
 */
export function FreeAssessmentResults({
  locale,
  result,
  submissionId,
  answers,
  isLoggedIn,
  persisted,
  onRestart,
}: FreeAssessmentResultsProps) {
  const t = useTranslations("greentrustAssessment");
  const tResults = useTranslations("greentrustAssessment.results");
  const tDomains = useTranslations("greentrustAssessment.domains");

  const [showRegister, setShowRegister] = React.useState(false);
  const [saved, setSaved] = React.useState(isLoggedIn && persisted);
  const [emailStatus, setEmailStatus] = React.useState<"idle" | "loading" | "success" | "error">("idle");
  const [showEmailForm, setShowEmailForm] = React.useState(false);
  const [enterpriseRequested, setEnterpriseRequested] = React.useState(false);

  async function handleEmailSubmit(formData: FormData) {
    setEmailStatus("loading");
    const email = String(formData.get("email") ?? "");
    const wantsEnterprise = formData.get("enterpriseReview") === "on";

    const response = await submitGreenTrustAssessment({
      answers,
      locale,
      email,
      requestEnterpriseReview: wantsEnterprise,
      organization: String(formData.get("organization") ?? ""),
      existingSubmissionId: submissionId,
    });

    if (response.status === "success") {
      setEmailStatus("success");
      trackEvent("greentrust_lead_created", { locale });
      if (wantsEnterprise) {
        setEnterpriseRequested(true);
        trackEvent("enterprise_enquiry_submitted", { locale, source: "greentrust_assessment" });
      }
    } else {
      setEmailStatus("error");
    }
  }

  const domainEntries = Object.entries(result.domainScores) as [GreenTrustDomainKey, number][];

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <Card>
        <CardHeader className="items-center text-center">
          <CardTitle>{tResults("heading")}</CardTitle>
          <Badge variant={riskVariant[result.riskClassification] ?? "primary"} className="mt-1">
            {tResults(`risk.${result.riskClassification}`)}
          </Badge>
          <CardDescription className="mt-2">{tResults(`riskSummary.${result.riskClassification}`)}</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <ScoreGauge score={result.overallScore} label={tResults("overallLabel")} size="lg" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{tResults("domainScoresHeading")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {domainEntries.map(([domain, score]) => (
            <div key={domain} className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">{tDomains(`${domain}.name`)}</span>
              <span className="font-semibold text-text-primary">{score}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{tResults("recommendationsHeading")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc space-y-2 ps-5 text-sm text-text-secondary">
            {result.topRecommendationDomains.map((domain) => (
              <li key={domain}>{tDomains(`${domain}.recommendation`)}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardFooter className="flex-col gap-3 pt-6">
          {saved ? (
            <p className="flex items-center gap-2 text-sm text-success-600">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              {tResults("saveSuccess")}
            </p>
          ) : showRegister ? (
            <div className="w-full">
              <GreenTrustInlineRegisterForm
                locale={locale}
                submissionId={submissionId}
                onRegistered={() => {
                  setSaved(true);
                  setShowRegister(false);
                }}
              />
            </div>
          ) : (
            <div className="w-full space-y-2 text-center">
              {isLoggedIn ? null : <p className="text-sm text-text-muted">{tResults("saveLoginPrompt")}</p>}
              <Button className="w-full" onClick={() => setShowRegister(true)} disabled={isLoggedIn}>
                {tResults("saveCta")}
              </Button>
            </div>
          )}

          {emailStatus === "success" ? (
            <p className="text-sm text-success-600">
              {enterpriseRequested ? tResults("emailSuccess") : tResults("saveSuccess")}
            </p>
          ) : showEmailForm ? (
            <form action={handleEmailSubmit} className="w-full space-y-2">
              <Input type="email" name="email" required placeholder={tResults("emailPlaceholder")} />
              <Input name="organization" placeholder={t("kicker")} className="sr-only" aria-hidden="true" tabIndex={-1} />
              <label className="flex items-center gap-2 text-sm text-text-secondary">
                <input type="checkbox" name="enterpriseReview" className="h-4 w-4" />
                {tResults("enterpriseCta")}
              </label>
              <Button type="submit" loading={emailStatus === "loading"} variant="outline" className="w-full">
                <Mail className="h-4 w-4" aria-hidden="true" />
                {tResults("emailCta")}
              </Button>
              {emailStatus === "error" && <p className="text-sm text-danger-600">{tResults("emailError")}</p>}
            </form>
          ) : (
            <Button variant="outline" className="w-full" onClick={() => setShowEmailForm(true)}>
              <Mail className="h-4 w-4" aria-hidden="true" />
              {tResults("emailCta")}
            </Button>
          )}

          <Button variant="ghost" size="sm" onClick={onRestart}>
            {tResults("restartCta")}
          </Button>
          <p className="text-center text-xs text-text-muted">{tResults("disclaimer")}</p>
        </CardFooter>
      </Card>
    </div>
  );
}
