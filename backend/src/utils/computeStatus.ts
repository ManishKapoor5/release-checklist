export const RELEASE_STEPS = [
  "All relevant GitHub pull requests have been merged",
  "CHANGELOG.md files have been updated",
  "All tests are passing",
  "Releases in GitHub created",
  "Deployed in demo",
  "Tested thoroughly in demo",
  "Deployed in production",
] as const;

export function computeStatus(steps: Record<string, boolean>): "planned" | "ongoing" | "done" {
  const values = RELEASE_STEPS.map((s) => steps?.[s] ?? false);
  const completedCount = values.filter(Boolean).length;
  if (completedCount === 0) return "planned";
  if (completedCount === RELEASE_STEPS.length) return "done";
  return "ongoing";
}
