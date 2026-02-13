/**
 * GET /api/cron/re-verify
 *
 * Periodic job (recommended: weekly) that:
 * 1. Marks VERIFIED records that have passed expiresAt as EXPIRED.
 * 2. Sends renewal emails to students whose verification expires within 30 days.
 * 3. Strips the verified=true flag from users whose verification has fully expired.
 *
 * Schedule: "0 4 * * 0"  (every Sunday at 04:00 UTC)
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendReVerificationEmail } from "@/lib/email";
import crypto from "crypto";

const DAYS_BEFORE_EXPIRY_TO_WARN = 30;
const RENEWAL_TTL_MS = 24 * 60 * 60 * 1000;

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const warnCutoff = new Date(now.getTime() + DAYS_BEFORE_EXPIRY_TO_WARN * 24 * 60 * 60 * 1000);

  // 1. Expire overdue records and revoke verified flag
  const expiredRecords = await prisma.verificationStatus.findMany({
    where: { status: "VERIFIED", expiresAt: { lt: now } }
  });

  let expired = 0;
  for (const record of expiredRecords) {
    await prisma.$transaction([
      prisma.verificationStatus.update({
        where: { id: record.id },
        data: { status: "EXPIRED" }
      }),
      prisma.user.update({
        where: { id: record.userId },
        data: { verified: false }
      })
    ]);
    expired++;
  }

  // 2. Send renewal reminders for records expiring soon
  const expiringSoon = await prisma.verificationStatus.findMany({
    where: {
      status: "VERIFIED",
      expiresAt: { gt: now, lt: warnCutoff }
    },
    include: { user: { select: { email: true } } }
  });

  let reminded = 0;
  for (const record of expiringSoon) {
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

    // Issue a fresh PENDING renewal token
    await prisma.verificationStatus.update({
      where: { id: record.id },
      data: {
        tokenHash,
        status: "PENDING",
        expiresAt: new Date(now.getTime() + RENEWAL_TTL_MS)
      }
    });

    await sendReVerificationEmail(record.user.email, rawToken);
    reminded++;
  }

  return NextResponse.json({ expired, reminded });
}
