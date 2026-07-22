#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const configPath = path.join(projectRoot, ".ultra-elite-publish.env");
const indexPath = path.join(projectRoot, "index.html");
const visitBeaconPath = path.join(projectRoot, "ultra-elite-visit.svg");

function parseEnv(text) {
  const values = {};
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;
    let value = match[2].trim();
    if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    values[match[1]] = value;
  }
  return values;
}

function requireValue(values, key) {
  const value = values[key];
  if (!value) throw new Error(`Missing ${key} in ${path.basename(configPath)}`);
  return value;
}

async function main() {
  const checkOnly = process.argv.includes("--check");
  let configText;
  try {
    configText = await readFile(configPath, "utf8");
  } catch (error) {
    if (error?.code === "ENOENT") {
      throw new Error(`Missing local publish config: ${configPath}`);
    }
    throw error;
  }

  const config = parseEnv(configText);
  const host = requireValue(config, "ULTRA_ELITE_FTP_HOST");
  const user = requireValue(config, "ULTRA_ELITE_FTP_USER");
  const password = requireValue(config, "ULTRA_ELITE_FTP_PASSWORD");
  const remotePath = config.ULTRA_ELITE_FTP_PATH || "htdocs/index.html";
  const normalizedRemotePath = remotePath.replace(/^\/+/, "");
  const remoteDir = path.posix.dirname(normalizedRemotePath);
  const visitBeaconRemotePath = remoteDir === "."
    ? "ultra-elite-visit.svg"
    : `${remoteDir}/ultra-elite-visit.svg`;

  if (checkOnly) {
    console.log(`Publish config OK: ${host}/${normalizedRemotePath}`);
    console.log(`Visit beacon target OK: ${host}/${visitBeaconRemotePath}`);
    return;
  }

  async function uploadFile(localPath, remoteFilePath, label) {
    const targetUrl = `ftp://${host}/${remoteFilePath}`;
    console.log(`Publishing ${label} to ${host}/${remoteFilePath}`);
    const curl = spawn("curl", [
      "--fail",
      "--show-error",
      "--ftp-create-dirs",
      "--upload-file",
      localPath,
      "--user",
      `${user}:${password}`,
      targetUrl
    ], {
      stdio: ["ignore", "inherit", "inherit"]
    });

    await new Promise((resolve, reject) => {
      curl.on("error", reject);
      curl.on("exit", (code, signal) => {
        if (code === 0) resolve();
        else reject(new Error(`curl exited with ${signal || code}`));
      });
    });
  }

  await uploadFile(indexPath, normalizedRemotePath, "index.html");
  await uploadFile(visitBeaconPath, visitBeaconRemotePath, "ultra-elite-visit.svg");
  console.log("Publish complete.");
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
