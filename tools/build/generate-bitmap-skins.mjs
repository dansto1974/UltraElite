import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../..");
const outDir = path.join(root, "assets/skins");
const decalDir = path.join(root, "assets/decals");
const modelDir = path.join(root, "assets/models");
const photoshopSourceDir = path.join(root, "Photoshop Assets");
const manifestPath = path.join(root, "src/generated/bitmap-skins.js");
const DEFAULT_SKIN_SIZE = 400;
let size = DEFAULT_SKIN_SIZE;
const force = process.argv.includes("--force");
const recompress = process.argv.includes("--recompress");
const dryRun = process.argv.includes("--dry-run");
const forceModelNames = new Set((process.argv.find((arg) => arg.startsWith("--force-models=")) || "")
  .replace(/^--force-models=/, "")
  .split(",")
  .map((model) => cleanBitmapKey(model))
  .filter(Boolean));
const preserveForceSkins = new Set(["adder", "cobra"]);
const imageMimeByExt = new Map([
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".svg", "image/svg+xml"]
]);

function loadModelAssets() {
  if (!fs.existsSync(modelDir)) return new Map();
  const entries = fs.readdirSync(modelDir)
    .filter((file) => file.endsWith(".ultraship.json"))
    .sort((a, b) => a.localeCompare(b))
    .map((file) => {
      const filePath = path.join(modelDir, file);
      try {
        const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
        return [data.id || path.basename(file, ".ultraship.json"), data];
      } catch (error) {
        throw new Error(`Could not read ${path.relative(root, filePath)}: ${error.message}`);
      }
    });
  return new Map(entries);
}

const modelAssets = loadModelAssets();
const fallbackModels = [
  "cobra", "krait", "viper", "adder", "gecko", "mamba", "sidewinder", "worm", "moray", "asp",
  "ferdelance", "python", "boa", "anaconda", "cobra1", "shuttle", "transporter", "constrictor",
  "cougar", "diamondback", "thargoid", "thargon", "canister", "missile", "escapePod", "plate",
  "asteroid", "boulder", "splinter", "hermit", "dodoStation", "coriolis"
];
const models = modelAssets.size ? [...modelAssets.keys()].sort((a, b) => a.localeCompare(b)) : fallbackModels;

const fallbackDisplayNames = {
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
const displayNames = {
  ...fallbackDisplayNames,
  ...Object.fromEntries([...modelAssets].map(([id, data]) => [
    id,
    String(data.name || fallbackDisplayNames[id] || id).replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[_-]+/g, " ").trim().toUpperCase()
  ]))
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
  covert: ["#08111f", "#38d5ff", "#020611", "#93f7ff"],
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
  const meta = modelMeta(model);
  if (model === "diamondback") return "project";
  if (meta.hiddenUntilDiscovered || meta.flags?.hiddenUntilDiscovered) {
    const label = `${meta.class || ""} ${meta.npcRole || ""} ${meta.aiProfile || ""}`.toLowerCase();
    return /military|interceptor|strike|hunter|bounty/.test(label) ? "covert" : "project";
  }
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

function modelMeta(model) {
  return modelAssets.get(model)?.gameMeta || {};
}

function modelAsset(model) {
  return modelAssets.get(model) || null;
}

function modelExtents(model) {
  const data = modelAsset(model);
  const verts = data?.verts || [];
  if (!verts.length) return { x: 120, y: 40, z: 120, max: 120 };
  const xs = verts.map((v) => Number(v.x ?? v[0] ?? 0));
  const ys = verts.map((v) => Number(v.y ?? v[1] ?? 0));
  const zs = verts.map((v) => Number(v.z ?? v[2] ?? 0));
  const x = Math.max(...xs) - Math.min(...xs);
  const y = Math.max(...ys) - Math.min(...ys);
  const z = Math.max(...zs) - Math.min(...zs);
  return { x, y, z, max: Math.max(x, y, z, 1) };
}

function clampNumber(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function generatedSkinSize(model) {
  const role = roleFor(model);
  if (["station", "rock", "cargo", "missile"].includes(role)) return DEFAULT_SKIN_SIZE;
  const ext = modelExtents(model);
  return Math.round(clampNumber(304 + (ext.max - 80) * 1.05, 320, 640));
}

function sourceZoomForModel(model, role) {
  const ext = modelExtents(model);
  const scale = clampNumber(ext.max / 95, .72, role === "station" ? 4.2 : 3.4);
  return scale;
}

function cleanBitmapKey(value) {
  return String(value || "").trim().replace(/[^a-zA-Z0-9_-]+/g, "_").replace(/^_+|_+$/g, "");
}

function modelFaceTextureKeys(model) {
  const data = modelAssets.get(model);
  if (!data?.faces?.length) return [];
  return [...new Set(data.faces.map((face) => cleanBitmapKey(face?.bitmapFaceKey)).filter(Boolean))];
}

function modelUsesOnlyFaceTextures(model) {
  const data = modelAssets.get(model);
  const faces = Array.isArray(data?.faces) ? data.faces : [];
  return faces.length > 0 && faces.every((face) => cleanBitmapKey(face?.bitmapFaceKey));
}

function pngHeaderSize(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const fd = fs.openSync(filePath, "r");
  try {
    const header = Buffer.alloc(24);
    if (fs.readSync(fd, header, 0, 24, 0) !== 24) return null;
    if (!header.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return null;
    return { width: header.readUInt32BE(16), height: header.readUInt32BE(20) };
  } finally {
    fs.closeSync(fd);
  }
}

function modelSideMirrorX(model, side) {
  return !!modelMeta(model).imageDecalMirrorX?.[side];
}

function modelSideDisabled(model, side) {
  const disabled = modelMeta(model).imageDecalDisabledSides;
  return Array.isArray(disabled) && disabled.includes(side);
}

function skinManifestEntry(model, side, dataUrl, filePath) {
  const mirrorX = modelSideMirrorX(model, side);
  const relPath = path.relative(root, filePath).replaceAll(path.sep, "/");
  return { src: dataUrl, path: relPath, ...(mirrorX ? { mirrorX: true } : {}) };
}

const assetPool = new Map();
const assetKeyByHash = new Map();

function dataUrlTokenForFile(filePath, mime = "image/png") {
  const bytes = fs.readFileSync(filePath);
  const hash = crypto.createHash("sha256").update(bytes).digest("hex");
  let key = assetKeyByHash.get(hash);
  if (!key) {
    key = `a${assetKeyByHash.size}`;
    assetKeyByHash.set(hash, key);
    assetPool.set(key, `data:${mime};base64,${bytes.toString("base64")}`);
  }
  return `__ULTRA_ELITE_BITMAP_ASSET_${key}__`;
}

function serializeWithAssetRefs(value) {
  return JSON.stringify(value).replace(
    /"__ULTRA_ELITE_BITMAP_ASSET_(a\d+)__"/g,
    (_, key) => `__ULTRA_ELITE_BITMAP_ASSETS.${key}`
  );
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

function cropLeftHalfRgba(rgba, width = size, height = size) {
  const outW = Math.ceil(width / 2);
  const out = Buffer.alloc(outW * height * 4);
  for (let y = 0; y < height; y++) {
    rgba.copy(out, y * outW * 4, y * width * 4, y * width * 4 + outW * 4);
  }
  return { rgba: out, width: outW, height };
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

const sourceTextureCache = new Map();
const sourceTextureFiles = {
  top: "top.png",
  bottom: "Bottom.png",
  back: "High Res Back texture.png",
  rock: "asteroids.png",
  alien: "alien.png",
  missile: "missile.png",
  pirate: "pirate decals.png",
  stationEntrance: "Space station entrance.png",
  hazard: "Hazard symbols.png"
};

function sourceTexture(name) {
  if (sourceTextureCache.has(name)) return sourceTextureCache.get(name);
  const file = sourceTextureFiles[name];
  if (!file) return null;
  const filePath = path.join(photoshopSourceDir, file);
  if (!fs.existsSync(filePath)) {
    sourceTextureCache.set(name, null);
    return null;
  }
  const decoded = pngDecodeRgba(fs.readFileSync(filePath));
  sourceTextureCache.set(name, decoded);
  return decoded;
}

function sourceTextureFor(role, side) {
  if (role === "alien") return sourceTexture("alien") || sourceTexture(side);
  if (role === "rock") return sourceTexture("rock") || sourceTexture(side);
  if (role === "missile") return sourceTexture("missile") || sourceTexture(side);
  if (role === "covert") return null;
  if (side === "back") return sourceTexture("back") || sourceTexture("top");
  return sourceTexture(side) || sourceTexture("top") || sourceTexture("back");
}

function sampleTexture(texture, u, v, seed = 0) {
  if (!texture) return null;
  const x = Math.max(0, Math.min(texture.width - 1, Math.floor((((u % 1) + 1) % 1) * texture.width)));
  const y = Math.max(0, Math.min(texture.height - 1, Math.floor((((v % 1) + 1) % 1) * texture.height)));
  const i = (y * texture.width + x) * 4;
  const jitter = (hash32(`${seed}:${x >> 4}:${y >> 4}`) & 15) - 7;
  return [
    Math.max(0, Math.min(255, texture.rgba[i] + jitter)),
    Math.max(0, Math.min(255, texture.rgba[i + 1] + jitter)),
    Math.max(0, Math.min(255, texture.rgba[i + 2] + jitter)),
    texture.rgba[i + 3]
  ];
}

function drawHazardStamp(buf, rng, accent, dark, scale = 1) {
  const hazard = sourceTexture("hazard");
  if (!hazard) return;
  const cx = size * (.18 + rng() * .64);
  const cy = size * (.16 + rng() * .68);
  const w = Math.floor((32 + rng() * 42) * scale);
  const h = Math.floor(w * (.45 + rng() * .35));
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const p = sampleTexture(hazard, x / w * .6 + rng() * .001, y / h * .6 + rng() * .001, x + y * 17);
      if (!p) continue;
      const luma = (p[0] + p[1] + p[2]) / 3;
      if (luma < 110) blend(buf, cx + x - w / 2, cy + y - h / 2, dark, .24);
      else if (luma > 185) blend(buf, cx + x - w / 2, cy + y - h / 2, accent, .28);
    }
  }
}

function drawSourceStamp(buf, sourceName, rng, accent, dark, scale = 1, alpha = .35) {
  const source = sourceTexture(sourceName);
  if (!source) return;
  const cx = size * (.24 + rng() * .52);
  const cy = size * (.2 + rng() * .48);
  const w = Math.floor((28 + rng() * 34) * scale);
  const h = Math.floor(w * (.45 + rng() * .35));
  const srcU = rng() * .58;
  const srcV = rng() * .62;
  const srcScale = .28 + rng() * .22;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const p = sampleTexture(source, srcU + x / w * srcScale, srcV + y / h * srcScale, x * 19 + y * 7);
      if (!p || p[3] < 12) continue;
      const luma = (p[0] + p[1] + p[2]) / 3;
      if (luma < 70) blend(buf, cx + x - w / 2, cy + y - h / 2, dark, alpha * .85);
      else if (luma < 160) blend(buf, cx + x - w / 2, cy + y - h / 2, accent, alpha * .3);
    }
  }
}

function faceTextureSourceFor(key, role) {
  if (key.includes("entrance")) return sourceTexture("stationEntrance") || sourceTexture("back") || sourceTexture("top");
  if (key.includes("rock")) return sourceTexture("rock") || sourceTexture("top");
  if (key.includes("missile")) return sourceTexture("missile") || sourceTexture("back") || sourceTexture("top");
  if (key.includes("station")) return sourceTexture("back") || sourceTexture("top");
  return sourceTextureFor(role, key.includes("back") || key.includes("end") ? "back" : "top");
}

function renderFaceSkin(model, key) {
  const oldSize = size;
  size = DEFAULT_SKIN_SIZE;
  try {
    const role = roleFor(model);
    const [baseHex, accentHex, darkHex, lineHex] = palettes[role];
    const base = hex(baseHex);
    const accent = hex(accentHex);
    const dark = hex(darkHex);
    const line = hex(lineHex);
    const rng = rngFor(hash32(`${model}:face:${key}`));
    const source = faceTextureSourceFor(key, role);
    const sourceSeed = hash32(`${model}:face:${key}:source`);
    const stationZoom = key.includes("station") ? 1.45 : 1;
    const zoom = (.42 + rng() * .32) * stationZoom;
    const offsetU = rng() * .74;
    const offsetV = rng() * .74;
    const tintStrength = key.includes("entrance") ? .08 : key.includes("rock") ? .12 : .24;
    const buf = Buffer.alloc(size * size * 4);
    const light = mix(base, [255, 255, 255, 255], .28);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const diagonal = (x + y) / (size * 2);
        const sampled = sampleTexture(source, offsetU + x / size * zoom, offsetV + y / size * zoom, sourceSeed);
        let c = sampled ? mix(sampled, base, tintStrength) : mix(light, base, diagonal * .5);
        c = mix(c, dark, Math.min(1, Math.hypot(x - size / 2, y - size / 2) / (size * .9)) * .2);
        const i = (y * size + x) * 4;
        buf[i] = c[0]; buf[i + 1] = c[1]; buf[i + 2] = c[2]; buf[i + 3] = 255;
      }
    }
    if (key.includes("entrance")) {
      fillRect(buf, size * .2, size * .27, size * .6, size * .46, dark, .86);
      drawLine(buf, size * .18, size * .25, size * .82, size * .25, accent, 9, .72);
      drawLine(buf, size * .82, size * .25, size * .82, size * .75, accent, 9, .72);
      drawLine(buf, size * .82, size * .75, size * .18, size * .75, accent, 9, .72);
      drawLine(buf, size * .18, size * .75, size * .18, size * .25, accent, 9, .72);
      for (let i = -4; i < 12; i++) drawLine(buf, i * 44, size * .18, i * 44 + 120, size * .08, i % 2 ? dark : accent, 10, .78);
    } else if (key.includes("end")) {
      const cx = size / 2, cy = size / 2;
      for (let r = size * .08; r < size * .42; r += size * .08) {
        for (let a = 0; a < Math.PI * 2; a += .04) blend(buf, cx + Math.cos(a) * r, cy + Math.sin(a) * r, line, .24);
      }
      fillRect(buf, size * .42, size * .42, size * .16, size * .16, dark, .5);
    } else if (key.includes("missile")) {
      drawLine(buf, size * .12, size * .22, size * .88, size * .22, accent, 18, .45);
      drawLine(buf, size * .12, size * .78, size * .88, size * .78, accent, 18, .45);
    } else if (key.includes("rock")) {
      for (let i = 0; i < 70; i++) {
        const x = rng() * size, y = rng() * size, r = 3 + rng() * 22;
        drawLine(buf, x - r, y, x + r * .8, y + (rng() - .5) * r, dark, 2 + rng() * 2, .22);
        drawLine(buf, x - r * .25, y - r * .25, x + r * .35, y + r * .12, line, 1.3, .16);
      }
    } else {
      for (let i = 0; i < 18; i++) drawPanel(buf, rng() * size, rng() * size, size * (.08 + rng() * .22), size * (.04 + rng() * .14), line, .22);
    }
    return { rgba: buf, width: size, height: size };
  } finally {
    size = oldSize;
  }
}

function renderSkin(model, side) {
  const oldSize = size;
  size = generatedSkinSize(model);
  const role = roleFor(model);
  try {
    const [baseHex, accentHex, darkHex, lineHex] = palettes[role];
    const base = hex(baseHex);
    const accent = hex(accentHex);
    const dark = hex(darkHex);
    const line = hex(lineHex);
    const rng = rngFor(hash32(`${model}:${role}:${side}`));
    const source = sourceTextureFor(role, side);
    const sourceSeed = hash32(`${model}:${side}:source`);
    const offsetU = rng() * .72;
    const offsetV = rng() * .72;
    const zoom = clampNumber((.16 + rng() * .16) * sourceZoomForModel(model, role), .14, role === "station" ? 1.35 : .9);
    const tintStrength = role === "rock" ? .18 : role === "station" ? .22 : .34;
    const buf = Buffer.alloc(size * size * 4);
    const light = mix(base, [255, 255, 255, 255], .34);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const diagonal = (x + y) / (size * 2);
        const cx = (x - size * .48) / (size * .62);
        const cy = (y - size * .44) / (size * .62);
        const vignette = Math.min(1, Math.sqrt(cx * cx + cy * cy));
        const noisy = (hash32(`${model}:${side}:${x >> 2}:${y >> 2}`) & 31) / 255;
        const sampled = sampleTexture(source, offsetU + x / size * zoom, offsetV + y / size * zoom, sourceSeed);
        let c = sampled ? mix(sampled, base, tintStrength) : mix(light, base, diagonal * .58 + .18);
        c = mix(c, light, Math.max(0, .2 - diagonal) * .34);
        c = mix(c, dark, vignette * .42 + noisy);
        const i = (y * size + x) * 4;
        buf[i] = c[0]; buf[i + 1] = c[1]; buf[i + 2] = c[2]; buf[i + 3] = 255;
      }
    }

    const panelCount = role === "covert" ? 7 : 24;
    for (let i = 0; i < panelCount; i++) {
      drawPanel(buf, rng() * size, rng() * size, size * (.08 + rng() * .24), size * (.04 + rng() * .16), line, role === "rock" ? .15 : role === "covert" ? .1 : .28);
    }
    const scratchCount = role === "covert" ? 14 : 80;
    for (let i = 0; i < scratchCount; i++) {
      const x = rng() * size, y = rng() * size;
      drawLine(buf, x, y, x + size * (.03 + rng() * .18), y + (rng() - .5) * size * .04, dark, .8 + rng() * 1.4, role === "covert" ? .06 : .18);
    }
    if (side !== "back" && (role === "station" || role === "hauler" || role === "cargo")) {
      for (let i = -8; i <= 18; i++) {
        const c = i % 2 ? dark : accent;
        drawLine(buf, i * 28, side === "top" ? size * .14 : size * .82, i * 28 + size * .42, side === "top" ? size * .05 : size * .92, c, size * .038, .75);
      }
      for (let i = 0; i < (role === "station" ? 6 : 3); i++) drawHazardStamp(buf, rng, accent, dark, role === "station" ? 1.1 : .78);
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
    // Pirate glyphs need face-aware placement or they end up stamped across rear
    // panels and awkward folds. Keep the release skins clean until the authoring
    // path can place sigils deliberately per face.
    if (side !== "back" && role === "police") {
      drawLine(buf, size * .2, size * .35, size * .5, size * .45, accent, size * .045, .42);
      drawLine(buf, size * .8, size * .35, size * .5, size * .45, accent, size * .045, .42);
      drawLine(buf, size * .24, size * .56, size * .5, size * .64, accent, size * .03, .32);
      drawLine(buf, size * .76, size * .56, size * .5, size * .64, accent, size * .03, .32);
    }
    if (side !== "back" && role === "project") {
      drawLine(buf, size * .12, side === "top" ? size * .97 : size * .05, size * .7, side === "top" ? 0 : size * .97, accent, size * .15, .38);
      drawLine(buf, size * .25, side === "top" ? size * .97 : size * .05, size * .85, side === "top" ? 0 : size * .97, [255, 255, 255, 255], size * .045, .5);
    }
    if (side !== "back" && role === "covert") {
      drawLine(buf, size * .12, side === "top" ? size * .82 : size * .18, size * .88, side === "top" ? size * .2 : size * .8, accent, size * .03, .48);
      drawLine(buf, size * .16, side === "top" ? size * .7 : size * .3, size * .78, side === "top" ? size * .28 : size * .72, line, size * .012, .42);
    }
    if (role === "rock") {
      for (let i = 0; i < 60; i++) {
        const x = rng() * size, y = rng() * size, r = 4 + rng() * 18;
        drawLine(buf, x - r, y, x + r, y + rng() * r * .5, dark, 2 + rng() * 3, .22);
        drawLine(buf, x - r * .4, y - r * .4, x + r * .4, y + r * .2, line, 1.5, .18);
      }
    }
    return { rgba: buf, width: size, height: size };
  } finally {
    size = oldSize;
  }
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
  if (bitDepth !== 8 || ![2, 6].includes(colorType) || interlace !== 0 || !width || !height || !idat.length) return null;
  const inflated = zlib.inflateSync(Buffer.concat(idat));
  const bpp = colorType === 6 ? 4 : 3;
  const srcStride = width * bpp;
  const outStride = width * 4;
  const rgba = Buffer.alloc(outStride * height);
  const rowDecoded = Buffer.alloc(srcStride);
  const prev = Buffer.alloc(srcStride);
  for (let y = 0; y < height; y++) {
    const src = y * (srcStride + 1);
    const filter = inflated[src];
    for (let x = 0; x < srcStride; x++) {
      const value = inflated[src + 1 + x];
      const left = x >= bpp ? rowDecoded[x - bpp] : 0;
      const up = prev[x];
      const upLeft = x >= bpp ? prev[x - bpp] : 0;
      let decoded = value;
      if (filter === 1) decoded = value + left;
      else if (filter === 2) decoded = value + up;
      else if (filter === 3) decoded = value + ((left + up) >> 1);
      else if (filter === 4) decoded = value + paeth(left, up, upLeft);
      else if (filter !== 0) return null;
      rowDecoded[x] = decoded & 255;
    }
    for (let x = 0; x < width; x++) {
      const srcI = x * bpp;
      const outI = y * outStride + x * 4;
      rgba[outI] = rowDecoded[srcI];
      rgba[outI + 1] = rowDecoded[srcI + 1];
      rgba[outI + 2] = rowDecoded[srcI + 2];
      rgba[outI + 3] = colorType === 6 ? rowDecoded[srcI + 3] : 255;
    }
    rowDecoded.copy(prev);
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
  if (!modelUsesOnlyFaceTextures(model)) {
    for (const side of ["top", "bottom", "back"]) {
      if (modelSideDisabled(model, side)) continue;
      const file = `${model}-${side}.png`;
      const filePath = path.join(outDir, file);
      const sizeInfo = pngHeaderSize(filePath);
      const expectedSize = generatedSkinSize(model);
      const preserveExisting = force && preserveForceSkins.has(model) && fs.existsSync(filePath);
      const mirrorX = modelSideMirrorX(model, side);
      const needsMirrorRegen = mirrorX
        && !preserveForceSkins.has(model)
        && !!sizeInfo
        && sizeInfo.width > Math.ceil(expectedSize / 2) + 4;
      if (((force || forceModelNames.has(model)) && !preserveExisting) || !fs.existsSync(filePath) || needsMirrorRegen) {
        let { rgba, width, height } = renderSkin(model, side);
        if (mirrorX) {
          const cropped = cropLeftHalfRgba(rgba, width, height);
          rgba = cropped.rgba;
          width = cropped.width;
          height = cropped.height;
        }
        const png = pngEncode(rgba, width, height);
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
  const faceEntries = {};
  for (const key of modelFaceTextureKeys(model)) {
    const file = `${model}-face-${key}.png`;
    const filePath = path.join(outDir, file);
    if (force || forceModelNames.has(model) || !fs.existsSync(filePath)) {
      const { rgba, width, height } = renderFaceSkin(model, key);
      fs.writeFileSync(filePath, pngEncode(rgba, width, height));
      generatedCount++;
    }
    if (!fs.existsSync(filePath)) continue;
    if (recompress) {
      const result = recompressPngFile(filePath);
      recompressBeforeBytes += result.before;
      recompressAfterBytes += result.after;
      if (result.skipped) recompressSkippedCount++;
      else if (result.after < result.before) recompressedCount++;
    }
    pngFiles.push(filePath);
    faceEntries[key] = `assets/skins/${file}`;
  }
  if (Object.keys(faceEntries).length) manifest[model].faces = faceEntries;
}

const manifestMissing = !fs.existsSync(manifestPath);
const manifestMtime = manifestMissing ? 0 : fs.statSync(manifestPath).mtimeMs;
const newestPngMtime = Math.max(...pngFiles.map((file) => fs.statSync(file).mtimeMs));
const modelAssetFiles = fs.existsSync(modelDir)
  ? fs.readdirSync(modelDir).filter((file) => file.endsWith(".ultraship.json")).map((file) => path.join(modelDir, file))
  : [];
const decalFiles = fs.existsSync(decalDir)
  ? fs.readdirSync(decalDir)
    .filter((file) => imageMimeByExt.has(path.extname(file).toLowerCase()))
    .sort((a, b) => a.localeCompare(b))
    .map((file) => path.join(decalDir, file))
  : [];
const newestModelMtime = modelAssetFiles.length ? Math.max(...modelAssetFiles.map((file) => fs.statSync(file).mtimeMs)) : 0;
const newestDecalMtime = decalFiles.length ? Math.max(...decalFiles.map((file) => fs.statSync(file).mtimeMs)) : 0;
const generatorMtime = fs.statSync(fileURLToPath(import.meta.url)).mtimeMs;
const newestInputMtime = Math.max(newestPngMtime, newestModelMtime, newestDecalMtime, generatorMtime);
const shouldWriteManifest = !dryRun;

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
    if (side === "faces" && rel && typeof rel === "object") {
      return [side, Object.fromEntries(Object.entries(rel).map(([key, faceRel]) => {
        return [key, {
          src: dataUrlTokenForFile(path.join(root, faceRel), "image/png"),
          path: faceRel.replaceAll(path.sep, "/")
        }];
      }))];
    }
    return [side, skinManifestEntry(model, side, dataUrlTokenForFile(path.join(root, rel), "image/png"), path.join(root, rel))];
  }))
]));

const decalEntries = Object.fromEntries(decalFiles.map((filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  const key = path.basename(filePath, ext).trim().replace(/[^a-zA-Z0-9_-]+/g, "_").replace(/^_+|_+$/g, "");
  const mime = imageMimeByExt.get(ext) || "application/octet-stream";
  return [key, {
    src: dataUrlTokenForFile(filePath, mime),
    path: path.relative(root, filePath).replaceAll(path.sep, "/")
  }];
}));

fs.writeFileSync(manifestPath, [
  "/* Generated by tools/build/generate-bitmap-skins.mjs. Edit PNGs in assets/skins or image decals in assets/decals, then run npm run build. */",
  `const __ULTRA_ELITE_BITMAP_ASSETS = ${JSON.stringify(Object.fromEntries(assetPool))};`,
  `globalThis.ULTRA_ELITE_BITMAP_SKINS = ${serializeWithAssetRefs(entries)};`,
  `globalThis.ULTRA_ELITE_BITMAP_DECALS = ${serializeWithAssetRefs(decalEntries)};`,
  ""
].join("\n"));

console.log(`${generatedCount ? `Generated ${generatedCount}` : "Reused existing"} bitmap skin PNG${generatedCount === 1 ? "" : "s"} in ${path.relative(root, outDir)}`);
if (recompress) {
  const saved = recompressBeforeBytes - recompressAfterBytes;
  const mode = dryRun ? "dry-run " : "";
  console.log(`Bitmap skin ${mode}recompress: ${recompressedCount} smaller, ${recompressSkippedCount} skipped, ${formatBytes(recompressBeforeBytes)} -> ${formatBytes(recompressAfterBytes)} (${formatBytes(saved)} saved)`);
}
console.log(`Generated ${path.relative(root, manifestPath)}`);
