import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const entryId = params.id;

  // Check if entry exists and belongs to user
  const entry = await prisma.scheduleEntry.findUnique({
    where: { id: entryId },
    select: { id: true, userId: true }
  });

  if (!entry) {
    return NextResponse.json({ error: "Schedule entry not found" }, { status: 404 });
  }

  if (entry.userId !== userId) {
    return NextResponse.json(
      { error: "You can only edit your own schedule entries" },
      { status: 403 }
    );
  }

  const body = (await request.json()) as {
    term?: string | null;
    meetingTimes?: string | null;
  };

  const updateData: Record<string, unknown> = {};

  if (body.term !== undefined) {
    updateData.term = body.term?.trim() || null;
  }

  if (body.meetingTimes !== undefined) {
    updateData.meetingTimes = body.meetingTimes?.trim() || null;
  }

  const updatedEntry = await prisma.scheduleEntry.update({
    where: { id: entryId },
    data: updateData,
    select: {
      id: true,
      term: true,
      meetingTimes: true
    }
  });

  return NextResponse.json({ entry: updatedEntry });
}
