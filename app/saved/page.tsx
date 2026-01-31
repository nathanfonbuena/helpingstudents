import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/app/components/Sidebar";
import { slugify } from "@/app/lib/slug";

export default async function SavedPage() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login?callbackUrl=/saved");
  }

  const [follows, savedCourses] = await Promise.all([
    prisma.userFollow.findMany({
      where: { followerId: userId },
      select: {
        following: { select: { id: true, name: true } }
      }
    }),
    prisma.savedCourse.findMany({
      where: { userId },
      select: {
        course: { select: { id: true, name: true, courseNumber: true } }
      }
    })
  ]);

  const savedProfessors = follows
    .map((follow) => follow.following)
    .filter((professor) => professor?.name)
    .map((professor) => ({
      id: professor.id,
      name: professor.name ?? "Professor",
      slug: professor.name ? slugify(professor.name) : professor.id
    }));

  return (
    <div className="home-shell">
      <Sidebar />
      <main className="settings-page">
        <section className="settings-card">
          <h1>Saved items</h1>
          <p>Keep track of professors and courses you want to revisit.</p>
          {savedProfessors.length === 0 && savedCourses.length === 0 && (
            <div className="empty-panel">No saved professors or courses yet.</div>
          )}
          {savedProfessors.length > 0 && (
            <div className="saved-list">
              <h3>Professors</h3>
              {savedProfessors.map((professor) => (
                <a key={professor.id} className="inline-link" href={`/professor/${professor.slug}`}>
                  {professor.name}
                </a>
              ))}
            </div>
          )}
          {savedCourses.length > 0 && (
            <div className="saved-list">
              <h3>Courses</h3>
              {savedCourses.map((entry) => (
                <span key={entry.course.id}>
                  {entry.course.courseNumber} · {entry.course.name}
                </span>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
