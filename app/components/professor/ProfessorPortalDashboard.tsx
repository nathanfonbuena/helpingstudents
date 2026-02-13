"use client";

import { useState } from "react";
import SyllabusUploadForm from "./SyllabusUploadForm";
import CourseMetadataTagger from "./CourseMetadataTagger";
import ProfessorReplyPanel from "./ProfessorReplyPanel";

interface Course {
  id: string;
  name: string;
  courseNumber: string;
  metadata: { tags: string[]; gradeDistribution: Record<string, number> | null; classSize: number | null } | null;
}

interface PendingReply {
  reviewId: string;
  reviewBody: string;
  reviewRating: number;
  reviewDate: Date;
}

interface ProfessorPortalDashboardProps {
  professorId: string;
  professorName: string;
  professorSlug: string;
  bio: string | null;
  isClaimed: boolean;
  syllabusUrl: string | null;
  syllabusFilename: string | null;
  syllabusUploadedAt: Date | null;
  courses: Course[];
  reviewsWithoutResponse: PendingReply[];
}

type Tab = "overview" | "syllabus" | "courses" | "replies";

export default function ProfessorPortalDashboard({
  professorId,
  professorName,
  professorSlug,
  bio,
  isClaimed,
  syllabusUrl,
  syllabusFilename,
  syllabusUploadedAt,
  courses,
  reviewsWithoutResponse
}: ProfessorPortalDashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [currentBio, setCurrentBio] = useState(bio ?? "");
  const [bioStatus, setBioStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const saveBio = async () => {
    setBioStatus("saving");
    try {
      const res = await fetch("/api/professor/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio: currentBio })
      });
      setBioStatus(res.ok ? "saved" : "error");
      setTimeout(() => setBioStatus("idle"), 3000);
    } catch {
      setBioStatus("error");
    }
  };

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "overview", label: "Overview" },
    { id: "syllabus", label: "Syllabus" },
    { id: "courses", label: "Courses", count: courses.length },
    { id: "replies", label: "Reply to Reviews", count: reviewsWithoutResponse.length }
  ];

  return (
    <div className="portal-dashboard">
      <div className="portal-dashboard__header">
        <div>
          <h1 className="portal-dashboard__title">Professor Portal</h1>
          <p className="portal-dashboard__subtitle">
            {professorName} ·{" "}
            {isClaimed ? (
              <span className="claimed-badge">✓ Claimed Profile</span>
            ) : (
              <span className="unclaimed-badge">Unclaimed</span>
            )}
          </p>
        </div>
        <a
          href={`/professor/${professorSlug}`}
          className="btn btn--ghost btn--sm portal-dashboard__view-link"
        >
          View my profile →
        </a>
      </div>

      <nav className="portal-tabs" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`portal-tab ${activeTab === tab.id ? "portal-tab--active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className="portal-tab__count">{tab.count}</span>
            )}
          </button>
        ))}
      </nav>

      <div className="portal-content">
        {activeTab === "overview" && (
          <section className="portal-section">
            <h2>Your Bio</h2>
            <p className="portal-section__desc">
              Add context about your research, teaching philosophy, and background.
              This appears on your public profile page.
            </p>
            <textarea
              className="form-textarea"
              rows={5}
              value={currentBio}
              onChange={(e) => setCurrentBio(e.target.value)}
              placeholder="Share your background, research interests, and teaching philosophy…"
              maxLength={1000}
            />
            <div className="portal-section__actions">
              <button
                className="btn btn--primary"
                onClick={saveBio}
                disabled={bioStatus === "saving"}
              >
                {bioStatus === "saving" ? "Saving…" : bioStatus === "saved" ? "Saved ✓" : "Save bio"}
              </button>
              {bioStatus === "error" && (
                <span className="form-error">Failed to save. Please try again.</span>
              )}
            </div>
          </section>
        )}

        {activeTab === "syllabus" && (
          <SyllabusUploadForm
            currentUrl={syllabusUrl}
            currentFilename={syllabusFilename}
            uploadedAt={syllabusUploadedAt}
          />
        )}

        {activeTab === "courses" && (
          <CourseMetadataTagger courses={courses} />
        )}

        {activeTab === "replies" && (
          <ProfessorReplyPanel reviews={reviewsWithoutResponse} />
        )}
      </div>
    </div>
  );
}
