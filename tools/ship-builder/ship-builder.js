"use strict";

const TAU = Math.PI * 2;
const EPS = 0.0001;
const STANDARD_VIEW = Object.freeze({ rx: -0.35, ry: 0.72 });
const PROJECTION_VIEW_PRESETS = Object.freeze({
  front: { rx: 0, ry: Math.PI, label: "FRONT" },
  back: { rx: 0, ry: 0, label: "BACK" },
  top: { rx: -Math.PI / 2, ry: 0, label: "TOP" },
  bottom: { rx: Math.PI / 2, ry: Math.PI, label: "BOTTOM" },
  left: { rx: 0, ry: -Math.PI / 2, label: "LEFT" },
  right: { rx: 0, ry: Math.PI / 2, label: "RIGHT" }
});
const els = {
  shipId: document.getElementById("shipId"),
  shipName: document.getElementById("shipName"),
  shipDescription: document.getElementById("shipDescription"),
  shipMissionLore: document.getElementById("shipMissionLore"),
  librarySelector: document.getElementById("librarySelector"),
  loadLibraryModelBtn: document.getElementById("loadLibraryModelBtn"),
  toolsPanel: document.getElementById("toolsPanel"),
  workspace: document.getElementById("workspace"),
  exportPanel: document.getElementById("exportPanel"),
  toggleExportBtn: document.getElementById("toggleExportBtn"),
  shipClass: document.getElementById("shipClass"),
  npcRole: document.getElementById("npcRole"),
  aiProfile: document.getElementById("aiProfile"),
  decalRole: document.getElementById("decalRole"),
  baseColor: document.getElementById("baseColor"),
  shipValue: document.getElementById("shipValue"),
  shipHp: document.getElementById("shipHp"),
  speedMul: document.getElementById("speedMul"),
  cargoTons: document.getElementById("cargoTons"),
  missileCount: document.getElementById("missileCount"),
  laserClass: document.getElementById("laserClass"),
  flagTrader: document.getElementById("flagTrader"),
  flagPirate: document.getElementById("flagPirate"),
  flagPolice: document.getElementById("flagPolice"),
  flagAlien: document.getElementById("flagAlien"),
  flagEscapePod: document.getElementById("flagEscapePod"),
  flagHidden: document.getElementById("flagHidden"),
  vertexCount: document.getElementById("vertexCount"),
  faceCount: document.getElementById("faceCount"),
  edgeCount: document.getElementById("edgeCount"),
  selectionReadout: document.getElementById("selectionReadout"),
  pickList: document.getElementById("pickList"),
  status: document.getElementById("status"),
  topStatus: document.getElementById("topStatus"),
  exportKind: document.getElementById("exportKind"),
  exportText: document.getElementById("exportText"),
  importText: document.getElementById("importText"),
  mainPreviewStack: document.getElementById("mainPreviewStack"),
  mainView: document.getElementById("mainView"),
  gamePreviewFrame: document.getElementById("gamePreviewFrame"),
  gamePreviewReadout: document.getElementById("gamePreviewReadout"),
  previewTrustBadge: document.getElementById("previewTrustBadge"),
  previewTrustReadout: document.getElementById("previewTrustReadout"),
  syncGamePreviewBtn: document.getElementById("syncGamePreviewBtn"),
  benchmarkRendererBtn: document.getElementById("benchmarkRendererBtn"),
  spinPreviewBtn: document.getElementById("spinPreviewBtn"),
  toggleBlueprintBtn: document.getElementById("toggleBlueprintBtn"),
  spinPreviewModal: document.getElementById("spinPreviewModal"),
  spinPreviewFrame: document.getElementById("spinPreviewFrame"),
  closeSpinPreviewBtn: document.getElementById("closeSpinPreviewBtn"),
  xSlider: document.getElementById("xSlider"),
  ySlider: document.getElementById("ySlider"),
  zSlider: document.getElementById("zSlider"),
  xValue: document.getElementById("xValue"),
  yValue: document.getElementById("yValue"),
  zValue: document.getElementById("zValue"),
  detailInset: document.getElementById("detailInset"),
  detailColor: document.getElementById("detailColor"),
  showFaceNormals: document.getElementById("showFaceNormals"),
  showBlankUv: document.getElementById("showBlankUv"),
  mirrorNewGeometry: document.getElementById("mirrorNewGeometry"),
  previewRenderMode: document.getElementById("previewRenderMode"),
  skinReadout: document.getElementById("skinReadout"),
  mirrorHalfSkins: document.getElementById("mirrorHalfSkins"),
  importMirroredSkin: document.getElementById("importMirroredSkin"),
  skinAngle: document.getElementById("skinAngle"),
  skinAngleValue: document.getElementById("skinAngleValue"),
  orientUvToViewBtn: document.getElementById("orientUvToViewBtn"),
  resetUvAngleBtn: document.getElementById("resetUvAngleBtn"),
  faceColor: document.getElementById("faceColor"),
  averageFaceColorBtn: document.getElementById("averageFaceColorBtn"),
  clearFaceColorBtn: document.getElementById("clearFaceColorBtn"),
  importBitmapShelf: document.getElementById("importBitmapShelf"),
  bitmapShelfSelector: document.getElementById("bitmapShelfSelector"),
  bitmapAssetGrid: document.getElementById("bitmapAssetGrid"),
  currentBitmapAssetGrid: document.getElementById("currentBitmapAssetGrid"),
  localBitmapAssetGrid: document.getElementById("localBitmapAssetGrid"),
  replaceAssetInput: document.getElementById("replaceAssetInput"),
  selectedBitmapReadout: document.getElementById("selectedBitmapReadout"),
  assetShelfKind: document.getElementById("assetShelfKind"),
  assetShelfModel: document.getElementById("assetShelfModel"),
  assetShelfSearch: document.getElementById("assetShelfSearch"),
  applyShelfTopBtn: document.getElementById("applyShelfTopBtn"),
  applyShelfBottomBtn: document.getElementById("applyShelfBottomBtn"),
  applyShelfBackBtn: document.getElementById("applyShelfBackBtn"),
  applyShelfFaceBtn: document.getElementById("applyShelfFaceBtn"),
  addShelfDecalBtn: document.getElementById("addShelfDecalBtn"),
  faceDecalSelector: document.getElementById("faceDecalSelector"),
  faceDecalX: document.getElementById("faceDecalX"),
  faceDecalY: document.getElementById("faceDecalY"),
  faceDecalScale: document.getElementById("faceDecalScale"),
  faceDecalAngle: document.getElementById("faceDecalAngle"),
  faceDecalAlpha: document.getElementById("faceDecalAlpha"),
  removeFaceDecalBtn: document.getElementById("removeFaceDecalBtn"),
  clearFaceDecalsBtn: document.getElementById("clearFaceDecalsBtn"),
  clearAllFaceDecalsBtn: document.getElementById("clearAllFaceDecalsBtn"),
  clearBitmapShelfBtn: document.getElementById("clearBitmapShelfBtn"),
  importTopSkin: document.getElementById("importTopSkin"),
  importBottomSkin: document.getElementById("importBottomSkin"),
  importBackSkin: document.getElementById("importBackSkin"),
  importFaceSkin: document.getElementById("importFaceSkin"),
  reloadSkinBitmapsBtn: document.getElementById("reloadSkinBitmapsBtn"),
  clearImportedSkinsBtn: document.getElementById("clearImportedSkinsBtn"),
  clearFaceSkinBtn: document.getElementById("clearFaceSkinBtn"),
  clearAllFaceUvBtn: document.getElementById("clearAllFaceUvBtn"),
  clearFaceGroupBtn: document.getElementById("clearFaceGroupBtn"),
  clearTopSkinBtn: document.getElementById("clearTopSkinBtn"),
  clearBottomSkinBtn: document.getElementById("clearBottomSkinBtn"),
  clearBackSkinBtn: document.getElementById("clearBackSkinBtn"),
  localServerReadout: document.getElementById("localServerReadout"),
  assetShelfCategory: document.getElementById("assetShelfCategory"),
  refreshAssetShelfBtn: document.getElementById("refreshAssetShelfBtn"),
  loadCurrentShipAssetsBtn: document.getElementById("loadCurrentShipAssetsBtn"),
  selectedAssetThumb: document.getElementById("selectedAssetThumb"),
  selectedAssetTitle: document.getElementById("selectedAssetTitle"),
  selectedAssetMeta: document.getElementById("selectedAssetMeta"),
  openAssetLibraryBtn: document.getElementById("openAssetLibraryBtn"),
  openAssetLibraryPaintBtn: document.getElementById("openAssetLibraryPaintBtn"),
  closeAssetLibraryBtn: document.getElementById("closeAssetLibraryBtn"),
  assetLibraryModal: document.getElementById("assetLibraryModal"),
  writeSummaryModal: document.getElementById("writeSummaryModal"),
  writeSummaryTitle: document.getElementById("writeSummaryTitle"),
  writeSummaryBody: document.getElementById("writeSummaryBody"),
  confirmWriteSummaryBtn: document.getElementById("confirmWriteSummaryBtn"),
  cancelWriteSummaryBtn: document.getElementById("cancelWriteSummaryBtn"),
  buildCompleteModal: document.getElementById("buildCompleteModal"),
  buildCompleteMessage: document.getElementById("buildCompleteMessage"),
  closeBuildCompleteBtn: document.getElementById("closeBuildCompleteBtn"),
  testBuildDevHtmlBtn: document.getElementById("testBuildDevHtmlBtn"),
  saveModelAssetBtn: document.getElementById("saveModelAssetBtn"),
  saveModelTopBtn: document.getElementById("saveModelTopBtn"),
  rebuildAssetsBtn: document.getElementById("rebuildAssetsBtn"),
  rebuildGameTopBtn: document.getElementById("rebuildGameTopBtn"),
  uploadTopSkinBtn: document.getElementById("uploadTopSkinBtn"),
  uploadBottomSkinBtn: document.getElementById("uploadBottomSkinBtn"),
  uploadBackSkinBtn: document.getElementById("uploadBackSkinBtn"),
  uploadFaceSkinBtn: document.getElementById("uploadFaceSkinBtn"),
  templateFaceSide: document.getElementById("templateFaceSide"),
  downloadTopTemplateBtn: document.getElementById("downloadTopTemplateBtn"),
  downloadBottomTemplateBtn: document.getElementById("downloadBottomTemplateBtn"),
  downloadBackTemplateBtn: document.getElementById("downloadBackTemplateBtn"),
  downloadFaceTemplateBtn: document.getElementById("downloadFaceTemplateBtn")
};

const BLUEPRINT_VISIBLE_STORAGE_KEY = "ultraEliteShipBuilderBlueprintVisible";

function readBlueprintVisiblePreference() {
  try {
    return localStorage.getItem(BLUEPRINT_VISIBLE_STORAGE_KEY) !== "0";
  } catch (error) {
    return true;
  }
}

const state = {
  mode: "vertex",
  axis: "x",
  nextId: 1,
  verts: [],
  faces: [],
  edges: [],
  details: [],
  skinImages: emptySkinBundle(),
  faceSkinImages: {},
  faceSkinUrls: {},
  faceSkinSources: {},
  decalImages: {},
  bitmapShelf: [],
  toolServer: { available: false, skins: [], version: 0 },
  selectedBitmapShelfId: "",
  sideSkinAngle: 0,
  assetVersion: Date.now(),
  previewSkinVersion: Date.now(),
  gamePreviewInfo: null,
  gamePreviewProjection: null,
  faceDecalUiKey: "",
  sourceModelId: "",
  selected: null,
  selectedFaceIds: new Set(),
  pick: [],
  view: { rx: STANDARD_VIEW.rx, ry: STANDARD_VIEW.ry, zoom: 2.9, panX: 0, panY: 0 },
  orthoScale: 1,
  showBlueprints: readBlueprintVisiblePreference(),
  drag: null
};

const TEMPLATE_SIZE = 400;
const TEMPLATE_MAX_SIZE = 600;
const BITMAP_FACE_SIDES = new Set(["top", "bottom", "back"]);
const SPIN_PREVIEW_STORAGE_KEY = "ultraEliteSpinPreviewPayload";
const SPIN_PREVIEW_CHANNEL = "ultra-elite-builder-spin-preview";
const DEFAULT_PREVIEW_RENDER_MODE = "gameOverlay";
let gamePreviewTimer = 0;
let gamePreviewViewFrame = 0;
let gamePreviewLastKey = "";
let gamePreviewSentBlueprintKey = "";
let gamePreviewConfirmedBlueprintKey = "";
let gamePreviewSentSkinVersion = 0;
let rendererBenchmarkRunning = false;
let writeSummaryResolver = null;
const previewImageDataUrlCache = new WeakMap();

function vec(x = 0, y = 0, z = 0) { return { x, y, z }; }
function add(a, b) { return vec(a.x + b.x, a.y + b.y, a.z + b.z); }
function sub(a, b) { return vec(a.x - b.x, a.y - b.y, a.z - b.z); }
function mul(a, s) { return vec(a.x * s, a.y * s, a.z * s); }
function dot(a, b) { return a.x * b.x + a.y * b.y + a.z * b.z; }
function cross(a, b) {
  return vec(a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x);
}
function len(a) { return Math.hypot(a.x, a.y, a.z); }
function norm(a) {
  const l = len(a) || 1;
  return vec(a.x / l, a.y / l, a.z / l);
}
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function round(v, places = 2) {
  const m = 10 ** places;
  return Math.round(v * m) / m;
}
function toArray(v) { return [round(v.x), round(v.y), round(v.z)]; }
function validBitmapFaceSide(value) {
  return BITMAP_FACE_SIDES.has(value) ? value : "";
}

function cleanBitmapKey(value, fallback = "") {
  const clean = String(value || "").trim().replace(/[^a-zA-Z0-9_-]+/g, "_").replace(/^_+|_+$/g, "");
  return clean || fallback;
}

function normalizeFaceDecal(decal) {
  const key = cleanBitmapKey(decal?.key);
  if (!key) return null;
  return {
    key,
    x: round(clamp(Number.isFinite(Number(decal?.x)) ? Number(decal.x) : .5, 0, 1), 3),
    y: round(clamp(Number.isFinite(Number(decal?.y)) ? Number(decal.y) : .5, 0, 1), 3),
    scale: round(clamp(Number.isFinite(Number(decal?.scale)) ? Number(decal.scale) : .35, .02, 2), 3),
    angle: normalizeBitmapAngle(decal?.angle),
    alpha: round(clamp(Number.isFinite(Number(decal?.alpha)) ? Number(decal.alpha) : .92, 0, 1), 3)
  };
}

function cleanFaceDecals(decals) {
  return Array.isArray(decals) ? decals.map(normalizeFaceDecal).filter(Boolean) : [];
}

function cleanFaceBitmapUv(face) {
  const verts = Array.isArray(face) ? face : face?.verts || [];
  if (!Array.isArray(face?.bitmapUv) || verts.length < 3) return null;
  const uv = face.bitmapUv
    .map((p) => Array.isArray(p) ? [round(Number(p[0]) || 0, 3), round(Number(p[1]) || 0, 3)] : null)
    .filter(Boolean);
  return uv.length === verts.length ? uv : null;
}

function mirroredFaceAngle(angle) {
  return normalizeBitmapAngle(-normalizeBitmapAngle(angle));
}

function mirroredFaceDecal(decal) {
  const clean = normalizeFaceDecal(decal);
  if (!clean) return null;
  return {
    ...clean,
    x: round(1 - clean.x, 3),
    angle: mirroredFaceAngle(clean.angle)
  };
}

function sourceVertexId(vertex, index) {
  const id = Array.isArray(vertex) ? index : Number(vertex?.id);
  return Number.isFinite(id) ? id : index;
}

function sourceVertex(vertex, index) {
  const id = sourceVertexId(vertex, index);
  if (Array.isArray(vertex)) {
    return {
      id,
      x: Number(vertex[0]) || 0,
      y: Number(vertex[1]) || 0,
      z: Number(vertex[2]) || 0,
      mirrorId: null,
      center: false
    };
  }
  return {
    id,
    x: Number(vertex?.x) || 0,
    y: Number(vertex?.y) || 0,
    z: Number(vertex?.z) || 0,
    mirrorId: vertex?.mirrorId ?? null,
    center: !!vertex?.center
  };
}

function sourceFace(face, index) {
  const id = Number(face?.id);
  const bitmapSide = validBitmapFaceSide(face?.bitmapSide);
  const bitmapFaceKey = cleanBitmapKey(face?.bitmapFaceKey);
  const bitmapAngle = normalizeBitmapAngle(face?.bitmapAngle);
  const bitmapMirrorX = !!face?.bitmapMirrorX;
  const bitmapUv = cleanFaceBitmapUv(face);
  const bitmapBaseW = Math.max(0, Math.round(Number(face?.bitmapBaseW) || 0));
  const bitmapBaseH = Math.max(0, Math.round(Number(face?.bitmapBaseH) || 0));
  const bitmapDecals = cleanFaceDecals(face?.bitmapDecals);
  const faceColor = optionalHexColor(face?.faceColor || face?.color);
  return {
    id: Number.isFinite(id) ? id : 1000 + index,
    verts: (Array.isArray(face) ? face : face?.verts || []).map(Number),
    mirrored: !!face?.mirrored,
    ...(faceColor ? { faceColor } : {}),
    ...(bitmapSide ? { bitmapSide } : {}),
    ...(bitmapFaceKey ? { bitmapFaceKey } : {}),
    ...(bitmapUv?.length >= 3 ? { bitmapUv } : {}),
    ...(bitmapBaseW && bitmapBaseH ? { bitmapBaseW, bitmapBaseH } : {}),
    ...(bitmapAngle ? { bitmapAngle } : {}),
    ...(bitmapMirrorX ? { bitmapMirrorX } : {}),
    ...(bitmapDecals.length ? { bitmapDecals } : {})
  };
}

function sourceEdge(edge, index) {
  const id = Number(edge?.id);
  const a = Array.isArray(edge) ? edge[0] : edge?.a;
  const b = Array.isArray(edge) ? edge[1] : edge?.b;
  return {
    id: Number.isFinite(id) ? id : 2000 + index,
    a: Number(a),
    b: Number(b),
    kind: edge?.kind || "edge",
    mirrored: !!edge?.mirrored
  };
}

function setStatus(text) {
  if (els.status) els.status.textContent = text;
  if (els.topStatus) els.topStatus.textContent = text;
}

function confirmWrite(message) {
  return window.confirm(`${message}\n\nThis writes to the local project files.`);
}

function closeWriteSummaryModal(result = false) {
  if (!els.writeSummaryModal) return;
  els.writeSummaryModal.classList.add("is-hidden");
  if (writeSummaryResolver) {
    const resolve = writeSummaryResolver;
    writeSummaryResolver = null;
    resolve(result);
  }
}

function writeSummaryGroup(title, lines = []) {
  const section = document.createElement("section");
  section.className = "write-summary-group";
  const heading = document.createElement("h3");
  heading.textContent = title;
  section.append(heading);
  const list = document.createElement("ul");
  for (const line of lines.filter(Boolean)) {
    const item = document.createElement("li");
    item.textContent = line;
    list.append(item);
  }
  if (!list.children.length) {
    const item = document.createElement("li");
    item.textContent = "No changes in this group.";
    list.append(item);
  }
  section.append(list);
  return section;
}

function confirmProjectWriteSummary({ title = "Confirm Write", intro = "", confirmLabel = "Build Assets", groups = [] } = {}) {
  if (!els.writeSummaryModal || !els.writeSummaryBody) {
    return Promise.resolve(confirmWrite(intro || title));
  }
  if (writeSummaryResolver) closeWriteSummaryModal(false);
  if (els.writeSummaryTitle) els.writeSummaryTitle.textContent = title;
  if (els.confirmWriteSummaryBtn) els.confirmWriteSummaryBtn.textContent = confirmLabel;
  els.writeSummaryBody.replaceChildren();
  if (intro) {
    const summary = document.createElement("p");
    summary.className = "write-summary-intro";
    summary.textContent = intro;
    els.writeSummaryBody.append(summary);
  }
  for (const group of groups) {
    els.writeSummaryBody.append(writeSummaryGroup(group.title, group.lines));
  }
  const warning = document.createElement("p");
  warning.className = "write-summary-warning";
  warning.textContent = "This writes to the local project files.";
  els.writeSummaryBody.append(warning);
  els.writeSummaryModal.classList.remove("is-hidden");
  els.confirmWriteSummaryBtn?.focus();
  return new Promise((resolve) => {
    writeSummaryResolver = resolve;
  });
}

function localDevHtmlTestUrl() {
  if (window.location.protocol === "http:" || window.location.protocol === "https:") {
    return `${window.location.origin}/dev.html`;
  }
  return new URL("../../dev.html", window.location.href).href;
}

function showBuildCompleteModal(message = "The local dev.html test build is ready.") {
  if (!els.buildCompleteModal) return;
  if (els.buildCompleteMessage) els.buildCompleteMessage.textContent = message;
  els.buildCompleteModal.classList.remove("is-hidden");
  els.testBuildDevHtmlBtn?.focus();
}

function closeBuildCompleteModal() {
  els.buildCompleteModal?.classList.add("is-hidden");
}

function openLocalDevHtmlTest() {
  const url = localDevHtmlTestUrl();
  window.open(url, "_blank", "noopener");
  closeBuildCompleteModal();
}

function setLocalServerReadout(text, ok = state.toolServer.available) {
  if (!els.localServerReadout) return;
  els.localServerReadout.textContent = text;
  els.localServerReadout.dataset.available = ok ? "true" : "false";
}

async function apiJson(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      "content-type": "application/json",
      ...(options.headers || {})
    }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.ok === false) throw new Error(data.error || `HTTP ${response.status}`);
  return data;
}

function cacheBust(url) {
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}v=${encodeURIComponent(state.assetVersion || Date.now())}`;
}

async function checkLocalToolServer() {
  try {
    const data = await apiJson("/api/status", { method: "GET" });
    state.toolServer.available = true;
    state.toolServer.version = data.version || Date.now();
    state.assetVersion = state.toolServer.version;
    setLocalServerReadout("LOCAL SERVER READY.", true);
    return true;
  } catch {
    state.toolServer.available = false;
    setLocalServerReadout("STATIC MODE: START npm run dev:tools FOR DIRECT SAVE/UPLOAD.", false);
    return false;
  }
}

async function requireToolServer() {
  if (state.toolServer.available || await checkLocalToolServer()) return true;
  setStatus("LOCAL TOOL SERVER NOT AVAILABLE. RUN npm run dev:tools.");
  return false;
}

function vertexById(id) {
  return state.verts.find((v) => v.id === id) || null;
}

function faceById(id) {
  return state.faces.find((f) => f.id === id) || null;
}

function selectedFace() {
  return state.selected?.type === "face" ? faceById(state.selected.id) : null;
}

function selectedFaceGroup() {
  return [...state.selectedFaceIds].map(faceById).filter(Boolean);
}

function clearFaceGroup(statusText = "FACE GROUP CLEARED.") {
  const hadGroup = state.selectedFaceIds.size > 0;
  state.selectedFaceIds.clear();
  if (hadGroup) {
    setStatus(statusText);
    renderAll();
  }
}

function detailById(id) {
  return state.details.find((d) => d.id === id) || null;
}

function newId() {
  return state.nextId++;
}

function addVertex(x, y, z, mirrorId = null, center = false) {
  const v = { id: newId(), x, y, z, mirrorId, center };
  state.verts.push(v);
  return v;
}

function addPointPair(x = 60, y = 0, z = 0) {
  if (Math.abs(x) < 1) return addVertex(0, y, z, null, true);
  const a = addVertex(Math.abs(x), y, z);
  const b = addVertex(-Math.abs(x), y, z, a.id);
  a.mirrorId = b.id;
  return a;
}

function addCenterPoint(y = 0, z = 0) {
  return addVertex(0, y, z, null, true);
}

function setVertex(v, x, y, z) {
  if (!v) return;
  if (v.center) {
    v.x = 0;
  } else {
    v.x = x;
  }
  v.y = y;
  v.z = z;
  const m = vertexById(v.mirrorId);
  if (m && mirrorActionsEnabled()) {
    m.x = -v.x;
    m.y = y;
    m.z = z;
  }
}

function mirrorActionsEnabled() {
  return !!els.mirrorNewGeometry.checked;
}

function inferredMirrorVertexId(id) {
  const v = vertexById(id);
  if (!v) return null;
  const explicit = vertexById(v.mirrorId);
  if (explicit) return explicit.id;
  if (Math.abs(v.x) < .001) return v.id;
  let best = null;
  let bestScore = Infinity;
  for (const candidate of state.verts) {
    if (candidate.id === v.id) continue;
    const score =
      Math.abs(candidate.x + v.x) +
      Math.abs(candidate.y - v.y) +
      Math.abs(candidate.z - v.z);
    if (score < bestScore) {
      best = candidate;
      bestScore = score;
    }
  }
  return best && bestScore < .01 ? best.id : null;
}

function mirrorIds(ids) {
  const mirrored = ids.map((id) => inferredMirrorVertexId(id));
  if (mirrored.some((id) => id == null)) return null;
  return mirrored.reverse();
}

function inferMirrorVertexIds() {
  for (const vertex of state.verts) {
    if (vertexById(vertex.mirrorId)) continue;
    const mirrorId = inferredMirrorVertexId(vertex.id);
    if (mirrorId && mirrorId !== vertex.id) vertex.mirrorId = mirrorId;
    else if (mirrorId === vertex.id) {
      vertex.mirrorId = null;
      vertex.center = true;
    }
  }
}

function sameIdSet(a, b) {
  if (a.length !== b.length) return false;
  const aa = [...a].sort((x, y) => x - y).join(",");
  const bb = [...b].sort((x, y) => x - y).join(",");
  return aa === bb;
}

function mirroredFaceOf(face) {
  const mids = mirrorIds(face.verts);
  if (!mids || sameIdSet(mids, face.verts)) return null;
  return state.faces.find((candidate) => candidate.id !== face.id && sameIdSet(candidate.verts, mids)) || null;
}

function mirroredEdgeOf(edge) {
  const ma = vertexById(edge.a)?.mirrorId || edge.a;
  const mb = vertexById(edge.b)?.mirrorId || edge.b;
  if (ma === edge.a && mb === edge.b) return null;
  return state.edges.find((candidate) =>
    candidate.id !== edge.id &&
    candidate.kind === edge.kind &&
    ((candidate.a === ma && candidate.b === mb) || (candidate.a === mb && candidate.b === ma))
  ) || null;
}

function mirroredDetailOf(detail) {
  if (detail.vertexId) {
    const vertex = vertexById(detail.vertexId);
    const mirrorId = vertex?.mirrorId;
    if (!mirrorId || mirrorId === detail.vertexId) return null;
    return state.details.find((candidate) =>
      candidate.id !== detail.id &&
      candidate.type === detail.type &&
      candidate.vertexId === mirrorId
    ) || null;
  }
  if (!detail.faceId) return null;
  const face = faceById(detail.faceId);
  const mirrorFace = face ? mirroredFaceOf(face) : null;
  if (!mirrorFace) return null;
  if (detail.segment?.length === 2) {
    const mirroredSegment = mirrorIds(detail.segment);
    if (mirroredSegment) {
      return state.details.find((candidate) =>
        candidate.id !== detail.id &&
        candidate.faceId === mirrorFace.id &&
        candidate.type === detail.type &&
        candidate.segment?.length === 2 &&
        sameIdSet(candidate.segment, mirroredSegment)
      ) || null;
    }
  }
  return state.details.find((candidate) =>
    candidate.id !== detail.id &&
    candidate.faceId === mirrorFace.id &&
    candidate.type === detail.type
  ) || null;
}

function syncMirroredFace(face, options = {}) {
  const mf = mirroredFaceOf(face);
  const mids = mirrorIds(face.verts);
  if (mf && mids) {
    const previousMirrorKey = cleanBitmapKey(mf.bitmapFaceKey);
    const previousMirrorUv = Array.isArray(mf.bitmapUv) && mf.bitmapUv.length >= 3
      ? mf.bitmapUv.map((p) => [round(Number(p[0]) || 0, 3), round(Number(p[1]) || 0, 3)])
      : null;
    const previousMirrorBaseW = Math.round(Number(mf.bitmapBaseW) || TEMPLATE_SIZE);
    const previousMirrorBaseH = Math.round(Number(mf.bitmapBaseH) || TEMPLATE_SIZE);
    mf.verts = mids;
    const side = validBitmapFaceSide(face.bitmapSide);
    if (side) mf.bitmapSide = side;
    else delete mf.bitmapSide;
    const key = cleanBitmapKey(face.bitmapFaceKey);
    if (key) mf.bitmapFaceKey = key;
    else delete mf.bitmapFaceKey;
    if (Array.isArray(face.bitmapUv) && face.bitmapUv.length >= 3) {
      if (!options.forceBitmapUv && previousMirrorKey === key && previousMirrorUv) {
        mf.bitmapUv = previousMirrorUv;
        mf.bitmapBaseW = previousMirrorBaseW;
        mf.bitmapBaseH = previousMirrorBaseH;
      } else {
        mf.bitmapUv = face.bitmapUv.map((p) => [round(Number(p[0]) || 0, 3), round(Number(p[1]) || 0, 3)]);
        mf.bitmapBaseW = Math.round(Number(face.bitmapBaseW) || TEMPLATE_SIZE);
        mf.bitmapBaseH = Math.round(Number(face.bitmapBaseH) || TEMPLATE_SIZE);
      }
    } else {
      delete mf.bitmapUv;
      delete mf.bitmapBaseW;
      delete mf.bitmapBaseH;
    }
    const angle = mirroredFaceAngle(face.bitmapAngle);
    if (angle) mf.bitmapAngle = angle;
    else delete mf.bitmapAngle;
    if (face.bitmapMirrorX) mf.bitmapMirrorX = true;
    else delete mf.bitmapMirrorX;
    const color = optionalHexColor(face.faceColor);
    if (color) mf.faceColor = color;
    else delete mf.faceColor;
    const decals = cleanFaceDecals(face.bitmapDecals).map(mirroredFaceDecal).filter(Boolean);
    if (decals.length) mf.bitmapDecals = decals.map((decal) => ({ ...decal }));
    else delete mf.bitmapDecals;
  }
  return mf || null;
}

function faceExists(ids) {
  return state.faces.some((f) => sameIdSet(f.verts, ids));
}

function addFace(ids, mirrored = false) {
  const cleaned = [...new Set(ids)].filter((id) => vertexById(id));
  if (cleaned.length < 3 || faceExists(cleaned)) return null;
  const f = { id: newId(), verts: cleaned, mirrored };
  state.faces.push(f);
  return f;
}

function addFaceMirrored(ids) {
  const f = addFace(ids, false);
  if (mirrorActionsEnabled()) {
    const mids = mirrorIds(ids);
    if (mids && !sameIdSet(mids, ids)) addFace(mids, true);
  }
  return f;
}

function addEdge(a, b, kind = "edge", mirrored = false) {
  if (!vertexById(a) || !vertexById(b) || a === b) return null;
  const exists = state.edges.some((e) => e.kind === kind && ((e.a === a && e.b === b) || (e.a === b && e.b === a)));
  if (exists) return null;
  const e = { id: newId(), a, b, kind, mirrored };
  state.edges.push(e);
  return e;
}

function addEdgeMirrored(a, b, kind = "edge") {
  const e = addEdge(a, b, kind, false);
  if (mirrorActionsEnabled()) {
    const ma = vertexById(a)?.mirrorId || a;
    const mb = vertexById(b)?.mirrorId || b;
    if (ma !== a || mb !== b) addEdge(ma, mb, kind, true);
  }
  return e;
}

function lineKey(a, b) {
  return a < b ? `${a},${b}` : `${b},${a}`;
}

function explicitEdgesBetween(a, b) {
  return state.edges.filter((e) => (e.a === a && e.b === b) || (e.a === b && e.b === a));
}

function faceEdgeIndex(face, a, b) {
  const ids = face.verts;
  for (let i = 0; i < ids.length; i++) {
    const next = (i + 1) % ids.length;
    if ((ids[i] === a && ids[next] === b) || (ids[i] === b && ids[next] === a)) return i;
  }
  return -1;
}

function triangulateFaceAcrossSplit(face, edgeStartIndex, midpointId) {
  const ids = face.verts;
  const first = ids[edgeStartIndex];
  const second = ids[(edgeStartIndex + 1) % ids.length];
  const ordered = [midpointId, second];
  for (let i = (edgeStartIndex + 2) % ids.length; ids[i] !== first; i = (i + 1) % ids.length) {
    ordered.push(ids[i]);
  }
  ordered.push(first);

  const triangles = [];
  for (let i = 1; i < ordered.length - 1; i++) {
    const tri = [midpointId, ordered[i], ordered[i + 1]];
    if (new Set(tri).size === 3) triangles.push(tri);
  }
  return triangles;
}

function midpointVertexForEdge(a, b) {
  const va = vertexById(a), vb = vertexById(b);
  if (!va || !vb) return null;
  const x = (va.x + vb.x) / 2;
  const y = (va.y + vb.y) / 2;
  const z = (va.z + vb.z) / 2;
  return addVertex(Math.abs(x) < EPS ? 0 : x, y, z, null, Math.abs(x) < EPS);
}

function splitEdgeOnce(a, b, midpointId) {
  const affectedFaceIds = new Set();
  const newFaces = [];
  for (const face of state.faces) {
    const edgeIndex = faceEdgeIndex(face, a, b);
    if (edgeIndex < 0) continue;
    affectedFaceIds.add(face.id);
    for (const tri of triangulateFaceAcrossSplit(face, edgeIndex, midpointId)) {
      newFaces.push({ id: newId(), verts: tri, mirrored: !!face.mirrored });
    }
  }

  if (affectedFaceIds.size) {
    state.faces = state.faces.filter((face) => !affectedFaceIds.has(face.id));
    state.faces.push(...newFaces);
    state.details = state.details.filter((detail) => !affectedFaceIds.has(detail.faceId));
  }

  const explicit = explicitEdgesBetween(a, b);
  if (explicit.length) {
    const oldIds = new Set(explicit.map((edge) => edge.id));
    state.edges = state.edges.filter((edge) => !oldIds.has(edge.id));
    for (const edge of explicit) {
      addEdge(a, midpointId, edge.kind, !!edge.mirrored);
      addEdge(midpointId, b, edge.kind, !!edge.mirrored);
    }
  }

  return { faceCount: affectedFaceIds.size, explicitCount: explicit.length };
}

function splitSelectedLine() {
  let targets = [];
  if (state.selected?.type === "edge") {
    const edge = state.edges.find((item) => item.id === state.selected.id);
    if (edge) targets.push({ a: edge.a, b: edge.b });
  } else if (state.pick.length >= 2) {
    targets.push({ a: state.pick[0], b: state.pick[1] });
  }
  if (!targets.length) return setStatus("SELECT AN EDGE OR PICK TWO VERTICES.");

  if (mirrorActionsEnabled()) {
    const additions = [];
    for (const target of targets) {
      const ma = vertexById(target.a)?.mirrorId || target.a;
      const mb = vertexById(target.b)?.mirrorId || target.b;
      if (ma !== target.a || mb !== target.b) additions.push({ a: ma, b: mb });
    }
    targets.push(...additions);
  }

  const uniqueTargets = [];
  const seen = new Set();
  for (const target of targets) {
    if (!vertexById(target.a) || !vertexById(target.b) || target.a === target.b) continue;
    const key = lineKey(target.a, target.b);
    if (seen.has(key)) continue;
    seen.add(key);
    uniqueTargets.push(target);
  }
  if (!uniqueTargets.length) return setStatus("NO VALID LINE TO SPLIT.");

  const midpointByKey = new Map();
  for (const target of uniqueTargets) {
    const midpoint = midpointVertexForEdge(target.a, target.b);
    if (!midpoint) continue;
    midpointByKey.set(lineKey(target.a, target.b), midpoint);
  }

  if (mirrorActionsEnabled()) {
    for (const target of uniqueTargets) {
      const midpoint = midpointByKey.get(lineKey(target.a, target.b));
      if (!midpoint || midpoint.center) continue;
      const ma = vertexById(target.a)?.mirrorId || target.a;
      const mb = vertexById(target.b)?.mirrorId || target.b;
      const mirrorMidpoint = midpointByKey.get(lineKey(ma, mb));
      if (mirrorMidpoint && mirrorMidpoint.id !== midpoint.id) {
        midpoint.mirrorId = mirrorMidpoint.id;
        mirrorMidpoint.mirrorId = midpoint.id;
      }
    }
  }

  let faceCount = 0;
  let explicitCount = 0;
  let firstMidpoint = null;
  for (const target of uniqueTargets) {
    const midpoint = midpointByKey.get(lineKey(target.a, target.b));
    if (!midpoint) continue;
    if (!firstMidpoint) firstMidpoint = midpoint;
    const result = splitEdgeOnce(target.a, target.b, midpoint.id);
    faceCount += result.faceCount;
    explicitCount += result.explicitCount;
  }

  state.selected = firstMidpoint ? { type: "vertex", id: firstMidpoint.id } : null;
  state.pick = [];
  setStatus(`LINE SPLIT. TRIANGULATED ${faceCount} FACE${faceCount === 1 ? "" : "S"}${explicitCount ? ` AND SPLIT ${explicitCount} EXPLICIT LINE${explicitCount === 1 ? "" : "S"}` : ""}.`);
  renderAll();
}

function faceNormal(face) {
  const verts = face.verts.map(vertexById).filter(Boolean);
  if (verts.length < 3) return vec(0, 0, 1);
  const a = vec(verts[0].x, verts[0].y, verts[0].z);
  const b = vec(verts[1].x, verts[1].y, verts[1].z);
  const c = vec(verts[2].x, verts[2].y, verts[2].z);
  return norm(cross(sub(b, a), sub(c, a)));
}

function faceFacesBuilderCamera(face) {
  const n = rotatePoint(faceNormal(face));
  return n.z < -0.015;
}

function faceCenter(face) {
  const verts = face.verts.map(vertexById).filter(Boolean);
  if (!verts.length) return vec();
  return mul(verts.reduce((sum, v) => add(sum, vec(v.x, v.y, v.z)), vec()), 1 / verts.length);
}

function detailPoints(face, inset = 0.42) {
  const c = faceCenter(face);
  return face.verts.map((id) => {
    const v = vertexById(id);
    return add(c, mul(sub(vec(v.x, v.y, v.z), c), inset));
  });
}

function insetPointOnFace(face, vertexId, inset = 0.42) {
  const v = vertexById(vertexId);
  if (!v) return null;
  const c = faceCenter(face);
  return add(c, mul(sub(vec(v.x, v.y, v.z), c), inset));
}

function detailModelPoints(detail) {
  if (detail.vertexId) {
    const v = vertexById(Number(detail.vertexId));
    return v ? [vec(v.x, v.y, v.z)] : [];
  }
  if (Array.isArray(detail.points)) {
    return detail.points
      .map((p) => Array.isArray(p) ? vec(Number(p[0]), Number(p[1]), Number(p[2])) : vec(Number(p.x), Number(p.y), Number(p.z)))
      .filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y) && Number.isFinite(p.z));
  }
  if (Array.isArray(detail.indices)) {
    return detail.indices
      .map((id) => vertexById(Number(id)))
      .filter(Boolean)
      .map((v) => vec(v.x, v.y, v.z));
  }
  const face = faceById(detail.faceId);
  if (!face) return [];
  const inset = detail.inset || 0.45;
  if (detail.type === "panel" && detail.segment?.length === 2) {
    return detail.segment
      .map((id) => insetPointOnFace(face, id, inset))
      .filter(Boolean);
  }
  const pts = detailPoints(face, inset);
  if (detail.type === "panel" && pts.length >= 2) return [...pts, pts[0]];
  return pts;
}

function addPanelDetails(face, normal) {
  const details = [];
  for (let i = 0; i < face.verts.length; i++) {
    details.push({
      id: newId(),
      type: "panel",
      faceId: face.id,
      inset: 0.66,
      color: "#ffd936",
      normal: toArray(normal),
      segment: [face.verts[i], face.verts[(i + 1) % face.verts.length]]
    });
  }
  state.details.push(...details);

  if (mirrorActionsEnabled()) {
    const mirrorFace = mirroredFaceOf(face);
    if (mirrorFace) {
      const mirrorNormal = faceNormal(mirrorFace);
      for (const detail of details) {
        const segment = mirrorIds(detail.segment);
        if (!segment) continue;
        state.details.push({
          ...detail,
          id: newId(),
          faceId: mirrorFace.id,
          normal: toArray(mirrorNormal),
          segment
        });
      }
    }
  }
  return details;
}

function selectedBeaconVertex() {
  const vertexId = state.selected?.type === "vertex"
    ? state.selected.id
    : state.pick.length === 1
      ? state.pick[0]
      : null;
  return vertexId ? vertexById(vertexId) : null;
}

function beaconTargetIds(vertex) {
  const ids = [vertex?.id].filter(Boolean);
  if (mirrorActionsEnabled() && vertex?.mirrorId && vertex.mirrorId !== vertex.id) {
    ids.push(vertex.mirrorId);
  }
  return [...new Set(ids.map(Number))];
}

function hasBeaconAtVertex(vertexId) {
  return state.details.some((detail) => detail.type === "beacon" && Number(detail.vertexId) === Number(vertexId));
}

function addBeaconDetail(options = {}) {
  const { stayInVertexMode = false } = options;
  const vertex = selectedBeaconVertex();
  if (!vertex) {
    setStatus("SELECT ONE VERTEX FIRST.");
    return;
  }
  const added = [];
  for (const vertexId of beaconTargetIds(vertex)) {
    if (hasBeaconAtVertex(vertexId)) continue;
    const d = {
      id: newId(),
      type: "beacon",
      vertexId,
      color: "#ffb642"
    };
    state.details.push(d);
    added.push(d);
  }
  if (!added.length) {
    setStatus("BEACON ALREADY EXISTS AT SELECTED VERTEX.");
    renderAll();
    return;
  }
  if (stayInVertexMode) {
    state.mode = "vertex";
    syncModeUi("vertex");
    state.selected = { type: "vertex", id: vertex.id };
  } else {
    state.mode = "detail";
    syncModeUi("detail");
    state.selected = { type: "detail", id: added[0].id };
  }
  setStatus(`${added.length > 1 ? "MIRRORED BEACONS" : "BEACON"} ADDED.`);
  renderAll();
}

function removeBeaconAtSelectedVertex() {
  const vertex = selectedBeaconVertex();
  if (!vertex) {
    setStatus("SELECT ONE VERTEX FIRST.");
    return;
  }
  const targets = new Set(beaconTargetIds(vertex));
  const before = state.details.length;
  state.details = state.details.filter((detail) => !(detail.type === "beacon" && targets.has(Number(detail.vertexId))));
  const removed = before - state.details.length;
  state.mode = "vertex";
  syncModeUi("vertex");
  state.selected = { type: "vertex", id: vertex.id };
  setStatus(removed ? `${removed > 1 ? "MIRRORED BEACONS" : "BEACON"} REMOVED.` : "NO BEACON AT SELECTED VERTEX.");
  renderAll();
}

function addDetail(type) {
  if (type === "beacon") {
    addBeaconDetail();
    return;
  }
  const face = state.selected?.type === "face" ? faceById(state.selected.id) : null;
  if (!face) {
    setStatus("SELECT A FACE FIRST.");
    return;
  }
  const normal = faceNormal(face);
  if (type === "panel") {
    const details = addPanelDetails(face, normal);
    const count = details.length;
    if (details[0]) {
      state.mode = "detail";
      syncModeUi("detail");
      state.selected = { type: "detail", id: details[0].id };
    }
    setStatus(`${count} PANEL LINE${count === 1 ? "" : "S"} ADDED. DETAIL INSET READY.`);
    renderAll();
    return;
  }
  const d = {
    id: newId(),
    type,
    faceId: face.id,
    inset: type === "engine" ? 0.48 : 0.38,
    color: type === "engine" ? "#f7fff7" : type === "window" ? "#101915" : "#ffd936",
    normal: toArray(normal)
  };
  state.details.push(d);
  if (mirrorActionsEnabled()) {
    const mids = mirrorIds(face.verts);
    const mf = mids && state.faces.find((candidate) => sameIdSet(candidate.verts, mids));
    if (mf && mf.id !== face.id) {
      const mn = faceNormal(mf);
      state.details.push({ ...d, id: newId(), faceId: mf.id, normal: toArray(mn) });
    }
  }
  setStatus(`${type.toUpperCase()} DETAIL ADDED.`);
  renderAll();
}

function patchMirroredDetail(detail, patch) {
  if (!detail || !mirrorActionsEnabled()) return;
  const mirror = mirroredDetailOf(detail);
  if (mirror) Object.assign(mirror, patch);
}

function resetWedge() {
  resetGamePreviewSyncState();
  state.nextId = 1;
  state.verts = [];
  state.faces = [];
  state.edges = [];
  state.details = [];
  state.selected = null;
  state.pick = [];

  const nose = addCenterPoint(0, 98);
  const top = addCenterPoint(28, -70);
  const bottom = addCenterPoint(-24, -70);
  const right = addPointPair(82, 0, -70);
  const left = vertexById(right.mirrorId);

  addFace([nose.id, right.id, top.id]);
  addFace([nose.id, top.id, left.id]);
  addFace([nose.id, bottom.id, right.id]);
  addFace([nose.id, left.id, bottom.id]);
  addFace([top.id, right.id, left.id]);
  addFace([bottom.id, left.id, right.id]);

  syncSkinAngle(0, false);
  clearSkinBitmaps();
  setStatus("NEW SIMPLE PYRAMID WEDGE CREATED.");
  fitView();
  renderAll();
  scheduleGamePreviewSync(0, true);
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

function normalizeRadians(value) {
  return Math.atan2(Math.sin(value), Math.cos(value));
}

function orientFaceViewAngles(face) {
  const n = faceNormal(face);
  if (len(n) < EPS) return null;
  const ry = Math.atan2(-n.x, -n.z);
  const sy = Math.sin(ry);
  const cy = Math.cos(ry);
  const z1 = n.x * sy + n.z * cy;
  const rx = Math.atan2(-n.y, -z1);
  return { rx: normalizeRadians(rx), ry: normalizeRadians(ry) };
}

function orientFaceToView(face = selectedFace(), redraw = true, statusText = "") {
  if (!face) {
    setStatus("SELECT A FACE FIRST.");
    updateFaceUvAngleControls();
    return false;
  }
  setStandardView();
  const view = orientFaceViewAngles(face);
  if (!view) {
    setStatus("FACE NORMAL IS TOO SMALL TO ORIENT VIEW.");
    return false;
  }
  state.view.rx = view.rx;
  state.view.ry = view.ry;
  if (statusText) setStatus(statusText);
  else setStatus(`FACE #${face.id} ORIENTED TO VIEW FROM STANDARD POSE.`);
  if (redraw) renderAll();
  return true;
}

function project3d(v, canvas) {
  const r = rotatePoint(v);
  const scale = state.view.zoom * Math.min(canvas.width, canvas.height) / 360;
  const perspective = 600 / (600 + r.z);
  return {
    x: canvas.width / 2 + state.view.panX + r.x * scale * perspective,
    y: canvas.height / 2 + state.view.panY - r.y * scale * perspective,
    z: r.z,
    perspective
  };
}

function gameRendererPreviewMode(value = els.previewRenderMode?.value || "gameOverlay") {
  return value === "gameOnly" || value === "gameOverlay";
}

function gameRendererOverlayMode(value = els.previewRenderMode?.value || "gameOverlay") {
  return value === "gameOverlay";
}

function gamePreviewRendererMode(value = els.previewRenderMode?.value || "gameOverlay") {
  // Game renderer preview stays solid; the editor canvas owns wire/selection diagnostics.
  return "solid";
}

function gamePreviewFxLevel(value = els.previewRenderMode?.value || "gameOverlay") {
  return "ultra";
}

function previewModeLabel(value = els.previewRenderMode?.value || "gameOverlay") {
  if (value === "gameOnly") return "Game Renderer Only";
  if (value === "gameOverlay") return "Game Renderer + Overlay";
  if (value === "wireFaces") return "Builder Wire + Faces";
  if (value === "wire") return "Builder Wireframe";
  if (value === "wireBitmap") return "Builder Wire + Bitmap";
  if (value === "bitmap") return "Builder Bitmap Only";
  return value;
}

function setDefaultPreviewRenderMode() {
  if (!els.previewRenderMode) return;
  els.previewRenderMode.value = DEFAULT_PREVIEW_RENDER_MODE;
}

function setBlueprintsVisible(visible, options = {}) {
  state.showBlueprints = !!visible;
  const stage = els.mainPreviewStack?.closest(".stage");
  stage?.classList.toggle("blueprints-hidden", !state.showBlueprints);
  if (els.toggleBlueprintBtn) {
    els.toggleBlueprintBtn.classList.toggle("active", state.showBlueprints);
    els.toggleBlueprintBtn.classList.toggle("is-off", !state.showBlueprints);
    els.toggleBlueprintBtn.setAttribute("aria-pressed", state.showBlueprints ? "true" : "false");
    els.toggleBlueprintBtn.textContent = state.showBlueprints ? "Blueprints On" : "Blueprints Off";
  }
  if (options.persist) {
    try {
      localStorage.setItem(BLUEPRINT_VISIBLE_STORAGE_KEY, state.showBlueprints ? "1" : "0");
    } catch (error) {
      // Non-fatal: the toggle still works for this session.
    }
  }
}

function previewProjectionPointToCanvas(point, canvas) {
  if (!point) return null;
  const nx = Number(point.nx);
  const ny = Number(point.ny);
  return {
    x: Number.isFinite(nx) ? nx * canvas.width : Number(point.x) || 0,
    y: Number.isFinite(ny) ? ny * canvas.height : Number(point.y) || 0,
    z: Number(point.z) || 0,
    perspective: Number(point.s) || 1
  };
}

function projectedMapForMain(canvas) {
  if (gameRendererOverlayMode() && state.gamePreviewProjection?.points?.length) {
    const map = new Map();
    state.verts.forEach((v, index) => {
      const point = previewProjectionPointToCanvas(state.gamePreviewProjection.points[index], canvas);
      if (point) map.set(v.id, point);
    });
    if (map.size) return map;
  }
  return new Map(state.verts.map((v) => [v.id, project3d(v, canvas)]));
}

function previewFaceForBuilderFace(face) {
  if (!gameRendererOverlayMode() || !state.gamePreviewProjection?.faces?.length) return null;
  const index = state.faces.indexOf(face);
  return index >= 0 ? state.gamePreviewProjection.faces[index] || null : null;
}

function faceSortDepthForMain(face) {
  const previewFace = previewFaceForBuilderFace(face);
  return Number.isFinite(previewFace?.avgZ) ? previewFace.avgZ : faceDepth(face);
}

function gamePreviewProjectionSummary(info = state.gamePreviewInfo) {
  const projection = info?.projection;
  if (!projection?.faces) return null;
  const visibleFaces = projection.faces.filter((face) => face.visible).length;
  const projectedPoints = projection.points.filter(Boolean).length;
  const faceTextureRefs = projection.faces.filter((face) => face.bitmapKey).length;
  const missingUv = projection.faces.filter((face) => face.bitmapKey && !face.hasImageProjection).length;
  return {
    faces: info.faces || projection.faces.length,
    visibleFaces,
    projectedPoints,
    faceTextureRefs,
    missingUv
  };
}

function updatePreviewTrustUi() {
  const mode = els.previewRenderMode?.value || "gameOverlay";
  const renderer = gameRendererPreviewMode(mode);
  const overlay = gameRendererOverlayMode(mode);
  els.mainPreviewStack?.classList.toggle("is-game-renderer", renderer);
  els.mainPreviewStack?.classList.toggle("is-game-only", mode === "gameOnly");
  els.mainPreviewStack?.classList.toggle("is-game-overlay", overlay);
  els.mainPreviewStack?.classList.toggle("is-builder-diagnostic", !renderer);
  if (els.previewTrustBadge) {
    els.previewTrustBadge.classList.toggle("is-trusted", renderer);
    els.previewTrustBadge.classList.toggle("is-diagnostic", !renderer);
    els.previewTrustBadge.textContent = renderer ? "REAL RENDERER" : "BUILDER DIAGNOSTIC";
  }
  if (!els.previewTrustReadout) return;
  if (!renderer) {
    els.previewTrustReadout.textContent = `${previewModeLabel(mode)} | fallback preview path`;
    return;
  }
  const summary = gamePreviewProjectionSummary();
  if (!summary) {
    els.previewTrustReadout.textContent = gameRendererOverlayMode(mode)
      ? "Waiting for renderer projection packet..."
      : "Renderer-only preview active | projection diagnostics off";
    return;
  }
  const uvText = summary.missingUv
    ? `${summary.missingUv} UV gap${summary.missingUv === 1 ? "" : "s"}`
    : `${summary.faceTextureRefs} face UV${summary.faceTextureRefs === 1 ? "" : "s"}`;
  const overlayText = overlay ? "overlay on | renderer solid" : "overlay off | solid";
  els.previewTrustReadout.textContent = `${summary.visibleFaces}/${summary.faces} visible faces | ${summary.projectedPoints} points | ${uvText} | ${overlayText}`;
}

function drawGameRendererFaceNormals(ctx, canvas) {
  if (!els.showFaceNormals.checked || !state.gamePreviewProjection?.faces?.length) return;
  ctx.save();
  ctx.strokeStyle = "rgba(102,232,255,.78)";
  ctx.lineWidth = 1.2;
  for (const face of state.gamePreviewProjection.faces) {
    if (!face.visible || !face.normalLine?.from || !face.normalLine?.to) continue;
    const from = previewProjectionPointToCanvas(face.normalLine.from, canvas);
    const to = previewProjectionPointToCanvas(face.normalLine.to, canvas);
    if (!from || !to) continue;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  }
  ctx.restore();
}

function previewDetailForBuilderDetail(detail) {
  if (!gameRendererOverlayMode() || !state.gamePreviewProjection?.details?.length) return null;
  const index = state.details.indexOf(detail);
  return index >= 0 ? state.gamePreviewProjection.details[index] || null : null;
}

function projectedDetailPointsForMain(detail, canvas = els.mainView) {
  const previewDetail = previewDetailForBuilderDetail(detail);
  if (previewDetail?.points?.length) {
    return previewDetail.points.map((point) => previewProjectionPointToCanvas(point, canvas)).filter(Boolean);
  }
  return detailModelPoints(detail).map((p) => project3d(p, canvas)).filter(Boolean);
}

function orthoProject(v, canvas, viewName) {
  const radius = modelRadius() || 120;
  const scale = Math.min(canvas.width, canvas.height) / (radius * 2.45) * state.orthoScale;
  let a, b;
  if (viewName === "top") { a = v.x; b = v.z; }
  else if (viewName === "front") { a = v.x; b = v.y; }
  else { a = v.z; b = v.y; }
  return { x: canvas.width / 2 + a * scale, y: canvas.height / 2 - b * scale, z: 0 };
}

function modelRadius() {
  return Math.max(1, ...state.verts.map((v) => Math.hypot(v.x, v.y, v.z)));
}

function faceDepth(face) {
  return face.verts.reduce((sum, id) => {
    const v = vertexById(id);
    return sum + (v ? rotatePoint(v).z : 0);
  }, 0) / face.verts.length;
}

function hexToRgb(hex, fallback = { r: 233, g: 242, b: 228 }) {
  const text = normalizeHexColor(hex);
  const n = Number.parseInt(text.slice(1), 16);
  return Number.isFinite(n)
    ? { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
    : fallback;
}

function shadedHullColor(n) {
  const light = norm(vec(-0.4, 0.75, 0.55));
  const d = clamp(dot(n, light), -0.25, 1);
  const mul = 0.42 + (d + 0.25) / 1.25 * 0.58;
  const base = hexToRgb(els.baseColor.value);
  return `rgb(${Math.round(base.r * mul)},${Math.round(base.g * mul)},${Math.round(base.b * mul)})`;
}

function shadedFaceColor(n, color = els.baseColor.value) {
  const light = norm(vec(-0.35, 0.7, 0.6));
  const d = clamp(dot(n, light), -0.4, 1);
  const mul = 0.46 + (d + 0.4) / 1.4 * 0.54;
  const base = hexToRgb(color);
  return `rgb(${Math.round(base.r * mul)},${Math.round(base.g * mul)},${Math.round(base.b * mul)})`;
}

function builderBitmapFill(n, face = null) {
  return shadedFaceColor(n, optionalHexColor(face?.faceColor) || els.baseColor.value);
}

function drawFace(ctx, pts, fill, stroke = "rgba(85,255,78,.46)", width = 1) {
  if (pts.length < 3) return;
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  if (width > 0) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = width;
    ctx.stroke();
  }
}

function drawFaceTextureGuide(ctx, pts, alpha = .18) {
  if (pts.length < 3) return;
  const minX = Math.min(...pts.map((p) => p.x));
  const maxX = Math.max(...pts.map((p) => p.x));
  const minY = Math.min(...pts.map((p) => p.y));
  const maxY = Math.max(...pts.map((p) => p.y));
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.closePath();
  ctx.clip();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 1;
  for (let x = minX - 80; x < maxX + 80; x += 24) {
    ctx.beginPath();
    ctx.moveTo(x, minY - 40);
    ctx.lineTo(x + 80, maxY + 40);
    ctx.stroke();
  }
  ctx.globalAlpha = alpha * .7;
  ctx.strokeStyle = "#ffd936";
  for (let y = minY + 18; y < maxY; y += 34) {
    ctx.beginPath();
    ctx.moveTo(minX, y);
    ctx.lineTo(maxX, y);
    ctx.stroke();
  }
  ctx.restore();
}

function drawArrow(ctx, a, b, color, width = 1.2) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const d = Math.hypot(dx, dy);
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
  if (d > 4) {
    const ux = dx / d;
    const uy = dy / d;
    const head = Math.min(8, Math.max(4, d * 0.28));
    const wing = head * 0.55;
    ctx.beginPath();
    ctx.moveTo(b.x, b.y);
    ctx.lineTo(b.x - ux * head - uy * wing, b.y - uy * head + ux * wing);
    ctx.lineTo(b.x - ux * head + uy * wing, b.y - uy * head - ux * wing);
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.arc(a.x, a.y, 3.2, 0, TAU);
    ctx.stroke();
  }
  ctx.restore();
}

function drawFaceNormal(ctx, face, projectFn, selected = false) {
  const center = faceCenter(face);
  const normal = faceNormal(face);
  const length = Math.max(18, modelRadius() * 0.16);
  const a = projectFn(center);
  const b = projectFn(add(center, mul(normal, length)));
  const color = selected ? "#ffd936" : "rgba(102,232,255,.62)";
  drawArrow(ctx, a, b, color, selected ? 2.3 : 1.1);
}

function drawFaceNormals(ctx, projectFn) {
  if (!els.showFaceNormals?.checked) return;
  const selectedFaceId = state.selected?.type === "face" ? state.selected.id : null;
  for (const face of state.faces) {
    if (face.id !== selectedFaceId) drawFaceNormal(ctx, face, projectFn, false);
  }
  const selected = selectedFaceId ? faceById(selectedFaceId) : null;
  if (selected) drawFaceNormal(ctx, selected, projectFn, true);
}

function faceHasLoadedSideSkin(face) {
  const side = templateSideForFace(face);
  const img = state.skinImages?.[side];
  return !!(img?.complete && img.naturalWidth);
}

function faceHasUvCoverage(face, previewFace = null) {
  const hasFaceTexture = !!cleanBitmapKey(face?.bitmapFaceKey);
  if (hasFaceTexture) return previewFace?.hasImageProjection !== false;
  return faceHasLoadedSideSkin(face);
}

function drawBlankUvFaceOverlay(ctx, canvas, projected) {
  if (!els.showBlankUv?.checked) return;
  const gameOverlay = gameRendererOverlayMode();
  const faces = [...state.faces].sort((a, b) => faceSortDepthForMain(b) - faceSortDepthForMain(a));
  ctx.save();
  ctx.font = "10px Andale Mono, Menlo, Consolas, monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (const face of faces) {
    const previewFace = previewFaceForBuilderFace(face);
    if (gameOverlay && !previewFace?.visible) continue;
    if (faceHasUvCoverage(face, previewFace)) continue;
    const pts = face.verts.map((id) => projected.get(id)).filter(Boolean);
    if (pts.length < 3) continue;
    drawFace(ctx, pts, "rgba(255,217,54,.18)", "rgba(255,217,54,.95)", 1.8);
    const center = pts.reduce((sum, p) => ({ x: sum.x + p.x, y: sum.y + p.y }), { x: 0, y: 0 });
    center.x /= pts.length;
    center.y /= pts.length;
    const label = `NO UV #${face.id}`;
    const width = ctx.measureText(label).width + 8;
    ctx.fillStyle = "rgba(0,0,0,.74)";
    ctx.fillRect(center.x - width / 2, center.y - 8, width, 16);
    ctx.fillStyle = "#ffd936";
    ctx.fillText(label, center.x, center.y + .5);
  }
  ctx.restore();
}

function drawStars(ctx, canvas) {
  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,.55)";
  for (let i = 0; i < 80; i++) {
    const x = (i * 137.31) % canvas.width;
    const y = (i * 71.17) % canvas.height;
    const a = 0.18 + ((i * 19) % 70) / 100;
    ctx.globalAlpha = a;
    ctx.fillRect(x, y, i % 7 === 0 ? 2 : 1, i % 11 === 0 ? 2 : 1);
  }
  ctx.restore();
}

function templateShipId() {
  return cleanBitmapKey(els.shipId.value, "custom_ship");
}

function mirrorHalfSkinsEnabled() {
  return !!els.mirrorHalfSkins?.checked;
}

function importMirroredSkinEnabled() {
  return !!els.importMirroredSkin?.checked;
}

function ratioClose(a, b, tolerance = .36) {
  return Number.isFinite(a) && Number.isFinite(b) && a > 0 && b > 0 && Math.abs(Math.log(a / b)) <= tolerance;
}

function normalizeBitmapAngle(value) {
  let n = Number(value) || 0;
  n = ((n + 180) % 360 + 360) % 360 - 180;
  if (Math.abs(n) < .0001) return 0;
  return Math.round(n * 100) / 100;
}

function sideSkinAngleDeg() {
  return normalizeBitmapAngle(state.sideSkinAngle);
}

function syncSkinAngle(value, redraw = true) {
  state.sideSkinAngle = normalizeBitmapAngle(value);
  updateFaceUvAngleControls();
  if (redraw) renderAll();
}

function selectedFaceUvAngle() {
  const face = selectedFace();
  return face ? normalizeBitmapAngle(face.bitmapAngle) : 0;
}

function setUvAngleInputs(value) {
  const n = normalizeBitmapAngle(value);
  if (els.skinAngle) els.skinAngle.value = String(Math.round(n));
  if (els.skinAngleValue) els.skinAngleValue.value = String(Math.round(n));
}

function updateFaceUvAngleControls() {
  const face = selectedFace();
  const enabled = !!face;
  setUvAngleInputs(enabled ? face.bitmapAngle : 0);
  if (els.importMirroredSkin && face && cleanBitmapKey(face.bitmapFaceKey)) {
    els.importMirroredSkin.checked = !!face.bitmapMirrorX;
  }
  for (const control of [els.skinAngle, els.skinAngleValue, els.orientUvToViewBtn, els.resetUvAngleBtn]) {
    if (control) control.disabled = !enabled;
  }
  document.querySelectorAll(".uv-rotate-btn").forEach((button) => { button.disabled = !enabled; });
  updateFaceColorControls();
}

function updateFaceColorControls() {
  const face = selectedFace();
  const color = optionalHexColor(face?.faceColor);
  if (els.faceColor) {
    els.faceColor.disabled = !face;
    els.faceColor.value = color || normalizeHexColor(els.baseColor?.value);
  }
  if (els.clearFaceColorBtn) els.clearFaceColorBtn.disabled = !face || !color;
  if (els.averageFaceColorBtn) els.averageFaceColorBtn.disabled = !face || !currentSelectedFaceImage(face);
}

function currentSelectedFaceImage(face = selectedFace()) {
  const key = cleanBitmapKey(face?.bitmapFaceKey);
  if (!key) return null;
  return state.faceSkinImages?.[key]?.naturalWidth ? state.faceSkinImages[key] : null;
}

function setSelectedFaceColor(value, message = "FACE COLOUR UPDATED.") {
  const face = selectedFace();
  if (!face) {
    setStatus("SELECT A FACE FIRST.");
    return;
  }
  const color = optionalHexColor(value);
  if (!color) {
    setStatus("CHOOSE A VALID FACE COLOUR.");
    updateFaceColorControls();
    return;
  }
  face.faceColor = color;
  if (mirrorActionsEnabled()) syncMirroredFace(face);
  setStatus(message);
  renderAll();
}

function clearSelectedFaceColor() {
  const face = selectedFace();
  if (!face) return setStatus("SELECT A FACE FIRST.");
  delete face.faceColor;
  if (mirrorActionsEnabled()) syncMirroredFace(face);
  setStatus(`FACE #${face.id} COLOUR CLEARED; BUILD WILL USE BITMAP AVERAGE WHEN AVAILABLE.`);
  renderAll();
}

function useSelectedFaceBitmapAverage() {
  const face = selectedFace();
  if (!face) return setStatus("SELECT A FACE FIRST.");
  const img = currentSelectedFaceImage(face);
  const color = averageImageColor(img);
  if (!color) return setStatus("NO LOADED FACE BITMAP TO SAMPLE.");
  setSelectedFaceColor(color, `FACE #${face.id} COLOUR SET FROM BITMAP AVERAGE (${color}).`);
}

function setSelectedFaceMirrorX(enabled) {
  const face = selectedFace();
  if (!face || !cleanBitmapKey(face.bitmapFaceKey)) return false;
  if (enabled) face.bitmapMirrorX = true;
  else delete face.bitmapMirrorX;
  if (mirrorActionsEnabled()) syncMirroredFace(face);
  markPreviewSkinsDirty();
  updateFaceUvAngleControls();
  setStatus(`FACE #${face.id} ${enabled ? "USES" : "CLEARED"} MIRRORED HALF UV.`);
  renderAll();
  return true;
}

function setFaceDecalControlValues(decal) {
  if (els.faceDecalX) els.faceDecalX.value = String(decal?.x ?? .5);
  if (els.faceDecalY) els.faceDecalY.value = String(decal?.y ?? .5);
  if (els.faceDecalScale) els.faceDecalScale.value = String(decal?.scale ?? .35);
  if (els.faceDecalAngle) els.faceDecalAngle.value = String(Math.round(decal?.angle || 0));
  if (els.faceDecalAlpha) els.faceDecalAlpha.value = String(decal?.alpha ?? .92);
}

function updateFaceDecalControls(preferredIndex = null) {
  const face = selectedFace();
  const decals = selectedFaceDecals(face);
  const previousValue = els.faceDecalSelector?.value || "";
  const selectedValue = preferredIndex == null ? previousValue : String(preferredIndex);
  const uiKey = JSON.stringify({
    faceId: face?.id || null,
    decals,
    selectedValue,
    hasFace: !!face
  });
  if (preferredIndex == null && state.faceDecalUiKey === uiKey) return;
  state.faceDecalUiKey = uiKey;
  const selector = els.faceDecalSelector;
  if (selector) {
    selector.replaceChildren();
    if (!decals.length) {
      const option = document.createElement("option");
      option.value = "";
      option.textContent = face ? "No face decals" : "Select a face";
      selector.append(option);
    } else {
      decals.forEach((decal, index) => {
        const option = document.createElement("option");
        option.value = String(index);
        option.textContent = `${index + 1}: ${decal.key}`;
        selector.append(option);
      });
      const current = Number(selectedValue);
      selector.value = String(clamp(current >= 0 ? current : 0, 0, decals.length - 1));
    }
  }
  const decal = selectedFaceDecal(face);
  setFaceDecalControlValues(decal);
  const enabled = !!decal;
  for (const control of [
    els.faceDecalSelector,
    els.faceDecalX,
    els.faceDecalY,
    els.faceDecalScale,
    els.faceDecalAngle,
    els.faceDecalAlpha,
    els.removeFaceDecalBtn,
    els.clearFaceDecalsBtn
  ]) {
    if (control) control.disabled = !face || (control !== els.clearFaceDecalsBtn && !enabled);
  }
}

function setSelectedFaceUvAngle(value, redraw = true, statusText = "") {
  const face = selectedFace();
  if (!face) {
    setStatus("SELECT A FACE FIRST.");
    updateFaceUvAngleControls();
    return false;
  }
  const angle = normalizeBitmapAngle(value);
  if (angle) face.bitmapAngle = angle;
  else delete face.bitmapAngle;
  if (mirrorActionsEnabled()) syncMirroredFace(face);
  setUvAngleInputs(angle);
  markPreviewSkinsDirty();
  if (statusText) setStatus(statusText);
  if (redraw) renderAll();
  return true;
}

function rotateSelectedFaceUvAngle(delta) {
  const face = selectedFace();
  const current = normalizeBitmapAngle(face ? face.bitmapAngle : 0);
  const next = normalizeBitmapAngle(current + Number(delta || 0));
  setSelectedFaceUvAngle(next, true, `FACE UV ANGLE ${next} DEGREES.`);
}

function skinAngleMetaValue(meta = {}) {
  const angle = meta.imageDecalAngle;
  if (Number.isFinite(angle)) return angle;
  if (angle && typeof angle === "object") {
    for (const side of ["top", "bottom", "back"]) {
      if (Number.isFinite(angle[side])) return angle[side];
    }
  }
  return 0;
}

function rotateTemplatePoint(p, width, height, angleDeg) {
  if (!angleDeg) return p;
  const a = angleDeg * Math.PI / 180;
  const c = Math.cos(a), s = Math.sin(a);
  const cx = width / 2, cy = height / 2;
  const dx = p.x - cx, dy = p.y - cy;
  return { x: cx + dx * c - dy * s, y: cy + dx * s + dy * c };
}

function mirroredTemplateU(u, foldX = TEMPLATE_SIZE / 2) {
  return clamp(foldX - Math.abs(foldX - u), 0, foldX);
}

function emptyMirrorFlags(value = false) {
  return { top: !!value, bottom: !!value, back: !!value };
}

function mirrorFlagsFromMeta(meta = {}) {
  const flags = meta.imageDecalMirrorX;
  if (flags === true) return emptyMirrorFlags(true);
  if (!flags || typeof flags !== "object") return emptyMirrorFlags(false);
  return {
    top: !!flags.top,
    bottom: !!flags.bottom,
    back: !!flags.back
  };
}

function emptySkinBundle(modelId = "", mirrorX = emptyMirrorFlags(false)) {
  return {
    modelId,
    top: null,
    bottom: null,
    back: null,
    mirrorX: { ...emptyMirrorFlags(false), ...mirrorX },
    source: { top: "", bottom: "", back: "" },
    urls: { top: "", bottom: "", back: "" },
    loaded: 0,
    failed: 0
  };
}

function skinSideMirrorX(side) {
  return !!state.skinImages?.mirrorX?.[side];
}

function currentModelMirrorFlags() {
  return mirrorFlagsFromMeta(gameLibrary()[templateShipId()]?.gameMeta || {});
}

function revokeSkinUrls(bundle = state.skinImages) {
  if (!bundle?.urls) return;
  for (const url of Object.values(bundle.urls)) {
    if (url) URL.revokeObjectURL(url);
  }
}

function revokeFaceSkinUrls() {
  for (const url of Object.values(state.faceSkinUrls || {})) {
    if (url) URL.revokeObjectURL(url);
  }
  state.faceSkinUrls = {};
}

function faceSkinCount() {
  return Object.values(state.faceSkinImages || {}).filter((img) => img?.complete && img.naturalWidth).length;
}

function markPreviewSkinsDirty() {
  state.previewSkinVersion = Math.max(Date.now(), (state.previewSkinVersion || 0) + 1);
}

function updateSkinReadout() {
  if (!els.skinReadout) return;
  const skin = state.skinImages;
  if (!skin?.modelId) {
    els.skinReadout.textContent = "No skin bitmaps loaded.";
    return;
  }
  const loaded = ["top", "bottom", "back"]
    .filter((side) => skin[side]?.complete && skin[side].naturalWidth)
    .map((side) => {
      const suffix = skin.source?.[side] === "imported" || skin.source?.[side] === "shelf" ? "*" : "";
      const mirror = skinSideMirrorX(side) ? " HALF" : "";
      return `${side.toUpperCase()} ${skin[side].naturalWidth}x${skin[side].naturalHeight}${mirror}${suffix}`;
    });
  const missing = 3 - loaded.length;
  const faceCount = faceSkinCount();
  const note = Object.values(skin.source || {}).some((source) => source === "imported" || source === "shelf")
    || Object.values(state.faceSkinSources || {}).some((source) => source === "imported" || source === "shelf")
    ? " *LOCAL" : "";
  els.skinReadout.textContent = `${skin.modelId.toUpperCase()} SKINS: ${loaded.length ? loaded.join(" / ") : "LOADING"}${faceCount ? ` / FACE ${faceCount}` : ""}${missing ? ` (${missing} missing/loading)` : ""}${note}`;
}

function skinPath(modelId, side) {
  return cacheBust(`../../assets/skins/${modelId}-${side}.png`);
}

function faceSkinPath(modelId, key) {
  return cacheBust(`../../assets/skins/${modelId}-face-${key}.png`);
}

function decalAssetPath(key) {
  const asset = state.toolServer.skins.find((item) => item.kind === "decal" && item.key === key);
  return asset?.url ? cacheBust(asset.url) : cacheBust(`../../assets/decals/${key}.png`);
}

function clearSkinBitmaps() {
  revokeSkinUrls();
  revokeFaceSkinUrls();
  state.skinImages = emptySkinBundle();
  state.faceSkinImages = {};
  state.faceSkinSources = {};
  state.decalImages = {};
  markPreviewSkinsDirty();
  updateSkinReadout();
  renderAll();
}

function loadSkinBitmaps(modelId = templateShipId(), mirrorX = null) {
  const cleanId = String(modelId || "").trim().replace(/[^a-zA-Z0-9_-]+/g, "_");
  if (!cleanId) return clearSkinBitmaps();
  revokeSkinUrls();
  revokeFaceSkinUrls();
  const bundle = emptySkinBundle(cleanId, mirrorX || mirrorFlagsFromMeta(gameLibrary()[cleanId]?.gameMeta || {}));
  state.skinImages = bundle;
  state.faceSkinImages = {};
  state.faceSkinSources = {};
  state.decalImages = {};
  markPreviewSkinsDirty();
  updateSkinReadout();
  for (const side of ["top", "bottom", "back"]) {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      if (state.skinImages !== bundle) return;
      bundle.loaded++;
      bundle.source[side] = "asset";
      markPreviewSkinsDirty();
      updateSkinReadout();
      renderAll();
    };
    img.onerror = () => {
      if (state.skinImages !== bundle) return;
      bundle.failed++;
      updateSkinReadout();
    };
    img.src = skinPath(cleanId, side);
    bundle[side] = img;
  }
  const faceKeys = [...new Set(state.faces.map((face) => cleanBitmapKey(face.bitmapFaceKey)).filter(Boolean))];
  for (const key of faceKeys) {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      if (state.skinImages !== bundle) return;
      state.faceSkinSources[key] = "asset";
      markPreviewSkinsDirty();
      updateSkinReadout();
      renderAll();
    };
    img.onerror = () => {
      if (state.skinImages !== bundle) return;
      delete state.faceSkinImages[key];
      updateSkinReadout();
    };
    img.src = faceSkinPath(cleanId, key);
    state.faceSkinImages[key] = img;
  }
  const decalKeys = [...new Set(state.faces.flatMap((face) => cleanFaceDecals(face.bitmapDecals).map((decal) => decal.key)))];
  for (const key of decalKeys) loadDecalImage(key);
}

function bitmapShelfItemById(id) {
  return state.bitmapShelf.find((entry) => entry.id === id) || null;
}

function selectedBitmapShelfItem() {
  return bitmapShelfItemById(state.selectedBitmapShelfId) || bitmapShelfItemById(els.bitmapShelfSelector?.value);
}

function bitmapShelfItemKind(item) {
  if (!item) return "";
  if (item.source === "imported") return "imported";
  return item.asset?.kind || "other";
}

function bitmapShelfItemCategory(item) {
  if (item?.source === "imported") return "imported";
  return item?.asset?.category || "other";
}

function bitmapShelfItemModel(item) {
  return item?.asset?.model || "";
}

function bitmapShelfItemTarget(item) {
  if (!item) return "";
  if (item.source === "imported") return "import";
  if (item.asset?.kind === "face") return "face";
  if (item.asset?.kind === "side") return item.asset.side || "side";
  return item.asset?.kind || "other";
}

function bitmapShelfItemTitle(item) {
  if (!item) return "UV asset";
  if (item.source === "imported") return item.name || "Imported UV";
  if (item.asset?.kind === "face") return item.asset.key || item.name || "face";
  if (item.asset?.kind === "decal") return item.asset.key || item.name || "decal";
  if (item.asset?.kind === "side") return item.asset.side || item.name || "side";
  return item.name || item.asset?.file || "UV asset";
}

function bitmapShelfItemMeta(item) {
  if (!item) return "";
  const dims = item.img?.naturalWidth && item.img?.naturalHeight
    ? `${item.img.naturalWidth}x${item.img.naturalHeight}`
    : "";
  if (item.source === "imported") return ["Imported", dims].filter(Boolean).join(" | ");
  const shared = Array.isArray(item.asset?.aliases) && item.asset.aliases.length > 1
    ? `shared x${item.asset.aliases.length}`
    : "";
  const models = Array.isArray(item.asset?.aliases)
    ? [...new Set(item.asset.aliases.map((asset) => asset.model).filter(Boolean))].join(", ")
    : item.asset?.model || "shared";
  const bits = [
    models || "shared",
    bitmapShelfItemTarget(item).toUpperCase(),
    shared,
    dims
  ].filter(Boolean);
  return bits.join(" | ");
}

function bitmapShelfItemSearchText(item) {
  return [
    item?.name,
    item?.source,
    item?.asset?.file,
    item?.asset?.model,
    item?.asset?.kind,
    item?.asset?.key,
    item?.asset?.side,
    item?.asset?.category,
    ...(Array.isArray(item?.asset?.aliases)
      ? item.asset.aliases.flatMap((asset) => [asset.file, asset.model, asset.key, asset.side, asset.category])
      : [])
  ].filter(Boolean).join(" ").toLowerCase();
}

function bitmapShelfFilters() {
  return {
    category: els.assetShelfCategory?.value || "all",
    kind: els.assetShelfKind?.value || "all",
    model: els.assetShelfModel?.value || "all",
    query: (els.assetShelfSearch?.value || "").trim().toLowerCase()
  };
}

function bitmapShelfItemMatchesFilters(item, filters = bitmapShelfFilters()) {
  if (!item) return false;
  if (filters.category !== "all" && bitmapShelfItemCategory(item) !== filters.category) return false;
  const kind = bitmapShelfItemKind(item);
  const target = bitmapShelfItemTarget(item);
  if (filters.kind === "imported" && item.source !== "imported") return false;
  if (filters.kind === "face" && kind !== "face") return false;
  if (filters.kind === "side" && kind !== "side") return false;
  if (filters.kind === "decal" && kind !== "decal") return false;
  if (["top", "bottom", "back"].includes(filters.kind) && target !== filters.kind) return false;
  if (filters.model === "current") {
    const model = bitmapShelfItemModel(item);
    if (model && model !== templateShipId()) return false;
  } else if (filters.model !== "all") {
    if (bitmapShelfItemModel(item) !== filters.model) return false;
  }
  if (filters.query && !bitmapShelfItemSearchText(item).includes(filters.query)) return false;
  return true;
}

function skinAssetMatchesFilters(asset, filters = bitmapShelfFilters()) {
  if (!asset) return false;
  if (filters.category !== "all" && asset.category !== filters.category) return false;
  if (filters.kind === "imported") return false;
  if (filters.kind === "face" && asset.kind !== "face") return false;
  if (filters.kind === "side" && asset.kind !== "side") return false;
  if (filters.kind === "decal" && asset.kind !== "decal") return false;
  if (["top", "bottom", "back"].includes(filters.kind) && asset.side !== filters.kind) return false;
  if (filters.model === "current" && asset.model && asset.model !== templateShipId()) return false;
  if (filters.model !== "all" && filters.model !== "current" && asset.model !== filters.model) return false;
  if (filters.query) {
    const text = [asset.file, asset.model, asset.kind, asset.key, asset.side, asset.category]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    if (!text.includes(filters.query)) return false;
  }
  return true;
}

function shelfHasAsset(asset) {
  if (!asset?.file) return false;
  return state.bitmapShelf.some((item) => {
    if (item.asset?.file === asset.file) return true;
    return Array.isArray(item.asset?.aliases) && item.asset.aliases.some((alias) => alias.file === asset.file);
  });
}

function assetAliasSummary(asset) {
  return {
    file: asset.file,
    model: asset.model,
    kind: asset.kind,
    key: asset.key,
    side: asset.side,
    category: asset.category,
    bytes: asset.bytes,
    hash: asset.hash,
    url: asset.url
  };
}

function skinAssetDuplicateGroupKey(asset) {
  if (!asset?.hash || asset.kind === "decal") return "";
  const target = asset.kind === "face"
    ? `face:${asset.key || ""}`
    : asset.kind === "side"
      ? `side:${asset.side || ""}`
      : asset.kind || "other";
  return `${target}:${asset.hash}`;
}

function collapseDuplicateSkinAssets(assets) {
  const groups = new Map();
  const passthrough = [];
  for (const asset of assets) {
    const key = skinAssetDuplicateGroupKey(asset);
    if (!key) {
      passthrough.push(asset);
      continue;
    }
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(asset);
  }
  const currentModel = templateShipId();
  const collapsed = [...groups.values()].map((group) => {
    const sorted = [...group].sort((a, b) => {
      const aCurrent = a.model === currentModel ? 0 : 1;
      const bCurrent = b.model === currentModel ? 0 : 1;
      return aCurrent - bCurrent || a.file.localeCompare(b.file);
    });
    if (sorted.length === 1) return sorted[0];
    const aliases = sorted.map(assetAliasSummary);
    return {
      ...sorted[0],
      aliases,
      duplicateCount: sorted.length,
      duplicateFiles: aliases.map((asset) => asset.file)
    };
  });
  return [...collapsed, ...passthrough].sort((a, b) => (a.file || "").localeCompare(b.file || ""));
}

function updateSelectedBitmapReadout() {
  const item = selectedBitmapShelfItem();
  if (!item) {
    if (els.selectedBitmapReadout) {
      els.selectedBitmapReadout.textContent = state.bitmapShelf.length
        ? "No UV selected."
        : "Load project UVs or add PNGs to start.";
    }
    if (els.selectedAssetThumb) {
      els.selectedAssetThumb.removeAttribute("src");
      els.selectedAssetThumb.classList.add("is-empty");
    }
    if (els.selectedAssetTitle) els.selectedAssetTitle.textContent = "No asset selected";
    if (els.selectedAssetMeta) els.selectedAssetMeta.textContent = "Open the library to choose a UV or decal.";
    return;
  }
  const face = selectedFace();
  const target = face ? `FACE #${face.id}` : "NO FACE SELECTED";
  const title = bitmapShelfItemTitle(item);
  const meta = bitmapShelfItemMeta(item);
  if (els.selectedBitmapReadout) {
    els.selectedBitmapReadout.textContent = `${title} | ${meta} | TARGET ${target}`;
  }
  if (els.selectedAssetThumb) {
    els.selectedAssetThumb.src = item.img?.currentSrc || item.img?.src || item.asset?.url || "";
    els.selectedAssetThumb.classList.remove("is-empty");
  }
  if (els.selectedAssetTitle) els.selectedAssetTitle.textContent = title;
  if (els.selectedAssetMeta) els.selectedAssetMeta.textContent = `${meta} | ${target}`;
}

function bitmapShelfItemBelongsToCurrentModel(item) {
  return item?.source === "asset" && skinAssetBelongsToCurrentModel(item.asset);
}

function bitmapShelfItemIsLocal(item) {
  return item && item.source !== "asset";
}

function bitmapShelfSharedItems() {
  const filters = bitmapShelfFilters();
  return state.bitmapShelf.filter((item) => item.source === "asset" && bitmapShelfItemMatchesFilters(item, filters));
}

function renderBitmapAssetCard(item, selectedId) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `bitmap-asset-card${item.id === selectedId ? " selected" : ""}`;
  button.dataset.shelfId = item.id;
  button.title = item.name || item.asset?.file || "UV asset";

  const thumb = document.createElement("span");
  thumb.className = "bitmap-asset-thumb";
  const img = document.createElement("img");
  img.alt = "";
  img.decoding = "async";
  img.src = item.img?.currentSrc || item.img?.src || item.asset?.url || "";
  thumb.append(img);

  const title = document.createElement("span");
  title.className = "bitmap-asset-title";
  title.textContent = bitmapShelfItemTitle(item);

  const meta = document.createElement("span");
  meta.className = "bitmap-asset-meta";
  meta.textContent = bitmapShelfItemMeta(item);

  const tag = document.createElement("span");
  tag.className = `bitmap-asset-tag bitmap-asset-tag-${bitmapShelfItemTarget(item)}`;
  tag.textContent = bitmapShelfItemTarget(item).toUpperCase();

  button.append(thumb, title, meta, tag);
  if (item.source === "asset" && item.asset?.file) {
    const replaceBtn = document.createElement("span");
    replaceBtn.className = "bitmap-asset-replace";
    replaceBtn.dataset.replaceAssetId = item.id;
    replaceBtn.title = `Replace ${item.asset.file}`;
    replaceBtn.textContent = "RPL";
    button.append(replaceBtn);

    const deleteBtn = document.createElement("span");
    deleteBtn.className = "bitmap-asset-delete";
    deleteBtn.dataset.deleteAssetId = item.id;
    deleteBtn.title = `Delete ${item.asset.file}`;
    deleteBtn.textContent = "DEL";
    button.append(deleteBtn);
  }
  return button;
}

function renderBitmapAssetGrid(grid, items, selectedId, emptyText) {
  if (!grid) return;
  grid.replaceChildren();
  if (!items.length) {
    const empty = document.createElement("div");
    empty.className = "bitmap-asset-empty";
    empty.textContent = emptyText;
    grid.append(empty);
    return;
  }
  for (const item of items) {
    grid.append(renderBitmapAssetCard(item, selectedId));
  }
}

function updateBitmapAssetGrid() {
  const selectedId = state.selectedBitmapShelfId || els.bitmapShelfSelector?.value || "";
  const currentItems = state.bitmapShelf.filter(bitmapShelfItemBelongsToCurrentModel);
  const localItems = state.bitmapShelf.filter(bitmapShelfItemIsLocal);
  const sharedItems = bitmapShelfSharedItems();
  const activeSelectedId = bitmapShelfItemById(selectedId) ? selectedId : "";
  renderBitmapAssetGrid(
    els.currentBitmapAssetGrid,
    currentItems,
    activeSelectedId,
    "No current ship UVs loaded. Use Load Current Ship UVs."
  );
  renderBitmapAssetGrid(
    els.localBitmapAssetGrid,
    localItems,
    activeSelectedId,
    "No loaded unsaved PNGs."
  );
  renderBitmapAssetGrid(
    els.bitmapAssetGrid,
    sharedItems,
    activeSelectedId,
    state.bitmapShelf.some((item) => item.source === "asset") ? "No shared UVs match these filters." : "No shared UV thumbnails loaded."
  );
  if (!activeSelectedId && state.bitmapShelf[0] && els.bitmapShelfSelector) {
    state.selectedBitmapShelfId = state.bitmapShelf[0].id;
    els.bitmapShelfSelector.value = state.bitmapShelf[0].id;
    updateBitmapAssetGrid();
    return;
  }
  updateSelectedBitmapReadout();
}

function selectBitmapShelfItem(id) {
  if (!els.bitmapShelfSelector || !id) return;
  state.selectedBitmapShelfId = id;
  els.bitmapShelfSelector.value = id;
  updateBitmapAssetGrid();
  updateSelectedBitmapReadout();
}

function populateAssetModelSelector(skins = state.toolServer.skins) {
  if (!els.assetShelfModel) return;
  const current = els.assetShelfModel.value || "all";
  const models = [...new Set([
    ...skins.map((skin) => skin.model).filter(Boolean),
    ...state.bitmapShelf.map((item) => item.asset?.model).filter(Boolean)
  ])].sort((a, b) => a.localeCompare(b));
  els.assetShelfModel.innerHTML = "";
  const base = [
    ["all", "All models"],
    ["current", "Current model"]
  ];
  for (const [value, label] of base) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    els.assetShelfModel.append(option);
  }
  for (const model of models) {
    const option = document.createElement("option");
    option.value = model;
    option.textContent = model;
    els.assetShelfModel.append(option);
  }
  if ([...els.assetShelfModel.options].some((option) => option.value === current)) {
    els.assetShelfModel.value = current;
  }
}

function updateBitmapShelfSelector() {
  if (!els.bitmapShelfSelector) return;
  const current = els.bitmapShelfSelector.value;
  els.bitmapShelfSelector.innerHTML = "";
  if (!state.bitmapShelf.length) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "No imported bitmaps";
    els.bitmapShelfSelector.append(option);
    updateBitmapAssetGrid();
    return;
  }
  for (const item of state.bitmapShelf) {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = `${item.name} (${item.img.naturalWidth}x${item.img.naturalHeight})`;
    els.bitmapShelfSelector.append(option);
  }
  if (current && bitmapShelfItemById(current)) els.bitmapShelfSelector.value = current;
  if (state.selectedBitmapShelfId && !bitmapShelfItemById(state.selectedBitmapShelfId)) state.selectedBitmapShelfId = "";
  if (!state.selectedBitmapShelfId && current && bitmapShelfItemById(current)) state.selectedBitmapShelfId = current;
  updateBitmapAssetGrid();
}

function addBitmapToShelf(file, img, url) {
  const id = `bitmap_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  state.bitmapShelf.push({ id, name: file.name || "imported bitmap", img, url, source: "imported" });
  updateBitmapShelfSelector();
  selectBitmapShelfItem(id);
  return id;
}

function addBitmapAssetToShelf(asset) {
  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      const id = `asset_${asset.file}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
      const label = asset.kind === "face"
        ? `${asset.category}/${asset.model} face ${asset.key}`
        : asset.kind === "decal"
          ? `decal/${asset.key}`
          : `${asset.category}/${asset.model} ${asset.side}`;
      if (asset.kind === "decal" && asset.key) state.decalImages[asset.key] = img;
      state.bitmapShelf.push({
        id,
        name: label,
        img,
        url: "",
        source: "asset",
        asset
      });
      resolve(true);
    };
    img.onerror = () => resolve(false);
    img.src = cacheBust(asset.url);
  });
}

function assetAliasForCurrentModel(asset) {
  if (!asset || !Array.isArray(asset.aliases)) return asset;
  const currentModel = templateShipId();
  return asset.aliases.find((alias) => alias.model === currentModel) || asset;
}

function skinAssetBelongsToCurrentModel(asset) {
  const currentModel = templateShipId();
  if (!asset || !currentModel) return false;
  if (asset.model === currentModel) return true;
  return Array.isArray(asset.aliases) && asset.aliases.some((alias) => alias.model === currentModel);
}

function populateAssetCategorySelector(categories = []) {
  if (!els.assetShelfCategory) return;
  const current = els.assetShelfCategory.value || "all";
  const options = ["all", "imported", ...categories.filter((cat) => cat && cat !== "all" && cat !== "imported")];
  els.assetShelfCategory.innerHTML = "";
  for (const category of options) {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category === "all"
      ? "All assets"
      : category === "imported"
        ? "Imported"
        : category;
    els.assetShelfCategory.append(option);
  }
  if (options.includes(current)) els.assetShelfCategory.value = current;
}

async function refreshAvailableSkinAssets() {
  if (!await requireToolServer()) return null;
  const data = await apiJson("/api/skins", { method: "GET" });
  state.toolServer.skins = Array.isArray(data.skins) ? data.skins : [];
  populateAssetCategorySelector(data.categories || []);
  populateAssetModelSelector(state.toolServer.skins);
  return state.toolServer.skins;
}

async function loadAssetShelf() {
  try {
    const skins = await refreshAvailableSkinAssets();
    if (!skins) return;
    const filters = bitmapShelfFilters();
    const selected = collapseDuplicateSkinAssets(skins.filter((skin) => skinAssetMatchesFilters(skin, filters)));
    let loaded = 0;
    let skipped = 0;
    for (const asset of selected) {
      if (shelfHasAsset(asset)) {
        skipped++;
        continue;
      }
      if (await addBitmapAssetToShelf(asset)) loaded++;
    }
    updateBitmapShelfSelector();
    if (!selectedBitmapShelfItem() && state.bitmapShelf[0]) selectBitmapShelfItem(state.bitmapShelf[0].id);
    const skippedText = skipped ? `, ${skipped} ALREADY LOADED` : "";
    setStatus(`${loaded} MATCHING UV${loaded === 1 ? "" : "S"} LOADED${skippedText}.`);
  } catch (error) {
    setStatus(`ASSET SHELF LOAD FAILED: ${error.message}`);
  }
}

async function loadCurrentShipAssets() {
  try {
    const skins = await refreshAvailableSkinAssets();
    if (!skins) return;
    const selected = collapseDuplicateSkinAssets(skins.filter(skinAssetBelongsToCurrentModel));
    let loaded = 0;
    let skipped = 0;
    for (const asset of selected) {
      if (shelfHasAsset(asset)) {
        skipped++;
        continue;
      }
      if (await addBitmapAssetToShelf(asset)) loaded++;
    }
    updateBitmapShelfSelector();
    const firstCurrent = state.bitmapShelf.find(bitmapShelfItemBelongsToCurrentModel);
    if (firstCurrent) selectBitmapShelfItem(firstCurrent.id);
    const skippedText = skipped ? `, ${skipped} ALREADY LOADED` : "";
    setStatus(`${loaded} CURRENT SHIP UV${loaded === 1 ? "" : "S"} LOADED${skippedText}.`);
  } catch (error) {
    setStatus(`CURRENT SHIP UV LOAD FAILED: ${error.message}`);
  }
}

function currentModelUsageForAsset(asset) {
  const currentAsset = assetAliasForCurrentModel(asset);
  const modelId = templateShipId();
  if (!currentAsset || !modelId) return null;
  const faces = state.faces || [];
  let count = 0;
  if (currentAsset.kind === "face" && currentAsset.model === modelId) {
    count = faces.filter((face) => cleanBitmapKey(face.bitmapFaceKey) === currentAsset.key).length;
  } else if (currentAsset.kind === "side" && currentAsset.model === modelId) {
    count = faces.filter((face) => !cleanBitmapKey(face.bitmapFaceKey)).length;
  } else if (currentAsset.kind === "decal") {
    count = faces.reduce((sum, face) => {
      const decals = cleanFaceDecals(face.bitmapDecals);
      return sum + decals.filter((decal) => cleanBitmapKey(decal.key) === currentAsset.key).length;
    }, 0);
  }
  if (!count) return null;
  return {
    id: modelId,
    name: `${els.shipName.value.trim() || modelId} (current unsaved Builder model)`,
    file: "in memory",
    count,
    current: true
  };
}

function mergeAssetUsage(savedUsage = [], currentUsage = null) {
  const merged = Array.isArray(savedUsage) ? savedUsage.map((entry) => ({ ...entry })) : [];
  if (currentUsage) {
    const existing = merged.find((entry) => entry.id === currentUsage.id && entry.file !== "in memory");
    if (existing) existing.currentCount = currentUsage.count;
    else merged.unshift(currentUsage);
  }
  return merged;
}

function assetUsageLine(entry) {
  const bits = [`${entry.name || entry.id || "Unknown model"}`];
  if (entry.current) bits.push("current Builder model");
  else if (entry.currentCount) bits.push(`current Builder model ${entry.currentCount}`);
  if (Number.isFinite(Number(entry.count)) && entry.count > 0) bits.push(`${entry.count} reference${entry.count === 1 ? "" : "s"}`);
  if (entry.file && entry.file !== "in memory") bits.push(entry.file);
  return `- ${bits.join(" | ")}`;
}

async function assetUsageForConfirmation(asset) {
  const currentUsage = currentModelUsageForAsset(asset);
  const usageResult = await apiJson(`/api/skins/usage?file=${encodeURIComponent(asset.file)}`, { method: "GET" });
  return mergeAssetUsage(usageResult.usage, currentUsage);
}

function replacementMimeAllowed(asset, file) {
  const ext = String(asset?.file || "").split(".").pop()?.toLowerCase() || "";
  if (ext === "png") return file.type === "image/png";
  if (ext === "jpg" || ext === "jpeg") return file.type === "image/jpeg";
  if (ext === "svg") return file.type === "image/svg+xml";
  return file.type.startsWith("image/");
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Replacement image could not be read."));
    reader.readAsDataURL(file);
  });
}

let pendingReplaceAssetId = "";

function beginReplaceBitmapAsset(itemId) {
  const item = bitmapShelfItemById(itemId);
  if (!item?.asset?.file) {
    setStatus("SELECT A PROJECT ASSET TO REPLACE.");
    return;
  }
  pendingReplaceAssetId = itemId;
  if (els.replaceAssetInput) {
    els.replaceAssetInput.value = "";
    els.replaceAssetInput.click();
  }
}

function clearCurrentModelDeletedAssetReferences(asset) {
  const currentAsset = assetAliasForCurrentModel(asset);
  const modelId = templateShipId();
  if (!currentAsset || !modelId) return;
  let changed = false;
  if (currentAsset.kind === "face" && currentAsset.model === modelId) {
    for (const face of state.faces) {
      if (cleanBitmapKey(face.bitmapFaceKey) !== currentAsset.key) continue;
      delete face.bitmapFaceKey;
      delete face.bitmapUv;
      delete face.bitmapBaseW;
      delete face.bitmapBaseH;
      delete face.bitmapAngle;
      delete face.bitmapMirrorX;
      changed = true;
    }
  } else if (currentAsset.kind === "side" && currentAsset.model === modelId) {
    clearSkinSide(currentAsset.side);
    for (const face of state.faces) {
      if (face.bitmapSide !== currentAsset.side) continue;
      delete face.bitmapSide;
      changed = true;
    }
  } else if (currentAsset.kind === "decal") {
    for (const face of state.faces) {
      const decals = cleanFaceDecals(face.bitmapDecals);
      const next = decals.filter((decal) => cleanBitmapKey(decal.key) !== currentAsset.key);
      if (next.length === decals.length) continue;
      if (next.length) face.bitmapDecals = next;
      else delete face.bitmapDecals;
      changed = true;
    }
  }
  if (!changed) return;
  markPreviewSkinsDirty();
  updateFaceUvAngleControls();
  updateFaceDecalControls();
  renderAll();
}

async function replaceBitmapAsset(itemId, file) {
  const item = bitmapShelfItemById(itemId);
  const asset = item?.asset;
  if (!asset?.file || !file) return;
  if (!replacementMimeAllowed(asset, file)) {
    setStatus(`REPLACEMENT TYPE MUST MATCH ${asset.file}.`);
    return;
  }
  if (!await requireToolServer()) return;
  try {
    const usage = await assetUsageForConfirmation(asset);
    const usageText = usage.length
      ? usage.map(assetUsageLine).join("\n")
      : "- No saved or current model references found.";
    const aliasText = Array.isArray(asset.aliases) && asset.aliases.length > 1
      ? `\n\nThis thumbnail groups ${asset.aliases.length} identical asset files. This will replace only:\n${asset.file}`
      : "";
    const ok = confirmWrite(`Replace asset file ${asset.file} with ${file.name}?${aliasText}\n\nThis will change the appearance of:\n${usageText}`);
    if (!ok) {
      setStatus("ASSET REPLACE CANCELLED.");
      return;
    }
    const dataUrl = await fileToDataUrl(file);
    setStatus(`REPLACING ${asset.file}...`);
    const result = await apiJson("/api/skins", {
      method: "PUT",
      body: JSON.stringify({ file: asset.file, dataUrl })
    });
    state.assetVersion = Date.now();
    state.bitmapShelf = state.bitmapShelf.filter((entry) => entry.asset?.file !== asset.file);
    updateBitmapShelfSelector();
    await refreshAvailableSkinAssets();
    setStatus(`ASSET REPLACED: ${result.replaced}.`);
  } catch (error) {
    setStatus(`ASSET REPLACE FAILED: ${error.message}`);
  }
}

async function deleteBitmapAsset(itemId) {
  const item = bitmapShelfItemById(itemId);
  const asset = item?.asset;
  if (!asset?.file) {
    setStatus("SELECT A PROJECT ASSET TO DELETE.");
    return;
  }
  if (!await requireToolServer()) return;
  try {
    const usage = await assetUsageForConfirmation(asset);
    const usageText = usage.length
      ? usage.map(assetUsageLine).join("\n")
      : "- No saved or current model references found.";
    const aliasText = Array.isArray(asset.aliases) && asset.aliases.length > 1
      ? `\n\nThis thumbnail groups ${asset.aliases.length} identical asset files. This will delete only:\n${asset.file}`
      : "";
    const ok = confirmWrite(`Delete asset file ${asset.file}?${aliasText}\n\nUsed in:\n${usageText}`);
    if (!ok) {
      setStatus("ASSET DELETE CANCELLED.");
      return;
    }
    setStatus(`DELETING ${asset.file}...`);
    const result = await apiJson("/api/skins", {
      method: "DELETE",
      body: JSON.stringify({ file: asset.file })
    });
    clearCurrentModelDeletedAssetReferences(asset);
    state.assetVersion = Date.now();
    state.bitmapShelf = state.bitmapShelf.filter((entry) => entry.asset?.file !== asset.file);
    if (state.selectedBitmapShelfId && !bitmapShelfItemById(state.selectedBitmapShelfId)) state.selectedBitmapShelfId = "";
    updateBitmapShelfSelector();
    await refreshAvailableSkinAssets();
    setStatus(`ASSET DELETED: ${result.deleted}.`);
  } catch (error) {
    setStatus(`ASSET DELETE FAILED: ${error.message}`);
  }
}

function clearBitmapShelf() {
  for (const item of state.bitmapShelf) {
    if (item.url) URL.revokeObjectURL(item.url);
  }
  state.bitmapShelf = [];
  state.selectedBitmapShelfId = "";
  updateBitmapShelfSelector();
  populateAssetModelSelector();
  setStatus("BITMAP SHELF CLEARED.");
}

function setSkinSideFromImage(side, img, source = "imported", url = "", mirrorX = importMirroredSkinEnabled()) {
  const oldUrl = state.skinImages.urls?.[side];
  if (oldUrl && oldUrl !== url) URL.revokeObjectURL(oldUrl);
  if (!state.skinImages?.modelId) {
    state.skinImages = emptySkinBundle(templateShipId());
  }
  if (!state.skinImages.mirrorX) state.skinImages.mirrorX = emptyMirrorFlags(false);
  state.skinImages[side] = img;
  state.skinImages.mirrorX[side] = mirrorX == null ? !!currentModelMirrorFlags()[side] : !!mirrorX;
  state.skinImages.source[side] = source;
  state.skinImages.urls[side] = url;
  markPreviewSkinsDirty();
  updateSkinReadout();
  renderAll();
}

function loadDecalImage(key, url = "") {
  const cleanKey = cleanBitmapKey(key);
  if (!cleanKey) return null;
  if (state.decalImages[cleanKey]?.naturalWidth) return state.decalImages[cleanKey];
  const img = new Image();
  img.decoding = "async";
  img.onload = () => {
    markPreviewSkinsDirty();
    renderAll();
  };
  img.onerror = () => {
    delete state.decalImages[cleanKey];
    updateFaceDecalControls();
  };
  img.src = cacheBust(url || decalAssetPath(cleanKey));
  state.decalImages[cleanKey] = img;
  return img;
}

function selectedFaceSkinKey(face) {
  if (!face) return "";
  const fallback = `face-${face.id}`;
  return cleanBitmapKey(face.bitmapFaceKey, fallback);
}

function faceSkinKeyUsage(key, excludeFace = null) {
  const cleanKey = cleanBitmapKey(key);
  if (!cleanKey) return 0;
  return state.faces.filter((face) => face !== excludeFace && cleanBitmapKey(face.bitmapFaceKey) === cleanKey).length;
}

function uniqueFaceSkinKey(face, preferred = "") {
  const base = cleanBitmapKey(preferred || `face-${face?.id || Date.now()}`, `face-${face?.id || Date.now()}`);
  if (!faceSkinKeyUsage(base, face)) return base;
  const faceSuffix = cleanBitmapKey(`${base}-${face?.id || "copy"}`, base);
  if (!faceSkinKeyUsage(faceSuffix, face)) return faceSuffix;
  let i = 2;
  while (faceSkinKeyUsage(`${faceSuffix}-${i}`, face)) i++;
  return `${faceSuffix}-${i}`;
}

function selectedFaceSkinTargetKey(face, options = {}) {
  const requested = cleanBitmapKey(options.key);
  if (requested) return options.shareKey ? requested : uniqueFaceSkinKey(face, requested);
  const current = selectedFaceSkinKey(face);
  // Face import/update is face-only by default; shared assets stay shared only when deliberately selected.
  return faceSkinKeyUsage(current, face) ? uniqueFaceSkinKey(face) : current;
}

function faceSkinKeyUsageOutsideGroup(key, faces) {
  const cleanKey = cleanBitmapKey(key);
  if (!cleanKey) return 0;
  const group = new Set(faces);
  return state.faces.filter((face) => !group.has(face) && cleanBitmapKey(face.bitmapFaceKey) === cleanKey).length;
}

function uniqueFaceGroupSkinKey(preferred, faces) {
  const base = cleanBitmapKey(preferred || `face_group_${Date.now()}`, `face_group_${Date.now()}`);
  if (!faceSkinKeyUsageOutsideGroup(base, faces)) return base;
  const suffix = cleanBitmapKey(`${base}-group`, base);
  if (!faceSkinKeyUsageOutsideGroup(suffix, faces)) return suffix;
  let i = 2;
  while (faceSkinKeyUsageOutsideGroup(`${suffix}-${i}`, faces)) i++;
  return `${suffix}-${i}`;
}

function bitmapItemPreferredFaceKey(item) {
  if (!item) return "";
  const asset = item.source === "asset" ? assetAliasForCurrentModel(item.asset) : null;
  if (asset?.kind === "face" && asset.key) return asset.key;
  if (asset?.model && asset?.side) return `${asset.model}_${asset.side}`;
  if (asset?.model && asset?.key) return `${asset.model}_${asset.key}`;
  const name = String(item.name || "face_group").replace(/\.[^.]+$/, "");
  return cleanBitmapKey(name, "face_group");
}

function faceGroupSkinTargetKey(faces, item, options = {}) {
  const requested = cleanBitmapKey(options.key || bitmapItemPreferredFaceKey(item));
  const asset = item?.source === "asset" ? assetAliasForCurrentModel(item.asset) : null;
  const sameModelFaceAsset = !!asset && asset.kind === "face" && asset.model === templateShipId();
  if (requested && (options.shareKey || sameModelFaceAsset)) return requested;
  const existing = [...new Set(faces.map((face) => cleanBitmapKey(face.bitmapFaceKey)).filter(Boolean))];
  if (!requested && existing.length === 1) return existing[0];
  return uniqueFaceGroupSkinKey(requested || existing[0] || "face_group", faces);
}

function uniqueFaceList(faces) {
  const seen = new Set();
  const out = [];
  for (const face of faces) {
    if (!face || seen.has(face.id)) continue;
    seen.add(face.id);
    out.push(face);
  }
  return out;
}

function faceGroupProjectionTargets(faces) {
  return uniqueFaceList(faces);
}

function applyCurrentViewGroupUv(faces, img) {
  const templateSide = activeProjectionViewName();
  if (["top", "bottom", "back"].includes(templateSide)) {
    const project = templateProjection(templateSide, "footprint");
    const baseW = project.width || TEMPLATE_SIZE;
    const baseH = project.height || TEMPLATE_SIZE;
    for (const face of faces) {
      face.bitmapSide = templateSide;
      face.bitmapUv = face.verts.map((id) => {
        const v = vertexById(id);
        const p = project(v || vec());
        return [round(p.x, 3), round(p.y, 3)];
      });
      face.bitmapBaseW = baseW;
      face.bitmapBaseH = baseH;
    }
    return true;
  }
  const verts = [];
  for (const face of faces) {
    for (const id of face.verts) {
      const v = vertexById(id);
      if (v) verts.push(rotatePoint(v));
    }
  }
  if (verts.length < 3) return false;
  const minX = Math.min(...verts.map((v) => v.x));
  const maxX = Math.max(...verts.map((v) => v.x));
  const minY = Math.min(...verts.map((v) => v.y));
  const maxY = Math.max(...verts.map((v) => v.y));
  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;
  const width = Math.max(1, Math.round(img?.naturalWidth || img?.width || TEMPLATE_SIZE));
  const height = Math.max(1, Math.round(img?.naturalHeight || img?.height || TEMPLATE_SIZE));
  for (const face of faces) {
    face.bitmapUv = face.verts.map((id) => {
      const v = vertexById(id);
      const p = rotatePoint(v || vec());
      return [round(((p.x - minX) / rangeX) * width, 3), round(((maxY - p.y) / rangeY) * height, 3)];
    });
    face.bitmapBaseW = width;
    face.bitmapBaseH = height;
  }
  return true;
}

function setSelectedFaceSkinFromImage(img, source = "imported", url = "", name = "bitmap", options = {}) {
  const face = selectedFace();
  if (!face) {
    if (url) URL.revokeObjectURL(url);
    setStatus("SELECT A FACE FIRST.");
    return;
  }
  const previousKey = cleanBitmapKey(face.bitmapFaceKey);
  const key = selectedFaceSkinTargetKey(face, options);
  const forked = previousKey && previousKey !== key;
  const mirrorX = options.mirrorX == null ? importMirroredSkinEnabled() : !!options.mirrorX;
  face.bitmapFaceKey = key;
  if (mirrorX) face.bitmapMirrorX = true;
  else delete face.bitmapMirrorX;
  const averageColor = averageImageColor(img);
  if (averageColor) face.faceColor = averageColor;
  if (mirrorActionsEnabled()) syncMirroredFace(face);
  if (state.faceSkinUrls[key] && state.faceSkinUrls[key] !== url) URL.revokeObjectURL(state.faceSkinUrls[key]);
  state.faceSkinImages[key] = img;
  state.faceSkinSources[key] = source;
  if (url) state.faceSkinUrls[key] = url;
  if (options.orientToView) {
    orientFaceToView(face, false, "");
  }
  markPreviewSkinsDirty();
  updateSkinReadout();
  updateFaceUvAngleControls();
  const angleText = options.orientToView ? ", FACE ORIENTED TO VIEW" : "";
  const colorText = averageColor ? `, COLOUR ${averageColor}` : "";
  const forkText = forked ? `, FACE-ONLY COPY OF ${previousKey}` : "";
  setStatus(`${name} APPLIED TO FACE #${face.id} AS ${key}${forkText}${mirrorX ? " AS MIRRORED HALF UV" : ""}${angleText}${colorText}. SAVE AS ${templateShipId()}-face-${key}.png TO MAKE PERMANENT.`);
  renderAll();
}

function setFaceGroupSkinFromImage(faces, img, source = "imported", url = "", name = "bitmap", options = {}) {
  const selectedTargets = uniqueFaceList(faces.filter(Boolean));
  if (!selectedTargets.length) {
    if (url) URL.revokeObjectURL(url);
    setStatus("SELECT ONE OR MORE FACES FIRST.");
    return;
  }
  const targets = faceGroupProjectionTargets(selectedTargets);
  const key = faceGroupSkinTargetKey(targets, options.item || null, options);
  const mirrorX = options.mirrorX == null ? importMirroredSkinEnabled() : !!options.mirrorX;
  const averageColor = averageImageColor(img);
  for (const face of targets) {
    delete face.bitmapSide;
    delete face.bitmapFaceKey;
    delete face.bitmapUv;
    delete face.bitmapBaseW;
    delete face.bitmapBaseH;
    delete face.bitmapAngle;
    delete face.bitmapMirrorX;
    face.bitmapFaceKey = key;
    if (mirrorX) face.bitmapMirrorX = true;
    else delete face.bitmapMirrorX;
    if (averageColor) face.faceColor = averageColor;
  }
  applyCurrentViewGroupUv(targets, img);
  if (state.faceSkinUrls[key] && state.faceSkinUrls[key] !== url) URL.revokeObjectURL(state.faceSkinUrls[key]);
  state.faceSkinImages[key] = img;
  state.faceSkinSources[key] = source;
  if (url) state.faceSkinUrls[key] = url;
  markPreviewSkinsDirty();
  updateSkinReadout();
  updateFaceUvAngleControls();
  const colorText = averageColor ? `, COLOUR ${averageColor}` : "";
  const mirrorText = targets.length !== selectedTargets.length ? ` (${targets.length - selectedTargets.length} MIRRORED)` : "";
  setStatus(`${name} APPLIED TO ${selectedTargets.length} FACE${selectedTargets.length === 1 ? "" : "S"}${mirrorText} AS ${key}${mirrorX ? " AS MIRRORED HALF UV" : ""}${colorText}. SAVE AS ${templateShipId()}-face-${key}.png TO MAKE PERMANENT.`);
  renderAll();
}

function clearSelectedFaceSkin() {
  const face = selectedFace();
  if (!face) {
    setStatus("SELECT A FACE FIRST.");
    return;
  }
  const key = cleanBitmapKey(face.bitmapFaceKey);
  delete face.bitmapFaceKey;
  delete face.bitmapUv;
  delete face.bitmapBaseW;
  delete face.bitmapBaseH;
  delete face.bitmapAngle;
  delete face.bitmapMirrorX;
  if (mirrorActionsEnabled()) syncMirroredFace(face);
  markPreviewSkinsDirty();
  updateFaceUvAngleControls();
  setStatus(key ? `FACE TEXTURE ${key} CLEARED FROM FACE #${face.id}.` : "SELECTED FACE HAS NO FACE TEXTURE.");
  renderAll();
}

function clearSelectedFacePaint() {
  const face = selectedFace();
  if (!face) return setStatus("SELECT A FACE FIRST.");
  const hadPaint =
    cleanBitmapKey(face.bitmapFaceKey) ||
    (Array.isArray(face.bitmapUv) && face.bitmapUv.length >= 3) ||
    validBitmapFaceSide(face.bitmapSide) ||
    normalizeBitmapAngle(face.bitmapAngle) ||
    face.bitmapMirrorX ||
    cleanFaceDecals(face.bitmapDecals).length ||
    optionalHexColor(face.faceColor);
  delete face.bitmapSide;
  delete face.bitmapFaceKey;
  delete face.bitmapUv;
  delete face.bitmapBaseW;
  delete face.bitmapBaseH;
  delete face.bitmapAngle;
  delete face.bitmapMirrorX;
  delete face.bitmapDecals;
  delete face.faceColor;
  if (mirrorActionsEnabled()) syncMirroredFace(face);
  markPreviewSkinsDirty();
  updateFaceUvAngleControls();
  updateFaceDecalControls();
  setStatus(hadPaint ? `FACE #${face.id} PAINT, UVS AND DECALS CLEARED.` : "SELECTED FACE HAD NO PAINT TO CLEAR.");
  renderAll();
}

function clearAllFaceUv() {
  const affected = state.faces.filter((face) =>
    cleanBitmapKey(face.bitmapFaceKey)
    || (Array.isArray(face.bitmapUv) && face.bitmapUv.length >= 3)
    || validBitmapFaceSide(face.bitmapSide)
    || normalizeBitmapAngle(face.bitmapAngle)
    || face.bitmapMirrorX
  );
  if (!affected.length) {
    setStatus("NO FACE UV ASSIGNMENTS TO CLEAR.");
    return;
  }
  const confirmClear = window.confirm(`Clear face UV assignments from ${affected.length} face${affected.length === 1 ? "" : "s"}?`);
  if (!confirmClear) return;
  for (const face of affected) {
    delete face.bitmapSide;
    delete face.bitmapFaceKey;
    delete face.bitmapUv;
    delete face.bitmapBaseW;
    delete face.bitmapBaseH;
    delete face.bitmapAngle;
    delete face.bitmapMirrorX;
  }
  if (mirrorActionsEnabled()) {
    for (const face of affected) syncMirroredFace(face);
  }
  markPreviewSkinsDirty();
  updateFaceUvAngleControls();
  setStatus(`${affected.length} FACE UV ASSIGNMENT${affected.length === 1 ? "" : "S"} CLEARED.`);
  renderAll();
}

function clearSkinSide(side) {
  if (!["top", "bottom", "back"].includes(side)) return;
  const img = state.skinImages?.[side];
  const url = state.skinImages?.urls?.[side];
  const hadSkin = !!img?.naturalWidth || !!url;
  if (url) URL.revokeObjectURL(url);
  if (!state.skinImages?.modelId) state.skinImages = emptySkinBundle(templateShipId());
  state.skinImages[side] = null;
  state.skinImages.source[side] = "";
  state.skinImages.urls[side] = "";
  if (state.skinImages.mirrorX) state.skinImages.mirrorX[side] = false;
  markPreviewSkinsDirty();
  updateSkinReadout();
  setStatus(hadSkin ? `${side.toUpperCase()} SKIN CLEARED FROM PREVIEW.` : `NO ${side.toUpperCase()} SKIN LOADED.`);
  renderAll();
}

function applyShelfBitmap(side) {
  const hadPickList = state.pick.length > 0;
  state.pick = [];
  const item = selectedBitmapShelfItem();
  if (!item) {
    setStatus("SELECT A UV THUMBNAIL FIRST.");
    if (hadPickList) renderAll();
    return;
  }
  const mirrored = importMirroredSkinEnabled();
  setSkinSideFromImage(side, item.img, "shelf", "", mirrored);
  setStatus(`${item.name} APPLIED TO ${side.toUpperCase()}${mirrored ? " AS MIRRORED HALF UV" : ""}${hadPickList ? "; PICK LIST CLEARED" : ""}.`);
}

function selectedShelfFaceTextureOptions(options = {}) {
  const item = selectedBitmapShelfItem();
  if (!item) {
    setStatus("SELECT A UV THUMBNAIL FIRST.");
    return null;
  }
  const asset = item.source === "asset" ? assetAliasForCurrentModel(item.asset) : null;
  const assetKey = asset?.kind === "face" ? cleanBitmapKey(asset.key) : "";
  const sameModelAsset = !!asset && asset.model === templateShipId();
  const source = sameModelAsset ? "asset" : item.source === "asset" ? "shelf" : "imported";
  return {
    item,
    img: item.img,
    source,
    name: item.name,
    options: {
      ...options,
      item,
      ...(assetKey ? { key: assetKey, shareKey: sameModelAsset } : {})
    }
  };
}

function applyShelfBitmapToSelectedFace(options = {}) {
  const texture = selectedShelfFaceTextureOptions(options);
  if (!texture) return;
  const faces = selectedFaceGroup();
  if (faces.length) {
    setFaceGroupSkinFromImage(faces, texture.img, texture.source, "", texture.name, texture.options);
    return;
  }
  setSelectedFaceSkinFromImage(texture.img, texture.source, "", texture.name, texture.options);
}

function selectedFaceDecals(face = selectedFace()) {
  if (!face) return [];
  const decals = cleanFaceDecals(face.bitmapDecals);
  if (decals.length) face.bitmapDecals = decals;
  else delete face.bitmapDecals;
  return face.bitmapDecals || [];
}

function selectedFaceDecalIndex(face = selectedFace()) {
  const decals = selectedFaceDecals(face);
  const value = Number(els.faceDecalSelector?.value);
  return Number.isInteger(value) && value >= 0 && value < decals.length ? value : -1;
}

function selectedFaceDecal(face = selectedFace()) {
  const decals = selectedFaceDecals(face);
  const index = selectedFaceDecalIndex(face);
  return index >= 0 ? decals[index] : null;
}

function applyShelfBitmapAsDecal() {
  const face = selectedFace();
  const item = selectedBitmapShelfItem();
  if (!face) {
    setStatus("SELECT A FACE FIRST.");
    return;
  }
  if (!item) {
    setStatus("SELECT A DECAL THUMBNAIL FIRST.");
    return;
  }
  if (item.source === "imported" || item.asset?.kind !== "decal") {
    setStatus("SELECT A PROJECT DECAL ASSET. IMPORTED UVS CAN BE SAVED AS FACE TEXTURES FIRST.");
    return;
  }
  const key = cleanBitmapKey(item.asset?.key || item.name);
  if (!key) {
    setStatus("SELECTED DECAL HAS NO STABLE KEY.");
    return;
  }
  loadDecalImage(key, item.asset?.url || item.img?.src || "");
  const decals = selectedFaceDecals(face);
  decals.push({ key, x: .5, y: .5, scale: .35, angle: 0, alpha: .92 });
  if (mirrorActionsEnabled()) syncMirroredFace(face);
  markPreviewSkinsDirty();
  updateFaceDecalControls(decals.length - 1);
  setStatus(`${key} DECAL ADDED TO FACE #${face.id}.`);
  renderAll();
}

function removeSelectedFaceDecal() {
  const face = selectedFace();
  if (!face) return setStatus("SELECT A FACE FIRST.");
  const index = selectedFaceDecalIndex(face);
  const decals = selectedFaceDecals(face);
  if (index < 0) return setStatus("SELECT A FACE DECAL FIRST.");
  const [removed] = decals.splice(index, 1);
  if (!decals.length) delete face.bitmapDecals;
  if (mirrorActionsEnabled()) syncMirroredFace(face);
  markPreviewSkinsDirty();
  updateFaceDecalControls(Math.min(index, decals.length - 1));
  setStatus(`${removed?.key || "DECAL"} REMOVED FROM FACE #${face.id}.`);
  renderAll();
}

function clearSelectedFaceDecals() {
  const face = selectedFace();
  if (!face) return setStatus("SELECT A FACE FIRST.");
  const count = cleanFaceDecals(face.bitmapDecals).length;
  delete face.bitmapDecals;
  if (mirrorActionsEnabled()) syncMirroredFace(face);
  markPreviewSkinsDirty();
  updateFaceDecalControls();
  setStatus(count ? `${count} DECAL${count === 1 ? "" : "S"} CLEARED FROM FACE #${face.id}.` : "SELECTED FACE HAS NO DECALS.");
  renderAll();
}

function clearAllFaceDecals() {
  const affected = state.faces.filter((face) => cleanFaceDecals(face.bitmapDecals).length);
  const count = affected.reduce((sum, face) => sum + cleanFaceDecals(face.bitmapDecals).length, 0);
  if (!count) {
    setStatus("NO FACE DECALS TO CLEAR.");
    return;
  }
  const confirmClear = window.confirm(`Clear ${count} decal${count === 1 ? "" : "s"} from ${affected.length} face${affected.length === 1 ? "" : "s"}?`);
  if (!confirmClear) return;
  for (const face of affected) delete face.bitmapDecals;
  if (mirrorActionsEnabled()) {
    for (const face of affected) syncMirroredFace(face);
  }
  markPreviewSkinsDirty();
  updateFaceDecalControls();
  setStatus(`${count} DECAL${count === 1 ? "" : "S"} CLEARED FROM ${affected.length} FACE${affected.length === 1 ? "" : "S"}.`);
  renderAll();
}

function updateSelectedFaceDecalFromControls() {
  const face = selectedFace();
  const decal = selectedFaceDecal(face);
  if (!face || !decal) return;
  decal.x = round(clamp(Number(els.faceDecalX?.value), 0, 1), 3);
  decal.y = round(clamp(Number(els.faceDecalY?.value), 0, 1), 3);
  decal.scale = round(clamp(Number(els.faceDecalScale?.value), .02, 2), 3);
  decal.angle = normalizeBitmapAngle(els.faceDecalAngle?.value);
  decal.alpha = round(clamp(Number(els.faceDecalAlpha?.value), 0, 1), 3);
  if (mirrorActionsEnabled()) syncMirroredFace(face);
  markPreviewSkinsDirty();
  renderAll();
}

function importSkinFile(side, file, addToShelf = true) {
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    setStatus("SELECT AN IMAGE FILE.");
    return;
  }
  if (!state.skinImages?.modelId) {
    state.skinImages = emptySkinBundle(templateShipId());
  }
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => {
    clearEditorSelection();
    const shelfId = addToShelf ? addBitmapToShelf(file, img, url) : "";
    const mirrored = importMirroredSkinEnabled();
    setSkinSideFromImage(side, img, addToShelf ? "shelf" : "imported", addToShelf ? "" : url, mirrored);
    if (shelfId) selectBitmapShelfItem(shelfId);
    updateSkinReadout();
    setStatus(`${side.toUpperCase()} SKIN IMPORTED (${img.naturalWidth}x${img.naturalHeight})${mirrored ? " AS MIRRORED HALF UV" : ""}.`);
    renderAll();
  };
  img.onerror = () => {
    URL.revokeObjectURL(url);
    setStatus(`${side.toUpperCase()} SKIN IMPORT FAILED.`);
  };
  img.src = url;
}

function importSelectedFaceSkinFile(file, addToShelf = true) {
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    setStatus("SELECT AN IMAGE FILE.");
    return;
  }
  const targets = selectedFaceGroup();
  const face = selectedFace();
  if (!targets.length && !face) {
    setStatus("SELECT ONE OR MORE FACES FIRST.");
    return;
  }
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => {
    const shelfId = addToShelf ? addBitmapToShelf(file, img, url) : "";
    if (targets.length) {
      setFaceGroupSkinFromImage(targets, img, addToShelf ? "shelf" : "imported", addToShelf ? "" : url, file.name || "FACE PNG", { key: cleanBitmapKey(file.name.replace(/\.[^.]+$/, ""), "face_group") });
    } else {
      setSelectedFaceSkinFromImage(img, addToShelf ? "shelf" : "imported", addToShelf ? "" : url, file.name || "FACE PNG", { orientToView: true });
    }
    if (shelfId) selectBitmapShelfItem(shelfId);
    renderAll();
  };
  img.onerror = () => {
    URL.revokeObjectURL(url);
    setStatus("FACE SKIN IMPORT FAILED.");
  };
  img.src = url;
}

function importBitmapShelfFiles(files) {
  const list = Array.from(files || []).filter((file) => file.type.startsWith("image/"));
  if (!list.length) {
    setStatus("SELECT IMAGE FILES FOR THE BITMAP SHELF.");
    return;
  }
  let pending = list.length;
  let imported = 0;
  for (const file of list) {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      addBitmapToShelf(file, img, url);
      imported++;
      pending--;
      if (!pending) setStatus(`${imported} BITMAP${imported === 1 ? "" : "S"} ADDED TO SHELF.`);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      pending--;
      if (!pending) setStatus(`${imported} BITMAP${imported === 1 ? "" : "S"} ADDED TO SHELF.`);
    };
    img.src = url;
  }
}

function templatePrimaryAxis() {
  const id = templateShipId();
  return id === "thargoid" || id === "thargon" ? "x" : "y";
}

function templateProjection(side, mode = "footprint") {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity, minZ = Infinity, maxZ = -Infinity;
  for (const p of state.verts) {
    minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
    minZ = Math.min(minZ, p.z); maxZ = Math.max(maxZ, p.z);
  }
  if (!state.verts.length) {
    minX = minY = minZ = -1;
    maxX = maxY = maxZ = 1;
  }
  const marginX = Math.max(1, (maxX - minX) * .08);
  const marginY = Math.max(1, (maxY - minY) * .08);
  const marginZ = Math.max(1, (maxZ - minZ) * .08);
  minX -= marginX; maxX += marginX;
  minY -= marginY; maxY += marginY;
  minZ -= marginZ; maxZ += marginZ;
  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;
  const rangeZ = maxZ - minZ || 1;
  const primaryAxis = templatePrimaryAxis();
  const squareFromAxes = (p, uAxis, vAxis, flipU = false, flipV = false) => {
    const mins = [minX, minY, minZ];
    const ranges = [rangeX, rangeY, rangeZ];
    const coords = [p.x, p.y, p.z];
    const rawU = ((coords[uAxis] - mins[uAxis]) / ranges[uAxis]) * TEMPLATE_SIZE;
    const rawV = ((coords[vAxis] - mins[vAxis]) / ranges[vAxis]) * TEMPLATE_SIZE;
    return { x: flipU ? TEMPLATE_SIZE - rawU : rawU, y: flipV ? TEMPLATE_SIZE - rawV : rawV };
  };
  const squareProject = (p) => {
    if (primaryAxis === "x" && side !== "back") return squareFromAxes(p, 1, 2, side === "bottom", true);
    if (side === "back") return squareFromAxes(p, 0, 1, true, true);
    return squareFromAxes(p, 0, 2, side === "bottom", true);
  };
  squareProject.width = TEMPLATE_SIZE;
  squareProject.height = TEMPLATE_SIZE;
  squareProject.centerlineX = TEMPLATE_SIZE / 2;
  squareProject.mode = "square";
  if (mode === "square") return squareProject;

  const footprintFromAxes = (uAxis, vAxis, flipU = false, flipV = false) => {
    const mins = [minX, minY, minZ];
    const ranges = [rangeX, rangeY, rangeZ];
    const scale = TEMPLATE_MAX_SIZE / Math.max(ranges[uAxis], ranges[vAxis], 1);
    const width = Math.max(16, Math.round(ranges[uAxis] * scale));
    const height = Math.max(16, Math.round(ranges[vAxis] * scale));
    const centerU = (0 - mins[uAxis]) * scale;
    const project = (p) => {
      const coords = [p.x, p.y, p.z];
      const rawU = (coords[uAxis] - mins[uAxis]) * scale;
      const rawV = (coords[vAxis] - mins[vAxis]) * scale;
      return { x: flipU ? width - rawU : rawU, y: flipV ? height - rawV : rawV };
    };
    project.width = width;
    project.height = height;
    project.centerlineX = flipU ? width - centerU : centerU;
    project.mode = "footprint";
    return project;
  };

  if (primaryAxis === "x" && side !== "back") return footprintFromAxes(1, 2, side === "bottom", true);
  if (side === "back") return footprintFromAxes(0, 1, true, true);
  return footprintFromAxes(0, 2, side === "bottom", true);
}

function templateProjectionFromAxes(uAxis, vAxis, flipU = false, flipV = true) {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity, minZ = Infinity, maxZ = -Infinity;
  for (const p of state.verts) {
    minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
    minZ = Math.min(minZ, p.z); maxZ = Math.max(maxZ, p.z);
  }
  if (!state.verts.length) {
    minX = minY = minZ = -1;
    maxX = maxY = maxZ = 1;
  }
  const marginX = Math.max(1, (maxX - minX) * .08);
  const marginY = Math.max(1, (maxY - minY) * .08);
  const marginZ = Math.max(1, (maxZ - minZ) * .08);
  minX -= marginX; maxX += marginX;
  minY -= marginY; maxY += marginY;
  minZ -= marginZ; maxZ += marginZ;
  const mins = [minX, minY, minZ];
  const ranges = [maxX - minX || 1, maxY - minY || 1, maxZ - minZ || 1];
  const scale = TEMPLATE_MAX_SIZE / Math.max(ranges[uAxis], ranges[vAxis], 1);
  const width = Math.max(16, Math.round(ranges[uAxis] * scale));
  const height = Math.max(16, Math.round(ranges[vAxis] * scale));
  const centerU = (0 - mins[uAxis]) * scale;
  const project = (p) => {
    const coords = [p.x, p.y, p.z];
    const rawU = (coords[uAxis] - mins[uAxis]) * scale;
    const rawV = (coords[vAxis] - mins[vAxis]) * scale;
    return { x: flipU ? width - rawU : rawU, y: flipV ? height - rawV : rawV };
  };
  project.width = width;
  project.height = height;
  project.centerlineX = flipU ? width - centerU : centerU;
  project.mode = "face";
  return project;
}

function polygonArea2d(pts) {
  let area = 0;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length];
    area += a.x * b.y - b.x * a.y;
  }
  return Math.abs(area) * .5;
}

function faceTextureProjection(face, fallbackProject) {
  const verts = face.verts.map(vertexById).filter(Boolean);
  if (cleanBitmapKey(face.bitmapFaceKey) || cleanFaceDecals(face.bitmapDecals).length) {
    const local = faceLocalTextureProjection(face);
    if (local) return local;
  }
  const fallbackPts = verts.map(fallbackProject);
  if (!cleanBitmapKey(face.bitmapFaceKey) || polygonArea2d(fallbackPts) >= 1) return fallbackProject;
  const n = faceNormal(face);
  const absX = Math.abs(n.x), absY = Math.abs(n.y), absZ = Math.abs(n.z);
  if (absZ >= absX && absZ >= absY) return templateProjectionFromAxes(0, 1, n.z < 0, true);
  if (absX >= absY && absX >= absZ) return templateProjectionFromAxes(2, 1, n.x > 0, true);
  return templateProjectionFromAxes(0, 2, n.y < 0, true);
}

function faceLocalTextureProjection(face) {
  const verts = face.verts.map(vertexById).filter(Boolean);
  if (verts.length < 3) return null;
  const n = faceNormal(face);
  let longest = null;
  for (let i = 0; i < verts.length; i++) {
    const a = verts[i];
    const b = verts[(i + 1) % verts.length];
    const edge = { x: b.x - a.x, y: b.y - a.y, z: b.z - a.z };
    const edgeLen = Math.hypot(edge.x, edge.y, edge.z);
    if (edgeLen > (longest?.edgeLen || 0)) longest = { edge, edgeLen };
  }
  if (!longest || longest.edgeLen < .001) return null;
  const uAxis = norm(longest.edge);
  const vAxis = norm(cross(n, uAxis));
  if (len(vAxis) < .001) return null;
  const coords = verts.map((p) => ({ id: p.id, u: dot(p, uAxis), v: dot(p, vAxis) }));
  const minU = Math.min(...coords.map((p) => p.u));
  const maxU = Math.max(...coords.map((p) => p.u));
  const minV = Math.min(...coords.map((p) => p.v));
  const maxV = Math.max(...coords.map((p) => p.v));
  const rangeU = maxU - minU;
  const rangeV = maxV - minV;
  if (rangeU < .001 || rangeV < .001) return null;
  const scale = TEMPLATE_MAX_SIZE / Math.max(rangeU, rangeV, 1);
  const uvById = new Map(coords.map((p) => [
    p.id,
    { x: (p.u - minU) * scale, y: (maxV - p.v) * scale }
  ]));
  const project = (p) => uvById.get(p.id) || { x: 0, y: 0 };
  project.width = Math.max(16, Math.round(rangeU * scale));
  project.height = Math.max(16, Math.round(rangeV * scale));
  project.centerlineX = project.width / 2;
  project.mode = "face-local";
  return project;
}

function autoTemplateSideForFace(face) {
  const n = faceNormal(face);
  const absX = Math.abs(n.x), absY = Math.abs(n.y), absZ = Math.abs(n.z);
  let side = n.z < -.42 && absZ >= absY * .86 && absZ >= absX * .65 ? "back" : n.y < 0 ? "bottom" : "top";
  if (templatePrimaryAxis() === "x" && absX >= absY * .86 && absX >= absZ * .65) {
    side = n.x < 0 ? "bottom" : "top";
  }
  return side;
}

function templateSideForFace(face) {
  return validBitmapFaceSide(face?.bitmapSide) || autoTemplateSideForFace(face);
}

function drawTemplateCenterline(ctx, x, top = 0, bottom = ctx.canvas.height, options = {}) {
  if (x < -1 || x > ctx.canvas.width + 1) return;
  const active = !!options.active;
  ctx.save();
  if (active) {
    ctx.strokeStyle = "rgba(0,0,0,.72)";
    ctx.lineWidth = 5;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(Math.round(x) + .5, top);
    ctx.lineTo(Math.round(x) + .5, bottom);
    ctx.stroke();
  }
  ctx.strokeStyle = active ? "#ff5ec4" : "rgba(255,255,255,.48)";
  ctx.lineWidth = active ? 2 : 1;
  ctx.setLineDash([7, 7]);
  ctx.beginPath();
  ctx.moveTo(Math.round(x) + .5, top);
  ctx.lineTo(Math.round(x) + .5, bottom);
  ctx.stroke();
  if (active && options.label) {
    ctx.setLineDash([]);
    const labelX = Math.max(4, Math.min(Math.max(4, ctx.canvas.width - 84), x + 7));
    const labelY = Math.max(4, top + 5);
    ctx.fillStyle = "rgba(0,0,0,.82)";
    ctx.fillRect(labelX, labelY, 76, 17);
    ctx.fillStyle = "#ff5ec4";
    ctx.font = "10px Andale Mono, Menlo, Consolas, monospace";
    ctx.textBaseline = "top";
    ctx.fillText(String(options.label).toUpperCase(), labelX + 4, labelY + 3);
  }
  ctx.restore();
}

function traceTemplatePoly(ctx, pts, close = true) {
  if (pts.length < 2) return;
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  if (close) ctx.closePath();
}

function drawTemplateDetail(ctx, detail, project, translate = (p) => p) {
  const pts = detailModelPoints(detail).map(project).map(translate);
  if (detail.type === "beacon") {
    const p = pts[0];
    if (!p) return;
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,.86)";
    ctx.fillStyle = "rgba(255,255,255,.35)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(p.x - 7, p.y);
    ctx.lineTo(p.x + 7, p.y);
    ctx.moveTo(p.x, p.y - 7);
    ctx.lineTo(p.x, p.y + 7);
    ctx.stroke();
    ctx.restore();
    return;
  }
  if (pts.length < 2) return;
  ctx.save();
  ctx.strokeStyle = detail.type === "window" ? "rgba(255,255,255,.86)" : detail.type === "engine" ? "#ffffff" : "rgba(255,255,255,.7)";
  ctx.fillStyle = "rgba(255,255,255,.08)";
  ctx.lineWidth = detail.type === "engine" ? 2 : 1;
  if (detail.type === "panel" || detail.type === "line" || detail.type === "polyline") {
    traceTemplatePoly(ctx, pts, false);
    ctx.stroke();
  } else {
    traceTemplatePoly(ctx, pts, true);
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}

function drawTemplateLabel(ctx, text) {
  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,.72)";
  ctx.font = "10px Andale Mono, Menlo, Consolas, monospace";
  ctx.textBaseline = "top";
  ctx.fillText(text.toUpperCase(), 10, 10);
  ctx.restore();
}

function createTemplateCanvas(side, half = mirrorHalfSkinsEnabled()) {
  const project = templateProjection(side, "footprint");
  const centerX = project.centerlineX ?? project.width / 2;
  const canvas = document.createElement("canvas");
  canvas.width = half ? Math.max(16, Math.ceil(centerX)) : project.width;
  canvas.height = project.height;
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawTemplateCenterline(ctx, centerX, 0, canvas.height, { active: half || skinSideMirrorX(side), label: "mirror" });

  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,.46)";
  ctx.lineWidth = 1;
  for (const face of state.faces) {
    const pts = face.verts.map(vertexById).filter(Boolean).map(project);
    traceTemplatePoly(ctx, pts, true);
    ctx.stroke();
  }
  ctx.restore();

  ctx.save();
  for (const edge of state.edges) {
    const a = vertexById(edge.a), b = vertexById(edge.b);
    if (!a || !b) continue;
    const pa = project(a), pb = project(b);
    ctx.strokeStyle = edge.kind === "stick" ? "rgba(255,255,255,.9)" : "rgba(255,255,255,.72)";
    ctx.lineWidth = edge.kind === "stick" ? 2 : 1;
    ctx.beginPath();
    ctx.moveTo(pa.x, pa.y);
    ctx.lineTo(pb.x, pb.y);
    ctx.stroke();
  }
  ctx.restore();

  for (const detail of state.details) drawTemplateDetail(ctx, detail, project);
  drawTemplateLabel(ctx, `${templateShipId()} ${side}${half ? " half" : ""}`);
  return canvas;
}

function createSelectedFaceTemplateCanvas() {
  const face = state.selected?.type === "face" ? faceById(state.selected.id) : null;
  if (!face) {
    setStatus("SELECT A FACE FIRST.");
    return null;
  }
  const mapping = selectedFaceTextureMapping(face);
  if (!mapping || mapping.uv.length < 3) return null;
  const { side, project, minX, minY, pad, width, height } = mapping;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, width, height);
  const translate = (p) => ({ x: p.x - minX + pad, y: p.y - minY + pad });
  const faceMirror = faceTextureMirrorX(face);
  drawTemplateCenterline(ctx, width / 2, 0, height, { active: faceMirror, label: faceMirror ? "mirror" : "" });

  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,.96)";
  ctx.fillStyle = "rgba(255,255,255,.08)";
  ctx.lineWidth = 1;
  traceTemplatePoly(ctx, mapping.uv, true);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  for (const detail of state.details) {
    if (detail.faceId === face.id) drawTemplateDetail(ctx, detail, project, translate);
  }

  canvas.dataset.templateSide = side;
  canvas.dataset.templateFaceId = String(face.id);
  return canvas;
}

function selectedFaceTextureMapping(face, options = {}) {
  if (Array.isArray(face?.bitmapUv) && face.bitmapUv.length >= 3) {
    const uv = face.bitmapUv.map((p) => ({ x: Number(p[0]) || 0, y: Number(p[1]) || 0 }));
    return {
      side: templateSideForFace(face),
      project: (p) => p,
      uv,
      rawUv: uv,
      angle: 0,
      width: Math.max(1, Math.round(Number(face.bitmapBaseW) || TEMPLATE_SIZE)),
      height: Math.max(1, Math.round(Number(face.bitmapBaseH) || TEMPLATE_SIZE)),
      minX: 0,
      minY: 0,
      pad: 0
    };
  }
  const side = templateSideForFace(face);
  const project = faceTextureProjection(face, templateProjection(side, "footprint"));
  const pts = face.verts.map(vertexById).filter(Boolean).map(project);
  if (pts.length < 3) return null;
  const minX = Math.min(...pts.map((p) => p.x));
  const maxX = Math.max(...pts.map((p) => p.x));
  const minY = Math.min(...pts.map((p) => p.y));
  const maxY = Math.max(...pts.map((p) => p.y));
  const pad = 24;
  const width = Math.max(24, Math.ceil(maxX - minX + pad * 2));
  const height = Math.max(24, Math.ceil(maxY - minY + pad * 2));
  const rawUv = pts.map((p) => ({ x: p.x - minX + pad, y: p.y - minY + pad }));
  const angle = options.applyAngle === false ? 0 : normalizeBitmapAngle(face.bitmapAngle);
  if (!angle) return { side, project, uv: rawUv, rawUv, angle, width, height, minX, minY, pad };
  const rotatedUv = rawUv.map((p) => rotateTemplatePoint(p, width, height, angle));
  const minRotX = Math.min(...rotatedUv.map((p) => p.x));
  const maxRotX = Math.max(...rotatedUv.map((p) => p.x));
  const minRotY = Math.min(...rotatedUv.map((p) => p.y));
  const maxRotY = Math.max(...rotatedUv.map((p) => p.y));
  const fittedWidth = Math.max(24, Math.ceil(maxRotX - minRotX + pad * 2));
  const fittedHeight = Math.max(24, Math.ceil(maxRotY - minRotY + pad * 2));
  const uv = rotatedUv.map((p) => ({ x: p.x - minRotX + pad, y: p.y - minRotY + pad }));
  return { side, project, uv, rawUv, angle, width: fittedWidth, height: fittedHeight, minX, minY, pad };
}

function faceTextureMirrorX(face) {
  return !!face?.bitmapMirrorX;
}

function downloadCanvas(canvas, filename) {
  if (!canvas) return;
  canvas.toBlob((blob) => {
    if (!blob) return setStatus("PNG EXPORT FAILED.");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);
  }, "image/png");
}

function downloadTemplate(side) {
  const half = mirrorHalfSkinsEnabled();
  const canvas = createTemplateCanvas(side, half);
  downloadCanvas(canvas, `${templateShipId()}-${side}${half ? "-half" : ""}-${canvas.width}x${canvas.height}-template.png`);
  setStatus(`${side.toUpperCase()} TEMPLATE DOWNLOADED (${canvas.width}x${canvas.height}).`);
}

function downloadSelectedFaceTemplate() {
  const canvas = createSelectedFaceTemplateCanvas();
  if (!canvas) return;
  const side = canvas.dataset.templateSide || "face";
  const faceId = canvas.dataset.templateFaceId || "selected";
  downloadCanvas(canvas, `${templateShipId()}-face-${faceId}-${side}-${canvas.width}x${canvas.height}-template.png`);
  setStatus(`FACE ${faceId} TEMPLATE DOWNLOADED (${canvas.width}x${canvas.height}).`);
}

function drawTexturedTriangle(ctx, img, p0, p1, p2, uv0, uv1, uv2) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(p0.x, p0.y);
  ctx.lineTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.closePath();
  ctx.clip();

  let u1 = uv1.x - uv0.x, v1 = uv1.y - uv0.y;
  let u2 = uv2.x - uv0.x, v2 = uv2.y - uv0.y;
  const x1 = p1.x - p0.x, y1 = p1.y - p0.y;
  const x2 = p2.x - p0.x, y2 = p2.y - p0.y;
  const det = u1 * v2 - u2 * v1;
  if (Math.abs(det) < 1e-6) {
    ctx.restore();
    return;
  }
  const idet = 1 / det;
  const a = (v2 * x1 - v1 * x2) * idet;
  const b = (v2 * y1 - v1 * y2) * idet;
  const c = (u1 * x2 - u2 * x1) * idet;
  const d = (u1 * y2 - u2 * y1) * idet;
  const e = p0.x - a * uv0.x - c * uv0.y;
  const f = p0.y - b * uv0.x - d * uv0.y;
  ctx.transform(a, b, c, d, e, f);
  ctx.drawImage(img, 0, 0);
  ctx.restore();
}

function lerp2(a, b, t) {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

function clipTexturePolygon(poly, keepLeft, seamX) {
  const eps = 1e-5;
  const inside = (p) => keepLeft ? p.tex.x <= seamX + eps : p.tex.x >= seamX - eps;
  const intersect = (a, b) => {
    const dx = b.tex.x - a.tex.x;
    const t = Math.abs(dx) < eps ? 0 : Math.max(0, Math.min(1, (seamX - a.tex.x) / dx));
    return {
      screen: lerp2(a.screen, b.screen, t),
      tex: lerp2(a.tex, b.tex, t)
    };
  };
  const out = [];
  for (let i = 0; i < poly.length; i++) {
    const cur = poly[i];
    const prev = poly[(i + poly.length - 1) % poly.length];
    const curIn = inside(cur);
    const prevIn = inside(prev);
    if (curIn) {
      if (!prevIn) out.push(intersect(prev, cur));
      out.push(cur);
    } else if (prevIn) {
      out.push(intersect(prev, cur));
    }
  }
  return out;
}

function drawTexturedPolygon(ctx, img, poly, sx, sy, mirrorX, foldX) {
  if (!poly || poly.length < 3) return;
  const uvFor = (p) => {
    const u = mirrorX ? mirroredTemplateU(p.tex.x, foldX) : p.tex.x;
    return { x: u * sx, y: p.tex.y * sy };
  };
  const uv0 = uvFor(poly[0]);
  for (let i = 1; i + 1 < poly.length; i++) {
    drawTexturedTriangle(ctx, img, poly[0].screen, poly[i].screen, poly[i + 1].screen, uv0, uvFor(poly[i]), uvFor(poly[i + 1]));
  }
}

function skinProjectionForImage(side, img) {
  const footprint = templateProjection(side, "footprint");
  const square = templateProjection(side, "square");
  const w = img?.naturalWidth || img?.width || 0;
  const h = img?.naturalHeight || img?.height || 0;
  const mirrorX = skinSideMirrorX(side);
  const footprintRatio = footprint.width / Math.max(1, footprint.height);
  const imageRatio = (mirrorX ? w * 2 : w) / Math.max(1, h);
  const useFootprint = mirrorX || ratioClose(imageRatio, footprintRatio, .3);
  return { project: useFootprint ? footprint : square, mirrorX, useFootprint };
}

function drawFaceBitmapSkin(ctx, face, pts) {
  const faceKey = cleanBitmapKey(face.bitmapFaceKey);
  const faceImg = faceKey ? state.faceSkinImages?.[faceKey] : null;
  if (faceImg?.complete && faceImg.naturalWidth && pts.length >= 3) {
    const mapping = selectedFaceTextureMapping(face);
    if (mapping && mapping.uv.length === pts.length) {
      const mirrorX = faceTextureMirrorX(face);
      const seamX = mapping.width / 2;
      const sx = faceImg.naturalWidth / (mirrorX ? Math.max(1, seamX) : mapping.width);
      const sy = faceImg.naturalHeight / mapping.height;
      const poly = mapping.uv.map((tex, i) => ({ screen: pts[i], tex }));
      ctx.save();
      ctx.globalAlpha = .98;
      if (mirrorX) {
        drawTexturedPolygon(ctx, faceImg, clipTexturePolygon(poly, true, seamX), sx, sy, true, seamX);
        drawTexturedPolygon(ctx, faceImg, clipTexturePolygon(poly, false, seamX), sx, sy, true, seamX);
      } else {
        drawTexturedPolygon(ctx, faceImg, poly, sx, sy, false, seamX);
      }
      ctx.restore();
      return true;
    }
  }
  const side = templateSideForFace(face);
  const img = state.skinImages?.[side];
  if (!img?.complete || !img.naturalWidth || pts.length < 3) return false;
  const { project, mirrorX } = skinProjectionForImage(side, img);
  const angle = sideSkinAngleDeg();
  const baseW = project.width || TEMPLATE_SIZE;
  const baseH = project.height || TEMPLATE_SIZE;
  const seamX = project.centerlineX ?? baseW / 2;
  const sx = img.naturalWidth / (mirrorX ? Math.max(1, seamX) : baseW);
  const sy = img.naturalHeight / baseH;
  const verts = face.verts.map(vertexById).filter(Boolean);
  if (verts.length !== pts.length) return false;
  const poly = verts.map((v, i) => {
    return {
      screen: pts[i],
      tex: rotateTemplatePoint(project(v), baseW, baseH, angle)
    };
  });
  ctx.save();
  ctx.globalAlpha = .96;
  if (mirrorX) {
    drawTexturedPolygon(ctx, img, clipTexturePolygon(poly, true, seamX), sx, sy, true, seamX);
    drawTexturedPolygon(ctx, img, clipTexturePolygon(poly, false, seamX), sx, sy, true, seamX);
  } else {
    drawTexturedPolygon(ctx, img, poly, sx, sy, false, seamX);
  }
  ctx.restore();
  return true;
}

function drawFaceBitmapDecals(ctx, face, pts) {
  const decals = cleanFaceDecals(face.bitmapDecals);
  if (!decals.length || pts.length < 3) return false;
  const mapping = selectedFaceTextureMapping(face);
  if (!mapping || mapping.uv.length !== pts.length) return false;
  const poly = mapping.uv.map((tex, i) => ({ screen: pts[i], tex }));
  let drawn = false;
  for (const decal of decals) {
    const img = state.decalImages[decal.key] || loadDecalImage(decal.key);
    if (!img?.complete || !img.naturalWidth) continue;
    const layer = document.createElement("canvas");
    layer.width = Math.max(8, Math.round(mapping.width));
    layer.height = Math.max(8, Math.round(mapping.height));
    const tc = layer.getContext("2d");
    const maxSide = Math.max(4, Math.min(layer.width, layer.height) * clamp(decal.scale, .02, 2));
    const aspect = img.naturalWidth / Math.max(1, img.naturalHeight);
    const drawW = aspect >= 1 ? maxSide : maxSide * aspect;
    const drawH = aspect >= 1 ? maxSide / aspect : maxSide;
    tc.save();
    tc.globalAlpha = clamp(decal.alpha, 0, 1);
    tc.translate(clamp(decal.x, 0, 1) * layer.width, clamp(decal.y, 0, 1) * layer.height);
    tc.rotate((decal.angle || 0) * Math.PI / 180);
    tc.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    tc.restore();
    ctx.save();
    drawTexturedPolygon(ctx, layer, poly, 1, 1, false, mapping.width / 2);
    ctx.restore();
    drawn = true;
  }
  return drawn;
}

function faceMirrorSeamPoints(face, pts) {
  if (!faceTextureMirrorX(face) || !pts || pts.length < 3) return [];
  const mapping = selectedFaceTextureMapping(face);
  if (!mapping || mapping.uv.length !== pts.length) return [];
  const seamX = mapping.width / 2;
  const eps = 1e-5;
  const poly = mapping.uv.map((tex, i) => ({ screen: pts[i], tex }));
  const seam = [];
  const addPoint = (screen, texY) => {
    if (!screen || !Number.isFinite(screen.x) || !Number.isFinite(screen.y)) return;
    if (seam.some((p) => Math.hypot(p.screen.x - screen.x, p.screen.y - screen.y) < .5)) return;
    seam.push({ screen, texY });
  };
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    const da = a.tex.x - seamX;
    const db = b.tex.x - seamX;
    if (Math.abs(da) <= eps) addPoint(a.screen, a.tex.y);
    if (da * db < 0) {
      const t = Math.max(0, Math.min(1, -da / (db - da)));
      addPoint(lerp2(a.screen, b.screen, t), a.tex.y + (b.tex.y - a.tex.y) * t);
    }
    if (Math.abs(db) <= eps) addPoint(b.screen, b.tex.y);
  }
  return seam.sort((a, b) => a.texY - b.texY).map((p) => p.screen);
}

function drawFaceMirrorSeam(ctx, face, pts) {
  const seam = faceMirrorSeamPoints(face, pts);
  if (seam.length < 2) return;
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "rgba(0,0,0,.82)";
  ctx.lineWidth = 6;
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(seam[0].x, seam[0].y);
  for (let i = 1; i < seam.length; i++) ctx.lineTo(seam[i].x, seam[i].y);
  ctx.stroke();
  ctx.strokeStyle = "#ff5ec4";
  ctx.lineWidth = 2.4;
  ctx.setLineDash([8, 5]);
  ctx.beginPath();
  ctx.moveTo(seam[0].x, seam[0].y);
  for (let i = 1; i < seam.length; i++) ctx.lineTo(seam[i].x, seam[i].y);
  ctx.stroke();
  ctx.setLineDash([]);
  for (const p of seam) {
    ctx.fillStyle = "rgba(0,0,0,.82)";
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4.5, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#ff5ec4";
    ctx.beginPath();
    ctx.arc(p.x, p.y, 2.4, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

function derivedFaceEdges() {
  const seen = new Set();
  const edges = [];
  for (const face of state.faces) {
    const ids = face.verts || [];
    for (let i = 0; i < ids.length; i++) {
      const a = ids[i];
      const b = ids[(i + 1) % ids.length];
      if (!Number.isFinite(a) || !Number.isFinite(b) || a === b) continue;
      const key = a < b ? `${a},${b}` : `${b},${a}`;
      if (seen.has(key)) continue;
      seen.add(key);
      edges.push({ a, b });
    }
  }
  return edges;
}

function renderMain() {
  const canvas = els.mainView;
  const ctx = canvas.getContext("2d");
  const previewMode = els.previewRenderMode?.value || "gameOverlay";
  const gameOverlay = gameRendererOverlayMode(previewMode);
  const gameOnly = previewMode === "gameOnly";
  updatePreviewTrustUi();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (gameOnly) return;
  if (!gameOverlay) drawStars(ctx, canvas);
  if (gameOverlay && !state.gamePreviewProjection?.points?.length) return;
  const projected = projectedMapForMain(canvas);
  const drawFaces = previewMode !== "wire" && !gameOverlay;
  const drawWire = previewMode !== "bitmap" && !gameOverlay;
  const drawBitmapGuide = previewMode === "wireBitmap" || previewMode === "bitmap";

  if (drawFaces) {
    const sortedFaces = [...state.faces].sort((a, b) => faceDepth(b) - faceDepth(a));
    for (const face of sortedFaces) {
      const pts = face.verts.map((id) => projected.get(id)).filter(Boolean);
      const n = faceNormal(face);
      const selected = state.selected?.type === "face" && state.selected.id === face.id;
      const grouped = state.selectedFaceIds.has(face.id);
      if (drawBitmapGuide) {
        drawFace(ctx, pts, builderBitmapFill(n, face), "rgba(0,0,0,0)", 0);
        const textured = drawFaceBitmapSkin(ctx, face, pts);
        drawFaceBitmapDecals(ctx, face, pts);
        if (!textured) drawFaceTextureGuide(ctx, pts, previewMode === "bitmap" ? .22 : .16);
        if (selected || grouped || drawWire) {
          drawFace(
            ctx,
            pts,
            selected ? "rgba(255,217,54,.18)" : grouped ? "rgba(102,232,255,.14)" : "rgba(0,0,0,0)",
            selected ? "#ffd936" : grouped ? "#66e8ff" : "rgba(85,255,78,.32)",
            selected || grouped ? 2 : 1
          );
          if (selected) drawFaceMirrorSeam(ctx, face, pts);
        }
      } else {
        drawFace(
          ctx,
          pts,
          selected ? "rgba(255,217,54,.24)" : grouped ? "rgba(102,232,255,.16)" : shadedFaceColor(n, optionalHexColor(face.faceColor) || els.baseColor.value),
          selected ? "#ffd936" : grouped ? "#66e8ff" : drawWire ? "rgba(85,255,78,.32)" : "rgba(0,0,0,0)",
          selected || grouped ? 2 : drawWire ? 1 : 0
        );
        if (selected) drawFaceMirrorSeam(ctx, face, pts);
      }
    }
  }
  drawBlankUvFaceOverlay(ctx, canvas, projected);
  if (gameOverlay) drawGameRendererFaceNormals(ctx, canvas);
  else drawFaceNormals(ctx, (v) => project3d(v, canvas));

  if (drawWire) {
    if (!drawFaces) {
      ctx.strokeStyle = "rgba(85,255,78,.58)";
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      for (const e of derivedFaceEdges()) {
        const a = projected.get(e.a), b = projected.get(e.b);
        if (!a || !b) continue;
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
      }
      ctx.stroke();
    }
    for (const e of state.edges) {
      const a = projected.get(e.a), b = projected.get(e.b);
      if (!a || !b) continue;
      const selected = state.selected?.type === "edge" && state.selected.id === e.id;
      ctx.strokeStyle = selected ? "#ffd936" : e.kind === "stick" ? "#d9d9d9" : "rgba(85,255,78,.72)";
      ctx.lineWidth = selected ? 3 : e.kind === "stick" ? 2.2 : 1.2;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
  }

  if (gameOverlay && state.selected?.type === "edge") {
    const edge = state.edges.find((item) => item.id === state.selected.id);
    const a = edge ? projected.get(edge.a) : null;
    const b = edge ? projected.get(edge.b) : null;
    if (a && b) {
      ctx.strokeStyle = "#ffd936";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
  }

  if (gameOverlay && state.selectedFaceIds.size) {
    const groupedFaces = [...state.selectedFaceIds]
      .map(faceById)
      .filter(Boolean)
      .sort((a, b) => faceSortDepthForMain(b) - faceSortDepthForMain(a));
    for (const face of groupedFaces) {
      const previewFace = previewFaceForBuilderFace(face);
      if (previewFace && !previewFace.visible) continue;
      const pts = face.verts.map((id) => projected.get(id)).filter(Boolean);
      if (pts.length >= 3) drawFace(ctx, pts, "rgba(102,232,255,.15)", "#66e8ff", 2);
    }
  }

  if (gameOverlay && state.selected?.type === "face") {
    const face = faceById(state.selected.id);
    const pts = face?.verts.map((id) => projected.get(id)).filter(Boolean) || [];
    if (face && pts.length >= 3) {
      drawFace(ctx, pts, "rgba(255,217,54,.13)", "#ffd936", 2);
      drawFaceMirrorSeam(ctx, face, pts);
    }
  }

  for (const detail of state.details) {
    const pts = projectedDetailPointsForMain(detail, canvas);
    if (detail.type === "beacon") {
      const p = pts[0] || null;
      if (!p) continue;
      const selected = state.selected?.type === "detail" && state.selected.id === detail.id;
      if (gameOverlay && state.mode !== "detail" && !selected) continue;
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = selected ? "rgba(255,217,54,.95)" : `${detail.color || "#ffb642"}cc`;
      ctx.strokeStyle = selected ? "#ffd936" : "rgba(255,255,255,.72)";
      ctx.lineWidth = selected ? 2.4 : 1.2;
      ctx.beginPath();
      ctx.arc(p.x, p.y, selected ? 8 : 5.5, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(p.x - 10, p.y);
      ctx.lineTo(p.x + 10, p.y);
      ctx.moveTo(p.x, p.y - 10);
      ctx.lineTo(p.x, p.y + 10);
      ctx.stroke();
      ctx.restore();
      continue;
    }
    if (pts.length < 2) continue;
    const selected = state.selected?.type === "detail" && state.selected.id === detail.id;
    if (gameOverlay && state.mode !== "detail" && !selected) continue;
    if (previewMode === "wire" && !selected) continue;
    if (detail.type === "panel") {
      ctx.strokeStyle = selected ? "#ffd936" : "rgba(255,217,54,.8)";
      ctx.lineWidth = selected ? 3 : 1.4;
      ctx.beginPath();
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
    } else {
      drawFace(ctx, pts, detail.type === "engine" ? "rgba(247,255,247,.92)" : "rgba(5,16,18,.92)", selected ? "#ffd936" : "rgba(255,255,255,.38)", selected ? 2 : 1);
    }
  }

  for (const v of state.verts) {
    const p = projected.get(v.id);
    const picked = state.pick.includes(v.id);
    const selected = state.selected?.type === "vertex" && state.selected.id === v.id;
    const showIdleVertex = !gameOverlay && state.mode === "vertex" && previewMode !== "bitmap" && previewMode !== "wireBitmap";
    if (!picked && !selected && !showIdleVertex) continue;
    if (picked) {
      ctx.strokeStyle = "#66e8ff";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(p.x, p.y, selected ? 8.5 : 7, 0, TAU);
      ctx.stroke();
    }
    ctx.fillStyle = selected ? "#ffd936" : picked ? "#66e8ff" : v.center ? "rgba(255,255,255,.62)" : "rgba(85,255,78,.62)";
    ctx.strokeStyle = "rgba(0,0,0,.8)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(p.x, p.y, selected ? 6 : picked ? 5 : 4, 0, TAU);
    ctx.fill();
    ctx.stroke();
  }
}

function drawOrthoCanvas(canvas, viewName) {
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const projected = new Map(state.verts.map((v) => [v.id, orthoProject(v, canvas, viewName)]));
  ctx.strokeStyle = "rgba(255,255,255,.12)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.moveTo(0, canvas.height / 2);
  ctx.lineTo(canvas.width, canvas.height / 2);
  ctx.stroke();

  state.faces.forEach((face) => {
    const pts = face.verts.map((id) => projected.get(id)).filter(Boolean);
    drawFace(ctx, pts, "rgba(85,255,78,.06)", "rgba(85,255,78,.28)", 1);
  });
  drawFaceNormals(ctx, (v) => orthoProject(v, canvas, viewName));
  state.edges.forEach((e) => {
    const a = projected.get(e.a), b = projected.get(e.b);
    if (!a || !b) return;
    ctx.strokeStyle = e.kind === "stick" ? "rgba(255,255,255,.78)" : "rgba(85,255,78,.68)";
    ctx.lineWidth = e.kind === "stick" ? 2 : 1;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  });
  state.verts.forEach((v) => {
    const p = projected.get(v.id);
    const selected = state.selected?.type === "vertex" && state.selected.id === v.id;
    const picked = state.pick.includes(v.id);
    if (picked) {
      ctx.strokeStyle = "#66e8ff";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(p.x, p.y, selected ? 7 : 5.5, 0, TAU);
      ctx.stroke();
    }
    ctx.fillStyle = selected ? "#ffd936" : state.pick.includes(v.id) ? "#66e8ff" : "#55ff4e";
    ctx.beginPath();
    ctx.arc(p.x, p.y, selected ? 5 : 3.5, 0, TAU);
    ctx.fill();
  });
}

function renderAll() {
  updateUi();
  updateSelectedBitmapReadout();
  updateFaceDecalControls();
  renderMain();
  if (state.showBlueprints) {
    document.querySelectorAll(".ortho-grid canvas").forEach((canvas) => drawOrthoCanvas(canvas, canvas.dataset.view));
  }
  updateExport();
  scheduleGamePreviewSync();
}

function renderPreviewMotion() {
  updatePreviewTrustUi();
  renderMain();
  scheduleGamePreviewSync(320);
}

function cachedPreviewImageDataUrl(img) {
  if (!img?.naturalWidth || !img?.naturalHeight) return "";
  const cached = previewImageDataUrlCache.get(img);
  if (cached) return cached;
  const dataUrl = imageToPngDataUrl(img);
  previewImageDataUrlCache.set(img, dataUrl);
  return dataUrl;
}

function gamePreviewBitmapSkins() {
  const skins = {
    version: state.previewSkinVersion,
    mirrorX: state.skinImages?.mirrorX || emptyMirrorFlags(false),
    builderOverride: true,
    replaceBaseTexture: true,
    alpha: .96
  };
  let count = 0;
  for (const side of ["top", "bottom", "back"]) {
    const img = state.skinImages?.[side];
    if (!img?.naturalWidth) continue;
    skins[side] = cachedPreviewImageDataUrl(img);
    count++;
  }
  const faces = {};
  for (const [key, img] of Object.entries(state.faceSkinImages || {})) {
    if (!img?.naturalWidth) continue;
    faces[key] = cachedPreviewImageDataUrl(img);
    count++;
  }
  if (Object.keys(faces).length) skins.faces = faces;
  const decalKeys = [...new Set(state.faces.flatMap((face) => cleanFaceDecals(face.bitmapDecals).map((decal) => decal.key)))];
  const decals = {};
  for (const key of decalKeys) {
    const img = state.decalImages[key] || loadDecalImage(key);
    if (!img?.naturalWidth) continue;
    decals[key] = cachedPreviewImageDataUrl(img);
    count++;
  }
  if (Object.keys(decals).length) skins.decals = decals;
  const angle = sideSkinAngleDeg();
  if (angle) skins.angle = { top: angle, bottom: angle, back: angle };
  return skins;
}

function gamePreviewPayload(options = {}) {
  const force = !!options.force;
  const blueprint = derivedBlueprint();
  const blueprintKey = JSON.stringify(blueprint);
  const skinVersion = state.previewSkinVersion || 0;
  const includeBlueprint = force || blueprintKey !== gamePreviewSentBlueprintKey || blueprintKey !== gamePreviewConfirmedBlueprintKey;
  const includeSkins = force || skinVersion !== gamePreviewSentSkinVersion;
  const mode = options.mode || gamePreviewRendererMode();
  const fxLevel = options.fxLevel || gamePreviewFxLevel();
  return {
    id: templateShipId(),
    name: els.shipName.value.trim() || templateShipId(),
    blueprintKey,
    bitmapSkinVersion: skinVersion,
    ...(includeBlueprint ? { blueprint } : {}),
    gameMeta: gameMetadata(),
    ...(includeSkins ? { bitmapSkins: gamePreviewBitmapSkins() } : {}),
    view: { rx: state.view.rx, ry: state.view.ry, roll: 0 },
    mode,
    fxLevel,
    quality: "live",
    lightMode: "camera",
    projection: gameRendererOverlayMode(),
    targetScale: .56
  };
}

function gamePreviewSyncKey(payload) {
  return JSON.stringify({
    id: payload.id,
    blueprintKey: payload.blueprintKey,
    bitmapVersion: payload.bitmapSkinVersion || 0,
    view: {
      rx: Math.round((payload.view?.rx || 0) * 1000) / 1000,
      ry: Math.round((payload.view?.ry || 0) * 1000) / 1000,
      roll: Math.round((payload.view?.roll || 0) * 1000) / 1000
    },
    mode: payload.mode,
    fxLevel: payload.fxLevel,
    quality: payload.quality,
    projection: !!payload.projection,
    targetScale: payload.targetScale,
    baseColor: payload.gameMeta?.baseColor,
    decalRole: payload.gameMeta?.decalRole
  });
}

function gamePreviewViewPayload() {
  return {
    id: templateShipId(),
    name: els.shipName.value.trim() || templateShipId(),
    blueprintKey: gamePreviewSentBlueprintKey,
    bitmapSkinVersion: gamePreviewSentSkinVersion || state.previewSkinVersion || 0,
    view: { rx: state.view.rx, ry: state.view.ry, roll: 0 },
    mode: gamePreviewRendererMode(),
    fxLevel: gamePreviewFxLevel(),
    quality: "live",
    lightMode: "camera",
    projection: gameRendererOverlayMode(),
    targetScale: .56
  };
}

function syncGamePreview(force = false) {
  const frame = els.gamePreviewFrame;
  if (!frame?.contentWindow) return;
  try {
    const payload = gamePreviewPayload({ force });
    const key = gamePreviewSyncKey(payload);
    if (!force && key === gamePreviewLastKey) return;
    gamePreviewLastKey = key;
    if (payload.blueprint) {
      gamePreviewSentBlueprintKey = payload.blueprintKey;
      gamePreviewConfirmedBlueprintKey = "";
    }
    if (Object.prototype.hasOwnProperty.call(payload, "bitmapSkins")) gamePreviewSentSkinVersion = payload.bitmapSkinVersion || 0;
    state.gamePreviewInfo = null;
    state.gamePreviewProjection = null;
    updatePreviewTrustUi();
    frame.contentWindow.postMessage({
      type: "ultra-elite-render-preview",
      payload
    }, "*");
    if (els.gamePreviewReadout) els.gamePreviewReadout.textContent = `${templateShipId().toUpperCase()} REFRESHING REAL RENDERER.`;
  } catch (error) {
    if (els.gamePreviewReadout) els.gamePreviewReadout.textContent = `GAME RENDER SYNC FAILED: ${error.message}`;
  }
}

function syncGamePreviewView() {
  const frame = els.gamePreviewFrame;
  if (!frame?.contentWindow || !gamePreviewSentBlueprintKey || gamePreviewConfirmedBlueprintKey !== gamePreviewSentBlueprintKey) return;
  const payload = gamePreviewViewPayload();
  const key = gamePreviewSyncKey(payload);
  if (key === gamePreviewLastKey) return;
  gamePreviewLastKey = key;
  frame.contentWindow.postMessage({
    type: "ultra-elite-render-preview",
    payload
  }, "*");
}

function queueGamePreviewViewSync() {
  if (gamePreviewViewFrame || !gamePreviewSentBlueprintKey || gamePreviewConfirmedBlueprintKey !== gamePreviewSentBlueprintKey) return;
  gamePreviewViewFrame = requestAnimationFrame(() => {
    gamePreviewViewFrame = 0;
    syncGamePreviewView();
  });
}

function resetGamePreviewSyncState() {
  clearTimeout(gamePreviewTimer);
  if (gamePreviewViewFrame) cancelAnimationFrame(gamePreviewViewFrame);
  gamePreviewViewFrame = 0;
  gamePreviewLastKey = "";
  gamePreviewSentBlueprintKey = "";
  gamePreviewConfirmedBlueprintKey = "";
  gamePreviewSentSkinVersion = 0;
  state.gamePreviewInfo = null;
  state.gamePreviewProjection = null;
  updatePreviewTrustUi();
}

function spinPreviewPayload() {
  return {
    ...gamePreviewPayload({ force: true, mode: "solid", fxLevel: "ultra" }),
    view: { rx: state.view.rx, ry: state.view.ry, roll: 0 },
    mode: "solid",
    fxLevel: "ultra",
    projection: false,
    autoRotate: true,
    targetScale: .62
  };
}

function storeSpinPreviewPayload(payload) {
  try {
    localStorage.setItem(SPIN_PREVIEW_STORAGE_KEY, JSON.stringify({ savedAt: Date.now(), payload }));
  } catch (error) {
    console.warn("Spin preview local handoff failed", error);
  }
}

function broadcastSpinPreviewPayload(payload) {
  if (!("BroadcastChannel" in window)) return;
  const channel = new BroadcastChannel(SPIN_PREVIEW_CHANNEL);
  channel.postMessage({
    type: "ultra-elite-render-preview",
    payload
  });
  channel.close();
}

function postSpinPreviewPayload(targetWindow, payload = spinPreviewPayload()) {
  storeSpinPreviewPayload(payload);
  broadcastSpinPreviewPayload(payload);
  if (!targetWindow) return false;
  targetWindow.postMessage({
    type: "ultra-elite-render-preview",
    payload
  }, "*");
  return true;
}

function closeSpinPreviewWindow() {
  els.spinPreviewModal?.classList.add("is-hidden");
  const frame = els.spinPreviewFrame;
  if (frame?.contentWindow) {
    frame.contentWindow.postMessage({
      type: "ultra-elite-render-preview",
      payload: { autoRotate: false }
    }, "*");
  }
  if (frame) frame.src = "about:blank";
  setStatus("SPIN PREVIEW CLOSED.");
}

function openSpinPreviewWindow() {
  const payload = spinPreviewPayload();
  storeSpinPreviewPayload(payload);
  const frame = els.spinPreviewFrame;
  if (!frame) {
    setStatus("SPIN PREVIEW FRAME MISSING.");
    return;
  }
  els.spinPreviewModal?.classList.remove("is-hidden");
  setStatus("OPENING SPIN PREVIEW...");
  const sendSnapshot = () => {
    if (postSpinPreviewPayload(frame.contentWindow, payload)) setStatus("SPIN PREVIEW UPDATED.");
  };
  const handleReady = (event) => {
    if (event.source !== frame.contentWindow) return;
    if (event.data?.type !== "ultra-elite-render-preview-ready") return;
    window.removeEventListener("message", handleReady);
    sendSnapshot();
  };
  window.addEventListener("message", handleReady);
  frame.src = `render-preview.html?spin=1&embed=${Date.now()}`;
  setTimeout(sendSnapshot, 450);
  setTimeout(sendSnapshot, 1200);
}

function rendererBenchmarkFrames() {
  const frames = [];
  const addFrame = (rx, ry, phase, warmup = false) => frames.push({ rx, ry, phase, warmup });
  for (let i = 0; i < 6; i++) addFrame(-0.35, i * TAU / 6, "warmup", true);
  for (let i = 0; i < 36; i++) addFrame(-0.35, i * TAU / 36, "yaw");
  for (let i = 0; i < 28; i++) {
    const t = i / 27;
    addFrame(-1.05 + t * 2.1, 0.75, "pitch");
  }
  return frames;
}

function rendererBenchmarkStats(samples) {
  const sorted = samples.filter(Number.isFinite).slice().sort((a, b) => a - b);
  if (!sorted.length) return { count: 0, avg: 0, median: 0, p95: 0, max: 0 };
  const pick = (q) => sorted[Math.min(sorted.length - 1, Math.max(0, Math.floor(q * (sorted.length - 1))))];
  const avg = sorted.reduce((sum, value) => sum + value, 0) / sorted.length;
  return {
    count: sorted.length,
    avg,
    median: pick(.5),
    p95: pick(.95),
    max: sorted[sorted.length - 1]
  };
}

function rendererBenchmarkReport(stats, wallMs, frames) {
  const fps = stats.avg > 0 ? 1000 / stats.avg : 0;
  return `BENCH ${stats.count} FRAMES: MED ${stats.median.toFixed(1)}MS  P95 ${stats.p95.toFixed(1)}MS  MAX ${stats.max.toFixed(1)}MS  AVG ${stats.avg.toFixed(1)}MS (${fps.toFixed(0)} FPS)  WALL ${(wallMs / 1000).toFixed(1)}S  WARMUP ${frames.filter((frame) => frame.warmup).length}`;
}

function waitForBenchmarkReady(frame, timeoutMs = 6000) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      window.removeEventListener("message", onMessage);
      reject(new Error("benchmark renderer timed out"));
    }, timeoutMs);
    const onMessage = (event) => {
      if (event.source !== frame.contentWindow) return;
      if (event.data?.type !== "ultra-elite-render-preview-ready") return;
      clearTimeout(timeout);
      window.removeEventListener("message", onMessage);
      resolve();
    };
    window.addEventListener("message", onMessage);
  });
}

function renderBenchmarkFrame(frame, payload, timeoutMs = 5000) {
  return new Promise((resolve, reject) => {
    const requestId = payload.benchmarkRequestId;
    const timeout = setTimeout(() => {
      window.removeEventListener("message", onMessage);
      reject(new Error(`benchmark frame ${requestId} timed out`));
    }, timeoutMs);
    const onMessage = (event) => {
      if (event.source !== frame.contentWindow) return;
      const data = event.data || {};
      if (data.type !== "ultra-elite-render-preview-result") return;
      if (data.benchmarkRequestId !== requestId) return;
      clearTimeout(timeout);
      window.removeEventListener("message", onMessage);
      resolve(data);
    };
    window.addEventListener("message", onMessage);
    frame.contentWindow.postMessage({
      type: "ultra-elite-render-preview",
      payload
    }, "*");
  });
}

function benchmarkFramePayload(basePayload, frame, runId, index) {
  const common = {
    id: basePayload.id,
    name: basePayload.name,
    blueprintKey: basePayload.blueprintKey,
    bitmapSkinVersion: basePayload.bitmapSkinVersion || 0,
    benchmarkRequestId: `${runId}:${index}`,
    view: { rx: frame.rx, ry: frame.ry, roll: 0 },
    mode: "solid",
    fxLevel: "ultra",
    quality: "live",
    projection: false,
    targetScale: .62
  };
  if (index === 0) {
    return {
      ...basePayload,
      ...common,
      projection: false,
      autoRotate: false
    };
  }
  return common;
}

async function runRendererBenchmark() {
  if (rendererBenchmarkRunning) return;
  rendererBenchmarkRunning = true;
  if (els.benchmarkRendererBtn) els.benchmarkRendererBtn.disabled = true;
  const frame = document.createElement("iframe");
  frame.className = "renderer-benchmark-frame";
  frame.title = "Renderer benchmark";
  document.body.append(frame);
  const ready = waitForBenchmarkReady(frame);
  frame.src = `render-preview.html?benchmark=${Date.now()}`;
  const runId = `bench_${Date.now().toString(36)}`;
  const frames = rendererBenchmarkFrames();
  const samples = [];
  const wallStart = performance.now();
  try {
    setStatus(`RENDER BENCHMARK STARTING (${frames.length} FRAMES)...`);
    if (els.gamePreviewReadout) els.gamePreviewReadout.textContent = "BENCHMARK: LOADING RENDERER...";
    await ready;
    const basePayload = {
      ...gamePreviewPayload({ force: true }),
      projection: false,
      targetScale: .62
    };
    for (let i = 0; i < frames.length; i++) {
      const sample = frames[i];
      if (els.gamePreviewReadout && (i === 0 || i % 10 === 0)) {
        els.gamePreviewReadout.textContent = `BENCHMARK: ${i + 1}/${frames.length} ${sample.phase.toUpperCase()}`;
      }
      const result = await renderBenchmarkFrame(frame, benchmarkFramePayload(basePayload, sample, runId, i));
      if (!sample.warmup) samples.push(Number(result.renderMs) || 0);
      await new Promise((resolve) => requestAnimationFrame(resolve));
    }
    const stats = rendererBenchmarkStats(samples);
    const report = rendererBenchmarkReport(stats, performance.now() - wallStart, frames);
    setStatus(report);
    if (els.gamePreviewReadout) els.gamePreviewReadout.textContent = report;
  } catch (error) {
    const message = `RENDER BENCHMARK FAILED: ${error.message}`;
    setStatus(message);
    if (els.gamePreviewReadout) els.gamePreviewReadout.textContent = message;
  } finally {
    frame.remove();
    if (els.benchmarkRendererBtn) els.benchmarkRendererBtn.disabled = false;
    rendererBenchmarkRunning = false;
  }
}

function scheduleGamePreviewSync(delay = 260, force = false) {
  if (!gameRendererPreviewMode()) return;
  if (force) {
    clearTimeout(gamePreviewTimer);
    if (gamePreviewViewFrame) cancelAnimationFrame(gamePreviewViewFrame);
    gamePreviewViewFrame = 0;
    gamePreviewTimer = setTimeout(() => syncGamePreview(true), Math.max(0, delay));
    return;
  }
  if (gamePreviewSentBlueprintKey) queueGamePreviewViewSync();
  clearTimeout(gamePreviewTimer);
  gamePreviewTimer = setTimeout(() => syncGamePreview(false), delay);
}

function kickInitialGamePreviewSync() {
  if (!gameRendererPreviewMode()) return;
  syncGamePreview(true);
  requestAnimationFrame(() => syncGamePreview(true));
  setTimeout(() => syncGamePreview(true), 250);
  setTimeout(() => syncGamePreview(true), 900);
}

function summarizeGamePreviewInfo(info) {
  const summary = gamePreviewProjectionSummary(info);
  if (!summary) return "REAL RENDERER READY.";
  const suffix = summary.missingUv ? `  ${summary.missingUv} FACE UV GAP${summary.missingUv === 1 ? "" : "S"}` : "";
  return `REAL RENDERER: ${summary.visibleFaces}/${summary.faces} VISIBLE FACES  ${summary.projectedPoints} POINTS  ${summary.faceTextureRefs} FACE UVS${suffix}`;
}

function handleGamePreviewResult(data) {
  if (data?.blueprintKey && gamePreviewSentBlueprintKey && data.blueprintKey !== gamePreviewSentBlueprintKey) {
    gamePreviewLastKey = "";
    scheduleGamePreviewSync(0, true);
    return;
  }
  if (data?.blueprintKey && data.blueprintKey === gamePreviewSentBlueprintKey) {
    gamePreviewConfirmedBlueprintKey = data.blueprintKey;
  }
  const info = data?.info || null;
  state.gamePreviewInfo = info;
  state.gamePreviewProjection = info?.projection || null;
  if (els.gamePreviewReadout) els.gamePreviewReadout.textContent = summarizeGamePreviewInfo(info);
  updatePreviewTrustUi();
  renderMain();
}

function updateUi() {
  els.vertexCount.textContent = `${state.verts.length} vertices`;
  els.faceCount.textContent = `${state.faces.length} faces`;
  els.edgeCount.textContent = `${state.edges.length} lines`;
  const faceGroupText = state.selectedFaceIds.size
    ? ` | Face group ${[...state.selectedFaceIds].map((id) => `#${id}`).join(" ")}`
    : "";
  els.pickList.textContent = `${state.pick.length ? state.pick.map((id) => `#${id}`).join("  ") : "Pick list empty"}${faceGroupText}`;

  if (!state.selected) els.selectionReadout.textContent = "Nothing selected";
  else if (state.selected.type === "vertex") {
    const v = vertexById(state.selected.id);
    const beaconText = v && hasBeaconAtVertex(v.id) ? "  beacon" : "";
    els.selectionReadout.textContent = v ? `Vertex #${v.id}  X ${round(v.x)}  Y ${round(v.y)}  Z ${round(v.z)}${v.mirrorId ? `  mirror #${v.mirrorId}` : "  centre"}${beaconText}` : "Missing vertex";
  } else if (state.selected.type === "face") {
    const face = faceById(state.selected.id);
    const n = face ? faceNormal(face) : null;
    const autoSide = face ? autoTemplateSideForFace(face) : "";
    const bitmapSide = face ? (validBitmapFaceSide(face.bitmapSide) || `auto/${autoSide}`) : "";
    const faceSkin = face ? cleanBitmapKey(face.bitmapFaceKey) : "";
    const faceAngle = face ? normalizeBitmapAngle(face.bitmapAngle) : 0;
    const faceMirror = face?.bitmapMirrorX ? "  half-mirror" : "";
    const faceColor = optionalHexColor(face?.faceColor);
    els.selectionReadout.textContent = n
      ? `Face #${state.selected.id}  normal X ${round(n.x, 2)}  Y ${round(n.y, 2)}  Z ${round(n.z, 2)}  bitmap ${bitmapSide}${faceSkin ? `  face ${faceSkin}` : ""}${faceAngle ? `  angle ${faceAngle}` : ""}${faceMirror}${faceColor ? `  colour ${faceColor}` : ""}`
      : `Face #${state.selected.id}`;
  } else {
    els.selectionReadout.textContent = `${state.selected.type.toUpperCase()} #${state.selected.id}`;
  }
  updateSliders();
  updateDetailControls();
  updateFaceBitmapSideControl();
  updateFaceUvAngleControls();
}

function updateSliders() {
  const v = state.selected?.type === "vertex" ? vertexById(state.selected.id) : null;
  const fallback = v || { x: 0, y: 0, z: 0 };
  for (const axis of ["x", "y", "z"]) {
    els[`${axis}Slider`].value = Math.round(fallback[axis]);
    els[`${axis}Value`].value = Math.round(fallback[axis]);
    els[`${axis}Slider`].disabled = !v || (axis === "x" && v.center);
    els[`${axis}Value`].disabled = !v || (axis === "x" && v.center);
  }
}

function updateDetailControls() {
  const detail = state.selected?.type === "detail" ? detailById(state.selected.id) : null;
  els.detailInset.disabled = !detail || !detail.faceId;
  els.detailColor.disabled = !detail;
  if (detail) {
    els.detailInset.value = detail.inset ?? 0.45;
    els.detailColor.value = detail.color || "#101915";
  }
}

function updateFaceBitmapSideControl() {
  if (!els.templateFaceSide) return;
  const face = state.selected?.type === "face" ? faceById(state.selected.id) : null;
  els.templateFaceSide.disabled = !face;
  els.templateFaceSide.value = face ? (validBitmapFaceSide(face.bitmapSide) || "auto") : "auto";
}

function setSelectedFaceBitmapSide(value) {
  const face = state.selected?.type === "face" ? faceById(state.selected.id) : null;
  if (!face) {
    setStatus("SELECT A FACE FIRST.");
    updateFaceBitmapSideControl();
    return;
  }
  const side = validBitmapFaceSide(value);
  if (side) face.bitmapSide = side;
  else delete face.bitmapSide;
  if (mirrorActionsEnabled()) syncMirroredFace(face);
  setStatus(side ? `FACE BITMAP SIDE SET TO ${side.toUpperCase()}.` : "FACE BITMAP SIDE SET TO AUTO.");
  renderAll();
}

function clearEditorSelection() {
  state.selected = null;
  state.pick = [];
}

function syncModeUi(mode) {
  els.toolsPanel.dataset.mode = mode;
  document.querySelectorAll(".mode-btn").forEach((b) => b.classList.toggle("active", b.dataset.mode === mode));
}

function nearestVertex(point, projected, maxDist = 14) {
  let best = null;
  let bestDist = maxDist;
  for (const [id, p] of projected) {
    const d = Math.hypot(p.x - point.x, p.y - point.y);
    if (d < bestDist) {
      best = id;
      bestDist = d;
    }
  }
  return best;
}

function pointInPoly(point, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i], b = poly[j];
    if (((a.y > point.y) !== (b.y > point.y)) && point.x < (b.x - a.x) * (point.y - a.y) / ((b.y - a.y) || EPS) + a.x) inside = !inside;
  }
  return inside;
}

function distToSegment(p, a, b) {
  const dx = b.x - a.x, dy = b.y - a.y;
  const l2 = dx * dx + dy * dy || 1;
  const t = clamp(((p.x - a.x) * dx + (p.y - a.y) * dy) / l2, 0, 1);
  return Math.hypot(p.x - (a.x + dx * t), p.y - (a.y + dy * t));
}

function nearestDetail(point, maxLineDist = 10) {
  let bestDetail = null;
  let bestLineDist = maxLineDist;
  for (const d of state.details) {
    const pts = projectedDetailPointsForMain(d, els.mainView);
    if (d.type === "beacon") {
      const p = pts[0];
      if (!p) continue;
      const dist = Math.hypot(p.x - point.x, p.y - point.y);
      if (dist < bestLineDist) {
        bestLineDist = dist;
        bestDetail = d;
      }
      continue;
    }
    if (pts.length < 2) continue;
    if (d.type === "panel" || d.type === "line" || d.type === "polyline") {
      for (let i = 0; i < pts.length - 1; i++) {
        const dist = distToSegment(point, pts[i], pts[i + 1]);
        if (dist < bestLineDist) {
          bestLineDist = dist;
          bestDetail = d;
        }
      }
    } else if (pointInPoly(point, pts)) {
      bestDetail = d;
    }
  }
  return bestDetail;
}

function selectInMain(point, options = {}) {
  const projected = projectedMapForMain(els.mainView);
  if (state.mode === "vertex") {
    const id = nearestVertex(point, projected);
    if (id) selectVertex(id);
    return;
  }
  if (state.mode === "edge") {
    const id = nearestVertex(point, projected);
    if (id) {
      selectVertex(id);
      return;
    }
  }
  if (state.mode === "face") {
    const faces = [...state.faces].sort((a, b) => faceSortDepthForMain(a) - faceSortDepthForMain(b));
    const hit = faces.find((face) => {
      const previewFace = previewFaceForBuilderFace(face);
      if (gameRendererOverlayMode() && previewFace && !previewFace.visible) return false;
      return pointInPoly(point, face.verts.map((id) => projected.get(id)).filter(Boolean));
    });
    if (hit) {
      state.selected = { type: "face", id: hit.id };
      if (options.multiSelect) {
        if (state.selectedFaceIds.has(hit.id)) {
          state.selectedFaceIds.delete(hit.id);
          setStatus(`FACE #${hit.id} REMOVED FROM FACE GROUP (${state.selectedFaceIds.size} SELECTED).`);
        } else {
          state.selectedFaceIds.add(hit.id);
          setStatus(`FACE #${hit.id} ADDED TO FACE GROUP (${state.selectedFaceIds.size} SELECTED).`);
        }
      } else {
        state.selectedFaceIds.clear();
        setStatus(`FACE #${hit.id} SELECTED. SHIFT-CLICK TO BUILD A FACE GROUP.`);
      }
      renderAll();
    }
    return;
  }
  if (state.mode === "edge") {
    let best = null, bestDist = 12;
    for (const e of state.edges) {
      const a = projected.get(e.a), b = projected.get(e.b);
      if (!a || !b) continue;
      const d = distToSegment(point, a, b);
      if (d < bestDist) { best = e; bestDist = d; }
    }
    if (best) {
      state.selected = { type: "edge", id: best.id };
      setStatus(`${best.kind.toUpperCase()} #${best.id} SELECTED.`);
      renderAll();
      return;
    }
    const detailHit = nearestDetail(point);
    if (detailHit) {
      state.mode = "detail";
      syncModeUi("detail");
      state.selected = { type: "detail", id: detailHit.id };
      setStatus(`${detailHit.type === "panel" ? "PANEL LINE" : "DETAIL"} #${detailHit.id} SELECTED.`);
      renderAll();
    }
    return;
  }
  const bestDetail = nearestDetail(point);
  if (bestDetail) {
    state.selected = { type: "detail", id: bestDetail.id };
    setStatus(`${bestDetail.type === "panel" ? "PANEL LINE" : "DETAIL"} #${bestDetail.id} SELECTED.`);
    renderAll();
    return;
  }
  if (state.mode === "detail") {
    const faces = [...state.faces].sort((a, b) => faceSortDepthForMain(a) - faceSortDepthForMain(b));
    const hit = faces.find((face) => {
      const previewFace = previewFaceForBuilderFace(face);
      if (gameRendererOverlayMode() && previewFace && !previewFace.visible) return false;
      return pointInPoly(point, face.verts.map((id) => projected.get(id)).filter(Boolean));
    });
    if (hit) {
      state.selected = { type: "face", id: hit.id };
      setStatus(`FACE #${hit.id} SELECTED FOR DETAILS.`);
    }
    renderAll();
  }
}

function selectVertex(id) {
  const v = vertexById(id);
  if (!v) return;
  state.selected = { type: "vertex", id };
  const existing = state.pick.indexOf(id);
  if (existing >= 0) {
    state.pick.splice(existing, 1);
    setStatus(`VERTEX #${id} REMOVED FROM PICK LIST.`);
  } else {
    state.pick.push(id);
    setStatus(`VERTEX #${id} ADDED TO PICK LIST.`);
  }
  renderAll();
}

function getCanvasPoint(ev, canvas) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (ev.clientX - rect.left) * canvas.width / rect.width,
    y: (ev.clientY - rect.top) * canvas.height / rect.height
  };
}

function fitView() {
  const r = modelRadius();
  state.view.zoom = clamp(300 / r, 1.35, 4.2);
  state.view.panX = 0;
  state.view.panY = 0;
}

function setStandardView() {
  state.view.rx = STANDARD_VIEW.rx;
  state.view.ry = STANDARD_VIEW.ry;
  updateProjectionViewButtons();
}

function activeProjectionViewName() {
  for (const [name, view] of Object.entries(PROJECTION_VIEW_PRESETS)) {
    if (Math.abs(normalizeRadians(state.view.rx - view.rx)) < .001
      && Math.abs(normalizeRadians(state.view.ry - view.ry)) < .001) {
      return name;
    }
  }
  return "";
}

function updateProjectionViewButtons() {
  const active = activeProjectionViewName();
  document.querySelectorAll("[data-view-preset]").forEach((button) => {
    button.classList.toggle("active", button.dataset.viewPreset === active);
  });
}

function setProjectionView(name, options = {}) {
  const preset = PROJECTION_VIEW_PRESETS[name];
  if (!preset) return false;
  state.view.rx = preset.rx;
  state.view.ry = preset.ry;
  if (options.fit !== false) fitView();
  updateProjectionViewButtons();
  if (options.status !== false) setStatus(`${preset.label} PROJECTION VIEW.`);
  if (options.redraw !== false) renderAll();
  return true;
}

function deleteSelected() {
  if (!state.selected) return;
  const { type, id } = state.selected;
  if (type === "vertex") {
    const v = vertexById(id);
    const ids = new Set([id, mirrorActionsEnabled() ? v?.mirrorId : null].filter(Boolean));
    state.verts = state.verts.filter((item) => !ids.has(item.id));
    state.faces = state.faces.filter((f) => !f.verts.some((vid) => ids.has(vid)));
    state.edges = state.edges.filter((e) => !ids.has(e.a) && !ids.has(e.b));
    state.details = state.details.filter((d) => {
      if (d.vertexId) return !ids.has(Number(d.vertexId));
      return faceById(d.faceId);
    });
    state.pick = state.pick.filter((vid) => !ids.has(vid));
  } else if (type === "face") {
    const face = faceById(id);
    const mirror = face && mirrorActionsEnabled() ? mirroredFaceOf(face) : null;
    const ids = new Set([id, mirror?.id].filter(Boolean));
    state.faces = state.faces.filter((f) => !ids.has(f.id));
    state.details = state.details.filter((d) => !ids.has(d.faceId));
    for (const faceId of ids) state.selectedFaceIds.delete(faceId);
  } else if (type === "edge") {
    const edge = state.edges.find((e) => e.id === id);
    const mirror = edge && mirrorActionsEnabled() ? mirroredEdgeOf(edge) : null;
    const ids = new Set([id, mirror?.id].filter(Boolean));
    state.edges = state.edges.filter((e) => !ids.has(e.id));
  } else if (type === "detail") {
    const detail = detailById(id);
    const mirror = detail && mirrorActionsEnabled() ? mirroredDetailOf(detail) : null;
    const ids = new Set([id, mirror?.id].filter(Boolean));
    state.details = state.details.filter((d) => !ids.has(d.id));
  }
  state.selected = null;
  setStatus("SELECTION DELETED.");
  renderAll();
}

function appendPickedToSelectedFace() {
  const face = state.selected?.type === "face" ? faceById(state.selected.id) : null;
  if (!face) return setStatus("SELECT A FACE FIRST.");
  const additions = state.pick.filter((id) => vertexById(id) && !face.verts.includes(id));
  if (!additions.length) return setStatus("PICK A NEW VERTEX FIRST.");
  face.verts.push(...additions);
  if (mirrorActionsEnabled()) syncMirroredFace(face);
  state.pick = [];
  setStatus("PICKED VERTEX ADDED TO FACE.");
  renderAll();
}

function removePickedFromSelectedFace() {
  const face = state.selected?.type === "face" ? faceById(state.selected.id) : null;
  if (!face) return setStatus("SELECT A FACE FIRST.");
  const removals = new Set(state.pick);
  if (!removals.size) return setStatus("PICK A FACE VERTEX FIRST.");
  const next = face.verts.filter((id) => !removals.has(id));
  if (next.length < 3) return setStatus("FACE NEEDS AT LEAST THREE VERTICES.");
  face.verts = next;
  if (mirrorActionsEnabled()) syncMirroredFace(face);
  state.pick = [];
  setStatus("PICKED VERTEX REMOVED FROM FACE.");
  renderAll();
}

function flipSelectedFace() {
  const face = state.selected?.type === "face" ? faceById(state.selected.id) : null;
  if (!face) return setStatus("SELECT A FACE FIRST.");
  face.verts.reverse();
  if (mirrorActionsEnabled()) syncMirroredFace(face);
  setStatus("FACE WINDING FLIPPED.");
  renderAll();
}

function derivedBlueprint() {
  const indexById = new Map(state.verts.map((v, i) => [v.id, i]));
  const verts = state.verts.map((v) => [round(v.x), round(v.y), round(v.z)]);
  const faces = state.faces
    .map((f) => f.verts.map((id) => indexById.get(id)).filter((i) => i !== undefined))
    .filter((ids) => ids.length >= 3);
  const normals = faces.map((ids) => {
    const a = vec(...verts[ids[0]]), b = vec(...verts[ids[1]]), c = vec(...verts[ids[2]]);
    const n = norm(cross(sub(b, a), sub(c, a)));
    return [round(n.x * 100), round(n.y * 100), round(n.z * 100)];
  });
  const edgeMap = new Map();
  const addDerivedEdge = (a, b, faceIndex = -1, kind = "edge") => {
    if (a === b) return;
    const key = a < b ? `${a},${b}` : `${b},${a}`;
    if (!edgeMap.has(key)) edgeMap.set(key, { edge: a < b ? [a, b] : [b, a], faces: [], kind });
    const entry = edgeMap.get(key);
    if (faceIndex >= 0) entry.faces.push(faceIndex);
    if (kind === "stick") entry.kind = "stick";
  };
  faces.forEach((ids, faceIndex) => {
    for (let i = 0; i < ids.length; i++) addDerivedEdge(ids[i], ids[(i + 1) % ids.length], faceIndex);
  });
  state.edges.forEach((e) => {
    const a = indexById.get(e.a), b = indexById.get(e.b);
    if (a !== undefined && b !== undefined) addDerivedEdge(a, b, -1, e.kind);
  });
  const edgeEntries = [...edgeMap.values()];
  const edges = edgeEntries.map((e) => e.edge);
  const edgeFaces = edgeEntries.map((e) => {
    const unique = [...new Set(e.faces)];
    if (!unique.length) return [-1, -1];
    if (unique.length === 1) return [unique[0], unique[0]];
    return [unique[0], unique[1]];
  });
  const edgeVisibility = edges.map(() => 31);
  const details = state.details.map((d) => {
    if (d.type === "beacon") {
      const index = indexById.get(Number(d.vertexId));
      if (index === undefined) return null;
      return {
        type: "beacon",
        index,
        color: d.color || "#ffb642"
      };
    }
    const face = faceById(d.faceId);
    if (!face && (Array.isArray(d.points) || Array.isArray(d.indices))) {
      const detail = {
        type: d.type === "panel" ? "line" : d.type,
        color: d.color,
        ...(d.stroke ? { stroke: d.stroke } : {}),
        ...(d.width ? { width: d.width } : {}),
        ...(d.lift ? { lift: d.lift } : {}),
        ...(d.cull === false ? { cull: false } : {}),
        ...(d.cullEpsilon !== undefined ? { cullEpsilon: d.cullEpsilon } : {}),
        normal: Array.isArray(d.normal) ? d.normal.map((n) => round(Number(n), 3)) : [0, 0, 1]
      };
      if (Array.isArray(d.indices)) {
        const mapped = d.indices
          .map((id) => indexById.get(Number(id)))
          .filter((i) => i !== undefined);
        if (mapped.length >= 2) return { ...detail, indices: mapped };
      }
      const points = detailModelPoints(d).map(toArray);
      if (points.length >= 2) return { ...detail, points };
      return null;
    }
    if (!face) return null;
    const normal = faceNormal(face);
    const points = detailModelPoints(d).map(toArray);
    const base = {
      type: d.type === "panel" ? "line" : d.type,
      color: d.color,
      normal: toArray(normal),
      lift: 0.5
    };
    if (d.type === "panel") {
      return { ...base, type: "polyline", points, width: 1.2 };
    }
    return { ...base, points, stroke: d.type === "engine" ? "#ffffff" : undefined };
  }).filter(Boolean);
  const faceSides = state.faces.map((f) => validBitmapFaceSide(f.bitmapSide) || null);
  const faceTextures = state.faces.map((f) => cleanBitmapKey(f.bitmapFaceKey) || null);
  const faceTextureUv = state.faces.map((f) => cleanFaceBitmapUv(f));
  const faceTextureBaseW = state.faces.map((f) => Number.isFinite(Number(f.bitmapBaseW)) && Number(f.bitmapBaseW) > 0 ? Math.round(Number(f.bitmapBaseW)) : null);
  const faceTextureBaseH = state.faces.map((f) => Number.isFinite(Number(f.bitmapBaseH)) && Number(f.bitmapBaseH) > 0 ? Math.round(Number(f.bitmapBaseH)) : null);
  const faceColors = state.faces.map((f) => optionalHexColor(f.faceColor) || null);
  const faceAngles = state.faces.map((f) => normalizeBitmapAngle(f.bitmapAngle) || null);
  const faceMirrorX = state.faces.map((f) => !!f.bitmapMirrorX);
  const faceDecals = state.faces.map((f) => {
    const decals = cleanFaceDecals(f.bitmapDecals);
    return decals.length ? decals : null;
  });
  const primaryAxis = templatePrimaryAxis();
  const imageProjection = {
    ...(primaryAxis !== "y" ? { primaryAxis } : {}),
    ...(faceSides.some(Boolean) ? { faceSides } : {}),
    ...(faceTextures.some(Boolean) ? { faceTextures } : {}),
    ...(faceTextureUv.some(Boolean) ? { faceTextureUv } : {}),
    ...(faceTextureBaseW.some(Boolean) ? { faceTextureBaseW } : {}),
    ...(faceTextureBaseH.some(Boolean) ? { faceTextureBaseH } : {}),
    ...(faceColors.some(Boolean) ? { faceColors } : {}),
    ...(faceAngles.some((angle) => angle != null) ? { faceAngles } : {}),
    ...(faceMirrorX.some(Boolean) ? { faceMirrorX } : {}),
    ...(faceDecals.some((decals) => decals?.length) ? { faceDecals } : {})
  };
  const hasImageProjection = !!imageProjection.primaryAxis || !!imageProjection.faceSides || !!imageProjection.faceTextures || !!imageProjection.faceTextureUv || !!imageProjection.faceColors || !!imageProjection.faceAngles || !!imageProjection.faceMirrorX || !!imageProjection.faceDecals;
  return {
    verts,
    faces,
    edges,
    edgeFaces,
    edgeVisibility,
    normals,
    details,
    ...(hasImageProjection ? { imageProjection } : {}),
    gameMeta: gameMetadata()
  };
}

function numberFromInput(input, fallback = 0) {
  const n = Number(input.value);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeHexColor(value, fallback = "#e9f2e4") {
  const text = String(value || "").trim();
  return /^#[0-9a-f]{6}$/i.test(text) ? text : fallback;
}

function optionalHexColor(value) {
  const text = String(value || "").trim();
  return /^#[0-9a-f]{6}$/i.test(text) ? text.toLowerCase() : null;
}

function averageImageColor(img) {
  if (!img?.naturalWidth || !img?.naturalHeight) return null;
  const canvas = document.createElement("canvas");
  const sample = 64;
  const scale = Math.min(1, sample / Math.max(img.naturalWidth, img.naturalHeight));
  canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  try {
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let r = 0, g = 0, b = 0, aTotal = 0;
    for (let i = 0; i < data.length; i += 4) {
      const a = data[i + 3];
      if (a <= 8) continue;
      r += data[i] * a;
      g += data[i + 1] * a;
      b += data[i + 2] * a;
      aTotal += a;
    }
    if (!aTotal) return null;
    const toHex = (n) => Math.round(n / aTotal).toString(16).padStart(2, "0");
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  } catch {
    return null;
  }
}

function exportedImageDecalMirrorX() {
  const flags = {
    top: !!state.skinImages?.mirrorX?.top,
    bottom: !!state.skinImages?.mirrorX?.bottom,
    back: !!state.skinImages?.mirrorX?.back
  };
  return Object.values(flags).some(Boolean) ? flags : null;
}

function gameMetadata() {
  const radius = Math.round(modelRadius());
  const imageDecalMirrorX = exportedImageDecalMirrorX();
  const imageDecalAngle = sideSkinAngleDeg();
  return {
    class: els.shipClass.value,
    npcRole: els.npcRole.value,
    aiProfile: els.aiProfile.value,
    decalRole: els.decalRole.value,
    baseColor: normalizeHexColor(els.baseColor.value),
    description: els.shipDescription.value.trim(),
    missionLore: els.shipMissionLore.value.trim(),
    ...(imageDecalMirrorX ? { imageDecalMirrorX } : {}),
    ...(imageDecalAngle ? { imageDecalAngle: { top: imageDecalAngle, bottom: imageDecalAngle, back: imageDecalAngle } } : {}),
    valueCr: Math.max(0, Math.round(numberFromInput(els.shipValue, 0))),
    stats: {
      r: radius,
      hp: Math.max(1, Math.round(numberFromInput(els.shipHp, 80))),
      speed: round(clamp(numberFromInput(els.speedMul, 1), 0, 3), 2),
      cargo: Math.max(0, Math.round(numberFromInput(els.cargoTons, 0))),
      missiles: Math.max(0, Math.round(numberFromInput(els.missileCount, 0))),
      laser: els.laserClass.value
    },
    lists: {
      trader: els.flagTrader.checked,
      pirate: els.flagPirate.checked,
      police: els.flagPolice.checked,
      alien: els.flagAlien.checked
    },
    flags: {
      escapePod: els.flagEscapePod.checked,
      hiddenUntilDiscovered: els.flagHidden.checked
    }
  };
}

function builderExport() {
  return {
    format: "ultra-elite-ship-builder/v1",
    id: els.shipId.value.trim() || "custom_ship",
    name: els.shipName.value.trim() || "Custom Ship",
    symmetry: "x-locked",
    gameMeta: gameMetadata(),
    verts: state.verts.map((v) => ({ id: v.id, x: round(v.x), y: round(v.y), z: round(v.z), mirrorId: v.mirrorId, center: !!v.center })),
    faces: state.faces.map((f) => ({
      id: f.id,
      verts: f.verts,
      mirrored: !!f.mirrored,
      ...(optionalHexColor(f.faceColor) ? { faceColor: optionalHexColor(f.faceColor) } : {}),
      ...(validBitmapFaceSide(f.bitmapSide) ? { bitmapSide: f.bitmapSide } : {}),
      ...(cleanBitmapKey(f.bitmapFaceKey) ? { bitmapFaceKey: cleanBitmapKey(f.bitmapFaceKey) } : {}),
      ...(cleanFaceBitmapUv(f) ? { bitmapUv: cleanFaceBitmapUv(f) } : {}),
      ...(Number.isFinite(Number(f.bitmapBaseW)) && Number(f.bitmapBaseW) > 0 && Number.isFinite(Number(f.bitmapBaseH)) && Number(f.bitmapBaseH) > 0 ? { bitmapBaseW: Math.round(Number(f.bitmapBaseW)), bitmapBaseH: Math.round(Number(f.bitmapBaseH)) } : {}),
      ...(normalizeBitmapAngle(f.bitmapAngle) ? { bitmapAngle: normalizeBitmapAngle(f.bitmapAngle) } : {}),
      ...(f.bitmapMirrorX ? { bitmapMirrorX: true } : {}),
      ...(cleanFaceDecals(f.bitmapDecals).length ? { bitmapDecals: cleanFaceDecals(f.bitmapDecals) } : {})
    })),
    edges: state.edges.map((e) => ({ id: e.id, a: e.a, b: e.b, kind: e.kind, mirrored: !!e.mirrored })),
    details: state.details.map((d) => ({ ...d })),
    blueprint: derivedBlueprint()
  };
}

function jsObject(value, indent = 2) {
  return JSON.stringify(value, null, indent)
    .replace(/"([a-zA-Z_$][\w$]*)":/g, "$1:")
    .replace(/"undefined"/g, "undefined");
}

function updateExport() {
  const data = builderExport();
  if (els.exportKind.value === "builder") {
    els.exportText.value = JSON.stringify(data, null, 2);
  } else {
    const id = data.id.replace(/[^\w$]/g, "_") || "custom_ship";
    const bp = derivedBlueprint();
    els.exportText.value = `// Paste inside MODELS. gameMeta is deliberately kept with the model\n// so SHIP_STATS / role lists / lore can be wired from the same export.\n${id}: buildBlueprint(${jsObject(bp, 2)}),`;
  }
}

function importBuilderJson() {
  try {
    const data = JSON.parse(els.importText.value);
    if (!data || !Array.isArray(data.verts) || !Array.isArray(data.faces)) throw new Error("Not builder JSON");
    resetGamePreviewSyncState();
    state.nextId = 1;
    state.verts = data.verts.map((v, index) => {
      const vertex = sourceVertex(v, index);
      state.nextId = Math.max(state.nextId, vertex.id + 1);
      return vertex;
    });
    state.faces = (data.faces || []).map((f, index) => {
      const face = sourceFace(f, index);
      state.nextId = Math.max(state.nextId, face.id + 1);
      return face;
    });
    state.edges = (data.edges || []).map((e, index) => {
      const edge = sourceEdge(e, index);
      state.nextId = Math.max(state.nextId, edge.id + 1);
      return edge;
    });
    state.details = (data.details || []).map((d) => {
      const idNum = Number(d.id);
      if (Number.isFinite(idNum)) state.nextId = Math.max(state.nextId, idNum + 1);
      const faceId = Number(d.faceId);
      return {
        ...d,
        id: Number.isFinite(idNum) ? idNum : newId(),
        faceId: Number.isFinite(faceId) ? faceId : undefined,
        vertexId: Number.isFinite(Number(d.vertexId)) ? Number(d.vertexId) : undefined,
        indices: Array.isArray(d.indices) ? d.indices.map(Number) : undefined,
        segment: Array.isArray(d.segment) ? d.segment.map(Number) : undefined
      };
    });
    inferMirrorVertexIds();
    state.sourceModelId = "";
    els.shipId.value = data.id || els.shipId.value;
    els.shipName.value = data.name || els.shipName.value;
    if (data.gameMeta) {
      const meta = data.gameMeta;
      els.shipDescription.value = meta.description || data.description || "";
      els.shipMissionLore.value = meta.missionLore || meta.mission || "";
      if (meta.class) els.shipClass.value = meta.class;
      if (meta.npcRole) els.npcRole.value = meta.npcRole;
      if (meta.aiProfile) els.aiProfile.value = meta.aiProfile;
      if (meta.decalRole) els.decalRole.value = meta.decalRole;
      if (meta.baseColor) els.baseColor.value = normalizeHexColor(meta.baseColor);
      syncSkinAngle(skinAngleMetaValue(meta), false);
      if (Number.isFinite(meta.valueCr)) els.shipValue.value = meta.valueCr;
      if (meta.stats) {
        if (Number.isFinite(meta.stats.hp)) els.shipHp.value = meta.stats.hp;
        if (Number.isFinite(meta.stats.speed)) els.speedMul.value = meta.stats.speed;
        if (Number.isFinite(meta.stats.cargo)) els.cargoTons.value = meta.stats.cargo;
        if (Number.isFinite(meta.stats.missiles)) els.missileCount.value = meta.stats.missiles;
        if (meta.stats.laser) els.laserClass.value = meta.stats.laser;
      }
      if (meta.lists) {
        els.flagTrader.checked = !!meta.lists.trader;
        els.flagPirate.checked = !!meta.lists.pirate;
        els.flagPolice.checked = !!meta.lists.police;
        els.flagAlien.checked = !!meta.lists.alien;
      }
      if (meta.flags) {
        els.flagEscapePod.checked = !!meta.flags.escapePod;
        els.flagHidden.checked = !!meta.flags.hiddenUntilDiscovered;
      }
    } else if (data.description) {
      els.shipDescription.value = data.description;
    }
    state.selected = null;
    state.pick = [];
    state.selectedFaceIds.clear();
    loadSkinBitmaps(data.id || els.shipId.value, mirrorFlagsFromMeta(data.gameMeta || {}));
    fitView();
    setStatus("BUILDER JSON IMPORTED.");
    renderAll();
    scheduleGamePreviewSync(0, true);
  } catch (err) {
    setStatus(`IMPORT FAILED: ${err.message}`);
  }
}

function gameLibrary() {
  return window.ULTRA_ELITE_MODEL_LIBRARY || {};
}

function gameLibraryDescriptions() {
  return window.ULTRA_ELITE_SHIP_DESCRIPTIONS || {};
}

function libraryDescription(source, id) {
  const meta = source?.gameMeta || {};
  const descriptions = gameLibraryDescriptions();
  return meta.description || source?.description || descriptions[source?.id] || descriptions[id] || "";
}

function populateLibrarySelector() {
  const entries = Object.entries(gameLibrary())
    .filter(([, model]) => model?.verts?.length)
    .sort((a, b) => (a[1].name || a[0]).localeCompare(b[1].name || b[0]));
  if (!els.librarySelector) return;
  els.librarySelector.innerHTML = entries.map(([id, model]) =>
    `<option value="${id}">${model.name || id}</option>`
  ).join("");
}

function loadLibraryModel(id) {
  const source = gameLibrary()[id];
  if (!source) {
    setStatus("LIBRARY OBJECT NOT FOUND.");
    return;
  }
  resetGamePreviewSyncState();
  state.nextId = 1;
  state.verts = (source.verts || []).map((v, index) => {
    const vertex = sourceVertex(v, index);
    state.nextId = Math.max(state.nextId, vertex.id + 1);
    return vertex;
  });
  state.faces = (source.faces || []).map((f, index) => {
    const face = sourceFace(f, index);
    state.nextId = Math.max(state.nextId, face.id + 1);
    return face;
  });
  state.edges = (source.edges || []).map((e, index) => {
    const edge = sourceEdge(e, index);
    state.nextId = Math.max(state.nextId, edge.id + 1);
    return edge;
  });
  state.details = (source.details || []).map((d) => {
    const idNum = Number(d.id);
    if (Number.isFinite(idNum)) state.nextId = Math.max(state.nextId, idNum + 1);
    const faceId = Number(d.faceId);
    return {
      ...d,
      id: Number.isFinite(idNum) ? idNum : newId(),
      faceId: Number.isFinite(faceId) ? faceId : undefined,
      vertexId: Number.isFinite(Number(d.vertexId)) ? Number(d.vertexId) : undefined,
      indices: Array.isArray(d.indices) ? d.indices.map(Number) : undefined,
      segment: Array.isArray(d.segment) ? d.segment.map(Number) : undefined
    };
  });
  inferMirrorVertexIds();
  const meta = source.gameMeta || {};
  state.sourceModelId = cleanBitmapKey(source.id || id);
  els.shipId.value = source.id || id;
  els.shipName.value = source.name || id;
  els.shipDescription.value = libraryDescription(source, id);
  els.shipMissionLore.value = meta.missionLore || meta.mission || "";
  syncSkinAngle(skinAngleMetaValue(meta), false);
  if (meta.class && [...els.shipClass.options].some((o) => o.value === meta.class)) els.shipClass.value = meta.class;
  if (meta.npcRole && [...els.npcRole.options].some((o) => o.value === meta.npcRole)) els.npcRole.value = meta.npcRole;
  if (meta.aiProfile && [...els.aiProfile.options].some((o) => o.value === meta.aiProfile)) els.aiProfile.value = meta.aiProfile;
  if (meta.decalRole && [...els.decalRole.options].some((o) => o.value === meta.decalRole)) els.decalRole.value = meta.decalRole;
  els.baseColor.value = normalizeHexColor(meta.baseColor);
  if (Number.isFinite(meta.valueCr)) els.shipValue.value = meta.valueCr;
  if (meta.stats) {
    if (Number.isFinite(meta.stats.hp)) els.shipHp.value = meta.stats.hp;
    if (Number.isFinite(meta.stats.speed)) els.speedMul.value = meta.stats.speed;
    if (Number.isFinite(meta.stats.cargo)) els.cargoTons.value = meta.stats.cargo;
    if (Number.isFinite(meta.stats.missiles)) els.missileCount.value = meta.stats.missiles;
    if (meta.stats.laser && [...els.laserClass.options].some((o) => o.value === meta.stats.laser)) els.laserClass.value = meta.stats.laser;
  }
  if (meta.lists) {
    els.flagTrader.checked = !!meta.lists.trader;
    els.flagPirate.checked = !!meta.lists.pirate;
    els.flagPolice.checked = !!meta.lists.police;
    els.flagAlien.checked = !!meta.lists.alien;
  }
  if (meta.flags) {
    els.flagEscapePod.checked = !!meta.flags.escapePod;
    els.flagHidden.checked = !!meta.flags.hiddenUntilDiscovered;
  }
  state.selected = null;
  state.pick = [];
  state.selectedFaceIds.clear();
  loadSkinBitmaps(source.id || id, mirrorFlagsFromMeta(meta));
  fitView();
  setStatus(`LOADED ${els.shipName.value.toUpperCase()} FROM GAME LIBRARY.`);
  renderAll();
  scheduleGamePreviewSync(0, true);
}

function downloadShip() {
  const data = builderExport();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${data.id || "custom_ship"}.ultraship.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(a.href);
}

function imageToPngDataUrl(img) {
  if (!img?.naturalWidth || !img?.naturalHeight) throw new Error("Image is not loaded.");
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);
  return canvas.toDataURL("image/png");
}

function coalesceDuplicateVisibleFaceSkins() {
  const canonicalByImage = new Map();
  const replacements = new Map();
  for (const face of state.faces) {
    const key = cleanBitmapKey(face.bitmapFaceKey);
    const img = key ? state.faceSkinImages?.[key] : null;
    if (!img?.naturalWidth) continue;
    let dataUrl = "";
    try {
      dataUrl = imageToPngDataUrl(img);
    } catch {
      continue;
    }
    const canonical = canonicalByImage.get(dataUrl);
    if (!canonical) {
      canonicalByImage.set(dataUrl, key);
    } else if (canonical !== key) {
      replacements.set(key, canonical);
    }
  }
  if (!replacements.size) return { changedFaces: 0, replacements };

  let changedFaces = 0;
  for (const face of state.faces) {
    const key = cleanBitmapKey(face.bitmapFaceKey);
    const replacement = replacements.get(key);
    if (!replacement) continue;
    face.bitmapFaceKey = replacement;
    changedFaces++;
  }
  for (const [oldKey, newKey] of replacements) {
    if (!state.faceSkinImages[newKey] && state.faceSkinImages[oldKey]) state.faceSkinImages[newKey] = state.faceSkinImages[oldKey];
    if (!state.faceSkinSources[newKey] && state.faceSkinSources[oldKey]) state.faceSkinSources[newKey] = state.faceSkinSources[oldKey];
    const oldUrl = state.faceSkinUrls[oldKey];
    if (!state.faceSkinUrls[newKey] && oldUrl) state.faceSkinUrls[newKey] = oldUrl;
    else if (oldUrl && oldUrl !== state.faceSkinUrls[newKey]) URL.revokeObjectURL(oldUrl);
    delete state.faceSkinImages[oldKey];
    delete state.faceSkinSources[oldKey];
    delete state.faceSkinUrls[oldKey];
  }
  markPreviewSkinsDirty();
  updateSkinReadout();
  updateFaceUvAngleControls();
  renderAll();
  return { changedFaces, replacements };
}

function referencedVisibleFaceSkinUploads() {
  const keys = [...new Set(state.faces.map((face) => cleanBitmapKey(face.bitmapFaceKey)).filter(Boolean))];
  return keys.map((key) => {
    const img = state.faceSkinImages?.[key];
    if (!img?.naturalWidth) return null;
    return { key, img };
  }).filter(Boolean);
}

function referencedVisibleSideSkinUploads() {
  return ["top", "bottom", "back"].map((side) => {
    const img = state.skinImages?.[side];
    if (!img?.naturalWidth) return null;
    return { side, img };
  }).filter(Boolean);
}

async function uploadSideSkinAsset(model, side, img) {
  return apiJson("/api/skins", {
    method: "POST",
    body: JSON.stringify({
      kind: "side",
      model,
      side,
      dataUrl: imageToPngDataUrl(img)
    })
  });
}

async function uploadFaceSkinAsset(model, key, img) {
  return apiJson("/api/skins", {
    method: "POST",
    body: JSON.stringify({
      kind: "face",
      model,
      key,
      dataUrl: imageToPngDataUrl(img)
    })
  });
}

async function saveModelAsset() {
  try {
    if (!await requireToolServer()) return;
    const coalesced = coalesceDuplicateVisibleFaceSkins();
    const data = builderExport();
    const cleanId = cleanBitmapKey(data.id, "custom_ship");
    const previousId = cleanBitmapKey(state.sourceModelId || "");
    const renameCleanup = previousId && previousId !== cleanId && !!gameLibrary()[previousId];
    const sideSkins = referencedVisibleSideSkinUploads();
    const faceSkins = referencedVisibleFaceSkinUploads();
    const sideSkinFiles = sideSkins.map((skin) => `assets/skins/${cleanId}-${skin.side}.png`);
    const faceSkinFiles = faceSkins.map((skin) => `assets/skins/${cleanId}-face-${skin.key}.png`);
    const ok = await confirmProjectWriteSummary({
      title: "Save Ship",
      confirmLabel: "Build Assets",
      intro: `Save ${data.name || cleanId} as ${cleanId}, then rebuild the local dev.html test files. This does not publish anything.`,
      groups: [
        {
          title: "Model Asset",
          lines: [
            `assets/models/${cleanId}.ultraship.json`,
            `${state.verts.length} vertices, ${state.faces.length} faces, ${state.edges.length} edges`
          ]
        },
        {
          title: "Skin PNGs",
          lines: [
            ...sideSkinFiles,
            ...faceSkinFiles,
            coalesced.changedFaces ? `Reused matching face PNG keys on ${coalesced.changedFaces} face${coalesced.changedFaces === 1 ? "" : "s"} to avoid duplicate identical assets.` : "",
            !sideSkinFiles.length && !faceSkinFiles.length ? "No loaded/referenced skin PNGs will be written." : ""
          ]
        },
        ...(renameCleanup ? [{
          title: "Rename Cleanup",
          lines: [
            `Remove old model assets/models/${previousId}.ultraship.json`,
            `Remove old skins assets/skins/${previousId}-*.png`,
            "This is treated as a rename, so the old library entry will not remain as a duplicate."
          ]
        }] : []),
        {
          title: "Build Outputs",
          lines: [
            "tools/ship-builder/game-model-library.js",
            "src/generated/model-library.js",
            "src/generated/bitmap-skins.js",
            "dev.html",
            "index.html",
            "Ready to test through local dev.html after the build completes."
          ]
        }
      ]
    });
    if (!ok) {
      setStatus("MODEL SAVE CANCELLED.");
      return;
    }
    for (let i = 0; i < sideSkins.length; i++) {
      const skin = sideSkins[i];
      setStatus(`SAVING ${cleanId.toUpperCase()} ${skin.side.toUpperCase()} SKIN (${i + 1}/${sideSkins.length})...`);
      await uploadSideSkinAsset(cleanId, skin.side, skin.img);
      state.skinImages.source[skin.side] = "asset";
    }
    for (let i = 0; i < faceSkins.length; i++) {
      const skin = faceSkins[i];
      setStatus(`SAVING ${cleanId.toUpperCase()} FACE ${skin.key} (${i + 1}/${faceSkins.length})...`);
      await uploadFaceSkinAsset(cleanId, skin.key, skin.img);
      state.faceSkinSources[skin.key] = "asset";
    }
    setStatus(`SAVING ${cleanId.toUpperCase()} MODEL...`);
    const result = await apiJson(`/api/models/${encodeURIComponent(cleanId)}`, {
      method: "POST",
      body: JSON.stringify(data)
    });
    let cleanupResult = null;
    if (renameCleanup) {
      setStatus(`REMOVING OLD ${previousId.toUpperCase()} MODEL...`);
      cleanupResult = await apiJson(`/api/models/${encodeURIComponent(previousId)}`, { method: "DELETE" });
      if (window.ULTRA_ELITE_MODEL_LIBRARY) delete window.ULTRA_ELITE_MODEL_LIBRARY[previousId];
    }
    setStatus("REBUILDING LOCAL GAME FILES...");
    await apiJson("/api/rebuild", {
      method: "POST",
      body: JSON.stringify({ scope: "all" })
    });
    window.ULTRA_ELITE_MODEL_LIBRARY = window.ULTRA_ELITE_MODEL_LIBRARY || {};
    window.ULTRA_ELITE_MODEL_LIBRARY[cleanId] = { ...data, id: cleanId };
    populateLibrarySelector();
    if (els.librarySelector) els.librarySelector.value = cleanId;
    state.sourceModelId = cleanId;
    state.assetVersion = Date.now();
    if (sideSkins.length || faceSkins.length) await refreshAvailableSkinAssets();
    const savedParts = [
      sideSkins.length ? `${sideSkins.length} SIDE PNG${sideSkins.length === 1 ? "" : "S"}` : "",
      faceSkins.length ? `${faceSkins.length} FACE PNG${faceSkins.length === 1 ? "" : "S"}` : ""
    ].filter(Boolean).join(", ");
    const cleanupText = cleanupResult?.deleted?.length ? `; OLD ${previousId} REMOVED` : "";
    setStatus(`MODEL UPDATED: ${result.path}${savedParts ? `; ${savedParts} SAVED` : ""}${cleanupText}.`);
    showBuildCompleteModal(`${data.name || cleanId} is built into the local dev.html test files. Click below to test locally.`);
  } catch (error) {
    setStatus(`MODEL SAVE FAILED: ${error.message}`);
  }
}

async function uploadSkinSide(side) {
  try {
    if (!await requireToolServer()) return;
    const img = state.skinImages?.[side];
    if (!img?.naturalWidth) {
      setStatus(`NO ${side.toUpperCase()} SKIN LOADED.`);
      return;
    }
    const model = templateShipId();
    if (!confirmWrite(`Overwrite assets/skins/${model}-${side}.png and regenerate bitmap skins?`)) {
      setStatus("SKIN UPLOAD CANCELLED.");
      return;
    }
    setStatus(`UPLOADING ${model.toUpperCase()} ${side.toUpperCase()} SKIN...`);
    const result = await uploadSideSkinAsset(model, side, img);
    state.skinImages.source[side] = "asset";
    state.assetVersion = Date.now();
    loadSkinBitmaps(model, state.skinImages?.mirrorX || currentModelMirrorFlags());
    await refreshAvailableSkinAssets();
    setStatus(`SKIN UPDATED: ${result.path}.`);
  } catch (error) {
    setStatus(`SKIN UPLOAD FAILED: ${error.message}`);
  }
}

async function uploadSelectedFaceSkin() {
  try {
    if (!await requireToolServer()) return;
    const face = selectedFace();
    if (!face) {
      setStatus("SELECT A FACE FIRST.");
      return;
    }
    const key = selectedFaceSkinKey(face);
    const img = state.faceSkinImages?.[key];
    if (!img?.naturalWidth) {
      setStatus(`NO FACE SKIN LOADED FOR ${key}.`);
      return;
    }
    face.bitmapFaceKey = key;
    if (mirrorActionsEnabled()) syncMirroredFace(face);
    const model = templateShipId();
    const sharedCount = faceSkinKeyUsage(key, face);
    const sharedText = sharedCount
      ? `\n\nGlobal asset update: texture key ${key} is also used by ${sharedCount} other face${sharedCount === 1 ? "" : "s"} in this model. This overwrite will update all of them.`
      : "";
    if (!confirmWrite(`Overwrite assets/skins/${model}-face-${key}.png and regenerate bitmap skins?${sharedText}`)) {
      setStatus("FACE SKIN UPLOAD CANCELLED.");
      return;
    }
    setStatus(`UPLOADING ${model.toUpperCase()} FACE ${key}...`);
    const result = await uploadFaceSkinAsset(model, key, img);
    state.faceSkinSources[key] = "asset";
    state.assetVersion = Date.now();
    loadSkinBitmaps(model, state.skinImages?.mirrorX || currentModelMirrorFlags());
    await refreshAvailableSkinAssets();
    setStatus(`FACE SKIN UPDATED: ${result.path}.`);
  } catch (error) {
    setStatus(`FACE SKIN UPLOAD FAILED: ${error.message}`);
  }
}

async function rebuildGameFiles() {
  try {
    if (!await requireToolServer()) return;
    if (!confirmWrite("Regenerate model libraries, bitmap skin manifest, dev.html, and index.html?")) {
      setStatus("REBUILD CANCELLED.");
      return;
    }
    setStatus("REBUILDING MODEL/SKIN/GAME FILES...");
    const result = await apiJson("/api/rebuild", {
      method: "POST",
      body: JSON.stringify({ scope: "all" })
    });
    state.assetVersion = Date.now();
    loadSkinBitmaps(templateShipId(), state.skinImages?.mirrorX || currentModelMirrorFlags());
    await refreshAvailableSkinAssets();
    setStatus(`REBUILD COMPLETE (${result.steps?.length || 0} STEPS).`);
  } catch (error) {
    setStatus(`REBUILD FAILED: ${error.message}`);
  }
}

function copyExport() {
  navigator.clipboard?.writeText(els.exportText.value).then(
    () => setStatus("EXPORT COPIED."),
    () => setStatus("COPY FAILED; SELECT EXPORT TEXT MANUALLY.")
  );
}

function setExportVisible(visible) {
  els.workspace.classList.toggle("export-hidden", !visible);
  els.exportPanel.classList.toggle("is-hidden", !visible);
  els.toggleExportBtn.textContent = visible ? "Hide Advanced" : "Advanced";
}

function setMode(mode, announce = true) {
  state.mode = mode;
  syncModeUi(mode);
  if (announce) setStatus(`${mode.toUpperCase()} MODE.`);
  renderAll();
}

function setToolTab(tab) {
  els.toolsPanel.dataset.toolTab = tab;
  document.querySelectorAll(".tool-tab-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.toolTabTarget === tab);
  });
  document.querySelectorAll(".tool-tab-panel").forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.toolTabPanel === tab);
  });
}

function setPaintTab(tab) {
  document.querySelectorAll(".paint-subtab-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.paintTabTarget === tab);
  });
  document.querySelectorAll(".paint-tab-panel").forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.paintTabPanel === tab);
  });
}

function openAssetLibrary() {
  if (!els.assetLibraryModal) return;
  els.assetLibraryModal.classList.remove("is-hidden");
  updateBitmapAssetGrid();
  refreshAvailableSkinAssets().catch((error) => {
    setStatus(`ASSET LIBRARY REFRESH FAILED: ${error.message}`);
  });
}

function closeAssetLibrary() {
  els.assetLibraryModal?.classList.add("is-hidden");
}

function bindEvents() {
  document.querySelectorAll(".tool-tab-btn").forEach((btn) => btn.addEventListener("click", () => {
    setToolTab(btn.dataset.toolTabTarget);
  }));
  document.querySelectorAll(".paint-subtab-btn").forEach((btn) => btn.addEventListener("click", () => {
    setPaintTab(btn.dataset.paintTabTarget);
  }));
  document.querySelectorAll(".mode-btn").forEach((btn) => btn.addEventListener("click", () => {
    setMode(btn.dataset.mode);
  }));
  document.querySelectorAll(".axis-btn").forEach((btn) => btn.addEventListener("click", () => {
    state.axis = btn.dataset.axis;
    document.querySelectorAll(".axis-btn").forEach((b) => b.classList.toggle("active", b === btn));
  }));
  ["x", "y", "z"].forEach((axis) => {
    const apply = (value) => {
      const v = state.selected?.type === "vertex" ? vertexById(state.selected.id) : null;
      if (!v) return;
      setVertex(v, axis === "x" ? Number(value) : v.x, axis === "y" ? Number(value) : v.y, axis === "z" ? Number(value) : v.z);
      renderAll();
    };
    els[`${axis}Slider`].addEventListener("input", (ev) => apply(ev.target.value));
    els[`${axis}Value`].addEventListener("change", (ev) => apply(ev.target.value));
  });
  els.mainView.addEventListener("pointerdown", (ev) => {
    const point = getCanvasPoint(ev, els.mainView);
    const faceGroupClick = ev.button === 0 && state.mode === "face" && ev.shiftKey;
    state.drag = { x: ev.clientX, y: ev.clientY, moved: false, lockView: faceGroupClick };
    els.mainView.setPointerCapture(ev.pointerId);
    if (ev.button === 0) selectInMain(point, { multiSelect: ev.shiftKey });
  });
  els.mainView.addEventListener("pointermove", (ev) => {
    if (!state.drag) return;
    const dx = ev.clientX - state.drag.x;
    const dy = ev.clientY - state.drag.y;
    if (Math.abs(dx) + Math.abs(dy) > 2) state.drag.moved = true;
    if (state.drag.lockView) return;
    state.view.ry += dx * 0.006;
    state.view.rx = clamp(state.view.rx + dy * 0.006, -1.45, 1.45);
    state.drag.x = ev.clientX;
    state.drag.y = ev.clientY;
    updateProjectionViewButtons();
    if (gameRendererPreviewMode()) renderPreviewMotion();
    else renderAll();
  });
  els.mainView.addEventListener("pointerup", () => { state.drag = null; });
  els.mainView.addEventListener("wheel", (ev) => {
    ev.preventDefault();
    state.view.zoom = clamp(state.view.zoom * (ev.deltaY > 0 ? 0.92 : 1.08), 0.8, 8);
    if (gameRendererPreviewMode()) renderPreviewMotion();
    else renderAll();
  }, { passive: false });
  document.querySelectorAll(".ortho-grid canvas").forEach((canvas) => {
    canvas.addEventListener("click", (ev) => {
      const point = getCanvasPoint(ev, canvas);
      const projected = new Map(state.verts.map((v) => [v.id, orthoProject(v, canvas, canvas.dataset.view)]));
      const id = nearestVertex(point, projected, 12);
      if (id) selectVertex(id);
    });
  });
  document.getElementById("newWedgeBtn").addEventListener("click", resetWedge);
  els.loadLibraryModelBtn.addEventListener("click", () => loadLibraryModel(els.librarySelector.value));
  els.toggleExportBtn.addEventListener("click", () => setExportVisible(els.exportPanel.classList.contains("is-hidden")));
  els.saveModelTopBtn?.addEventListener("click", saveModelAsset);
  els.rebuildGameTopBtn?.addEventListener("click", rebuildGameFiles);
  els.showFaceNormals.addEventListener("input", renderAll);
  els.showBlankUv?.addEventListener("input", renderAll);
  els.previewRenderMode.addEventListener("input", renderAll);
  els.toggleBlueprintBtn?.addEventListener("click", () => {
    setBlueprintsVisible(!state.showBlueprints, { persist: true });
    renderAll();
    setStatus(state.showBlueprints ? "BLUEPRINT VIEW SHOWN." : "BLUEPRINT VIEW HIDDEN.");
  });
  els.spinPreviewBtn?.addEventListener("click", openSpinPreviewWindow);
  els.closeSpinPreviewBtn?.addEventListener("click", closeSpinPreviewWindow);
  els.spinPreviewModal?.addEventListener("click", (event) => {
    if (event.target === els.spinPreviewModal) closeSpinPreviewWindow();
  });
  els.openAssetLibraryBtn?.addEventListener("click", openAssetLibrary);
  els.openAssetLibraryPaintBtn?.addEventListener("click", openAssetLibrary);
  els.closeAssetLibraryBtn?.addEventListener("click", closeAssetLibrary);
  els.assetLibraryModal?.addEventListener("click", (event) => {
    if (event.target === els.assetLibraryModal) closeAssetLibrary();
  });
  els.confirmWriteSummaryBtn?.addEventListener("click", () => closeWriteSummaryModal(true));
  els.cancelWriteSummaryBtn?.addEventListener("click", () => closeWriteSummaryModal(false));
  els.writeSummaryModal?.addEventListener("click", (event) => {
    if (event.target === els.writeSummaryModal) closeWriteSummaryModal(false);
  });
  els.closeBuildCompleteBtn?.addEventListener("click", closeBuildCompleteModal);
  els.testBuildDevHtmlBtn?.addEventListener("click", openLocalDevHtmlTest);
  els.buildCompleteModal?.addEventListener("click", (event) => {
    if (event.target === els.buildCompleteModal) closeBuildCompleteModal();
  });
  window.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (!els.writeSummaryModal?.classList.contains("is-hidden")) {
      closeWriteSummaryModal(false);
      return;
    }
    if (!els.buildCompleteModal?.classList.contains("is-hidden")) {
      closeBuildCompleteModal();
      return;
    }
    if (!els.assetLibraryModal?.classList.contains("is-hidden")) {
      closeAssetLibrary();
      return;
    }
    if (!els.spinPreviewModal?.classList.contains("is-hidden")) closeSpinPreviewWindow();
  });
  els.importBitmapShelf.addEventListener("change", (ev) => {
    importBitmapShelfFiles(ev.target.files);
    ev.target.value = "";
  });
  els.replaceAssetInput?.addEventListener("change", (ev) => {
    const file = ev.target.files?.[0];
    const itemId = pendingReplaceAssetId;
    pendingReplaceAssetId = "";
    ev.target.value = "";
    if (file && itemId) replaceBitmapAsset(itemId, file);
  });
  const handleBitmapGridClick = (ev) => {
    const replaceTarget = ev.target.closest("[data-replace-asset-id]");
    if (replaceTarget) {
      ev.preventDefault();
      ev.stopPropagation();
      beginReplaceBitmapAsset(replaceTarget.dataset.replaceAssetId);
      return;
    }
    const deleteTarget = ev.target.closest("[data-delete-asset-id]");
    if (deleteTarget) {
      ev.preventDefault();
      ev.stopPropagation();
      deleteBitmapAsset(deleteTarget.dataset.deleteAssetId);
      return;
    }
    const card = ev.target.closest("[data-shelf-id]");
    if (!card) return;
    selectBitmapShelfItem(card.dataset.shelfId);
    const item = selectedBitmapShelfItem();
    if (!item) return;
    if (item.asset?.kind === "decal") {
      setPaintTab("decals");
      setStatus(`${bitmapShelfItemTitle(item)} DECAL SELECTED. USE ADD DECAL TO LAYER IT ON THE SELECTED FACE.`);
    } else if (selectedFace()) {
      setPaintTab("face");
      setStatus(`${bitmapShelfItemTitle(item)} SELECTED. USE THE APPLY BUTTONS TO PLACE IT.`);
    } else {
      setPaintTab("face");
      setStatus(`${bitmapShelfItemTitle(item)} SELECTED. SELECT A FACE TO APPLY IT.`);
    }
  };
  els.bitmapAssetGrid?.addEventListener("click", handleBitmapGridClick);
  els.currentBitmapAssetGrid?.addEventListener("click", handleBitmapGridClick);
  els.localBitmapAssetGrid?.addEventListener("click", handleBitmapGridClick);
  els.bitmapShelfSelector?.addEventListener("change", () => {
    state.selectedBitmapShelfId = els.bitmapShelfSelector.value || "";
    updateBitmapAssetGrid();
    updateSelectedBitmapReadout();
  });
  els.applyShelfTopBtn.addEventListener("click", () => applyShelfBitmap("top"));
  els.applyShelfBottomBtn.addEventListener("click", () => applyShelfBitmap("bottom"));
  els.applyShelfBackBtn.addEventListener("click", () => applyShelfBitmap("back"));
  els.applyShelfFaceBtn.addEventListener("click", () => applyShelfBitmapToSelectedFace({ orientToView: true }));
  els.addShelfDecalBtn?.addEventListener("click", applyShelfBitmapAsDecal);
  els.faceDecalSelector?.addEventListener("change", () => updateFaceDecalControls());
  for (const control of [els.faceDecalX, els.faceDecalY, els.faceDecalScale, els.faceDecalAlpha]) {
    control?.addEventListener("input", updateSelectedFaceDecalFromControls);
  }
  els.faceDecalAngle?.addEventListener("change", updateSelectedFaceDecalFromControls);
  els.removeFaceDecalBtn?.addEventListener("click", removeSelectedFaceDecal);
  els.clearFaceDecalsBtn?.addEventListener("click", clearSelectedFaceDecals);
  els.clearAllFaceDecalsBtn?.addEventListener("click", clearAllFaceDecals);
  els.clearBitmapShelfBtn.addEventListener("click", clearBitmapShelf);
  els.refreshAssetShelfBtn?.addEventListener("click", loadAssetShelf);
  els.loadCurrentShipAssetsBtn?.addEventListener("click", loadCurrentShipAssets);
  els.saveModelAssetBtn?.addEventListener("click", saveModelAsset);
  els.rebuildAssetsBtn?.addEventListener("click", rebuildGameFiles);
  els.uploadTopSkinBtn?.addEventListener("click", () => uploadSkinSide("top"));
  els.uploadBottomSkinBtn?.addEventListener("click", () => uploadSkinSide("bottom"));
  els.uploadBackSkinBtn?.addEventListener("click", () => uploadSkinSide("back"));
  els.uploadFaceSkinBtn?.addEventListener("click", uploadSelectedFaceSkin);
  els.assetShelfCategory?.addEventListener("change", () => {
    updateBitmapAssetGrid();
    if (state.toolServer.skins.length) setStatus(`${els.assetShelfCategory.value.toUpperCase()} ASSET CATEGORY SELECTED.`);
  });
  els.assetShelfKind?.addEventListener("change", updateBitmapAssetGrid);
  els.assetShelfModel?.addEventListener("change", updateBitmapAssetGrid);
  els.assetShelfSearch?.addEventListener("input", updateBitmapAssetGrid);
  els.importTopSkin.addEventListener("change", (ev) => {
    importSkinFile("top", ev.target.files?.[0]);
    ev.target.value = "";
  });
  els.importBottomSkin.addEventListener("change", (ev) => {
    importSkinFile("bottom", ev.target.files?.[0]);
    ev.target.value = "";
  });
  els.importBackSkin.addEventListener("change", (ev) => {
    importSkinFile("back", ev.target.files?.[0]);
    ev.target.value = "";
  });
  els.importFaceSkin.addEventListener("change", (ev) => {
    importSelectedFaceSkinFile(ev.target.files?.[0]);
    ev.target.value = "";
  });
  els.reloadSkinBitmapsBtn.addEventListener("click", () => loadSkinBitmaps(els.shipId.value, state.skinImages?.mirrorX || emptyMirrorFlags(false)));
  els.clearImportedSkinsBtn.addEventListener("click", clearSkinBitmaps);
  els.clearFaceSkinBtn.addEventListener("click", clearSelectedFacePaint);
  els.clearAllFaceUvBtn?.addEventListener("click", clearAllFaceUv);
  els.clearTopSkinBtn?.addEventListener("click", () => clearSkinSide("top"));
  els.clearBottomSkinBtn?.addEventListener("click", () => clearSkinSide("bottom"));
  els.clearBackSkinBtn?.addEventListener("click", () => clearSkinSide("back"));
  els.mirrorHalfSkins.addEventListener("input", () => {
    updateSkinReadout();
    renderAll();
  });
  els.importMirroredSkin?.addEventListener("input", () => {
    if (!setSelectedFaceMirrorX(els.importMirroredSkin.checked)) renderAll();
  });
  els.skinAngle?.addEventListener("input", (ev) => setSelectedFaceUvAngle(ev.target.value));
  els.skinAngleValue?.addEventListener("change", (ev) => setSelectedFaceUvAngle(ev.target.value));
  document.querySelectorAll(".uv-rotate-btn").forEach((button) => {
    button.addEventListener("click", () => rotateSelectedFaceUvAngle(button.dataset.uvRotate));
  });
  els.orientUvToViewBtn?.addEventListener("click", () => orientFaceToView());
  els.resetUvAngleBtn?.addEventListener("click", () => setSelectedFaceUvAngle(0, true, "FACE UV ANGLE RESET."));
  els.faceColor?.addEventListener("input", (ev) => setSelectedFaceColor(ev.target.value, "FACE COLOUR UPDATED."));
  els.averageFaceColorBtn?.addEventListener("click", useSelectedFaceBitmapAverage);
  els.clearFaceColorBtn?.addEventListener("click", clearSelectedFaceColor);
  els.downloadTopTemplateBtn.addEventListener("click", () => downloadTemplate("top"));
  els.downloadBottomTemplateBtn.addEventListener("click", () => downloadTemplate("bottom"));
  els.downloadBackTemplateBtn.addEventListener("click", () => downloadTemplate("back"));
  els.downloadFaceTemplateBtn.addEventListener("click", downloadSelectedFaceTemplate);
  els.templateFaceSide.addEventListener("change", (ev) => setSelectedFaceBitmapSide(ev.target.value));
  els.shipId.addEventListener("change", () => loadSkinBitmaps(els.shipId.value, state.skinImages?.mirrorX || emptyMirrorFlags(false)));
  document.getElementById("resetViewBtn").addEventListener("click", () => {
    setStandardView(); fitView(); renderAll();
  });
  document.getElementById("fitViewBtn").addEventListener("click", () => { fitView(); renderAll(); });
  document.querySelectorAll("[data-view-preset]").forEach((button) => {
    button.addEventListener("click", () => setProjectionView(button.dataset.viewPreset));
  });
  els.syncGamePreviewBtn?.addEventListener("click", () => syncGamePreview(true));
  els.benchmarkRendererBtn?.addEventListener("click", runRendererBenchmark);
  window.addEventListener("message", (event) => {
    if (event.source !== els.gamePreviewFrame?.contentWindow) return;
    if (event.data?.type === "ultra-elite-render-preview-ready") {
      if (els.gamePreviewReadout) els.gamePreviewReadout.textContent = "GAME RENDERER READY.";
      syncGamePreview(true);
      return;
    }
    if (event.data?.type === "ultra-elite-render-preview-result") {
      handleGamePreviewResult(event.data);
    }
  });
  document.getElementById("addPointBtn").addEventListener("click", () => {
    const v = addPointPair(60, 0, 0);
    selectVertex(v.id);
    setStatus("POINT PAIR ADDED.");
  });
  document.getElementById("addCenterPointBtn").addEventListener("click", () => {
    const v = addCenterPoint(0, 0);
    selectVertex(v.id);
    setStatus("CENTRE POINT ADDED.");
  });
  document.getElementById("deleteSelectionBtn").addEventListener("click", deleteSelected);
  document.getElementById("addVertexBeaconBtn").addEventListener("click", () => addBeaconDetail({ stayInVertexMode: true }));
  document.getElementById("removeVertexBeaconBtn").addEventListener("click", removeBeaconAtSelectedVertex);
  document.getElementById("deleteFaceBtn").addEventListener("click", () => {
    if (state.selected?.type === "face") deleteSelected();
  });
  document.getElementById("deleteEdgeBtn").addEventListener("click", () => {
    if (state.selected?.type === "edge") deleteSelected();
  });
  document.getElementById("appendFacePointBtn").addEventListener("click", appendPickedToSelectedFace);
  document.getElementById("removeFacePointBtn").addEventListener("click", removePickedFromSelectedFace);
  document.getElementById("flipFaceBtn").addEventListener("click", flipSelectedFace);
  els.clearFaceGroupBtn?.addEventListener("click", () => clearFaceGroup());
  document.getElementById("clearSelectionBtn").addEventListener("click", () => {
    clearEditorSelection();
    setStatus("SELECTION CLEARED.");
    renderAll();
  });
  document.getElementById("addFaceBtn").addEventListener("click", () => {
    if (state.pick.length < 3) return setStatus("PICK AT LEAST THREE VERTICES.");
    addFaceMirrored(state.pick);
    state.pick = [];
    setStatus("FACE ADDED.");
    renderAll();
  });
  document.getElementById("addEdgeBtn").addEventListener("click", () => {
    if (state.pick.length < 2) return setStatus("PICK TWO VERTICES.");
    addEdgeMirrored(state.pick[0], state.pick[1], "edge");
    state.pick = [];
    setStatus("EDGE ADDED.");
    renderAll();
  });
  document.getElementById("addStickBtn").addEventListener("click", () => {
    if (state.pick.length < 2) return setStatus("PICK TWO VERTICES.");
    addEdgeMirrored(state.pick[0], state.pick[1], "stick");
    state.pick = [];
    setStatus("STICK ADDED.");
    renderAll();
  });
  document.getElementById("splitEdgeBtn").addEventListener("click", splitSelectedLine);
  document.getElementById("addWindowBtn").addEventListener("click", () => addDetail("window"));
  document.getElementById("addEngineBtn").addEventListener("click", () => addDetail("engine"));
  document.getElementById("addPanelBtn").addEventListener("click", () => addDetail("panel"));
  document.getElementById("addBeaconBtn").addEventListener("click", () => addDetail("beacon"));
  document.getElementById("deleteDetailBtn").addEventListener("click", () => {
    if (state.selected?.type === "detail") deleteSelected();
  });
  els.detailInset.addEventListener("input", () => {
    const detail = state.selected?.type === "detail" ? detailById(state.selected.id) : null;
    if (!detail || !detail.faceId) return;
    const inset = Number(els.detailInset.value);
    detail.inset = inset;
    patchMirroredDetail(detail, { inset });
    renderAll();
  });
  els.detailColor.addEventListener("input", () => {
    const detail = state.selected?.type === "detail" ? detailById(state.selected.id) : null;
    if (!detail) return;
    const color = els.detailColor.value;
    detail.color = color;
    patchMirroredDetail(detail, { color });
    renderAll();
  });
  document.getElementById("downloadBtn")?.addEventListener("click", downloadShip);
  document.getElementById("copyBtn")?.addEventListener("click", copyExport);
  document.getElementById("importBtn").addEventListener("click", importBuilderJson);
  els.exportKind.addEventListener("change", updateExport);
  [
    els.shipId, els.shipName, els.shipDescription, els.shipMissionLore, els.shipClass, els.npcRole, els.aiProfile, els.decalRole, els.baseColor,
    els.shipValue, els.shipHp, els.speedMul, els.cargoTons, els.missileCount, els.laserClass,
    els.flagTrader, els.flagPirate, els.flagPolice, els.flagAlien, els.flagEscapePod, els.flagHidden, els.mirrorHalfSkins, els.skinAngle, els.skinAngleValue, els.faceColor
  ].forEach((el) => el.addEventListener("input", updateExport));
}

function applyToolSurfaceMode() {
  const params = new URLSearchParams(location.search);
  if (params.get("surface") !== "model") return;
  document.body.classList.add("model-surface-only");
  const paintButton = document.querySelector('.tool-tab-btn[data-tool-tab-target="paint"]');
  paintButton?.remove();
  const paintPanel = document.querySelector('.tool-tab-panel[data-tool-tab-panel="paint"]');
  paintPanel?.remove();
  setToolTab("edit");
  document.title = "Ultra Elite Model Builder";
}

applyToolSurfaceMode();
bindEvents();
setDefaultPreviewRenderMode();
setBlueprintsVisible(state.showBlueprints);
populateLibrarySelector();
resetWedge();
kickInitialGamePreviewSync();
checkLocalToolServer().then((ok) => {
  if (ok) refreshAvailableSkinAssets().catch(() => {});
});
