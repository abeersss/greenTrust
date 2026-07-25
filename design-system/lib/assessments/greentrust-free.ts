/**
 * Structural definition of the GreenTrust Free Assessment (Phase 8).
 * Kept framework-free (no React, no next-intl import), same discipline
 * as lib/challenges/first-defender.ts: every string shown to a
 * visitor lives in messages/en.json and messages/ar.json under
 * "greentrustAssessment", so this file only holds what is NOT
 * translatable text: domain ordering, question-to-domain mapping,
 * and the scoring/classification rules. Deterministic by design
 * (Phase 8 requirement: no LLM scoring).
 */

export const GREENTRUST_FREE_ASSESSMENT_TOOL_KEY = "greentrust_free_assessment" as const;

export const greentrustDomainKeys = [
    "visibility",
    "accountability",
    "identity",
    "permissions",
    "oversight",
    "monitoring",
    "lifecycle",
    "shadowAi",
  ] as const;

export type GreenTrustDomainKey = (typeof greentrustDomainKeys)[number];

export const GREENTRUST_QUESTIONS_PER_DOMAIN = 2;
export const GREENTRUST_OPTIONS_PER_QUESTION = 3;
export const GREENTRUST_TOTAL_QUESTIONS = greentrustDomainKeys.length * GREENTRUST_QUESTIONS_PER_DOMAIN;

export function domainForQuestionIndex(index: number): GreenTrustDomainKey {
    const domainIndex = Math.floor(index / GREENTRUST_QUESTIONS_PER_DOMAIN);
    const domain = greentrustDomainKeys[domainIndex];
    if (!domain) throw new Error("No GreenTrust domain for question index " + index);
    return domain;
}

export type GreenTrustAnswers = number[];

export type GreenTrustRiskClassification = "strong" | "developing" | "emerging_risk" | "high_risk";

export interface GreenTrustAssessmentResult {
    domainScores: Record<GreenTrustDomainKey, number>;
    overallScore: number;
    riskClassification: GreenTrustRiskClassification;
    topRecommendationDomains: GreenTrustDomainKey[];
}

function isValidAnswers(answers: unknown): answers is GreenTrustAnswers {
    if (!Array.isArray(answers) || answers.length !== GREENTRUST_TOTAL_QUESTIONS) return false;
    return answers.every((a) => Number.isInteger(a) && a >= 0 && a < GREENTRUST_OPTIONS_PER_QUESTION);
}

export function scoreGreenTrustAssessment(answers: GreenTrustAnswers): GreenTrustAssessmentResult {
    if (!isValidAnswers(answers)) {
          throw new Error("Invalid GreenTrust assessment answers");
    }

  const domainScores = {} as Record<GreenTrustDomainKey, number>;
    for (const domain of greentrustDomainKeys) {
          domainScores[domain] = 0;
    }

  answers.forEach((value, index) => {
        const domain = domainForQuestionIndex(index);
        const points = GREENTRUST_OPTIONS_PER_QUESTION - 1 - value;
        domainScores[domain] += points;
  });

  const maxPointsPerDomain = (GREENTRUST_OPTIONS_PER_QUESTION - 1) * GREENTRUST_QUESTIONS_PER_DOMAIN;
    for (const domain of greentrustDomainKeys) {
          domainScores[domain] = Math.round((domainScores[domain] / maxPointsPerDomain) * 100);
    }

  const overallScore = Math.round(
        greentrustDomainKeys.reduce((sum, d) => sum + domainScores[d], 0) / greentrustDomainKeys.length
      );

  const riskClassification: GreenTrustRiskClassification =
        overallScore >= 80 ? "strong" : overallScore >= 60 ? "developing" : overallScore >= 40 ? "emerging_risk" : "high_risk";

  const topRecommendationDomains = [...greentrustDomainKeys]
      .sort((a, b) => domainScores[a] - domainScores[b])
      .slice(0, 3);

  return { domainScores, overallScore, riskClassification, topRecommendationDomains };
}
