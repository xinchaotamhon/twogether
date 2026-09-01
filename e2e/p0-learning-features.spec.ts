import { expect, test } from "@playwright/test";

test.describe("Twogether local learning features", () => {
  test("lets a learner choose one of ten compact English Core decks", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByTestId("learner-choice-hiep").click();
    await expect(
      page.getByTestId("collection-collection-english-core-01"),
    ).toBeVisible();
    await expect(
      page.getByTestId("collection-collection-english-core-10"),
    ).toBeVisible();
    await expect(
      page.getByTestId("collection-english-foundations"),
    ).toHaveCount(0);
    await expect(page.getByTestId("study-progress").locator("i")).toHaveText(
      "/ 08",
    );
    await page.getByTestId("collection-collection-english-core-02").click();
    await expect(page.getByTestId("study-progress").locator("i")).toHaveText(
      "/ 08",
    );
  });

  test("opens the local authoring view and keeps new content as draft", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByTestId("learner-choice-hoang").click();
    await page.getByTestId("nav-cards").click();
    await page.getByRole("button", { name: /Card mới/ }).click();
    await page
      .getByRole("textbox", { name: "Câu hỏi", exact: true })
      .fill("Vì sao một nguyên lý cần có boundary?");
    await page
      .getByLabel("Lời giải ngắn")
      .fill("Để biết khi nào không nên áp dụng máy móc.");
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

  test("keeps glossary help and reveals a worked transfer answer only after the main attempt", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByTestId("learner-choice-hiep").click();
    await page.getByTestId("nav-cards").click();
    await expect(
      page.getByText("80 lời giải chuyển giao và glossary."),
    ).toBeVisible();
    await page.getByTestId("nav-study").click();
    await expect(page.getByTestId("reveal-panel")).toHaveCount(0);

    await page.locator(".glossary-chip").first().click();
    await expect(page.getByTestId("glossary-dialog")).toBeVisible();
    await expect(page.getByTestId("glossary-dialog")).toContainText(
      "VÌ SAO CẦN BIẾT",
    );
    await page
      .getByRole("button", { name: "Đóng giải thích thuật ngữ" })
      .click();
    await page.getByRole("button", { name: /Đã thử/ }).click();
    await expect(page.getByTestId("reveal-panel")).toBeVisible();
    await expect(page.getByTestId("transfer-answer")).not.toBeVisible();
    await page.getByText("Xem lời giải gợi ý").click();
    await expect(page.getByTestId("transfer-answer")).toBeVisible();
  });

  test("lets the owner flag weak textbook cards and merges only the unflagged cards", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByTestId("learner-choice-hiep").click();
    await page.getByTestId("nav-cards").click();
    await expect(
      page.getByText("Empower A2 · 81 thẻ chờ bạn duyệt"),
    ).toBeVisible();
    await page.locator(".coursebook-flag input").first().check();
    await expect(page.getByText("1 cần sửa/bỏ")).toBeVisible();
    await page.getByRole("button", { name: "Gộp 80 thẻ đạt yêu cầu" }).click();
    await expect(page.getByText("Đã gộp 80 thẻ đạt yêu cầu")).toBeVisible();
    await page.getByTestId("nav-study").click();
    await expect(
      page.getByTestId("collection-collection-empower-a2-learning-v1"),
    ).toBeVisible();
  });
});
