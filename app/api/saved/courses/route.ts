import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { courseId } = (await request.json()) as { courseId?: string };

  if (!courseId) {
    return NextResponse.json({ error: "Missing course id." }, { status: 400 });
  }

  await prisma.savedCourse.upsert({
    where: {
      userId_courseId: { userId, courseId }
    },
    update: {},
    create: { userId, courseId }
  });

  return NextResponse.json({ saved: true });
}

export async function DELETE(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { courseId } = (await request.json()) as { courseId?: string };

  if (!courseId) {
    return NextResponse.json({ error: "Missing course id." }, { status: 400 });
  }

  await prisma.savedCourse.deleteMany({
    where: { userId, courseId }
  });

  return NextResponse.json({ saved: false });
}
