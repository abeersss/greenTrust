import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ locale: string; pillar: string }> }
) {
  const { locale, pillar } = await params;
  return NextResponse.json({
    locale,
    pillar,
    len: pillar.length,
    codePoints: [...pillar].map((c) => c.codePointAt(0)),
    url: req.url,
    nextUrlPathname: req.nextUrl.pathname,
  });
}
