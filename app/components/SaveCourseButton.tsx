"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useToast } from "@/app/components/ToastProvider";

interface SaveCourseButtonProps {
  courseId: string;
  initialSaved: boolean;
}

export default function SaveCourseButton({ courseId, initialSaved }: SaveCourseButtonProps) {
  const router = useRouter();
  const { status } = useSession();
  const toast = useToast();
  const [saved, setSaved] = useState(initialSaved);
  const [loading, setLoading] = useState(false);

  const toggleSave = async () => {
    if (status !== "authenticated") {
      router.push("/login?callbackUrl=/account");
      return;
    }

    setLoading(true);
    const response = await fetch("/api/saved/courses", {
      method: saved ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId })
    });

    setLoading(false);

    if (!response.ok) {
      const payload = (await response.json()) as { error?: string };
      toast.push(payload.error ?? "Unable to update saved course.", "error");
      return;
    }

    const payload = (await response.json()) as { saved?: boolean };
    const nextSaved = payload.saved ?? !saved;
    setSaved(nextSaved);
    toast.push(nextSaved ? "Course saved." : "Course unsaved.", "success");
  };

  return (
    <button className="ghost-button button--sm" type="button" onClick={toggleSave} disabled={loading}>
      {loading ? "Saving..." : saved ? "Saved" : "Save"}
    </button>
  );
}
