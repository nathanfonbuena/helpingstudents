import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const courseId = params.id;

  // Check if course exists and user is the creator
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true, createdById: true, schoolId: true }
  });

  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  if (course.createdById !== userId) {
    return NextResponse.json(
      { error: "You can only edit courses you created" },
      { status: 403 }
    );
  }

  const body = (await request.json()) as {
    professorId?: string | null;
    name?: string;
    courseNumber?: string;
  };

  const updateData: Record<string, unknown> = {};

  if (body.professorId !== undefined) {
    // If setting a professor, verify they exist and are at the same school
    if (body.professorId) {
      const professor = await prisma.user.findFirst({
        where: {
          id: body.professorId,
          role: "PROFESSOR",
          schools: {
            some: { schoolId: course.schoolId }
          }
        }
      });

      if (!professor) {
        return NextResponse.json(
          { error: "Professor not found at this school" },
          { status: 400 }
        );
      }
    }
    updateData.professorId = body.professorId;
  }

  if (body.name?.trim()) {
    updateData.name = body.name.trim();
  }

  if (body.courseNumber?.trim()) {
    updateData.courseNumber = body.courseNumber.trim().toUpperCase();
  }

  const updatedCourse = await prisma.course.update({
    where: { id: courseId },
    data: updateData,
    select: {
      id: true,
      name: true,
      courseNumber: true,
      professor: {
        select: { id: true, name: true }
      }
    }
  });

  return NextResponse.json({ course: updatedCourse });
}
