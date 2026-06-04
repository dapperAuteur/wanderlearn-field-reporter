/**
 * Module 1 runnable artifact — bounded termination, the four patterns composed.
 *
 * Module 0 gave the loop ONE exit: pass, or hit a max-revision counter. That is
 * Pattern 1. Real reflection loops need more, because a loop can fail to converge
 * in ways a raw counter does not catch — it can *stall* (keep emitting the same
 * draft) or produce output a human must own. This module builds three more exits
 * and composes them in a deliberate priority order:
 *
 *   Pattern 1 — max-iteration counter (the hard cap, in code, never a prompt)
 *   Pattern 2 — convergence detection (stop when revising stops changing anything)
 *   Pattern 3 — human escalation (route to a person instead of shipping junk)
 *   Composition — a single router applies them in priority order
 *   Backstop — LangGraph's `recursionLimit` is the seatbelt, not the steering wheel
 *
 * Built on the same support-reply domain and stub critic as Module 0 (imported
 * from ./graph) so the thread is continuous: same loop, now with real exits.
 */
import { StateGraph, START, END, Annotation } from "@langchain/langgraph";
import {
  scoreReply,
  MAX_REVISIONS,
  type ReplyWriter,
  type ReplyCritique,
} from "./graph";

/** State adds an escalation flag and a final outcome to the Module 0 channels. */
export const TerminatingReplyStateAnnotation = Annotation.Root({
  ticket: Annotation<string>,
  draft: Annotation<string | undefined>,
  critique: Annotation<ReplyCritique | undefined>,
  revisionNumber: Annotation<number>({
    reducer: (_current, update) => update,
    default: () => 0,
  }),
  history: Annotation<{ revisionNumber: number; draft: string }[]>({
    reducer: (current, update) => current.concat(update),
    default: () => [],
  }),
  /** Sticky: once a run escalates it stays escalated. */
  escalated: Annotation<boolean>({
    reducer: (current, update) => current || update,
    default: () => false,
  }),
  /** How the run ended — the thing an operator reads first. */
  outcome: Annotation<"resolved" | "escalated" | undefined>,
});

export type TerminatingReplyState = typeof TerminatingReplyStateAnnotation.State;

/**
 * Pattern 2 — convergence detection. The loop has *stalled* when the two most
 * recent drafts are identical: the writer is no longer responding to the
 * critique, so further revisions cannot help. Catching this is what separates a
 * thoughtful exit from "burn all the revisions then give up." Real systems
 * compare semantically (embedding distance) or by critique-score delta; here we
 * use exact-match on trimmed text to keep it deterministic and offline.
 */
export function hasConverged(
  history: { draft: string }[],
): boolean {
  if (history.length < 2) return false;
  const latest = history[history.length - 1]!.draft.trim();
  const previous = history[history.length - 2]!.draft.trim();
  return latest === previous;
}

type TerminationRoute = "write_reply" | "mark_resolved" | "flag_for_human";

/**
 * The composed router — every termination pattern in ONE place, applied in
 * priority order. Order matters: success wins over everything; a stalled loop
 * escalates *before* it wastes the rest of its budget; the hard counter is the
 * last line before another revision. None of this lives in a prompt.
 */
export function routeWithAllPatterns(
  state: TerminatingReplyState,
): TerminationRoute {
  const { critique } = state;
  if (!critique) {
    throw new Error("routeWithAllPatterns: critique must run before routing.");
  }
  // Success — the only happy exit.
  if (critique.passed) return "mark_resolved";
  // Pattern 2: the loop stalled — a human, not another identical revision.
  if (hasConverged(state.history)) return "flag_for_human";
  // Pattern 1: the hard counter — the guaranteed bound.
  if (state.revisionNumber >= MAX_REVISIONS) return "flag_for_human";
  // Otherwise, revise with the critique in scope.
  return "write_reply";
}

/**
 * Build the fully-bounded loop: write → critique → (resolve | escalate | revise).
 * Pattern 3 (human escalation) is the `flag_for_human` node, a real terminal
 * state distinct from success — so downstream code can tell "we shipped it" from
 * "a person needs to look."
 */
export function buildBoundedReplyLoop(write: ReplyWriter) {
  async function writeReply(state: TerminatingReplyState) {
    const draft = await write({
      ticket: state.ticket,
      draft: state.draft,
      critique: state.critique,
    });
    const revisionNumber = state.revisionNumber + 1;
    return { draft, revisionNumber, history: [{ revisionNumber, draft }] };
  }

  function critiqueReply(state: TerminatingReplyState) {
    return {
      critique: scoreReply(state.ticket, state.draft ?? "", state.revisionNumber),
    };
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

/**
 * An UNCAPPED loop — pass or revise, with NO counter, NO convergence check. This
 * exists only to demonstrate the backstop lesson: drive it with a writer that
 * never passes and it loops forever, until LangGraph's `recursionLimit` throws a
 * GraphRecursionError. That error is the seatbelt — proof you forgot the steering
 * wheel (your own bounded exit). NEVER ship a loop that relies on it.
 */
export function buildUncappedReplyLoop(write: ReplyWriter) {
  async function writeReply(state: TerminatingReplyState) {
    const draft = await write({
      ticket: state.ticket,
      draft: state.draft,
      critique: state.critique,
    });
    return { draft, revisionNumber: state.revisionNumber + 1 };
  }

  function critiqueReply(state: TerminatingReplyState) {
    return {
      critique: scoreReply(state.ticket, state.draft ?? "", state.revisionNumber),
    };
  }

  function routeOnlyOnPass(
    state: TerminatingReplyState,
  ): "write_reply" | typeof END {
    return state.critique?.passed ? END : "write_reply";
  }

  return new StateGraph(TerminatingReplyStateAnnotation)
    .addNode("write_reply", writeReply)
    .addNode("critique_reply", critiqueReply)
    .addEdge(START, "write_reply")
    .addEdge("write_reply", "critique_reply")
    .addConditionalEdges("critique_reply", routeOnlyOnPass, ["write_reply", END])
    .compile();
}
