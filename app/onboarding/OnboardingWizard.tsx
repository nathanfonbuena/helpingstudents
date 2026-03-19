"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import SchoolAutocomplete from "@/app/components/SchoolAutocomplete";
import CourseSearchBox from "@/app/components/CourseSearchBox";
import { trackEvent } from "@/app/lib/analytics";

type RoleChoice = "STUDENT" | "PROFESSOR";
type OnboardingStep = "role" | "school" | "courses" | "complete";

interface SelectedCourse {
  id: string;
  name: string;
  courseNumber: string;
}

interface OnboardingWizardProps {
  defaultRole: RoleChoice;
  existingSchoolId?: string;
  existingSchoolName?: string;
}

const STEP_ORDER: OnboardingStep[] = ["role", "school", "courses"];

function StepIndicator({ currentStep }: { currentStep: OnboardingStep }) {
  const steps = [
    { key: "role", label: "Your Role", number: 1 },
    { key: "school", label: "Your School", number: 2 },
    { key: "courses", label: "Your Courses", number: 3 }
  ] as const;

  const currentIndex = STEP_ORDER.indexOf(currentStep);

  return (
    <div className="onboarding__progress">
      {steps.map((step, index) => {
        const isActive = currentIndex >= index || currentStep === "complete";
        return (
          <div key={step.key} className="onboarding__step-group">
            {index > 0 && <div className="onboarding__step-connector" />}
            <div className={`onboarding__step ${isActive ? "onboarding__step--active" : ""}`}>
              <span className="onboarding__step-number">{step.number}</span>
              <span className="onboarding__step-label">{step.label}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function OnboardingWizard({
  defaultRole,
  existingSchoolId = "",
  existingSchoolName = ""
}: OnboardingWizardProps) {
  const router = useRouter();
  const { update: updateSession } = useSession();

  const [step, setStep] = useState<OnboardingStep>(
    existingSchoolId ? "courses" : "role"
  );
  const [role, setRole] = useState<RoleChoice>(defaultRole);
  const [schoolId, setSchoolId] = useState(existingSchoolId);
  const [schoolName, setSchoolName] = useState(existingSchoolName);
  const [selectedCourses, setSelectedCourses] = useState<SelectedCourse[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Persistence helpers ──────────────────────────────────────────────

  async function saveRoleAndSchool(payload: {
    role: RoleChoice;
    schoolId?: string;
    completeOnboarding?: boolean;
  }) {
    const response = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      throw new Error(data.error ?? "Failed to save your preferences.");
    }
  }

  async function saveCourses(courses: SelectedCourse[]) {
    for (const course of courses) {
      const response = await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: course.id })
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? `Failed to add ${course.courseNumber} to your schedule.`);
      }
    }
  }

  async function markOnboardingComplete() {
    await saveRoleAndSchool({ role, completeOnboarding: true });
    // Refresh the session so onboardingCompletedAt is available immediately
    await updateSession();
  }

  function redirectAfterOnboarding() {
    const redirect = typeof window !== "undefined"
      ? window.sessionStorage.getItem("postOnboardingRedirect")
      : null;
    if (redirect) {
      window.sessionStorage.removeItem("postOnboardingRedirect");
      router.push(redirect);
    } else {
      router.push(role === "PROFESSOR" ? "/professor-portal" : "/");
    }
  }

  // ── Step handlers ────────────────────────────────────────────────────

  async function handleRoleContinue() {
    setError(null);
    setSaving(true);
    try {
      await saveRoleAndSchool({ role });
      trackEvent("onboarding_step_1_complete", { role });
      setStep("school");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSchoolContinue() {
    if (!schoolId) return;
    setError(null);
    setSaving(true);
    try {
      await saveRoleAndSchool({ role, schoolId });
      trackEvent("onboarding_step_2_complete", { role, has_school: true });
      setStep("courses");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  async function handleCoursesFinish() {
    setError(null);
    setSaving(true);
    try {
      if (selectedCourses.length > 0) {
        await saveCourses(selectedCourses);
      }
      trackEvent("onboarding_step_3_complete", {
        course_count: selectedCourses.length
      });
      await markOnboardingComplete();
      setStep("complete");
      setTimeout(redirectAfterOnboarding, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSkip() {
    trackEvent("onboarding_skip", { from_step: step });
    setSaving(true);
    try {
      await markOnboardingComplete();
      redirectAfterOnboarding();
    } catch {
      // Even if marking fails, still redirect — don't trap the user
      redirectAfterOnboarding();
    }
  }

  function handleCourseSelect(course: { id: string; name: string; courseNumber: string }) {
    if (!selectedCourses.some((c) => c.id === course.id)) {
      setSelectedCourses((prev) => [...prev, {
        id: course.id,
        name: course.name,
        courseNumber: course.courseNumber
      }]);
    }
  }

  function handleCourseRemove(courseId: string) {
    setSelectedCourses((prev) => prev.filter((c) => c.id !== courseId));
  }

  // ── Render ───────────────────────────────────────────────────────────

  if (step === "complete") {
    return (
      <main className="onboarding">
        <div className="onboarding__container">
          <StepIndicator currentStep="complete" />
          <div className="onboarding__panel onboarding__panel--complete">
            <div className="onboarding__success-icon">&#10003;</div>
            <h1 className="onboarding__title">You&apos;re all set!</h1>
            <p className="onboarding__description">
              {selectedCourses.length > 0
                ? "Your courses have been added to your schedule. Redirecting..."
                : "Your profile is ready. Redirecting..."}
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="onboarding">
      <div className="onboarding__container">
        <StepIndicator currentStep={step} />

        {/* Step 1: Role Selection */}
        {step === "role" && (
          <div className="onboarding__panel">
            <h1 className="onboarding__title">Welcome to Knocore</h1>
            <p className="onboarding__description">
              Tell us about yourself so we can personalize your experience.
            </p>

            <div className="onboarding__role-choices">
              <button
                type="button"
                className={`onboarding__role-choice ${
                  role === "STUDENT" ? "onboarding__role-choice--active" : ""
                }`}
                onClick={() => setRole("STUDENT")}
              >
                <span className="onboarding__role-label">I am a student</span>
                <span className="onboarding__role-hint">
                  Find professors, read reviews, and build your schedule.
                </span>
              </button>
              <button
                type="button"
                className={`onboarding__role-choice ${
                  role === "PROFESSOR" ? "onboarding__role-choice--active" : ""
                }`}
                onClick={() => setRole("PROFESSOR")}
              >
                <span className="onboarding__role-label">I am a professor</span>
                <span className="onboarding__role-hint">
                  Claim your profile, upload syllabi, and respond to reviews.
                </span>
              </button>
            </div>

            {role === "PROFESSOR" && (
              <p className="onboarding__note">
                After setup, you&apos;ll be able to claim your professor profile
                in the Professor Portal.
              </p>
            )}

            {error && <p className="onboarding__error">{error}</p>}

            <div className="onboarding__actions">
              <button
                type="button"
                className="onboarding__skip"
                onClick={handleSkip}
                disabled={saving}
              >
                Skip for now
              </button>
              <button
                type="button"
                className="onboarding__submit"
                onClick={handleRoleContinue}
                disabled={saving}
              >
                {saving ? "Saving..." : "Continue"}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: School Selection */}
        {step === "school" && (
          <div className="onboarding__panel">
            <h1 className="onboarding__title">Find your school</h1>
            <p className="onboarding__description">
              Pick your school to see relevant professors and courses.
            </p>

            <div className="onboarding__search">
              <SchoolAutocomplete
                value={schoolId}
                onChange={(id, name) => {
                  setSchoolId(id);
                  setSchoolName(name);
                }}
                initialSchoolName={schoolName}
                placeholder="Search your school..."
              />
            </div>

            <div className="onboarding__hint">
              <p>Try &quot;UC Berkeley&quot;, &quot;MIT&quot;, or &quot;University of Texas&quot;</p>
            </div>

            {error && <p className="onboarding__error">{error}</p>}

            <div className="onboarding__actions">
              <button
                type="button"
                className="onboarding__skip"
                onClick={handleSkip}
                disabled={saving}
              >
                Skip for now
              </button>
              <button
                type="button"
                className="onboarding__submit"
                onClick={handleSchoolContinue}
                disabled={saving || !schoolId}
              >
                {saving ? "Saving..." : "Continue"}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Course Selection */}
        {step === "courses" && (
          <div className="onboarding__panel">
            {schoolName && (
              <p className="onboarding__school-badge">
                <strong>{schoolName}</strong>
                <button
                  type="button"
                  className="onboarding__school-change"
                  onClick={() => {
                    setStep("school");
                    setSchoolId("");
                    setSchoolName("");
                    setSelectedCourses([]);
                  }}
                >
                  Change
                </button>
              </p>
            )}

            <h1 className="onboarding__title">Add your courses</h1>
            <p className="onboarding__description">
              Search and add the courses you&apos;re taking this semester.
            </p>

            {schoolId ? (
              <div className="onboarding__search">
                <CourseSearchBox
                  schoolId={schoolId}
                  onSelect={handleCourseSelect}
                  selectedCourses={selectedCourses.map((c) => c.id)}
                  placeholder="Search by course name or number..."
                />
              </div>
            ) : (
              <p className="onboarding__note">
                Go back and select a school to search for courses.
              </p>
            )}

            {selectedCourses.length > 0 && (
              <div className="onboarding__selected">
                <h3 className="onboarding__selected-title">
                  Selected Courses ({selectedCourses.length})
                </h3>
                <ul className="onboarding__course-list">
                  {selectedCourses.map((course) => (
                    <li key={course.id} className="onboarding__course-item">
                      <span className="onboarding__course-info">
                        <strong>{course.courseNumber}</strong> &middot; {course.name}
                      </span>
                      <button
                        className="onboarding__course-remove"
                        type="button"
                        onClick={() => handleCourseRemove(course.id)}
                        aria-label={`Remove ${course.courseNumber}`}
                      >
                        &times;
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {error && <p className="onboarding__error">{error}</p>}

            <div className="onboarding__actions">
              <button
                type="button"
                className="onboarding__skip"
                onClick={handleSkip}
                disabled={saving}
              >
                Skip for now
              </button>
              <button
                type="button"
                className="onboarding__submit"
                onClick={handleCoursesFinish}
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : selectedCourses.length > 0
                    ? `Add ${selectedCourses.length} course${selectedCourses.length !== 1 ? "s" : ""} & finish`
                    : "Finish setup"}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
