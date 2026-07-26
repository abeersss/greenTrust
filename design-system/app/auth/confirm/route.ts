import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { siteUrl } from "@/lib/seo/site";

/**
 * Landing point for every Supabase auth email link: signup
 * confirmation, password recovery, email-change confirmation.
 *
 * Supabase's classic {{ .ConfirmationURL }} email-template variable
 * routes through GoTrue's own /verify endpoint and hands the
 * session back as a URL fragment (#access_token=...), which a
 * server can never read - browsers never send fragments over the
 * wire, so a Server Component checking searchParams for a session
 * token there always comes back empty. That was the root cause of
 * password reset never working in production: the reset-password
 * page expected a ?code= query param that this flow never produced.
 *
 * The fix: the Supabase dashboard's email templates now link here
 * with token_hash/type as ordinary query params instead of using
 * {{ .ConfirmationURL }}, so verifyOtp can establish the session
 * server-side (writable cookies, since this is a Route Handler) before
 * redirecting into the app. This route deliberately lives outside
 * app/[locale] - and is excluded from the locale middleware's
 * matcher - because Supabase's redirect target must be one fixed,
 * locale-agnostic URL; the locale-correct destination is instead
 * passed through as next (built from redirectTo/emailRedirectTo
 * at the point the app requested the email, so it already carries the
 * right /en/ or /ar/ prefix).
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const rawNext = searchParams.get("next");

  const fallback = `${siteUrl}/en`;
  let next: URL;
  try {
    next = new URL(rawNext ?? fallback, siteUrl);
  } catch {
    next = new URL(fallback);
  }
  if (next.origin !== new URL(siteUrl).origin) {
    next = new URL(fallback);
  }

  if (token_hash && type) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    if (!error) {
      return NextResponse.redirect(next);
    }
    next.searchParams.set("authError", "expired");
    return NextResponse.redirect(next);
  }

  next.searchParams.set("authError", "invalid_link");
  return NextResponse.redirect(next);
}

