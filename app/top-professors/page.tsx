import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/app/components/Sidebar";
import TopProfessorsTable from "@/app/components/TopProfessorsTable";
import { firstByName } from "@/app/lib/sortUtils";
import { slugify } from "@/app/lib/slug";
import { Prisma } from "@prisma/client";
import RankingExplainability from "@/app/components/ranking/RankingExplainability";

const PAGE_SIZE = 25;
const RATING_WEIGHT = 8;

interface TopProfessorsPageProps {
  searchParams?: {
    page?: string;
    sort?: string;
    minReviews?: string;
  };
}

export default async function TopProfessorsPage({
  searchParams
}: TopProfessorsPageProps) {
  const sort: "score" | "rating" | "reviews" =
    searchParams?.sort === "rating" || searchParams?.sort === "reviews"
      ? searchParams.sort
      : "score";

  const parsedMinReviews = Number(searchParams?.minReviews ?? "0");
  const minReviews = [0, 5, 10, 20].includes(parsedMinReviews) ? parsedMinReviews : 0;
  const page = Math.max(1, Number(searchParams?.page ?? "1") || 1);
  const skip = (page - 1) * PAGE_SIZE;
  const orderClause =
    sort === "rating"
      ? `stats.average_rating DESC NULLS LAST, stats.review_count DESC`
      : sort === "reviews"
        ? `stats.review_count DESC, score DESC`
        : `score DESC, stats.review_count DESC`;

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
      WHERE stats.review_count >= ${minReviews}
      ORDER BY ${Prisma.raw(orderClause)}
      LIMIT ${PAGE_SIZE}
      OFFSET ${skip}
    `,
    prisma.$queryRaw<{ count: number }[]>`
      SELECT COUNT(*)::int AS count
      FROM (
        SELECT "professorId"
        FROM "Review"
        GROUP BY "professorId"
        HAVING COUNT(*) >= ${minReviews}
      ) AS review_counts
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
      }
    }
  });

  const professorById = new Map(professors.map((professor) => [professor.id, professor]));
  const totalCount = totalCountResult[0]?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const paramsForPage = (nextPage: number) => {
    const params = new URLSearchParams();
    params.set("page", String(nextPage));
    if (sort !== "score") params.set("sort", sort);
    if (minReviews > 0) params.set("minReviews", String(minReviews));
    return `/top-professors?${params.toString()}`;
  };
  const items = ratingGroups.map((group, index) => {
    const professor = professorById.get(group.professor_id);
    const school = professor?.schools
      ? firstByName(professor.schools.map((entry) => entry.school))
      : undefined;
    return {
      id: group.professor_id,
      name: professor?.name ?? null,
      slug: professor?.slug ?? null,
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
          <form className="ranking-controls" action="/top-professors" method="get">
            <label>
              Sort by
              <select name="sort" defaultValue={sort}>
                <option value="score">Weighted score</option>
                <option value="rating">Avg rating</option>
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
            <RankingExplainability rankingType="professors" sort={sort} />
          </form>

          <TopProfessorsTable items={items} />

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
