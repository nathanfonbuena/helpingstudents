import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { vote } = (await request.json()) as { vote?: "up" | "down" };
  if (vote !== "up" && vote !== "down") {
    return NextResponse.json({ error: "Invalid vote" }, { status: 400 });
  }

  const voteType = vote === "up" ? "UP" : "DOWN";
  const updated = await prisma.$transaction(async (tx) => {
    const existingVote = await tx.schoolReviewVote.findUnique({
      where: {
        reviewId_userId: {
          reviewId: params.id,
          userId
        }
      }
    });

    if (existingVote && existingVote.vote === voteType) {
      const review = await tx.schoolReview.findUnique({
        where: { id: params.id },
        select: { helpfulUp: true, helpfulDown: true }
      });
      return {
        helpfulUp: review?.helpfulUp ?? 0,
        helpfulDown: review?.helpfulDown ?? 0,
        currentVote: existingVote.vote
      };
    }

    const increments = voteType === "UP" ? { helpfulUp: { increment: 1 } } : { helpfulDown: { increment: 1 } };
    const decrements =
      existingVote?.vote === "UP"
        ? { helpfulUp: { decrement: 1 } }
        : existingVote?.vote === "DOWN"
          ? { helpfulDown: { decrement: 1 } }
          : {};

    const review = await tx.schoolReview.update({
      where: { id: params.id },
      data: { ...increments, ...decrements },
      select: { helpfulUp: true, helpfulDown: true }
    });

    if (existingVote) {
      await tx.schoolReviewVote.update({
        where: { id: existingVote.id },
        data: { vote: voteType }
      });
    } else {
      await tx.schoolReviewVote.create({
        data: { reviewId: params.id, userId, vote: voteType }
      });
    }

    return { ...review, currentVote: voteType };
  });

  return NextResponse.json(updated);
}
