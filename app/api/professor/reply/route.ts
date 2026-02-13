/**
 * POST /api/professor/reply
 *
 * Professor submits an official reply to a student review.
 * Reply is stored with status=PENDING and goes through a moderation queue
 * before becoming visible to students.
 *
 * FERPA: The reply body is visible publicly once approved. Professors never
 * receive information about the student's real identity through this flow.
 */

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      role: true,
      claimedProfessorId: true,
      professorProfile: { select: { isClaimed: true } }
    }
  });

  if (user?.role !== "PROFESSOR") {
    return NextResponse.json({ error: "Only professors can reply to reviews" }, { status: 403 });
  }

  const effectiveProfessorId = user.claimedProfessorId ?? userId;

  // isClaimed check: look at the effective professor's profile
  const effectiveProfile = user.claimedProfessorId
    ? await prisma.professorProfile.findUnique({
        where: { professorId: user.claimedProfessorId },
        select: { isClaimed: true }
      })
    : user.professorProfile;

  if (!effectiveProfile?.isClaimed) {
    return NextResponse.json(
      { error: "You must claim your profile before replying to reviews" },
      { status: 403 }
    );
  }

  const body = (await request.json()) as { reviewId?: string; replyBody?: string };

  if (!body.reviewId || !body.replyBody?.trim()) {
    return NextResponse.json({ error: "reviewId and replyBody are required" }, { status: 400 });
  }

  // Verify the review belongs to the effective professor
  const review = await prisma.review.findUnique({
    where: { id: body.reviewId },
    select: { professorId: true, response: { select: { status: true } } }
  });

  if (!review || review.professorId !== effectiveProfessorId) {
    return NextResponse.json(
      { error: "Review not found or not associated with your profile" },
      { status: 404 }
    );
  }

  if (review.response) {
    return NextResponse.json(
      { error: "A reply already exists for this review" },
      { status: 409 }
    );
  }

  const MAX_LENGTH = 1000;
  const trimmedBody = body.replyBody.trim().slice(0, MAX_LENGTH);

  const response = await prisma.reviewResponse.create({
    data: {
      reviewId: body.reviewId,
      professorId: effectiveProfessorId,
      body: trimmedBody,
      status: "PENDING" // awaits moderation
    }
  });

  return NextResponse.json({
    response: { id: response.id, status: response.status },
    message: "Reply submitted and pending moderation review"
  });
}
