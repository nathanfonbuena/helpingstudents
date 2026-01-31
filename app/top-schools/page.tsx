import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/app/components/Sidebar";

const PAGE_SIZE = 15;

interface SchoolRow {
  id: string;
  name: string;
  slug: string;
  average_rating: number | null;
  review_count: number;
}

interface TopSchoolsPageProps {
  searchParams?: {
    page?: string;
  };
}

export default async function TopSchoolsPage({ searchParams }: TopSchoolsPageProps) {
  const page = Math.max(1, Number(searchParams?.page ?? "1") || 1);
  const skip = (page - 1) * PAGE_SIZE;

  const [schools, totalCountResult] = await Promise.all([
    prisma.$queryRaw<SchoolRow[]>`
      SELECT
        s.id,
        s.name,
        s.slug,
        AVG(r.rating)::float AS average_rating,
        COUNT(r.id)::int AS review_count
      FROM "School" s
      JOIN "UserSchool" us
        ON us."schoolId" = s.id
        AND us.role = 'PROFESSOR'
      JOIN "Review" r
        ON r."professorId" = us."userId"
      GROUP BY s.id
      ORDER BY average_rating DESC
      LIMIT ${PAGE_SIZE}
      OFFSET ${skip}
    `,
    prisma.$queryRaw<{ count: number }[]>`
      SELECT COUNT(DISTINCT s.id)::int AS count
      FROM "School" s
      JOIN "UserSchool" us
        ON us."schoolId" = s.id
        AND us.role = 'PROFESSOR'
      JOIN "Review" r
        ON r."professorId" = us."userId"
    `
  ]);

  const totalCount = totalCountResult[0]?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div className="home-shell">
      <Sidebar />
      <main className="ranking-page">
        <header className="ranking-hero">
          <div>
            <p className="ranking-hero__eyebrow">Leaderboard</p>
            <h1 className="ranking-hero__title">Top Schools</h1>
            <p className="ranking-hero__subtitle">
              Ranked by average professor rating across each university.
            </p>
          </div>
        </header>

        <section className="ranking-card">
          <div className="ranking-table">
            <div className="ranking-row ranking-row--header ranking-row--schools">
              <span>Rank</span>
              <span>School</span>
              <span>Avg rating</span>
              <span>Reviews</span>
            </div>
            {schools.length === 0 && (
              <div className="ranking-empty">No reviews yet.</div>
            )}
            {schools.map((school, index) => (
              <div key={school.id} className="ranking-row ranking-row--schools">
                <span>#{skip + index + 1}</span>
                <span>
                  <Link className="inline-link" href={`/school/${school.slug}`}>
                    {school.name}
                  </Link>
                </span>
                <span>
                  {school.average_rating ? school.average_rating.toFixed(2) : "N/A"}
                </span>
                <span>{school.review_count}</span>
              </div>
            ))}
          </div>

          <div className="pagination">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="pagination__controls">
              {page > 1 ? (
                <Link className="pagination__link" href={`/top-schools?page=${page - 1}`}>
                  Previous
                </Link>
              ) : (
                <span className="pagination__disabled">Previous</span>
              )}
              {page < totalPages ? (
                <Link className="pagination__link" href={`/top-schools?page=${page + 1}`}>
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
