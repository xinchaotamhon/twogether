import { expect, test } from "@playwright/test";

test.describe("Twogether P0 browser contract", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("uses the simple learner picker even when Supabase env values exist", async ({ page }) => {
    await expect(page.getByTestId("learner-choice-hiep")).toBeVisible();
    await expect(page.getByTestId("learner-choice-hoang")).toBeVisible();
    await expect(page.getByTestId("supabase-email")).toHaveCount(0);
    await expect(page.getByTestId("supabase-password")).toHaveCount(0);
  });
  test("requires an attempt before revealing the answer and keeps focus keyboardable", async ({ page }) => {
    await page.getByTestId("learner-choice-hiep").click();
    await expect(page.getByTestId("nav-study")).toHaveCount(0);
    await page.getByRole("button", { name: "Học bộ Meaning → Clause, 8 thẻ" }).click();
    await expect(page.getByTestId("map-study-overlay")).toBeVisible();
    await expect(page.getByTestId("study-card")).toBeVisible();
    await expect(page.locator(".card-type")).toHaveCount(0);
    await expect(page.getByText("local · riêng tư")).toHaveCount(0);
    await expect(page.getByText(/PHIÊN CỦA/)).toHaveCount(0);
    await expect(page.getByText("fixture nội bộ")).toHaveCount(0);
    await expect(page.getByPlaceholder("Viết thứ gì đó vào đây")).toBeVisible();
    await expect(page.getByText(/card còn trong phiên/)).toHaveCount(0);
    await expect(page.getByTestId("reveal-panel")).toHaveCount(0);

    const attempt = page.getByRole("button", { name: /Đã thử/ });
    await attempt.focus();
    expect(await attempt.evaluate((element) => document.activeElement === element)).toBe(true);
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("reveal-panel")).toBeVisible();
    await expect(page.getByRole("button", { name: /Nhớ/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Quên/ })).toBeVisible();
  });

  test("keeps learner review state separate in the local adapter", async ({ page }) => {
    await page.getByTestId("learner-choice-hiep").click();
    await page.getByRole("button", { name: "Học bộ Meaning → Clause, 8 thẻ" }).click();
    await page.getByRole("button", { name: /Đã thử/ }).click();
    await page.getByRole("button", { name: /Nhớ/ }).click();
    await page.getByRole("button", { name: "Mở bộ chọn hồ sơ" }).click();
    await page.getByTestId("learner-choice-hoang").click();
    await page.getByRole("button", { name: "Học bộ Meaning → Clause, 8 thẻ" }).click();

    await expect(page.getByTestId("study-progress").locator("i")).toHaveText("/ 08");
    await expect(page.getByTestId("study-card")).toBeVisible();
  });

  test("uses the full-screen map and opens a deck directly from its branch", async ({ page }) => {
    await page.getByTestId("learner-choice-hiep").click();
    await expect(page.getByTestId("map-home")).toBeVisible();
    await expect(page.locator(".map-accessible-table")).toHaveCount(1);
    await expect(page.getByRole("checkbox")).toHaveCount(0);
    await expect(page.getByTestId("tree-detail")).toHaveCount(0);
    await expect(page.getByText("Meaning → Clause").first()).toBeVisible();
    await expect(page.getByText("KNOWLEDGE MAP · DAG")).toHaveCount(0);
    await expect(page.getByText("shared content")).toHaveCount(0);
    await expect(page.getByText("Đây là một lối đi gợi ý, không phải chiếc cây hoàn hảo của tiếng Anh.")).toHaveCount(0);
    await expect(page.getByTestId("tree-node-twogether-universal-root")).toContainText("0/89 thẻ đã bền");
    await expect(page.getByTestId("tree-map")).toBeVisible();
    expect(await page.getByTestId("tree-link").count()).toBeGreaterThan(0);
    await expect(page.getByTestId("tree-link").first()).toHaveAttribute("d", /M.+C/);
    await expect(page.getByRole("button", { name: "Zoom In" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Zoom Out" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Fit View" })).toBeVisible();
    await expect(page.getByTestId("tree-node-core-en-module-01")).toContainText("Bấm để học · 8 thẻ");
    await page.getByRole("button", { name: "Học bộ Verb Architecture, 9 thẻ" }).click();
    await expect(page.getByTestId("map-home")).toBeVisible();
    await expect(page.getByTestId("map-study-overlay")).toBeVisible();
    await expect(page.getByTestId("study-card")).toBeVisible();
    await expect(page.getByTestId("map-study-overlay")).toContainText("Verb Architecture");
    await expect(page.getByTestId("study-progress").locator("i")).toHaveText("/ 09");
    await page.getByRole("button", { name: "Đóng flashcard và trở lại cây" }).click();
    await expect(page.getByTestId("map-study-overlay")).toHaveCount(0);
    await expect(page.getByTestId("tree-map")).toBeVisible();
  });

  test("keeps the map inside one phone screen without vertical page scrolling", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload();
    await page.getByTestId("learner-choice-hiep").click();
    const canvas = page.getByTestId("tree-map");
    await expect(canvas).toBeVisible();
    expect(await page.evaluate(() => document.scrollingElement!.scrollHeight <= window.innerHeight + 1)).toBe(true);
    await expect(page.getByRole("button", { name: "Zoom In" })).toBeVisible();
    await expect(page.getByTestId("nav-map")).toBeVisible();
    await expect(page.getByTestId("nav-study")).toHaveCount(0);
    const legendBox = await page.locator(".tree-legend").boundingBox();
    const navBox = await page.locator(".bottom-nav").boundingBox();
    expect(legendBox).not.toBeNull();
    expect(navBox).not.toBeNull();
    expect(legendBox!.y + legendBox!.height).toBeLessThan(navBox!.y);
  });

  test("serves an installable shell without private data in the service worker", async ({ page, request }) => {
    const manifestResponse = await request.get("/manifest.webmanifest");
    expect(manifestResponse.ok()).toBe(true);
    const manifest = await manifestResponse.json() as { display: string; start_url: string; icons: unknown[] };
    expect(manifest.display).toBe("standalone");
    expect(manifest.start_url).toBe("/");
    expect(manifest.icons.length).toBeGreaterThanOrEqual(2);

    const serviceWorkerResponse = await request.get("/sw.js");
    const serviceWorker = await serviceWorkerResponse.text();
    expect(serviceWorkerResponse.ok()).toBe(true);
    expect(serviceWorker).toContain("twogether-shell-v2");
    expect(serviceWorker).not.toContain("private_notes");
    expect(serviceWorker).not.toContain("review_events");

    await page.getByTestId("learner-choice-hiep").click();
    await expect.poll(async () => page.evaluate(async () => Boolean(await navigator.serviceWorker.getRegistration()))).toBe(true);
  });
});
