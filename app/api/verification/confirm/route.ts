/**
 * GET /api/verification/confirm?token=<rawToken>
 *
 * Validates the token from the email link, marks the student as VERIFIED,
 * and sets user.verified = true.
 *
 * FERPA: The raw token is hashed before lookup. If matched and unexpired,
 * the VerificationStatus row is updated to VERIFIED. The eduEmail is never
 * returned to the client or exposed in the session.
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

const VERIFICATION_LIFETIME_DAYS = 365;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawToken = searchParams.get("token");

  if (!rawToken) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

  const record = await prisma.verificationStatus.findFirst({
    where: { tokenHash }
  });

  if (!record) {
    return NextResponse.json(
      { error: "Invalid or already-used verification link" },
      { status: 400 }
    );
  }

  if (record.status === "VERIFIED") {
    return NextResponse.json({ message: "Already verified", alreadyVerified: true });
  }

  if (record.expiresAt < new Date()) {
    return NextResponse.json(
      { error: "This verification link has expired. Please request a new one." },
      { status: 410 }
    );
  }

  const now = new Date();
  const newExpiry = new Date(now.getTime() + VERIFICATION_LIFETIME_DAYS * 24 * 60 * 60 * 1000);

  // Atomically mark as verified and set user.verified = true
  await prisma.$transaction([
    prisma.verificationStatus.update({
      where: { id: record.id },
      data: {
        status: "VERIFIED",
        verifiedAt: now,
        expiresAt: newExpiry
      }
    }),
    prisma.user.update({
      where: { id: record.userId },
      data: { verified: true }
    })
  ]);

  return NextResponse.json({ message: "Email verified successfully", verified: true });
}
