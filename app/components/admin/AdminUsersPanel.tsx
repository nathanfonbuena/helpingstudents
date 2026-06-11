"use client";

import { useState } from "react";

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  isAdmin: boolean;
}

type ActionStatus = "idle" | "loading" | "error";

const sortByEmail = (users: AdminUser[]) =>
  [...users].sort((a, b) => a.email.localeCompare(b.email));

export default function AdminUsersPanel({
  initialAdmins,
  currentUserId
}: {
  initialAdmins: AdminUser[];
  currentUserId: string;
}) {
  const [admins, setAdmins] = useState<AdminUser[]>(initialAdmins);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AdminUser[] | null>(null);
  const [searchStatus, setSearchStatus] = useState<ActionStatus>("idle");
  const [actionStatus, setActionStatus] = useState<Record<string, ActionStatus>>({});

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults(null);
      return;
    }

    setSearchStatus("loading");
    try {
      const res = await fetch(`/api/admin/users?q=${encodeURIComponent(trimmed)}`);
      if (!res.ok) {
        setSearchStatus("error");
        return;
      }
      const data = (await res.json()) as { users: AdminUser[] };
      setResults(data.users);
      setSearchStatus("idle");
    } catch {
      setSearchStatus("error");
    }
  };

  const handleToggle = async (user: AdminUser, nextIsAdmin: boolean) => {
    setActionStatus((prev) => ({ ...prev, [user.id]: "loading" }));
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAdmin: nextIsAdmin })
      });

      if (!res.ok) {
        setActionStatus((prev) => ({ ...prev, [user.id]: "error" }));
        return;
      }

      setActionStatus((prev) => ({ ...prev, [user.id]: "idle" }));

      setAdmins((prev) => {
        if (nextIsAdmin) {
          if (prev.some((u) => u.id === user.id)) return prev;
          return sortByEmail([...prev, { ...user, isAdmin: true }]);
        }
        return prev.filter((u) => u.id !== user.id);
      });

      setResults((prev) =>
        prev
          ? prev.map((u) => (u.id === user.id ? { ...u, isAdmin: nextIsAdmin } : u))
          : prev
      );
    } catch {
      setActionStatus((prev) => ({ ...prev, [user.id]: "error" }));
    }
  };

  const renderRow = (user: AdminUser) => {
    const status = actionStatus[user.id] ?? "idle";
    const isSelf = user.id === currentUserId;

    return (
      <div key={user.id} className="admin-users-row">
        <div className="admin-users-row__info">
          <strong>{user.name ?? "Unnamed user"}</strong>
          <span className="admin-users-row__email">{user.email}</span>
          <span className="admin-users-row__role">{user.role}</span>
        </div>

        <div className="admin-users-row__actions">
          {user.isAdmin ? (
            <button
              type="button"
              className="btn btn--sm btn--reject"
              onClick={() => handleToggle(user, false)}
              disabled={status === "loading" || isSelf}
              title={isSelf ? "You cannot remove your own admin access" : undefined}
            >
              {status === "loading" ? "…" : "Remove admin"}
            </button>
          ) : (
            <button
              type="button"
              className="btn btn--sm btn--approve"
              onClick={() => handleToggle(user, true)}
              disabled={status === "loading"}
            >
              {status === "loading" ? "…" : "Make admin"}
            </button>
          )}
          {status === "error" && <span className="form-error">Action failed. Try again.</span>}
        </div>
      </div>
    );
  };

  return (
    <div className="admin-users-panel">
      <form className="admin-users-search" onSubmit={handleSearch}>
        <input
          type="search"
          className="form-input"
          placeholder="Search users by name or email…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" className="btn btn--sm btn--outline" disabled={searchStatus === "loading"}>
          {searchStatus === "loading" ? "Searching…" : "Search"}
        </button>
      </form>
      {searchStatus === "error" && <p className="form-error">Search failed. Try again.</p>}

      {results !== null && (
        <section className="admin-users-section">
          <h2>Search results</h2>
          {results.length === 0 ? (
            <div className="empty-panel">No users matched &ldquo;{query.trim()}&rdquo;.</div>
          ) : (
            <div className="admin-users-list">{results.map(renderRow)}</div>
          )}
        </section>
      )}

      <section className="admin-users-section">
        <h2>Current admins</h2>
        {admins.length === 0 ? (
          <div className="empty-panel">No admins found.</div>
        ) : (
          <div className="admin-users-list">{admins.map(renderRow)}</div>
        )}
      </section>
    </div>
  );
}
