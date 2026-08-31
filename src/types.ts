export type LearnerId = "hiep" | "hoang";

export const LEARNERS: ReadonlyArray<{ id: LearnerId; name: string; initial: string; tone: string }> = [
  { id: "hiep", name: "Hiệp", initial: "H", tone: "coral" },
  { id: "hoang", name: "Hoàng", initial: "H", tone: "blue" },
];

export type CardType = "core_recall" | "mechanism" | "contrast" | "boundary" | "application" | "production";
export type CardStatus = "draft" | "review" | "published" | "archived";
export type ReviewRating = "Again" | "Good";
export type AttemptKind = "mental" | "spoken" | "typed" | "written";

export interface Card {
  id: string;
  node_id: string;
  card_type: CardType;
  prompt: string;
  model_answer: string;
  explanation: string;
  misconception: string;
  transfer_prompt: string;
  scaffold_prompt?: string;
  scaffold_answer?: string;
  glossary_refs?: string[];
  prerequisite_node_ids: string[];
  source_refs: string[];
  status: CardStatus;
  author: string;
  reviewer: string | null;
}

export type NodeKind = "root" | "trunk" | "branch" | "leaf";

export interface ConceptNode {
  id: string;
  kind: NodeKind;
  title: string;
  purpose: string;
  status: string;
  source_refs: string[];
  maintainer: LearnerId;
}

export interface ConceptEdge {
  from: string;
  to: string;
  type: "prerequisite" | "part_of" | "contrasts_with" | "applies_to" | "example_of";
}

export interface PersistedFsrsCard {
  due: string;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  reps: number;
  lapses: number;
  learning_steps?: number;
  state: number;
  last_review?: string;
}

export interface LearnerCardState {
  learnerId: LearnerId;
  cardId: string;
  fsrs: PersistedFsrsCard;
  reviewCount: number;
  lastRating?: ReviewRating;
  lastReviewedAt?: string;
}

export interface ReviewEvent {
  id: string;
  idempotencyKey: string;
  learnerId: LearnerId;
  cardId: string;
  oldStateHash: string;
  newStateHash: string;
  rating: ReviewRating;
  attemptKind: AttemptKind;
  occurredAt: string;
  appVersion: string;
}

export interface LearnerSnapshot {
  learnerId: LearnerId;
  cardStates: Record<string, LearnerCardState>;
  reviewEvents: ReviewEvent[];
  dailyGoalMinutes: number;
}
