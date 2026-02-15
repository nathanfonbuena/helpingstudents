"use client";

import Link from "next/link";
import { useEffect } from "react";
import { trackEvent } from "@/app/lib/analytics";

type NotificationType = "new_review" | "new_material" | "ranking_change";

interface NotificationItem {
  id: string;
  type: NotificationType;
  message: string;
  destination: string;
  createdAt: Date;
}

interface NotificationsCardProps {
  notifications: NotificationItem[];
}

const TYPE_LABEL: Record<NotificationType, string> = {
  new_review: "New reviews",
  new_material: "New materials",
  ranking_change: "Ranking changes"
};

const formatRelativeTime = (value: Date) => {
  const now = Date.now();
  const diffMs = value.getTime() - now;
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (Math.abs(diffMs) < hour) {
    return rtf.format(Math.round(diffMs / minute), "minute");
  }
  if (Math.abs(diffMs) < day) {
    return rtf.format(Math.round(diffMs / hour), "hour");
  }
  return rtf.format(Math.round(diffMs / day), "day");
};

export default function NotificationsCard({ notifications }: NotificationsCardProps) {
  useEffect(() => {
    const uniqueTypes = Array.from(new Set(notifications.map((item) => item.type)));
    uniqueTypes.forEach((type) => {
      trackEvent("notification_impression", { type });
    });
  }, [notifications]);

  const grouped = notifications.reduce(
    (acc, notification) => {
      acc[notification.type].push(notification);
      return acc;
    },
    {
      new_review: [] as NotificationItem[],
      new_material: [] as NotificationItem[],
      ranking_change: [] as NotificationItem[]
    }
  );

  return (
    <section className="account-card account-card--notifications">
      <div className="section-header">
        <h2>Notifications</h2>
      </div>
      {notifications.length === 0 ? (
        <div className="empty-panel">No notifications yet.</div>
      ) : (
        <div className="notification-groups">
          {(Object.keys(grouped) as NotificationType[]).map((type) =>
            grouped[type].length > 0 ? (
              <section key={type} className="notification-group">
                <h3>{TYPE_LABEL[type]}</h3>
                <ul className="notification-list">
                  {grouped[type].map((notification) => (
                    <li key={notification.id}>
                      <Link
                        className="notification-link"
                        href={notification.destination}
                        onClick={() =>
                          trackEvent("notification_click", {
                            type,
                            destination: notification.destination
                          })
                        }
                      >
                        <span>{notification.message}</span>
                        <time>{formatRelativeTime(notification.createdAt)}</time>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null
          )}
        </div>
      )}
    </section>
  );
}
