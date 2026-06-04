/**
 * Module 1 success signal — bounded termination, the four patterns.
 *
 * Deterministic, offline. Each test isolates one termination pattern:
 *  1. Counter (Pattern 1): a writer that always fails but always DIFFERS hits the
 *     max-revision cap and escalates.
 *  2. Convergence (Pattern 2): a writer that emits the SAME failing draft stalls,
 *     and the loop escalates EARLY — before the cap — instead of wasting budget.
 *  3. Success: a weak→strong writer resolves.
 *  4. Backstop: an UNCAPPED loop with a never-passing writer throws on
 *     `recursionLimit` — the seatbelt, proving why the cap belongs in code.
 */
import { describe, it, expect } from "vitest";
import {
  buildBoundedReplyLoop,
  buildUncappedReplyLoop,
  hasConverged,
  type TerminatingReplyState,
} from "../../examples/support-reply-loop/termination";
import { MAX_REVISIONS, type ReplyWriter } from "../../examples/support-reply-loop/graph";

const TICKET = "My blender arrived with a cracked jar and won't seal.";
const STRONG =
  "Hi Sam, I'm sorry your blender arrived with a cracked jar. We'll ship a " +
  "replacement today and email you tracking. Best, Riley";

describe("Module 1 — convergence helper", () => {
  it("is false with fewer than two drafts", () => {
    expect(hasConverged([{ draft: "a" }])).toBe(false);
  });
  it("is true when the last two drafts are identical", () => {
    expect(hasConverged([{ draft: "a" }, { draft: "b" }, { draft: "b" }])).toBe(true);
  });
  it("is false when the last two drafts differ", () => {
    expect(hasConverged([{ draft: "a" }, { draft: "b" }])).toBe(false);
  });
});

describe("Module 1 — Pattern 1: the max-iteration counter", () => {
  it("escalates at MAX_REVISIONS when the writer never passes but keeps changing", async () => {
    // Always failing, but always different — so convergence never fires and only
    // the hard counter can stop it.
    const writer: ReplyWriter = ({ critique }) =>
      `Thanks for reaching out. (attempt ${(critique?.revisionNumber ?? 0) + 1})`;
    const graph = buildBoundedReplyLoop(writer);

    const result = (await graph.invoke({ ticket: TICKET })) as TerminatingReplyState;

    expect(result.outcome).toBe("escalated");
    expect(result.escalated).toBe(true);
    expect(result.revisionNumber).toBe(MAX_REVISIONS);
  });
});

describe("Module 1 — Pattern 2: convergence detection", () => {
  it("escalates EARLY when the writer stalls on an identical draft", async () => {
    const stalled: ReplyWriter = () => "Thanks for reaching out.";
    const graph = buildBoundedReplyLoop(stalled);

    const result = (await graph.invoke({ ticket: TICKET })) as TerminatingReplyState;

    expect(result.outcome).toBe("escalated");
    // Caught at revision 2 (first repeat) — well before the hard cap.
    expect(result.revisionNumber).toBe(2);
    expect(result.revisionNumber).toBeLessThan(MAX_REVISIONS);
  });
});

describe("Module 1 — success path", () => {
  it("marks resolved when a revision passes", async () => {
    const writer: ReplyWriter = ({ critique }) => (critique ? STRONG : "Thanks!");
    const graph = buildBoundedReplyLoop(writer);

    const result = (await graph.invoke({ ticket: TICKET })) as TerminatingReplyState;

    expect(result.outcome).toBe("resolved");
    expect(result.escalated).toBe(false);
    expect(result.critique?.passed).toBe(true);
  });
});

describe("Module 1 — Pattern 4: recursionLimit is a backstop, not steering", () => {
  it("an uncapped loop throws on recursionLimit instead of exiting gracefully", async () => {
    // Always different, never passes: nothing in the graph stops it, so only
    // LangGraph's recursionLimit can — by throwing.
    const endless: ReplyWriter = ({ critique }) =>
      `still wrong (${(critique?.revisionNumber ?? 0) + 1})`;
    const graph = buildUncappedReplyLoop(endless);

    await expect(
      graph.invoke({ ticket: TICKET }, { recursionLimit: 6 }),
    ).rejects.toThrow();
  });
});
