import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    courseId?: string;
    manualCourseName?: string;
    manualCourseNumber?: string;
    term?: string;
    meetingTimes?: string;
  };

  const { courseId, manualCourseName, manualCourseNumber, term, meetingTimes } = body;

  let finalCourseId = courseId;

  // If no courseId provided, check for manual entry
  if (!finalCourseId) {
    if (!manualCourseName?.trim() || !manualCourseNumber?.trim()) {
      return NextResponse.json({ error: "Course is required." }, { status: 400 });
    }

    // Get user's school (if any) for the manual course
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        schools: {
          select: { schoolId: true },
          take: 1
        }
      }
    });

    const userSchoolId = user?.schools[0]?.schoolId;

    // User must have a school to create a manual course
    if (!userSchoolId) {
      return NextResponse.json(
        { error: "Please add a school to your profile before creating courses." },
        { status: 400 }
      );
    }

    const courseNumber = manualCourseNumber.trim().toUpperCase();
    const courseName = manualCourseName.trim();

    // Check if course already exists (by course number and school)
    const existingCourse = await prisma.course.findFirst({
      where: {
        courseNumber,
        schoolId: userSchoolId
      }
    });

    if (existingCourse) {
      finalCourseId = existingCourse.id;
    } else {
      // Create new course - track who created it
      const newCourse = await prisma.course.create({
        data: {
          courseNumber,
          name: courseName,
          schoolId: userSchoolId,
          createdById: userId
        }
      });
      finalCourseId = newCourse.id;
    }
  }

  const entry = await prisma.scheduleEntry.create({
    data: {
      userId,
      courseId: finalCourseId,
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
