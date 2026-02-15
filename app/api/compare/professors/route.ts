import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { firstByName } from "@/app/lib/sortUtils";

export async function GET(request: NextRequest) {
  const rawIds = request.nextUrl.searchParams.get("ids") ?? "";
  const uniqueIds = Array.from(
    new Set(
      rawIds
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean)
    )
  ).slice(0, 3);

  if (uniqueIds.length === 0) {
    return NextResponse.json({ professors: [] });
  }

  const [professors, groupedStats, wouldTakeAgainStats] = await Promise.all([
    prisma.user.findMany({
      where: {
        id: { in: uniqueIds },
        role: "PROFESSOR"
      },
      select: {
        id: true,
        name: true,
        slug: true,
        schools: {
          select: {
            school: {
              select: { name: true }
            }
          }
        }
      }
    }),
    prisma.review.groupBy({
      by: ["professorId"],
      where: { professorId: { in: uniqueIds } },
      _avg: {
        rating: true,
        difficulty: true
      },
      _count: {
        _all: true
      }
    }),
    prisma.review.groupBy({
      by: ["professorId", "wouldTakeAgain"],
      where: {
        professorId: { in: uniqueIds },
        wouldTakeAgain: { not: null }
      },
      _count: {
        _all: true
      }
    })
  ]);

  const statsByProfessorId = new Map(
    groupedStats.map((item) => [
      item.professorId,
      {
        rating: item._avg.rating,
        difficulty: item._avg.difficulty,
        reviewCount: item._count._all
      }
    ])
  );

  const wouldTakeAgainByProfessorId = new Map<string, { yes: number; total: number }>();
  wouldTakeAgainStats.forEach((item) => {
    const current = wouldTakeAgainByProfessorId.get(item.professorId) ?? { yes: 0, total: 0 };
    current.total += item._count._all;
    if (item.wouldTakeAgain === true) {
      current.yes += item._count._all;
    }
    wouldTakeAgainByProfessorId.set(item.professorId, current);
  });

  const professorById = new Map(professors.map((professor) => [professor.id, professor]));

  const payload = uniqueIds
    .map((id) => {
      const professor = professorById.get(id);
      if (!professor?.name) return null;
      const stats = statsByProfessorId.get(id);
      const wouldTakeAgain = wouldTakeAgainByProfessorId.get(id);
      const primarySchool = firstByName(professor.schools.map((entry) => entry.school));
      return {
        id: professor.id,
        name: professor.name,
        slug: professor.slug,
        schoolName: primarySchool?.name ?? null,
        rating: stats?.rating ?? null,
        difficulty: stats?.difficulty ?? null,
        reviewCount: stats?.reviewCount ?? 0,
        wouldTakeAgainPercent:
          wouldTakeAgain && wouldTakeAgain.total > 0
            ? Math.round((wouldTakeAgain.yes / wouldTakeAgain.total) * 100)
            : null
      };
    })
    .filter(Boolean);

  return NextResponse.json({ professors: payload });
}
