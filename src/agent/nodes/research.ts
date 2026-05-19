/**
 * `research` node — the first node in the graph.
 *
 * Day 1: extracts factual claims and plausible Wanderlearn cross-links FROM THE
 * TRANSCRIPT ALONE, via one structured-output call. The `webSearch` tool
 * (Tavily) is wired Day 3 — at which point this node gains a node-level guard
 * capping webSearch at 5 calls per run: a `webSearchCallCount` state channel
 * checked before each call, never a prompt instruction.
 *
 * Pure and fail-soft: any error becomes empty research, so the graph never
 * hard-crashes on a bad input.
 */
import { ResearchSchema } from "../schemas";
import { getChatModel } from "../llm";
import type { FieldReportState, FieldReportStateUpdate } from "../state";

const SYSTEM_PROMPT = `You are a location researcher for Wanderlearn, which builds \
place-anchored lessons from field captures. Given a capture transcript and its \
location, extract the factual claims a lesson could be built on, and name any \
existing Wanderlearn courses worth cross-linking.

Return only claims the transcript actually supports. Name each claim's source as \
specifically as the transcript allows (e.g. "museum placard", "operator narration"). \
Day 1 has no web search — do not invent facts beyond the transcript.`;

export async function research(
  state: FieldReportState,
): Promise<FieldReportStateUpdate> {
  const { location, rawInput, targetAudience } = state;

  const userMessage = [
    `Location: ${location.name} (${location.gps.lat}, ${location.gps.lng})`,
    `Captured at: ${location.capturedAt}`,
    `Target audience: ${targetAudience}`,
    "",
    "Capture transcript:",
    rawInput.transcript,
    ...(rawInput.operatorNotes
      ? ["", `Operator notes: ${rawInput.operatorNotes}`]
      : []),
  ].join("\n");

  try {
    const model = getChatModel({ temperature: 0.3 }).withStructuredOutput(
      ResearchSchema,
      { name: "extract_research" },
    );
    const research = await model.invoke([
      ["system", SYSTEM_PROMPT],
      ["human", userMessage],
    ]);
    return { research };
  } catch (err) {
    console.error("[research] failed; returning empty research:", err);
    return { research: { facts: [], relatedCourses: [] } };
  }
}
