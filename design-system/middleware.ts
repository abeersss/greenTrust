import { NextResponse, type NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { locales, defaultLocale } from "@/lib/i18n/config";
import { getSupabaseUrl, getSupabaseAnonKey } from "@/lib/supabase/env";

/**
 * Locale routing middleware. localePrefix: "always" means every page
 * lives at /en/... or /ar/... with no unprefixed default, which keeps
 * canonical URLs and hreflang mapping unambiguous (a bare "/" would
 * otherwise be two different pages depending on browser language,
 * which is exactly what hreflang exists to avoid).
 */
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
});

/**
 * Combined locale-routing + Supabase session-refresh middleware.
 *
 * Every Server Component / Server Action reads the auth cookie via
 * createSupabaseServerClient() (lib/supabase/server.ts), but a plain
 * Server Component render can never write a refreshed cookie back
 * (Next.js only allows cookie writes from Route Handlers, Server
 * Actions, and Middleware). Without this refresh happening somewhere,
 * an expired access token forces a token-refresh on every single
 * request, and because Supabase rotates refresh tokens on each use,
 * a refreshed-but-never-persisted refresh token gets silently
 * discarded - the next request then tries to refresh again with the
 * now-stale, already-rotated-out refresh token, which fails outright.
 * That is what "logged in one minute, logged out the next" looks like
 * in production. Running getUser() here, with cookies wired through
 * both the incoming request and the outgoing response, is the
 * standard Supabase SSR fix: it refreshes and persists the session on
 * every navigation, so by the time a Server Component reads it, the
 * cookie is already current.
 */
export default async function middleware(request: NextRequest) {
  const response = intlMiddleware(request);

  const supabase = createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  // Result intentionally unused: the call's only purpose is to trigger
  // (and persist, via setAll above) a token refresh when needed.
  await supabase.auth.getUser();

  return response;
}

export const config = {
  // Run on every path except Next.js internals, API routes, the
  // locale-agnostic /auth/* email-link landing route (it must resolve
  // without a locale prefix, since Supabase's redirect target is a
  // fixed URL), and anything that looks like a static file (has a dot
  // in the last segment, e.g. sitemap.xml, robots.txt, favicon.ico).
  matcher: ["/((?!api|_next|_vercel|auth|.*\\..*).*)"],
};
