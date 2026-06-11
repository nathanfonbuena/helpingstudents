/**
 * GET /api/admin/users
 *
 * Lists or searches users for admin management.
 * - No `q` (or `q` shorter than 2 chars): returns the current admins.
 * - `q` (>= 2 chars): searches users by email or name.
 *
 * Access is restricted to admin users (User.isAdmin).
 */

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin";

const USER_SELECT = {
  id: true,
  email: true,
  name: true,
  role: true,
  isAdmin: true
} as const;

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await isAdmin(session.user.id))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("q") ?? "").trim();

  if (query.length < 2) {
    const admins = await prisma.user.findMany({
      where: { isAdmin: true },
      select: USER_SELECT,
      orderBy: { email: "asc" },
      take: 50
    });

    return NextResponse.json({ users: admins });
  }

  const users = await prisma.user.findMany({
    where: {
      OR: [
        { email: { contains: query, mode: "insensitive" } },
        { name: { contains: query, mode: "insensitive" } }
      ]
    },
    select: USER_SELECT,
    orderBy: { email: "asc" },
    take: 10
  });

  return NextResponse.json({ users });
}
