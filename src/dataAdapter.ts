import cardFixture from "../content/cards.json";
import nodeFixture from "../content/nodes.json";
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

const STORAGE_KEY = "twogether.local.p0.v1";
const APP_VERSION = "0.1.0-local";

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;
type LocalStore = { version: 1; learners: Record<LearnerId, LearnerSnapshot> };

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

function isLearner(value: string): value is LearnerId {
  return value === "hiep" || value === "hoang";
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
    version: 1,
    learners: {
      hiep: emptyLearner("hiep", cards),
      hoang: emptyLearner("hoang", cards),
    },
  };
}

function validStore(value: unknown): value is LocalStore {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<LocalStore>;
  const learners = candidate.learners as Record<string, unknown> | undefined;
  return candidate.version === 1
    && !!learners
    && Object.prototype.hasOwnProperty.call(learners, "hiep")
    && Object.prototype.hasOwnProperty.call(learners, "hoang");
}

export function createLocalDataAdapter(storage: StorageLike = defaultStorage()): DataAdapter {
  const cards = (cardFixture as { cards: Card[] }).cards;
  const nodes = (nodeFixture as { nodes: ConceptNode[] }).nodes;
  const edges = (nodeFixture as { edges: ConceptEdge[] }).edges;

  const load = (): LocalStore => {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) {
      const fresh = defaultStore(cards);
      storage.setItem(STORAGE_KEY, JSON.stringify(fresh));
      return fresh;
    }
    try {
      const parsed: unknown = JSON.parse(raw);
      if (validStore(parsed)) return parsed;
    } catch {
      // A malformed local cache is disposable demo state; start from the fixture.
    }
    const fresh = defaultStore(cards);
    storage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    return fresh;
  };

  const save = (store: LocalStore): void => storage.setItem(STORAGE_KEY, JSON.stringify(store));

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
        const state = learner.cardStates[input.cardId];
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
    clearLocalData: () => storage.removeItem(STORAGE_KEY),
  };
}

export const localDataAdapter = createLocalDataAdapter();
