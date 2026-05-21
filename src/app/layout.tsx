import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wanderlearn Field Reporter",
  description:
    "A LangGraph agent that turns raw Wanderlearn captures into publishable " +
    "lesson drafts through a research, write, and self-critique reflection loop.",
  manifest: "/manifest.webmanifest",
  // WitUS ecosystem brand package — variant 01-orbit (gemini/witus/public/brand).
  icons: {
    icon: [
      { url: "/brand/witus/favicon.svg", type: "image/svg+xml" },
      { url: "/brand/witus/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/witus/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/brand/witus/favicon-180.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <SiteNav />
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
