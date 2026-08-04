import { ImageResponse } from "next/og";
import * as React from "react";

export const runtime = "edge";

// Dynamic certificate share image (founder instruction, 2026-08-04:
// "make sharing for certificate as an image post with link to
// site"). Mirrors app/api/badge-image/[badgeKey]/route.ts's approach
// -- a 1200x630 OG-ready card built purely from query params, no
// database access needed -- but themed to match the certificate
// artwork's green/gold palette instead of the badge medal card's
// dark blue. Consumed two ways: (1) as the Open Graph/Twitter image
// on /[locale]/certificate/[referenceCode], so link-preview scrapers
// on X, LinkedIn, and Facebook show the real certificate; (2)
// fetched directly as a PNG blob by CertificateShareButton's native
// Web Share (navigator.share with files) on devices that support
// attaching an actual image to the share sheet. Lives under
// app/api/ (not app/[locale]/) so next-intl's locale-prefix
// middleware never intercepts it -- the same fix already applied to
// app/api/badge-image/[badgeKey]/route.ts after it 404'd at
// /[locale]/badge-image.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name")?.trim() || "CyberAbeer Learner";
  const locale = searchParams.get("locale") === "ar" ? "ar" : "en";
  const issued = searchParams.get("issued")?.trim() || "";

  const brand = locale === "ar" ? "سايبر أبير" : "CyberAbeer";
  const heading = locale === "ar" ? "شهادة إنجاز" : "Certificate of Achievement";
  const sub =
    locale === "ar"
      ? "أتمّ جميع تحديات CyberAbeer الستة من نوع Capture the Flag"
      : "Completed all six CyberAbeer Capture-the-Flag challenges";

  const seal = React.createElement(
    "div",
    {
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 128,
        height: 128,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #fde68a 0%, #eab308 55%, #b45309 100%)",
        border: "6px solid #f8fafc",
        fontSize: 24,
        fontWeight: 700,
        color: "#1c1305",
        marginBottom: 32,
      },
    },
    "CTF",
  );

  const headingLine = React.createElement(
    "div",
    {
      style: {
        display: "flex",
        fontSize: 30,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: 3,
        color: "#facc15",
      },
    },
    heading,
  );

  const nameLine = React.createElement(
    "div",
    {
      style: {
        display: "flex",
        fontSize: 60,
        fontWeight: 700,
        marginTop: 22,
        textAlign: "center",
        maxWidth: 1000,
      },
    },
    name,
  );

  const subLine = React.createElement(
    "div",
    {
      style: {
        display: "flex",
        marginTop: 20,
        fontSize: 22,
        opacity: 0.85,
        textAlign: "center",
        maxWidth: 860,
      },
    },
    sub,
  );

  const footerLine = React.createElement(
    "div",
    {
      style: {
        display: "flex",
        marginTop: 44,
        fontSize: 24,
        fontWeight: 600,
        letterSpacing: 1,
        opacity: 0.9,
      },
    },
    issued ? `${brand}  ·  ${issued}` : brand,
  );

  const card = React.createElement(
    "div",
    {
      style: {
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #052e1a 0%, #0d4429 55%, #0f5c33 100%)",
        fontFamily: "sans-serif",
        color: "#f8fafc",
      },
    },
    seal,
    headingLine,
    nameLine,
    subLine,
    footerLine,
  );

  return new ImageResponse(card, { width: 1200, height: 630 });
}
