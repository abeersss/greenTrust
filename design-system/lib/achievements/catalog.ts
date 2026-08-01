/**
 * The fixed, ordered CyberAbeer achievement roster. The number is a
 * position in the learner's progression through CyberAbeer, not a
 * random ID -- it must never be reassigned or reordered once shipped,
 * because it is printed on the medal itself and on every share card.
 *
 * Achievements 01 (Phishing Hunter), 02 (Network Guardian), 03 (SOC
 * Night Shift), and 07 (Data Guardian) have real medal graphics and a
 * live challenge behind them -- their labs are built and shipping XP
 * and badges today, so leaving them without medal art meant a player
 * who genuinely earned the badge (row in `user_badges`, correct score)
 * saw an unstyled placeholder pill on /account instead of a medal,
 * which reads as "the badge didn't get awarded" even though it did.
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
  /** Whether a real, brand-approved medal graphic exists for this entry.
   * Only `true` for 01 until each subsequent medal is designed. */
  hasMedalArt: boolean;
}

export const ACHIEVEMENT_CATALOG: AchievementCatalogEntry[] = [
  { number: "01", key: "phishingHunter", challengeKey: "phishing-hunter", hasMedalArt: true },
  { number: "02", key: "networkGuardian", challengeKey: "network-guardian", hasMedalArt: true },
  { number: "03", key: "socNightShift", challengeKey: "soc-night-shift", hasMedalArt: true },
  { number: "04", key: "webDefender", challengeKey: null, hasMedalArt: false },
  { number: "05", key: "identityGuardian", challengeKey: null, hasMedalArt: false },
  { number: "06", key: "incidentCommander", challengeKey: null, hasMedalArt: false },
  { number: "07", key: "dataGuardian", challengeKey: "data-guardian", hasMedalArt: true },
  { number: "08", key: "cloudDefender", challengeKey: null, hasMedalArt: false },
  { number: "09", key: "agentZero", challengeKey: null, hasMedalArt: false },
  { number: "10", key: "grcStrategist", challengeKey: null, hasMedalArt: false },
  { number: "11", key: "digitalInvestigator", challengeKey: null, hasMedalArt: false },
  { number: "12", key: "quantumCountdown", challengeKey: null, hasMedalArt: false },
];

export function getAchievementByChallengeKey(challengeKey: string): AchievementCatalogEntry | undefined {
  return ACHIEVEMENT_CATALOG.find((entry) => entry.challengeKey === challengeKey);
}
