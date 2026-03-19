import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";

export async function POST(request: Request) {
  try {
    const { name, email, password, role } = (await request.json()) as {
      name?: string;
      email?: string;
      password?: string;
      role?: string;
    };

    const normalizedEmail = email?.toLowerCase().trim();

    if (!normalizedEmail || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password too short" }, { status: 400 });
    }

    const assignedRole = role === "PROFESSOR" ? "PROFESSOR" : "STUDENT";

    const user = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          name: name?.trim() || null,
          email: normalizedEmail,
          passwordHash: hashPassword(password),
          role: assignedRole,
          ...(assignedRole === "PROFESSOR" && {
            professorProfile: { create: { isClaimed: false } }
          })
        },
        select: { id: true, email: true }
      });

      return createdUser;
    });

    return NextResponse.json({ id: user.id, email: user.email });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }
    console.error(error);
    return NextResponse.json({ error: "Unable to register" }, { status: 500 });
  }
}
