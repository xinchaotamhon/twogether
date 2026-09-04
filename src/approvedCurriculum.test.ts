import { describe, expect, it } from "vitest";
import source from "../content/drafts/english-core-beginner-revision-v2.json";
import revision from "../content/revisions/english-core-transfer-novelty-v3.json";
import { APPROVED_ENGLISH_CARDS } from "./approvedCurriculum";
import { createWorkspaceMemoryStorage, getWorkspaceCards, publishCardDraft, saveCardDraft } from "./localWorkspace";

describe("published transfer revision authority", () => {
  it("keeps each v2 answer unless its exact ID has an audited paired revision", () => {
    for (const card of APPROVED_ENGLISH_CARDS) {
      const expected = revision.overrides.find((item) => item.card_id === card.id)
        ?? source.cards.find((item) => item.id === card.id)!;
      expect(card.transfer_prompt, card.id).toBe(expected.transfer_prompt);
      expect(card.transfer_answer, card.id).toBe(expected.transfer_answer);
    }
  });

  it("preserves a Human-published edit above the bundled transfer revision", () => {
    const storage = createWorkspaceMemoryStorage();
    const card = APPROVED_ENGLISH_CARDS.find((item) => item.id === "core-en-03")!;
    saveCardDraft({ ...card, transfer_prompt: "Ví dụ riêng của tôi", transfer_answer: "Lời giải riêng của tôi" }, storage);
    publishCardDraft(card.id, storage);
    const edited = getWorkspaceCards(APPROVED_ENGLISH_CARDS, storage).find((item) => item.id === card.id)!;
    expect(edited.transfer_prompt).toBe("Ví dụ riêng của tôi");
    expect(edited.transfer_answer).toBe("Lời giải riêng của tôi");
  });
});
