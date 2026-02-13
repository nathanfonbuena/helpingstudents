/**
 * GET /api/professor/search?q=<name>
 *
 * Returns unclaimed professor profiles that match the search query.
 * Used by the "Claim Existing Profile" UI in the professor portal.
 *
 * Only returns professors who:
 * - Have role=PROFESSOR
 * - Have NOT yet been claimed by another user (claimedByUser is null)
 * - Do NOT already have isClaimed=true on their ProfessorProfile
 * - Match the name query (case-insensitive partial match)
 */

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";

  if (q.length < 2) {
    return NextResponse.json({ professors: [] });
  }

  // Fetch the requester's school IDs so results are scoped to their institution
  const requester = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { schools: { select: { schoolId: true } } }
  });

  const userSchoolIds = (requester?.schools ?? []).map((s) => s.schoolId);

  // If the professor hasn't added their school yet, we can't do a meaningful
  // school-scoped search — return an empty list with a hint.
  if (userSchoolIds.length === 0) {
    return NextResponse.json({ professors: [], noSchool: true });
  }

  const professors = await prisma.user.findMany({
    where: {
      role: "PROFESSOR",
      name: { contains: q, mode: "insensitive" },
      // Only return professors at the same school(s) as the requester
      schools: { some: { schoolId: { in: userSchoolIds } } },
      // Not yet claimed by a signed-up professor
      claimedByUser: { is: null },
      // Not already self-claimed via email verification flow
      OR: [
        { professorProfile: { is: null } },
        { professorProfile: { isClaimed: false } }
      ],
      // Exclude the requester themselves
      NOT: { id: session.user.id }
    },
    select: {
      id: true,
      name: true,
      schools: {
        select: {
          school: { select: { id: true, name: true } }
        }
      },
      reviewsReceived: { select: { id: true } }
    },
    orderBy: { name: "asc" },
    take: 10
  });

  return NextResponse.json({
    professors: professors.map((p) => ({
      id: p.id,
      name: p.name,
      schools: p.schools.map((s) => ({ id: s.school.id, name: s.school.name })),
      reviewCount: p.reviewsReceived.length
    }))
  });
}
