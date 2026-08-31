import { expect, test } from "@playwright/test";

test("shows English Core v1 as ten owner-approved study slices", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("learner-choice-hiep").click();
  await page.getByTestId("nav-cards").click();

  const reviewArea = page.locator(".draft-core-library");
  await expect(reviewArea.getByRole("heading", { name: "English Core v1 · 80 thẻ đang học" })).toBeVisible();
  await expect(reviewArea.getByRole("tab")).toHaveCount(10);
  await expect(reviewArea.locator(".draft-review-card")).toHaveCount(8);
  await expect(reviewArea.getByText("đã duyệt · đang học").first()).toBeVisible();

  await page.getByTestId("draft-collection-collection-english-core-04").click();
  await expect(page.getByTestId("draft-collection-panel")).toContainText("Time, Aspect & Modality");
  await expect(page.getByTestId("draft-collection-panel").locator(".draft-review-card")).toHaveCount(8);
  await expect(page.getByTestId("draft-card-core-en-25")).toContainText("Tense, aspect và modality");

  await page.getByTestId("draft-card-core-en-25").getByRole("button", { name: "Đưa vào chỉnh sửa" }).click();
  await expect(page.getByRole("textbox", { name: "Câu hỏi", exact: true })).toHaveValue(/Tense, aspect và modality/);

  await page.getByTestId("nav-study").click();
  await expect(page.getByTestId("collection-collection-english-core-01")).toBeVisible();
  await expect(page.getByTestId("collection-english-foundations")).toHaveCount(0);
});
