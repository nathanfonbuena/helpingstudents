"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import SchoolAutocomplete from "@/app/components/SchoolAutocomplete";
import { trackEvent } from "@/app/lib/analytics";

interface FirstRunPromptProps {
  initialSchoolId?: string;
  initialSchoolName?: string;
}

type RoleChoice = "STUDENT" | "PROFESSOR";
const FIRST_RUN_SELECTION_KEY = "firstRunSelection:v1";

export default function FirstRunPrompt({
  initialSchoolId = "",
  initialSchoolName = ""
}: FirstRunPromptProps) {
  const { data: session, status } = useSession();
  const userId = session?.user?.id;
  const defaultRole = (session?.user?.role as RoleChoice | undefined) ?? "STUDENT";
  const storageKey = useMemo(
    () => `firstRunPrompt:v1:${userId ?? "guest"}`,
    [userId]
  );

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [role, setRole] = useState<RoleChoice>(defaultRole);
  const [schoolId, setSchoolId] = useState(initialSchoolId);
  const [schoolName, setSchoolName] = useState(initialSchoolName);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewTracked, setViewTracked] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    if (userId && initialSchoolId) {
      window.localStorage.setItem(storageKey, "completed");
      setOpen(false);
      return;
    }

    const storedSelection = window.localStorage.getItem(FIRST_RUN_SELECTION_KEY);
    if (storedSelection) {
      try {
        const parsed = JSON.parse(storedSelection) as {
          role?: RoleChoice;
          schoolId?: string;
          schoolName?: string;
        };
        if (parsed.role) setRole(parsed.role);
        if (parsed.schoolId) setSchoolId(parsed.schoolId);
        if (parsed.schoolName) setSchoolName(parsed.schoolName);
      } catch {
        // Ignore malformed local storage payloads.
      }
    }

    const persisted = window.localStorage.getItem(storageKey);
    if (!persisted) {
      setOpen(true);
    }
  }, [initialSchoolId, status, storageKey, userId]);

  useEffect(() => {
    if (!open || viewTracked) return;
    trackEvent("onboarding_prompt_view", {
      step: step === 1 ? "role" : "school",
      user_state: userId ? "signed_in" : "guest"
    });
    setViewTracked(true);
  }, [open, step, userId, viewTracked]);

  useEffect(() => {
    window.localStorage.setItem(
      FIRST_RUN_SELECTION_KEY,
      JSON.stringify({
        role,
        schoolId,
        schoolName
      })
    );
  }, [role, schoolId, schoolName]);

  const closePrompt = (state: "dismissed" | "completed") => {
    window.localStorage.setItem(storageKey, state);
    if (state === "completed") {
      window.localStorage.removeItem(FIRST_RUN_SELECTION_KEY);
      trackEvent("onboarding_prompt_complete", {
        role,
        has_school: Boolean(schoolId)
      });
    } else {
      trackEvent("onboarding_prompt_dismiss", {
        step: step === 1 ? "role" : "school"
      });
    }
    setOpen(false);
  };

  const saveProfileSchool = async () => {
    if (!userId || !schoolId) return;
    const response = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ schoolId, role })
    });
    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(payload.error ?? "Unable to save your school.");
    }
  };

  const complete = async () => {
    setError(null);
    setSaving(true);
    try {
      await saveProfileSchool();
      closePrompt("completed");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save preferences.");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-card first-run-prompt">
        <div className="modal-header">
          <div>
            <h2>Quick setup</h2>
            <p>Two fast steps to personalize Knocore for you.</p>
          </div>
          <button type="button" className="modal-close" onClick={() => closePrompt("dismissed")}>
            ×
          </button>
        </div>

        {step === 1 && (
          <div className="modal-body">
            <div className="first-run-prompt__choices">
              <button
                type="button"
                className={`first-run-prompt__choice ${
                  role === "STUDENT" ? "first-run-prompt__choice--active" : ""
                }`}
                onClick={() => setRole("STUDENT")}
              >
                I am a student
              </button>
              <button
                type="button"
                className={`first-run-prompt__choice ${
                  role === "PROFESSOR" ? "first-run-prompt__choice--active" : ""
                }`}
                onClick={() => setRole("PROFESSOR")}
              >
                I am a professor
              </button>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn--ghost" onClick={() => closePrompt("dismissed")}>
                Skip for now
              </button>
              <button type="button" className="btn btn--primary" onClick={() => setStep(2)}>
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="modal-body">
            <div className="modal-field">
              <label>School</label>
              <SchoolAutocomplete
                value={schoolId}
                onChange={(id, name) => {
                  setSchoolId(id);
                  setSchoolName(name);
                }}
                initialSchoolName={schoolName}
                placeholder="Search your school..."
              />
              <p className="modal-hint">Pick your school to get tailored recommendations and trends.</p>
            </div>
            {error && <p className="form-error">{error}</p>}
            <div className="modal-actions">
              <button type="button" className="btn btn--ghost" onClick={() => setStep(1)} disabled={saving}>
                Back
              </button>
              <button type="button" className="btn btn--primary" onClick={complete} disabled={saving || !schoolId}>
                {saving ? "Saving..." : role === "PROFESSOR" ? "Finish setup" : "Finish setup"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
