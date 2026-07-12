#!/usr/bin/env node
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";

const args = Object.fromEntries(process.argv.slice(2).map((arg) => {
  const [key, ...rest] = arg.replace(/^--/, "").split("=");
  return [key, rest.join("=") || "1"];
}));

const chrome = args.chrome || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const duration = Number(args.duration || 6800);
const iterations = Number(args.iterations || 160);
const warmup = Number(args.warmup || 24);
const model = args.model || "cobra";
const mode = args.mode || "solid";
const fx = args.fx || "ultra";
const quality = args.quality || "plain";
const lod = args.lod || "0";
const scale = args.scale || "46";
const batch = args.batch === "1";
const models = args.models || "";
const qualities = args.qualities || "";
const host = args.host || "http://127.0.0.1:8765";
const out = args.out || `/private/tmp/ultra-render-bench-${Date.now()}.html`;

if (!existsSync(chrome)) {
  console.error(`Chrome not found: ${chrome}`);
  process.exit(2);
}

const useRaf = args.raf === "1";
const runMode = batch ? `batch=1&iterations=${iterations}&warmup=${warmup}` : useRaf ? `auto=1&duration=${duration}` : `sync=1&iterations=${iterations}&warmup=${warmup}`;
const batchQuery = batch ? `&models=${encodeURIComponent(models)}&qualities=${encodeURIComponent(qualities)}` : "";
const url = `${host}/tools/render-bench/?${runMode}&model=${encodeURIComponent(model)}&mode=${encodeURIComponent(mode)}&fx=${encodeURIComponent(fx)}&quality=${encodeURIComponent(quality)}&lod=${encodeURIComponent(lod)}&scale=${encodeURIComponent(scale)}${batchQuery}`;
const chromeArgs = [
  "--headless=new",
  "--disable-gpu",
  `--virtual-time-budget=${batch ? 15000 : useRaf ? duration + 1400 : 2200}`,
  "--run-all-compositor-stages-before-draw",
  "--dump-dom",
  url
];

const child = spawn(chrome, chromeArgs, { stdio: ["ignore", "pipe", "pipe"] });
let stdout = "";
let stderr = "";
child.stdout.setEncoding("utf8");
child.stderr.setEncoding("utf8");
child.stdout.on("data", (chunk) => { stdout += chunk; });
child.stderr.on("data", (chunk) => { stderr += chunk; });

const code = await new Promise((resolve) => child.on("close", resolve));
await import("node:fs/promises").then((fs) => fs.writeFile(out, stdout));
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

const summary = JSON.parse(match[1].replace(/&quot;/g, "\"").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">"));
if (summary.results) {
  console.log(JSON.stringify({
    runMode: "batch-sync",
    mode: summary.mode,
    fx: summary.fx,
    lod: summary.lod,
    iterations: summary.iterations,
    warmup: summary.warmup,
    elapsedMs: Number((summary.elapsedMs || 0).toFixed(2)),
    count: summary.results.length,
    results: summary.results.map((result) => ({
      model: result.model,
      modelName: result.modelName,
      quality: result.quality,
      frames: result.frames,
      avgFps: Number((result.avgFps || 0).toFixed(2)),
      medianMs: Number((result.medianMs || 0).toFixed(3)),
      p95Ms: Number((result.p95Ms || 0).toFixed(3)),
      worstMs: Number((result.worstMs || 0).toFixed(2)),
      faces: result.faces,
      edges: result.edges,
      details: result.details,
      radius: Number((result.radius || 0).toFixed(1)),
      wallMs: Number((result.wallMs || 0).toFixed(2))
    })),
    html: out
  }, null, 2));
  process.exit(0);
}
const phaseSummary = summary.phases
  .filter((p) => p.frames)
  .map((p) => `${p.id}:${p.medianMs.toFixed(2)}med/${p.p95Ms.toFixed(2)}p95/${p.worstMs.toFixed(1)}worst`)
  .join(" ");

console.log(JSON.stringify({
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
  avgFps: Number(summary.avgFps.toFixed(2)),
  medianMs: Number((summary.medianMs || 0).toFixed(3)),
  p95Ms: Number((summary.p95Ms || 0).toFixed(3)),
  worstMs: Number(summary.worstMs.toFixed(2)),
  phases: phaseSummary,
  html: out
}, null, 2));
