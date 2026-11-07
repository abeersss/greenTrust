import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Tells the standalone FinTech for Banks Training page whether the
 * visitor is signed in to their CyberAbeer account, and returns the
 * name to prefill. Read-only, never exposes anything beyond the
 * caller's own email and display name.
 */
export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ loggedIn: false }, { headers: NO_STORE });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle();

    const fullName = typeof profile?.full_name === "string" ? profile.full_name.trim() : "";

    return NextResponse.json(
      { loggedIn: true, name: fullName, email: user.email ?? "" },
      { headers: NO_STORE }
    );
  } catch (err) {
    console.error("fintech-training me failed", err);
    return NextResponse.json({ loggedIn: false }, { headers: NO_STORE });
  }
}
