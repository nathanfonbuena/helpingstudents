"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { trackEvent } from "@/app/lib/analytics";

type SortType = "score" | "rating" | "reviews";

interface TopProfessorsControlsProps {
  sort: SortType;
  minReviews: number;
  schoolId?: string;
  schoolName?: string;
}

export default function TopProfessorsControls({
  sort,
  minReviews,
  schoolId,
  schoolName
}: TopProfessorsControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const explainText = useMemo(() => {
    if (sort === "score") {
      return "Weighted score balances rating quality with review volume.";
    }
    if (sort === "rating") {
      return "Average rating sorts by raw score; review count breaks ties.";
    }
    return "Review count sorts by total volume; weighted score breaks ties.";
  }, [sort]);

  const applyFilter = (next: { sort?: SortType; minReviews?: number }) => {
    const params = new URLSearchParams(searchParams.toString());
    const nextSort = next.sort ?? sort;
    const nextMinReviews = next.minReviews ?? minReviews;

    if (nextSort === "score") params.delete("sort");
    else params.set("sort", nextSort);

    if (nextMinReviews === 0) params.delete("minReviews");
    else params.set("minReviews", String(nextMinReviews));

    params.delete("page");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  const clearSchool = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("schoolId", "");
    params.delete("page");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  return (
    <div className="ranking-controls ranking-controls--professors">
      {schoolId && schoolName && (
        <div className="ranking-controls__school-scope">
          <span>Showing professors at <strong>{schoolName}</strong></span>
          <button
            type="button"
            className="ranking-controls__clear-school"
            onClick={clearSchool}
          >
            Show all
          </button>
        </div>
      )}
      <div className="ranking-controls__right">
        <div className="ranking-control">
          <label htmlFor="ranking-sort">
            Sort by
            <span
              className="ranking-info"
              onMouseEnter={() =>
                trackEvent("ranking_explain_open", {
                  ranking_type: "professors",
                  sort_type: sort,
                  trigger: "hover_icon"
                })
              }
            >
              i
              <span role="tooltip" className="ranking-info__tooltip">
                {explainText}
              </span>
            </span>
          </label>
          <select
            id="ranking-sort"
            name="sort"
            value={sort}
            onChange={(event) => applyFilter({ sort: event.target.value as SortType })}
          >
            <option value="score">Weighted score</option>
            <option value="rating">Avg rating</option>
            <option value="reviews">Review count</option>
          </select>
        </div>

        <div className="ranking-control">
          <label htmlFor="ranking-min-reviews">Minimum reviews</label>
          <select
            id="ranking-min-reviews"
            name="minReviews"
            value={String(minReviews)}
            onChange={(event) => applyFilter({ minReviews: Number(event.target.value) })}
          >
            <option value="0">Any</option>
            <option value="5">5+</option>
            <option value="10">10+</option>
            <option value="20">20+</option>
          </select>
        </div>
      </div>
    </div>
  );
}
