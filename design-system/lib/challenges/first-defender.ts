/**
 * Structural definition of the "First Defender: Spot the Phish"
 * challenge (Milestone 2). This file holds only the parts of the
 * challenge that are not translatable text: step ordering, which
 * inspection hotspots each step exposes, the correct action, and the
 * scoring rules. Every string shown to a visitor (message subjects,
 * hints, feedback, explanations) lives in messages/en.json and
 * messages/ar.json under the "challenge.firstDefender" namespace, so
 * the two locales stay in lockstep the same way every other page's
 * content does.
 *
 * Kept framework-free (no React, no next-intl import) on purpose: the
 * scoring logic here is exercised directly by a plain Node script in
 * the Milestone 2 test pass, independent of whether Next.js itself can
 * be built in this environment.
 */

export const FIRST_DEFENDER_CHALLENGE_KEY = "first_defender_spot_the_phish" as const;
export const FIRST_DEFENDER_BADGE_KEY = "first_defender" as const;

export type ChallengeAction = "report" | "verify" | "click" | "ignore";

export const FIRST_DEFENDER_ACTIONS: readonly ChallengeAction[] = ["report", "verify", "click", "ignore"];

export type HotspotKey = "sender" | "link" | "tone" | "attachment";

export type MessageChannel = "email" | "sms";

export interface FirstDefenderStep {
  /** Matches the message key segment under challenge.firstDefender.steps.<id> */
  id: "step1" | "step2" | "step3" | "step4" | "step5";
  channel: MessageChannel;
  hotspots: HotspotKey[];
  hasLink: boolean;
  hasAttachment: boolean;
  correctAction: ChallengeAction;
  /** Points awarded for a correct answer with no hint used. */
  points: number;
  /** Points subtracted from `points` if a hint was used on this step (still correct). */
  hintPenalty: number;
}

export const firstDefenderSteps: FirstDefenderStep[] = [
  {
    id: "step1",
    channel: "email",
    hotspots: ["sender", "link", "tone"],
    hasLink: true,
    hasAttachment: false,
    correctAction: "report",
    points: 20,
    hintPenalty: 5,
  },
  {
    id: "step2",
    channel: "email",
    hotspots: ["link", "tone"],
    hasLink: true,
    hasAttachment: false,
    correctAction: "verify",
    points: 20,
    hintPenalty: 5,
  },
  {
    id: "step3",
    channel: "sms",
    hotspots: ["sender", "tone"],
    hasLink: false,
    hasAttachment: false,
    correctAction: "report",
    points: 20,
    hintPenalty: 5,
  },
  {
    id: "step4",
    channel: "email",
    hotspots: ["sender", "tone", "attachment"],
    hasLink: false,
    hasAttachment: true,
    correctAction: "report",
    points: 20,
    hintPenalty: 5,
  },
  {
    id: "step5",
    channel: "email",
    hotspots: ["sender", "tone"],
    hasLink: false,
    hasAttachment: false,
    correctAction: "ignore",
    points: 20,
    hintPenalty: 5,
  },
];

export const FIRST_DEFENDER_MAX_SCORE = firstDefenderSteps.reduce((sum, step) => sum + step.points, 0);

/** The one action that simulates "you got phished" feedback rather than plain incorrect feedback. */
export function isRiskyChoice(action: ChallengeAction): boolean {
  return action === "click";
}

export function computeStepScore(
  step: FirstDefenderStep,
  chosenAction: ChallengeAction,
  usedHint: boolean
): number {
  if (chosenAction !== step.correctAction) return 0;
  return usedHint ? Math.max(0, step.points - step.hintPenalty) : step.points;
}

/**
 * XP scales from score at a fixed 1.5x, so a perfect, hint-free run
 * (score 100) earns 150 XP, matching the `challenges.xp_reward` value
 * seeded in sql/010_first_defender_challenge.sql. Kept as a pure
 * function (not a stored value) so score and XP can never drift out of
 * sync with each other.
 */
export function computeXpFromScore(score: number): number {
  return Math.round(score * 1.5);
}

/** Translation keys for the "skills practiced" list on the completion screen, one per step. */
export const FIRST_DEFENDER_SKILLS: readonly string[] = [
  "verifyDomains",
  "checkLinks",
  "recognizeBec",
  "distrustAttachments",
  "avoidFalsePositives",
];

export interface StepAnswerState {
  action: ChallengeAction;
  usedHint: boolean;
  score: number;
}

export type FirstDefenderStepsState = Partial<Record<FirstDefenderStep["id"], StepAnswerState>>;

export function totalScore(stepsState: FirstDefenderStepsState): number {
  return Object.values(stepsState).reduce((sum, s) => sum + (s?.score ?? 0), 0);
}

export function totalHintsUsed(stepsState: FirstDefenderStepsState): number {
  return Object.values(stepsState).filter((s) => s?.usedHint).length;
}
