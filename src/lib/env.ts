import "server-only";
import { z } from "zod";

/**
 * Environment access for the field-reporter agent.
 *
 * Lenient by design: every variable is OPTIONAL here, so `getEnv()` never
 * throws just because a key is unset — the app must still boot with, say,
 * `LANGSMITH_API_KEY` missing (PRD §16: LangSmith tracing is on by default but
 * the project still runs without the key). Code that genuinely needs a value
 * calls `requireEnv()`, which throws a clear, named error at the point of use.
 * Values that ARE present are still format-checked.
 */
const EnvSchema = z.object({
  /** Anthropic API key — Claude Sonnet 4.6 (PRD §5). */
  ANTHROPIC_API_KEY: z.string().min(1).optional(),
  /** Google Gemini API key — Gemini 2.5 Pro, the alternate provider (PRD App. A). */
  GEMINI_API_KEY: z.string().min(1).optional(),
  /** Tavily key for the `webSearch` tool (wired Day 3). */
  TAVILY_API_KEY: z.string().min(1).optional(),
  /** LangSmith tracing — optional; the LangChain SDK no-ops without a key. */
  LANGSMITH_API_KEY: z.string().min(1).optional(),
  LANGSMITH_PROJECT: z.string().min(1).optional(),
  LANGSMITH_TRACING: z.string().optional(),
  /** Neon Postgres — pooled connection, used by the app at runtime. */
  STORAGE_DATABASE_URL: z.string().url().optional(),
  /** Neon Postgres — direct/unpooled connection, used by drizzle-kit migrations. */
  STORAGE_DATABASE_URL_UNPOOLED: z.string().url().optional(),
  /** Existing Wanderlearn Cloudinary tenant (`cloudinaryMetadata` tool, Day 3). */
  CLOUDINARY_URL: z.string().min(1).optional(),
});

export type Env = z.infer<typeof EnvSchema>;

let cached: Env | null = null;

/**
 * Lazy, cached env getter. Validates on first call. Call this inside a request
 * handler or server function — never at module top level — so Next's
 * build-time analysis does not trip on it.
 */
export function getEnv(): Env {
  if (cached) return cached;
  const parsed = EnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => `  ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`Invalid environment variables:\n${issues}`);
  }
  cached = parsed.data;
  return cached;
}

/**
 * Read a variable the calling code cannot function without. Throws a clear,
 * named error if it is absent — surfaced at the point of use rather than
 * failing the whole process at boot.
 */
export function requireEnv<K extends keyof Env>(key: K): NonNullable<Env[K]> {
  const value = getEnv()[key];
  if (value === undefined || value === "") {
    throw new Error(
      `Missing required environment variable: ${key}. ` +
        `See .env.example and plans/user-tasks/01-provision-env-keys.md.`,
    );
  }
  return value as NonNullable<Env[K]>;
}
