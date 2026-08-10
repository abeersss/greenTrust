import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Founder Labs admin (CyberAbeer Platform Phase II, Batch 1 remainder).
 * Every Decision Lab and CTF challenge is one row in the `challenges`
 * table (database/migrations/003_schema_labs.sql), keyed by the same
 * `key` values lib/challenges/keys.ts already exports as
 * CHALLENGE_KEYS / CTF_CHALLENGE_KEYS. Lab content itself (scenarios,
 * stages, scoring) lives in code, not the database, so this admin
 * screen does not try to edit prose -- it surfaces real play data
 * (attempts, completions, average score) alongside the same
 * publish/archive control the Content admin uses, reusing the
 * `content_status` enum the `challenges.status` column already shares
 * with `articles.status`.
 */

export type FounderLabRow = {
  id: string;
  key: string;
  displayName: string;
  challengeType: string;
  difficulty: string;
  status: string;
  xpReward: number | null;
  attemptCount: number;
  completedCount: number;
  completionRate: number | null;
  uniqueUserCount: number;
  averageScore: number | null;
  updatedAt: string | null;
};

const LAB_DISPLAY_NAMES: Record<string, string> = {
  first_defender_spot_the_phish: "Phishing Hunter -- Spot the Phish",
  network_defense_build_the_shield: "Network Guardian -- Build the Shield",
  soc_alert_triage_shift_one: "SOC Night Shift -- Alert Triage",
  grcl_innovation_under_fire: "GRCL -- Innovation Under Fire",
  agent_zero_ai_trust_officer: "Agent Zero -- AI Trust Officer",
  data_guardian_classify_and_protect: "Data Guardian -- Classify and Protect",
  ctf_web_hidden_in_plain_sight: "CTF: Hidden in Plain Sight (Web)",
  ctf_web_broken_access_control: "CTF: Broken Access Control (Web)",
  ctf_forensics_suspicious_log: "CTF: Suspicious Log (Forensics)",
  ctf_forensics_deleted_file: "CTF: The Deleted File (Forensics)",
  ctf_crypto_caesars_mistake: "CTF: Caesar's Mistake (Crypto)",
  ctf_crypto_weak_key: "CTF: The Weak Key (Crypto)",
};

export function labDisplayName(key: string): string {
  return LAB_DISPLAY_NAMES[key] ?? key;
}

type ChallengeRow = {
  id: string;
  key: string;
  challenge_type: string;
  difficulty: string;
  status: string;
  xp_reward: number | null;
  updated_at: string | null;
};

type AttemptRow = {
  challenge_id: string;
  user_id: string | null;
  status: string;
  score: number | null;
};

export async function getAllLabsForFounder(): Promise<FounderLabRow[]> {
  try {
    const supabase = await createSupabaseServerClient();

    const [{ data: challenges, error: challengesError }, { data: attempts, error: attemptsError }] =
      await Promise.all([
        supabase
          .from("challenges")
          .select("id, key, challenge_type, difficulty, status, xp_reward, updated_at")
          .order("key", { ascending: true }),
        supabase.from("attempts").select("challenge_id, user_id, status, score"),
      ]);

    if (challengesError) throw challengesError;
    if (attemptsError) throw attemptsError;

    const allAttempts = (attempts ?? []) as AttemptRow[];

    return ((challenges ?? []) as ChallengeRow[]).map((row) => {
      const rowAttempts = allAttempts.filter((a) => a.challenge_id === row.id);
      const completed = rowAttempts.filter((a) => a.status === "completed");
      const uniqueUsers = new Set(rowAttempts.map((a) => a.user_id).filter(Boolean));
      const scores = completed
        .map((a) => a.score)
        .filter((s): s is number => typeof s === "number");
      const averageScore =
        scores.length > 0 ? Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length) : null;
      const completionRate =
        rowAttempts.length > 0 ? Math.round((completed.length / rowAttempts.length) * 100) : null;

      return {
        id: row.id,
        key: row.key,
        displayName: labDisplayName(row.key),
        challengeType: row.challenge_type,
        difficulty: row.difficulty,
        status: row.status,
        xpReward: row.xp_reward,
        attemptCount: rowAttempts.length,
        completedCount: completed.length,
        completionRate,
        uniqueUserCount: uniqueUsers.size,
        averageScore,
        updatedAt: row.updated_at,
      };
    });
  } catch (err) {
    console.error("getAllLabsForFounder failed:", err);
    return [];
  }
}
