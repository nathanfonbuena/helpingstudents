import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SchoolType } from "@prisma/client";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("q") ?? "").trim();
  const schoolId = searchParams.get("schoolId") ?? "";
  const state = searchParams.get("state") ?? "";
  const type = searchParams.get("type") as SchoolType | null;

  if (query.length < 2) {
    return NextResponse.json({ schools: [], professors: [], courses: [] });
  }

  // Build school filter - search by name OR nickname
  const schoolFilter: Record<string, unknown> = {
    OR: [
      {
        name: {
          contains: query,
          mode: "insensitive"
        }
      },
      {
        nickname: {
          contains: query,
          mode: "insensitive"
        }
      }
    ]
  };

  if (state) {
    schoolFilter.state = {
      equals: state,
      mode: "insensitive"
    };
  }

  if (type && (type === "TWO_YEAR" || type === "FOUR_YEAR")) {
    schoolFilter.type = type;
  }

  const [schools, professors, courses] = await Promise.all([
    prisma.school.findMany({
      where: schoolFilter,
      select: {
        id: true,
        name: true,
        nickname: true,
        slug: true,
        city: true,
        state: true,
        type: true,
        enrollmentSize: true
      },
      take: 8,
      orderBy: [
        { enrollmentSize: "desc" },
        { name: "asc" }
      ]
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
        slug: true,
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
        school: { select: { name: true } },
        department: { select: { name: true, code: true } },
        professor: { select: { name: true } }
      },
      take: 5,
      orderBy: { courseNumber: "asc" }
    })
  ]);

  const professorResults = professors.map((professor) => ({
    id: professor.id,
    name: professor.name,
    slug: professor.slug,
    schoolName: professor.schools[0]?.school.name ?? null
  }));

  // Format location string for schools
  const formatLocation = (city: string | null, state: string | null) => {
    if (city && state) return `${city}, ${state}`;
    return state || city || null;
  };

  return NextResponse.json({
    schools: schools.map((school) => ({
      id: school.id,
      name: school.name,
      nickname: school.nickname,
      slug: school.slug,
      city: school.city,
      state: school.state,
      type: school.type,
      location: formatLocation(school.city, school.state)
    })),
    professors: professorResults,
    courses: courses.map((course) => ({
      id: course.id,
      name: `${course.courseNumber} · ${course.name}`,
      courseNumber: course.courseNumber,
      schoolName: course.school?.name ?? null,
      departmentName: course.department?.name ?? null,
      departmentCode: course.department?.code ?? null,
      professorName: course.professor?.name ?? null
    }))
  });
}
