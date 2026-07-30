import * as Sentry from "@sentry/nextjs";
import type { Instrumentation } from "next";

/**
 * Next.js instrumentation hook. Loads the right error-monitoring config per runtime and reports
 * server-side App Router errors through `onRequestError`. Everything here is inert without a
 * `SENTRY_DSN`: the guard lives in the two configs, so a missing DSN means no `init()` at all.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") await import("../sentry.server.config");
  if (process.env.NEXT_RUNTIME === "edge") await import("../sentry.edge.config");
}

/**
 * Captures errors thrown while rendering or serving a request.
 *
 * This app is single-operator and single-tenant, so unlike the multi-tenant siblings there is no
 * tenant host worth tagging. What is worth tagging is whether the failure happened on the
 * agent-run endpoint, because that is the expensive, LLM-dependent path and its failures are a
 * different class of problem from a page render bug. The route path comes from Next, not from user
 * input, so it carries nothing to scrub.
 */
export const onRequestError: Instrumentation.onRequestError = (err, request, context) => {
  const routePath = typeof context?.routePath === "string" ? context.routePath : undefined;
  const isAgentRun = routePath === "/api/field-report/generate";

  Sentry.withScope((scope) => {
    scope.setTag("agent.run", isAgentRun);
    Sentry.captureRequestError(err, request, context);
  });
};
