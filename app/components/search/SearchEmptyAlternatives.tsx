"use client";

import Link from "next/link";
import { slugify } from "@/app/lib/slug";
import { trackEvent } from "@/app/lib/analytics";

interface SearchEmptyAlternativesProps {
  selectedSchoolName?: string;
  similarSchools: Array<{ id: string; name: string }>;
  similarProfessors: Array<{ id: string; name: string | null }>;
  fallbackProfessors: Array<{
    id: string;
    name: string | null;
    slug: string | null;
    reviewCount: number;
  }>;
}

export default function SearchEmptyAlternatives({
  selectedSchoolName,
  similarSchools,
  similarProfessors,
  fallbackProfessors
}: SearchEmptyAlternativesProps) {
  return (
    <section className="search-empty-panel">
      <div className="search-empty-panel__block">
        <h2>Suggested alternatives</h2>
        <div className="search-empty-panel__chips">
          {similarSchools.map((school) => (
            <Link
              key={school.id}
              className="search-empty-chip"
              href={`/?q=${encodeURIComponent(school.name)}`}
              onClick={() =>
                trackEvent("search_empty_alternative_click", {
                  type: "similar_school",
                  value: school.name
                })
              }
            >
              {school.name}
            </Link>
          ))}
          {similarProfessors.map((professor) => {
            const name = professor.name ?? "Professor";
            return (
              <Link
                key={professor.id}
                className="search-empty-chip"
                href={`/?q=${encodeURIComponent(name)}`}
                onClick={() =>
                  trackEvent("search_empty_alternative_click", {
                    type: "similar_professor",
                    value: name
                  })
                }
              >
                {name}
              </Link>
            );
          })}
          {similarSchools.length === 0 && similarProfessors.length === 0 && (
            <>
              <Link
                className="search-empty-chip"
                href="/top-professors"
                onClick={() =>
                  trackEvent("search_empty_alternative_click", {
                    type: "fallback_top_professors"
                  })
                }
              >
                Browse top professors
              </Link>
              <Link
                className="search-empty-chip"
                href="/top-schools"
                onClick={() =>
                  trackEvent("search_empty_alternative_click", {
                    type: "fallback_top_schools"
                  })
                }
              >
                Browse top schools
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="search-empty-panel__block">
        <h2>
          {selectedSchoolName
            ? `Popular professors at ${selectedSchoolName}`
            : "Popular professors this week"}
        </h2>
        <ul className="search-empty-panel__list">
          {fallbackProfessors.map((professor) => {
            const name = professor.name ?? "Unknown professor";
            return (
              <li key={professor.id}>
                <Link
                  className="inline-link"
                  href={`/professor/${professor.slug ?? slugify(name)}`}
                  onClick={() =>
                    trackEvent("search_empty_alternative_click", {
                      type: "fallback_professor_profile",
                      value: name
                    })
                  }
                >
                  {name}
                </Link>
                <span>{professor.reviewCount} reviews</span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
