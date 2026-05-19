import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-24">
      <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">
        WitUS ecosystem · Wanderlearn
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        Wanderlearn Field Reporter
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        A LangGraph agent that turns a raw Wanderlearn capture — location
        transcript, GPS, and photo references — into a publishable lesson draft
        through a research, write, and self-critique reflection loop.
      </p>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        The agent researches the location, drafts a cited lesson, then critiques
        it against a rubric and revises until it passes — or escalates to human
        review. Browse generated reports and scrub their revision history in the
        operator console.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/field-report"
          className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-700"
        >
          Open the operator console
        </Link>
        <Link
          href="/field-report/new"
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-400 dark:border-slate-700 dark:text-slate-300"
        >
          New capture
        </Link>
      </div>
    </main>
  );
}
