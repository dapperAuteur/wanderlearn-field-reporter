/**
 * Reflection-loop termination.
 *
 * Exercises the cyclic write→critique edge and its two non-happy outcomes:
 *   1. the rubric keeps failing → the loop stops at MAX_REVISIONS and the run
 *      is flagged for a human (the agent never loops forever);
 *   2. the rubric fails once, then passes → the agent revises and completes.
 *
 * `score_rubric` is mocked through a queue (`mock.critiqueOutcomes`) so each
 * test scripts the critique result per iteration; the other LLM nodes return
 * static canned output. Offline, deterministic, no API key required.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

const mock = vi.hoisted(() => ({
  /** One entry per critique call: true = rubric passes, false = fails. */
  critiqueOutcomes: [] as boolean[],
}));

vi.mock("@/agent/llm", () => {
  const RUBRIC_KEYS = [
    "has_clear_objectives",
    "sections_tie_to_objectives",
    "has_three_citations",
    "has_hands_on_exercise",
    "reading_level_matches_audience",
    "has_next_capture_appendix",
  ];
  const rubricScores = (pass: boolean) =>
    Object.fromEntries(
      RUBRIC_KEYS.map((key) => [
        key,
        {
          pass,
          evidence: pass
            ? "Mock: criterion satisfied."
            : "Mock: criterion not satisfied.",
          suggestion: pass ? undefined : "Mock: address this on the next revision.",
        },
      ]),
    );

  const canned: Record<string, () => unknown> = {
    extract_research: () => ({
      facts: [{ claim: "Mock fact about the location.", source: "mock source" }],
      relatedCourses: [],
    }),
    draft_outline: () => ({
      learningObjectives: ["Objective A", "Objective B", "Objective C"],
      sections: [
        { heading: "Section", summary: "A mock section.", tiesToObjective: 1 },
      ],
    }),
    write_lesson: () => ({
      markdown: "# Mock lesson\n\nMock body.\n",
      citations: [{ claim: "Mock claim.", source: "mock source" }],
    }),
    generate_image_prompts: () => ({ prompts: ["A mock illustrative image."] }),
    // Each call consumes one scripted outcome; defaults to pass once drained.
    score_rubric: () => rubricScores(mock.critiqueOutcomes.shift() ?? true),
  };

  const model = {
    withStructuredOutput: (_schema: unknown, opts: { name: string }) => ({
      invoke: async () => canned[opts.name](),
    }),
  };

  return {
    SONNET_MODEL: "claude-sonnet-4-6",
    getChatModel: vi.fn(() => model),
  };
});

import { buildFieldReportGraph, MAX_REVISIONS } from "@/agent/graph";
import type { FieldReportState } from "@/agent/state";
import muchoCapture from "../fixtures/mucho-capture.json";

type CaptureInput = Pick<
  FieldReportState,
  "reportId" | "location" | "rawInput" | "targetAudience"
>;

async function runGraph(): Promise<FieldReportState> {
  return (await buildFieldReportGraph().invoke(
    muchoCapture as CaptureInput,
  )) as FieldReportState;
}

describe("field-report graph — reflection-loop termination", () => {
  beforeEach(() => {
    mock.critiqueOutcomes = [];
  });

  it("stops at MAX_REVISIONS failed critiques and flags for human review", async () => {
    // Critique fails every time — more outcomes queued than the loop can use.
    mock.critiqueOutcomes = Array<boolean>(MAX_REVISIONS + 3).fill(false);

    const result = await runGraph();

    expect(result.flaggedForHumanReview).toBe(true);
    expect(result.critique?.passed).toBe(false);
    expect(result.critique?.revisionNumber).toBe(MAX_REVISIONS);
    expect(result.draft?.revisionNumber).toBe(MAX_REVISIONS);
    // critique ran exactly MAX_REVISIONS times — the loop is bounded.
    expect(result.revisionHistory).toHaveLength(MAX_REVISIONS);
    // the image step is never reached on the escalation path.
    expect(result.imagePrompts).toBeUndefined();
    expect(result.finalMarkdown).toBe(result.draft?.markdown);
  });

  it("revises once, then completes when the rubric passes", async () => {
    mock.critiqueOutcomes = [false, true]; // fail revision 1, pass revision 2

    const result = await runGraph();

    expect(result.draft?.revisionNumber).toBe(2);
    expect(result.revisionHistory).toHaveLength(2);
    expect(result.critique?.passed).toBe(true);
    expect(result.flaggedForHumanReview).toBe(false);
    expect(result.imagePrompts?.length ?? 0).toBeGreaterThan(0);
    expect(result.finalMarkdown).toBe(result.draft?.markdown);
  });
});
