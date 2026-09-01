import { describe, expect, it } from "vitest";
import { COLLECTION_FIXTURES, cardsInCollection, createRunPlan, dueCardIdsForCollection, qualifyRun, wouldCreatePrerequisiteCycle } from "./collections";
import { APPROVED_ENGLISH_CARDS, APPROVED_ENGLISH_EDGES } from "./approvedCurriculum";
import { createInitialFsrsCard } from "./scheduler";
import type { LearnerSnapshot } from "./types";

const cards = APPROVED_ENGLISH_CARDS;
const snapshot: LearnerSnapshot = { learnerId: "hiep", dailyGoalMinutes: 15, reviewEvents: [], cardStates: Object.fromEntries(cards.map((card) => [card.id, { learnerId: "hiep", cardId: card.id, fsrs: createInitialFsrsCard(), reviewCount: 0 }])) };

describe("collection domain", () => {
  it("publishes ten compact, non-duplicated English Core collections", () => {
    expect(COLLECTION_FIXTURES).toHaveLength(10);
    expect(COLLECTION_FIXTURES.every((collection) => collection.status === "published" && collection.cardIds.length >= 8 && collection.cardIds.length <= 9)).toBe(true);
    expect(new Set(COLLECTION_FIXTURES.flatMap((collection) => collection.cardIds)).size).toBe(89);
    expect(cardsInCollection(cards, COLLECTION_FIXTURES[0])).toHaveLength(8);
  });

  it("scopes due work to the selected collection", () => {
    expect(dueCardIdsForCollection(cards, COLLECTION_FIXTURES[1], snapshot)).toHaveLength(9);
  });

  it("snapshots unique cards and requires an honest attempt for every card", () => {
    const plan = createRunPlan({ id: "run-1", learnerId: "hiep", collectionId: "collection-english-core-02", requiredCardIds: ["a", "a", "b"], createdAt: new Date("2026-08-22T08:00:00Z"), timezone: "Asia/Ho_Chi_Minh" });
    expect(plan.requiredCardIds).toEqual(["a", "b"]);
    expect(qualifyRun(plan, [{ cardId: "a", attemptConfirmed: true }, { cardId: "a", attemptConfirmed: true }])).toBe(false);
    expect(qualifyRun(plan, [{ cardId: "a", attemptConfirmed: true }, { cardId: "b", attemptConfirmed: true }, { cardId: "b", attemptConfirmed: false }])).toBe(true);
  });

  it("rejects direct and indirect prerequisite cycles only", () => {
    expect(wouldCreatePrerequisiteCycle(APPROVED_ENGLISH_EDGES, "core-en-module-10", "core-en-module-01")).toBe(true);
    expect(wouldCreatePrerequisiteCycle(APPROVED_ENGLISH_EDGES, "core-en-module-03", "core-en-module-04")).toBe(false);
    expect(wouldCreatePrerequisiteCycle(APPROVED_ENGLISH_EDGES, "core-en-module-01", "core-en-module-01")).toBe(true);
  });
});
