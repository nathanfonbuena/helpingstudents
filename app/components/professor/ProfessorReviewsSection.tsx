"use client";

import ReviewModalTrigger from "@/app/components/ReviewModalTrigger";
import ReviewVoteButtons from "@/app/components/ReviewVoteButtons";
import VerifiedBadge from "@/app/components/VerifiedBadge";
import { trackEvent } from "@/app/lib/analytics";
import Link from "next/link";

interface ReviewResponse {
  body: string;
  createdAt: Date;
}

interface ReviewItem {
  id: string;
  rating: number;
  difficulty: number;
  expertise: number;
  enjoyability: number;
  clarity: number;
  helpfulUp: number;
  helpfulDown: number;
  wouldTakeAgain: boolean | null;
  forCredit: boolean | null;
  attendanceMandatory: boolean | null;
  textbookRequired: boolean | null;
  onlineClass: boolean | null;
  grade: string | null;
  body: string;
  createdAt: Date;
  studentName: string | null;
  isVerified?: boolean;
  response?: ReviewResponse | null;
}

interface ProfessorReviewsSectionProps {
  professorId: string;
  professorName: string;
  professorSlug: string;
  reviews: ReviewItem[];
  defaultOpenReview: boolean;
  reviewSort: "recent" | "helpful";
  reviewPage: number;
  totalReviewPages: number;
}

export default function ProfessorReviewsSection({
  professorId,
  professorName,
  professorSlug,
  reviews,
  defaultOpenReview,
  reviewSort,
  reviewPage,
  totalReviewPages
}: ProfessorReviewsSectionProps) {
  const verifiedCount = reviews.filter((r) => r.isVerified).length;
  const verifiedPercent =
    reviews.length > 0 ? Math.round((verifiedCount / reviews.length) * 100) : 0;
  const createReviewsUrl = (nextPage: number, nextSort = reviewSort) =>
    `/professor/${professorSlug}?reviewPage=${nextPage}&reviewSort=${nextSort}#reviews`;
  const reviewPageParams = (nextPage: number) => createReviewsUrl(nextPage);
  const reviewSortParams = (nextSort: "recent" | "helpful") => createReviewsUrl(1, nextSort);
  const relativeRecencyLabel = (createdAt: Date) => {
    const createdDate = new Date(createdAt);
    const elapsedMs = Date.now() - createdDate.getTime();
    const elapsedDays = Math.floor(elapsedMs / (1000 * 60 * 60 * 24));

    if (elapsedDays <= 0) return "Today";
    if (elapsedDays === 1) return "1 day ago";
    if (elapsedDays < 30) return `${elapsedDays} days ago`;
    const elapsedMonths = Math.floor(elapsedDays / 30);
    if (elapsedMonths === 1) return "1 month ago";
    if (elapsedMonths < 12) return `${elapsedMonths} months ago`;
    const elapsedYears = Math.floor(elapsedMonths / 12);
    return elapsedYears === 1 ? "1 year ago" : `${elapsedYears} years ago`;
  };

  return (
    <section id="reviews" className="professor-section">
      <div className="section-header section-header--row">
        <div>
          <h2>Reviews</h2>
          <p>
            Most recent student feedback.
            {verifiedCount > 0 && (
              <span style={{ marginLeft: 8, color: "var(--accent)", fontSize: "0.82rem", fontWeight: 600 }}>
                {verifiedPercent}% verified
              </span>
            )}
          </p>
        </div>
        <div className="section-actions">
          <div className="review-sort-controls" role="group" aria-label="Sort reviews">
            <Link
              href={reviewSortParams("recent")}
              className={`review-sort-button ${reviewSort === "recent" ? "review-sort-button--active" : ""}`}
              onClick={() => trackEvent("review_sort_change", { sort_type: "recent" })}
            >
              Most recent
            </Link>
            <Link
              href={reviewSortParams("helpful")}
              className={`review-sort-button ${reviewSort === "helpful" ? "review-sort-button--active" : ""}`}
              onClick={() => trackEvent("review_sort_change", { sort_type: "helpful" })}
            >
              Most helpful
            </Link>
          </div>
          <ReviewModalTrigger
            professorId={professorId}
            professorName={professorName}
            professorSlug={professorSlug}
            defaultOpen={defaultOpenReview}
          />
        </div>
      </div>
      <div className="reviews-list">
        {reviews.length === 0 && (
          <div className="empty-panel">No reviews yet. Be the first to share your experience.</div>
        )}
        {reviews.map((review) => (
          <article key={review.id} className="review-card">
            <div className="review-card__header">
              <div>
                <h3>
                  {review.studentName ?? "Anonymous"}
                  {review.isVerified && (
                    <VerifiedBadge size="sm" />
                  )}
                </h3>
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
            <div className="review-card__signals">
              <span className="review-signal">
                {review.isVerified ? "Verified student" : "Unverified student"}
              </span>
              <span className="review-signal">{relativeRecencyLabel(review.createdAt)}</span>
              <span className="review-signal">
                {review.helpfulUp} helpful {review.helpfulUp === 1 ? "vote" : "votes"}
              </span>
            </div>
            <p className="review-card__body">{review.body}</p>
            <div className="review-card__metrics">
              <span>Clarity: {review.clarity}</span>
              <span>Expertise: {review.expertise}</span>
              <span>Enjoyability: {review.enjoyability}</span>
              <span>Difficulty: {review.difficulty}</span>
            </div>
            <div className="review-card__details">
              <span>
                Would take again:{" "}
                {review.wouldTakeAgain === null ? "N/A" : review.wouldTakeAgain ? "Yes" : "No"}
              </span>
              <span>
                For credit:{" "}
                {review.forCredit === null ? "N/A" : review.forCredit ? "Yes" : "No"}
              </span>
              <span>
                Attendance:{" "}
                {review.attendanceMandatory === null
                  ? "N/A"
                  : review.attendanceMandatory
                    ? "Mandatory"
                    : "Not required"}
              </span>
              <span>
                Textbook:{" "}
                {review.textbookRequired === null
                  ? "N/A"
                  : review.textbookRequired
                    ? "Required"
                    : "Not required"}
              </span>
              <span>
                Online class:{" "}
                {review.onlineClass === null ? "N/A" : review.onlineClass ? "Yes" : "No"}
              </span>
              <span>Grade: {review.grade ?? "N/A"}</span>
            </div>
            <ReviewVoteButtons
              reviewId={review.id}
              helpfulUp={review.helpfulUp}
              helpfulDown={review.helpfulDown}
            />

            {/* Professor's official response (only shown when approved) */}
            {review.response && (
              <div className="review-response">
                <p className="review-response__label">Professor Response</p>
                <p className="review-response__body">{review.response.body}</p>
                <p
                  style={{
                    fontSize: "0.72rem",
                    color: "var(--ink-500)",
                    marginTop: 6
                  }}
                >
                  {new Date(review.response.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric"
                  })}
                </p>
              </div>
            )}
          </article>
        ))}
      </div>
      {totalReviewPages > 1 && (
        <div className="pagination">
          <span>
            Page {reviewPage} of {totalReviewPages}
          </span>
          <div className="pagination__controls">
            {reviewPage > 1 ? (
              <Link className="pagination__link" href={reviewPageParams(reviewPage - 1)}>
                Previous
              </Link>
            ) : (
              <span className="pagination__disabled">Previous</span>
            )}
            {reviewPage < totalReviewPages ? (
              <Link className="pagination__link" href={reviewPageParams(reviewPage + 1)}>
                Next
              </Link>
            ) : (
              <span className="pagination__disabled">Next</span>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
