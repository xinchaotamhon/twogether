import curriculumGraph from "../content/drafts/core-curriculum-drafts-v2.json";
import beginnerCurriculum from "../content/drafts/english-core-beginner-revision-v2.json";
import ownerApproval from "../content/reviews/english-generative-core-v2-owner-approval-2026-09-01.json";
import transferRevision from "../content/revisions/english-core-transfer-novelty-v3.json";
import type { CardCollection } from "./featureTypes";
import type { Card, ConceptEdge, ConceptNode } from "./types";

interface SourceCard extends Card {
  track: "english" | "react";
  revision_of?: string;
  revision_reason?: string;
}
interface SourceCollection {
  id: string;
  track: "english" | "react";
  node_id: string;
  title: string;
  card_ids: string[];
  status: "draft" | "review";
}
interface SourcePacket {
  schema_version: number;
  curriculum_id: string;
  cards: SourceCard[];
  nodes?: ConceptNode[];
  edges?: ConceptEdge[];
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

const graphPacket = curriculumGraph as SourcePacket;
const packet = beginnerCurriculum as SourcePacket;
const approval = ownerApproval as ApprovalManifest;
const approvedCardIds = new Set(approval.card_ids);
const approvedCollectionIds = new Set(approval.collection_ids);

function assertApproval(): void {
  const englishIds = packet.cards.filter((card) => card.track === "english").map((card) => card.id);
  const collectionIds = packet.collections.filter((collection) => collection.track === "english").map((collection) => collection.id);
  if (
    packet.schema_version !== 1
    || packet.curriculum_id !== approval.curriculum_id
    || approval.schema_version !== 1
    || approval.decision !== "approved_for_published_study"
    || approval.decided_by !== "hiep"
    || englishIds.length !== 89
    || approval.card_ids.length !== 89
    || new Set(approval.card_ids).size !== 89
    || englishIds.some((id) => !approvedCardIds.has(id))
    || collectionIds.length !== 10
    || approval.collection_ids.length !== 10
    || collectionIds.some((id) => !approvedCollectionIds.has(id))
    || packet.cards.some((card) => card.status !== "review")
  ) throw new Error("English Core v2 approval manifest không khớp packet nguồn.");
}

assertApproval();

export const APPROVED_CONTENT_VERSION = "english-tree-core-v2-plus-empower-knowledge-2026-09-04";
export const LEGACY_FIXTURE_COLLECTION_IDS = new Set(["english-foundations", "english-mechanism-lab"]);
export const LEGACY_FIXTURE_CARD_IDS = new Set([
  "fixture-recall-01", "fixture-recall-02", "fixture-recall-03",
  "fixture-mechanism-01", "fixture-mechanism-02", "fixture-mechanism-03",
  "fixture-transfer-01", "fixture-transfer-02", "fixture-transfer-03",
  "fixture-foundation-01", "fixture-foundation-02", "fixture-foundation-03",
]);

const transferOverrides = new Map(transferRevision.overrides.map(({ card_id, ...fields }) => [card_id, fields]));

export const APPROVED_ENGLISH_CARDS: Card[] = packet.cards
  .filter((card) => card.track === "english" && approvedCardIds.has(card.id))
  .map(({ track: _track, revision_of: _revisionOf, revision_reason: _revisionReason, ...card }) => ({
    ...card,
    ...transferOverrides.get(card.id),
    status: "published",
    reviewer: "hiep",
  }));

export const APPROVED_ENGLISH_CARD_IDS = new Set(APPROVED_ENGLISH_CARDS.map((card) => card.id));

const approvedNodeIds = new Set(APPROVED_ENGLISH_CARDS.map((card) => card.node_id));
export const APPROVED_ENGLISH_NODES: ConceptNode[] = (graphPacket.nodes ?? [])
  .filter((node) => approvedNodeIds.has(node.id))
  .map((node) => ({ ...node, status: "published" }));

export const APPROVED_ENGLISH_EDGES: ConceptEdge[] = (graphPacket.edges ?? [])
  .filter((edge) => approvedNodeIds.has(edge.from) && approvedNodeIds.has(edge.to))
  .map((edge) => ({ ...edge }));

export const APPROVED_ENGLISH_COLLECTIONS: CardCollection[] = packet.collections
  .filter((collection) => collection.track === "english" && approvedCollectionIds.has(collection.id))
  .map((collection) => ({
    id: collection.id,
    title: collection.title,
    description: (graphPacket.nodes ?? []).find((node) => node.id === collection.node_id)?.purpose ?? "Một bộ thẻ đi từ nguyên lý đến chuyển giao.",
    rootNodeId: collection.node_id,
    status: "published",
    cardIds: [...collection.card_ids],
  }));
