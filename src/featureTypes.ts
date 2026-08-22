import type { Card, LearnerId } from "./types";

export type CollectionStatus = "draft" | "review" | "published" | "archived";
export type RevisionStatus = "draft" | "in_review" | "approved" | "rejected" | "superseded";

export interface CardCollection {
  id: string;
  title: string;
  description: string;
  rootNodeId: string | null;
  status: CollectionStatus;
  cardIds: string[];
}

export interface CollectionRunPlan {
  id: string;
  learnerId: LearnerId;
  collectionId: string;
  requiredCardIds: string[];
  createdAt: string;
  timezone: string;
}

export interface RunAttempt {
  cardId: string;
  attemptConfirmed: boolean;
}

export interface DailyQualification {
  learnerId: LearnerId;
  localDate: string;
  timezone: string;
  collectionId: string;
  runId: string;
  qualifiedAt: string;
}

export interface RevisionRecord {
  id: string;
  cardId: string;
  revision: number;
  status: RevisionStatus;
  archivedAt: string | null;
  createdAt: string;
  createdBy: string;
  changeSummary: string;
}

export interface CardDraft extends Card {
  revisionOf?: string;
  revisionNo?: number;
}
