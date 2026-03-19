import Link from "next/link";
import { auth } from "@/auth";
import Sidebar from "./components/Sidebar";
import SearchBox from "./components/SearchBox";
import { getSchoolContext } from "@/app/lib/schoolContext";

export default async function HomePage() {
  const session = await auth();
  const userId = session?.user?.id ?? null;

  const { schoolId, schoolName } = await getSchoolContext({
    sessionSchoolId: session?.user?.primarySchoolId,
    sessionSchoolName: session?.user?.primarySchoolName
  });

  const onboardingCompletedAt = (
    session?.user as unknown as Record<string, unknown> | undefined
  )?.onboardingCompletedAt as string | null | undefined;

  const showOnboardingBanner = userId && !onboardingCompletedAt;

  return (
    <div className="home-shell">
      <Sidebar />
      <main className="home">
        {showOnboardingBanner && (
          <div className="home__onboarding-banner">
            <p>
              <strong>Finish setting up your account</strong> to get personalized
              professor and course recommendations.
            </p>
            <Link href="/onboarding" className="home__onboarding-banner-link">
              Complete setup &rarr;
            </Link>
          </div>
        )}

        <div className="home__hero">
          <p className="home__eyebrow">Knocore</p>
          <h1 className="home__title">Search for professors, courses, and schools</h1>
          <p className="home__subtitle">
            Find the information you need quickly, then dive into the right profile.
          </p>
        </div>

        <SearchBox directProfessorNavigation filters={schoolId ? { schoolId } : undefined} />

        {schoolName && (
          <p className="home__context-note">
            Results are currently scoped to <strong>{schoolName}</strong>. You can change this in search filters.
          </p>
        )}
      </main>
    </div>
  );
}
