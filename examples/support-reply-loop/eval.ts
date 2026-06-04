/**
 * Module 4 runnable artifact — the runtime rubric, reused as an offline eval.
 *
 * The Module 2 rubric is the loop's runtime critic. This module reuses the SAME
 * rubric, the SAME judge contract, and the SAME `applyPassRule` as an OFFLINE
 * regression test over a small dataset — so "the runtime rubric is also the
 * offline test" is literal, not a slogan. The shapes mirror LangSmith's
 * `evaluate(target, { data, evaluators })`: a dataset of examples, a target that
 * runs the system, and an evaluator that scores the output (LangChain, n.d.).
 * Here it runs offline with deterministic stand-ins so it is CI-green with no key.
 *
 * It also carries the Module 3 → 4 bridge: an eval MUST fail loudly on an
 * infrastructure error rather than fold a fail-soft fallback into the score (the
 * witus-triage "fake 8%" bug). `assertNoInfraErrors` is that guard.
 */
import type { ReplyWriter, ReplyCritique } from "./graph";
import {
  scoreAgainstRubric,
  supportReplyRubric,
  buildRubricReplyLoop,
  type RubricJudge,
} from "./rubric";
import type { TerminatingReplyState } from "./termination";

/* ------------------------------------------------------------------ */
/* The dataset (~10 examples — small on purpose; see Lesson 31)        */
/* ------------------------------------------------------------------ */

export interface EvalExample {
  id: string;
  ticket: string;
}

export const supportReplyDataset: EvalExample[] = [
  { id: "blender", ticket: "My blender arrived with a cracked jar and won't seal." },
  { id: "late", ticket: "The delivery is three days late and I needed it for an event." },
  { id: "double-charge", ticket: "I was charged twice for the same subscription this month." },
  { id: "crash", ticket: "The mobile app crashes every time I open the camera screen." },
  { id: "promo", ticket: "My promo code REFRESH20 was rejected at checkout." },
  { id: "wrong-model", ticket: "The replacement remote you sent is the wrong model." },
  { id: "password", ticket: "I can't reset my password; the email never arrives." },
  { id: "peeling", ticket: "The fabric on the couch started peeling after two weeks." },
  { id: "address", ticket: "Your warehouse shipped the package to my old address." },
  { id: "dead", ticket: "It will not turn on at all." }, // no content word ≥5 — the hard case
];

/* ------------------------------------------------------------------ */
/* Evaluator — REUSE the runtime rubric                                */
/* ------------------------------------------------------------------ */

export interface CaseResult {
  id: string;
  passed: boolean;
  /** True when the critique looks like an error-fallback, not a real score. */
  errored: boolean;
}

export interface EvalReport {
  results: CaseResult[];
  passRate: number;
  erroredCount: number;
}

/**
 * The error-fallback signature (the Module 3 bug): every criterion failed AND at
 * least one carries an error marker in its evidence. Such a result is NOT a
 * measurement — it is an infrastructure failure wearing a score.
 */
export function looksLikeErrorFallback(critique: ReplyCritique): boolean {
  const allFailed = critique.checks.every((c) => !c.passed);
  const hasErrorMarker = critique.checks.some((c) => c.evidence.includes("<error"));
  return allFailed && hasErrorMarker;
}

/** Score one draft with the runtime rubric — this IS the evaluator. */
export async function evaluateDraft(
  judge: RubricJudge,
  ticket: string,
  draft: string,
): Promise<{ passed: boolean; errored: boolean }> {
  const critique = await scoreAgainstRubric(judge, ticket, draft, 0, supportReplyRubric);
  return { passed: critique.passed, errored: looksLikeErrorFallback(critique) };
}

/* ------------------------------------------------------------------ */
/* Targets — the systems under test                                    */
/* ------------------------------------------------------------------ */

/** A target maps a ticket to the system's final reply. */
export type ReplyTarget = (ticket: string) => Promise<string>;

/** The reflection loop: write → critique → revise, using the rubric judge. */
export function loopTarget(writer: ReplyWriter, judge: RubricJudge): ReplyTarget {
  return async (ticket) => {
    const graph = buildRubricReplyLoop(writer, judge);
    const result = (await graph.invoke({ ticket })) as TerminatingReplyState;
    return result.draft ?? "";
  };
}

/** Single-shot: write once, no critique, no revision — the baseline. */
export function singleShotTarget(writer: ReplyWriter): ReplyTarget {
  return async (ticket) => writer({ ticket });
}

/* ------------------------------------------------------------------ */
/* Run an eval                                                          */
/* ------------------------------------------------------------------ */

export async function runEval(
  dataset: EvalExample[],
  target: ReplyTarget,
  judge: RubricJudge,
): Promise<EvalReport> {
  const results: CaseResult[] = [];
  for (const example of dataset) {
    const draft = await target(example.ticket);
    const { passed, errored } = await evaluateDraft(judge, example.ticket, draft);
    results.push({ id: example.id, passed, errored });
  }
  const erroredCount = results.filter((r) => r.errored).length;
  const passRate = results.filter((r) => r.passed).length / results.length;
  return { results, passRate, erroredCount };
}

/**
 * Threshold WITH MARGIN for LLM-judge noise (Lesson 30). Never assert 100% — an
 * LLM judge is noisy, so a real-but-good system will occasionally dip. Assert a
 * threshold below the expected pass rate by enough to absorb the noise.
 */
export function meetsThreshold(report: EvalReport, threshold: number): boolean {
  return report.passRate >= threshold;
}

/**
 * The Module 3 → 4 bridge: an eval must produce a real number or fail LOUDLY. If
 * any case is an error-fallback, the run is poisoned — throw rather than report a
 * fake score (the witus-triage "8%" bug).
 */
export function assertNoInfraErrors(report: EvalReport): void {
  if (report.erroredCount > 0) {
    const ids = report.results.filter((r) => r.errored).map((r) => r.id);
    throw new Error(
      `Eval aborted: infrastructure failure on ${report.erroredCount} case(s) ` +
        `[${ids.join(", ")}]. This is NOT a measurement — re-run on a working provider.`,
    );
  }
}

/** Pairwise comparison: how often does A pass where B does not, and vice versa? */
export function pairwise(
  a: EvalReport,
  b: EvalReport,
): { aWins: number; bWins: number; ties: number } {
  const byId = new Map(b.results.map((r) => [r.id, r.passed]));
  let aWins = 0;
  let bWins = 0;
  let ties = 0;
  for (const r of a.results) {
    const bPassed = byId.get(r.id);
    if (r.passed === bPassed) ties++;
    else if (r.passed) aWins++;
    else bWins++;
  }
  return { aWins, bWins, ties };
}

/* ------------------------------------------------------------------ */
/* Deterministic offline stand-ins (a real eval injects a model)       */
/* ------------------------------------------------------------------ */

const STOPWORDS = new Set([
  "about", "after", "again", "could", "there", "their", "where", "which",
  "would", "should", "still", "thing", "every", "needed", "month", "wrong",
  "never", "weeks", "three",
]);

/** First content word (≥5 chars, not a stopword) in the ticket, or "". */
export function firstKeyword(ticket: string): string {
  return (
    ticket
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .find((w) => w.length >= 5 && !STOPWORDS.has(w)) ?? ""
  );
}

/**
 * A ticket-aware judge: acknowledges_issue passes when the draft shares the
 * ticket's keyword; the rest by generic cue. Generalizes across the dataset
 * (unlike a fixed-keyword stub), so it stands in for an LLM judge offline.
 */
export const datasetJudge: RubricJudge = ({ ticket, draft, criterion }) => {
  const lower = draft.toLowerCase();
  let passed: boolean;
  switch (criterion.key) {
    case "acknowledges_issue": {
      const kw = firstKeyword(ticket);
      passed = kw !== "" && lower.includes(kw);
      break;
    }
    case "gives_next_step":
      passed = /\b(replace|replacement|refund|reset|ship|send|fix|correct)\b/.test(lower);
      break;
    case "states_timeline":
      passed = /\b(today|tomorrow|within|hours|by (?:end of|monday|tuesday|wednesday|thursday|friday))\b/.test(lower);
      break;
    case "has_signoff":
      // A sign-off is a closing word followed by a name, at the END of the reply
      // (not a "Thanks for reaching out" greeting at the start).
      passed = /(?:best|regards|sincerely|cheers|thank you),?\s+[a-z]+\.?\s*$/.test(lower);
      break;
    default:
      passed = false;
  }
  return {
    key: criterion.key,
    passed,
    evidence: passed ? `${criterion.key}: satisfied` : `${criterion.key}: missing`,
    suggestion: passed ? "ok" : `add: ${criterion.description}`,
  };
};

/** A strong, ticket-grounded reply (resolves) — a deterministic "good writer". */
export const templatedWriter: ReplyWriter = ({ ticket }) => {
  const kw = firstKeyword(ticket);
  const subject = kw ? `the trouble with your ${kw}` : "the trouble";
  return `Hi, I'm sorry about ${subject}. We'll send a replacement today and email you tracking. Best, Support`;
};

/** A weak, generic reply (fails) — the single-shot baseline writer. */
export const weakWriter: ReplyWriter = () =>
  "Thanks for reaching out. We appreciate your message.";

/** A fail-soft judge that blanket-fails with an error marker (infra failure). */
export const failSoftJudge: RubricJudge = ({ criterion }) => ({
  key: criterion.key,
  passed: false,
  evidence: "<error: credit balance too low to access the API>",
  suggestion: "n/a",
});
