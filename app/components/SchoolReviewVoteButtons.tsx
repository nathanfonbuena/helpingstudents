"use client";

import { useState } from "react";

interface SchoolReviewVoteButtonsProps {
  reviewId: string;
  helpfulUp: number;
  helpfulDown: number;
}

export default function SchoolReviewVoteButtons({
  reviewId,
  helpfulUp,
  helpfulDown
}: SchoolReviewVoteButtonsProps) {
  const [upVotes, setUpVotes] = useState(helpfulUp);
  const [downVotes, setDownVotes] = useState(helpfulDown);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [currentVote, setCurrentVote] = useState<"up" | "down" | null>(null);

  const submitVote = async (vote: "up" | "down") => {
    if (loading) return;

    setLoading(true);
    setMessage(null);
    const previousVote = currentVote;
    if (vote === "up") setUpVotes((prev) => prev + 1);
    if (vote === "down") setDownVotes((prev) => prev + 1);
    if (previousVote === "up" && vote === "down") {
      setUpVotes((prev) => Math.max(0, prev - 1));
    }
    if (previousVote === "down" && vote === "up") {
      setDownVotes((prev) => Math.max(0, prev - 1));
    }

    try {
      const response = await fetch(`/api/school-reviews/${reviewId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vote })
      });

      if (response.status === 401) {
        setMessage("Please log in to vote.");
        return;
      }

      if (!response.ok) throw new Error("Vote failed");

      const data = (await response.json()) as {
        helpfulUp: number;
        helpfulDown: number;
        currentVote?: "UP" | "DOWN";
      };

      setUpVotes(data.helpfulUp);
      setDownVotes(data.helpfulDown);

      if (data.currentVote === "UP" || data.currentVote === "DOWN") {
        const normalizedVote = data.currentVote === "UP" ? "up" : "down";
        setCurrentVote(normalizedVote);
        if (normalizedVote === previousVote) {
          setMessage("You already voted on this review.");
        } else {
          setMessage("Thanks for voting.");
        }
      } else {
        setCurrentVote(vote);
        setMessage("Thanks for voting.");
      }
    } catch (error) {
      console.error(error);
      setUpVotes(helpfulUp);
      setDownVotes(helpfulDown);
      setCurrentVote(previousVote);
      setMessage("Vote failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="review-card__votes">
      <button type="button" className="vote-button" onClick={() => submitVote("up")} disabled={loading}>
        <span aria-hidden="true">↑</span>
        Helpful ({upVotes})
      </button>
      <button
        type="button"
        className="vote-button vote-button--down"
        onClick={() => submitVote("down")}
        disabled={loading}
      >
        <span aria-hidden="true">↓</span>
        Not helpful ({downVotes})
      </button>
      {message && <span className="vote-message">{message}</span>}
    </div>
  );
}
