/**
 * VerifiedBadge — displayed next to a reviewer's name when they have confirmed
 * enrollment at their institution via a .edu email.
 *
 * FERPA: This badge only conveys that the email domain was confirmed. The
 * actual .edu email address is never exposed to the client.
 */

interface VerifiedBadgeProps {
  size?: "sm" | "md";
}

export default function VerifiedBadge({ size = "sm" }: VerifiedBadgeProps) {
  const label = size === "md" ? "Verified Student" : "Verified";
  return (
    <span className={`verified-badge verified-badge--${size}`} title="Verified university student">
      <svg
        aria-hidden="true"
        width="10"
        height="10"
        viewBox="0 0 10 10"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M5 0L6.12 3.45H9.76L6.82 5.59L7.94 9.05L5 6.91L2.06 9.05L3.18 5.59L0.24 3.45H3.88L5 0Z"
          fill="currentColor"
        />
      </svg>
      {label}
    </span>
  );
}
