"use client";

import { useState } from "react";
import ShareUploadModal from "@/app/components/ShareUploadModal";

interface ShareUploadModalTriggerProps {
  label: string;
  shareUrl: string;
  disabled?: boolean;
}

export default function ShareUploadModalTrigger({
  label,
  shareUrl,
  disabled
}: ShareUploadModalTriggerProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="ghost-button button--sm"
        onClick={() => setOpen(true)}
        disabled={disabled}
      >
        {label}
      </button>
      <ShareUploadModal
        open={open}
        onClose={() => setOpen(false)}
        shareUrl={shareUrl}
      />
    </>
  );
}
