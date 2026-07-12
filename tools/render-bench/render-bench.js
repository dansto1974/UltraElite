(() => {
"use strict";

const $ = (id) => document.getElementById(id);
const params = new URLSearchParams(window.location.search);

const canvas = $("benchCanvas");
const modelSelect = $("modelSelect");
const modeSelect = $("modeSelect");
const fxSelect = $("fxSelect");
const qualitySelect = $("qualitySelect");
const lodSelect = $("lodSelect");
const scaleSlider = $("scaleSlider");
const runBtn = $("runBtn");
const pauseBtn = $("pauseBtn");
const resetBtn = $("resetBtn");
const statusText = $("statusText");
const avgFps = $("avgFps");
const worstFrame = $("worstFrame");
const phaseReadout = $("phaseReadout");
const modelReadout = $("modelReadout");
const phaseStats = $("phaseStats");
const benchLog = $("benchLog");
const summaryJson = $("summaryJson");

const BENCH_TAU = Math.PI * 2;
const PHASE_MS = 1700;
const phases = [
  { id: "nose", label: "Nose / forward", yaw: Math.PI, pitch: 0, roll: 0, sweep: .1 },
  { id: "tail", label: "Tail / engines", yaw: 0, pitch: 0, roll: 0, sweep: .1 },
  { id: "port", label: "Port side", yaw: Math.PI / 2, pitch: 0, roll: 0, sweep: .08 },
  { id: "starboard", label: "Starboard side", yaw: -Math.PI / 2, pitch: 0, roll: 0, sweep: .08 },
  { id: "top", label: "Top", yaw: Math.PI, pitch: -.72, roll: 0, sweep: .12 },
  { id: "underside", label: "Underside", yaw: Math.PI, pitch: .72, roll: 0, sweep: .12 },
  { id: "threequarter", label: "Three-quarter", yaw: Math.PI * .76, pitch: -.28, roll: .22, sweep: .18 },
  { id: "orbit", label: "Slow orbit", orbit: true }
];

let api = null;
let running = false;
let startedAt = 0;
let lastFrameAt = 0;
let lastPhaseId = "";
let total = { frames: 0, ms: 0, worst: 0, samples: [] };
let perPhase = new Map();
let lastRenderInfo = null;
let autoStopTimer = 0;

function log(line) {
  const stamp = new Date().toLocaleTimeString();
  benchLog.textContent = `${stamp} ${line}\n${benchLog.textContent}`.slice(0, 2400);
}

function resetStats() {
  total = { frames: 0, ms: 0, worst: 0, samples: [] };
  perPhase = new Map(phases.map((p) => [p.id, { frames: 0, ms: 0, worst: 0, samples: [] }]));
  lastPhaseId = "";
  startedAt = performance.now();
  lastFrameAt = startedAt;
  renderStats();
  log("stats reset");
}

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  // Keep the benchmark at 1x by default so it measures renderer work rather
  // than Retina fill-rate. We can add a DPR selector once we need that axis.
  const dpr = 1;
  const w = Math.max(320, Math.round(rect.width * dpr));
  const h = Math.max(240, Math.round(rect.height * dpr));
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
}

function currentPhase(now) {
  const elapsed = now - startedAt;
  const index = Math.floor(elapsed / PHASE_MS) % phases.length;
  const phase = phases[index];
  const local = (elapsed % PHASE_MS) / PHASE_MS;
  return { phase, local, elapsed };
}

function percentile(samples, p) {
  if (!samples.length) return 0;
  const sorted = [...samples].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.max(0, Math.floor((sorted.length - 1) * p)));
  return sorted[index];
}

function renderStats() {
  avgFps.textContent = total.frames ? `${(1000 / (total.ms / total.frames)).toFixed(1)} FPS` : "-- FPS";
  worstFrame.textContent = total.worst ? `${total.worst.toFixed(1)} MS WORST` : "-- MS";
  phaseStats.innerHTML = phases.map((phase) => {
    const s = perPhase.get(phase.id) || { frames: 0, ms: 0, worst: 0, samples: [] };
    const avg = s.frames ? 1000 / (s.ms / s.frames) : 0;
    return `<tr><td>${phase.label}</td><td>${avg ? avg.toFixed(1) : "--"}</td><td>${s.worst ? s.worst.toFixed(1) : "--"}</td><td>${s.frames}</td></tr>`;
  }).join("");
  publishSummary(running ? "running" : "ready");
}

function buildSummary(status) {
  return {
    status,
    model: modelSelect.value,
    mode: modeSelect.value,
    fx: fxSelect.value,
    quality: qualitySelect.value,
    lod: lodSelect.value,
    scale: Number(scaleSlider.value),
    frames: total.frames,
    avgFps: total.frames ? 1000 / (total.ms / total.frames) : 0,
    medianMs: percentile(total.samples, .5),
    p95Ms: percentile(total.samples, .95),
    worstMs: total.worst || 0,
    phases: phases.map((phase) => {
      const s = perPhase.get(phase.id) || { frames: 0, ms: 0, worst: 0, samples: [] };
      return {
        id: phase.id,
        label: phase.label,
        frames: s.frames,
        avgFps: s.frames ? 1000 / (s.ms / s.frames) : 0,
        medianMs: percentile(s.samples, .5),
        p95Ms: percentile(s.samples, .95),
        worstMs: s.worst || 0
      };
    }),
    lastRender: lastRenderInfo
  };
}

function publishSummary(status) {
  const summary = buildSummary(status);
  window.__renderBenchSummary = summary;
  if (summaryJson) summaryJson.textContent = JSON.stringify(summary);
  return summary;
}

function currentAngles(now) {
  const { phase, local } = currentPhase(now);
  const wave = Math.sin(local * BENCH_TAU);
  const yaw = phase.orbit ? local * BENCH_TAU : phase.yaw + wave * (phase.sweep || 0);
  const pitch = phase.orbit ? Math.sin(local * BENCH_TAU) * .34 : phase.pitch + Math.cos(local * BENCH_TAU) * (phase.sweep || 0) * .42;
  const roll = phase.orbit ? Math.sin(local * BENCH_TAU * 1.5) * .28 : phase.roll + Math.sin(local * BENCH_TAU * 1.7) * (phase.sweep || 0) * .6;
  return { phase, local, yaw, pitch, roll };
}

function benchRenderOptions(yaw, pitch, roll) {
  return {
    model: modelSelect.value,
    mode: modeSelect.value,
    fxLevel: fxSelect.value,
    quality: qualitySelect.value,
    lod: lodSelect.value,
    targetScale: Number(scaleSlider.value) / 100,
    sceneLoadModels: 1,
    yaw,
    pitch,
    roll,
    engineGlow: .75,
    grid: true
  };
}

function applyRenderParams(settings) {
  if (settings.model) setSelectValue(modelSelect, settings.model);
  if (settings.mode) setSelectValue(modeSelect, settings.mode);
  if (settings.fx) setSelectValue(fxSelect, settings.fx);
  if (settings.quality) setSelectValue(qualitySelect, settings.quality);
  if (settings.lod) setSelectValue(lodSelect, settings.lod);
  if (settings.scale) scaleSlider.value = String(settings.scale);
}

function sampleAngles(index, warmup) {
  const phaseIndex = index % phases.length;
  const phase = phases[(phaseIndex + phases.length) % phases.length];
  const local = ((((index + warmup) / phases.length) % 1) + .125) % 1;
  const wave = Math.sin(local * BENCH_TAU);
  const yaw = phase.orbit ? local * BENCH_TAU : phase.yaw + wave * (phase.sweep || 0);
  const pitch = phase.orbit ? Math.sin(local * BENCH_TAU) * .34 : phase.pitch + Math.cos(local * BENCH_TAU) * (phase.sweep || 0) * .42;
  const roll = phase.orbit ? Math.sin(local * BENCH_TAU * 1.5) * .28 : phase.roll + Math.sin(local * BENCH_TAU * 1.7) * (phase.sweep || 0) * .6;
  return { phase, yaw, pitch, roll };
}

function renderCurrentBenchFrame(now, includeStats) {
  if (!api) return;
  resizeCanvas();

  const { phase, yaw, pitch, roll } = currentAngles(now);
  if (includeStats && phase.id !== lastPhaseId) {
    lastPhaseId = phase.id;
    log(`phase ${phase.label}`);
  }

  const renderStarted = performance.now();
  lastRenderInfo = api.renderFrame(canvas, benchRenderOptions(yaw, pitch, roll));
  const renderMs = performance.now() - renderStarted;

  statusText.textContent = `${includeStats ? "Running" : "Ready"} | ${phase.label} | render ${renderMs.toFixed(2)} ms`;
  phaseReadout.textContent = [
    `phase: ${phase.label}`,
    `yaw: ${yaw.toFixed(3)}`,
    `pitch: ${pitch.toFixed(3)}`,
    `roll: ${roll.toFixed(3)}`,
    `mode: ${modeSelect.value}`,
    `detail: ${qualitySelect.value}`,
    `lod: ${lodSelect.value}`
  ].join("\n");
  if (lastRenderInfo) {
    modelReadout.textContent = [
      `${api.models.find((m) => m.id === lastRenderInfo.model)?.name || lastRenderInfo.model}`,
      `faces: ${lastRenderInfo.faces}`,
      `edges: ${lastRenderInfo.edges}`,
      `details: ${lastRenderInfo.details}`,
      `projected verts: ${lastRenderInfo.points}`,
      `radius: ${lastRenderInfo.radius.toFixed(1)}`,
      `camera distance: ${lastRenderInfo.distance.toFixed(1)}`
    ].join("\n");
  }
}

function runSyncSamples(iterations, warmup) {
  if (!api) return;
  resizeCanvas();
  resetStats();
  const started = performance.now();
  for (let i = -warmup; i < iterations; i++) {
    const { phase, yaw, pitch, roll } = sampleAngles(i, warmup);
    const before = performance.now();
    lastRenderInfo = api.renderFrame(canvas, benchRenderOptions(yaw, pitch, roll));
    const renderMs = performance.now() - before;
    if (i < 0) continue;
    total.frames++;
    total.ms += renderMs;
    total.worst = Math.max(total.worst, renderMs);
    total.samples.push(renderMs);
    const phaseStatsEntry = perPhase.get(phase.id);
    if (phaseStatsEntry) {
      phaseStatsEntry.frames++;
      phaseStatsEntry.ms += renderMs;
      phaseStatsEntry.worst = Math.max(phaseStatsEntry.worst, renderMs);
      phaseStatsEntry.samples.push(renderMs);
    }
  }
  return { elapsed: performance.now() - started, summary: buildSummary("sample-complete") };
}

function runSyncBenchmark() {
  if (!api) return;
  const iterations = Math.max(8, Math.min(2000, Number(params.get("iterations")) || 160));
  const warmup = Math.max(0, Math.min(500, Number(params.get("warmup")) || 24));
  const result = runSyncSamples(iterations, warmup);
  if (!result) return;
  renderStats();
  statusText.textContent = `Sync complete | ${iterations} renders | ${(total.ms / total.frames).toFixed(2)} ms avg`;
  phaseReadout.textContent = [
    `sync benchmark`,
    `renders: ${iterations}`,
    `warmup: ${warmup}`,
    `wall: ${result.elapsed.toFixed(2)} ms`,
    `render avg: ${(total.ms / total.frames).toFixed(3)} ms`,
    `render worst: ${total.worst.toFixed(3)} ms`,
    `mode: ${modeSelect.value}`,
    `detail: ${qualitySelect.value}`,
    `lod: ${lodSelect.value}`
  ].join("\n");
  publishSummary("sync-complete");
  document.body.dataset.benchDone = "true";
  log("sync benchmark complete");
}

function parseCsvParam(name, fallback) {
  const raw = params.get(name);
  if (!raw) return fallback;
  return raw.split(",").map((item) => item.trim()).filter(Boolean);
}

function defaultBatchModels() {
  const preferred = ["cobra", "krait", "python", "anaconda", "thargoid", "diamondback"];
  const available = new Set(api.models.map((m) => m.id));
  return preferred.filter((id) => available.has(id)).slice(0, 8);
}

function runBatchBenchmark() {
  if (!api) return;
  const saved = {
    model: modelSelect.value,
    mode: modeSelect.value,
    fx: fxSelect.value,
    quality: qualitySelect.value,
    lod: lodSelect.value,
    scale: scaleSlider.value
  };
  const modelParam = params.get("models");
  const allModels = api.models.map((m) => m.id);
  const requestedModels = modelParam === "all" ? allModels : parseCsvParam("models", defaultBatchModels());
  const available = new Set(allModels);
  const models = requestedModels.filter((id) => available.has(id));
  const qualities = parseCsvParam("qualities", ["plain", "live", "full"]).filter((q) => ["plain", "live", "full"].includes(q));
  const iterations = Math.max(8, Math.min(1000, Number(params.get("iterations")) || 80));
  const warmup = Math.max(0, Math.min(300, Number(params.get("warmup")) || 20));
  const results = [];
  const started = performance.now();

  running = false;
  statusText.textContent = `Batch running | ${models.length} models x ${qualities.length} methods`;
  for (const model of models) {
    for (const quality of qualities) {
      applyRenderParams({
        model,
        mode: params.get("mode") || saved.mode,
        fx: params.get("fx") || saved.fx,
        quality,
        lod: params.get("lod") || saved.lod,
        scale: params.get("scale") || saved.scale
      });
      const result = runSyncSamples(iterations, warmup);
      if (!result) continue;
      results.push({
        model,
        modelName: api.models.find((m) => m.id === model)?.name || model,
        mode: modeSelect.value,
        fx: fxSelect.value,
        quality,
        lod: lodSelect.value,
        frames: result.summary.frames,
        avgFps: result.summary.avgFps,
        medianMs: result.summary.medianMs,
        p95Ms: result.summary.p95Ms,
        worstMs: result.summary.worstMs,
        faces: result.summary.lastRender?.faces || 0,
        edges: result.summary.lastRender?.edges || 0,
        details: result.summary.lastRender?.details || 0,
        radius: result.summary.lastRender?.radius || 0,
        wallMs: result.elapsed
      });
    }
  }

  const summary = {
    status: "batch-complete",
    runMode: "batch-sync",
    mode: params.get("mode") || saved.mode,
    fx: params.get("fx") || saved.fx,
    lod: params.get("lod") || saved.lod,
    iterations,
    warmup,
    elapsedMs: performance.now() - started,
    results
  };
  applyRenderParams(saved);
  renderCurrentBenchFrame(performance.now(), false);
  window.__renderBenchSummary = summary;
  if (summaryJson) summaryJson.textContent = JSON.stringify(summary);
  statusText.textContent = `Batch complete | ${results.length} runs | ${(summary.elapsedMs / 1000).toFixed(1)} s`;
  phaseReadout.textContent = [
    `batch benchmark`,
    `models: ${models.join(", ")}`,
    `methods: ${qualities.join(", ")}`,
    `runs: ${results.length}`,
    `renders/run: ${iterations}`,
    `warmup/run: ${warmup}`
  ].join("\n");
  document.body.dataset.benchDone = "true";
  log("batch benchmark complete");
}

function renderFrame(now) {
  requestAnimationFrame(renderFrame);
  if (!api || !running) return;
  resizeCanvas();

  const dt = lastFrameAt ? now - lastFrameAt : 16.7;
  lastFrameAt = now;
  if (dt > 0 && dt < 1000) {
    total.frames++;
    total.ms += dt;
    total.worst = Math.max(total.worst, dt);
    total.samples.push(dt);
  }

  const { phase } = currentPhase(now);
  const phaseStatsEntry = perPhase.get(phase.id);
  if (phaseStatsEntry && dt > 0 && dt < 1000) {
    phaseStatsEntry.frames++;
    phaseStatsEntry.ms += dt;
    phaseStatsEntry.worst = Math.max(phaseStatsEntry.worst, dt);
    phaseStatsEntry.samples.push(dt);
  }

  renderCurrentBenchFrame(now, true);
  if (total.frames % 12 === 0) renderStats();
}

function init() {
  api = window.UltraEliteRenderBench;
  if (!api) {
    statusText.textContent = "Renderer hook missing";
    log("renderer hook missing");
    return;
  }
  modelSelect.innerHTML = api.models.map((m) => `<option value="${m.id}">${m.name}</option>`).join("");
  modelSelect.value = api.models.some((m) => m.id === "cobra") ? "cobra" : api.models[0]?.id || "";
  applyParams();
  log(`renderer ready v${api.version}, ${api.models.length} models`);
  resetStats();
  renderCurrentBenchFrame(performance.now(), false);
  if (params.get("batch") === "1") runBatchBenchmark();
  else if (params.get("sync") === "1") runSyncBenchmark();
  else if (params.get("auto") === "1") startAutoRun();
  requestAnimationFrame(renderFrame);
}

function setSelectValue(select, value) {
  if (!value) return;
  if (Array.from(select.options).some((option) => option.value === value)) select.value = value;
}

function applyParams() {
  setSelectValue(modelSelect, params.get("model"));
  setSelectValue(modeSelect, params.get("mode"));
  setSelectValue(fxSelect, params.get("fx"));
  setSelectValue(qualitySelect, params.get("quality"));
  setSelectValue(lodSelect, params.get("lod"));
  const scale = Number(params.get("scale"));
  if (Number.isFinite(scale)) scaleSlider.value = String(Math.max(Number(scaleSlider.min), Math.min(Number(scaleSlider.max), scale)));
}

function startAutoRun() {
  running = true;
  pauseBtn.textContent = "Pause";
  lastFrameAt = performance.now();
  const duration = Math.max(800, Math.min(30000, Number(params.get("duration")) || 6800));
  statusText.textContent = `Running auto benchmark ${duration} ms`;
  clearTimeout(autoStopTimer);
  autoStopTimer = setTimeout(() => {
    running = false;
    pauseBtn.textContent = "Resume";
    renderStats();
    statusText.textContent = `Auto complete | ${avgFps.textContent} | ${worstFrame.textContent}`;
    publishSummary("complete");
    document.body.dataset.benchDone = "true";
    log("auto benchmark complete");
  }, duration);
}

runBtn.addEventListener("click", () => {
  running = true;
  pauseBtn.textContent = "Pause";
  lastFrameAt = performance.now();
  statusText.textContent = "Running";
});

pauseBtn.addEventListener("click", () => {
  running = !running;
  pauseBtn.textContent = running ? "Pause" : "Resume";
  lastFrameAt = performance.now();
});

resetBtn.addEventListener("click", resetStats);
[modelSelect, modeSelect, fxSelect, qualitySelect, lodSelect].forEach((el) => {
  el.addEventListener("change", () => {
    resetStats();
    log(`${el.id} -> ${el.value}`);
    if (!running) renderCurrentBenchFrame(performance.now(), false);
  });
});
scaleSlider.addEventListener("input", () => {
  resetStats();
  if (!running) renderCurrentBenchFrame(performance.now(), false);
});
window.addEventListener("resize", () => {
  resizeCanvas();
  if (!running) renderCurrentBenchFrame(performance.now(), false);
});

if (window.UltraEliteRenderBench) init();
else window.addEventListener("ultraelite:renderbench-ready", init, { once: true });
})();
