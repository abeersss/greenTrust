import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Rate limiting for the public form endpoints (newsletter, contact,
 * enterprise enquiry, register), per Phase 2's security baseline.
 * Upstash Redis is optional in this build: if UPSTASH_REDIS_REST_URL /
 * TOKEN are not set, `checkRateLimit` allows the request through
 * rather than throwing, so local development and this environment
 * (which has no Redis instance provisioned) still work. Production
 * should always set these two variables.
 */
let ratelimit: Ratelimit | null = null;

function getRatelimit(): Ratelimit | null {
  if (ratelimit) return ratelimit;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  ratelimit = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(5, "60 s"),
    analytics: true,
    prefix: "cyberabeer:form",
  });
  return ratelimit;
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
}

/**
 * `identifier` should be something derived from the request that a
 * spammer can't trivially rotate per submission, such as an IP
 * address (from the `x-forwarded-for` header) combined with the form
 * name, so a rate limit on the newsletter form doesn't also throttle
 * the contact form for the same visitor.
 */
export async function checkRateLimit(identifier: string): Promise<RateLimitResult> {
  const limiter = getRatelimit();
  if (!limiter) {
    // Not configured in this environment; fail open rather than
    // blocking every form submission on a missing optional dependency.
    return { success: true, remaining: Infinity };
  }

  const { success, remaining } = await limiter.limit(identifier);
  return { success, remaining };
}
