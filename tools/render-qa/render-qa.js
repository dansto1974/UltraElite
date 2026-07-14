(() => {
"use strict";

const $ = (id) => document.getElementById(id);
const canvas = $("qaCanvas");
const modelSelect = $("modelSelect");
const angleSelect = $("angleSelect");
const modeSelect = $("modeSelect");
const qualitySelect = $("qualitySelect");
const scaleSlider = $("scaleSlider");
const prevBtn = $("prevBtn");
const nextBtn = $("nextBtn");
const autoBtn = $("autoBtn");
const statusText = $("statusText");
const modelCounter = $("modelCounter");
const modelList = $("modelList");
const modelReadout = $("modelReadout");
const diagnosticsList = $("diagnosticsList");
const notes = $("notes");

const angles = [
  { id: "nose", label: "Nose", yaw: Math.PI, pitch: 0, roll: 0 },
  { id: "tail", label: "Tail", yaw: 0, pitch: 0, roll: 0 },
  { id: "port", label: "Port", yaw: Math.PI / 2, pitch: 0, roll: 0 },
  { id: "starboard", label: "Starboard", yaw: -Math.PI / 2, pitch: 0, roll: 0 },
  { id: "top", label: "Top", yaw: Math.PI, pitch: -.72, roll: 0 },
  { id: "underside", label: "Underside", yaw: Math.PI, pitch: .72, roll: 0 },
  { id: "threequarter", label: "Three-quarter", yaw: Math.PI * .76, pitch: -.28, roll: .22 },
  { id: "orbit", label: "Orbit", orbit: true }
];

let api = null;
let auto = false;
let orbitStart = performance.now();
const humanNotes = new Map();

function currentModelId() {
  return modelSelect.value || api?.models?.[0]?.id || "";
}

function modelIndex() {
  return Math.max(0, api.models.findIndex((model) => model.id === currentModelId()));
}

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const w = Math.max(420, Math.round(rect.width));
  const h = Math.max(320, Math.round(rect.height));
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
}

function modelBlueprint(id) {
  return globalThis.ULTRA_ELITE_MODEL_BLUEPRINTS?.[id] || null;
}

function skinManifest(id) {
  return globalThis.ULTRA_ELITE_BITMAP_SKINS?.[id] || null;
}

function diagnosticsForModel(id) {
  const blueprint = modelBlueprint(id);
  const manifest = skinManifest(id);
  const projection = blueprint?.imageProjection || {};
  const faceTextures = Array.isArray(projection.faceTextures) ? projection.faceTextures : [];
  const uniqueFaceKeys = [...new Set(faceTextures.filter(Boolean))];
  const fullyFaceTextured = faceTextures.length > 0 && faceTextures.every(Boolean);
  const diagnostics = [];

  if (!blueprint) {
    diagnostics.push({ level: "warn", text: "No generated model blueprint found; using built-in fallback if present." });
  }
  if (uniqueFaceKeys.length && !manifest?.faces) {
    diagnostics.push({ level: "error", text: "Model declares face textures, but the bitmap manifest has no face entries." });
  }
  for (const key of uniqueFaceKeys) {
    if (!manifest?.faces?.[key]) {
      diagnostics.push({ level: "error", text: `Missing face bitmap in manifest: ${key}` });
    }
  }
  if (fullyFaceTextured) {
    const leakedSides = ["top", "bottom", "back"].filter((side) => manifest?.[side]);
    if (leakedSides.length) {
      diagnostics.push({ level: "warn", text: `Fully face-textured model still embeds side skins: ${leakedSides.join(", ")}` });
    } else {
      diagnostics.push({ level: "ok", text: "Fully face-textured; side skins are not embedded." });
    }
  } else if (manifest) {
    const presentSides = ["top", "bottom", "back"].filter((side) => manifest[side]);
    diagnostics.push({ level: "ok", text: `Side skins embedded: ${presentSides.length ? presentSides.join(", ") : "none"}` });
  }
  if (faceTextures.length) {
    diagnostics.push({ level: "ok", text: `Face texture slots: ${faceTextures.filter(Boolean).length}/${faceTextures.length}; keys: ${uniqueFaceKeys.join(", ")}` });
  }
  if (!diagnostics.length) diagnostics.push({ level: "ok", text: "No bitmap manifest warnings." });
  return diagnostics;
}

function renderDiagnostics(diagnostics) {
  diagnosticsList.innerHTML = diagnostics.map((item) =>
    `<div class="diagnostic ${item.level === "error" ? "error" : item.level === "warn" ? "warn" : ""}">${item.text}</div>`
  ).join("");
}

function updateModelList(diagnosticsMap = new Map()) {
  const current = currentModelId();
  modelList.innerHTML = api.models.map((model) => {
    const diagnostics = diagnosticsMap.get(model.id) || diagnosticsForModel(model.id);
    const issue = diagnostics.some((item) => item.level === "error" || item.level === "warn");
    return `<button class="model-btn ${model.id === current ? "current" : ""} ${issue ? "issue" : ""}" data-model="${model.id}" type="button"><span>${model.name}</span><span>${issue ? "!" : "ok"}</span></button>`;
  }).join("");
}

function currentAngles() {
  const angle = angles.find((item) => item.id === angleSelect.value) || angles[0];
  if (!angle.orbit) return angle;
  const t = ((performance.now() - orbitStart) / 4600) % 1;
  return {
    ...angle,
    yaw: t * Math.PI * 2,
    pitch: Math.sin(t * Math.PI * 2) * .34,
    roll: Math.sin(t * Math.PI * 3) * .22
  };
}

function render() {
  if (!api) return;
  resizeCanvas();
  const angle = currentAngles();
  const before = performance.now();
  const info = api.renderFrame(canvas, {
    model: currentModelId(),
    mode: modeSelect.value,
    fxLevel: "ultra",
    quality: qualitySelect.value,
    lod: "0",
    targetScale: Number(scaleSlider.value) / 100,
    yaw: angle.yaw,
    pitch: angle.pitch,
    roll: angle.roll,
    engineGlow: .8,
    grid: true
  });
  const renderMs = performance.now() - before;
  const model = api.models.find((entry) => entry.id === currentModelId());
  const diagnostics = diagnosticsForModel(currentModelId());
  renderDiagnostics(diagnostics);
  updateModelList(new Map([[currentModelId(), diagnostics]]));
  const index = modelIndex();
  modelCounter.textContent = `${index + 1} / ${api.models.length}`;
  statusText.textContent = `${model?.name || currentModelId()} | ${angle.label} | ${renderMs.toFixed(2)} ms`;
  modelReadout.textContent = [
    `id: ${currentModelId()}`,
    `name: ${model?.name || "--"}`,
    `faces: ${info?.faces ?? model?.faces ?? "--"}`,
    `edges: ${info?.edges ?? model?.edges ?? "--"}`,
    `details: ${info?.details ?? model?.details ?? "--"}`,
    `projected points: ${info?.points ?? "--"}`,
    `route: ${info?.route || "--"}`,
    `radius: ${info?.radius?.toFixed?.(1) || model?.radius || "--"}`,
    `mode: ${modeSelect.value}`,
    `quality: ${qualitySelect.value}`
  ].join("\n");
}

function selectModel(id) {
  humanNotes.set(currentModelId(), notes.value);
  modelSelect.value = id;
  notes.value = humanNotes.get(id) || "";
  orbitStart = performance.now();
  render();
}

function stepModel(delta) {
  const next = (modelIndex() + delta + api.models.length) % api.models.length;
  selectModel(api.models[next].id);
}

function animationLoop() {
  requestAnimationFrame(animationLoop);
  if (auto || angleSelect.value === "orbit") render();
}

function init() {
  api = window.UltraEliteRenderBench;
  if (!api) {
    statusText.textContent = "Renderer hook missing.";
    return;
  }
  modelSelect.innerHTML = api.models.map((model) => `<option value="${model.id}">${model.name}</option>`).join("");
  angleSelect.innerHTML = angles.map((angle) => `<option value="${angle.id}">${angle.label}</option>`).join("");
  modelSelect.value = api.models[0]?.id || "";
  updateModelList();
  render();
  requestAnimationFrame(animationLoop);
}

modelList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-model]");
  if (button) selectModel(button.dataset.model);
});
modelSelect.addEventListener("change", () => selectModel(modelSelect.value));
angleSelect.addEventListener("change", () => { orbitStart = performance.now(); render(); });
modeSelect.addEventListener("change", render);
qualitySelect.addEventListener("change", render);
scaleSlider.addEventListener("input", render);
prevBtn.addEventListener("click", () => stepModel(-1));
nextBtn.addEventListener("click", () => stepModel(1));
autoBtn.addEventListener("click", () => {
  auto = !auto;
  autoBtn.classList.toggle("active", auto);
  autoBtn.textContent = auto ? "Pause" : "Auto";
});
window.addEventListener("resize", render);

if (window.UltraEliteRenderBench) init();
else window.addEventListener("ultraelite:renderbench-ready", init, { once: true });
})();
