import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/app/components/Sidebar";
import TopProfessorsTable from "@/app/components/TopProfessorsTable";
import { firstByName } from "@/app/lib/sortUtils";
import { slugify } from "@/app/lib/slug";

const PAGE_SIZE = 25;
const RATING_WEIGHT = 8;

interface TopProfessorsPageProps {
  searchParams?: {
    page?: string;
  };
}

export default async function TopProfessorsPage({
  searchParams
}: TopProfessorsPageProps) {
  const page = Math.max(1, Number(searchParams?.page ?? "1") || 1);
  const skip = (page - 1) * PAGE_SIZE;

  const [ratingGroups, totalCountResult] = await Promise.all([
    prisma.$queryRaw<
      {
        professor_id: string;
        average_rating: number | null;
        review_count: number;
        score: number | null;
      }[]
    >`
      WITH stats AS (
        SELECT
          "professorId" AS professor_id,
          AVG("rating")::float AS average_rating,
          COUNT(*)::int AS review_count
        FROM "Review"
        GROUP BY "professorId"
      ),
      global_avg AS (
        SELECT AVG("rating")::float AS value
        FROM "Review"
      )
      SELECT
        stats.professor_id,
        stats.average_rating,
        stats.review_count,
        (
          (stats.review_count::float / (stats.review_count + ${RATING_WEIGHT})) * stats.average_rating
          + (${RATING_WEIGHT}::float / (stats.review_count + ${RATING_WEIGHT})) * global_avg.value
        ) AS score
      FROM stats
      CROSS JOIN global_avg
      ORDER BY score DESC, stats.review_count DESC
      LIMIT ${PAGE_SIZE}
      OFFSET ${skip}
    `,
    prisma.$queryRaw<{ count: number }[]>`
      SELECT COUNT(DISTINCT "professorId")::int AS count
      FROM "Review"
    `
  ]);

  const professorIds = ratingGroups.map((group) => group.professor_id);
  const professors = await prisma.user.findMany({
    where: {
      id: { in: professorIds },
      role: "PROFESSOR"
    },
    select: {
      id: true,
      name: true,
      schools: {
        select: {
          school: {
            select: {
              name: true,
              slug: true
            }
          }
        }
      }
    }
  });

  const professorById = new Map(professors.map((professor) => [professor.id, professor]));
  const totalCount = totalCountResult[0]?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const items = ratingGroups.map((group, index) => {
    const professor = professorById.get(group.professor_id);
    const school = professor?.schools
      ? firstByName(professor.schools.map((entry) => entry.school))
      : undefined;
    return {
      id: group.professor_id,
      name: professor?.name ?? null,
      averageRating: group.average_rating ?? null,
      reviewCount: group.review_count,
      score: group.score ?? null,
      schoolName: school?.name,
      schoolSlug: school?.slug,
      rank: skip + index + 1
    };
  });

  return (
    <div className="home-shell">
      <Sidebar />
      <main className="ranking-page">
        <header className="ranking-hero">
          <div>
            <p className="ranking-hero__eyebrow">Leaderboard</p>
            <h1 className="ranking-hero__title">Top Professors</h1>
            <p className="ranking-hero__subtitle">
              Ranked by average student rating across all reviews.
            </p>
          </div>
        </header>

        <section className="ranking-card">
          <TopProfessorsTable items={items} />

          <div className="pagination">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="pagination__controls">
              {page > 1 ? (
                <Link className="pagination__link" href={`/top-professors?page=${page - 1}`}>
                  Previous
                </Link>
              ) : (
                <span className="pagination__disabled">Previous</span>
              )}
              {page < totalPages ? (
                <Link className="pagination__link" href={`/top-professors?page=${page + 1}`}>
                  Next
                </Link>
              ) : (
                <span className="pagination__disabled">Next</span>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
