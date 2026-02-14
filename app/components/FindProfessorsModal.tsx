"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { slugify } from "@/app/lib/slug";

interface Suggestion {
  id: string;
  name: string;
  slug?: string;
  type: "school" | "professor";
  schoolName?: string | null;
}

interface FindProfessorsModalProps {
  open: boolean;
  onClose: () => void;
  schools: { id: string; name: string }[];
  initialSchoolId: string;
}

export default function FindProfessorsModal({
  open,
  onClose,
  schools,
  initialSchoolId
}: FindProfessorsModalProps) {
  const [schoolId, setSchoolId] = useState(initialSchoolId);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [openSuggestions, setOpenSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const schoolName = useMemo(
    () => schools.find((school) => school.id === schoolId)?.name ?? "",
    [schools, schoolId]
  );

  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      setOpenSuggestions(false);
      return;
    }

    const handle = window.setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ q: query.trim() });
        if (schoolId) params.set("schoolId", schoolId);
        const response = await fetch(`/api/search/suggest?${params.toString()}`);
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
          )
        ];
        setSuggestions(nextSuggestions);
        setOpenSuggestions(true);
      } catch (error) {
        console.error(error);
        setSuggestions([]);
        setOpenSuggestions(false);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => window.clearTimeout(handle);
  }, [query, schoolId]);

  const handleSuggestionClick = (item: Suggestion) => {
    if (item.type === "school" && item.slug) {
      router.push(`/school/${item.slug}`);
      onClose();
      return;
    }

    if (item.type === "professor") {
      const professorSlug = item.slug ?? slugify(item.name);
      router.push(`/professor/${professorSlug}`);
      onClose();
      return;
    }

    setQuery(item.name);
  };

  if (!open) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-card">
        <div className="modal-header">
          <div>
            <h2>Find more professors</h2>
            <p>
              {schoolName
                ? `Showing recommendations for ${schoolName}.`
                : "Pick a school to filter results."}
            </p>
          </div>
          <button type="button" className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">
          <label className="modal-field">
            Search
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search professors or courses"
              autoComplete="off"
              onFocus={() => {
                if (suggestions.length > 0) setOpenSuggestions(true);
              }}
              onBlur={() => {
                window.setTimeout(() => setOpenSuggestions(false), 150);
              }}
            />
          </label>
          {openSuggestions && (suggestions.length > 0 || loading) && (
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
                    </span>
                    <span className="search__suggestion-type">
                      {item.type === "school" ? "School" : "Professor"}
                    </span>
                  </button>
                ))}
            </div>
          )}
          {openSuggestions && !loading && suggestions.length === 0 && query.trim().length >= 2 && (
            <div className="search__suggestions" role="listbox">
              <div className="search__suggestion">No matching professors or schools.</div>
            </div>
          )}
          <label className="modal-field">
            School
            <select value={schoolId} onChange={(event) => setSchoolId(event.target.value)}>
              <option value="">Select a school</option>
              {schools.map((school) => (
                <option key={school.id} value={school.id}>
                  {school.name}
                </option>
              ))}
            </select>
          </label>
          <p className="modal-hint">
            You can update your default school in Settings for faster filtering.
          </p>
        </div>
        <div className="modal-actions">
          <Link
            className="primary-button"
            href={
              schoolId || query
                ? `/search?${new URLSearchParams({
                  ...(schoolId ? { schoolId } : {}),
                  ...(query ? { q: query } : {})
                }).toString()}`
                : "/search"
            }
            onClick={onClose}
          >
            View professors
          </Link>
          <button type="button" className="ghost-button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
