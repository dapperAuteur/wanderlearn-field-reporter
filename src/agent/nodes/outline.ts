/**
 * `outline` node — turns research into an objectives-first lesson outline.
 *
 * Produces 3 to 5 learning objectives and a set of sections, each tied to a
 * numbered objective via `tiesToObjective`. Pure and fail-soft.
 */
import { OutlineSchema } from "../schemas";
import { getChatModel } from "../llm";
import type { FieldReportState, FieldReportStateUpdate } from "../state";

const SYSTEM_PROMPT = `You are an instructional designer for Wanderlearn. Given \
researched facts about a location and a target audience, draft an objectives-first \
lesson outline.

Write 3 to 5 specific, measurable learning objectives. Then propose sections that \
together cover every objective; each section ties to at least one objective by its \
1-based number via "tiesToObjective". Keep section summaries to one or two \
sentences — this is an outline, not the lesson.`;

export async function outline(
  state: FieldReportState,
): Promise<FieldReportStateUpdate> {
  const { location, targetAudience, research } = state;
  const facts = research?.facts ?? [];

  const userMessage = [
    `Location: ${location.name}`,
    `Target audience: ${targetAudience}`,
    "",
    "Researched facts:",
    ...facts.map(
      (fact, index) => `${index + 1}. ${fact.claim} (source: ${fact.source})`,
    ),
    ...(research && research.relatedCourses.length > 0
      ? ["", `Related Wanderlearn courses: ${research.relatedCourses.join(", ")}`]
      : []),
  ].join("\n");

  try {
    const model = getChatModel({
      provider: state.llmProvider,
      temperature: 0.4,
    }).withStructuredOutput(OutlineSchema, { name: "draft_outline" });
    const outline = await model.invoke([
      ["system", SYSTEM_PROMPT],
      ["human", userMessage],
    ]);
    return { outline };
  } catch (err) {
    console.error("[outline] failed; returning empty outline:", err);
    return { outline: { learningObjectives: [], sections: [] } };
  }
}
