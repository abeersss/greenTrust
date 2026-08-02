/**
 * The CyberAbeer CTF achievement roster -- a parallel, second badge
 * track alongside the Labs ACHIEVEMENT_CATALOG (lib/achievements/catalog.ts).
 * CTF badges are visually distinct (medal label reads "CTF 1", "CTF 2", ...
 * instead of a Labs two-digit number, and the medal's arc text reads
 * "CYBERABEER CTF") but are earned through the exact same pipeline: every
 * CTF challenge's `challengeKey` and `badge.key` are registered in
 * CHALLENGE_KEYS / CHALLENGE_BADGE_KEYS (lib/challenges/keys.ts) and flow
 * through the same claimForUser() award path (lib/actions/challenge.ts) as
 * every Labs mission, including the score >= 80 badge-award gate.
 *
 * Numbered 1-6 in the same order as CTF_CHALLENGES (lib/ctf/challenges.ts):
 * web x2, forensics x2, crypto x2.
 */
export interface CtfAchievementCatalogEntry {
  /** Printed on the medal, e.g. "CTF 1". */
  number: string;
  /** Matches the `badges.key` value in CHALLENGE_BADGE_KEYS and in the
   * `user_badges` row a claimed CTF flag creates. */
  badgeKey: string;
  /** i18n-friendly key, not currently used for translation lookups since
   * the badge name/description already come from lib/ctf/challenges.ts
   * `badge.name` / `badge.description` -- kept for parity with the Labs
   * catalog shape and possible future use. */
  key: string;
  category: "web" | "forensics" | "crypto";
  /** The /labs/ctf/[slug] route this badge was earned from. */
  slug: string;
}

export const CTF_ACHIEVEMENT_CATALOG: CtfAchievementCatalogEntry[] = [
  { number: "CTF 1", badgeKey: "flag_hidden_in_plain_sight", key: "hiddenInPlainSight", category: "web", slug: "web-hidden-in-plain-sight" },
  { number: "CTF 2", badgeKey: "flag_broken_access_control", key: "brokenAccessControl", category: "web", slug: "web-broken-access-control" },
  { number: "CTF 3", badgeKey: "flag_suspicious_log", key: "suspiciousLog", category: "forensics", slug: "forensics-suspicious-log" },
  { number: "CTF 4", badgeKey: "flag_deleted_file", key: "deletedFile", category: "forensics", slug: "forensics-deleted-file" },
  { number: "CTF 5", badgeKey: "flag_caesars_mistake", key: "caesarsMistake", category: "crypto", slug: "crypto-caesars-mistake" },
  { number: "CTF 6", badgeKey: "flag_weak_key", key: "weakKey", category: "crypto", slug: "crypto-weak-key" },
];

export function getCtfAchievementByBadgeKey(badgeKey: string): CtfAchievementCatalogEntry | undefined {
  return CTF_ACHIEVEMENT_CATALOG.find((entry) => entry.badgeKey === badgeKey);
}
