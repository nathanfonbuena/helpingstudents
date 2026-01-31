import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = (await request.json()) as {
    overall?: number;
    reputation?: number;
    opportunities?: number;
    clubs?: number;
    safety?: number;
    location?: number;
    facilities?: number;
    happiness?: number;
    internet?: number;
    food?: number;
    social?: number;
    body?: string;
  };

  if (!payload.body) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const value = (v?: number) => (v && v >= 1 && v <= 5 ? v : 3);

  await prisma.schoolReview.create({
    data: {
      schoolId: params.id,
      studentId: userId,
      overall: value(payload.overall),
      reputation: value(payload.reputation),
      opportunities: value(payload.opportunities),
      clubs: value(payload.clubs),
      safety: value(payload.safety),
      location: value(payload.location),
      facilities: value(payload.facilities),
      happiness: value(payload.happiness),
      internet: value(payload.internet),
      food: value(payload.food),
      social: value(payload.social),
      body: payload.body.trim()
    }
  });

  return NextResponse.json({ ok: true });
}
