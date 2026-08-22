import { describe, expect, it } from "vitest";
import { COLLECTION_FIXTURES, cardsInCollection, createRunPlan, dueCardIdsForCollection, qualifyRun, wouldCreatePrerequisiteCycle } from "./collections";
import cardFixture from "../content/cards.json";
import nodeFixture from "../content/nodes.json";
import { createInitialFsrsCard } from "./scheduler";
import type { LearnerSnapshot } from "./types";

const cards = (cardFixture as { cards: any[] }).cards;
const snapshot: LearnerSnapshot = { learnerId: "hiep", dailyGoalMinutes: 15, reviewEvents: [], cardStates: Object.fromEntries(cards.map((card) => [card.id, { learnerId: "hiep", cardId: card.id, fsrs: createInitialFsrsCard(), reviewCount: 0 }])) };

describe("collection domain", () => {
  it("keeps collections many-to-many without duplicating shared cards", () => {
    expect(COLLECTION_FIXTURES.length).toBeGreaterThanOrEqual(2);
    const shared = COLLECTION_FIXTURES[0].cardIds.filter((id) => COLLECTION_FIXTURES[1].cardIds.includes(id));
    expect(shared.length).toBeGreaterThan(0);
    expect(cardsInCollection(cards, COLLECTION_FIXTURES[0])).toHaveLength(12);
  });

  it("scopes due work to the selected collection", () => {
    expect(dueCardIdsForCollection(cards, COLLECTION_FIXTURES[1], snapshot)).toHaveLength(6);
  });

  it("snapshots unique cards and requires an honest attempt for every card", () => {
    const plan = createRunPlan({ id: "run-1", learnerId: "hiep", collectionId: "english-mechanism-lab", requiredCardIds: ["a", "a", "b"], createdAt: new Date("2026-08-22T08:00:00Z"), timezone: "Asia/Ho_Chi_Minh" });
    expect(plan.requiredCardIds).toEqual(["a", "b"]);
    expect(qualifyRun(plan, [{ cardId: "a", attemptConfirmed: true }, { cardId: "a", attemptConfirmed: true }])).toBe(false);
    expect(qualifyRun(plan, [{ cardId: "a", attemptConfirmed: true }, { cardId: "b", attemptConfirmed: true }, { cardId: "b", attemptConfirmed: false }])).toBe(true);
  });

  it("rejects direct and indirect prerequisite cycles only", () => {
    const edges = (nodeFixture as { edges: any[] }).edges;
    expect(wouldCreatePrerequisiteCycle(edges, "english-fixture-transfer", "english-fixture-recall")).toBe(true);
    expect(wouldCreatePrerequisiteCycle(edges, "english-fixture-root", "english-fixture-transfer")).toBe(false);
    expect(wouldCreatePrerequisiteCycle(edges, "english-fixture-root", "english-fixture-root")).toBe(true);
  });
});
