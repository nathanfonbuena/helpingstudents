import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("q") ?? "").trim();
  const schoolId = searchParams.get("schoolId") ?? "";

  if (query.length < 2) {
    return NextResponse.json({ schools: [], professors: [] });
  }

  const [schools, professors, courses] = await Promise.all([
    prisma.school.findMany({
      where: {
        name: {
          contains: query,
          mode: "insensitive"
        }
      },
      select: {
        id: true,
        name: true,
        slug: true
      },
      take: 5,
      orderBy: {
        name: "asc"
      }
    }),
    prisma.user.findMany({
      where: {
        role: "PROFESSOR",
        name: {
          contains: query,
          mode: "insensitive"
        },
        ...(schoolId ? { schools: { some: { schoolId } } } : {})
      },
      select: {
        id: true,
        name: true,
        schools: {
          select: {
            school: {
              select: {
                name: true
              }
            }
          },
          orderBy: {
            school: {
              name: "asc"
            }
          },
          take: 1
        }
      },
      take: 5,
      orderBy: {
        name: "asc"
      }
    }),
    prisma.course.findMany({
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
        school: { select: { name: true } }
      },
      take: 5,
      orderBy: { courseNumber: "asc" }
    })
  ]);

  const professorResults = professors.map((professor) => ({
    id: professor.id,
    name: professor.name,
    schoolName: professor.schools[0]?.school.name ?? null
  }));

  return NextResponse.json({
    schools,
    professors: professorResults,
    courses: courses.map((course) => ({
      id: course.id,
      name: `${course.courseNumber} · ${course.name}`,
      courseNumber: course.courseNumber,
      schoolName: course.school?.name ?? null
    }))
  });
}
