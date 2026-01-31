"use client";

import { useState } from "react";
import ScheduleImportModal from "@/app/components/ScheduleImportModal";

interface ScheduleImportModalTriggerProps {
  label: string;
}

export default function ScheduleImportModalTrigger({ label }: ScheduleImportModalTriggerProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" className="ghost-button" onClick={() => setOpen(true)}>
        {label}
      </button>
      <ScheduleImportModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
