"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/app/components/ToastProvider";

interface CourseOption {
  id: string;
  name: string;
  courseNumber: string;
  professorName: string | null;
}

interface ProfessorSuggestion {
  id: string;
  name: string;
  schoolName?: string | null;
  type: "professor";
}

interface UploadMaterialModalProps {
  open: boolean;
  onClose: () => void;
  scheduleCourses: CourseOption[];
}

export default function UploadMaterialModal({
  open,
  onClose,
  scheduleCourses
}: UploadMaterialModalProps) {
  const router = useRouter();
  const toast = useToast();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [term, setTerm] = useState("");
  const [draft, setDraft] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [professorQuery, setProfessorQuery] = useState("");
  const [professorId, setProfessorId] = useState("");
  const [professorName, setProfessorName] = useState("");
  const [suggestions, setSuggestions] = useState<ProfessorSuggestion[]>([]);
  const [openSuggestions, setOpenSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setTitle("");
      setContent("");
      setTerm("");
      setDraft(false);
      setSelectedCourse("");
      setProfessorQuery("");
      setProfessorId("");
      setProfessorName("");
      setSuggestions([]);
      setOpenSuggestions(false);
    }
  }, [open]);

  useEffect(() => {
    if (professorQuery.trim().length < 2) {
      setSuggestions([]);
      setOpenSuggestions(false);
      return;
    }

    const handle = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/search/suggest?q=${encodeURIComponent(professorQuery.trim())}`
        );
        const payload = await response.json();
        const professorSuggestions: ProfessorSuggestion[] = (payload.professors ?? []).map(
          (item: { id: string; name: string; schoolName?: string | null }) => ({
            ...item,
            type: "professor" as const
          })
        );
        setSuggestions(professorSuggestions);
        setOpenSuggestions(true);
      } catch (error) {
        console.error(error);
        setSuggestions([]);
        setOpenSuggestions(false);
      }
    }, 250);

    return () => window.clearTimeout(handle);
  }, [professorQuery]);

  if (!open) return null;

  const handleSelectProfessor = (suggestion: ProfessorSuggestion) => {
    setProfessorId(suggestion.id);
    setProfessorName(suggestion.name);
    setProfessorQuery(suggestion.name);
    setOpenSuggestions(false);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!professorId) {
      toast.push("Select a professor before uploading.", "error");
      return;
    }

    setLoading(true);
    const response = await fetch("/api/materials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        content,
        professorId,
        courseId: selectedCourse || undefined,
        term,
        status: draft ? "DRAFT" : "PENDING"
      })
    });

    setLoading(false);

    if (!response.ok) {
      const payload = (await response.json()) as { error?: string };
      toast.push(payload.error ?? "Unable to upload material.", "error");
      return;
    }

    toast.push("Material uploaded successfully.", "success");
    router.refresh();
    onClose();
  };

  const suggestedCourses = scheduleCourses.length > 0;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-card">
        <div className="modal-header">
          <div>
            <h2>Upload material</h2>
            <p>Share study guides, notes, or tips with your classmates.</p>
          </div>
          <button type="button" className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <form className="settings-form" onSubmit={handleSubmit}>
          <label>
            Title
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="CHEM 1A Study Guide"
              required
            />
          </label>
          <label>
            Professor
            <input
              type="text"
              value={professorQuery}
              onChange={(event) => setProfessorQuery(event.target.value)}
              placeholder="Search professor"
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
              {suggestions.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="search__suggestion"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => handleSelectProfessor(item)}
                >
                  <span className="search__suggestion-main">
                    <span className="search__suggestion-title">{item.name}</span>
                    {item.schoolName && (
                      <span className="search__suggestion-subtitle">{item.schoolName}</span>
                    )}
                  </span>
                  <span className="search__suggestion-type">Professor</span>
                </button>
              ))}
            </div>
          )}
          {suggestedCourses && (
            <label>
              Link to a class (optional)
              <select
                value={selectedCourse}
                onChange={(event) => setSelectedCourse(event.target.value)}
              >
                <option value="">Select a class</option>
                {scheduleCourses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.courseNumber} · {course.name}
                  </option>
                ))}
              </select>
            </label>
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
            Content
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows={5}
              placeholder="Summaries, tips, or key study notes"
              required
            />
          </label>
          <label className="checkbox-field">
            <input
              type="checkbox"
              checked={draft}
              onChange={(event) => setDraft(event.target.checked)}
            />
            Save as draft
          </label>
          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? "Uploading..." : "Upload material"}
          </button>
        </form>
      </div>
    </div>
  );
}
