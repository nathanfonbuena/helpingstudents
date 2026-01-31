import Link from "next/link";
import { slugify } from "@/app/lib/slug";

interface ProfessorReviewItem {
  id: string;
  professorName: string | null;
  rating: number;
  body: string;
  createdAt: Date;
}

interface SchoolReviewItem {
  id: string;
  schoolName: string;
  overall: number;
  body: string;
  createdAt: Date;
  schoolSlug: string;
}

interface AccountReviewListProps {
  professorReviews: ProfessorReviewItem[];
  schoolReviews: SchoolReviewItem[];
}

export default function AccountReviewList({
  professorReviews,
  schoolReviews
}: AccountReviewListProps) {
  return (
    <section className="account-section">
      <div className="account-section__header">
        <h2>Your reviews</h2>
        <p>Recent reviews you have submitted.</p>
      </div>
      <div className="account-reviews">
        {professorReviews.length === 0 && schoolReviews.length === 0 && (
          <div className="empty-panel">You have not written any reviews yet.</div>
        )}
        {professorReviews.map((review) => (
          <article key={review.id} className="review-card">
            <div className="review-card__header">
              <div>
                <h3>{review.professorName ?? "Professor"}</h3>
                <p>
                  {new Date(review.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric"
                  })}
                </p>
              </div>
              <span className="review-card__score">{review.rating.toFixed(1)} / 5</span>
            </div>
            <p className="review-card__body">{review.body}</p>
            {review.professorName && (
              <Link className="inline-link" href={`/professor/${slugify(review.professorName)}`}>
                View professor
              </Link>
            )}
          </article>
        ))}
        {schoolReviews.map((review) => (
          <article key={review.id} className="review-card">
            <div className="review-card__header">
              <div>
                <h3>{review.schoolName}</h3>
                <p>
                  {new Date(review.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric"
                  })}
                </p>
              </div>
              <span className="review-card__score">{review.overall.toFixed(1)} / 5</span>
            </div>
            <p className="review-card__body">{review.body}</p>
            <Link className="inline-link" href={`/school/${review.schoolSlug}`}>
              View school
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
