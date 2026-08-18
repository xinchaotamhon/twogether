import { createEmptyCard, fsrs, Rating, type Card as FsrsCard, type Grade } from "ts-fsrs";
import type { PersistedFsrsCard, ReviewRating } from "./types";

export const DESIRED_RETENTION = 0.9;

const scheduler = fsrs({
  request_retention: DESIRED_RETENTION,
  enable_fuzz: false,
  enable_short_term: true,
  learning_steps: ["1m", "10m"],
  relearning_steps: ["10m"],
});

type SerializableCard = {
  due: Date | string;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  reps: number;
  lapses: number;
  learning_steps?: number;
  state: number;
  last_review?: Date | string;
};

const asSerializable = (card: FsrsCard): SerializableCard => card as unknown as SerializableCard;

export function serializeFsrsCard(card: FsrsCard): PersistedFsrsCard {
  const value = asSerializable(card);
  return {
    due: new Date(value.due).toISOString(),
    stability: value.stability,
    difficulty: value.difficulty,
    elapsed_days: value.elapsed_days,
    scheduled_days: value.scheduled_days,
    reps: value.reps,
    lapses: value.lapses,
    ...(value.learning_steps !== undefined ? { learning_steps: value.learning_steps } : {}),
    state: value.state,
    ...(value.last_review ? { last_review: new Date(value.last_review).toISOString() } : {}),
  };
}

export function hydrateFsrsCard(snapshot: PersistedFsrsCard): FsrsCard {
  return {
    ...snapshot,
    due: new Date(snapshot.due),
    ...(snapshot.last_review ? { last_review: new Date(snapshot.last_review) } : {}),
  } as unknown as FsrsCard;
}

export function createInitialFsrsCard(now = new Date()): PersistedFsrsCard {
  return serializeFsrsCard(createEmptyCard(now));
}

export function ratingForOutcome(rating: ReviewRating): Grade {
  return (rating === "Good" ? Rating.Good : Rating.Again) as Grade;
}

export function applyRating(
  snapshot: PersistedFsrsCard,
  rating: ReviewRating,
  now: Date,
): { fsrs: PersistedFsrsCard; dueAt: Date; intervalLabel: string } {
  const result = scheduler.next(hydrateFsrsCard(snapshot), now, ratingForOutcome(rating));
  const fsrsCard = serializeFsrsCard(result.card);
  const dueAt = new Date(fsrsCard.due);
  return { fsrs: fsrsCard, dueAt, intervalLabel: formatInterval(dueAt, now) };
}

export function formatInterval(dueAt: Date, now: Date): string {
  const minutes = Math.max(1, Math.round((dueAt.getTime() - now.getTime()) / 60_000));
  if (minutes < 60) return `${minutes} phút nữa`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} giờ nữa`;
  const days = Math.max(1, Math.round(hours / 24));
  return `${days} ngày nữa`;
}

export function stateName(state: number): "new" | "learning" | "review" | "relearning" {
  if (state === 0) return "new";
  if (state === 1) return "learning";
  if (state === 2) return "review";
  return "relearning";
}
