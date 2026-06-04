/**
 * Module 0 demo — run the minimal write → critique → revise loop and print every
 * pass. Runs OFFLINE with no API key: the writer below is a canned weak→strong
 * function so you can watch the loop converge without spending a token.
 *
 *   npx tsx examples/support-reply-loop/run.ts
 *
 * OPTIONAL (Lesson 06 · Bonus footage "Swap in a real chat model"):
 * to use a real chat model instead, swap `cannedWriter` for the model-backed
 * `ReplyWriter` below — the graph does not care which writes the draft. It is
 * left commented out so the demo stays offline and free by default; uncomment to
 * enable, and see the bonus-footage segment in
 * docs/course/module-0-setup/video/06-the-minimal-write-critique-loop.video-script.md.
 *
 *   import { ChatAnthropic } from "@langchain/anthropic";
 *   const model = new ChatAnthropic({ model: "claude-sonnet-4-6" });
 *   const llmWriter: ReplyWriter = async ({ ticket, draft, critique }) => {
 *     const instruction = critique
 *       ? `Revise this support reply to fix every issue, keeping what worked.\n` +
 *         `Ticket:\n${ticket}\nDraft:\n${draft}\nIssues:\n${critique.feedback}`
 *       : `Write a support reply to this ticket:\n${ticket}`;
 *     const res = await model.invoke(instruction);
 *     return String(res.content);
 *   };
 */
import { buildSupportReplyLoop, type ReplyWriter } from "./graph";

const TICKET = "My blender arrived with a cracked jar and won't seal.";

/** Weak first draft; a concrete, on-point revision once it sees the critique. */
const cannedWriter: ReplyWriter = ({ critique }) =>
  critique
    ? "Hi Sam, I'm sorry your blender arrived with a cracked jar. We'll ship a " +
      "replacement today and email you tracking. Best, Riley"
    : "Thanks for reaching out. We appreciate your message.";

async function main() {
  const graph = buildSupportReplyLoop(cannedWriter);
  const result = await graph.invoke({ ticket: TICKET });

  console.log(`Ticket: ${TICKET}\n`);
  for (const entry of result.history) {
    console.log(`--- Revision ${entry.revisionNumber} ---`);
    console.log(entry.draft);
    console.log();
  }
  console.log(`Final critique: ${result.critique?.passed ? "PASSED" : "UNRESOLVED"}`);
  for (const check of result.critique?.checks ?? []) {
    console.log(`  [${check.passed ? "x" : " "}] ${check.name} — ${check.evidence}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
