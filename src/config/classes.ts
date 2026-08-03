/**
 * Static reference list for the school's grade levels.
 * Sections (A/B/C...) and per-class data come from the backend
 * (`classes` + `sections` collections) once Step 4 is wired up —
 * this file only encodes the fixed "Class 1 through Class 10" shape
 * of this particular school, used for things like nav generation
 * and dropdowns before real data is available.
 */
export const CLASS_LEVELS = Array.from({ length: 10 }, (_, i) => ({
  level: i + 1,
  name: `Class ${i + 1}`,
})) as ReadonlyArray<{ level: number; name: string }>;
