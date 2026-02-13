"use client";

import { useState } from "react";

interface VerifyEduEmailFormProps {
  hasExistingPending?: boolean;
}

export default function VerifyEduEmailForm({ hasExistingPending }: VerifyEduEmailFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/verification/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eduEmail: email })
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
      <div className="verify-form verify-form--success">
        <div className="verify-form__icon">✓</div>
        <h3>Check your inbox</h3>
        <p>
          We sent a verification link to <strong>{email}</strong>. Click the
          link to confirm and earn your Verified badge.
        </p>
        <p className="verify-form__note">
          Your university email is stored securely and is never shared with professors.
        </p>
      </div>
    );
  }

  return (
    <div className="verify-form">
      <div className="verify-form__header">
        <h3>Verify your university email</h3>
        <p>
          Add a <strong>Verified</strong> badge to your reviews by confirming
          your institutional .edu email address.
        </p>
        {hasExistingPending && (
          <div className="verify-form__notice">
            A verification is pending. Enter your email again to resend the link.
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="verify-form__fields">
        <div className="form-field">
          <label htmlFor="edu-email" className="form-label">
            University email
          </label>
          <input
            id="edu-email"
            type="email"
            className="form-input"
            placeholder="you@university.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            pattern="^[^\s@]+@[^\s@]+\.edu$"
            title="Must be a .edu email address"
            disabled={status === "loading"}
          />
        </div>

        {status === "error" && (
          <p className="form-error">{errorMsg}</p>
        )}

        <button
          type="submit"
          className="btn btn--primary"
          disabled={status === "loading" || !email}
        >
          {status === "loading" ? "Sending…" : "Send verification email"}
        </button>
      </form>

      <p className="verify-form__privacy">
        🔒 Your .edu email is stored server-side only and is never shown to
        professors or other students (FERPA compliant).
      </p>
    </div>
  );
}
