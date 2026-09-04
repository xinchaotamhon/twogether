import packetJson from "../content/drafts/empower-a2-coursebook-final-review-v1.json";
import approvalJson from "../content/reviews/empower-a2-knowledge-owner-approval-2026-09-04.json";
import transferCorrectionsJson from "../content/revisions/empower-a2-transfer-corrections-v1.json";
import { glossaryIdForLabel } from "./glossary";
import type { CardCollection } from "./featureTypes";
import type { Card, ConceptEdge, ConceptNode } from "./types";

interface CoursebookCard extends Card {
  deck: string;
  glossary_terms: string[];
  source_pdf_pages: number[];
  source_scope: string;
  prerequisite_card_ids: string[];
  provenance_note: string;
}

interface CoursebookPacket {
  schema_version: number;
  packet_id: string;
  status: "review";
  cards: CoursebookCard[];
}

interface ScopeApproval {
  schema_version: number;
  decided_by: string;
  decision: string;
  source_sha256: string;
  approved_scope: { rule: string; expected_count: number };
  retained_for_vocabulary_review: { id_prefix: string; expected_count: number };
}

const packet = packetJson as CoursebookPacket;
const approval = approvalJson as ScopeApproval;
const vocabularyPrefix = approval.retained_for_vocabulary_review.id_prefix;
const transferCorrections = new Map(
  transferCorrectionsJson.overrides.map((record) => [record.card_id, record.transfer_answer]),
);
const knowledgeSourceCards = packet.cards.filter((card) => !card.id.startsWith(vocabularyPrefix));
const vocabularySourceCards = packet.cards.filter((card) => card.id.startsWith(vocabularyPrefix));

if (
  packet.schema_version !== 1 ||
  packet.status !== "review" ||
  approval.schema_version !== 1 ||
  approval.decided_by !== "hiep" ||
  approval.decision !== "approved_for_published_study_by_scope" ||
  approval.approved_scope.expected_count !== knowledgeSourceCards.length ||
  approval.retained_for_vocabulary_review.expected_count !== vocabularySourceCards.length ||
  knowledgeSourceCards.length !== 74 ||
  vocabularySourceCards.length !== 7
) {
  throw new Error("Phạm vi duyệt kiến thức Empower A2 không khớp packet nguồn.");
}

function toRuntimeCard(source: CoursebookCard, status: Card["status"]): Card {
  const {
    deck: _deck,
    glossary_terms: glossaryTerms,
    source_pdf_pages: _pages,
    source_scope: _scope,
    prerequisite_card_ids: _prerequisiteCards,
    provenance_note: _note,
    ...card
  } = source;
  const glossaryRefs = glossaryTerms.map((label) => {
    const id = glossaryIdForLabel(label);
    if (!id) throw new Error(`Glossary Empower A2 thiếu ${label} cho ${source.id}.`);
    return id;
  });
  return {
    ...card,
    ...(transferCorrections.has(source.id)
      ? { transfer_answer: transferCorrections.get(source.id) }
      : {}),
    glossary_refs: [...new Set([...(card.glossary_refs ?? []), ...glossaryRefs])],
    status,
    reviewer: status === "published" ? "hiep" : null,
  };
}

export const EMPOWER_KNOWLEDGE_CARDS: Card[] = knowledgeSourceCards.map((card) =>
  toRuntimeCard(card, "published"),
);

export const EMPOWER_VOCABULARY_DRAFT_CARDS: Card[] = vocabularySourceCards.map((card) =>
  toRuntimeCard(card, "draft"),
);

export const EMPOWER_KNOWLEDGE_CARD_IDS = new Set(EMPOWER_KNOWLEDGE_CARDS.map((card) => card.id));
export const EMPOWER_VOCABULARY_CARD_IDS = new Set(EMPOWER_VOCABULARY_DRAFT_CARDS.map((card) => card.id));

const collectionTitles = new Map<string, string>([
  ["core-en-module-01", "Empower · Tạo nghĩa và câu"],
  ["core-en-module-02", "Empower · Kiến trúc động từ"],
  ["core-en-module-03", "Empower · Hỏi và phủ định"],
  ["core-en-module-04", "Empower · Thời gian và tình thái"],
  ["core-en-module-05", "Empower · Danh từ và quy chiếu"],
  ["core-en-module-06", "Empower · Mở rộng mệnh đề"],
  ["core-en-module-07", "Empower · Mạch thông tin"],
  ["core-en-module-08", "Empower · Âm thanh và nghe"],
  ["core-en-module-09", "Empower · Mạng từ vựng"],
  ["core-en-module-10", "Empower · Tích hợp và sử dụng"],
]);

export const EMPOWER_KNOWLEDGE_COLLECTIONS: CardCollection[] = [...collectionTitles].flatMap(
  ([nodeId, title]) => {
    const cardIds = EMPOWER_KNOWLEDGE_CARDS.filter((card) => card.node_id === nodeId).map(
      (card) => card.id,
    );
    return cardIds.length
      ? [
          {
            id: `collection-empower-${nodeId.replace("core-en-module-", "")}`,
            title,
            description: "Kiến thức từ Empower A2 được nối vào đúng nguyên lý English Core.",
            rootNodeId: nodeId,
            status: "published" as const,
            cardIds,
          },
        ]
      : [];
  },
);

export const EMPOWER_VOCABULARY_REVIEW_NODE: ConceptNode = {
  id: "core-en-vocabulary-review",
  kind: "leaf",
  title: "Từ mới chờ Hiệp duyệt",
  purpose: "Bảy thẻ Vocabulary Focus được giữ riêng để duyệt trước khi học chính thức.",
  status: "review",
  source_refs: ["empower-a2-long-term-learning-review-v1"],
  maintainer: "hiep",
};

export const EMPOWER_VOCABULARY_REVIEW_EDGE: ConceptEdge = {
  from: "core-en-module-09",
  to: EMPOWER_VOCABULARY_REVIEW_NODE.id,
  type: "part_of",
};

export const EMPOWER_VOCABULARY_COLLECTION: CardCollection = {
  id: "collection-empower-vocabulary-review",
  title: "Empower · Từ mới",
  description: "Bảy thẻ từ mới chỉ vào lịch học sau khi Hiệp duyệt.",
  rootNodeId: EMPOWER_VOCABULARY_REVIEW_NODE.id,
  status: "review",
  cardIds: EMPOWER_VOCABULARY_DRAFT_CARDS.map((card) => card.id),
};

export const EMPOWER_CONTENT_VERSION = "empower-a2-knowledge-74-owner-approved-2026-09-04";
