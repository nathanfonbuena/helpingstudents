/**
 * Email sending via Resend.
 *
 * All templates live here. If RESEND_API_KEY is not configured, emails are
 * logged to the console so development still works without real credentials.
 */

import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_ADDRESS = process.env.EMAIL_FROM ?? "Knocore <noreply@classrack.dev>";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// ─────────────────────────────────────────────────────────────────────────────
// Student: .edu verification email
// ─────────────────────────────────────────────────────────────────────────────

export async function sendVerificationEmail(
  toEmail: string,
  rawToken: string
): Promise<void> {
  const verifyUrl = `${SITE_URL}/verify-email?token=${rawToken}`;

  if (!resend) {
    console.log(
      `[email] RESEND_API_KEY not set — verification email to ${toEmail}\nURL: ${verifyUrl}`
    );
    return;
  }

  await resend.emails.send({
    from: FROM_ADDRESS,
    to: toEmail,
    subject: "Verify your university email — Knocore",
    html: `
      <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; color: #0f1b15;">
        <h1 style="font-size: 24px; margin-bottom: 8px;">Verify your .edu email</h1>
        <p style="color: #46564c; margin-bottom: 24px;">
          Click the button below to confirm your university email address and earn a
          <strong>Verified</strong> badge on your Knocore reviews.
        </p>
        <a href="${verifyUrl}"
           style="display: inline-block; background: #0f6b48; color: #fff;
                  padding: 12px 28px; border-radius: 999px; text-decoration: none;
                  font-weight: 600; font-size: 15px;">
          Verify my email
        </a>
        <p style="color: #46564c; font-size: 13px; margin-top: 32px;">
          This link expires in 24 hours. If you didn't request this, you can safely ignore this email.
        </p>
        <p style="color: #46564c; font-size: 13px; margin-top: 4px;">
          Note: Your university email is stored securely and is
          <strong>never shared with professors or other users</strong> (FERPA compliant).
        </p>
      </div>
    `
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Student: re-verification reminder (annual renewal)
// ─────────────────────────────────────────────────────────────────────────────

export async function sendReVerificationEmail(
  toEmail: string,
  rawToken: string
): Promise<void> {
  const verifyUrl = `${SITE_URL}/verify-email?token=${rawToken}&renew=1`;

  if (!resend) {
    console.log(
      `[email] RESEND_API_KEY not set — re-verification email to ${toEmail}\nURL: ${verifyUrl}`
    );
    return;
  }

  await resend.emails.send({
    from: FROM_ADDRESS,
    to: toEmail,
    subject: "Renew your Knocore verification",
    html: `
      <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; color: #0f1b15;">
        <h1 style="font-size: 24px; margin-bottom: 8px;">Time to renew your verification</h1>
        <p style="color: #46564c; margin-bottom: 24px;">
          Your Knocore verified badge is expiring soon. Click below to renew your
          enrollment verification and keep the badge on your reviews.
        </p>
        <a href="${verifyUrl}"
           style="display: inline-block; background: #0f6b48; color: #fff;
                  padding: 12px 28px; border-radius: 999px; text-decoration: none;
                  font-weight: 600; font-size: 15px;">
          Renew verification
        </a>
        <p style="color: #46564c; font-size: 13px; margin-top: 32px;">
          This link expires in 24 hours.
        </p>
      </div>
    `
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Professor: profile claim email
// ─────────────────────────────────────────────────────────────────────────────

export async function sendProfessorClaimEmail(
  toEmail: string,
  professorName: string,
  rawToken: string
): Promise<void> {
  const claimUrl = `${SITE_URL}/professor-portal/claim?token=${rawToken}`;

  if (!resend) {
    console.log(
      `[email] RESEND_API_KEY not set — professor claim email to ${toEmail}\nURL: ${claimUrl}`
    );
    return;
  }

  await resend.emails.send({
    from: FROM_ADDRESS,
    to: toEmail,
    subject: "Claim your Knocore professor profile",
    html: `
      <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; color: #0f1b15;">
        <h1 style="font-size: 24px; margin-bottom: 8px;">Claim your professor profile</h1>
        <p style="color: #46564c; margin-bottom: 8px;">Hi ${professorName},</p>
        <p style="color: #46564c; margin-bottom: 24px;">
          You have a professor profile on Knocore. Click below to claim it, add a bio,
          upload your syllabus, and respond to student reviews.
        </p>
        <a href="${claimUrl}"
           style="display: inline-block; background: #0f6b48; color: #fff;
                  padding: 12px 28px; border-radius: 999px; text-decoration: none;
                  font-weight: 600; font-size: 15px;">
          Claim my profile
        </a>
        <p style="color: #46564c; font-size: 13px; margin-top: 32px;">
          This link expires in 48 hours. If you didn't request this, please ignore.
        </p>
      </div>
    `
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Moderation: notify professor when reply is approved
// ─────────────────────────────────────────────────────────────────────────────

export async function sendReplyApprovedEmail(
  toEmail: string,
  professorName: string,
  reviewBody: string
): Promise<void> {
  if (!resend) {
    console.log(`[email] Reply approved notification for ${professorName} (${toEmail})`);
    return;
  }

  await resend.emails.send({
    from: FROM_ADDRESS,
    to: toEmail,
    subject: "Your reply has been approved — Knocore",
    html: `
      <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; color: #0f1b15;">
        <h1 style="font-size: 24px; margin-bottom: 8px;">Your reply is now live</h1>
        <p style="color: #46564c;">Hi ${professorName},</p>
        <p style="color: #46564c; margin-bottom: 16px;">
          Your reply to the following review has been approved and is now visible to students:
        </p>
        <blockquote style="border-left: 3px solid #0f6b48; padding-left: 12px; color: #46564c; font-style: italic;">
          "${reviewBody.slice(0, 200)}${reviewBody.length > 200 ? "…" : ""}"
        </blockquote>
        <p style="color: #46564c; font-size: 13px; margin-top: 24px;">
          Visit your <a href="${SITE_URL}/professor-portal" style="color: #0f6b48;">Professor Portal</a> to manage all replies.
        </p>
      </div>
    `
  });
}
