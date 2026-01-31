import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

function escapeCSV(value: string | number | null | undefined): string {
  if (value === null || value === undefined) {
    return "";
  }
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET(request: Request) {
  // Check authentication
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const schoolId = searchParams.get("schoolId");

  if (!schoolId) {
    return NextResponse.json(
      { error: "schoolId is required" },
      { status: 400 }
    );
  }

  // Verify school exists
  const school = await prisma.school.findUnique({
    where: { id: schoolId },
    select: { id: true, name: true, slug: true }
  });

  if (!school) {
    return NextResponse.json({ error: "School not found" }, { status: 404 });
  }

  // Fetch all courses for this school
  const courses = await prisma.course.findMany({
    where: { schoolId },
    select: {
      courseNumber: true,
      name: true,
      description: true,
      credits: true,
      department: { select: { code: true } },
      professor: { select: { name: true } }
    },
    orderBy: { courseNumber: "asc" }
  });

  // Build CSV
  const headers = [
    "courseNumber",
    "name",
    "departmentCode",
    "description",
    "credits",
    "professorName"
  ];

  const rows = courses.map((course) =>
    [
      escapeCSV(course.courseNumber),
      escapeCSV(course.name),
      escapeCSV(course.department?.code),
      escapeCSV(course.description),
      escapeCSV(course.credits),
      escapeCSV(course.professor?.name)
    ].join(",")
  );

  const csv = [headers.join(","), ...rows].join("\n");

  // Return as downloadable CSV file
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="courses-${school.slug}.csv"`
    }
  });
}
