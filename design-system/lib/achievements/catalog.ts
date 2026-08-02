/**
 * The fixed, ordered CyberAbeer achievement roster. The number is a
 * position in the learner's progression through CyberAbeer, not a
 * random ID -- it must never be reassigned or reordered once shipped,
 * because it is printed on the medal itself and on every share card.
 *
 * Renumbered 2026-08-02 per founder instruction: the previous roster
 * left gaps between live achievements (01, 02, 03, 07, 09, 10) because
 * each number reserved a slot in a 12-item conceptual roadmap. On the
 * live /account page this reads as "missing" badges 04-06 and 08,
 * which is confusing rather than aspirational. The 6 live achievements
 * are now contiguous 01-06 in the order they shipped; the 6 not-yet-built
 * roadmap entries follow as 07-12. Only the `number` field changed --
 * every `key`, `challengeKey`, `academy`, and `hasMedalArt` value is
 * identical to before, so no badge-key mapping elsewhere needed to move.
 *
 * Achievements 01 (Phishing Hunter), 02 (Network Guardian), 03 (SOC
 * Night Shift), 04 (Data Guardian), 05 (Agent Zero), and 06 (GRC
 * Strategist) have real medal graphics and a live challenge behind
 * them -- their labs are built and shipping XP and badges today.
 * Every other entry is real metadata (so the "My Achievements"
 * collection page can show the full 12-achievement roadmap and each
 * one's locked slot) but intentionally has no unique medal artwork yet
 * and no `challengeKey` to unlock it -- do not wire these to real
 * challenges or design their medals until each one is actually built
 * and this comment is updated to say so.
 */
export interface AchievementCatalogEntry {
  /** Two-digit, fixed, never-reused position number. */
  number: string;
  /** i18n key suffix under `achievements.catalog.<key>.name` / `.description`. */
  key: string;
  /** The Labs `challengeKey` (see lib/challenges/*) this achievement unlocks
   * from, or null if the underlying challenge doesn't exist in production yet. */
  challengeKey: string | null;
  /** Which of the 5 thematic CyberAbeer academies (UI-only grouping, see
   * messages academies.*) this achievement belongs to. */
  academy: "cyberDefense" | "governance" | "aiTrust" | "dataTrust" | "futureTrust";
  /** Whether a real, brand-approved medal graphic exists for this entry.
   * Only `true` for 01-06 until each subsequent medal is designed. */
  hasMedalArt: boolean;
}

export const ACHIEVEMENT_CATALOG: AchievementCatalogEntry[] = [
  { number: "01", key: "phishingHunter", challengeKey: "phishing-hunter", academy: "cyberDefense", hasMedalArt: true },
  { number: "02", key: "networkGuardian", challengeKey: "network-guardian", academy: "cyberDefense", hasMedalArt: true },
  { number: "03", key: "socNightShift", challengeKey: "soc-night-shift", academy: "cyberDefense", hasMedalArt: true },
  { number: "04", key: "dataGuardian", challengeKey: "data-guardian", academy: "governance", hasMedalArt: true },
  { number: "05", key: "agentZero", challengeKey: "agent-zero", academy: "aiTrust", hasMedalArt: true },
  { number: "06", key: "grcStrategist", challengeKey: "grcl-innovation", academy: "governance", hasMedalArt: true },
  { number: "07", key: "webDefender", challengeKey: null, academy: "futureTrust", hasMedalArt: false },
  { number: "08", key: "identityGuardian", challengeKey: null, academy: "dataTrust", hasMedalArt: false },
  { number: "09", key: "incidentCommander", challengeKey: null, academy: "cyberDefense", hasMedalArt: false },
  { number: "10", key: "cloudDefender", challengeKey: null, academy: "dataTrust", hasMedalArt: false },
  { number: "11", key: "digitalInvestigator", challengeKey: null, academy: "futureTrust", hasMedalArt: false },
  { number: "12", key: "quantumCountdown", challengeKey: null, academy: "futureTrust", hasMedalArt: false },
];

export function getAchievementByChallengeKey(challengeKey: string): AchievementCatalogEntry | undefined {
  return ACHIEVEMENT_CATALOG.find((entry) => entry.challengeKey === challengeKey);
}
