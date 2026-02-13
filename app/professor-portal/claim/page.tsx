/**
 * /professor-portal/claim?token=<rawToken>
 *
 * Landing page for the professor profile-claim email link.
 * Verifies the token server-side, marks the ProfessorProfile as claimed,
 * and redirects to the portal.
 *
 * The confirmation logic must live here (not only in the API route) because
 * sendProfessorClaimEmail() points links at this page URL, not at
 * /api/professor/claim.
 */

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Sidebar from "@/app/components/Sidebar";

interface Props {
  searchParams?: { token?: string };
}

export default async function ProfessorClaimPage({ searchParams }: Props) {
  const rawToken = searchParams?.token;

  if (!rawToken) {
    return (
      <div className="home-shell">
        <Sidebar />
        <main style={{ padding: "48px 40px" }}>
          <div className="verify-page">
            <div className="verify-page__icon">❌</div>
            <h1>Invalid link</h1>
            <p>This claim link is missing a token. Please use the link from your email.</p>
            <Link href="/professor-portal" className="btn btn--primary">
              Go to portal →
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const vtRecord = await prisma.verificationToken.findUnique({
    where: { token: rawToken }
  });

  if (!vtRecord) {
    return (
      <div className="home-shell">
        <Sidebar />
        <main style={{ padding: "48px 40px" }}>
          <div className="verify-page">
            <div className="verify-page__icon">❌</div>
            <h1>Link not found</h1>
            <p>
              This claim link is invalid or has already been used. If you already claimed your
              profile, head to the portal.
            </p>
            <Link href="/professor-portal" className="btn btn--primary">
              Go to portal →
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (vtRecord.expires < new Date()) {
    // Clean up the expired token
    await prisma.verificationToken.delete({ where: { token: rawToken } }).catch(() => null);

    return (
      <div className="home-shell">
        <Sidebar />
        <main style={{ padding: "48px 40px" }}>
          <div className="verify-page">
            <div className="verify-page__icon">⏰</div>
            <h1>Link expired</h1>
            <p>
              This claim link has expired (links are valid for 48 hours). Please return to your
              portal and request a new one.
            </p>
            <Link href="/professor-portal" className="btn btn--primary">
              Request a new link →
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // identifier format: "prof-claim:<userId>"
  const userId = vtRecord.identifier.replace("prof-claim:", "");

  await prisma.$transaction([
    prisma.professorProfile.update({
      where: { professorId: userId },
      data: {
        isClaimed: true,
        claimMethod: "EMAIL",
        claimedAt: new Date()
      }
    }),
    prisma.verificationToken.delete({ where: { token: rawToken } })
  ]);

  // Success — send them straight to the portal
  redirect("/professor-portal");
}
