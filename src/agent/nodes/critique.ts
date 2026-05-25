/**
 * `critique` node — scores the current draft against the rubric.
 *
 * One structured-output LLM call produces a RubricScore for every criterion in
 * rubric.ts. The rubric is the single source of truth: the criterion names,
 * descriptions, and weights are read from there, never duplicated here. After
 * scoring, `isPassing` applies the §7 pass rule (all weight-1 criteria pass).
 * The node writes `critique` and appends a `revisionHistory` entry; the
 * conditional edge in graph.ts reads `critique` to route revise / done /
 * escalate.
 *
 * Pure and fail-soft: on any error the draft is scored as failing, with the
 * error surfaced as evidence, so the reflection loop escalates to a human after
 * MAX_REVISIONS rather than crashing.
 */
import { rubric, RUBRIC_CRITERIA, isPassing } from "../rubric";
import { RubricScoresSchema, type RubricScores } from "../schemas";
import { buildChatModelWithFallback } from "../with-fallback";
import type { FieldReportState, FieldReportStateUpdate } from "../state";

const SYSTEM_PROMPT = `You are a strict lesson reviewer for Wanderlearn. Score the \
draft lesson against every rubric criterion. For each criterion return:
- "pass": true only when the draft clearly satisfies the criterion;
- "evidence": one sentence naming what in the draft passed or failed it;
- "suggestion": when it fails, one concrete fix for the next revision (omit it
  when the criterion passes).

Be exacting — a criterion passes only on clear evidence in the draft text.`;

/** Render the rubric (names, weights, descriptions) for the prompt. */
function rubricBlock(): string {
  return RUBRIC_CRITERIA.map(
    (criterion) =>
      `- ${criterion} (weight ${rubric[criterion].weight}): ${rubric[criterion].description}`,
  ).join("\n");
}

/** A human-readable summary of the failing criteria — fed to the next `write`. */
function summarizeFeedback(scores: RubricScores): string {
  const failing = RUBRIC_CRITERIA.filter((criterion) => !scores[criterion].pass);
  if (failing.length === 0) {
    return "All rubric criteria passed.";
  }
  return failing
    .map((criterion) => {
      const score = scores[criterion];
      const fix = score.suggestion ? ` Fix: ${score.suggestion}` : "";
      return `- ${criterion}: ${score.evidence}${fix}`;
    })
    .join("\n");
}

/** All-fail scores — the fail-soft result when the critique call errors. */
function failingScores(reason: string): RubricScores {
  return Object.fromEntries(
    RUBRIC_CRITERIA.map((criterion) => [
      criterion,
      { pass: false, evidence: reason, suggestion: "Retry the critique." },
    ]),
  ) as RubricScores;
}

export async function critique(
  state: FieldReportState,
): Promise<FieldReportStateUpdate> {
  const draft = state.draft;
  if (!draft) {
    throw new Error("critique: no draft in state — `write` must run first.");
  }

  let rubricScores: RubricScores;
  try {
    const model = (
      await buildChatModelWithFallback({
        provider: state.llmProvider,
        temperature: 0,
      })
    ).withStructuredOutput(RubricScoresSchema, { name: "score_rubric" });
    rubricScores = (await model.invoke([
      ["system", SYSTEM_PROMPT],
      [
        "human",
        [
          `Target audience: ${state.targetAudience}`,
          "",
          "Rubric:",
          rubricBlock(),
          "",
          `Draft lesson (revision ${draft.revisionNumber}):`,
          draft.markdown,
        ].join("\n"),
      ],
    ])) as RubricScores;
  } catch (err) {
    console.error("[critique] failed; scoring the draft as failing:", err);
    const reason = err instanceof Error ? err.message : "unknown error";
    rubricScores = failingScores(`Critique call failed: ${reason}`);
  }

  const passed = isPassing(rubricScores);
  const feedback = summarizeFeedback(rubricScores);

  return {
    critique: {
      revisionNumber: draft.revisionNumber,
      rubricScores,
      passed,
      feedback,
    },
    revisionHistory: [
      {
        revisionNumber: draft.revisionNumber,
        markdown: draft.markdown,
        rubricScores,
        passed,
        feedback,
      },
    ],
  };
}
