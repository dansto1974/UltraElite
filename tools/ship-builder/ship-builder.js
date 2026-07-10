"use strict";

const TAU = Math.PI * 2;
const EPS = 0.0001;

const els = {
  shipId: document.getElementById("shipId"),
  shipName: document.getElementById("shipName"),
  shipDescription: document.getElementById("shipDescription"),
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
  mainView: document.getElementById("mainView"),
  xSlider: document.getElementById("xSlider"),
  ySlider: document.getElementById("ySlider"),
  zSlider: document.getElementById("zSlider"),
  xValue: document.getElementById("xValue"),
  yValue: document.getElementById("yValue"),
  zValue: document.getElementById("zValue"),
  detailInset: document.getElementById("detailInset"),
  detailColor: document.getElementById("detailColor"),
  showFaceNormals: document.getElementById("showFaceNormals"),
  mirrorNewGeometry: document.getElementById("mirrorNewGeometry")
};

const state = {
  mode: "vertex",
  axis: "x",
  nextId: 1,
  verts: [],
  faces: [],
  edges: [],
  details: [],
  selected: null,
  pick: [],
  view: { rx: -0.35, ry: 0.72, zoom: 2.9, panX: 0, panY: 0 },
  orthoScale: 1,
  drag: null
};

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

function setStatus(text) {
  els.status.textContent = text;
}

function vertexById(id) {
  return state.verts.find((v) => v.id === id) || null;
}

function faceById(id) {
  return state.faces.find((f) => f.id === id) || null;
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
  if (mf && mids) mf.verts = mids;
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

function addDetail(type) {
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

function drawFace(ctx, pts, fill, stroke = "rgba(85,255,78,.46)", width = 1) {
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

function renderMain() {
  const canvas = els.mainView;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawStars(ctx, canvas);
  const projected = new Map(state.verts.map((v) => [v.id, project3d(v, canvas)]));

  const sortedFaces = [...state.faces].sort((a, b) => faceDepth(b) - faceDepth(a));
  for (const face of sortedFaces) {
    const pts = face.verts.map((id) => projected.get(id)).filter(Boolean);
    const n = faceNormal(face);
    const selected = state.selected?.type === "face" && state.selected.id === face.id;
    drawFace(ctx, pts, selected ? "rgba(255,217,54,.24)" : shadedHullColor(n), selected ? "#ffd936" : "rgba(85,255,78,.32)", selected ? 2 : 1);
  }
  drawFaceNormals(ctx, (v) => project3d(v, canvas));

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

  for (const detail of state.details) {
    const pts3 = detailModelPoints(detail);
    if (pts3.length < 2) continue;
    const pts = pts3.map((p) => project3d(p, canvas));
    const selected = state.selected?.type === "detail" && state.selected.id === detail.id;
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
    if (picked) {
      ctx.strokeStyle = "#66e8ff";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(p.x, p.y, selected ? 8.5 : 7, 0, TAU);
      ctx.stroke();
    }
    ctx.fillStyle = selected ? "#ffd936" : picked ? "#66e8ff" : v.center ? "#ffffff" : "#55ff4e";
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
}

function updateUi() {
  els.vertexCount.textContent = `${state.verts.length} vertices`;
  els.faceCount.textContent = `${state.faces.length} faces`;
  els.edgeCount.textContent = `${state.edges.length} lines`;
  els.pickList.textContent = state.pick.length ? state.pick.map((id) => `#${id}`).join("  ") : "Pick list empty";

  if (!state.selected) els.selectionReadout.textContent = "Nothing selected";
  else if (state.selected.type === "vertex") {
    const v = vertexById(state.selected.id);
    els.selectionReadout.textContent = v ? `Vertex #${v.id}  X ${round(v.x)}  Y ${round(v.y)}  Z ${round(v.z)}${v.mirrorId ? `  mirror #${v.mirrorId}` : "  centre"}` : "Missing vertex";
  } else if (state.selected.type === "face") {
    const face = faceById(state.selected.id);
    const n = face ? faceNormal(face) : null;
    els.selectionReadout.textContent = n
      ? `Face #${state.selected.id}  normal X ${round(n.x, 2)}  Y ${round(n.y, 2)}  Z ${round(n.z, 2)}`
      : `Face #${state.selected.id}`;
  } else {
    els.selectionReadout.textContent = `${state.selected.type.toUpperCase()} #${state.selected.id}`;
  }
  updateSliders();
  updateDetailControls();
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
  els.detailInset.disabled = !detail;
  els.detailColor.disabled = !detail;
  if (detail) {
    els.detailInset.value = detail.inset ?? 0.45;
    els.detailColor.value = detail.color || "#101915";
  }
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
    if (pts.length < 2) continue;
    if (d.type === "panel") {
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
  const projected = new Map(state.verts.map((v) => [v.id, project3d(v, els.mainView)]));
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
    const faces = [...state.faces].sort((a, b) => faceDepth(a) - faceDepth(b));
    const hit = faces.find((face) => pointInPoly(point, face.verts.map((id) => projected.get(id)).filter(Boolean)));
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
    const faces = [...state.faces].sort((a, b) => faceDepth(a) - faceDepth(b));
    const hit = faces.find((face) => pointInPoly(point, face.verts.map((id) => projected.get(id)).filter(Boolean)));
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
    state.details = state.details.filter((d) => faceById(d.faceId));
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
    const face = faceById(d.faceId);
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
  return {
    verts,
    edges,
    edgeFaces,
    edgeVisibility,
    normals,
    details,
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

function gameMetadata() {
  const radius = Math.round(modelRadius());
  return {
    class: els.shipClass.value,
    npcRole: els.npcRole.value,
    aiProfile: els.aiProfile.value,
    decalRole: els.decalRole.value,
    baseColor: normalizeHexColor(els.baseColor.value),
    description: els.shipDescription.value.trim(),
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
    faces: state.faces.map((f) => ({ id: f.id, verts: f.verts, mirrored: !!f.mirrored })),
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
    state.verts = data.verts.map((v) => {
      state.nextId = Math.max(state.nextId, Number(v.id) + 1);
      return { id: Number(v.id), x: Number(v.x), y: Number(v.y), z: Number(v.z), mirrorId: v.mirrorId ?? null, center: !!v.center };
    });
    state.faces = (data.faces || []).map((f) => {
      state.nextId = Math.max(state.nextId, Number(f.id) + 1);
      return { id: Number(f.id), verts: f.verts.map(Number), mirrored: !!f.mirrored };
    });
    state.edges = (data.edges || []).map((e) => {
      state.nextId = Math.max(state.nextId, Number(e.id) + 1);
      return { id: Number(e.id), a: Number(e.a), b: Number(e.b), kind: e.kind || "edge", mirrored: !!e.mirrored };
    });
    state.details = (data.details || []).map((d) => {
      state.nextId = Math.max(state.nextId, Number(d.id) + 1);
      return {
        ...d,
        id: Number(d.id),
        faceId: Number(d.faceId),
        segment: Array.isArray(d.segment) ? d.segment.map(Number) : undefined
      };
    });
    els.shipId.value = data.id || els.shipId.value;
    els.shipName.value = data.name || els.shipName.value;
    if (data.gameMeta) {
      const meta = data.gameMeta;
      els.shipDescription.value = meta.description || "";
      if (meta.class) els.shipClass.value = meta.class;
      if (meta.npcRole) els.npcRole.value = meta.npcRole;
      if (meta.aiProfile) els.aiProfile.value = meta.aiProfile;
      if (meta.decalRole) els.decalRole.value = meta.decalRole;
      if (meta.baseColor) els.baseColor.value = normalizeHexColor(meta.baseColor);
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
    }
    state.selected = null;
    state.pick = [];
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
  state.verts = (source.verts || []).map((v) => {
    const idNum = Number(v.id);
    state.nextId = Math.max(state.nextId, idNum + 1);
    return {
      id: idNum,
      x: Number(v.x),
      y: Number(v.y),
      z: Number(v.z),
      mirrorId: v.mirrorId ?? null,
      center: !!v.center
    };
  });
  state.faces = (source.faces || []).map((f) => {
    const idNum = Number(f.id);
    state.nextId = Math.max(state.nextId, idNum + 1);
    return { id: idNum, verts: (f.verts || []).map(Number), mirrored: !!f.mirrored };
  });
  state.edges = (source.edges || []).map((e) => {
    const idNum = Number(e.id);
    state.nextId = Math.max(state.nextId, idNum + 1);
    return { id: idNum, a: Number(e.a), b: Number(e.b), kind: e.kind || "edge", mirrored: !!e.mirrored };
  });
  state.details = (source.details || []).map((d) => {
    const idNum = Number(d.id);
    state.nextId = Math.max(state.nextId, idNum + 1);
    return {
      ...d,
      id: idNum,
      faceId: Number(d.faceId),
      segment: Array.isArray(d.segment) ? d.segment.map(Number) : undefined
    };
  });
  const meta = source.gameMeta || {};
  els.shipId.value = source.id || id;
  els.shipName.value = source.name || id;
  els.shipDescription.value = meta.description || "";
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
  state.selected = null;
  state.pick = [];
  syncModeUi(mode);
  if (announce) setStatus(`${mode.toUpperCase()} MODE. SELECTION CLEARED.`);
  renderAll();
}

function bindEvents() {
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
  document.getElementById("resetViewBtn").addEventListener("click", () => {
    state.view.rx = -0.35; state.view.ry = 0.72; fitView(); renderAll();
  });
  document.getElementById("fitViewBtn").addEventListener("click", () => { fitView(); renderAll(); });
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
    state.pick = [];
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
  document.getElementById("deleteDetailBtn").addEventListener("click", () => {
    if (state.selected?.type === "detail") deleteSelected();
  });
  els.detailInset.addEventListener("input", () => {
    const detail = state.selected?.type === "detail" ? detailById(state.selected.id) : null;
    if (!detail) return;
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
    els.shipId, els.shipName, els.shipDescription, els.shipClass, els.npcRole, els.aiProfile, els.decalRole, els.baseColor,
    els.shipValue, els.shipHp, els.speedMul, els.cargoTons, els.missileCount, els.laserClass,
    els.flagTrader, els.flagPirate, els.flagPolice, els.flagAlien, els.flagEscapePod, els.flagHidden
  ].forEach((el) => el.addEventListener("input", updateExport));
}

bindEvents();
populateLibrarySelector();
resetWedge();
