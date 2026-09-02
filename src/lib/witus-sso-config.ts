/**
 * Server-side resolution of the two ecosystem-SSO URLs. The pure helpers they are built from live
 * in `witus-sso.ts`; this file is the half that touches env and request headers.
 *
 * WHY IT IS SEPARATE. Both consumers are client components — the sign-in button and the sign-out
 * button — and a client component must never be handed the raw env. The server resolves the finished
 * URL and passes it down as a prop, or passes `null` and the feature stays dark.
 */
import "server-only";
import { headers } from "next/headers";
import { getEnv } from "@/lib/env";
import {
  DEFAULT_WITUS_AUTHORIZE_URL,
  endSessionEndpointFromAuthorizeUrl,
  silentSsoEndpointFromAuthorizeUrl,
  witusPostLogoutRedirectUri,
} from "@/lib/witus-sso";

/**
 * This app's canonical public origin.
 *
 * `NEXT_PUBLIC_SITE_URL` when set — the same expression `/api/auth/witus/authorize` uses to build
 * the OIDC `redirect_uri` — otherwise the request's own origin. Sharing the source is the point:
 * the IdP exact-matches BOTH the redirect_uri and the post_logout_redirect_uri against this
 * client's registered URLs, so if sign-in and sign-out derived the origin differently, one of them
 * would 400 on any host where they disagreed (a Vercel preview, or an apex/www split).
 */
export async function siteOrigin(): Promise<string> {
  const configured = getEnv().NEXT_PUBLIC_SITE_URL;
  if (configured) return configured;
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto =
    h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

/** The configured IdP authorize URL — the one source every other IdP URL is derived from. */
function authorizeUrl(): string {
  return getEnv().WITUS_OIDC_AUTHORIZE_URL ?? DEFAULT_WITUS_AUTHORIZE_URL;
}

/**
 * Where /signin's silent "Continue as …" check asks the IdP who this browser is, or `null` when
 * this app is not a configured OIDC client.
 *
 * Dark without `WITUS_OIDC_CLIENT_ID` for the same reason the button itself is: there is no sign-in
 * to offer, so there is no question worth asking — and asking anyway would send a request to
 * accounts.witus.online on behalf of an app that cannot complete the flow.
 */
export function witusSilentSsoEndpoint(): string | null {
  if (!getEnv().WITUS_OIDC_CLIENT_ID) return null;
  return silentSsoEndpointFromAuthorizeUrl(authorizeUrl());
}

/**
 * The full RP-initiated logout URL for global sign-out, or `null` when this app is not a configured
 * OIDC client (in which case sign-out stays purely local, exactly as it is today).
 *
 * `client_id` IS REQUIRED, not optional: better-auth's endSession endpoint rejects a
 * `post_logout_redirect_uri` with `invalid_request` unless the request carries either a verifiable
 * `id_token_hint` or an explicit `client_id`, and this app holds no id_token client-side — the
 * callback reads claims from userinfo server-to-server and throws the tokens away.
 *
 * ORIGIN CAVEAT. `post_logout_redirect_uri` must EXACTLY equal what the IdP registry holds for this
 * client, which is that client's registered origin plus a trailing slash. It is built here from
 * `siteOrigin()` so it can never disagree with the redirect_uri the sign-in flow sends; if the
 * registered origin itself is wrong, both fail closed (a 400 from the IdP), which is the safe
 * direction but does mean sign-out lands on the IdP's own page instead of coming back here. The
 * visitor is still signed out locally either way — see sign-out-button.tsx for why the ordering
 * guarantees that.
 */
export async function witusEndSessionUrl(): Promise<string | null> {
  const clientId = getEnv().WITUS_OIDC_CLIENT_ID;
  if (!clientId) return null;
  const base = endSessionEndpointFromAuthorizeUrl(authorizeUrl());
  if (!base) return null;
  const back = witusPostLogoutRedirectUri(await siteOrigin());
  return (
    `${base}?client_id=${encodeURIComponent(clientId)}` +
    `&post_logout_redirect_uri=${encodeURIComponent(back)}`
  );
}
