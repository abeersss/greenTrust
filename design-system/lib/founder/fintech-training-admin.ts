import "server-only";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";

export type FintechTrainingResultRow = {
  id: string;
  traineeName: string;
  dayId: string;
  dayLabel: string;
  completedAt: string;
};

export type FintechTraineeProgress = {
  traineeName: string;
  daysCompleted: string[];
  daysCompletedCount: number;
  lastActivity: string;
};

const DAY_ORDER = ["day1", "day2", "day3", "day4", "day5"];

export async function getFintechTrainingProgress(): Promise<FintechTraineeProgress[]> {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("fintech_training_results")
    .select("id, trainee_name, day_id, day_label, completed_at")
    .order("completed_at", { ascending: false });

  if (error) {
    console.error("getFintechTrainingProgress failed", error);
    return [];
  }

  const byName = new Map<string, FintechTraineeProgress>();
  for (const row of data ?? []) {
    const name = row.trainee_name as string;
    const existing = byName.get(name);
    if (existing) {
      if (!existing.daysCompleted.includes(row.day_id as string)) {
        existing.daysCompleted.push(row.day_id as string);
        existing.daysCompletedCount = existing.daysCompleted.length;
      }
      if (row.completed_at > existing.lastActivity) {
        existing.lastActivity = row.completed_at as string;
      }
    } else {
      byName.set(name, {
        traineeName: name,
        daysCompleted: [row.day_id as string],
        daysCompletedCount: 1,
        lastActivity: row.completed_at as string,
      });
    }
  }

  return Array.from(byName.values())
    .map((t) => ({
      ...t,
      daysCompleted: DAY_ORDER.filter((d) => t.daysCompleted.includes(d)),
    }))
    .sort((a, b) => (a.lastActivity < b.lastActivity ? 1 : -1));
}
