"use client";

import { useEffect, useState } from "react";
import {
  SILENT_SSO_TIMEOUT_MS,
  SSO_ATTEMPT_STORAGE_KEY,
  continueAsLabel,
  parseSilentSsoIdentity,
  silentSsoDecision,
  type SsoIdentity,
} from "@/lib/witus-sso";

/**
 * "Sign in with WitUS", plus the silent "Continue as <name>" check layered on top of it.
 *
 * WHAT THE VISITOR SEES. Exactly what they see today, immediately: the button reads "Sign in with
 * WitUS" from the first paint and the email form below it is already usable. Nothing waits on the
 * probe. If the probe comes back with a live WitUS session, the label becomes "Continue as <name>".
 * If it fails, times out, is blocked by the browser's third-party-cookie rules, or the IdP does not
 * answer, NOTHING changes and nothing is said — a failed silent check has to be invisible, and it
 * is the common case (the IdP's cookie is third-party here, so Safari ITP and Firefox Total Cookie
 * Protection answer nothing at all).
 *
 * THE NAME IS DISPLAY COPY, NEVER A CREDENTIAL. It crossed an origin boundary to get here, so it is
 * client-supplied by definition. Clicking the button runs the real OIDC code flow through
 * /api/auth/witus/authorize, which is still gated on ADMIN_EMAIL in the callback — so a probe
 * answering "Continue as someone-else" grants that someone exactly nothing.
 *
 * STILL AN ANCHOR, ON PURPOSE. The element is the same `<a href="/api/auth/witus/authorize">` this
 * page shipped before, so sign-in keeps working with JavaScript off or still loading, and
 * middle-click/open-in-new-tab behave. The only JS on the click path writes the loop-guard marker.
 */
export function WitusSsoButton({
  silentCheckUrl,
}: {
  /** Server-resolved IdP probe endpoint, or null when this app is not a configured OIDC client. */
  silentCheckUrl: string | null;
}) {
  const [identity, setIdentity] = useState<SsoIdentity | null>(null);

  useEffect(() => {
    const endpoint = silentCheckUrl;
    const decision = silentSsoDecision({
      endpoint,
      search: window.location.search,
      attempted: readAttempted(),
    });
    // `!endpoint` is already implied by decision.attempt; repeating it keeps the narrowing the
    // compiler's rather than a cast that could outlive the invariant.
    if (!decision.attempt || !endpoint) return;

    // Abort rather than hang. A probe still in flight after the visitor has moved on wastes their
    // attention, not just a socket.
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), SILENT_SSO_TIMEOUT_MS);
    let live = true;

    // `credentials: "include"` is the entire mechanism: the answer depends on the IdP's OWN cookie,
    // which is third-party from here. Browsers that partition or block third-party cookies answer
    // "nobody", and that is a supported outcome rather than a bug to work around.
    fetch(endpoint, {
      credentials: "include",
      mode: "cors",
      cache: "no-store",
      headers: { accept: "application/json" },
      signal: controller.signal,
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((payload) => {
        if (!live) return;
        const found = parseSilentSsoIdentity(payload);
        if (found) setIdentity(found);
      })
      .catch(() => {
        // Invisible on purpose: network error, CORS refusal, abort, non-JSON body — all the same.
      })
      .finally(() => clearTimeout(timer));

    return () => {
      live = false;
      clearTimeout(timer);
      controller.abort();
    };
  }, [silentCheckUrl]);

  return (
    <>
      <a
        href="/api/auth/witus/authorize"
        // THE LOOP GUARD, written BEFORE we leave for the IdP and never after we come back: a
        // marker written on return never exists when the return is the thing that failed. Without
        // it, a stale IdP session gives probe → "Continue as X" → click → the IdP cannot finish →
        // back to /signin → probe → forever. With it, one attempt per tab; the second render offers
        // the plain button and the email form, which always work.
        onClick={writeAttempted}
        className="flex w-full items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900"
      >
        {continueAsLabel(identity)}
      </a>
      {/* Always in the DOM so the label change is announced when it happens, and silent (and
          invisible) when the probe found nothing. */}
      <p
        role="status"
        aria-live="polite"
        className={identity ? "mt-2 text-center text-xs text-slate-500" : "sr-only"}
      >
        {identity ? "Not you? Use your email below instead." : ""}
      </p>
    </>
  );
}

/**
 * sessionStorage throws outright in some privacy modes, so both halves are wrapped. A browser that
 * cannot remember the attempt still gets the other half of the guard: the `?sso=tried` marker the
 * witus callback route puts on the URL when the flow fails.
 */
function readAttempted(): boolean {
  try {
    return window.sessionStorage.getItem(SSO_ATTEMPT_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function writeAttempted(): void {
  try {
    window.sessionStorage.setItem(SSO_ATTEMPT_STORAGE_KEY, "1");
  } catch {
    // No storage, no marker. The query-param half still applies.
  }
}
