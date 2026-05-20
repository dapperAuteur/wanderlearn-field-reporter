// When a second admin surface arrives, split this into `/admin/waitlist` and
// add an `/admin` index — for now this is the single dashboard page.

import Link from "next/link";
import { requireUser } from "@/lib/auth/dal";
import {
  countWaitlistSignups,
  listWaitlistSignups,
} from "@/lib/waitlist";
import { SignOutButton } from "@/components/sign-out-button";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const RECENT_LIMIT = 50;

/** The triage queue this dashboard points out to — replies happen in Inbox. */
const INBOX_URL =
  "https://inbox.witus.online/inbox?source=wanderlearn-field-reporter&form_type=waitlist-signup";

/**
 * /admin — the operator dashboard for waitlist signups.
 *
 * The local table is one half of the picture; the WitUS Inbox holds the
 * triage state (replies, status, threading) for the same rows that arrive via
 * the signed webhook fired in `joinWaitlist`. This page is the at-a-glance
 * entry point — the "Manage in Inbox" button is where the work actually
 * happens.
 */
export default async function AdminPage() {
  await requireUser();
  const [total, signups] = await Promise.all([
    countWaitlistSignups(),
    listWaitlistSignups(RECENT_LIMIT),
  ]);

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Waitlist</h1>
        <div className="flex items-center gap-2">
          <Link
            href="/field-report"
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:border-slate-400 dark:border-slate-700 dark:text-slate-400"
          >
            ← Field reports
          </Link>
          <SignOutButton />
        </div>
      </div>

      <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
        <span className="font-semibold text-slate-900 dark:text-slate-100">
          {total}
        </span>{" "}
        {total === 1 ? "person is" : "people are"} on the waitlist.
      </p>

      <section
        aria-label="Manage in WitUS Inbox"
        className="mt-6 rounded-md border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950"
      >
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Replies live in WitUS Inbox
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Every signup also lands in the central Inbox triage queue. Status,
          threading, and replies are managed there.
        </p>
        <a
          href={INBOX_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-700"
        >
          Manage in WitUS Inbox →
        </a>
      </section>

      <section aria-label="Recent signups" className="mt-8">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Recent signups
        </h2>

        {total === 0 ? (
          <p className="mt-3 rounded-md border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-slate-700">
            Nobody has joined the waitlist yet.
          </p>
        ) : (
          <>
            <ul className="mt-3 divide-y divide-slate-200 dark:divide-slate-800">
              {signups.map((signup) => (
                <li
                  key={signup.id}
                  className="flex items-center justify-between gap-4 px-2 py-3"
                >
                  <span className="truncate font-mono text-sm text-slate-900 dark:text-slate-100">
                    {signup.email}
                  </span>
                  <span className="shrink-0 text-xs text-slate-500">
                    {signup.createdAt.toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
            {total > RECENT_LIMIT && (
              <p className="mt-3 text-xs text-slate-500">
                Showing the most recent {RECENT_LIMIT} of {total}. Full history
                lives in Inbox.
              </p>
            )}
          </>
        )}
      </section>
    </main>
  );
}
