import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import OnboardingWizard from "./OnboardingWizard";

export default async function OnboardingPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login?callbackUrl=/onboarding");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      role: true,
      onboardingCompletedAt: true,
      schools: {
        select: {
          school: { select: { id: true, name: true } }
        },
        orderBy: { createdAt: "asc" as const },
        take: 1
      }
    }
  });

  // Already completed onboarding — redirect to home
  if (user?.onboardingCompletedAt) {
    redirect("/");
  }

  const primarySchool = user?.schools[0]?.school;

  return (
    <OnboardingWizard
      defaultRole={user?.role === "PROFESSOR" ? "PROFESSOR" : "STUDENT"}
      existingSchoolId={primarySchool?.id}
      existingSchoolName={primarySchool?.name}
    />
  );
}
