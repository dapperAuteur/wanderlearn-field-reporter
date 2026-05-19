"use client";

import { useState } from "react";
import type { FieldReportRevision } from "@/db/schema";
import { RubricBreakdown } from "./RubricBreakdown";
import { Markdown } from "./Markdown";

/**
 * The revision viewer — the centerpiece of the operator UI (PRD §11).
 *
 * Tabs across the revisions of one report; selecting a revision shows that
 * revision's draft on the left and its rubric breakdown on the right, so a
 * reviewer can scrub 1 → 2 → 3 and see how the self-critique loop changed the
 * draft. Newest revision is selected by default.
 */
export function RevisionViewer({
  revisions,
}: {
  revisions: FieldReportRevision[];
}) {
  const [selected, setSelected] = useState(Math.max(0, revisions.length - 1));

  if (revisions.length === 0) {
    return <p className="text-sm text-slate-500">No revisions recorded.</p>;
  }

  const revision = revisions[selected];

  return (
    <div>
      <div
        role="tablist"
        aria-label="Revisions"
        className="flex flex-wrap gap-2"
      >
        {revisions.map((rev, index) => (
          <button
            key={rev.id}
            type="button"
            role="tab"
            aria-selected={index === selected}
            onClick={() => setSelected(index)}
            className={
              index === selected
                ? "rounded-md border border-sky-600 bg-sky-50 px-3 py-1.5 text-sm font-medium text-sky-800 dark:bg-sky-500/10 dark:text-sky-300"
                : "rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:border-slate-300 dark:border-slate-800 dark:text-slate-400"
            }
          >
            Revision {rev.revisionNumber}
            <span
              className={
                rev.passed
                  ? "ml-1.5 text-emerald-600"
                  : "ml-1.5 text-rose-600"
              }
            >
              {rev.passed ? "passed" : "failed"}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-6 lg:grid-cols-2">
        <section aria-label={`Revision ${revision.revisionNumber} draft`}>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Revision {revision.revisionNumber} — draft
          </h3>
          <div className="mt-2 max-h-112 overflow-auto rounded-md border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
            <Markdown>{revision.markdown}</Markdown>
          </div>
        </section>

        <section aria-label={`Revision ${revision.revisionNumber} rubric`}>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Rubric breakdown
          </h3>
          <p className="mt-1 text-xs text-slate-500">{revision.feedback}</p>
          <div className="mt-2">
            <RubricBreakdown scores={revision.rubricScores} />
          </div>
        </section>
      </div>
    </div>
  );
}
