import { expect, test } from "@playwright/test";

test.describe("Twogether local learning features", () => {
  test("lets a learner choose one of ten compact English Core decks", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByTestId("learner-choice-hiep").click();
    await expect(page.getByTestId("nav-study")).toHaveCount(0);
    await page.getByRole("button", { name: "Học bộ Meaning → Clause, 8 thẻ" }).click();
    await expect(page.getByTestId("card-jump-range")).toHaveAttribute("max", "8");
    await page.getByRole("button", { name: "Đóng flashcard và trở lại cây" }).click();
    await page.getByRole("button", { name: "Học bộ Verb Architecture, 9 thẻ" }).click();
    await expect(page.getByTestId("card-jump-range")).toHaveAttribute("max", "9");
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
    await page.getByTestId("nav-cards").click();
    await page.getByText(/Thêm một nhánh mới/).click();
    await page.getByLabel("Tên nhánh").fill("Component boundaries");
    await page.getByRole("button", { name: "Thêm nhánh draft" }).click({ force: true });
    await expect(page.getByText(/Đã thêm nhánh/)).toBeVisible();
  });

  test("keeps glossary help and reveals a worked transfer answer only after the main attempt", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByTestId("learner-choice-hiep").click();
    await page.getByTestId("nav-cards").click();
    await expect(page.getByText("English Core v2 · 89 thẻ chính thức")).toBeVisible();
    await page.getByTestId("nav-map").click({ force: true });
    await page.getByRole("button", { name: "Học bộ Expanding the Clause, 9 thẻ" }).click();
    await page.getByTestId("card-jump-range").fill("4");
    await expect(page.getByTestId("reveal-panel")).toHaveCount(0);

    await page.locator(".study-face-front .glossary-inline").first().click();
    await expect(page.getByTestId("glossary-dialog")).toBeVisible();
    await expect(page.getByTestId("glossary-dialog")).toContainText(
      "VÌ SAO CẦN BIẾT",
    );
    await page
      .getByRole("button", { name: "Đóng giải thích thuật ngữ" })
      .click({ force: true });
    await page.getByRole("button", { name: /Đã thử/ }).click({ force: true });
    await expect(page.getByTestId("reveal-panel")).toBeVisible();
    await expect(page.getByText("DỄ NHẦM")).toHaveCount(0);
    await expect(page.locator(".answer-block .glossary-inline").first()).toBeVisible();
    await expect(page.locator(".why-block .glossary-inline").first()).toBeVisible();
    await page.getByRole("tab", { name: "Tình huống mới" }).click();
    await expect(page.locator(".transfer-page .glossary-inline").first()).toBeVisible();
    await expect(page.getByTestId("transfer-answer")).toBeVisible();
    await page.getByTestId("transfer-answer").locator(".glossary-inline").first().click();
    await expect(page.getByTestId("glossary-dialog")).toBeVisible();
  });

  test("publishes coursebook knowledge directly and keeps only vocabulary cards for review", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByTestId("learner-choice-hiep").click();
    await page.getByTestId("nav-cards").click();
    const empowerPanel = page.locator("details.coursebook-review").filter({ hasText: "Empower A2" });
    await expect(page.getByText("Empower A2 · 7 thẻ Vocabulary Focus")).toBeVisible();
    await empowerPanel.locator(":scope > summary").click();
    await expect(empowerPanel.getByRole("button", { name: "Duyệt và đưa vào cây" })).toHaveCount(7);
    await expect(page.locator(".card-library-list .library-card")).toHaveCount(74);
    await page.locator(".card-library-list .library-card").first().getByRole("button", { name: "Sửa" }).click();
    await expect(page.locator(".editor-card")).toBeVisible();
    await page.locator(".editor-card").getByRole("button", { name: "Đóng" }).click();
    await empowerPanel.getByRole("button", { name: "Duyệt và đưa vào cây" }).nth(2).click();
    await expect(empowerPanel.getByText("1/7 đã duyệt")).toBeVisible();
    expect(await page.evaluate(() => {
      const raw = localStorage.getItem("twogether.workspace.p0.v1");
      if (!raw) return [];
      const workspace = JSON.parse(raw) as { cards?: Array<{ id: string; glossary_refs?: string[] }> };
      return workspace.cards?.find((card) => card.id === "coursebook-a2-vocab-03")?.glossary_refs ?? [];
    })).toContain("collocation");
    await page.getByTestId("nav-map").click();
    await page.getByRole("button", { name: "Học bộ Empower · Từ mới, 1 thẻ" }).click();
    await expect(page.getByTestId("map-study-overlay")).toContainText("Empower · Từ mới");
  });

  test("shows the owner-approved beginner Core as the official editable curriculum", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("learner-choice-hiep").click();
    await page.getByTestId("nav-cards").click();
    await expect(page.getByText("English Core v2 · 89 thẻ chính thức")).toBeVisible();
    await page.getByTestId("draft-collection-collection-english-core-02").click();
    await expect(page.getByTestId("draft-collection-panel")).toContainText("9 thẻ");
    await expect(page.getByTestId("draft-card-core-en-bridge-02")).toContainText("THỬ CHUYỂN SANG TÌNH HUỐNG MỚI");
    await expect(page.getByTestId("transfer-preview-answer-core-en-bridge-02")).not.toHaveText("Chưa có lời giải mẫu.");
  });
});
