"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { sendNewsletterCampaign, type SendCampaignResult } from "@/lib/actions/founder-newsletter";
import type { AppLocale } from "@/lib/i18n/config";

const SEGMENT_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "All active subscribers" },
  { value: "enterprise_ai_governance", label: "Enterprise / AI governance" },
  { value: "quantum", label: "Post-quantum" },
  { value: "students", label: "Students" },
  { value: "certification", label: "Certification" },
  { value: "cyber_intelligence_brief", label: "CyberAbeer Cyber Brief" },
];

/**
 * Compose + send UI for the Founder Newsletter page. A two-click send
 * (Review -> Confirm) rather than a browser confirm() dialog, so the
 * recipient count is visible and styled consistently with the rest of
 * the founder dashboard before anything actually goes out.
 */
export function NewsletterComposeForm({
  locale,
  subscriberCounts,
}: {
  locale: AppLocale;
  subscriberCounts: Record<string, number>;
}) {
  const [segment, setSegment] = React.useState("all");
  const [subject, setSubject] = React.useState("");
  const [body, setBody] = React.useState("");
  const [confirming, setConfirming] = React.useState(false);
  const [status, setStatus] = React.useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = React.useState<string | null>(null);

  const recipientCount = subscriberCounts[segment] ?? 0;

  function resetConfirmation() {
    setConfirming(false);
    setMessage(null);
  }

  async function handleSubmit(formData: FormData) {
    if (!confirming) {
      setConfirming(true);
      return;
    }

    setStatus("loading");
    setMessage(null);

    const result = await sendNewsletterCampaign(locale, formData);

    if (result.status === "success" && result.data) {
      const data: SendCampaignResult = result.data;
      setStatus("success");
      setConfirming(false);
      if (data.notConfigured) {
        setMessage(
          `Logged, but no emails actually went out: RESEND_API_KEY isn't set in Vercel yet. ${data.recipientCount} subscriber(s) were queued and will need a real send once it's configured.`
        );
      } else {
        setMessage(`Sent to ${data.sentCount} of ${data.recipientCount} subscriber(s).`);
      }
      setSubject("");
      setBody("");
    } else if (result.status === "error") {
      setStatus("error");
      setConfirming(false);
      setMessage(result.message);
    }
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-4">
      <div>
        <Label htmlFor="campaign-segment">Audience</Label>
        <select
          id="campaign-segment"
          name="segment"
          value={segment}
          onChange={(e) => {
            setSegment(e.target.value);
            resetConfirmation();
          }}
          className="mt-1 flex h-10 w-full rounded-control border border-border-strong bg-surface px-3 py-2 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2"
        >
          {SEGMENT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label} ({subscriberCounts[opt.value] ?? 0})
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="campaign-subject">Subject</Label>
        <Input
          id="campaign-subject"
          name="subject"
          required
          value={subject}
          onChange={(e) => {
            setSubject(e.target.value);
            resetConfirmation();
          }}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="campaign-body">Message</Label>
        <Textarea
          id="campaign-body"
          name="body"
          required
          rows={10}
          value={body}
          onChange={(e) => {
            setBody(e.target.value);
            resetConfirmation();
          }}
          className="mt-1"
          placeholder="Write in plain text -- a blank line starts a new paragraph."
        />
      </div>

      {message && (
        <p className={`text-sm ${status === "error" ? "text-danger-600" : "text-text-secondary"}`}>{message}</p>
      )}

      {confirming ? (
        <div className="flex flex-wrap items-center gap-3 rounded-card border border-border bg-surface-raised p-4">
          <p className="text-sm text-text-primary">
            Send to <strong>{recipientCount}</strong> subscriber{recipientCount === 1 ? "" : "s"}? This can't be
            undone.
          </p>
          <div className="flex gap-2">
            <Button type="submit" size="sm" variant="primary" loading={status === "loading"}>
              Confirm &amp; send
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={resetConfirmation}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button type="submit" className="self-start" disabled={recipientCount === 0}>
          {recipientCount === 0 ? "Review & send (no subscribers in this segment)" : "Review & send"}
        </Button>
      )}
    </form>
  );
}
