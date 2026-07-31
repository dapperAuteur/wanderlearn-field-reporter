import * as Sentry from "@sentry/nextjs";
import { scrubEvent } from "@/lib/sentry-scrub";

/**
 * Client-runtime error monitoring. Reads the PUBLIC DSN, which is inlined at build time.
 *
 * GUARDED: with no `NEXT_PUBLIC_SENTRY_DSN` the SDK is never initialised, so nothing is sent and
 * nothing changes for a visitor browsing the public report pages.
 *
 * No session replay and no tracing. A replay of the capture form would record the operator typing a
 * field transcript, which is exactly the user content the scrubber exists to keep out of the vendor.
 */
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,
    tracesSampleRate: 0,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
    sendDefaultPii: false,
    beforeSend: scrubEvent,
  });
}

/** Instruments App Router client navigations. A no-op when the SDK was not initialised. */
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
