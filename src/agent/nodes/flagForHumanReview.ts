/**
 * `flagForHumanReview` node — the terminal node for the "max revisions hit"
 * branch of the reflection loop.
 *
 * Reached when `critique_draft` has failed the rubric MAX_REVISIONS times (see
 * `routeAfterCritique` in graph.ts). It marks the run for an operator and
 * carries the best-effort draft forward as `finalMarkdown`, so the report still
 * has a body for the reviewer to work from.
 */
import type { FieldReportState, FieldReportStateUpdate } from "../state";

export async function flagForHumanReview(
  state: FieldReportState,
): Promise<FieldReportStateUpdate> {
  return {
    flaggedForHumanReview: true,
    finalMarkdown: state.draft?.markdown,
  };
}
