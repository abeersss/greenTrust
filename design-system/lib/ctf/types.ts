/**
 * Types for the CyberAbeer CTF track: a second, structurally different
 * challenge format from Decision Labs. Decision Labs is a branching-
 * scenario engine (investigate clues, make a call, see the
 * consequence); CTF is a flag-submission engine (read/decode a
 * simulated artifact, find a hidden `CTF{...}` string, submit it, get
 * scored). Both share the same anonymous-first persistence, XP, and
 * account-claim infrastructure in lib/challenges/anon-session.ts and
 * lib/actions/challenge.ts -- this file only defines what is unique to
 * CTF: categories, artifacts, hints, and scoring shape.
 *
 * There is no live backend or exploitation infrastructure behind any
 * of this. Every artifact (HTML source, API response, log file, hex
 * dump, ciphertext) is static data rendered client-side; "solving" a
 * challenge means reading or transforming that data in the browser,
 * never calling a real server-side exploit.
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
 * inside a monospace code viewer -- never executed, never parsed as markup. */
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
  artifact: CtfArtifact;
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
 * from the artifact data. */
export type CtfWorkstationState = Record<string, unknown>;

export interface CtfStepsState {
  hintsUsed: string[];
  solved: boolean;
  workstationState: CtfWorkstationState;
}
