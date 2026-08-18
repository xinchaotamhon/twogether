import { spawn, spawnSync } from "node:child_process";
import { setTimeout as wait } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const node = process.execPath;
const nodeDir = path.dirname(node);
const npmCli = path.join(nodeDir, "node_modules", "npm", "bin", "npm-cli.js");
const viteCli = path.join(root, "node_modules", "vite", "bin", "vite.js");
const playwrightCli = path.join(root, "node_modules", "@playwright", "test", "cli.js");
const previewUrl = "http://127.0.0.1:4173/";

function runBuild() {
  const result = spawnSync(node, [npmCli, "run", "build"], { cwd: root, stdio: "inherit", windowsHide: true });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

async function waitForPreview() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(previewUrl);
      if (response.ok) return;
    } catch {
      // Preview is still starting.
    }
    await wait(250);
  }
  throw new Error("Preview server did not become ready within 15 seconds");
}

runBuild();
const preview = spawn(node, [viteCli, "preview", "--host", "127.0.0.1", "--port", "4173"], {
  cwd: root,
  stdio: "inherit",
  windowsHide: true,
});

try {
  await waitForPreview();
  const result = spawnSync(node, [playwrightCli, "test"], {
    cwd: root,
    stdio: "inherit",
    windowsHide: true,
    env: { ...process.env, TWOGATHER_EXTERNAL_SERVER: "1" },
  });
  process.exitCode = result.status ?? 1;
} finally {
  if (preview.exitCode === null) preview.kill();
}
