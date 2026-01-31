import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { searchParams } = new URL(request.url);
  const departmentId = searchParams.get("departmentId") ?? "";
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "50", 10), 100);
  const skip = (page - 1) * limit;

  const schoolId = params.id;

  // Verify school exists
  const school = await prisma.school.findUnique({
    where: { id: schoolId },
    select: { id: true, name: true }
  });

  if (!school) {
    return NextResponse.json({ error: "School not found" }, { status: 404 });
  }

  const where = {
    schoolId,
    ...(departmentId ? { departmentId } : {})
  };

  const [courses, total] = await Promise.all([
    prisma.course.findMany({
      where,
      select: {
        id: true,
        name: true,
        courseNumber: true,
        description: true,
        credits: true,
        professor: { select: { id: true, name: true } },
        department: { select: { id: true, name: true, code: true } }
      },
      orderBy: { courseNumber: "asc" },
      skip,
      take: limit
    }),
    prisma.course.count({ where })
  ]);

  return NextResponse.json({
    school: {
      id: school.id,
      name: school.name
    },
    courses,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
}
