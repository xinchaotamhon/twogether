import { expect, test } from "@playwright/test";
import source from "../content/drafts/english-core-beginner-revision-v2.json" with { type: "json" };
import revision from "../content/revisions/english-core-transfer-novelty-v3.json" with { type: "json" };

const cards = source.cards.map((card) => ({
  ...card,
  ...revision.overrides.find((item) => item.card_id === card.id),
}));
const longest = new Set<string>();
for (const size of [
  (card: typeof cards[number]) => card.prompt.length,
  (card: typeof cards[number]) => card.model_answer.length + card.explanation.length,
  (card: typeof cards[number]) => card.transfer_prompt.length + card.transfer_answer.length,
]) {
  [...cards].sort((a, b) => size(b) - size(a)).slice(0, 3).forEach((card) => longest.add(card.id));
}

for (const viewport of [{ width: 360, height: 640 }, { width: 1366, height: 768 }]) {
  test(`keeps the longest Core content readable inside its frame at ${viewport.width}x${viewport.height}`, async ({ page }) => {
    test.setTimeout(60000);
    await page.setViewportSize(viewport);
    await page.goto("/");
    await page.getByTestId("learner-choice-hiep").click();
    await expect(page.getByTestId("tree-map")).toBeVisible();
    await page.screenshot({ path: `test-results/session-map-${viewport.width}.png` });
    for (const id of longest) {
      const collection = source.collections.find((item) => item.card_ids.includes(id))!;
      await page.getByRole("button", { name: `Học bộ ${collection.title}, ${collection.card_ids.length} thẻ` }).click();
      await page.getByTestId("card-jump-range").fill(String(collection.card_ids.indexOf(id) + 1));
      const questionFits = await page.locator(".flip-question").evaluate((element) => {
        const bounds = element.getBoundingClientRect();
        const content = element.querySelector("h2")!.getBoundingClientRect();
        return content.top >= bounds.top - 1 && content.bottom <= bounds.bottom + 1;
      });
      expect(questionFits, `${id} question`).toBe(true);
      await page.getByRole("button", { name: /Đã thử/ }).click();
      for (const tab of ["Đáp án & vì sao", "Tình huống mới"]) {
        await page.getByRole("tab", { name: tab }).click();
        const fits = await page.locator(".back-page").evaluate((element) => {
          const bounds = element.getBoundingClientRect();
          return [...element.children].every((child) => {
            const box = child.getBoundingClientRect();
            return box.top >= bounds.top - 1 && box.bottom <= bounds.bottom + 1;
          });
        });
        expect(fits, `${id} ${tab}`).toBe(true);
        if (id === [...longest].at(-1) && tab === "Tình huống mới") {
          await page.screenshot({ path: `test-results/session-transfer-${viewport.width}.png` });
        }
      }
      await page.getByRole("button", { name: "Đóng flashcard và trở lại cây" }).click();
    }
  });
}
