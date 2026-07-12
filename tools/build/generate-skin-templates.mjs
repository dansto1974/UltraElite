import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../..");
const sourcePath = path.join(root, "src/main.js");
const outDir = path.join(root, "assets/templates");
const size = 400;

function extractBalancedObject(source, marker) {
  const markerIndex = source.indexOf(marker);
  if (markerIndex < 0) throw new Error(`Could not find ${marker}`);
  const start = source.indexOf("{", markerIndex);
  let depth = 0;
  let inString = "";
  let escape = false;
  for (let i = start; i < source.length; i++) {
    const ch = source[i];
    if (inString) {
      if (escape) escape = false;
      else if (ch === "\\") escape = true;
      else if (ch === inString) inString = "";
      continue;
    }
    if (ch === "\"" || ch === "'" || ch === "`") {
      inString = ch;
      continue;
    }
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) return source.slice(start, i + 1);
    }
  }
  throw new Error(`Could not balance ${marker}`);
}

function loadModelLibrary() {
  const source = fs.readFileSync(sourcePath, "utf8");
  const objectSource = extractBalancedObject(source, "const MODELS =");
  const ctx = {};
  const script = [
    "const buildBlueprint = (data) => data;",
    `const MODELS = ${objectSource};`,
    "MODELS;"
  ].join("\n");
  return vm.runInNewContext(script, ctx, { filename: sourcePath });
}

function paeth(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
}

function signedByteCost(v) {
  return v < 128 ? v : 256 - v;
}

const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  crcTable[n] = c >>> 0;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const t = Buffer.from(type);
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  t.copy(out, 4);
  data.copy(out, 8);
  out.writeUInt32BE(crc32(Buffer.concat([t, data])), 8 + data.length);
  return out;
}

function pngEncode(rgba, width = size, height = size) {
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  const prev = Buffer.alloc(stride);
  const candidates = Array.from({ length: 5 }, () => Buffer.alloc(stride));
  for (let y = 0; y < height; y++) {
    const row = rgba.subarray(y * stride, (y + 1) * stride);
    let bestFilter = 0;
    let bestCost = Infinity;
    for (let filter = 0; filter <= 4; filter++) {
      const out = candidates[filter];
      let cost = 0;
      for (let x = 0; x < stride; x++) {
        const left = x >= 4 ? row[x - 4] : 0;
        const up = prev[x];
        const upLeft = x >= 4 ? prev[x - 4] : 0;
        let predictor = 0;
        if (filter === 1) predictor = left;
        else if (filter === 2) predictor = up;
        else if (filter === 3) predictor = (left + up) >> 1;
        else if (filter === 4) predictor = paeth(left, up, upLeft);
        const encoded = (row[x] - predictor + 256) & 255;
        out[x] = encoded;
        cost += signedByteCost(encoded);
      }
      if (cost < bestCost) {
        bestCost = cost;
        bestFilter = filter;
      }
    }
    const dest = y * (stride + 1);
    raw[dest] = bestFilter;
    candidates[bestFilter].copy(raw, dest + 1);
    row.copy(prev);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0))
  ]);
}

function fill(buf, x, y, color) {
  x = Math.round(x);
  y = Math.round(y);
  if (x < 0 || x >= size || y < 0 || y >= size) return;
  const i = (y * size + x) * 4;
  buf[i] = color[0];
  buf[i + 1] = color[1];
  buf[i + 2] = color[2];
  buf[i + 3] = color[3];
}

function drawLine(buf, x0, y0, x1, y1, color = [255, 255, 255, 255], width = 1) {
  const steps = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) * 1.5));
  const r = Math.max(.5, width / 2);
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = x0 + (x1 - x0) * t;
    const y = y0 + (y1 - y0) * t;
    for (let yy = Math.floor(y - r); yy <= Math.ceil(y + r); yy++) {
      for (let xx = Math.floor(x - r); xx <= Math.ceil(x + r); xx++) {
        if ((xx - x) ** 2 + (yy - y) ** 2 <= r * r) fill(buf, xx, yy, color);
      }
    }
  }
}

function drawDashedLine(buf, x0, y0, x1, y1, color = [255, 255, 255, 125], width = 1, dash = 7, gap = 7) {
  const length = Math.hypot(x1 - x0, y1 - y0);
  if (!length) return;
  const ux = (x1 - x0) / length;
  const uy = (y1 - y0) / length;
  for (let d = 0; d < length; d += dash + gap) {
    const end = Math.min(length, d + dash);
    drawLine(buf, x0 + ux * d, y0 + uy * d, x0 + ux * end, y0 + uy * end, color, width);
  }
}

function drawText(buf, text, x, y, color = [255, 255, 255, 180], scale = 2) {
  const glyphs = {
    A: ["111", "101", "111", "101", "101"], B: ["110", "101", "110", "101", "110"], C: ["111", "100", "100", "100", "111"],
    D: ["110", "101", "101", "101", "110"], E: ["111", "100", "110", "100", "111"], F: ["111", "100", "110", "100", "100"],
    G: ["111", "100", "101", "101", "111"], H: ["101", "101", "111", "101", "101"], I: ["111", "010", "010", "010", "111"],
    J: ["001", "001", "001", "101", "111"], K: ["101", "101", "110", "101", "101"], L: ["100", "100", "100", "100", "111"],
    M: ["101", "111", "111", "101", "101"], N: ["101", "111", "111", "111", "101"], O: ["111", "101", "101", "101", "111"],
    P: ["111", "101", "111", "100", "100"], Q: ["111", "101", "101", "111", "001"], R: ["111", "101", "111", "110", "101"],
    S: ["111", "100", "111", "001", "111"], T: ["111", "010", "010", "010", "010"], U: ["101", "101", "101", "101", "111"],
    V: ["101", "101", "101", "101", "010"], W: ["101", "101", "111", "111", "101"], X: ["101", "101", "010", "101", "101"],
    Y: ["101", "101", "010", "010", "010"], Z: ["111", "001", "010", "100", "111"], "0": ["111", "101", "101", "101", "111"],
    "1": ["010", "110", "010", "010", "111"], "2": ["111", "001", "111", "100", "111"], "3": ["111", "001", "111", "001", "111"],
    "4": ["101", "101", "111", "001", "001"], "5": ["111", "100", "111", "001", "111"], "6": ["111", "100", "111", "101", "111"],
    "7": ["111", "001", "001", "010", "010"], "8": ["111", "101", "111", "101", "111"], "9": ["111", "101", "111", "001", "111"],
    "-": ["000", "000", "111", "000", "000"], " ": ["000", "000", "000", "000", "000"]
  };
  let cx = x;
  for (const ch of text.toUpperCase()) {
    const rows = glyphs[ch] || glyphs[" "];
    for (let yy = 0; yy < rows.length; yy++) {
      for (let xx = 0; xx < rows[yy].length; xx++) {
        if (rows[yy][xx] === "1") {
          for (let sy = 0; sy < scale; sy++) for (let sx = 0; sx < scale; sx++) fill(buf, cx + xx * scale + sx, y + yy * scale + sy, color);
        }
      }
    }
    cx += 4 * scale;
  }
}

function projectionFor(modelId, side, verts) {
  const primaryAxis = modelId === "thargoid" || modelId === "thargon" ? "x" : "y";
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity, minZ = Infinity, maxZ = -Infinity;
  for (const p of verts) {
    minX = Math.min(minX, p[0]); maxX = Math.max(maxX, p[0]);
    minY = Math.min(minY, p[1]); maxY = Math.max(maxY, p[1]);
    minZ = Math.min(minZ, p[2]); maxZ = Math.max(maxZ, p[2]);
  }
  const marginX = Math.max(1, (maxX - minX) * .08);
  const marginY = Math.max(1, (maxY - minY) * .08);
  const marginZ = Math.max(1, (maxZ - minZ) * .08);
  minX -= marginX; maxX += marginX;
  minY -= marginY; maxY += marginY;
  minZ -= marginZ; maxZ += marginZ;
  const ranges = [maxX - minX || 1, maxY - minY || 1, maxZ - minZ || 1];
  const mins = [minX, minY, minZ];
  const maxs = [maxX, maxY, maxZ];
  const uvFromAxes = (p, uAxis, vAxis, flipU = false, flipV = false) => {
    const rawU = ((p[uAxis] - mins[uAxis]) / ranges[uAxis]) * size;
    const rawV = ((p[vAxis] - mins[vAxis]) / ranges[vAxis]) * size;
    return {
      x: flipU ? size - rawU : rawU,
      y: flipV ? size - rawV : rawV
    };
  };
  return (p) => {
    if (primaryAxis === "x" && side !== "back") return uvFromAxes(p, 1, 2, side === "bottom", true);
    if (side === "back") return {
      x: ((maxs[0] - p[0]) / ranges[0]) * size,
      y: ((maxs[1] - p[1]) / ranges[1]) * size
    };
    const u = ((p[0] - mins[0]) / ranges[0]) * size;
    const v = ((maxs[2] - p[2]) / ranges[2]) * size;
    return { x: side === "bottom" ? size - u : u, y: v };
  };
}

function detailPoints(detail, verts) {
  if (detail.points?.length) return detail.points.map((p) => [p.x ?? p[0], p.y ?? p[1], p.z ?? p[2]]);
  if (detail.indices?.length) return detail.indices.map((i) => verts[i]).filter(Boolean);
  return [];
}

function drawTemplate(modelId, model, side) {
  const buf = Buffer.alloc(size * size * 4);
  for (let i = 0; i < buf.length; i += 4) buf[i + 3] = 255;
  const verts = model.verts || [];
  const project = projectionFor(modelId, side, verts);
  const point = (index) => verts[index] ? project(verts[index]) : null;
  drawDashedLine(buf, size / 2, 0, size / 2, size, [255, 255, 255, 120], 1);

  for (const face of model.faces || []) {
    for (let i = 0; i < face.length; i++) {
      const a = point(face[i]), b = point(face[(i + 1) % face.length]);
      if (!a || !b) continue;
      drawLine(buf, a.x, a.y, b.x, b.y, [230, 242, 255, 125], 1);
    }
  }

  for (const edge of model.edges || []) {
    const aIndex = Array.isArray(edge) ? edge[0] : edge.a;
    const bIndex = Array.isArray(edge) ? edge[1] : edge.b;
    const a = point(aIndex), b = point(bIndex);
    if (!a || !b) continue;
    drawLine(buf, a.x, a.y, b.x, b.y, [230, 242, 255, 255], 1);
  }

  for (const detail of model.details || []) {
    const pts = detailPoints(detail, verts).map((p) => project(p));
    if (pts.length < 2) continue;
    const color = detail.type === "window" ? [255, 255, 255, 190] : [255, 255, 255, 150];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i], b = pts[(i + 1) % pts.length];
      if (detail.type === "line" && i > 0) break;
      drawLine(buf, a.x, a.y, b.x, b.y, color, detail.type === "engine" ? 1.5 : 1);
    }
  }

  drawText(buf, `${model.name || modelId} ${side}`, 14, 14, [255, 255, 255, 150], 2);
  drawLine(buf, 14, size - 20, 114, size - 20, [255, 255, 255, 130], 1);
  drawText(buf, "TEMPLATE", 122, size - 27, [255, 255, 255, 120], 1);
  return buf;
}

fs.mkdirSync(outDir, { recursive: true });
const library = loadModelLibrary();
let count = 0;
for (const [modelId, model] of Object.entries(library).sort(([a], [b]) => a.localeCompare(b))) {
  if (!model.verts?.length || !model.edges?.length) continue;
  for (const side of ["top", "bottom", "back"]) {
    const outPath = path.join(outDir, `${modelId}-${side}-template.png`);
    fs.writeFileSync(outPath, pngEncode(drawTemplate(modelId, model, side)));
    count++;
  }
}

console.log(`Generated ${count} bitmap skin templates in ${path.relative(root, outDir)}`);
