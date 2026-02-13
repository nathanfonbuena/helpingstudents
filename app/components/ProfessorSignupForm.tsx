"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function ProfessorSignupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role: "PROFESSOR" })
    });

    if (!response.ok) {
      const payload = (await response.json()) as { error?: string };
      setError(payload.error ?? "Unable to sign up.");
      setLoading(false);
      return;
    }

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
      callbackUrl: "/professor-portal"
    });

    setLoading(false);

    if (result?.error) {
      setError("Account created, but login failed. Please log in.");
      return;
    }

    router.push("/professor-portal");
  };

  const passwordStrength =
    password.length >= 12 ? "strong" : password.length >= 8 ? "medium" : "weak";
  const passwordHint =
    password.length === 0
      ? "Use at least 8 characters."
      : passwordStrength === "strong"
        ? "Strong password."
        : passwordStrength === "medium"
          ? "Looks good. Add a few more characters for extra strength."
          : "Too short. Add more characters.";

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div className="professor-signup-badge">
        <span className="professor-signup-badge__icon">🎓</span>
        <span>Faculty account — you&apos;ll have access to the Professor Portal</span>
      </div>

      <label>
        Full name
        <input
          type="text"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Dr. Jane Smith"
          required
        />
      </label>
      <label>
        Institutional or personal email
        <input
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@university.edu"
          required
        />
        <span className="auth-hint auth-hint--neutral">
          You can verify your institutional email later to claim your profile.
        </span>
      </label>
      <label>
        Password (min 8 characters)
        <div className="auth-input">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            className="auth-toggle"
            onClick={() => setShowPassword((v) => !v)}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
        <span className={`auth-hint auth-hint--${passwordStrength}`}>{passwordHint}</span>
      </label>

      {error && <p className="auth-error">{error}</p>}

      <button type="submit" className="primary-button primary-button--professor" disabled={loading}>
        {loading ? "Creating account…" : "Create faculty account"}
      </button>
    </form>
  );
}
