/**
 * End-to-end happy path.
 *
 * When the critique passes on the first try, the graph runs straight through:
 *   research → outline → write → critique → generate_image_prompts → END
 *
 * All five LLM nodes are mocked via the model factory (`@/agent/llm`), keyed by
 * each node's structured-output tool name — so the test is offline,
 * deterministic, and green in CI without an API key. The revise / escalate
 * branches of the reflection loop are covered in `termination.test.ts`.
 */
import { describe, it, expect, vi } from "vitest";

vi.mock("@/agent/llm", () => {
  const passingRubricScores = {
    has_clear_objectives: { pass: true, evidence: "Mock: objectives listed." },
    sections_tie_to_objectives: { pass: true, evidence: "Mock: sections tie in." },
    has_three_citations: { pass: true, evidence: "Mock: three sources cited." },
    has_hands_on_exercise: { pass: true, evidence: "Mock: exercise present." },
    reading_level_matches_audience: { pass: true, evidence: "Mock: level fits." },
    has_next_capture_appendix: { pass: true, evidence: "Mock: appendix present." },
  };

  // Canned structured output, keyed by each node's withStructuredOutput name.
  const cannedByName: Record<string, unknown> = {
    extract_research: {
      facts: [
        {
          claim:
            "MUCHO is housed in a restored early-1900s mansion in Colonia Juárez, Mexico City.",
          source: "operator narration",
        },
        {
          claim:
            "Mesoamerican civilizations cultivated cacao over 3,000 years ago and traded it as currency.",
          source: "museum placard",
        },
        {
          claim:
            "MUCHO runs daily bean-to-bar chocolate-making demonstrations in its courtyard kitchen.",
          source: "operator narration",
        },
      ],
      relatedCourses: ["wanderlearn/oaxaca-cacao-farms"],
    },
    draft_outline: {
      learningObjectives: [
        "Explain cacao's role in Mesoamerican economies and ritual.",
        "Describe how raw cacao becomes a finished chocolate bar.",
        "Identify what MUCHO's exhibits reveal about chocolate's history.",
      ],
      sections: [
        {
          heading: "Cacao as Sacred Currency",
          summary: "How Mesoamerican peoples valued and used cacao.",
          tiesToObjective: 1,
        },
        {
          heading: "From Bean to Bar",
          summary: "The roasting, grinding, and tempering process.",
          tiesToObjective: 2,
        },
        {
          heading: "Inside MUCHO",
          summary: "What the museum's galleries and kitchen reveal.",
          tiesToObjective: 3,
        },
      ],
    },
    write_lesson: {
      markdown:
        "# The Story of Chocolate at MUCHO\n\n## Learning objectives\n\n1. Explain cacao's role in Mesoamerican economies.\n2. Describe how raw cacao becomes a chocolate bar.\n3. Identify what MUCHO's exhibits reveal about chocolate history.\n",
      citations: [
        { claim: "Cacao was traded as currency.", source: "MUCHO exhibit text" },
        {
          claim: "MUCHO occupies a historic mansion.",
          source: "operator narration",
        },
        { claim: "Demonstrations run daily.", source: "operator narration" },
      ],
    },
    score_rubric: passingRubricScores,
    generate_image_prompts: {
      prompts: [
        "A sunlit colonial courtyard with cacao pods arranged on a stone metate.",
        "Close-up of roasted cacao beans being ground into glossy dark paste.",
      ],
    },
  };

  const makeModel = () => ({
    withStructuredOutput: (_schema: unknown, opts: { name: string }) => ({
      invoke: async () => cannedByName[opts.name],
    }),
  });

  return {
    SONNET_MODEL: "claude-sonnet-4-6",
    getChatModel: vi.fn(() => makeModel()),
  };
});

// The research node calls the Day-3 tools — stub them so the graph test stays
// hermetic; the mocked LLM supplies research's output regardless.
vi.mock("@/agent/tools/webSearch", () => ({
  MAX_WEB_SEARCHES_PER_RUN: 5,
  webSearch: vi.fn(async () => []),
}));
vi.mock("@/agent/tools/cloudinaryMetadata", () => ({
  cloudinaryMetadata: vi.fn(async () => ({
    imageId: "mock",
    tags: [],
    capturedAt: null,
    dimensions: { width: 0, height: 0 },
  })),
}));
vi.mock("@/agent/tools/existingWanderlearnCourses", () => ({
  existingWanderlearnCourses: vi.fn(async () => []),
}));

import { buildFieldReportGraph, MAX_REVISIONS } from "@/agent/graph";
import { RUBRIC_CRITERIA } from "@/agent/rubric";
import type { FieldReportState } from "@/agent/state";
import muchoCapture from "../fixtures/mucho-capture.json";

type CaptureInput = Pick<
  FieldReportState,
  "reportId" | "location" | "rawInput" | "targetAudience"
>;

describe("field-report graph — end-to-end happy path", () => {
  it("exports MAX_REVISIONS = 3", () => {
    expect(MAX_REVISIONS).toBe(3);
  });

  it("runs research → outline → write → critique → images → END when the rubric passes", async () => {
    const graph = buildFieldReportGraph();
    const result = (await graph.invoke(
      muchoCapture as CaptureInput,
    )) as FieldReportState;

    // research + outline produced
    expect(result.research?.facts.length ?? 0).toBeGreaterThan(0);
    expect(result.outline?.learningObjectives.length ?? 0).toBeGreaterThanOrEqual(
      3,
    );

    // write produced the first draft
    expect(result.draft?.revisionNumber).toBe(1);
    expect(result.draft?.markdown).toContain("#");

    // the critique passed first try and recorded exactly one revision
    expect(result.critique?.passed).toBe(true);
    expect(result.revisionHistory).toHaveLength(1);
    expect(Object.keys(result.critique?.rubricScores ?? {}).sort()).toEqual(
      [...RUBRIC_CRITERIA].sort(),
    );

    // the terminal node produced image prompts + the final markdown
    expect(result.imagePrompts?.length ?? 0).toBeGreaterThan(0);
    expect(result.finalMarkdown).toBe(result.draft?.markdown);
    expect(result.flaggedForHumanReview).toBe(false);
  });
});
