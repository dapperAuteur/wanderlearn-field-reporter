/**
 * `write` node — writes the full lesson markdown for the current revision.
 *
 * Revision 1 writes from the outline and research. On a revision — the cyclic
 * write→critique loop — it also receives the previous draft and the critique
 * feedback and is told to improve that draft rather than start over; that is
 * what lets the reflection loop converge. It stamps `draft.revisionNumber` from
 * the running counter. Pure and fail-soft.
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

If a previous draft and critique feedback are provided you are REVISING: keep \
what worked, fix every issue the critique raised, and do not start from scratch.

Return the lesson markdown and the list of citations used.`;

export async function write(
  state: FieldReportState,
): Promise<FieldReportStateUpdate> {
  const { location, targetAudience, research, outline } = state;
  const priorDraft = state.draft;
  const priorCritique = state.critique;
  const nextRevision = (priorDraft?.revisionNumber ?? 0) + 1;

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
    ...(priorDraft && priorCritique
      ? [
          "",
          "--- REVISION ---",
          "Your previous draft did not pass review. Revise it to address every",
          "point below, keeping the parts that already worked.",
          "",
          "Previous draft:",
          priorDraft.markdown,
          "",
          "Critique feedback:",
          priorCritique.feedback,
        ]
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
