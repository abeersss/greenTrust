import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const locale = searchParams.get("locale") || "ar";
  const slug = searchParams.get("slug") || "";

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error, status, statusText } = await supabase
      .from("category_translations")
      .select(
        `
        name, slug, description, meta_title, meta_description,
        categories!inner ( id, key, is_pillar, deleted_at )
      `
      )
      .eq("locale", locale)
      .eq("slug", slug)
      .maybeSingle();

    return NextResponse.json({
      ok: true,
      locale,
      slug,
      slugLen: slug.length,
      slugCodePoints: [...slug].map((c) => c.codePointAt(0)),
      data,
      error,
      status,
      statusText,
    });
  } catch (err: unknown) {
    const e = err as { message?: string; stack?: string; code?: string; details?: string; hint?: string };
    return NextResponse.json(
      {
        ok: false,
        caught: true,
        locale,
        slug,
        slugLen: slug.length,
        slugCodePoints: [...slug].map((c) => c.codePointAt(0)),
        message: e?.message,
        code: e?.code,
        details: e?.details,
        hint: e?.hint,
        stack: e?.stack,
      },
      { status: 500 }
    );
  }
}
