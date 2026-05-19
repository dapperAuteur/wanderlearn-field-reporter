/**
 * Drizzle schema for wanderlearn-field-reporter (PRD §9).
 *
 * Two tables: `field_reports` (one row per capture / agent run) and
 * `field_report_revisions` (one row per draft revision). The jsonb column types
 * are annotated from `agent/schemas.ts` via a RELATIVE type-only import —
 * drizzle-kit runs outside the `@/` path-alias resolver, so it cannot use it.
 */
import {
  pgTable,
  uuid,
  text,
  numeric,
  timestamp,
  jsonb,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import type { RubricScores, LlmProvider } from "../agent/schemas";

/** One row per capture submitted to the agent. */
export const fieldReports = pgTable("field_reports", {
  id: uuid("id").defaultRandom().primaryKey(),
  locationName: text("location_name").notNull(),
  gpsLat: numeric("gps_lat").notNull(),
  gpsLng: numeric("gps_lng").notNull(),
  capturedAt: timestamp("captured_at", { withTimezone: true }).notNull(),
  rawTranscript: text("raw_transcript").notNull(),
  rawImageRefs: text("raw_image_refs").array().notNull(),
  targetAudience: text("target_audience").notNull(),
  llmProvider: text("llm_provider")
    .$type<LlmProvider>()
    .notNull()
    .default("anthropic"),
  finalMarkdown: text("final_markdown"),
  imagePrompts: jsonb("image_prompts").$type<string[]>(),
  flaggedForHumanReview: boolean("flagged_for_human_review")
    .notNull()
    .default(false),
  langsmithRunId: text("langsmith_run_id"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

/** One row per draft revision of a report — the reflection loop's audit trail. */
export const fieldReportRevisions = pgTable("field_report_revisions", {
  id: uuid("id").defaultRandom().primaryKey(),
  reportId: uuid("report_id")
    .notNull()
    .references(() => fieldReports.id, { onDelete: "cascade" }),
  revisionNumber: integer("revision_number").notNull(),
  markdown: text("markdown").notNull(),
  rubricScores: jsonb("rubric_scores").$type<RubricScores>().notNull(),
  passed: boolean("passed").notNull(),
  feedback: text("feedback").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type FieldReport = typeof fieldReports.$inferSelect;
export type FieldReportRevision = typeof fieldReportRevisions.$inferSelect;
