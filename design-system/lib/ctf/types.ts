/**
 * Types for the CyberAbeer CTF track: a second, structurally different
 * challenge format from Decision Labs. Decision Labs is a branching-
 * scenario engine (investigate clues, make a call, see the
 * consequence); CTF is a flag-submission engine (read/decode a
 * simulated artifact, find a hidden `CTF{...}` string, submit it, get
 * scored). Both share the same anonymous-first persistence, XP, and
 * account-claim infrastructure in lib/challenges/anon-session.ts and
 * lib/actions/challenge.ts -- this file only defines what is unique to
 * CTF: categories, artifacts, hints, staged progression, and scoring shape.
 *
 * There is no live backend or exploitation infrastructure behind any
 * of this. Every artifact (HTML source, API response, log file, hex
 * dump, ciphertext) is static data rendered client-side; "solving" a
 * challenge means reading or transforming that data in the browser,
 * never calling a real server-side exploit.
 *
 * Multi-stage redesign (2026-08-02): every challenge used to expose a
 * single artifact and the flag was directly derivable from it. Each
 * challenge is now an ordered sequence of 2-3 CtfStage entries -- e.g.
 * "enumerate a user ID" then "use that ID to exploit the API" -- where
 * every stage but the last requires the player to extract a real value
 * from that stage's artifact and type it in to unlock the next one.
 * Only the final stage's artifact yields the flag itself, submitted via
 * the challenge-level flag box unchanged. Wrong stage-unlock attempts
 * are free and unlimited, same policy as wrong flag guesses -- only
 * hints cost points.
 */

export interface Bilingual {
  en: string;
  ar: string;
}

export type CtfCategory = "web" | "forensics" | "crypto";

export type CtfDifficulty = "beginner" | "intermediate";

/**
 * A revealable hint. `cost` is the number of points (out of 100)
 * deducted from the final score when the hint is revealed. `requiresHintId`
 * gates a hint behind an earlier one already having been used (only
 * "The Weak Key" uses this, where hint 2 only makes sense after hint 1
 * has pointed the player at the base64 layer).
 */
export interface CtfHint {
  id: string;
  cost: number;
  text: Bilingual;
  requiresHintId?: string;
}

export interface CtfDebrief {
  headline: Bilingual;
  whatHappened: Bilingual;
  whyItMattered: Bilingual;
}

// ---------------------------------------------------------------------------
// Web artifacts
// ---------------------------------------------------------------------------

/** A single displayed line of "view source" HTML, rendered as plain text
 * inside a monospace code viewer -- never executed, never parsed as markup.
 * Also reused for plain-text file listings (e.g. a recovered config.env)
 * that need the same read-only monospace viewer without an HTML flavor. */
export interface HtmlSourceLine {
  content: string;
}

export interface WebSourceArtifact {
  kind: "html_source";
  pageTitle: Bilingual;
  lines: HtmlSourceLine[];
}

/** One row of a small, hardcoded client-side lookup table simulating an
 * object-level-authorization-vulnerable API. No network call is ever made. */
export interface ApiInvoiceRecord {
  id: string;
  json: string;
}

export interface WebApiArtifact {
  kind: "api_console";
  endpointLabel: Bilingual;
  defaultInvoiceId: string;
  records: ApiInvoiceRecord[];
  notFoundJson: string;
}

export type WebArtifact = WebSourceArtifact | WebApiArtifact;

// ---------------------------------------------------------------------------
// Forensics artifacts
// ---------------------------------------------------------------------------

export interface ForensicsLogArtifact {
  kind: "access_log";
  lines: string[];
}

/** One 16-byte row of a hexdump-style viewer, split into the classic
 * two 8-byte hex groups plus the printable-ASCII rendering column. */
export interface HexDumpRow {
  offset: string;
  hexGroup1: string[];
  hexGroup2: string[];
  ascii: string;
}

export interface ForensicsHexArtifact {
  kind: "hex_dump";
  rows: HexDumpRow[];
}

export type ForensicsArtifact = ForensicsLogArtifact | ForensicsHexArtifact;

// ---------------------------------------------------------------------------
// Crypto artifacts
// ---------------------------------------------------------------------------

export interface CryptoCaesarArtifact {
  kind: "caesar_shift";
  ciphertext: string;
}

/** Two encoding layers stacked: base64(rot13(flag)). The player must
 * base64-decode first, then run the result through the shift tool at
 * shift 13 (ROT13 is a Caesar shift of 13 and is its own inverse). */
export interface CryptoStackedArtifact {
  kind: "stacked_encoding";
  encodedText: string;
}

export type CryptoArtifact = CryptoCaesarArtifact | CryptoStackedArtifact;

export type CtfArtifact = WebArtifact | ForensicsArtifact | CryptoArtifact;

// ---------------------------------------------------------------------------
// Staged progression
// ---------------------------------------------------------------------------

/**
 * One step in a challenge's 2-3 step chain. Every stage renders its own
 * artifact panel in the workstation. A stage with `unlockAnswer` is not
 * the last stage: the player must extract that value from the artifact
 * (or from context given in `instruction`) and enter it, case-insensitive
 * and whitespace-normalized, to reveal the next stage. A stage with no
 * `unlockAnswer` is the final stage of the chain -- its artifact is where
 * the flag itself is found, submitted via the challenge-level flag box.
 */
export interface CtfStage {
  /** Stable id, used to namespace this stage's own workstation sub-tool
   * state (e.g. shift value, decoded text) so multiple stages that reuse
   * the same artifact kind never collide with each other's state. */
  id: string;
  title: Bilingual;
  instruction: Bilingual;
  artifact: CtfArtifact;
  /** Lowercase, trimmed, whitespace-normalized expected answer. Omit on
   * the final stage. */
  unlockAnswer?: string;
  unlockLabel?: Bilingual;
  wrongUnlockFeedback?: Bilingual;
}

// ---------------------------------------------------------------------------
// Challenge definition
// ---------------------------------------------------------------------------

export interface CtfBadge {
  key: string;
  name: Bilingual;
  description: Bilingual;
}

export interface CtfChallenge {
  /** URL slug, e.g. "web-hidden-in-plain-sight". */
  slug: string;
  /** Matches a value in CHALLENGE_KEYS in lib/challenges/keys.ts. */
  challengeKey: string;
  category: CtfCategory;
  difficulty: CtfDifficulty;
  xpReward: number;
  title: Bilingual;
  shortDescription: Bilingual;
  briefing: Bilingual;
  /** Canonical flag string, uppercase, e.g. "CTF{HIDDEN_IN_PLAIN_SIGHT}".
   * Submission comparison is case-insensitive and trims whitespace, but
   * otherwise must exactly match this string. */
  flag: string;
  /** Ordered chain of 2-3 steps the player works through to reach the
   * flag; see CtfStage. */
  stages: CtfStage[];
  hints: CtfHint[];
  debrief: CtfDebrief;
  badge: CtfBadge;
}

// ---------------------------------------------------------------------------
// Progress / persistence shape
// ---------------------------------------------------------------------------

/** Per-category interactive workstation state, kept only as a resume
 * convenience (e.g. the last shift value or invoice id tried) -- never
 * required for correctness, since the flag itself is always re-derivable
 * from the artifact data. Keys are namespaced per-stage as `${stageId}:${key}`
 * by the workstation component so two stages reusing the same artifact
 * kind (e.g. two caesar_shift stages) never share sub-tool state. */
export type CtfWorkstationState = Record<string, unknown>;

export interface CtfStepsState {
  hintsUsed: string[];
  solved: boolean;
  workstationState: CtfWorkstationState;
  /** Index of the highest unlocked stage (0-based). Starts at 0 -- the
   * first stage is always visible. Reaching stages.length - 1 means the
   * final stage (and therefore flag submission) is unlocked. */
  unlockedStageIndex: number;
}
