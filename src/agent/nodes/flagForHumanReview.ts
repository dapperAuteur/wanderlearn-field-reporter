/**
 * `flagForHumanReview` node — the Day-2 terminal node for the "max revisions
 * hit" branch of the reflection loop.
 *
 * Defined now so the file exists and Day 2 only has to wire it, but
 * DELIBERATELY NOT added to the Day-1 graph: the Day-1 graph is linear and has
 * no conditional edge feeding this node, and LangGraph's `compile()` throws an
 * `UnreachableNodeError` for any node added without an incoming edge. Day 2
 * wires it via `addConditionalEdges("critique", …)`.
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
