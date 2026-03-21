"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { slugify } from "@/app/lib/slug";

interface SchoolProfessorSearchProps {
  professors: {
    id: string;
    name: string | null;
    slug?: string | null;
    averageRating?: number | null;
    reviewCount?: number;
  }[];
}

export default function SchoolProfessorSearch({ professors }: SchoolProfessorSearchProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const matches = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return [];
    return professors
      .filter((professor) => (professor.name ?? "").toLowerCase().includes(term))
      .slice(0, 6);
  }, [professors, query]);

  return (
    <div className="school-search">
      <label>
        Search professors at this school
        <input
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 120)}
          placeholder="Type a professor name"
        />
      </label>
      {open && query.trim().length > 0 && (
        <div className="school-search__results" role="listbox">
          {matches.length === 0 && <p>No professors match that name.</p>}
          {matches.map((professor) => (
            <Link
              key={professor.id}
              className="school-search__item"
              href={`/professor/${professor.slug ?? slugify(professor.name ?? "")}`}
            >
              <span className="school-search__name">{professor.name ?? "Unnamed professor"}</span>
              <span className="school-search__meta">
                {professor.averageRating != null
                  ? `★ ${professor.averageRating.toFixed(1)}`
                  : "No rating"}
                {professor.reviewCount != null && professor.reviewCount > 0 && (
                  <> · {professor.reviewCount} review{professor.reviewCount === 1 ? "" : "s"}</>
                )}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
