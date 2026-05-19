import "server-only";
import { asc, desc, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import {
  fieldReports,
  fieldReportRevisions,
  type FieldReport,
  type FieldReportRevision,
} from "@/db/schema";
import type { FieldReportState } from "@/agent/state";

/**
 * Persistence for field reports.
 *
 * The agent graph's nodes stay pure — they never touch the DB. A run is
 * persisted here, after `graph.invoke()` resolves, by the API route that
 * started it (ecosystem rule: side effects live outside the graph).
 */

/** A field report together with its full revision history. */
export interface FieldReportDetail {
  report: FieldReport;
  revisions: FieldReportRevision[];
}

/**
 * Persist a completed agent run: one `field_reports` row plus one
 * `field_report_revisions` row per revision. Returns the report id.
 */
export async function saveFieldReport(
  reportId: string,
  state: FieldReportState,
  langsmithRunId: string | null,
): Promise<string> {
  const db = getDb();

  await db.insert(fieldReports).values({
    id: reportId,
    locationName: state.location.name,
    gpsLat: String(state.location.gps.lat),
    gpsLng: String(state.location.gps.lng),
    capturedAt: new Date(state.location.capturedAt),
    rawTranscript: state.rawInput.transcript,
    rawImageRefs: state.rawInput.imageRefs,
    targetAudience: state.targetAudience,
    llmProvider: state.llmProvider,
    finalMarkdown: state.finalMarkdown ?? null,
    imagePrompts: state.imagePrompts ?? null,
    flaggedForHumanReview: state.flaggedForHumanReview,
    langsmithRunId,
    completedAt: new Date(),
  });

  if (state.revisionHistory.length > 0) {
    await db.insert(fieldReportRevisions).values(
      state.revisionHistory.map((entry) => ({
        reportId,
        revisionNumber: entry.revisionNumber,
        markdown: entry.markdown,
        rubricScores: entry.rubricScores,
        passed: entry.passed,
        feedback: entry.feedback,
      })),
    );
  }

  return reportId;
}

/** Fetch one report with its revisions, ordered by revision number. */
export async function getFieldReport(
  id: string,
): Promise<FieldReportDetail | null> {
  const db = getDb();

  const reports = await db
    .select()
    .from(fieldReports)
    .where(eq(fieldReports.id, id))
    .limit(1);
  const report = reports[0];
  if (!report) return null;

  const revisions = await db
    .select()
    .from(fieldReportRevisions)
    .where(eq(fieldReportRevisions.reportId, id))
    .orderBy(asc(fieldReportRevisions.revisionNumber));

  return { report, revisions };
}

/** List recent reports, newest first. */
export async function listFieldReports(): Promise<FieldReport[]> {
  const db = getDb();
  return db.select().from(fieldReports).orderBy(desc(fieldReports.createdAt));
}
