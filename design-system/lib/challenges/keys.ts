/**
 * Canonical challenge keys and their associated badge keys, shared by
 * every challenge-related server action (design-system/lib/actions/challenge.ts).
 *
 * This exists to fix a real production bug: several server-action
 * schemas previously hardcoded z.literal(FIRST_DEFENDER_CHALLENGE_KEY),
 * and the badge lookup in claimForUser hardcoded FIRST_DEFENDER_BADGE_KEY,
 * so only the original First Defender challenge could ever save
 * progress or award a badge. Adding a new lab meant hunting down every
 * hardcoded literal. Keeping the list and the challenge-to-badge
 * mapping in one shared file means adding a lab is a one-line change
 * here instead of a multi-file patch.
 *
 * Badge keys below were confirmed against the live badges table
 * (2026-07-27): note that "first_defender" is a legacy badge key from
 * before the Phishing Hunter rename and is intentionally NOT used here;
 * "phishing_hunter" is the correctly renamed badge with matching
 * EN/AR translations and is what should be awarded going forward.
 */
export const CHALLENGE_KEYS = [
    "first_defender_spot_the_phish",
    "network_defense_build_the_shield",
    "soc_alert_triage_shift_one",
    "grcl_innovation_under_fire",
    "agent_zero_ai_trust_officer",
    "data_guardian_classify_and_protect",
  ] as const;

export type ChallengeKey = (typeof CHALLENGE_KEYS)[number];

export const CHALLENGE_BADGE_KEYS: Record<ChallengeKey, string> = {
    first_defender_spot_the_phish: "phishing_hunter",
    network_defense_build_the_shield: "network_guardian",
    soc_alert_triage_shift_one: "soc_responder",
    grcl_innovation_under_fire: "grc_strategist",
    agent_zero_ai_trust_officer: "agent_zero",
    data_guardian_classify_and_protect: "data_guardian",
};
