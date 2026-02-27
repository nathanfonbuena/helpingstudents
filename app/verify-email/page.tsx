/**
 * /verify-email
 *
 * Two purposes:
 * 1. GET /verify-email?token=... — called from the verification email link.
 *    Calls the confirm API and shows success/error.
 * 2. GET /verify-email (no token) — shows the VerifyEduEmailForm for students
 *    who want to initiate verification.
 */

import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import Sidebar from "@/app/components/Sidebar";
import VerifyEduEmailForm from "@/app/components/VerifyEduEmailForm";
import Link from "next/link";
import crypto from "crypto";

interface Props {
  searchParams?: { token?: string; renew?: string };
}

async function VerifyResult({ token }: { token: string }) {
  let message = "";
  let isSuccess = false;
  let alreadyVerified = false;

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const record = await prisma.verificationStatus.findFirst({
    where: { tokenHash }
  });

  if (!record) {
    message = "This verification link is invalid or has already been used.";
  } else if (record.status === "VERIFIED") {
    message = "Your email has already been verified.";
    alreadyVerified = true;
    isSuccess = true;
  } else if (record.expiresAt < new Date()) {
    message = "This link has expired. Please request a new verification email from your account settings.";
  } else {
    // Confirm verification
    const now = new Date();
    const newExpiry = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

    await prisma.$transaction([
      prisma.verificationStatus.update({
        where: { id: record.id },
        data: { status: "VERIFIED", verifiedAt: now, expiresAt: newExpiry }
      }),
      prisma.user.update({
        where: { id: record.userId },
        data: { verified: true }
      })
    ]);

    isSuccess = true;
    message = "Your university email has been verified. Your Verified badge will now appear on your reviews.";
  }

  return (
    <div className="verify-page">
      <div className="verify-page__icon">
        {isSuccess ? "✅" : "❌"}
      </div>
      <h1>{isSuccess ? (alreadyVerified ? "Already Verified" : "Email Verified!") : "Verification Failed"}</h1>
      <p>{message}</p>
      <Link href="/dashboard" className="btn btn--primary">
        Go to your dashboard →
      </Link>
    </div>
  );
}

async function VerifyInitiate() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return (
      <div className="verify-page">
        <div className="verify-page__icon">🔒</div>
        <h1>Sign in to verify</h1>
        <p>You need to be logged in to verify your university email.</p>
        <Link href="/login" className="btn btn--primary">Sign in →</Link>
      </div>
    );
  }

  const existing = await prisma.verificationStatus.findUnique({
    where: { userId },
    select: { status: true }
  });

  if (existing?.status === "VERIFIED") {
    return (
      <div className="verify-page">
        <div className="verify-page__icon">✅</div>
        <h1>Already Verified</h1>
        <p>Your university email is verified and your Verified badge is active.</p>
        <Link href="/dashboard" className="btn btn--primary">Back to dashboard →</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 560, margin: "60px auto", padding: "0 24px" }}>
      <VerifyEduEmailForm hasExistingPending={existing?.status === "PENDING"} />
    </div>
  );
}

export default async function VerifyEmailPage({ searchParams }: Props) {
  const token = searchParams?.token;

  return (
    <div className="home-shell">
      <Sidebar />
      <main style={{ padding: "48px 40px" }}>
        <Suspense fallback={<p>Loading…</p>}>
          {token ? <VerifyResult token={token} /> : <VerifyInitiate />}
        </Suspense>
      </main>
    </div>
  );
}
