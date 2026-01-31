"use client";

import { useState } from "react";
import AccountProfileModal from "@/app/components/AccountProfileModal";

interface AccountProfileModalTriggerProps {
  label: string;
  schools: { id: string; name: string }[];
  initialSchoolId: string;
  initialMajor: string;
  initialYear: string;
}

export default function AccountProfileModalTrigger({
  label,
  schools,
  initialSchoolId,
  initialMajor,
  initialYear
}: AccountProfileModalTriggerProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" className="account-inline-link" onClick={() => setOpen(true)}>
        {label}
      </button>
      <AccountProfileModal
        open={open}
        onClose={() => setOpen(false)}
        schools={schools}
        initialSchoolId={initialSchoolId}
        initialMajor={initialMajor}
        initialYear={initialYear}
      />
    </>
  );
}
