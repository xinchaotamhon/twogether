import curriculumDrafts from "../content/drafts/core-curriculum-drafts-v2.json";
import ownerApproval from "../content/reviews/english-generative-core-v1-owner-approval-2026-08-26.json";
import type { CardCollection } from "./featureTypes";
import type { Card, ConceptEdge, ConceptNode } from "./types";

interface SourceCard extends Card { track: "english" | "react" }
interface SourceCollection {
  id: string;
  track: "english" | "react";
  node_id: string;
  title: string;
  card_ids: string[];
  status: "draft";
}
interface SourcePacket {
  schema_version: number;
  curriculum_id: string;
  cards: SourceCard[];
  nodes: ConceptNode[];
  edges: ConceptEdge[];
  collections: SourceCollection[];
}
interface ApprovalManifest {
  schema_version: number;
  decision_id: string;
  decided_by: string;
  decision: string;
  curriculum_id: string;
  card_ids: string[];
  collection_ids: string[];
}

const packet = curriculumDrafts as SourcePacket;
const approval = ownerApproval as ApprovalManifest;
const approvedCardIds = new Set(approval.card_ids);
const approvedCollectionIds = new Set(approval.collection_ids);

function assertApproval(): void {
  const englishIds = packet.cards.filter((card) => card.track === "english").map((card) => card.id);
  const collectionIds = packet.collections.filter((collection) => collection.track === "english").map((collection) => collection.id);
  if (
    packet.schema_version !== 2
    || packet.curriculum_id !== approval.curriculum_id
    || approval.schema_version !== 1
    || approval.decision !== "approved_for_published_study"
    || approval.decided_by !== "hiep"
    || englishIds.length !== 80
    || approval.card_ids.length !== 80
    || new Set(approval.card_ids).size !== 80
    || englishIds.some((id) => !approvedCardIds.has(id))
    || collectionIds.length !== 10
    || approval.collection_ids.length !== 10
    || collectionIds.some((id) => !approvedCollectionIds.has(id))
  ) throw new Error("English Core v1 approval manifest không khớp packet nguồn.");
}

assertApproval();

export const APPROVED_CONTENT_VERSION = "english-generative-core-v1-owner-approved-2026-08-26";
export const LEGACY_FIXTURE_COLLECTION_IDS = new Set(["english-foundations", "english-mechanism-lab"]);
export const LEGACY_FIXTURE_CARD_IDS = new Set([
  "fixture-recall-01", "fixture-recall-02", "fixture-recall-03",
  "fixture-mechanism-01", "fixture-mechanism-02", "fixture-mechanism-03",
  "fixture-transfer-01", "fixture-transfer-02", "fixture-transfer-03",
  "fixture-foundation-01", "fixture-foundation-02", "fixture-foundation-03",
]);

export const APPROVED_ENGLISH_CARDS: Card[] = packet.cards
  .filter((card) => card.track === "english" && approvedCardIds.has(card.id))
  .map(({ track: _track, ...card }) => ({ ...card, status: "published", reviewer: "hiep" }));

const approvedNodeIds = new Set(APPROVED_ENGLISH_CARDS.map((card) => card.node_id));
export const APPROVED_ENGLISH_NODES: ConceptNode[] = packet.nodes
  .filter((node) => approvedNodeIds.has(node.id))
  .map((node) => ({ ...node, status: "published" }));

export const APPROVED_ENGLISH_EDGES: ConceptEdge[] = packet.edges
  .filter((edge) => approvedNodeIds.has(edge.from) && approvedNodeIds.has(edge.to))
  .map((edge) => ({ ...edge }));

export const APPROVED_ENGLISH_COLLECTIONS: CardCollection[] = packet.collections
  .filter((collection) => collection.track === "english" && approvedCollectionIds.has(collection.id))
  .map((collection) => ({
    id: collection.id,
    title: collection.title,
    description: packet.nodes.find((node) => node.id === collection.node_id)?.purpose ?? "Tám thẻ từ nguyên lý đến chuyển giao.",
    rootNodeId: collection.node_id,
    status: "published",
    cardIds: [...collection.card_ids],
  }));
