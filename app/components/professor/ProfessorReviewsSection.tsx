import ReviewModalTrigger from "@/app/components/ReviewModalTrigger";
import ReviewVoteButtons from "@/app/components/ReviewVoteButtons";
import VerifiedBadge from "@/app/components/VerifiedBadge";

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
}

export default function ProfessorReviewsSection({
  professorId,
  professorName,
  professorSlug,
  reviews,
  defaultOpenReview
}: ProfessorReviewsSectionProps) {
  const verifiedCount = reviews.filter((r) => r.isVerified).length;
  const verifiedPercent =
    reviews.length > 0 ? Math.round((verifiedCount / reviews.length) * 100) : 0;

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
    </section>
  );
}
