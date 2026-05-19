/**
 * Zod schemas for the field-reporter agent's state payloads.
 *
 * This file imports ONLY `zod` and `./rubric` (itself dependency-free). That
 * keeps it safe to import from both `state.ts` (which adds LangGraph) and
 * `db/schema.ts` (read by drizzle-kit, which must not pull heavy deps). The LLM
 * structured-output schemas and the DB jsonb column types are both derived from
 * here, so a runtime schema and its compile-time type cannot drift.
 *
 * Every shape mirrors PRD §6.
 */
import { z } from "zod";
import { RUBRIC_CRITERIA, type RubricCriterion } from "./rubric";

/* --- Capture input — set once, at graph invocation -------------------- */

export const TargetAudienceSchema = z.enum([
  "general",
  "curious_learner",
  "practitioner",
]);
export type TargetAudience = z.infer<typeof TargetAudienceSchema>;

/** Which LLM provider powers a run — selectable per run (PRD Appendix A). */
export const LlmProviderSchema = z.enum(["anthropic", "google"]);
export type LlmProvider = z.infer<typeof LlmProviderSchema>;

/** Human-readable model name per provider, for the operator UI. */
export const LLM_PROVIDER_LABELS: Record<LlmProvider, string> = {
  anthropic: "Claude Sonnet 4.6",
  google: "Gemini 2.5 Pro",
};

export const LocationSchema = z.object({
  name: z.string(),
  gps: z.object({ lat: z.number(), lng: z.number() }),
  /** ISO timestamp of the capture. */
  capturedAt: z.string(),
});
export type FieldReportLocation = z.infer<typeof LocationSchema>;

export const RawInputSchema = z.object({
  transcript: z.string(),
  /** Cloudinary public IDs for the capture's images. */
  imageRefs: z.array(z.string()),
  operatorNotes: z.string().optional(),
});
export type RawInput = z.infer<typeof RawInputSchema>;

/* --- Rubric scoring --------------------------------------------------- */

export const RubricScoreSchema = z.object({
  pass: z.boolean(),
  /** Why the criterion passed or failed. */
  evidence: z.string(),
  /** How to fix it on the next revision (omitted when it passed). */
  suggestion: z.string().optional(),
});
export type RubricScore = z.infer<typeof RubricScoreSchema>;

/** One score per rubric criterion — the keys are exactly `RubricCriterion`. */
export const RubricScoresSchema = z.object(
  Object.fromEntries(
    RUBRIC_CRITERIA.map((criterion) => [criterion, RubricScoreSchema]),
  ) as Record<RubricCriterion, typeof RubricScoreSchema>,
);
export type RubricScores = Record<RubricCriterion, RubricScore>;

/* --- Node outputs (PRD §6) ------------------------------------------- */

/** A claim paired with the source that supports it. */
const FactSchema = z.object({ claim: z.string(), source: z.string() });

/** Output of the `research` node. */
export const ResearchSchema = z.object({
  facts: z.array(FactSchema),
  /** Existing Wanderlearn lessons worth cross-linking. */
  relatedCourses: z.array(z.string()),
});
export type Research = z.infer<typeof ResearchSchema>;

/** Output of the `outline` node. */
export const OutlineSchema = z.object({
  /** 3 to 5 learning objectives. */
  learningObjectives: z.array(z.string()),
  sections: z.array(
    z.object({
      heading: z.string(),
      summary: z.string(),
      /** 1-based index into `learningObjectives`. */
      tiesToObjective: z.number().int(),
    }),
  ),
});
export type Outline = z.infer<typeof OutlineSchema>;

/** A finished draft. */
export const DraftSchema = z.object({
  revisionNumber: z.number().int(),
  markdown: z.string(),
  citations: z.array(FactSchema),
});
export type Draft = z.infer<typeof DraftSchema>;

/**
 * Structured output of the `write` node — a draft minus `revisionNumber`,
 * which the node stamps itself from the running revision counter.
 */
export const WriteOutputSchema = DraftSchema.omit({ revisionNumber: true });
export type WriteOutput = z.infer<typeof WriteOutputSchema>;

/** Output of the `critique` node. */
export const CritiqueSchema = z.object({
  revisionNumber: z.number().int(),
  rubricScores: RubricScoresSchema,
  passed: z.boolean(),
  feedback: z.string(),
});
export type Critique = z.infer<typeof CritiqueSchema>;

/**
 * One entry in `revisionHistory` — a full record of one critique cycle. It
 * carries `passed` + `feedback` (a superset of the PRD §6 sketch) so the
 * `field_report_revisions` row (PRD §9) is a direct map at persistence time.
 */
export const RevisionHistoryEntrySchema = z.object({
  revisionNumber: z.number().int(),
  markdown: z.string(),
  rubricScores: RubricScoresSchema,
  passed: z.boolean(),
  feedback: z.string(),
});
export type RevisionHistoryEntry = z.infer<typeof RevisionHistoryEntrySchema>;

/**
 * Structured output of `generateImagePrompts`. Anthropic structured output
 * needs an object root, so the prompt array is wrapped; the node unwraps it.
 */
export const ImagePromptsSchema = z.object({ prompts: z.array(z.string()) });
export type ImagePrompts = z.infer<typeof ImagePromptsSchema>;
