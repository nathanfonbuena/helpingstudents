import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as {
    event?: string;
    payload?: Record<string, unknown>;
    path?: string;
    timestamp?: string;
  } | null;

  if (!payload?.event) {
    return NextResponse.json({ error: "Missing event" }, { status: 400 });
  }

  if (process.env.NODE_ENV !== "production") {
    console.log("[analytics]", {
      event: payload.event,
      path: payload.path ?? null,
      payload: payload.payload ?? {}
    });
  }

  return NextResponse.json({ ok: true });
}
