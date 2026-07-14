(() => {
"use strict";

const canvas = document.getElementById("gamePreviewCanvas");
const status = document.getElementById("previewStatus");
let api = null;
let latest = null;
let lastRender = 0;

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const w = Math.max(320, Math.round(rect.width));
  const h = Math.max(180, Math.round(rect.height));
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
}

function render(payload = latest) {
  if (!api || !payload?.blueprint) return;
  latest = payload;
  resizeCanvas();
  const view = payload.view || {};
  const meta = payload.gameMeta || {};
  const info = api.renderFrame(canvas, {
    model: payload.id || "builder_preview",
    blueprint: payload.blueprint,
    bitmapSkins: payload.bitmapSkins || null,
    mode: payload.mode || "solid",
    fxLevel: "ultra",
    quality: payload.quality || "full",
    lod: "0",
    targetScale: Number(payload.targetScale) || .56,
    yaw: Number(view.ry) || 0,
    pitch: Number(view.rx) || 0,
    roll: Number(view.roll) || 0,
    baseColor: meta.baseColor,
    decalRole: meta.decalRole,
    engineGlow: .75,
    grid: true,
    projection: true
  });
  lastRender = performance.now();
  const projectedFaces = info?.projection?.faces?.filter((face) => face.visible).length || 0;
  status.textContent = `${payload.id || "builder"} | ${projectedFaces}/${info?.faces || 0} visible faces | real renderer`;
  parent.postMessage({
    type: "ultra-elite-render-preview-result",
    payloadId: payload.id || "builder_preview",
    info
  }, "*");
}

function init() {
  api = window.UltraEliteRenderBench;
  if (!api) {
    status.textContent = "Renderer hook missing";
    return;
  }
  status.textContent = "Game renderer ready";
  parent.postMessage({ type: "ultra-elite-render-preview-ready" }, "*");
  render();
}

window.addEventListener("message", (event) => {
  const data = event.data || {};
  if (data.type !== "ultra-elite-render-preview") return;
  render(data.payload);
});

window.addEventListener("resize", () => render());
setInterval(() => {
  if (latest && performance.now() - lastRender > 900) render();
}, 1000);

if (window.UltraEliteRenderBench) init();
else window.addEventListener("ultraelite:renderbench-ready", init, { once: true });
})();
