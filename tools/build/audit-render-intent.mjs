import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../..");
const modelDir = path.join(root, "assets/models");
const generatedRuntimePath = path.join(root, "src/generated/model-library.js");
const builderLibraryPath = path.join(root, "tools/ship-builder/game-model-library.js");
const strict = process.argv.includes("--strict");

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    throw new Error(`${path.relative(root, filePath)}: ${error.message}`);
  }
}

function runGenerated(filePath, globalName) {
  if (!fs.existsSync(filePath)) return {};
  const ctx = { globalThis: {} };
  vm.runInNewContext(fs.readFileSync(filePath, "utf8"), ctx, { filename: filePath });
  return ctx.globalThis[globalName] || {};
}

function runWindowGenerated(filePath, windowName) {
  if (!fs.existsSync(filePath)) return {};
  const ctx = { window: {} };
  vm.runInNewContext(fs.readFileSync(filePath, "utf8"), ctx, { filename: filePath });
  return ctx.window[windowName] || {};
}

function vertexIds(face) {
  if (Array.isArray(face)) return face;
  return Array.isArray(face?.verts) ? face.verts : [];
}

function vertexId(vertex, index) {
  if (Array.isArray(vertex)) return index;
  const id = Number(vertex?.id);
  return Number.isFinite(id) ? id : index;
}

function vertexPoint(vertex) {
  const point = Array.isArray(vertex)
    ? vertex
    : [vertex?.x, vertex?.y, vertex?.z];
  const x = Number(point[0]);
  const y = Number(point[1]);
  const z = Number(point[2]);
  return Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(z) ? [x, y, z] : null;
}

function edgeEnds(edge) {
  if (Array.isArray(edge)) return { a: edge[0], b: edge[1], kind: "edge", id: null };
  return { a: edge?.a, b: edge?.b, kind: edge?.kind || "edge", id: edge?.id ?? null };
}

function edgeKey(a, b) {
  const na = Number(a);
  const nb = Number(b);
  if (!Number.isFinite(na) || !Number.isFinite(nb) || na === nb) return null;
  return na < nb ? `${na},${nb}` : `${nb},${na}`;
}

function isIntentionalOrphanEdge(kind) {
  return kind === "stick" || kind === "hidden" || kind === "stationEntrance";
}

function cleanAngle(value) {
  let n = Number(value) || 0;
  n = ((n + 180) % 360 + 360) % 360 - 180;
  return Math.abs(n) < .0001 ? 0 : Math.round(n * 100) / 100;
}

function parseHexColor(value) {
  const text = String(value || "").trim();
  const short = text.match(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/i);
  if (short) {
    return short.slice(1).map((c) => parseInt(`${c}${c}`, 16));
  }
  const long = text.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  return long ? long.slice(1).map((c) => parseInt(c, 16)) : null;
}

function isNearWhite(value) {
  const rgb = parseHexColor(value);
  return !!rgb && rgb.every((channel) => channel >= 235);
}

function isGlassLike(type) {
  return ["window", "glass", "portal", "forcefield", "forceField"].includes(String(type || ""));
}

function isProjectorCandidate(face) {
  if (!face || typeof face !== "object") return false;
  if (!["top", "bottom", "back"].includes(face.bitmapSide)) return false;
  return !Array.isArray(face.bitmapUv) || !face.bitmapUv.length;
}

function sub(a, b) {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function cross(a, b) {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0]
  ];
}

function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function length(v) {
  return Math.hypot(v[0], v[1], v[2]);
}

function normalize(v) {
  const len = length(v);
  return len > 1e-9 ? [v[0] / len, v[1] / len, v[2] / len] : null;
}

function facePlaneNormal(points) {
  let normal = [0, 0, 0];
  for (let i = 0; i < points.length; i++) {
    const current = points[i];
    const next = points[(i + 1) % points.length];
    normal[0] += (current[1] - next[1]) * (current[2] + next[2]);
    normal[1] += (current[2] - next[2]) * (current[0] + next[0]);
    normal[2] += (current[0] - next[0]) * (current[1] + next[1]);
  }
  const newell = normalize(normal);
  if (newell) return newell;
  const origin = points[0];
  for (let i = 1; i < points.length - 1; i++) {
    const candidate = normalize(cross(sub(points[i], origin), sub(points[i + 1], origin)));
    if (candidate) return candidate;
  }
  return null;
}

function modelScale(points) {
  if (!points.length) return 0;
  const min = [...points[0]];
  const max = [...points[0]];
  for (const point of points) {
    for (let axis = 0; axis < 3; axis++) {
      min[axis] = Math.min(min[axis], point[axis]);
      max[axis] = Math.max(max[axis], point[axis]);
    }
  }
  return length(sub(max, min));
}

function planarityIssue(face, vertexById, allPoints) {
  const ids = vertexIds(face);
  if (ids.length <= 3) return null;
  const points = ids.map((id) => vertexById.get(Number(id))).filter(Boolean);
  if (points.length !== ids.length) return null;
  const normal = facePlaneNormal(points);
  if (!normal) return null;
  const center = points.reduce((sum, point) => [
    sum[0] + point[0],
    sum[1] + point[1],
    sum[2] + point[2]
  ], [0, 0, 0]).map((value) => value / points.length);
  const distances = points.map((point) => Math.abs(dot(sub(point, center), normal)));
  const maxDistance = Math.max(...distances);
  const scale = modelScale(allPoints);
  const tolerance = Math.max(0.25, scale * 0.001);
  if (maxDistance <= tolerance) return null;
  const index = distances.indexOf(maxDistance);
  return {
    maxDistance,
    tolerance,
    vertexId: ids[index],
    vertices: ids.length
  };
}

function auditFacePlanarity({ reports, faces, verts, file, label, category, itemPrefix = "face" }) {
  const allPoints = verts.map(vertexPoint).filter(Boolean);
  const vertexById = new Map();
  verts.forEach((vertex, index) => {
    const point = vertexPoint(vertex);
    if (point) vertexById.set(vertexId(vertex, index), point);
  });
  faces.forEach((face, index) => {
    const issue = planarityIssue(face, vertexById, allPoints);
    if (!issue) return;
    reports.push({
      category,
      severity: "warn",
      file,
      label,
      item: `${itemPrefix}[${index}]${face?.id != null ? ` id ${face.id}` : ""}`,
      message: `${issue.vertices}-vertex face is non-planar; vertex ${issue.vertexId} is ${issue.maxDistance.toFixed(2)} units from the face plane (tolerance ${issue.tolerance.toFixed(2)})`
    });
  });
}

function modelLabel(data, filePath) {
  return data.id || path.basename(filePath, ".ultraship.json");
}

function auditModel(filePath) {
  const data = readJson(filePath);
  const label = modelLabel(data, filePath);
  const file = path.relative(root, filePath);
  const faces = Array.isArray(data.faces) ? data.faces : [];
  const verts = Array.isArray(data.verts) ? data.verts : [];
  const details = Array.isArray(data.details) ? data.details : [];
  const edges = Array.isArray(data.edges) ? data.edges : [];
  const faceEdgeKeys = new Set();
  const reports = [];

  auditFacePlanarity({
    reports,
    faces,
    verts,
    file,
    label,
    category: "non-planar-source-face"
  });

  faces.forEach((face) => {
    const ids = vertexIds(face);
    for (let i = 0; i < ids.length; i++) {
      const key = edgeKey(ids[i], ids[(i + 1) % ids.length]);
      if (key) faceEdgeKeys.add(key);
    }
  });

  edges.forEach((edge, index) => {
    const explicit = edgeEnds(edge);
    const key = edgeKey(explicit.a, explicit.b);
    if (!key) {
      reports.push({
        category: "invalid-edge",
        severity: "error",
        file,
        label,
        item: `edge[${index}]${explicit.id != null ? ` id ${explicit.id}` : ""}`,
        message: "edge has invalid or duplicate endpoints"
      });
      return;
    }
    if (!faceEdgeKeys.has(key) && !isIntentionalOrphanEdge(explicit.kind)) {
      reports.push({
        category: "orphan-edge-not-stick",
        severity: "warn",
        file,
        label,
        item: `edge[${index}]${explicit.id != null ? ` id ${explicit.id}` : ""} ${explicit.a}-${explicit.b}`,
        message: "authored edge is not part of any source face and is not an explicit stick, hidden edge, or station entrance"
      });
    }
    if (!["edge", "stick", "hidden", "stationEntrance"].includes(explicit.kind)) {
      reports.push({
        category: "unknown-edge-kind",
        severity: "error",
        file,
        label,
        item: `edge[${index}]${explicit.id != null ? ` id ${explicit.id}` : ""}`,
        message: `edge kind "${explicit.kind}" is not recognised`
      });
    }
  });

  details.forEach((detail, index) => {
    const type = detail?.type || "detail";
    if (detail?.stroke && isGlassLike(type)) {
      reports.push({
        category: "glass-solid-stroke",
        severity: "warn",
        file,
        label,
        item: `detail[${index}]${detail.id != null ? ` id ${detail.id}` : ""} ${type}`,
        message: "glass/portal-like authored detail carries a stroke; Ultra solid mode should consume fill/glint intent only"
      });
    }
    if (detail?.stroke && type !== "engine" && isNearWhite(detail.stroke)) {
      reports.push({
        category: "near-white-non-engine-stroke",
        severity: "warn",
        file,
        label,
        item: `detail[${index}]${detail.id != null ? ` id ${detail.id}` : ""} ${type}`,
        message: `non-engine detail uses near-white stroke ${detail.stroke}`
      });
    }
  });

  faces.forEach((face, index) => {
    const angle = cleanAngle(face?.bitmapAngle);
    const hasUv = Array.isArray(face?.bitmapUv) && face.bitmapUv.length > 0;
    if (hasUv && angle) {
      reports.push({
        category: "explicit-uv-plus-angle",
        severity: "warn",
        file,
        label,
        item: `face[${index}]${face?.id != null ? ` id ${face.id}` : ""}`,
        message: `explicit bitmapUv also carries bitmapAngle ${angle}; rotation ownership is ambiguous`
      });
    }
    if (isProjectorCandidate(face)) {
      reports.push({
        category: "projector-bake-candidate",
        severity: "info",
        file,
        label,
        item: `face[${index}]${face?.id != null ? ` id ${face.id}` : ""}`,
        message: `bitmapSide "${face.bitmapSide}" has no explicit bitmapUv and may be a future projector-to-face bake candidate`
      });
    }
  });

  return reports;
}

function auditBlueprintSet(models, filePath, category) {
  const file = path.relative(root, filePath);
  const reports = [];
  for (const [id, blueprint] of Object.entries(models || {})) {
    const faces = Array.isArray(blueprint?.faces) ? blueprint.faces : [];
    const verts = Array.isArray(blueprint?.verts) ? blueprint.verts : [];
    auditFacePlanarity({
      reports,
      faces,
      verts,
      file,
      label: blueprint?.name || id,
      category,
      itemPrefix: `${id} face`
    });
  }
  return reports;
}

function groupByCategory(reports) {
  const groups = new Map();
  for (const report of reports) {
    if (!groups.has(report.category)) groups.set(report.category, []);
    groups.get(report.category).push(report);
  }
  return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
}

function summarizeByModel(items) {
  const counts = new Map();
  for (const item of items) counts.set(item.label, (counts.get(item.label) || 0) + 1);
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 8)
    .map(([label, count]) => `${label}:${count}`)
    .join(", ");
}

function printReports(reports) {
  const warnCount = reports.filter((report) => report.severity === "warn").length;
  const errorCount = reports.filter((report) => report.severity === "error").length;
  const infoCount = reports.filter((report) => report.severity === "info").length;
  console.log(`Render intent audit: ${errorCount} error${errorCount === 1 ? "" : "s"}, ${warnCount} warning${warnCount === 1 ? "" : "s"}, ${infoCount} info item${infoCount === 1 ? "" : "s"}`);
  if (!reports.length) return;
  for (const [category, items] of groupByCategory(reports)) {
    const severity = items.some((item) => item.severity === "error")
      ? "error"
      : items.some((item) => item.severity === "warn")
        ? "warn"
        : "info";
    console.log(`\n[${severity}] ${category} (${items.length})`);
    const modelSummary = summarizeByModel(items);
    if (modelSummary) console.log(`  models: ${modelSummary}`);
    const displayItems = items.slice(0, 20);
    for (const item of displayItems) {
      console.log(`- ${item.file} :: ${item.item}: ${item.message}`);
    }
    if (items.length > displayItems.length) {
      console.log(`- ... ${items.length - displayItems.length} more`);
    }
  }
}

if (!fs.existsSync(modelDir)) {
  throw new Error(`Missing model directory: ${path.relative(root, modelDir)}`);
}

const modelFiles = fs.readdirSync(modelDir)
  .filter((file) => file.endsWith(".ultraship.json"))
  .sort((a, b) => a.localeCompare(b))
  .map((file) => path.join(modelDir, file));

const reports = [
  ...modelFiles.flatMap(auditModel),
  ...auditBlueprintSet(
    runGenerated(generatedRuntimePath, "ULTRA_ELITE_MODEL_BLUEPRINTS"),
    generatedRuntimePath,
    "non-planar-benchmark-face"
  ),
  ...auditBlueprintSet(
    Object.fromEntries(Object.entries(runWindowGenerated(builderLibraryPath, "ULTRA_ELITE_MODEL_LIBRARY"))
      .map(([id, model]) => [id, model?.blueprint])
      .filter(([, blueprint]) => blueprint)),
    builderLibraryPath,
    "non-planar-builder-face"
  )
];
printReports(reports);

const hasErrors = reports.some((report) => report.severity === "error");
const hasWarnings = reports.some((report) => report.severity === "warn");
if (hasErrors || (strict && hasWarnings)) {
  process.exitCode = 1;
}
