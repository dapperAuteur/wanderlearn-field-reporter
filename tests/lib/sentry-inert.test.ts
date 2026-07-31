import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * The DSN guard is the reason this wiring can ship before the vendor account exists: with no DSN
 * set, `init()` is never called, so the SDK sends nothing and costs nothing. That is a behavioural
 * promise, so it gets a test rather than a comment.
 */
vi.mock("@sentry/nextjs", () => ({
  init: vi.fn(),
  captureException: vi.fn(),
  captureRequestError: vi.fn(),
  captureRouterTransitionStart: vi.fn(),
  withScope: vi.fn(),
}));

describe("error monitoring is inert without a DSN", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
    delete process.env.SENTRY_DSN;
    delete process.env.NEXT_PUBLIC_SENTRY_DSN;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.clearAllMocks();
  });

  it("skips server init when SENTRY_DSN is unset", async () => {
    const Sentry = await import("@sentry/nextjs");
    await import("../../sentry.server.config");

    expect(Sentry.init).not.toHaveBeenCalled();
  });

  it("skips edge init when SENTRY_DSN is unset", async () => {
    const Sentry = await import("@sentry/nextjs");
    await import("../../sentry.edge.config");

    expect(Sentry.init).not.toHaveBeenCalled();
  });

  it("skips client init when NEXT_PUBLIC_SENTRY_DSN is unset", async () => {
    const Sentry = await import("@sentry/nextjs");
    await import("@/instrumentation-client");

    expect(Sentry.init).not.toHaveBeenCalled();
  });

  it("initialises errors-only, PII-free, with a scrubber when a DSN is set", async () => {
    process.env.SENTRY_DSN = `https://${"0".repeat(32)}@ingest.example.test/1`;
    const Sentry = await import("@sentry/nextjs");
    await import("../../sentry.server.config");

    expect(Sentry.init).toHaveBeenCalledTimes(1);
    const options = vi.mocked(Sentry.init).mock.calls[0]?.[0];
    expect(options?.tracesSampleRate).toBe(0);
    expect(options?.sendDefaultPii).toBe(false);
    expect(typeof options?.beforeSend).toBe("function");
  });
});
