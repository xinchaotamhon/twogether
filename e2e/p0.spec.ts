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
    await page.getByTestId("nav-study").click();
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
    await page.getByTestId("nav-study").click();
    await page.getByRole("button", { name: /Đã thử/ }).click();
    await page.getByRole("button", { name: /Nhớ/ }).click();
    await page.getByRole("button", { name: "Mở bộ chọn hồ sơ" }).click();
    await page.getByTestId("learner-choice-hoang").click();
    await page.getByTestId("nav-study").click();

    await expect(page.getByTestId("study-progress").locator("i")).toHaveText("/ 08");
    await expect(page.getByTestId("study-card")).toBeVisible();
  });

  test("keeps the visual map and keyboard table alternative in parity", async ({ page }) => {
    await page.getByTestId("learner-choice-hiep").click();
    await expect(page.getByTestId("map-home")).toBeVisible();
    const accessibleMap = page.locator("details.accessible-map");
    await accessibleMap.locator("summary").click();
    await expect(accessibleMap.locator("table")).toBeVisible();
    await expect(accessibleMap.locator("tbody th").first()).toBeVisible();
    await expect(page.getByText("Meaning → Clause").first()).toBeVisible();
    await expect(page.getByText("KNOWLEDGE MAP · DAG")).toHaveCount(0);
    await expect(page.getByText("shared content")).toHaveCount(0);
    await expect(page.getByText("Đây là một lối đi gợi ý, không phải chiếc cây hoàn hảo của tiếng Anh.")).toHaveCount(0);
    await expect(page.getByTestId("tree-node-twogether-universal-root")).toContainText("0/80 thẻ đã bền");
    await expect(page.getByTestId("tree-map")).toBeVisible();
    expect(await page.getByTestId("tree-link").count()).toBeGreaterThan(0);
    await expect(page.getByTestId("tree-link").first()).toHaveAttribute("d", /M.+C/);
    await expect(page.getByRole("button", { name: "Zoom In" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Zoom Out" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Fit View" })).toBeVisible();
    await expect(page.getByTestId("tree-node-core-en-module-01")).toContainText(/thẻ đã bền/);
    await page.getByTestId("tree-node-core-en-module-02").hover();
    await expect(page.getByTestId("tree-detail-title")).toHaveText("Verb Architecture");
    await page.getByTestId("tree-node-core-en-module-10").click();
    await expect(page.getByTestId("tree-detail-title")).toHaveText("Integration & Production");
  });

  test("uses collection checkboxes as a focus list but starts one real collection", async ({ page }) => {
    await page.getByTestId("learner-choice-hiep").click();
    const first = page.getByRole("checkbox", { name: /Meaning → Clause/ });
    const second = page.getByRole("checkbox", { name: /Verb Architecture/ });
    await expect(first).toBeChecked();
    await second.check();
    await expect(page.getByText("2", { exact: true }).first()).toBeVisible();
    await page.getByRole("button", { name: "Học bộ này" }).first().click();
    await expect(page.getByTestId("study-card")).toBeVisible();
    await expect(page.getByTestId("collection-collection-english-core-01")).toHaveClass(/is-active/);
  });

  test("stacks the tree detail below the zoomable canvas on a phone", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload();
    await page.getByTestId("learner-choice-hiep").click();
    const canvas = page.getByTestId("tree-map");
    const detail = page.getByTestId("tree-detail");
    await expect(canvas).toBeVisible();
    await expect(detail).toBeVisible();
    const canvasBox = await canvas.boundingBox();
    const detailBox = await detail.boundingBox();
    expect(canvasBox).not.toBeNull();
    expect(detailBox).not.toBeNull();
    expect(detailBox!.y).toBeGreaterThan(canvasBox!.y + canvasBox!.height - 2);
    await expect(page.getByRole("button", { name: "Zoom In" })).toBeVisible();
    await expect(page.getByTestId("nav-map")).toBeVisible();
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
