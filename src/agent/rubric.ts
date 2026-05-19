/**
 * The v1 rubric — the single source of truth for what "a good lesson" means.
 *
 * Editable here without touching agent code: the critique node reads the
 * criteria, descriptions, and weights straight from this object (PRD §7). The
 * criterion KEYS drive a derived union type (`RubricCriterion`), so the data
 * and the type can never drift — there are no string-typed criterion names.
 */

export interface RubricCriterionDef {
  /** A check an LLM can actually score — concrete and evidence-based (PRD §7). */
  description: string;
  /** 1 = blocking (a draft must pass it); 0.5 = a nudge, never a blocker. */
  weight: number;
}

export const rubric = {
  has_clear_objectives: {
    description: "3 to 5 learning objectives listed at the top of the lesson.",
    weight: 1,
  },
  sections_tie_to_objectives: {
    description:
      "Each section references at least one numbered learning objective.",
    weight: 1,
  },
  has_three_citations: {
    description: "At least 3 distinct, named sources cited in the body.",
    weight: 1,
  },
  has_hands_on_exercise: {
    description:
      "Includes at least one exercise the learner does on their own.",
    weight: 1,
  },
  reading_level_matches_audience: {
    description: "Reading level appropriate for the targetAudience field.",
    weight: 1,
  },
  has_next_capture_appendix: {
    description:
      'Ends with a "what to capture next time" section so the operator ' +
      "improves field shoots over time.",
    weight: 0.5,
  },
} satisfies Record<string, RubricCriterionDef>;

/** Union of the rubric's criterion names — derived, so it cannot drift (PRD §6). */
export type RubricCriterion = keyof typeof rubric;

/** The shape of the whole rubric object (PRD §7: `rubric: RubricDefinition`). */
export type RubricDefinition = Record<RubricCriterion, RubricCriterionDef>;

/** Every criterion name, in declaration order. */
export const RUBRIC_CRITERIA = Object.keys(rubric) as RubricCriterion[];

/** The weight-1 criteria — the ones a draft must pass to be publishable. */
export const BLOCKING_CRITERIA: RubricCriterion[] = RUBRIC_CRITERIA.filter(
  (criterion) => rubric[criterion].weight >= 1,
);

/**
 * The pass rule (PRD §7): a draft passes when every blocking (weight-1)
 * criterion passes. The 0.5-weight criterion is a nudge, never a blocker.
 * Both the Day-1 stub critique and the Day-2 real critique call this, so the
 * rule lives in exactly one place.
 */
export function isPassing(
  scores: Record<RubricCriterion, { pass: boolean }>,
): boolean {
  return BLOCKING_CRITERIA.every((criterion) => scores[criterion].pass);
}
