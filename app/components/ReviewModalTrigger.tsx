"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ReviewModal from "@/app/components/ReviewModal";

interface ReviewModalTriggerProps {
  professorId: string;
  professorName: string;
  professorSlug: string;
  defaultOpen?: boolean;
}

export default function ReviewModalTrigger({
  professorId,
  professorName,
  professorSlug,
  defaultOpen = false
}: ReviewModalTriggerProps) {
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
          router.replace(`/professor/${professorSlug}?writeReview=1`);
          setOpen(true);
        }}
      >
        Write a review
      </button>
      <ReviewModal
        open={open}
        onClose={() => setOpen(false)}
        professorId={professorId}
        professorName={professorName}
        professorSlug={professorSlug}
      />
    </>
  );
}
