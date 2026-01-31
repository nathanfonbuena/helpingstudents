"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useToast } from "@/app/components/ToastProvider";

interface MaterialSaveButtonProps {
  materialId: string;
  professorSlug: string;
  initialSaved: boolean;
}

export default function MaterialSaveButton({
  materialId,
  professorSlug,
  initialSaved
}: MaterialSaveButtonProps) {
  const router = useRouter();
  const { status } = useSession();
  const toast = useToast();
  const [saved, setSaved] = useState(initialSaved);
  const [loading, setLoading] = useState(false);

  const toggleSave = async () => {
    if (status !== "authenticated") {
      router.push(`/login?callbackUrl=/professor/${professorSlug}`);
      return;
    }

    setLoading(true);
    const response = await fetch("/api/materials/save", {
      method: saved ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ materialId })
    });

    setLoading(false);

    if (!response.ok) {
      const payload = (await response.json()) as { error?: string };
      toast.push(payload.error ?? "Unable to update saved material.", "error");
      return;
    }

    const payload = (await response.json()) as { saved?: boolean };
    const nextSaved = payload.saved ?? !saved;
    setSaved(nextSaved);
    toast.push(nextSaved ? "Material saved." : "Material unsaved.", "success");
  };

  return (
    <button className="ghost-button button--sm" type="button" onClick={toggleSave} disabled={loading}>
      {loading ? "Saving..." : saved ? "Saved" : "Save"}
    </button>
  );
}
