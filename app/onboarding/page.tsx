"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SchoolSearchBox from "@/app/components/SchoolSearchBox";
import CourseSearchBox from "@/app/components/CourseSearchBox";

interface SelectedSchool {
  id: string;
  name: string;
  slug: string;
  city: string | null;
  state: string | null;
  type: "TWO_YEAR" | "FOUR_YEAR" | null;
  location: string | null;
}

interface SelectedCourse {
  id: string;
  name: string;
  courseNumber: string;
}

type OnboardingStep = "school" | "courses" | "complete";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<OnboardingStep>("school");
  const [selectedSchool, setSelectedSchool] = useState<SelectedSchool | null>(null);
  const [selectedCourses, setSelectedCourses] = useState<SelectedCourse[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSchoolSelect = (school: SelectedSchool) => {
    setSelectedSchool(school);
    setStep("courses");
    setSelectedCourses([]);
  };

  const handleCourseSelect = (course: { id: string; name: string; courseNumber: string }) => {
    if (!selectedCourses.some((c) => c.id === course.id)) {
      setSelectedCourses([...selectedCourses, {
        id: course.id,
        name: course.name,
        courseNumber: course.courseNumber
      }]);
    }
  };

  const handleRemoveCourse = (courseId: string) => {
    setSelectedCourses(selectedCourses.filter((c) => c.id !== courseId));
  };

  const handleBack = () => {
    if (step === "courses") {
      setStep("school");
      setSelectedSchool(null);
      setSelectedCourses([]);
    }
  };

  const handleComplete = async () => {
    if (!selectedSchool || selectedCourses.length === 0) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Save courses to schedule
      for (const course of selectedCourses) {
        const response = await fetch("/api/schedule", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ courseId: course.id })
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to add course to schedule");
        }
      }

      setStep("complete");

      // Redirect after brief delay
      setTimeout(() => {
        router.push("/account");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const formatSchoolType = (type: "TWO_YEAR" | "FOUR_YEAR" | null) => {
    if (type === "TWO_YEAR") return "2-Year Institution";
    if (type === "FOUR_YEAR") return "4-Year Institution";
    return "";
  };

  return (
    <main className="onboarding">
      <div className="onboarding__container">
        {/* Progress indicator */}
        <div className="onboarding__progress">
          <div
            className={`onboarding__step ${step === "school" || step === "courses" || step === "complete" ? "onboarding__step--active" : ""}`}
          >
            <span className="onboarding__step-number">1</span>
            <span className="onboarding__step-label">Select School</span>
          </div>
          <div className="onboarding__step-connector" />
          <div
            className={`onboarding__step ${step === "courses" || step === "complete" ? "onboarding__step--active" : ""}`}
          >
            <span className="onboarding__step-number">2</span>
            <span className="onboarding__step-label">Add Courses</span>
          </div>
        </div>

        {/* Step 1: School Selection */}
        {step === "school" && (
          <div className="onboarding__panel">
            <h1 className="onboarding__title">Find Your School</h1>
            <p className="onboarding__description">
              Search for your college or university to get started.
            </p>

            <div className="onboarding__search">
              <SchoolSearchBox
                onSelect={handleSchoolSelect}
                navigateOnSelect={false}
                placeholder="Search by school name..."
              />
            </div>

            <div className="onboarding__hint">
              <p>Search for schools like "UC Berkeley", "MIT", or "University of Texas"</p>
            </div>
          </div>
        )}

        {/* Step 2: Course Selection */}
        {step === "courses" && selectedSchool && (
          <div className="onboarding__panel">
            <button
              className="onboarding__back"
              type="button"
              onClick={handleBack}
            >
              ← Change School
            </button>

            <div className="onboarding__school-info">
              <h2 className="onboarding__school-name">{selectedSchool.name}</h2>
              {(selectedSchool.location || selectedSchool.type) && (
                <p className="onboarding__school-meta">
                  {selectedSchool.location}
                  {selectedSchool.location && selectedSchool.type && " · "}
                  {formatSchoolType(selectedSchool.type)}
                </p>
              )}
            </div>

            <h1 className="onboarding__title">Add Your Courses</h1>
            <p className="onboarding__description">
              Search and add the courses you're taking this semester.
            </p>

            <div className="onboarding__search">
              <CourseSearchBox
                schoolId={selectedSchool.id}
                onSelect={handleCourseSelect}
                selectedCourses={selectedCourses.map((c) => c.id)}
                placeholder="Search by course name or number..."
              />
            </div>

            {selectedCourses.length > 0 && (
              <div className="onboarding__selected">
                <h3 className="onboarding__selected-title">
                  Selected Courses ({selectedCourses.length})
                </h3>
                <ul className="onboarding__course-list">
                  {selectedCourses.map((course) => (
                    <li key={course.id} className="onboarding__course-item">
                      <span className="onboarding__course-info">
                        <strong>{course.courseNumber}</strong> · {course.name}
                      </span>
                      <button
                        className="onboarding__course-remove"
                        type="button"
                        onClick={() => handleRemoveCourse(course.id)}
                        aria-label={`Remove ${course.courseNumber}`}
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {error && (
              <div className="onboarding__error">
                {error}
              </div>
            )}

            <div className="onboarding__actions">
              <button
                className="onboarding__submit"
                type="button"
                onClick={handleComplete}
                disabled={selectedCourses.length === 0 || saving}
              >
                {saving ? "Saving..." : `Add ${selectedCourses.length} Course${selectedCourses.length !== 1 ? "s" : ""} to Schedule`}
              </button>
              <button
                className="onboarding__skip"
                type="button"
                onClick={() => router.push("/account")}
              >
                Skip for now
              </button>
            </div>
          </div>
        )}

        {/* Complete */}
        {step === "complete" && (
          <div className="onboarding__panel onboarding__panel--complete">
            <div className="onboarding__success-icon">✓</div>
            <h1 className="onboarding__title">You're All Set!</h1>
            <p className="onboarding__description">
              Your courses have been added to your schedule.
              Redirecting to your account...
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
