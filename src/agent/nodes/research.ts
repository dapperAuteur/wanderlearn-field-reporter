/**
 * `research` node — the first node in the graph.
 *
 * Gathers raw material for the lesson, then has the LLM synthesize it into
 * `research` (facts + Wanderlearn cross-links):
 *   - `webSearch` (Tavily) — facts about the location beyond the transcript;
 *   - `cloudinaryMetadata` — what the captured photos contain;
 *   - `existingWanderlearnCourses` — real courses to cross-link.
 *
 * The webSearch cap is enforced HERE, as a node-level guard: research counts
 * its calls against `state.webSearchCallCount` and never exceeds
 * `MAX_WEB_SEARCHES_PER_RUN`. This is deliberately not a prompt instruction.
 *
 * Pure and fail-soft: each tool degrades to empty on error, and a failed LLM
 * call yields empty research — the graph never hard-crashes on a bad input.
 */
import { ResearchSchema } from "../schemas";
import { getChatModel } from "../llm";
import {
  webSearch,
  MAX_WEB_SEARCHES_PER_RUN,
  type WebSearchResult,
} from "../tools/webSearch";
import { cloudinaryMetadata } from "../tools/cloudinaryMetadata";
import { existingWanderlearnCourses } from "../tools/existingWanderlearnCourses";
import type { FieldReportState, FieldReportStateUpdate } from "../state";

const SYSTEM_PROMPT = `You are a location researcher for Wanderlearn, which builds \
place-anchored lessons from field captures. Synthesize the capture transcript, web \
search results, photo metadata, and the existing Wanderlearn course list into:
- "facts": the factual claims a lesson could be built on, each with a named source
  (cite the transcript, a web result's title, or a photo's tags — whichever
  supports it);
- "relatedCourses": slugs of existing Wanderlearn courses worth cross-linking.

Use only claims the provided material supports. Do not invent sources.`;

export async function research(
  state: FieldReportState,
): Promise<FieldReportStateUpdate> {
  const { location, rawInput, targetAudience } = state;

  // --- webSearch, bounded by the node-level per-run cap --------------------
  const searchQueries = [
    `${location.name} history and significance`,
    `${location.name} visitor facts and background`,
  ];
  const priorSearches = state.webSearchCallCount;
  const webResults: WebSearchResult[] = [];
  let searchesMade = 0;
  for (const query of searchQueries) {
    if (priorSearches + searchesMade >= MAX_WEB_SEARCHES_PER_RUN) {
      break; // node-level guard — never exceed the per-run webSearch cap
    }
    webResults.push(...(await webSearch({ query })));
    searchesMade += 1;
  }

  // --- photo metadata + cross-link candidates ------------------------------
  const imageMetadata = await Promise.all(
    rawInput.imageRefs.map((imageId) => cloudinaryMetadata({ imageId })),
  );
  const relatedCourses = await existingWanderlearnCourses({
    topic: location.name,
  });

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
    "",
    "Web search results:",
    JSON.stringify(webResults, null, 2),
    "",
    "Photo metadata:",
    JSON.stringify(imageMetadata, null, 2),
    "",
    "Existing Wanderlearn courses (cross-link candidates):",
    JSON.stringify(relatedCourses, null, 2),
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
    return { research, webSearchCallCount: searchesMade };
  } catch (err) {
    console.error("[research] failed; returning empty research:", err);
    return {
      research: { facts: [], relatedCourses: [] },
      webSearchCallCount: searchesMade,
    };
  }
}
