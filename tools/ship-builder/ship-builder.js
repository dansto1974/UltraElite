"use strict";

const TAU = Math.PI * 2;
const EPS = 0.0001;

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
  xSlider: document.getElementById("xSlider"),
  ySlider: document.getElementById("ySlider"),
  zSlider: document.getElementById("zSlider"),
  xValue: document.getElementById("xValue"),
  yValue: document.getElementById("yValue"),
  zValue: document.getElementById("zValue"),
  detailInset: document.getElementById("detailInset"),
  detailColor: document.getElementById("detailColor"),
  showFaceNormals: document.getElementById("showFaceNormals"),
  mirrorNewGeometry: document.getElementById("mirrorNewGeometry"),
  previewRenderMode: document.getElementById("previewRenderMode"),
  skinReadout: document.getElementById("skinReadout"),
  mirrorHalfSkins: document.getElementById("mirrorHalfSkins"),
  importMirroredSkin: document.getElementById("importMirroredSkin"),
  skinAngle: document.getElementById("skinAngle"),
  skinAngleValue: document.getElementById("skinAngleValue"),
  importBitmapShelf: document.getElementById("importBitmapShelf"),
  bitmapShelfSelector: document.getElementById("bitmapShelfSelector"),
  applyShelfTopBtn: document.getElementById("applyShelfTopBtn"),
  applyShelfBottomBtn: document.getElementById("applyShelfBottomBtn"),
  applyShelfBackBtn: document.getElementById("applyShelfBackBtn"),
  applyShelfFaceBtn: document.getElementById("applyShelfFaceBtn"),
  clearBitmapShelfBtn: document.getElementById("clearBitmapShelfBtn"),
  importTopSkin: document.getElementById("importTopSkin"),
  importBottomSkin: document.getElementById("importBottomSkin"),
  importBackSkin: document.getElementById("importBackSkin"),
  importFaceSkin: document.getElementById("importFaceSkin"),
  reloadSkinBitmapsBtn: document.getElementById("reloadSkinBitmapsBtn"),
  clearImportedSkinsBtn: document.getElementById("clearImportedSkinsBtn"),
  clearFaceSkinBtn: document.getElementById("clearFaceSkinBtn"),
  localServerReadout: document.getElementById("localServerReadout"),
  assetShelfCategory: document.getElementById("assetShelfCategory"),
  refreshAssetShelfBtn: document.getElementById("refreshAssetShelfBtn"),
  saveModelAssetBtn: document.getElementById("saveModelAssetBtn"),
  rebuildAssetsBtn: document.getElementById("rebuildAssetsBtn"),
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
  bitmapShelf: [],
  toolServer: { available: false, skins: [], version: 0 },
  assetVersion: Date.now(),
  previewSkinVersion: Date.now(),
  gamePreviewInfo: null,
  gamePreviewProjection: null,
  selected: null,
  pick: [],
  view: { rx: -0.35, ry: 0.72, zoom: 2.9, panX: 0, panY: 0 },
  orthoScale: 1,
  drag: null
};

const TEMPLATE_SIZE = 400;
const TEMPLATE_MAX_SIZE = 600;
const BITMAP_FACE_SIDES = new Set(["top", "bottom", "back"]);
let gamePreviewTimer = 0;
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
  return {
    id: Number.isFinite(id) ? id : 1000 + index,
    verts: (Array.isArray(face) ? face : face?.verts || []).map(Number),
    mirrored: !!face?.mirrored,
    ...(bitmapSide ? { bitmapSide } : {}),
    ...(bitmapFaceKey ? { bitmapFaceKey } : {})
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
  els.status.textContent = text;
}

function confirmWrite(message) {
  return window.confirm(`${message}\n\nThis writes to the local project files.`);
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

function mirrorIds(ids) {
  const mirrored = ids.map((id) => vertexById(id)?.mirrorId || id);
  if (mirrored.some((id) => !id)) return null;
  return mirrored.reverse();
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

function syncMirroredFace(face) {
  const mf = mirroredFaceOf(face);
  const mids = mirrorIds(face.verts);
  if (mf && mids) {
    mf.verts = mids;
    const side = validBitmapFaceSide(face.bitmapSide);
    if (side) mf.bitmapSide = side;
    else delete mf.bitmapSide;
    const key = cleanBitmapKey(face.bitmapFaceKey);
    if (key) mf.bitmapFaceKey = key;
    else delete mf.bitmapFaceKey;
  }
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

function gameRendererOverlayMode() {
  return els.previewRenderMode?.value === "gameOverlay";
}

function previewModeLabel(value = els.previewRenderMode?.value || "gameOverlay") {
  if (value === "gameOverlay") return "Game Renderer + Overlay";
  if (value === "wireFaces") return "Builder Wire + Faces";
  if (value === "wire") return "Builder Wireframe";
  if (value === "wireBitmap") return "Builder Wire + Bitmap";
  if (value === "bitmap") return "Builder Bitmap Only";
  return value;
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
  const overlay = mode === "gameOverlay";
  els.mainPreviewStack?.classList.toggle("is-game-overlay", overlay);
  els.mainPreviewStack?.classList.toggle("is-builder-diagnostic", !overlay);
  if (els.previewTrustBadge) {
    els.previewTrustBadge.classList.toggle("is-trusted", overlay);
    els.previewTrustBadge.classList.toggle("is-diagnostic", !overlay);
    els.previewTrustBadge.textContent = overlay ? "REAL RENDERER" : "BUILDER DIAGNOSTIC";
  }
  if (!els.previewTrustReadout) return;
  if (!overlay) {
    els.previewTrustReadout.textContent = `${previewModeLabel(mode)} | fallback preview path`;
    return;
  }
  const summary = gamePreviewProjectionSummary();
  if (!summary) {
    els.previewTrustReadout.textContent = "Waiting for renderer projection packet...";
    return;
  }
  const uvText = summary.missingUv
    ? `${summary.missingUv} UV gap${summary.missingUv === 1 ? "" : "s"}`
    : `${summary.faceTextureRefs} face UV${summary.faceTextureRefs === 1 ? "" : "s"}`;
  els.previewTrustReadout.textContent = `${summary.visibleFaces}/${summary.faces} visible faces | ${summary.projectedPoints} points | ${uvText}`;
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

function builderBitmapFill(n) {
  const light = norm(vec(-0.35, 0.7, 0.6));
  const d = clamp(dot(n, light), -0.4, 1);
  const mul = 0.46 + (d + 0.4) / 1.4 * 0.54;
  const base = hexToRgb(els.baseColor.value);
  return `rgb(${Math.round(base.r * mul)},${Math.round(base.g * mul)},${Math.round(base.b * mul)})`;
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
  return (els.shipId.value.trim() || "custom_ship").toLowerCase().replace(/[^a-z0-9_-]+/g, "_");
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

function skinAngleDeg() {
  return clamp(Number(els.skinAngle?.value) || 0, -180, 180);
}

function syncSkinAngle(value, redraw = true) {
  const n = clamp(Math.round(Number(value) || 0), -180, 180);
  if (els.skinAngle) els.skinAngle.value = String(n);
  if (els.skinAngleValue) els.skinAngleValue.value = String(n);
  if (redraw) renderAll();
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
  state.previewSkinVersion = Date.now();
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

function clearSkinBitmaps() {
  revokeSkinUrls();
  revokeFaceSkinUrls();
  state.skinImages = emptySkinBundle();
  state.faceSkinImages = {};
  state.faceSkinSources = {};
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
}

function updateBitmapShelfSelector() {
  if (!els.bitmapShelfSelector) return;
  els.bitmapShelfSelector.innerHTML = "";
  if (!state.bitmapShelf.length) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "No imported bitmaps";
    els.bitmapShelfSelector.append(option);
    return;
  }
  for (const item of state.bitmapShelf) {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = `${item.name} (${item.img.naturalWidth}x${item.img.naturalHeight})`;
    els.bitmapShelfSelector.append(option);
  }
}

function addBitmapToShelf(file, img, url) {
  const id = `bitmap_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  state.bitmapShelf.push({ id, name: file.name || "imported bitmap", img, url, source: "imported" });
  updateBitmapShelfSelector();
  els.bitmapShelfSelector.value = id;
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
        : `${asset.category}/${asset.model} ${asset.side}`;
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

function populateAssetCategorySelector(categories = []) {
  if (!els.assetShelfCategory) return;
  const current = els.assetShelfCategory.value || "all";
  const options = ["all", ...categories.filter((cat) => cat && cat !== "all")];
  els.assetShelfCategory.innerHTML = options.map((category) =>
    `<option value="${category}">${category === "all" ? "All assets" : category}</option>`
  ).join("");
  if (options.includes(current)) els.assetShelfCategory.value = current;
}

async function refreshAvailableSkinAssets() {
  if (!await requireToolServer()) return null;
  const data = await apiJson("/api/skins", { method: "GET" });
  state.toolServer.skins = Array.isArray(data.skins) ? data.skins : [];
  populateAssetCategorySelector(data.categories || []);
  return state.toolServer.skins;
}

async function loadAssetShelf() {
  try {
    const skins = await refreshAvailableSkinAssets();
    if (!skins) return;
    const category = els.assetShelfCategory?.value || "all";
    const selected = skins.filter((skin) => category === "all" || skin.category === category);
    let loaded = 0;
    for (const asset of selected) {
      if (await addBitmapAssetToShelf(asset)) loaded++;
    }
    updateBitmapShelfSelector();
    setStatus(`${loaded} ${category === "all" ? "" : `${category.toUpperCase()} `}ASSET BITMAP${loaded === 1 ? "" : "S"} LOADED TO SHELF.`);
  } catch (error) {
    setStatus(`ASSET SHELF LOAD FAILED: ${error.message}`);
  }
}

function clearBitmapShelf() {
  for (const item of state.bitmapShelf) {
    if (item.url) URL.revokeObjectURL(item.url);
  }
  state.bitmapShelf = [];
  updateBitmapShelfSelector();
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

function selectedFaceSkinKey(face) {
  if (!face) return "";
  const fallback = `face-${face.id}`;
  return cleanBitmapKey(face.bitmapFaceKey, fallback);
}

function setSelectedFaceSkinFromImage(img, source = "imported", url = "", name = "bitmap") {
  const face = selectedFace();
  if (!face) {
    if (url) URL.revokeObjectURL(url);
    setStatus("SELECT A FACE FIRST.");
    return;
  }
  const key = selectedFaceSkinKey(face);
  face.bitmapFaceKey = key;
  if (mirrorActionsEnabled()) syncMirroredFace(face);
  if (state.faceSkinUrls[key] && state.faceSkinUrls[key] !== url) URL.revokeObjectURL(state.faceSkinUrls[key]);
  state.faceSkinImages[key] = img;
  state.faceSkinSources[key] = source;
  if (url) state.faceSkinUrls[key] = url;
  markPreviewSkinsDirty();
  updateSkinReadout();
  setStatus(`${name} APPLIED TO FACE #${face.id} AS ${key}. SAVE AS ${templateShipId()}-face-${key}.png TO MAKE PERMANENT.`);
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
  if (mirrorActionsEnabled()) syncMirroredFace(face);
  markPreviewSkinsDirty();
  setStatus(key ? `FACE TEXTURE ${key} CLEARED FROM FACE #${face.id}.` : "SELECTED FACE HAS NO FACE TEXTURE.");
  renderAll();
}

function applyShelfBitmap(side) {
  const id = els.bitmapShelfSelector?.value;
  const item = state.bitmapShelf.find((entry) => entry.id === id);
  if (!item) {
    setStatus("IMPORT A BITMAP FIRST.");
    return;
  }
  clearEditorSelection();
  const mirrored = importMirroredSkinEnabled();
  setSkinSideFromImage(side, item.img, "shelf", "", mirrored);
  setStatus(`${item.name} APPLIED TO ${side.toUpperCase()}${mirrored ? " AS MIRRORED HALF UV" : ""}.`);
}

function applyShelfBitmapToSelectedFace() {
  const id = els.bitmapShelfSelector?.value;
  const item = state.bitmapShelf.find((entry) => entry.id === id);
  if (!item) {
    setStatus("IMPORT A BITMAP FIRST.");
    return;
  }
  setSelectedFaceSkinFromImage(item.img, "shelf", "", item.name);
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
    if (shelfId) els.bitmapShelfSelector.value = shelfId;
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
  if (!selectedFace()) {
    setStatus("SELECT A FACE FIRST.");
    return;
  }
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => {
    const shelfId = addToShelf ? addBitmapToShelf(file, img, url) : "";
    setSelectedFaceSkinFromImage(img, addToShelf ? "shelf" : "imported", addToShelf ? "" : url, file.name || "FACE PNG");
    if (shelfId) els.bitmapShelfSelector.value = shelfId;
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
  const fallbackPts = verts.map(fallbackProject);
  if (!cleanBitmapKey(face.bitmapFaceKey) || polygonArea2d(fallbackPts) >= 1) return fallbackProject;
  const n = faceNormal(face);
  const absX = Math.abs(n.x), absY = Math.abs(n.y), absZ = Math.abs(n.z);
  if (absZ >= absX && absZ >= absY) return templateProjectionFromAxes(0, 1, n.z < 0, true);
  if (absX >= absY && absX >= absZ) return templateProjectionFromAxes(2, 1, n.x > 0, true);
  return templateProjectionFromAxes(0, 2, n.y < 0, true);
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

function drawTemplateCenterline(ctx, x, top = 0, bottom = ctx.canvas.height) {
  if (x < -1 || x > ctx.canvas.width + 1) return;
  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,.48)";
  ctx.lineWidth = 1;
  ctx.setLineDash([7, 7]);
  ctx.beginPath();
  ctx.moveTo(Math.round(x) + .5, top);
  ctx.lineTo(Math.round(x) + .5, bottom);
  ctx.stroke();
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
  drawTemplateCenterline(ctx, centerX);

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
  drawTemplateCenterline(ctx, (project.centerlineX ?? project.width / 2) - minX + pad);

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

function selectedFaceTextureMapping(face) {
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
  const uv = pts.map((p) => ({ x: p.x - minX + pad, y: p.y - minY + pad }));
  return { side, project, uv, width, height, minX, minY, pad };
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
      const sx = faceImg.naturalWidth / mapping.width;
      const sy = faceImg.naturalHeight / mapping.height;
      const poly = mapping.uv.map((tex, i) => ({ screen: pts[i], tex }));
      ctx.save();
      ctx.globalAlpha = .98;
      drawTexturedPolygon(ctx, faceImg, poly, sx, sy, false, mapping.width / 2);
      ctx.restore();
      return true;
    }
  }
  const side = templateSideForFace(face);
  const img = state.skinImages?.[side];
  if (!img?.complete || !img.naturalWidth || pts.length < 3) return false;
  const { project, mirrorX } = skinProjectionForImage(side, img);
  const angle = skinAngleDeg();
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
  const gameOverlay = previewMode === "gameOverlay";
  updatePreviewTrustUi();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!gameOverlay) drawStars(ctx, canvas);
  const projected = projectedMapForMain(canvas);
  const drawFaces = previewMode !== "wire" && !gameOverlay;
  const drawWire = previewMode !== "bitmap";
  const drawBitmapGuide = previewMode === "wireBitmap" || previewMode === "bitmap";

  if (drawFaces) {
    const sortedFaces = [...state.faces].sort((a, b) => faceDepth(b) - faceDepth(a));
    for (const face of sortedFaces) {
      const pts = face.verts.map((id) => projected.get(id)).filter(Boolean);
      const n = faceNormal(face);
      const selected = state.selected?.type === "face" && state.selected.id === face.id;
      if (drawBitmapGuide) {
        drawFace(ctx, pts, builderBitmapFill(n), "rgba(0,0,0,0)", 0);
        const textured = drawFaceBitmapSkin(ctx, face, pts);
        if (!textured) drawFaceTextureGuide(ctx, pts, previewMode === "bitmap" ? .22 : .16);
        if (selected || drawWire) {
          drawFace(
            ctx,
            pts,
            selected ? "rgba(255,217,54,.18)" : "rgba(0,0,0,0)",
            selected ? "#ffd936" : "rgba(85,255,78,.32)",
            selected ? 2 : 1
          );
        }
      } else {
        drawFace(
          ctx,
          pts,
          selected ? "rgba(255,217,54,.24)" : shadedHullColor(n),
          selected ? "#ffd936" : drawWire ? "rgba(85,255,78,.32)" : "rgba(0,0,0,0)",
          selected ? 2 : drawWire ? 1 : 0
        );
      }
    }
  }
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

  if (gameOverlay && state.selected?.type === "face") {
    const face = faceById(state.selected.id);
    const pts = face?.verts.map((id) => projected.get(id)).filter(Boolean) || [];
    if (face && pts.length >= 3) {
      drawFace(ctx, pts, "rgba(255,217,54,.13)", "#ffd936", 2);
    }
  }

  for (const detail of state.details) {
    const previewDetail = previewDetailForBuilderDetail(detail);
    const pts3 = previewDetail ? [] : detailModelPoints(detail);
    const pts = previewDetail
      ? previewDetail.points.map((point) => previewProjectionPointToCanvas(point, canvas)).filter(Boolean)
      : pts3.map((p) => project3d(p, canvas));
    if (detail.type === "beacon") {
      const p = pts[0] || null;
      if (!p) continue;
      const selected = state.selected?.type === "detail" && state.selected.id === detail.id;
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
    const showIdleVertex = state.mode === "vertex" && previewMode !== "bitmap" && previewMode !== "wireBitmap";
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
  renderMain();
  document.querySelectorAll(".ortho-grid canvas").forEach((canvas) => drawOrthoCanvas(canvas, canvas.dataset.view));
  updateExport();
  scheduleGamePreviewSync();
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
  const angle = skinAngleDeg();
  if (angle) skins.angle = { top: angle, bottom: angle, back: angle };
  return count ? skins : null;
}

function gamePreviewPayload() {
  return {
    id: templateShipId(),
    name: els.shipName.value.trim() || templateShipId(),
    blueprint: derivedBlueprint(),
    gameMeta: gameMetadata(),
    bitmapSkins: gamePreviewBitmapSkins(),
    view: { rx: state.view.rx, ry: state.view.ry, roll: 0 },
    mode: "solid",
    quality: "full",
    targetScale: .56
  };
}

function syncGamePreview() {
  const frame = els.gamePreviewFrame;
  if (!frame?.contentWindow) return;
  try {
    state.gamePreviewInfo = null;
    state.gamePreviewProjection = null;
    updatePreviewTrustUi();
    frame.contentWindow.postMessage({
      type: "ultra-elite-render-preview",
      payload: gamePreviewPayload()
    }, "*");
    if (els.gamePreviewReadout) els.gamePreviewReadout.textContent = `${templateShipId().toUpperCase()} REFRESHING REAL RENDERER.`;
  } catch (error) {
    if (els.gamePreviewReadout) els.gamePreviewReadout.textContent = `GAME RENDER SYNC FAILED: ${error.message}`;
  }
}

function scheduleGamePreviewSync(delay = 180) {
  clearTimeout(gamePreviewTimer);
  gamePreviewTimer = setTimeout(syncGamePreview, delay);
}

function summarizeGamePreviewInfo(info) {
  const summary = gamePreviewProjectionSummary(info);
  if (!summary) return "REAL RENDERER READY.";
  const suffix = summary.missingUv ? `  ${summary.missingUv} FACE UV GAP${summary.missingUv === 1 ? "" : "S"}` : "";
  return `REAL RENDERER: ${summary.visibleFaces}/${summary.faces} VISIBLE FACES  ${summary.projectedPoints} POINTS  ${summary.faceTextureRefs} FACE UVS${suffix}`;
}

function handleGamePreviewResult(data) {
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
  els.pickList.textContent = state.pick.length ? state.pick.map((id) => `#${id}`).join("  ") : "Pick list empty";

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
    els.selectionReadout.textContent = n
      ? `Face #${state.selected.id}  normal X ${round(n.x, 2)}  Y ${round(n.y, 2)}  Z ${round(n.z, 2)}  bitmap ${bitmapSide}${faceSkin ? `  face ${faceSkin}` : ""}`
      : `Face #${state.selected.id}`;
  } else {
    els.selectionReadout.textContent = `${state.selected.type.toUpperCase()} #${state.selected.id}`;
  }
  updateSliders();
  updateDetailControls();
  updateFaceBitmapSideControl();
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
    const pts = detailModelPoints(d).map((p) => project3d(p, els.mainView));
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

function selectInMain(point) {
  const projected = projectedMapForMain(els.mainView);
  if (state.mode === "vertex") {
    const id = nearestVertex(point, projected);
    if (id) selectVertex(id);
    return;
  }
  if (state.mode === "face" || state.mode === "edge") {
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
      setStatus(`FACE #${hit.id} SELECTED.`);
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
      lift: d.type === "engine" ? 1.5 : 1
    };
    if (d.type === "panel") {
      return { ...base, type: "polyline", points, width: 1.2 };
    }
    return { ...base, points, stroke: d.type === "engine" ? "#ffffff" : undefined };
  }).filter(Boolean);
  const faceSides = state.faces.map((f) => validBitmapFaceSide(f.bitmapSide) || null);
  const faceTextures = state.faces.map((f) => cleanBitmapKey(f.bitmapFaceKey) || null);
  const primaryAxis = templatePrimaryAxis();
  const imageProjection = {
    ...(primaryAxis !== "y" ? { primaryAxis } : {}),
    ...(faceSides.some(Boolean) ? { faceSides } : {}),
    ...(faceTextures.some(Boolean) ? { faceTextures } : {})
  };
  const hasImageProjection = !!imageProjection.primaryAxis || !!imageProjection.faceSides || !!imageProjection.faceTextures;
  return {
    verts,
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
  const imageDecalAngle = skinAngleDeg();
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
      ...(validBitmapFaceSide(f.bitmapSide) ? { bitmapSide: f.bitmapSide } : {}),
      ...(cleanBitmapKey(f.bitmapFaceKey) ? { bitmapFaceKey: cleanBitmapKey(f.bitmapFaceKey) } : {})
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
    loadSkinBitmaps(data.id || els.shipId.value, mirrorFlagsFromMeta(data.gameMeta || {}));
    fitView();
    setStatus("BUILDER JSON IMPORTED.");
    renderAll();
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
  const meta = source.gameMeta || {};
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
  loadSkinBitmaps(source.id || id, mirrorFlagsFromMeta(meta));
  fitView();
  setStatus(`LOADED ${els.shipName.value.toUpperCase()} FROM GAME LIBRARY.`);
  renderAll();
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

async function saveModelAsset() {
  try {
    if (!await requireToolServer()) return;
    const data = builderExport();
    const cleanId = cleanBitmapKey(data.id, "custom_ship");
    if (!confirmWrite(`Overwrite assets/models/${cleanId}.ultraship.json and regenerate model libraries?`)) {
      setStatus("MODEL SAVE CANCELLED.");
      return;
    }
    setStatus(`SAVING ${cleanId.toUpperCase()} MODEL...`);
    const result = await apiJson(`/api/models/${encodeURIComponent(cleanId)}`, {
      method: "POST",
      body: JSON.stringify(data)
    });
    window.ULTRA_ELITE_MODEL_LIBRARY = window.ULTRA_ELITE_MODEL_LIBRARY || {};
    window.ULTRA_ELITE_MODEL_LIBRARY[cleanId] = { ...data, id: cleanId };
    populateLibrarySelector();
    if (els.librarySelector) els.librarySelector.value = cleanId;
    state.assetVersion = Date.now();
    setStatus(`MODEL UPDATED: ${result.path}.`);
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
    const result = await apiJson("/api/skins", {
      method: "POST",
      body: JSON.stringify({
        kind: "side",
        model,
        side,
        dataUrl: imageToPngDataUrl(img)
      })
    });
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
    if (!confirmWrite(`Overwrite assets/skins/${model}-face-${key}.png and regenerate bitmap skins?`)) {
      setStatus("FACE SKIN UPLOAD CANCELLED.");
      return;
    }
    setStatus(`UPLOADING ${model.toUpperCase()} FACE ${key}...`);
    const result = await apiJson("/api/skins", {
      method: "POST",
      body: JSON.stringify({
        kind: "face",
        model,
        key,
        dataUrl: imageToPngDataUrl(img)
      })
    });
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
  els.toggleExportBtn.textContent = visible ? "Hide Export" : "Show Export";
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

function bindEvents() {
  document.querySelectorAll(".tool-tab-btn").forEach((btn) => btn.addEventListener("click", () => {
    setToolTab(btn.dataset.toolTabTarget);
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
    state.drag = { x: ev.clientX, y: ev.clientY, moved: false };
    els.mainView.setPointerCapture(ev.pointerId);
    if (ev.button === 0) selectInMain(point);
  });
  els.mainView.addEventListener("pointermove", (ev) => {
    if (!state.drag) return;
    const dx = ev.clientX - state.drag.x;
    const dy = ev.clientY - state.drag.y;
    if (Math.abs(dx) + Math.abs(dy) > 2) state.drag.moved = true;
    state.view.ry += dx * 0.006;
    state.view.rx = clamp(state.view.rx + dy * 0.006, -1.45, 1.45);
    state.drag.x = ev.clientX;
    state.drag.y = ev.clientY;
    renderAll();
  });
  els.mainView.addEventListener("pointerup", () => { state.drag = null; });
  els.mainView.addEventListener("wheel", (ev) => {
    ev.preventDefault();
    state.view.zoom = clamp(state.view.zoom * (ev.deltaY > 0 ? 0.92 : 1.08), 0.8, 8);
    renderAll();
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
  els.showFaceNormals.addEventListener("input", renderAll);
  els.previewRenderMode.addEventListener("input", renderAll);
  els.importBitmapShelf.addEventListener("change", (ev) => {
    importBitmapShelfFiles(ev.target.files);
    ev.target.value = "";
  });
  els.applyShelfTopBtn.addEventListener("click", () => applyShelfBitmap("top"));
  els.applyShelfBottomBtn.addEventListener("click", () => applyShelfBitmap("bottom"));
  els.applyShelfBackBtn.addEventListener("click", () => applyShelfBitmap("back"));
  els.applyShelfFaceBtn.addEventListener("click", applyShelfBitmapToSelectedFace);
  els.clearBitmapShelfBtn.addEventListener("click", clearBitmapShelf);
  els.refreshAssetShelfBtn?.addEventListener("click", loadAssetShelf);
  els.saveModelAssetBtn?.addEventListener("click", saveModelAsset);
  els.rebuildAssetsBtn?.addEventListener("click", rebuildGameFiles);
  els.uploadTopSkinBtn?.addEventListener("click", () => uploadSkinSide("top"));
  els.uploadBottomSkinBtn?.addEventListener("click", () => uploadSkinSide("bottom"));
  els.uploadBackSkinBtn?.addEventListener("click", () => uploadSkinSide("back"));
  els.uploadFaceSkinBtn?.addEventListener("click", uploadSelectedFaceSkin);
  els.assetShelfCategory?.addEventListener("change", () => {
    if (state.toolServer.skins.length) setStatus(`${els.assetShelfCategory.value.toUpperCase()} ASSET CATEGORY SELECTED.`);
  });
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
  els.clearFaceSkinBtn.addEventListener("click", clearSelectedFaceSkin);
  els.mirrorHalfSkins.addEventListener("input", () => {
    updateSkinReadout();
    renderAll();
  });
  els.skinAngle?.addEventListener("input", (ev) => syncSkinAngle(ev.target.value));
  els.skinAngleValue?.addEventListener("change", (ev) => syncSkinAngle(ev.target.value));
  els.downloadTopTemplateBtn.addEventListener("click", () => downloadTemplate("top"));
  els.downloadBottomTemplateBtn.addEventListener("click", () => downloadTemplate("bottom"));
  els.downloadBackTemplateBtn.addEventListener("click", () => downloadTemplate("back"));
  els.downloadFaceTemplateBtn.addEventListener("click", downloadSelectedFaceTemplate);
  els.templateFaceSide.addEventListener("change", (ev) => setSelectedFaceBitmapSide(ev.target.value));
  els.shipId.addEventListener("change", () => loadSkinBitmaps(els.shipId.value, state.skinImages?.mirrorX || emptyMirrorFlags(false)));
  document.getElementById("resetViewBtn").addEventListener("click", () => {
    state.view.rx = -0.35; state.view.ry = 0.72; fitView(); renderAll();
  });
  document.getElementById("fitViewBtn").addEventListener("click", () => { fitView(); renderAll(); });
  els.syncGamePreviewBtn?.addEventListener("click", syncGamePreview);
  window.addEventListener("message", (event) => {
    if (event.data?.type === "ultra-elite-render-preview-ready") {
      if (els.gamePreviewReadout) els.gamePreviewReadout.textContent = "GAME RENDERER READY.";
      syncGamePreview();
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
  document.getElementById("downloadBtn").addEventListener("click", downloadShip);
  document.getElementById("copyBtn").addEventListener("click", copyExport);
  document.getElementById("importBtn").addEventListener("click", importBuilderJson);
  els.exportKind.addEventListener("change", updateExport);
  [
    els.shipId, els.shipName, els.shipDescription, els.shipMissionLore, els.shipClass, els.npcRole, els.aiProfile, els.decalRole, els.baseColor,
    els.shipValue, els.shipHp, els.speedMul, els.cargoTons, els.missileCount, els.laserClass,
    els.flagTrader, els.flagPirate, els.flagPolice, els.flagAlien, els.flagEscapePod, els.flagHidden, els.mirrorHalfSkins, els.skinAngle, els.skinAngleValue
  ].forEach((el) => el.addEventListener("input", updateExport));
}

bindEvents();
populateLibrarySelector();
resetWedge();
checkLocalToolServer().then((ok) => {
  if (ok) refreshAvailableSkinAssets().catch(() => {});
});
