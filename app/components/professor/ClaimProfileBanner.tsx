"use client";

import { useState } from "react";
import Link from "next/link";

interface ClaimProfileBannerProps {
  professorId: string;
  isClaimed: boolean;
  syllabusUrl: string | null;
  bio: string | null;
  isOwner: boolean; // is the logged-in user this professor?
}

export default function ClaimProfileBanner({
  isClaimed,
  syllabusUrl,
  bio,
  isOwner
}: ClaimProfileBannerProps) {
  if (!isClaimed) return null;

  return (
    <div className="claimed-section">
      {bio && (
        <div className="claimed-section__bio">
          <h3>From the Professor</h3>
          <p>{bio}</p>
        </div>
      )}

      {syllabusUrl && (
        <div className="claimed-section__syllabus">
          <span className="claimed-section__syllabus-icon">📄</span>
          <div>
            <p className="claimed-section__syllabus-label">Official Syllabus</p>
            <a
              href={syllabusUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--outline btn--sm"
            >
              View Syllabus PDF →
            </a>
          </div>
        </div>
      )}

      {isOwner && (
        <div className="claimed-section__manage">
          <Link href="/professor-portal" className="btn btn--ghost btn--sm">
            Manage your portal →
          </Link>
        </div>
      )}
    </div>
  );
}
