import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Founder Subscribers admin (CyberAbeer Platform Phase II, Batch 2).
 * Reads newsletter_subscribers joined to contacts. Both tables are
 * RLS-locked to `is_platform_admin()` only (database/migrations/007_
 * rls_policies.sql, the `internal_tables` admin-only block), so this
 * uses the regular cookie-bound server client -- the founder's own
 * session already satisfies that policy; no service-role key needed
 * for a read.
 */

export interface FounderSubscriberRow {
  id: string;
  email: string;
  segment: string;
  status: string;
  subscribedAt: string;
  locale: string | null;
}

interface ContactRow {
  email: string;
  locale: string | null;
}

interface SubscriberRow {
  id: string;
  segment: string;
  status: string;
  subscribed_at: string;
  contacts: ContactRow | null;
}

export async function getSubscribersForFounder(): Promise<FounderSubscriberRow[]> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("newsletter_subscribers")
      .select("id, segment, status, subscribed_at, contacts ( email, locale )")
      .order("subscribed_at", { ascending: false });

    if (error) throw error;

    return ((data ?? []) as unknown as SubscriberRow[]).map((row) => ({
      id: row.id,
      email: row.contacts?.email ?? "(unknown)",
      segment: row.segment,
      status: row.status,
      subscribedAt: row.subscribed_at,
      locale: row.contacts?.locale ?? null,
    }));
  } catch (err) {
    console.error("getSubscribersForFounder failed, returning empty list", err);
    return [];
  }
}
