/**
 * /admin/users
 *
 * Admin page to grant or revoke admin access for other users.
 * Access restricted to admin users (User.isAdmin).
 */

import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin";
import Sidebar from "@/app/components/Sidebar";
import AdminUsersPanel from "@/app/components/admin/AdminUsersPanel";

export default async function AdminUsersPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId || !(await isAdmin(userId))) {
    redirect("/");
  }

  const admins = await prisma.user.findMany({
    where: { isAdmin: true },
    select: { id: true, email: true, name: true, role: true, isAdmin: true },
    orderBy: { email: "asc" },
    take: 50
  });

  return (
    <div className="home-shell">
      <Sidebar />
      <main className="moderation-page">
        <nav className="admin-nav" aria-label="Admin">
          <Link href="/admin/moderation">Moderation Queue</Link>
          <Link href="/admin/users">User Management</Link>
        </nav>

        <h1>User Management</h1>
        <p style={{ color: "var(--ink-500)", marginTop: 4, marginBottom: 0, fontSize: "0.92rem" }}>
          Search for a user to grant admin access, or revoke access from an existing admin.
        </p>

        <AdminUsersPanel initialAdmins={admins} currentUserId={userId} />
      </main>
    </div>
  );
}
