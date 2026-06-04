/**
 * CAPSTONE — the whole reflection-loop stack on a NEW domain.
 *
 * Modules 0–5 were built on customer-support replies. The capstone proves the
 * pattern transfers by running the EXACT SAME machinery on a domain it never saw:
 * rewriting dense legal / regulatory clauses into plain language. The only new
 * code here is domain-specific data — a rubric, a corpus, and offline stand-ins.
 * Everything structural is imported and reused:
 *
 *   - the rubric scorer + pass rule ........ scoreAgainstRubric, applyPassRule (M2)
 *   - the bounded termination router ....... routeWithAllPatterns, state (M1)
 *   - the eval comparisons ................. pairwise, meetsThreshold, assertNoInfraErrors (M4)
 *   - the production metrics ............... computeMetrics, paretoFrontier, runCost (M5)
 *
 * That import list IS the transfer: write a new rubric + dataset, reuse the engine.
 *
 * Corpus note: the `recovery` clause is verbatim from the U.S. federal
 * plain-language materials (public domain; Plain Language Action and Information
 * Network). The other dense clauses are author-written in that same public-domain
 * federal/legal register — no licensing required. See `## Sources` in
 * docs/course/module-6-capstone/README.md.
 */
import { StateGraph, START, END } from "@langchain/langgraph";
import type { ReplyWriter, ReplyCritique } from "../support-reply-loop/graph";
import {
  scoreAgainstRubric,
  type RubricCriterion,
  type RubricJudge,
} from "../support-reply-loop/rubric";
import {
  TerminatingReplyStateAnnotation,
  routeWithAllPatterns,
  type TerminatingReplyState,
} from "../support-reply-loop/termination";
import {
  looksLikeErrorFallback,
  type EvalReport,
  type CaseResult,
} from "../support-reply-loop/eval";
import type { RunRecord } from "../support-reply-loop/production";

/* ------------------------------------------------------------------ */
/* The NEW domain rubric (the transfer of Module 2's craft)            */
/* ------------------------------------------------------------------ */

export const plainLanguageRubric: RubricCriterion[] = [
  {
    key: "preserves_obligation",
    description: "Keeps the core obligation or action of the original clause.",
    weight: 1,
  },
  {
    key: "plain_language",
    description: "Uses short sentences a non-lawyer can read.",
    weight: 1,
  },
  {
    key: "no_legalese",
    description: "Contains no legalese (shall, herein, pursuant, etc.).",
    weight: 1,
  },
  {
    key: "direct_address",
    description: "Addresses the reader directly as 'you'.",
    weight: 0.5,
  },
];

/* ------------------------------------------------------------------ */
/* The corpus (~12 dense clauses; one verbatim public-domain anchor)   */
/* ------------------------------------------------------------------ */

export interface ClauseExample {
  id: string;
  clause: string;
}

export const plainLanguageDataset: ClauseExample[] = [
  // Verbatim, public domain (U.S. PLAIN / plainlanguage.gov before-and-after).
  {
    id: "recovery",
    clause:
      "When the process of freeing a vehicle that has been stuck results in ruts or holes, the operator will fill the rut or hole created by such activity before removing the vehicle from the immediate area.",
  },
  // Author-written in the public-domain federal/legal register:
  { id: "excavation", clause: "Applicants must, prior to the commencement of any excavation activity, obtain written authorization from the Administrator." },
  { id: "repair", clause: "Regardless of any other provision, the lessee remains liable for all damages occasioned by the lessee's failure to maintain the premises in good repair." },
  { id: "permit", clause: "No person may operate a watercraft within the designated area unless that person has first secured a permit issued in accordance with the requirements enumerated below." },
  { id: "interest", clause: "In the event that payment is not received within thirty days of the invoice date, interest accrues on the outstanding balance at the rate prescribed by applicable law." },
  { id: "records", clause: "Each participant must, upon request and without undue delay, furnish to the Department such records as the Department deems necessary to ascertain compliance." },
  { id: "survival", clause: "Termination of this agreement does not relieve either party of any obligation that, by its nature, is intended to survive such termination." },
  { id: "funds", clause: "The grantee must ensure that all funds disbursed under this award are expended solely for the purposes for which they were appropriated." },
  { id: "appeal", clause: "Any individual aggrieved by a determination made under this subsection may, within sixty days, file a written request for reconsideration." },
  { id: "subcontract", clause: "Vendors are prohibited from subcontracting any portion of the work without the prior written consent of the contracting officer, which consent will not be unreasonably withheld." },
  { id: "inspection", clause: "The licensee must permit inspection of the facility by authorized personnel during normal business hours upon presentation of appropriate credentials." },
  // The deliberately hard case: legalese-saturated, so a naive rewrite keeps a legalese term.
  { id: "remittance", clause: "Pursuant hereto, remittance shall be tendered forthwith." },
];

/* ------------------------------------------------------------------ */
/* Deterministic offline stand-ins (a real run injects a model)        */
/* ------------------------------------------------------------------ */

const LEGALESE = [
  "shall", "herein", "pursuant", "notwithstanding", "aforementioned",
  "heretofore", "hereto", "forthwith", "thereof", "whereas", "hereby",
  "indemnify", "occasioned",
];
const KEYWORD_STOPWORDS = new Set([
  "which", "their", "there", "where", "under", "within", "prior", "after",
  "before", "other", "those", "these", "shall", "without", "personnel",
]);

/** First content word (≥5, not a basic stopword) — note: legalese CAN be picked,
 * which is exactly how the `remittance` clause trips `no_legalese`. */
export function clauseKeyword(clause: string): string {
  return (
    clause
      .toLowerCase()
      .replace(/[^a-z\s]/g, " ")
      .split(/\s+/)
      .find((w) => w.length >= 5 && !KEYWORD_STOPWORDS.has(w)) ?? ""
  );
}

function longestSentenceWordCount(text: string): number {
  return Math.max(
    ...text.split(/[.!?]+/).map((s) => s.trim().split(/\s+/).filter(Boolean).length),
    0,
  );
}

/** Ticket-aware judge for plain-language rewrites; generalizes across the corpus. */
export const plainLanguageJudge: RubricJudge = ({ ticket, draft, criterion }) => {
  const lower = draft.toLowerCase();
  let passed: boolean;
  switch (criterion.key) {
    case "preserves_obligation": {
      const kw = clauseKeyword(ticket);
      passed = kw !== "" && lower.includes(kw);
      break;
    }
    case "plain_language":
      passed = longestSentenceWordCount(draft) <= 14 && draft.length < 200;
      break;
    case "no_legalese":
      passed = !LEGALESE.some((w) => new RegExp(`\\b${w}\\b`).test(lower));
      break;
    case "direct_address":
      passed = /\byou\b/.test(lower);
      break;
    default:
      passed = false;
  }
  return {
    key: criterion.key,
    passed,
    evidence: passed ? `${criterion.key}: satisfied` : `${criterion.key}: missing`,
    suggestion: passed ? "ok" : `fix: ${criterion.description}`,
  };
};

/** A plain rewrite that echoes the clause's keyword (good — unless the keyword is legalese). */
export const plainRewriter: ReplyWriter = ({ ticket }) => {
  const kw = clauseKeyword(ticket);
  const subject = kw ? `the ${kw}` : "this";
  return `In plain terms, you must handle ${subject}. This rule applies to you.`;
};

/** The single-shot baseline: echo the dense clause unchanged (legalese, long). */
export const echoRewriter: ReplyWriter = ({ ticket }) => ticket;

/** Fail-soft judge (blanket-fails with an error marker) — the infra-failure case. */
export const failSoftJudge: RubricJudge = ({ criterion }) => ({
  key: criterion.key,
  passed: false,
  evidence: "<error: credit balance too low to access the API>",
  suggestion: "n/a",
});

/* ------------------------------------------------------------------ */
/* The capstone loop — reuses M1's router + M2's scorer, new rubric    */
/* ------------------------------------------------------------------ */

export function buildPlainLanguageLoop(writer: ReplyWriter, judge: RubricJudge) {
  async function writeRewrite(state: TerminatingReplyState) {
    const draft = await writer({
      ticket: state.ticket,
      draft: state.draft,
      critique: state.critique,
    });
    const revisionNumber = state.revisionNumber + 1;
    return { draft, revisionNumber, history: [{ revisionNumber, draft }] };
  }
  async function critiqueRewrite(state: TerminatingReplyState) {
    const critique = await scoreAgainstRubric(
      judge,
      state.ticket,
      state.draft ?? "",
      state.revisionNumber,
      plainLanguageRubric,
    );
    return { critique };
  }
  return new StateGraph(TerminatingReplyStateAnnotation)
    .addNode("write_reply", writeRewrite)
    .addNode("critique_reply", critiqueRewrite)
    .addNode("mark_resolved", () => ({ outcome: "resolved" as const }))
    .addNode("flag_for_human", () => ({ escalated: true, outcome: "escalated" as const }))
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

/* ------------------------------------------------------------------ */
/* Domain targets + evaluator (thin wrappers over the generic scorer)  */
/* ------------------------------------------------------------------ */

export type RewriteTarget = (clause: string) => Promise<string>;

export function loopTarget(writer: ReplyWriter, judge: RubricJudge): RewriteTarget {
  return async (clause) => {
    const graph = buildPlainLanguageLoop(writer, judge);
    const state = (await graph.invoke({ ticket: clause })) as TerminatingReplyState;
    return state.draft ?? "";
  };
}

export function singleShotTarget(writer: ReplyWriter): RewriteTarget {
  return async (clause) => writer({ ticket: clause });
}

async function evaluateRewrite(
  judge: RubricJudge,
  clause: string,
  draft: string,
): Promise<{ passed: boolean; errored: boolean }> {
  const critique: ReplyCritique = await scoreAgainstRubric(
    judge,
    clause,
    draft,
    0,
    plainLanguageRubric,
  );
  return { passed: critique.passed, errored: looksLikeErrorFallback(critique) };
}

/** Run records for the capstone loop — feeds M5's `computeMetrics` unchanged. */
export async function runCapstoneProduction(
  dataset: ClauseExample[],
  writer: ReplyWriter,
  judge: RubricJudge,
): Promise<RunRecord[]> {
  const records: RunRecord[] = [];
  for (const example of dataset) {
    const graph = buildPlainLanguageLoop(writer, judge);
    const state = (await graph.invoke({ ticket: example.clause })) as TerminatingReplyState;
    records.push({
      id: example.id,
      outcome: state.outcome ?? "escalated",
      revisions: state.revisionNumber,
    });
  }
  return records;
}

/** Run the capstone eval — same EvalReport shape M4/M5 helpers consume. */
export async function runCapstoneEval(
  dataset: ClauseExample[],
  target: RewriteTarget,
  judge: RubricJudge,
): Promise<EvalReport> {
  const results: CaseResult[] = [];
  for (const example of dataset) {
    const draft = await target(example.clause);
    const { passed, errored } = await evaluateRewrite(judge, example.clause, draft);
    results.push({ id: example.id, passed, errored });
  }
  return {
    results,
    passRate: results.filter((r) => r.passed).length / results.length,
    erroredCount: results.filter((r) => r.errored).length,
  };
}
