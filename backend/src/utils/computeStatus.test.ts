import { describe, it, expect } from "vitest";
import { computeStatus, RELEASE_STEPS } from "./computeStatus";

describe("computeStatus", () => {
  it("returns 'planned' when steps object is empty", () => {
    expect(computeStatus({})).toBe("planned");
  });

  it("returns 'planned' when all steps are false", () => {
    const steps = Object.fromEntries(RELEASE_STEPS.map((s) => [s, false]));
    expect(computeStatus(steps)).toBe("planned");
  });

  it("returns 'ongoing' when at least one step is completed", () => {
    const steps = Object.fromEntries(RELEASE_STEPS.map((s) => [s, false]));
    steps[RELEASE_STEPS[0]] = true;
    expect(computeStatus(steps)).toBe("ongoing");
  });

  it("returns 'ongoing' when most but not all steps are completed", () => {
    const steps = Object.fromEntries(RELEASE_STEPS.map((s) => [s, true]));
    steps[RELEASE_STEPS[RELEASE_STEPS.length - 1]] = false;
    expect(computeStatus(steps)).toBe("ongoing");
  });

  it("returns 'done' when all steps are completed", () => {
    const steps = Object.fromEntries(RELEASE_STEPS.map((s) => [s, true]));
    expect(computeStatus(steps)).toBe("done");
  });

  it("handles undefined/null gracefully without throwing", () => {
    expect(computeStatus(undefined as any)).toBe("planned");
    expect(computeStatus(null as any)).toBe("planned");
  });
});
