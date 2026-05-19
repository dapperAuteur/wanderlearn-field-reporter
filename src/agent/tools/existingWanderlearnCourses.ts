import { z } from "zod";

/**
 * `existingWanderlearnCourses` tool — looks up published Wanderlearn courses the
 * drafted lesson could cross-link to.
 *
 * Backed by a static catalog: Wanderlearn has no public courses API yet and the
 * course library is small (PRD §1). Swap `WANDERLEARN_CATALOG` for a live query
 * once that API exists — the tool's signature stays the same.
 */

export const ExistingCoursesInputSchema = z.object({
  /** Optional free-text filter, matched against course title and location. */
  topic: z.string().optional(),
});
export type ExistingCoursesInput = z.infer<typeof ExistingCoursesInputSchema>;

export interface WanderlearnCourse {
  slug: string;
  title: string;
  location: string;
}

/** The known Wanderlearn course library — a placeholder for a future API. */
const WANDERLEARN_CATALOG: WanderlearnCourse[] = [
  {
    slug: "mucho-museo-del-chocolate",
    title: "Inside MUCHO: Mexico City's Chocolate Museum",
    location: "Mexico City, Mexico",
  },
  {
    slug: "oaxaca-cacao-farms",
    title: "Cacao Farms of Oaxaca",
    location: "Oaxaca, Mexico",
  },
  {
    slug: "teotihuacan-pyramids",
    title: "Walking the Avenue of the Dead at Teotihuacán",
    location: "Teotihuacán, Mexico",
  },
];

export async function existingWanderlearnCourses(
  input: ExistingCoursesInput = {},
): Promise<WanderlearnCourse[]> {
  const { topic } = ExistingCoursesInputSchema.parse(input);
  if (!topic) {
    return WANDERLEARN_CATALOG;
  }
  const needle = topic.toLowerCase();
  return WANDERLEARN_CATALOG.filter(
    (course) =>
      course.title.toLowerCase().includes(needle) ||
      course.location.toLowerCase().includes(needle),
  );
}
