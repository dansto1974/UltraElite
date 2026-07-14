import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../..");

const files = {
  packageJson: path.join(root, "package.json"),
  readme: path.join(root, "README.md"),
  devHtml: path.join(root, "dev.html"),
  template: path.join(root, "src/index.template.html"),
  css: path.join(root, "src/game.css"),
  js: path.join(root, "src/main.js"),
  builderJs: path.join(root, "tools/ship-builder/ship-builder.js"),
  builderModels: path.join(root, "tools/ship-builder/game-model-library.js"),
  generatedModels: path.join(root, "src/generated/model-library.js"),
  generatedSkins: path.join(root, "src/generated/bitmap-skins.js"),
};
const modelDir = path.join(root, "assets/models");

function read(file) {
  return fs.readFileSync(file, "utf8");
}

for (const file of Object.values(files)) {
  if (!fs.existsSync(file)) {
    throw new Error(`Missing ${path.relative(root, file)}`);
  }
}

const devHtml = read(files.devHtml);
const normalizedDevHtml = devHtml.replace(/\?v=[^"]+/g, "");
const template = read(files.template);
const css = read(files.css);
const js = read(files.js);
const builderJs = read(files.builderJs);
const packageJson = JSON.parse(read(files.packageJson));
const readme = read(files.readme);

if (!normalizedDevHtml.includes('href="src/game.css"') || !normalizedDevHtml.includes('src="src/main.js"')) {
  throw new Error("dev.html is not loading the modular CSS/JS sources.");
}
if (!normalizedDevHtml.includes('src="src/generated/model-library.js"')) {
  throw new Error("dev.html is not loading the generated model manifest.");
}
if (!normalizedDevHtml.includes('src="src/generated/bitmap-skins.js"')) {
  throw new Error("dev.html is not loading the generated bitmap skin manifest.");
}

const cssPlaceholders = (template.match(/__ULTRA_ELITE_CSS__/g) || []).length;
const jsPlaceholders = (template.match(/__ULTRA_ELITE_JS__/g) || []).length;
const assetPlaceholders = (template.match(/__ULTRA_ELITE_GENERATED_ASSETS__/g) || []).length;
if (cssPlaceholders !== 1 || jsPlaceholders !== 1 || assetPlaceholders !== 1) {
  throw new Error("src/index.template.html must contain exactly one CSS and one JS placeholder.");
}

const expectedDevHtml = template
  .replace("  <style>\n__ULTRA_ELITE_CSS__\n  </style>", '  <link rel="stylesheet" href="src/game.css">')
  .replace("  <script>\n__ULTRA_ELITE_GENERATED_ASSETS__\n  </script>", '  <script src="src/generated/model-library.js"></script>\n  <script src="src/generated/bitmap-skins.js"></script>')
  .replace("  <script>\n__ULTRA_ELITE_JS__\n  </script>", '  <script src="src/main.js"></script>');

if (normalizedDevHtml !== expectedDevHtml) {
  throw new Error("dev.html is out of sync with src/index.template.html; run npm run build.");
}

if (js.toLowerCase().includes("</script>")) {
  throw new Error("src/main.js contains </script>, which would break inline builds.");
}

if (css.toLowerCase().includes("</style>")) {
  throw new Error("src/game.css contains </style>, which would break inline builds.");
}

const gameVersion = js.match(/const GAME_VERSION = "([^"]+)"/)?.[1];
const readmeVersion = readme.match(/Current version: `([^`]+)`/)?.[1];
const readmeLatestChange = readme.match(/## Change Log\s+### ([^\n]+)/)?.[1]?.trim();
if (!gameVersion) {
  throw new Error("Could not find GAME_VERSION in src/main.js.");
}
if (packageJson.version !== gameVersion) {
  throw new Error(`package.json version ${packageJson.version} does not match GAME_VERSION ${gameVersion}.`);
}
if (readmeVersion !== gameVersion) {
  throw new Error(`README current version ${readmeVersion || "(missing)"} does not match GAME_VERSION ${gameVersion}.`);
}
if (readmeLatestChange !== gameVersion) {
  throw new Error(`README latest changelog entry ${readmeLatestChange || "(missing)"} does not match GAME_VERSION ${gameVersion}.`);
}

const protrudingEdgeGuards = [
  ["protruding-edge hull occlusion helper", "function protrudingEdgeTouchesCloserHull"],
  ["protruding-edge front pass occluder option", "frontOccluders"],
  ["protruding-edge base pass before hull", 'drawProtrudingEdges("behind")'],
  ["protruding-edge front pass with hull occluders", 'drawProtrudingEdges("front", protrudingHullOccluders)'],
];
for (const [label, marker] of protrudingEdgeGuards) {
  if (!js.includes(marker)) {
    throw new Error(`Missing renderer guard: ${label}. Protruding sticks must draw under hull first and only repaint in front when not hull-occluded.`);
  }
}

const bitmapProjectionGuards = [
  ["face-index bitmap slot helper", "hasProjectionFaceSlot"],
  ["face-side lookup must not fall through authored null face slots", "hasProjectionFaceSlot(faceSides, faceIndex)"],
  ["face-texture lookup must not fall through authored null face slots", "hasProjectionFaceSlot(faceTextures, faceIndex)"],
  ["face-texture collapsed UV fallback", "faceTextureUv"],
  ["face-texture UV area check", "uvPolygonArea(uv)"],
];
for (const [label, marker] of bitmapProjectionGuards) {
  if (!js.includes(marker)) {
    throw new Error(`Missing renderer guard: ${label}. Bitmap projection metadata is authored in face order; face index must win over normal index.`);
  }
}

const builderBitmapGuards = [
  ["builder face-texture collapsed UV fallback", "function faceTextureProjection"],
  ["builder face-texture UV area check", "polygonArea2d(fallbackPts)"],
];
for (const [label, marker] of builderBitmapGuards) {
  if (!builderJs.includes(marker)) {
    throw new Error(`Missing ship-builder guard: ${label}. Face bitmap preview must not treat collapsed UVs as missing faces.`);
  }
}

const escapePodLegalGuards = [
  ["escape pod legal reset source note", "BBC Elite's ESCAPE routine clears FIST"],
  ["escape pod legal reset assignment", "game.legal = 0;"],
];
for (const [label, marker] of escapePodLegalGuards) {
  if (!js.includes(marker)) {
    throw new Error(`Missing gameplay guard: ${label}. Using an escape capsule must clear legal status, matching original FIST reset behaviour.`);
  }
}
if (js.includes("game.legal = hadCapsule ?")) {
  throw new Error("Escape capsule path must not only reduce legal status; original Elite clears FIST after launching an escape pod.");
}

if (!fs.existsSync(files.generatedModels)) {
  throw new Error("Missing src/generated/model-library.js; run npm run models or npm run build.");
}
if (!fs.existsSync(files.generatedSkins)) {
  throw new Error("Missing src/generated/bitmap-skins.js; run npm run skins or npm run build.");
}
if (!fs.existsSync(files.builderModels)) {
  throw new Error("Missing tools/ship-builder/game-model-library.js; run npm run models or npm run build.");
}

new Function(js);
new Function(read(files.builderModels));
new Function(read(files.generatedModels));
new Function(read(files.generatedSkins));

function cleanBitmapKey(value) {
  return String(value || "").trim().replace(/[^a-zA-Z0-9_-]+/g, "_").replace(/^_+|_+$/g, "");
}

function validBitmapFaceSide(value) {
  return value === "top" || value === "bottom" || value === "back" ? value : null;
}

function runGenerated(file, globalName) {
  const ctx = { globalThis: {} };
  vm.runInNewContext(read(file), ctx, { filename: file });
  return ctx.globalThis[globalName] || {};
}

function runWindowGenerated(file, windowName) {
  const ctx = { window: {} };
  vm.runInNewContext(read(file), ctx, { filename: file });
  return ctx.window[windowName] || {};
}

const builderModels = runWindowGenerated(files.builderModels, "ULTRA_ELITE_MODEL_LIBRARY");
const generatedModels = runGenerated(files.generatedModels, "ULTRA_ELITE_MODEL_BLUEPRINTS");
const generatedSkins = runGenerated(files.generatedSkins, "ULTRA_ELITE_BITMAP_SKINS");

function sourceVertexId(vertex, index) {
  const id = Array.isArray(vertex) ? index : Number(vertex?.id);
  return Number.isFinite(id) ? id : index;
}

function sourceFaceVerts(face) {
  return (Array.isArray(face) ? face : face?.verts || []).map(Number);
}

function sourceEdgeEnds(edge) {
  return Array.isArray(edge) ? [Number(edge[0]), Number(edge[1])] : [Number(edge?.a), Number(edge?.b)];
}

for (const [modelId, model] of Object.entries(builderModels)) {
  const vertexIds = new Set((model.verts || []).map(sourceVertexId));
  for (const [index, face] of (model.faces || []).entries()) {
    const verts = sourceFaceVerts(face);
    if (verts.length < 3 || verts.some((id) => !vertexIds.has(id))) {
      throw new Error(`tools/ship-builder/game-model-library.js has an unnormalizable face for ${modelId} at index ${index}.`);
    }
  }
  for (const [index, edge] of (model.edges || []).entries()) {
    const [a, b] = sourceEdgeEnds(edge);
    if (!vertexIds.has(a) || !vertexIds.has(b)) {
      throw new Error(`tools/ship-builder/game-model-library.js has an unnormalizable edge for ${modelId} at index ${index}.`);
    }
  }
}

if (fs.existsSync(modelDir)) {
  for (const file of fs.readdirSync(modelDir).filter((name) => name.endsWith(".ultraship.json")).sort()) {
    const filePath = path.join(modelDir, file);
    const data = JSON.parse(read(filePath));
    const modelId = data.id || file.replace(/\.ultraship\.json$/, "");
    const sourceFaces = Array.isArray(data.faces) ? data.faces : [];
    const faceSides = sourceFaces.map((face) => validBitmapFaceSide(face?.bitmapSide));
    const faceTextures = sourceFaces.map((face) => cleanBitmapKey(face?.bitmapFaceKey) || null);
    const hasFaceSides = faceSides.some(Boolean);
    const hasFaceTextures = faceTextures.some(Boolean);
    if (!hasFaceSides && !hasFaceTextures) continue;

    const generatedProjection = generatedModels[modelId]?.imageProjection || {};
    if (hasFaceSides && JSON.stringify(generatedProjection.faceSides) !== JSON.stringify(faceSides)) {
      throw new Error(`${path.relative(root, filePath)} bitmap faceSides are out of sync with src/generated/model-library.js; run npm run models or npm run build.`);
    }
    if (hasFaceTextures && JSON.stringify(generatedProjection.faceTextures) !== JSON.stringify(faceTextures)) {
      throw new Error(`${path.relative(root, filePath)} bitmap faceTextures are out of sync with src/generated/model-library.js; run npm run models or npm run build.`);
    }
    for (const key of new Set(faceTextures.filter(Boolean))) {
      if (!generatedSkins[modelId]?.faces?.[key]) {
        throw new Error(`${path.relative(root, filePath)} declares bitmap face ${key}, but src/generated/bitmap-skins.js does not include it; run npm run skins or npm run build.`);
      }
    }
  }
}

console.log("Ultra Elite modular source check passed");
