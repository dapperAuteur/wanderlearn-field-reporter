"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

/**
 * Root error boundary: catches errors thrown in the root layout itself, where the normal layout and
 * its stylesheet are not available. It therefore renders its own `<html>`/`<body>` and uses inline
 * styles rather than Tailwind classes, so it cannot itself fail to render.
 *
 * It reports to error monitoring via `Sentry.captureException`, which is a no-op when no DSN is
 * configured, and offers a retry plus a way back to the home page.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          background: "#0f172a",
          color: "#e2e8f0",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: 0,
        }}
      >
        <main style={{ maxWidth: 480, padding: 24, textAlign: "center" }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0 }}>
            Something went wrong
          </h1>
          <p style={{ color: "#94a3b8", marginTop: 12, lineHeight: 1.6 }}>
            The field reporter could not load this page. Trying again usually works; if it does not,
            the report you were viewing is still safe.
          </p>
          <div
            style={{
              marginTop: 20,
              display: "flex",
              gap: 12,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={reset}
              style={{
                minHeight: 44,
                padding: "0 20px",
                borderRadius: 8,
                border: "none",
                background: "#0284c7",
                color: "#f8fafc",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Try again
            </button>
            {/* The root boundary renders outside the router, so a plain anchor is correct here. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/"
              style={{
                minHeight: 44,
                display: "inline-flex",
                alignItems: "center",
                padding: "0 20px",
                borderRadius: 8,
                border: "1px solid #334155",
                color: "inherit",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              Back to home
            </a>
          </div>
          {error.digest ? (
            <p style={{ color: "#64748b", fontSize: 12, marginTop: 16 }}>
              Reference: {error.digest}
            </p>
          ) : null}
        </main>
      </body>
    </html>
  );
}
