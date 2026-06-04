/**
 * Module 3 success signal — fail-soft tracing wiring + trace diagnostics.
 *
 * Deterministic, offline, NO LangSmith account. The loop writes a local RunTrace;
 * the diagnostics read it. The fail-soft-masking test reproduces the witus-triage
 * "other / confidence 0" production bug in this domain: a fail-soft judge that
 * silently fails everything, invisible to output assertions, visible in the trace.
 */
import { describe, it, expect } from "vitest";
import {
  tracingConfig,
  isTracingEnabled,
  buildTracedReplyLoop,
  summarizeRun,
  findWastedIterations,
  detectCriticDrift,
  didNotConverge,
  detectFailSoftMasking,
  type RunTrace,
  type TracedReplyState,
} from "../../examples/support-reply-loop/tracing";
import type { ReplyWriter } from "../../examples/support-reply-loop/graph";
import type { RubricJudge } from "../../examples/support-reply-loop/rubric";

const TICKET = "My blender arrived with a cracked jar and won't seal.";
const STRONG =
  "Hi Sam, I'm sorry your blender arrived with a cracked jar. We'll ship a " +
  "replacement today and email you tracking. Best, Riley";

const CUES: Record<string, string[]> = {
  acknowledges_issue: ["blender", "cracked", "jar", "arrived", "seal"],
  gives_next_step: ["replace", "ship", "refund", "send"],
  states_timeline: ["today", "tomorrow", "within", "hours"],
  has_signoff: ["best", "regards", "sincerely", "thanks,"],
};
const healthyJudge: RubricJudge = ({ draft, criterion }) => {
  const hit = (CUES[criterion.key] ?? []).some((w) => draft.toLowerCase().includes(w));
  return { key: criterion.key, passed: hit, evidence: hit ? "cue found" : "no cue", suggestion: "add it" };
};
/** Fail-soft: swallows an "error" and blanket-fails every criterion. */
const failSoftJudge: RubricJudge = ({ criterion }) => ({
  key: criterion.key,
  passed: false,
  evidence: "<error: credit balance too low to access the API>",
  suggestion: "n/a",
});

describe("Module 3 — tracing is fail-soft", () => {
  it("is disabled (and does not throw) when env vars are absent", () => {
    const cfg = tracingConfig({});
    expect(cfg.enabled).toBe(false);
    expect(cfg.project).toBe("wanderlearn-foundation-course");
    expect(isTracingEnabled({})).toBe(false);
  });
  it("is enabled only when TRACING=true and a key is present", () => {
    expect(tracingConfig({ LANGSMITH_TRACING: "true" }).enabled).toBe(false); // no key
    const cfg = tracingConfig({
      LANGSMITH_TRACING: "true",
      LANGSMITH_API_KEY: "lsv2_x",
      LANGSMITH_PROJECT: "my-course",
    });
    expect(cfg.enabled).toBe(true);
    expect(cfg.project).toBe("my-course");
  });
});

describe("Module 3 — the loop records an inspectable trace", () => {
  it("converges and writes one TraceStep per pass", async () => {
    const writer: ReplyWriter = ({ critique }) => (critique ? STRONG : "Thanks!");
    const graph = buildTracedReplyLoop(writer, healthyJudge);
    const result = (await graph.invoke({ ticket: TICKET })) as TracedReplyState;
    const trace = summarizeRun(result);
    expect(trace.outcome).toBe("resolved");
    expect(trace.steps.length).toBeGreaterThanOrEqual(2);
    expect(trace.steps.at(-1)?.passed).toBe(true);
  });
});

describe("Module 3 — diagnosing wasted iterations", () => {
  it("flags a revision that did not improve the score", () => {
    const trace: RunTrace = {
      ticket: TICKET,
      outcome: "resolved",
      steps: [
        { revisionNumber: 1, draft: "a", passedChecks: 1, totalChecks: 4, passed: false },
        { revisionNumber: 2, draft: "b", passedChecks: 1, totalChecks: 4, passed: false }, // wasted
        { revisionNumber: 3, draft: "c", passedChecks: 4, totalChecks: 4, passed: true },
      ],
    };
    expect(findWastedIterations(trace)).toEqual([2]);
  });
});

describe("Module 3 — diagnosing critic drift", () => {
  it("flags the same draft scored differently across passes", () => {
    const trace: RunTrace = {
      ticket: TICKET,
      outcome: "escalated",
      steps: [
        { revisionNumber: 1, draft: "same draft", passedChecks: 2, totalChecks: 4, passed: false },
        { revisionNumber: 2, draft: "same draft", passedChecks: 3, totalChecks: 4, passed: false },
      ],
    };
    expect(detectCriticDrift(trace)).toEqual(["same draft"]);
  });
});

describe("Module 3 — diagnosing non-convergence", () => {
  it("is true for an escalated run, false for a resolved one", () => {
    expect(didNotConverge({ ticket: TICKET, outcome: "escalated", steps: [] })).toBe(true);
    expect(didNotConverge({ ticket: TICKET, outcome: "resolved", steps: [] })).toBe(false);
  });
});

describe("Module 3 — the witus-triage fail-soft bug, reproduced", () => {
  it("a fail-soft judge masks failure: output escalates, the trace shows nothing ever scored", async () => {
    const writer: ReplyWriter = ({ critique }) => (critique ? STRONG : "Thanks!");
    const graph = buildTracedReplyLoop(writer, failSoftJudge);
    const result = (await graph.invoke({ ticket: TICKET })) as TracedReplyState;
    const trace = summarizeRun(result);

    // Output-level: it "just escalated" — a green-looking, unalarming outcome.
    expect(trace.outcome).toBe("escalated");
    // Trace-level: even the STRONG draft scored zero — the masked failure.
    expect(detectFailSoftMasking(trace)).toBe(true);
  });
  it("does not false-positive on a healthy run", async () => {
    const writer: ReplyWriter = ({ critique }) => (critique ? STRONG : "Thanks!");
    const graph = buildTracedReplyLoop(writer, healthyJudge);
    const result = (await graph.invoke({ ticket: TICKET })) as TracedReplyState;
    expect(detectFailSoftMasking(summarizeRun(result))).toBe(false);
  });
});
