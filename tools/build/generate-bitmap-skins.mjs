import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../..");
const outDir = path.join(root, "assets/skins");
const manifestPath = path.join(root, "src/generated/bitmap-skins.js");
const size = 400;
const force = process.argv.includes("--force");
const recompress = process.argv.includes("--recompress");
const dryRun = process.argv.includes("--dry-run");

const models = [
  "cobra", "krait", "viper", "adder", "gecko", "mamba", "sidewinder", "worm", "moray", "asp",
  "ferdelance", "python", "boa", "anaconda", "cobra1", "shuttle", "transporter", "constrictor",
  "cougar", "diamondback", "thargoid", "thargon", "canister", "missile", "escapePod", "plate",
  "asteroid", "boulder", "splinter", "hermit", "dodoStation", "coriolis"
];

const displayNames = {
  cobra: "COBRA MK III",
  krait: "KRAIT",
  viper: "VIPER",
  adder: "ADDER",
  gecko: "GECKO",
  mamba: "MAMBA",
  sidewinder: "SIDEWINDER",
  worm: "WORM",
  moray: "MORAY",
  asp: "ASP MK II",
  ferdelance: "FER-DE-LANCE",
  python: "PYTHON",
  boa: "BOA",
  anaconda: "ANACONDA",
  cobra1: "COBRA MK I",
  shuttle: "SHUTTLE",
  transporter: "TRANSPORTER",
  constrictor: "CONSTRICTOR",
  cougar: "COUGAR",
  diamondback: "DIAMONDBACK",
  thargoid: "THARGOID",
  thargon: "THARGON",
  canister: "CARGO CANISTER",
  missile: "MISSILE",
  escapePod: "ESCAPE POD",
  plate: "ALLOY PLATE",
  asteroid: "ASTEROID",
  boulder: "BOULDER",
  splinter: "SPLINTER",
  hermit: "ROCK HERMIT",
  dodoStation: "DODO STATION",
  coriolis: "CORIOLIS STATION"
};

const sets = {
  police: new Set(["viper"]),
  alien: new Set(["thargoid", "thargon"]),
  pirate: new Set(["krait", "mamba", "sidewinder", "asp", "ferdelance", "gecko", "adder", "cobra", "constrictor", "cougar"]),
  hauler: new Set(["python", "boa", "anaconda", "shuttle", "transporter", "worm"]),
  trader: new Set(["cobra", "cobra1", "adder", "gecko", "moray", "python", "boa", "anaconda", "shuttle", "transporter", "worm"]),
  rock: new Set(["asteroid", "boulder", "splinter"]),
  station: new Set(["coriolis", "dodoStation"]),
  cargo: new Set(["canister", "plate", "escapePod"]),
  missile: new Set(["missile"])
};

const palettes = {
  project: ["#cf9b2a", "#ff2d86", "#16120d", "#f7e8ad"],
  police: ["#234f68", "#5edfff", "#07111a", "#dff8ff"],
  alien: ["#5e35a0", "#49ff91", "#100819", "#d8b2ff"],
  pirate: ["#3d3431", "#ff4a34", "#090807", "#b8a098"],
  hauler: ["#8d7a46", "#ffe250", "#1a1710", "#f8d875"],
  trader: ["#56665f", "#8fd8a3", "#101512", "#c5dfc8"],
  station: ["#606860", "#ffba3c", "#111513", "#aeb8aa"],
  rock: ["#887b62", "#c5b28a", "#171411", "#b7aa90"],
  cargo: ["#b3842e", "#ffe650", "#15120a", "#ffeaa6"],
  missile: ["#84221b", "#ff553e", "#120606", "#ffc8ba"]
};

function roleFor(model) {
  if (model === "diamondback") return "project";
  if (sets.station.has(model) || model === "hermit") return "station";
  if (sets.rock.has(model)) return "rock";
  if (sets.cargo.has(model)) return "cargo";
  if (sets.missile.has(model)) return "missile";
  if (sets.police.has(model)) return "police";
  if (sets.alien.has(model)) return "alien";
  if (sets.pirate.has(model) && !sets.trader.has(model)) return "pirate";
  if (sets.hauler.has(model)) return "hauler";
  return "trader";
}

function hash32(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rngFor(seed) {
  let a = seed >>> 0;
  return () => {
    a += 0x6D2B79F5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function formatBytes(bytes) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
}

function hex(hexString) {
  const n = parseInt(hexString.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255, 255];
}

function mix(a, b, t) {
  return [
    Math.round(a[0] * (1 - t) + b[0] * t),
    Math.round(a[1] * (1 - t) + b[1] * t),
    Math.round(a[2] * (1 - t) + b[2] * t),
    Math.round((a[3] ?? 255) * (1 - t) + (b[3] ?? 255) * t)
  ];
}

function blend(buf, x, y, color, alpha = 1) {
  x = Math.round(x);
  y = Math.round(y);
  if (x < 0 || x >= size || y < 0 || y >= size) return;
  const i = (y * size + x) * 4;
  const a = Math.max(0, Math.min(1, alpha * (color[3] ?? 255) / 255));
  const ia = 1 - a;
  buf[i] = Math.round(buf[i] * ia + color[0] * a);
  buf[i + 1] = Math.round(buf[i + 1] * ia + color[1] * a);
  buf[i + 2] = Math.round(buf[i + 2] * ia + color[2] * a);
  buf[i + 3] = 255;
}

function drawLine(buf, x0, y0, x1, y1, color, width = 1, alpha = 1) {
  const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
  const r = Math.max(.5, width / 2);
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = x0 + (x1 - x0) * t;
    const y = y0 + (y1 - y0) * t;
    for (let yy = Math.floor(y - r); yy <= Math.ceil(y + r); yy++) {
      for (let xx = Math.floor(x - r); xx <= Math.ceil(x + r); xx++) {
        if ((xx - x) ** 2 + (yy - y) ** 2 <= r * r) blend(buf, xx, yy, color, alpha);
      }
    }
  }
}

function fillRect(buf, x, y, w, h, color, alpha = 1) {
  for (let yy = Math.max(0, Math.floor(y)); yy < Math.min(size, Math.ceil(y + h)); yy++) {
    for (let xx = Math.max(0, Math.floor(x)); xx < Math.min(size, Math.ceil(x + w)); xx++) blend(buf, xx, yy, color, alpha);
  }
}

function drawPanel(buf, x, y, w, h, color, alpha = .25) {
  const cut = Math.min(w, h) * .18;
  drawLine(buf, x + cut, y, x + w, y, color, 1.5, alpha);
  drawLine(buf, x + w, y, x + w, y + h - cut, color, 1.5, alpha);
  drawLine(buf, x + w, y + h - cut, x + w - cut, y + h, color, 1.5, alpha);
  drawLine(buf, x + w - cut, y + h, x, y + h, color, 1.5, alpha);
  drawLine(buf, x, y + h, x, y + cut, color, 1.5, alpha);
  drawLine(buf, x, y + cut, x + cut, y, color, 1.5, alpha);
}

function drawAscii(buf, text, x, y, color, scale = 2, alpha = .62) {
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
  for (const ch of text) {
    const rows = glyphs[ch] || glyphs[" "];
    for (let yy = 0; yy < rows.length; yy++) {
      for (let xx = 0; xx < rows[yy].length; xx++) {
        if (rows[yy][xx] === "1") fillRect(buf, cx + xx * scale, y + yy * scale, scale, scale, color, alpha);
      }
    }
    cx += 4 * scale;
  }
}

function renderSkin(model, side) {
  const role = roleFor(model);
  const [baseHex, accentHex, darkHex, lineHex] = palettes[role];
  const base = hex(baseHex);
  const accent = hex(accentHex);
  const dark = hex(darkHex);
  const line = hex(lineHex);
  const rng = rngFor(hash32(`${model}:${role}:${side}`));
  const buf = Buffer.alloc(size * size * 4);
  const light = mix(base, [255, 255, 255, 255], .34);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const diagonal = (x + y) / (size * 2);
      const cx = (x - size * .48) / (size * .62);
      const cy = (y - size * .44) / (size * .62);
      const vignette = Math.min(1, Math.sqrt(cx * cx + cy * cy));
      const noisy = (hash32(`${model}:${side}:${x >> 2}:${y >> 2}`) & 31) / 255;
      let c = mix(light, base, diagonal * .58 + .18);
      c = mix(c, dark, vignette * .42 + noisy);
      const i = (y * size + x) * 4;
      buf[i] = c[0]; buf[i + 1] = c[1]; buf[i + 2] = c[2]; buf[i + 3] = 255;
    }
  }

  for (let i = 0; i < 24; i++) {
    drawPanel(buf, rng() * size, rng() * size, size * (.08 + rng() * .24), size * (.04 + rng() * .16), line, role === "rock" ? .15 : .28);
  }
  for (let i = 0; i < 80; i++) {
    const x = rng() * size, y = rng() * size;
    drawLine(buf, x, y, x + size * (.03 + rng() * .18), y + (rng() - .5) * size * .04, dark, .8 + rng() * 1.4, .18);
  }
  if (role === "station" || role === "hauler" || role === "cargo") {
    for (let i = -8; i <= 18; i++) {
      const c = i % 2 ? dark : accent;
      drawLine(buf, i * 28, side === "top" ? 54 : 330, i * 28 + 170, side === "top" ? 20 : 366, c, 15, .75);
    }
  }
  if (side === "back" && role !== "rock") {
    const engineY = size * .48;
    for (let i = -1; i <= 1; i++) {
      const x = size * (.5 + i * .18);
      fillRect(buf, x - size * .055, engineY - size * .04, size * .11, size * .08, dark, .68);
      drawPanel(buf, x - size * .075, engineY - size * .06, size * .15, size * .12, line, .36);
    }
    drawLine(buf, size * .16, size * .68, size * .84, size * .68, accent, 7, .36);
    drawLine(buf, size * .2, size * .74, size * .8, size * .74, line, 3, .28);
  }
  if (role === "pirate") {
    drawLine(buf, 150, 145, 250, 255, accent, 12, .58);
    drawLine(buf, 250, 145, 150, 255, accent, 12, .58);
  }
  if (role === "police") {
    drawLine(buf, 80, 140, 200, 178, accent, 18, .42);
    drawLine(buf, 320, 140, 200, 178, accent, 18, .42);
    drawLine(buf, 95, 225, 200, 255, accent, 12, .32);
    drawLine(buf, 305, 225, 200, 255, accent, 12, .32);
  }
  if (role === "alien") {
    for (let y = 90; y <= 310; y += 34) {
      let prev = [0, y];
      for (let x = 20; x <= size; x += 20) {
        const p = [x, y + Math.sin((x + hash32(model)) * .04) * 28];
        drawLine(buf, prev[0], prev[1], p[0], p[1], accent, 3.5, .28);
        prev = p;
      }
    }
  }
  if (role === "project") {
    drawLine(buf, 48, side === "top" ? 388 : 20, 278, side === "top" ? 0 : 390, accent, 60, .38);
    drawLine(buf, 98, side === "top" ? 388 : 20, 338, side === "top" ? 0 : 390, [255, 255, 255, 255], 18, .5);
  }
  if (role === "rock") {
    for (let i = 0; i < 60; i++) {
      const x = rng() * size, y = rng() * size, r = 4 + rng() * 18;
      drawLine(buf, x - r, y, x + r, y + rng() * r * .5, dark, 2 + rng() * 3, .22);
      drawLine(buf, x - r * .4, y - r * .4, x + r * .4, y + r * .2, line, 1.5, .18);
    }
  }
  const label = (displayNames[model] || model.toUpperCase()).replace(/[^A-Z0-9 -]/g, "").slice(0, 13);
  if (role !== "rock") drawAscii(buf, label, 200 - label.length * 6, side === "top" ? 210 : 176, line, 3, .52);
  return buf;
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

function paeth(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
}

function signedByteCost(v) {
  return v < 128 ? v : 256 - v;
}

function pngFilterRows(rgba, width, height) {
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
  return raw;
}

function pngEncode(rgba, width = size, height = size) {
  const raw = pngFilterRows(rgba, width, height);
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

function pngDecodeRgba(png) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  if (!png.subarray(0, 8).equals(signature)) return null;
  let pos = 8;
  let width = 0, height = 0, bitDepth = 0, colorType = 0, interlace = 0;
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
      interlace = data[12];
    } else if (type === "IDAT") {
      idat.push(data);
    } else if (type === "IEND") {
      break;
    }
  }
  if (bitDepth !== 8 || colorType !== 6 || interlace !== 0 || !width || !height || !idat.length) return null;
  const inflated = zlib.inflateSync(Buffer.concat(idat));
  const stride = width * 4;
  const rgba = Buffer.alloc(stride * height);
  const prev = Buffer.alloc(stride);
  for (let y = 0; y < height; y++) {
    const src = y * (stride + 1);
    const filter = inflated[src];
    for (let x = 0; x < stride; x++) {
      const value = inflated[src + 1 + x];
      const left = x >= 4 ? rgba[y * stride + x - 4] : 0;
      const up = prev[x];
      const upLeft = x >= 4 ? prev[x - 4] : 0;
      let decoded = value;
      if (filter === 1) decoded = value + left;
      else if (filter === 2) decoded = value + up;
      else if (filter === 3) decoded = value + ((left + up) >> 1);
      else if (filter === 4) decoded = value + paeth(left, up, upLeft);
      else if (filter !== 0) return null;
      rgba[y * stride + x] = decoded & 255;
    }
    rgba.copy(prev, 0, y * stride, (y + 1) * stride);
  }
  return { width, height, rgba };
}

function recompressPngFile(filePath) {
  const original = fs.readFileSync(filePath);
  const decoded = pngDecodeRgba(original);
  if (!decoded) return { skipped: true, before: original.length, after: original.length };
  const recompressed = pngEncode(decoded.rgba, decoded.width, decoded.height);
  if (recompressed.length >= original.length) return { before: original.length, after: original.length };
  if (!dryRun) fs.writeFileSync(filePath, recompressed);
  return { before: original.length, after: recompressed.length };
}

fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(path.dirname(manifestPath), { recursive: true });

const manifest = {};
const pngFiles = [];
let generatedCount = 0;
let recompressedCount = 0;
let recompressSkippedCount = 0;
let recompressBeforeBytes = 0;
let recompressAfterBytes = 0;
for (const model of models) {
  manifest[model] = {};
  for (const side of ["top", "bottom", "back"]) {
    const file = `${model}-${side}.png`;
    const filePath = path.join(outDir, file);
    if (force || !fs.existsSync(filePath)) {
      const png = pngEncode(renderSkin(model, side));
      fs.writeFileSync(filePath, png);
      generatedCount++;
    }
    if (recompress && fs.existsSync(filePath)) {
      const result = recompressPngFile(filePath);
      recompressBeforeBytes += result.before;
      recompressAfterBytes += result.after;
      if (result.skipped) recompressSkippedCount++;
      else if (result.after < result.before) recompressedCount++;
    }
    pngFiles.push(filePath);
    manifest[model][side] = `assets/skins/${file}`;
  }
}

const manifestMissing = !fs.existsSync(manifestPath);
const manifestMtime = manifestMissing ? 0 : fs.statSync(manifestPath).mtimeMs;
const newestPngMtime = Math.max(...pngFiles.map((file) => fs.statSync(file).mtimeMs));
const shouldWriteManifest = force || manifestMissing || generatedCount > 0 || newestPngMtime > manifestMtime;

if (!shouldWriteManifest) {
  if (recompress) {
    const saved = recompressBeforeBytes - recompressAfterBytes;
    const mode = dryRun ? "dry-run " : "";
    console.log(`Bitmap skin ${mode}recompress: ${recompressedCount} smaller, ${recompressSkippedCount} skipped, ${formatBytes(recompressBeforeBytes)} -> ${formatBytes(recompressAfterBytes)} (${formatBytes(saved)} saved)`);
  }
  console.log(`Bitmap skins unchanged; reused ${models.length * 3} PNGs and ${path.relative(root, manifestPath)}`);
  process.exit(0);
}

const entries = Object.fromEntries(Object.entries(manifest).map(([model, sides]) => [
  model,
  Object.fromEntries(Object.entries(sides).map(([side, rel]) => {
    const data = fs.readFileSync(path.join(root, rel)).toString("base64");
    return [side, `data:image/png;base64,${data}`];
  }))
]));

fs.writeFileSync(manifestPath, [
  "/* Generated by tools/build/generate-bitmap-skins.mjs. Edit PNGs in assets/skins, then run npm run build. */",
  `globalThis.ULTRA_ELITE_BITMAP_SKINS = ${JSON.stringify(entries)};`,
  ""
].join("\n"));

console.log(`${generatedCount ? `Generated ${generatedCount}` : "Reused existing"} bitmap skin PNG${generatedCount === 1 ? "" : "s"} in ${path.relative(root, outDir)}`);
if (recompress) {
  const saved = recompressBeforeBytes - recompressAfterBytes;
  const mode = dryRun ? "dry-run " : "";
  console.log(`Bitmap skin ${mode}recompress: ${recompressedCount} smaller, ${recompressSkippedCount} skipped, ${formatBytes(recompressBeforeBytes)} -> ${formatBytes(recompressAfterBytes)} (${formatBytes(saved)} saved)`);
}
console.log(`Generated ${path.relative(root, manifestPath)}`);
