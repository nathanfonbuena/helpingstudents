/**
 * PUT /api/professor/profile
 *
 * Update bio and officialEmail for a claimed professor profile.
 * Also handles course metadata (tags, grade distribution, class size).
 */

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(request: Request) {
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

  const body = (await request.json()) as { bio?: string; officialEmail?: string };

  const updated = await prisma.professorProfile.upsert({
    where: { professorId: effectiveProfessorId },
    update: {
      bio: body.bio?.trim() || undefined,
      officialEmail: body.officialEmail?.trim().toLowerCase() || undefined
    },
    create: {
      professorId: effectiveProfessorId,
      bio: body.bio?.trim(),
      officialEmail: body.officialEmail?.trim().toLowerCase()
    }
  });

  return NextResponse.json({ profile: updated });
}
