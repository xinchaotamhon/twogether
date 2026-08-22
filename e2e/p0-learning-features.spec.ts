import { expect, test } from "@playwright/test";

test.describe("Twogether local learning features", () => {
  test("lets a learner choose a deck without changing the other deck's scope", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("learner-choice-hiep").click();
    await expect(page.getByTestId("collection-english-foundations")).toBeVisible();
    await expect(page.getByTestId("study-progress").locator("i")).toHaveText("/ 12");
    await page.getByTestId("collection-english-mechanism-lab").click();
    await expect(page.getByTestId("study-progress").locator("i")).toHaveText("/ 06");
  });

  test("opens the local authoring view and keeps new content as draft", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("learner-choice-hoang").click();
    await page.getByTestId("nav-cards").click();
    await page.getByRole("button", { name: /Card mới/ }).click();
    await page.getByLabel("Câu hỏi").fill("Vì sao một nguyên lý cần có boundary?");
    await page.getByLabel("Lời giải ngắn").fill("Để biết khi nào không nên áp dụng máy móc.");
    await page.getByRole("button", { name: "Lưu bản nháp" }).click();
    await expect(page.getByText("Đã lưu bản nháp")).toBeVisible();
    await expect(page.locator(".library-card.draft")).toHaveCount(1);
  });

  test("can add a draft branch to the knowledge graph", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("learner-choice-hiep").click();
    await page.getByTestId("nav-map").click();
    await page.getByLabel("Tên nhánh").fill("Component boundaries");
    await page.getByRole("button", { name: "Thêm nhánh draft" }).click();
    await expect(page.getByText(/Đã thêm nhánh/)).toBeVisible();
  });
});
