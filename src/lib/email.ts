import { siteUrl } from "@/lib/env";

/**
 * Transactional email.
 *
 * With no RESEND_API_KEY the message is printed to the server console instead
 * of sent, and the link is right there to click. The whole sign-up and reset
 * flow is therefore testable before anyone has signed up for Resend, which is
 * the difference between a volunteer trying it on a Saturday and giving up.
 */
type Message = { to: string; subject: string; text: string };

async function deliver(message: Message): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "NiMechE-SF <onboarding@resend.dev>";

  if (!apiKey) {
    console.info(
      [
        "",
        "─".repeat(72),
        "  EMAIL NOT SENT - no RESEND_API_KEY. It would have said:",
        `  To:      ${message.to}`,
        `  Subject: ${message.subject}`,
        "",
        message.text.replace(/^/gm, "  "),
        "─".repeat(72),
        "",
      ].join("\n")
    );
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: message.to,
      subject: message.subject,
      text: message.text,
    }),
  });

  if (!response.ok) {
    // Thrown rather than swallowed: a certificate email in spam is a support
    // ticket, and one that never left is worse (dev plan section 3.1).
    throw new Error(`Resend refused the message: ${response.status}`);
  }
}

export function sendVerificationEmail(to: string, name: string, token: string) {
  const link = siteUrl(`/verify-email?token=${encodeURIComponent(token)}`);
  return deliver({
    to,
    subject: "Confirm your NiMechE-SF account",
    text: [
      `Hello ${name},`,
      "",
      "Open this link to confirm your address and finish signing up:",
      link,
      "",
      "It works for 24 hours. If you did not sign up, ignore this - nothing",
      "happens until the link is opened.",
      "",
      "NiMechE-SF, Tech-U",
    ].join("\n"),
  });
}

export function sendPasswordResetEmail(to: string, name: string, token: string) {
  const link = siteUrl(`/reset-password?token=${encodeURIComponent(token)}`);
  return deliver({
    to,
    subject: "Set a new NiMechE-SF password",
    text: [
      `Hello ${name},`,
      "",
      "Open this link to set a new password:",
      link,
      "",
      "It works for 60 minutes and once only. If you did not ask for it,",
      "ignore this - your password has not changed.",
      "",
      "NiMechE-SF, Tech-U",
    ].join("\n"),
  });
}
