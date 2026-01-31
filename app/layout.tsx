import "./globals.css";
import type { Metadata } from "next";
import { Fraunces } from "next/font/google";
import AppProviders from "@/app/components/AppProviders";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap"
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ClassRack",
    template: "%s | ClassRack"
  },
  description: "Reviews and rankings for professors across universities.",
  openGraph: {
    type: "website",
    title: "ClassRack",
    description: "Reviews and rankings for professors across universities.",
    url: siteUrl
  },
  twitter: {
    card: "summary_large_image",
    title: "ClassRack",
    description: "Reviews and rankings for professors across universities."
  },
  alternates: {
    canonical: siteUrl
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${fraunces.className} ${fraunces.variable}`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
