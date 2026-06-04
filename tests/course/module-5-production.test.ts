/**
 * Module 5 success signal — keeping the loop honest in production.
 *
 * Deterministic, offline. Computes production metrics from run records the loop
 * produces, fires alerts on runaway/low-convergence/cost, runs the single-pass-
 * good-enough check, A/B-compares critic models, and finds the cost-quality Pareto
 * frontier — all with the Module 4 deterministic stand-ins.
 */
import { describe, it, expect } from "vitest";
import {
  runCost,
  runProduction,
  computeMetrics,
  checkAlerts,
  singlePassGoodEnough,
  abCompare,
  paretoFrontier,
} from "../../examples/support-reply-loop/production";
import {
  supportReplyDataset,
  runEval,
  singleShotTarget,
  loopTarget,
  templatedWriter,
  weakWriter,
  datasetJudge,
  failSoftJudge,
} from "../../examples/support-reply-loop/eval";
import type { ReplyWriter } from "../../examples/support-reply-loop/graph";

/** Always-different, never-passing writer → hits the hard cap (runaway). */
const runawayWriter: ReplyWriter = ({ critique }) =>
  `Thanks for reaching out (attempt ${(critique?.revisionNumber ?? 0) + 1}).`;

describe("Module 5 — cost accounting per iteration", () => {
  it("prices a run by revisions × (write + critique-per-criterion)", () => {
    // 2 revisions, 4 criteria, default model: 2 × (1 + 4×0.25) = 4
    expect(runCost(2, 4)).toBe(4);
    expect(runCost(1, 4)).toBe(2);
  });
});

describe("Module 5 — online metrics", () => {
  it("computes convergence, iterations, and cost-per-converged-output", async () => {
    const records = await runProduction(supportReplyDataset, templatedWriter, datasetJudge);
    const m = computeMetrics(records);
    expect(m.convergenceRate).toBeCloseTo(0.9, 5); // 9/10
    expect(m.escalationRate).toBeCloseTo(0.1, 5);
    expect(m.runawayCount).toBe(0); // the 'dead' case escalates by convergence at rev 2, not the cap
    expect(m.avgIterations).toBeCloseTo(1.1, 5); // nine 1-pass + one 2-pass
    expect(Number.isFinite(m.costPerConvergedOutput)).toBe(true);
  });
});

describe("Module 5 — alerts on runaway loops", () => {
  it("fires low-convergence + runaway when the loop never resolves", async () => {
    const records = await runProduction(supportReplyDataset, runawayWriter, datasetJudge);
    const m = computeMetrics(records);
    expect(m.convergenceRate).toBe(0);
    expect(m.runawayCount).toBe(supportReplyDataset.length);
    const alerts = checkAlerts(m, {
      minConvergenceRate: 0.8,
      maxRunawayCount: 0,
      maxCostPerConvergedOutput: 100,
    });
    // Zero convergence ⇒ cost-per-converged is Infinity, so the cost alert fires too.
    expect(alerts.map((a) => a.kind).sort()).toEqual(["cost", "low-convergence", "runaway"]);
  });

  it("stays quiet on a healthy run", async () => {
    const records = await runProduction(supportReplyDataset, templatedWriter, datasetJudge);
    const m = computeMetrics(records);
    const alerts = checkAlerts(m, {
      minConvergenceRate: 0.8,
      maxRunawayCount: 0,
      maxCostPerConvergedOutput: 100,
    });
    expect(alerts).toEqual([]);
  });
});

describe("Module 5 — the single-pass-good-enough check", () => {
  it("says LOOP when single-shot fails, and DON'T LOOP when it already passes", async () => {
    const weakSingle = await runEval(supportReplyDataset, singleShotTarget(weakWriter), datasetJudge);
    expect(singlePassGoodEnough(weakSingle, 0.8)).toBe(false); // must loop

    const goodSingle = await runEval(supportReplyDataset, singleShotTarget(templatedWriter), datasetJudge);
    expect(singlePassGoodEnough(goodSingle, 0.8)).toBe(true); // single pass already clears it — skip the loop
  });
});

describe("Module 5 — A/B testing critic models", () => {
  it("picks the critic that produces the better pass rate", async () => {
    const withGood = await runEval(supportReplyDataset, loopTarget(templatedWriter, datasetJudge), datasetJudge);
    const withBroken = await runEval(supportReplyDataset, loopTarget(templatedWriter, failSoftJudge), failSoftJudge);
    const ab = abCompare(withGood, withBroken);
    expect(ab.winner).toBe("A");
    expect(ab.aPassRate).toBeGreaterThan(ab.bPassRate);
  });
});

describe("Module 5 — cost-quality Pareto frontier", () => {
  it("keeps the non-dominated configs and drops the dominated one", () => {
    const points = [
      { label: "single-shot", quality: 0.1, cost: 1 },
      { label: "loop-cap-1", quality: 0.9, cost: 2 },
      { label: "loop-cap-3", quality: 0.9, cost: 4 }, // dominated by loop-cap-1
    ];
    const frontier = paretoFrontier(points).map((p) => p.label).sort();
    expect(frontier).toEqual(["loop-cap-1", "single-shot"]);
  });
});
