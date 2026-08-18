import { expect, test } from "@playwright/test";

test.describe("Twogether P0 browser contract", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("requires an attempt before revealing the answer and keeps focus keyboardable", async ({ page }) => {
    await page.getByTestId("learner-choice-hiep").click();
    await expect(page.getByTestId("study-card")).toBeVisible();
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
    await page.getByRole("button", { name: /Đã thử/ }).click();
    await page.getByRole("button", { name: /Nhớ/ }).click();
    await page.getByRole("button", { name: "Đổi người" }).click();
    await page.getByTestId("learner-choice-hoang").click();

    await expect(page.getByTestId("study-progress").locator("i")).toHaveText("/ 12");
    await expect(page.getByTestId("study-card")).toBeVisible();
  });

  test("keeps the visual map and keyboard table alternative in parity", async ({ page }) => {
    await page.getByTestId("learner-choice-hiep").click();
    await page.getByTestId("nav-map").click();
    const accessibleMap = page.locator("details.accessible-map");
    await accessibleMap.locator("summary").click();
    await expect(accessibleMap.locator("table")).toBeVisible();
    await expect(accessibleMap.locator("tbody th").first()).toBeVisible();
    await expect(page.getByText("English foundations").first()).toBeVisible();
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
    expect(serviceWorker).not.toContain("private_notes");
    expect(serviceWorker).not.toContain("review_events");

    await page.getByTestId("learner-choice-hiep").click();
    await expect.poll(async () => page.evaluate(async () => Boolean(await navigator.serviceWorker.getRegistration()))).toBe(true);
  });
});
