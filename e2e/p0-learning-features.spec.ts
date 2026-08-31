import { expect, test } from "@playwright/test";

test.describe("Twogether local learning features", () => {
  test("lets a learner choose one of ten compact English Core decks", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("learner-choice-hiep").click();
    await expect(page.getByTestId("collection-collection-english-core-01")).toBeVisible();
    await expect(page.getByTestId("collection-collection-english-core-10")).toBeVisible();
    await expect(page.getByTestId("collection-english-foundations")).toHaveCount(0);
    await expect(page.getByTestId("study-progress").locator("i")).toHaveText("/ 08");
    await page.getByTestId("collection-collection-english-core-02").click();
    await expect(page.getByTestId("study-progress").locator("i")).toHaveText("/ 08");
  });

  test("opens the local authoring view and keeps new content as draft", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("learner-choice-hoang").click();
    await page.getByTestId("nav-cards").click();
    await page.getByRole("button", { name: /Card mới/ }).click();
    await page.getByRole("textbox", { name: "Câu hỏi", exact: true }).fill("Vì sao một nguyên lý cần có boundary?");
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

  test("keeps AI support opt-in and separates the secondary answer from the main reveal", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("learner-choice-hiep").click();
    await page.getByTestId("nav-cards").click();
    await expect(page.getByText("80 câu phụ và glossary đang chờ bạn duyệt.")).toBeVisible();
    await page.getByRole("button", { name: "Dùng thử lớp hỗ trợ" }).click();
    await page.getByTestId("nav-study").click();

    await page.getByRole("button", { name: "Chưa hiểu câu hỏi?" }).click();
    await expect(page.getByText("CÂU HỎI PHỤ", { exact: true })).toBeVisible();
    await expect(page.getByTestId("reveal-panel")).toHaveCount(0);
    await page.getByText("Xem lời giải câu phụ").click();
    await expect(page.getByTestId("scaffold-answer")).toBeVisible();
    await expect(page.getByTestId("reveal-panel")).toHaveCount(0);

    await page.locator(".glossary-chip").first().click();
    await expect(page.getByTestId("glossary-dialog")).toBeVisible();
    await expect(page.getByTestId("glossary-dialog")).toContainText("VÌ SAO CẦN BIẾT");
    await page.getByRole("button", { name: "Đóng giải thích thuật ngữ" }).click();
    await page.getByRole("button", { name: /Đã thử/ }).click();
    await expect(page.getByTestId("reveal-panel")).toBeVisible();
  });
});
