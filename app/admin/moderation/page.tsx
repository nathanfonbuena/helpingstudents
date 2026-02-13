/**
 * /admin/moderation
 *
 * Admin page to review pending professor replies before they go live.
 * Access restricted to emails listed in ADMIN_EMAILS env variable.
 */

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/app/components/Sidebar";
import ModerationQueue from "@/app/components/admin/ModerationQueue";

function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  const adminEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase());
  return adminEmails.includes(email.toLowerCase());
}

export default async function ModerationPage() {
  const session = await auth();

  if (!isAdmin(session?.user?.email)) {
    redirect("/");
  }

  const pending = await prisma.reviewResponse.findMany({
    where: { status: "PENDING" },
    include: {
      professor: { select: { id: true, name: true, email: true } },
      review: { select: { id: true, body: true, rating: true, createdAt: true } }
    },
    orderBy: { createdAt: "asc" }
  });

  return (
    <div className="home-shell">
      <Sidebar />
      <main className="moderation-page">
        <h1>Moderation Queue</h1>
        <p style={{ color: "var(--ink-500)", marginTop: 4, marginBottom: 0, fontSize: "0.92rem" }}>
          Review professor replies before they go live. Replies are shown to students
          only after approval.
        </p>

        <ModerationQueue
          initialItems={pending.map((item) => ({
            id: item.id,
            replyBody: item.body,
            professorName: item.professor.name ?? "Unknown Professor",
            reviewBody: item.review.body,
            reviewRating: item.review.rating,
            reviewDate: item.review.createdAt,
            submittedAt: item.createdAt
          }))}
        />
      </main>
    </div>
  );
}
