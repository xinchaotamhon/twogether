import supportBundle from "../content/drafts/english-core-support-v1.json";
import { hasGlossaryTerm } from "./glossary";
import type { Card } from "./types";

interface CardSupportRecord {
  card_id: string;
  scaffold_prompt: string;
  scaffold_answer: string;
  glossary_refs: string[];
}

interface CardSupportBundle {
  schema_version: number;
  status: "draft";
  packet_id: string;
  derived_from: { source_packet: string; curriculum_id: string };
  provenance: { created_by: { actor_type: "ai"; actor_id: string }; review_status: string; source_refs: string[]; note: string };
  support_records: CardSupportRecord[];
}

const bundle = supportBundle as CardSupportBundle;
const supportByCardId = new Map(bundle.support_records.map((record) => [record.card_id, record]));

function assertSupportBundle(): void {
  const ids = bundle.support_records.map((record) => record.card_id);
  if (
    bundle.schema_version !== 1
    || bundle.status !== "draft"
    || bundle.derived_from.curriculum_id !== "english-generative-core-v1"
    || bundle.provenance.review_status !== "ai_draft_unreviewed"
    || ids.length !== 80
    || new Set(ids).size !== 80
    || bundle.support_records.some((record) => !record.scaffold_prompt.trim() || !record.scaffold_answer.trim())
    || bundle.support_records.some((record) => record.glossary_refs.some((id) => !hasGlossaryTerm(id)))
  ) throw new Error("English Core support v1 không đúng contract 80 thẻ hoặc có glossary ref lạ.");
}

assertSupportBundle();

export const CARD_SUPPORT_REVIEW_STATUS = bundle.provenance.review_status;

export function supportForCard(cardId: string): Pick<Card, "scaffold_prompt" | "scaffold_answer" | "glossary_refs"> | null {
  const support = supportByCardId.get(cardId);
  return support ? { scaffold_prompt: support.scaffold_prompt, scaffold_answer: support.scaffold_answer, glossary_refs: [...support.glossary_refs] } : null;
}
