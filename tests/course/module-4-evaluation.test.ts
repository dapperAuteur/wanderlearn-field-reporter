/**
 * Module 4 success signal — the runtime rubric reused as an offline eval.
 *
 * Deterministic, offline: the same `scoreAgainstRubric` the loop uses at runtime
 * is the evaluator here; deterministic stand-ins replace the model. Demonstrates
 * rubric reuse, the reflection loop beating single-shot (pairwise), thresholds
 * with margin, why ~10 examples catch a regression, and the loud-fail guard for
 * infrastructure errors (the witus-triage "fake 8%" bug).
 */
import { describe, it, expect } from "vitest";
import {
  supportReplyDataset,
  runEval,
  meetsThreshold,
  assertNoInfraErrors,
  pairwise,
  loopTarget,
  singleShotTarget,
  datasetJudge,
  templatedWriter,
  weakWriter,
  failSoftJudge,
  firstKeyword,
} from "../../examples/support-reply-loop/eval";

describe("Module 4 — the dataset is small but real", () => {
  it("has ~10 examples and one deliberately hard case", () => {
    expect(supportReplyDataset.length).toBe(10);
    // The 'dead' ticket has no content word ≥5 — the loop cannot acknowledge it.
    expect(firstKeyword("It will not turn on at all.")).toBe("");
    expect(firstKeyword("My blender arrived cracked.")).toBe("blender");
  });
});

describe("Module 4 — the runtime rubric IS the evaluator", () => {
  it("the reflection loop passes most of the dataset", async () => {
    const report = await runEval(supportReplyDataset, loopTarget(templatedWriter, datasetJudge), datasetJudge);
    // 9/10 — only the no-keyword 'dead' ticket can't be acknowledged.
    expect(report.passRate).toBeGreaterThanOrEqual(0.9);
    expect(report.results.find((r) => r.id === "dead")?.passed).toBe(false);
    expect(report.erroredCount).toBe(0);
  });

  it("single-shot fails the dataset", async () => {
    const report = await runEval(supportReplyDataset, singleShotTarget(weakWriter), datasetJudge);
    expect(report.passRate).toBeLessThanOrEqual(0.1);
  });
});

describe("Module 4 — pairwise: reflection beats single-shot", () => {
  it("the loop wins far more cases than the baseline", async () => {
    const loop = await runEval(supportReplyDataset, loopTarget(templatedWriter, datasetJudge), datasetJudge);
    const single = await runEval(supportReplyDataset, singleShotTarget(weakWriter), datasetJudge);
    const cmp = pairwise(loop, single);
    expect(cmp.aWins).toBeGreaterThanOrEqual(9);
    expect(cmp.bWins).toBe(0);
  });
});

describe("Module 4 — thresholds with margin", () => {
  it("a good system clears a margin-aware threshold, a bad one does not", async () => {
    const loop = await runEval(supportReplyDataset, loopTarget(templatedWriter, datasetJudge), datasetJudge);
    const single = await runEval(supportReplyDataset, singleShotTarget(weakWriter), datasetJudge);
    // Threshold 0.7, not 1.0 — leave room for judge noise (Lesson 30).
    expect(meetsThreshold(loop, 0.7)).toBe(true);
    expect(meetsThreshold(single, 0.7)).toBe(false);
  });
});

describe("Module 4 — a regression is caught by the small dataset", () => {
  it("swapping in the weak writer drops the pass rate below threshold", async () => {
    const good = await runEval(supportReplyDataset, loopTarget(templatedWriter, datasetJudge), datasetJudge);
    const regressed = await runEval(supportReplyDataset, loopTarget(weakWriter, datasetJudge), datasetJudge);
    expect(meetsThreshold(good, 0.7)).toBe(true);
    expect(meetsThreshold(regressed, 0.7)).toBe(false); // the regression is caught
  });
});

describe("Module 4 — infra errors fail loudly, never score (the witus-triage bug)", () => {
  it("an error-fallback judge poisons the run and assertNoInfraErrors throws", async () => {
    const report = await runEval(supportReplyDataset, loopTarget(templatedWriter, failSoftJudge), failSoftJudge);
    expect(report.erroredCount).toBeGreaterThan(0);
    expect(() => assertNoInfraErrors(report)).toThrow(/NOT a measurement/);
  });
  it("a healthy run passes the guard", async () => {
    const report = await runEval(supportReplyDataset, loopTarget(templatedWriter, datasetJudge), datasetJudge);
    expect(() => assertNoInfraErrors(report)).not.toThrow();
  });
});
