"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/app/components/ToastProvider";
import SchoolAutocomplete from "@/app/components/SchoolAutocomplete";

interface AccountProfileModalProps {
  open: boolean;
  onClose: () => void;
  schools: { id: string; name: string }[];
  initialSchoolId: string;
  initialMajor: string;
  initialYear: string;
}

export default function AccountProfileModal({
  open,
  onClose,
  schools,
  initialSchoolId,
  initialMajor,
  initialYear
}: AccountProfileModalProps) {
  const router = useRouter();
  const toast = useToast();

  // Find the initial school name from the schools list
  const initialSchool = schools.find(s => s.id === initialSchoolId);
  const initialSchoolName = initialSchool?.name ?? "";

  const [schoolId, setSchoolId] = useState(initialSchoolId);
  const [major, setMajor] = useState(initialMajor);
  const [year, setYear] = useState(initialYear);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleClose = () => {
    if (!loading) onClose();
  };

  const handleSchoolChange = (newSchoolId: string, _schoolName: string) => {
    setSchoolId(newSchoolId);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);
    setLoading(true);

    const response = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ schoolId, major, year })
    });

    setLoading(false);

    if (!response.ok) {
      const payload = (await response.json()) as { error?: string };
      const message = payload.error ?? "Unable to update profile.";
      setStatus(message);
      toast.push(message, "error");
      return;
    }

    setStatus("Profile updated successfully.");
    toast.push("Profile updated successfully.", "success");
    router.refresh();
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-card">
        <div className="modal-header">
          <div>
            <h2>Complete your profile</h2>
            <p>Update your school, major, and graduation year.</p>
          </div>
          <button type="button" className="modal-close" onClick={handleClose}>
            ×
          </button>
        </div>
        <form className="settings-form" onSubmit={handleSubmit}>
          <label>
            School
            <SchoolAutocomplete
              value={schoolId}
              onChange={handleSchoolChange}
              initialSchoolName={initialSchoolName}
              placeholder="Start typing to search schools..."
            />
          </label>
          <label>
            Major
            <input
              type="text"
              value={major}
              onChange={(event) => setMajor(event.target.value)}
              placeholder="e.g. Computer Science"
            />
          </label>
          <label>
            Graduation year
            <input
              type="text"
              inputMode="numeric"
              value={year}
              onChange={(event) => setYear(event.target.value)}
              placeholder="e.g. 2026"
            />
          </label>
          {status && <p className="settings-status">{status}</p>}
          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? "Saving..." : "Save profile"}
          </button>
        </form>
      </div>
    </div>
  );
}
