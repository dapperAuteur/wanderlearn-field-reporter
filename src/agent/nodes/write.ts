/**
 * `write` node — writes the full lesson markdown for the current revision.
 *
 * Produces the lesson body with inline citations, a hands-on exercise, and a
 * "what to capture next time" appendix, plus the citation list. It stamps the
 * draft's `revisionNumber` from the running counter (Day 1: always 1; the Day-2
 * loop increments it and feeds the prior critique back in here). Pure and
 * fail-soft.
 */
import { WriteOutputSchema } from "../schemas";
import { getChatModel } from "../llm";
import type { FieldReportState, FieldReportStateUpdate } from "../state";

const SYSTEM_PROMPT = `You are a lesson writer for Wanderlearn. Using the outline \
and researched facts, write a complete, publishable lesson in Markdown.

Requirements:
- Open with the numbered learning objectives.
- Cover every section in the outline; cite facts inline by their named source.
- Include at least one hands-on exercise the learner does on their own.
- End with a short "What to capture next time" appendix for the field operator.

Return the lesson markdown and the list of citations used.`;

export async function write(
  state: FieldReportState,
): Promise<FieldReportStateUpdate> {
  const { location, targetAudience, research, outline } = state;
  const nextRevision = (state.draft?.revisionNumber ?? 0) + 1;

  const userMessage = [
    `Location: ${location.name}`,
    `Target audience: ${targetAudience}`,
    `Revision: ${nextRevision}`,
    "",
    "Outline:",
    JSON.stringify(outline ?? null, null, 2),
    "",
    "Researched facts:",
    JSON.stringify(research?.facts ?? [], null, 2),
    ...(state.critique
      ? ["", "Address this critique feedback:", state.critique.feedback]
      : []),
  ].join("\n");

  try {
    const model = getChatModel({
      temperature: 0.5,
      maxTokens: 8192,
    }).withStructuredOutput(WriteOutputSchema, { name: "write_lesson" });
    const output = await model.invoke([
      ["system", SYSTEM_PROMPT],
      ["human", userMessage],
    ]);
    return { draft: { revisionNumber: nextRevision, ...output } };
  } catch (err) {
    console.error("[write] failed; returning a minimal draft:", err);
    return {
      draft: {
        revisionNumber: nextRevision,
        markdown: `# ${location.name}\n\n_Draft generation failed._`,
        citations: [],
      },
    };
  }
}
