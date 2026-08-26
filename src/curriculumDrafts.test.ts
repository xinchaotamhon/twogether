import { describe, expect, it } from "vitest";
import { COLLECTION_FIXTURES } from "./collections";
import { APPROVED_ENGLISH_CARDS } from "./approvedCurriculum";
import {
  ENGLISH_CORE_DRAFT_CARD_IDS,
  ENGLISH_CORE_DRAFT_CARDS,
  ENGLISH_CORE_DRAFT_COLLECTIONS,
  draftCardsForCollection,
} from "./curriculumDrafts";

describe("English Generative Core v1 source and approval boundary", () => {
  it("keeps the immutable source packet as ten draft review slices", () => {
    expect(ENGLISH_CORE_DRAFT_COLLECTIONS).toHaveLength(10);
    expect(ENGLISH_CORE_DRAFT_CARDS).toHaveLength(80);
    expect(ENGLISH_CORE_DRAFT_CARD_IDS.size).toBe(80);
    for (const collection of ENGLISH_CORE_DRAFT_COLLECTIONS) {
      const cards = draftCardsForCollection(collection.id);
      expect(cards).toHaveLength(8);
      expect(new Set(cards.map((card) => card.id)).size).toBe(8);
      expect(cards.every((card) => card.status === "draft" && card.track === "english")).toBe(true);
    }
  });

  it("publishes exactly the 80 owner-approved cards without mutating their source", () => {
    const studyIds = new Set(COLLECTION_FIXTURES.flatMap((collection) => collection.cardIds));
    expect(COLLECTION_FIXTURES).toHaveLength(10);
    expect(COLLECTION_FIXTURES.every((collection) => collection.status === "published")).toBe(true);
    expect([...ENGLISH_CORE_DRAFT_CARD_IDS].every((id) => studyIds.has(id))).toBe(true);
    expect(APPROVED_ENGLISH_CARDS.every((card) => card.status === "published" && card.reviewer === "hiep")).toBe(true);
  });
});
