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
const markOkBtn = $("markOkBtn");
const markIssueBtn = $("markIssueBtn");
const clearReviewBtn = $("clearReviewBtn");
const reviewSummary = $("reviewSummary");

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
const REVIEW_STORAGE_KEY = "ultraElite.renderQaReviews.v1";
const reviewState = loadReviewState();
const latestDiagnosticsByModel = new Map();

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));
}

function loadReviewState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(REVIEW_STORAGE_KEY) || "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function saveReviewState() {
  localStorage.setItem(REVIEW_STORAGE_KEY, JSON.stringify(reviewState));
}

function reviewForModel(id) {
  return reviewState[id] || { status: "todo", notes: "" };
}

function saveCurrentNotes() {
  const id = currentModelId();
  if (!id) return;
  const entry = reviewForModel(id);
  const text = notes.value.trim();
  if (!text && (entry.status || "todo") === "todo") {
    delete reviewState[id];
  } else {
    reviewState[id] = {
      ...entry,
      status: entry.status || "todo",
      notes: text,
      updatedAt: new Date().toISOString()
    };
  }
  saveReviewState();
  updateModelList();
  renderReviewSummary();
}

function setCurrentReviewStatus(status) {
  const id = currentModelId();
  if (!id) return;
  const nextStatus = status === "ok" || status === "issue" ? status : "todo";
  const text = notes.value.trim();
  if (nextStatus === "todo" && !text) {
    delete reviewState[id];
  } else {
    reviewState[id] = {
      ...reviewForModel(id),
      status: nextStatus,
      notes: text,
      updatedAt: new Date().toISOString()
    };
  }
  saveReviewState();
  render();
}

function reviewBadge(id, diagnosticsIssue) {
  const status = reviewForModel(id).status || "todo";
  if (status === "ok") return { label: "ok", className: "review-ok" };
  if (status === "issue") return { label: "issue", className: "review-issue" };
  return { label: diagnosticsIssue ? "!" : "todo", className: diagnosticsIssue ? "issue" : "" };
}

function renderReviewSummary() {
  if (!reviewSummary || !api?.models?.length) return;
  const counts = api.models.reduce((acc, model) => {
    const status = reviewForModel(model.id).status || "todo";
    if (status === "ok") acc.ok++;
    else if (status === "issue") acc.issue++;
    else acc.todo++;
    return acc;
  }, { ok: 0, issue: 0, todo: 0 });
  reviewSummary.textContent = `Reviewed ${counts.ok + counts.issue}/${api.models.length}  OK ${counts.ok}  Issues ${counts.issue}  Todo ${counts.todo}`;
}

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

function assetDiagnosticsForModel(id) {
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

function summarizeList(items, limit = 5) {
  const values = [...items].filter(Boolean);
  if (values.length <= limit) return values.join(", ");
  return `${values.slice(0, limit).join(", ")} +${values.length - limit} more`;
}

function rendererDiagnosticsForModel(id, info) {
  const projection = info?.projection;
  const blueprint = modelBlueprint(id);
  const declaredFaceTextures = Array.isArray(blueprint?.imageProjection?.faceTextures)
    ? blueprint.imageProjection.faceTextures
    : [];
  const diagnostics = [];

  if (!info?.rendered) {
    diagnostics.push({ level: "error", text: "Renderer did not produce a mesh result." });
    return diagnostics;
  }
  if (!projection) {
    diagnostics.push({ level: "error", text: "Renderer projection packet missing; Render QA cannot check face/UV geometry." });
    return diagnostics;
  }

  const projectedPoints = (projection.points || []).filter(Boolean).length;
  if (Number.isFinite(info.points) && projectedPoints !== info.points) {
    diagnostics.push({ level: "warn", text: `Projected point count mismatch: renderer ${info.points}, packet ${projectedPoints}.` });
  }
  if ((projection.faces || []).length !== info.faces) {
    diagnostics.push({ level: "error", text: `Projected face count mismatch: renderer ${info.faces}, packet ${projection.faces?.length || 0}.` });
  }
  if (declaredFaceTextures.length && declaredFaceTextures.length !== (projection.faces || []).length) {
    diagnostics.push({ level: "warn", text: `Face texture metadata count ${declaredFaceTextures.length} differs from renderer face count ${(projection.faces || []).length}.` });
  }

  const visibleFaces = (projection.faces || []).filter((face) => face.visible).length;
  if (info.faces && visibleFaces <= 0) {
    diagnostics.push({ level: "error", text: "No visible faces at the current QA angle." });
  }

  const bitmapUvGaps = (projection.faces || []).filter((face) => face.bitmapKey && !face.hasImageProjection);
  if (bitmapUvGaps.length) {
    diagnostics.push({
      level: "error",
      text: `Face bitmap declared but no renderer UV: ${summarizeList(bitmapUvGaps.map((face) => `#${face.faceIndex}:${face.bitmapKey}`))}.`
    });
  }

  const incompleteFaces = (projection.faces || []).filter((face) => Array.isArray(face.verts) && face.points?.length !== face.verts.length);
  if (incompleteFaces.length) {
    diagnostics.push({
      level: "warn",
      text: `Projection packet has incomplete face polygons: ${summarizeList(incompleteFaces.map((face) => `#${face.faceIndex}`))}.`
    });
  }

  if ((projection.details || []).length !== info.details) {
    diagnostics.push({ level: "warn", text: `Projected detail count mismatch: renderer ${info.details}, packet ${projection.details?.length || 0}.` });
  }
  const incompleteDetails = (projection.details || []).filter((detail) => !detail.visible);
  if (incompleteDetails.length) {
    diagnostics.push({
      level: "warn",
      text: `Detail projection incomplete: ${summarizeList(incompleteDetails.map((detail) => `#${detail.detailIndex}:${detail.type}`))}.`
    });
  }

  diagnostics.push({
    level: "ok",
    text: `Renderer projection OK: ${visibleFaces}/${info.faces || 0} visible faces, ${projectedPoints} points, ${(projection.details || []).length}/${info.details || 0} details.`
  });
  return diagnostics;
}

function diagnosticsForModel(id, info = null) {
  return [
    ...assetDiagnosticsForModel(id),
    ...(info ? rendererDiagnosticsForModel(id, info) : [])
  ];
}

function renderDiagnostics(diagnostics) {
  diagnosticsList.innerHTML = diagnostics.map((item) =>
    `<div class="diagnostic ${item.level === "error" ? "error" : item.level === "warn" ? "warn" : item.level === "ok" ? "ok" : ""}">${escapeHtml(item.text)}</div>`
  ).join("");
}

function updateModelList(diagnosticsMap = new Map()) {
  const current = currentModelId();
  modelList.innerHTML = api.models.map((model) => {
    const diagnostics = diagnosticsMap.get(model.id) || latestDiagnosticsByModel.get(model.id) || assetDiagnosticsForModel(model.id);
    const issue = diagnostics.some((item) => item.level === "error" || item.level === "warn");
    const badge = reviewBadge(model.id, issue);
    return `<button class="model-btn ${model.id === current ? "current" : ""} ${badge.className}" data-model="${escapeHtml(model.id)}" type="button"><span>${escapeHtml(model.name)}</span><span>${badge.label}</span></button>`;
  }).join("");
  renderReviewSummary();
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
    grid: true,
    projection: true
  });
  const renderMs = performance.now() - before;
  const model = api.models.find((entry) => entry.id === currentModelId());
  const diagnostics = diagnosticsForModel(currentModelId(), info);
  const review = reviewForModel(currentModelId());
  latestDiagnosticsByModel.set(currentModelId(), diagnostics);
  renderDiagnostics(diagnostics);
  updateModelList(new Map([[currentModelId(), diagnostics]]));
  const index = modelIndex();
  const issueCount = diagnostics.filter((item) => item.level === "error" || item.level === "warn").length;
  const projection = info?.projection;
  const visibleFaces = projection?.faces?.filter((face) => face.visible).length ?? null;
  const projectedDetails = projection?.details?.length ?? null;
  modelCounter.textContent = `${index + 1} / ${api.models.length}`;
  statusText.textContent = `${model?.name || currentModelId()} | ${angle.label} | ${issueCount ? `${issueCount} warning${issueCount === 1 ? "" : "s"}` : "projection OK"} | ${renderMs.toFixed(2)} ms`;
  modelReadout.textContent = [
    `id: ${currentModelId()}`,
    `name: ${model?.name || "--"}`,
    `faces: ${info?.faces ?? model?.faces ?? "--"}`,
    `visible faces: ${visibleFaces ?? "--"}`,
    `edges: ${info?.edges ?? model?.edges ?? "--"}`,
    `details: ${info?.details ?? model?.details ?? "--"}`,
    `projected details: ${projectedDetails ?? "--"}`,
    `projected points: ${info?.points ?? "--"}`,
    `route: ${info?.route || "--"}`,
    `radius: ${info?.radius?.toFixed?.(1) || model?.radius || "--"}`,
    `review: ${review.status || "todo"}`,
    `mode: ${modeSelect.value}`,
    `quality: ${qualitySelect.value}`
  ].join("\n");
}

function selectModel(id) {
  saveCurrentNotes();
  modelSelect.value = id;
  notes.value = reviewForModel(id).notes || "";
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
  modelSelect.innerHTML = api.models.map((model) => `<option value="${escapeHtml(model.id)}">${escapeHtml(model.name)}</option>`).join("");
  angleSelect.innerHTML = angles.map((angle) => `<option value="${escapeHtml(angle.id)}">${escapeHtml(angle.label)}</option>`).join("");
  modelSelect.value = api.models[0]?.id || "";
  notes.value = reviewForModel(currentModelId()).notes || "";
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
notes.addEventListener("input", saveCurrentNotes);
markOkBtn.addEventListener("click", () => setCurrentReviewStatus("ok"));
markIssueBtn.addEventListener("click", () => setCurrentReviewStatus("issue"));
clearReviewBtn.addEventListener("click", () => setCurrentReviewStatus("todo"));
autoBtn.addEventListener("click", () => {
  auto = !auto;
  autoBtn.classList.toggle("active", auto);
  autoBtn.textContent = auto ? "Pause" : "Auto";
});
window.addEventListener("resize", render);

if (window.UltraEliteRenderBench) init();
else window.addEventListener("ultraelite:renderbench-ready", init, { once: true });
})();
