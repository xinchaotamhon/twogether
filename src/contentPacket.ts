import type { Card, CardType } from "./types";

export const CARD_PACKET_SCHEMA = "twogether.card-packet.v1" as const;

export interface PacketSource {
  source_ref: string;
  kind: string;
  sha256?: string;
  raw_private_content_included: false;
}

export interface CardPacket {
  schema_version: typeof CARD_PACKET_SCHEMA;
  packet_id: string;
  created_at: string;
  created_by: { actor_type: "human" | "ai"; actor_id: string; model?: string };
  sources: PacketSource[];
  cards: Card[];
}

export interface PacketValidation {
  valid: boolean;
  errors: string[];
}

const CARD_TYPES: readonly CardType[] = [
  "core_recall",
  "mechanism",
  "contrast",
  "boundary",
  "application",
  "production",
];
const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object";
const isString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

export function validateCardPacket(value: unknown): PacketValidation {
  const errors: string[] = [];
  if (!isRecord(value))
    return { valid: false, errors: ["packet phải là object"] };
  if (value.schema_version !== CARD_PACKET_SCHEMA)
    errors.push("schema_version không được hỗ trợ");
  if (!isString(value.packet_id)) errors.push("thiếu packet_id");
  if (!isString(value.created_at) || Number.isNaN(Date.parse(value.created_at)))
    errors.push("created_at phải là ISO date");
  const actor = value.created_by;
  if (
    !isRecord(actor) ||
    (actor.actor_type !== "human" && actor.actor_type !== "ai") ||
    !isString(actor.actor_id)
  )
    errors.push("created_by không hợp lệ");
  const sources = value.sources;
  if (!Array.isArray(sources)) errors.push("sources phải là array");
  else
    sources.forEach((source, index) => {
      if (
        !isRecord(source) ||
        !isString(source.source_ref) ||
        source.raw_private_content_included !== false
      )
        errors.push(`sources[${index}] thiếu provenance an toàn`);
    });
  const cards = value.cards;
  if (!Array.isArray(cards) || cards.length === 0)
    errors.push("cards phải là array không rỗng");
  else {
    const ids = new Set<string>();
    cards.forEach((card, index) => {
      if (!isRecord(card)) {
        errors.push(`cards[${index}] không phải object`);
        return;
      }
      if (!isString(card.id) || ids.has(card.id))
        errors.push(`cards[${index}].id thiếu hoặc trùng`);
      if (isString(card.id)) ids.add(card.id);
      if (!isString(card.node_id)) errors.push(`cards[${index}].node_id thiếu`);
      if (!CARD_TYPES.includes(card.card_type as CardType))
        errors.push(`cards[${index}].card_type không hợp lệ`);
      for (const key of [
        "prompt",
        "model_answer",
        "explanation",
        "misconception",
        "transfer_prompt",
        "author",
      ] as const)
        if (!isString(card[key])) errors.push(`cards[${index}].${key} thiếu`);
      if (card.transfer_answer !== undefined && !isString(card.transfer_answer))
        errors.push(`cards[${index}].transfer_answer không hợp lệ`);
      const hasScaffoldPrompt = card.scaffold_prompt !== undefined;
      const hasScaffoldAnswer = card.scaffold_answer !== undefined;
      if (
        hasScaffoldPrompt !== hasScaffoldAnswer ||
        (hasScaffoldPrompt &&
          (!isString(card.scaffold_prompt) || !isString(card.scaffold_answer)))
      )
        errors.push(
          `cards[${index}] phải có đủ scaffold_prompt và scaffold_answer`,
        );
      if (
        card.glossary_refs !== undefined &&
        (!Array.isArray(card.glossary_refs) ||
          !card.glossary_refs.every(isString))
      )
        errors.push(`cards[${index}].glossary_refs không hợp lệ`);
      if (
        !Array.isArray(card.prerequisite_node_ids) ||
        !card.prerequisite_node_ids.every(isString)
      )
        errors.push(`cards[${index}].prerequisite_node_ids không hợp lệ`);
      if (
        !Array.isArray(card.source_refs) ||
        card.source_refs.length === 0 ||
        !card.source_refs.every(isString)
      )
        errors.push(`cards[${index}].source_refs thiếu`);
    });
  }
  return { valid: errors.length === 0, errors };
}

export function importPacketAsDraft(value: unknown): Card[] {
  const validation = validateCardPacket(value);
  if (!validation.valid)
    throw new Error(`Packet không hợp lệ: ${validation.errors.join("; ")}`);
  const packet = value as CardPacket;
  return packet.cards.map((card) => ({
    ...card,
    glossary_refs: card.glossary_refs ? [...card.glossary_refs] : undefined,
    prerequisite_node_ids: [...card.prerequisite_node_ids],
    source_refs: [...card.source_refs],
    status: "draft" as const,
    reviewer: null,
  }));
}

export function exportCardPacket(
  metadata: Omit<CardPacket, "schema_version" | "cards">,
  cards: readonly Card[],
): CardPacket {
  return {
    ...metadata,
    schema_version: CARD_PACKET_SCHEMA,
    cards: cards.map((card) => ({
      ...card,
      glossary_refs: card.glossary_refs ? [...card.glossary_refs] : undefined,
      prerequisite_node_ids: [...card.prerequisite_node_ids],
      source_refs: [...card.source_refs],
    })),
  };
}
