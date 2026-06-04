/**
 * Module 5 runnable artifact — keeping the loop honest in production.
 *
 * The loop works (M0), terminates (M1), is well-judged (M2), debuggable (M3), and
 * regression-tested (M4). Production asks the economic questions: is it converging,
 * is it running away, what does it cost per good output, is a single pass already
 * good enough, and which critic model is worth paying for? Every metric here is
 * computed from run records the loop already produces — offline and deterministic.
 *
 * The thesis: reflection is a BUDGET ALLOCATION, not a magic wand. Each revision
 * is real money, so you spend it only where the pairwise margin (M4) says it pays.
 */
import type { ReplyWriter } from "./graph";
import {
  buildRubricReplyLoop,
  supportReplyRubric,
  type RubricJudge,
} from "./rubric";
import { MAX_REVISIONS } from "./graph";
import type { TerminatingReplyState } from "./termination";
import type { EvalExample, EvalReport } from "./eval";

/* ------------------------------------------------------------------ */
/* Cost accounting per iteration                                       */
/* ------------------------------------------------------------------ */

/** Relative cost of the calls one revision makes (units are "model calls"). */
export interface CostModel {
  writeCallCost: number;
  critiqueCallCostPerCriterion: number;
}

export const defaultCostModel: CostModel = {
  writeCallCost: 1,
  critiqueCallCostPerCriterion: 0.25,
};

/**
 * Cost of one run: each revision is one write call plus one critique call per
 * criterion. This is the per-iteration accounting Module 5 is built on — every
 * revision has a price, so more revisions is literally more money.
 */
export function runCost(
  revisions: number,
  criteriaCount: number,
  model: CostModel = defaultCostModel,
): number {
  return revisions * (model.writeCallCost + criteriaCount * model.critiqueCallCostPerCriterion);
}

/* ------------------------------------------------------------------ */
/* Run records + online metrics                                        */
/* ------------------------------------------------------------------ */

export interface RunRecord {
  id: string;
  outcome: "resolved" | "escalated";
  revisions: number;
}

/** Run the loop over a dataset and record each run's outcome + revision count. */
export async function runProduction(
  dataset: EvalExample[],
  writer: ReplyWriter,
  judge: RubricJudge,
): Promise<RunRecord[]> {
  const records: RunRecord[] = [];
  for (const example of dataset) {
    const graph = buildRubricReplyLoop(writer, judge);
    const state = (await graph.invoke({ ticket: example.ticket })) as TerminatingReplyState;
    records.push({
      id: example.id,
      outcome: state.outcome ?? "escalated",
      revisions: state.revisionNumber,
    });
  }
  return records;
}

export interface ProductionMetrics {
  total: number;
  /** Fraction of runs that resolved (passed) — the headline health metric. */
  convergenceRate: number;
  escalationRate: number;
  avgIterations: number;
  /** Runs that hit the hard cap unresolved — the runaway signal. */
  runawayCount: number;
  /** Total cost divided by resolved runs — the metric that actually matters. */
  costPerConvergedOutput: number;
}

/**
 * Aggregate run records into the metrics you put on a dashboard. The one to watch
 * is cost-per-converged-output: total spend divided by GOOD outputs, so a loop that
 * burns revisions to escalate looks as expensive as it really is.
 */
export function computeMetrics(
  records: RunRecord[],
  criteriaCount: number = supportReplyRubric.length,
  maxRevisions: number = MAX_REVISIONS,
  model: CostModel = defaultCostModel,
): ProductionMetrics {
  const total = records.length;
  const resolved = records.filter((r) => r.outcome === "resolved").length;
  const totalCost = records.reduce(
    (sum, r) => sum + runCost(r.revisions, criteriaCount, model),
    0,
  );
  const runawayCount = records.filter(
    (r) => r.outcome === "escalated" && r.revisions >= maxRevisions,
  ).length;
  return {
    total,
    convergenceRate: total ? resolved / total : 0,
    escalationRate: total ? (total - resolved) / total : 0,
    avgIterations: total ? records.reduce((s, r) => s + r.revisions, 0) / total : 0,
    runawayCount,
    costPerConvergedOutput: resolved ? totalCost / resolved : Infinity,
  };
}

/* ------------------------------------------------------------------ */
/* Alerts on runaway loops                                             */
/* ------------------------------------------------------------------ */

export interface AlertThresholds {
  minConvergenceRate: number;
  maxRunawayCount: number;
  maxCostPerConvergedOutput: number;
}

export interface Alert {
  kind: "low-convergence" | "runaway" | "cost";
  message: string;
}

/** Fire alerts when production metrics cross their thresholds. */
export function checkAlerts(
  metrics: ProductionMetrics,
  thresholds: AlertThresholds,
): Alert[] {
  const alerts: Alert[] = [];
  if (metrics.convergenceRate < thresholds.minConvergenceRate) {
    alerts.push({
      kind: "low-convergence",
      message: `convergence ${(metrics.convergenceRate * 100).toFixed(0)}% below ${(thresholds.minConvergenceRate * 100).toFixed(0)}%`,
    });
  }
  if (metrics.runawayCount > thresholds.maxRunawayCount) {
    alerts.push({
      kind: "runaway",
      message: `${metrics.runawayCount} runaway run(s) exceed ${thresholds.maxRunawayCount}`,
    });
  }
  if (metrics.costPerConvergedOutput > thresholds.maxCostPerConvergedOutput) {
    alerts.push({
      kind: "cost",
      message: `cost/converged ${metrics.costPerConvergedOutput.toFixed(1)} exceeds ${thresholds.maxCostPerConvergedOutput}`,
    });
  }
  return alerts;
}

/* ------------------------------------------------------------------ */
/* The "single-pass good enough?" check                                */
/* ------------------------------------------------------------------ */

/**
 * Before looping at all, ask whether a single pass already clears the bar. If the
 * single-shot pass rate meets the threshold, the loop's extra cost buys nothing —
 * ship single-shot. This is the cheapest possible win: not looping.
 */
export function singlePassGoodEnough(
  singleShotReport: EvalReport,
  threshold: number,
): boolean {
  return singleShotReport.passRate >= threshold;
}

/* ------------------------------------------------------------------ */
/* A/B testing critic models                                           */
/* ------------------------------------------------------------------ */

export interface ABResult {
  aPassRate: number;
  bPassRate: number;
  winner: "A" | "B" | "tie";
}

/**
 * Compare two critic models (judges) by the pass rate they produce on the same
 * dataset. A more expensive critic is only worth it if it wins by enough to
 * justify the cost — quality first, then weigh against price.
 */
export function abCompare(a: EvalReport, b: EvalReport): ABResult {
  let winner: "A" | "B" | "tie" = "tie";
  if (a.passRate > b.passRate) winner = "A";
  else if (b.passRate > a.passRate) winner = "B";
  return { aPassRate: a.passRate, bPassRate: b.passRate, winner };
}

/* ------------------------------------------------------------------ */
/* Cost–quality Pareto                                                 */
/* ------------------------------------------------------------------ */

export interface ParetoPoint {
  label: string;
  quality: number; // e.g. convergence rate / pass rate
  cost: number; // e.g. cost per converged output
}

/**
 * The Pareto frontier: the configurations that are NOT dominated — no other
 * config is both at-least-as-good in quality AND at-least-as-cheap (and strictly
 * better on one axis). These are the only configs worth considering; everything
 * else is strictly beaten on both quality and cost.
 */
export function paretoFrontier(points: ParetoPoint[]): ParetoPoint[] {
  return points.filter(
    (p) =>
      !points.some(
        (q) =>
          q !== p &&
          q.quality >= p.quality &&
          q.cost <= p.cost &&
          (q.quality > p.quality || q.cost < p.cost),
      ),
  );
}
