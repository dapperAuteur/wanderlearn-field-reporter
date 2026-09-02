/**
 * Ecosystem SSO helpers — "Continue as <name>" and global sign-out.
 *
 * Offline and deterministic: no network, no DOM. It pins the four things that are expensive to get
 * wrong and invisible when they are — the derived IdP URLs, the trailing slash on the post-logout
 * URI, the loop guard, and the fact that a name from another origin is sanitized display copy.
 */
import { describe, expect, it } from "vitest";

import {
  DEFAULT_WITUS_AUTHORIZE_URL,
  continueAsLabel,
  endSessionEndpointFromAuthorizeUrl,
  hasAttemptMarker,
  parseSilentSsoIdentity,
  silentSsoDecision,
  silentSsoEndpointFromAuthorizeUrl,
  withAttemptMarker,
  witusPostLogoutRedirectUri,
  witusRedirectUri,
} from "@/lib/witus-sso";

describe("IdP URLs derived from the authorize URL", () => {
  it("derives the end-session endpoint under the OIDC basePath", () => {
    expect(endSessionEndpointFromAuthorizeUrl(DEFAULT_WITUS_AUTHORIZE_URL)).toBe(
      "https://accounts.witus.online/api/idp/oauth2/endsession",
    );
  });

  it("derives the ecosystem probe from the IdP ORIGIN, not the basePath", () => {
    // /api/ecosystem/session is the IdP app's own route, not a better-auth one.
    expect(silentSsoEndpointFromAuthorizeUrl(DEFAULT_WITUS_AUTHORIZE_URL)).toBe(
      "https://accounts.witus.online/api/ecosystem/session",
    );
  });

  it("follows an override to a different host and basePath", () => {
    const override = "https://idp.example.test/auth/oauth2/authorize";
    expect(endSessionEndpointFromAuthorizeUrl(override)).toBe(
      "https://idp.example.test/auth/oauth2/endsession",
    );
    expect(silentSsoEndpointFromAuthorizeUrl(override)).toBe(
      "https://idp.example.test/api/ecosystem/session",
    );
  });

  it("returns null rather than inventing a URL when the source is unusable", () => {
    for (const bad of [null, undefined, "", "not-a-url", "https://idp.example.test/authorize"]) {
      expect(endSessionEndpointFromAuthorizeUrl(bad)).toBeNull();
      expect(silentSsoEndpointFromAuthorizeUrl(bad)).toBeNull();
    }
  });
});

describe("this app's registered URIs", () => {
  it("builds the redirect_uri the IdP registry has for this client", () => {
    expect(witusRedirectUri("https://wanderlearn.field.reporter.witus.online")).toBe(
      "https://wanderlearn.field.reporter.witus.online/api/auth/witus/callback",
    );
  });

  it("keeps the trailing slash on post_logout_redirect_uri", () => {
    // better-auth exact-matches this against the client's registered redirectUrls, and the registry
    // registers `origin + "/"`. Dropping the slash is a 400, not a soft failure.
    expect(witusPostLogoutRedirectUri("https://wanderlearn.field.reporter.witus.online")).toBe(
      "https://wanderlearn.field.reporter.witus.online/",
    );
  });

  it("normalises a configured site URL that already ends in a slash", () => {
    const configured = "https://wanderlearn.field.reporter.witus.online/";
    expect(witusRedirectUri(configured)).toBe(
      "https://wanderlearn.field.reporter.witus.online/api/auth/witus/callback",
    );
    expect(witusPostLogoutRedirectUri(configured)).toBe(
      "https://wanderlearn.field.reporter.witus.online/",
    );
  });
});

describe("the loop guard", () => {
  it("recognises the marker and ignores anything else", () => {
    expect(hasAttemptMarker("?sso=tried")).toBe(true);
    expect(hasAttemptMarker("sso=tried")).toBe(true);
    expect(hasAttemptMarker("?error=witus_state&sso=tried")).toBe(true);
    expect(hasAttemptMarker("?sso=nope")).toBe(false);
    expect(hasAttemptMarker("")).toBe(false);
    expect(hasAttemptMarker(null)).toBe(false);
  });

  it("adds the marker without losing the error code the page needs", () => {
    expect(withAttemptMarker("/signin?error=witus_state")).toBe(
      "/signin?error=witus_state&sso=tried",
    );
    expect(withAttemptMarker("/signin")).toBe("/signin?sso=tried");
  });

  it("skips the probe once an attempt has been marked, by either half", () => {
    const endpoint = "https://accounts.witus.online/api/ecosystem/session";
    expect(silentSsoDecision({ endpoint })).toEqual({ attempt: true });
    expect(silentSsoDecision({ endpoint, attempted: true })).toEqual({
      attempt: false,
      skip: "already-attempted",
    });
    expect(silentSsoDecision({ endpoint, search: "?sso=tried" })).toEqual({
      attempt: false,
      skip: "already-attempted",
    });
  });

  it("stays dark when the app is not a configured OIDC client", () => {
    expect(silentSsoDecision({ endpoint: null })).toEqual({
      attempt: false,
      skip: "not-configured",
    });
  });

  it("does not ask who you are when you are already signed in here", () => {
    expect(
      silentSsoDecision({
        endpoint: "https://accounts.witus.online/api/ecosystem/session",
        signedIn: true,
      }),
    ).toEqual({ attempt: false, skip: "already-signed-in" });
  });
});

describe("the probe response is display copy, never a credential", () => {
  it("reads a name out of the documented shape", () => {
    expect(parseSilentSsoIdentity({ signedIn: true, user: { name: "Brand" } })).toEqual({
      label: "Brand",
    });
  });

  it("renders nothing for a signed-out answer", () => {
    expect(parseSilentSsoIdentity({ signedIn: false })).toBeNull();
    expect(parseSilentSsoIdentity(null)).toBeNull();
    expect(parseSilentSsoIdentity("nope")).toBeNull();
    expect(parseSilentSsoIdentity({ user: {} })).toBeNull();
  });

  it("strips control characters and collapses surrounding whitespace", () => {
    const hostile = { user: { name: " \u0000Br\u0007and\u007F " } };
    expect(parseSilentSsoIdentity(hostile)).toEqual({ label: "Brand" });
  });

  it("caps an absurd name so it cannot blow up the button", () => {
    const found = parseSilentSsoIdentity({ user: { name: "x".repeat(400) } });
    expect(found?.label).toHaveLength(48);
    expect(found?.label.endsWith("…")).toBe(true);
  });

  it("pins the exact copy the visitor reads", () => {
    expect(continueAsLabel(null)).toBe("Sign in with WitUS");
    expect(continueAsLabel({ label: "Brand" })).toBe("Continue as Brand");
  });
});
