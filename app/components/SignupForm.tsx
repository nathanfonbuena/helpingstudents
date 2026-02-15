"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const FIRST_RUN_SELECTION_KEY = "firstRunSelection:v1";

export default function SignupForm({ callbackUrl = "/" }: { callbackUrl?: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const rawSelection = window.localStorage.getItem(FIRST_RUN_SELECTION_KEY);
    let firstRunSelection: { role?: "STUDENT" | "PROFESSOR"; schoolId?: string; schoolName?: string } | null = null;
    if (rawSelection) {
      try {
        firstRunSelection = JSON.parse(rawSelection) as {
          role?: "STUDENT" | "PROFESSOR";
          schoolId?: string;
          schoolName?: string;
        };
      } catch {
        firstRunSelection = null;
      }
    }

    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        password,
        firstRunSelection:
          firstRunSelection && firstRunSelection.schoolId
            ? {
              role: firstRunSelection.role,
              schoolId: firstRunSelection.schoolId
            }
            : undefined
      })
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
      callbackUrl
    });

    setLoading(false);

    if (result?.error) {
      setError("Account created, but login failed. Please log in.");
      return;
    }

    if (firstRunSelection?.schoolId) {
      const sessionResponse = await fetch("/api/auth/session");
      if (sessionResponse.ok) {
        const sessionPayload = (await sessionResponse.json()) as { user?: { id?: string } };
        if (sessionPayload.user?.id) {
          window.localStorage.setItem(`firstRunPrompt:v1:${sessionPayload.user.id}`, "completed");
        }
      }
      window.localStorage.removeItem(FIRST_RUN_SELECTION_KEY);
    }

    router.push(callbackUrl || "/");
  };

  const passwordStrength = password.length >= 12 ? "strong" : password.length >= 8 ? "medium" : "weak";
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
      <label>
        Name
        <input
          type="text"
          name="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </label>
      <label>
        Email
        <input
          type="email"
          name="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </label>
      <label>
        Password (min 8 characters)
        <div className="auth-input">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          <button
            type="button"
            className="auth-toggle"
            onClick={() => setShowPassword((value) => !value)}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
        <span className={`auth-hint auth-hint--${passwordStrength}`}>
          {passwordHint}
        </span>
      </label>
      {error && <p className="auth-error">{error}</p>}
      <button type="submit" className="primary-button" disabled={loading}>
        {loading ? "Creating account..." : "Sign up"}
      </button>
    </form>
  );
}
