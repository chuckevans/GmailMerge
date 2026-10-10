import { describe, expect, it } from "vitest";
import { followupDueAt } from "./followup";
describe("follow-up offsets", () => {
  it("anchors all steps to initial send", () => {
    const initial = new Date("2026-10-10T12:00:00.000Z");
    expect(followupDueAt(initial, 1).toISOString()).toBe("2026-10-24T12:00:00.000Z");
    expect(followupDueAt(initial, 2).toISOString()).toBe("2026-11-07T12:00:00.000Z");
    expect(followupDueAt(initial, 3).toISOString()).toBe("2026-11-19T12:00:00.000Z");
  });
});
