import type { Card, ConceptEdge, LearnerId, LearnerSnapshot } from "./types";
import type { CardCollection, CollectionRunPlan, RunAttempt } from "./featureTypes";
import { APPROVED_ENGLISH_COLLECTIONS } from "./approvedCurriculum";
import {
  EMPOWER_KNOWLEDGE_COLLECTIONS,
  EMPOWER_VOCABULARY_COLLECTION,
} from "./empowerCurriculum";

/** Built-in collections are content-versioned; learner-created collections live in localWorkspace. */
export const COLLECTION_FIXTURES: readonly CardCollection[] = [
  ...APPROVED_ENGLISH_COLLECTIONS,
  ...EMPOWER_KNOWLEDGE_COLLECTIONS,
  EMPOWER_VOCABULARY_COLLECTION,
];

export function cardsInCollection(cards: readonly Card[], collection: CardCollection): Card[] {
  const allowed = new Set(collection.cardIds);
  const seen = new Set<string>();
  return cards.filter((card) => allowed.has(card.id) && !seen.has(card.id) && seen.add(card.id));
}

export function dueCardIdsForCollection(
  cards: readonly Card[],
  collection: CardCollection,
  snapshot: LearnerSnapshot,
  now = new Date(),
): string[] {
  return cardsInCollection(cards, collection)
    .filter((card) => {
      const state = snapshot.cardStates[card.id];
      return state && (state.reviewCount === 0 || new Date(state.fsrs.due) <= now);
    })
    .sort((a, b) => new Date(snapshot.cardStates[a.id].fsrs.due).getTime() - new Date(snapshot.cardStates[b.id].fsrs.due).getTime())
    .map((card) => card.id);
}

export function createRunPlan(input: {
  id: string;
  learnerId: LearnerId;
  collectionId: string;
  requiredCardIds: readonly string[];
  createdAt: Date;
  timezone: string;
}): CollectionRunPlan {
  return {
    id: input.id,
    learnerId: input.learnerId,
    collectionId: input.collectionId,
    requiredCardIds: [...new Set(input.requiredCardIds)],
    createdAt: input.createdAt.toISOString(),
    timezone: input.timezone,
  };
}

export function qualifyRun(plan: CollectionRunPlan, attempts: readonly RunAttempt[]): boolean {
  const required = new Set(plan.requiredCardIds);
  if (required.size === 0) return false;
  const handled = new Set(attempts.filter((attempt) => attempt.attemptConfirmed).map((attempt) => attempt.cardId));
  return [...required].every((cardId) => handled.has(cardId));
}

/** Returns true when adding a prerequisite edge would make a path back to its source. */
export function wouldCreatePrerequisiteCycle(edges: readonly ConceptEdge[], from: string, to: string): boolean {
  if (from === to) return true;
  const nextByNode = new Map<string, string[]>();
  for (const edge of edges) {
    if (edge.type !== "prerequisite") continue;
    nextByNode.set(edge.from, [...(nextByNode.get(edge.from) ?? []), edge.to]);
  }
  const pending = [to];
  const visited = new Set<string>();
  while (pending.length) {
    const current = pending.shift()!;
    if (current === from) return true;
    if (visited.has(current)) continue;
    visited.add(current);
    pending.push(...(nextByNode.get(current) ?? []));
  }
  return false;
}
