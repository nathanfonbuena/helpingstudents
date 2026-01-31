"use client";

import { useState } from "react";
import { useToast } from "@/app/components/ToastProvider";

interface AccountFormProps {
  initialName: string;
  initialSchoolId: string;
  initialMajor: string;
  initialYear: string;
  schools: { id: string; name: string }[];
}

export default function AccountForm({
  initialName,
  initialSchoolId,
  initialMajor,
  initialYear,
  schools
}: AccountFormProps) {
  const [name, setName] = useState(initialName);
  const [schoolId, setSchoolId] = useState(initialSchoolId);
  const [major, setMajor] = useState(initialMajor);
  const [year, setYear] = useState(initialYear);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const toast = useToast();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);
    setLoading(true);

    const response = await fetch("/api/account/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, schoolId, major, year })
    });

    setLoading(false);

    if (!response.ok) {
      const payload = (await response.json()) as { error?: string };
      const message = payload.error ?? "Unable to update account.";
      setStatus(message);
      toast.push(message, "error");
      return;
    }

    setStatus("Account updated.");
    toast.push("Account updated successfully.", "success");
  };

  return (
    <form className="settings-form" onSubmit={handleSubmit}>
      <div className="settings-header">
        <h2>Account details</h2>
        <button
          type="button"
          className="settings-edit"
          onClick={() => setEditing((value) => !value)}
        >
          {editing ? "Cancel" : "Edit"}
        </button>
      </div>
      <label>
        Name
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          disabled={!editing}
        />
      </label>
      <label>
        School
        <select
          value={schoolId}
          onChange={(event) => setSchoolId(event.target.value)}
          disabled={!editing}
        >
          <option value="">Select a school</option>
          {schools.map((school) => (
            <option key={school.id} value={school.id}>
              {school.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Major
        <input
          type="text"
          value={major}
          onChange={(event) => setMajor(event.target.value)}
          disabled={!editing}
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
          disabled={!editing}
          placeholder="e.g. 2026"
        />
      </label>
      {status && <p className="settings-status">{status}</p>}
      {editing && (
        <button type="submit" className="primary-button" disabled={loading}>
          {loading ? "Saving..." : "Save changes"}
        </button>
      )}
    </form>
  );
}
