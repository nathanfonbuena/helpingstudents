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
  const { items, removeFromCompare, addToCompare, isInCompare, maxItems } = useCompare();
  const [loading, setLoading] = useState(false);
  const [professors, setProfessors] = useState<CompareProfessorMetrics[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [activeAddSlot, setActiveAddSlot] = useState<number | null>(null);
  const [searchResults, setSearchResults] = useState<
    {
      id: string;
      name: string;
      slug: string | null;
      schoolName: string | null;
    }[]
  >([]);
  const [searchError, setSearchError] = useState<string | null>(null);

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

  useEffect(() => {
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery.length < 2) {
      setSearchLoading(false);
      setSearchResults([]);
      setSearchError(null);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      try {
        setSearchLoading(true);
        setSearchError(null);
        const params = new URLSearchParams({ q: trimmedQuery });
        const response = await fetch(`/api/search/suggest?${params.toString()}`, {
          signal: controller.signal
        });
        if (!response.ok) throw new Error("Failed to load professor suggestions");
        const data = (await response.json()) as {
          professors: { id: string; name: string; slug: string | null; schoolName: string | null }[];
        };
        setSearchResults(data.professors ?? []);
      } catch (error) {
        if (controller.signal.aborted) return;
        setSearchResults([]);
        setSearchError(error instanceof Error ? error.message : "Could not load suggestions.");
      } finally {
        if (!controller.signal.aborted) {
          setSearchLoading(false);
        }
      }
    }, 180);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [searchQuery]);

  const compareIsFull = items.length >= maxItems;
  const visibleSearchResults = searchResults.filter((result) => !isInCompare(result.id));
  const slotsToShow =
    items.length < 2
      ? 2
      : Math.min(maxItems, items.length + (compareIsFull ? 0 : 1));
  const slots = Array.from({ length: slotsToShow }, (_, index) => items[index] ?? null);

  const handleAddFromSearch = (result: {
    id: string;
    name: string;
    slug: string | null;
    schoolName: string | null;
  }) => {
    if (compareIsFull || isInCompare(result.id)) return;
    const slug = result.slug ?? slugify(result.name);
    addToCompare({ id: result.id, name: result.name, slug }, "compare_page_search");
    setActiveAddSlot(null);
    setSearchQuery("");
    setSearchResults([]);
    setSearchError(null);
  };

  return (
    <section className="compare-page compare-page--builder">
      <header className="compare-hero">
        <h1>Compare Professors</h1>
        <p>Select up to 3 professors and compare core metrics side-by-side.</p>
      </header>

      <section className="compare-builder" aria-label="Compare builder">
        <div className="compare-builder__slots">
          {slots.map((slot, index) =>
            slot ? (
              <article key={slot.id} className="compare-slot compare-slot--selected">
                <div>
                  <h2>
                    <Link href={`/professor/${slot.slug}`}>{slot.name}</Link>
                  </h2>
                  <p>Selected</p>
                </div>
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={() => removeFromCompare(slot.id, "compare_page")}
                >
                  Remove
                </button>
              </article>
            ) : (
              <button
                key={`add-slot-${index}`}
                type="button"
                className={`compare-slot compare-slot--add ${activeAddSlot === index ? "is-active" : ""}`}
                onClick={() => {
                  setActiveAddSlot(index);
                  setSearchQuery("");
                  setSearchResults([]);
                  setSearchError(null);
                }}
              >
                <span aria-hidden="true">+</span>
                Add Professor
              </button>
            )
          )}
        </div>

        {activeAddSlot !== null && !compareIsFull && (
          <section className="compare-search">
            <div className="compare-search__header">
              <label htmlFor="compare-search-input">Search professors</label>
              <p>
                {items.length}/{maxItems} selected
              </p>
            </div>
            <input
              id="compare-search-input"
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Type a professor name"
              autoComplete="off"
              autoFocus
            />
            <div className="compare-search__results" role="list">
              {searchQuery.trim().length > 0 && searchQuery.trim().length < 2 && (
                <p className="compare-search__hint">Type at least 2 characters.</p>
              )}
              {searchLoading && <p className="compare-search__hint">Searching...</p>}
              {!searchLoading && searchError && <p className="compare-search__hint">{searchError}</p>}
              {!searchLoading &&
                !searchError &&
                searchQuery.trim().length >= 2 &&
                visibleSearchResults.length === 0 && (
                  <p className="compare-search__hint">No matching professors found.</p>
                )}
              {!searchLoading &&
                !searchError &&
                visibleSearchResults.map((result) => (
                  <div key={result.id} className="compare-search__result" role="listitem">
                    <div>
                      <p className="compare-search__name">{result.name}</p>
                      <p className="compare-search__meta">{result.schoolName ?? "School unavailable"}</p>
                    </div>
                    <button
                      type="button"
                      className="btn btn--ghost btn--sm"
                      onClick={() => handleAddFromSearch(result)}
                    >
                      Select
                    </button>
                  </div>
                ))}
            </div>
          </section>
        )}
      </section>

      {items.length === 0 && (
        <div className="compare-empty">
          <p>Choose at least 2 professors to start a comparison.</p>
          <Link className="btn btn--primary btn--sm" href="/">
            Browse professors
          </Link>
        </div>
      )}

      {items.length > 0 && loading && <p className="compare-loading">Loading latest metrics...</p>}

      {items.length > 0 && !loading && (
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
                <div className="compare-card__highlights">
                  <div className="compare-highlight">
                    <span>Overall rating</span>
                    <strong>{professor.rating !== null ? professor.rating.toFixed(2) : "N/A"}</strong>
                  </div>
                  <div className="compare-highlight">
                    <span>Would take again</span>
                    <strong>
                      {professor.wouldTakeAgainPercent !== null
                        ? `${professor.wouldTakeAgainPercent}%`
                        : "N/A"}
                    </strong>
                  </div>
                </div>
                <dl className="compare-metrics">
                  <div>
                    <dt>Difficulty</dt>
                    <dd>{professor.difficulty !== null ? professor.difficulty.toFixed(2) : "N/A"}</dd>
                  </div>
                  <div>
                    <dt>Review volume</dt>
                    <dd>{professor.reviewCount}</dd>
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
