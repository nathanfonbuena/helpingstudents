"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/app/components/ToastProvider";

interface ProfessorSuggestion {
  id: string;
  name: string | null;
  schoolName: string | null;
}

interface EditScheduleModalProps {
  open: boolean;
  onClose: () => void;
  courseId: string;
  courseName: string;
  courseNumber: string;
  currentProfessorId: string | null;
  currentProfessorName: string | null;
  schoolId: string;
  entryId: string;
  term: string | null;
  meetingTimes: string | null;
}

export default function EditScheduleModal({
  open,
  onClose,
  courseId,
  courseName,
  courseNumber,
  currentProfessorId,
  currentProfessorName,
  schoolId,
  entryId,
  term: initialTerm,
  meetingTimes: initialMeetingTimes
}: EditScheduleModalProps) {
  const router = useRouter();
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  // Professor search state
  const [professorQuery, setProfessorQuery] = useState(currentProfessorName ?? "");
  const [professorSuggestions, setProfessorSuggestions] = useState<ProfessorSuggestion[]>([]);
  const [selectedProfessor, setSelectedProfessor] = useState<ProfessorSuggestion | null>(
    currentProfessorId && currentProfessorName
      ? { id: currentProfessorId, name: currentProfessorName, schoolName: null }
      : null
  );
  const [openSuggestions, setOpenSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [searching, setSearching] = useState(false);

  // Schedule entry fields
  const [term, setTerm] = useState(initialTerm ?? "");
  const [meetingTimes, setMeetingTimes] = useState(initialMeetingTimes ?? "");

  const [loading, setLoading] = useState(false);

  // Reset form when modal opens with new data
  useEffect(() => {
    if (open) {
      setProfessorQuery(currentProfessorName ?? "");
      setSelectedProfessor(
        currentProfessorId && currentProfessorName
          ? { id: currentProfessorId, name: currentProfessorName, schoolName: null }
          : null
      );
      setTerm(initialTerm ?? "");
      setMeetingTimes(initialMeetingTimes ?? "");
      setProfessorSuggestions([]);
      setOpenSuggestions(false);
      setHighlightedIndex(-1);
    }
  }, [open, currentProfessorId, currentProfessorName, initialTerm, initialMeetingTimes]);

  // Search professors when query changes
  useEffect(() => {
    if (!open || professorQuery.trim().length < 2) {
      setProfessorSuggestions([]);
      setOpenSuggestions(false);
      return;
    }

    setSearching(true);
    const handle = window.setTimeout(async () => {
      try {
        const params = new URLSearchParams({ q: professorQuery.trim(), schoolId });
        const response = await fetch(`/api/professors/suggest?${params.toString()}`);
        const payload = await response.json();
        setProfessorSuggestions(payload.professors ?? []);
        setOpenSuggestions(true);
        setHighlightedIndex(-1);
      } catch (error) {
        console.error(error);
        setProfessorSuggestions([]);
        setOpenSuggestions(false);
      } finally {
        setSearching(false);
      }
    }, 250);

    return () => window.clearTimeout(handle);
  }, [professorQuery, schoolId, open]);

  if (!open) return null;

  const handleSelectProfessor = (professor: ProfessorSuggestion) => {
    setSelectedProfessor(professor);
    setProfessorQuery(professor.name ?? "");
    setOpenSuggestions(false);
    setHighlightedIndex(-1);
  };

  const handleClearProfessor = () => {
    setSelectedProfessor(null);
    setProfessorQuery("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!openSuggestions || professorSuggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < professorSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < professorSuggestions.length) {
          handleSelectProfessor(professorSuggestions[highlightedIndex]);
        }
        break;
      case "Escape":
        setOpenSuggestions(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  const handleProfessorQueryChange = (value: string) => {
    setProfessorQuery(value);
    if (selectedProfessor) {
      setSelectedProfessor(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      // Update course professor
      const courseResponse = await fetch(`/api/courses/${courseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          professorId: selectedProfessor?.id ?? null
        })
      });

      if (!courseResponse.ok) {
        const payload = (await courseResponse.json()) as { error?: string };
        toast.push(payload.error ?? "Unable to update course.", "error");
        setLoading(false);
        return;
      }

      // Update schedule entry (term, meetingTimes)
      const scheduleResponse = await fetch(`/api/schedule/${entryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          term: term.trim() || null,
          meetingTimes: meetingTimes.trim() || null
        })
      });

      if (!scheduleResponse.ok) {
        const payload = (await scheduleResponse.json()) as { error?: string };
        toast.push(payload.error ?? "Unable to update schedule.", "error");
        setLoading(false);
        return;
      }

      toast.push("Course updated successfully.", "success");
      router.refresh();
      onClose();
    } catch (error) {
      console.error(error);
      toast.push("An error occurred while updating.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-card">
        <div className="modal-header">
          <div>
            <h2>Edit Course</h2>
            <p>{courseNumber} · {courseName}</p>
          </div>
          <button type="button" className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <form className="settings-form" onSubmit={handleSubmit}>
          <div className="professor-search-field">
            <label>
              Professor
              <div className="professor-autocomplete">
                <input
                  ref={inputRef}
                  type="text"
                  value={professorQuery}
                  onChange={(e) => handleProfessorQueryChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => {
                    if (professorSuggestions.length > 0) setOpenSuggestions(true);
                  }}
                  onBlur={() => {
                    window.setTimeout(() => setOpenSuggestions(false), 150);
                  }}
                  placeholder="Search for a professor..."
                  autoComplete="off"
                />
                {searching && (
                  <span className="professor-autocomplete-loading">Searching...</span>
                )}
              </div>
            </label>
            {openSuggestions && professorSuggestions.length > 0 && (
              <div className="search__suggestions" role="listbox">
                {professorSuggestions.map((professor, index) => (
                  <button
                    key={professor.id}
                    type="button"
                    className={`search__suggestion ${
                      index === highlightedIndex ? "search__suggestion--highlighted" : ""
                    } ${selectedProfessor?.id === professor.id ? "search__suggestion--selected" : ""}`}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelectProfessor(professor)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                  >
                    <span className="search__suggestion-main">
                      <span className="search__suggestion-title">
                        {professor.name ?? "Unknown"}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            )}
            {openSuggestions && professorSuggestions.length === 0 && professorQuery.length >= 2 && !searching && (
              <div className="search__suggestions">
                <div className="search__suggestion search__suggestion--empty">
                  No professors found matching "{professorQuery}"
                </div>
              </div>
            )}
            {selectedProfessor && (
              <div className="selected-professor-badge">
                <span>Selected: {selectedProfessor.name}</span>
                <button type="button" className="clear-selection" onClick={handleClearProfessor}>
                  ×
                </button>
              </div>
            )}
          </div>

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
            {loading ? "Saving..." : "Save changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
