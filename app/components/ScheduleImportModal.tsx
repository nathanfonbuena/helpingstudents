"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/app/components/ToastProvider";

interface ScheduleImportModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ScheduleImportModal({ open, onClose }: ScheduleImportModalProps) {
  const router = useRouter();
  const toast = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) {
      toast.push("Select a CSV file to import.", "error");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    const response = await fetch("/api/schedule/import", {
      method: "POST",
      body: formData
    });
    setLoading(false);

    if (!response.ok) {
      const payload = (await response.json()) as { error?: string };
      toast.push(payload.error ?? "Unable to import schedule.", "error");
      return;
    }

    const payload = (await response.json()) as { added?: number };
    toast.push(`Imported ${payload.added ?? 0} classes.`, "success");
    router.refresh();
    onClose();
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-card">
        <div className="modal-header">
          <div>
            <h2>Import schedule</h2>
            <p>Upload a CSV with course number, term, and meeting times.</p>
          </div>
          <button type="button" className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <form className="settings-form" onSubmit={handleSubmit}>
          <label>
            CSV file
            <input
              type="file"
              accept=".csv"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
          </label>
          <p className="settings-status">
            Format: courseNumber, term, meetingTimes (e.g. CS-101, Fall 2026, MW 10:00–11:15)
          </p>
          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? "Importing..." : "Import schedule"}
          </button>
        </form>
      </div>
    </div>
  );
}
