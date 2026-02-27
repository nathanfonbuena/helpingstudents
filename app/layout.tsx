import "./globals.css";
import type { Metadata } from "next";
import AppProviders from "@/app/components/AppProviders";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Knocore",
    template: "%s | Knocore"
  },
  description: "Reviews and rankings for professors across universities.",
  openGraph: {
    type: "website",
    title: "Knocore",
    description: "Reviews and rankings for professors across universities.",
    url: siteUrl
  },
  twitter: {
    card: "summary_large_image",
    title: "Knocore",
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
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
