export const CHALLENGE_KEYS = [
    "first_defender_spot_the_phish",
    "network_defense_build_the_shield",
    "soc_alert_triage_shift_one",
    "grcl_innovation_under_fire",
    "agent_zero_ai_trust_officer",
    "data_guardian_classify_and_protect",
    "ctf_web_hidden_in_plain_sight",
    "ctf_web_broken_access_control",
    "ctf_forensics_suspicious_log",
    "ctf_forensics_deleted_file",
    "ctf_crypto_caesars_mistake",
    "ctf_crypto_weak_key",
  ] as const;
export type ChallengeKey = (typeof CHALLENGE_KEYS)[number];
export const CHALLENGE_BADGE_KEYS: Record<ChallengeKey, string> = {
    first_defender_spot_the_phish: "phishing_hunter",
    network_defense_build_the_shield: "network_guardian",
    soc_alert_triage_shift_one: "soc_responder",
    grcl_innovation_under_fire: "grc_strategist",
    agent_zero_ai_trust_officer: "agent_zero",
    data_guardian_classify_and_protect: "data_guardian",
    ctf_web_hidden_in_plain_sight: "flag_hidden_in_plain_sight",
    ctf_web_broken_access_control: "flag_broken_access_control",
    ctf_forensics_suspicious_log: "flag_suspicious_log",
    ctf_forensics_deleted_file: "flag_deleted_file",
    ctf_crypto_caesars_mistake: "flag_caesars_mistake",
    ctf_crypto_weak_key: "flag_weak_key",
};

/**
 * The pass threshold every challenge (Decision Labs and CTF alike)
 * must clear to actually "win" and earn its badge. Founder instruction
 * (2026-08-02): scoring must be strict -- reaching 100% completion
 * with a lot of hints/mistakes is not the same as winning, so a badge
 * (and the win celebration) is only awarded once `score >= 80`.
 *
 * PRODUCTION BUILD FIX (2026-08-03): this constant used to live in
 * lib/actions/challenge.ts and was exported from there so client
 * components could show the identical "80%+ required" copy without
 * duplicating the number. That file has a top-level "use server"
 * directive, and Next.js Server Actions require every export from a
 * "use server" file to be an async function -- a plain `export const`
 * is not allowed and fails the production build at compile time with
 * "Only async functions are allowed to be exported in a 'use server'
 * file." This silently broke every deployment from the moment
 * BADGE_PASS_SCORE was added (2026-08-02) onward: every single push
 * since then, across many unrelated features, built successfully in
 * this codebase's own review but failed on Vercel, so none of it ever
 * reached production. Moving the constant to this plain (non-"use
 * server") module fixes the build; lib/actions/challenge.ts and every
 * client component now import it from here instead.
 */
export const BADGE_PASS_SCORE = 80;

/**
 * CTF Completion Certificate (2026-08-03, founder instruction): once a
 * learner has captured all six CyberAbeer CTF flags -- meaning all six
 * of these badges are in their user_badges rows, which can only happen
 * at score >= BADGE_PASS_SCORE per flag, since claimForUser
 * (lib/actions/challenge.ts) never awards a badge below that threshold
 * -- they can claim a signed completion certificate. Filtering
 * CHALLENGE_KEYS/CHALLENGE_BADGE_KEYS here (rather than hardcoding a
 * second list) means a future 7th CTF challenge is picked up
 * automatically as long as its key follows the existing "ctf_..."
 * naming convention, with no separate list to remember to update.
 */
export const CTF_CHALLENGE_KEYS = CHALLENGE_KEYS.filter((key) => key.startsWith("ctf_"));
export const CTF_BADGE_KEYS = CTF_CHALLENGE_KEYS.map((key) => CHALLENGE_BADGE_KEYS[key]);
