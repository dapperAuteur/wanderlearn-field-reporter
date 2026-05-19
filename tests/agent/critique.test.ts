/**
 * Day 1 — graph wiring test.
 *
 * Proves the linear pipeline runs end to end:
 *   research → outline → write → critique(stub) → generate_image_prompts → END
 *
 * The four LLM nodes are mocked via the model factory (`@/agent/llm`), so this
 * test is offline, deterministic, free, and green in CI without an API key. The
 * stub critique makes no LLM call. Day 2 adds the real critique node, the cyclic
 * write→critique edge, and a separate termination test.
 */
import { describe, it, expect, vi } from "vitest";

vi.mock("@/agent/llm", () => {
  // Canned structured-output values, keyed by each node's `withStructuredOutput`
  // tool name. Declared INSIDE the factory — vitest hoists vi.mock above imports.
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
        {
          claim: "Demonstrations run daily.",
          source: "operator narration",
        },
      ],
    },
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

import { buildFieldReportGraph, MAX_REVISIONS } from "@/agent/graph";
import { RUBRIC_CRITERIA } from "@/agent/rubric";
import type { FieldReportState } from "@/agent/state";
import muchoCapture from "../fixtures/mucho-capture.json";

type CaptureInput = Pick<
  FieldReportState,
  "reportId" | "location" | "rawInput" | "targetAudience"
>;

describe("field-report graph — Day 1 linear pipeline", () => {
  it("exports MAX_REVISIONS = 3", () => {
    expect(MAX_REVISIONS).toBe(3);
  });

  it("runs research → outline → write → critique(stub) → images → END", async () => {
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

    // the stub critique passed and recorded exactly one revision
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
