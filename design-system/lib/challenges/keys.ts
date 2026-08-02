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
