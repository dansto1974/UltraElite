(() => {
"use strict";

const canvas = document.getElementById("gamePreviewCanvas");
const status = document.getElementById("previewStatus");
let api = null;
let latest = null;
let lastRender = 0;
let pending = null;
let renderQueued = false;
let spinFrame = 0;
let spinLast = 0;
let drag = null;
const spinOnLoad = new URLSearchParams(window.location.search).get("spin") === "1";
const spinPreviewStorageKey = "ultraEliteSpinPreviewPayload";
const spinPreviewChannel = "ultra-elite-builder-spin-preview";

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function postToHost(message) {
  if (window.parent && window.parent !== window) window.parent.postMessage(message, "*");
  if (window.opener && !window.opener.closed) window.opener.postMessage(message, "*");
}

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
  if (payload) {
    latest = {
      ...(latest || {}),
      ...payload,
      ...(Object.prototype.hasOwnProperty.call(payload, "bitmapSkins") ? { bitmapSkins: payload.bitmapSkins || null } : {})
    };
  }
  if (!api) return;
  if (!latest?.blueprint) return;
  resizeCanvas();
  const view = latest.view || {};
  const meta = latest.gameMeta || {};
  const t0 = performance.now();
  const info = api.renderFrame(canvas, {
    model: latest.id || "builder_preview",
    blueprint: latest.blueprint,
    blueprintKey: latest.blueprintKey,
    bitmapSkins: latest.bitmapSkins || null,
    mode: latest.mode || "solid",
    fxLevel: latest.fxLevel || "ultra",
    quality: latest.quality || "live",
    lightMode: latest.lightMode || null,
    orthographic: !!latest.orthographic,
    projectionProof: !!latest.projectionProof,
    lod: "0",
    targetScale: Number(latest.targetScale) || .56,
    yaw: Number(view.ry) || 0,
    pitch: Number(view.rx) || 0,
    roll: Number(view.roll) || 0,
    baseColor: meta.baseColor,
    decalRole: meta.decalRole,
    engineGlow: .75,
    grid: true,
    projection: latest.projection !== false
  });
  lastRender = performance.now();
  const renderMs = lastRender - t0;
  const projectedFaces = info?.projection?.faces?.filter((face) => face.visible).length || 0;
  const projectionText = info?.projection ? `${projectedFaces}/${info?.faces || 0} visible faces` : `${info?.faces || 0} faces`;
  status.textContent = `${latest.id || "builder"} | ${projectionText} | ${renderMs.toFixed(1)}ms`;
  postToHost({
    type: "ultra-elite-render-preview-result",
    payloadId: latest.id || "builder_preview",
    blueprintKey: latest.blueprintKey || "",
    bitmapSkinVersion: latest.bitmapSkinVersion || 0,
    benchmarkRequestId: latest.benchmarkRequestId || "",
    info,
    renderMs,
    accepted: {
      blueprint: !!payload?.blueprint,
      bitmapSkins: Object.prototype.hasOwnProperty.call(payload || {}, "bitmapSkins")
    }
  });
}

function requestRender(payload = latest) {
  if (payload) pending = payload;
  if (renderQueued) return;
  renderQueued = true;
  requestAnimationFrame(() => {
    renderQueued = false;
    const next = pending || latest;
    pending = null;
    render(next);
  });
}

function stopSpin() {
  if (spinFrame) cancelAnimationFrame(spinFrame);
  spinFrame = 0;
  spinLast = 0;
}

function setInteractiveView(nextView) {
  if (!latest?.blueprint) return;
  latest = {
    ...latest,
    view: {
      ...(latest.view || {}),
      ...nextView
    },
    projection: false
  };
  requestRender(latest);
}

function spinTick(now) {
  if (!latest?.autoRotate || !latest?.blueprint) {
    stopSpin();
    return;
  }
  if (!spinLast) spinLast = now;
  const dt = Math.min(80, now - spinLast);
  spinLast = now;
  const view = latest.view || {};
  latest = {
    ...latest,
    view: {
      rx: Number.isFinite(Number(view.rx)) ? Number(view.rx) : -0.35,
      ry: (Number(view.ry) || 0) + dt * 0.0008,
      roll: Number(view.roll) || 0
    },
    projection: false
  };
  render(latest);
  spinFrame = requestAnimationFrame(spinTick);
}

function syncSpinState() {
  if (!latest?.autoRotate) {
    stopSpin();
    return;
  }
  if (!spinFrame) spinFrame = requestAnimationFrame(spinTick);
}

function acceptPreviewPayload(payload) {
  if (payload && Object.prototype.hasOwnProperty.call(payload, "autoRotate") && !payload.autoRotate) stopSpin();
  requestRender(payload);
  if (payload && Object.prototype.hasOwnProperty.call(payload, "bitmapSkins") && payload.bitmapSkins) {
    setTimeout(() => requestRender(latest), 90);
    setTimeout(() => requestRender(latest), 260);
  }
  requestAnimationFrame(syncSpinState);
}

function bindInteractivePreview() {
  canvas.addEventListener("pointerdown", (event) => {
    if (!latest?.blueprint) return;
    event.preventDefault();
    stopSpin();
    latest = { ...latest, autoRotate: false };
    drag = {
      x: event.clientX,
      y: event.clientY,
      rx: Number(latest.view?.rx) || -0.35,
      ry: Number(latest.view?.ry) || 0
    };
    canvas.setPointerCapture?.(event.pointerId);
  });
  canvas.addEventListener("pointermove", (event) => {
    if (!drag) return;
    event.preventDefault();
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    setInteractiveView({
      rx: clamp(drag.rx + dy * 0.006, -1.45, 1.45),
      ry: drag.ry + dx * 0.006,
      roll: Number(latest.view?.roll) || 0
    });
  });
  const endDrag = (event) => {
    if (!drag) return;
    if (event?.pointerId != null && canvas.hasPointerCapture?.(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    drag = null;
  };
  canvas.addEventListener("pointerup", endDrag);
  canvas.addEventListener("pointercancel", endDrag);
  canvas.addEventListener("pointerleave", endDrag);
  canvas.addEventListener("wheel", (event) => {
    if (!latest?.blueprint) return;
    event.preventDefault();
    const current = Number(latest.targetScale) || .62;
    latest = {
      ...latest,
      targetScale: clamp(current * (event.deltaY > 0 ? .92 : 1.08), .28, 1.45),
      projection: false
    };
    requestRender(latest);
  }, { passive: false });
}

function loadStoredSpinPayload() {
  if (!spinOnLoad) return;
  try {
    const raw = localStorage.getItem(spinPreviewStorageKey);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    const payload = parsed?.payload || parsed;
    if (payload?.blueprint) acceptPreviewPayload(payload);
  } catch (error) {
    status.textContent = `Stored preview load failed: ${error.message}`;
  }
}

function listenForSpinBroadcasts() {
  if (!spinOnLoad || !("BroadcastChannel" in window)) return;
  const channel = new BroadcastChannel(spinPreviewChannel);
  channel.onmessage = (event) => {
    const data = event.data || {};
    if (data.type === "ultra-elite-render-preview") acceptPreviewPayload(data.payload);
  };
}

function init() {
  api = window.UltraEliteRenderBench;
  if (!api) {
    status.textContent = "Renderer hook missing";
    return;
  }
  status.textContent = spinOnLoad ? "Game renderer ready. Waiting for builder snapshot..." : "Game renderer ready";
  postToHost({ type: "ultra-elite-render-preview-ready" });
  requestRender();
  loadStoredSpinPayload();
  listenForSpinBroadcasts();
  syncSpinState();
}

window.addEventListener("message", (event) => {
  const data = event.data || {};
  if (data.type !== "ultra-elite-render-preview") return;
  acceptPreviewPayload(data.payload);
});

window.addEventListener("resize", () => requestRender());

if (window.UltraEliteRenderBench) init();
else window.addEventListener("ultraelite:renderbench-ready", init, { once: true });
bindInteractivePreview();
})();
