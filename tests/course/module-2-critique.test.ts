/**
 * Module 2 success signal — the rubric as data, scored by an injected judge.
 *
 * Deterministic, offline: a fake judge scores each criterion by keyword cue, so the
 * tests exercise the rubric machinery (pass rules, weights, evidence/suggestion
 * schema, the compound-criteria linter, and the loop integration) without a model.
 */
import { describe, it, expect } from "vitest";
import {
  supportReplyRubric,
  CriterionVerdictSchema,
  applyPassRule,
  scoreAgainstRubric,
  findCompoundCriteria,
  buildRubricReplyLoop,
  type RubricJudge,
  type RubricCriterion,
  type CriterionVerdict,
} from "../../examples/support-reply-loop/rubric";
import type { ReplyWriter } from "../../examples/support-reply-loop/graph";
import type { TerminatingReplyState } from "../../examples/support-reply-loop/termination";

const TICKET = "My blender arrived with a cracked jar and won't seal.";
const STRONG =
  "Hi Sam, I'm sorry your blender arrived with a cracked jar. We'll ship a " +
  "replacement today and email you tracking. Best, Riley";
const PARTIAL = "Hi Sam, I'm sorry your blender arrived cracked. Best, Riley";

/** Deterministic judge: per-criterion keyword cues, with grounded evidence + fix. */
const CUES: Record<string, string[]> = {
  acknowledges_issue: ["blender", "cracked", "jar", "arrived", "seal"],
  gives_next_step: ["replace", "ship", "refund", "send", "reset"],
  states_timeline: ["today", "tomorrow", "within", "hours", "weekend"],
  has_signoff: ["best", "regards", "sincerely", "cheers", "thanks,"],
};
const fakeJudge: RubricJudge = ({ draft, criterion }) => {
  const hit = (CUES[criterion.key] ?? []).some((w) =>
    draft.toLowerCase().includes(w),
  );
  return {
    key: criterion.key,
    passed: hit,
    evidence: hit ? `matched a ${criterion.key} cue` : `no ${criterion.key} cue`,
    suggestion: hit ? "looks good" : `add: ${criterion.description}`,
  };
};

async function verdictsFor(draft: string): Promise<CriterionVerdict[]> {
  return Promise.all(
    supportReplyRubric.map((criterion) =>
      Promise.resolve(fakeJudge({ ticket: TICKET, draft, criterion })),
    ),
  );
}

describe("Module 2 — verdict schema enforces evidence + suggestion", () => {
  it("rejects a bare boolean verdict (empty evidence)", () => {
    expect(() =>
      CriterionVerdictSchema.parse({
        key: "x",
        passed: true,
        evidence: "",
        suggestion: "y",
      }),
    ).toThrow();
  });
  it("accepts a grounded, actionable verdict", () => {
    expect(() =>
      CriterionVerdictSchema.parse({
        key: "x",
        passed: false,
        evidence: "no sign-off present",
        suggestion: "add a sign-off naming the sender",
      }),
    ).not.toThrow();
  });
});

describe("Module 2 — the pass rule is DATA, not code", () => {
  it("all-blocking fails a partial reply; weighted-threshold passes the same verdicts", async () => {
    const verdicts = await verdictsFor(PARTIAL); // acks + signoff, no next-step/timeline
    expect(applyPassRule(verdicts, supportReplyRubric, { kind: "all-blocking" })).toBe(false);
    expect(
      applyPassRule(verdicts, supportReplyRubric, { kind: "weighted-threshold", threshold: 0.5 }),
    ).toBe(true);
  });

  it("changing a weight (data) flips the outcome with no code change", async () => {
    const verdicts = await verdictsFor(STRONG); // passes all but let's drop timeline
    const noTimeline = verdicts.map((v) =>
      v.key === "states_timeline" ? { ...v, passed: false } : v,
    );
    // states_timeline is a 0.5 nudge by default → still passes all-blocking.
    expect(applyPassRule(noTimeline, supportReplyRubric, { kind: "all-blocking" })).toBe(true);
    // Promote it to blocking via the DATA only:
    const stricter: RubricCriterion[] = supportReplyRubric.map((c) =>
      c.key === "states_timeline" ? { ...c, weight: 1 } : c,
    );
    expect(applyPassRule(noTimeline, stricter, { kind: "all-blocking" })).toBe(false);
  });
});

describe("Module 2 — scoreAgainstRubric returns a router-ready critique", () => {
  it("passes the strong reply and surfaces evidence per check", async () => {
    const critique = await scoreAgainstRubric(fakeJudge, TICKET, STRONG, 1);
    expect(critique.passed).toBe(true);
    expect(critique.checks).toHaveLength(supportReplyRubric.length);
    expect(critique.checks.every((c) => c.evidence.length > 0)).toBe(true);
  });
  it("fails a weak reply and builds actionable feedback", async () => {
    const critique = await scoreAgainstRubric(fakeJudge, TICKET, "Thanks!", 1);
    expect(critique.passed).toBe(false);
    expect(critique.feedback).toContain("add:");
  });
});

describe("Module 2 — the compound-criteria linter (failure mode 3)", () => {
  it("passes a clean rubric", () => {
    expect(findCompoundCriteria(supportReplyRubric)).toEqual([]);
  });
  it("flags a compound criterion", () => {
    const bad: RubricCriterion[] = [
      { key: "tone", description: "Is professional and friendly.", weight: 1 },
    ];
    expect(findCompoundCriteria(bad)).toEqual(["tone"]);
  });
});

describe("Module 2 — the rubric critic drops into the bounded loop", () => {
  it("converges with a weak→strong writer", async () => {
    const writer: ReplyWriter = ({ critique }) => (critique ? STRONG : "Thanks!");
    const graph = buildRubricReplyLoop(writer, fakeJudge);
    const result = (await graph.invoke({ ticket: TICKET })) as TerminatingReplyState;
    expect(result.outcome).toBe("resolved");
    expect(result.critique?.passed).toBe(true);
  });
  it("inherits termination: a stalling writer escalates", async () => {
    const stalled: ReplyWriter = () => "Thanks!";
    const graph = buildRubricReplyLoop(stalled, fakeJudge);
    const result = (await graph.invoke({ ticket: TICKET })) as TerminatingReplyState;
    expect(result.outcome).toBe("escalated");
  });
});
