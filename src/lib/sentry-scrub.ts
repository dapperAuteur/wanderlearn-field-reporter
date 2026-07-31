import type { ErrorEvent } from "@sentry/nextjs";

/**
 * Sentry `beforeSend` scrubber: the privacy boundary between this agent and the error-monitoring
 * vendor. The vendor is Better Stack, which ingests the `@sentry/nextjs` wire format, so the SDK
 * and this hook are the same code either way.
 *
 * WHY AN LLM APP NEEDS A HARDER SCRUB THAN A CRUD APP
 * --------------------------------------------------
 * Two classes of sensitive data flow through this process, and neither of them arrives in a tidy
 * labelled field. Both show up inside error strings and breadcrumb blobs.
 *
 * 1. PROVIDER CREDENTIALS. Seven LLM providers plus Tavily, LangSmith, Mailgun, Cloudinary and Neon
 *    are configured here (see `src/lib/env.ts`). When a provider SDK fails it commonly stringifies
 *    the failing request, so an UNLABELLED key rides along in the message: `sk-ant-...`, `sk-...`,
 *    `AIza...`, `lsv2_...`, `tvly-...`, a bare `Bearer <jwt>`, or a `user:password@host` pair inside
 *    a connection URL. Name-based redaction alone misses every one of those, so keys are matched BY
 *    SHAPE as well as by field name.
 *
 * 2. MODEL PAYLOADS: prompts, model responses, and the raw capture they were built from. A field
 *    capture is a human transcript of a real place with GPS and photo references, i.e. USER content.
 *    We have no consent to ship it to a third party, and it is not what you need in order to fix a
 *    crash.
 *
 *    DECISION ON PROMPTS AND RESPONSES: they are DROPPED, not redacted.
 *    Any field whose name is a known payload field (`prompt`, `messages`, `input`, `output`,
 *    `completion`, `content`, `text`, `transcript`, `draft`, `body`, `latitude`, ...) is replaced
 *    wholesale with a marker, so the SHAPE of the failure survives and the content does not. Local
 *    variables on stack frames are deleted for the same reason: the failing frame in `write.ts` or
 *    `critique.ts` holds the whole prompt in a local. Free text we deliberately KEEP (an exception
 *    message, a breadcrumb message) is secret-scrubbed and hard-capped at `MAX_TEXT_LEN`, because a
 *    LangChain output-parser failure will put an entire multi-thousand-token draft into
 *    `error.message`. The first line, which is the part that names the bug, always survives the cap.
 *    The tradeoff is deliberate: we lose the ability to read a bad model response from the error
 *    report (go to the LangSmith trace for that, which is consented and access-controlled) and we
 *    keep the ability to see that a crash happened, where, and in which node.
 *
 * IMPLEMENTATION CONSTRAINTS (each of these is a bug someone already shipped)
 * -------------------------------------------------------------------------
 * - NO REGEX LOOKBEHIND. This module is imported by the client bundle, and lookbehind is a
 *   SyntaxError on iOS Safari below 16.4, which would break the chunk for those users even with no
 *   DSN configured. Every pattern below is lookbehind-free.
 * - `request.query_string` IS A SEPARATE FIELD from `request.url`. A bare query string is not a
 *   parseable URL, so a URL-only pass silently misses `?token=` and `?code=`. It is scrubbed
 *   explicitly, in all three shapes the type allows (string, object, array of pairs).
 * - MATCH PER NAME SEGMENT, NOT SUBSTRING, and split on `_` as well as camelCase, because `\b`
 *   does not fire inside `LANGSMITH_API_KEY`. Segment matching is also what keeps `state` out of
 *   the secret set: the OIDC `state` param is a CSRF correlator, not a bearer token, and redacting
 *   it would hide the exact mismatch this app's callback route reports.
 * - PATH CONTEXT BEATS SHAPE when ids and tokens look alike. A report id and a login token are both
 *   long opaque strings, so path segments are only masked under `/api/auth/`, never everywhere.
 * - DEEP SCRUB IS KEY-AWARE and covers `breadcrumbs`, `extra`, `tags`, `contexts` and `request.data`.
 *   `contexts.trace` is exempt: it is trace/span ids used for grouping and correlation, and mangling
 *   it breaks the link between an error and its trace without protecting anything.
 *
 * It never returns null. We still want the crash signal, just without the credentials or the
 * learner's prose. Pure and dependency-free so it is directly unit-testable:
 * see `tests/lib/sentry-scrub.test.ts`.
 */

export const REDACTED = "[redacted]";
export const DROPPED = "[dropped: model payload]";

/** Cap on any free text we keep. Long enough for a real error message, short enough that a full
 *  draft, transcript, or model response cannot ride along inside one. */
export const MAX_TEXT_LEN = 1024;

const MAX_DEPTH = 8;
const MAX_ARRAY_ITEMS = 100;

/**
 * Credential shapes, matched even when the key is unlabelled. Ordered: the most specific prefix
 * first, so a narrower rule cannot be half-consumed by a broader one.
 */
const SECRET_SHAPES: ReadonlyArray<readonly [RegExp, string]> = [
  // Anthropic: sk-ant-api03-...
  [/sk-ant-[A-Za-z0-9_-]{12,}/g, REDACTED],
  // OpenAI, OpenRouter (sk-or-v1-...), Together, and every other `sk-` prefixed provider key.
  [/\bsk-[A-Za-z0-9_-]{12,}/g, REDACTED],
  // Cerebras.
  [/\bcsk-[A-Za-z0-9_-]{12,}/g, REDACTED],
  // Google AI Studio / Gemini.
  [/\bAIza[A-Za-z0-9_-]{20,}/g, REDACTED],
  // LangSmith personal (lsv2_pt_) and service (lsv2_sk_) keys.
  [/\blsv2_[A-Za-z0-9_-]{12,}/g, REDACTED],
  // Tavily web search.
  [/\btvly-[A-Za-z0-9_-]{12,}/g, REDACTED],
  // Mailgun private API key and webhook signing key.
  [/\bkey-[A-Za-z0-9]{24,}/g, REDACTED],
  // A GitHub token, in case a CI credential reaches a log line.
  [/\bgh[pousr]_[A-Za-z0-9]{20,}/g, REDACTED],
  // A JWT: this app's own session cookie, an IdP id_token, a Google service token.
  [/\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{4,}/g, REDACTED],
  // `Authorization: Bearer <x>` / `Basic <x>` anywhere in prose. Keeps the scheme, drops the value.
  [/\b(bearer|basic)\s+[A-Za-z0-9._~+/=-]{8,}/gi, `$1 ${REDACTED}`],
  // Credentials embedded in a connection URL: postgres://user:pw@host,
  // cloudinary://key:secret@cloud, https://api:key@api.mailgun.net.
  [/\/\/[^/\s:@]{1,128}:[^/\s@]{1,256}@/g, `//${REDACTED}@`],
];

/**
 * `name = value` / `name: value` pairs in free text. Deliberately two-stage: the regex finds the
 * PAIR, then `isSecretName` decides, so the name logic lives in one place and is segment-aware
 * rather than substring-aware. `{` and `[` terminate a value, so a JSON object opening is never
 * mistaken for a secret and an already-redacted `key=[redacted]` is not redacted a second time.
 */
const NAME_VALUE_RE =
  /([A-Za-z][A-Za-z0-9]*(?:[_.\-][A-Za-z0-9]+)*)(\s*[:=]\s*)("?)([^\s"',;&)}\][{]{2,})\3/g;

/** Segments that make a field name secret on their own. */
const ALWAYS_SECRET: ReadonlySet<string> = new Set([
  "token",
  "tokens",
  "secret",
  "secrets",
  "password",
  "passwords",
  "passwd",
  "pwd",
  "passphrase",
  "passcode",
  "pin",
  "credential",
  "credentials",
  "authorization",
  "cookie",
  "cookies",
  "jwt",
  "bearer",
  "session",
  "sessionid",
  "dsn",
  "signature",
  "sig",
  "otp",
  "apikey",
  "apisecret",
  "privatekey",
  "hmac",
  "salt",
]);

/**
 * Segments that are secret only in company. `status_code` is triage gold and must survive;
 * `auth_code` must not. `authProvider` is a plain label; `authToken` is not. The value is the list
 * of qualifiers that flip the ambiguous segment to secret.
 */
const AMBIGUOUS_SEGMENTS: Readonly<Record<string, readonly string[]>> = {
  key: [
    "api",
    "secret",
    "private",
    "access",
    "publishable",
    "signing",
    "encryption",
    "service",
    "master",
    "license",
    "auth",
    "token",
  ],
  code: [
    "auth",
    "authorization",
    "otp",
    "verification",
    "verify",
    "invite",
    "access",
    "login",
    "magic",
    "onetime",
    "confirm",
    "activation",
    "activate",
    "recovery",
    "backup",
  ],
  auth: ["token", "code", "header", "secret", "key", "basic", "bearer", "value"],
  hash: ["password", "token", "secret", "key"],
};

/**
 * Ambiguous segments that ARE secret when they stand alone. A lone `code=` in a query string is
 * this app's OIDC authorization code, and a lone `key` is far more likely to be a credential than
 * a cache key. Redacting a cache key costs a debugging session; leaking an API key costs money.
 */
const SOLO_SECRET: ReadonlySet<string> = new Set(["key", "code", "auth"]);

/**
 * Field names whose VALUE is model or user content: prompts, responses, and the capture they came
 * from. Matched on the whole name (punctuation-stripped, lowercased) rather than per segment, so
 * `revisionNumber` and `modelProvider` survive while `system_prompt` and `modelOutput` do not.
 */
const PAYLOAD_FIELDS: ReadonlySet<string> = new Set([
  // Prompt side.
  "prompt",
  "prompts",
  "promptvalue",
  "systemprompt",
  "systemmessage",
  "userprompt",
  "humanprompt",
  "assistantprompt",
  "template",
  "messages",
  "chatmessages",
  "input",
  "inputs",
  "toolinput",
  "llminput",
  "modelinput",
  // Response side.
  "output",
  "outputs",
  "tooloutput",
  "llmoutput",
  "modeloutput",
  "modelresponse",
  "completion",
  "completions",
  "generation",
  "generations",
  "choices",
  "delta",
  "chunk",
  "chunks",
  "responsetext",
  "responsebody",
  // Free-form content fields the LangChain and fetch layers use.
  "content",
  "contents",
  "text",
  "texts",
  "body",
  "requestbody",
  "payload",
  "markdown",
  // This app's own capture and draft fields.
  "transcript",
  "transcripts",
  "transcription",
  "rawtranscript",
  "capture",
  "capturetranscript",
  "draft",
  "drafts",
  "draftmarkdown",
  "script",
  "lesson",
  "lessonmarkdown",
  "critique",
  "critiquenotes",
  "feedback",
  "notes",
  // Where a capture was taken. Location is user data, and no crash is fixed by knowing it.
  "gps",
  "coordinates",
  "latitude",
  "longitude",
  "location",
  // Embeddings are a lossy but real reconstruction of the text they encode.
  "embedding",
  "embeddings",
  "vector",
  "vectors",
]);

/** Request headers dropped outright rather than scrubbed. */
const DROP_HEADERS: ReadonlySet<string> = new Set([
  "cookie",
  "set-cookie",
  "authorization",
  "proxy-authorization",
  "x-api-key",
  "api-key",
  "x-auth-token",
  "x-csrf-token",
  "x-amz-security-token",
]);

/** Split a field name into lowercase segments, spanning `_`, `-`, `.` and camelCase humps. */
function nameSegments(name: string): string[] {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((segment) => segment.toLowerCase());
}

/** Whole-name form used for the payload-field lookup: `system_prompt` and `systemPrompt` agree. */
function normalizeName(name: string): string {
  return name.replace(/[^A-Za-z0-9]/g, "").toLowerCase();
}

/** Does this field name carry a credential? Segment-aware, never substring-aware. */
export function isSecretName(name: string): boolean {
  const segments = nameSegments(name);
  if (segments.some((segment) => ALWAYS_SECRET.has(segment))) return true;

  for (const segment of segments) {
    const qualifiers = AMBIGUOUS_SEGMENTS[segment];
    if (!qualifiers) continue;
    if (segments.length === 1 && SOLO_SECRET.has(segment)) return true;
    if (segments.some((other) => other !== segment && qualifiers.includes(other))) return true;
  }
  return false;
}

/** Is this field name a prompt, a model response, or the capture behind them? */
export function isPayloadName(name: string): boolean {
  return PAYLOAD_FIELDS.has(normalizeName(name));
}

function scrubShapes(text: string): string {
  let out = text;
  for (const [pattern, replacement] of SECRET_SHAPES) out = out.replace(pattern, replacement);
  return out;
}

function scrubLabelled(text: string): string {
  return text.replace(NAME_VALUE_RE, (match, name: string, separator: string, quote: string) =>
    isSecretName(name) ? `${name}${separator}${quote}${REDACTED}${quote}` : match,
  );
}

/** Scrub, then cap, one piece of free text. The cap is the prompt/response defense in prose form. */
export function scrubText(text: string): string {
  const scrubbed = scrubLabelled(scrubShapes(text));
  if (scrubbed.length <= MAX_TEXT_LEN) return scrubbed;
  const dropped = scrubbed.length - MAX_TEXT_LEN;
  return `${scrubbed.slice(0, MAX_TEXT_LEN)}… [truncated ${dropped} chars]`;
}

/**
 * Scrub a URL or a bare query string. Path segments are masked ONLY under `/api/auth/`: a login
 * token and a report id are the same shape, and the report id is how you find the failing run.
 */
export function scrubUrlLike(text: string): string {
  return scrubText(text).replace(
    /(\/api\/auth\/[A-Za-z0-9._~-]*\/)([A-Za-z0-9._~-]{12,})/g,
    `$1${REDACTED}`,
  );
}

/** Key-aware deep scrub. Returns a new value; never mutates the input. */
function scrubUnknown(value: unknown, depth: number, seen: WeakSet<object>): unknown {
  if (typeof value === "string") return scrubText(value);
  if (value === null || typeof value !== "object") return value;
  if (depth >= MAX_DEPTH) return "[dropped: depth limit]";
  if (seen.has(value)) return "[dropped: circular]";
  seen.add(value);

  if (Array.isArray(value)) {
    const items: unknown[] = value
      .slice(0, MAX_ARRAY_ITEMS)
      .map((item) => scrubUnknown(item, depth + 1, seen));
    if (value.length > MAX_ARRAY_ITEMS) {
      items.push(`[dropped: ${value.length - MAX_ARRAY_ITEMS} more items]`);
    }
    return items;
  }

  const out: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    if (isPayloadName(key)) {
      out[key] = DROPPED;
      continue;
    }
    if (isSecretName(key)) {
      out[key] = REDACTED;
      continue;
    }
    out[key] = scrubUnknown(entry, depth + 1, seen);
  }
  return out;
}

/** Public deep scrub for an arbitrary bag of context (used by the event pass and by tests). */
export function scrubDeep(value: unknown): unknown {
  return scrubUnknown(value, 0, new WeakSet<object>());
}

type QueryParams = NonNullable<NonNullable<ErrorEvent["request"]>["query_string"]>;

/**
 * `query_string` is its own field and comes in three shapes. It is the field that carries
 * `?token=` and `?code=` when the URL field has already been trimmed to a route.
 */
function scrubQueryString(query: QueryParams): QueryParams {
  if (typeof query === "string") return scrubUrlLike(query);

  if (Array.isArray(query)) {
    return query.map(([name, value]) => [
      name,
      isSecretName(name) || isPayloadName(name) ? REDACTED : scrubText(value),
    ]) as QueryParams;
  }

  const out: Record<string, string> = {};
  for (const [name, value] of Object.entries(query)) {
    out[name] = isSecretName(name) || isPayloadName(name) ? REDACTED : scrubText(value);
  }
  return out;
}

function scrubHeaders(headers: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [name, value] of Object.entries(headers)) {
    const lower = name.toLowerCase();
    if (DROP_HEADERS.has(lower) || isSecretName(lower)) continue;
    out[name] = scrubText(value);
  }
  return out;
}

/**
 * `beforeSend`. Strips credentials and model/user content from every field of an event that can
 * carry them, and leaves the triage signal (route, status, provider, node, stack) intact.
 */
export function scrubEvent(event: ErrorEvent): ErrorEvent {
  if (typeof event.message === "string") event.message = scrubText(event.message);

  if (event.logentry) {
    if (typeof event.logentry.message === "string") {
      event.logentry.message = scrubText(event.logentry.message);
    }
    if (Array.isArray(event.logentry.params)) {
      event.logentry.params = event.logentry.params.map((param) => scrubDeep(param));
    }
  }

  for (const exception of event.exception?.values ?? []) {
    if (typeof exception.value === "string") exception.value = scrubText(exception.value);
    for (const frame of exception.stacktrace?.frames ?? []) {
      // Local variables of the failing frame are where the prompt and the model response live in
      // an agent node. Never ship them, whatever `includeLocalVariables` is set to.
      if (frame.vars) delete frame.vars;
    }
  }

  // Identity: this console is single-operator, so the account id adds nothing a crash needs.
  if (event.user) {
    delete event.user.email;
    delete event.user.ip_address;
    delete event.user.username;
  }

  if (event.request) {
    const request = event.request;
    if (typeof request.url === "string") request.url = scrubUrlLike(request.url);
    if (request.query_string !== undefined && request.query_string !== null) {
      request.query_string = scrubQueryString(request.query_string);
    }
    delete request.cookies;
    // The request's own environment snapshot is every provider key at once.
    delete request.env;
    if (request.headers) request.headers = scrubHeaders(request.headers);
    if (request.data !== undefined) {
      // A raw string body is a capture transcript by construction here, so it goes entirely; an
      // object body keeps its keys (the useful part for a validation bug) and loses its payloads.
      request.data = typeof request.data === "string" ? DROPPED : scrubDeep(request.data);
    }
  }

  for (const crumb of event.breadcrumbs ?? []) {
    if (typeof crumb.message === "string") crumb.message = scrubText(crumb.message);
    if (crumb.data) crumb.data = scrubDeep(crumb.data) as Record<string, unknown>;
  }

  if (event.extra) event.extra = scrubDeep(event.extra) as ErrorEvent["extra"];

  if (event.tags) {
    for (const [name, value] of Object.entries(event.tags)) {
      if (isSecretName(name) || isPayloadName(name)) event.tags[name] = REDACTED;
      else if (typeof value === "string") event.tags[name] = scrubText(value);
    }
  }

  if (event.contexts) {
    for (const [name, context] of Object.entries(event.contexts)) {
      // `trace` is ids only, and it is what links this error to its trace. Leave it alone.
      if (name === "trace") continue;
      event.contexts[name] = scrubDeep(context) as Record<string, unknown>;
    }
  }

  return event;
}
