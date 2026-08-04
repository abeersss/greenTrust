import { ImageResponse } from "next/og";
import * as React from "react";

export const runtime = "edge";

// Dynamic per-badge share image (founder instruction, 2026-08-04:
// "the sharing will be with badge as image in the post"). Renders a
// 1200x630 OG-ready card for any earned badge -- Labs or CTF -- from
// just its name and medal number, so it needs no database access and
// works for every badge key without a matching entry here. Consumed
// two ways: (1) as the Open Graph/Twitter image on
// /[locale]/badge/[badgeKey], so link-preview scrapers on X, LinkedIn,
// and Facebook show the real badge; (2) fetched directly as a PNG
// blob by BadgeTile's native Web Share (navigator.share with files)
// on devices that support attaching an actual image to the share
// sheet. Built with React.createElement rather than JSX since this
// route needs no JSX transform beyond next/og's ImageResponse.
export async function GET(request: Request, context: { params: Promise<{ badgeKey: string }> }) {
  const { badgeKey } = await context.params;
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name")?.trim() || badgeKey;
  const number = searchParams.get("number")?.trim() || "";
  const locale = searchParams.get("locale") === "ar" ? "ar" : "en";
  const brand = locale === "ar" ? "سايبر أبير" : "CyberAbeer";
  const tagline = locale === "ar" ? "شارة مكتسبة" : "Badge earned";

  const medal = React.createElement(
    "div",
    {
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 168,
        height: 168,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #fde68a 0%, #eab308 55%, #b45309 100%)",
        border: "6px solid #f8fafc",
        fontSize: 34,
        fontWeight: 700,
        color: "#1c1305",
        marginBottom: 40,
      },
    },
    number || "★",
  );

  const nameLine = React.createElement(
    "div",
    { style: { display: "flex", fontSize: 56, fontWeight: 700, textAlign: "center", maxWidth: 980, lineHeight: 1.15 } },
    name,
  );

  const taglineLine = React.createElement(
    "div",
    { style: { display: "flex", marginTop: 20, fontSize: 26, opacity: 0.8 } },
    tagline,
  );

  const brandLine = React.createElement(
    "div",
    { style: { display: "flex", marginTop: 48, fontSize: 30, fontWeight: 600, letterSpacing: 1 } },
    brand,
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
        background: "linear-gradient(135deg, #0b1220 0%, #14304f 55%, #1d4a73 100%)",
        fontFamily: "sans-serif",
        color: "#f8fafc",
      },
    },
    medal,
    nameLine,
    taglineLine,
    brandLine,
  );

  return new ImageResponse(card, { width: 1200, height: 630 });
}
