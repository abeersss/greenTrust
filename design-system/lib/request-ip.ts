import "server-only";
import { headers } from "next/headers";

/**
 * Best-effort client IP for rate limiting. Vercel sets `x-forwarded-for`
 * on every request; falls back to a constant so rate limiting still
 * groups requests together (rather than throwing) in local development
 * or any environment that doesn't set the header.
 */
export async function getClientIp(): Promise<string> {
  const headerList = await headers();
  const forwardedFor = headerList.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return "unknown";
}
