/**
 * Browser-only helpers for the anonymous-first challenge journey. A
 * visitor gets a stable random id the first time they open the
 * challenge page, stored in localStorage, not a cookie: it never needs
 * to reach the server on every request, only at explicit save points
 * (step completed, challenge completed, registration), so it costs
 * nothing on every page view the way a cookie would.
 *
 * Every export here guards `typeof window` because this module is
 * imported from Client Components that may still run once during SSR;
 * none of it is meant to run on the server.
 *
 * Genericized (2026-07-27) so a second, structurally different
 * challenge (Phishing Hunter's investigation-workstation state) can
 * reuse this exact persistence layer instead of forking it. Every
 * caller that already exists (First Defender) keeps compiling by
 * passing its own stepsState type explicitly at the call site, e.g.
 * `loadChallengeProgress<FirstDefenderStepsState>(key)`; the default
 * type parameter only affects call sites that don't specify one.
 */

const ANON_ID_KEY = "cyberabeer_challenge_anon_id";
const progressKey = (challengeKey: string) => `cyberabeer_challenge_progress_${challengeKey}`;

export interface ChallengeLocalProgress<TStepsState = Record<string, unknown>> {
  currentStepIndex: number;
  stepsState: TStepsState;
  startedAt: string;
  completedAt: string | null;
  /** Set once registerAndClaimChallenge succeeds, so reopening the page
   * after registering shows the saved confirmation instead of asking
   * the visitor to register again. */
  claimed?: boolean;
  claimedXp?: number;
}

export function getOrCreateAnonId(): string {
  if (typeof window === "undefined") return "";
  let id = window.localStorage.getItem(ANON_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(ANON_ID_KEY, id);
  }
  return id;
}

export function loadChallengeProgress<TStepsState = Record<string, unknown>>(
  challengeKey: string
): ChallengeLocalProgress<TStepsState> | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(progressKey(challengeKey));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ChallengeLocalProgress<TStepsState>;
  } catch {
    return null;
  }
}

export function saveChallengeProgress<TStepsState = Record<string, unknown>>(
  challengeKey: string,
  progress: ChallengeLocalProgress<TStepsState>
): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(progressKey(challengeKey), JSON.stringify(progress));
}

/**
 * Called only after a completed result has been durably claimed by a
 * registered account (see lib/actions/challenge.ts claimChallengeResult).
 * Progress is never cleared before that point: registering must never
 * destroy an in-progress or just-finished run.
 */
export function clearChallengeProgress(challengeKey: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(progressKey(challengeKey));
}
