/**
 * The field-reporter agent graph.
 *
 * DAY 2 — the reflection loop:
 *
 *   START → research_location → draft_outline → write_lesson → critique_draft
 *
 *   critique_draft then routes (see `routeAfterCritique`):
 *     - rubric passed            → generate_image_prompts → END
 *     - failed, revisions < MAX  → write_lesson  (revise — the cyclic edge)
 *     - failed, revisions ≥ MAX  → flag_for_human_review → END
 *
 * Node names are verb phrases so they never collide with the state channel
 * names — LangGraph forbids a node and a channel sharing a name.
 *
 * Termination is guaranteed: `write_lesson` increments `draft.revisionNumber`
 * on every pass, so `routeAfterCritique` reaches the MAX_REVISIONS branch in a
 * bounded number of steps. The cap is enforced here in the routing function,
 * never as a prompt instruction.
 */
import { StateGraph, START, END } from "@langchain/langgraph";
import { FieldReportStateAnnotation, type FieldReportState } from "./state";
import { research } from "./nodes/research";
import { outline } from "./nodes/outline";
import { write } from "./nodes/write";
import { critique } from "./nodes/critique";
import { generateImagePrompts } from "./nodes/generateImagePrompts";
import { flagForHumanReview } from "./nodes/flagForHumanReview";

/**
 * Maximum write→critique iterations before the agent escalates to a human.
 * Exported so the termination test and any future caller read the cap from one
 * place (PRD §16).
 */
export const MAX_REVISIONS = 3;

/** The three nodes `critique_draft` can route to. */
type CritiqueRoute =
  | "generate_image_prompts"
  | "write_lesson"
  | "flag_for_human_review";

/**
 * Conditional edge after `critique_draft`: publish, revise, or escalate. Reads
 * the just-written `critique` from state — it never re-runs the LLM. This
 * function is the loop's termination guard.
 */
function routeAfterCritique(state: FieldReportState): CritiqueRoute {
  const { critique } = state;
  if (!critique) {
    throw new Error("routeAfterCritique: critique must run before routing.");
  }
  if (critique.passed) return "generate_image_prompts";
  if (critique.revisionNumber >= MAX_REVISIONS) return "flag_for_human_review";
  return "write_lesson";
}

/** Build and compile the field-reporter reflection graph. */
export function buildFieldReportGraph() {
  return new StateGraph(FieldReportStateAnnotation)
    .addNode("research_location", research)
    .addNode("draft_outline", outline)
    .addNode("write_lesson", write)
    .addNode("critique_draft", critique)
    .addNode("generate_image_prompts", generateImagePrompts)
    .addNode("flag_for_human_review", flagForHumanReview)
    .addEdge(START, "research_location")
    .addEdge("research_location", "draft_outline")
    .addEdge("draft_outline", "write_lesson")
    .addEdge("write_lesson", "critique_draft")
    .addConditionalEdges("critique_draft", routeAfterCritique, [
      "generate_image_prompts",
      "write_lesson",
      "flag_for_human_review",
    ])
    .addEdge("generate_image_prompts", END)
    .addEdge("flag_for_human_review", END)
    .compile();
}

/** A compiled field-reporter graph. */
export type CompiledFieldReportGraph = ReturnType<typeof buildFieldReportGraph>;

let cached: CompiledFieldReportGraph | null = null;

/** Lazily build and cache the compiled graph — API routes (Day 4) use this. */
export function getCompiledFieldReportGraph(): CompiledFieldReportGraph {
  if (!cached) {
    cached = buildFieldReportGraph();
  }
  return cached;
}
