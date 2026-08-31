import { describe, expect, it } from "vitest";
import { createRunPlan } from "./collections";
import { deriveStreak, localDateAt, recordDailyQualification } from "./streak";
import type { DailyQualification } from "./featureTypes";

const plan = createRunPlan({ id: "run-1", learnerId: "hiep", collectionId: "english-foundations", requiredCardIds: ["card-1"], createdAt: new Date("2026-08-22T00:00:00Z"), timezone: "Asia/Ho_Chi_Minh" });
const attempts = [{ cardId: "card-1", attemptConfirmed: true }];

describe("streak qualification", () => {
  it("uses the learner timezone rather than UTC date", () => {
    expect(localDateAt(new Date("2026-08-21T17:30:00Z"), "Asia/Ho_Chi_Minh")).toBe("2026-08-22");
  });

  it("is idempotent across two collections in one local day", () => {
    const first = recordDailyQualification([], plan, attempts, new Date("2026-08-22T10:00:00Z"));
    const secondPlan = { ...plan, id: "run-2", collectionId: "english-mechanism-lab" };
    const second = recordDailyQualification(first, secondPlan, attempts, new Date("2026-08-22T12:00:00Z"));
    expect(second).toHaveLength(1);
  });

  it("keeps best streak while resetting current after a missed day", () => {
    const qualifications: DailyQualification[] = [
      { learnerId: "hiep", localDate: "2026-08-18", timezone: "Asia/Ho_Chi_Minh", collectionId: "a", runId: "a", qualifiedAt: "2026-08-18T01:00:00Z" },
      { learnerId: "hiep", localDate: "2026-08-19", timezone: "Asia/Ho_Chi_Minh", collectionId: "a", runId: "b", qualifiedAt: "2026-08-19T01:00:00Z" },
      { learnerId: "hiep", localDate: "2026-08-22", timezone: "Asia/Ho_Chi_Minh", collectionId: "a", runId: "c", qualifiedAt: "2026-08-22T01:00:00Z" },
    ];
    expect(deriveStreak(qualifications, "hiep", new Date("2026-08-22T12:00:00Z"))).toEqual({ currentDays: 1, bestDays: 2, lastQualifiedDate: "2026-08-22" });
  });

  it("does not present an old completed run as a current streak", () => {
    const qualifications: DailyQualification[] = [
      { learnerId: "hiep", localDate: "2026-08-18", timezone: "Asia/Ho_Chi_Minh", collectionId: "a", runId: "a", qualifiedAt: "2026-08-18T01:00:00Z" },
      { learnerId: "hiep", localDate: "2026-08-19", timezone: "Asia/Ho_Chi_Minh", collectionId: "a", runId: "b", qualifiedAt: "2026-08-19T01:00:00Z" },
    ];
    expect(deriveStreak(qualifications, "hiep", new Date("2026-08-31T12:00:00Z"))).toEqual({ currentDays: 0, bestDays: 2, lastQualifiedDate: "2026-08-19" });
  });
});
