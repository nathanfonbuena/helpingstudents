import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { theme } = (await request.json()) as { theme?: "LIGHT" | "DARK" };

  if (theme !== "LIGHT" && theme !== "DARK") {
    return NextResponse.json({ error: "Invalid theme" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: userId },
    data: { theme }
  });

  return NextResponse.json({ ok: true });
}
