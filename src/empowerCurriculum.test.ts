import { describe, expect, it } from "vitest";
import {
  EMPOWER_KNOWLEDGE_CARDS,
  EMPOWER_VOCABULARY_DRAFT_CARDS,
} from "./empowerCurriculum";
import { glossaryTermsFor } from "./glossary";

describe("Empower A2 runtime curriculum", () => {
  it("resolves every declared glossary term for all 81 cards", () => {
    const cards = [...EMPOWER_KNOWLEDGE_CARDS, ...EMPOWER_VOCABULARY_DRAFT_CARDS];
    expect(cards).toHaveLength(81);
    for (const card of cards) {
      const refs = card.glossary_refs ?? [];
      expect(refs.length, card.id).toBeGreaterThan(0);
      expect(glossaryTermsFor(refs), card.id).toHaveLength(new Set(refs).size);
    }
  });

  it("answers the corrected school-to-library transfer situation", () => {
    const card = EMPOWER_KNOWLEDGE_CARDS.find(
      (candidate) => candidate.id === "coursebook-a2-course-05-01",
    );
    expect(card?.transfer_prompt).toContain("cổng trường đến thư viện");
    expect(card?.transfer_answer).toContain("library");
    expect(card?.transfer_answer).not.toContain("bank");
  });
});
