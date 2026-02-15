import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const MAX_RECENT_SEARCHES = 5;

const normalizeQuery = (value: string) => value.trim().replace(/\s+/g, " ").toLowerCase();

export async function GET() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ recent: [] });
  }

  const items = await prisma.searchHistory.findMany({
    where: { userId },
    select: { query: true },
    orderBy: [{ lastSearchedAt: "desc" }, { updatedAt: "desc" }],
    take: MAX_RECENT_SEARCHES
  });

  return NextResponse.json({ recent: items.map((item) => item.query) });
}

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = (await request.json().catch(() => ({}))) as { query?: string };
  const query = payload.query?.trim() ?? "";

  if (!query) {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }

  if (query.length > 120) {
    return NextResponse.json({ error: "Query too long" }, { status: 400 });
  }

  const normalizedQuery = normalizeQuery(query);

  await prisma.$transaction(async (tx) => {
    await tx.searchHistory.upsert({
      where: {
        userId_normalizedQuery: {
          userId,
          normalizedQuery
        }
      },
      update: {
        query,
        count: { increment: 1 },
        lastSearchedAt: new Date()
      },
      create: {
        userId,
        query,
        normalizedQuery
      }
    });

    const overflowItems = await tx.searchHistory.findMany({
      where: { userId },
      orderBy: [{ lastSearchedAt: "desc" }, { updatedAt: "desc" }],
      skip: MAX_RECENT_SEARCHES,
      select: { id: true }
    });

    if (overflowItems.length > 0) {
      await tx.searchHistory.deleteMany({
        where: { id: { in: overflowItems.map((item) => item.id) } }
      });
    }
  });

  return NextResponse.json({ ok: true });
}
