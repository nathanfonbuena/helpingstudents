"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/app/components/ToastProvider";

interface CourseSuggestion {
  id: string;
  name: string;
  courseNumber: string;
  credits?: number | null;
  professor: { id: string; name: string | null } | null;
  school: { id: string; name: string; slug: string } | null;
  department: { id: string; name: string; code: string | null } | null;
}

interface ScheduleModalProps {
  open: boolean;
  onClose: () => void;
  schoolId: string | null;
}

export default function ScheduleModal({ open, onClose, schoolId }: ScheduleModalProps) {
  const router = useRouter();
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  // Search state
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<CourseSuggestion[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<CourseSuggestion | null>(null);
  const [openSuggestions, setOpenSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [searching, setSearching] = useState(false);

  // Manual entry state (when no school OR when course not found)
  const [manualCourseName, setManualCourseName] = useState("");
  const [manualCourseNumber, setManualCourseNumber] = useState("");
  const [manualEntryMode, setManualEntryMode] = useState(false);

  // Common fields
  const [term, setTerm] = useState("");
  const [meetingTimes, setMeetingTimes] = useState("");
  const [loading, setLoading] = useState(false);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setQuery("");
      setTerm("");
      setMeetingTimes("");
      setSuggestions([]);
      setSelectedCourse(null);
      setOpenSuggestions(false);
      setHighlightedIndex(-1);
      setManualCourseName("");
      setManualCourseNumber("");
      setManualEntryMode(false);
    }
  }, [open]);

  // Search courses when query changes (only if schoolId exists)
  useEffect(() => {
    if (!schoolId || query.trim().length < 2) {
      setSuggestions([]);
      setOpenSuggestions(false);
      return;
    }

    setSearching(true);
    const handle = window.setTimeout(async () => {
      try {
        const params = new URLSearchParams({ q: query.trim(), schoolId });
        const response = await fetch(`/api/courses/suggest?${params.toString()}`);
        const payload = await response.json();
        setSuggestions(payload.courses ?? []);
        setOpenSuggestions(true);
        setHighlightedIndex(-1);
      } catch (error) {
        console.error(error);
        setSuggestions([]);
        setOpenSuggestions(false);
      } finally {
        setSearching(false);
      }
    }, 250);

    return () => window.clearTimeout(handle);
  }, [query, schoolId]);

  if (!open) return null;

  const handleSelect = (course: CourseSuggestion) => {
    setSelectedCourse(course);
    setQuery(`${course.courseNumber} · ${course.name}`);
    setOpenSuggestions(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!openSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
          handleSelect(suggestions[highlightedIndex]);
        }
        break;
      case "Escape":
        setOpenSuggestions(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  const handleQueryChange = (value: string) => {
    setQuery(value);
    // Clear selection if user is typing something different
    if (selectedCourse) {
      setSelectedCourse(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // If user has a school and selected a course from search
    if (schoolId && !manualEntryMode && selectedCourse) {
      setLoading(true);
      const response = await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: selectedCourse.id,
          term,
          meetingTimes
        })
      });

      setLoading(false);

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        toast.push(payload.error ?? "Unable to add class.", "error");
        return;
      }
    } else if (schoolId && !manualEntryMode && !selectedCourse) {
      // User has school but hasn't selected or entered a course
      toast.push("Please select a course or add a new one.", "error");
      return;
    } else {
      // Manual entry mode (either no school, or user chose to add new course)
      if (!manualCourseName.trim() || !manualCourseNumber.trim()) {
        toast.push("Please enter both course name and number.", "error");
        return;
      }

      setLoading(true);
      const response = await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          manualCourseName: manualCourseName.trim(),
          manualCourseNumber: manualCourseNumber.trim(),
          term,
          meetingTimes
        })
      });

      setLoading(false);

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        toast.push(payload.error ?? "Unable to add class.", "error");
        return;
      }
    }

    toast.push("Class added to your schedule.", "success");
    router.refresh();
    onClose();
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-card">
        <div className="modal-header">
          <div>
            <h2>Add a class</h2>
            <p>Build your schedule to get personalized prompts and alerts.</p>
          </div>
          <button type="button" className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <form className="settings-form" onSubmit={handleSubmit}>
          {schoolId && !manualEntryMode ? (
            /* Course search when user has a school */
            <div className="course-search-field">
              <label>
                Course
                <div className="course-autocomplete">
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => handleQueryChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                      if (suggestions.length > 0) setOpenSuggestions(true);
                    }}
                    onBlur={() => {
                      window.setTimeout(() => setOpenSuggestions(false), 150);
                    }}
                    placeholder="Search by course name or number..."
                    autoComplete="off"
                  />
                  {searching && (
                    <span className="course-autocomplete-loading">Searching...</span>
                  )}
                </div>
              </label>
              {openSuggestions && suggestions.length > 0 && (
                <div className="search__suggestions" role="listbox">
                  {suggestions.map((course, index) => (
                    <button
                      key={course.id}
                      type="button"
                      className={`search__suggestion ${
                        index === highlightedIndex ? "search__suggestion--highlighted" : ""
                      } ${selectedCourse?.id === course.id ? "search__suggestion--selected" : ""}`}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleSelect(course)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                    >
                      <span className="search__suggestion-main">
                        <span className="search__suggestion-title">
                          {course.courseNumber} · {course.name}
                        </span>
                        <span className="search__suggestion-subtitle">
                          {course.department?.name || course.department?.code || "General"}
                          {course.credits && ` · ${course.credits} credits`}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
              {openSuggestions && suggestions.length === 0 && query.length >= 2 && !searching && (
                <div className="search__suggestions" role="listbox">
                  <div className="search__suggestion search__suggestion--empty">
                    No courses found matching "{query}"
                  </div>
                  <button
                    type="button"
                    className="search__suggestion search__suggestion--action"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setManualEntryMode(true);
                      setOpenSuggestions(false);
                    }}
                  >
                    <span className="search__suggestion-main">
                      <span className="search__suggestion-title">+ Add new course</span>
                      <span className="search__suggestion-subtitle">
                        Create a new course at your school
                      </span>
                    </span>
                  </button>
                </div>
              )}
              {selectedCourse && (
                <div className="selected-course-badge">
                  Selected: {selectedCourse.courseNumber} · {selectedCourse.name}
                </div>
              )}
              {!selectedCourse && query.length === 0 && (
                <button
                  type="button"
                  className="add-course-link"
                  onClick={() => setManualEntryMode(true)}
                >
                  Can't find your course? Add it manually
                </button>
              )}
            </div>
          ) : (
            /* Manual entry when user has no school OR chose to add new course */
            <>
              {schoolId && (
                <div className="manual-entry-notice">
                  <p>Add a new course to your school's catalog.</p>
                  <button
                    type="button"
                    className="back-to-search-link"
                    onClick={() => {
                      setManualEntryMode(false);
                      setManualCourseName("");
                      setManualCourseNumber("");
                    }}
                  >
                    Back to search
                  </button>
                </div>
              )}
              {!schoolId && (
                <div className="manual-entry-notice">
                  <p>Add your school to search from course catalogs, or enter course details manually below.</p>
                </div>
              )}
              <label>
                Course number
                <input
                  type="text"
                  value={manualCourseNumber}
                  onChange={(e) => setManualCourseNumber(e.target.value)}
                  placeholder="e.g. CS 101"
                  required
                />
              </label>
              <label>
                Course name
                <input
                  type="text"
                  value={manualCourseName}
                  onChange={(e) => setManualCourseName(e.target.value)}
                  placeholder="e.g. Introduction to Computer Science"
                  required
                />
              </label>
            </>
          )}
          <label>
            Term (optional)
            <input
              type="text"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Fall 2026"
            />
          </label>
          <label>
            Meeting times (optional)
            <input
              type="text"
              value={meetingTimes}
              onChange={(e) => setMeetingTimes(e.target.value)}
              placeholder="MW 10:00–11:15"
            />
          </label>
          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? "Adding..." : "Add class"}
          </button>
        </form>
      </div>
    </div>
  );
}
