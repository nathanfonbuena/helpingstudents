/**
 * POST /api/professor/claim-existing
 *
 * Allows a signed-up professor to claim ownership of an existing professor
 * profile that was created by students.
 *
 * Prerequisites:
 *  1. Caller must have role=PROFESSOR
 *  2. Caller must have verified their institutional email (user.verified=true)
 *  3. At least one of the caller's schools must match the target professor's schools
 *  4. The target profile must not already be claimed
 *
 * On success:
 *  - Sets caller.claimedProfessorId = targetProfessor.id
 *  - Marks targetProfessor.professorProfile.isClaimed = true
 */

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      role: true,
      verified: true,
      claimedProfessorId: true,
      schools: { select: { schoolId: true } }
    }
  });

  if (user?.role !== "PROFESSOR") {
    return NextResponse.json({ error: "Only professors can claim profiles" }, { status: 403 });
  }

  // Gate 1: verified institutional email
  if (!user.verified) {
    return NextResponse.json(
      { error: "You must verify your institutional email before claiming an existing profile." },
      { status: 403 }
    );
  }

  // Gate 2: not already linked to another profile
  if (user.claimedProfessorId) {
    return NextResponse.json(
      { error: "You have already claimed a profile." },
      { status: 409 }
    );
  }

  const body = (await request.json()) as { professorId?: string };
  const { professorId } = body;

  if (!professorId) {
    return NextResponse.json({ error: "professorId is required" }, { status: 400 });
  }

  if (professorId === userId) {
    return NextResponse.json({ error: "You cannot claim your own account." }, { status: 400 });
  }

  const target = await prisma.user.findUnique({
    where: { id: professorId },
    select: {
      role: true,
      schools: { select: { schoolId: true } },
      professorProfile: { select: { isClaimed: true } },
      claimedByUser: { select: { id: true } }
    }
  });

  if (!target || target.role !== "PROFESSOR") {
    return NextResponse.json({ error: "Professor not found." }, { status: 404 });
  }

  // Gate 3: profile not already claimed
  if (target.claimedByUser || target.professorProfile?.isClaimed) {
    return NextResponse.json(
      { error: "This profile has already been claimed by another user." },
      { status: 409 }
    );
  }

  // Gate 4: school overlap
  const userSchoolIds = new Set(user.schools.map((s) => s.schoolId));
  const hasSchoolMatch = target.schools.some((s) => userSchoolIds.has(s.schoolId));

  if (user.schools.length === 0) {
    return NextResponse.json(
      { error: "You must add your school to your account before claiming a profile." },
      { status: 403 }
    );
  }

  if (!hasSchoolMatch) {
    return NextResponse.json(
      {
        error:
          "Your school does not match this professor\u2019s school. " +
          "Please update your school in Account Settings and try again."
      },
      { status: 403 }
    );
  }

  // All gates passed — atomically link and mark as claimed
  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { claimedProfessorId: professorId }
    }),
    prisma.professorProfile.upsert({
      where: { professorId },
      update: { isClaimed: true, claimMethod: "EMAIL", claimedAt: new Date() },
      create: { professorId, isClaimed: true, claimMethod: "EMAIL", claimedAt: new Date() }
    })
  ]);

  return NextResponse.json({ success: true, claimedProfessorId: professorId });
}
