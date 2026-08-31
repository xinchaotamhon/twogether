import { describe, expect, it } from "vitest";
import { CARD_SUPPORT_REVIEW_STATUS, supportForCard } from "./cardSupport";
import { ENGLISH_CORE_DRAFT_CARDS } from "./curriculumDrafts";
import { glossaryTermsFor } from "./glossary";

describe("English Core support review packet", () => {
  it("keeps one complete AI-draft support record for each of the 80 source cards", () => {
    const support = ENGLISH_CORE_DRAFT_CARDS.map((card) => supportForCard(card.id));
    expect(CARD_SUPPORT_REVIEW_STATUS).toBe("ai_draft_unreviewed");
    expect(support).toHaveLength(80);
    expect(support.every((record) => Boolean(record?.scaffold_prompt && record.scaffold_answer))).toBe(true);
  });

  it("resolves every glossary reference to a structured term", () => {
    for (const card of ENGLISH_CORE_DRAFT_CARDS) {
      const ids = supportForCard(card.id)?.glossary_refs ?? [];
      expect(glossaryTermsFor(ids)).toHaveLength(new Set(ids).size);
    }
  });
});
