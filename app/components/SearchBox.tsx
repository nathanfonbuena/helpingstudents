"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface Suggestion {
  id: string;
  name: string;
  slug?: string;
  type: "school" | "professor" | "course";
  schoolName?: string | null;
  courseNumber?: string | null;
}

interface SearchBoxProps {
  initialQuery?: string;
  action?: string;
  directProfessorNavigation?: boolean;
  filters?: {
    schoolId?: string;
    departmentId?: string;
    tagId?: string;
  };
}

export default function SearchBox({
  initialQuery = "",
  action = "/search",
  directProfessorNavigation = false,
  filters
}: SearchBoxProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const formRef = useRef<HTMLFormElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const storageKey = useMemo(
    () => `recent-searches:v1:${session?.user?.id ?? "guest"}`,
    [session?.user?.id]
  );

  const paramsString = useMemo(() => {
    const params = new URLSearchParams();
    if (filters?.schoolId) params.set("schoolId", filters.schoolId);
    if (filters?.departmentId) params.set("departmentId", filters.departmentId);
    if (filters?.tagId) params.set("tagId", filters.tagId);
    return params.toString();
  }, [filters?.schoolId, filters?.departmentId, filters?.tagId]);

  useEffect(() => {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      setRecentSearches([]);
      return;
    }
    try {
      const parsed = JSON.parse(raw) as string[];
      setRecentSearches(Array.isArray(parsed) ? parsed.slice(0, 5) : []);
    } catch {
      setRecentSearches([]);
    }
  }, [storageKey]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    const handle = window.setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/search/suggest?q=${encodeURIComponent(query.trim())}`
        );
        const payload = await response.json();
        const nextSuggestions: Suggestion[] = [
          ...(payload.schools ?? []).map((item: { id: string; name: string; slug: string }) => ({
            ...item,
            type: "school" as const
          })),
          ...(payload.professors ?? []).map(
            (item: { id: string; name: string; slug?: string; schoolName?: string | null }) => ({
              ...item,
              type: "professor" as const
            })
          ),
          ...(payload.courses ?? []).map(
            (item: { id: string; name: string; courseNumber?: string | null; schoolName?: string | null }) => ({
              ...item,
              type: "course" as const
            })
          )
        ];
        setSuggestions(nextSuggestions);
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
  }, [query]);

  const pushRecentSearch = (value: string) => {
    const normalized = value.trim();
    if (!normalized) return;
    setRecentSearches((prev) => {
      const merged = [normalized, ...prev.filter((item) => item.toLowerCase() !== normalized.toLowerCase())].slice(
        0,
        5
      );
      window.localStorage.setItem(storageKey, JSON.stringify(merged));
      return merged;
    });
  };

  const submitQuery = (value: string) => {
    const normalized = value.trim();
    if (!normalized) return;
    pushRecentSearch(normalized);
    const params = new URLSearchParams(paramsString);
    params.set("q", normalized);
    router.push(`${action}?${params.toString()}`);
  };

  const handleSuggestionClick = (item: Suggestion) => {
    if (item.type === "school" && item.slug) {
      pushRecentSearch(item.name);
      router.push(`/school/${item.slug}`);
      return;
    }

    if (item.type === "professor" && directProfessorNavigation && item.slug) {
      pushRecentSearch(item.name);
      router.push(`/professor/${item.slug}`);
      return;
    }

    if (item.type === "course") {
      submitQuery(item.courseNumber ?? item.name);
      return;
    }

    submitQuery(item.name);
  };

  return (
    <form
      className="home__search"
      action={action}
      method="get"
      ref={formRef}
      onSubmit={(event) => {
        event.preventDefault();
        submitQuery(query.trim());
      }}
    >
      {filters?.schoolId && (
        <input type="hidden" name="schoolId" value={filters.schoolId} />
      )}
      {filters?.departmentId && (
        <input type="hidden" name="departmentId" value={filters.departmentId} />
      )}
      {filters?.tagId && (
        <input type="hidden" name="tagId" value={filters.tagId} />
      )}
      <div className="search__field">
        <span className="search__icon" aria-hidden="true">
          ⌕
        </span>
        <input
          ref={inputRef}
          type="search"
          name="q"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by school or professor"
          aria-label="Search by school or professor"
          autoComplete="off"
          onFocus={() => {
            if (suggestions.length > 0 || recentSearches.length > 0 || query.trim().length >= 2) {
              setOpen(true);
            }
          }}
          onBlur={() => {
            window.setTimeout(() => setOpen(false), 150);
          }}
        />
      </div>
      <div className="search__meta">
        <span>Try: "UC Berkeley" or "Dr. Chen"</span>
      </div>
      {open && (suggestions.length > 0 || loading) && (
        <div className="search__suggestions" role="listbox">
          {loading && <div className="search__suggestion">Loading…</div>}
          {!loading &&
            suggestions.map((item) => (
              <button
                key={`${item.type}-${item.id}`}
                className="search__suggestion"
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => handleSuggestionClick(item)}
              >
                <span className="search__suggestion-main">
                  <span className="search__suggestion-title">{item.name}</span>
                  {item.type === "professor" && item.schoolName && (
                    <span className="search__suggestion-subtitle">{item.schoolName}</span>
                  )}
                  {item.type === "course" && item.schoolName && (
                    <span className="search__suggestion-subtitle">{item.schoolName}</span>
                  )}
                </span>
                <span className="search__suggestion-type">
                  {item.type === "school" ? "School" : item.type === "course" ? "Course" : "Professor"}
                </span>
              </button>
            ))}
        </div>
      )}
      {open && !loading && suggestions.length === 0 && query.trim().length < 2 && recentSearches.length > 0 && (
        <div className="search__suggestions" role="listbox">
          <div className="search__suggestion search__suggestion--empty">Recent searches</div>
          {recentSearches.map((term) => (
            <button
              key={term}
              type="button"
              className="search__suggestion"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                setQuery(term);
                submitQuery(term);
              }}
            >
              <span className="search__suggestion-main">
                <span className="search__suggestion-title">{term}</span>
              </span>
              <span className="search__suggestion-type">Recent</span>
            </button>
          ))}
        </div>
      )}
      {open && !loading && suggestions.length === 0 && query.trim().length >= 2 && (
        <div className="search__suggestions" role="listbox">
          <div className="search__suggestion">No matching professors or schools.</div>
        </div>
      )}
    </form>
  );
}
