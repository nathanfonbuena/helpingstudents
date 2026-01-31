"use client";

import { SessionProvider } from "next-auth/react";
import ThemeProvider from "@/app/components/ThemeProvider";
import ToastProvider from "@/app/components/ToastProvider";

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <ToastProvider>{children}</ToastProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
