"use client";

import { useState } from "react";

type ThemePreference = "LIGHT" | "DARK";

interface SettingsFormProps {
  initialTheme: ThemePreference;
  email: string;
}

export default function SettingsForm({ initialTheme, email }: SettingsFormProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [theme, setTheme] = useState<ThemePreference>(initialTheme);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const saveTheme = async (nextTheme: ThemePreference) => {
    setTheme(nextTheme);
    setStatus(null);

    document.documentElement.dataset.theme = nextTheme.toLowerCase();
    window.localStorage.setItem("classrack-theme", nextTheme.toLowerCase());

    await fetch("/api/settings/theme", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ theme: nextTheme })
    });
  };

  const handlePasswordSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);
    setLoading(true);

    const response = await fetch("/api/settings/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword })
    });

    setLoading(false);

    if (!response.ok) {
      const payload = (await response.json()) as { error?: string };
      setStatus(payload.error ?? "Unable to update password.");
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setStatus("Password updated.");
  };

  return (
    <div className="settings-grid">
      <form className="settings-form" onSubmit={handlePasswordSubmit}>
        <h2>Password</h2>
        <p>Signed in as {email}</p>
        <label>
          Current password
          <input
            type="password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            required
          />
        </label>
        <label>
          New password
          <input
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            required
          />
        </label>
        {status && <p className="settings-status">{status}</p>}
        <button type="submit" className="primary-button" disabled={loading}>
          {loading ? "Updating..." : "Update password"}
        </button>
      </form>

      <div className="settings-form">
        <h2>Theme</h2>
        <p>Choose light or dark mode.</p>
        <div className="theme-toggle">
          <button
            type="button"
            className={theme === "LIGHT" ? "theme-button is-active" : "theme-button"}
            onClick={() => saveTheme("LIGHT")}
          >
            Light
          </button>
          <button
            type="button"
            className={theme === "DARK" ? "theme-button is-active" : "theme-button"}
            onClick={() => saveTheme("DARK")}
          >
            Dark
          </button>
        </div>
        {status && <p className="settings-status">{status}</p>}
      </div>
    </div>
  );
}
