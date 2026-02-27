"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

interface ProfessorResult {
  id: string;
  name: string | null;
  schools: Array<{ id: string; name: string }>;
  reviewCount: number;
}

interface Props {
  isVerified: boolean;
  hasSchool: boolean;
}

export default function ClaimExistingProfileSearch({ isVerified, hasSchool }: Props) {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const debounceRef = useRef<any>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProfessorResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const [noSchool, setNoSchool] = useState(false);

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([]);
      setSearched(false);
      setNoSchool(false);
      return;
    }
    setSearching(true);
    setSearched(true);
    setNoSchool(false);
    try {
      const res = await fetch("/api/professor/search?q=" + encodeURIComponent(q.trim()));
      const data = await res.json();
      if (data.noSchool) {
        setNoSchool(true);
        setResults([]);
      } else {
        setResults((data.professors as ProfessorResult[]) ?? []);
      }
    } finally {
      setSearching(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setClaimError(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { search(val); }, 350);
  };

  const claim = async (professorId: string) => {
    setClaimingId(professorId);
    setClaimError(null);
    try {
      const res = await fetch("/api/professor/claim-existing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ professorId })
      });
      const data = await res.json();
      if (!res.ok) {
        setClaimError((data.error as string) ?? "Something went wrong.");
        return;
      }
      router.refresh();
    } catch {
      setClaimError("Network error. Please try again.");
    } finally {
      setClaimingId(null);
    }
  };

  return (
    <div className="claim-existing">
      <div className="claim-existing__header">
        <h3>Find your existing profile</h3>
        <p>
          If students have already added you to Knocore, search for your name
          below and take ownership of that profile.
        </p>
      </div>

      {!isVerified && (
        <div className="claim-existing__gate claim-existing__gate--warn">
          <strong>Verify your email first.</strong>{" "}You must{" "}
          <a href="/verify-email" className="inline-link">
            verify your institutional .edu email
          </a>{" "}
          before claiming an existing profile.
        </div>
      )}

      {isVerified && !hasSchool && (
        <div className="claim-existing__gate claim-existing__gate--warn">
          <strong>Add your school first.</strong>{" "}Go to{" "}
          <a href="/dashboard" className="inline-link">
            Account Settings
          </a>{" "}
          and add your institution before claiming a profile.
        </div>
      )}

      <div className="claim-existing__search">
        <input
          type="text"
          className="form-input"
          placeholder='Search by name, e.g. "Dr. Jane Smith"'
          value={query}
          onChange={handleInputChange}
          disabled={!isVerified || !hasSchool}
        />
      </div>

      {claimError && (
        <p className="form-error" style={{ marginTop: 8 }}>
          {claimError}
        </p>
      )}

      {searching && <p className="claim-existing__hint">Searching&hellip;</p>}

      {!searching && noSchool && (
        <p className="claim-existing__hint">
          You haven&rsquo;t added your school yet.{" "}
          <a href="/dashboard" className="inline-link">
            Go to Account Settings
          </a>{" "}
          to add your institution before searching for profiles.
        </p>
      )}

      {!searching && searched && !noSchool && results.length === 0 && (
        <p className="claim-existing__hint">
          No unclaimed profiles found matching &ldquo;{query}&rdquo;. If your
          profile does not exist yet, use the email claim above to build it from
          scratch.
        </p>
      )}

      {results.length > 0 && (
        <ul className="claim-existing__results">
          {results.map((prof) => (
            <li key={prof.id} className="claim-existing__result">
              <div className="claim-existing__result-info">
                <span className="claim-existing__result-name">
                  {prof.name ?? "Unknown"}
                </span>
                {prof.schools.length > 0 && (
                  <span className="claim-existing__result-school">
                    {prof.schools.map((s) => s.name).join(", ")}
                  </span>
                )}
                <span className="claim-existing__result-meta">
                  {prof.reviewCount} review{prof.reviewCount !== 1 ? "s" : ""}
                </span>
              </div>
              <button
                type="button"
                className="btn btn--primary btn--sm"
                disabled={!isVerified || !hasSchool || claimingId === prof.id}
                onClick={() => { claim(prof.id); }}
              >
                {claimingId === prof.id ? "Claiming\u2026" : "Claim this profile"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
