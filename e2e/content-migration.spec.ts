import { expect, test } from "@playwright/test";

test("migrates a legacy browser shelf without deleting streak, runs, or local collections", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("twogether.active-learner", "hiep");
    localStorage.setItem("twogether.collection.hiep", "english-foundations");
    localStorage.setItem("twogether.workspace.p0.v1", JSON.stringify({
      version: 1,
      collections: [
        { id: "english-foundations", title: "English foundations", description: "fixture", rootNodeId: "english-fixture-root", status: "published", cardIds: ["fixture-recall-01"] },
        { id: "english-mechanism-lab", title: "Mechanism lab", description: "fixture", rootNodeId: "english-fixture-mechanism", status: "published", cardIds: ["fixture-mechanism-01"] },
        { id: "my-comparisons", title: "So sánh của tôi", description: "Tự tạo", rootNodeId: null, status: "draft", cardIds: [] },
      ],
      dailyQualifications: [{ learnerId: "hiep", localDate: "2026-08-25", timezone: "Asia/Ho_Chi_Minh", collectionId: "english-foundations", runId: "legacy-run", qualifiedAt: "2026-08-25T08:00:00.000Z" }],
      runs: { "legacy-run": { plan: { id: "legacy-run", learnerId: "hiep", collectionId: "english-foundations", requiredCardIds: ["fixture-recall-01"], createdAt: "2026-08-25T07:00:00.000Z", timezone: "Asia/Ho_Chi_Minh" }, attempts: [{ cardId: "fixture-recall-01", attemptConfirmed: true }], status: "qualified" } },
      cards: [],
      revisions: [],
    }));
  });

  await page.goto("/");
  await expect(page.getByTestId("collection-collection-english-core-01")).toBeVisible();
  await expect(page.getByTestId("collection-english-foundations")).toHaveCount(0);
  await expect(page.getByText("So sánh của tôi")).toBeVisible();
  await expect(page.getByTestId("study-progress").locator("i")).toHaveText("/ 08");

  const migrated = await page.evaluate(() => JSON.parse(localStorage.getItem("twogether.workspace.p0.v1") ?? "{}"));
  expect(migrated.version).toBe(2);
  expect(migrated.collections).toHaveLength(11);
  expect(migrated.dailyQualifications).toHaveLength(1);
  expect(migrated.runs["legacy-run"].status).toBe("qualified");
});
