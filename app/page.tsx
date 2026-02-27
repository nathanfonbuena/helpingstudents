import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Sidebar from "./components/Sidebar";
import SearchBox from "./components/SearchBox";

export default async function HomePage() {
  const session = await auth();
  const userId = session?.user?.id ?? null;

  const primarySchool = userId
    ? await prisma.userSchool.findFirst({
      where: { userId, role: "STUDENT" },
      select: {
        school: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: "asc" }
    })
    : null;

  const schoolId = primarySchool?.school.id ?? "";
  const schoolName = primarySchool?.school.name ?? "";

  return (
    <div className="home-shell">
      <Sidebar />
      <main className="home">
        <div className="home__hero">
          <p className="home__eyebrow">ClassRack</p>
          <h1 className="home__title">Search for professors, courses, and schools</h1>
          <p className="home__subtitle">
            Find the information you need quickly, then dive into the right profile.
          </p>
        </div>

        <SearchBox
          directProfessorNavigation
          filters={schoolId ? { schoolId } : undefined}
        />

        {schoolName && (
          <p className="home__context-note">
            Results are currently scoped to <strong>{schoolName}</strong>. You can change this in search filters.
          </p>
        )}
      </main>
    </div>
  );
}
