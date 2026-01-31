"use client";

import { useState } from "react";
import FindProfessorsModal from "@/app/components/FindProfessorsModal";

interface FindProfessorsModalTriggerProps {
  label: string;
  schools: { id: string; name: string }[];
  initialSchoolId: string;
}

export default function FindProfessorsModalTrigger({
  label,
  schools,
  initialSchoolId
}: FindProfessorsModalTriggerProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" className="primary-button" onClick={() => setOpen(true)}>
        {label}
      </button>
      <FindProfessorsModal
        open={open}
        onClose={() => setOpen(false)}
        schools={schools}
        initialSchoolId={initialSchoolId}
      />
    </>
  );
}
