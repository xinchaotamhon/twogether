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

  test("does not contact Supabase while the temporary session mode is active", async ({ page }) => {
    const supabaseRequests: string[] = [];
    page.on("request", (request) => {
      if (request.url().includes(".supabase.co")) supabaseRequests.push(request.url());
    });
    await page.reload();
    await page.getByTestId("learner-choice-hiep").click();
    await expect(page.getByTestId("map-home")).toBeVisible();
    expect(supabaseRequests).toEqual([]);
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

  test("stores only forgotten cards in sessionStorage and keeps learners separate", async ({ page }) => {
    await page.evaluate(() => sessionStorage.setItem(
      "twogether.session.forgotten.hiep.collection-english-core-01",
      JSON.stringify(["retired-card"]),
    ));
    await page.getByTestId("learner-choice-hiep").click();
    await page.getByRole("button", { name: "Học bộ Meaning → Clause, 8 thẻ" }).click();
    expect(await page.evaluate(() => JSON.parse(sessionStorage.getItem("twogether.session.forgotten.hiep.collection-english-core-01") ?? "[]"))).toEqual([]);
    await page.getByRole("button", { name: /Đã thử/ }).click();
    await page.getByRole("button", { name: /Quên/ }).click();
    expect(await page.evaluate(() => JSON.parse(sessionStorage.getItem("twogether.session.forgotten.hiep.collection-english-core-01") ?? "[]").length)).toBe(1);
    expect(await page.evaluate(() => localStorage.getItem("twogether.local.p0.v1"))).toBeNull();
    await page.getByTestId("card-jump-range").fill("1");
    await page.getByRole("button", { name: /Đã thử/ }).click();
    await page.getByRole("button", { name: /Nhớ/ }).click();
    expect(await page.evaluate(() => JSON.parse(sessionStorage.getItem("twogether.session.forgotten.hiep.collection-english-core-01") ?? "[]").length)).toBe(0);
    await page.getByRole("button", { name: "Đóng flashcard và trở lại cây" }).click();
    await page.getByRole("button", { name: "Mở bộ chọn hồ sơ" }).click();
    await page.getByTestId("learner-choice-hoang").click();
    await page.getByRole("button", { name: "Học bộ Meaning → Clause, 8 thẻ" }).click();
    expect(await page.evaluate(() => sessionStorage.getItem("twogether.session.forgotten.hoang.collection-english-core-01"))).toBeNull();
    await expect(page.getByTestId("card-jump-range")).toHaveAttribute("max", "8");
    await expect(page.getByTestId("study-card")).toBeVisible();
  });

  test("turns the session wrong list into a bounded repair round", async ({ page }) => {
    await page.getByTestId("learner-choice-hiep").click();
    await page.getByRole("button", { name: "Học bộ Meaning → Clause, 8 thẻ" }).click();
    for (let index = 0; index < 8; index += 1) {
      await page.getByRole("button", { name: /Đã thử/ }).click();
      await page.getByRole("button", { name: index === 0 ? /Quên/ : /Nhớ/ }).click();
    }
    await expect(page.getByRole("button", { name: "Ôn lại 1 câu Quên" })).toBeVisible();
    await page.getByRole("button", { name: "Ôn lại 1 câu Quên" }).click();
    await expect(page.getByTestId("card-jump-range")).toHaveAttribute("max", "1");
    await page.getByRole("button", { name: /Đã thử/ }).click();
    await page.getByRole("button", { name: /Nhớ/ }).click();
    await expect(page.getByRole("button", { name: "Học lại bộ này" })).toBeVisible();
    expect(await page.evaluate(() => JSON.parse(sessionStorage.getItem("twogether.session.forgotten.hiep.collection-english-core-01") ?? "[]"))).toEqual([]);
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
    await expect(page.getByTestId("tree-node-twogether-universal-root")).toContainText("163 thẻ học ngay");
    await expect(page.getByTestId("nav-progress")).toHaveCount(0);
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
    await expect(page.getByTestId("card-jump-range")).toHaveAttribute("max", "9");
    await page.getByRole("button", { name: "Đóng flashcard và trở lại cây" }).click();
    await expect(page.getByTestId("map-study-overlay")).toHaveCount(0);
    await expect(page.getByTestId("tree-map")).toBeVisible();
  });

  test("centers one non-scrolling flip card and supports jump plus shuffle", async ({ page }) => {
    await page.getByTestId("learner-choice-hiep").click();
    await page.getByRole("button", { name: "Học bộ Meaning → Clause, 8 thẻ" }).click();
    const overlay = page.getByTestId("map-study-overlay");
    const card = page.getByTestId("study-card");
    const cardBox = await card.boundingBox();
    expect(cardBox).not.toBeNull();
    expect(Math.abs((cardBox!.x + cardBox!.width / 2) - (await page.evaluate(() => innerWidth / 2)))).toBeLessThan(12);
    expect(await page.locator(".study-face-front").evaluate((element) => element.scrollHeight <= element.clientHeight + 1)).toBe(true);
    expect(await overlay.evaluate((element) => getComputedStyle(element).backdropFilter)).not.toBe("none");
    const metaParts = page.locator(".study-face-front .card-meta > span");
    const metaLeft = await metaParts.nth(0).boundingBox();
    const metaRight = await metaParts.nth(1).boundingBox();
    expect(metaLeft).not.toBeNull();
    expect(metaRight).not.toBeNull();
    expect(metaLeft!.x + metaLeft!.width).toBeLessThan(metaRight!.x);

    await page.getByTestId("card-jump-range").fill("5");
    await expect(page.locator(".session-navigation label span")).toHaveText("5/8");
    const stageBox = await page.locator(".flip-card-stage").boundingBox();
    expect(stageBox).not.toBeNull();
    await page.mouse.move(stageBox!.x + stageBox!.width * 0.75, stageBox!.y + stageBox!.height * 0.5);
    await page.mouse.down();
    await page.mouse.move(stageBox!.x + stageBox!.width * 0.25, stageBox!.y + stageBox!.height * 0.5, { steps: 6 });
    await page.mouse.up();
    await expect(page.locator(".session-navigation label span")).toHaveText("6/8");
    await page.getByRole("button", { name: /Xáo/ }).click();
    await expect(page.locator(".session-status")).toContainText("Đã xáo thứ tự thẻ");
    await page.getByRole("button", { name: /Đã thử/ }).click();
    await expect(card).toHaveClass(/is-revealed/);
    expect(await page.locator(".study-face-back").evaluate((element) => element.scrollHeight <= element.clientHeight + 1)).toBe(true);
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

    await page.getByRole("button", { name: "Học bộ Meaning → Clause, 8 thẻ" }).click();
    await expect(page.getByTestId("map-study-overlay")).toBeVisible();
    expect(await page.evaluate(() => document.scrollingElement!.scrollHeight <= window.innerHeight + 1)).toBe(true);
    expect(await page.locator(".study-face-front").evaluate((element) => element.scrollHeight <= element.clientHeight + 1)).toBe(true);
    await page.getByRole("button", { name: /Đã thử/ }).click();
    expect(await page.locator(".study-face-back").evaluate((element) => element.scrollHeight <= element.clientHeight + 1)).toBe(true);
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
    expect(serviceWorker).toContain("twogether-shell-v3");
    expect(serviceWorker).not.toContain("private_notes");
    expect(serviceWorker).not.toContain("review_events");

    await page.getByTestId("learner-choice-hiep").click();
    await expect.poll(async () => page.evaluate(async () => Boolean(await navigator.serviceWorker.getRegistration()))).toBe(true);
  });
});
