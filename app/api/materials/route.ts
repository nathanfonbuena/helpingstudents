import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, content, professorId, courseId, term, status } = (await request.json()) as {
    title?: string;
    content?: string;
    professorId?: string;
    courseId?: string;
    term?: string;
    status?: "DRAFT" | "PENDING" | "APPROVED";
  };

  if (!title?.trim()) {
    return NextResponse.json({ error: "Title is required." }, { status: 400 });
  }

  if (!content?.trim()) {
    return NextResponse.json({ error: "Content is required." }, { status: 400 });
  }

  if (!professorId) {
    return NextResponse.json({ error: "Professor is required." }, { status: 400 });
  }

  if (title.trim().length > 120) {
    return NextResponse.json({ error: "Title must be 120 characters or less." }, { status: 400 });
  }

  if (content.trim().length > 5000) {
    return NextResponse.json({ error: "Content must be 5000 characters or less." }, { status: 400 });
  }

  const material = await prisma.material.create({
    data: {
      title: title.trim(),
      content: content.trim(),
      professorId,
      uploaderId: userId,
      courseId: courseId || null,
      term: term?.trim() || null,
      status: status === "DRAFT" ? "DRAFT" : "PENDING"
    }
  });

  await prisma.notification.create({
    data: {
      userId,
      message: "Your material was uploaded and is awaiting approval."
    }
  });

  const followers = await prisma.userFollow.findMany({
    where: { followingId: professorId },
    select: { followerId: true }
  });

  if (followers.length > 0) {
    await prisma.notification.createMany({
      data: followers.map((follower) => ({
        userId: follower.followerId,
        message: "New material was posted for a professor you follow."
      }))
    });
  }

  return NextResponse.json({ id: material.id });
}
