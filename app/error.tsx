"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="error-page">
      <div className="error-content">
        <h2>Something went wrong</h2>
        <p>An error occurred while loading this page.</p>
        <button onClick={() => reset()} className="primary-button">
          Try again
        </button>
      </div>
    </div>
  );
}
