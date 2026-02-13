/**
 * POST /api/verification/request
 *
 * Student submits their .edu email to begin the verification flow.
 * A time-limited token is generated, hashed (SHA-256) before storage —
 * the raw token travels only through email (FERPA compliant).
 */

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";
import crypto from "crypto";

const EDU_REGEX = /^[^\s@]+@[^\s@]+\.edu$/i;
const TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { eduEmail?: string };
  const eduEmail = body.eduEmail?.trim().toLowerCase();

  if (!eduEmail || !EDU_REGEX.test(eduEmail)) {
    return NextResponse.json(
      { error: "A valid .edu email address is required" },
      { status: 400 }
    );
  }

  // Check that this .edu address isn't already verified by another account
  const existing = await prisma.verificationStatus.findFirst({
    where: { eduEmail, status: "VERIFIED", userId: { not: userId } }
  });
  if (existing) {
    return NextResponse.json(
      { error: "This .edu email is already associated with another account" },
      { status: 409 }
    );
  }

  // Generate a cryptographically random token
  const rawToken = crypto.randomBytes(32).toString("hex");
  // One-way hash — the raw token is NEVER stored in the database
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

  // Upsert the verification record (replace any prior pending attempt)
  await prisma.verificationStatus.upsert({
    where: { userId },
    update: {
      eduEmail,
      tokenHash,
      status: "PENDING",
      verifiedAt: null,
      expiresAt
    },
    create: {
      userId,
      eduEmail,
      tokenHash,
      status: "PENDING",
      expiresAt
    }
  });

  // Send the verification email (raw token is only in the email, never DB)
  await sendVerificationEmail(eduEmail, rawToken);

  return NextResponse.json({ message: "Verification email sent" });
}
