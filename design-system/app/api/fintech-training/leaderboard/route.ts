import { NextResponse } from "next/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-ip";

/**
 * Public, read-only feed for the Live Cohort tab on the standalone
 * FinTech for Banks Training static site. Lets every trainee see a
 * shared leaderboard and recent-activity feed while the simulations
 * are open, without exposing anything beyond day-completion counts.
 *
 * Names are reduced to "first name + last initial" before leaving
 * this route, since this is the first place trainee names become
 * visible to other trainees rather than only to the founder admin
 * dashboard. GET only, no auth (matches the training site, which has
 * no login of its own), rate limited by IP since it is public.
 */

const DAY_ORDER = ["day1", "day2", "day3", "day4", "day5"];

function shortName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "Anonymous trainee";
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`;
}

function formatWhen(value: string): string {
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export async function GET() {
  const ip = await getClientIp();
  const rateLimit = await checkRateLimit(`fintech-training-leaderboard:${ip}`);
  if (!rateLimit.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const supabase = createSupabaseServiceRoleClient();
    const { data, error } = await supabase
      .from("fintech_training_results")
      .select("trainee_name, day_id, day_label, completed_at")
      .order("completed_at", { ascending: false })
      .limit(500);

    if (error) throw error;

    const rows = data ?? [];

    type Progress = { name: string; daysCompleted: string[]; lastActivityRaw: string };
    const byName = new Map<string, Progress>();
    for (const row of rows) {
      const display = shortName(row.trainee_name as string);
      const existing = byName.get(display);
      const dayId = row.day_id as string;
      const completedAt = row.completed_at as string;
      if (existing) {
        if (!existing.daysCompleted.includes(dayId)) existing.daysCompleted.push(dayId);
        if (completedAt > existing.lastActivityRaw) existing.lastActivityRaw = completedAt;
      } else {
        byName.set(display, { name: display, daysCompleted: [dayId], lastActivityRaw: completedAt });
      }
    }

    const leaderboard = Array.from(byName.values())
      .map((p) => ({
        name: p.name,
        daysCompleted: DAY_ORDER.filter((d) => p.daysCompleted.includes(d)),
        lastActivity: formatWhen(p.lastActivityRaw),
        lastActivityRaw: p.lastActivityRaw,
      }))
      .sort((a, b) => {
        if (b.daysCompleted.length !== a.daysCompleted.length) {
          return b.daysCompleted.length - a.daysCompleted.length;
        }
        return a.lastActivityRaw < b.lastActivityRaw ? 1 : -1;
      })
      .slice(0, 20)
      .map(({ lastActivityRaw, ...rest }) => rest);

    const feed = rows.slice(0, 15).map((row) => ({
      name: shortName(row.trainee_name as string),
      dayLabel: row.day_label as string,
      when: formatWhen(row.completed_at as string),
    }));

    return NextResponse.json({ leaderboard, feed });
  } catch (err) {
    console.error("fintech-training leaderboard failed", err);
    return NextResponse.json({ leaderboard: [], feed: [] }, { status: 200 });
  }
}
