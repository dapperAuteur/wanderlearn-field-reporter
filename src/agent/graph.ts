/**
 * The field-reporter agent graph.
 *
 * DAY 1 — a LINEAR pipeline, no reflection loop:
 *
 *   START → research_location → draft_outline → write_lesson
 *         → critique_draft(stub) → generate_image_prompts → END
 *
 * Node names are verb phrases so they never collide with the state channel
 * names — LangGraph forbids a node and a channel sharing a name.
 *
 * Day 2 replaces the stub critique with a real LLM rubric scorer and adds the
 * cyclic edge: critique_draft → write_lesson (revise) until the rubric passes,
 * or → flag_for_human_review once MAX_REVISIONS is hit. `flagForHumanReview` is
 * intentionally NOT wired yet — a node added without an incoming edge makes
 * `compile()` throw, and the Day-1 graph has no conditional edge to reach it.
 */
import { StateGraph, START, END } from "@langchain/langgraph";
import { FieldReportStateAnnotation } from "./state";
import { research } from "./nodes/research";
import { outline } from "./nodes/outline";
import { write } from "./nodes/write";
import { critique } from "./nodes/critique";
import { generateImagePrompts } from "./nodes/generateImagePrompts";

/**
 * Maximum write→critique iterations before the agent escalates to a human.
 * The loop arrives Day 2; the constant is exported now so Day 2's conditional
 * edge and the termination test both import it from one place (PRD §16).
 */
export const MAX_REVISIONS = 3;

/** Build and compile the Day-1 linear field-reporter graph. */
export function buildFieldReportGraph() {
  return new StateGraph(FieldReportStateAnnotation)
    .addNode("research_location", research)
    .addNode("draft_outline", outline)
    .addNode("write_lesson", write)
    .addNode("critique_draft", critique)
    .addNode("generate_image_prompts", generateImagePrompts)
    .addEdge(START, "research_location")
    .addEdge("research_location", "draft_outline")
    .addEdge("draft_outline", "write_lesson")
    .addEdge("write_lesson", "critique_draft")
    .addEdge("critique_draft", "generate_image_prompts")
    .addEdge("generate_image_prompts", END)
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
