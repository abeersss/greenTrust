import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Server Actions default body-size cap is too small for the
  // founder's image/PDF uploads (tool resources + book galleries,
  // migration 030) -- raised to accommodate up to 4 images or one
  // PDF/zip per submission.
  experimental: {
    serverActions: {
      bodySizeLimit: "15mb",
    },
  },
  // Security baseline (Phase 2, hardened Phase 7): a conservative
  // header set applied to every response. CSP is intentionally
  // permissive on `img-src`/`connect-src` for Supabase Storage/API and
  // Plausible analytics, but locks down `frame-ancestors`, disables
  // `object-src`, and disallows inline script execution beyond
  // Next.js's own hashed/nonce'd runtime chunks and the small amount
  // of inline JSON-LD this app renders (`script-src` allows
  // 'unsafe-inline' only for that reason; Next.js does not yet support
  // a nonce-based CSP for the App Router JSON-LD pattern used here).
  async headers() {
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://plausible.io",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://*.supabase.co",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co https://plausible.io",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; ");

    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
  // No explicit "/" redirect here: middleware.ts already redirects the
  // bare root to the visitor's best-matching locale (falling back to
  // the default), based on their Accept-Language header, which a
  // hardcoded redirect to /en would override for Arabic-speaking
  // visitors.
};

export default withNextIntl(nextConfig);
