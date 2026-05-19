/**
 * `generateImagePrompts` node — the terminal node on the success path.
 *
 * Generates image-generation prompts for the finished lesson and sets
 * `finalMarkdown` (the published artifact) from the passing draft. Image
 * generation itself is out of scope (PRD §3) — the agent only emits prompts.
 * Pure and fail-soft.
 */
import { ImagePromptsSchema } from "../schemas";
import { getChatModel } from "../llm";
import type { FieldReportState, FieldReportStateUpdate } from "../state";

const SYSTEM_PROMPT = `You write prompts for an image generator. Given a finished \
lesson, propose 2 to 4 vivid, concrete image prompts that would illustrate it — \
one per key moment or concept. Each prompt is a single descriptive sentence.`;

export async function generateImagePrompts(
  state: FieldReportState,
): Promise<FieldReportStateUpdate> {
  const draft = state.draft;
  if (!draft) {
    throw new Error(
      "generateImagePrompts: no draft in state — `write` must run first.",
    );
  }

  try {
    const model = getChatModel({ temperature: 0.7 }).withStructuredOutput(
      ImagePromptsSchema,
      { name: "generate_image_prompts" },
    );
    const { prompts } = await model.invoke([
      ["system", SYSTEM_PROMPT],
      ["human", `Lesson:\n\n${draft.markdown}`],
    ]);
    return { imagePrompts: prompts, finalMarkdown: draft.markdown };
  } catch (err) {
    console.error("[generateImagePrompts] failed; no image prompts:", err);
    return { imagePrompts: [], finalMarkdown: draft.markdown };
  }
}
