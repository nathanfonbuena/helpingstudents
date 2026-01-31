import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { followingId } = (await request.json()) as { followingId?: string };

  if (!followingId) {
    return NextResponse.json({ error: "Missing professor id." }, { status: 400 });
  }

  if (followingId === userId) {
    return NextResponse.json({ error: "You cannot follow yourself." }, { status: 400 });
  }

  const existing = await prisma.userFollow.findUnique({
    where: {
      followerId_followingId: {
        followerId: userId,
        followingId
      }
    }
  });

  if (!existing) {
    await prisma.userFollow.create({
      data: {
        followerId: userId,
        followingId
      }
    });
  }

  return NextResponse.json({ following: true });
}

export async function DELETE(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { followingId } = (await request.json()) as { followingId?: string };

  if (!followingId) {
    return NextResponse.json({ error: "Missing professor id." }, { status: 400 });
  }

  await prisma.userFollow.deleteMany({
    where: {
      followerId: userId,
      followingId
    }
  });

  return NextResponse.json({ following: false });
}
