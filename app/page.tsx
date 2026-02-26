import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Sidebar from "./components/Sidebar";
import SearchBox from "./components/SearchBox";
import FirstRunPrompt from "./components/FirstRunPrompt";
import NextBestActionCard from "./components/NextBestActionCard";
import { firstByName } from "./lib/sortUtils";
import { slugify } from "./lib/slug";
import { getNextActionRecommendation } from "./lib/nextAction";

export default async function HomePage() {
  const session = await auth();
  const userId = session?.user?.id ?? null;

  const [profile, savedCourses, followedProfessors, trendingProfessors, trendingSchools] =
    await Promise.all([
      userId
        ? prisma.user.findUnique({
          where: { id: userId },
          select: {
            name: true,
            verified: true,
            schools: {
              where: { role: "STUDENT" },
              select: {
                school: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            },
            _count: {
              select: {
                savedCourses: true,
                following: true,
                reviewsWritten: true,
                scheduleEntries: true
              }
            }
          }
        })
        : Promise.resolve(null),
      userId
        ? prisma.savedCourse.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
          take: 3,
          select: {
            course: {
              select: {
                id: true,
                name: true,
                courseNumber: true,
                school: { select: { name: true, slug: true } }
              }
            }
          }
        })
        : Promise.resolve([]),
      userId
        ? prisma.userFollow.findMany({
          where: { followerId: userId },
          orderBy: { createdAt: "desc" },
          take: 3,
          select: {
            following: {
              select: {
                id: true,
                name: true,
                slug: true,
                schools: {
                  select: {
                    school: { select: { name: true } }
                  }
                }
              }
            }
          }
        })
        : Promise.resolve([]),
      prisma.user.findMany({
        where: { role: "PROFESSOR", name: { not: null } },
        select: {
          id: true,
          name: true,
          slug: true,
          schools: {
            select: {
              school: {
                select: {
                  name: true,
                  slug: true
                }
              }
            }
          },
          _count: { select: { reviewsReceived: true } }
        },
        orderBy: [{ reviewsReceived: { _count: "desc" } }, { name: "asc" }],
        take: 4
      }),
      prisma.$queryRaw<
        { id: string; name: string; slug: string; review_count: number }[]
      >`
        SELECT
          s.id,
          s.name,
          s.slug,
          COUNT(r.id)::int AS review_count
        FROM "School" s
        JOIN "UserSchool" us
          ON us."schoolId" = s.id
          AND us.role = 'PROFESSOR'
        JOIN "Review" r
          ON r."professorId" = us."userId"
        GROUP BY s.id, s.name, s.slug
        ORDER BY review_count DESC, s.name ASC
        LIMIT 4
      `
    ]);

  const primarySchool = profile?.schools[0]?.school;
  const nextAction = profile
    ? getNextActionRecommendation({
      verified: profile.verified,
      scheduleCount: profile._count.scheduleEntries,
      followCount: profile._count.following,
      reviewsWrittenCount: profile._count.reviewsWritten,
      writeReviewHref: followedProfessors[0]?.following
        ? `/professor/${followedProfessors[0].following.slug ?? slugify(followedProfessors[0].following.name ?? followedProfessors[0].following.id)}?writeReview=1#reviews`
        : trendingProfessors[0]
          ? `/professor/${trendingProfessors[0].slug ?? slugify(trendingProfessors[0].name ?? trendingProfessors[0].id)}?writeReview=1#reviews`
          : "/top-professors"
    })
    : null;

  return (
    <div className="home-shell">
      <Sidebar />
      <main className="home">
        <div className="home__hero">
          <p className="home__eyebrow">ClassRack</p>
          <h1 className="home__title">
            See what a class is like - BEFORE YOU ENROLL!
          </h1>
          <p className="home__subtitle">
            Real course intel. Real student materials.
          </p>
        </div>
        <SearchBox directProfessorNavigation />

        <section className="home__modules">
          {userId ? (
            <>
              {nextAction && <NextBestActionCard action={nextAction} surface="home" />}
              <article className="home-module">
                <p className="home-module__eyebrow">Your momentum</p>
                <h2>
                  {profile?.name ? `${profile.name.split(" ")[0]}, keep building your schedule.` : "Keep going."}
                </h2>
                <div className="home-module__stats">
                  <div>
                    <strong>{profile?._count.savedCourses ?? 0}</strong>
                    <span>Saved courses</span>
                  </div>
                  <div>
                    <strong>{profile?._count.following ?? 0}</strong>
                    <span>Followed professors</span>
                  </div>
                  <div>
                    <strong>{profile?._count.reviewsWritten ?? 0}</strong>
                    <span>Reviews written</span>
                  </div>
                </div>
                <div className="home-module__actions">
                  <Link className="primary-button button--sm" href="/account">
                    Open account
                  </Link>
                  {!primarySchool && (
                    <Link className="ghost-button button--sm" href="/onboarding">
                      Finish setup
                    </Link>
                  )}
                </div>
              </article>

              <article className="home-module">
                <p className="home-module__eyebrow">Saved courses</p>
                <h2>Jump back into your classes</h2>
                {savedCourses.length > 0 ? (
                  <ul className="home-module__list">
                    {savedCourses.map((entry) => (
                      <li key={entry.course.id}>
                        <strong>{entry.course.courseNumber}</strong>
                        <span>{entry.course.name}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="home-module__empty">No saved courses yet. Search and save classes to track them here.</p>
                )}
                <div className="home-module__actions">
                  <Link className="ghost-button button--sm" href="/search">
                    Find courses
                  </Link>
                </div>
              </article>

              <article className="home-module">
                <p className="home-module__eyebrow">Following</p>
                <h2>Professors you follow</h2>
                {followedProfessors.length > 0 ? (
                  <ul className="home-module__list">
                    {followedProfessors.map((row) => {
                      const professor = row.following;
                      const school = firstByName(professor.schools.map((item) => item.school));
                      return (
                        <li key={professor.id}>
                          <Link
                            className="inline-link"
                            href={`/professor/${professor.slug ?? slugify(professor.name ?? professor.id)}`}
                          >
                            {professor.name ?? "Unknown professor"}
                          </Link>
                          <span>{school?.name ?? "School unavailable"}</span>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="home-module__empty">Follow professors to get quick access and updates here.</p>
                )}
                <div className="home-module__actions">
                  <Link className="ghost-button button--sm" href="/top-professors">
                    Explore professors
                  </Link>
                </div>
              </article>
            </>
          ) : (
            <article className="home-module home-module--wide">
              <p className="home-module__eyebrow">Start here</p>
              <h2>Set up your account in under 2 minutes.</h2>
              <p>
                Sign up, pick your school, and start tracking classes and professors that matter to you.
              </p>
              <div className="home-module__actions">
                <Link className="primary-button button--sm" href="/signup">
                  Create account
                </Link>
                <Link className="ghost-button button--sm" href="/onboarding">
                  Preview onboarding
                </Link>
              </div>
            </article>
          )}
        </section>

        <section className="home__discover">
          <article className="home-module">
            <p className="home-module__eyebrow">Trending professors</p>
            <h2>Most reviewed right now</h2>
            <ul className="home-module__list">
              {trendingProfessors.map((professor) => {
                const school = firstByName(professor.schools.map((item) => item.school));
                return (
                  <li key={professor.id}>
                    <Link className="inline-link" href={`/professor/${professor.slug ?? slugify(professor.name ?? professor.id)}`}>
                      {professor.name ?? "Unknown professor"}
                    </Link>
                    <span>
                      {school?.name ?? "School unavailable"} · {professor._count.reviewsReceived} reviews
                    </span>
                  </li>
                );
              })}
            </ul>
          </article>

          <article className="home-module">
            <p className="home-module__eyebrow">Trending schools</p>
            <h2>Where reviews are most active</h2>
            <ul className="home-module__list">
              {trendingSchools.map((school) => (
                <li key={school.id}>
                  <Link className="inline-link" href={`/school/${school.slug}`}>
                    {school.name}
                  </Link>
                  <span>{school.review_count} professor reviews</span>
                </li>
              ))}
            </ul>
            <div className="home-module__actions">
              <Link className="ghost-button button--sm" href="/top-schools">
                View leaderboard
              </Link>
            </div>
          </article>
        </section>

        <FirstRunPrompt
          initialSchoolId={primarySchool?.id}
          initialSchoolName={primarySchool?.name}
        />
      </main>
    </div>
  );
}
