"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface SchoolSuggestion {
  id: string;
  name: string;
  slug: string;
  city: string | null;
  state: string | null;
  type: "TWO_YEAR" | "FOUR_YEAR" | null;
  location: string | null;
}

interface SchoolSearchBoxProps {
  initialQuery?: string;
  state?: string;
  type?: "TWO_YEAR" | "FOUR_YEAR";
  onSelect?: (school: SchoolSuggestion) => void;
  navigateOnSelect?: boolean;
  placeholder?: string;
}

export default function SchoolSearchBox({
  initialQuery = "",
  state,
  type,
  onSelect,
  navigateOnSelect = true,
  placeholder = "Search for your school"
}: SchoolSearchBoxProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<SchoolSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    const handle = window.setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ q: query.trim() });
        if (state) params.set("state", state);
        if (type) params.set("type", type);

        const response = await fetch(`/api/search/suggest?${params.toString()}`);
        const payload = await response.json();
        setSuggestions(payload.schools ?? []);
        setOpen(true);
      } catch (error) {
        console.error(error);
        setSuggestions([]);
        setOpen(false);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => window.clearTimeout(handle);
  }, [query, state, type]);

  const handleSelect = (school: SchoolSuggestion) => {
    setQuery(school.name);
    setOpen(false);

    if (onSelect) {
      onSelect(school);
    }

    if (navigateOnSelect) {
      router.push(`/school/${school.slug}`);
    }
  };

  const formatSchoolType = (schoolType: "TWO_YEAR" | "FOUR_YEAR" | null) => {
    if (schoolType === "TWO_YEAR") return "2-Year";
    if (schoolType === "FOUR_YEAR") return "4-Year";
    return null;
  };

  return (
    <div className="school-search">
      <div className="search__field">
        <span className="search__icon" aria-hidden="true">
          ⌕
        </span>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          autoComplete="off"
          onFocus={() => {
            if (suggestions.length > 0) setOpen(true);
          }}
          onBlur={() => {
            window.setTimeout(() => setOpen(false), 150);
          }}
        />
      </div>

      {open && (suggestions.length > 0 || loading) && (
        <div className="search__suggestions" role="listbox">
          {loading && <div className="search__suggestion">Loading…</div>}
          {!loading &&
            suggestions.map((school) => (
              <button
                key={school.id}
                className="search__suggestion"
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => handleSelect(school)}
              >
                <span className="search__suggestion-main">
                  <span className="search__suggestion-title">{school.name}</span>
                  {school.location && (
                    <span className="search__suggestion-subtitle">
                      {school.location}
                    </span>
                  )}
                </span>
                {school.type && (
                  <span className="search__suggestion-badge">
                    {formatSchoolType(school.type)}
                  </span>
                )}
              </button>
            ))}
        </div>
      )}

      {open && !loading && suggestions.length === 0 && query.trim().length >= 2 && (
        <div className="search__suggestions" role="listbox">
          <div className="search__suggestion search__suggestion--empty">
            No schools found matching "{query}"
          </div>
        </div>
      )}
    </div>
  );
}
