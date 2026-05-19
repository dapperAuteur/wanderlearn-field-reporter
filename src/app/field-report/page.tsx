import Link from "next/link";
import { listFieldReports } from "@/lib/reports";
import { LLM_PROVIDER_LABELS } from "@/agent/schemas";
import { SignOutButton } from "@/components/sign-out-button";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** /field-report — recent lesson drafts, newest first. */
export default async function FieldReportListPage() {
  const reports = await listFieldReports();

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">Field reports</h1>
        <div className="flex items-center gap-2">
          <Link
            href="/field-report/new"
            className="rounded-md bg-sky-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-sky-700"
          >
            New capture
          </Link>
          <SignOutButton />
        </div>
      </div>
      <p className="mt-1 text-sm text-slate-500">
        Lesson drafts the agent generated from Wanderlearn captures, newest
        first.
      </p>

      {reports.length === 0 ? (
        <p className="mt-8 rounded-md border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-slate-700">
          No reports yet.{" "}
          <Link
            href="/field-report/new"
            className="text-sky-700 hover:underline dark:text-sky-400"
          >
            Submit a capture
          </Link>{" "}
          to generate the first lesson draft.
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-slate-200 dark:divide-slate-800">
          {reports.map((report) => (
            <li key={report.id}>
              <Link
                href={`/field-report/${report.id}`}
                className="flex items-center justify-between gap-4 rounded-md px-2 py-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-900"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">
                    {report.locationName}
                  </p>
                  <p className="text-xs text-slate-500">
                    {report.createdAt.toLocaleString()} ·{" "}
                    {LLM_PROVIDER_LABELS[report.llmProvider]}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    report.flaggedForHumanReview
                      ? "bg-amber-100 text-amber-800"
                      : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  {report.flaggedForHumanReview ? "Needs review" : "Complete"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
