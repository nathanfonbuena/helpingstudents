"use client";

import { useState } from "react";

interface PendingReply {
  reviewId: string;
  reviewBody: string;
  reviewRating: number;
  reviewDate: Date;
}

export default function ProfessorReplyPanel({ reviews }: { reviews: PendingReply[] }) {
  const [replies, setReplies] = useState<Record<string, string>>(
    Object.fromEntries(reviews.map((r) => [r.reviewId, ""]))
  );
  const [submitStatus, setSubmitStatus] = useState<Record<string, "idle" | "submitting" | "submitted" | "error">>({});
  const [submitted, setSubmitted] = useState<Set<string>>(new Set());

  const submitReply = async (reviewId: string) => {
    const body = replies[reviewId]?.trim();
    if (!body) return;

    setSubmitStatus((prev) => ({ ...prev, [reviewId]: "submitting" }));

    try {
      const res = await fetch("/api/professor/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId, replyBody: body })
      });

      if (res.ok) {
        setSubmitStatus((prev) => ({ ...prev, [reviewId]: "submitted" }));
        setSubmitted((prev) => new Set(prev).add(reviewId));
      } else {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Submit failed");
      }
    } catch {
      setSubmitStatus((prev) => ({ ...prev, [reviewId]: "error" }));
    }
  };

  if (reviews.length === 0) {
    return (
      <section className="portal-section">
        <h2>Reply to Reviews</h2>
        <div className="empty-panel">
          All reviews have been responded to, or no reviews with 10+ characters found.
        </div>
      </section>
    );
  }

  const unanswered = reviews.filter((r) => !submitted.has(r.reviewId));

  return (
    <section className="portal-section">
      <h2>Reply to Reviews</h2>
      <p className="portal-section__desc">
        Submit an official response to student reviews. Each reply goes through a
        moderation review (typically 24–48 hours) before going live on your profile.
      </p>
      {submitted.size > 0 && (
        <p className="form-success">
          {submitted.size} repl{submitted.size === 1 ? "y" : "ies"} submitted and pending moderation.
        </p>
      )}

      {unanswered.length === 0 ? (
        <div className="empty-panel">All replies submitted for this session.</div>
      ) : (
        <div className="reply-list">
          {unanswered.map((review) => {
            const status = submitStatus[review.reviewId] ?? "idle";
            return (
              <div key={review.reviewId} className="reply-item">
                <div className="reply-item__review">
                  <div className="reply-item__review-header">
                    <span className="reply-item__rating">{review.reviewRating}/5</span>
                    <span className="reply-item__date">
                      {new Date(review.reviewDate).toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric"
                      })}
                    </span>
                  </div>
                  <p className="reply-item__review-body">{review.reviewBody}</p>
                </div>

                <div className="form-field">
                  <label className="form-label">Your reply</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    maxLength={1000}
                    placeholder="Respond professionally. Your reply will be reviewed before going live."
                    value={replies[review.reviewId] ?? ""}
                    onChange={(e) =>
                      setReplies((prev) => ({ ...prev, [review.reviewId]: e.target.value }))
                    }
                    disabled={status === "submitting"}
                  />
                  <span className="form-hint">
                    {(replies[review.reviewId] ?? "").length}/1000 characters
                  </span>
                </div>

                <button
                  className="btn btn--primary btn--sm"
                  onClick={() => submitReply(review.reviewId)}
                  disabled={!replies[review.reviewId]?.trim() || status === "submitting"}
                >
                  {status === "submitting" ? "Submitting…" : "Submit reply"}
                </button>

                {status === "error" && (
                  <p className="form-error">Failed to submit. Please try again.</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
