"use server";

import { revalidatePath } from "next/cache";
import { requireFounder } from "@/lib/auth/founder";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/send";
import type { AppLocale } from "@/lib/i18n/config";
import { actionError, actionSuccess, type ActionResult } from "./types";

const ALLOWED_SEGMENTS = [
  "all",
  "enterprise_ai_governance",
  "quantum",
  "students",
  "certification",
  "cyber_intelligence_brief",
] as const;
type CampaignSegment = (typeof ALLOWED_SEGMENTS)[number];

export interface SendCampaignResult {
  recipientCount: number;
  sentCount: number;
  failedCount: number;
  /** true if at least one send failed specifically because RESEND_API_KEY isn't set -- the UI shows a distinct warning for this rather than a generic failure count. */
  notConfigured: boolean;
}

interface RecipientRow {
  contacts: { email: string } | null;
}

/**
 * Founder Newsletter send (CyberAbeer Platform Phase II, Batch 2).
 * Composes and sends a one-off campaign to real newsletter_subscribers
 * rows (migration 002/024) via the existing Resend module
 * (lib/email/send.ts). No cron, no queue: the founder clicks Send and
 * this loops the current subscriber list synchronously within the
 * request. Uses the regular cookie-bound client so both the read
 * (newsletter_subscribers/contacts admin-only RLS) and the campaign
 * log write are attributed to, and gated by, the founder's own
 * authenticated session -- same pattern as founder-content.ts.
 */
export async function sendNewsletterCampaign(
  locale: AppLocale,
  formData: FormData
): Promise<ActionResult<SendCampaignResult>> {
  const { userId } = await requireFounder(locale);

  const segment = String(formData.get("segment") ?? "");
  const subject = String(formData.get("subject") ?? "").trim();
  const bodyText = String(formData.get("body") ?? "").trim();

  if (!ALLOWED_SEGMENTS.includes(segment as CampaignSegment)) {
    return actionError("Choose a valid audience.");
  }
  if (!subject) {
    return actionError("Subject is required.");
  }
  if (!bodyText) {
    return actionError("Message body is required.");
  }

  const bodyHtml = bodyText
    .split(/\n{2,}/)
    .map((para) => `<p style="margin:0 0 16px 0;">${escapeHtml(para).replace(/\n/g, "<br />")}</p>`)
    .join("\n");

  try {
    const supabase = await createSupabaseServerClient();

    let query = supabase
      .from("newsletter_subscribers")
      .select("contacts ( email )")
      .eq("status", "subscribed");
    if (segment !== "all") {
      query = query.eq("segment", segment);
    }

    const { data, error } = await query;
    if (error) throw error;

    const seen = new Set<string>();
    const recipients: string[] = [];
    for (const row of (data ?? []) as unknown as RecipientRow[]) {
      const email = row.contacts?.email;
      if (email && !seen.has(email)) {
        seen.add(email);
        recipients.push(email);
      }
    }

    if (recipients.length === 0) {
      return actionError("No active subscribers in this segment yet.");
    }

    const { data: campaign, error: insertError } = await supabase
      .from("newsletter_campaigns")
      .insert({
        created_by: userId,
        segment,
        subject,
        body_html: bodyHtml,
        status: "sending",
        recipient_count: recipients.length,
      })
      .select("id")
      .single();
    if (insertError) throw insertError;

    let sentCount = 0;
    let failedCount = 0;
    let notConfigured = false;
    const wrappedHtml = wrapCampaignHtml(bodyHtml, subject, locale);

    for (const email of recipients) {
      const result = await sendEmail({ to: email, subject, html: wrappedHtml });
      if (result.sent) {
        sentCount += 1;
      } else {
        failedCount += 1;
        if (result.reason === "not_configured") notConfigured = true;
      }
    }

    await supabase
      .from("newsletter_campaigns")
      .update({
        status: sentCount > 0 ? "sent" : "failed",
        sent_count: sentCount,
        failed_count: failedCount,
        sent_at: new Date().toISOString(),
      })
      .eq("id", campaign.id as string);

    revalidatePath(`/${locale}/founder/newsletter`);

    return actionSuccess({ recipientCount: recipients.length, sentCount, failedCount, notConfigured });
  } catch (err) {
    console.error("sendNewsletterCampaign failed", err);
    return actionError("Could not send the campaign. Please try again.");
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Branded HTML wrapper for outbound campaign emails -- CyberAbeer Batch 2
 * design pass. Uses the literal brand hex values from styles/tokens.css
 * (primary #0f4c5c/#0a323c, accent gold #c9a227) rather than CSS custom
 * properties, since email clients don't resolve var(). Table-based
 * layout for Outlook compatibility. No compose-form changes -- founders
 * still just fill in Audience/Subject/Message; this is purely the
 * output template.
 */
function wrapCampaignHtml(bodyHtml: string, subject: string, locale: AppLocale): string {
  const isAr = locale === "ar";
  const dir = isAr ? "rtl" : "ltr";
  const align = isAr ? "right" : "left";
  const unsubscribeCopy = isAr
    ? "تصلك هذه الرسالة لأنك مشترك في نشرة CyberAbeer عبر cyberabeer.com."
    : "You're receiving this because you subscribed to CyberAbeer updates at cyberabeer.com.";
  const signatureName = isAr ? "د. عبير الشمري" : "Dr. Abeer Alshammari";
  const signatureTitle = isAr ? "المؤسِّسة، CyberAbeer" : "Founder, CyberAbeer";

  return `
<div dir="${dir}" style="background-color:#f7f8f9; padding:32px 16px; font-family:-apple-system,'Segoe UI',Roboto,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px; margin:0 auto; background:#ffffff; border-radius:12px; overflow:hidden; border:1px solid #dde1e6;">
    <tr><td style="height:4px; background-color:#0f4c5c;"></td></tr>
    <tr>
      <td style="padding:32px 40px 20px 40px; text-align:${align};">
        <span style="font-size:20px; font-weight:700; letter-spacing:-0.01em; color:#0a323c;">Cyber</span><span style="font-size:20px; font-weight:700; color:#c9a227;">Abeer</span>
      </td>
    </tr>
    <tr><td style="padding:0 40px;"><hr style="border:none; border-top:1px solid #dde1e6; margin:0;" /></td></tr>
    <tr>
      <td style="padding:28px 40px 8px 40px; text-align:${align};">
        <h1 style="margin:0 0 16px 0; font-size:20px; line-height:1.35; color:#1a2027; font-weight:700;">${escapeHtml(subject)}</h1>
        <div style="font-size:15px; line-height:1.65; color:#1a2027;">
          ${bodyHtml}
        </div>
        <p style="margin:24px 0 0 0; font-size:14px; color:#1a2027;">
          ${signatureName}<br />
          <span style="color:#71808f;">${signatureTitle}</span>
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding:20px 40px; background-color:#f7f8f9; border-top:1px solid #dde1e6; text-align:${align};">
        <p style="margin:0; font-size:12px; line-height:1.6; color:#71808f;">${unsubscribeCopy}</p>
      </td>
    </tr>
  </table>
</div>
`;
}
