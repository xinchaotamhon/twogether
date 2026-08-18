import { describe, expect, it } from "vitest";
import { applyRating, createInitialFsrsCard, stateName } from "./scheduler";

describe("scheduler adapter", () => {
  it("maps Nhớ to Good and moves a new card into learning", () => {
    const now = new Date("2026-08-18T10:00:00.000Z");
    const initial = createInitialFsrsCard();
    const result = applyRating(initial, "Good", now);

    expect(result.fsrs.reps).toBe(1);
    expect(stateName(result.fsrs.state)).toBe("learning");
    expect(result.dueAt.getTime()).toBeGreaterThan(now.getTime());
  });

  it("maps Quên to Again and keeps the card in a repairable state", () => {
    const now = new Date("2026-08-18T10:00:00.000Z");
    const result = applyRating(createInitialFsrsCard(), "Again", now);

    expect(result.fsrs.reps).toBe(1);
    expect(result.fsrs.lapses).toBe(0);
    expect(["learning", "relearning"]).toContain(stateName(result.fsrs.state));
  });

  it("retains review history when a mature card lapses", () => {
    let now = new Date("2026-08-18T10:00:00.000Z");
    let card = createInitialFsrsCard(now);
    for (let step = 0; step < 4; step += 1) {
      const result = applyRating(card, "Good", now);
      card = result.fsrs;
      now = new Date(card.due);
    }
    const lapse = applyRating(card, "Again", now);

    expect(lapse.fsrs.reps).toBeGreaterThanOrEqual(4);
    expect(lapse.fsrs.lapses).toBeGreaterThan(0);
  });
});
