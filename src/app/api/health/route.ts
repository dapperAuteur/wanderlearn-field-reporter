/**
 * GET /api/health — the uptime-monitor target.
 *
 * Why this exists: a monitor pointed at `/` can get a 200 straight from the CDN
 * while the database behind the app is down, so a green check proves nothing.
 * This route is never cached and really talks to Postgres, so a green check
 * means "this deploy executed server code and Neon answered".
 *
 * What it deliberately does NOT do: call any LLM provider or third-party API.
 * This app holds Anthropic / Google / Mistral / OpenRouter / Tavily / LangSmith
 * keys, and probing a vendor would (a) turn the uptime board red for someone
 * else's outage, (b) cost money on every check, and (c) risk a provider error
 * carrying the key into a response or a log. Nothing here reports which
 * provider is configured either.
 *
 * The response body and the log line are both FIXED LITERALS. The `catch` takes
 * no binding at all, so there is no error object in scope that could be
 * serialised, stringified, or logged by a later edit. Connection strings and
 * provider keys travel inside driver error messages; the only way to guarantee
 * they never escape is to never touch the error.
 */
import { sql } from "drizzle-orm";
import { getDb } from "@/db/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

/** Budget for the dependency probe. Shorter than any sane monitor timeout so
 *  a hung database reports 503 rather than leaving the monitor to time out. */
const PROBE_TIMEOUT_MS = 4_000;

/** The single error token this route may ever return. Callers get no detail. */
const ERROR_TOKEN = "dependency_unavailable";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
} as const;

/**
 * Cheapest possible proof that Postgres is reachable and answering: `select 1`.
 * Resolves true on success, false on any failure or on timeout.
 */
async function probeDatabase(): Promise<boolean> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const timeout = new Promise<never>((_resolve, reject) => {
      timer = setTimeout(() => reject(new Error("timeout")), PROBE_TIMEOUT_MS);
    });
    await Promise.race([getDb().execute(sql`select 1`), timeout]);
    return true;
  } catch {
    // No binding: nothing to leak. Constant string only, never an error message
    // — a Neon failure can carry the full connection string with credentials.
    console.error("health: database probe failed");
    return false;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/** GET /api/health — public, unauthenticated, uncached. */
export async function GET(): Promise<Response> {
  const databaseOk = await probeDatabase();

  if (!databaseOk) {
    return Response.json(
      { ok: false, error: ERROR_TOKEN },
      { status: 503, headers: NO_STORE_HEADERS },
    );
  }

  return Response.json(
    {
      ok: true,
      service: "wanderlearn-field-reporter",
      checks: { database: "ok" },
      timestamp: new Date().toISOString(),
    },
    { status: 200, headers: NO_STORE_HEADERS },
  );
}

/** HEAD /api/health — same check, no body. Some monitors default to HEAD. */
export async function HEAD(): Promise<Response> {
  const databaseOk = await probeDatabase();
  return new Response(null, {
    status: databaseOk ? 200 : 503,
    headers: NO_STORE_HEADERS,
  });
}
