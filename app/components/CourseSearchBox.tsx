"use client";

import { useEffect, useRef, useState } from "react";

interface CourseSuggestion {
  id: string;
  name: string;
  courseNumber: string;
  description: string | null;
  credits: number | null;
  professor: { id: string; name: string } | null;
  school: { id: string; name: string; slug: string } | null;
  department: { id: string; name: string; code: string | null } | null;
}

interface CourseSearchBoxProps {
  schoolId: string;
  departmentId?: string;
  onSelect?: (course: CourseSuggestion) => void;
  onAddNew?: (query: string) => void;
  placeholder?: string;
  selectedCourses?: string[];
}

export default function CourseSearchBox({
  schoolId,
  departmentId,
  onSelect,
  onAddNew,
  placeholder = "Search for courses",
  selectedCourses = []
}: CourseSearchBoxProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<CourseSuggestion[]>([]);
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
        const params = new URLSearchParams({
          q: query.trim(),
          schoolId
        });
        if (departmentId) params.set("departmentId", departmentId);

        const response = await fetch(`/api/courses/suggest?${params.toString()}`);
        const payload = await response.json();
        setSuggestions(payload.courses ?? []);
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
  }, [query, schoolId, departmentId]);

  const handleSelect = (course: CourseSuggestion) => {
    setQuery("");
    setOpen(false);

    if (onSelect) {
      onSelect(course);
    }
  };

  const handleAddNew = () => {
    if (onAddNew && query.trim()) {
      onAddNew(query.trim());
      setQuery("");
      setOpen(false);
    }
  };

  const isSelected = (courseId: string) => selectedCourses.includes(courseId);

  return (
    <div className="course-search">
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

      {open && (suggestions.length > 0 || loading || query.trim().length >= 2) && (
        <div className="search__suggestions" role="listbox">
          {loading && <div className="search__suggestion">Loading…</div>}

          {!loading &&
            suggestions.map((course) => (
              <button
                key={course.id}
                className={`search__suggestion ${isSelected(course.id) ? "search__suggestion--selected" : ""}`}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => handleSelect(course)}
                disabled={isSelected(course.id)}
              >
                <span className="search__suggestion-main">
                  <span className="search__suggestion-title">
                    {course.courseNumber} · {course.name}
                  </span>
                  <span className="search__suggestion-meta">
                    {course.department?.name && (
                      <span className="search__suggestion-dept">
                        {course.department.name}
                      </span>
                    )}
                    {course.professor?.name && (
                      <span className="search__suggestion-prof">
                        {course.professor.name}
                      </span>
                    )}
                    {course.credits && (
                      <span className="search__suggestion-credits">
                        {course.credits} {course.credits === 1 ? "credit" : "credits"}
                      </span>
                    )}
                  </span>
                </span>
                {isSelected(course.id) ? (
                  <span className="search__suggestion-badge search__suggestion-badge--added">
                    Added
                  </span>
                ) : (
                  <span className="search__suggestion-action">+ Add</span>
                )}
              </button>
            ))}

          {!loading && suggestions.length === 0 && query.trim().length >= 2 && (
            <>
              <div className="search__suggestion search__suggestion--empty">
                No courses found matching "{query}"
              </div>
              {onAddNew && (
                <button
                  className="search__suggestion search__suggestion--add-new"
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={handleAddNew}
                >
                  <span className="search__suggestion-main">
                    <span className="search__suggestion-title">
                      + Add "{query}" as a new course
                    </span>
                  </span>
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
