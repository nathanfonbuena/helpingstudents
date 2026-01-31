"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ReviewFormProps {
  professors: { id: string; name: string | null }[];
}

export default function ReviewForm({ professors }: ReviewFormProps) {
  const router = useRouter();
  const [professorId, setProfessorId] = useState("");
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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);
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
      setStatus(payload.error ?? "Unable to submit review.");
      return;
    }

    const payload = (await response.json()) as { professorSlug?: string };
    setStatus("Review submitted.");
    router.push(payload.professorSlug ? `/professor/${payload.professorSlug}` : "/search");
  };

  return (
    <form className="settings-form" onSubmit={handleSubmit}>
      <label>
        Professor
        <select value={professorId} onChange={(event) => setProfessorId(event.target.value)} required>
          <option value="">Select a professor</option>
          {professors.map((professor) => (
            <option key={professor.id} value={professor.id}>
              {professor.name ?? "Unnamed"}
            </option>
          ))}
        </select>
      </label>

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
          rows={5}
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
  );
}
