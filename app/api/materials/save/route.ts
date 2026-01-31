import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { materialId } = (await request.json()) as { materialId?: string };

  if (!materialId) {
    return NextResponse.json({ error: "Missing material id." }, { status: 400 });
  }

  await prisma.materialSave.upsert({
    where: {
      materialId_userId: { materialId, userId }
    },
    update: {},
    create: { materialId, userId }
  });

  return NextResponse.json({ saved: true });
}

export async function DELETE(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { materialId } = (await request.json()) as { materialId?: string };

  if (!materialId) {
    return NextResponse.json({ error: "Missing material id." }, { status: 400 });
  }

  await prisma.materialSave.deleteMany({
    where: { materialId, userId }
  });

  return NextResponse.json({ saved: false });
}
