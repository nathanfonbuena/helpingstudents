"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/app/components/ToastProvider";

interface CourseSuggestion {
  id: string;
  name: string;
  courseNumber: string;
  professor: { name: string | null } | null;
  school: { name: string } | null;
}

interface ScheduleModalProps {
  open: boolean;
  onClose: () => void;
  schoolId: string | null;
}

export default function ScheduleModal({ open, onClose, schoolId }: ScheduleModalProps) {
  const router = useRouter();
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [term, setTerm] = useState("");
  const [meetingTimes, setMeetingTimes] = useState("");
  const [suggestions, setSuggestions] = useState<CourseSuggestion[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<CourseSuggestion | null>(null);
  const [loading, setLoading] = useState(false);
  const [openSuggestions, setOpenSuggestions] = useState(false);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setTerm("");
      setMeetingTimes("");
      setSuggestions([]);
      setSelectedCourse(null);
      setOpenSuggestions(false);
    }
  }, [open]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      setOpenSuggestions(false);
      return;
    }

    const handle = window.setTimeout(async () => {
      try {
        const params = new URLSearchParams({ q: query.trim() });
        if (schoolId) params.set("schoolId", schoolId);
        const response = await fetch(`/api/courses/suggest?${params.toString()}`);
        const payload = await response.json();
        setSuggestions(payload.courses ?? []);
        setOpenSuggestions(true);
      } catch (error) {
        console.error(error);
        setSuggestions([]);
        setOpenSuggestions(false);
      }
    }, 250);

    return () => window.clearTimeout(handle);
  }, [query, schoolId]);

  if (!open) return null;

  const handleSelect = (course: CourseSuggestion) => {
    setSelectedCourse(course);
    setQuery(`${course.courseNumber} ${course.name}`.trim());
    setOpenSuggestions(false);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedCourse) {
      toast.push("Select a course to add.", "error");
      return;
    }

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
          <label>
            Course
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search course by name or number"
              onFocus={() => {
                if (suggestions.length > 0) setOpenSuggestions(true);
              }}
              onBlur={() => {
                window.setTimeout(() => setOpenSuggestions(false), 150);
              }}
              required
            />
          </label>
          {openSuggestions && suggestions.length > 0 && (
            <div className="search__suggestions" role="listbox">
              {suggestions.map((course) => (
                <button
                  key={course.id}
                  type="button"
                  className="search__suggestion"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => handleSelect(course)}
                >
                  <span className="search__suggestion-main">
                    <span className="search__suggestion-title">
                      {course.courseNumber} · {course.name}
                    </span>
                    <span className="search__suggestion-subtitle">
                      {course.professor?.name ?? "TBA"}
                    </span>
                  </span>
                  <span className="search__suggestion-type">Course</span>
                </button>
              ))}
            </div>
          )}
          <label>
            Term (optional)
            <input
              type="text"
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              placeholder="Fall 2026"
            />
          </label>
          <label>
            Meeting times (optional)
            <input
              type="text"
              value={meetingTimes}
              onChange={(event) => setMeetingTimes(event.target.value)}
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
