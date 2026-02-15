"use client";

import { useMemo, useState } from "react";
import { trackEvent } from "@/app/lib/analytics";

type RankingType = "professors" | "schools";
type RankingSort = "score" | "rating" | "reviews";

interface RankingExplainabilityProps {
  rankingType: RankingType;
  sort: RankingSort;
}

export default function RankingExplainability({ rankingType, sort }: RankingExplainabilityProps) {
  const [open, setOpen] = useState(false);

  const sortLabel = useMemo(() => {
    if (sort === "score") return "Weighted score";
    if (sort === "reviews") return "Review count";
    return "Average rating";
  }, [sort]);

  const explainText = useMemo(() => {
    if (sort === "score") {
      if (rankingType === "schools") {
        return "Weighted score blends average rating with review volume so schools with very small samples do not spike to the top from a handful of reviews.";
      }
      return "Weighted score blends average rating with review volume so professors with very small samples do not spike to the top from a handful of reviews.";
    }
    if (sort === "reviews") {
      if (rankingType === "schools") {
        return "Ranks are ordered by total review volume for each school. Average rating is used only as a tie-breaker.";
      }
      return "Ranks are ordered by total review volume for each professor. Weighted score is used only as a tie-breaker.";
    }
    if (rankingType === "schools") {
      return "Ranks are ordered by raw average professor rating within each school. Review count is used as a tie-breaker.";
    }
    return "Ranks are ordered by raw average rating for each professor. Review count is used as a tie-breaker.";
  }, [rankingType, sort]);

  const onOpen = () => {
    setOpen(true);
    trackEvent("ranking_explain_open", {
      ranking_type: rankingType,
      sort_type: sort
    });
  };

  return (
    <>
      <button type="button" className="ranking-explain-trigger" onClick={onOpen}>
        Why this rank?
      </button>
      {open && (
        <div className="ranking-explain-modal" role="dialog" aria-modal="true" aria-label="Ranking explanation">
          <div className="ranking-explain-modal__backdrop" onClick={() => setOpen(false)} />
          <div className="ranking-explain-modal__card">
            <h3>How this ranking works</h3>
            <p>
              Current sort: <strong>{sortLabel}</strong>
            </p>
            <p>{explainText}</p>
            <button type="button" className="pagination__link" onClick={() => setOpen(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
