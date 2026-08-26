import { describe, expect, it } from "vitest";
import { APPROVED_CONTENT_VERSION, LEGACY_FIXTURE_COLLECTION_IDS } from "./approvedCurriculum";
import { WORKSPACE_STORAGE_KEY, createWorkspaceMemoryStorage, readWorkspace } from "./localWorkspace";

describe("workspace content migration", () => {
  it("replaces legacy fixture shelves while preserving learner-created content and history", () => {
    const storage = createWorkspaceMemoryStorage();
    const customCollection = { id: "my-comparisons", title: "So sánh của tôi", description: "Tự tạo", rootNodeId: null, status: "draft", cardIds: ["local-card-1"] };
    const dailyQualification = { learnerId: "hiep", localDate: "2026-08-25", timezone: "Asia/Ho_Chi_Minh", collectionId: "english-foundations", runId: "legacy-run", qualifiedAt: "2026-08-25T08:00:00.000Z" };
    const legacyRun = { plan: { id: "legacy-run", learnerId: "hiep", collectionId: "english-foundations", requiredCardIds: ["fixture-recall-01"], createdAt: "2026-08-25T07:00:00.000Z", timezone: "Asia/Ho_Chi_Minh" }, attempts: [{ cardId: "fixture-recall-01", attemptConfirmed: true }], status: "qualified" };
    const localCard = { id: "local-card-1", node_id: "core-en-module-04", card_type: "application", prompt: "Tự hỏi", model_answer: "Tự đáp", explanation: "", misconception: "", transfer_prompt: "", prerequisite_node_ids: [], source_refs: ["local"], status: "draft", author: "hiep", reviewer: null };
    const revision = { id: "local-card-1-revision-1", cardId: "local-card-1", revision: 1, status: "draft", archivedAt: null, createdAt: "2026-08-25T09:00:00.000Z", createdBy: "hiep", changeSummary: "Tự tạo" };
    storage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify({
      version: 1,
      collections: [
        { id: "english-foundations", title: "English foundations", description: "fixture", rootNodeId: "english-fixture-root", status: "published", cardIds: ["fixture-recall-01"] },
        { id: "english-mechanism-lab", title: "Mechanism lab", description: "fixture", rootNodeId: "english-fixture-mechanism", status: "published", cardIds: ["fixture-mechanism-01"] },
        customCollection,
      ],
      dailyQualifications: [dailyQualification],
      runs: { "legacy-run": legacyRun },
      cards: [localCard],
      revisions: [revision],
    }));

    const migrated = readWorkspace(storage);
    expect(migrated.version).toBe(2);
    expect(migrated.contentVersion).toBe(APPROVED_CONTENT_VERSION);
    expect(migrated.collections).toHaveLength(11);
    expect(migrated.collections.some((collection) => LEGACY_FIXTURE_COLLECTION_IDS.has(collection.id))).toBe(false);
    expect(migrated.collections.some((collection) => collection.id === customCollection.id)).toBe(true);
    expect(migrated.dailyQualifications).toEqual([dailyQualification]);
    expect(migrated.runs["legacy-run"]).toEqual(legacyRun);
    expect(migrated.cards).toEqual([localCard]);
    expect(migrated.revisions).toEqual([revision]);
  });
});
