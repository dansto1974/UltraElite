import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../..");
const modelDir = path.join(root, "assets/models");
const strict = process.argv.includes("--strict");

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    throw new Error(`${path.relative(root, filePath)}: ${error.message}`);
  }
}

function vertexIds(face) {
  if (Array.isArray(face)) return face;
  return Array.isArray(face?.verts) ? face.verts : [];
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

function modelLabel(data, filePath) {
  return data.id || path.basename(filePath, ".ultraship.json");
}

function auditModel(filePath) {
  const data = readJson(filePath);
  const label = modelLabel(data, filePath);
  const file = path.relative(root, filePath);
  const faces = Array.isArray(data.faces) ? data.faces : [];
  const details = Array.isArray(data.details) ? data.details : [];
  const edges = Array.isArray(data.edges) ? data.edges : [];
  const faceEdgeKeys = new Set();
  const reports = [];

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
    if (!faceEdgeKeys.has(key) && explicit.kind !== "stick") {
      reports.push({
        category: "orphan-edge-not-stick",
        severity: "warn",
        file,
        label,
        item: `edge[${index}]${explicit.id != null ? ` id ${explicit.id}` : ""} ${explicit.a}-${explicit.b}`,
        message: "authored edge is not part of any source face and is not an explicit stick"
      });
    }
    if (!["edge", "stick"].includes(explicit.kind)) {
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

const reports = modelFiles.flatMap(auditModel);
printReports(reports);

const hasErrors = reports.some((report) => report.severity === "error");
const hasWarnings = reports.some((report) => report.severity === "warn");
if (hasErrors || (strict && hasWarnings)) {
  process.exitCode = 1;
}
