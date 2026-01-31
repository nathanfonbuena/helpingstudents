"use client";

import { useEffect } from "react";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const stored = window.localStorage.getItem("classrack-theme");
    if (stored === "dark" || stored === "light") {
      document.documentElement.dataset.theme = stored;
    }
  }, []);

  return <>{children}</>;
}
