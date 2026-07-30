import * as Sentry from "@sentry/nextjs";
import { scrubEvent } from "@/lib/sentry-scrub";

/**
 * Edge-runtime error monitoring: the auth proxy in `src/proxy.ts` and anything else that runs on the
 * edge. Same DSN guard as the server config, so it is inert with no `SENTRY_DSN`. Loaded by
 * `register()` in `src/instrumentation.ts` on the edge runtime.
 */
const dsn = process.env.SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.SENTRY_ENVIRONMENT ?? process.env.VERCEL_ENV ?? process.env.NODE_ENV,
    tracesSampleRate: 0,
    sendDefaultPii: false,
    beforeSend: scrubEvent,
  });
}
