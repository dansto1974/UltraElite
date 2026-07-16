#!/usr/bin/env node
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { createServer } from "node:http";
import { dirname, extname, join, normalize, resolve } from "node:path";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";

const args = Object.fromEntries(process.argv.slice(2).map((arg) => {
  const [key, ...rest] = arg.replace(/^--/, "").split("=");
  return [key, rest.join("=") || "1"];
}));

const chrome = args.chrome || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const duration = Number(args.duration || 6800);
const iterations = Number(args.iterations || 160);
const warmup = Number(args.warmup || 24);
const runs = Number(args.runs || args.repeat || 1);
const settleRuns = Number(args["settle-runs"] || args.settleRuns || (runs > 1 ? 3 : 0));
const model = args.model || "cobra";
const mode = args.mode || "solid";
const fx = args.fx || "ultra";
const quality = args.quality || "plain";
const lod = args.lod || "0";
const scale = args.scale || "46";
const batch = args.batch === "1";
const models = args.models || "";
const qualities = args.qualities || "";
const out = args.out || `/private/tmp/ultra-render-bench-${Date.now()}.html`;
const jsonOut = args["json-out"] || args.jsonOut || "";
const root = resolve(process.cwd());

const mimeTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".mjs", "text/javascript; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".svg", "image/svg+xml"]
]);

if (!existsSync(chrome)) {
  console.error(`Chrome not found: ${chrome}`);
  process.exit(2);
}

function decodeHtmlJson(text) {
  return text
    .replace(/&quot;/g, "\"")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function round(value, places = 2) {
  const number = Number(value) || 0;
  return Number(number.toFixed(places));
}

function normalizeResult(result) {
  return {
    model: result.model,
    modelName: result.modelName,
    quality: result.quality,
    settleRuns: result.settleRuns || 0,
    runs: result.runs || 1,
    frames: result.frames,
    filteredFrames: result.filteredFrames,
    outlierFrames: result.outlierFrames,
    avgMs: round(result.avgMs, 3),
    rawAvgMs: round(result.rawAvgMs, 3),
    avgFps: round(result.avgFps, 2),
    rawAvgFps: round(result.rawAvgFps, 2),
    stdDevMs: round(result.stdDevMs, 3),
    rawStdDevMs: round(result.rawStdDevMs, 3),
    jitterPct: round(result.jitterPct, 1),
    spikeTaxMs: round(result.spikeTaxMs, 3),
    spikeTaxPct: round(result.spikeTaxPct, 1),
    medianMs: round(result.medianMs, 3),
    p95Ms: round(result.p95Ms, 3),
    worstMs: round(result.worstMs, 2),
    rawWorstMs: round(result.rawWorstMs, 2),
    runStdDevMs: round(result.runStdDevMs, 3),
    runFpsStdDev: round(result.runFpsStdDev, 2),
    runP95StdDevMs: round(result.runP95StdDevMs, 3),
    runJitterPct: round(result.runJitterPct, 1),
    runMinAvgMs: round(result.runMinAvgMs, 3),
    runMaxAvgMs: round(result.runMaxAvgMs, 3),
    runResults: Array.isArray(result.runResults)
      ? result.runResults.map((run) => ({
        run: run.run,
        frames: run.frames,
        filteredFrames: run.filteredFrames,
        avgMs: round(run.avgMs, 3),
        avgFps: round(run.avgFps, 2),
        p95Ms: round(run.p95Ms, 3),
        stdDevMs: round(run.stdDevMs, 3),
        spikeTaxMs: round(run.spikeTaxMs, 3),
        rawWorstMs: round(run.rawWorstMs, 2),
        wallMs: round(run.wallMs, 2)
      }))
      : undefined,
    faces: result.faces,
    edges: result.edges,
    details: result.details,
    radius: round(result.radius, 1),
    wallMs: round(result.wallMs, 2)
  };
}

function normalizeSummary(summary, url, useRaf) {
  if (summary.results) {
    return {
      savedAt: new Date().toISOString(),
      url,
      runMode: "batch-sync",
      mode: summary.mode,
      fx: summary.fx,
      lod: summary.lod,
      iterations: summary.iterations,
      warmup: summary.warmup,
      runs: summary.runs || runs,
      settleRuns: summary.settleRuns || settleRuns,
      elapsedMs: round(summary.elapsedMs, 2),
      count: summary.results.length,
      results: summary.results.map(normalizeResult),
      html: out
    };
  }
  const phaseSummary = summary.phases
    .filter((p) => p.frames)
    .map((p) => `${p.id}:${p.medianMs.toFixed(2)}med/${p.p95Ms.toFixed(2)}p95/${p.stdDevMs.toFixed(2)}sd/${p.rawWorstMs.toFixed(1)}raw-worst`)
    .join(" ");
  return {
    savedAt: new Date().toISOString(),
    url,
    model: summary.model,
    mode: summary.mode,
    fx: summary.fx,
    quality: summary.quality,
    lod: summary.lod,
    runMode: useRaf ? "raf" : "sync",
    duration: useRaf ? duration : undefined,
    iterations: useRaf ? undefined : iterations,
    warmup: useRaf ? undefined : warmup,
    frames: summary.frames,
    filteredFrames: summary.filteredFrames,
    outlierFrames: summary.outlierFrames,
    avgMs: round(summary.avgMs, 3),
    rawAvgMs: round(summary.rawAvgMs, 3),
    avgFps: round(summary.avgFps, 2),
    rawAvgFps: round(summary.rawAvgFps, 2),
    stdDevMs: round(summary.stdDevMs, 3),
    rawStdDevMs: round(summary.rawStdDevMs, 3),
    jitterPct: round(summary.jitterPct, 1),
    spikeTaxMs: round(summary.spikeTaxMs, 3),
    spikeTaxPct: round(summary.spikeTaxPct, 1),
    medianMs: round(summary.medianMs, 3),
    p95Ms: round(summary.p95Ms, 3),
    worstMs: round(summary.worstMs, 2),
    rawWorstMs: round(summary.rawWorstMs, 2),
    phases: phaseSummary,
    html: out
  };
}

async function writeReport(report) {
  if (!jsonOut) return;
  const target = resolve(jsonOut);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, `${JSON.stringify(report, null, 2)}\n`);
}

async function attachSourceModelInfo(report) {
  if (!Array.isArray(report.results)) return report;
  const ids = [...new Set(report.results.map((result) => result.model).filter(Boolean))];
  const sourceModels = {};
  for (const id of ids) {
    const file = `assets/models/${id}.ultraship.json`;
    try {
      const info = await stat(resolve(file));
      sourceModels[id] = {
        file,
        mtimeMs: Math.round(info.mtimeMs),
        mtime: info.mtime.toISOString()
      };
    } catch {
      sourceModels[id] = { file, missing: true };
    }
  }
  report.sourceModels = sourceModels;
  return report;
}

function safeFilePath(urlPath) {
  const withoutQuery = urlPath.split("?")[0].split("#")[0];
  const decoded = decodeURIComponent(withoutQuery);
  const relative = normalize(decoded).replace(/^(\.\.[/\\])+/, "").replace(/^[/\\]+/, "");
  const filePath = resolve(join(root, relative || "index.html"));
  return filePath.startsWith(root) ? filePath : null;
}

async function startStaticServer() {
  const port = Number(args.port || 0);
  const server = createServer(async (req, res) => {
    const filePath = safeFilePath(req.url || "/");
    const urlPath = (req.url || "/").split("?")[0].split("#")[0];
    if (!filePath) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }
    const target = urlPath.endsWith("/") ? join(filePath, "index.html") : filePath;
    try {
      const data = await readFile(target);
      res.writeHead(200, {
        "content-type": mimeTypes.get(extname(target)) || "application/octet-stream",
        "cache-control": "no-cache"
      });
      res.end(data);
    } catch {
      res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      res.end("Not found");
    }
  });
  await new Promise((resolveListen) => server.listen(port, "127.0.0.1", resolveListen));
  const address = server.address();
  return { server, host: `http://127.0.0.1:${address.port}` };
}

async function main() {
  const served = args.serve === "1" ? await startStaticServer() : null;
  const host = served?.host || args.host || "http://127.0.0.1:8765";
  const useRaf = args.raf === "1";
  const runMode = batch ? `batch=1&iterations=${iterations}&warmup=${warmup}&runs=${Math.max(1, runs || 1)}&settleRuns=${Math.max(0, settleRuns || 0)}` : useRaf ? `auto=1&duration=${duration}` : `sync=1&iterations=${iterations}&warmup=${warmup}`;
  const batchQuery = batch ? `&models=${encodeURIComponent(models)}&qualities=${encodeURIComponent(qualities)}` : "";
  const url = `${host}/tools/render-bench/?${runMode}&model=${encodeURIComponent(model)}&mode=${encodeURIComponent(mode)}&fx=${encodeURIComponent(fx)}&quality=${encodeURIComponent(quality)}&lod=${encodeURIComponent(lod)}&scale=${encodeURIComponent(scale)}${batchQuery}`;
  const virtualTimeBudget = batch
    ? Math.max(15000, 15000 * Math.max(1, Math.min(11, (runs || 1) + (settleRuns || 0))))
    : useRaf ? duration + 1400 : 2200;
  const chromeArgs = [
    "--headless=new",
    "--disable-gpu",
    `--virtual-time-budget=${virtualTimeBudget}`,
    "--run-all-compositor-stages-before-draw",
    "--dump-dom",
    url
  ];

  try {
    const child = spawn(chrome, chromeArgs, { stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => { stderr += chunk; });

    const code = await new Promise((resolveClose) => child.on("close", resolveClose));
    await writeFile(out, stdout);
    if (code !== 0) {
      console.error(stderr.trim() || `Chrome exited with ${code}`);
      process.exit(code || 1);
    }

    const html = await readFile(out, "utf8");
    const match = html.match(/<pre id="summaryJson"[^>]*>([\s\S]*?)<\/pre>/);
    if (!match) {
      console.error("No render bench summary found.");
      process.exit(1);
    }

    const summary = JSON.parse(decodeHtmlJson(match[1]));
    const report = normalizeSummary(summary, url, useRaf);
    await attachSourceModelInfo(report);
    await writeReport(report);
    console.log(JSON.stringify(report, null, 2));
  } finally {
    served?.server.close();
  }
}

main().catch((error) => {
  console.error(error?.stack || error?.message || String(error));
  process.exit(1);
});
