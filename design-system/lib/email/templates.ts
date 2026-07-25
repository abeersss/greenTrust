import "server-only";
import type { AppLocale } from "@/lib/i18n/config";
import type { GreenTrustAssessmentResult } from "@/lib/assessments/greentrust-free";

/**
 * Minimal, dependency-free HTML email templates. Deliberately plain
 * (no external images/fonts, inline styles only) since transactional
 * email clients strip <style> blocks and remote assets unpredictably;
 * this keeps every email legible regardless of the receiving client.
 * `dir` is set per-locale so Arabic emails render RTL correctly in
 * every mail client, matching the site's own lang/dir handling.
 */

function wrap(locale: AppLocale, bodyHtml: string): string {
    const dir = locale === "ar" ? "rtl" : "ltr";
    return `<!doctype html>
    <html lang="${locale}" dir="${dir}">
      <body style="margin:0;padding:0;background:#f4f5f7;font-family:Arial,Helvetica,sans-serif;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f7;padding:32px 0;">
                <tr>
                        <td align="center">
                                  <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;padding:32px;text-align:${dir === "rtl" ? "right" : "left"};">
                                              <tr><td style="font-size:14px;color:#3f3f46;line-height:1.6;">${bodyHtml}</td></tr>
                                                          <tr><td style="padding-top:24px;font-size:12px;color:#a1a1aa;">CyberAbeer · cyberabeer.com</td></tr>
                                                                    </table>
                                                                            </td>
                                                                                  </tr>
                                                                                      </table>
                                                                                        </body>
                                                                                        </html>`;
}

export function welcomeEmail(locale: AppLocale, name: string): { subject: string; html: string } {
    if (locale === "ar") {
          return {
                  subject: "أهلًا بك في سايبر عبير",
                  html: wrap(
                            locale,
                            `<p>مرحبًا ${name}،</p><p>تم إنشاء حسابك في سايبر عبير بنجاح. يمكنك الآن العودة في أي وقت لمتابعة تحدياتك وتقييمات GreenTrust ونتائجك المحفوظة.</p><p>فريق سايبر عبير</p>`
                          ),
          };
    }
    return {
          subject: "Welcome to CyberAbeer",
          html: wrap(
                  locale,
                  `<p>Hi ${name},</p><p>Your CyberAbeer account has been created. You can come back any time to continue your challenges, GreenTrust assessments, and saved results.</p><p>The CyberAbeer team</p>`
                ),
    };
}

export function enterpriseEnquiryConfirmationEmail(locale: AppLocale, name: string): { subject: string; html: string } {
    if (locale === "ar") {
          return {
                  subject: "استلمنا استفسارك عن GreenTrust",
                  html: wrap(
                            locale,
                            `<p>مرحبًا ${name}،</p><p>شكرًا لتواصلك مع GreenTrust AI. استلمنا استفسارك وسيتواصل معك فريقنا قريبًا.</p><p>فريق سايبر عبير</p>`
                          ),
          };
    }
    return {
          subject: "We received your GreenTrust enquiry",
          html: wrap(
                  locale,
                  `<p>Hi ${name},</p><p>Thanks for reaching out about GreenTrust AI. We've received your enquiry and our team will follow up soon.</p><p>The CyberAbeer team</p>`
                ),
    };
}

const domainNamesEn: Record<string, string> = {
    visibility: "AI Agent Visibility",
    accountability: "Ownership & Accountability",
    identity: "Agent Identity",
    permissions: "Permissions",
    oversight: "Human Oversight",
    monitoring: "Logging & Monitoring",
    lifecycle: "Lifecycle Governance",
    shadowAi: "Shadow AI",
};

const domainNamesAr: Record<string, string> = {
    visibility: "رؤية وكلاء الذكاء الاصطناعي",
    accountability: "الملكية والمساءلة",
    identity: "هوية الوكيل",
    permissions: "الصلاحيات",
    oversight: "الإشراف البشري",
    monitoring: "التسجيل والمراقبة",
    lifecycle: "حوكمة دورة الحياة",
    shadowAi: "الذكاء الاصطناعي الخفي",
};

export function greentrustResultEmail(
    locale: AppLocale,
    result: GreenTrustAssessmentResult
  ): { subject: string; html: string } {
    const names = locale === "ar" ? domainNamesAr : domainNamesEn;
    const rows = Object.entries(result.domainScores)
      .map(([key, score]) => `<tr><td style="padding:4px 0;">${names[key] ?? key}</td><td style="text-align:${locale === "ar" ? "left" : "right"};font-weight:bold;">${score}</td></tr>`)
      .join("");

  if (locale === "ar") {
        return {
                subject: `نتيجتك في GreenTrust: ${result.overallScore}/100`,
                html: wrap(
                          locale,
                          `<p>إليك نتيجتك في تقييم حوكمة وكلاء الذكاء الاصطناعي من GreenTrust:</p>
                                   <p style="font-size:28px;font-weight:bold;margin:16px 0;">${result.overallScore}/100</p>
                                            <table role="presentation" width="100%" style="font-size:13px;">${rows}</table>
                                                     <p style="margin-top:16px;">هذا تقييم ذاتي تعليمي بطريقة تسجيل ثابتة، وليس تدقيقًا معتمدًا.</p>`
                        ),
        };
  }
    return {
          subject: `Your GreenTrust score: ${result.overallScore}/100`,
          html: wrap(
                  locale,
                  `<p>Here is your GreenTrust Agent Governance Assessment result:</p>
                         <p style="font-size:28px;font-weight:bold;margin:16px 0;">${result.overallScore}/100</p>
                                <table role="presentation" width="100%" style="font-size:13px;">${rows}</table>
                                       <p style="margin-top:16px;">This is an educational self-assessment using a fixed scoring method, not a certified audit.</p>`
                ),
    };
}
