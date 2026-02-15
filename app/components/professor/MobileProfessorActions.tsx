"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import FollowButton from "@/app/components/FollowButton";
import { useToast } from "@/app/components/ToastProvider";
import { trackEvent } from "@/app/lib/analytics";

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
  const toast = useToast();
  const storageKey = useMemo(() => "saved-professors:v1", []);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return;
    const savedSlugs = new Set<string>(JSON.parse(raw));
    setSaved(savedSlugs.has(professorSlug));
  }, [professorSlug, storageKey]);

  useEffect(() => {
    if (window.matchMedia("(max-width: 700px)").matches) {
      trackEvent("prof_mobile_cta_impression", { professor_slug: professorSlug });
    }
  }, [professorSlug]);

  const toggleSave = () => {
    const raw = window.localStorage.getItem(storageKey);
    const savedSlugs = new Set<string>(raw ? JSON.parse(raw) : []);
    let nextSaved = false;
    if (savedSlugs.has(professorSlug)) {
      savedSlugs.delete(professorSlug);
      nextSaved = false;
    } else {
      savedSlugs.add(professorSlug);
      nextSaved = true;
    }
    setSaved(nextSaved);
    window.localStorage.setItem(storageKey, JSON.stringify(Array.from(savedSlugs)));
    trackEvent("prof_mobile_cta_click", {
      action_type: "save",
      professor_slug: professorSlug,
      next_state: nextSaved ? "saved" : "unsaved"
    });
    toast.push(nextSaved ? "Professor saved." : "Professor removed from saved.", "success");
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
        onClick={() =>
          trackEvent("prof_mobile_cta_click", {
            action_type: "follow",
            professor_slug: professorSlug
          })
        }
      />
      <Link
        className="primary-button button--sm"
        href={`/professor/${professorSlug}?writeReview=1#reviews`}
        onClick={() =>
          trackEvent("prof_mobile_cta_click", {
            action_type: "write_review",
            professor_slug: professorSlug
          })
        }
      >
        Write Review
      </Link>
    </div>
  );
}
