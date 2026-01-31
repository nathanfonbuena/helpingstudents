import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { courseId, term, meetingTimes } = (await request.json()) as {
    courseId?: string;
    term?: string;
    meetingTimes?: string;
  };

  if (!courseId) {
    return NextResponse.json({ error: "Course is required." }, { status: 400 });
  }

  const entry = await prisma.scheduleEntry.create({
    data: {
      userId,
      courseId,
      term: term?.trim() || null,
      meetingTimes: meetingTimes?.trim() || null
    }
  });

  return NextResponse.json({ id: entry.id });
}

export async function DELETE(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { entryId } = (await request.json()) as { entryId?: string };

  if (!entryId) {
    return NextResponse.json({ error: "Missing entry id." }, { status: 400 });
  }

  await prisma.scheduleEntry.deleteMany({
    where: { id: entryId, userId }
  });

  return NextResponse.json({ ok: true });
}
