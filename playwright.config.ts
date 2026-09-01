import { defineConfig, devices } from "@playwright/test";

const chromePath = process.env.TWOGATHER_CHROME_PATH
  ?? (process.platform === "win32" ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" : undefined);

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  workers: 3,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: process.env.TWOGATHER_BASE_URL ?? "http://127.0.0.1:4173",
    trace: "retain-on-failure",
    ...devices["Desktop Chrome"],
    ...(chromePath ? { launchOptions: { executablePath: chromePath } } : {}),
  },
});
