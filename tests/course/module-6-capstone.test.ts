/**
 * Module 6 success signal — the CAPSTONE: the whole stack on a new domain, plus a
 * programmatic transfer test to a THIRD domain.
 *
 * Deterministic, offline. The capstone reuses the generic engine (M1 router, M2
 * scorer, M4 eval comparisons, M5 metrics) on legal-clause → plain-language; the
 * transfer test reuses just the scorer on commit messages — a domain in neither
 * the course nor the capstone — to prove the pattern carries without the notes.
 */
import { describe, it, expect } from "vitest";
import {
  plainLanguageDataset,
  plainLanguageRubric,
  loopTarget,
  singleShotTarget,
  plainRewriter,
  echoRewriter,
  plainLanguageJudge,
  failSoftJudge,
  runCapstoneEval,
  runCapstoneProduction,
} from "../../examples/capstone-plain-language/index";
import { pairwise, meetsThreshold, assertNoInfraErrors } from "../../examples/support-reply-loop/eval";
import { computeMetrics, paretoFrontier } from "../../examples/support-reply-loop/production";
import {
  scoreAgainstRubric,
  type RubricCriterion,
  type RubricJudge,
} from "../../examples/support-reply-loop/rubric";

describe("Capstone — the full stack runs on legal → plain language", () => {
  it("the loop rewrites most clauses to plain language", async () => {
    const report = await runCapstoneEval(
      plainLanguageDataset,
      loopTarget(plainRewriter, plainLanguageJudge),
      plainLanguageJudge,
    );
    expect(report.passRate).toBeGreaterThanOrEqual(0.9); // 11/12
    // The legalese-saturated clause can't be made plain by a naive rewrite.
    expect(report.results.find((r) => r.id === "remittance")?.passed).toBe(false);
    expect(report.erroredCount).toBe(0);
  });

  it("beats the single-shot baseline (pairwise)", async () => {
    const loop = await runCapstoneEval(plainLanguageDataset, loopTarget(plainRewriter, plainLanguageJudge), plainLanguageJudge);
    const single = await runCapstoneEval(plainLanguageDataset, singleShotTarget(echoRewriter), plainLanguageJudge);
    const cmp = pairwise(loop, single);
    expect(cmp.aWins).toBeGreaterThanOrEqual(11);
    expect(cmp.bWins).toBe(0);
    expect(meetsThreshold(loop, 0.7)).toBe(true);
    expect(meetsThreshold(single, 0.7)).toBe(false);
  });

  it("reuses M5 production metrics unchanged", async () => {
    const records = await runCapstoneProduction(plainLanguageDataset, plainRewriter, plainLanguageJudge);
    const m = computeMetrics(records, plainLanguageRubric.length);
    expect(m.convergenceRate).toBeGreaterThanOrEqual(0.9);
    expect(Number.isFinite(m.costPerConvergedOutput)).toBe(true);
  });

  it("reuses the Pareto frontier unchanged", () => {
    const points = [
      { label: "single-shot", quality: 0.0, cost: 1 },
      { label: "loop-cap-1", quality: 0.92, cost: 2 },
      { label: "loop-cap-3", quality: 0.92, cost: 4 }, // dominated
    ];
    expect(paretoFrontier(points).map((p) => p.label).sort()).toEqual(["loop-cap-1", "single-shot"]);
  });

  it("fails loudly on an infrastructure error (the M3/M4 guard carries over)", async () => {
    const report = await runCapstoneEval(plainLanguageDataset, loopTarget(plainRewriter, failSoftJudge), failSoftJudge);
    expect(report.erroredCount).toBeGreaterThan(0);
    expect(() => assertNoInfraErrors(report)).toThrow(/NOT a measurement/);
  });
});

describe("Transfer test — a THIRD domain (commit messages), reusing only the scorer", () => {
  // A brand-new rubric for a domain in neither the course nor the capstone.
  const commitRubric: RubricCriterion[] = [
    { key: "summary_line", description: "Starts with a concise summary line.", weight: 1 },
    { key: "imperative_mood", description: "Uses imperative mood (Add/Fix/Remove).", weight: 1 },
    { key: "explains_why", description: "Says why the change was made.", weight: 1 },
  ];
  const commitJudge: RubricJudge = ({ draft, criterion }) => {
    const lower = draft.toLowerCase();
    const firstLine = draft.split("\n")[0] ?? "";
    let passed: boolean;
    switch (criterion.key) {
      case "summary_line": passed = firstLine.length > 0 && firstLine.length <= 72; break;
      case "imperative_mood": passed = /^(add|fix|remove|update|refactor|rename)\b/i.test(firstLine); break;
      case "explains_why": passed = /\b(because|to |so that|prevents?|avoids?)\b/.test(lower); break;
      default: passed = false;
    }
    return { key: criterion.key, passed, evidence: passed ? "ok" : "missing", suggestion: "fix it" };
  };

  it("the SAME scoreAgainstRubric passes a good commit and fails a bad one", async () => {
    const good = "Fix null deref in auth refresh\n\nThe token cache returned undefined after expiry, so refresh now guards it to prevent a crash.";
    const bad = "stuff";
    const goodCritique = await scoreAgainstRubric(commitJudge, "n/a", good, 0, commitRubric);
    const badCritique = await scoreAgainstRubric(commitJudge, "n/a", bad, 0, commitRubric);
    expect(goodCritique.passed).toBe(true);
    expect(badCritique.passed).toBe(false);
  });
});
