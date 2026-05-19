/**
 * LangGraph state for the field-reporter agent.
 *
 * `FieldReportState` is the single object that flows through every node. Each
 * node is `(state) => Partial<state>` — it reads what it needs and returns only
 * the fields it sets. Channels are last-write-wins (the default `Annotation`)
 * EXCEPT `revisionHistory`, which uses a concat reducer so every write→critique
 * cycle appends an entry instead of overwriting.
 *
 * The channel set maps 1:1 to PRD §6, so `typeof …State` is the PRD state shape.
 */
import { Annotation } from "@langchain/langgraph";
import type {
  FieldReportLocation,
  RawInput,
  TargetAudience,
  Research,
  Outline,
  Draft,
  Critique,
  RevisionHistoryEntry,
} from "./schemas";

export const FieldReportStateAnnotation = Annotation.Root({
  /* Capture input — set once, at graph invocation. */
  reportId: Annotation<string>,
  location: Annotation<FieldReportLocation>,
  rawInput: Annotation<RawInput>,
  targetAudience: Annotation<TargetAudience>,

  /* Node outputs — each filled in as the graph progresses. */
  research: Annotation<Research | undefined>,
  outline: Annotation<Outline | undefined>,
  draft: Annotation<Draft | undefined>,
  critique: Annotation<Critique | undefined>,

  /**
   * Accumulates across the (Day-2) revision loop — the one channel with a
   * reducer. Day 1's linear graph appends exactly one entry (from the stub
   * critique); the concat reducer is the Day-2-ready design.
   */
  revisionHistory: Annotation<RevisionHistoryEntry[]>({
    reducer: (current, update) => current.concat(update),
    default: () => [],
  }),

  /* Terminal outputs. */
  imagePrompts: Annotation<string[] | undefined>,
  finalMarkdown: Annotation<string | undefined>,
  /** Sticky: once a run is flagged for human review it stays flagged. */
  flaggedForHumanReview: Annotation<boolean>({
    reducer: (current, update) => current || update,
    default: () => false,
  }),
});

/** The fully-typed state object every node receives (PRD §6). */
export type FieldReportState = typeof FieldReportStateAnnotation.State;

/** What a node may return — a partial update merged into state. */
export type FieldReportStateUpdate = Partial<FieldReportState>;
