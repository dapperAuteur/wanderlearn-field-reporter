/**
 * Module 0 runnable artifact — the minimal write → critique → revise loop.
 *
 * This is the smallest honest reflection loop: a `write_reply` node drafts a
 * customer-support reply, a `critique_reply` node scores it against a few
 * concretely-checkable standards, and a conditional edge either finishes (the
 * draft passed) or routes back to revise. The cap lives in `routeAfterCritique`,
 * never in a prompt — so the cycle is guaranteed to terminate (Module 1 expands
 * termination into its own topic).
 *
 * The critic here is a DETERMINISTIC STUB (see `scoreReply`): no LLM, no network,
 * no API key. That is deliberate for Module 0 — the lesson is the *graph shape*,
 * not critic quality. It makes the loop runnable offline and the vitest test a
 * real success signal. Module 2 replaces the stub with an LLM-scored rubric.
 *
 * The writer is INJECTED (`ReplyWriter`) so the same graph runs with a canned
 * weak→strong writer (the offline demo and the tests) or a real chat model
 * (shown in `run.ts`). Node names are verb phrases so they never collide with
 * the state channel names — LangGraph forbids a node and a channel sharing one.
 *
 * Mirrors the house LangGraph idioms in `src/agent/graph.ts` and
 * `src/agent/state.ts`.
 */
import { StateGraph, START, END, Annotation } from "@langchain/langgraph";

/** Maximum write→critique iterations before the loop exits unresolved. */
export const MAX_REVISIONS = 3;

/** One concretely-checkable standard, scored pass/fail with grounded evidence. */
export interface ReplyCheck {
  name: string;
  passed: boolean;
  /** One sentence grounding the verdict in the draft — forces a real judgment. */
  evidence: string;
}

/** The stub critic's verdict on one draft. */
export interface ReplyCritique {
  passed: boolean;
  checks: ReplyCheck[];
  /** Which revision this critique scored (1-based). */
  revisionNumber: number;
  /** Concatenated fix hints for the failed checks — fed back into the writer. */
  feedback: string;
}

/**
 * A draft-producing function. Given the ticket — and, on revisions, the prior
 * draft plus its critique — it returns the next draft. Injected so the graph is
 * agnostic to whether a canned function or a real chat model writes the reply.
 */
export type ReplyWriter = (input: {
  ticket: string;
  draft?: string;
  critique?: ReplyCritique;
}) => string | Promise<string>;

/** State that flows through the loop. Last-write-wins except `history`. */
export const SupportReplyStateAnnotation = Annotation.Root({
  /** The inbound customer message — set once at invocation. */
  ticket: Annotation<string>,
  /** The current support-reply draft. */
  draft: Annotation<string | undefined>,
  /** The just-produced critique (read by the router; never re-scored). */
  critique: Annotation<ReplyCritique | undefined>,
  /** Increments once per `write_reply` pass — the router's termination counter. */
  revisionNumber: Annotation<number>({
    reducer: (_current, update) => update,
    default: () => 0,
  }),
  /** Every draft, appended (concat reducer) so a run is fully auditable. */
  history: Annotation<{ revisionNumber: number; draft: string }[]>({
    reducer: (current, update) => current.concat(update),
    default: () => [],
  }),
});

export type SupportReplyState = typeof SupportReplyStateAnnotation.State;

/* ------------------------------------------------------------------ */
/* The deterministic stub critic                                       */
/* ------------------------------------------------------------------ */

const STOPWORDS = new Set([
  "about", "after", "again", "could", "there", "their", "where", "which",
  "would", "should", "still", "thing", "really", "order", "please", "thanks",
  "hello", "because", "doesnt", "didnt", "wasnt", "isnt",
]);

/** Content words from the ticket: lowercased, length ≥ 5, not a stopword. */
function contentWords(text: string): string[] {
  return Array.from(
    new Set(
      text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length >= 5 && !STOPWORDS.has(w)),
    ),
  );
}

/**
 * Score a draft reply against three concretely-checkable standards. Every check
 * is verifiable by reading the text — the F5 lesson is that "is it empathetic?"
 * is NOT such a check, but "does it name the customer's actual problem?" is.
 */
export function scoreReply(
  ticket: string,
  draft: string,
  revisionNumber: number,
): ReplyCritique {
  const lower = draft.toLowerCase();
  const ticketWords = contentWords(ticket);
  const acknowledged = ticketWords.filter((w) => lower.includes(w));

  const checks: ReplyCheck[] = [
    {
      name: "acknowledges_the_specific_issue",
      passed: acknowledged.length > 0,
      evidence:
        acknowledged.length > 0
          ? `Names the customer's issue (matched: ${acknowledged.slice(0, 3).join(", ")}).`
          : "Generic — does not name anything specific from the ticket.",
    },
    {
      name: "gives_a_concrete_next_step",
      passed:
        /\b(will|we'll|i'll|here(?:'s| is) how|step|refund|replace|reset|ship|within \d|by (?:tomorrow|monday|tuesday|wednesday|thursday|friday|end of))\b/.test(
          lower,
        ),
      evidence:
        "A reply must tell the customer what happens next or what to do.",
    },
    {
      name: "has_a_sign_off",
      passed: /\b(regards|sincerely|cheers|best,|thank you|thanks,|—\s*\w)/.test(
        lower,
      ),
      evidence: "A reply should close, not trail off mid-thought.",
    },
  ];

  const failed = checks.filter((c) => !c.passed);
  const feedback =
    failed.length === 0
      ? "All checks pass."
      : failed
          .map((c) => `- Fix "${c.name}": ${c.evidence}`)
          .join("\n");

  return {
    passed: failed.length === 0,
    checks,
    revisionNumber,
    feedback,
  };
}

/* ------------------------------------------------------------------ */
/* The graph                                                           */
/* ------------------------------------------------------------------ */

type CritiqueRoute = "write_reply" | typeof END;

/**
 * Conditional edge after `critique_reply`: finish or revise. Reads the
 * just-written critique — it never re-scores. This function is the loop's
 * termination guard: when the draft passes OR the revision cap is hit, the run
 * ends. Because `write_reply` increments `revisionNumber` every pass, the cap is
 * reached in a bounded number of steps.
 */
export function routeAfterCritique(state: SupportReplyState): CritiqueRoute {
  const { critique } = state;
  if (!critique) {
    throw new Error("routeAfterCritique: critique must run before routing.");
  }
  if (critique.passed) return END;
  if (state.revisionNumber >= MAX_REVISIONS) return END;
  return "write_reply";
}

/** Build and compile the minimal support-reply reflection loop. */
export function buildSupportReplyLoop(write: ReplyWriter) {
  async function writeReply(state: SupportReplyState) {
    const draft = await write({
      ticket: state.ticket,
      draft: state.draft,
      critique: state.critique,
    });
    const revisionNumber = state.revisionNumber + 1;
    return { draft, revisionNumber, history: [{ revisionNumber, draft }] };
  }

  function critiqueReply(state: SupportReplyState) {
    return {
      critique: scoreReply(state.ticket, state.draft ?? "", state.revisionNumber),
    };
  }

  return new StateGraph(SupportReplyStateAnnotation)
    .addNode("write_reply", writeReply)
    .addNode("critique_reply", critiqueReply)
    .addEdge(START, "write_reply")
    .addEdge("write_reply", "critique_reply")
    .addConditionalEdges("critique_reply", routeAfterCritique, [
      "write_reply",
      END,
    ])
    .compile();
}
