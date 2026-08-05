import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Founder Newsletter admin (CyberAbeer Platform Phase II, Batch 2).
 * Reads real newsletter_subscribers and newsletter_campaigns rows
 * (migration 002/024/028). Both tables are RLS-locked to
 * is_platform_admin(), so this uses the regular cookie-bound server
 * client -- the founder's own session already satisfies that policy,
 * same as lib/founder/subscribers-admin.ts.
 */

export interface FounderCampaignRow {
  id: string;
  segment: string;
  subject: string;
  status: string;
  recipientCount: number;
  sentCount: number;
  failedCount: number;
  createdAt: string;
  sentAt: string | null;
}

const NAMED_SEGMENTS = [
  "enterprise_ai_governance",
  "quantum",
  "students",
  "certification",
  "cyber_intelligence_brief",
] as const;

/** Active-subscriber count per segment, plus an "all" total (deduped by row, not by contact -- a contact subscribed to two segments counts once per segment, which is what a per-segment send actually reaches). */
export async function getSegmentSubscriberCounts(): Promise<Record<string, number>> {
  const supabase = await createSupabaseServerClient();
  const counts: Record<string, number> = {};

  const { count: total } = await supabase
    .from("newsletter_subscribers")
    .select("id", { count: "exact", head: true })
    .eq("status", "subscribed");
  counts.all = total ?? 0;

  await Promise.all(
    NAMED_SEGMENTS.map(async (segment) => {
      const { count } = await supabase
        .from("newsletter_subscribers")
        .select("id", { count: "exact", head: true })
        .eq("status", "subscribed")
        .eq("segment", segment);
      counts[segment] = count ?? 0;
    })
  );

  return counts;
}

export async function getCampaignsForFounder(): Promise<FounderCampaignRow[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("newsletter_campaigns")
      .select("id, segment, subject, status, recipient_count, sent_count, failed_count, created_at, sent_at")
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) throw error;

    return (data ?? []).map((row) => ({
      id: row.id as string,
      segment: row.segment as string,
      subject: row.subject as string,
      status: row.status as string,
      recipientCount: row.recipient_count as number,
      sentCount: row.sent_count as number,
      failedCount: row.failed_count as number,
      createdAt: row.created_at as string,
      sentAt: (row.sent_at as string | null) ?? null,
    }));
  } catch (err) {
    console.error("getCampaignsForFounder failed, returning empty list", err);
    return [];
  }
}
