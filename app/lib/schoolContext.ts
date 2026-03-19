import { prisma } from "@/lib/prisma";

export interface SchoolContext {
  schoolId: string;
  schoolName: string;
  source: "query" | "session" | "none";
}

export async function getSchoolContext(options: {
  sessionSchoolId?: string | null;
  sessionSchoolName?: string | null;
  querySchoolId?: string;
}): Promise<SchoolContext> {
  const { sessionSchoolId, sessionSchoolName, querySchoolId } = options;

  // 1. Explicit query param takes priority
  if (querySchoolId) {
    const school = await prisma.school.findUnique({
      where: { id: querySchoolId },
      select: { name: true }
    });
    return {
      schoolId: querySchoolId,
      schoolName: school?.name ?? "",
      source: "query"
    };
  }

  // 2. Session-based school (no DB call needed)
  if (sessionSchoolId && sessionSchoolName) {
    return {
      schoolId: sessionSchoolId,
      schoolName: sessionSchoolName,
      source: "session"
    };
  }

  // 3. Fallback — no school context
  return { schoolId: "", schoolName: "", source: "none" };
}
