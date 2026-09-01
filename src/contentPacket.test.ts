import { describe, expect, it } from "vitest";
import {
  exportCardPacket,
  importPacketAsDraft,
  validateCardPacket,
} from "./contentPacket";
import cardFixture from "../content/cards.json";

const card = (cardFixture as { cards: any[] }).cards[0];
const metadata = {
  packet_id: "packet-1",
  created_at: "2026-08-22T10:00:00.000Z",
  created_by: { actor_type: "ai" as const, actor_id: "codex", model: "gpt" },
  sources: [
    {
      source_ref: "project-fixture:placeholder-english-v1",
      kind: "owner_capture",
      raw_private_content_included: false as const,
    },
  ],
};

describe("AI card packet contract", () => {
  it("validates provenance and always imports as draft", () => {
    const packet = exportCardPacket(metadata, [card]);
    expect(validateCardPacket(packet).valid).toBe(true);
    const imported = importPacketAsDraft({
      ...packet,
      cards: [{ ...card, status: "published", reviewer: "hiep" }],
    });
    expect(imported[0].status).toBe("draft");
    expect(imported[0].reviewer).toBeNull();
  });

  it("rejects private raw content and duplicate IDs", () => {
    const packet = exportCardPacket(metadata, [card]);
    const invalid = {
      ...packet,
      sources: [{ ...packet.sources[0], raw_private_content_included: true }],
      cards: [card, card],
    };
    expect(validateCardPacket(invalid).valid).toBe(false);
  });

  it("round-trips optional transfer answers and glossary fields without publishing them", () => {
    const supported = {
      ...card,
      transfer_answer: "Một cách làm mẫu có giải thích.",
      glossary_refs: ["finite-verb", "clause"],
    };
    const packet = exportCardPacket(metadata, [supported]);
    const imported = importPacketAsDraft(packet);
    expect(imported[0]).toMatchObject({
      transfer_answer: supported.transfer_answer,
      glossary_refs: supported.glossary_refs,
      status: "draft",
      reviewer: null,
    });
    expect(
      validateCardPacket({
        ...packet,
        cards: [{ ...supported, transfer_answer: "" }],
      }).valid,
    ).toBe(false);
  });
});
