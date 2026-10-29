/**
 * The sign-out controls' markup (BAM, 2026-10-29, witus task 128 option (b)).
 *
 * No DOM test setup in this repo (vitest in node, `tests/**\/*.test.ts`), so this renders to static
 * HTML with react-dom's server renderer, without JSX (the include pattern is .ts only). The click order
 * ("local first, then the IdP") is pinned on the pure `signOutEverywhere` in
 * tests/lib/witus-sso.test.ts. The Server Actions are mocked: rendering must not touch a session.
 */
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth/actions", () => ({
  signOut: vi.fn(async () => {}),
  signOutLocal: vi.fn(async () => {}),
}));

const { SignOutButton } = await import("@/components/sign-out-button");

const END_SESSION =
  "https://accounts.witus.online/api/idp/oauth2/endsession?client_id=witus-field-reporter" +
  "&post_logout_redirect_uri=https%3A%2F%2Fwanderlearn.field.reporter.witus.online%2F";
const HELP =
  "Also signs you out of WitUS. Other WitUS apps you are signed in to stay signed in until you sign out of them.";

describe("SignOutButton", () => {
  it('renders only a local "Sign out" when unconfigured', () => {
    // SignOutButton itself calls no hooks, so calling it yields the element tree to render.
    const html = renderToStaticMarkup(SignOutButton({ endSessionUrl: null }));
    expect(html).toMatch(/<button type="submit"[^>]*>Sign out<\/button>/);
    expect(html).not.toContain("Sign out of WitUS");
    expect(html).not.toContain("endsession");
    expect(html).not.toContain(HELP);
  });

  it('keeps the local "Sign out" and adds the everywhere control when configured', () => {
    const html = renderToStaticMarkup(SignOutButton({ endSessionUrl: END_SESSION }));
    // The plain control is unchanged: a form submit named exactly "Sign out", no IdP URL on it.
    const form = html.match(/<form[\s\S]*?<\/form>/)?.[0] ?? "";
    expect(form).toMatch(/<button type="submit"[^>]*>Sign out<\/button>/);
    expect(form).not.toContain("endsession");
    // The URL never appears in the markup at all: it is only used on click.
    expect(html).not.toContain("endsession");
    const button = html.match(
      /<button type="button"[^>]*>Sign out of WitUS everywhere<\/button>/,
    )?.[0];
    expect(button).toBeTruthy();
    const describedBy = button?.match(/aria-describedby="([^"]+)"/)?.[1];
    expect(describedBy).toBeTruthy();
    expect(html).toMatch(new RegExp(`<p id="${describedBy}"[^>]*>${HELP.replace(/\./g, "\\.")}</p>`));
  });
});
