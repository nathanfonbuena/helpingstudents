import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./lib/prisma";
import { verifyPassword } from "./lib/password";
import type { NextAuthConfig } from "next-auth";
import type { UserRole } from "@prisma/client";

// Session duration: 7 days in seconds
const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // 604800 seconds

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma) as NextAuthConfig["adapter"],
  session: {
    strategy: "jwt",
    maxAge: SESSION_MAX_AGE
  },
  jwt: {
    maxAge: SESSION_MAX_AGE
  },
  pages: {
    signIn: "/login",
    error: "/login"
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const email = credentials?.email?.toString().toLowerCase().trim();
        const password = credentials?.password?.toString() ?? "";

        if (!email || !password) return null;

        const user = await prisma.user.findUnique({
          where: { email },
          select: { id: true, email: true, name: true, role: true, passwordHash: true }
        });

        if (!user?.passwordHash) return null;
        if (!verifyPassword(password, user.passwordHash)) return null;

        return { id: user.id, email: user.email, name: user.name, role: user.role };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
      }

      // Refresh onboardingCompletedAt and primary school on sign-in and explicit session updates
      if (trigger === "signIn" || trigger === "update") {
        const userId = (token.id as string) ?? user?.id;
        if (userId) {
          const [dbUser, primarySchool] = await Promise.all([
            prisma.user.findUnique({
              where: { id: userId },
              select: { onboardingCompletedAt: true }
            }),
            prisma.userSchool.findFirst({
              where: { userId },
              select: {
                school: { select: { id: true, name: true } }
              },
              orderBy: { createdAt: "asc" }
            })
          ]);
          token.onboardingCompletedAt = dbUser?.onboardingCompletedAt?.toISOString() ?? null;
          token.primarySchoolId = primarySchool?.school.id ?? null;
          token.primarySchoolName = primarySchool?.school.name ?? null;
        }
      }

      return token;
    },
    session({ session, token, user }) {
      if (session.user) {
        session.user.id = (token.id as string) ?? user?.id;
        session.user.role = (token.role as UserRole) ?? user?.role;
        session.user.primarySchoolId = (token.primarySchoolId as string | null) ?? null;
        session.user.primarySchoolName = (token.primarySchoolName as string | null) ?? null;
        (session.user as unknown as Record<string, unknown>).onboardingCompletedAt =
          (token.onboardingCompletedAt as string | null) ?? null;
      }
      return session;
    }
  }
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
