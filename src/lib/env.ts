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
  /** Anthropic API key — Claude (paid, the PRD §5 baseline). */
  ANTHROPIC_API_KEY: z.string().min(1).optional(),
  /** Google Gemini API key — Gemini (paid, also a free tier on Flash). */
  GEMINI_API_KEY: z.string().min(1).optional(),
  /** Cerebras free tier — Llama 3.3 70B via an OpenAI-compatible endpoint. */
  CEREBRAS_API_KEY: z.string().min(1).optional(),
  /** OpenRouter — `:free` models via OpenAI-compatible endpoint. */
  OPENROUTER_API_KEY: z.string().min(1).optional(),
  /** Mistral API key — its own SDK; free tier 1B tokens/month. */
  MISTRAL_API_KEY: z.string().min(1).optional(),
  /** Together AI — Llama 3.3 70B Turbo Free via OpenAI-compatible endpoint. */
  TOGETHER_API_KEY: z.string().min(1).optional(),
  /** Local Ollama base URL. Defaults to http://localhost:11434 in `llm.ts`. */
  OLLAMA_BASE_URL: z.string().url().optional(),
  /** Force a provider for runs that don't carry one in their request body
   *  (e.g. background jobs). Optional; falls back to the admin-stored
   *  default. Recognised values are the seven providers in `llm-config.ts`. */
  FIELD_REPORTER_LLM_PROVIDER: z
    .enum([
      "anthropic",
      "google",
      "ollama",
      "cerebras",
      "openrouter",
      "mistral",
      "together",
    ])
    .optional(),
  /** Comma-separated fallback chain for `buildChatModelWithFallback`. When
   *  the primary throws, LangChain's withFallbacks tries each in order. */
  FIELD_REPORTER_FALLBACK_PROVIDERS: z.string().optional(),
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

  /* --- Auth — email-link sign-in (the operator console is single-user) --- */
  /** Signing secret for the session JWT and the magic-link token. */
  NEXTAUTH_SECRET: z.string().min(1).optional(),
  /** The one address allowed to sign in; every other email is rejected. */
  ADMIN_EMAIL: z.string().min(1).optional(),
  /** `From:` header on the magic-link email. */
  EMAIL_FROM: z.string().min(1).optional(),
  /** Mailgun sending domain — the magic-link email is sent through it. */
  MAILGUN_DOMAIN: z.string().min(1).optional(),
  /** Mailgun private API key — used for HTTP Basic auth against the API. */
  MAILGUN_API_KEY: z.string().min(1).optional(),

  /* --- WitUS SSO — "Sign in with WitUS" ecosystem OIDC (code flow) --------- */
  /** OIDC client id issued for this app by the WitUS IdP. When set, the
   *  "Sign in with WitUS" button appears on /signin. */
  WITUS_OIDC_CLIENT_ID: z.string().min(1).optional(),
  /** OIDC client secret for the confidential token exchange. */
  WITUS_OIDC_CLIENT_SECRET: z.string().min(1).optional(),
  /** Optional endpoint overrides; each defaults to the accounts.witus.online
   *  `/api/idp/oauth2/*` route in the route handlers. */
  WITUS_OIDC_AUTHORIZE_URL: z.string().url().optional(),
  WITUS_OIDC_TOKEN_URL: z.string().url().optional(),
  WITUS_OIDC_USERINFO_URL: z.string().url().optional(),
  /** Canonical public origin, e.g. `https://field-reporter.witus.online`. Used
   *  to build the OIDC redirect_uri so it matches what the IdP has registered;
   *  falls back to the request origin when unset. */
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),

  /* --- WitUS Inbox — triage queue receiver for waitlist signups ----------- */
  /** Inbox webhook endpoint, e.g. `https://inbox.witus.online/api/ingest`. */
  INBOX_INGEST_URL: z.string().min(1).optional(),
  /** HMAC-SHA256 secret matching this slug's row in the Inbox `INGEST_SOURCES`. */
  INBOX_INGEST_SECRET: z.string().min(1).optional(),
  /** Lowercase kebab slug this product is registered under in the Inbox. */
  INBOX_SOURCE_SLUG: z.string().min(1).optional(),
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
