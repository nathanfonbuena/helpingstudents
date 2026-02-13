"use client";

import { useState } from "react";

const AVAILABLE_TAGS = [
  "Lab-based", "Writing Intensive", "Discussion-based", "Project-based",
  "Team collaboration", "Lecture-heavy", "Reading-intensive",
  "Flipped classroom", "Practical application", "Research-oriented",
  "Independent study", "STEM-intensive", "Seminar", "Field work",
  "Honors", "Service learning", "Online", "Hybrid"
];

interface CourseWithMeta {
  id: string;
  name: string;
  courseNumber: string;
  metadata: {
    tags: string[];
    gradeDistribution: Record<string, number> | null;
    classSize: number | null;
  } | null;
}

export default function CourseMetadataTagger({ courses }: { courses: CourseWithMeta[] }) {
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id ?? "");
  const [tagsByCourse, setTagsByCourse] = useState<Record<string, string[]>>(
    Object.fromEntries(courses.map((c) => [c.id, c.metadata?.tags ?? []]))
  );
  const [classSizeByCourse, setClassSizeByCourse] = useState<Record<string, string>>(
    Object.fromEntries(courses.map((c) => [c.id, String(c.metadata?.classSize ?? "")]))
  );
  const [saveStatus, setSaveStatus] = useState<Record<string, "idle" | "saving" | "saved" | "error">>({});

  const course = courses.find((c) => c.id === selectedCourseId);
  const tags = tagsByCourse[selectedCourseId] ?? [];
  const classSize = classSizeByCourse[selectedCourseId] ?? "";

  const toggleTag = (tag: string) => {
    setTagsByCourse((prev) => {
      const current = prev[selectedCourseId] ?? [];
      return {
        ...prev,
        [selectedCourseId]: current.includes(tag)
          ? current.filter((t) => t !== tag)
          : [...current, tag]
      };
    });
  };

  const saveMetadata = async () => {
    setSaveStatus((prev) => ({ ...prev, [selectedCourseId]: "saving" }));

    try {
      const res = await fetch("/api/professor/course-metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: selectedCourseId,
          tags,
          classSize: classSize ? parseInt(classSize) : undefined
        })
      });

      setSaveStatus((prev) => ({
        ...prev,
        [selectedCourseId]: res.ok ? "saved" : "error"
      }));
      setTimeout(() => {
        setSaveStatus((prev) => ({ ...prev, [selectedCourseId]: "idle" }));
      }, 3000);
    } catch {
      setSaveStatus((prev) => ({ ...prev, [selectedCourseId]: "error" }));
    }
  };

  if (courses.length === 0) {
    return (
      <section className="portal-section">
        <h2>Course Metadata</h2>
        <p className="empty-panel">No courses assigned to your profile yet.</p>
      </section>
    );
  }

  const status = saveStatus[selectedCourseId] ?? "idle";

  return (
    <section className="portal-section">
      <h2>Course Metadata</h2>
      <p className="portal-section__desc">
        Add tags and context to help students understand what to expect from each course.
      </p>

      <div className="form-field">
        <label className="form-label">Select course</label>
        <select
          className="form-select"
          value={selectedCourseId}
          onChange={(e) => setSelectedCourseId(e.target.value)}
        >
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.courseNumber} — {c.name}
            </option>
          ))}
        </select>
      </div>

      {course && (
        <>
          <div className="form-field">
            <label className="form-label">Course tags</label>
            <p className="form-hint">Select all that apply to this course.</p>
            <div className="tag-grid">
              {AVAILABLE_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className={`tag-btn ${tags.includes(tag) ? "tag-btn--selected" : ""}`}
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="class-size" className="form-label">
              Typical class size
            </label>
            <input
              id="class-size"
              type="number"
              className="form-input form-input--sm"
              min={1}
              max={500}
              placeholder="e.g. 30"
              value={classSize}
              onChange={(e) => setClassSizeByCourse((prev) => ({ ...prev, [selectedCourseId]: e.target.value }))}
            />
          </div>

          <div className="portal-section__actions">
            <button
              className="btn btn--primary"
              onClick={saveMetadata}
              disabled={status === "saving"}
            >
              {status === "saving" ? "Saving…" : status === "saved" ? "Saved ✓" : "Save metadata"}
            </button>
            {status === "error" && <span className="form-error">Failed to save.</span>}
          </div>
        </>
      )}
    </section>
  );
}
