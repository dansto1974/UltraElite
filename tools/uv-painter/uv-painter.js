(() => {
"use strict";

const TAU = Math.PI * 2;
const VIEWS = {
  top: { rx: -Math.PI / 2, ry: 0, label: "Top" },
  bottom: { rx: Math.PI / 2, ry: Math.PI, label: "Bottom" },
  left: { rx: 0, ry: -Math.PI / 2, label: "Left" },
  right: { rx: 0, ry: Math.PI / 2, label: "Right" },
  front: { rx: 0, ry: Math.PI, label: "Front" },
  back: { rx: 0, ry: 0, label: "Back" }
};

const els = {
  modelSelect: document.getElementById("modelSelect"),
  modelReadout: document.getElementById("modelReadout"),
  selectGroupBtn: document.getElementById("selectGroupBtn"),
  clearGroupBtn: document.getElementById("clearGroupBtn"),
  groupReadout: document.getElementById("groupReadout"),
  assetSelect: document.getElementById("assetSelect"),
  importBitmap: document.getElementById("importBitmap"),
  assetReadout: document.getElementById("assetReadout"),
  projectBtn: document.getElementById("projectBtn"),
  clearSelectedUvBtn: document.getElementById("clearSelectedUvBtn"),
  saveBtn: document.getElementById("saveBtn"),
  rebuildBtn: document.getElementById("rebuildBtn"),
  showBlankUv: document.getElementById("showBlankUv"),
  status: document.getElementById("status"),
  previewFrame: document.getElementById("previewFrame"),
  overlay: document.getElementById("overlay"),
  viewReadout: document.getElementById("viewReadout")
};

const state = {
  models: [],
  assets: [],
  assetImages: new Map(),
  model: null,
  selectedFaces: new Set(),
  selectingGroup: true,
  view: { rx: VIEWS.top.rx, ry: VIEWS.top.ry, roll: 0 },
  viewName: "top",
  projection: null,
  previewSkinVersion: Date.now(),
  dirty: false,
  appliedSkinKeys: new Set(),
  targetKeyByAssetId: new Map(),
  importedAssets: []
};

function setStatus(text) {
  els.status.textContent = text;
}

function cleanKey(value, fallback = "") {
  const key = String(value || "").trim().replace(/[^a-zA-Z0-9_-]+/g, "_").replace(/^_+|_+$/g, "");
  return key || fallback;
}

function round(value, places = 3) {
  const m = 10 ** places;
  return Math.round((Number(value) || 0) * m) / m;
}

async function apiJson(path, options = {}) {
  const res = await fetch(path, {
    cache: "no-store",
    headers: { "content-type": "application/json", ...(options.headers || {}) },
    ...options
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.ok === false) throw new Error(data.error || `${res.status} ${res.statusText}`);
  return data;
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Could not load image: ${url}`));
    img.src = url;
  });
}

function imageDataUrl(img) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, img.naturalWidth || img.width || 1);
  canvas.height = Math.max(1, img.naturalHeight || img.height || 1);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);
  return canvas.toDataURL("image/png");
}

function modelId() {
  return cleanKey(state.model?.id, "model");
}

function vertexById(id) {
  return state.model?.vertsById?.get(Number(id)) || null;
}

function vec(x = 0, y = 0, z = 0) {
  return { x, y, z };
}

function sub(a, b) {
  return vec(a.x - b.x, a.y - b.y, a.z - b.z);
}

function cross(a, b) {
  return vec(a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x);
}

function norm(a) {
  const l = Math.hypot(a.x, a.y, a.z) || 1;
  return vec(a.x / l, a.y / l, a.z / l);
}

function faceNormal(face) {
  const pts = face.verts.map(vertexById).filter(Boolean);
  if (pts.length < 3) return vec(0, 0, 1);
  return norm(cross(sub(pts[1], pts[0]), sub(pts[2], pts[0])));
}

function rotatePoint(v) {
  const { rx, ry } = state.view;
  const cy = Math.cos(ry), sy = Math.sin(ry);
  const cx = Math.cos(rx), sx = Math.sin(rx);
  const x1 = v.x * cy - v.z * sy;
  const z1 = v.x * sy + v.z * cy;
  const y1 = v.y * cx - z1 * sx;
  const z2 = v.y * sx + z1 * cx;
  return vec(x1, y1, z2);
}

function cleanFaceUv(uv) {
  return Array.isArray(uv)
    ? uv.map((p) => Array.isArray(p) ? [round(p[0]), round(p[1])] : null).filter(Boolean)
    : null;
}

function deriveBlueprint(model = state.model) {
  const indexById = new Map(model.verts.map((v, i) => [v.id, i]));
  const verts = model.verts.map((v) => [round(v.x), round(v.y), round(v.z)]);
  const faces = model.faces.map((face) => face.verts.map((id) => indexById.get(id)).filter((i) => i !== undefined));
  const normals = model.faces.map((face) => {
    const n = faceNormal(face);
    return [round(n.x * 100), round(n.y * 100), round(n.z * 100)];
  });
  const edgeMap = new Map();
  const addEdge = (a, b, faceIndex = -1, kind = "edge") => {
    if (a === b || a == null || b == null) return;
    const key = a < b ? `${a},${b}` : `${b},${a}`;
    if (!edgeMap.has(key)) edgeMap.set(key, { edge: a < b ? [a, b] : [b, a], faces: [], kind });
    const entry = edgeMap.get(key);
    if (faceIndex >= 0) entry.faces.push(faceIndex);
    if (kind === "stick") entry.kind = "stick";
  };
  faces.forEach((ids, faceIndex) => {
    for (let i = 0; i < ids.length; i++) addEdge(ids[i], ids[(i + 1) % ids.length], faceIndex);
  });
  for (const edge of model.edges || []) {
    addEdge(indexById.get(edge.a), indexById.get(edge.b), -1, edge.kind);
  }
  const edgeEntries = [...edgeMap.values()];
  const imageProjection = {
    faceSides: model.faces.map((face) => ["top", "bottom", "back"].includes(face.bitmapSide) ? face.bitmapSide : null),
    faceTextures: model.faces.map((face) => cleanKey(face.bitmapFaceKey) || null),
    faceTextureUv: model.faces.map((face) => {
      const uv = cleanFaceUv(face.bitmapUv);
      return uv && uv.length >= 3 ? uv : null;
    }),
    faceTextureBaseW: model.faces.map((face) => Number.isFinite(Number(face.bitmapBaseW)) && Number(face.bitmapBaseW) > 0 ? Math.round(Number(face.bitmapBaseW)) : null),
    faceTextureBaseH: model.faces.map((face) => Number.isFinite(Number(face.bitmapBaseH)) && Number(face.bitmapBaseH) > 0 ? Math.round(Number(face.bitmapBaseH)) : null),
    faceColors: model.faces.map((face) => /^#[0-9a-f]{6}$/i.test(face.faceColor || "") ? face.faceColor : null),
    faceMirrorX: model.faces.map((face) => !!face.bitmapMirrorX)
  };
  return {
    verts,
    faces,
    edges: edgeEntries.map((entry) => entry.edge),
    edgeFaces: edgeEntries.map((entry) => {
      const unique = [...new Set(entry.faces)];
      if (!unique.length) return [-1, -1];
      if (unique.length === 1) return [unique[0], unique[0]];
      return [unique[0], unique[1]];
    }),
    edgeVisibility: edgeEntries.map(() => 31),
    normals,
    details: Array.isArray(model.blueprint?.details) ? model.blueprint.details : [],
    imageProjection,
    gameMeta: model.gameMeta || {}
  };
}

function renderPayload(force = false) {
  const blueprint = deriveBlueprint();
  const payload = {
    id: modelId(),
    blueprint,
    blueprintKey: JSON.stringify(blueprint),
    bitmapSkinVersion: state.previewSkinVersion,
    bitmapSkins: bitmapSkinBundle(),
    gameMeta: state.model?.gameMeta || {},
    view: { ...state.view },
    mode: "gameOverlay",
    fxLevel: "ultra",
    quality: "live",
    lightMode: "camera",
    projection: true,
    targetScale: .56
  };
  if (!force) return payload;
  return { ...payload, force: true };
}

function postPreview(force = false) {
  if (!state.model || !els.previewFrame.contentWindow) return;
  els.previewFrame.contentWindow.postMessage({
    type: "ultra-elite-render-preview",
    payload: renderPayload(force)
  }, "*");
}

function bitmapSkinBundle() {
  const bundle = {
    version: state.previewSkinVersion,
    mirrorX: state.model?.gameMeta?.imageDecalMirrorX || { top: false, bottom: false, back: false },
    builderOverride: true,
    replaceBaseTexture: true,
    alpha: .96
  };
  const faces = {};
  for (const [key, img] of state.assetImages.entries()) {
    if (img?.naturalWidth) faces[key] = imageDataUrl(img);
  }
  if (Object.keys(faces).length) bundle.faces = faces;
  return bundle;
}

function sourceModel(data) {
  const model = structuredClone(data);
  model.verts = (model.verts || []).map((v, index) => ({
    id: Number(v.id ?? index + 1),
    x: Number(v.x) || 0,
    y: Number(v.y) || 0,
    z: Number(v.z) || 0,
    mirrorId: v.mirrorId ?? null,
    center: !!v.center
  }));
  model.faces = (model.faces || []).map((face, index) => ({
    id: Number(face.id ?? index + 1000),
    verts: Array.isArray(face.verts) ? face.verts.map(Number).filter(Number.isFinite) : [],
    mirrored: !!face.mirrored,
    ...(face.faceColor ? { faceColor: face.faceColor } : {}),
    ...(face.bitmapSide ? { bitmapSide: face.bitmapSide } : {}),
    ...(face.bitmapFaceKey ? { bitmapFaceKey: cleanKey(face.bitmapFaceKey) } : {}),
    ...(cleanFaceUv(face.bitmapUv)?.length >= 3 ? { bitmapUv: cleanFaceUv(face.bitmapUv) } : {}),
    ...(Number(face.bitmapBaseW) > 0 ? { bitmapBaseW: Math.round(Number(face.bitmapBaseW)) } : {}),
    ...(Number(face.bitmapBaseH) > 0 ? { bitmapBaseH: Math.round(Number(face.bitmapBaseH)) } : {}),
    ...(face.bitmapMirrorX ? { bitmapMirrorX: true } : {}),
    ...(Array.isArray(face.bitmapDecals) ? { bitmapDecals: structuredClone(face.bitmapDecals) } : {})
  }));
  model.vertsById = new Map(model.verts.map((v) => [v.id, v]));
  return model;
}

async function loadModels() {
  const data = await apiJson("/api/models");
  state.models = data.models || [];
  els.modelSelect.replaceChildren();
  for (const model of state.models) {
    const option = document.createElement("option");
    option.value = model.id;
    option.textContent = model.name || model.id;
    els.modelSelect.append(option);
  }
  const preferred = state.models.find((model) => model.id === "naga") || state.models[0];
  if (preferred) {
    els.modelSelect.value = preferred.id;
    await loadModel(preferred.id);
  }
}

async function loadModel(id) {
  const result = await apiJson(`/api/models/${encodeURIComponent(id)}`);
  state.model = sourceModel(result.data);
  state.selectedFaces.clear();
  state.dirty = false;
  state.appliedSkinKeys.clear();
  state.targetKeyByAssetId.clear();
  updateAssetSelect();
  selectPreferredAssetForModel();
  updateReadouts();
  updateAssetReadout();
  await preloadModelFaceImages();
  postPreview(true);
}

async function loadAssets() {
  const data = await apiJson("/api/skins");
  state.assets = (data.skins || []).filter((asset) => asset.kind !== "decal");
  updateAssetSelect();
}

function assetSortRank(asset) {
  const current = modelId();
  if (asset.kind === "side" && asset.model === current) return 0;
  if (asset.kind === "side") return 1;
  if (asset.kind === "face" && asset.model === current) return 2;
  if (asset.kind === "face") return 3;
  return 4;
}

function assetLabel(asset) {
  if (asset.label) return asset.label;
  if (asset.kind === "side") return `${asset.model || "shared"} / ${String(asset.side || "").toUpperCase()} SKIN`;
  if (asset.kind === "face") return `${asset.model || "shared"} / FACE UV / ${asset.key || asset.file}`;
  return `${asset.model || "shared"} / ${asset.key || asset.file}`;
}

function orderedAssets() {
  return [...state.assets].sort((a, b) => (
    assetSortRank(a) - assetSortRank(b)
    || assetLabel(a).localeCompare(assetLabel(b))
    || String(a.file || "").localeCompare(String(b.file || ""))
  ));
}

function updateAssetSelect() {
  const current = els.assetSelect.value;
  els.assetSelect.replaceChildren();
  for (const asset of [...state.importedAssets, ...orderedAssets()]) {
    const option = document.createElement("option");
    option.value = asset.id || asset.file;
    option.textContent = assetLabel(asset);
    els.assetSelect.append(option);
  }
  if (current && [...els.assetSelect.options].some((option) => option.value === current)) {
    els.assetSelect.value = current;
  }
  updateAssetReadout();
}

function selectPreferredAssetForModel() {
  const current = modelId();
  const preferred = state.assets.find((asset) => asset.kind === "side" && asset.model === current && asset.side === "top")
    || state.assets.find((asset) => asset.kind === "side" && asset.model === current)
    || state.assets.find((asset) => asset.kind === "side");
  if (preferred) els.assetSelect.value = preferred.id || preferred.file;
}

function selectedAsset() {
  const value = els.assetSelect.value;
  return [...state.importedAssets, ...state.assets].find((asset) => (asset.id || asset.file) === value) || null;
}

function assetId(asset) {
  return asset ? String(asset.id || asset.file || asset.localKey || asset.key || "") : "";
}

async function selectedAssetImage() {
  const asset = selectedAsset();
  if (!asset) return null;
  const key = assetFaceKey(asset);
  if (state.assetImages.has(key)) return state.assetImages.get(key);
  const img = asset.img || await loadImage(asset.url);
  state.assetImages.set(key, img);
  return img;
}

function assetFaceKey(asset = selectedAsset()) {
  if (!asset) return "";
  if (asset.localKey) return cleanKey(asset.localKey);
  if (asset.kind === "face" && asset.model === modelId()) return cleanKey(asset.key);
  if (asset.kind === "face") return cleanKey(`${asset.model}_${asset.key}`, "face_asset");
  if (asset.kind === "side") return cleanKey(`${asset.model}_${asset.side}`, "side_asset");
  return cleanKey(asset.key || asset.file || "face_asset", "face_asset");
}

function currentModelFaceAssetKeys() {
  return new Set(state.assets
    .filter((asset) => asset.kind === "face" && asset.model === modelId())
    .map((asset) => cleanKey(asset.key))
    .filter(Boolean));
}

function currentModelUsedFaceKeys() {
  return new Set((state.model?.faces || [])
    .map((face) => cleanKey(face.bitmapFaceKey))
    .filter(Boolean));
}

function hasCurrentModelFaceAsset(key) {
  return currentModelFaceAssetKeys().has(cleanKey(key));
}

function uniqueNewFaceKey(base) {
  const cleanBase = cleanKey(base, "painted_uv");
  const used = new Set([
    ...currentModelFaceAssetKeys(),
    ...currentModelUsedFaceKeys(),
    ...state.targetKeyByAssetId.values()
  ].map((key) => cleanKey(key)).filter(Boolean));
  if (!used.has(cleanBase)) return cleanBase;
  let index = 2;
  while (used.has(`${cleanBase}_${index}`)) index++;
  return `${cleanBase}_${index}`;
}

function targetFaceKeyForAsset(asset, options = {}) {
  if (!asset) return "";
  if (asset.kind === "face" && asset.model === modelId() && cleanKey(asset.key)) {
    return cleanKey(asset.key);
  }
  const id = assetId(asset);
  if (id && state.targetKeyByAssetId.has(id)) return state.targetKeyByAssetId.get(id);
  const key = uniqueNewFaceKey(assetFaceKey(asset));
  if (options.reserve !== false && id) state.targetKeyByAssetId.set(id, key);
  return key;
}

function updateAssetReadout() {
  const asset = selectedAsset();
  els.assetReadout.textContent = asset
    ? `${asset.label || asset.file || asset.key} -> ${targetFaceKeyForAsset(asset, { reserve: false })}`
    : "No asset selected";
}

async function preloadModelFaceImages() {
  const keys = [...new Set((state.model?.faces || []).map((face) => cleanKey(face.bitmapFaceKey)).filter(Boolean))];
  const model = modelId();
  for (const key of keys) {
    if (state.assetImages.has(key)) continue;
    const asset = state.assets.find((item) => item.kind === "face" && item.model === model && cleanKey(item.key) === key);
    if (!asset) continue;
    try {
      state.assetImages.set(key, await loadImage(asset.url));
    } catch {
      // Missing art is shown by Blank UV / renderer readout; keep the painter usable.
    }
  }
  state.previewSkinVersion = Date.now();
}

function resizeOverlay() {
  const rect = els.overlay.getBoundingClientRect();
  const w = Math.max(320, Math.round(rect.width));
  const h = Math.max(180, Math.round(rect.height));
  if (els.overlay.width !== w || els.overlay.height !== h) {
    els.overlay.width = w;
    els.overlay.height = h;
  }
}

function projectionPoint(point) {
  if (!point) return null;
  return {
    x: (Number(point.nx) || 0) * els.overlay.width,
    y: (Number(point.ny) || 0) * els.overlay.height
  };
}

function faceById(id) {
  return state.model?.faces.find((face) => face.id === Number(id)) || null;
}

function faceIndex(face) {
  return state.model?.faces.indexOf(face) ?? -1;
}

function overlayFacePoints(face) {
  const index = faceIndex(face);
  const packet = state.projection?.faces?.[index];
  if (!packet?.points?.length) return [];
  return packet.points.map(projectionPoint).filter(Boolean);
}

function drawPoly(ctx, pts, fill, stroke, width = 1) {
  if (pts.length < 3) return;
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = width;
  ctx.stroke();
}

function drawOverlay() {
  resizeOverlay();
  const ctx = els.overlay.getContext("2d");
  ctx.clearRect(0, 0, els.overlay.width, els.overlay.height);
  if (!state.model || !state.projection?.faces) return;
  ctx.font = "10px Andale Mono, Menlo, Consolas, monospace";
  for (const face of state.model.faces) {
    const index = faceIndex(face);
    const packet = state.projection.faces[index];
    if (!packet?.visible) continue;
    const pts = overlayFacePoints(face);
    const selected = state.selectedFaces.has(face.id);
    const blank = els.showBlankUv.checked && !cleanKey(face.bitmapFaceKey);
    if (blank) drawPoly(ctx, pts, "rgba(255,217,54,.15)", "rgba(255,217,54,.9)", 1.6);
    if (selected) drawPoly(ctx, pts, "rgba(102,232,255,.17)", "#66e8ff", 2.2);
  }
}

function pointInPoly(point, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i], b = poly[j];
    if (((a.y > point.y) !== (b.y > point.y)) && point.x < (b.x - a.x) * (point.y - a.y) / ((b.y - a.y) || 0.0001) + a.x) inside = !inside;
  }
  return inside;
}

function canvasPoint(event) {
  const rect = els.overlay.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) * els.overlay.width / rect.width,
    y: (event.clientY - rect.top) * els.overlay.height / rect.height
  };
}

function faceAt(point) {
  const candidates = (state.model?.faces || []).filter((face) => {
    const index = faceIndex(face);
    if (!state.projection?.faces?.[index]?.visible) return false;
    return pointInPoly(point, overlayFacePoints(face));
  });
  candidates.sort((a, b) => {
    const pa = state.projection?.faces?.[faceIndex(a)];
    const pb = state.projection?.faces?.[faceIndex(b)];
    return (Number(pa?.avgZ) || 0) - (Number(pb?.avgZ) || 0);
  });
  return candidates[0] || null;
}

function toggleFace(face) {
  if (!face) return;
  if (state.selectedFaces.has(face.id)) state.selectedFaces.delete(face.id);
  else state.selectedFaces.add(face.id);
  updateReadouts();
  drawOverlay();
}

function updateReadouts() {
  els.modelReadout.textContent = state.model
    ? `${state.model.name || state.model.id} | ${state.model.faces.length} faces | ${state.dirty ? "unsaved UV changes" : "saved"}`
    : "No model loaded";
  const ids = [...state.selectedFaces].sort((a, b) => a - b);
  els.groupReadout.textContent = `${ids.length} face${ids.length === 1 ? "" : "s"} selected${ids.length ? ` | ${ids.map((id) => `#${id}`).join(" ")}` : ""}`;
  els.selectGroupBtn.classList.toggle("active", state.selectingGroup);
  els.viewReadout.textContent = state.viewName === "camera" ? "Current camera projection" : `${VIEWS[state.viewName]?.label || "Current"} projection`;
}

function setView(name) {
  if (name !== "camera" && VIEWS[name]) {
    state.view = { rx: VIEWS[name].rx, ry: VIEWS[name].ry, roll: 0 };
  }
  state.viewName = name;
  document.querySelectorAll("[data-view]").forEach((button) => button.classList.toggle("active", button.dataset.view === name));
  updateReadouts();
  postPreview(true);
}

function orthographicSelectedUvForFaces(faces, width, height) {
  const points = [];
  for (const face of faces) {
    for (const id of face.verts) {
      const vertex = vertexById(id);
      if (vertex) points.push(rotatePoint(vertex));
    }
  }
  if (points.length < 3) return null;
  const minX = Math.min(...points.map((point) => point.x));
  const maxX = Math.max(...points.map((point) => point.x));
  const minY = Math.min(...points.map((point) => point.y));
  const maxY = Math.max(...points.map((point) => point.y));
  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;
  return new Map(faces.map((face) => [
    face.id,
    face.verts.map((id) => {
      const point = rotatePoint(vertexById(id) || vec());
      return [
        round(((point.x - minX) / rangeX) * width),
        round(((maxY - point.y) / rangeY) * height)
      ];
    })
  ]));
}

function rendererProjectionUvForFaces(faces, width, height) {
  if (!state.projection?.faces) return null;
  const packets = faces.map((face) => {
    const packet = state.projection.faces[faceIndex(face)];
    return packet?.visible && packet.points?.length === face.verts.length ? packet : null;
  });
  if (packets.some((packet) => !packet)) return null;
  const points = packets.flatMap((packet) => packet.points);
  if (points.length < 3) return null;
  const minX = Math.min(...points.map((point) => point.x));
  const maxX = Math.max(...points.map((point) => point.x));
  const minY = Math.min(...points.map((point) => point.y));
  const maxY = Math.max(...points.map((point) => point.y));
  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;
  return new Map(faces.map((face, index) => [
    face.id,
    packets[index].points.map((point) => [
      round(((point.x - minX) / rangeX) * width),
      round(((point.y - minY) / rangeY) * height)
    ])
  ]));
}

function projectionSideForCurrentView() {
  return ["top", "bottom", "back"].includes(state.viewName) ? state.viewName : "";
}

async function projectSelectedFaces() {
  if (!state.model) return;
  const faces = [...state.selectedFaces].map(faceById).filter(Boolean);
  if (!faces.length) return setStatus("Select face group first.");
  const asset = selectedAsset();
  const img = await selectedAssetImage();
  if (!asset || !img) return setStatus("Select or import a UV asset first.");
  const key = targetFaceKeyForAsset(asset);
  const width = Math.max(1, img.naturalWidth || img.width || 1);
  const height = Math.max(1, img.naturalHeight || img.height || 1);
  const projectionSide = projectionSideForCurrentView();
  const uvByFaceId = projectionSide ? null : state.viewName === "camera"
    ? rendererProjectionUvForFaces(faces, width, height)
    : orthographicSelectedUvForFaces(faces, width, height);
  if (!projectionSide && !uvByFaceId) return setStatus("Projection is not ready for every selected face. Wait a beat or reselect visible faces.");
  for (const face of faces) {
    delete face.bitmapAngle;
    delete face.bitmapMirrorX;
    face.bitmapFaceKey = key;
    if (projectionSide) {
      face.bitmapSide = projectionSide;
      delete face.bitmapBaseW;
      delete face.bitmapBaseH;
      delete face.bitmapUv;
    } else {
      delete face.bitmapSide;
      face.bitmapBaseW = width;
      face.bitmapBaseH = height;
      face.bitmapUv = uvByFaceId.get(face.id);
    }
  }
  state.assetImages.set(key, img);
  if (!hasCurrentModelFaceAsset(key)) state.appliedSkinKeys.add(key);
  state.previewSkinVersion = Date.now();
  state.dirty = true;
  updateReadouts();
  setStatus(`Projected ${key} onto ${faces.length} selected face${faces.length === 1 ? "" : "s"} from ${state.viewName} view.`);
  postPreview(true);
}

function clearSelectedUv() {
  const faces = [...state.selectedFaces].map(faceById).filter(Boolean);
  for (const face of faces) {
    delete face.bitmapSide;
    delete face.bitmapFaceKey;
    delete face.bitmapUv;
    delete face.bitmapBaseW;
    delete face.bitmapBaseH;
    delete face.bitmapAngle;
    delete face.bitmapMirrorX;
  }
  state.dirty = true;
  state.previewSkinVersion = Date.now();
  updateReadouts();
  setStatus(`Cleared UV from ${faces.length} selected face${faces.length === 1 ? "" : "s"}.`);
  postPreview(true);
}

function exportModel() {
  const data = structuredClone(state.model);
  delete data.vertsById;
  data.blueprint = deriveBlueprint(state.model);
  return data;
}

async function saveChanges() {
  if (!state.model) return;
  setStatus("Saving UV changes...");
  const usedAppliedKeys = new Set([...currentModelUsedFaceKeys()].filter((key) => state.appliedSkinKeys.has(key)));
  for (const key of usedAppliedKeys) {
    const img = state.assetImages.get(key);
    if (!img?.naturalWidth) continue;
    await apiJson("/api/skins", {
      method: "POST",
      body: JSON.stringify({
        model: modelId(),
        kind: "face",
        key,
        dataUrl: imageDataUrl(img)
      })
    });
  }
  await apiJson(`/api/models/${encodeURIComponent(modelId())}`, {
    method: "POST",
    body: JSON.stringify(exportModel())
  });
  await apiJson("/api/rebuild", {
    method: "POST",
    body: JSON.stringify({ scope: "all" })
  });
  state.dirty = false;
  state.appliedSkinKeys.clear();
  await loadAssets();
  updateReadouts();
  setStatus("UV changes saved and game rebuilt.");
}

async function importBitmap(file) {
  if (!file) return;
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const key = cleanKey(file.name.replace(/\.[^.]+$/, ""), "imported_uv");
    const id = `imported:${Date.now()}:${key}`;
    const asset = {
      id,
      label: `${file.name} | imported`,
      kind: "imported",
      localKey: key,
      img,
      url
    };
    state.importedAssets.unshift(asset);
    state.assetImages.set(key, img);
    updateAssetSelect();
    els.assetSelect.value = id;
    updateAssetReadout();
    setStatus(`${file.name} imported.`);
  } catch (error) {
    URL.revokeObjectURL(url);
    setStatus(error.message);
  }
}

function bindEvents() {
  els.modelSelect.addEventListener("change", () => loadModel(els.modelSelect.value).catch((error) => setStatus(error.message)));
  els.assetSelect.addEventListener("change", () => {
    updateAssetReadout();
    selectedAssetImage().then(() => {
      state.previewSkinVersion = Date.now();
      postPreview(true);
    }).catch((error) => setStatus(error.message));
  });
  els.importBitmap.addEventListener("change", (event) => {
    importBitmap(event.target.files?.[0]);
    event.target.value = "";
  });
  els.selectGroupBtn.addEventListener("click", () => {
    state.selectingGroup = !state.selectingGroup;
    updateReadouts();
  });
  els.clearGroupBtn.addEventListener("click", () => {
    state.selectedFaces.clear();
    updateReadouts();
    drawOverlay();
  });
  document.querySelectorAll("[data-view]").forEach((button) => button.addEventListener("click", () => setView(button.dataset.view)));
  els.overlay.addEventListener("click", (event) => {
    if (!state.selectingGroup) return;
    toggleFace(faceAt(canvasPoint(event)));
  });
  els.showBlankUv.addEventListener("input", drawOverlay);
  els.projectBtn.addEventListener("click", () => projectSelectedFaces().catch((error) => setStatus(error.message)));
  els.clearSelectedUvBtn.addEventListener("click", clearSelectedUv);
  els.saveBtn.addEventListener("click", () => saveChanges().catch((error) => setStatus(error.message)));
  els.rebuildBtn.addEventListener("click", () => apiJson("/api/rebuild", {
    method: "POST",
    body: JSON.stringify({ scope: "all" })
  }).then(() => setStatus("Game rebuilt.")).catch((error) => setStatus(error.message)));
  window.addEventListener("resize", drawOverlay);
  window.addEventListener("message", (event) => {
    if (event.source !== els.previewFrame.contentWindow) return;
    if (event.data?.type === "ultra-elite-render-preview-ready") {
      postPreview(true);
      return;
    }
    if (event.data?.type === "ultra-elite-render-preview-result") {
      state.projection = event.data.info?.projection || null;
      drawOverlay();
    }
  });
}

async function init() {
  bindEvents();
  setView("top");
  await loadAssets();
  await loadModels();
  setStatus("Ready.");
}

init().catch((error) => setStatus(error.message));

})();
