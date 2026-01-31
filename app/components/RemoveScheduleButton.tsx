"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/app/components/ToastProvider";

interface RemoveScheduleButtonProps {
  entryId: string;
}

export default function RemoveScheduleButton({ entryId }: RemoveScheduleButtonProps) {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const handleRemove = async () => {
    setLoading(true);
    const response = await fetch("/api/schedule", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entryId })
    });

    setLoading(false);

    if (!response.ok) {
      const payload = (await response.json()) as { error?: string };
      toast.push(payload.error ?? "Unable to remove class.", "error");
      return;
    }

    toast.push("Class removed from schedule.", "success");
    router.refresh();
  };

  return (
    <button className="ghost-button button--sm" type="button" onClick={handleRemove} disabled={loading}>
      {loading ? "Removing..." : "Remove"}
    </button>
  );
}
