import { prisma } from "@/lib/prisma";

/**
 * Admin access control.
 *
 * Admin status lives on User.isAdmin and is checked against the database on
 * every call, so revoking admin access takes effect immediately (no
 * session/JWT caching).
 *
 * Used to gate access to /api/admin/* routes and /admin/* pages.
 */
export async function isAdmin(userId: string | null | undefined): Promise<boolean> {
  if (!userId) return false;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isAdmin: true }
  });

  return user?.isAdmin ?? false;
}
