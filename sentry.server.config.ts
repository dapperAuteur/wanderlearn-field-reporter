import * as Sentry from "@sentry/nextjs";
import { scrubEvent } from "@/lib/sentry-scrub";

/**
 * Server-runtime error monitoring. Loaded by `register()` in `src/instrumentation.ts` on the Node
 * runtime. The vendor is Better Stack, which ingests the `@sentry/nextjs` SDK format, so `SENTRY_DSN`
 * holds a Better Stack DSN.
 *
 * GUARDED ON THE DSN: with no `SENTRY_DSN` set, `init()` is skipped entirely and the SDK is inert.
 * The app builds, boots, and runs exactly as before until the DSN is provisioned
 * (`plans/user-tasks/12-betterstack-error-monitoring-dsn.md`).
 *
 * Errors only. `tracesSampleRate: 0` because an agent run is a long chain of LLM calls and tracing
 * it here would duplicate LangSmith, which already owns run-level observability for this app.
 */
const dsn = process.env.SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.SENTRY_ENVIRONMENT ?? process.env.VERCEL_ENV ?? process.env.NODE_ENV,
    tracesSampleRate: 0,
    // Never auto-attach IP, cookies, or request bodies. `beforeSend` is the second line of defense,
    // and the one that catches provider keys and prompts that leak through error messages.
    sendDefaultPii: false,
    beforeSend: scrubEvent,
  });
}
