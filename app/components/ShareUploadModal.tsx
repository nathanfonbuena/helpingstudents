"use client";

import { useState } from "react";
import { useToast } from "@/app/components/ToastProvider";

interface ShareUploadModalProps {
  open: boolean;
  onClose: () => void;
  shareUrl: string;
}

export default function ShareUploadModal({ open, onClose, shareUrl }: ShareUploadModalProps) {
  const toast = useToast();
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.push("Share link copied.", "success");
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-card">
        <div className="modal-header">
          <div>
            <h2>Share your top upload</h2>
            <p>Copy a link to share your most-viewed material.</p>
          </div>
          <button type="button" className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">
          <label className="modal-field">
            Share link
            <input type="text" value={shareUrl} readOnly />
          </label>
        </div>
        <div className="modal-actions">
          <button type="button" className="primary-button" onClick={handleCopy}>
            {copied ? "Copied" : "Copy link"}
          </button>
          <button type="button" className="ghost-button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
