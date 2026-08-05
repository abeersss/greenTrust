"use server";

import { newsletterSchema, type NewsletterInput } from "@/lib/validation/schemas";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { upsertContactByEmail } from "./contacts";
import { actionError, actionSuccess, type ActionResult } from "./types";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-ip";
import { sendEmail } from "@/lib/email/send";

const SEGMENT_COPY: Record<string, { en: { subject: string; body: string }; ar: { subject: string; body: string } }> = {
  cyber_intelligence_brief: {
    en: {
      subject: "You're subscribed to the CyberAbeer Cyber Brief",
      body: "Thanks for subscribing to the CyberAbeer Cyber Brief. You'll hear from us when there's a notable development in vulnerabilities, AI security, GRC, or post-quantum readiness worth flagging.",
    },
    ar: {
      subject: "تم تأكيد اشتراكك في نشرة CyberAbeer الاستخبارية",
      body: "شكراً لاشتراكك في نشرة CyberAbeer الاستخبارية (Cyber Brief). ستصلك رسالة عند وجود تطور مهم يستحق الإشارة إليه في الثغرات الأمنية، أو أمن الذكاء الاصطناعي، أو الحوكمة والمخاطر والامتثال، أو الجاهزية لِما بعد الحوسبة الكمية.",
    },
  },
  default: {
    en: {
      subject: "You're subscribed to CyberAbeer updates",
      body: "Thanks for subscribing to CyberAbeer. You'll hear from Dr. Abeer Alshammari and the CyberAbeer team when there's something worth sharing on AI governance, cybersecurity, and GRC.",
    },
    ar: {
      subject: "تم تأكيد اشتراكك في تحديثات CyberAbeer",
      body: "شكراً لاشتراكك في CyberAbeer. ستصلك رسالة من الدكتورة عبير الشمري وفريق CyberAbeer عند وجود ما يستحق المشاركة حول حوكمة الذكاء الاصطناعي والأمن السيبراني والحوكمة والمخاطر والامتثال (GRC).",
    },
  },
};

/**
 * Fire-and-forget confirmation email sent right after a successful
 * subscribe, via the existing Resend module (lib/email/send.ts).
 * sendEmail() already no-ops (logs, doesn't throw) if RESEND_API_KEY
 * isn't configured, so this never blocks or fails the subscribe
 * action itself -- worst case, no confirmation email goes out yet.
 */
async function sendSubscriptionConfirmation(email: string, locale: "en" | "ar", segment: string) {
  const copy = SEGMENT_COPY[segment] ?? SEGMENT_COPY.default;
  const { subject, body } = copy[locale];
  const dir = locale === "ar" ? ' dir="rtl"' : "";
  const html = `
    <div style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; max-width: 480px; margin: 0 auto; color: #1a1a1a;"${dir}>
      <p style="font-size: 15px; line-height: 1.6;">${body}</p>
      <p style="font-size: 12px; color: #888; margin-top: 24px;">
        ${locale === "ar" ? "هذه رسالة تأكيد تلقائية ولا داعي للرد عليها. — CyberAbeer" : "This is an automated confirmation -- no need to reply. — CyberAbeer"}
      </p>
    </div>
  `;

  await sendEmail({ to: email, subject, html });
}

export async function subscribeToNewsletter(input: NewsletterInput): Promise<ActionResult> {
  const parsed = newsletterSchema.safeParse(input);
  if (!parsed.success) {
    return actionError("Invalid input", parsed.error.flatten().fieldErrors as Record<string, string[]>);
  }
  if (parsed.data.website) {
    // Honeypot tripped. Report success to the caller so a bot doesn't
    // learn the field is being checked, but write nothing.
    return actionSuccess();
  }

  const ip = await getClientIp();
  const rateLimit = await checkRateLimit(`newsletter:${ip}`);
  if (!rateLimit.success) {
    return actionError("Too many attempts. Please try again in a minute.");
  }

  try {
    const supabase = createSupabaseServiceRoleClient();
    const contactId = await upsertContactByEmail(supabase, {
      email: parsed.data.email,
      locale: parsed.data.locale,
    });

    const { error } = await supabase
      .from("newsletter_subscribers")
      .upsert(
        { contact_id: contactId, segment: parsed.data.segment, status: "subscribed" },
        { onConflict: "contact_id,segment" }
      );

    if (error) throw error;

    await sendSubscriptionConfirmation(parsed.data.email, parsed.data.locale, parsed.data.segment);

    return actionSuccess();
  } catch (err) {
    console.error("subscribeToNewsletter failed", err);
    return actionError("We could not process your subscription. Please try again.");
  }
}
