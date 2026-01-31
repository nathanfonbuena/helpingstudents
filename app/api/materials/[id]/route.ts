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

  const material = await prisma.material.findUnique({
    where: { id: params.id },
    select: { uploaderId: true }
  });

  if (!material || material.uploaderId !== userId) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const { title, content, term, status } = (await request.json()) as {
    title?: string;
    content?: string;
    term?: string;
    status?: "DRAFT" | "PENDING" | "APPROVED";
  };

  if (title && title.trim().length > 120) {
    return NextResponse.json({ error: "Title must be 120 characters or less." }, { status: 400 });
  }

  if (content && content.trim().length > 5000) {
    return NextResponse.json({ error: "Content must be 5000 characters or less." }, { status: 400 });
  }

  await prisma.material.update({
    where: { id: params.id },
    data: {
      title: title?.trim() || undefined,
      content: content?.trim() || undefined,
      term: term?.trim() || null,
      status: status
    }
  });

  return NextResponse.json({ ok: true });
}
