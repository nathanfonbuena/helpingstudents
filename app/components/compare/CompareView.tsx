"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { trackEvent } from "@/app/lib/analytics";
import { useCompare } from "@/app/components/compare/CompareProvider";
import { slugify } from "@/app/lib/slug";

interface CompareProfessorMetrics {
  id: string;
  name: string;
  slug: string | null;
  schoolName: string | null;
  rating: number | null;
  difficulty: number | null;
  reviewCount: number;
  wouldTakeAgainPercent: number | null;
}

export default function CompareView() {
  const { items, removeFromCompare } = useCompare();
  const [loading, setLoading] = useState(false);
  const [professors, setProfessors] = useState<CompareProfessorMetrics[]>([]);

  const ids = useMemo(() => items.map((item) => item.id), [items]);
  const slugById = useMemo(() => new Map(items.map((item) => [item.id, item.slug])), [items]);

  useEffect(() => {
    if (ids.length === 0) {
      setProfessors([]);
      return;
    }
    setLoading(true);
    const params = new URLSearchParams({ ids: ids.join(",") });
    fetch(`/api/compare/professors?${params.toString()}`)
      .then(async (response) => {
        if (!response.ok) throw new Error("Failed to load compare data");
        const data = (await response.json()) as { professors: CompareProfessorMetrics[] };
        setProfessors(data.professors);
      })
      .catch(() => {
        setProfessors([]);
      })
      .finally(() => setLoading(false));
  }, [ids]);

  useEffect(() => {
    if (items.length === 0) return;
    trackEvent("compare_view_open", { source: "compare_page", total_items: items.length });
  }, [items.length]);

  if (items.length === 0) {
    return (
      <section className="compare-page">
        <header className="compare-page__header">
          <h1>Compare Professors</h1>
          <p>Add up to 3 professors from search, rankings, or profile pages.</p>
        </header>
        <div className="compare-empty">
          <p>No professors selected yet.</p>
          <Link className="btn btn--primary btn--sm" href="/search">
            Find professors
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="compare-page">
      <header className="compare-page__header">
        <h1>Compare Professors</h1>
        <p>Side-by-side view of core metrics.</p>
      </header>

      {loading && <p className="compare-loading">Loading latest metrics...</p>}

      {!loading && (
        <>
          <div className="compare-table" role="table" aria-label="Professor comparison table">
            {professors.map((professor) => (
              <article key={professor.id} className="compare-card" role="row">
                <div className="compare-card__header">
                  <div>
                    <h2>
                      <Link
                        href={`/professor/${professor.slug ?? slugById.get(professor.id) ?? slugify(professor.name)}`}
                      >
                        {professor.name}
                      </Link>
                    </h2>
                    <p>{professor.schoolName ?? "School unavailable"}</p>
                  </div>
                  <button
                    type="button"
                    className="btn btn--ghost btn--sm"
                    onClick={() => removeFromCompare(professor.id, "compare_page")}
                  >
                    Remove
                  </button>
                </div>
                <dl className="compare-metrics">
                  <div>
                    <dt>Rating</dt>
                    <dd>{professor.rating !== null ? professor.rating.toFixed(2) : "N/A"}</dd>
                  </div>
                  <div>
                    <dt>Difficulty</dt>
                    <dd>{professor.difficulty !== null ? professor.difficulty.toFixed(2) : "N/A"}</dd>
                  </div>
                  <div>
                    <dt>Review volume</dt>
                    <dd>{professor.reviewCount}</dd>
                  </div>
                  <div>
                    <dt>Would take again</dt>
                    <dd>
                      {professor.wouldTakeAgainPercent !== null
                        ? `${professor.wouldTakeAgainPercent}%`
                        : "N/A"}
                    </dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
