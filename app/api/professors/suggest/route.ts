import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("q") ?? "").trim();
  const schoolId = searchParams.get("schoolId") ?? "";

  if (query.length < 2) {
    return NextResponse.json({ professors: [] });
  }

  const whereClause: Record<string, unknown> = {
    role: "PROFESSOR",
    name: {
      contains: query,
      mode: "insensitive"
    }
  };

  // If schoolId provided, filter to professors at that school
  if (schoolId) {
    whereClause.schools = {
      some: { schoolId }
    };
  }

  const professors = await prisma.user.findMany({
    where: whereClause,
    select: {
      id: true,
      name: true,
      schools: {
        select: {
          school: {
            select: {
              id: true,
              name: true
            }
          }
        },
        take: 1
      }
    },
    take: 10,
    orderBy: { name: "asc" }
  });

  return NextResponse.json({
    professors: professors.map((prof) => ({
      id: prof.id,
      name: prof.name,
      schoolName: prof.schools[0]?.school.name ?? null
    }))
  });
}
