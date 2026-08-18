import { describe, expect, it } from "vitest";
import { INTERVENING_CARDS, REPAIR_CAP, enqueueRepair, takeNextCardId } from "./studyPolicy";

describe("bounded repair loop", () => {
  it("waits for intervening cards before re-showing a failed card", () => {
    const queue = enqueueRepair([], "card-a", 1);
    expect(takeNextCardId(["card-b"], queue, 2)).toBe("card-b");
    expect(takeNextCardId(["card-b"], queue, 1 + INTERVENING_CARDS)).toBe("card-a");
  });

  it("caps same-session repair appearances", () => {
    let queue = enqueueRepair([], "card-a", 0);
    queue = enqueueRepair(queue, "card-a", 2);
    queue = enqueueRepair(queue, "card-a", 4);
    const capped = enqueueRepair(queue, "card-a", 6);

    expect(capped[0].appearances).toBe(REPAIR_CAP);
    expect(capped[0].availableAfterReview).toBe(6);
  });
});
