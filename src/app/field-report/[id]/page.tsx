import Link from "next/link";
import { notFound } from "next/navigation";
import { getFieldReport } from "@/lib/reports";
import { getLangsmithRunUrl } from "@/lib/langsmith";
import { LLM_PROVIDER_LABELS } from "@/agent/schemas";
import { RevisionViewer } from "../components/RevisionViewer";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * /field-report/:id — one report: the side-by-side revision viewer and the
 * final lesson markdown.
 */
export default async function FieldReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();

  const detail = await getFieldReport(id);
  if (!detail) notFound();

  const { report, revisions } = detail;
  const langsmithUrl = getLangsmithRunUrl(report.langsmithRunId);

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <Link
        href="/field-report"
        className="text-sm text-sky-700 hover:underline dark:text-sky-400"
      >
        ← All reports
      </Link>

      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">
          {report.locationName}
        </h1>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
            report.flaggedForHumanReview
              ? "bg-amber-100 text-amber-800"
              : "bg-emerald-100 text-emerald-800"
          }`}
        >
          {report.flaggedForHumanReview
            ? "Flagged for human review"
            : "Passed the rubric"}
        </span>
      </div>
      <p className="mt-1 font-mono text-xs text-slate-500">{report.id}</p>
      <p className="mt-1 text-sm text-slate-500">
        {revisions.length} revision{revisions.length === 1 ? "" : "s"} ·
        audience: {report.targetAudience} · generated with{" "}
        {LLM_PROVIDER_LABELS[report.llmProvider]}
      </p>
      {langsmithUrl && (
        <a
          href={`/api/field-report/${report.id}/trace`}
          className="mt-1 inline-block text-sm text-sky-700 hover:underline dark:text-sky-400"
        >
          Open the LangSmith trace
        </a>
      )}

      <section className="mt-8" aria-label="Revision history">
        <h2 className="text-lg font-semibold tracking-tight">
          Revision history
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Scrub between revisions to see how the self-critique loop changed the
          draft.
        </p>
        <div className="mt-4">
          <RevisionViewer revisions={revisions} />
        </div>
      </section>

      <section className="mt-10" aria-label="Final lesson">
        <h2 className="text-lg font-semibold tracking-tight">Final lesson</h2>
        {report.finalMarkdown ? (
          <pre className="mt-3 whitespace-pre-wrap break-words rounded-md border border-slate-200 bg-white p-5 font-sans text-sm leading-relaxed text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
            {report.finalMarkdown}
          </pre>
        ) : (
          <p className="mt-2 text-sm text-slate-500">
            No final lesson — this run was flagged for review before it passed.
          </p>
        )}

        {report.imagePrompts && report.imagePrompts.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Image prompts
            </h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700 dark:text-slate-300">
              {report.imagePrompts.map((prompt) => (
                <li key={prompt}>{prompt}</li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </main>
  );
}
