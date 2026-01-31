import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, schoolId, major, year } = (await request.json()) as {
    name?: string;
    schoolId?: string;
    major?: string;
    year?: string;
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

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: {
        name: name?.trim() || null,
        major: normalizedMajor,
        year: normalizedYear
      }
    });

    await tx.userSchool.deleteMany({
      where: { userId, role: "STUDENT" }
    });

    if (schoolId) {
      await tx.userSchool.create({
        data: { userId, schoolId, role: "STUDENT" }
      });
    }
  });

  return NextResponse.json({ ok: true });
}
