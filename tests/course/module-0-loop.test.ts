/**
 * Module 0 success signal — the minimal write → critique → revise loop.
 *
 * These tests are the F4 "verifiable success signal": they drive
 * `examples/support-reply-loop` with deterministic injected writers, so the
 * whole loop runs with NO network and NO API key. A learner who completes
 * Module 0's lab makes these pass.
 *
 *  1. The loop CONVERGES: a weak first draft fails the stub critic, the revised
 *     draft passes, and the run ends with `passed === true`.
 *  2. The loop TERMINATES: a writer that never improves still exits at
 *     MAX_REVISIONS instead of spinning forever.
 */
import { describe, it, expect } from "vitest";
import {
  buildSupportReplyLoop,
  scoreReply,
  MAX_REVISIONS,
  type ReplyWriter,
} from "../../examples/support-reply-loop/graph";

const TICKET = "My blender arrived with a cracked jar and won't seal.";

/** A weak, generic reply that fails every check. */
const WEAK = "Thanks for reaching out. We appreciate your message.";

/** A strong reply: names the issue, gives a next step, signs off. */
const STRONG =
  "Hi Sam, I'm sorry your blender arrived with a cracked jar. We'll ship a " +
  "replacement today and email you tracking. Best, Riley";

describe("Module 0 — the stub critic scores concretely", () => {
  it("fails a generic reply on all three checks", () => {
    const critique = scoreReply(TICKET, WEAK, 1);
    expect(critique.passed).toBe(false);
    expect(critique.checks.every((c) => !c.passed)).toBe(true);
  });

  it("passes a reply that names the issue, acts, and signs off", () => {
    const critique = scoreReply(TICKET, STRONG, 2);
    expect(critique.passed).toBe(true);
  });
});

describe("Module 0 — the reflection loop", () => {
  it("converges: weak draft fails, revised draft passes", async () => {
    // Weak on the first pass (no critique yet), strong once it has feedback.
    const writer: ReplyWriter = ({ critique }) => (critique ? STRONG : WEAK);
    const graph = buildSupportReplyLoop(writer);

    const result = await graph.invoke({ ticket: TICKET });

    expect(result.critique?.passed).toBe(true);
    expect(result.revisionNumber).toBe(2); // one write + one revision
    expect(result.history).toHaveLength(2);
    expect(result.history[0]?.draft).toBe(WEAK);
    expect(result.history[1]?.draft).toBe(STRONG);
  });

  it("terminates at MAX_REVISIONS when the writer never improves", async () => {
    const stubborn: ReplyWriter = () => WEAK;
    const graph = buildSupportReplyLoop(stubborn);

    const result = await graph.invoke({ ticket: TICKET });

    expect(result.critique?.passed).toBe(false);
    expect(result.revisionNumber).toBe(MAX_REVISIONS);
    expect(result.history).toHaveLength(MAX_REVISIONS);
  });
});
