/**
 * POST /api/professor/course-metadata
 *
 * Professor sets metadata for one of their courses:
 * tags (e.g. "Lab-based"), grade distribution, class size.
 */

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const VALID_TAGS = [
  "Lab-based", "Writing Intensive", "Discussion-based", "Project-based",
  "Team collaboration", "Lecture-heavy", "Reading-intensive",
  "Flipped classroom", "Practical application", "Research-oriented",
  "Independent study", "STEM-intensive", "Seminar", "Field work",
  "Honors", "Service learning", "Online", "Hybrid"
];

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, claimedProfessorId: true }
  });

  if (user?.role !== "PROFESSOR") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const effectiveProfessorId = user.claimedProfessorId ?? userId;

  const body = (await request.json()) as {
    courseId?: string;
    tags?: string[];
    gradeDistribution?: Record<string, number>;
    classSize?: number;
  };

  if (!body.courseId) {
    return NextResponse.json({ error: "courseId is required" }, { status: 400 });
  }

  // Verify this professor teaches this course
  const course = await prisma.course.findUnique({
    where: { id: body.courseId },
    select: { professorId: true }
  });

  if (!course || course.professorId !== effectiveProfessorId) {
    return NextResponse.json({ error: "Course not found or not assigned to you" }, { status: 404 });
  }

  // Sanitise tags
  const tags = (body.tags ?? []).filter((t) => VALID_TAGS.includes(t));

  const metadata = await prisma.courseMetadata.upsert({
    where: { courseId: body.courseId },
    update: {
      tags,
      gradeDistribution: body.gradeDistribution ?? undefined,
      classSize: body.classSize ?? undefined,
      professorId: effectiveProfessorId
    },
    create: {
      courseId: body.courseId,
      professorId: effectiveProfessorId,
      tags,
      gradeDistribution: body.gradeDistribution ?? undefined,
      classSize: body.classSize ?? undefined
    }
  });

  return NextResponse.json({ metadata });
}
