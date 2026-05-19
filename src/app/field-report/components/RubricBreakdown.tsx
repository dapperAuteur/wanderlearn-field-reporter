import { RUBRIC_CRITERIA, rubric } from "@/agent/rubric";
import type { RubricScores } from "@/agent/schemas";

/** "has_clear_objectives" -> "Has clear objectives". */
function humanize(criterion: string): string {
  const spaced = criterion.replace(/_/g, " ");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/**
 * The per-criterion rubric scores for one revision: pass/fail, the evidence the
 * critique gave, and — when a criterion failed — the suggested fix. Criteria,
 * descriptions, and weights are read from `rubric.ts`, the single source of
 * truth.
 */
export function RubricBreakdown({ scores }: { scores: RubricScores }) {
  return (
    <ul className="space-y-3">
      {RUBRIC_CRITERIA.map((criterion) => {
        const score = scores[criterion];
        const def = rubric[criterion];
        return (
          <li
            key={criterion}
            className="rounded-md border border-slate-200 p-3 dark:border-slate-800"
          >
            <div className="flex items-start gap-2">
              <span
                aria-hidden="true"
                className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  score.pass
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-rose-100 text-rose-700"
                }`}
              >
                {score.pass ? "✓" : "✕"}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {humanize(criterion)}
                  <span className="ml-2 text-xs font-normal text-slate-400">
                    weight {def.weight}
                  </span>
                </p>
                <p className="text-xs text-slate-500">{def.description}</p>
                <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
                  <span className="sr-only">
                    {score.pass ? "Passed" : "Failed"}:{" "}
                  </span>
                  {score.evidence}
                </p>
                {score.suggestion && (
                  <p className="mt-1 text-sm text-sky-700 dark:text-sky-400">
                    Suggestion: {score.suggestion}
                  </p>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
