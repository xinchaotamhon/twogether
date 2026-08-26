import {
  APPROVED_CONTENT_VERSION,
  APPROVED_ENGLISH_CARDS,
  APPROVED_ENGLISH_EDGES,
  APPROVED_ENGLISH_NODES,
} from "./approvedCurriculum";
import { applyRating, createInitialFsrsCard } from "./scheduler";
import type {
  AttemptKind,
  Card,
  ConceptEdge,
  ConceptNode,
  LearnerCardState,
  LearnerId,
  LearnerSnapshot,
  ReviewEvent,
  ReviewRating,
} from "./types";

export const LOCAL_DATA_STORAGE_KEY = "twogether.local.p0.v1";
const APP_VERSION = "0.2.0-local";

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;
type LocalStore = {
  version: 2;
  contentVersion: string;
  learners: Record<LearnerId, LearnerSnapshot>;
};
type StoredLearners = { learners?: Partial<Record<LearnerId, unknown>> };

export class AuthorizationError extends Error {
  constructor(message = "Learner scope does not match the active session") {
    super(message);
    this.name = "AuthorizationError";
  }
}

export class ReviewConflictError extends Error {
  constructor(message = "Review state changed; refresh before retrying") {
    super(message);
    this.name = "ReviewConflictError";
  }
}

export interface RecordReviewInput {
  sessionLearnerId: LearnerId;
  requestedLearnerId: LearnerId;
  cardId: string;
  rating: ReviewRating;
  attemptKind: AttemptKind;
  occurredAt: Date;
  idempotencyKey: string;
  oldStateHash: string;
}

export interface RecordReviewResult {
  event: ReviewEvent;
  snapshot: LearnerSnapshot;
  intervalLabel: string;
}

export interface DataAdapter {
  listCards(): Card[];
  listNodes(): ConceptNode[];
  listEdges(): ConceptEdge[];
  readLearner(requestedLearnerId: LearnerId, sessionLearnerId: LearnerId): LearnerSnapshot;
  recordReview(input: RecordReviewInput): RecordReviewResult;
  clearLocalData(): void;
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function hashCardState(state: LearnerCardState): string {
  const input = JSON.stringify(state.fsrs);
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `fnv1a-${(hash >>> 0).toString(16)}`;
}

export function createMemoryStorage(): StorageLike {
  const data = new Map<string, string>();
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, value),
    removeItem: (key) => data.delete(key),
  };
}

function defaultStorage(): StorageLike {
  if (typeof window !== "undefined" && window.localStorage) return window.localStorage;
  return createMemoryStorage();
}

function emptyLearner(learnerId: LearnerId, cards: Card[]): LearnerSnapshot {
  return {
    learnerId,
    cardStates: Object.fromEntries(
      cards.map((card) => [
        card.id,
        {
          learnerId,
          cardId: card.id,
          fsrs: createInitialFsrsCard(),
          reviewCount: 0,
        } satisfies LearnerCardState,
      ]),
    ),
    reviewEvents: [],
    dailyGoalMinutes: 15,
  };
}

function defaultStore(cards: Card[]): LocalStore {
  return {
    version: 2,
    contentVersion: APPROVED_CONTENT_VERSION,
    learners: {
      hiep: emptyLearner("hiep", cards),
      hoang: emptyLearner("hoang", cards),
    },
  };
}

function migrateLearner(value: unknown, learnerId: LearnerId, cards: Card[]): LearnerSnapshot {
  const candidate = value && typeof value === "object" ? value as Partial<LearnerSnapshot> : {};
  const existingStates: Record<string, LearnerCardState> = candidate.cardStates && typeof candidate.cardStates === "object"
    ? clone(candidate.cardStates)
    : {};
  for (const card of cards) {
    if (!existingStates[card.id]) {
      existingStates[card.id] = {
        learnerId,
        cardId: card.id,
        fsrs: createInitialFsrsCard(),
        reviewCount: 0,
      };
    }
  }
  return {
    learnerId,
    cardStates: existingStates,
    reviewEvents: Array.isArray(candidate.reviewEvents) ? clone(candidate.reviewEvents) : [],
    dailyGoalMinutes: typeof candidate.dailyGoalMinutes === "number" ? candidate.dailyGoalMinutes : 15,
  };
}

function migrateStore(value: unknown, cards: Card[]): LocalStore | null {
  if (!value || typeof value !== "object") return null;
  const learners = (value as StoredLearners).learners;
  if (!learners || !learners.hiep || !learners.hoang) return null;
  return {
    version: 2,
    contentVersion: APPROVED_CONTENT_VERSION,
    learners: {
      hiep: migrateLearner(learners.hiep, "hiep", cards),
      hoang: migrateLearner(learners.hoang, "hoang", cards),
    },
  };
}

export function createLocalDataAdapter(storage: StorageLike = defaultStorage()): DataAdapter {
  const cards = APPROVED_ENGLISH_CARDS;
  const nodes = APPROVED_ENGLISH_NODES;
  const edges = APPROVED_ENGLISH_EDGES;

  const load = (): LocalStore => {
    const raw = storage.getItem(LOCAL_DATA_STORAGE_KEY);
    if (!raw) {
      const fresh = defaultStore(cards);
      storage.setItem(LOCAL_DATA_STORAGE_KEY, JSON.stringify(fresh));
      return fresh;
    }
    try {
      const parsed: unknown = JSON.parse(raw);
      const migrated = migrateStore(parsed, cards);
      if (migrated) {
        storage.setItem(LOCAL_DATA_STORAGE_KEY, JSON.stringify(migrated));
        return migrated;
      }
    } catch {
      // A malformed local cache is disposable; review history cannot be recovered from invalid JSON.
    }
    const fresh = defaultStore(cards);
    storage.setItem(LOCAL_DATA_STORAGE_KEY, JSON.stringify(fresh));
    return fresh;
  };

  const save = (store: LocalStore): void => storage.setItem(LOCAL_DATA_STORAGE_KEY, JSON.stringify(store));

  return {
    listCards: () => clone(cards),
    listNodes: () => clone(nodes),
    listEdges: () => clone(edges),
    readLearner: (requestedLearnerId, sessionLearnerId) => {
      if (requestedLearnerId !== sessionLearnerId) throw new AuthorizationError();
      const store = load();
      return clone(store.learners[sessionLearnerId]);
    },
    recordReview: (input) => {
      if (input.sessionLearnerId !== input.requestedLearnerId) throw new AuthorizationError();
      const store = load();
      const learner = store.learners[input.sessionLearnerId];
      const duplicate = learner.reviewEvents.find((event) => event.idempotencyKey === input.idempotencyKey);
      if (duplicate) {
        return { event: clone(duplicate), snapshot: clone(learner), intervalLabel: "đã ghi trước đó" };
      }
      const current = learner.cardStates[input.cardId];
      if (!current || hashCardState(current) !== input.oldStateHash) throw new ReviewConflictError();
      const next = applyRating(current.fsrs, input.rating, input.occurredAt);
      const nextState: LearnerCardState = {
        ...current,
        fsrs: next.fsrs,
        reviewCount: current.reviewCount + 1,
        lastRating: input.rating,
        lastReviewedAt: input.occurredAt.toISOString(),
      };
      const event: ReviewEvent = {
        id: `${input.sessionLearnerId}-${input.idempotencyKey}`,
        idempotencyKey: input.idempotencyKey,
        learnerId: input.sessionLearnerId,
        cardId: input.cardId,
        oldStateHash: input.oldStateHash,
        newStateHash: hashCardState(nextState),
        rating: input.rating,
        attemptKind: input.attemptKind,
        occurredAt: input.occurredAt.toISOString(),
        appVersion: APP_VERSION,
      };
      learner.cardStates[input.cardId] = nextState;
      learner.reviewEvents.push(event);
      save(store);
      return { event: clone(event), snapshot: clone(learner), intervalLabel: next.intervalLabel };
    },
    clearLocalData: () => storage.removeItem(LOCAL_DATA_STORAGE_KEY),
  };
}

export const localDataAdapter = createLocalDataAdapter();
