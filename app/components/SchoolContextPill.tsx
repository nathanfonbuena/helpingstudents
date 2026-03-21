"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import SchoolAutocomplete from "@/app/components/SchoolAutocomplete";

const LS_KEY = "schoolContext:v1";

interface StoredSchoolContext {
  schoolId: string;
  schoolName: string;
}

export default function SchoolContextPill() {
  const { data: session, status, update: updateSession } = useSession();
  const router = useRouter();
  const isAuthed = status === "authenticated";

  const [mode, setMode] = useState<"display" | "edit">("display");
  const [localSchool, setLocalSchool] = useState<StoredSchoolContext | null>(null);
  const [mounted, setMounted] = useState(false);

  // Hydration-safe: read localStorage after mount
  useEffect(() => {
    setMounted(true);
    if (!isAuthed) {
      try {
        const raw = localStorage.getItem(LS_KEY);
        if (raw) {
          setLocalSchool(JSON.parse(raw));
        }
      } catch {
        // Ignore parse errors
      }
    }
  }, [isAuthed]);

  const schoolId = isAuthed
    ? session?.user?.primarySchoolId ?? ""
    : localSchool?.schoolId ?? "";
  const schoolName = isAuthed
    ? session?.user?.primarySchoolName ?? ""
    : localSchool?.schoolName ?? "";

  const handleSchoolSelect = useCallback(
    async (newSchoolId: string, newSchoolName: string) => {
      if (!newSchoolId) return;

      if (isAuthed) {
        try {
          await fetch("/api/account/profile", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ schoolId: newSchoolId })
          });
          await updateSession();
        } catch {
          // Silently fail — user can retry
        }
      } else {
        const ctx: StoredSchoolContext = { schoolId: newSchoolId, schoolName: newSchoolName };
        localStorage.setItem(LS_KEY, JSON.stringify(ctx));
        setLocalSchool(ctx);
      }

      setMode("display");
      router.refresh();
    },
    [isAuthed, updateSession, router]
  );

  const handleClear = useCallback(async () => {
    if (isAuthed) {
      try {
        await fetch("/api/account/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ schoolId: "" })
        });
        await updateSession();
      } catch {
        // Silently fail
      }
    } else {
      localStorage.removeItem(LS_KEY);
      setLocalSchool(null);
    }
    setMode("display");
    router.refresh();
  }, [isAuthed, updateSession, router]);

  if (!mounted) return null;

  // Edit mode: inline autocomplete
  if (mode === "edit") {
    return (
      <div className="sidebar__school-pill">
        <SchoolAutocomplete
          value=""
          onChange={handleSchoolSelect}
          placeholder="Search for a school..."
        />
        <button
          type="button"
          className="sidebar__school-pill-cancel"
          onClick={() => setMode("display")}
        >
          Cancel
        </button>
      </div>
    );
  }

  // No school set
  if (!schoolId) {
    if (isAuthed) {
      return (
        <div className="sidebar__school-pill">
          <button
            type="button"
            className="sidebar__school-pill-prompt"
            onClick={() => setMode("edit")}
          >
            Set your school
          </button>
        </div>
      );
    }
    return (
      <div className="sidebar__school-pill">
        <button
          type="button"
          className="sidebar__school-pill-prompt"
          onClick={() => setMode("edit")}
        >
          Pick a school
        </button>
      </div>
    );
  }

  // School is set — display mode
  return (
    <div className="sidebar__school-pill">
      <a
        href={`/?schoolId=${encodeURIComponent(schoolId)}`}
        className="sidebar__school-pill-name"
      >
        {schoolName}
      </a>
      <div className="sidebar__school-pill-actions">
        <button
          type="button"
          className="sidebar__school-pill-change"
          onClick={() => setMode("edit")}
        >
          Change
        </button>
        <button
          type="button"
          className="sidebar__school-pill-clear"
          onClick={handleClear}
          aria-label="Clear school"
        >
          &times;
        </button>
      </div>
    </div>
  );
}
