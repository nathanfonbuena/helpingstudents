/**
 * GET /api/admin/moderation
 *
 * Returns all professor replies that are pending moderation.
 * Access is restricted to admin users (for now: any user whose email is in
 * the ADMIN_EMAILS env variable, comma-separated).
 */

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

function isAdmin(email: string): boolean {
  const adminEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase());
  return adminEmails.includes(email.toLowerCase());
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") ?? "PENDING";

  const responses = await prisma.reviewResponse.findMany({
    where: { status: status as "PENDING" | "APPROVED" | "REJECTED" },
    include: {
      professor: { select: { id: true, name: true, email: true } },
      review: { select: { id: true, body: true, rating: true, createdAt: true } }
    },
    orderBy: { createdAt: "asc" }
  });

  return NextResponse.json({ responses });
}
