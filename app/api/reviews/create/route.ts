import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/app/lib/slug";

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = (await request.json()) as {
    professorId?: string;
    rating?: number;
    difficulty?: number;
    expertise?: number;
    enjoyability?: number;
    clarity?: number;
    body?: string;
    wouldTakeAgain?: "yes" | "no" | "na";
    forCredit?: "yes" | "no" | "na";
    attendanceMandatory?: "yes" | "no" | "na";
    textbookRequired?: "yes" | "no" | "na";
    onlineClass?: "yes" | "no" | "na";
    grade?: string;
  };

  if (!payload.professorId || !payload.body) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const normalize = (value?: "yes" | "no" | "na") =>
    value === "yes" ? true : value === "no" ? false : null;

  const review = await prisma.review.create({
    data: {
      professorId: payload.professorId,
      studentId: userId,
      rating: payload.rating ?? 5,
      difficulty: payload.difficulty ?? 3,
      expertise: payload.expertise ?? 4,
      enjoyability: payload.enjoyability ?? 4,
      clarity: payload.clarity ?? 4,
      body: payload.body.trim(),
      wouldTakeAgain: normalize(payload.wouldTakeAgain),
      forCredit: normalize(payload.forCredit),
      attendanceMandatory: normalize(payload.attendanceMandatory),
      textbookRequired: normalize(payload.textbookRequired),
      onlineClass: normalize(payload.onlineClass),
      grade: payload.grade?.trim() || null
    },
    select: {
      professor: {
        select: { name: true, slug: true }
      }
    }
  });

  const professorSlug =
    review.professor?.slug ??
    (review.professor?.name ? slugify(review.professor.name) : undefined);
  return NextResponse.json({ professorSlug });
}
