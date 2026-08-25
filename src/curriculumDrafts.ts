import curriculumDrafts from "../content/drafts/core-curriculum-drafts-v2.json";
import type { Card, CardType, ConceptEdge, ConceptNode } from "./types";

type CurriculumTrack = "english" | "react";

export interface CurriculumDraftCard extends Card {
  track: CurriculumTrack;
}

export interface CurriculumDraftCollection {
  id: string;
  title: string;
  description: string;
  rootNodeId: string;
  status: "draft";
  cardIds: string[];
}

interface RawCurriculumCollection {
  id: string;
  track: CurriculumTrack;
  node_id: string;
  title: string;
  card_ids: string[];
  status: "draft";
}

interface CurriculumDraftBundle {
  schema_version: number;
  status: "draft";
  cards: CurriculumDraftCard[];
  nodes: ConceptNode[];
  edges: ConceptEdge[];
  collections: RawCurriculumCollection[];
}

const bundle = curriculumDrafts as CurriculumDraftBundle;
const cardTypes: readonly CardType[] = ["core_recall", "mechanism", "contrast", "boundary", "application", "production"];

function isEnglishDraftCard(card: CurriculumDraftCard | undefined): card is CurriculumDraftCard {
  return Boolean(card && card.track === "english" && card.status === "draft");
}

function assertCurriculumDrafts(): void {
  if (bundle.schema_version !== 2 || bundle.status !== "draft") throw new Error("English Core v1 draft bundle không đúng phiên bản.");
  if (!bundle.cards.every((card) => cardTypes.includes(card.card_type))) throw new Error("English Core v1 có card type không hợp lệ.");
  const cardsById = new Map(bundle.cards.map((card) => [card.id, card]));
  const englishCards = bundle.cards.filter(isEnglishDraftCard);
  const englishCollections = bundle.collections.filter((collection) => collection.track === "english" && collection.status === "draft");
  const collectionIds = englishCollections.flatMap((collection) => collection.card_ids);
  if (
    englishCards.length !== 80
    || englishCollections.length !== 10
    || englishCollections.some((collection) => collection.card_ids.length !== 8)
    || collectionIds.length !== 80
    || new Set(collectionIds).size !== 80
    || collectionIds.some((id) => !isEnglishDraftCard(cardsById.get(id)))
  ) {
    throw new Error("English Core v1 phải có đúng 10 bộ nháp, mỗi bộ 8 card tiếng Anh.");
  }
}

assertCurriculumDrafts();

export const ENGLISH_CORE_DRAFT_CARDS = bundle.cards.filter(isEnglishDraftCard);
export const ENGLISH_CORE_DRAFT_CARDS_BY_ID = new Map(ENGLISH_CORE_DRAFT_CARDS.map((card) => [card.id, card]));
export const ENGLISH_CORE_DRAFT_CARD_IDS = new Set(ENGLISH_CORE_DRAFT_CARDS.map((card) => card.id));
export const ENGLISH_CORE_DRAFT_COLLECTIONS: CurriculumDraftCollection[] = bundle.collections
  .filter((collection) => collection.track === "english" && collection.status === "draft")
  .map((collection) => ({
    id: collection.id,
    title: collection.title,
    description: bundle.nodes.find((node) => node.id === collection.node_id)?.purpose ?? "Tám thẻ đi từ nguyên lý đến tự sinh và chuyển giao.",
    rootNodeId: collection.node_id,
    status: "draft",
    cardIds: [...collection.card_ids],
  }));

export function draftCardsForCollection(collectionId: string): CurriculumDraftCard[] {
  const collection = ENGLISH_CORE_DRAFT_COLLECTIONS.find((candidate) => candidate.id === collectionId);
  return collection ? collection.cardIds.map((id) => ENGLISH_CORE_DRAFT_CARDS_BY_ID.get(id)).filter(isEnglishDraftCard) : [];
}
