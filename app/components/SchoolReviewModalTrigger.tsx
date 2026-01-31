"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SchoolReviewModal from "@/app/components/SchoolReviewModal";

interface SchoolReviewModalTriggerProps {
  schoolId: string;
  schoolName: string;
  schoolSlug: string;
  defaultOpen?: boolean;
}

export default function SchoolReviewModalTrigger({
  schoolId,
  schoolName,
  schoolSlug,
  defaultOpen = false
}: SchoolReviewModalTriggerProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (defaultOpen) setOpen(true);
  }, [defaultOpen]);

  return (
    <>
      <button
        className="primary-button"
        type="button"
        onClick={() => {
          router.replace(`/school/${schoolSlug}?writeReview=1`);
          setOpen(true);
        }}
      >
        Write a review
      </button>
      <SchoolReviewModal
        open={open}
        onClose={() => setOpen(false)}
        schoolId={schoolId}
        schoolName={schoolName}
        schoolSlug={schoolSlug}
      />
    </>
  );
}
