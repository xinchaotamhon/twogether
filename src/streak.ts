import type { CollectionRunPlan, DailyQualification, RunAttempt } from "./featureTypes";
import { qualifyRun } from "./collections";
import type { LearnerId } from "./types";

export interface StreakProjection {
  currentDays: number;
  bestDays: number;
  lastQualifiedDate: string | null;
}
export type { DailyQualification } from "./featureTypes";

export function localDateAt(instant: Date, timezone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(instant);
  const values = Object.fromEntries(parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function recordDailyQualification(existing: readonly DailyQualification[], plan: CollectionRunPlan, attempts: readonly RunAttempt[], qualifiedAt: Date): DailyQualification[] {
  if (!qualifyRun(plan, attempts)) return [...existing];
  const localDate = localDateAt(qualifiedAt, plan.timezone);
  if (existing.some((event) => event.learnerId === plan.learnerId && event.localDate === localDate)) return [...existing];
  return [...existing, { learnerId: plan.learnerId, localDate, timezone: plan.timezone, collectionId: plan.collectionId, runId: plan.id, qualifiedAt: qualifiedAt.toISOString() }];
}

function dayNumber(value: string): number {
  const [year, month, day] = value.split("-").map(Number);
  return Date.UTC(year, month - 1, day) / 86_400_000;
}

export function deriveStreak(qualifications: readonly DailyQualification[], learnerId: LearnerId): StreakProjection {
  const dates = [...new Set(qualifications.filter((event) => event.learnerId === learnerId).map((event) => event.localDate))].sort();
  if (!dates.length) return { currentDays: 0, bestDays: 0, lastQualifiedDate: null };
  let bestDays = 1;
  let run = 1;
  for (let index = 1; index < dates.length; index += 1) {
    run = dayNumber(dates[index]) === dayNumber(dates[index - 1]) + 1 ? run + 1 : 1;
    bestDays = Math.max(bestDays, run);
  }
  return { currentDays: run, bestDays, lastQualifiedDate: dates[dates.length - 1] };
}
