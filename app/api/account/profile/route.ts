import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, schoolId, major, year, role } = (await request.json()) as {
    name?: string;
    schoolId?: string;
    major?: string;
    year?: string;
    role?: UserRole;
  };

  const normalizedMajor = major?.trim() || null;
  const normalizedYear = year?.trim() || null;

  if (normalizedMajor && normalizedMajor.length > 80) {
    return NextResponse.json({ error: "Major must be 80 characters or less." }, { status: 400 });
  }

  if (normalizedYear) {
    const yearNumber = Number(normalizedYear);
    if (!Number.isInteger(yearNumber) || yearNumber < 1900 || yearNumber > 2100) {
      return NextResponse.json({ error: "Graduation year must be a valid year." }, { status: 400 });
    }
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true }
  });

  if (!currentUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const nextRole: UserRole =
    role === "PROFESSOR" || role === "STUDENT" ? role : currentUser.role;

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: {
        name: name?.trim() || null,
        major: normalizedMajor,
        year: normalizedYear,
        role: nextRole
      }
    });

    await tx.userSchool.deleteMany({
      where: {
        userId,
        role: { in: ["STUDENT", "PROFESSOR"] }
      }
    });

    if (schoolId) {
      await tx.userSchool.create({
        data: { userId, schoolId, role: nextRole }
      });
    }

    if (nextRole === "PROFESSOR") {
      await tx.professorProfile.upsert({
        where: { professorId: userId },
        update: {},
        create: { professorId: userId, isClaimed: false }
      });
    }
  });

  return NextResponse.json({ ok: true });
}
