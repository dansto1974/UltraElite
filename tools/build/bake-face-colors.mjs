import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../..");
const modelDir = path.join(root, "assets/models");
const skinDir = path.join(root, "assets/skins");
const IMAGE_DECAL_MAX_SIZE = 600;

const pngCache = new Map();

function cleanBitmapKey(value) {
  return String(value || "").trim().replace(/[^a-zA-Z0-9_-]+/g, "_").replace(/^_+|_+$/g, "");
}

function cleanHexColor(value) {
  const text = String(value || "").trim();
  return /^#[0-9a-f]{6}$/i.test(text) ? text.toLowerCase() : "";
}

function hexFromRgb(r, g, b) {
  const toHex = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function decodePng(filePath) {
  if (pngCache.has(filePath)) return pngCache.get(filePath);
  let image = null;
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
    if (!width || !height || bitDepth !== 8 || !channels || !idat.length) {
      throw new Error("unsupported PNG format");
    }
    const raw = zlib.inflateSync(Buffer.concat(idat));
    const stride = width * channels;
    const rgba = Buffer.alloc(width * height * 4);
    const prev = Buffer.alloc(stride);
    let offset = 0;
    for (let y = 0; y < height; y++) {
      const filter = raw[offset++];
      const row = Buffer.alloc(stride);
      for (let x = 0; x < stride; x++) {
        const value = raw[offset++];
        const left = x >= channels ? row[x - channels] : 0;
        const up = prev[x] || 0;
        const upLeft = x >= channels ? prev[x - channels] : 0;
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
      for (let x = 0; x < width; x++) {
        const src = x * channels;
        const dst = (y * width + x) * 4;
        rgba[dst] = row[src];
        rgba[dst + 1] = row[src + 1];
        rgba[dst + 2] = row[src + 2];
        rgba[dst + 3] = channels === 4 ? row[src + 3] : 255;
      }
      row.copy(prev);
    }
    image = { width, height, rgba };
  } catch {
    image = null;
  }
  pngCache.set(filePath, image);
  return image;
}

function averageWholeImage(image) {
  if (!image) return "";
  let sumR = 0, sumG = 0, sumB = 0, sumA = 0;
  for (let i = 0; i < image.rgba.length; i += 4) {
    const a = image.rgba[i + 3];
    if (a <= 8) continue;
    sumR += image.rgba[i] * a;
    sumG += image.rgba[i + 1] * a;
    sumB += image.rgba[i + 2] * a;
    sumA += a;
  }
  return sumA ? hexFromRgb(sumR / sumA, sumG / sumA, sumB / sumA) : "";
}

function samplePixel(image, x, y) {
  const px = Math.max(0, Math.min(image.width - 1, Math.round(x)));
  const py = Math.max(0, Math.min(image.height - 1, Math.round(y)));
  const i = (py * image.width + px) * 4;
  return [image.rgba[i], image.rgba[i + 1], image.rgba[i + 2], image.rgba[i + 3]];
}

function pointInPolygon(x, y, pts) {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const a = pts[i], b = pts[j];
    const crosses = ((a.y > y) !== (b.y > y)) && x < ((b.x - a.x) * (y - a.y)) / ((b.y - a.y) || 1e-9) + a.x;
    if (crosses) inside = !inside;
  }
  return inside;
}

function averagePolygon(image, uv, options = {}) {
  if (!image || !uv?.length) return "";
  const mirrorX = !!options.mirrorX;
  const centerlineX = Number.isFinite(options.centerlineX) ? options.centerlineX : image.width / 2;
  const minX = Math.floor(Math.min(...uv.map((p) => p.x)));
  const maxX = Math.ceil(Math.max(...uv.map((p) => p.x)));
  const minY = Math.floor(Math.min(...uv.map((p) => p.y)));
  const maxY = Math.ceil(Math.max(...uv.map((p) => p.y)));
  let sumR = 0, sumG = 0, sumB = 0, sumA = 0, samples = 0;
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      if (!pointInPolygon(x + .5, y + .5, uv)) continue;
      let sx = x;
      if (mirrorX && sx > centerlineX) sx = centerlineX - (sx - centerlineX);
      const scaleX = mirrorX ? 1 : image.width / Math.max(1, options.baseW || image.width);
      const scaleY = image.height / Math.max(1, options.baseH || image.height);
      const [r, g, b, a] = samplePixel(image, sx * scaleX, y * scaleY);
      if (a <= 8) continue;
      sumR += r * a;
      sumG += g * a;
      sumB += b * a;
      sumA += a;
      samples++;
    }
  }
  if (!sumA || !samples) return averageWholeImage(image);
  return hexFromRgb(sumR / sumA, sumG / sumA, sumB / sumA);
}

function vec(x = 0, y = 0, z = 0) {
  if (Array.isArray(x)) return { x: Number(x[0]) || 0, y: Number(x[1]) || 0, z: Number(x[2]) || 0 };
  return { x: Number(x) || 0, y: Number(y) || 0, z: Number(z) || 0 };
}

function sub(a, b) { return vec(a.x - b.x, a.y - b.y, a.z - b.z); }
function cross(a, b) { return vec(a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x); }
function len(a) { return Math.hypot(a.x, a.y, a.z); }
function norm(a) {
  const l = len(a) || 1;
  return vec(a.x / l, a.y / l, a.z / l);
}

function vertexPoint(vertex) {
  return Array.isArray(vertex)
    ? vec(vertex[0], vertex[1], vertex[2])
    : vec(vertex?.x, vertex?.y, vertex?.z);
}

function sourceVertexId(vertex, index) {
  return vertex && typeof vertex === "object" && !Array.isArray(vertex) && vertex.id !== undefined ? vertex.id : index;
}

function faceVertexIds(face) {
  return Array.isArray(face) ? face : Array.isArray(face?.verts) ? face.verts : [];
}

function faceNormal(face, vertexById) {
  const pts = faceVertexIds(face).map((id) => vertexById.get(id)).filter(Boolean).map(vertexPoint);
  if (pts.length < 3) return vec(0, 1, 0);
  return norm(cross(sub(pts[1], pts[0]), sub(pts[2], pts[0])));
}

function modelBounds(vertices) {
  const pts = vertices.map(vertexPoint);
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  for (const p of pts) {
    min[0] = Math.min(min[0], p.x); max[0] = Math.max(max[0], p.x);
    min[1] = Math.min(min[1], p.y); max[1] = Math.max(max[1], p.y);
    min[2] = Math.min(min[2], p.z); max[2] = Math.max(max[2], p.z);
  }
  const margin = [
    Math.max(1, (max[0] - min[0]) * .08),
    Math.max(1, (max[1] - min[1]) * .08),
    Math.max(1, (max[2] - min[2]) * .08)
  ];
  for (let i = 0; i < 3; i++) {
    min[i] -= margin[i];
    max[i] += margin[i];
  }
  return { min, max, ranges: max.map((value, i) => value - min[i] || 1) };
}

function autoSide(modelId, normal, explicitSide = "") {
  if (explicitSide === "top" || explicitSide === "bottom" || explicitSide === "back") return explicitSide;
  const primaryAxis = modelId === "thargoid" || modelId === "thargon" ? "x" : "y";
  const absX = Math.abs(normal.x), absY = Math.abs(normal.y), absZ = Math.abs(normal.z);
  let side = normal.z < -.42 && absZ >= absY * .86 && absZ >= absX * .65 ? "back" : normal.y < 0 ? "bottom" : "top";
  if (primaryAxis === "x" && absX >= absY * .86 && absX >= absZ * .65) side = normal.x < 0 ? "bottom" : "top";
  return side;
}

function footprint(bounds, uAxis, vAxis, flipU = false, flipV = true) {
  const scale = IMAGE_DECAL_MAX_SIZE / Math.max(bounds.ranges[uAxis], bounds.ranges[vAxis], 1);
  const width = Math.max(16, Math.round(bounds.ranges[uAxis] * scale));
  const height = Math.max(16, Math.round(bounds.ranges[vAxis] * scale));
  const centerU = (0 - bounds.min[uAxis]) * scale;
  return {
    width,
    height,
    centerlineX: flipU ? width - centerU : centerU,
    uv(p) {
      const values = [p.x, p.y, p.z];
      const rawU = (values[uAxis] - bounds.min[uAxis]) * scale;
      const rawV = (values[vAxis] - bounds.min[vAxis]) * scale;
      return {
        x: flipU ? width - rawU : rawU,
        y: flipV ? height - rawV : rawV
      };
    }
  };
}

function sideProjection(modelId, side, normal, bounds) {
  const primaryAxis = modelId === "thargoid" || modelId === "thargon" ? "x" : "y";
  if (primaryAxis === "x" && side !== "back") return footprint(bounds, 1, 2, side === "bottom", true);
  if (side === "back") return footprint(bounds, 0, 1, true, true);
  return footprint(bounds, 0, 2, side === "bottom", true);
}

function sideMirrorX(model, side) {
  return !!model.gameMeta?.imageDecalMirrorX?.[side];
}

function modelBaseColor(model) {
  return cleanHexColor(model.gameMeta?.baseColor) || "#e9f2e4";
}

function faceColor(model, face, vertexById, bounds) {
  const modelId = cleanBitmapKey(model.id);
  const faceKey = cleanBitmapKey(face?.bitmapFaceKey);
  if (faceKey) {
    const faceFile = path.join(skinDir, `${modelId}-face-${faceKey}.png`);
    const sampled = fs.existsSync(faceFile) ? averageWholeImage(decodePng(faceFile)) : "";
    if (sampled) return sampled;
  }
  const normal = faceNormal(face, vertexById);
  const side = autoSide(modelId, normal, face?.bitmapSide);
  const sideFile = path.join(skinDir, `${modelId}-${side}.png`);
  if (fs.existsSync(sideFile)) {
    const image = decodePng(sideFile);
    const projection = sideProjection(modelId, side, normal, bounds);
    const uv = faceVertexIds(face)
      .map((id) => vertexById.get(id))
      .filter(Boolean)
      .map((vertex) => projection.uv(vertexPoint(vertex)));
    const sampled = averagePolygon(image, uv, {
      baseW: projection.width,
      baseH: projection.height,
      centerlineX: projection.centerlineX,
      mirrorX: sideMirrorX(model, side)
    });
    if (sampled) return sampled;
  }
  return cleanHexColor(face?.faceColor || face?.color) || modelBaseColor(model);
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`);
}

const modelFiles = fs.readdirSync(modelDir)
  .filter((file) => file.endsWith(".ultraship.json"))
  .sort((a, b) => a.localeCompare(b));

let totalFaces = 0;
let changedFaces = 0;

for (const file of modelFiles) {
  const filePath = path.join(modelDir, file);
  const model = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const faces = Array.isArray(model.faces) ? model.faces : [];
  const verts = Array.isArray(model.verts) ? model.verts : [];
  const vertexById = new Map(verts.map((vertex, index) => [sourceVertexId(vertex, index), vertex]));
  const bounds = modelBounds(verts);
  const colors = faces.map((face) => faceColor(model, face, vertexById, bounds));
  let changed = 0;
  let blueprintChanged = false;
  faces.forEach((face, index) => {
    if (!colors[index]) return;
    if (cleanHexColor(face.faceColor) !== colors[index]) {
      face.faceColor = colors[index];
      changed++;
    }
  });
  if (model.blueprint && typeof model.blueprint === "object" && colors.some(Boolean)) {
    const previous = JSON.stringify(model.blueprint.imageProjection?.faceColors || null);
    model.blueprint.imageProjection = { ...(model.blueprint.imageProjection || {}) };
    model.blueprint.imageProjection.faceColors = colors.map((color) => cleanHexColor(color) || null);
    blueprintChanged = previous !== JSON.stringify(model.blueprint.imageProjection.faceColors);
  }
  if (changed || blueprintChanged) writeJson(filePath, model);
  totalFaces += faces.length;
  changedFaces += changed;
  console.log(`${model.id || file}: ${changed}/${faces.length} face colours baked`);
}

console.log(`Baked ${changedFaces}/${totalFaces} face colours across ${modelFiles.length} models.`);
