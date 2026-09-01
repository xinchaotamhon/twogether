import type { SupabaseClient } from "@supabase/supabase-js";
import { applyRating, createInitialFsrsCard } from "./scheduler";
import {
  AuthorizationError,
  hashCardState,
  ReviewConflictError,
  type DataAdapter,
  type RecordReviewInput,
  type RecordReviewResult,
} from "./dataAdapter";
import type {
  Card,
  ConceptEdge,
  ConceptNode,
  LearnerCardState,
  LearnerId,
  LearnerSnapshot,
  ReviewEvent,
} from "./types";
import type { CollectionRunPlan, DailyQualification } from "./featureTypes";
import type { StreakProjection } from "./streak";
import { localDataAdapter } from "./dataAdapter";
import { readDailyQualifications } from "./localWorkspace";

const APP_VERSION = "0.1.0-supabase";

export interface SupabaseDataAdapter extends DataAdapter {
  initialize(): Promise<void>;
  recordReviewAsync(input: RecordReviewInput): Promise<RecordReviewResult>;
  reload(): Promise<void>;
  startRun(plan: CollectionRunPlan): Promise<void>;
  finalizeRun(
    runId: string,
    completedAt: Date,
    timezone: string,
  ): Promise<StreakProjection>;
  readStreak(): Promise<StreakProjection>;
}

type RemoteEvent = {
  id: string;
  learner_id: LearnerId;
  card_id: string;
  idempotency_key: string;
  old_state_hash: string;
  new_state_hash: string;
  rating: "Again" | "Good";
  attempt_kind: "mental" | "spoken" | "typed" | "written";
  occurred_at: string;
  app_version: string;
};

type RemoteReviewResponse = {
  duplicate: boolean;
  event: RemoteEvent;
};

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function requireLearner(value: string): LearnerId {
  if (value === "hiep" || value === "hoang") return value;
  throw new AuthorizationError("Tài khoản chưa được allowlist trong Supabase");
}

function toCard(row: Record<string, unknown>): Card {
  return {
    id: String(row.id),
    node_id: String(row.node_id),
    card_type: row.card_type as Card["card_type"],
    prompt: String(row.prompt),
    model_answer: String(row.model_answer),
    explanation: String(row.explanation),
    misconception: String(row.misconception),
    transfer_prompt: String(row.transfer_prompt),
    transfer_answer: row.transfer_answer
      ? String(row.transfer_answer)
      : undefined,
    scaffold_prompt: row.scaffold_prompt
      ? String(row.scaffold_prompt)
      : undefined,
    scaffold_answer: row.scaffold_answer
      ? String(row.scaffold_answer)
      : undefined,
    glossary_refs: Array.isArray(row.glossary_refs)
      ? row.glossary_refs.map(String)
      : undefined,
    prerequisite_node_ids: Array.isArray(row.prerequisite_node_ids)
      ? row.prerequisite_node_ids.map(String)
      : [],
    source_refs: Array.isArray(row.source_refs)
      ? row.source_refs.map(String)
      : [],
    status: row.status as Card["status"],
    author: String(row.author),
    reviewer: row.reviewer ? String(row.reviewer) : null,
  };
}

function toNode(row: Record<string, unknown>): ConceptNode {
  return {
    id: String(row.id),
    kind: row.kind as ConceptNode["kind"],
    title: String(row.title),
    purpose: String(row.purpose),
    status: String(row.status),
    source_refs: Array.isArray(row.source_refs)
      ? row.source_refs.map(String)
      : [],
    maintainer: row.maintainer === "hoang" ? "hoang" : "hiep",
  };
}

function toEdge(row: Record<string, unknown>): ConceptEdge {
  return {
    from: String(row.from_node_id),
    to: String(row.to_node_id),
    type: row.edge_type as ConceptEdge["type"],
  };
}

function toReviewEvent(row: RemoteEvent): ReviewEvent {
  return {
    id: String(row.id),
    idempotencyKey: row.idempotency_key,
    learnerId: row.learner_id,
    cardId: row.card_id,
    oldStateHash: row.old_state_hash,
    newStateHash: row.new_state_hash,
    rating: row.rating,
    attemptKind: row.attempt_kind,
    occurredAt: row.occurred_at,
    appVersion: row.app_version,
  };
}

function emptySnapshot(learnerId: LearnerId, cards: Card[]): LearnerSnapshot {
  return {
    learnerId,
    cardStates: Object.fromEntries(
      cards.map((card) => {
        const state: LearnerCardState = {
          learnerId,
          cardId: card.id,
          fsrs: createInitialFsrsCard(),
          reviewCount: 0,
        };
        return [card.id, state];
      }),
    ),
    reviewEvents: [],
    dailyGoalMinutes: 15,
  };
}

function remoteError(scope: string, error: { message?: string } | null): Error {
  if (error?.message?.includes("review_conflict"))
    return new ReviewConflictError(
      "Thẻ đã được ôn trên thiết bị khác; hãy tải lại tiến độ.",
    );
  return new Error(`${scope}: ${error?.message ?? "unknown Supabase error"}`);
}

export async function importLocalLearningState(
  client: SupabaseClient,
  learnerId: LearnerId,
): Promise<"imported" | "duplicate" | "skipped" | "remote-not-empty"> {
  const snapshot = localDataAdapter.readLearner(learnerId, learnerId);
  const qualifications = readDailyQualifications().filter(
    (event) => event.learnerId === learnerId,
  );
  if (snapshot.reviewEvents.length === 0 && qualifications.length === 0)
    return "skipped";

  const backupKey = `twogether.cloud-import-backup.v1.${learnerId}`;
  if (
    typeof window !== "undefined" &&
    !window.localStorage.getItem(backupKey)
  ) {
    window.localStorage.setItem(
      backupKey,
      JSON.stringify({
        backedUpAt: new Date().toISOString(),
        snapshot,
        qualifications,
      }),
    );
  }
  const lastEvent = snapshot.reviewEvents.at(-1);
  const importKey = `${learnerId}:${snapshot.reviewEvents.length}:${lastEvent?.idempotencyKey ?? "none"}:${qualifications.length}`;
  const states = Object.values(snapshot.cardStates).map((state) => ({
    cardId: state.cardId,
    fsrs: state.fsrs,
    stateHash: hashCardState(state),
    reviewCount: state.reviewCount,
    lastRating: state.lastRating ?? "",
    lastReviewedAt: state.lastReviewedAt ?? "",
  }));
  const { data, error } = await client.rpc("import_local_learning_state", {
    p_import_key: importKey,
    p_states: states,
    p_events: snapshot.reviewEvents,
    p_qualifications: qualifications satisfies DailyQualification[],
  });
  if (error?.message?.includes("remote_history_not_empty"))
    return "remote-not-empty";
  if (error) throw remoteError("import_local_learning_state", error);
  return (data as { duplicate?: boolean } | null)?.duplicate
    ? "duplicate"
    : "imported";
}

export function createSupabaseDataAdapter(
  client: SupabaseClient,
  sessionLearnerId: LearnerId,
): SupabaseDataAdapter {
  let cards: Card[] = [];
  let nodes: ConceptNode[] = [];
  let edges: ConceptEdge[] = [];
  let snapshot = emptySnapshot(sessionLearnerId, cards);
  let initialized = false;
  let loadedStateIds = new Set<string>();

  const loadLearnerState = async (): Promise<void> => {
    const [
      { data: stateRows, error: stateError },
      { data: eventRows, error: eventError },
      { data: preferenceRow, error: preferenceError },
    ] = await Promise.all([
      client
        .from("learner_card_states")
        .select("*")
        .eq("learner_id", sessionLearnerId),
      client
        .from("review_events")
        .select("*")
        .eq("learner_id", sessionLearnerId)
        .order("occurred_at", { ascending: true }),
      client
        .from("learner_preferences")
        .select("daily_goal_minutes")
        .eq("learner_id", sessionLearnerId)
        .maybeSingle(),
    ]);
    if (stateError) throw remoteError("learner_card_states", stateError);
    if (eventError) throw remoteError("review_events", eventError);
    if (preferenceError)
      throw remoteError("learner_preferences", preferenceError);

    snapshot = emptySnapshot(sessionLearnerId, cards);
    loadedStateIds = new Set(
      (stateRows ?? []).map((row) =>
        String((row as Record<string, unknown>).card_id),
      ),
    );
    for (const row of (stateRows ?? []) as Array<Record<string, unknown>>) {
      const cardId = String(row.card_id);
      if (!snapshot.cardStates[cardId]) continue;
      snapshot.cardStates[cardId] = {
        learnerId: sessionLearnerId,
        cardId,
        fsrs: row.fsrs as LearnerCardState["fsrs"],
        reviewCount: Number(row.review_count ?? 0),
        lastRating: row.last_rating as LearnerCardState["lastRating"],
        lastReviewedAt: row.last_reviewed_at
          ? String(row.last_reviewed_at)
          : undefined,
      };
    }
    snapshot.reviewEvents = ((eventRows ?? []) as RemoteEvent[]).map(
      toReviewEvent,
    );
    snapshot.dailyGoalMinutes = Number(
      (preferenceRow as { daily_goal_minutes?: number } | null)
        ?.daily_goal_minutes ?? 15,
    );
  };

  const initialize = async (): Promise<void> => {
    const [
      { data: cardRows, error: cardError },
      { data: nodeRows, error: nodeError },
      { data: edgeRows, error: edgeError },
    ] = await Promise.all([
      client.from("cards").select("*").eq("status", "published").order("id"),
      client
        .from("concept_nodes")
        .select("*")
        .in("status", ["published", "fixture"])
        .order("id"),
      client
        .from("concept_edges")
        .select("*")
        .order("from_node_id")
        .order("to_node_id"),
    ]);
    if (cardError) throw remoteError("cards", cardError);
    if (nodeError) throw remoteError("concept_nodes", nodeError);
    if (edgeError) throw remoteError("concept_edges", edgeError);

    cards = ((cardRows ?? []) as Array<Record<string, unknown>>).map(toCard);
    nodes = ((nodeRows ?? []) as Array<Record<string, unknown>>).map(toNode);
    edges = ((edgeRows ?? []) as Array<Record<string, unknown>>).map(toEdge);
    if (cards.length === 0)
      throw new Error(
        "No published cards; run supabase/seed.sql before signing in",
      );
    await loadLearnerState();

    const missingStates = Object.values(snapshot.cardStates)
      .filter((state) => !loadedStateIds.has(state.cardId))
      .map((state) => ({
        learner_id: sessionLearnerId,
        card_id: state.cardId,
        fsrs: state.fsrs,
        state_hash: hashCardState(state),
        review_count: 0,
      }));
    if (missingStates.length > 0) {
      const { error } = await client
        .from("learner_card_states")
        .upsert(missingStates, {
          onConflict: "learner_id,card_id",
          ignoreDuplicates: true,
        });
      if (error) throw remoteError("learner_card_states seed", error);
    }
    const { error: preferenceUpsertError } = await client
      .from("learner_preferences")
      .upsert(
        {
          learner_id: sessionLearnerId,
          daily_goal_minutes: snapshot.dailyGoalMinutes,
          timezone: "Asia/Ho_Chi_Minh",
        },
        { onConflict: "learner_id", ignoreDuplicates: true },
      );
    if (preferenceUpsertError)
      throw remoteError("learner_preferences seed", preferenceUpsertError);
    initialized = true;
  };

  const assertReady = (): void => {
    if (!initialized) throw new Error("Supabase adapter is not initialized");
  };

  const recordReviewAsync = async (
    input: RecordReviewInput,
  ): Promise<RecordReviewResult> => {
    assertReady();
    if (
      input.sessionLearnerId !== sessionLearnerId ||
      input.requestedLearnerId !== sessionLearnerId
    )
      throw new AuthorizationError();
    const duplicate = snapshot.reviewEvents.find(
      (event) => event.idempotencyKey === input.idempotencyKey,
    );
    if (duplicate)
      return {
        event: clone(duplicate),
        snapshot: clone(snapshot),
        intervalLabel: "đã ghi trước đó",
      };

    const current = snapshot.cardStates[input.cardId];
    if (!current || hashCardState(current) !== input.oldStateHash)
      throw new ReviewConflictError();
    const next = applyRating(current.fsrs, input.rating, input.occurredAt);
    const nextState: LearnerCardState = {
      ...current,
      fsrs: next.fsrs,
      reviewCount: current.reviewCount + 1,
      lastRating: input.rating,
      lastReviewedAt: input.occurredAt.toISOString(),
    };
    const optimisticEvent: ReviewEvent = {
      id: `${sessionLearnerId}-${input.idempotencyKey}`,
      idempotencyKey: input.idempotencyKey,
      learnerId: sessionLearnerId,
      cardId: input.cardId,
      oldStateHash: input.oldStateHash,
      newStateHash: hashCardState(nextState),
      rating: input.rating,
      attemptKind: input.attemptKind,
      occurredAt: input.occurredAt.toISOString(),
      appVersion: APP_VERSION,
    };
    const { data, error } = await client.rpc("record_review_v2", {
      p_card_id: input.cardId,
      p_rating: input.rating,
      p_attempt_kind: input.attemptKind,
      p_occurred_at: input.occurredAt.toISOString(),
      p_idempotency_key: input.idempotencyKey,
      p_old_state_hash: input.oldStateHash,
      p_new_fsrs: nextState.fsrs,
      p_new_state_hash: optimisticEvent.newStateHash,
      p_review_count: nextState.reviewCount,
      p_app_version: APP_VERSION,
      p_run_id: input.runId ?? null,
    });
    if (error) throw remoteError("record_review_v2", error);

    const response = data as unknown as RemoteReviewResponse;
    if (response?.duplicate) {
      await loadLearnerState();
      const serverEvent = toReviewEvent(response.event);
      return {
        event: serverEvent,
        snapshot: clone(snapshot),
        intervalLabel: "đã ghi trước đó",
      };
    }
    const serverEvent = response?.event
      ? toReviewEvent(response.event)
      : optimisticEvent;
    snapshot = {
      ...snapshot,
      cardStates: { ...snapshot.cardStates, [input.cardId]: nextState },
      reviewEvents: [...snapshot.reviewEvents, serverEvent],
    };
    return {
      event: clone(serverEvent),
      snapshot: clone(snapshot),
      intervalLabel: next.intervalLabel,
    };
  };

  const startRun = async (plan: CollectionRunPlan): Promise<void> => {
    assertReady();
    if (plan.learnerId !== sessionLearnerId) throw new AuthorizationError();
    const { error } = await client.rpc("start_collection_run", {
      p_run_id: plan.id,
      p_collection_id: plan.collectionId,
      p_required_card_ids: plan.requiredCardIds,
      p_created_at: plan.createdAt,
      p_timezone: plan.timezone,
    });
    if (error) throw remoteError("start_collection_run", error);
  };

  const readStreak = async (): Promise<StreakProjection> => {
    assertReady();
    const { data, error } = await client.rpc("get_my_streak");
    if (error) throw remoteError("get_my_streak", error);
    const value = data as Partial<StreakProjection> | null;
    return {
      currentDays: Number(value?.currentDays ?? 0),
      bestDays: Number(value?.bestDays ?? 0),
      lastQualifiedDate: value?.lastQualifiedDate ?? null,
    };
  };

  const finalizeRun = async (
    runId: string,
    completedAt: Date,
    timezone: string,
  ): Promise<StreakProjection> => {
    assertReady();
    const { data, error } = await client.rpc("finalize_collection_run", {
      p_run_id: runId,
      p_completed_at: completedAt.toISOString(),
      p_timezone: timezone,
      p_repair_complete: true,
    });
    if (error) throw remoteError("finalize_collection_run", error);
    const value = data as Partial<StreakProjection> | null;
    return {
      currentDays: Number(value?.currentDays ?? 0),
      bestDays: Number(value?.bestDays ?? 0),
      lastQualifiedDate: value?.lastQualifiedDate ?? null,
    };
  };

  return {
    initialize,
    listCards: () => {
      assertReady();
      return clone(cards);
    },
    listNodes: () => {
      assertReady();
      return clone(nodes);
    },
    listEdges: () => {
      assertReady();
      return clone(edges);
    },
    readLearner: (requestedLearnerId, activeSessionLearnerId) => {
      assertReady();
      if (
        requestedLearnerId !== activeSessionLearnerId ||
        activeSessionLearnerId !== sessionLearnerId
      )
        throw new AuthorizationError();
      return clone(snapshot);
    },
    recordReview: () => {
      throw new Error("Use recordReviewAsync for the Supabase adapter");
    },
    recordReviewAsync,
    reload: loadLearnerState,
    startRun,
    finalizeRun,
    readStreak,
    clearLocalData: () => undefined,
  };
}
