import { describe, expect, it } from "vitest";
import { COLLECTION_FIXTURES } from "./collections";
import {
  ENGLISH_CORE_DRAFT_CARD_IDS,
  ENGLISH_CORE_DRAFT_CARDS,
  ENGLISH_CORE_DRAFT_COLLECTIONS,
  draftCardsForCollection,
} from "./curriculumDrafts";

describe("English Generative Core v1 review boundary", () => {
  it("exposes ten review slices with eight unique draft cards each", () => {
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

  it("keeps every curriculum draft outside the published study shelf", () => {
    const studyIds = new Set(COLLECTION_FIXTURES.flatMap((collection) => collection.cardIds));
    expect(COLLECTION_FIXTURES.every((collection) => collection.status === "published")).toBe(true);
    expect([...ENGLISH_CORE_DRAFT_CARD_IDS].some((id) => studyIds.has(id))).toBe(false);
  });
});
