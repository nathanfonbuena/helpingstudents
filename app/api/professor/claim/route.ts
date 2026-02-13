/**
 * POST /api/professor/claim
 *
 * Professor submits their official .edu email to claim their profile.
 * Sends a verification link to the provided address. The professor must
 * be logged in with role=PROFESSOR.
 */

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendProfessorClaimEmail } from "@/lib/email";
import crypto from "crypto";

const EDU_REGEX = /^[^\s@]+@[^\s@]+\.(edu|ac\.[a-z]{2,}|edu\.[a-z]{2,})$/i;
const TOKEN_TTL_MS = 48 * 60 * 60 * 1000; // 48 hours

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, name: true }
  });

  if (user?.role !== "PROFESSOR") {
    return NextResponse.json({ error: "Only professors can claim a profile" }, { status: 403 });
  }

  const body = (await request.json()) as { officialEmail?: string; bio?: string };
  const officialEmail = body.officialEmail?.trim().toLowerCase();

  if (!officialEmail || !EDU_REGEX.test(officialEmail)) {
    return NextResponse.json(
      { error: "A valid institutional email address is required" },
      { status: 400 }
    );
  }

  const rawToken = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

  // Store the raw token directly — VerificationToken is NextAuth's magic-link
  // table and is designed to hold plain tokens, not hashes.
  // Using a delete+create (rather than upsert on identifier_token) so that any
  // previous pending token for this professor is replaced cleanly.
  await prisma.verificationToken.deleteMany({
    where: { identifier: `prof-claim:${userId}` }
  });
  await prisma.verificationToken.create({
    data: {
      identifier: `prof-claim:${userId}`,
      token: rawToken,
      expires: expiresAt
    }
  });

  // Upsert a stub ProfessorProfile if one doesn't exist yet
  await prisma.professorProfile.upsert({
    where: { professorId: userId },
    update: { officialEmail },
    create: { professorId: userId, officialEmail, isClaimed: false }
  });

  await sendProfessorClaimEmail(officialEmail, user.name ?? "Professor", rawToken);

  return NextResponse.json({ message: "Claim email sent to your institutional address" });
}

/**
 * GET /api/professor/claim?token=<rawToken>
 *
 * Finalises the profile claim after the professor clicks the email link.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawToken = searchParams.get("token");
  const bio = searchParams.get("bio") ?? undefined;

  if (!rawToken) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const vtRecord = await prisma.verificationToken.findUnique({
    where: { token: rawToken }
  });

  if (!vtRecord) {
    return NextResponse.json(
      { error: "Invalid or expired claim link" },
      { status: 400 }
    );
  }

  if (vtRecord.expires < new Date()) {
    return NextResponse.json({ error: "Claim link has expired" }, { status: 410 });
  }

  // identifier format: "prof-claim:<userId>"
  const userId = vtRecord.identifier.replace("prof-claim:", "");

  await prisma.$transaction([
    prisma.professorProfile.update({
      where: { professorId: userId },
      data: {
        isClaimed: true,
        claimMethod: "EMAIL",
        claimedAt: new Date(),
        bio: bio ?? undefined
      }
    }),
    // Consume the token
    prisma.verificationToken.delete({ where: { token: rawToken } })
  ]);

  return NextResponse.json({ message: "Profile claimed successfully", claimed: true });
}
