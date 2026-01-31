"use client";

import { useState } from "react";
import ScheduleModal from "@/app/components/ScheduleModal";

interface ScheduleModalTriggerProps {
  label: string;
  schoolId: string | null;
  variant?: "primary" | "ghost";
}

export default function ScheduleModalTrigger({
  label,
  schoolId,
  variant = "primary"
}: ScheduleModalTriggerProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={variant === "primary" ? "primary-button" : "ghost-button"}
        onClick={() => setOpen(true)}
      >
        {label}
      </button>
      <ScheduleModal open={open} onClose={() => setOpen(false)} schoolId={schoolId} />
    </>
  );
}
