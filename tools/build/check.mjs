import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../..");
const fix = process.argv.includes("--fix");
const fixes = [];

const files = {
  packageJson: path.join(root, "package.json"),
  readme: path.join(root, "README.md"),
  devHtml: path.join(root, "dev.html"),
  template: path.join(root, "src/index.template.html"),
  css: path.join(root, "src/game.css"),
  js: path.join(root, "src/main.js"),
  builderJs: path.join(root, "tools/ship-builder/ship-builder.js"),
  builderModels: path.join(root, "tools/ship-builder/game-model-library.js"),
  localServer: path.join(root, "tools/local-dev-server.mjs"),
  renderBenchHtml: path.join(root, "tools/render-bench/index.html"),
  renderQaHtml: path.join(root, "tools/render-qa/index.html"),
  renderQaJs: path.join(root, "tools/render-qa/render-qa.js"),
  uvPainterJs: path.join(root, "tools/uv-painter/uv-painter.js"),
  builderRenderPreviewHtml: path.join(root, "tools/ship-builder/render-preview.html"),
  builderRenderPreviewJs: path.join(root, "tools/ship-builder/render-preview.js"),
  generatedModels: path.join(root, "src/generated/model-library.js"),
  generatedSkins: path.join(root, "src/generated/bitmap-skins.js"),
};
const modelDir = path.join(root, "assets/models");

function read(file) {
  return fs.readFileSync(file, "utf8");
}

function writeJson(file, data) {
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
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
const localServer = read(files.localServer);
const renderBenchHtml = read(files.renderBenchHtml);
const renderQaHtml = read(files.renderQaHtml);
const renderQaJs = read(files.renderQaJs);
const uvPainterJs = read(files.uvPainterJs);
const builderRenderPreviewHtml = read(files.builderRenderPreviewHtml);
const builderRenderPreviewJs = read(files.builderRenderPreviewJs);
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
  ["explicit edge kind classifier", "function edgeIsStick"],
  ["generated runtime edge kinds", "edgeKinds"],
];
for (const [label, marker] of protrudingEdgeGuards) {
  if (!js.includes(marker)) {
    throw new Error(`Missing renderer guard: ${label}. Protruding sticks must draw under hull first and only repaint in front when not hull-occluded.`);
  }
}

const bitmapProjectionGuards = [
  ["blueprint face rebuild remaps bitmap metadata", "function remapImageProjectionForBuiltFaces"],
  ["face-index bitmap slot helper", "hasProjectionFaceSlot"],
  ["face-side lookup must not fall through authored null face slots", "hasProjectionFaceSlot(faceSides, faceIndex)"],
  ["face-texture lookup must not fall through authored null face slots", "hasProjectionFaceSlot(faceTextures, faceIndex)"],
  ["face-mirror lookup must not fall through authored null face slots", "hasProjectionFaceSlot(faceMirrorX, faceIndex)"],
  ["authored face group UV lookup must not fall through authored null face slots", "hasProjectionFaceSlot(faceTextureUv, faceIndex)"],
  ["authored face group UV base width lookup", "faceTextureBaseW"],
  ["authored face group UV base height lookup", "faceTextureBaseH"],
  ["face-texture local projection", "faceLocalTextureUv"],
  ["face-texture collapsed UV fallback", "faceTextureUv"],
  ["face-texture UV area check", "uvPolygonArea(uv)"],
];
for (const [label, marker] of bitmapProjectionGuards) {
  if (!js.includes(marker)) {
    throw new Error(`Missing renderer guard: ${label}. Bitmap projection metadata is authored in face order; face index must win over normal index.`);
  }
}
if (js.includes("authoredFaceSide")) {
  throw new Error("Retired renderer UV path detected: per-face texture keys must not use authored bitmapSide to force whole-model side projection.");
}
if (!js.includes("faceAngleForDraw = 0")) {
  throw new Error("Generated face-local UV rotation must be baked once before draw; do not pass the same faceAngle into the draw step again.");
}
if (!js.includes("function drawWindowGlassTint") || !js.includes("drawWindowGlassTint(targetCtx, item, tracePoly)")) {
  throw new Error("Window glints must use a transparent glass tint so authored UV/window art remains visible underneath.");
}
if (!js.includes("const effectPoly = insetProjectedPolygon(projected")) {
  throw new Error("Window glass/glint overlays must be inset from polygon edges to avoid pale antialias outlines.");
}
if (js.includes('item.glass ? "#101915"')) {
  throw new Error("Window detail rendering must not replace authored UV/window art with an opaque glass fill.");
}
if (js.includes('detail.type === "engine" ? engineVisual.stroke : detail.stroke')) {
  throw new Error("Window/glass details must not inherit procedural outline strokes in solid mode.");
}
if (!js.includes("function detailRenderIntent") || !js.includes("detail.detailRender || detailRenderIntent(detail)")) {
  throw new Error("Renderer details must consume generated detailRender intent, with a compatibility fallback normalized by buildBlueprint.");
}
if (!js.includes("renderIntent.solidStroke ? engineVisual.stroke : null")) {
  throw new Error("Window/glass detail strokes must stay mode-aware: Old School/wire may use authored strokes, but Ultra solid mode may only stroke engine details.");
}
if (!js.includes("rgba(255,255,248,.42)") || !js.includes("targetCtx.globalAlpha = clamp(item.glintAlpha ?? .58, .12, .95)")) {
  throw new Error("Window glints must keep their intended bright core and visible alpha; white-line fixes belong elsewhere.");
}
if (!js.includes('targetCtx.globalCompositeOperation = "screen";')) {
  throw new Error("Window glints should keep screen compositing; white-line fixes must not mute the windscreen glint.");
}
if (js.includes("model.edgeFaces?.[edgeIndex]?.[0] < 0 && !edgeIsWindowDetailEdge")) {
  throw new Error("Ultra solid sticks must use explicit edgeKinds/edgeCullNormals, not window-specific legacy edge exceptions.");
}
if (js.includes("!!model.edgeCullNormals?.[edgeIndex] || model.edgeFaces?.[edgeIndex]?.[0] < 0")) {
  throw new Error("Ultra solid mode must not treat every orphan edge as a stick; preserve ordinary orphan edges for Old School only.");
}
if (js.includes("rgba(90,160,255,${.055")) {
  throw new Error("Station portal rendering must not repaint a faint perimeter stroke in solid mode.");
}
if (js.includes("portalCtx.strokeStyle = `rgba(120,180,255")) {
  throw new Error("Station portal shimmer must not use procedural stroke lines in solid mode.");
}
if (!js.includes('if (portalMode === "wire")') || !js.includes("drawStationForcefieldQuad(portalCtx, points")) {
  throw new Error("Station portal strokes must stay confined to wire mode; Ultra solid mode should draw the inset forcefield fill.");
}

const modelRoleGuards = [
  ["built-in model role-list quarantine", "BUILTIN_MODEL_IDS"],
  ["generated role-list eligibility helper", "modelCanImportRoleLists"],
  ["role-list expansion guard", "if (!modelCanImportRoleLists(id, meta)) continue;"],
];
for (const [label, marker] of modelRoleGuards) {
  if (!js.includes(marker)) {
    throw new Error(`Missing model role guard: ${label}. Built-in generated model metadata must not add stations, rocks, or cargo to NPC spawn lists.`);
  }
}

const planetRenderGuards = [
  ["Safari canvas planet terminator fallback", "SAFARI_CANVAS_COMPOSITE_GUARD"],
  ["smooth planet terminator fallback", "drawPlanetTerminatorShadowSmooth"],
];
for (const [label, marker] of planetRenderGuards) {
  if (!js.includes(marker)) {
    throw new Error(`Missing planet renderer guard: ${label}. Safari must avoid the sampled terminator path that exposes shading tiles.`);
  }
}

const stationBeaconGuards = [
  ["strobe-style beacon pulse helper", "function beaconFlashPulse"],
  ["station slot beacon placement helper", "stationSlotBeaconPlacement"],
  ["station slot beacon border offset", "exact hull/portal edge avoids losing alternating corners"],
  ["station slot beacon facing gate", "if (!normal || -dot(normal, norm(baseCamPoint)) <= .02) continue;"],
  ["station slot beacons carry ordered phase", "beaconPhase: slotPlacement?.phase"],
  ["station slot beacons flash in slot sequence", "beaconFlashPulse(item.seed, item.beaconPhase)"],
  ["hangar transition beacons follow slot sequence", "beaconFlashPulse(0, i / Math.max(1, gateBeacons.length))"],
];
for (const [label, marker] of stationBeaconGuards) {
  if (!js.includes(marker)) {
    throw new Error(`Missing station beacon guard: ${label}. Slot beacons must sit just outside the entrance edge so all four corner lights survive portal/hull occlusion.`);
  }
}

const retiredRuntimeSkinMarkers = [
  ["runtime generated bitmap skin fallback", "buildBitmapSkinTexture"],
  ["runtime generated Project X image decal fallback", "buildProjectedImageDecalTexture"],
  ["legacy procedural hull decal entry", "function getShipDecal"],
  ["legacy procedural hull decal preview", "function getPreviewShipDecal"],
  ["legacy Project X embedded decal flag", "imageDecalTest"],
  ["legacy Project X embedded decal source", "imageDecalDataUrl"],
  ["legacy Project X all-ships hack", "HACK_PROJECT_X_SKIN_ALL_SHIPS"],
  ["legacy bitmap skins all-meshes test gate", "TEST_BITMAP_SKINS_ALL_MESHES"],
];
for (const [label, marker] of retiredRuntimeSkinMarkers) {
  if (js.includes(marker)) {
    throw new Error(`Retired mesh skin path still present: ${label}. Mesh rendering should use authored bitmap assets or degrade to solid faces.`);
  }
}

const retiredSolidWireMarkers = [
  ["shared renderer solid-plus-wire mode", 'mode === "both"'],
  ["shared renderer solid-plus-wire label", "Ultra Shaded + Wire"],
];
for (const [label, marker] of retiredSolidWireMarkers) {
  if (js.includes(marker)) {
    throw new Error(`Retired renderer mode still present: ${label}. Ultra bitmap/solid rendering must not procedurally ink mesh edges.`);
  }
}
if (renderBenchHtml.includes('value="both"') || renderQaHtml.includes('value="both"')) {
  throw new Error('Retired "both" renderer mode still appears in render tools.');
}
if (!js.includes("if (wireDetails ? !renderIntent.wire : !renderIntent.solid) continue;")) {
  throw new Error("Solid/Ultra rendering must use precomputed detailRender mode intent, so line/polyline details do not draw over bitmap hulls.");
}
if (!js.includes("detail.lift ?? .5") || !builderJs.includes("lift: 0.5")) {
  throw new Error("Model detail lift defaults must stay at 0.5 so editor/game details sit close to bitmap hulls.");
}

const builderBitmapGuards = [
  ["builder face-texture local projection", "function faceLocalTextureProjection"],
  ["builder face-texture collapsed UV fallback", "function faceTextureProjection"],
  ["builder face-texture UV area check", "polygonArea2d(fallbackPts)"],
  ["builder face-group overlay resolves renderer face index", "item?.faceIndex === index"],
  ["builder transient face projection follows renderable faces", "const projectionFaces = renderableFaces.map((face) => face.source)"],
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

for (const file of fs.readdirSync(modelDir).filter((name) => name.endsWith(".ultraship.json"))) {
  const source = read(path.join(modelDir, file));
  if (source.includes('"imageDecalTest"') || source.includes('"imageDecalDataUrl"') || source.includes('"imageDecalBottomDataUrl"')) {
    throw new Error(`${file} still contains retired imageDecalTest metadata. Use authored bitmap skins/decals instead.`);
  }
}

new Function(js);
new Function(renderQaJs);
new Function(uvPainterJs);
new Function(builderRenderPreviewJs);
new Function(read(files.builderModels));
new Function(read(files.generatedModels));
new Function(read(files.generatedSkins));

if (packageJson.scripts?.["dev:tools"] !== "node tools/local-dev-server.mjs") {
  throw new Error("package.json must expose npm run dev:tools for the local Ultra Elite tool server.");
}

const localToolGuards = [
  ["local model save API", "saveModel(req, res"],
  ["local skin upload API", '"/api/skins"'],
  ["local rebuild API", '"/api/rebuild"'],
  ["local rebuild helper", "async function rebuildScope"]
];
for (const [label, marker] of localToolGuards) {
  if (!localServer.includes(marker)) {
    throw new Error(`Missing local tool server guard: ${label}.`);
  }
}

const builderToolGuards = [
  ["builder direct model save", "async function saveModelAsset"],
  ["builder direct skin side upload", "async function uploadSkinSide"],
  ["builder direct face skin upload", "async function uploadSelectedFaceSkin"],
  ["builder asset shelf API load", "async function loadAssetShelf"],
  ["builder write confirmation", "function confirmWrite"],
  ["builder transient preview skin bundle", "function gamePreviewBitmapSkins"],
  ["builder trusted preview keeps real renderer solid", "Game renderer preview stays solid"]
];
for (const [label, marker] of builderToolGuards) {
  if (!builderJs.includes(marker)) {
    throw new Error(`Missing ship-builder local tool guard: ${label}.`);
  }
}

function assertGeneratedAssetsBeforeMain(html, label) {
  const modelsIndex = html.indexOf('src="../../src/generated/model-library.js"');
  const skinsIndex = html.indexOf('src="../../src/generated/bitmap-skins.js"');
  const mainIndex = html.indexOf('src="../../src/main.js"');
  if (modelsIndex < 0 || skinsIndex < 0 || mainIndex < 0 || !(modelsIndex < mainIndex && skinsIndex < mainIndex)) {
    throw new Error(`${label} must load generated model/skin manifests before src/main.js.`);
  }
}

assertGeneratedAssetsBeforeMain(renderBenchHtml, "Render bench");
assertGeneratedAssetsBeforeMain(renderQaHtml, "Render QA");
assertGeneratedAssetsBeforeMain(builderRenderPreviewHtml, "Ship Builder game-render preview");
if (!renderQaJs.includes("window.UltraEliteRenderBench") || !renderQaJs.includes("api.renderFrame")) {
  throw new Error("Render QA must use the shared UltraEliteRenderBench renderer hook.");
}
if (!builderRenderPreviewJs.includes("window.UltraEliteRenderBench") || !builderRenderPreviewJs.includes("blueprint: latest.blueprint") || !builderRenderPreviewJs.includes("bitmapSkins: latest.bitmapSkins")) {
  throw new Error("Ship Builder game-render preview must use the shared UltraEliteRenderBench renderer hook with a builder blueprint.");
}
if (!builderRenderPreviewJs.includes("engineGlow: 0")) {
  throw new Error("Ship Builder game-render preview must suppress engine glow so face groups and stern paint stay inspectable.");
}
if (!js.includes("const customBlueprint = opts.blueprint") || !js.includes("buildBlueprint(cloneGeneratedModelBlueprint(customBlueprint))") || !js.includes("const model = opts.model || MODELS[modelName]")) {
  throw new Error("Render bench hook must accept custom builder blueprints for Ship Builder game-render preview.");
}
if (!js.includes("const benchImageDecals") || !js.includes("opts.bitmapSkins")) {
  throw new Error("Render bench hook must accept transient bitmap skins for Ship Builder game-render preview.");
}
if (!js.includes("function modelFaceBaseColor") || !js.includes("function hasProjectionFaceSlot")) {
  throw new Error("Per-face colour fallback must use a shared projection slot helper visible to collectSolidFaces.");
}

function cleanBitmapKey(value) {
  return String(value || "").trim().replace(/[^a-zA-Z0-9_-]+/g, "_").replace(/^_+|_+$/g, "");
}

function cleanHexColor(value) {
  const text = String(value || "").trim();
  return /^#[0-9a-f]{6}$/i.test(text) ? text.toLowerCase() : null;
}

function validBitmapFaceSide(value) {
  return value === "top" || value === "bottom" || value === "back" ? value : null;
}

function cleanBitmapAngle(value) {
  let n = Number(value) || 0;
  n = ((n + 180) % 360 + 360) % 360 - 180;
  return Math.abs(n) < .0001 ? null : Math.round(n * 100) / 100;
}

function cleanFaceUv(uv) {
  if (!Array.isArray(uv)) return null;
  const points = uv.map((p) => Array.isArray(p) && Number.isFinite(Number(p[0])) && Number.isFinite(Number(p[1]))
    ? [Math.round(Number(p[0]) * 1000) / 1000, Math.round(Number(p[1]) * 1000) / 1000]
    : null).filter(Boolean);
  return points.length >= 3 ? points : null;
}

function cleanFaceDecal(decal) {
  const key = cleanBitmapKey(decal?.key);
  if (!key) return null;
  const bounded = (value, min, max, fallback) => Math.max(min, Math.min(max, Number.isFinite(Number(value)) ? Number(value) : fallback));
  const angle = cleanBitmapAngle(decal?.angle);
  const alpha = bounded(decal?.alpha, 0, 1, .92);
  return {
    key,
    x: Math.round(bounded(decal?.x, 0, 1, .5) * 1000) / 1000,
    y: Math.round(bounded(decal?.y, 0, 1, .5) * 1000) / 1000,
    scale: Math.round(bounded(decal?.scale, .02, 2, .35) * 1000) / 1000,
    ...(angle ? { angle } : {}),
    ...(alpha < .999 ? { alpha: Math.round(alpha * 1000) / 1000 } : {})
  };
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

function bitmapEntrySource(entry) {
  if (typeof entry === "string") return entry;
  return typeof entry?.src === "string" ? entry.src : "";
}

function bitmapSourceHash(src) {
  return crypto.createHash("sha256").update(src).digest("hex");
}

const builderModels = runWindowGenerated(files.builderModels, "ULTRA_ELITE_MODEL_LIBRARY");
const generatedModels = runGenerated(files.generatedModels, "ULTRA_ELITE_MODEL_BLUEPRINTS");
const generatedSkins = runGenerated(files.generatedSkins, "ULTRA_ELITE_BITMAP_SKINS");
const generatedDecals = runGenerated(files.generatedSkins, "ULTRA_ELITE_BITMAP_DECALS");

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

function sourceEdgeKind(edge) {
  return !Array.isArray(edge) && edge?.kind === "stick" ? "stick" : "edge";
}

function explicitEdgeKind(edge) {
  if (Array.isArray(edge) || edge?.kind === undefined || edge?.kind === null) return null;
  return String(edge.kind);
}

function expectedDetailRender(detail) {
  const type = detail?.type === "panel" ? "line" : detail?.type;
  const line = type === "line" || type === "polyline";
  const beacon = type === "beacon";
  const engine = type === "engine";
  const windowDetail = type === "window";
  return {
    kind: beacon ? "beacon" : line ? "line" : "poly",
    solid: !line,
    wire: !beacon,
    glow: engine,
    glass: windowDetail,
    solidStroke: engine
  };
}

function assertDetailRenderIntent(label, details) {
  if (!Array.isArray(details)) return;
  for (const [index, detail] of details.entries()) {
    const expected = expectedDetailRender(detail);
    if (JSON.stringify(detail.detailRender) !== JSON.stringify(expected)) {
      throw new Error(`${label} detail ${index} has stale or missing detailRender intent. Run npm run models or npm run build.`);
    }
  }
}

function expectedEdgeKindsForBlueprint(data, blueprint) {
  if (!Array.isArray(blueprint?.edges)) return null;
  const indexById = new Map((data.verts || []).map((vertex, index) => [sourceVertexId(vertex, index), index]));
  const kindByKey = new Map();
  for (const [index, edge] of (data.edges || []).entries()) {
    const declaredKind = explicitEdgeKind(edge);
    if (declaredKind && declaredKind !== "edge" && declaredKind !== "stick") {
      throw new Error(`${data.id || "model"} editable edge ${index} has invalid kind "${declaredKind}". Use "edge" or "stick" so Ultra solid rendering never guesses from orphan edges.`);
    }
    const [sourceA, sourceB] = sourceEdgeEnds(edge);
    const a = indexById.get(sourceA);
    const b = indexById.get(sourceB);
    if (a === undefined || b === undefined || a === b) continue;
    const key = a < b ? `${a},${b}` : `${b},${a}`;
    kindByKey.set(key, sourceEdgeKind(edge));
  }
  return blueprint.edges.map((edge) => {
    if (!Array.isArray(edge) || edge.length < 2) return "edge";
    const [a, b] = edge.map(Number);
    const key = a < b ? `${a},${b}` : `${b},${a}`;
    return kindByKey.get(key) || "edge";
  });
}

function assertGeneratedEdgeKinds(label, data, blueprint) {
  const expected = expectedEdgeKindsForBlueprint(data, blueprint);
  if (!expected) return;
  if (!Array.isArray(blueprint.edgeKinds)) {
    throw new Error(`${label} is missing generated edgeKinds. Build-time metadata must classify edges vs sticks so the renderer does not infer sticks from orphan edges.`);
  }
  if (blueprint.edgeKinds.length !== expected.length) {
    throw new Error(`${label} edgeKinds length ${blueprint.edgeKinds.length} does not match edges length ${expected.length}.`);
  }
  for (const [index, kind] of blueprint.edgeKinds.entries()) {
    if (kind !== "edge" && kind !== "stick") {
      throw new Error(`${label} edgeKinds[${index}] has invalid kind "${kind}".`);
    }
    if (kind !== expected[index]) {
      throw new Error(`${label} edgeKinds[${index}] is "${kind}" but editable edge intent resolves to "${expected[index]}". Run npm run models or npm run build.`);
    }
  }
}

function assertOptionalEmbeddedEdgeKinds(label, data, blueprint) {
  if (!Array.isArray(blueprint?.edgeKinds)) return;
  assertGeneratedEdgeKinds(label, data, blueprint);
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
  assertGeneratedEdgeKinds(`tools/ship-builder/game-model-library.js ${modelId}`, model, model.blueprint);
  assertDetailRenderIntent(`tools/ship-builder/game-model-library.js ${modelId}`, model.blueprint?.details);
}

if (fs.existsSync(modelDir)) {
  for (const file of fs.readdirSync(modelDir).filter((name) => name.endsWith(".ultraship.json")).sort()) {
    const filePath = path.join(modelDir, file);
    const data = JSON.parse(read(filePath));
    const modelId = data.id || file.replace(/\.ultraship\.json$/, "");
    const sourceFaces = Array.isArray(data.faces) ? data.faces : [];
    const faceSides = sourceFaces.map((face) => validBitmapFaceSide(face?.bitmapSide));
    const faceTextures = sourceFaces.map((face) => cleanBitmapKey(face?.bitmapFaceKey) || null);
    const faceTextureUv = sourceFaces.map((face) => cleanFaceUv(face?.bitmapUv));
    const faceTextureBaseW = sourceFaces.map((face) => Number.isFinite(Number(face?.bitmapBaseW)) && Number(face.bitmapBaseW) > 0 ? Math.round(Number(face.bitmapBaseW)) : null);
    const faceTextureBaseH = sourceFaces.map((face) => Number.isFinite(Number(face?.bitmapBaseH)) && Number(face.bitmapBaseH) > 0 ? Math.round(Number(face.bitmapBaseH)) : null);
    const authoredFaceColors = sourceFaces.map((face) => cleanHexColor(face?.faceColor || face?.color));
    const faceAngles = sourceFaces.map((face) => cleanBitmapAngle(face?.bitmapAngle));
    const faceMirrorX = sourceFaces.map((face) => !!face?.bitmapMirrorX);
    const faceDecals = sourceFaces.map((face) => {
      const decals = Array.isArray(face?.bitmapDecals) ? face.bitmapDecals.map(cleanFaceDecal).filter(Boolean) : [];
      return decals.length ? decals : null;
    });
    const hasFaceSides = faceSides.some(Boolean);
    const hasFaceTextures = faceTextures.some(Boolean);
    const hasFaceTextureUv = faceTextureUv.some(Boolean);
    const hasFaceTextureBaseW = faceTextureBaseW.some(Boolean);
    const hasFaceTextureBaseH = faceTextureBaseH.some(Boolean);
    const hasAuthoredFaceColors = authoredFaceColors.some(Boolean);
    const hasFaceAngles = faceAngles.some((angle) => angle != null);
    const hasFaceMirrorX = faceMirrorX.some(Boolean);
    const hasFaceDecals = faceDecals.some((decals) => decals?.length);
    const usesOnlyFaceTextures = sourceFaces.length > 0 && faceTextures.every(Boolean);
    assertOptionalEmbeddedEdgeKinds(`${path.relative(root, filePath)} embedded blueprint`, data, data.blueprint);
    assertGeneratedEdgeKinds(`${path.relative(root, filePath)} generated blueprint`, data, generatedModels[modelId]);
    assertDetailRenderIntent(`${path.relative(root, filePath)} generated blueprint`, generatedModels[modelId]?.details);
    if (!hasFaceSides && !hasFaceTextures && !hasFaceTextureUv && !hasFaceTextureBaseW && !hasFaceTextureBaseH && !hasAuthoredFaceColors && !hasFaceAngles && !hasFaceMirrorX && !hasFaceDecals) continue;

    const generatedProjection = generatedModels[modelId]?.imageProjection || {};
    if (hasFaceSides && JSON.stringify(generatedProjection.faceSides) !== JSON.stringify(faceSides)) {
      throw new Error(`${path.relative(root, filePath)} bitmap faceSides are out of sync with src/generated/model-library.js; run npm run models or npm run build.`);
    }
    if (hasFaceTextures && JSON.stringify(generatedProjection.faceTextures) !== JSON.stringify(faceTextures)) {
      throw new Error(`${path.relative(root, filePath)} bitmap faceTextures are out of sync with src/generated/model-library.js; run npm run models or npm run build.`);
    }
    if (hasFaceTextureUv && JSON.stringify(generatedProjection.faceTextureUv) !== JSON.stringify(faceTextureUv)) {
      throw new Error(`${path.relative(root, filePath)} bitmap faceTextureUv is out of sync with src/generated/model-library.js; run npm run models or npm run build.`);
    }
    if (hasFaceTextureBaseW && JSON.stringify(generatedProjection.faceTextureBaseW) !== JSON.stringify(faceTextureBaseW)) {
      throw new Error(`${path.relative(root, filePath)} bitmap faceTextureBaseW is out of sync with src/generated/model-library.js; run npm run models or npm run build.`);
    }
    if (hasFaceTextureBaseH && JSON.stringify(generatedProjection.faceTextureBaseH) !== JSON.stringify(faceTextureBaseH)) {
      throw new Error(`${path.relative(root, filePath)} bitmap faceTextureBaseH is out of sync with src/generated/model-library.js; run npm run models or npm run build.`);
    }
    sourceFaces.forEach((face, faceIndex) => {
      if (Array.isArray(face?.bitmapUv)) {
        const verts = sourceFaceVerts(face);
        if (!faceTextureUv[faceIndex] || faceTextureUv[faceIndex].length !== verts.length) {
          throw new Error(`${path.relative(root, filePath)} face ${faceIndex} has bitmapUv with ${faceTextureUv[faceIndex]?.length || 0} points for ${verts.length} vertices.`);
        }
      }
      if (faceTextureUv[faceIndex] && (!faceTextureBaseW[faceIndex] || !faceTextureBaseH[faceIndex])) {
        throw new Error(`${path.relative(root, filePath)} face ${faceIndex} has authored bitmapUv without bitmapBaseW/bitmapBaseH.`);
      }
      if (faceTextureUv[faceIndex] && faceAngles[faceIndex] != null) {
        throw new Error(`${path.relative(root, filePath)} face ${faceIndex} has explicit bitmapUv plus bitmapAngle. Bake the rotation into authored UVs so the renderer does not apply extra draw-time intent.`);
      }
    });
    if ((hasFaceTextures || hasAuthoredFaceColors) && (!Array.isArray(generatedProjection.faceColors) || generatedProjection.faceColors.length !== sourceFaces.length)) {
      throw new Error(`${path.relative(root, filePath)} bitmap faceColors are missing or out of sync with src/generated/model-library.js; run npm run models or npm run build.`);
    }
    if (Array.isArray(generatedProjection.faceColors)) {
      generatedProjection.faceColors.forEach((color, faceIndex) => {
        if (color != null && !cleanHexColor(color)) {
          throw new Error(`${path.relative(root, filePath)} generated invalid faceColors[${faceIndex}] (${color}).`);
        }
        if (authoredFaceColors[faceIndex] && color !== authoredFaceColors[faceIndex]) {
          throw new Error(`${path.relative(root, filePath)} authored faceColor for face ${faceIndex} is out of sync with src/generated/model-library.js; run npm run models or npm run build.`);
        }
      });
    }
    if (hasFaceAngles && JSON.stringify(generatedProjection.faceAngles) !== JSON.stringify(faceAngles)) {
      throw new Error(`${path.relative(root, filePath)} bitmap faceAngles are out of sync with src/generated/model-library.js; run npm run models or npm run build.`);
    }
    if (hasFaceMirrorX && JSON.stringify(generatedProjection.faceMirrorX) !== JSON.stringify(faceMirrorX)) {
      throw new Error(`${path.relative(root, filePath)} bitmap faceMirrorX flags are out of sync with src/generated/model-library.js; run npm run models or npm run build.`);
    }
    if (hasFaceDecals && JSON.stringify(generatedProjection.faceDecals) !== JSON.stringify(faceDecals)) {
      throw new Error(`${path.relative(root, filePath)} bitmap faceDecals are out of sync with src/generated/model-library.js; run npm run models or npm run build.`);
    }
    const blueprintProjection = data.blueprint?.imageProjection;
    const blueprintBitmapFields = [
      ["faceSides", hasFaceSides, faceSides],
      ["faceTextures", hasFaceTextures, faceTextures],
      ["faceTextureUv", hasFaceTextureUv, faceTextureUv],
      ["faceTextureBaseW", hasFaceTextureBaseW, faceTextureBaseW],
      ["faceTextureBaseH", hasFaceTextureBaseH, faceTextureBaseH],
      ["faceColors", hasAuthoredFaceColors, authoredFaceColors],
      ["faceAngles", hasFaceAngles, faceAngles],
      ["faceMirrorX", hasFaceMirrorX, faceMirrorX],
      ["faceDecals", hasFaceDecals, faceDecals],
    ];
    const staleBlueprintFields = blueprintProjection
      ? blueprintBitmapFields.filter(([field, hasField, expected]) => hasField && JSON.stringify(blueprintProjection[field]) !== JSON.stringify(expected))
      : [];
    if (staleBlueprintFields.length) {
      if (fix) {
        data.blueprint.imageProjection = { ...(data.blueprint.imageProjection || {}) };
        for (const [field, , expected] of staleBlueprintFields) data.blueprint.imageProjection[field] = expected;
        writeJson(filePath, data);
        fixes.push(`${path.relative(root, filePath)} refreshed embedded blueprint ${staleBlueprintFields.map(([field]) => field).join(", ")} from editable face metadata.`);
        continue;
      }
      throw new Error(`${path.relative(root, filePath)} embedded blueprint bitmap metadata (${staleBlueprintFields.map(([field]) => field).join(", ")}) is stale; run npm run check:fix.`);
    }
    for (const decalKey of [...new Set(faceDecals.flatMap((decals) => (decals || []).map((decal) => decal.key)))]) {
      if (!bitmapEntrySource(generatedDecals[decalKey])) {
        throw new Error(`${path.relative(root, filePath)} declares bitmap decal ${decalKey}, but src/generated/bitmap-skins.js does not include it; run npm run skins or npm run build.`);
      }
    }
    const uniqueFaceKeys = [...new Set(faceTextures.filter(Boolean))];
    const faceTextureCounts = faceTextures.reduce((counts, key) => {
      if (key) counts.set(key, (counts.get(key) || 0) + 1);
      return counts;
    }, new Map());
    const seenFaceTextureHashes = new Map();
    for (const key of uniqueFaceKeys) {
      const entry = generatedSkins[modelId]?.faces?.[key];
      if (!entry) {
        throw new Error(`${path.relative(root, filePath)} declares bitmap face ${key}, but src/generated/bitmap-skins.js does not include it; run npm run skins or npm run build.`);
      }
      const src = bitmapEntrySource(entry);
      if (!src) {
        throw new Error(`${path.relative(root, filePath)} declares bitmap face ${key}, but its generated skin entry has no image source.`);
      }
      const hash = bitmapSourceHash(src);
      const existingKey = seenFaceTextureHashes.get(hash);
      if (existingKey && existingKey !== key) {
        if (fix) {
          const existingCount = faceTextureCounts.get(existingKey) || 0;
          const keyCount = faceTextureCounts.get(key) || 0;
          const keepKey = keyCount > existingCount ? key : existingKey;
          const replaceKey = keepKey === key ? existingKey : key;
          let changed = 0;
          for (const face of sourceFaces) {
            if (cleanBitmapKey(face?.bitmapFaceKey) === replaceKey) {
              face.bitmapFaceKey = keepKey;
              changed++;
            }
          }
          if (changed) {
            writeJson(filePath, data);
            fixes.push(`${path.relative(root, filePath)} rewrote ${changed} face${changed === 1 ? "" : "s"} from duplicate bitmapFaceKey ${replaceKey} to ${keepKey}.`);
          }
          break;
        }
        throw new Error(`${path.relative(root, filePath)} maps distinct bitmap faces ${existingKey} and ${key} to identical image data. Reuse the same bitmapFaceKey for intentional sharing, or fix the source PNGs.`);
      }
      seenFaceTextureHashes.set(hash, key);
    }
    if (usesOnlyFaceTextures) {
      for (const side of ["top", "bottom", "back"]) {
        if (generatedSkins[modelId]?.[side]) {
          throw new Error(`${path.relative(root, filePath)} is fully face-textured, but src/generated/bitmap-skins.js still embeds ${modelId}-${side}.png.`);
        }
      }
    }
  }
}

if (fixes.length) {
  console.log("Ultra Elite source cleanup applied:");
  for (const item of fixes) console.log(`- ${item}`);
  console.log("Run npm run build, then npm run check to refresh generated assets and validate.");
  process.exit(0);
}

console.log("Ultra Elite modular source check passed");
