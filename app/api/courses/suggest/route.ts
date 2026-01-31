import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("q") ?? "").trim();
  const schoolId = searchParams.get("schoolId") ?? "";

  if (query.length < 2) {
    return NextResponse.json({ courses: [] });
  }

  const courses = await prisma.course.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { courseNumber: { contains: query, mode: "insensitive" } }
      ],
      ...(schoolId ? { schoolId } : {})
    },
    select: {
      id: true,
      name: true,
      courseNumber: true,
      professor: { select: { name: true } },
      school: { select: { name: true } }
    },
    take: 8,
    orderBy: { courseNumber: "asc" }
  });

  return NextResponse.json({ courses });
}
