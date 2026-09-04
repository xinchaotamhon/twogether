import { describe, expect, it } from "vitest";
import { AuthorizationError, LOCAL_DATA_STORAGE_KEY, createLocalDataAdapter, createMemoryStorage, hashCardState } from "./dataAdapter";
import { createInitialFsrsCard } from "./scheduler";

describe("local development data adapter", () => {
  it("keeps learner state isolated and rejects cross-account access", () => {
    const adapter = createLocalDataAdapter(createMemoryStorage());

    expect(() => adapter.readLearner("hoang", "hiep")).toThrow(AuthorizationError);
    const hiep = adapter.readLearner("hiep", "hiep");
    const hoang = adapter.readLearner("hoang", "hoang");
    expect(hiep.reviewEvents).toHaveLength(0);
    expect(hoang.reviewEvents).toHaveLength(0);
    expect(adapter.listCards()).toHaveLength(170);
    expect(Object.keys(hiep.cardStates)).toHaveLength(163);
  });

  it("makes a duplicate review write idempotent", () => {
    const adapter = createLocalDataAdapter(createMemoryStorage());
    const card = adapter.listCards()[0];
    const initial = adapter.readLearner("hiep", "hiep");
    const input = {
      sessionLearnerId: "hiep" as const,
      requestedLearnerId: "hiep" as const,
      cardId: card.id,
      rating: "Good" as const,
      attemptKind: "mental" as const,
      occurredAt: new Date("2026-08-18T10:00:00.000Z"),
      idempotencyKey: "fixed-key",
      oldStateHash: hashCardState(initial.cardStates[card.id]),
    };
    const first = adapter.recordReview(input);
    const second = adapter.recordReview(input);

    expect(first.event.id).toBe(second.event.id);
    expect(adapter.readLearner("hiep", "hiep").reviewEvents).toHaveLength(1);
  });

  it("migrates v1 state without deleting fixture history", () => {
    const storage = createMemoryStorage();
    const oldState = { learnerId: "hiep", cardId: "fixture-recall-01", fsrs: createInitialFsrsCard(), reviewCount: 3, lastRating: "Good", lastReviewedAt: "2026-08-25T08:00:00.000Z" };
    const oldEvent = { id: "old-event", idempotencyKey: "old-key", learnerId: "hiep", cardId: "fixture-recall-01", oldStateHash: "old", newStateHash: "new", rating: "Good", attemptKind: "mental", occurredAt: "2026-08-25T08:00:00.000Z", appVersion: "0.1.0-local" };
    storage.setItem(LOCAL_DATA_STORAGE_KEY, JSON.stringify({ version: 1, learners: {
      hiep: { learnerId: "hiep", cardStates: { "fixture-recall-01": oldState }, reviewEvents: [oldEvent], dailyGoalMinutes: 20 },
      hoang: { learnerId: "hoang", cardStates: {}, reviewEvents: [], dailyGoalMinutes: 15 },
    } }));

    const snapshot = createLocalDataAdapter(storage).readLearner("hiep", "hiep");
    expect(snapshot.cardStates["fixture-recall-01"].reviewCount).toBe(3);
    expect(snapshot.reviewEvents).toHaveLength(1);
    expect(snapshot.dailyGoalMinutes).toBe(20);
    expect(Object.keys(snapshot.cardStates)).toHaveLength(164);
  });

  it("adds FSRS state for a vocabulary card published later without deleting history", () => {
    const adapter = createLocalDataAdapter(createMemoryStorage());
    const before = adapter.readLearner("hiep", "hiep");
    const vocabulary = adapter.listCards().find((card) => card.id === "coursebook-a2-vocab-01")!;
    adapter.ensurePublishedCards?.([{ ...vocabulary, status: "published", reviewer: "hiep" }]);
    const after = adapter.readLearner("hiep", "hiep");

    expect(before.cardStates[vocabulary.id]).toBeUndefined();
    expect(after.cardStates[vocabulary.id]?.reviewCount).toBe(0);
    expect(after.reviewEvents).toEqual(before.reviewEvents);
  });
});
