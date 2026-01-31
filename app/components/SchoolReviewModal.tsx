"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface SchoolReviewModalProps {
  open: boolean;
  onClose: () => void;
  schoolId: string;
  schoolName: string;
  schoolSlug: string;
}

export default function SchoolReviewModal({
  open,
  onClose,
  schoolId,
  schoolName,
  schoolSlug
}: SchoolReviewModalProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [overall, setOverall] = useState(4);
  const [reputation, setReputation] = useState(4);
  const [opportunities, setOpportunities] = useState(4);
  const [clubs, setClubs] = useState(3);
  const [safety, setSafety] = useState(4);
  const [location, setLocation] = useState(4);
  const [facilities, setFacilities] = useState(4);
  const [happiness, setHappiness] = useState(4);
  const [internet, setInternet] = useState(3);
  const [food, setFood] = useState(3);
  const [social, setSocial] = useState(3);
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    router.replace(`/school/${schoolSlug}`);
    onClose();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);

    if (!session?.user?.id) {
      router.push(`/login?callbackUrl=/school/${schoolSlug}`);
      return;
    }

    setLoading(true);
    const response = await fetch(`/api/schools/${schoolId}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        overall,
        reputation,
        opportunities,
        clubs,
        safety,
        location,
        facilities,
        happiness,
        internet,
        food,
        social,
        body
      })
    });

    setLoading(false);

    if (!response.ok) {
      const payload = (await response.json()) as { error?: string };
      setStatus(payload.error ?? "Unable to submit review.");
      return;
    }

    setStatus("Review submitted.");
    handleClose();
    router.refresh();
  };

  if (!open) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-card">
        <div className="modal-header">
          <div>
            <h2>Review this school</h2>
            <p>{schoolName}</p>
          </div>
          <button type="button" className="modal-close" onClick={handleClose}>
            ×
          </button>
        </div>
        <form className="settings-form" onSubmit={handleSubmit}>
          <div className="review-grid">
            <label>
              Overall
              <input type="number" min={1} max={5} value={overall} onChange={(e) => setOverall(Number(e.target.value))} />
            </label>
            <label>
              Reputation
              <input type="number" min={1} max={5} value={reputation} onChange={(e) => setReputation(Number(e.target.value))} />
            </label>
            <label>
              Opportunities
              <input type="number" min={1} max={5} value={opportunities} onChange={(e) => setOpportunities(Number(e.target.value))} />
            </label>
            <label>
              Clubs
              <input type="number" min={1} max={5} value={clubs} onChange={(e) => setClubs(Number(e.target.value))} />
            </label>
            <label>
              Safety
              <input type="number" min={1} max={5} value={safety} onChange={(e) => setSafety(Number(e.target.value))} />
            </label>
            <label>
              Location
              <input type="number" min={1} max={5} value={location} onChange={(e) => setLocation(Number(e.target.value))} />
            </label>
            <label>
              Facilities
              <input type="number" min={1} max={5} value={facilities} onChange={(e) => setFacilities(Number(e.target.value))} />
            </label>
            <label>
              Happiness
              <input type="number" min={1} max={5} value={happiness} onChange={(e) => setHappiness(Number(e.target.value))} />
            </label>
            <label>
              Internet
              <input type="number" min={1} max={5} value={internet} onChange={(e) => setInternet(Number(e.target.value))} />
            </label>
            <label>
              Food
              <input type="number" min={1} max={5} value={food} onChange={(e) => setFood(Number(e.target.value))} />
            </label>
            <label>
              Social
              <input type="number" min={1} max={5} value={social} onChange={(e) => setSocial(Number(e.target.value))} />
            </label>
          </div>

          <label>
            Review
            <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} required />
          </label>

          {status && <p className="settings-status">{status}</p>}
          <button type="submit" className="primary-button" disabled={loading}>
            {loading ? "Submitting..." : "Submit review"}
          </button>
        </form>
      </div>
    </div>
  );
}
