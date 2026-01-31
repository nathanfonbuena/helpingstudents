"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/app/components/ToastProvider";

interface MaterialEditFormProps {
  materialId: string;
  initialTitle: string;
  initialContent: string;
  initialTerm: string | null;
  initialStatus: "DRAFT" | "PENDING" | "APPROVED";
}

export default function MaterialEditForm({
  materialId,
  initialTitle,
  initialContent,
  initialTerm,
  initialStatus
}: MaterialEditFormProps) {
  const router = useRouter();
  const toast = useToast();
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [term, setTerm] = useState(initialTerm ?? "");
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const response = await fetch(`/api/materials/${materialId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, term, status })
    });

    setLoading(false);

    if (!response.ok) {
      const payload = (await response.json()) as { error?: string };
      toast.push(payload.error ?? "Unable to update material.", "error");
      return;
    }

    toast.push("Material updated.", "success");
    router.refresh();
  };

  return (
    <form className="settings-form" onSubmit={handleSubmit}>
      <label>
        Title
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
        />
      </label>
      <label>
        Term
        <input
          type="text"
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder="Fall 2026"
        />
      </label>
      <label>
        Status
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as "DRAFT" | "PENDING" | "APPROVED")}
        >
          <option value="DRAFT">Draft</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
        </select>
      </label>
      <label>
        Content
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          rows={6}
          required
        />
      </label>
      <button type="submit" className="primary-button" disabled={loading}>
        {loading ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}
