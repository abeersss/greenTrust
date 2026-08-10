import "server-only";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";

/**
 * Founder Tools admin (CyberAbeer Platform Phase II, Batch 4). Covers
 * both the Free Tools hub and the free web versions of the
 * AbeerGRC/Organization Tools assessments (Cybersecurity Posture,
 * ISO/IEC 27001 Gap) -- every one of these writes a row to
 * tool_submissions (database/migrations/025_organizational_tools_
 * free_assessments.sql), so a single admin screen can list them all.
 * The Excel-based downloadable tools (Risk Register, SoA Tracker,
 * Incident Response Log, Aegis GRC bundle) are static file downloads
 * with no server round-trip, so they genuinely have no submission
 * data to show here -- that is called out explicitly rather than
 * showing a fabricated download count.
 */

const TOOL_LABELS: Record<string, string> = {
  greentrust_quick_assessment: "GreenTrust AI Quick Check",
  greentrust_free_assessment: "GreenTrust AI Free Assessment",
  quantum_quick_assessment: "Quantum Readiness Quick Check",
  skill_assessment: "Skill Assessment",
  cyber_posture_assessment: "Cybersecurity Posture Assessment",
  iso27001_gap_assessment: "ISO/IEC 27001 Gap Assessment",
};

export function toolLabel(toolKey: string): string {
  return TOOL_LABELS[toolKey] ?? toolKey;
}

export interface FounderToolSubmissionRow {
  id: string;
  toolKey: string;
  toolLabel: string;
  locale: string | null;
  score: number | null;
  submittedAt: string | null;
}

export interface ToolSummaryRow {
  toolKey: string;
  toolLabel: string;
  submissions: number;
  averageScore: number | null;
}

export interface FounderToolsOverview {
  submissions: FounderToolSubmissionRow[];
  summary: ToolSummaryRow[];
  totalSubmissions: number;
}

type SubmissionRow = {
  id: string;
  tool_key: string;
  locale: string | null;
  score: number | null;
  created_at: string | null;
};

export async function getToolsOverviewForFounder(): Promise<FounderToolsOverview> {
  try {
    const supabase = createSupabaseServiceRoleClient();
    const [{ data, error }, { count: totalCount }] = await Promise.all([
      supabase
        .from("tool_submissions")
        .select("id, tool_key, locale, score, created_at")
        .order("created_at", { ascending: false })
        .limit(200),
      supabase.from("tool_submissions").select("id", { count: "exact", head: true }),
    ]);

    if (error) throw error;

    const rows = (data ?? []) as SubmissionRow[];

    const submissions: FounderToolSubmissionRow[] = rows.map(function (row) {
      return {
        id: row.id,
        toolKey: row.tool_key,
        toolLabel: toolLabel(row.tool_key),
        locale: row.locale,
        score: row.score,
        submittedAt: row.created_at,
      };
    });

    const summaryMap = new Map<string, { count: number; scoreSum: number; scoreCount: number }>();
    for (const row of rows) {
      const entry = summaryMap.get(row.tool_key) ?? { count: 0, scoreSum: 0, scoreCount: 0 };
      entry.count += 1;
      if (typeof row.score === "number") {
        entry.scoreSum += row.score;
        entry.scoreCount += 1;
      }
      summaryMap.set(row.tool_key, entry);
    }

    const summary: ToolSummaryRow[] = Array.from(summaryMap.entries())
      .map(function (entry) {
        const key = entry[0];
        const stats = entry[1];
        return {
          toolKey: key,
          toolLabel: toolLabel(key),
          submissions: stats.count,
          averageScore: stats.scoreCount > 0 ? Math.round(stats.scoreSum / stats.scoreCount) : null,
        };
      })
      .sort(function (a, b) {
        return b.submissions - a.submissions;
      });

    return { submissions, summary, totalSubmissions: totalCount ?? rows.length };
  } catch (err) {
    console.error("getToolsOverviewForFounder failed, returning empty state", err);
    return { submissions: [], summary: [], totalSubmissions: 0 };
  }
}
