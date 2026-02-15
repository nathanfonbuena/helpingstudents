"use client";

import { SessionProvider } from "next-auth/react";
import ThemeProvider from "@/app/components/ThemeProvider";
import ToastProvider from "@/app/components/ToastProvider";
import CompareProvider from "@/app/components/compare/CompareProvider";

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <ToastProvider>
          <CompareProvider>{children}</CompareProvider>
        </ToastProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
