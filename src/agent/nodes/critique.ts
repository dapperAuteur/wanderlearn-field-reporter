/**
 * `critique` node — DAY 1 STUB.
 *
 * Builds an all-pass rubric score for every criterion — reading the criterion
 * names from `rubric.ts`, so the stub cannot drift from the rubric — and
 * records one revision-history entry. The linear graph therefore runs end to
 * end and always reaches the image step. This node makes NO LLM call.
 *
 * Day 2 replaces this body with a real LLM rubric scorer and adds the cyclic
 * write→critique edge plus MAX_REVISIONS termination. The signature and the
 * `revisionHistory` append stay identical.
 */
import { RUBRIC_CRITERIA, isPassing } from "../rubric";
import type { RubricScores } from "../schemas";
import type { FieldReportState, FieldReportStateUpdate } from "../state";

export async function critique(
  state: FieldReportState,
): Promise<FieldReportStateUpdate> {
  const draft = state.draft;
  if (!draft) {
    throw new Error("critique: no draft in state — `write` must run first.");
  }

  const rubricScores = Object.fromEntries(
    RUBRIC_CRITERIA.map((criterion) => [
      criterion,
      { pass: true, evidence: "Day 1 stub critique — auto-pass." },
    ]),
  ) as RubricScores;

  return {
    critique: {
      revisionNumber: draft.revisionNumber,
      rubricScores,
      passed: isPassing(rubricScores),
      feedback: "Day 1 stub critique: no rubric scoring performed.",
    },
    revisionHistory: [
      {
        revisionNumber: draft.revisionNumber,
        markdown: draft.markdown,
        rubricScores,
      },
    ],
  };
}
