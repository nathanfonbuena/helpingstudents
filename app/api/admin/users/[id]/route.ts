/**
 * PATCH /api/admin/users/[id]
 *
 * Grants or revokes admin access for a user by id.
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

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!(await isAdmin(session.user.id))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await request.json()) as { isAdmin?: boolean };

  if (typeof body.isAdmin !== "boolean") {
    return NextResponse.json({ error: "isAdmin must be a boolean" }, { status: 400 });
  }

  // Prevent an admin from removing their own access - this would otherwise
  // make it possible to lock everyone out of /admin/* routes.
  if (params.id === session.user.id && !body.isAdmin) {
    return NextResponse.json(
      { error: "You cannot remove your own admin access" },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: { id: true }
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const updated = await prisma.user.update({
    where: { id: params.id },
    data: { isAdmin: body.isAdmin },
    select: USER_SELECT
  });

  return NextResponse.json({ user: updated });
}
