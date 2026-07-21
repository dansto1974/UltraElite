import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../..");
const modelDir = path.join(root, "assets/models");
const builderLibraryPath = path.join(root, "tools/ship-builder/game-model-library.js");
const generatedRuntimePath = path.join(root, "src/generated/model-library.js");
const FORMAT = "ultra-elite-ship-builder/v1";
const pngAverageColorCache = new Map();

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

function cleanHexColor(value) {
  const text = String(value || "").trim();
  return /^#[0-9a-f]{6}$/i.test(text) ? text.toLowerCase() : null;
}

function cleanBitmapWrap(value) {
  return value === "repeat" || value === "mirror" ? value : "clip";
}

function averagePngColor(filePath) {
  if (pngAverageColorCache.has(filePath)) return pngAverageColorCache.get(filePath);
  let color = null;
  try {
    const png = fs.readFileSync(filePath);
    const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
    if (!png.subarray(0, 8).equals(signature)) throw new Error("not a PNG");
    let pos = 8;
    let width = 0;
    let height = 0;
    let bitDepth = 0;
    let colorType = 0;
    const idat = [];
    while (pos + 12 <= png.length) {
      const length = png.readUInt32BE(pos);
      const type = png.subarray(pos + 4, pos + 8).toString("ascii");
      const data = png.subarray(pos + 8, pos + 8 + length);
      pos += 12 + length;
      if (type === "IHDR") {
        width = data.readUInt32BE(0);
        height = data.readUInt32BE(4);
        bitDepth = data[8];
        colorType = data[9];
        if (data[12]) throw new Error("interlaced PNGs are not supported");
      } else if (type === "IDAT") {
        idat.push(data);
      } else if (type === "IEND") {
        break;
      }
    }
    const channels = colorType === 6 ? 4 : colorType === 2 ? 3 : 0;
    if (!width || !height || bitDepth !== 8 || !channels || !idat.length) throw new Error("unsupported PNG format");
    const raw = zlib.inflateSync(Buffer.concat(idat));
    const stride = width * channels;
    const rows = [];
    let offset = 0;
    let sumR = 0;
    let sumG = 0;
    let sumB = 0;
    let sumA = 0;
    for (let y = 0; y < height; y++) {
      const filter = raw[offset++];
      const row = Buffer.alloc(stride);
      const prev = y > 0 ? rows[y - 1] : null;
      for (let x = 0; x < stride; x++) {
        const value = raw[offset++];
        const left = x >= channels ? row[x - channels] : 0;
        const up = prev ? prev[x] : 0;
        const upLeft = prev && x >= channels ? prev[x - channels] : 0;
        let recon = value;
        if (filter === 1) recon += left;
        else if (filter === 2) recon += up;
        else if (filter === 3) recon += Math.floor((left + up) / 2);
        else if (filter === 4) {
          const p = left + up - upLeft;
          const pa = Math.abs(p - left);
          const pb = Math.abs(p - up);
          const pc = Math.abs(p - upLeft);
          recon += pa <= pb && pa <= pc ? left : pb <= pc ? up : upLeft;
        } else if (filter !== 0) {
          throw new Error(`unsupported PNG filter ${filter}`);
        }
        row[x] = recon & 255;
      }
      rows.push(row);
      for (let x = 0; x < stride; x += channels) {
        const a = channels === 4 ? row[x + 3] : 255;
        if (a <= 8) continue;
        sumR += row[x] * a;
        sumG += row[x + 1] * a;
        sumB += row[x + 2] * a;
        sumA += a;
      }
    }
    if (sumA > 0) {
      const toHex = (n) => Math.round(n / sumA).toString(16).padStart(2, "0");
      color = `#${toHex(sumR)}${toHex(sumG)}${toHex(sumB)}`;
    }
  } catch {
    color = null;
  }
  pngAverageColorCache.set(filePath, color);
  return color;
}

function averageBitmapFaceColor(modelId, faceKey) {
  const cleanModel = cleanBitmapKey(modelId);
  const cleanKey = cleanBitmapKey(faceKey);
  if (!cleanModel || !cleanKey) return null;
  const filePath = path.join(root, "assets/skins", `${cleanModel}-face-${cleanKey}.png`);
  return fs.existsSync(filePath) ? averagePngColor(filePath) : null;
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
  const FACE_RENDER_FACE_TEXTURE = 1;
  const FACE_RENDER_EXPLICIT_UV = 2;
  const FACE_RENDER_DECAL = 4;
  const FACE_RENDER_FALLBACK_COLOR = 8;
  const FACE_RENDER_MIRROR_X = 16;
  const FACE_RENDER_ANGLE = 32;
  const FACE_RENDER_SIDE = 64;
  const faceSides = sourceFaces.map((face) => {
    const side = face?.bitmapSide;
    return side === "top" || side === "bottom" || side === "back" ? side : null;
  });
  const faceTextures = sourceFaces.map((face) => cleanBitmapKey(face?.bitmapFaceKey) || null);
  const cleanFaceUv = (uv) => Array.isArray(uv)
    ? uv.map((p) => Array.isArray(p) && Number.isFinite(Number(p[0])) && Number.isFinite(Number(p[1]))
      ? [round(Number(p[0]), 3), round(Number(p[1]), 3)]
      : null).filter(Boolean)
    : null;
  const faceTextureUv = sourceFaces.map((face) => {
    const uv = cleanFaceUv(face?.bitmapUv);
    return uv?.length >= 3 ? uv : null;
  });
  const faceTextureBaseW = sourceFaces.map((face) => Number.isFinite(Number(face?.bitmapBaseW)) && Number(face.bitmapBaseW) > 0 ? Math.round(Number(face.bitmapBaseW)) : null);
  const faceTextureBaseH = sourceFaces.map((face) => Number.isFinite(Number(face?.bitmapBaseH)) && Number(face.bitmapBaseH) > 0 ? Math.round(Number(face.bitmapBaseH)) : null);
  const faceTextureWrap = sourceFaces.map((face) => {
    const wrap = cleanBitmapWrap(face?.bitmapWrap);
    return wrap === "clip" ? null : wrap;
  });
  const faceColors = sourceFaces.map((face) =>
    cleanHexColor(face?.faceColor || face?.color)
    || averageBitmapFaceColor(data.id, face?.bitmapFaceKey)
    || null);
  const cleanAngle = (value) => {
    let n = Number(value) || 0;
    n = ((n + 180) % 360 + 360) % 360 - 180;
    return Math.abs(n) < .0001 ? null : Math.round(n * 100) / 100;
  };
  const cleanFaceDecal = (decal) => {
    const key = cleanBitmapKey(decal?.key);
    if (!key) return null;
    const clamp01 = (value, fallback) => Math.max(0, Math.min(1, Number.isFinite(Number(value)) ? Number(value) : fallback));
    const scale = Math.max(.02, Math.min(2, Number.isFinite(Number(decal?.scale)) ? Number(decal.scale) : .35));
    const alpha = clamp01(decal?.alpha, .92);
    const angle = cleanAngle(decal?.angle) || 0;
    return {
      key,
      x: round(clamp01(decal?.x, .5), 3),
      y: round(clamp01(decal?.y, .5), 3),
      scale: round(scale, 3),
      ...(angle ? { angle } : {}),
      ...(alpha < .999 ? { alpha: round(alpha, 3) } : {})
    };
  };
  const faceAngles = sourceFaces.map((face) => cleanAngle(face?.bitmapAngle));
  const faceMirrorX = sourceFaces.map((face) => !!face?.bitmapMirrorX);
  const faceDecals = sourceFaces.map((face) => Array.isArray(face?.bitmapDecals)
    ? face.bitmapDecals.map(cleanFaceDecal).filter(Boolean)
    : null);
  const faceRenderFlags = sourceFaces.map((face, index) => {
    let flags = 0;
    if (faceSides[index]) flags |= FACE_RENDER_SIDE;
    if (faceTextures[index]) flags |= FACE_RENDER_FACE_TEXTURE;
    if (faceTextureUv[index]) flags |= FACE_RENDER_EXPLICIT_UV;
    if (faceColors[index]) flags |= FACE_RENDER_FALLBACK_COLOR;
    if (faceAngles[index] != null) flags |= FACE_RENDER_ANGLE;
    if (faceMirrorX[index]) flags |= FACE_RENDER_MIRROR_X;
    if (faceDecals[index]?.length) flags |= FACE_RENDER_DECAL;
    return flags;
  });
  const primaryAxis = data.id === "thargoid" || data.id === "thargon" ? "x" : "y";
  const imageProjection = {
    ...(primaryAxis !== "y" ? { primaryAxis } : {}),
    ...(faceSides.some(Boolean) ? { faceSides } : {}),
    ...(faceTextures.some(Boolean) ? { faceTextures } : {}),
    ...(faceTextureUv.some(Boolean) ? { faceTextureUv } : {}),
    ...(faceTextureBaseW.some(Boolean) ? { faceTextureBaseW } : {}),
    ...(faceTextureBaseH.some(Boolean) ? { faceTextureBaseH } : {}),
    ...(faceTextureWrap.some(Boolean) ? { faceTextureWrap } : {}),
    ...(faceColors.some(Boolean) ? { faceColors } : {}),
    ...(faceAngles.some((angle) => angle != null) ? { faceAngles } : {}),
    ...(faceMirrorX.some(Boolean) ? { faceMirrorX } : {}),
    ...(faceDecals.some((decals) => decals?.length) ? { faceDecals } : {}),
    ...(faceRenderFlags.some(Boolean) ? { faceRenderFlags } : {})
  };
  return imageProjection.primaryAxis || imageProjection.faceSides || imageProjection.faceTextures || imageProjection.faceTextureUv || imageProjection.faceTextureWrap || imageProjection.faceColors || imageProjection.faceAngles || imageProjection.faceMirrorX || imageProjection.faceDecals || imageProjection.faceRenderFlags ? imageProjection : null;
}

function detailRenderIntent(detail) {
  const type = detail?.type === "panel" ? "line" : detail?.type;
  const line = type === "line" || type === "polyline";
  const beacon = type === "beacon";
  const engine = type === "engine";
  const window = type === "window";
  const stationEntrance = type === "stationEntrance";
  return {
    kind: stationEntrance ? "stationEntrance" : beacon ? "beacon" : line ? "line" : "poly",
    solid: !line && !stationEntrance,
    wire: !beacon,
    glow: engine,
    glass: window,
    solidStroke: engine
  };
}

function withDetailRender(detail) {
  return {
    ...detail,
    detailRender: detailRenderIntent(detail)
  };
}

function normalizeBlueprintDetails(data, blueprint) {
  if (!Array.isArray(blueprint.details)) return;
  const stationSlotBeacon = data.id === "coriolis" || data.id === "dodoStation";
  blueprint.details = blueprint.details.map((detail) => {
    if (detail?.type !== "beacon") return withDetailRender(detail);
    const normal = Array.isArray(detail.normal)
      ? toArray(vec(detail.normal), 3)
      : stationSlotBeacon
        ? [0, 0, 1]
        : null;
    return withDetailRender({
      ...detail,
      ...(normal ? { normal } : {})
    });
  });
}

function sourceEdgeKindsForBlueprint(data, blueprint) {
  if (!Array.isArray(blueprint?.edges)) return null;
  const indexById = new Map((data.verts || []).map((vertex, index) => [Number(vertex?.id ?? index), index]));
  const kindByKey = new Map();
  for (const edge of data.edges || []) {
    const explicit = explicitEdgeIds(edge);
    const a = indexById.get(Number(explicit.a));
    const b = indexById.get(Number(explicit.b));
    if (a === undefined || b === undefined || a === b) continue;
    const key = a < b ? `${a},${b}` : `${b},${a}`;
    kindByKey.set(key, explicit.kind === "hidden" ? "hidden" : explicit.kind === "stick" ? "stick" : "edge");
  }
  return blueprint.edges.map((edge) => {
    if (!Array.isArray(edge) || edge.length < 2) return "edge";
    const [a, b] = edge;
    const key = a < b ? `${a},${b}` : `${b},${a}`;
    return kindByKey.get(key) || "edge";
  });
}

function orderedVerticesForEdgeLoop(edges) {
  if (!edges.length) return [];
  const byVertex = new Map();
  const add = (vertexId, edgeIndex) => {
    if (!byVertex.has(vertexId)) byVertex.set(vertexId, []);
    byVertex.get(vertexId).push(edgeIndex);
  };
  edges.forEach((edge, edgeIndex) => {
    add(edge.a, edgeIndex);
    add(edge.b, edgeIndex);
  });
  const endpoints = [...byVertex.entries()].filter(([, items]) => items.length === 1).map(([id]) => id);
  const start = endpoints[0] ?? edges[0].a;
  const ordered = [start];
  const used = new Set();
  let current = start;
  while (used.size < edges.length) {
    const nextIndex = (byVertex.get(current) || []).find((edgeIndex) => !used.has(edgeIndex));
    if (nextIndex == null) break;
    used.add(nextIndex);
    const edge = edges[nextIndex];
    const nextVertex = edge.a === current ? edge.b : edge.a;
    if (nextVertex === start && used.size === edges.length) break;
    ordered.push(nextVertex);
    current = nextVertex;
  }
  return ordered;
}

function stationEntranceDetailsFromEdges(data, indexById) {
  const edges = (data.edges || [])
    .map((edge) => explicitEdgeIds(edge))
    .filter((edge) => edge.kind === "stationEntrance")
    .map((edge) => ({ a: indexById.get(Number(edge.a)), b: indexById.get(Number(edge.b)) }))
    .filter((edge) => Number.isInteger(edge.a) && Number.isInteger(edge.b) && edge.a !== edge.b);
  if (!edges.length) return [];
  const remaining = new Set(edges.map((_, index) => index));
  const byVertex = new Map();
  edges.forEach((edge, index) => {
    if (!byVertex.has(edge.a)) byVertex.set(edge.a, []);
    if (!byVertex.has(edge.b)) byVertex.set(edge.b, []);
    byVertex.get(edge.a).push(index);
    byVertex.get(edge.b).push(index);
  });
  const details = [];
  while (remaining.size) {
    const startIndex = [...remaining][0];
    const stack = [startIndex];
    const component = [];
    while (stack.length) {
      const index = stack.pop();
      if (!remaining.delete(index)) continue;
      const edge = edges[index];
      component.push(edge);
      for (const vertexId of [edge.a, edge.b]) {
        for (const next of byVertex.get(vertexId) || []) {
          if (remaining.has(next)) stack.push(next);
        }
      }
    }
    const degree = new Map();
    component.forEach((edge) => {
      degree.set(edge.a, (degree.get(edge.a) || 0) + 1);
      degree.set(edge.b, (degree.get(edge.b) || 0) + 1);
    });
    if (component.length < 4 || [...degree.values()].some((count) => count !== 2)) continue;
    const indices = orderedVerticesForEdgeLoop(component);
    if (indices.length < 4) continue;
    details.push(withDetailRender({
      type: "stationEntrance",
      indices,
      color: "#06131f",
      normal: [0, 0, 1],
      lift: 0
    }));
  }
  return details;
}

function stripStationEntranceEdgesFromEmbeddedBlueprint(data, blueprint) {
  if (!Array.isArray(blueprint?.edges)) return;
  const indexById = new Map((data.verts || []).map((vertex, index) => [Number(vertex?.id ?? index), index]));
  const entranceKeys = new Set();
  for (const edge of data.edges || []) {
    const explicit = explicitEdgeIds(edge);
    if (explicit.kind !== "stationEntrance") continue;
    const a = indexById.get(Number(explicit.a));
    const b = indexById.get(Number(explicit.b));
    if (a === undefined || b === undefined || a === b) continue;
    entranceKeys.add(a < b ? `${a},${b}` : `${b},${a}`);
  }
  if (!entranceKeys.size) return;
  const keep = blueprint.edges.map((edge, index) => {
    if (!Array.isArray(edge) || edge.length < 2) return true;
    const [a, b] = edge.map(Number);
    const key = a < b ? `${a},${b}` : `${b},${a}`;
    return !entranceKeys.has(key);
  });
  blueprint.edges = blueprint.edges.filter((_, index) => keep[index]);
  for (const field of ["edgeKinds", "edgeFaces", "edgeVisibility"]) {
    if (Array.isArray(blueprint[field])) blueprint[field] = blueprint[field].filter((_, index) => keep[index]);
  }
}

function deriveBlueprint(data) {
  if (data.blueprint && typeof data.blueprint === "object") {
    const blueprint = JSON.parse(JSON.stringify(data.blueprint));
    stripStationEntranceEdgesFromEmbeddedBlueprint(data, blueprint);
    const imageProjection = sourceImageProjection(data);
    if (imageProjection) blueprint.imageProjection = { ...(blueprint.imageProjection || {}), ...imageProjection };
    const edgeKinds = sourceEdgeKindsForBlueprint(data, blueprint);
    if (edgeKinds) blueprint.edgeKinds = edgeKinds;
    normalizeBlueprintDetails(data, blueprint);
    const indexById = new Map((data.verts || []).map((vertex, index) => [Number(vertex?.id ?? index), index]));
    const stationEntranceDetails = stationEntranceDetailsFromEdges(data, indexById);
    if (stationEntranceDetails.length) {
      blueprint.details = [
        ...(blueprint.details || []).filter((detail) => detail?.type !== "stationEntrance"),
        ...stationEntranceDetails
      ];
    }
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
    if (kind === "hidden") entry.kind = "hidden";
    else if (kind === "stick" && entry.kind !== "hidden") entry.kind = "stick";
  };
  faces.forEach((ids, faceIndex) => {
    for (let i = 0; i < ids.length; i++) addDerivedEdge(ids[i], ids[(i + 1) % ids.length], faceIndex);
  });
  for (const edge of data.edges || []) {
    const explicit = explicitEdgeIds(edge);
    if (explicit.kind === "stationEntrance") continue;
    const a = indexById.get(explicit.a);
    const b = indexById.get(explicit.b);
    addDerivedEdge(a, b, -1, explicit.kind);
  }
  const edgeEntries = [...edgeMap.values()];
  const edges = edgeEntries.map((entry) => entry.edge);
  const edgeKinds = edgeEntries.map((entry) => entry.kind === "hidden" ? "hidden" : entry.kind === "stick" ? "stick" : "edge");
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
      const slotBeacon = (data.id === "coriolis" || data.id === "dodoStation") && sourceIndex >= verts.length - 4;
      const normal = Array.isArray(detail.normal)
        ? toArray(vec(detail.normal), 3)
        : slotBeacon
          ? [0, 0, 1]
          : null;
      return withDetailRender({
        type: "beacon",
        index: sourceIndex,
        color: detail.color || "#ffb642",
        ...(normal ? { normal } : {}),
        ...(detail.lift !== undefined ? { lift: round(Number(detail.lift)) } : {})
      });
    }
    const face = faceById(detail.faceId);
    const normal = Array.isArray(detail.normal) ? vec(detail.normal) : face ? faceNormal(face) : vec(0, 0, 1);
    const points = detailModelPoints(detail).map((p) => toArray(p));
    if (points.length < 2 && !Array.isArray(detail.indices)) return null;
    const base = {
      type: detail.type === "panel" ? "line" : detail.type,
      color: detail.color,
      normal: toArray(normal, 3),
      ...(detail.type === "window" && detail.baseTransparent === true ? { baseTransparent: true } : {}),
      ...(detail.type === "window" && cleanHexColor(detail.glintDark) ? { glintDark: cleanHexColor(detail.glintDark) } : {}),
      ...(detail.type === "window" && cleanHexColor(detail.glintBright) ? { glintBright: cleanHexColor(detail.glintBright) } : {}),
      ...(detail.stroke ? { stroke: detail.stroke } : {}),
      ...(detail.width ? { width: detail.width } : {}),
      ...(detail.lift ? { lift: detail.lift } : {}),
      ...(detail.cull === false ? { cull: false } : {}),
      ...(detail.cullEpsilon !== undefined ? { cullEpsilon: detail.cullEpsilon } : {})
    };
    if (Array.isArray(detail.indices)) {
      const indices = detail.indices.map((id) => indexById.get(Number(id))).filter((i) => i !== undefined);
      if (indices.length >= 2) return withDetailRender({ ...base, indices });
    }
    return withDetailRender({
      ...base,
      points,
      ...(detail.type === "engine" ? { stroke: detail.stroke || "#ffffff", lift: detail.lift || 1.5 } : {})
    });
  }).filter(Boolean);
  const stationEntranceDetails = stationEntranceDetailsFromEdges(data, indexById);
  const imageProjection = sourceImageProjection(data) || {};
  return {
    verts,
    edges,
    edgeKinds,
    edgeFaces,
    edgeVisibility: edges.map(() => 31),
    normals,
    details: [...details, ...stationEntranceDetails],
    ...(imageProjection.primaryAxis || imageProjection.faceSides || imageProjection.faceTextures || imageProjection.faceTextureUv || imageProjection.faceColors || imageProjection.faceAngles || imageProjection.faceMirrorX || imageProjection.faceDecals ? { imageProjection } : {}),
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
