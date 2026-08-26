import { COLLECTION_FIXTURES } from "./collections";
import { APPROVED_CONTENT_VERSION, LEGACY_FIXTURE_COLLECTION_IDS } from "./approvedCurriculum";
import type { Card, LearnerId } from "./types";
import type { CardCollection, CollectionRunPlan, DailyQualification, CardDraft, RevisionRecord } from "./featureTypes";
import { recordDailyQualification } from "./streak";

export const WORKSPACE_STORAGE_KEY = "twogether.workspace.p0.v1";
type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;
export interface WorkspaceRun { plan: CollectionRunPlan; attempts: { cardId: string; attemptConfirmed: boolean }[]; status: "active" | "qualified" | "ended_incomplete" }
export interface WorkspaceStore {
  version: 2;
  contentVersion: string;
  collections: CardCollection[];
  dailyQualifications: DailyQualification[];
  runs: Record<string, WorkspaceRun>;
  cards: CardDraft[];
  revisions: RevisionRecord[];
}

function clone<T>(value: T): T { return JSON.parse(JSON.stringify(value)) as T; }
function defaultStorage(): StorageLike {
  if (typeof window !== "undefined" && window.localStorage) return window.localStorage;
  const data = new Map<string, string>();
  return { getItem: (key) => data.get(key) ?? null, setItem: (key, value) => data.set(key, value), removeItem: (key) => data.delete(key) };
}
export function createWorkspaceMemoryStorage(): StorageLike {
  const data = new Map<string, string>();
  return { getItem: (key) => data.get(key) ?? null, setItem: (key, value) => data.set(key, value), removeItem: (key) => data.delete(key) };
}
function freshWorkspace(): WorkspaceStore {
  return {
    version: 2,
    contentVersion: APPROVED_CONTENT_VERSION,
    collections: COLLECTION_FIXTURES.map((collection) => clone(collection)),
    dailyQualifications: [],
    runs: {},
    cards: [],
    revisions: [],
  };
}
function migrateWorkspace(value: unknown): WorkspaceStore | null {
  if (!value || typeof value !== "object") return null;
  const parsed = value as Partial<WorkspaceStore> & { version?: number };
  if (!Array.isArray(parsed.collections) || !Array.isArray(parsed.dailyQualifications) || !parsed.runs || !Array.isArray(parsed.cards) || !Array.isArray(parsed.revisions)) return null;
  const currentIds = new Set(COLLECTION_FIXTURES.map((collection) => collection.id));
  const learnerCollections = parsed.collections.filter((collection) =>
    !LEGACY_FIXTURE_COLLECTION_IDS.has(collection.id) && !currentIds.has(collection.id),
  );
  return {
    version: 2,
    contentVersion: APPROVED_CONTENT_VERSION,
    collections: [...COLLECTION_FIXTURES.map((collection) => clone(collection)), ...clone(learnerCollections)],
    dailyQualifications: clone(parsed.dailyQualifications),
    runs: clone(parsed.runs),
    cards: clone(parsed.cards),
    revisions: clone(parsed.revisions),
  };
}
export function readWorkspace(storage: StorageLike = defaultStorage()): WorkspaceStore {
  const raw = storage.getItem(WORKSPACE_STORAGE_KEY);
  if (!raw) return freshWorkspace();
  try {
    const migrated = migrateWorkspace(JSON.parse(raw));
    if (migrated) {
      storage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(migrated));
      return migrated;
    }
  } catch { /* recover with a clean workspace without touching review history */ }
  return freshWorkspace();
}
export function writeWorkspace(workspace: WorkspaceStore, storage: StorageLike = defaultStorage()): void { storage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(workspace)); }
export function listCollections(storage: StorageLike = defaultStorage()): CardCollection[] { return clone(readWorkspace(storage).collections.filter((collection) => collection.status !== "archived")); }
export function getWorkspaceCards(baseCards: readonly Card[], storage: StorageLike = defaultStorage()): Card[] {
  const workspace = readWorkspace(storage);
  const overrides = new Map(workspace.cards.map((card) => [card.id, card]));
  const merged = baseCards.map((card) => overrides.get(card.id) ?? card);
  const baseIds = new Set(baseCards.map((card) => card.id));
  return [...merged, ...workspace.cards.filter((card) => !baseIds.has(card.id))].map(clone);
}
export function saveCardDraft(card: CardDraft, storage: StorageLike = defaultStorage()): void {
  const workspace = readWorkspace(storage);
  const previous = workspace.cards.find((candidate) => candidate.id === card.id);
  const nextRevision = workspace.revisions.filter((revision) => revision.cardId === card.id).reduce((max, revision) => Math.max(max, revision.revision), 0) + 1;
  workspace.cards = [...workspace.cards.filter((candidate) => candidate.id !== card.id), clone({ ...card, status: "draft", reviewer: null, revisionNo: nextRevision })];
  workspace.revisions.push({ id: `${card.id}-revision-${nextRevision}`, cardId: card.id, revision: nextRevision, status: "draft", archivedAt: null, createdAt: new Date().toISOString(), createdBy: card.author, changeSummary: previous ? "Bản chỉnh sửa mới" : "Card mới từ người học/AI" });
  writeWorkspace(workspace, storage);
}
export function publishCardDraft(cardId: string, storage: StorageLike = defaultStorage()): void {
  const workspace = readWorkspace(storage);
  const card = workspace.cards.find((candidate) => candidate.id === cardId);
  if (!card) return;
  workspace.cards = [...workspace.cards.filter((candidate) => candidate.id !== cardId), { ...card, status: "published", reviewer: "local-human" }];
  workspace.revisions = workspace.revisions.map((revision) => revision.cardId === cardId && revision.status === "draft" ? { ...revision, status: "approved" } : revision);
  writeWorkspace(workspace, storage);
}
export function archiveCard(cardId: string, storage: StorageLike = defaultStorage()): void {
  const workspace = readWorkspace(storage);
  const card = workspace.cards.find((candidate) => candidate.id === cardId);
  if (!card) return;
  workspace.cards = [...workspace.cards.filter((candidate) => candidate.id !== cardId), { ...card, status: "archived" }];
  workspace.revisions = workspace.revisions.map((revision) => revision.cardId === cardId ? { ...revision, archivedAt: new Date().toISOString() } : revision);
  writeWorkspace(workspace, storage);
}
export function saveRun(run: WorkspaceRun, storage: StorageLike = defaultStorage()): void { const workspace = readWorkspace(storage); workspace.runs[run.plan.id] = clone(run); writeWorkspace(workspace, storage); }
export function loadRun(runId: string, storage: StorageLike = defaultStorage()): WorkspaceRun | null { const run = readWorkspace(storage).runs[runId]; return run ? clone(run) : null; }
export function addRunAttempt(runId: string, learnerId: LearnerId, cardId: string, storage: StorageLike = defaultStorage()): WorkspaceRun | null {
  const workspace = readWorkspace(storage);
  const run = workspace.runs[runId];
  if (!run || run.plan.learnerId !== learnerId) return null;
  if (!run.attempts.some((attempt) => attempt.cardId === cardId && attempt.attemptConfirmed)) run.attempts.push({ cardId, attemptConfirmed: true });
  workspace.runs[runId] = run;
  writeWorkspace(workspace, storage);
  return clone(run);
}
export function qualifyAndPersistRun(runId: string, at = new Date(), storage: StorageLike = defaultStorage()): { run: WorkspaceRun | null; didQualify: boolean; dailyQualifications: DailyQualification[] } {
  const workspace = readWorkspace(storage);
  const run = workspace.runs[runId];
  if (!run || run.status === "qualified") return { run: run ? clone(run) : null, didQualify: false, dailyQualifications: clone(workspace.dailyQualifications) };
  const nextQualifications = recordDailyQualification(workspace.dailyQualifications, run.plan, run.attempts, at);
  const didQualify = nextQualifications.length > workspace.dailyQualifications.length;
  run.status = didQualify ? "qualified" : run.status;
  workspace.runs[runId] = run;
  workspace.dailyQualifications = nextQualifications;
  writeWorkspace(workspace, storage);
  return { run: clone(run), didQualify, dailyQualifications: clone(nextQualifications) };
}
export function readDailyQualifications(storage: StorageLike = defaultStorage()): DailyQualification[] { return clone(readWorkspace(storage).dailyQualifications); }
