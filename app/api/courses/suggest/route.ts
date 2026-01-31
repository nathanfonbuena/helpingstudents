import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("q") ?? "").trim();
  const schoolId = searchParams.get("schoolId") ?? "";
  const departmentId = searchParams.get("departmentId") ?? "";

  if (query.length < 2) {
    return NextResponse.json({ courses: [] });
  }

  const courses = await prisma.course.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { courseNumber: { contains: query, mode: "insensitive" } }
      ],
      ...(schoolId ? { schoolId } : {}),
      ...(departmentId ? { departmentId } : {})
    },
    select: {
      id: true,
      name: true,
      courseNumber: true,
      description: true,
      credits: true,
      professor: { select: { id: true, name: true } },
      school: { select: { id: true, name: true, slug: true } },
      department: { select: { id: true, name: true, code: true } }
    },
    take: 10,
    orderBy: { courseNumber: "asc" }
  });

  return NextResponse.json({
    courses: courses.map((course) => ({
      id: course.id,
      name: course.name,
      courseNumber: course.courseNumber,
      description: course.description,
      credits: course.credits,
      professor: course.professor,
      school: course.school,
      department: course.department
    }))
  });
}
