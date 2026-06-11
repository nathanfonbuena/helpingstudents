/**
 * /admin/moderation
 *
 * Admin page to review pending professor replies before they go live.
 * Access restricted to admin users (User.isAdmin).
 */

import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin";
import Sidebar from "@/app/components/Sidebar";
import ModerationQueue from "@/app/components/admin/ModerationQueue";

export default async function ModerationPage() {
  const session = await auth();

  if (!(await isAdmin(session?.user?.id))) {
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
        <nav className="admin-nav" aria-label="Admin">
          <Link href="/admin/moderation">Moderation Queue</Link>
          <Link href="/admin/users">User Management</Link>
        </nav>

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
