"use client";

import { useState } from "react";

interface ClaimProfileFormProps {
  professorName: string;
  hasExistingProfile: boolean;
}

export default function ClaimProfileForm({ professorName, hasExistingProfile }: ClaimProfileFormProps) {
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/professor/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ officialEmail: email, bio })
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error ?? "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }

      setStatus("sent");
    } catch {
      setErrorMsg("Network error. Please check your connection.");
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <div className="verify-page">
        <div className="verify-page__icon">📬</div>
        <h1>Check your institutional email</h1>
        <p>
          We sent a claim link to <strong>{email}</strong>. Click the link to
          confirm your identity and unlock your Professor Portal.
        </p>
        <p style={{ fontSize: "0.82rem", color: "var(--ink-500)" }}>
          The link expires in 48 hours.
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 580 }}>
      <div className="portal-dashboard__header">
        <h1 className="portal-dashboard__title">Claim Your Profile</h1>
        <p style={{ color: "var(--ink-500)", fontSize: "0.92rem", marginTop: 8 }}>
          Hi {professorName}, verify your institutional email to gain access to the
          Professor Portal — upload a syllabus, add your bio, and respond to reviews.
        </p>
      </div>

      <div
        style={{
          background: "var(--panel)",
          border: "1px solid var(--panel-border)",
          borderRadius: 18,
          padding: 28
        }}
      >
        <form onSubmit={handleClaim} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="form-field">
            <label htmlFor="official-email" className="form-label">
              Institutional email address
            </label>
            <p className="form-hint">Must be a .edu or university domain email.</p>
            <input
              id="official-email"
              type="email"
              className="form-input"
              placeholder="you@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={status === "loading"}
            />
          </div>

          <div className="form-field">
            <label htmlFor="bio" className="form-label">
              Short bio <span style={{ fontWeight: 400, color: "var(--ink-500)" }}>(optional)</span>
            </label>
            <textarea
              id="bio"
              className="form-textarea"
              rows={3}
              maxLength={1000}
              placeholder="Your research focus, teaching philosophy, background…"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              disabled={status === "loading"}
            />
          </div>

          {status === "error" && <p className="form-error">{errorMsg}</p>}

          <button
            type="submit"
            className="btn btn--primary"
            disabled={status === "loading" || !email}
          >
            {status === "loading" ? "Sending…" : "Send claim email"}
          </button>
        </form>

        <p
          style={{
            fontSize: "0.75rem",
            color: "var(--ink-500)",
            marginTop: 16,
            lineHeight: 1.5
          }}
        >
          🔒 Your institutional email is used only for identity verification. It is never
          shown to students.
        </p>
      </div>
    </div>
  );
}
