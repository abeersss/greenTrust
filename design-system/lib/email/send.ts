import "server-only";

/**
 * Transactional email, sent via the Resend HTTP API from server-only
 * code (this file is never imported by a Client Component; `"server-
 * only"` above makes that a build error if anyone tries). Matches the
 * existing fail-open pattern already used for rate limiting
 * (lib/rate-limit.ts): if `RESEND_API_KEY` is not set, `sendEmail`
 * logs and no-ops instead of throwing, so every environment without a
 * configured email provider (this sandbox, a fresh local checkout)
 * still runs without crashing. Nothing here ever reaches the browser —
 * there is no frontend code path that can see this key.
 *
 * Account confirmation and password-reset emails are NOT sent through
 * this module: those are handled natively by Supabase Auth (see
 * lib/actions/auth.ts), since Supabase already owns that email flow
 * end to end (including the recovery-link security model). This
 * module covers the transactional emails Supabase Auth has no concept
 * of: welcome, enterprise enquiry confirmation, and GreenTrust
 * assessment results.
 */

const RESEND_API_URL = "https://api.resend.com/emails";

export interface SendEmailInput {
    to: string;
    subject: string;
    html: string;
    /** Defaults to EMAIL_FROM_ADDRESS, falling back to a CyberAbeer-branded Resend sandbox sender. */
  from?: string;
}

export interface SendEmailResult {
    sent: boolean;
    /** Present when sent is false: either "not_configured" (no API key set) or the provider's error message. */
  reason?: string;
}

function getFromAddress(): string {
    return process.env.EMAIL_FROM_ADDRESS ?? "CyberAbeer <onboarding@resend.dev>";
}

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
          console.warn(`[email] RESEND_API_KEY not set; skipping send to ${input.to} ("${input.subject}")`);
          return { sent: false, reason: "not_configured" };
    }

  try {
        const response = await fetch(RESEND_API_URL, {
                method: "POST",
                headers: {
                          Authorization: `Bearer ${apiKey}`,
                          "Content-Type": "application/json",
                },
                body: JSON.stringify({
                          from: input.from ?? getFromAddress(),
                          to: [input.to],
                          subject: input.subject,
                          html: input.html,
                }),
        });

      if (!response.ok) {
              const body = await response.text().catch(() => "");
              console.error(`[email] Resend send failed (${response.status}): ${body}`);
              return { sent: false, reason: `provider_error_${response.status}` };
      }

      return { sent: true };
  } catch (err) {
        console.error("[email] sendEmail threw", err);
        return { sent: false, reason: "network_error" };
  }
}
