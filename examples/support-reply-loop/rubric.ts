/**
 * Module 2 runnable artifact — the rubric as DATA, and an LLM-as-judge critic.
 *
 * Module 0's critic was a hand-rolled stub; Module 1 made the loop terminate.
 * Module 2 replaces the stub with a real rubric scored by an LLM judge — and the
 * whole lesson is that the rubric is the LEVER. The criteria, their weights, and
 * the pass rule are DATA you edit here; the node code never changes. The judge is
 * injected (RubricJudge) so this runs offline with a deterministic fake judge in
 * tests, or a real `model.withStructuredOutput(...)` in production.
 *
 * Each criterion verdict carries EVIDENCE (grounds the verdict in the draft) and a
 * SUGGESTION (actionable fix) — the G-Eval shape that makes an LLM judge reliable
 * (Liu et al., 2023). The pass rule is applied in code over the verdicts, never by
 * the LLM, so "did it pass?" is deterministic given the verdicts.
 *
 * Drops into Module 1's bounded loop: `scoreAgainstRubric` returns a
 * `ReplyCritique`, exactly what `routeWithAllPatterns` already consumes.
 */
import { z } from "zod";
import type { ReplyCritique, ReplyCheck } from "./graph";
import {
  StateGraph,
  START,
  END,
} from "@langchain/langgraph";
import {
  TerminatingReplyStateAnnotation,
  routeWithAllPatterns,
  type TerminatingReplyState,
} from "./termination";
import type { ReplyWriter } from "./graph";

/** One criterion: a single, concretely-verifiable check, with a weight. */
export interface RubricCriterion {
  key: string;
  /** ONE check, verifiable by reading the draft. Not compound, not vague. */
  description: string;
  /** 1 = blocking (a draft must pass it); 0.5 = a nudge that never blocks alone. */
  weight: number;
}

/**
 * The support-reply rubric — the lever. Each description is a single check phrased
 * so a reader (or an LLM) can confirm it by looking at the draft. Edit THIS to
 * change what "good" means; no node code changes.
 */
export const supportReplyRubric: RubricCriterion[] = [
  {
    key: "acknowledges_issue",
    description: "Names the specific problem the customer reported.",
    weight: 1,
  },
  {
    key: "gives_next_step",
    description: "States one concrete action that resolves the problem.",
    weight: 1,
  },
  {
    key: "states_timeline",
    description: "Gives a specific timeframe for that action.",
    weight: 0.5,
  },
  {
    key: "has_signoff",
    description: "Ends with a sign-off naming the sender.",
    weight: 1,
  },
];

/**
 * The judge's verdict on ONE criterion. Evidence and suggestion are REQUIRED and
 * non-empty — the schema enforces that the judge grounds and actions every verdict
 * rather than returning a bare boolean (Liu et al., 2023).
 */
export const CriterionVerdictSchema = z.object({
  key: z.string(),
  passed: z.boolean(),
  evidence: z.string().min(1),
  suggestion: z.string().min(1),
});
export type CriterionVerdict = z.infer<typeof CriterionVerdictSchema>;

/**
 * Scores ONE criterion against the draft. Injected: a real implementation calls
 * `model.withStructuredOutput(CriterionVerdictSchema)`, the tests pass a
 * deterministic fake. Either way the loop is identical.
 */
export type RubricJudge = (input: {
  ticket: string;
  draft: string;
  criterion: RubricCriterion;
}) => CriterionVerdict | Promise<CriterionVerdict>;

/** How verdicts combine into a pass — DATA, not logic baked into the node. */
export type PassRule =
  | { kind: "all-blocking" }
  | { kind: "weighted-threshold"; threshold: number };

export const defaultPassRule: PassRule = { kind: "all-blocking" };

/**
 * Apply the pass rule to the verdicts. `all-blocking`: every weight-1 criterion
 * must pass (the half-weight nudges cannot block). `weighted-threshold`: the
 * earned weight as a fraction of total weight must meet the threshold. Both read
 * from the rubric + rule DATA, so changing either changes the outcome with no code
 * edit.
 */
export function applyPassRule(
  verdicts: CriterionVerdict[],
  rubric: RubricCriterion[],
  rule: PassRule,
): boolean {
  const verdictFor = (key: string) => verdicts.find((v) => v.key === key);
  if (rule.kind === "all-blocking") {
    return rubric
      .filter((c) => c.weight >= 1)
      .every((c) => verdictFor(c.key)?.passed === true);
  }
  const total = rubric.reduce((sum, c) => sum + c.weight, 0);
  const earned = rubric.reduce(
    (sum, c) => sum + (verdictFor(c.key)?.passed ? c.weight : 0),
    0,
  );
  return total > 0 && earned / total >= rule.threshold;
}

/**
 * Score a draft against the rubric and return a `ReplyCritique` the loop's router
 * already understands. The judge scores each criterion; the pass rule combines the
 * verdicts in code; failed criteria become the feedback the writer revises against.
 */
export async function scoreAgainstRubric(
  judge: RubricJudge,
  ticket: string,
  draft: string,
  revisionNumber: number,
  rubric: RubricCriterion[] = supportReplyRubric,
  rule: PassRule = defaultPassRule,
): Promise<ReplyCritique> {
  const verdicts = await Promise.all(
    rubric.map((criterion) => judge({ ticket, draft, criterion })),
  );
  const passed = applyPassRule(verdicts, rubric, rule);
  const checks: ReplyCheck[] = verdicts.map((v) => ({
    name: v.key,
    passed: v.passed,
    evidence: v.evidence,
  }));
  const failed = verdicts.filter((v) => !v.passed);
  const feedback =
    failed.length === 0
      ? "All criteria pass."
      : failed.map((v) => `- ${v.key}: ${v.suggestion}`).join("\n");
  return { passed, checks, revisionNumber, feedback };
}

/**
 * A "rubric smell" linter — flags COMPOUND criteria (failure mode 3): a single
 * description doing two jobs, joined by "and"/"or" or a comma. A compound check
 * can only return one pass/fail for two distinct questions, so its verdict is
 * unactionable. Run this over any rubric you write.
 */
export function findCompoundCriteria(rubric: RubricCriterion[]): string[] {
  return rubric
    .filter((c) => /\b(and|or)\b/i.test(c.description) || c.description.includes(","))
    .map((c) => c.key);
}

/**
 * The Module 2 loop: Module 1's bounded router, now with the rubric critic instead
 * of the stub. Same termination guarantees, a real (injected) judge deciding pass.
 */
export function buildRubricReplyLoop(
  write: ReplyWriter,
  judge: RubricJudge,
  rule: PassRule = defaultPassRule,
) {
  async function writeReply(state: TerminatingReplyState) {
    const draft = await write({
      ticket: state.ticket,
      draft: state.draft,
      critique: state.critique,
    });
    const revisionNumber = state.revisionNumber + 1;
    return { draft, revisionNumber, history: [{ revisionNumber, draft }] };
  }

  async function critiqueReply(state: TerminatingReplyState) {
    const critique = await scoreAgainstRubric(
      judge,
      state.ticket,
      state.draft ?? "",
      state.revisionNumber,
      supportReplyRubric,
      rule,
    );
    return { critique };
  }

  function markResolved() {
    return { outcome: "resolved" as const };
  }

  function flagForHuman() {
    return { escalated: true, outcome: "escalated" as const };
  }

  return new StateGraph(TerminatingReplyStateAnnotation)
    .addNode("write_reply", writeReply)
    .addNode("critique_reply", critiqueReply)
    .addNode("mark_resolved", markResolved)
    .addNode("flag_for_human", flagForHuman)
    .addEdge(START, "write_reply")
    .addEdge("write_reply", "critique_reply")
    .addConditionalEdges("critique_reply", routeWithAllPatterns, [
      "write_reply",
      "mark_resolved",
      "flag_for_human",
    ])
    .addEdge("mark_resolved", END)
    .addEdge("flag_for_human", END)
    .compile();
}
