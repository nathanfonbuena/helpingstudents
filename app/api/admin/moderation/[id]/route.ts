/**
 * PATCH /api/admin/moderation/[id]
 *
 * Approve or reject a professor reply by its ReviewResponse id.
 * On approval the reply becomes visible to students on the professor page.
 */

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendReplyApprovedEmail } from "@/lib/email";

function isAdmin(email: string): boolean {
  const adminEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase());
  return adminEmails.includes(email.toLowerCase());
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.email || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await request.json()) as { action?: "approve" | "reject" };

  if (!body.action || !["approve", "reject"].includes(body.action)) {
    return NextResponse.json({ error: "action must be 'approve' or 'reject'" }, { status: 400 });
  }

  const response = await prisma.reviewResponse.findUnique({
    where: { id: params.id },
    include: {
      professor: { select: { email: true, name: true } },
      review: { select: { body: true } }
    }
  });

  if (!response) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const newStatus = body.action === "approve" ? "APPROVED" : "REJECTED";

  await prisma.reviewResponse.update({
    where: { id: params.id },
    data: { status: newStatus }
  });

  // Notify the professor when their reply goes live
  if (body.action === "approve") {
    await sendReplyApprovedEmail(
      response.professor.email,
      response.professor.name ?? "Professor",
      response.review.body
    );
  }

  return NextResponse.json({ id: params.id, status: newStatus });
}
