import "server-only";
import { createSupabaseServerClient, createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { labDisplayName } from "./labs-admin";

/**
 * Founder Analytics admin (CyberAbeer Platform Phase II, Batch 3).
 * There is no server-side traffic-analytics API configured for this
 * project -- lib/analytics/track.ts fires client-side Plausible
 * events only, and a paid Plausible plan was explicitly ruled out
 * during launch planning (no API access to traffic data). Rather
 * than fabricate visit counts, this dashboard surfaces real
 * platform-engagement data already stored in Supabase: account
 * growth, content reach, Labs/CTF play activity, and Free Tools/lead
 * capture. Same discipline as the Media Library and SEO dashboards --
 * every number is a live query, not an estimate.
 */

export interface GrowthStats {
  totalUsers: number;
  newUsers7d: number;
  newUsers30d: number;
}

export interface ContentReachStats {
  publishedArticles: number;
  totalSubscribers: number;
  subscribersByStatus: { status: string; count: number }[];
  newSubscribers30d: number;
}

export interface ChallengeEngagementRow {
  key: string;
  displayName: string;
  challengeType: string;
  attempts: number;
  completions: number;
  completionRate: number | null;
  averageScore: number | null;
}

export interface LabsEngagementStats {
  totalAttempts: number;
  totalCompletions: number;
  completionRate: number | null;
  uniquePlayers: number;
  topChallenges: ChallengeEngagementRow[];
}

export interface ToolsEngagementStats {
  totalSubmissions: number;
  byTool: { toolKey: string; submissions: number }[];
  totalLeads: number;
}

export interface AnalyticsOverview {
  growth: GrowthStats;
  content: ContentReachStats;
  labs: LabsEngagementStats;
  tools: ToolsEngagementStats;
}

async function getGrowthStats(): Promise<GrowthStats> {
  let totalUsers = 0;
  let newUsers7d = 0;
  let newUsers30d = 0;

  try {
    const supabase = await createSupabaseServerClient();
    const { count } = await supabase.from("profiles").select("id", { count: "exact", head: true });
    totalUsers = count ?? 0;
  } catch (err) {
    console.error("getGrowthStats totalUsers failed", err);
  }

  try {
    const supabase = await createSupabaseServerClient();
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const [{ count: c7 }, { count: c30 }] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", sevenDaysAgo),
      supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", thirtyDaysAgo),
    ]);
    newUsers7d = c7 ?? 0;
    newUsers30d = c30 ?? 0;
  } catch (err) {
    console.error("getGrowthStats new-user windows failed (created_at column may be unavailable)", err);
  }

  return { totalUsers, newUsers7d, newUsers30d };
}

async function getContentReachStats(): Promise<ContentReachStats> {
  let publishedArticles = 0;
  let totalSubscribers = 0;
  let subscribersByStatus: { status: string; count: number }[] = [];
  let newSubscribers30d = 0;

  try {
    const supabase = await createSupabaseServerClient();
    const { count } = await supabase
      .from("articles")
      .select("id", { count: "exact", head: true })
      .eq("status", "published");
    publishedArticles = count ?? 0;
  } catch (err) {
    console.error("getContentReachStats publishedArticles failed", err);
  }

  try {
    const supabase = await createSupabaseServerClient();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await supabase.from("newsletter_subscribers").select("status, subscribed_at");
    if (error) throw error;

    const rows = (data ?? []) as { status: string; subscribed_at: string }[];
    const statusCounts = new Map<string, number>();
    let recent = 0;
    for (const row of rows) {
      statusCounts.set(row.status, (statusCounts.get(row.status) ?? 0) + 1);
      if (row.subscribed_at >= thirtyDaysAgo) recent += 1;
    }

    totalSubscribers = rows.length;
    subscribersByStatus = Array.from(statusCounts.entries()).map(function (entry) {
      return { status: entry[0], count: entry[1] };
    });
    newSubscribers30d = recent;
  } catch (err) {
    console.error("getContentReachStats subscriber stats failed", err);
  }

  return { publishedArticles, totalSubscribers, subscribersByStatus, newSubscribers30d };
}

async function getLabsEngagementStats(): Promise<LabsEngagementStats> {
  try {
    const supabase = await createSupabaseServerClient();

    const [{ data: challenges, error: challengesError }, { data: attempts, error: attemptsError }] =
      await Promise.all([
        supabase.from("challenges").select("id, key, challenge_type"),
        supabase.from("attempts").select("challenge_id, user_id, status, score"),
      ]);

    if (challengesError) throw challengesError;
    if (attemptsError) throw attemptsError;

    type ChallengeRow = { id: string; key: string; challenge_type: string };
    type AttemptRow = { challenge_id: string; user_id: string | null; status: string; score: number | null };

    const allChallenges = (challenges ?? []) as ChallengeRow[];
    const allAttempts = (attempts ?? []) as AttemptRow[];

    const completedAttempts = allAttempts.filter(function (a) {
      return a.status === "completed";
    });
    const uniquePlayers = new Set(
      allAttempts.map(function (a) {
        return a.user_id;
      }).filter(Boolean)
    );

    const rows: ChallengeEngagementRow[] = allChallenges.map(function (row) {
      const rowAttempts = allAttempts.filter(function (a) {
        return a.challenge_id === row.id;
      });
      const completed = rowAttempts.filter(function (a) {
        return a.status === "completed";
      });
      const scores = completed
        .map(function (a) {
          return a.score;
        })
        .filter(function (s): s is number {
          return typeof s === "number";
        });
      const averageScore =
        scores.length > 0
          ? Math.round(
              scores.reduce(function (sum, s) {
                return sum + s;
              }, 0) / scores.length
            )
          : null;
      const completionRate =
        rowAttempts.length > 0 ? Math.round((completed.length / rowAttempts.length) * 100) : null;

      return {
        key: row.key,
        displayName: labDisplayName(row.key),
        challengeType: row.challenge_type,
        attempts: rowAttempts.length,
        completions: completed.length,
        completionRate,
        averageScore,
      };
    });

    const topChallenges = rows
      .slice()
      .sort(function (a, b) {
        return b.attempts - a.attempts;
      })
      .slice(0, 8);

    return {
      totalAttempts: allAttempts.length,
      totalCompletions: completedAttempts.length,
      completionRate:
        allAttempts.length > 0 ? Math.round((completedAttempts.length / allAttempts.length) * 100) : null,
      uniquePlayers: uniquePlayers.size,
      topChallenges,
    };
  } catch (err) {
    console.error("getLabsEngagementStats failed, returning zeros", err);
    return {
      totalAttempts: 0,
      totalCompletions: 0,
      completionRate: null,
      uniquePlayers: 0,
      topChallenges: [],
    };
  }
}

async function getToolsEngagementStats(): Promise<ToolsEngagementStats> {
  try {
    const supabase = createSupabaseServiceRoleClient();

    const [{ data: submissions, error: submissionsError }, { count: totalLeads }] = await Promise.all([
      supabase.from("tool_submissions").select("tool_key"),
      supabase.from("leads").select("id", { count: "exact", head: true }),
    ]);

    if (submissionsError) throw submissionsError;

    const rows = (submissions ?? []) as { tool_key: string }[];
    const byToolMap = new Map<string, number>();
    for (const row of rows) {
      byToolMap.set(row.tool_key, (byToolMap.get(row.tool_key) ?? 0) + 1);
    }

    return {
      totalSubmissions: rows.length,
      byTool: Array.from(byToolMap.entries())
        .map(function (entry) {
          return { toolKey: entry[0], submissions: entry[1] };
        })
        .sort(function (a, b) {
          return b.submissions - a.submissions;
        }),
      totalLeads: totalLeads ?? 0,
    };
  } catch (err) {
    console.error("getToolsEngagementStats failed, returning zeros", err);
    return { totalSubmissions: 0, byTool: [], totalLeads: 0 };
  }
}

export async function getAnalyticsOverview(): Promise<AnalyticsOverview> {
  const [growth, content, labs, tools] = await Promise.all([
    getGrowthStats(),
    getContentReachStats(),
    getLabsEngagementStats(),
    getToolsEngagementStats(),
  ]);

  return { growth, content, labs, tools };
}
