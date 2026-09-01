import { describe, expect, it } from "vitest";
import packet from "../content/drafts/empower-a2-coursebook-final-review-v1.json";

describe("Empower A2 coursebook review packet", () => {
  it("keeps 81 unique, source-linked cards in review until the owner acts", () => {
    expect(packet.status).toBe("review");
    expect(packet.provenance.review_status).toBe(
      "ai_draft_owner_review_required",
    );
    expect(packet.cards).toHaveLength(81);
    expect(new Set(packet.cards.map((card) => card.id)).size).toBe(81);
    expect(
      packet.cards.every(
        (card) => card.status === "review" && card.reviewer === null,
      ),
    ).toBe(true);
    expect(
      packet.cards.every(
        (card) =>
          card.source_pdf_pages.length > 0 &&
          card.source_refs.some((ref) => ref.includes("sha256:")),
      ),
    ).toBe(true);
    expect(
      packet.cards.every((card) => card.transfer_answer.trim().length > 0),
    ).toBe(true);
  });
});
