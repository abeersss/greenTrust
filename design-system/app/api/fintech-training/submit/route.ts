import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-ip";

const submitSchema = z.object({
  name: z.string().trim().min(1).max(80),
  dayId: z.enum(["day1", "day2", "day3", "day4", "day5"]),
  dayLabel: z.string().trim().min(1).max(200),
  sessionId: z.string().trim().min(8).max(100),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = submitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid input" }, { status: 400 });
  }

  const ip = await getClientIp();
  const rateLimit = await checkRateLimit(`fintech-training:${ip}`);
  if (!rateLimit.success) {
    return NextResponse.json({ ok: false, error: "Too many attempts" }, { status: 429 });
  }

  try {
    const supabase = createSupabaseServiceRoleClient();
    const { error } = await supabase
      .from("fintech_training_results")
      .upsert(
        {
          trainee_name: parsed.data.name,
          day_id: parsed.data.dayId,
          day_label: parsed.data.dayLabel,
          session_id: parsed.data.sessionId,
          completed_at: new Date().toISOString(),
        },
        { onConflict: "session_id,day_id" }
      );
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("fintech-training submit failed", err);
    return NextResponse.json({ ok: false, error: "Could not save progress" }, { status: 500 });
  }
}
