"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useToast } from "@/app/components/ToastProvider";

interface ReviewModalProps {
  open: boolean;
  onClose: () => void;
  professorId: string;
  professorName: string;
  professorSlug: string;
}

export default function ReviewModal({
  open,
  onClose,
  professorId,
  professorName,
  professorSlug
}: ReviewModalProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const toast = useToast();
  const [rating, setRating] = useState(5);
  const [difficulty, setDifficulty] = useState(3);
  const [expertise, setExpertise] = useState(4);
  const [enjoyability, setEnjoyability] = useState(4);
  const [clarity, setClarity] = useState(4);
  const [body, setBody] = useState("");
  const [wouldTakeAgain, setWouldTakeAgain] = useState<"yes" | "no" | "na">("na");
  const [forCredit, setForCredit] = useState<"yes" | "no" | "na">("na");
  const [attendanceMandatory, setAttendanceMandatory] = useState<"yes" | "no" | "na">("na");
  const [textbookRequired, setTextbookRequired] = useState<"yes" | "no" | "na">("na");
  const [onlineClass, setOnlineClass] = useState<"yes" | "no" | "na">("na");
  const [grade, setGrade] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setStatus(null);
      setBody("");
      setGrade("");
      setWouldTakeAgain("na");
      setForCredit("na");
      setAttendanceMandatory("na");
      setTextbookRequired("na");
      setOnlineClass("na");
    }
  }, [open]);

  const handleClose = () => {
    router.replace(`/professor/${professorSlug}`);
    onClose();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);

    if (!session?.user?.id) {
      router.push(`/login?callbackUrl=/professor/${professorSlug}`);
      return;
    }

    setLoading(true);
    const response = await fetch("/api/reviews/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        professorId,
        rating,
        difficulty,
        expertise,
        enjoyability,
        clarity,
        body,
        wouldTakeAgain,
        forCredit,
        attendanceMandatory,
        textbookRequired,
        onlineClass,
        grade
      })
    });

    setLoading(false);

    if (!response.ok) {
      const payload = (await response.json()) as { error?: string };
      const message = payload.error ?? "Unable to submit review.";
      setStatus(message);
      toast.push(message, "error");
      return;
    }

    toast.push("Your review was shared successfully.", "success");
    handleClose();
    router.refresh();
  };

  if (!open) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-card">
        <div className="modal-header">
          <div>
            <h2>Write a review</h2>
            <p>{professorName}</p>
          </div>
          <button type="button" className="modal-close" onClick={handleClose}>
            ×
          </button>
        </div>
        <form className="settings-form" onSubmit={handleSubmit}>
          <div className="review-grid">
            <label>
              Overall rating
              <input
                type="number"
                min={1}
                max={5}
                value={rating}
                onChange={(event) => setRating(Number(event.target.value))}
                required
              />
            </label>
            <label>
              Difficulty
              <input
                type="number"
                min={1}
                max={5}
                value={difficulty}
                onChange={(event) => setDifficulty(Number(event.target.value))}
                required
              />
            </label>
            <label>
              Expertise
              <input
                type="number"
                min={1}
                max={5}
                value={expertise}
                onChange={(event) => setExpertise(Number(event.target.value))}
                required
              />
            </label>
            <label>
              Enjoyability
              <input
                type="number"
                min={1}
                max={5}
                value={enjoyability}
                onChange={(event) => setEnjoyability(Number(event.target.value))}
                required
              />
            </label>
            <label>
              Clarity
              <input
                type="number"
                min={1}
                max={5}
                value={clarity}
                onChange={(event) => setClarity(Number(event.target.value))}
                required
              />
            </label>
          </div>

          <label>
            Review
            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              rows={4}
              required
            />
          </label>

          <div className="review-grid">
            <label>
              Would take again
              <select value={wouldTakeAgain} onChange={(event) => setWouldTakeAgain(event.target.value as "yes" | "no" | "na") }>
                <option value="na">N/A</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </label>
            <label>
              For credit
              <select value={forCredit} onChange={(event) => setForCredit(event.target.value as "yes" | "no" | "na") }>
                <option value="na">N/A</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </label>
            <label>
              Attendance
              <select value={attendanceMandatory} onChange={(event) => setAttendanceMandatory(event.target.value as "yes" | "no" | "na") }>
                <option value="na">N/A</option>
                <option value="yes">Mandatory</option>
                <option value="no">Not required</option>
              </select>
            </label>
            <label>
              Textbook
              <select value={textbookRequired} onChange={(event) => setTextbookRequired(event.target.value as "yes" | "no" | "na") }>
                <option value="na">N/A</option>
                <option value="yes">Required</option>
                <option value="no">Not required</option>
              </select>
            </label>
            <label>
              Online class
              <select value={onlineClass} onChange={(event) => setOnlineClass(event.target.value as "yes" | "no" | "na") }>
                <option value="na">N/A</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </label>
            <label>
              Grade
              <input
                type="text"
                value={grade}
                onChange={(event) => setGrade(event.target.value)}
                placeholder="A, B+, C"
              />
            </label>
          </div>

          {status && <p className="settings-status">{status}</p>}
          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? "Submitting..." : "Submit review"}
          </button>
        </form>
      </div>
    </div>
  );
}
