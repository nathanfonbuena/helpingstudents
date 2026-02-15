"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import FollowButton from "@/app/components/FollowButton";

interface MobileProfessorActionsProps {
  professorId: string;
  professorSlug: string;
  initialFollowing: boolean;
}

export default function MobileProfessorActions({
  professorId,
  professorSlug,
  initialFollowing
}: MobileProfessorActionsProps) {
  const storageKey = useMemo(() => "saved-professors:v1", []);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return;
    const savedSlugs = new Set<string>(JSON.parse(raw));
    setSaved(savedSlugs.has(professorSlug));
  }, [professorSlug, storageKey]);

  const toggleSave = () => {
    const raw = window.localStorage.getItem(storageKey);
    const savedSlugs = new Set<string>(raw ? JSON.parse(raw) : []);
    if (savedSlugs.has(professorSlug)) {
      savedSlugs.delete(professorSlug);
      setSaved(false);
    } else {
      savedSlugs.add(professorSlug);
      setSaved(true);
    }
    window.localStorage.setItem(storageKey, JSON.stringify(Array.from(savedSlugs)));
  };

  return (
    <div className="mobile-professor-actions" aria-label="Quick actions">
      <button type="button" className="ghost-button button--sm" onClick={toggleSave}>
        {saved ? "Saved" : "Save"}
      </button>
      <FollowButton
        professorId={professorId}
        professorSlug={professorSlug}
        initialFollowing={initialFollowing}
      />
      <Link className="primary-button button--sm" href={`/professor/${professorSlug}?writeReview=1#reviews`}>
        Write Review
      </Link>
    </div>
  );
}
