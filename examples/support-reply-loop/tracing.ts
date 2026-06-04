/**
 * Module 3 runnable artifact — fail-soft tracing wiring + trace diagnostics.
 *
 * A reflection loop is undebuggable from its output alone: a wrong answer and a
 * right one are both just strings. The fix is a TRACE — a record of every step the
 * loop took. In production that record is LangSmith; here we build a local
 * `RunTrace` (the loop writes one TraceStep per critique into a state channel) so
 * the diagnostics are runnable and testable OFFLINE. The same signals you compute
 * here are what you read off a LangSmith trace tree.
 *
 * Tracing must be FAIL-SOFT: when the LangSmith env vars are absent the loop runs
 * exactly the same, just untraced (`tracingConfig`). The course never requires a
 * LangSmith account to run.
 *
 * Diagnostics included, each a real failure you can see in a trace:
 *   - findWastedIterations — a revision that did not improve the score
 *   - detectCriticDrift   — the same draft scored differently across passes
 *   - didNotConverge      — the run escalated instead of resolving
 *   - detectFailSoftMasking — a fail-soft critic silently failing everything
 *     (the witus-triage "other / confidence 0" bug, in this domain)
 */
import { StateGraph, START, END, Annotation } from "@langchain/langgraph";
import { MAX_REVISIONS, type ReplyWriter } from "./graph";
import {
  scoreAgainstRubric,
  supportReplyRubric,
  type RubricJudge,
  type PassRule,
  defaultPassRule,
} from "./rubric";

/* ------------------------------------------------------------------ */
/* Fail-soft tracing config                                            */
/* ------------------------------------------------------------------ */

export interface TracingConfig {
  enabled: boolean;
  project: string;
}

/**
 * Read the three LangSmith env vars and decide whether tracing is on. NEVER
 * throws when they are absent — the loop must run untraced just the same. Tracing
 * is enabled only when `LANGSMITH_TRACING === "true"` AND an API key is present.
 */
type EnvLike = Record<string, string | undefined>;

export function tracingConfig(env: EnvLike = process.env): TracingConfig {
  return {
    enabled: env.LANGSMITH_TRACING === "true" && Boolean(env.LANGSMITH_API_KEY),
    project: env.LANGSMITH_PROJECT ?? "wanderlearn-foundation-course",
  };
}

export function isTracingEnabled(env: EnvLike = process.env): boolean {
  return tracingConfig(env).enabled;
}

/* ------------------------------------------------------------------ */
/* The local trace                                                     */
/* ------------------------------------------------------------------ */

/** One critique pass, as it would appear as a span in a trace tree. */
export interface TraceStep {
  revisionNumber: number;
  draft: string;
  passedChecks: number;
  totalChecks: number;
  passed: boolean;
}

export interface RunTrace {
  ticket: string;
  steps: TraceStep[];
  outcome: "resolved" | "escalated" | undefined;
}

/** State adds a `trace` channel (concat) recording one TraceStep per critique. */
export const TracedReplyStateAnnotation = Annotation.Root({
  ticket: Annotation<string>,
  draft: Annotation<string | undefined>,
  critique: Annotation<
    Awaited<ReturnType<typeof scoreAgainstRubric>> | undefined
  >,
  revisionNumber: Annotation<number>({
    reducer: (_current, update) => update,
    default: () => 0,
  }),
  trace: Annotation<TraceStep[]>({
    reducer: (current, update) => current.concat(update),
    default: () => [],
  }),
  escalated: Annotation<boolean>({
    reducer: (current, update) => current || update,
    default: () => false,
  }),
  outcome: Annotation<"resolved" | "escalated" | undefined>,
});

export type TracedReplyState = typeof TracedReplyStateAnnotation.State;

function routeTraced(
  state: TracedReplyState,
): "write_reply" | "mark_resolved" | "flag_for_human" {
  const { critique } = state;
  if (!critique) {
    throw new Error("routeTraced: critique must run before routing.");
  }
  if (critique.passed) return "mark_resolved";
  const drafts = state.trace.map((s) => s.draft.trim());
  if (
    drafts.length >= 2 &&
    drafts[drafts.length - 1] === drafts[drafts.length - 2]
  ) {
    return "flag_for_human";
  }
  if (state.revisionNumber >= MAX_REVISIONS) return "flag_for_human";
  return "write_reply";
}

/**
 * The bounded rubric loop, instrumented: the critique node records a TraceStep.
 * When tracing is enabled this is also where a LangSmith run would be emitted;
 * here we keep the trace local so it is inspectable in tests.
 */
export function buildTracedReplyLoop(
  write: ReplyWriter,
  judge: RubricJudge,
  rule: PassRule = defaultPassRule,
) {
  async function writeReply(state: TracedReplyState) {
    const draft = await write({
      ticket: state.ticket,
      draft: state.draft,
      critique: state.critique,
    });
    return { draft, revisionNumber: state.revisionNumber + 1 };
  }

  async function critiqueReply(state: TracedReplyState) {
    const draft = state.draft ?? "";
    const critique = await scoreAgainstRubric(
      judge,
      state.ticket,
      draft,
      state.revisionNumber,
      supportReplyRubric,
      rule,
    );
    const step: TraceStep = {
      revisionNumber: state.revisionNumber,
      draft,
      passedChecks: critique.checks.filter((c) => c.passed).length,
      totalChecks: critique.checks.length,
      passed: critique.passed,
    };
    return { critique, trace: [step] };
  }

  return new StateGraph(TracedReplyStateAnnotation)
    .addNode("write_reply", writeReply)
    .addNode("critique_reply", critiqueReply)
    .addNode("mark_resolved", () => ({ outcome: "resolved" as const }))
    .addNode("flag_for_human", () => ({
      escalated: true,
      outcome: "escalated" as const,
    }))
    .addEdge(START, "write_reply")
    .addEdge("write_reply", "critique_reply")
    .addConditionalEdges("critique_reply", routeTraced, [
      "write_reply",
      "mark_resolved",
      "flag_for_human",
    ])
    .addEdge("mark_resolved", END)
    .addEdge("flag_for_human", END)
    .compile();
}

/** Project final state into a RunTrace — the object a diagnostic reads. */
export function summarizeRun(state: TracedReplyState): RunTrace {
  return { ticket: state.ticket, steps: state.trace, outcome: state.outcome };
}

/* ------------------------------------------------------------------ */
/* Diagnostics — what you read off the trace                           */
/* ------------------------------------------------------------------ */

/**
 * Wasted iterations: a revision whose score did NOT improve over the prior pass.
 * In a LangSmith trace these are the write→critique cycles that cost a call and
 * moved nothing. Returns the revision numbers that were wasted.
 */
export function findWastedIterations(trace: RunTrace): number[] {
  const wasted: number[] = [];
  for (let i = 1; i < trace.steps.length; i++) {
    if (trace.steps[i]!.passedChecks <= trace.steps[i - 1]!.passedChecks) {
      wasted.push(trace.steps[i]!.revisionNumber);
    }
  }
  return wasted;
}

/**
 * Critic drift: the SAME draft scored differently on two passes — a
 * nondeterministic judge, the thing that makes a loop never settle. Returns the
 * drafts that received inconsistent verdicts.
 */
export function detectCriticDrift(trace: RunTrace): string[] {
  const byDraft = new Map<string, Set<number>>();
  for (const step of trace.steps) {
    const key = step.draft.trim();
    const set = byDraft.get(key) ?? new Set<number>();
    set.add(step.passedChecks);
    byDraft.set(key, set);
  }
  return [...byDraft.entries()]
    .filter(([, scores]) => scores.size > 1)
    .map(([draft]) => draft);
}

/** Non-convergence: the run escalated (or never passed). */
export function didNotConverge(trace: RunTrace): boolean {
  return trace.outcome === "escalated";
}

/**
 * Fail-soft masking — the witus-triage bug, in this domain. A fail-soft critic
 * that errors and returns a blanket "fail" makes EVERY criterion fail on EVERY
 * pass, even on drafts that should pass. Signature: the writer produced ≥ 2
 * distinct drafts yet not a single criterion ever passed. Output assertions stay
 * green (it just "escalates"); the trace is where you see nothing ever scored.
 */
export function detectFailSoftMasking(trace: RunTrace): boolean {
  const distinctDrafts = new Set(trace.steps.map((s) => s.draft.trim())).size;
  const everPassedAnyCheck = trace.steps.some((s) => s.passedChecks > 0);
  return distinctDrafts >= 2 && !everPassedAnyCheck;
}
