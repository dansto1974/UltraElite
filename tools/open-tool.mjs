#!/usr/bin/env node
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const host = process.env.HOST || "127.0.0.1";
const port = Number(process.env.PORT || 8765);
const args = process.argv.slice(2);
const toolPath = args.find((arg) => !arg.startsWith("--")) || "/";
const noOpen = args.includes("--no-open");
const checkOnly = args.includes("--check");
const url = new URL(toolPath.startsWith("/") ? toolPath : `/${toolPath}`, `http://${host}:${port}`);

function requestServer(timeoutMs = 700) {
  return new Promise((resolve) => {
    const req = http.get({
      host,
      port,
      path: "/api/status",
      timeout: timeoutMs
    }, (res) => {
      res.resume();
      resolve(res.statusCode === 200);
    });
    req.on("timeout", () => {
      req.destroy();
      resolve(false);
    });
    req.on("error", () => resolve(false));
  });
}

async function waitForServer(timeoutMs = 10000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await requestServer()) return true;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  return false;
}

function startToolServer() {
  const logPath = path.join(os.tmpdir(), "ultra-elite-dev-tools-server.log");
  const log = fs.openSync(logPath, "a");
  const child = spawn("npm", ["run", "dev:tools"], {
    cwd: projectRoot,
    detached: true,
    env: { ...process.env, HOST: host, PORT: String(port) },
    stdio: ["ignore", log, log]
  });
  child.unref();
  console.log(`Starting Ultra Elite tool server on http://${host}:${port}`);
  console.log(`Server log: ${logPath}`);
}

function openUrl(target) {
  const command = process.platform === "darwin"
    ? "open"
    : process.platform === "win32"
      ? "cmd"
      : "xdg-open";
  const commandArgs = process.platform === "win32"
    ? ["/c", "start", "", target]
    : [target];
  const child = spawn(command, commandArgs, {
    detached: true,
    stdio: "ignore"
  });
  child.unref();
}

async function main() {
  let running = await requestServer();
  if (!running) {
    startToolServer();
    running = await waitForServer();
  }
  if (!running) {
    throw new Error(`Tool server did not respond on http://${host}:${port}`);
  }
  console.log(`Tool server ready: http://${host}:${port}`);
  console.log(`Tool URL: ${url.href}`);
  if (!checkOnly && !noOpen) openUrl(url.href);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
