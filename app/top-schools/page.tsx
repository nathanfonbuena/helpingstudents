import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/app/components/Sidebar";
import { Prisma } from "@prisma/client";

const PAGE_SIZE = 15;
const RATING_WEIGHT = 8;

interface SchoolRow {
  id: string;
  name: string;
  slug: string;
  average_rating: number | null;
  review_count: number;
  score: number | null;
}

interface TopSchoolsPageProps {
  searchParams?: {
    page?: string;
    sort?: string;
    minReviews?: string;
  };
}

export default async function TopSchoolsPage({ searchParams }: TopSchoolsPageProps) {
  const sort =
    searchParams?.sort === "score" || searchParams?.sort === "reviews"
      ? searchParams.sort
      : "rating";
  const parsedMinReviews = Number(searchParams?.minReviews ?? "0");
  const minReviews = [0, 5, 10, 20].includes(parsedMinReviews) ? parsedMinReviews : 0;
  const page = Math.max(1, Number(searchParams?.page ?? "1") || 1);
  const skip = (page - 1) * PAGE_SIZE;
  const orderClause =
    sort === "score"
      ? `score DESC NULLS LAST, stats.review_count DESC`
      : sort === "reviews"
        ? `stats.review_count DESC, stats.average_rating DESC NULLS LAST`
        : `stats.average_rating DESC NULLS LAST, stats.review_count DESC`;

  const [schools, totalCountResult] = await Promise.all([
    prisma.$queryRaw<SchoolRow[]>`
      WITH stats AS (
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
        GROUP BY s.id, s.name, s.slug
      ),
      global_avg AS (
        SELECT AVG("rating")::float AS value
        FROM "Review"
      )
      SELECT
        stats.id,
        stats.name,
        stats.slug,
        stats.average_rating,
        stats.review_count,
        (
          (stats.review_count::float / (stats.review_count + ${RATING_WEIGHT})) * stats.average_rating
          + (${RATING_WEIGHT}::float / (stats.review_count + ${RATING_WEIGHT})) * global_avg.value
        ) AS score
      FROM stats
      CROSS JOIN global_avg
      WHERE stats.review_count >= ${minReviews}
      ORDER BY ${Prisma.raw(orderClause)}
      LIMIT ${PAGE_SIZE}
      OFFSET ${skip}
    `,
    prisma.$queryRaw<{ count: number }[]>`
      SELECT COUNT(*)::int AS count
      FROM (
        SELECT s.id
        FROM "School" s
        JOIN "UserSchool" us
          ON us."schoolId" = s.id
          AND us.role = 'PROFESSOR'
        JOIN "Review" r
          ON r."professorId" = us."userId"
        GROUP BY s.id
        HAVING COUNT(r.id) >= ${minReviews}
      ) AS school_counts
    `
  ]);

  const totalCount = totalCountResult[0]?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const paramsForPage = (nextPage: number) => {
    const params = new URLSearchParams();
    params.set("page", String(nextPage));
    if (sort !== "rating") params.set("sort", sort);
    if (minReviews > 0) params.set("minReviews", String(minReviews));
    return `/top-schools?${params.toString()}`;
  };

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
          <form className="ranking-controls" action="/top-schools" method="get">
            <label>
              Sort by
              <select name="sort" defaultValue={sort}>
                <option value="rating">Avg rating</option>
                <option value="score">Weighted score</option>
                <option value="reviews">Review count</option>
              </select>
            </label>
            <label>
              Minimum reviews
              <select name="minReviews" defaultValue={String(minReviews)}>
                <option value="0">Any</option>
                <option value="5">5+</option>
                <option value="10">10+</option>
                <option value="20">20+</option>
              </select>
            </label>
            <button type="submit" className="pagination__link">
              Apply
            </button>
          </form>

          <div className="ranking-table">
            <div className="ranking-row ranking-row--header ranking-row--schools">
              <span className="ranking-cell ranking-cell--rank">Rank</span>
              <span className="ranking-cell ranking-cell--school">School</span>
              <span className="ranking-cell ranking-cell--score">Avg rating</span>
              <span className="ranking-cell ranking-cell--reviews">Reviews</span>
            </div>
            {schools.length === 0 && (
              <div className="ranking-empty">No reviews yet.</div>
            )}
            {schools.map((school, index) => (
              <div key={school.id} className="ranking-row ranking-row--schools ranking-row--school">
                <span className="ranking-cell ranking-cell--rank" data-label="Rank">
                  #{skip + index + 1}
                </span>
                <span className="ranking-cell ranking-cell--school" data-label="School">
                  <Link className="inline-link" href={`/school/${school.slug}`}>
                    {school.name}
                  </Link>
                </span>
                <span className="ranking-cell ranking-cell--score" data-label="Avg rating">
                  {school.average_rating ? school.average_rating.toFixed(2) : "N/A"}
                </span>
                <span className="ranking-cell ranking-cell--reviews" data-label="Reviews">
                  {school.review_count}
                </span>
              </div>
            ))}
          </div>

          <div className="pagination">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="pagination__controls">
              {page > 1 ? (
                <Link className="pagination__link" href={paramsForPage(page - 1)}>
                  Previous
                </Link>
              ) : (
                <span className="pagination__disabled">Previous</span>
              )}
              {page < totalPages ? (
                <Link className="pagination__link" href={paramsForPage(page + 1)}>
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
