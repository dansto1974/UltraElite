import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../..");
const modelDir = path.join(root, "assets/models");
const builderLibraryPath = path.join(root, "tools/ship-builder/game-model-library.js");
const generatedRuntimePath = path.join(root, "src/generated/model-library.js");
const FORMAT = "ultra-elite-ship-builder/v1";

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    throw new Error(`Could not read ${path.relative(root, file)}: ${error.message}`);
  }
}

function cleanBitmapKey(value) {
  return String(value || "").trim().replace(/[^a-zA-Z0-9_-]+/g, "_").replace(/^_+|_+$/g, "");
}

function vec(x = 0, y = 0, z = 0) {
  if (Array.isArray(x)) return { x: Number(x[0]) || 0, y: Number(x[1]) || 0, z: Number(x[2]) || 0 };
  return { x: Number(x) || 0, y: Number(y) || 0, z: Number(z) || 0 };
}

function sub(a, b) {
  return vec(a.x - b.x, a.y - b.y, a.z - b.z);
}

function add(a, b) {
  return vec(a.x + b.x, a.y + b.y, a.z + b.z);
}

function mul(a, n) {
  return vec(a.x * n, a.y * n, a.z * n);
}

function cross(a, b) {
  return vec(a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x);
}

function len(a) {
  return Math.hypot(a.x, a.y, a.z);
}

function norm(a) {
  const l = len(a) || 1;
  return vec(a.x / l, a.y / l, a.z / l);
}

function round(n, precision = 2) {
  const scale = 10 ** precision;
  return Math.round((Number(n) || 0) * scale) / scale;
}

function toArray(v, precision = 2) {
  return [round(v.x, precision), round(v.y, precision), round(v.z, precision)];
}

function vertexId(vertex, index) {
  return vertex && typeof vertex === "object" && !Array.isArray(vertex) && vertex.id !== undefined ? vertex.id : index;
}

function vertexPoint(vertex) {
  return Array.isArray(vertex)
    ? vec(vertex[0], vertex[1], vertex[2])
    : vec(vertex?.x, vertex?.y, vertex?.z);
}

function faceVertexIds(face) {
  if (Array.isArray(face)) return face;
  return Array.isArray(face?.verts) ? face.verts : [];
}

function explicitEdgeIds(edge) {
  if (Array.isArray(edge)) return { a: edge[0], b: edge[1], kind: "edge" };
  return { a: edge?.a, b: edge?.b, kind: edge?.kind || "edge" };
}

function buildStateHelpers(data) {
  const sourceVerts = Array.isArray(data.verts) ? data.verts : [];
  const sourceFaces = Array.isArray(data.faces) ? data.faces : [];
  const indexById = new Map(sourceVerts.map((v, i) => [vertexId(v, i), i]));
  const sourceVertexById = new Map(sourceVerts.map((v, i) => [vertexId(v, i), v]));
  const sourceFaceById = new Map(sourceFaces.map((face, i) => [face?.id ?? i, face]));
  const verts = sourceVerts.map((v) => toArray(vertexPoint(v)));
  const vertexById = (id) => sourceVertexById.get(id);
  const faceById = (id) => sourceFaceById.get(id);
  const faceNormal = (face) => {
    const ids = faceVertexIds(face).map((id) => indexById.get(id)).filter((i) => i !== undefined);
    if (ids.length < 3) return vec(0, 0, 1);
    const a = vec(verts[ids[0]]), b = vec(verts[ids[1]]), c = vec(verts[ids[2]]);
    return norm(cross(sub(b, a), sub(c, a)));
  };
  const faceCenter = (face) => {
    const ids = faceVertexIds(face);
    if (!ids.length) return vec();
    return mul(ids.reduce((sum, id) => {
      const v = vertexPoint(vertexById(id));
      return add(sum, v);
    }, vec()), 1 / ids.length);
  };
  const detailModelPoints = (detail) => {
    if (detail.vertexId !== undefined) {
      const v = vertexById(Number(detail.vertexId));
      return v ? [vertexPoint(v)] : [];
    }
    if (Array.isArray(detail.points)) {
      return detail.points
        .map((p) => Array.isArray(p) ? vec(p[0], p[1], p[2]) : vec(p?.x, p?.y, p?.z))
        .filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y) && Number.isFinite(p.z));
    }
    if (Array.isArray(detail.indices)) {
      return detail.indices
        .map((id) => vertexById(Number(id)))
        .filter(Boolean)
        .map(vertexPoint);
    }
    const face = faceById(detail.faceId);
    if (!face) return [];
    const inset = Number(detail.inset) || 0.45;
    const c = faceCenter(face);
    const points = faceVertexIds(face)
      .map((id) => vertexById(id))
      .filter(Boolean)
      .map((v) => add(c, mul(sub(vertexPoint(v), c), inset)));
    if (detail.type === "panel" && Array.isArray(detail.segment) && detail.segment.length === 2) {
      return detail.segment.map((id) => {
        const v = vertexById(id);
        return v ? add(c, mul(sub(vertexPoint(v), c), inset)) : null;
      }).filter(Boolean);
    }
    if (detail.type === "panel" && points.length >= 2) return [...points, points[0]];
    return points;
  };
  return { sourceVerts, sourceFaces, indexById, verts, faceById, faceNormal, detailModelPoints };
}

function sourceImageProjection(data) {
  const sourceFaces = Array.isArray(data.faces) ? data.faces : [];
  if (!sourceFaces.length) return null;
  const faceSides = sourceFaces.map((face) => {
    const side = face?.bitmapSide;
    return side === "top" || side === "bottom" || side === "back" ? side : null;
  });
  const faceTextures = sourceFaces.map((face) => cleanBitmapKey(face?.bitmapFaceKey) || null);
  const primaryAxis = data.id === "thargoid" || data.id === "thargon" ? "x" : "y";
  const imageProjection = {
    ...(primaryAxis !== "y" ? { primaryAxis } : {}),
    ...(faceSides.some(Boolean) ? { faceSides } : {}),
    ...(faceTextures.some(Boolean) ? { faceTextures } : {})
  };
  return imageProjection.primaryAxis || imageProjection.faceSides || imageProjection.faceTextures ? imageProjection : null;
}

function deriveBlueprint(data) {
  if (data.blueprint && typeof data.blueprint === "object") {
    const blueprint = JSON.parse(JSON.stringify(data.blueprint));
    const imageProjection = sourceImageProjection(data);
    if (imageProjection) blueprint.imageProjection = { ...(blueprint.imageProjection || {}), ...imageProjection };
    return blueprint;
  }
  const { sourceFaces, indexById, verts, faceById, faceNormal, detailModelPoints } = buildStateHelpers(data);
  const faces = sourceFaces
    .map((face) => faceVertexIds(face).map((id) => indexById.get(id)).filter((i) => i !== undefined))
    .filter((ids) => ids.length >= 3);
  const normals = faces.map((ids) => {
    const a = vec(verts[ids[0]]), b = vec(verts[ids[1]]), c = vec(verts[ids[2]]);
    const n = norm(cross(sub(b, a), sub(c, a)));
    return [round(n.x * 100), round(n.y * 100), round(n.z * 100)];
  });
  const edgeMap = new Map();
  const addDerivedEdge = (a, b, faceIndex = -1, kind = "edge") => {
    if (a === undefined || b === undefined || a === b) return;
    const key = a < b ? `${a},${b}` : `${b},${a}`;
    if (!edgeMap.has(key)) edgeMap.set(key, { edge: a < b ? [a, b] : [b, a], faces: [], kind });
    const entry = edgeMap.get(key);
    if (faceIndex >= 0) entry.faces.push(faceIndex);
    if (kind === "stick") entry.kind = "stick";
  };
  faces.forEach((ids, faceIndex) => {
    for (let i = 0; i < ids.length; i++) addDerivedEdge(ids[i], ids[(i + 1) % ids.length], faceIndex);
  });
  for (const edge of data.edges || []) {
    const explicit = explicitEdgeIds(edge);
    const a = indexById.get(explicit.a);
    const b = indexById.get(explicit.b);
    addDerivedEdge(a, b, -1, explicit.kind);
  }
  const edgeEntries = [...edgeMap.values()];
  const edges = edgeEntries.map((entry) => entry.edge);
  const edgeFaces = edgeEntries.map((entry) => {
    const unique = [...new Set(entry.faces)];
    if (!unique.length) return [-1, -1];
    if (unique.length === 1) return [unique[0], unique[0]];
    return [unique[0], unique[1]];
  });
  const details = (data.details || []).map((detail) => {
    if (detail.type === "beacon") {
      const sourceIndex = detail.index !== undefined ? Number(detail.index) : indexById.get(Number(detail.vertexId));
      if (!Number.isFinite(sourceIndex)) return null;
      return {
        type: "beacon",
        index: sourceIndex,
        color: detail.color || "#ffb642"
      };
    }
    const face = faceById(detail.faceId);
    const normal = Array.isArray(detail.normal) ? vec(detail.normal) : face ? faceNormal(face) : vec(0, 0, 1);
    const points = detailModelPoints(detail).map((p) => toArray(p));
    if (points.length < 2 && !Array.isArray(detail.indices)) return null;
    const base = {
      type: detail.type === "panel" ? "line" : detail.type,
      color: detail.color,
      normal: toArray(normal, 3),
      ...(detail.stroke ? { stroke: detail.stroke } : {}),
      ...(detail.width ? { width: detail.width } : {}),
      ...(detail.lift ? { lift: detail.lift } : {}),
      ...(detail.cull === false ? { cull: false } : {}),
      ...(detail.cullEpsilon !== undefined ? { cullEpsilon: detail.cullEpsilon } : {})
    };
    if (Array.isArray(detail.indices)) {
      const indices = detail.indices.map((id) => indexById.get(Number(id))).filter((i) => i !== undefined);
      if (indices.length >= 2) return { ...base, indices };
    }
    return {
      ...base,
      points,
      ...(detail.type === "engine" ? { stroke: detail.stroke || "#ffffff", lift: detail.lift || 1.5 } : {})
    };
  }).filter(Boolean);
  const imageProjection = sourceImageProjection(data) || {};
  return {
    verts,
    edges,
    edgeFaces,
    edgeVisibility: edges.map(() => 31),
    normals,
    details,
    ...(imageProjection.primaryAxis || imageProjection.faceSides || imageProjection.faceTextures ? { imageProjection } : {}),
    gameMeta: data.gameMeta || {}
  };
}

function validateModel(data, file) {
  const label = path.relative(root, file);
  if (!data || typeof data !== "object") throw new Error(`${label} is not an object.`);
  if (!data.id || typeof data.id !== "string") throw new Error(`${label} is missing a string id.`);
  if (!data.name || typeof data.name !== "string") throw new Error(`${label} is missing a string name.`);
  if (!Array.isArray(data.verts) || !data.verts.length) throw new Error(`${label} is missing verts.`);
  if (!Array.isArray(data.faces) || !data.faces.length) throw new Error(`${label} is missing faces.`);
  const blueprint = deriveBlueprint(data);
  if (!Array.isArray(blueprint.verts) || !Array.isArray(blueprint.edges) || !Array.isArray(blueprint.normals)) {
    throw new Error(`${label} blueprint is missing verts, edges or normals.`);
  }
  data.blueprint = blueprint;
}

function displayName(data) {
  const fallbackDisplayNames = {
    cobra: "COBRA MK III",
    cobra1: "COBRA MK I",
    asp: "ASP MK II",
    ferdelance: "FER-DE-LANCE",
    escapePod: "ESCAPE POD",
    plate: "ALLOY PLATE",
    hermit: "ROCK HERMIT",
    dodoStation: "DODO STATION",
    coriolis: "CORIOLIS STATION"
  };
  return String(fallbackDisplayNames[data.id] || data.name || data.id)
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_+/g, " ")
    .trim()
    .toUpperCase();
}

function runtimeBlueprint(data) {
  const blueprint = JSON.parse(JSON.stringify(data.blueprint));
  blueprint.id = data.id;
  blueprint.name = data.name;
  blueprint.gameMeta = {
    ...(blueprint.gameMeta || {}),
    ...(data.gameMeta || {})
  };
  return blueprint;
}

function loadModels() {
  if (!fs.existsSync(modelDir)) return [];
  return fs.readdirSync(modelDir)
    .filter((file) => file.endsWith(".ultraship.json"))
    .sort((a, b) => a.localeCompare(b))
    .map((file) => {
      const filePath = path.join(modelDir, file);
      const data = readJson(filePath);
      validateModel(data, filePath);
      return {
        ...data,
        format: data.format || FORMAT
      };
    })
    .sort((a, b) => a.id.localeCompare(b.id));
}

const models = loadModels();
const builderLibrary = Object.fromEntries(models.map((model) => [model.id, model]));
const builderDescriptions = Object.fromEntries(models.map((model) => [
  model.id,
  model.gameMeta?.description || model.description || ""
]));
const runtimeBlueprints = Object.fromEntries(models.map((model) => [model.id, runtimeBlueprint(model)]));
const runtimeNames = Object.fromEntries(models.map((model) => [model.id, displayName(model)]));

fs.mkdirSync(path.dirname(builderLibraryPath), { recursive: true });
fs.mkdirSync(path.dirname(generatedRuntimePath), { recursive: true });

fs.writeFileSync(builderLibraryPath, [
  "// Generated by tools/build/generate-model-library.mjs. Edit JSON in assets/models, then run npm run build.",
  `window.ULTRA_ELITE_SHIP_DESCRIPTIONS = ${JSON.stringify(builderDescriptions, null, 2)};`,
  `window.ULTRA_ELITE_MODEL_LIBRARY = ${JSON.stringify(builderLibrary, null, 2)};`,
  ""
].join("\n"));

fs.writeFileSync(generatedRuntimePath, [
  "/* Generated by tools/build/generate-model-library.mjs. Edit JSON in assets/models, then run npm run build. */",
  `globalThis.ULTRA_ELITE_MODEL_BLUEPRINTS = ${JSON.stringify(runtimeBlueprints)};`,
  `globalThis.ULTRA_ELITE_MODEL_NAMES = ${JSON.stringify(runtimeNames)};`,
  ""
].join("\n"));

console.log(`Generated ${path.relative(root, builderLibraryPath)} from ${models.length} model asset${models.length === 1 ? "" : "s"}`);
console.log(`Generated ${path.relative(root, generatedRuntimePath)}`);
