"use client";

import { useState } from "react";

interface ModerationItem {
  id: string;
  replyBody: string;
  professorName: string;
  reviewBody: string;
  reviewRating: number;
  reviewDate: Date;
  submittedAt: Date;
}

export default function ModerationQueue({ initialItems }: { initialItems: ModerationItem[] }) {
  const [items, setItems] = useState(initialItems);
  const [actionStatus, setActionStatus] = useState<Record<string, "idle" | "loading" | "done" | "error">>({});

  const handleAction = async (id: string, action: "approve" | "reject") => {
    setActionStatus((prev) => ({ ...prev, [id]: "loading" }));
    try {
      const res = await fetch(`/api/admin/moderation/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action })
      });

      if (res.ok) {
        setActionStatus((prev) => ({ ...prev, [id]: "done" }));
        // Remove from list after a short delay
        setTimeout(() => {
          setItems((prev) => prev.filter((item) => item.id !== id));
        }, 600);
      } else {
        setActionStatus((prev) => ({ ...prev, [id]: "error" }));
      }
    } catch {
      setActionStatus((prev) => ({ ...prev, [id]: "error" }));
    }
  };

  if (items.length === 0) {
    return (
      <div className="empty-panel" style={{ marginTop: 32 }}>
        No pending replies. The queue is clear.
      </div>
    );
  }

  return (
    <div className="moderation-list">
      {items.map((item) => {
        const status = actionStatus[item.id] ?? "idle";
        const isDone = status === "done";

        return (
          <div
            key={item.id}
            className="moderation-item"
            style={{ opacity: isDone ? 0.4 : 1, transition: "opacity 0.3s ease" }}
          >
            <div className="moderation-item__meta">
              <strong>{item.professorName}</strong> replied on{" "}
              {new Date(item.submittedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric"
              })}
            </div>

            <div>
              <p
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "var(--ink-500)",
                  marginBottom: 6
                }}
              >
                Student review ({item.reviewRating}/5 ·{" "}
                {new Date(item.reviewDate).toLocaleDateString("en-US", {
                  month: "short",
                  year: "numeric"
                })}
                )
              </p>
              <div className="moderation-item__review">{item.reviewBody}</div>
            </div>

            <div>
              <p
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "var(--accent)",
                  marginBottom: 6
                }}
              >
                Professor reply
              </p>
              <div className="moderation-item__reply">{item.replyBody}</div>
            </div>

            <div className="moderation-item__actions">
              <button
                className="btn btn--sm btn--approve"
                onClick={() => handleAction(item.id, "approve")}
                disabled={status === "loading" || isDone}
              >
                {status === "loading" ? "…" : isDone ? "✓ Done" : "Approve"}
              </button>
              <button
                className="btn btn--sm btn--reject"
                onClick={() => handleAction(item.id, "reject")}
                disabled={status === "loading" || isDone}
              >
                Reject
              </button>
              {status === "error" && (
                <span className="form-error">Action failed. Try again.</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
