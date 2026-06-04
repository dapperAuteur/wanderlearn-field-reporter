import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Help & onboarding · Wanderlearn Field Reporter",
  description:
    "How to use the Wanderlearn Field Reporter — for visitors browsing reports, " +
    "for operators running the agent, and for anyone running the app.",
};

/**
 * Public help / onboarding page. Written for three readers — a visitor browsing
 * the portfolio, someone using the capture-to-lesson flow, and an operator
 * running or deploying the app — so the tool can be understood and used without
 * being its developer. Kept in sync with the app per the documentation-currency
 * rule in CLAUDE.md.
 */
export default function HelpPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">
        WitUS ecosystem · Wanderlearn
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        Help &amp; onboarding
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        The Field Reporter is an agent that turns a raw capture — a location
        transcript, GPS, and photo references — into a publishable lesson draft.
        It researches the place, writes a cited draft, then critiques its own
        draft against a quality checklist and revises until the draft passes or it
        asks a human to take over. This page explains how to use it, whichever of
        the three readers below you are.
      </p>

      <nav className="mt-8 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-900/40">
        <p className="font-semibold text-slate-900 dark:text-slate-100">On this page</p>
        <ul className="mt-2 space-y-1">
          <li>
            <a className="text-sky-700 hover:underline dark:text-sky-400" href="#browse">
              1. Browsing reports (no account needed)
            </a>
          </li>
          <li>
            <a className="text-sky-700 hover:underline dark:text-sky-400" href="#use">
              2. Creating a lesson (capture → generate → review)
            </a>
          </li>
          <li>
            <a className="text-sky-700 hover:underline dark:text-sky-400" href="#operate">
              3. Running the app (operators)
            </a>
          </li>
          <li>
            <a className="text-sky-700 hover:underline dark:text-sky-400" href="#faq">
              FAQ
            </a>
          </li>
        </ul>
      </nav>

      {/* 1 — Visitor */}
      <section id="browse" className="mt-12 scroll-mt-20">
        <h2 className="text-xl font-semibold tracking-tight">
          1. Browsing reports (no account needed)
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          The report views are public — you do not sign in to read them. Start at{" "}
          <Link className="text-sky-700 hover:underline dark:text-sky-400" href="/field-report">
            the report list
          </Link>{" "}
          and open any report to read the generated lesson.
        </p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
          <li>
            <span className="font-medium text-slate-800 dark:text-slate-200">Read the final lesson</span> —
            the published draft, rendered with its citations.
          </li>
          <li>
            <span className="font-medium text-slate-800 dark:text-slate-200">Scrub the revisions</span> —
            the side-by-side viewer shows each draft the agent wrote and how the
            critique changed it. This is the reflection loop made visible: watch a
            weak first draft become a strong final one.
          </li>
          <li>
            <span className="font-medium text-slate-800 dark:text-slate-200">Open the trace</span> —
            when a report links to its LangSmith trace, you can see every step the
            agent took to produce it.
          </li>
        </ul>
      </section>

      {/* 2 — User */}
      <section id="use" className="mt-12 scroll-mt-20">
        <h2 className="text-xl font-semibold tracking-tight">
          2. Creating a lesson (capture → generate → review)
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Creating lessons is the cost-incurring part, so it requires signing in.
          Today the app is single-user: only the configured admin address can sign
          in (a magic link is emailed — no password). If you are not the admin, the
          sign-in screen offers a <span className="font-medium text-slate-800 dark:text-slate-200">waitlist</span> instead,
          for when this becomes a product you can use.
        </p>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
          <li>
            <span className="font-medium text-slate-800 dark:text-slate-200">Start a capture</span> at{" "}
            <Link className="text-sky-700 hover:underline dark:text-sky-400" href="/field-report/new">
              New capture
            </Link>
            . Paste your location transcript, set the target audience, and pick
            which model writes the draft.
          </li>
          <li>
            <span className="font-medium text-slate-800 dark:text-slate-200">Generate</span> — the
            agent researches the location, drafts an objectives-first lesson,
            critiques it against the rubric, and revises until it passes (or
            escalates to human review after a few tries). This runs synchronously;
            give it a moment.
          </li>
          <li>
            <span className="font-medium text-slate-800 dark:text-slate-200">Review</span> — open the
            new report and use the revision viewer to see how each critique cycle
            improved the draft. If the agent escalated, the report is flagged for
            your review rather than published blindly.
          </li>
        </ol>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          You choose the model per run (Claude or Gemini) so you can compare draft
          quality side by side.
        </p>
      </section>

      {/* 3 — Operator */}
      <section id="operate" className="mt-12 scroll-mt-20">
        <h2 className="text-xl font-semibold tracking-tight">
          3. Running the app (operators)
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          You do not need to be the developer to run this. Everything below is
          configuration, not code.
        </p>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
          <li>
            <span className="font-medium text-slate-800 dark:text-slate-200">Local run</span> —{" "}
            <code className="rounded bg-slate-100 px-1 py-0.5 text-xs dark:bg-slate-800">npm install</code>,
            copy <code className="rounded bg-slate-100 px-1 py-0.5 text-xs dark:bg-slate-800">.env.example</code>{" "}
            to <code className="rounded bg-slate-100 px-1 py-0.5 text-xs dark:bg-slate-800">.env.local</code>,
            then <code className="rounded bg-slate-100 px-1 py-0.5 text-xs dark:bg-slate-800">npm run dev</code>.
            No Docker is required.
          </li>
          <li>
            <span className="font-medium text-slate-800 dark:text-slate-200">Keys</span> — the agent
            needs one model key (<code className="rounded bg-slate-100 px-1 py-0.5 text-xs dark:bg-slate-800">ANTHROPIC_API_KEY</code> or{" "}
            <code className="rounded bg-slate-100 px-1 py-0.5 text-xs dark:bg-slate-800">GOOGLE_API_KEY</code>).
            Every other key is optional — its feature fails soft when the key is
            absent. Each variable is documented in{" "}
            <code className="rounded bg-slate-100 px-1 py-0.5 text-xs dark:bg-slate-800">.env.example</code>.
          </li>
          <li>
            <span className="font-medium text-slate-800 dark:text-slate-200">Admin console</span> — at{" "}
            <Link className="text-sky-700 hover:underline dark:text-sky-400" href="/admin">
              /admin
            </Link>{" "}
            you review waitlist signups and (under Model configuration) set the
            default provider and per-provider models.
          </li>
          <li>
            <span className="font-medium text-slate-800 dark:text-slate-200">Tracing</span> — set the
            LangSmith variables to send run traces to a dashboard. The app runs
            fine without them.
          </li>
          <li>
            <span className="font-medium text-slate-800 dark:text-slate-200">Sign-in delivery</span> —
            the magic link is sent through Mailgun; the admin address and mail keys
            live in the environment.
          </li>
        </ul>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          For the full setup, scripts, and project layout, see the{" "}
          <Link className="text-sky-700 hover:underline dark:text-sky-400" href="https://github.com/dapperAuteur/wanderlearn-field-reporter#readme">
            README
          </Link>
          .
        </p>
      </section>

      {/* FAQ */}
      <section id="faq" className="mt-12 scroll-mt-20">
        <h2 className="text-xl font-semibold tracking-tight">FAQ</h2>
        <dl className="mt-3 space-y-4 text-sm leading-relaxed text-muted-foreground">
          <div>
            <dt className="font-medium text-slate-800 dark:text-slate-200">Why can&apos;t I sign in?</dt>
            <dd className="mt-1">
              The app is single-user for now — only the admin address is allowed.
              Join the waitlist from the sign-in screen and you&apos;ll be first in
              line when access opens up.
            </dd>
          </div>
          <div>
            <dt className="font-medium text-slate-800 dark:text-slate-200">Do I need Docker?</dt>
            <dd className="mt-1">No. The app runs with Node and npm; nothing here uses Docker.</dd>
          </div>
          <div>
            <dt className="font-medium text-slate-800 dark:text-slate-200">What is the revision viewer showing me?</dt>
            <dd className="mt-1">
              Each pass of the agent&apos;s write-then-critique loop. Reading down
              the revisions shows the draft improving toward the rubric — or, if it
              never passes, why it was sent to human review.
            </dd>
          </div>
        </dl>
      </section>

      <p className="mt-12 text-sm text-muted-foreground">
        <Link className="text-sky-700 hover:underline dark:text-sky-400" href="/">
          ← Back to home
        </Link>
      </p>
    </main>
  );
}
