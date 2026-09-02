/**
 * Ecosystem SSO helpers — "Continue as <name>" and global sign-out.
 *
 * TWO FEATURES, ONE FILE OF PURE FUNCTIONS.
 *
 *  1. The SILENT SESSION PROBE behind "Continue as <name>". BAM's complaint (2026-08-30): signing
 *     in on one WitUS app makes you type an email even when another tab already has you signed in
 *     to WitUS. The fix he chose is deliberately NOT automatic: /signin renders exactly as it does
 *     today, and in parallel the browser asks the IdP "who is this?". If an answer arrives, the
 *     existing "Sign in with WitUS" button relabels to "Continue as <name>". Nothing waits on it.
 *
 *  2. GLOBAL SIGN-OUT. Signing out here also ends the shared session at the IdP, so signing out of
 *     one WitUS app signs you out of all of them. Without it, "Continue as <name>" would offer to
 *     sign you straight back in the moment you signed out, which reads as a broken logout.
 *
 * WHY A CORS FETCH AND NOT OIDC `prompt=none`. `prompt=none` is a NAVIGATION — you leave the page
 * to ask — which is the fully-automatic design BAM rejected, and the only way to ask without
 * leaving is a hidden iframe, which Safari's ITP blocks anyway. So we ask a dedicated IdP endpoint
 * over CORS while the form is already on screen.
 *
 * THE PROBE ANSWERS ON SOME BROWSERS AND THAT IS FINE. It carries the IdP's cookie as a THIRD-PARTY
 * cookie, so Chrome/Edge answer and Safari ITP / Firefox Total Cookie Protection answer nothing. A
 * probe that answers nothing must render nothing: the visitor keeps the page they already had.
 *
 * NOTHING HERE IS A CREDENTIAL. The name arrives across an origin boundary, so it is client-supplied
 * data by definition. It is display copy on a button whose click runs the REAL OIDC code flow in
 * /api/auth/witus/{authorize,callback} — which is still gated on ADMIN_EMAIL, exactly as the magic
 * link is. Nothing in this file may ever grant access, populate a session, or be sent anywhere.
 *
 * Pure by design: no `server-only`, no `next/headers`, no `window` at module scope. The client
 * component and the tests both import it directly; the server-side resolution that needs env lives
 * in `witus-sso-config.ts`.
 */

/**
 * The IdP's authorize endpoint, and the SINGLE source every other IdP URL below is derived from.
 *
 * Overridable with `WITUS_OIDC_AUTHORIZE_URL` (see .env.example). This app has no OIDC discovery
 * URL — the code flow was written against the three explicit endpoint vars — so the authorize URL
 * is the authoritative local statement of "where the IdP is". Deriving the probe and end-session
 * URLs from it means a self-hosted or staging IdP moves all three at once, and this repo never
 * asserts a second, independently-guessable accounts.witus.online path (authoritative-values rule).
 */
export const DEFAULT_WITUS_AUTHORIZE_URL =
  "https://accounts.witus.online/api/idp/oauth2/authorize";

/** This app's OIDC callback path. Must match what the IdP registry has for this client. */
export const WITUS_CALLBACK_PATH = "/api/auth/witus/callback";

/** Query param marking "this browser already tried the ecosystem flow". */
export const SSO_ATTEMPT_PARAM = "sso";
export const SSO_ATTEMPT_VALUE = "tried";

/**
 * sessionStorage key for the same marker. Written IMMEDIATELY BEFORE we send the browser to the
 * IdP, never after it returns: a marker written on return is a marker that never exists when the
 * return is the thing that failed.
 */
export const SSO_ATTEMPT_STORAGE_KEY = "witus.sso.attempted";

/** How long to wait for the probe before giving up. A silent check that hangs is a broken page. */
export const SILENT_SSO_TIMEOUT_MS = 4000;

/** Longest display name we render. Caps a hostile or absurd value from blowing up the button. */
const MAX_LABEL_LENGTH = 48;

/**
 * Strip C0/C7F control characters by code point rather than with a regex literal, so this file
 * carries no raw control bytes of its own (and no `no-control-regex` suppression).
 */
function stripControlChars(value: string): string {
  let out = "";
  for (const ch of value) {
    const code = ch.codePointAt(0) ?? 0;
    if (code >= 0x20 && code !== 0x7f) out += ch;
  }
  return out;
}

/** Identity shown on the button. Display only, never a credential. */
export interface SsoIdentity {
  /** What "Continue as ___" says — already de-controlled, trimmed, and length-capped. */
  label: string;
}

export type SilentSsoSkip = "not-configured" | "already-attempted" | "already-signed-in";

export type SilentSsoDecision = { attempt: true } | { attempt: false; skip: SilentSsoSkip };

/**
 * Should this browser ask the IdP who it is?
 *
 * `endpoint` is resolved on the SERVER (witus-sso-config.ts) and is `null` whenever
 * `WITUS_OIDC_CLIENT_ID` is unset — an affordance the visitor cannot complete is worse than no
 * affordance, so the whole feature stays dark rather than offering a button that dead-ends.
 *
 * Field Reporter is single-tenant and WitUS-branded end to end, so there is no white-label host to
 * gate on here the way learnwitus has to; `endpoint` being non-null IS the gate.
 */
export function silentSsoDecision(input: {
  endpoint: string | null | undefined;
  search?: string | null;
  attempted?: boolean;
  signedIn?: boolean;
}): SilentSsoDecision {
  if (!input.endpoint) return { attempt: false, skip: "not-configured" };
  if (input.signedIn) return { attempt: false, skip: "already-signed-in" };
  if (input.attempted || hasAttemptMarker(input.search)) {
    return { attempt: false, skip: "already-attempted" };
  }
  return { attempt: true };
}

/** Does this query string carry the one-shot marker? Accepts "?a=b" or "a=b". */
export function hasAttemptMarker(search: string | null | undefined): boolean {
  if (typeof search !== "string" || search === "") return false;
  const params = new URLSearchParams(
    search.startsWith("?") ? search.slice(1) : search,
  );
  return params.get(SSO_ATTEMPT_PARAM) === SSO_ATTEMPT_VALUE;
}

/**
 * Add the one-shot marker to a same-origin path, preserving any query it already has (notably
 * `?error=`, which is how /signin explains what went wrong).
 */
export function withAttemptMarker(path: string): string {
  const [beforeHash, ...hashRest] = path.split("#");
  const hash = hashRest.length > 0 ? `#${hashRest.join("#")}` : "";
  const [pathname, ...queryRest] = beforeHash.split("?");
  const params = new URLSearchParams(queryRest.join("?"));
  params.set(SSO_ATTEMPT_PARAM, SSO_ATTEMPT_VALUE);
  return `${pathname}?${params.toString()}${hash}`;
}

/** Drop a trailing slash so origins concatenate predictably. */
export function normalizeOrigin(siteUrl: string): string {
  return siteUrl.replace(/\/$/, "");
}

/**
 * The OIDC `redirect_uri` this app sends. Shared by /api/auth/witus/authorize and its callback so
 * the two can never drift — a mismatch between them is an unrecoverable `invalid_grant`.
 */
export function witusRedirectUri(siteUrl: string): string {
  return `${normalizeOrigin(siteUrl)}${WITUS_CALLBACK_PATH}`;
}

/**
 * The `post_logout_redirect_uri` the IdP sends the visitor back to after a global sign-out.
 *
 * THE TRAILING SLASH IS REQUIRED. better-auth exact-matches this against the client's registered
 * `redirectUrls`, and the IdP registry (gemini/witus lib/identity/clients.ts) registers
 * `origin + "/"` for every app. Drop the slash and the IdP answers 400 `invalid_request`.
 *
 * Derived from the SAME `siteUrl` as `witusRedirectUri` above, deliberately: this app falls back to
 * the request origin when `NEXT_PUBLIC_SITE_URL` is unset, and if sign-in and sign-out resolved
 * that independently they could disagree on a Vercel preview host.
 */
export function witusPostLogoutRedirectUri(siteUrl: string): string {
  return `${normalizeOrigin(siteUrl)}/`;
}

/**
 * Split the configured authorize URL into the IdP's origin and its better-auth basePath.
 *
 *   https://accounts.witus.online/api/idp/oauth2/authorize
 *     -> { origin: "https://accounts.witus.online", basePath: "/api/idp" }
 *
 * Returns null for anything that is not a URL ending in `/oauth2/authorize`, so a mis-set override
 * turns the features off rather than pointing them somewhere invented.
 */
function splitAuthorizeUrl(
  authorizeUrl: string | null | undefined,
): { origin: string; basePath: string } | null {
  if (!authorizeUrl) return null;
  let parsed: URL;
  try {
    parsed = new URL(authorizeUrl);
  } catch {
    return null;
  }
  const cut = parsed.pathname.indexOf("/oauth2/authorize");
  if (cut < 0) return null;
  return { origin: parsed.origin, basePath: parsed.pathname.slice(0, cut) };
}

/**
 * The IdP's RP-initiated logout endpoint — `<basePath>/oauth2/endsession`, the `end_session_endpoint`
 * its discovery document advertises.
 */
export function endSessionEndpointFromAuthorizeUrl(
  authorizeUrl: string | null | undefined,
): string | null {
  const parts = splitAuthorizeUrl(authorizeUrl);
  if (!parts) return null;
  return `${parts.origin}${parts.basePath}/oauth2/endsession`;
}

/**
 * The ecosystem session probe — `<idp-origin>/api/ecosystem/session`.
 *
 * NOT the IdP's better-auth `/get-session`, and it must never be pointed there: that route returns
 * the full `{ session, user }` including the SESSION TOKEN, so a credentialed allow-origin on it
 * would let any ecosystem origin (or an XSS on one) lift a live IdP session. `/api/ecosystem/session`
 * is the purpose-built replacement in gemini/witus: same cookie, but it answers with a display
 * label and nothing else, and its allow-origin list comes from the IdP's own client registry.
 *
 * Note it is on the IdP's ORIGIN, not under the OIDC basePath — it is that app's own route, not a
 * better-auth one.
 */
export function silentSsoEndpointFromAuthorizeUrl(
  authorizeUrl: string | null | undefined,
): string | null {
  const parts = splitAuthorizeUrl(authorizeUrl);
  if (!parts) return null;
  return `${parts.origin}/api/ecosystem/session`;
}

/**
 * Read a display name out of the probe response.
 *
 * Handles `{ signedIn: true, user: { name } }`, a bare user object, and the signed-out answer
 * (`{ signedIn: false }`, which is a 200 rather than an error). Anything else yields null, which
 * renders nothing.
 */
export function parseSilentSsoIdentity(payload: unknown): SsoIdentity | null {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  if (root.signedIn === false) return null;
  const candidate =
    root.user && typeof root.user === "object"
      ? (root.user as Record<string, unknown>)
      : root;
  const label =
    cleanLabel(candidate.name) ??
    cleanLabel(candidate.label) ??
    cleanLabel(candidate.email);
  return label ? { label } : null;
}

function cleanLabel(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const cleaned = stripControlChars(value).trim();
  if (!cleaned) return null;
  return cleaned.length > MAX_LABEL_LENGTH
    ? `${cleaned.slice(0, MAX_LABEL_LENGTH - 1).trimEnd()}…`
    : cleaned;
}

/** Button copy. Kept here so the test pins the exact string the visitor reads. */
export function continueAsLabel(identity: SsoIdentity | null): string {
  return identity ? `Continue as ${identity.label}` : "Sign in with WitUS";
}
