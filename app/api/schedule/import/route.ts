import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "Missing CSV file." }, { status: 400 });
  }

  const text = await file.text();
  const rows = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (rows.length === 0) {
    return NextResponse.json({ error: "CSV file is empty." }, { status: 400 });
  }

  const userSchool = await prisma.userSchool.findFirst({
    where: { userId, role: "STUDENT" },
    select: { schoolId: true }
  });

  const schoolId = userSchool?.schoolId ?? null;

  let added = 0;

  for (const row of rows) {
    const [courseNumberRaw, termRaw, meetingRaw] = row.split(",").map((value) => value.trim());
    if (!courseNumberRaw) continue;

    const course = await prisma.course.findFirst({
      where: {
        courseNumber: courseNumberRaw,
        ...(schoolId ? { schoolId } : {})
      }
    });

    if (!course) continue;

    try {
      await prisma.scheduleEntry.create({
        data: {
          userId,
          courseId: course.id,
          term: termRaw || null,
          meetingTimes: meetingRaw || null
        }
      });
      added += 1;
    } catch {
      // Ignore duplicates
    }
  }

  return NextResponse.json({ added });
}
