interface NotificationsCardProps {
  notifications: { id: string; message: string; createdAt: Date }[];
}

export default function NotificationsCard({ notifications }: NotificationsCardProps) {
  return (
    <section className="account-card account-card--notifications">
      <div className="section-header">
        <h2>Notifications</h2>
      </div>
      {notifications.length === 0 ? (
        <div className="empty-panel">No notifications yet.</div>
      ) : (
        <ul className="notification-list">
          {notifications.map((notification) => (
            <li key={notification.id}>
              {notification.message}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
