import { describe, expect, it } from "vitest";
import { AuthorizationError, createLocalDataAdapter, createMemoryStorage, hashCardState } from "./dataAdapter";

describe("local development data adapter", () => {
  it("keeps learner state isolated and rejects cross-account access", () => {
    const adapter = createLocalDataAdapter(createMemoryStorage());

    expect(() => adapter.readLearner("hoang", "hiep")).toThrow(AuthorizationError);
    const hiep = adapter.readLearner("hiep", "hiep");
    const hoang = adapter.readLearner("hoang", "hoang");
    expect(hiep.reviewEvents).toHaveLength(0);
    expect(hoang.reviewEvents).toHaveLength(0);
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
});
