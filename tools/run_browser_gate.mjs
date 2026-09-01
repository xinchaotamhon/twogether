import { spawn, spawnSync } from "node:child_process";
import { setTimeout as wait } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import net from "node:net";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const node = process.execPath;
const nodeDir = path.dirname(node);
const npmCli = path.join(nodeDir, "node_modules", "npm", "bin", "npm-cli.js");
const viteCli = path.join(root, "node_modules", "vite", "bin", "vite.js");
const playwrightCli = path.join(
  root,
  "node_modules",
  "@playwright",
  "test",
  "cli.js",
);
async function reserveFreePort() {
  return await new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : 4173;
      server.close(() => resolve(port));
    });
  });
}

function runBuild() {
  const result = spawnSync(node, [npmCli, "run", "build"], {
    cwd: root,
    stdio: "inherit",
    windowsHide: true,
    env: { ...process.env, VITE_SYNC_MODE: "local" },
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

async function waitForPreview(previewUrl) {
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
const previewPort = await reserveFreePort();
const previewUrl = `http://127.0.0.1:${previewPort}/`;
const preview = spawn(
  node,
  [viteCli, "preview", "--host", "127.0.0.1", "--port", String(previewPort), "--strictPort"],
  {
    cwd: root,
    stdio: "inherit",
    windowsHide: true,
  },
);

try {
  await waitForPreview(previewUrl);
  const result = spawnSync(node, [playwrightCli, "test"], {
    cwd: root,
    stdio: "inherit",
    windowsHide: true,
    env: { ...process.env, TWOGATHER_EXTERNAL_SERVER: "1", TWOGATHER_BASE_URL: previewUrl },
  });
  process.exitCode = result.status ?? 1;
} finally {
  if (preview.exitCode === null) preview.kill();
}
