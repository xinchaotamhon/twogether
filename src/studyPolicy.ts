export const REPAIR_CAP = 3;
export const INTERVENING_CARDS = 2;

export interface RepairItem {
  cardId: string;
  appearances: number;
  availableAfterReview: number;
}

export function enqueueRepair(
  queue: RepairItem[],
  cardId: string,
  completedReviews: number,
): RepairItem[] {
  const existing = queue.find((item) => item.cardId === cardId);
  if (existing && existing.appearances >= REPAIR_CAP) return queue;
  if (existing) {
    return queue.map((item) =>
      item.cardId === cardId
        ? { ...item, appearances: item.appearances + 1, availableAfterReview: completedReviews + INTERVENING_CARDS }
        : item,
    );
  }
  if (REPAIR_CAP < 1) return queue;
  return [
    ...queue,
    { cardId, appearances: 1, availableAfterReview: completedReviews + INTERVENING_CARDS },
  ];
}

export function takeNextCardId(
  remainingIds: string[],
  repairQueue: RepairItem[],
  completedReviews: number,
): string | null {
  const repair = repairQueue.find((item) => item.availableAfterReview <= completedReviews);
  return repair?.cardId ?? remainingIds[0] ?? null;
}

export function removeRepairItem(queue: RepairItem[], cardId: string): RepairItem[] {
  return queue.filter((item) => item.cardId !== cardId);
}
