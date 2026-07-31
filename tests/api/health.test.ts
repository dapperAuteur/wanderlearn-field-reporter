import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * The health route's promise is negative: whatever goes wrong with the
 * database, neither the caller nor the log line ever sees the driver's error.
 * A Neon failure routinely carries the full connection string (user, password,
 * host) in its message, so that promise gets tests rather than a comment.
 */

/** Stands in for the credentials a driver error would carry. */
const SECRET = "postgresql://user:sup3rs3cret@ep-fake-123.neon.tech/db";

const execute = vi.fn();
vi.mock("@/db/client", () => ({
  getDb: () => ({ execute }),
}));

async function loadRoute() {
  return import("@/app/api/health/route");
}

describe("GET /api/health", () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.resetModules();
    execute.mockReset();
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns 200 and ok:true when the database answers", async () => {
    execute.mockResolvedValue([{ "?column?": 1 }]);
    const { GET } = await loadRoute();

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.checks.database).toBe("ok");
    expect(response.headers.get("Cache-Control")).toContain("no-store");
  });

  it("returns 503 with a fixed token and never echoes the error", async () => {
    execute.mockRejectedValue(new Error(`connect failed: ${SECRET}`));
    const { GET } = await loadRoute();

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body).toEqual({ ok: false, error: "dependency_unavailable" });
    expect(JSON.stringify(body)).not.toContain("sup3rs3cret");
    expect(JSON.stringify(body)).not.toContain("neon.tech");
  });

  it("logs a constant string, not the driver error", async () => {
    execute.mockRejectedValue(new Error(`connect failed: ${SECRET}`));
    const { GET } = await loadRoute();

    await GET();

    expect(errorSpy).toHaveBeenCalledTimes(1);
    const logged = errorSpy.mock.calls.flat().join(" ");
    expect(logged).toBe("health: database probe failed");
    expect(logged).not.toContain("sup3rs3cret");
  });

  it("gives up on a hung database rather than hanging the monitor", async () => {
    execute.mockImplementation(() => new Promise(() => {}));
    const { GET } = await loadRoute();

    const response = await GET();

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      ok: false,
      error: "dependency_unavailable",
    });
  });

  it("answers HEAD with a status and no body", async () => {
    execute.mockResolvedValue([{ "?column?": 1 }]);
    const { HEAD } = await loadRoute();

    const response = await HEAD();

    expect(response.status).toBe(200);
    expect(await response.text()).toBe("");
    expect(response.headers.get("Cache-Control")).toContain("no-store");
  });
});
