import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/app/components/Sidebar";
import SchoolReviewModalTrigger from "@/app/components/SchoolReviewModalTrigger";
import SchoolReviewVoteButtons from "@/app/components/SchoolReviewVoteButtons";
import SchoolProfessorSearch from "@/app/components/SchoolProfessorSearch";
import { slugify } from "@/app/lib/slug";
import { average } from "@/app/lib/stats";

export default async function SchoolPage({
  params,
  searchParams
}: {
  params: { slug: string };
  searchParams?: { writeReview?: string };
}) {
  const school = await prisma.school.findUnique({
    where: { slug: params.slug },
    select: {
      id: true,
      name: true,
      slug: true,
      departments: {
        select: {
          id: true,
          name: true
        },
        orderBy: {
          name: "asc"
        }
      },
      courses: {
        select: {
          id: true,
          name: true,
          courseNumber: true,
          professor: {
            select: {
              name: true
            }
          }
        },
        orderBy: {
          courseNumber: "asc"
        }
      },
      reviews: {
        select: {
          id: true,
          overall: true,
          reputation: true,
          opportunities: true,
          clubs: true,
          safety: true,
          location: true,
          facilities: true,
          happiness: true,
          internet: true,
          food: true,
          social: true,
          body: true,
          helpfulUp: true,
          helpfulDown: true,
          createdAt: true,
          student: {
            select: { name: true }
          }
        },
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!school) {
    notFound();
  }

  const professors = await prisma.user.findMany({
    where: {
      role: "PROFESSOR",
      schools: {
        some: {
          schoolId: school.id
        }
      }
    },
    select: {
      id: true,
      name: true,
      reviewsReceived: {
        select: {
          rating: true
        }
      }
    },
    orderBy: { name: "asc" }
  });

  const reviewCount = school.reviews.length;
  const overallAverage = average(school.reviews.map((review) => review.overall));

  return (
    <div className="home-shell">
      <Sidebar />
      <main className="school-page">
        <section className="school-hero">
          <div>
            <p className="school-hero__eyebrow">School profile</p>
            <h1 className="school-hero__title">{school.name}</h1>
            <p className="school-hero__subtitle">
              {school.departments.length} departments · {professors.length} professors
            </p>
            <p className="school-hero__subtitle">
              Overall rating: {overallAverage ? overallAverage.toFixed(1) : "N/A"} · {reviewCount}{" "}
              review{reviewCount === 1 ? "" : "s"}
            </p>
          </div>
          <div className="school-hero__actions">
            <SchoolReviewModalTrigger
              schoolId={school.id}
              schoolName={school.name}
              schoolSlug={school.slug}
              defaultOpen={searchParams?.writeReview === "1"}
            />
            <button className="ghost-button" type="button">
              Share school
            </button>
          </div>
        </section>

        <section className="school-layout">
          <div className="school-main">
            <section className="results-block">
              <div className="section-header">
                <h2>Find a professor</h2>
                <p>Search within this school.</p>
              </div>
              <SchoolProfessorSearch professors={professors} />
            </section>
            <section className="results-block">
              <div className="section-header">
                <h2>Professors</h2>
                <p>Top matches for this school.</p>
              </div>
              {professors.length === 0 && (
                <div className="empty-panel">No professors listed yet.</div>
              )}
              {professors.length > 0 && (
                <div className="results-grid">
                  {professors.map((professor) => {
                    const ratings = professor.reviewsReceived.map((review) => review.rating);
                    const averageRating = ratings.length
                      ? ratings.reduce((total, value) => total + value, 0) / ratings.length
                      : null;
                    return (
                      <Link
                        key={professor.id}
                        className="result-card"
                        href={`/professor/${slugify(professor.name ?? "")}`}
                      >
                        <h3>{professor.name}</h3>
                        <p>
                          {averageRating ? averageRating.toFixed(1) : "N/A"} rating · {ratings.length}{" "}
                          review{ratings.length === 1 ? "" : "s"}
                        </p>
                      </Link>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="reviews-block">
              <div className="reviews-card">
                <div className="section-header">
                  <h2>School reviews</h2>
                  <p>What students say about campus life.</p>
                </div>
                <div className="reviews-list">
                  {school.reviews.length === 0 && (
                    <div className="empty-panel">No reviews yet.</div>
                  )}
                  {school.reviews.map((review) => (
                    <article key={review.id} className="review-card">
                      <div className="review-card__header">
                        <div>
                          <h3>{review.student?.name ?? "Anonymous"}</h3>
                          <p>
                            {new Date(review.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric"
                            })}
                          </p>
                        </div>
                        <span className="review-card__score">
                          {review.overall.toFixed(1)} / 5
                        </span>
                      </div>
                      <p className="review-card__body">{review.body}</p>
                      <div className="review-card__metrics">
                        <span>Reputation: {review.reputation}</span>
                        <span>Opportunities: {review.opportunities}</span>
                        <span>Clubs: {review.clubs}</span>
                        <span>Safety: {review.safety}</span>
                        <span>Location: {review.location}</span>
                        <span>Facilities: {review.facilities}</span>
                        <span>Happiness: {review.happiness}</span>
                        <span>Internet: {review.internet}</span>
                        <span>Food: {review.food}</span>
                        <span>Social: {review.social}</span>
                      </div>
                      <SchoolReviewVoteButtons
                        reviewId={review.id}
                        helpfulUp={review.helpfulUp}
                        helpfulDown={review.helpfulDown}
                      />
                    </article>
                  ))}
                </div>
              </div>
            </section>

            <section className="results-block">
              <div className="section-header">
                <h2>Courses</h2>
                <p>Recently listed classes for this school.</p>
              </div>
              {school.courses.length === 0 && (
                <div className="empty-panel">No courses listed yet.</div>
              )}
              {school.courses.length > 0 && (
                <div className="results-grid">
                  {school.courses.map((course) => (
                    <article key={course.id} className="result-card">
                      <h3>
                        {course.courseNumber} · {course.name}
                      </h3>
                      <p>{course.professor?.name ?? "Professor TBD"}</p>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>

          <aside className="school-side">
            <div className="panel">
              <h3>Departments</h3>
              {school.departments.length === 0 && (
                <p className="panel__empty">No departments listed yet.</p>
              )}
              <ul className="panel__list">
                {school.departments.map((department) => (
                  <li key={department.id}>
                    <strong>{department.name}</strong>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}
