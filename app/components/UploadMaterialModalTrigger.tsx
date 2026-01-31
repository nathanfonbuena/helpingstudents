"use client";

import { useState } from "react";
import UploadMaterialModal from "@/app/components/UploadMaterialModal";

interface CourseOption {
  id: string;
  name: string;
  courseNumber: string;
  professorName: string | null;
}

interface UploadMaterialModalTriggerProps {
  label: string;
  scheduleCourses: CourseOption[];
  variant?: "primary" | "ghost";
}

export default function UploadMaterialModalTrigger({
  label,
  scheduleCourses,
  variant = "primary"
}: UploadMaterialModalTriggerProps) {
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
      <UploadMaterialModal
        open={open}
        onClose={() => setOpen(false)}
        scheduleCourses={scheduleCourses}
      />
    </>
  );
}
