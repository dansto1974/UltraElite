"use strict";

const TAU = Math.PI * 2;
const EPS = 0.0001;
const UV_TILE_WARN_COUNT = 64;
const UV_TILE_DANGER_COUNT = 160;
const UV_TILE_RUNTIME_LIMIT = 441;
const EDGE_KIND_HIDDEN = "hidden";
const EDGE_KIND_STATION_ENTRANCE = "stationEntrance";
const DETAIL_TYPE_STATION_ENTRANCE = "stationEntrance";
const STANDARD_VIEW = Object.freeze({ rx: -0.35, ry: 0.72 });
const PROJECTION_VIEW_PRESETS = Object.freeze({
  front: { rx: 0, ry: Math.PI, label: "FRONT" },
  back: { rx: 0, ry: 0, label: "BACK" },
  top: { rx: -Math.PI / 2, ry: 0, label: "TOP" },
  bottom: { rx: Math.PI / 2, ry: Math.PI, label: "BOTTOM" },
  left: { rx: 0, ry: -Math.PI / 2, label: "LEFT" },
  right: { rx: 0, ry: Math.PI / 2, label: "RIGHT" }
});
const VIEW_CUBE_CORNER_PRESETS = Object.freeze({
  front: {
    tl: { vector: { x: -1, y: 1, z: 1 }, adjacent: ["left", "top"], label: "FRONT TOP LEFT CORNER" },
    tr: { vector: { x: 1, y: 1, z: 1 }, adjacent: ["right", "top"], label: "FRONT TOP RIGHT CORNER" },
    bl: { vector: { x: -1, y: -1, z: 1 }, adjacent: ["left", "bottom"], label: "FRONT BOTTOM LEFT CORNER" },
    br: { vector: { x: 1, y: -1, z: 1 }, adjacent: ["right", "bottom"], label: "FRONT BOTTOM RIGHT CORNER" }
  },
  back: {
    tl: { vector: { x: 1, y: 1, z: -1 }, adjacent: ["right", "top"], label: "BACK TOP LEFT CORNER" },
    tr: { vector: { x: -1, y: 1, z: -1 }, adjacent: ["left", "top"], label: "BACK TOP RIGHT CORNER" },
    bl: { vector: { x: 1, y: -1, z: -1 }, adjacent: ["right", "bottom"], label: "BACK BOTTOM LEFT CORNER" },
    br: { vector: { x: -1, y: -1, z: -1 }, adjacent: ["left", "bottom"], label: "BACK BOTTOM RIGHT CORNER" }
  },
  right: {
    tl: { vector: { x: 1, y: 1, z: 1 }, adjacent: ["front", "top"], label: "RIGHT TOP LEFT CORNER" },
    tr: { vector: { x: 1, y: 1, z: -1 }, adjacent: ["back", "top"], label: "RIGHT TOP RIGHT CORNER" },
    bl: { vector: { x: 1, y: -1, z: 1 }, adjacent: ["front", "bottom"], label: "RIGHT BOTTOM LEFT CORNER" },
    br: { vector: { x: 1, y: -1, z: -1 }, adjacent: ["back", "bottom"], label: "RIGHT BOTTOM RIGHT CORNER" }
  },
  left: {
    tl: { vector: { x: -1, y: 1, z: -1 }, adjacent: ["back", "top"], label: "LEFT TOP LEFT CORNER" },
    tr: { vector: { x: -1, y: 1, z: 1 }, adjacent: ["front", "top"], label: "LEFT TOP RIGHT CORNER" },
    bl: { vector: { x: -1, y: -1, z: -1 }, adjacent: ["back", "bottom"], label: "LEFT BOTTOM LEFT CORNER" },
    br: { vector: { x: -1, y: -1, z: 1 }, adjacent: ["front", "bottom"], label: "LEFT BOTTOM RIGHT CORNER" }
  },
  top: {
    tl: { vector: { x: -1, y: 1, z: -1 }, adjacent: ["left", "back"], label: "TOP BACK LEFT CORNER" },
    tr: { vector: { x: 1, y: 1, z: -1 }, adjacent: ["right", "back"], label: "TOP BACK RIGHT CORNER" },
    bl: { vector: { x: -1, y: 1, z: 1 }, adjacent: ["left", "front"], label: "TOP FRONT LEFT CORNER" },
    br: { vector: { x: 1, y: 1, z: 1 }, adjacent: ["right", "front"], label: "TOP FRONT RIGHT CORNER" }
  },
  bottom: {
    tl: { vector: { x: -1, y: -1, z: 1 }, adjacent: ["left", "front"], label: "BOTTOM FRONT LEFT CORNER" },
    tr: { vector: { x: 1, y: -1, z: 1 }, adjacent: ["right", "front"], label: "BOTTOM FRONT RIGHT CORNER" },
    bl: { vector: { x: -1, y: -1, z: -1 }, adjacent: ["left", "back"], label: "BOTTOM BACK LEFT CORNER" },
    br: { vector: { x: 1, y: -1, z: -1 }, adjacent: ["right", "back"], label: "BOTTOM BACK RIGHT CORNER" }
  }
});
const TOOL_WINDOW_TITLES = Object.freeze({
  edit: "Controls",
  paint: "Controls",
  model: "File",
  game: "Game Info"
});
const els = {
  shipId: document.getElementById("shipId"),
  shipName: document.getElementById("shipName"),
  shipDescription: document.getElementById("shipDescription"),
  shipMissionLore: document.getElementById("shipMissionLore"),
  builderPreloadSplash: document.getElementById("builderPreloadSplash"),
  builderPreloadText: document.getElementById("builderPreloadText"),
  builderFullscreenBtn: document.getElementById("builderFullscreenBtn"),
  librarySelector: document.getElementById("librarySelector"),
  loadLibraryModelBtn: document.getElementById("loadLibraryModelBtn"),
  toolsPanel: document.getElementById("toolsPanel"),
  toolWindowTitle: document.getElementById("toolWindowTitle"),
  closeToolsWindowBtn: document.getElementById("closeToolsWindowBtn"),
  fileActionsWindow: document.getElementById("fileActionsWindow"),
  closeFileWindowBtn: document.getElementById("closeFileWindowBtn"),
  gameInfoWindow: document.getElementById("gameInfoWindow"),
  closeGameInfoWindowBtn: document.getElementById("closeGameInfoWindowBtn"),
  workspace: document.getElementById("workspace"),
  exportPanel: document.getElementById("exportPanel"),
  toggleExportBtn: document.getElementById("toggleExportBtn"),
  shipClass: document.getElementById("shipClass"),
  npcRole: document.getElementById("npcRole"),
  aiProfile: document.getElementById("aiProfile"),
  decalRole: document.getElementById("decalRole"),
  baseColor: document.getElementById("baseColor"),
  shipValue: document.getElementById("shipValue"),
  shipHp: document.getElementById("shipHp"),
  speedMul: document.getElementById("speedMul"),
  cargoTons: document.getElementById("cargoTons"),
  missileCount: document.getElementById("missileCount"),
  laserClass: document.getElementById("laserClass"),
  flagTrader: document.getElementById("flagTrader"),
  flagPirate: document.getElementById("flagPirate"),
  flagPolice: document.getElementById("flagPolice"),
  flagAlien: document.getElementById("flagAlien"),
  flagEscapePod: document.getElementById("flagEscapePod"),
  flagHidden: document.getElementById("flagHidden"),
  vertexCount: document.getElementById("vertexCount"),
  faceCount: document.getElementById("faceCount"),
  edgeCount: document.getElementById("edgeCount"),
  selectionReadout: document.getElementById("selectionReadout"),
  objectPropertiesPanel: document.getElementById("objectPropertiesPanel"),
  pickList: document.getElementById("pickList"),
  status: document.getElementById("status"),
  topStatus: document.getElementById("topStatus"),
  exportKind: document.getElementById("exportKind"),
  exportText: document.getElementById("exportText"),
  importText: document.getElementById("importText"),
  mainPreviewStack: document.getElementById("mainPreviewStack"),
  mainView: document.getElementById("mainView"),
  selectionContextMenu: document.getElementById("selectionContextMenu"),
  selectionPickMenu: document.getElementById("selectionPickMenu"),
  viewCube: document.getElementById("viewCube"),
  viewCubeBody: document.getElementById("viewCubeBody"),
  viewCubeRotateLeft: document.getElementById("viewCubeRotateLeft"),
  viewCubeRotateRight: document.getElementById("viewCubeRotateRight"),
  viewCubeRotateUp: document.getElementById("viewCubeRotateUp"),
  viewCubeRotateDown: document.getElementById("viewCubeRotateDown"),
  viewProjectionToggle: document.getElementById("viewProjectionToggle"),
  viewModeColumn: document.getElementById("viewModeColumn"),
  fullscreenViewBtn: document.getElementById("fullscreenViewBtn"),
  undoEditBtn: document.getElementById("undoEditBtn"),
  redoEditBtn: document.getElementById("redoEditBtn"),
  openFileWindowBtn: document.getElementById("openFileWindowBtn"),
  openGameInfoWindowBtn: document.getElementById("openGameInfoWindowBtn"),
  gamePreviewFrame: document.getElementById("gamePreviewFrame"),
  gamePreviewReadout: document.getElementById("gamePreviewReadout"),
  previewTrustReadout: document.getElementById("previewTrustReadout"),
  benchmarkRendererBtn: document.getElementById("benchmarkRendererBtn"),
  spinPreviewBtn: document.getElementById("spinPreviewBtn"),
  spinPreviewModal: document.getElementById("spinPreviewModal"),
  spinPreviewFrame: document.getElementById("spinPreviewFrame"),
  closeSpinPreviewBtn: document.getElementById("closeSpinPreviewBtn"),
  xSlider: document.getElementById("xSlider"),
  ySlider: document.getElementById("ySlider"),
  zSlider: document.getElementById("zSlider"),
  xValue: document.getElementById("xValue"),
  yValue: document.getElementById("yValue"),
  zValue: document.getElementById("zValue"),
  detailInset: document.getElementById("detailInset"),
  detailColor: document.getElementById("detailColor"),
  showFaceNormals: document.getElementById("showFaceNormals"),
  showFaceUvTypes: document.getElementById("showFaceUvTypes"),
  showBlankUv: document.getElementById("showBlankUv"),
  showWindowDetails: document.getElementById("showWindowDetails"),
  showSurfaceDetails: document.getElementById("showSurfaceDetails"),
  showEngineDetails: document.getElementById("showEngineDetails"),
  showBeaconDetails: document.getElementById("showBeaconDetails"),
  showAuditEdges: document.getElementById("showAuditEdges"),
  showHiddenEdges: document.getElementById("showHiddenEdges"),
  mirrorNewGeometry: document.getElementById("mirrorNewGeometry"),
  previewRenderMode: document.getElementById("previewRenderMode"),
  skinReadout: document.getElementById("skinReadout"),
  faceUvTypeReadout: document.getElementById("faceUvTypeReadout"),
  mirrorHalfSkins: document.getElementById("mirrorHalfSkins"),
  importMirroredSkin: document.getElementById("importMirroredSkin"),
  skinAngle: document.getElementById("skinAngle"),
  skinAngleValue: document.getElementById("skinAngleValue"),
  uvTransformX: document.getElementById("uvTransformX"),
  uvTransformXRange: document.getElementById("uvTransformXRange"),
  uvTransformY: document.getElementById("uvTransformY"),
  uvTransformYRange: document.getElementById("uvTransformYRange"),
  uvTransformRotation: document.getElementById("uvTransformRotation"),
  uvTransformRotationRange: document.getElementById("uvTransformRotationRange"),
  uvTransformScaleX: document.getElementById("uvTransformScaleX"),
  uvTransformScaleXRange: document.getElementById("uvTransformScaleXRange"),
  uvTransformScaleY: document.getElementById("uvTransformScaleY"),
  uvTransformScaleYRange: document.getElementById("uvTransformScaleYRange"),
  uvTransformScaleLink: document.getElementById("uvTransformScaleLink"),
  uvTransformWrap: document.getElementById("uvTransformWrap"),
  copyFacePropertiesBtn: document.getElementById("copyFacePropertiesBtn"),
  pasteFacePropertiesBtn: document.getElementById("pasteFacePropertiesBtn"),
  resetUvTransformBtn: document.getElementById("resetUvTransformBtn"),
  removeFaceGroupUvBtn: document.getElementById("removeFaceGroupUvBtn"),
  orientUvToViewBtn: document.getElementById("orientUvToViewBtn"),
  resetUvAngleBtn: document.getElementById("resetUvAngleBtn"),
  faceColor: document.getElementById("faceColor"),
  averageFaceColorBtn: document.getElementById("averageFaceColorBtn"),
  clearFaceColorBtn: document.getElementById("clearFaceColorBtn"),
  importBitmapShelf: document.getElementById("importBitmapShelf"),
  bitmapShelfSelector: document.getElementById("bitmapShelfSelector"),
  bitmapAssetGrid: document.getElementById("bitmapAssetGrid"),
  currentBitmapAssetGrid: document.getElementById("currentBitmapAssetGrid"),
  localBitmapAssetGrid: document.getElementById("localBitmapAssetGrid"),
  replaceAssetInput: document.getElementById("replaceAssetInput"),
  selectedBitmapReadout: document.getElementById("selectedBitmapReadout"),
  assetShelfKind: document.getElementById("assetShelfKind"),
  assetShelfModel: document.getElementById("assetShelfModel"),
  assetShelfSearch: document.getElementById("assetShelfSearch"),
  applyShelfTopBtn: document.getElementById("applyShelfTopBtn"),
  applyShelfBottomBtn: document.getElementById("applyShelfBottomBtn"),
  applyShelfBackBtn: document.getElementById("applyShelfBackBtn"),
  applyShelfFaceBtn: document.getElementById("applyShelfFaceBtn"),
  addShelfDecalBtn: document.getElementById("addShelfDecalBtn"),
  faceDecalSelector: document.getElementById("faceDecalSelector"),
  faceDecalX: document.getElementById("faceDecalX"),
  faceDecalY: document.getElementById("faceDecalY"),
  faceDecalScale: document.getElementById("faceDecalScale"),
  faceDecalAngle: document.getElementById("faceDecalAngle"),
  faceDecalAlpha: document.getElementById("faceDecalAlpha"),
  removeFaceDecalBtn: document.getElementById("removeFaceDecalBtn"),
  clearFaceDecalsBtn: document.getElementById("clearFaceDecalsBtn"),
  clearAllFaceDecalsBtn: document.getElementById("clearAllFaceDecalsBtn"),
  clearBitmapShelfBtn: document.getElementById("clearBitmapShelfBtn"),
  importTopSkin: document.getElementById("importTopSkin"),
  importBottomSkin: document.getElementById("importBottomSkin"),
  importBackSkin: document.getElementById("importBackSkin"),
  importFaceSkin: document.getElementById("importFaceSkin"),
  reloadSkinBitmapsBtn: document.getElementById("reloadSkinBitmapsBtn"),
  clearImportedSkinsBtn: document.getElementById("clearImportedSkinsBtn"),
  clearFaceSkinBtn: document.getElementById("clearFaceSkinBtn"),
  clearAllFaceUvBtn: document.getElementById("clearAllFaceUvBtn"),
  clearFaceGroupBtn: document.getElementById("clearFaceGroupBtn"),
  surfaceInsertMenu: document.getElementById("surfaceInsertMenu"),
  closeSurfaceInsertMenuBtn: document.getElementById("closeSurfaceInsertMenuBtn"),
  surfaceInsertLinkSize: document.getElementById("surfaceInsertLinkSize"),
  addSurfacePolygonBtn: document.getElementById("addSurfacePolygonBtn"),
  confirmSurfaceInsertBtn: document.getElementById("confirmSurfaceInsertBtn"),
  faceExtrudeMenu: document.getElementById("faceExtrudeMenu"),
  closeFaceExtrudeMenuBtn: document.getElementById("closeFaceExtrudeMenuBtn"),
  addFaceExtrudeBtn: document.getElementById("addFaceExtrudeBtn"),
  addFacePointExtrudeBtn: document.getElementById("addFacePointExtrudeBtn"),
  extrudeEdgeLoopBtn: document.getElementById("extrudeEdgeLoopBtn"),
  confirmFaceExtrudeBtn: document.getElementById("confirmFaceExtrudeBtn"),
  faceExtrudeDeleteSource: document.getElementById("faceExtrudeDeleteSource"),
  clearTopSkinBtn: document.getElementById("clearTopSkinBtn"),
  clearBottomSkinBtn: document.getElementById("clearBottomSkinBtn"),
  clearBackSkinBtn: document.getElementById("clearBackSkinBtn"),
  localServerReadout: document.getElementById("localServerReadout"),
  assetShelfCategory: document.getElementById("assetShelfCategory"),
  refreshAssetShelfBtn: document.getElementById("refreshAssetShelfBtn"),
  loadCurrentShipAssetsBtn: document.getElementById("loadCurrentShipAssetsBtn"),
  selectedAssetCard: document.getElementById("selectedAssetCard"),
  selectedAssetThumb: document.getElementById("selectedAssetThumb"),
  openUvPropertiesBtn: document.getElementById("openUvPropertiesBtn"),
  uvPropertiesModal: document.getElementById("uvPropertiesModal"),
  uvPropertiesReadout: document.getElementById("uvPropertiesReadout"),
  closeUvPropertiesBtn: document.getElementById("closeUvPropertiesBtn"),
  openBenchmarkBrowserBtn: document.getElementById("openBenchmarkBrowserBtn"),
  browseModelsBtn: document.getElementById("browseModelsBtn"),
  profileSideCount: document.getElementById("profileSideCount"),
  profileRotationDeg: document.getElementById("profileRotationDeg"),
  profileConeMode: document.getElementById("profileConeMode"),
  modelBrowserModal: document.getElementById("modelBrowserModal"),
  modelBrowserGrid: document.getElementById("modelBrowserGrid"),
  modelBrowserTitle: document.getElementById("modelBrowserTitle"),
  modelBrowserSectionTitle: document.getElementById("modelBrowserSectionTitle"),
  modelBrowserReadout: document.getElementById("modelBrowserReadout"),
  modelBrowserProfileSides: document.getElementById("modelBrowserProfileSides"),
  modelBrowserProfileRotation: document.getElementById("modelBrowserProfileRotation"),
  modelBrowserProfileCone: document.getElementById("modelBrowserProfileCone"),
  modelBrowserObjectActions: document.getElementById("modelBrowserObjectActions"),
  modelBrowserBenchmarkActions: document.getElementById("modelBrowserBenchmarkActions"),
  modelBrowserObjectsViewBtn: document.getElementById("modelBrowserObjectsViewBtn"),
  modelBrowserBenchmarkViewBtn: document.getElementById("modelBrowserBenchmarkViewBtn"),
  modelBrowserNewProfileBtn: document.getElementById("modelBrowserNewProfileBtn"),
  modelBrowserBenchmarkBtn: document.getElementById("modelBrowserBenchmarkBtn"),
  closeModelBrowserBtn: document.getElementById("closeModelBrowserBtn"),
  openAssetLibraryPaintBtn: document.getElementById("openAssetLibraryPaintBtn"),
  closeAssetLibraryBtn: document.getElementById("closeAssetLibraryBtn"),
  assetLibraryModal: document.getElementById("assetLibraryModal"),
  writeSummaryModal: document.getElementById("writeSummaryModal"),
  writeSummaryTitle: document.getElementById("writeSummaryTitle"),
  writeSummaryBody: document.getElementById("writeSummaryBody"),
  confirmWriteSummaryBtn: document.getElementById("confirmWriteSummaryBtn"),
  cancelWriteSummaryBtn: document.getElementById("cancelWriteSummaryBtn"),
  buildCompleteModal: document.getElementById("buildCompleteModal"),
  buildCompleteMessage: document.getElementById("buildCompleteMessage"),
  closeBuildCompleteBtn: document.getElementById("closeBuildCompleteBtn"),
  testBuildDevHtmlBtn: document.getElementById("testBuildDevHtmlBtn"),
  saveModelTopBtn: document.getElementById("saveModelTopBtn"),
  rebuildAssetsBtn: document.getElementById("rebuildAssetsBtn"),
  rebuildGameTopBtn: document.getElementById("rebuildGameTopBtn"),
  uploadTopSkinBtn: document.getElementById("uploadTopSkinBtn"),
  uploadBottomSkinBtn: document.getElementById("uploadBottomSkinBtn"),
  uploadBackSkinBtn: document.getElementById("uploadBackSkinBtn"),
  uploadFaceSkinBtn: document.getElementById("uploadFaceSkinBtn"),
  templateFaceSide: document.getElementById("templateFaceSide"),
  downloadTopTemplateBtn: document.getElementById("downloadTopTemplateBtn"),
  downloadBottomTemplateBtn: document.getElementById("downloadBottomTemplateBtn"),
  downloadBackTemplateBtn: document.getElementById("downloadBackTemplateBtn"),
  downloadFaceTemplateBtn: document.getElementById("downloadFaceTemplateBtn")
};

const SELECTABLE_TYPES = ["vertex", "face", "edge", "detail", "uv", "group"];
const BUILDER_PRELOAD_MIN_MS = 850;
const BUILDER_PRELOAD_TIMEOUT_MS = 2800;
const VIEW_FIT_MARGIN = 0.738;
const VIEW_FIT_PERSPECTIVE_MARGIN = 0.62;
const VIEW_CUBE_BUTTON_STEP = Math.PI / 4;
const VIEW_ZOOM_MIN = 0.04;
const VIEW_ZOOM_MAX = 240;
const GAME_PREVIEW_SCALE_MIN = 0.05;
const GAME_PREVIEW_PERSPECTIVE_SCALE = 0.84;
const GAME_PREVIEW_PERSPECTIVE_SCALE_MAX = 24;
const GAME_PREVIEW_WARMUP_RETRY_MAX = 12;
const SELECTION_EDGE_PICK_RADIUS = 28;
const MAIN_VIEW_DRAG_ROTATE_THRESHOLD = 4;
const MIRROR_AFFECTED_COLOR = "#ff8a3d";
const MIRROR_AFFECTED_FILL = "rgba(255,138,61,.13)";
const DEFAULT_WINDOW_GLINT_DARK = "#02080a";
const DEFAULT_WINDOW_GLINT_BRIGHT = "#fffff8";
const EDIT_HISTORY_MAX = 120;
const SAFARI_FULLSCREEN_KEY_GUARD = typeof navigator !== "undefined"
  && /^((?!chrome|android).)*safari/i.test(navigator.userAgent || "");

const state = {
  mode: "vertex",
  axis: "x",
  nextId: 1,
  verts: [],
  faces: [],
  edges: [],
  details: [],
  skinImages: emptySkinBundle(),
  faceSkinImages: {},
  faceSkinUrls: {},
  faceSkinSources: {},
  decalImages: {},
  bitmapShelf: [],
  toolServer: { available: false, skins: [], version: 0 },
  selectedBitmapShelfId: "",
  sideSkinAngle: 0,
  assetVersion: Date.now(),
  previewSkinVersion: Date.now(),
  gamePreviewInfo: null,
  gamePreviewProjection: null,
  gamePreviewScaleAnchor: null,
  gamePreviewDetailProjectionIndexByStateIndex: new Map(),
  faceDecalUiKey: "",
  sourceModelId: "",
  savedModelSnapshot: "",
  savedModelSnapshotId: "",
  editHistory: {
    undo: [],
    redo: [],
    lastSnapshot: "",
    initialized: false,
    restoring: false,
    continuousBaseSnapshot: "",
    continuousRecorded: false
  },
  modelBrowserBenchResults: new Map(),
  modelBrowserBenchmarkRunning: false,
  modelBrowserBenchmarkLoading: false,
  modelBrowserBenchSavedAt: "",
  modelBrowserBenchSourceModels: {},
  modelBrowserStaleModelIds: new Set(),
  modelBrowserView: "objects",
  selected: null,
  selectionFilters: { vertex: true, face: true, edge: true, detail: true, uv: true, group: true },
  selectionPickCandidates: [],
  selectionPickHover: null,
  selectionPickHoverClearTimer: null,
  selectionPickOptions: {},
  selectedFaceIds: new Set(),
  facePropertyClipboard: null,
  selectedEdgeIds: new Set(),
  selectedDetailIds: new Set(),
  pick: [],
  faceSplitPick: null,
  surfaceInsertShape: "polygon",
  surfaceInsertPreview: false,
  surfaceInsertConfig: null,
  faceExtrudePreview: false,
  faceExtrudeConfig: null,
  view: { rx: STANDARD_VIEW.rx, ry: STANDARD_VIEW.ry, zoom: 2.9, panX: 0, panY: 0, orthographic: false },
  viewCubeDrag: null,
  viewCubeSuppressClick: false,
  activeViewCubeCornerKey: "",
  viewTweenFrame: 0,
  openModelBrowserAfterPreload: false,
  builderPreload: {
    visible: true,
    generation: 0,
    startedAt: performance.now(),
    startup: true,
    userReady: false,
    library: false,
    textures: true,
    rendered: false,
    rendererResult: false,
    timeout: false,
    hideTimer: 0,
    timeoutTimer: 0
  },
  drag: null
};

const TEMPLATE_SIZE = 400;
const TEMPLATE_MAX_SIZE = 600;
const BITMAP_FACE_SIDES = new Set(["top", "bottom", "back"]);
const SPIN_PREVIEW_STORAGE_KEY = "ultraEliteSpinPreviewPayload";
const SPIN_PREVIEW_CHANNEL = "ultra-elite-builder-spin-preview";
const DEFAULT_PREVIEW_RENDER_MODE = "gameOverlay";
let gamePreviewTimer = 0;
let gamePreviewViewFrame = 0;
let gamePreviewLastKey = "";
let gamePreviewSentBlueprintKey = "";
let gamePreviewConfirmedBlueprintKey = "";
let gamePreviewSentSkinVersion = 0;
let gamePreviewRetryCount = 0;
let builderViewportRefreshTimer = 0;
let rendererBenchmarkRunning = false;
let writeSummaryResolver = null;
const previewImageDataUrlCache = new WeakMap();

function vec(x = 0, y = 0, z = 0) { return { x, y, z }; }
function add(a, b) { return vec(a.x + b.x, a.y + b.y, a.z + b.z); }
function sub(a, b) { return vec(a.x - b.x, a.y - b.y, a.z - b.z); }
function mul(a, s) { return vec(a.x * s, a.y * s, a.z * s); }
function dot(a, b) { return a.x * b.x + a.y * b.y + a.z * b.z; }
function cross(a, b) {
  return vec(a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x);
}
function len(a) { return Math.hypot(a.x, a.y, a.z); }
function norm(a) {
  const l = len(a) || 1;
  return vec(a.x / l, a.y / l, a.z / l);
}
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function round(v, places = 2) {
  const m = 10 ** places;
  return Math.round(v * m) / m;
}
function toArray(v) { return [round(v.x), round(v.y), round(v.z)]; }
function validBitmapFaceSide(value) {
  return BITMAP_FACE_SIDES.has(value) ? value : "";
}

function cleanBitmapWrap(value) {
  return value === "repeat" || value === "mirror" ? value : "clip";
}

function cleanBitmapKey(value, fallback = "") {
  const clean = String(value || "").trim().replace(/[^a-zA-Z0-9_-]+/g, "_").replace(/^_+|_+$/g, "");
  return clean || fallback;
}

function normalizeFaceDecal(decal) {
  const key = cleanBitmapKey(decal?.key);
  if (!key) return null;
  return {
    key,
    x: round(clamp(Number.isFinite(Number(decal?.x)) ? Number(decal.x) : .5, 0, 1), 3),
    y: round(clamp(Number.isFinite(Number(decal?.y)) ? Number(decal.y) : .5, 0, 1), 3),
    scale: round(clamp(Number.isFinite(Number(decal?.scale)) ? Number(decal.scale) : .35, .02, 2), 3),
    angle: normalizeBitmapAngle(decal?.angle),
    alpha: round(clamp(Number.isFinite(Number(decal?.alpha)) ? Number(decal.alpha) : .92, 0, 1), 3)
  };
}

function cleanFaceDecals(decals) {
  return Array.isArray(decals) ? decals.map(normalizeFaceDecal).filter(Boolean) : [];
}

function cleanFaceBitmapUv(face) {
  const verts = Array.isArray(face) ? face : face?.verts || [];
  if (!Array.isArray(face?.bitmapUv) || verts.length < 3) return null;
  const uv = face.bitmapUv
    .map((p) => Array.isArray(p) ? [round(Number(p[0]) || 0, 3), round(Number(p[1]) || 0, 3)] : null)
    .filter(Boolean);
  return uv.length === verts.length ? uv : null;
}

function cleanFaceBitmapUvTemplate(face) {
  const verts = Array.isArray(face) ? face : face?.verts || [];
  if (!Array.isArray(face?.bitmapUvTemplate) || verts.length < 3) return null;
  const uv = face.bitmapUvTemplate
    .map((p) => Array.isArray(p) ? [round(Number(p[0]) || 0, 3), round(Number(p[1]) || 0, 3)] : null)
    .filter(Boolean);
  return uv.length === verts.length ? uv : null;
}

function cleanBitmapUvTransform(value = {}) {
  const scaleX = Number(value?.scaleX ?? value?.scale);
  const scaleY = Number(value?.scaleY ?? value?.scale);
  return {
    x: round(Number(value?.x) || 0, 3),
    y: round(Number(value?.y) || 0, 3),
    rotation: normalizeBitmapAngle(value?.rotation),
    scaleX: round(Number.isFinite(scaleX) && scaleX > 0 ? clamp(scaleX, 0.05, 20) : 1, 3),
    scaleY: round(Number.isFinite(scaleY) && scaleY > 0 ? clamp(scaleY, 0.05, 20) : 1, 3)
  };
}

function bitmapUvTransformIsDefault(transform) {
  const clean = cleanBitmapUvTransform(transform);
  return !clean.x && !clean.y && !clean.rotation && Math.abs(clean.scaleX - 1) < .0001 && Math.abs(clean.scaleY - 1) < .0001;
}

function mirroredFaceAngle(angle) {
  return normalizeBitmapAngle(-normalizeBitmapAngle(angle));
}

function mirroredFaceDecal(decal) {
  const clean = normalizeFaceDecal(decal);
  if (!clean) return null;
  return {
    ...clean,
    x: round(1 - clean.x, 3),
    angle: mirroredFaceAngle(clean.angle)
  };
}

function sourceVertexId(vertex, index) {
  const id = Array.isArray(vertex) ? index : Number(vertex?.id);
  return Number.isFinite(id) ? id : index;
}

function sourceVertex(vertex, index) {
  const id = sourceVertexId(vertex, index);
  if (Array.isArray(vertex)) {
    return {
      id,
      x: Number(vertex[0]) || 0,
      y: Number(vertex[1]) || 0,
      z: Number(vertex[2]) || 0,
      mirrorId: null,
      center: false
    };
  }
  return {
    id,
    x: Number(vertex?.x) || 0,
    y: Number(vertex?.y) || 0,
    z: Number(vertex?.z) || 0,
    mirrorId: vertex?.mirrorId ?? null,
    center: !!vertex?.center
  };
}

function sourceFace(face, index) {
  const id = Number(face?.id);
  const bitmapSide = validBitmapFaceSide(face?.bitmapSide);
  const bitmapFaceKey = cleanBitmapKey(face?.bitmapFaceKey);
  const bitmapAngle = normalizeBitmapAngle(face?.bitmapAngle);
  const bitmapMirrorX = !!face?.bitmapMirrorX;
  const bitmapWrap = cleanBitmapWrap(face?.bitmapWrap);
  const bitmapUv = cleanFaceBitmapUv(face);
  const bitmapUvTemplate = cleanFaceBitmapUvTemplate(face);
  const bitmapUvTransform = cleanBitmapUvTransform(face?.bitmapUvTransform);
  const bitmapBaseW = Math.max(0, Math.round(Number(face?.bitmapBaseW) || 0));
  const bitmapBaseH = Math.max(0, Math.round(Number(face?.bitmapBaseH) || 0));
  const bitmapDecals = cleanFaceDecals(face?.bitmapDecals);
  const faceColor = optionalHexColor(face?.faceColor || face?.color);
  return {
    id: Number.isFinite(id) ? id : 1000 + index,
    verts: (Array.isArray(face) ? face : face?.verts || []).map(Number),
    mirrored: !!face?.mirrored,
    ...(faceColor ? { faceColor } : {}),
    ...(bitmapSide ? { bitmapSide } : {}),
    ...(bitmapFaceKey ? { bitmapFaceKey } : {}),
    ...(bitmapUv?.length >= 3 ? { bitmapUv } : {}),
    ...(bitmapUvTemplate?.length >= 3 ? { bitmapUvTemplate } : {}),
    ...(!bitmapUvTransformIsDefault(bitmapUvTransform) ? { bitmapUvTransform } : {}),
    ...(bitmapBaseW && bitmapBaseH ? { bitmapBaseW, bitmapBaseH } : {}),
    ...(bitmapAngle ? { bitmapAngle } : {}),
    ...(bitmapMirrorX ? { bitmapMirrorX } : {}),
    ...(bitmapWrap !== "clip" ? { bitmapWrap } : {}),
    ...(bitmapDecals.length ? { bitmapDecals } : {})
  };
}

function sourceEdge(edge, index) {
  const id = Number(edge?.id);
  const a = Array.isArray(edge) ? edge[0] : edge?.a;
  const b = Array.isArray(edge) ? edge[1] : edge?.b;
  return {
    id: Number.isFinite(id) ? id : 2000 + index,
    a: Number(a),
    b: Number(b),
    kind: edge?.kind || "edge",
    mirrored: !!edge?.mirrored
  };
}

function setStatus(text) {
  if (els.status) els.status.textContent = text;
  if (els.topStatus) els.topStatus.textContent = text;
}

function setBuilderPreloadText(text) {
  if (els.builderPreloadText && text) els.builderPreloadText.textContent = text;
}

function currentFullscreenElement() {
  return document.fullscreenElement || document.webkitFullscreenElement || null;
}

function requestBuilderFullscreen(pointerGesture = false, options = {}) {
  if (SAFARI_FULLSCREEN_KEY_GUARD && !pointerGesture) return false;
  if (currentFullscreenElement() && !options.refresh) return true;
  const root = document.documentElement;
  try {
    const request = root.requestFullscreen
      ? root.requestFullscreen({ navigationUI: "hide" })
      : root.webkitRequestFullscreen
        ? root.webkitRequestFullscreen()
        : null;
    if (!request) {
      if (options.status !== false) setStatus("FULLSCREEN NOT AVAILABLE IN THIS BROWSER.");
      return false;
    }
    if (request.catch) {
      request.catch(() => {
        if (options.status !== false) setStatus("FULLSCREEN REQUEST CANCELLED.");
      });
    }
    return true;
  } catch (_) {
    if (options.status !== false) setStatus("FULLSCREEN REQUEST CANCELLED.");
    return false;
  }
}

function exitBuilderFullscreen() {
  try {
    if (!currentFullscreenElement()) return Promise.resolve(true);
    const exit = document.exitFullscreen
      ? document.exitFullscreen()
      : document.webkitExitFullscreen
        ? document.webkitExitFullscreen()
        : null;
    if (exit?.then) return exit.then(() => true).catch(() => false);
    return Promise.resolve(!!exit);
  } catch (_) {
    return Promise.resolve(false);
  }
}

async function toggleBuilderFullscreenFromUserGesture(event = null) {
  event?.preventDefault?.();
  event?.stopPropagation?.();
  if (currentFullscreenElement()) {
    const ok = await exitBuilderFullscreen();
    scheduleBuilderViewportRefresh(140, { invalidatePreload: state.builderPreload.visible, message: "Fullscreen changed; confirming renderer preview..." });
    setStatus(ok ? "FULLSCREEN EXITED." : "FULLSCREEN EXIT FAILED.");
    return ok;
  }
  const ok = requestBuilderFullscreen(true, { status: false });
  scheduleBuilderViewportRefresh(140, { invalidatePreload: state.builderPreload.visible, message: "Fullscreen changed; confirming renderer preview..." });
  setStatus(ok ? "FULLSCREEN REQUESTED." : "FULLSCREEN NOT AVAILABLE IN THIS BROWSER.");
  return ok;
}

function hideBuilderPreloadSplash(generation = state.builderPreload.generation) {
  const preload = state.builderPreload;
  if (!preload.visible || generation !== preload.generation) return;
  clearTimeout(preload.hideTimer);
  clearTimeout(preload.timeoutTimer);
  preload.hideTimer = 0;
  preload.timeoutTimer = 0;
  preload.visible = false;
  els.builderPreloadSplash?.classList.add("is-hidden");
  els.builderPreloadSplash?.setAttribute("aria-hidden", "true");
  if (state.openModelBrowserAfterPreload) {
    state.openModelBrowserAfterPreload = false;
    setTimeout(() => openModelBrowser(), 0);
  }
}

function checkBuilderPreloadReady() {
  const preload = state.builderPreload;
  if (!preload.visible) return;
  const rendererReady = !gameRendererPreviewMode() || preload.rendererResult || (!state.faces.length && preload.timeout);
  if (!preload.library || !preload.textures || !preload.rendered || !rendererReady) return;
  if (preload.startup && !preload.userReady) {
    setBuilderPreloadText("Ready. Press Space to continue.");
    return;
  }
  const generation = preload.generation;
  const elapsed = performance.now() - preload.startedAt;
  const delay = Math.max(0, BUILDER_PRELOAD_MIN_MS - elapsed);
  clearTimeout(preload.hideTimer);
  preload.hideTimer = setTimeout(() => hideBuilderPreloadSplash(generation), delay);
}

function armBuilderPreloadTimeout(message = "Renderer still warming; opening builder.") {
  const preload = state.builderPreload;
  clearTimeout(preload.timeoutTimer);
  const generation = preload.generation;
  preload.timeoutTimer = setTimeout(() => {
    if (generation !== state.builderPreload.generation || !state.builderPreload.visible) return;
    markBuilderPreloadStep("timeout", message);
    if (state.faces.length && !state.builderPreload.rendererResult) {
      gamePreviewLastKey = "";
      scheduleGamePreviewSync(0, true);
      armBuilderPreloadTimeout("Renderer still warming; retrying model preview...");
    }
  }, BUILDER_PRELOAD_TIMEOUT_MS);
}

function markBuilderPreloadStep(step, message = "") {
  const preload = state.builderPreload;
  if (!preload.visible) return;
  preload[step] = true;
  setBuilderPreloadText(message);
  checkBuilderPreloadReady();
}

function invalidateBuilderPreloadRenderer(message = "") {
  const preload = state.builderPreload;
  if (!preload.visible || !gameRendererPreviewMode()) return;
  clearTimeout(preload.hideTimer);
  preload.hideTimer = 0;
  preload.rendererResult = false;
  preload.timeout = false;
  if (message) setBuilderPreloadText(message);
  armBuilderPreloadTimeout();
}

function scheduleBuilderViewportRefresh(delay = 90, options = {}) {
  clearTimeout(builderViewportRefreshTimer);
  if (options.invalidatePreload) {
    invalidateBuilderPreloadRenderer(options.message || "Renderer viewport changed; warming renderer...");
  }
  builderViewportRefreshTimer = setTimeout(() => {
    builderViewportRefreshTimer = 0;
    if (options.fit) fitView();
    gamePreviewLastKey = "";
    renderAll();
    scheduleGamePreviewSync(0, true);
  }, Math.max(0, delay));
}

function showBuilderPreloadSplash(message = "Preparing builder...", options = {}) {
  const preload = state.builderPreload;
  clearTimeout(preload.hideTimer);
  clearTimeout(preload.timeoutTimer);
  preload.visible = true;
  preload.generation += 1;
  preload.startedAt = performance.now();
  preload.startup = !!options.startup;
  preload.userReady = !preload.startup;
  state.openModelBrowserAfterPreload = !!options.openModelBrowserOnHide;
  preload.library = !!options.libraryReady;
  preload.textures = options.texturesReady !== false;
  preload.rendered = false;
  preload.rendererResult = false;
  preload.timeout = false;
  preload.hideTimer = 0;
  armBuilderPreloadTimeout();
  els.builderPreloadSplash?.classList.remove("is-hidden");
  els.builderPreloadSplash?.removeAttribute("aria-hidden");
  els.builderPreloadSplash?.classList.toggle("is-startup", preload.startup);
  setBuilderPreloadText(message);
}

function confirmWrite(message) {
  return window.confirm(`${message}\n\nThis writes to the local project files.`);
}

function closeWriteSummaryModal(result = false) {
  if (!els.writeSummaryModal) return;
  els.writeSummaryModal.classList.add("is-hidden");
  if (writeSummaryResolver) {
    const resolve = writeSummaryResolver;
    writeSummaryResolver = null;
    resolve(result);
  }
}

function writeSummaryGroup(title, lines = []) {
  const section = document.createElement("section");
  section.className = "write-summary-group";
  const heading = document.createElement("h3");
  heading.textContent = title;
  section.append(heading);
  const list = document.createElement("ul");
  for (const line of lines.filter(Boolean)) {
    const item = document.createElement("li");
    item.textContent = line;
    list.append(item);
  }
  if (!list.children.length) {
    const item = document.createElement("li");
    item.textContent = "No changes in this group.";
    list.append(item);
  }
  section.append(list);
  return section;
}

function confirmProjectWriteSummary({ title = "Confirm Write", intro = "", confirmLabel = "Build Assets", groups = [] } = {}) {
  if (!els.writeSummaryModal || !els.writeSummaryBody) {
    return Promise.resolve(confirmWrite(intro || title));
  }
  if (writeSummaryResolver) closeWriteSummaryModal(false);
  if (els.writeSummaryTitle) els.writeSummaryTitle.textContent = title;
  if (els.confirmWriteSummaryBtn) els.confirmWriteSummaryBtn.textContent = confirmLabel;
  els.writeSummaryBody.replaceChildren();
  if (intro) {
    const summary = document.createElement("p");
    summary.className = "write-summary-intro";
    summary.textContent = intro;
    els.writeSummaryBody.append(summary);
  }
  for (const group of groups) {
    els.writeSummaryBody.append(writeSummaryGroup(group.title, group.lines));
  }
  const warning = document.createElement("p");
  warning.className = "write-summary-warning";
  warning.textContent = "This writes to the local project files.";
  els.writeSummaryBody.append(warning);
  els.writeSummaryModal.classList.remove("is-hidden");
  els.confirmWriteSummaryBtn?.focus();
  return new Promise((resolve) => {
    writeSummaryResolver = resolve;
  });
}

function localDevHtmlTestUrl() {
  if (window.location.protocol === "http:" || window.location.protocol === "https:") {
    return `${window.location.origin}/dev.html`;
  }
  return new URL("../../dev.html", window.location.href).href;
}

function showBuildCompleteModal(message = "The local dev.html test build is ready.") {
  if (!els.buildCompleteModal) return;
  if (els.buildCompleteMessage) els.buildCompleteMessage.textContent = message;
  els.buildCompleteModal.classList.remove("is-hidden");
  els.testBuildDevHtmlBtn?.focus();
}

function closeBuildCompleteModal() {
  els.buildCompleteModal?.classList.add("is-hidden");
}

function openLocalDevHtmlTest() {
  const url = localDevHtmlTestUrl();
  window.open(url, "_blank", "noopener");
  closeBuildCompleteModal();
}

function setLocalServerReadout(text, ok = state.toolServer.available) {
  if (!els.localServerReadout) return;
  els.localServerReadout.textContent = text;
  els.localServerReadout.dataset.available = ok ? "true" : "false";
}

async function apiJson(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      "content-type": "application/json",
      ...(options.headers || {})
    }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.ok === false) throw new Error(data.error || `HTTP ${response.status}`);
  return data;
}

function cacheBust(url) {
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}v=${encodeURIComponent(state.assetVersion || Date.now())}`;
}

async function checkLocalToolServer() {
  try {
    const data = await apiJson("/api/status", { method: "GET" });
    state.toolServer.available = true;
    state.toolServer.version = data.version || Date.now();
    state.assetVersion = state.toolServer.version;
    setLocalServerReadout("LOCAL SERVER READY.", true);
    return true;
  } catch {
    state.toolServer.available = false;
    setLocalServerReadout("STATIC MODE: START npm run dev:tools FOR DIRECT SAVE/UPLOAD.", false);
    return false;
  }
}

async function requireToolServer() {
  if (state.toolServer.available || await checkLocalToolServer()) return true;
  setStatus("LOCAL TOOL SERVER NOT AVAILABLE. RUN npm run dev:tools.");
  return false;
}

function vertexById(id) {
  return state.verts.find((v) => v.id === id) || null;
}

function faceById(id) {
  return state.faces.find((f) => f.id === id) || null;
}

function selectedFace() {
  return ["face", "uv", "group"].includes(state.selected?.type) ? faceById(state.selected.id) : null;
}

function selectedFaceGroup() {
  return [...state.selectedFaceIds].map(faceById).filter(Boolean);
}

function selectedFacePropertyTargets() {
  const grouped = selectedFaceGroup();
  if (grouped.length) return grouped;
  const face = selectedFace();
  return face ? [face] : [];
}

function uniqueVertexIds(ids) {
  const seen = new Set();
  return ids
    .map(Number)
    .filter((id) => Number.isFinite(id) && vertexById(id) && !seen.has(id) && seen.add(id));
}

function facesUsingVertex(vertexId) {
  return state.faces.filter((face) => face.verts.includes(vertexId));
}

function setVertexGroup(vertexIds, statusText = "") {
  const ids = uniqueVertexIds(vertexIds);
  if (!ids.length) {
    setStatus("NO VERTICES FOUND FOR GROUP.");
    return false;
  }
  cancelSurfaceInsertPreview({ redraw: false });
  cancelFaceSplitPickMode();
  state.mode = "vertex";
  state.pick = ids;
  state.selected = { type: "vertex", id: ids.at(-1) };
  state.selectedFaceIds.clear();
  state.selectedEdgeIds.clear();
  state.selectedDetailIds.clear();
  setToolTab("edit", { redraw: false });
  setStatus(statusText || `VERTEX GROUP SELECTED (${ids.length} VERTICES).`);
  syncControlsWindowForSelection({ render: false });
  renderAll();
  return true;
}

function setVertexGroupFromFace(face) {
  if (!face) return false;
  return setVertexGroup(face.verts, `FACE #${face.id} VERTICES SELECTED AS VERTEX GROUP (${face.verts.length}).`);
}

function selectAdjacentFacesForVertex(vertex) {
  if (!vertex) return false;
  const faces = facesUsingVertex(vertex.id);
  if (!faces.length) {
    setStatus(`NO FACES USE VERTEX #${vertex.id}.`);
    return false;
  }
  cancelSurfaceInsertPreview({ redraw: false });
  cancelFaceSplitPickMode();
  state.mode = "face";
  state.pick = [];
  state.selectedEdgeIds.clear();
  state.selectedDetailIds.clear();
  state.selectedFaceIds = new Set(faces.map((face) => face.id));
  state.selected = { type: "face", id: faces.at(-1).id };
  setToolTab("edit", { redraw: false });
  setStatus(`ADJACENT FACES SELECTED FROM VERTEX #${vertex.id} (${faces.length}).`);
  syncControlsWindowForSelection({ render: false });
  renderAll();
  return true;
}

function clearVertexGroup(statusText = "VERTEX GROUP CLEARED.") {
  const hadGroup = state.pick.length > 0;
  cancelFaceSplitPickMode();
  state.pick = [];
  if (state.selected?.type === "vertex" || state.selected?.type === "vertexGroup") state.selected = null;
  if (hadGroup) {
    setStatus(statusText);
    renderAll();
  }
}

function createFaceFromVertexGroup() {
  if (state.pick.length < 3) {
    setStatus("PICK AT LEAST THREE VERTICES.");
    return false;
  }
  addFaceMirrored(state.pick);
  state.pick = [];
  setStatus("FACE ADDED FROM VERTEX GROUP.");
  renderAll();
  return true;
}

function createLineFromVertexGroup(kind = "edge") {
  if (state.pick.length < 2) {
    setStatus("PICK TWO VERTICES.");
    return false;
  }
  addEdgeMirrored(state.pick[0], state.pick[1], kind);
  state.pick = [];
  setStatus(`${kind === "stick" ? "STICK" : "EDGE"} ADDED FROM VERTEX GROUP.`);
  renderAll();
  return true;
}

function createPointPairFromAction() {
  const v = addPointPair(60, 0, 0);
  selectVertex(v.id);
  setStatus("POINT PAIR ADDED.");
  return true;
}

function createCenterPointFromAction() {
  const v = addCenterPoint(0, 0);
  selectVertex(v.id);
  setStatus("CENTRE POINT ADDED.");
  return true;
}

function uvPropertyTargets() {
  return uniqueFaceList(selectedFacePropertyTargets());
}

function uvPropertyTargetLabel(targets = uvPropertyTargets()) {
  if (!targets.length) return "No Face Selected";
  return targets.length === 1 ? `Face #${targets[0].id}` : `Projected Group (${targets.length} faces)`;
}

function commonUvTransform(targets) {
  const faces = uniqueFaceList(targets || []);
  if (!faces.length) return { transform: cleanBitmapUvTransform(), mixed: false };
  const first = cleanBitmapUvTransform(faces[0].bitmapUvTransform);
  const mixed = faces.slice(1).some((face) => {
    const transform = cleanBitmapUvTransform(face.bitmapUvTransform);
    return transform.x !== first.x
      || transform.y !== first.y
      || transform.rotation !== first.rotation
      || transform.scaleX !== first.scaleX
      || transform.scaleY !== first.scaleY;
  });
  return { transform: first, mixed };
}

function faceTextureSourceSize(face) {
  const img = currentSelectedFaceImage(face);
  if (img?.naturalWidth && img?.naturalHeight) {
    return { width: img.naturalWidth, height: img.naturalHeight, loaded: true };
  }
  const baseW = Math.max(0, Math.round(Number(face?.bitmapBaseW) || 0));
  const baseH = Math.max(0, Math.round(Number(face?.bitmapBaseH) || 0));
  return { width: baseW, height: baseH, loaded: false };
}

function faceUvTileStats(face) {
  const wrap = cleanBitmapWrap(face?.bitmapWrap);
  if (wrap === "clip") return null;
  if (!cleanBitmapKey(face?.bitmapFaceKey)) return null;
  const uv = cleanFaceBitmapUv(face);
  if (!uv?.length) return null;
  const source = faceTextureSourceSize(face);
  if (!source.width || !source.height) {
    return { missingSize: true, wrap, faceId: face?.id };
  }
  const tileW = Math.max(1, face?.bitmapMirrorX ? source.width * 2 : source.width);
  const tileH = Math.max(1, source.height);
  const angle = normalizeBitmapAngle(face?.bitmapAngle);
  const points = angle
    ? uv.map(([u, v]) => {
      const p = rotateTemplatePoint({ x: u, y: v }, tileW, tileH, angle);
      return [p.x, p.y];
    })
    : uv;
  const minX = Math.min(...points.map(([u]) => u));
  const maxX = Math.max(...points.map(([u]) => u));
  const minY = Math.min(...points.map(([, v]) => v));
  const maxY = Math.max(...points.map(([, v]) => v));
  const spanX = Math.max(1, Math.floor(maxX / tileW) - Math.floor(minX / tileW) + 1);
  const spanY = Math.max(1, Math.floor(maxY / tileH) - Math.floor(minY / tileH) + 1);
  const pieces = spanX * spanY;
  return {
    wrap,
    faceId: face?.id,
    pieces,
    spanX,
    spanY,
    tileW,
    tileH,
    loaded: source.loaded,
    overLimit: pieces > UV_TILE_RUNTIME_LIMIT
  };
}

function uvTileSummary(targets = uvPropertyTargets()) {
  const stats = uniqueFaceList(targets || []).map(faceUvTileStats).filter(Boolean);
  if (!stats.length) return null;
  const missingSize = stats.filter((stat) => stat.missingSize).length;
  const drawable = stats.filter((stat) => !stat.missingSize);
  const total = drawable.reduce((sum, stat) => sum + stat.pieces, 0);
  const max = drawable.reduce((best, stat) => Math.max(best, stat.pieces), 0);
  const overLimit = drawable.filter((stat) => stat.overLimit).length;
  const danger = drawable.filter((stat) => stat.pieces > UV_TILE_DANGER_COUNT && !stat.overLimit).length;
  const warn = drawable.filter((stat) => stat.pieces > UV_TILE_WARN_COUNT && stat.pieces <= UV_TILE_DANGER_COUNT).length;
  const pendingSize = drawable.filter((stat) => !stat.loaded).length;
  return {
    faces: stats.length,
    drawableFaces: drawable.length,
    total,
    max,
    overLimit,
    danger,
    warn,
    missingSize,
    pendingSize
  };
}

function uvTileSummaryText(targets = uvPropertyTargets()) {
  const summary = uvTileSummary(targets);
  if (!summary) return "";
  if (!summary.drawableFaces) return `WRAP TILES: image size missing on ${summary.missingSize} face${summary.missingSize === 1 ? "" : "s"}`;
  const faceText = summary.drawableFaces === 1 ? `${summary.max}` : `${summary.total} total, max ${summary.max}/face`;
  const warning = summary.overLimit
    ? ` - SKIPS ON ${summary.overLimit} FACE${summary.overLimit === 1 ? "" : "S"}`
    : summary.danger
      ? ` - HEAVY ON ${summary.danger} FACE${summary.danger === 1 ? "" : "S"}`
      : summary.warn
        ? ` - CHECK ${summary.warn} FACE${summary.warn === 1 ? "" : "S"}`
        : "";
  const pending = summary.pendingSize ? " (image size pending)" : "";
  const missing = summary.missingSize ? `; missing size ${summary.missingSize}` : "";
  return `WRAP TILES: ${faceText}${warning}${pending}${missing}`;
}

function faceUvTypeInfo(face) {
  if (!face) {
    return {
      kind: "none",
      label: "No Face Selected",
      detail: "Select a face to inspect UV type.",
      short: "none"
    };
  }
  const uv = cleanFaceBitmapUv(face);
  const key = cleanBitmapKey(face.bitmapFaceKey);
  const side = validBitmapFaceSide(face.bitmapSide);
  const autoSide = autoTemplateSideForFace(face);
  const route = side || `auto/${autoSide}`;
  const decals = cleanFaceDecals(face.bitmapDecals);
  const angle = normalizeBitmapAngle(face.bitmapAngle);
  const mirrorText = face.bitmapMirrorX ? " | half-mirror" : "";
  const angleText = angle ? ` | angle ${angle}` : "";
  if (uv) {
    return {
      kind: "projected",
      label: "Projected UV",
      detail: `${uv.length} points | ${route}${key ? ` | ${key}` : ""}${angleText}${mirrorText}`,
      short: `projected ${route}`
    };
  }
  if (key) {
    return {
      kind: "flat",
      label: "Flat Face UV",
      detail: `${key} | ${route}${angleText}${mirrorText}`,
      short: `flat ${route}`
    };
  }
  if (decals.length) {
    return {
      kind: "flat",
      label: "Flat Decal UV",
      detail: `${decals.length} decal${decals.length === 1 ? "" : "s"} | ${route}${angleText}${mirrorText}`,
      short: `flat decal ${route}`
    };
  }
  if (side) {
    return {
      kind: "side",
      label: "Side Projection",
      detail: `${side} side skin route | no face bitmap`,
      short: `${side} projection`
    };
  }
  return {
    kind: "auto",
    label: "Auto Projection",
    detail: `auto/${autoSide} side route | no face bitmap`,
    short: `auto/${autoSide}`
  };
}

function updateFaceUvTypeReadout() {
  if (!els.faceUvTypeReadout) return;
  const info = faceUvTypeInfo(selectedFace());
  const tileText = uvTileSummaryText(selectedFacePropertyTargets());
  els.faceUvTypeReadout.dataset.uvType = info.kind;
  els.faceUvTypeReadout.textContent = `${info.label}: ${info.detail}${tileText ? ` | ${tileText}` : ""}`;
}

function clearFaceGroup(statusText = "FACE GROUP CLEARED.") {
  const hadGroup = state.selectedFaceIds.size > 0;
  state.selectedFaceIds.clear();
  if (hadGroup) {
    setStatus(statusText);
    renderAll();
  }
}

function detailById(id) {
  return state.details.find((d) => d.id === id) || null;
}

function newId() {
  return state.nextId++;
}

function addVertex(x, y, z, mirrorId = null, center = false) {
  const v = { id: newId(), x, y, z, mirrorId, center };
  state.verts.push(v);
  return v;
}

function addPointPair(x = 60, y = 0, z = 0) {
  if (Math.abs(x) < 1) return addVertex(0, y, z, null, true);
  const a = addVertex(Math.abs(x), y, z);
  const b = addVertex(-Math.abs(x), y, z, a.id);
  a.mirrorId = b.id;
  return a;
}

function addCenterPoint(y = 0, z = 0) {
  return addVertex(0, y, z, null, true);
}

function setVertex(v, x, y, z) {
  if (!v) return;
  if (v.center) {
    v.x = 0;
  } else {
    v.x = x;
  }
  v.y = y;
  v.z = z;
  const m = vertexById(v.mirrorId);
  if (m && mirrorActionsEnabled()) {
    m.x = -v.x;
    m.y = y;
    m.z = z;
  }
}

function mirrorActionsEnabled() {
  return !!els.mirrorNewGeometry.checked;
}

function inferredMirrorVertexId(id) {
  const v = vertexById(id);
  if (!v) return null;
  const explicit = vertexById(v.mirrorId);
  if (explicit) return explicit.id;
  if (Math.abs(v.x) < .001) return v.id;
  let best = null;
  let bestScore = Infinity;
  for (const candidate of state.verts) {
    if (candidate.id === v.id) continue;
    const score =
      Math.abs(candidate.x + v.x) +
      Math.abs(candidate.y - v.y) +
      Math.abs(candidate.z - v.z);
    if (score < bestScore) {
      best = candidate;
      bestScore = score;
    }
  }
  return best && bestScore < .01 ? best.id : null;
}

function mirrorIds(ids) {
  const mirrored = ids.map((id) => inferredMirrorVertexId(id));
  if (mirrored.some((id) => id == null)) return null;
  return mirrored.reverse();
}

function inferMirrorVertexIds() {
  for (const vertex of state.verts) {
    if (vertexById(vertex.mirrorId)) continue;
    const mirrorId = inferredMirrorVertexId(vertex.id);
    if (mirrorId && mirrorId !== vertex.id) vertex.mirrorId = mirrorId;
    else if (mirrorId === vertex.id) {
      vertex.mirrorId = null;
      vertex.center = true;
    }
  }
}

function sameIdSet(a, b) {
  if (a.length !== b.length) return false;
  const aa = [...a].sort((x, y) => x - y).join(",");
  const bb = [...b].sort((x, y) => x - y).join(",");
  return aa === bb;
}

function mirroredFaceOf(face) {
  const mids = mirrorIds(face.verts);
  if (!mids || sameIdSet(mids, face.verts)) return null;
  return state.faces.find((candidate) => candidate.id !== face.id && sameIdSet(candidate.verts, mids)) || null;
}

function mirroredEdgeOf(edge) {
  const ma = vertexById(edge.a)?.mirrorId || edge.a;
  const mb = vertexById(edge.b)?.mirrorId || edge.b;
  if (ma === edge.a && mb === edge.b) return null;
  return state.edges.find((candidate) =>
    candidate.id !== edge.id &&
    candidate.kind === edge.kind &&
    ((candidate.a === ma && candidate.b === mb) || (candidate.a === mb && candidate.b === ma))
  ) || null;
}

function mirroredDetailOf(detail) {
  if (detail.vertexId) {
    const vertex = vertexById(detail.vertexId);
    const mirrorId = vertex?.mirrorId;
    if (!mirrorId || mirrorId === detail.vertexId) return null;
    return state.details.find((candidate) =>
      candidate.id !== detail.id &&
      candidate.type === detail.type &&
      candidate.vertexId === mirrorId
    ) || null;
  }
  if (!detail.faceId) return null;
  const face = faceById(detail.faceId);
  const mirrorFace = face ? mirroredFaceOf(face) : null;
  if (!mirrorFace) return null;
  if (detail.segment?.length === 2) {
    const mirroredSegment = mirrorIds(detail.segment);
    if (mirroredSegment) {
      return state.details.find((candidate) =>
        candidate.id !== detail.id &&
        candidate.faceId === mirrorFace.id &&
        candidate.type === detail.type &&
        candidate.segment?.length === 2 &&
        sameIdSet(candidate.segment, mirroredSegment)
      ) || null;
    }
  }
  return state.details.find((candidate) =>
    candidate.id !== detail.id &&
    candidate.faceId === mirrorFace.id &&
    candidate.type === detail.type
  ) || null;
}

function syncMirroredFace(face, options = {}) {
  const mf = mirroredFaceOf(face);
  const mids = mirrorIds(face.verts);
  if (mf && mids) {
    const previousMirrorKey = cleanBitmapKey(mf.bitmapFaceKey);
    const previousMirrorUv = Array.isArray(mf.bitmapUv) && mf.bitmapUv.length >= 3
      ? mf.bitmapUv.map((p) => [round(Number(p[0]) || 0, 3), round(Number(p[1]) || 0, 3)])
      : null;
    const previousMirrorBaseW = Math.round(Number(mf.bitmapBaseW) || TEMPLATE_SIZE);
    const previousMirrorBaseH = Math.round(Number(mf.bitmapBaseH) || TEMPLATE_SIZE);
    mf.verts = mids;
    const side = validBitmapFaceSide(face.bitmapSide);
    if (side) mf.bitmapSide = side;
    else delete mf.bitmapSide;
    const key = cleanBitmapKey(face.bitmapFaceKey);
    if (key) mf.bitmapFaceKey = key;
    else delete mf.bitmapFaceKey;
    if (Array.isArray(face.bitmapUv) && face.bitmapUv.length >= 3) {
      if (!options.forceBitmapUv && previousMirrorKey === key && previousMirrorUv) {
        mf.bitmapUv = previousMirrorUv;
        mf.bitmapBaseW = previousMirrorBaseW;
        mf.bitmapBaseH = previousMirrorBaseH;
      } else {
        mf.bitmapUv = face.bitmapUv.map((p) => [round(Number(p[0]) || 0, 3), round(Number(p[1]) || 0, 3)]);
        mf.bitmapBaseW = Math.round(Number(face.bitmapBaseW) || TEMPLATE_SIZE);
        mf.bitmapBaseH = Math.round(Number(face.bitmapBaseH) || TEMPLATE_SIZE);
      }
    } else {
      delete mf.bitmapUv;
      delete mf.bitmapBaseW;
      delete mf.bitmapBaseH;
    }
    const template = cleanFaceBitmapUvTemplate(face);
    if (template) mf.bitmapUvTemplate = template.map((p) => [round(Number(p[0]) || 0, 3), round(Number(p[1]) || 0, 3)]);
    else delete mf.bitmapUvTemplate;
    const transform = cleanBitmapUvTransform(face.bitmapUvTransform);
    if (bitmapUvTransformIsDefault(transform)) delete mf.bitmapUvTransform;
    else mf.bitmapUvTransform = transform;
    const angle = mirroredFaceAngle(face.bitmapAngle);
    if (angle) mf.bitmapAngle = angle;
    else delete mf.bitmapAngle;
    if (face.bitmapMirrorX) mf.bitmapMirrorX = true;
    else delete mf.bitmapMirrorX;
    const wrap = cleanBitmapWrap(face.bitmapWrap);
    if (wrap !== "clip") mf.bitmapWrap = wrap;
    else delete mf.bitmapWrap;
    const color = optionalHexColor(face.faceColor);
    if (color) mf.faceColor = color;
    else delete mf.faceColor;
    const decals = cleanFaceDecals(face.bitmapDecals).map(mirroredFaceDecal).filter(Boolean);
    if (decals.length) mf.bitmapDecals = decals.map((decal) => ({ ...decal }));
    else delete mf.bitmapDecals;
  }
  return mf || null;
}

function faceExists(ids) {
  return state.faces.some((f) => sameIdSet(f.verts, ids));
}

function addFace(ids, mirrored = false) {
  const cleaned = [...new Set(ids)].filter((id) => vertexById(id));
  if (cleaned.length < 3 || faceExists(cleaned)) return null;
  const f = { id: newId(), verts: cleaned, mirrored };
  state.faces.push(f);
  return f;
}

function addFaceMirrored(ids) {
  const f = addFace(ids, false);
  if (mirrorActionsEnabled()) {
    const mids = mirrorIds(ids);
    if (mids && !sameIdSet(mids, ids)) addFace(mids, true);
  }
  return f;
}

function addEdge(a, b, kind = "edge", mirrored = false) {
  if (!vertexById(a) || !vertexById(b) || a === b) return null;
  const exists = state.edges.some((e) => e.kind === kind && ((e.a === a && e.b === b) || (e.a === b && e.b === a)));
  if (exists) return null;
  const e = { id: newId(), a, b, kind, mirrored };
  state.edges.push(e);
  return e;
}

function addEdgeMirrored(a, b, kind = "edge") {
  const e = addEdge(a, b, kind, false);
  if (mirrorActionsEnabled()) {
    const ma = vertexById(a)?.mirrorId || a;
    const mb = vertexById(b)?.mirrorId || b;
    if (ma !== a || mb !== b) addEdge(ma, mb, kind, true);
  }
  return e;
}

function lineKey(a, b) {
  return a < b ? `${a},${b}` : `${b},${a}`;
}

function explicitEdgesBetween(a, b) {
  return state.edges.filter((e) => (e.a === a && e.b === b) || (e.a === b && e.b === a));
}

function faceEdgeIndex(face, a, b) {
  const ids = face.verts;
  for (let i = 0; i < ids.length; i++) {
    const next = (i + 1) % ids.length;
    if ((ids[i] === a && ids[next] === b) || (ids[i] === b && ids[next] === a)) return i;
  }
  return -1;
}

function triangulateFaceAcrossSplit(face, edgeStartIndex, midpointId) {
  const ids = face.verts;
  const first = ids[edgeStartIndex];
  const second = ids[(edgeStartIndex + 1) % ids.length];
  const ordered = [midpointId, second];
  for (let i = (edgeStartIndex + 2) % ids.length; ids[i] !== first; i = (i + 1) % ids.length) {
    ordered.push(ids[i]);
  }
  ordered.push(first);

  const triangles = [];
  for (let i = 1; i < ordered.length - 1; i++) {
    const tri = [midpointId, ordered[i], ordered[i + 1]];
    if (new Set(tri).size === 3) triangles.push(tri);
  }
  return triangles;
}

function midpointVertexForEdge(a, b) {
  const va = vertexById(a), vb = vertexById(b);
  if (!va || !vb) return null;
  const x = (va.x + vb.x) / 2;
  const y = (va.y + vb.y) / 2;
  const z = (va.z + vb.z) / 2;
  return addVertex(Math.abs(x) < EPS ? 0 : x, y, z, null, Math.abs(x) < EPS);
}

function splitEdgeOnce(a, b, midpointId) {
  const affectedFaceIds = new Set();
  const newFaces = [];
  for (const face of state.faces) {
    const edgeIndex = faceEdgeIndex(face, a, b);
    if (edgeIndex < 0) continue;
    affectedFaceIds.add(face.id);
    for (const tri of triangulateFaceAcrossSplit(face, edgeIndex, midpointId)) {
      newFaces.push({ id: newId(), verts: tri, mirrored: !!face.mirrored });
    }
  }

  if (affectedFaceIds.size) {
    state.faces = state.faces.filter((face) => !affectedFaceIds.has(face.id));
    state.faces.push(...newFaces);
    state.details = state.details.filter((detail) => !affectedFaceIds.has(detail.faceId));
  }

  const explicit = explicitEdgesBetween(a, b);
  if (explicit.length) {
    const oldIds = new Set(explicit.map((edge) => edge.id));
    state.edges = state.edges.filter((edge) => !oldIds.has(edge.id));
    for (const edge of explicit) {
      addEdge(a, midpointId, edge.kind, !!edge.mirrored);
      addEdge(midpointId, b, edge.kind, !!edge.mirrored);
    }
  }

  return { faceCount: affectedFaceIds.size, explicitCount: explicit.length };
}

function splitSelectedLine() {
  cancelSurfaceInsertPreview({ redraw: false });
  let targets = [];
  if (state.selected?.type === "edge") {
    const edge = state.edges.find((item) => item.id === state.selected.id);
    if (edge) targets.push({ a: edge.a, b: edge.b });
  } else if (state.pick.length >= 2) {
    targets.push({ a: state.pick[0], b: state.pick[1] });
  }
  if (!targets.length) return setStatus("SELECT AN EDGE OR PICK TWO VERTICES.");

  if (mirrorActionsEnabled()) {
    const additions = [];
    for (const target of targets) {
      const ma = vertexById(target.a)?.mirrorId || target.a;
      const mb = vertexById(target.b)?.mirrorId || target.b;
      if (ma !== target.a || mb !== target.b) additions.push({ a: ma, b: mb });
    }
    targets.push(...additions);
  }

  const uniqueTargets = [];
  const seen = new Set();
  for (const target of targets) {
    if (!vertexById(target.a) || !vertexById(target.b) || target.a === target.b) continue;
    const key = lineKey(target.a, target.b);
    if (seen.has(key)) continue;
    seen.add(key);
    uniqueTargets.push(target);
  }
  if (!uniqueTargets.length) return setStatus("NO VALID LINE TO SPLIT.");

  const midpointByKey = new Map();
  for (const target of uniqueTargets) {
    const midpoint = midpointVertexForEdge(target.a, target.b);
    if (!midpoint) continue;
    midpointByKey.set(lineKey(target.a, target.b), midpoint);
  }

  if (mirrorActionsEnabled()) {
    for (const target of uniqueTargets) {
      const midpoint = midpointByKey.get(lineKey(target.a, target.b));
      if (!midpoint || midpoint.center) continue;
      const ma = vertexById(target.a)?.mirrorId || target.a;
      const mb = vertexById(target.b)?.mirrorId || target.b;
      const mirrorMidpoint = midpointByKey.get(lineKey(ma, mb));
      if (mirrorMidpoint && mirrorMidpoint.id !== midpoint.id) {
        midpoint.mirrorId = mirrorMidpoint.id;
        mirrorMidpoint.mirrorId = midpoint.id;
      }
    }
  }

  let faceCount = 0;
  let explicitCount = 0;
  let firstMidpoint = null;
  for (const target of uniqueTargets) {
    const midpoint = midpointByKey.get(lineKey(target.a, target.b));
    if (!midpoint) continue;
    if (!firstMidpoint) firstMidpoint = midpoint;
    const result = splitEdgeOnce(target.a, target.b, midpoint.id);
    faceCount += result.faceCount;
    explicitCount += result.explicitCount;
  }

  state.selected = firstMidpoint ? { type: "vertex", id: firstMidpoint.id } : null;
  state.pick = [];
  setStatus(`LINE SPLIT. TRIANGULATED ${faceCount} FACE${faceCount === 1 ? "" : "S"}${explicitCount ? ` AND SPLIT ${explicitCount} EXPLICIT LINE${explicitCount === 1 ? "" : "S"}` : ""}.`);
  renderAll();
}

function faceNormal(face) {
  const verts = face.verts.map(vertexById).filter(Boolean);
  if (verts.length < 3) return vec(0, 0, 1);
  let nx = 0;
  let ny = 0;
  let nz = 0;
  for (let i = 0; i < verts.length; i++) {
    const a = verts[i];
    const b = verts[(i + 1) % verts.length];
    nx += (a.y - b.y) * (a.z + b.z);
    ny += (a.z - b.z) * (a.x + b.x);
    nz += (a.x - b.x) * (a.y + b.y);
  }
  const normal = vec(nx, ny, nz);
  if (len(normal) > EPS) return norm(normal);
  for (let i = 1; i < verts.length - 1; i++) {
    const a = vec(verts[0].x, verts[0].y, verts[0].z);
    const b = vec(verts[i].x, verts[i].y, verts[i].z);
    const c = vec(verts[i + 1].x, verts[i + 1].y, verts[i + 1].z);
    const candidate = cross(sub(b, a), sub(c, a));
    if (len(candidate) > EPS) return norm(candidate);
  }
  return vec(0, 0, 1);
}

function normalFromPoints(points) {
  if (!Array.isArray(points) || points.length < 3) return vec(0, 0, 1);
  for (let i = 1; i < points.length - 1; i++) {
    const candidate = cross(sub(points[i], points[0]), sub(points[i + 1], points[0]));
    if (len(candidate) > EPS) return norm(candidate);
  }
  return vec(0, 0, 1);
}

function facePlaneNormalFromPoints(points) {
  if (!Array.isArray(points) || points.length < 3) return vec(0, 0, 1);
  let nx = 0;
  let ny = 0;
  let nz = 0;
  for (let i = 0; i < points.length; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    nx += (a.y - b.y) * (a.z + b.z);
    ny += (a.z - b.z) * (a.x + b.x);
    nz += (a.x - b.x) * (a.y + b.y);
  }
  const normal = vec(nx, ny, nz);
  return len(normal) > EPS ? norm(normal) : normalFromPoints(points);
}

function pointsBoundsScale(points) {
  if (!Array.isArray(points) || !points.length) return 0;
  const min = vec(points[0].x, points[0].y, points[0].z);
  const max = vec(points[0].x, points[0].y, points[0].z);
  for (const point of points) {
    min.x = Math.min(min.x, point.x);
    min.y = Math.min(min.y, point.y);
    min.z = Math.min(min.z, point.z);
    max.x = Math.max(max.x, point.x);
    max.y = Math.max(max.y, point.y);
    max.z = Math.max(max.z, point.z);
  }
  return len(sub(max, min));
}

function facePlanarityIssueFromPoints(points, ids, scale = 0) {
  if (!Array.isArray(points) || points.length <= 3 || points.length !== ids.length) return null;
  const normal = facePlaneNormalFromPoints(points);
  if (len(normal) <= EPS) return null;
  const center = mul(points.reduce((sum, point) => add(sum, point), vec()), 1 / points.length);
  const distances = points.map((point) => Math.abs(dot(sub(point, center), normal)));
  const maxDistance = Math.max(...distances);
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

function stateFacePlanarityIssue(face) {
  const ids = (face?.verts || []).map(Number);
  const points = ids.map(vertexById).filter(Boolean).map((vertex) => vec(vertex.x, vertex.y, vertex.z));
  return facePlanarityIssueFromPoints(points, ids, modelOverallSize());
}

function faceFacesBuilderCamera(face) {
  const n = rotatePoint(faceNormal(face));
  return n.z < -0.015;
}

function faceCenter(face) {
  const verts = face.verts.map(vertexById).filter(Boolean);
  if (!verts.length) return vec();
  return mul(verts.reduce((sum, v) => add(sum, vec(v.x, v.y, v.z)), vec()), 1 / verts.length);
}

function faceBasis(face) {
  const verts = face.verts.map(vertexById).filter(Boolean);
  const center = faceCenter(face);
  const normal = faceNormal(face);
  let right = null;
  let longest = 0;
  for (let i = 0; i < verts.length; i++) {
    const a = verts[i];
    const b = verts[(i + 1) % verts.length];
    const edge = sub(vec(b.x, b.y, b.z), vec(a.x, a.y, a.z));
    const planar = sub(edge, mul(normal, dot(edge, normal)));
    const length = len(planar);
    if (length > longest) {
      longest = length;
      right = planar;
    }
  }
  if (!right || longest < EPS) {
    right = Math.abs(normal.z) < .95 ? cross(vec(0, 0, 1), normal) : cross(vec(0, 1, 0), normal);
  }
  right = norm(right);
  let up = norm(cross(normal, right));
  if (len(up) < EPS) up = vec(0, 1, 0);
  return { center, normal, right, up };
}

function orderedFaceVertexIds(face) {
  const ids = [...new Set(face?.verts || [])].filter((id) => vertexById(id));
  if (ids.length < 3) return ids;
  const basis = faceBasis({ ...face, verts: ids });
  const ordered = ids
    .map((id) => {
      const vertex = vertexById(id);
      const offset = sub(vec(vertex.x, vertex.y, vertex.z), basis.center);
      return {
        id,
        angle: Math.atan2(dot(offset, basis.up), dot(offset, basis.right))
      };
    })
    .sort((a, b) => a.angle - b.angle)
    .map((item) => item.id);
  const originalNormal = faceNormal({ ...face, verts: ids });
  const orderedNormal = faceNormal({ ...face, verts: ordered });
  return dot(originalNormal, orderedNormal) < 0 ? ordered.reverse() : ordered;
}

function faceWithOrderedVertices(face, orderedIds = orderedFaceVertexIds(face)) {
  const copy = { ...face, verts: orderedIds };
  const originalIndexById = new Map((face?.verts || []).map((id, index) => [id, index]));
  const remapVertexArray = (value) => {
    if (!Array.isArray(value) || value.length !== face.verts.length) return null;
    const remapped = orderedIds.map((id) => value[originalIndexById.get(id)]).filter((item) => item != null);
    return remapped.length === orderedIds.length ? remapped.map((item) => Array.isArray(item) ? [...item] : item) : null;
  };
  const bitmapUv = remapVertexArray(face.bitmapUv);
  if (bitmapUv) copy.bitmapUv = bitmapUv;
  const bitmapUvTemplate = remapVertexArray(face.bitmapUvTemplate);
  if (bitmapUvTemplate) copy.bitmapUvTemplate = bitmapUvTemplate;
  return copy;
}

function pairedSurfaceInput(name) {
  return {
    range: document.getElementById(`surfaceInsert${name}`),
    number: document.getElementById(`surfaceInsert${name}Value`)
  };
}

function setSurfaceInputValue(name, value) {
  const { range, number } = pairedSurfaceInput(name);
  const text = String(value);
  if (range) range.value = text;
  if (number) number.value = text;
}

function linkedSurfaceSizeEnabled() {
  return !!els.surfaceInsertLinkSize?.checked;
}

function syncLinkedSurfaceSize(sourceName, value) {
  if (!linkedSurfaceSizeEnabled() || !["W", "H"].includes(sourceName)) return;
  setSurfaceInputValue(sourceName === "W" ? "H" : "W", value);
}

function readSurfaceInput(name, fallback) {
  const { range, number } = pairedSurfaceInput(name);
  const source = document.activeElement === number ? number : range || number;
  const value = Number(source?.value);
  return Number.isFinite(value) ? value : fallback;
}

function readSurfaceInsertConfig() {
  return {
    x: clamp(readSurfaceInput("X", 0), -500, 500),
    y: clamp(readSurfaceInput("Y", 0), -500, 500),
    width: clamp(readSurfaceInput("W", 48), 1, 800),
    height: clamp(readSurfaceInput("H", 32), 1, 800),
    sides: Math.round(clamp(readSurfaceInput("Sides", 4), 3, 32)),
    rotation: normalizeBitmapAngle(readSurfaceInput("R", 0)) * Math.PI / 180,
    lift: clamp(readSurfaceInput("Lift", 0), 0, 80)
  };
}

function syncSurfaceInsertControlPair(target) {
  const id = target?.id || "";
  const match = id.match(/^surfaceInsert(X|Y|W|H|Sides|R|Lift)(Value)?$/);
  if (!match) return;
  const { range, number } = pairedSurfaceInput(match[1]);
  const value = target.value;
  if (target === range && number) number.value = value;
  if (target === number && range) range.value = value;
  syncLinkedSurfaceSize(match[1], value);
}

function surfaceInsertControls() {
  return ["X", "Y", "W", "H", "Sides", "R", "Lift"]
    .flatMap((name) => Object.values(pairedSurfaceInput(name)))
    .filter(Boolean);
}

function pairedFaceExtrudeInput(name = "Distance") {
  return {
    range: document.getElementById(`faceExtrude${name}`),
    number: document.getElementById(`faceExtrude${name}Value`)
  };
}

function setFaceExtrudeInputValue(name, value) {
  const { range, number } = pairedFaceExtrudeInput(name);
  const text = String(value);
  if (range) range.value = text;
  if (number) number.value = text;
}

function readFaceExtrudeInput(name, fallback = 0) {
  const { range, number } = pairedFaceExtrudeInput(name);
  const source = document.activeElement === number ? number : range || number;
  const value = Number(source?.value);
  return Number.isFinite(value) ? value : fallback;
}

function cleanFaceExtrudeMode(mode) {
  return mode === "point" ? "point" : "cap";
}

function setFaceExtrudeMode(mode = "cap") {
  const clean = cleanFaceExtrudeMode(mode);
  document.querySelectorAll("input[name='faceExtrudeMode']").forEach((input) => {
    input.checked = input.value === clean;
  });
  return clean;
}

function readFaceExtrudeMode() {
  return cleanFaceExtrudeMode(document.querySelector("input[name='faceExtrudeMode']:checked")?.value);
}

function readFaceExtrudeConfig() {
  return {
    mode: readFaceExtrudeMode(),
    distance: clamp(readFaceExtrudeInput("Distance", 24), -800, 800),
    taperAngle: clamp(readFaceExtrudeInput("Taper", 0), -85, 85),
    deleteSource: els.faceExtrudeDeleteSource?.checked !== false
  };
}

function syncFaceExtrudeControlPair(target) {
  const match = (target?.id || "").match(/^faceExtrude(Distance|Taper)(Value)?$/);
  if (!match) return;
  const { range, number } = pairedFaceExtrudeInput(match[1]);
  if (target !== range && target !== number) return;
  if (target === range && number) number.value = target.value;
  if (target === number && range) range.value = target.value;
}

function faceExtrudeControls() {
  return ["Distance", "Taper"]
    .flatMap((name) => Object.values(pairedFaceExtrudeInput(name)))
    .filter(Boolean);
}

function syncFaceExtrudeModeUi(mode = currentFaceExtrudeConfig().mode) {
  const pointMode = cleanFaceExtrudeMode(mode) === "point";
  els.faceExtrudeMenu?.classList.toggle("is-point-extrude", pointMode);
  els.addFaceExtrudeBtn?.classList.toggle("active", state.faceExtrudePreview && !pointMode);
  els.addFaceExtrudeBtn?.setAttribute("aria-pressed", state.faceExtrudePreview && !pointMode ? "true" : "false");
  els.addFacePointExtrudeBtn?.classList.toggle("active", state.faceExtrudePreview && pointMode);
  els.addFacePointExtrudeBtn?.setAttribute("aria-pressed", state.faceExtrudePreview && pointMode ? "true" : "false");
  els.extrudeEdgeLoopBtn?.classList.toggle("active", state.faceExtrudePreview);
  els.extrudeEdgeLoopBtn?.setAttribute("aria-pressed", state.faceExtrudePreview ? "true" : "false");
}

function surfaceInsertRotationFromUv(face) {
  const uv = cleanFaceBitmapUv(face);
  const verts = face?.verts?.map(vertexById).filter(Boolean) || [];
  if (!uv || uv.length !== verts.length || verts.length < 3) return null;
  const basis = faceBasis(face);
  let best = null;
  for (let i = 0; i < verts.length; i++) {
    const next = (i + 1) % verts.length;
    const edge = sub(vec(verts[next].x, verts[next].y, verts[next].z), vec(verts[i].x, verts[i].y, verts[i].z));
    const localX = dot(edge, basis.right);
    const localY = dot(edge, basis.up);
    const geomLen = Math.hypot(localX, localY);
    const uvX = Number(uv[next][0]) - Number(uv[i][0]);
    const uvY = Number(uv[next][1]) - Number(uv[i][1]);
    const uvLen = Math.hypot(uvX, uvY);
    if (geomLen < EPS || uvLen < EPS) continue;
    const score = geomLen * uvLen;
    if (!best || score > best.score) {
      const geomAngle = Math.atan2(localY, localX);
      const uvAngle = Math.atan2(-uvY, uvX);
      best = { score, angle: normalizeBitmapAngle((uvAngle - geomAngle) * 180 / Math.PI) };
    }
  }
  return best?.angle ?? null;
}

function surfaceInsertDefaultRotationDeg(face) {
  const uvRotation = surfaceInsertRotationFromUv(face);
  if (Number.isFinite(uvRotation)) return uvRotation;
  const transform = cleanBitmapUvTransform(face?.bitmapUvTransform);
  const angle = transform.rotation || normalizeBitmapAngle(face?.bitmapAngle);
  return normalizeBitmapAngle(-angle);
}

function syncSurfaceInsertPreviewConfig() {
  state.surfaceInsertConfig = readSurfaceInsertConfig();
  return state.surfaceInsertConfig;
}

function currentSurfaceInsertConfig() {
  return state.surfaceInsertPreview && state.surfaceInsertConfig
    ? state.surfaceInsertConfig
    : readSurfaceInsertConfig();
}

function localSurfaceInsertPoints(width, height, sides = 4) {
  const halfW = width * 0.5;
  const halfH = height * 0.5;
  const count = Math.round(clamp(sides, 3, 32));
  if (count === 4) {
    return [
      { x: -halfW, y: -halfH },
      { x: halfW, y: -halfH },
      { x: halfW, y: halfH },
      { x: -halfW, y: halfH }
    ];
  }
  return Array.from({ length: count }, (_, index) => {
    const angle = Math.PI / 2 - index * TAU / count;
    return { x: Math.cos(angle) * halfW, y: Math.sin(angle) * halfH };
  });
}

function surfaceShapePoints(face, config = currentSurfaceInsertConfig()) {
  const verts = face.verts.map(vertexById).filter(Boolean);
  if (verts.length < 3) return [];
  const { center, normal, right, up } = faceBasis(face);
  const cos = Math.cos(config.rotation);
  const sin = Math.sin(config.rotation);
  const origin = add(center, add(mul(right, config.x), add(mul(up, config.y), mul(normal, config.lift))));
  return localSurfaceInsertPoints(config.width, config.height, config.sides).map((point) => {
    const x = point.x * cos - point.y * sin;
    const y = point.x * sin + point.y * cos;
    return add(origin, add(mul(right, x), mul(up, y)));
  });
}

function surfaceInsertShapeLabel() {
  return "POLYGON";
}

function setSurfaceInsertPreview(visible) {
  state.surfaceInsertPreview = !!visible;
  if (state.surfaceInsertPreview) syncSurfaceInsertPreviewConfig();
  else state.surfaceInsertConfig = null;
  els.surfaceInsertMenu?.classList.toggle("is-hidden", !state.surfaceInsertPreview);
  els.addSurfacePolygonBtn?.classList.toggle("active", state.surfaceInsertPreview);
  els.addSurfacePolygonBtn?.setAttribute("aria-pressed", state.surfaceInsertPreview ? "true" : "false");
  els.confirmSurfaceInsertBtn?.classList.toggle("is-hidden", !state.surfaceInsertPreview);
}

function cancelSurfaceInsertPreview(options = {}) {
  let changed = false;
  if (state.surfaceInsertPreview || state.surfaceInsertConfig) {
    setSurfaceInsertPreview(false);
    changed = true;
  }
  if (state.faceExtrudePreview || state.faceExtrudeConfig) {
    setFaceExtrudePreview(false);
    changed = true;
  }
  if (changed && options.redraw) renderAll();
  return changed;
}

function prepareSurfaceInsertPreview() {
  cancelFaceExtrudePreview({ redraw: false });
  const face = selectedFace();
  state.surfaceInsertShape = "polygon";
  if (!face) {
    setSurfaceInsertPreview(false);
    setStatus("SELECT A FACE FIRST.");
    renderAll();
    return;
  }
  state.mode = "face";
  setSurfaceInputValue("X", 0);
  setSurfaceInputValue("Y", 0);
  setSurfaceInputValue("R", surfaceInsertDefaultRotationDeg(face));
  setSurfaceInputValue("Lift", 0);
  if (linkedSurfaceSizeEnabled()) setSurfaceInputValue("H", readSurfaceInput("W", 48));
  setSurfaceInsertPreview(true);
  syncModeUi("face");
  setStatus(`SURFACE ${surfaceInsertShapeLabel()} PREVIEW READY. ADJUST SETTINGS, THEN OK TO ADD.`);
  renderAll();
}

function addSurfaceShapeToSelectedFace() {
  const face = selectedFace();
  if (!face) {
    setStatus("SELECT A FACE FIRST.");
    return;
  }
  state.surfaceInsertShape = "polygon";
  const points = surfaceShapePoints(face);
  if (points.length < 3) {
    setStatus(`SELECTED FACE CANNOT HOST A SURFACE ${surfaceInsertShapeLabel()}.`);
    return;
  }
  const vertices = points.map((point) => addVertex(point.x, point.y, point.z));
  const insertedFace = addFace(vertices.map((vertex) => vertex.id), false);
  if (!insertedFace) {
    setStatus(`SURFACE ${surfaceInsertShapeLabel()} FACE ALREADY EXISTS OR COULD NOT BE ADDED.`);
    renderAll();
    return;
  }
  const edges = [];
  for (let i = 0; i < vertices.length; i++) {
    const edge = addEdge(vertices[i].id, vertices[(i + 1) % vertices.length].id, "edge", false);
    if (edge) edges.push(edge);
  }
  state.pick = [];
  state.selectedFaceIds.clear();
  state.selectedDetailIds.clear();
  state.mode = "edge";
  syncModeUi("edge");
  if (edges.length) {
    state.selected = { type: "edge", id: edges[0].id };
    state.selectedEdgeIds = new Set(edges.map((edge) => edge.id));
  } else {
    state.selected = { type: "face", id: insertedFace.id };
    state.selectedEdgeIds.clear();
  }
  setStatus(`SURFACE ${surfaceInsertShapeLabel()} ADDED ON FACE #${face.id}${edges.length ? " AND BOUNDARY LOOP SELECTED" : ""}.`);
  renderAll();
}

function confirmSurfaceInsertPreview() {
  if (!state.surfaceInsertPreview) {
    setStatus("CHOOSE ADD POLYGON FIRST.");
    return;
  }
  addSurfaceShapeToSelectedFace();
  setSurfaceInsertPreview(false);
  renderAll();
}

function selectedEdgeLoopFace() {
  if (state.selected?.type !== "edge" || !state.selectedEdgeIds?.size) return null;
  const edges = [...state.selectedEdgeIds].map((id) => state.edges.find((edge) => edge.id === id)).filter(Boolean);
  if (edges.length < 3) return null;
  const vertexIds = [...new Set(edges.flatMap((edge) => [edge.a, edge.b]))];
  if (vertexIds.length < 3) return null;
  return state.faces.find((face) => sameIdSet(face.verts, vertexIds)) || null;
}

function selectedExtrudeFace() {
  return selectedFace() || selectedEdgeLoopFace();
}

function syncFaceExtrudePreviewConfig() {
  state.faceExtrudeConfig = readFaceExtrudeConfig();
  return state.faceExtrudeConfig;
}

function currentFaceExtrudeConfig() {
  return state.faceExtrudePreview && state.faceExtrudeConfig
    ? state.faceExtrudeConfig
    : readFaceExtrudeConfig();
}

function setFaceExtrudePreview(visible) {
  state.faceExtrudePreview = !!visible;
  if (state.faceExtrudePreview) syncFaceExtrudePreviewConfig();
  else state.faceExtrudeConfig = null;
  els.faceExtrudeMenu?.classList.toggle("is-hidden", !state.faceExtrudePreview);
  els.confirmFaceExtrudeBtn?.classList.toggle("is-hidden", !state.faceExtrudePreview);
  syncFaceExtrudeModeUi(state.faceExtrudeConfig?.mode || readFaceExtrudeMode());
}

function cancelFaceExtrudePreview(options = {}) {
  if (!state.faceExtrudePreview && !state.faceExtrudeConfig) return false;
  setFaceExtrudePreview(false);
  if (options.redraw) renderAll();
  return true;
}

function prepareFaceExtrudePreview(mode = "cap") {
  cancelSurfaceInsertPreview({ redraw: false });
  const face = selectedExtrudeFace();
  if (!face) {
    setFaceExtrudePreview(false);
    setStatus("SELECT A FACE OR ITS EDGE LOOP FIRST.");
    renderAll();
    return;
  }
  state.mode = "face";
  state.selected = { type: "face", id: face.id };
  state.selectedEdgeIds.clear();
  state.selectedDetailIds.clear();
  setFaceExtrudeMode(mode);
  setFaceExtrudeInputValue("Taper", 0);
  if (els.faceExtrudeDeleteSource) els.faceExtrudeDeleteSource.checked = true;
  setFaceExtrudePreview(true);
  syncModeUi("face");
  const modeLabel = cleanFaceExtrudeMode(mode) === "point" ? "POINT EXTRUDE" : "EXTRUDE";
  setStatus(`${modeLabel} PREVIEW READY FOR FACE #${face.id}. SET DISTANCE, THEN OK.`);
  renderAll();
}

function extrudedFacePoints(face, config = currentFaceExtrudeConfig()) {
  const source = face.verts.map(vertexById).filter(Boolean);
  if (source.length < 3) return [];
  const center = faceCenter(face);
  const normal = faceNormal(face);
  const distance = Number(config.distance) || 0;
  if (cleanFaceExtrudeMode(config.mode) === "point") {
    const apex = add(center, mul(normal, distance));
    return source.map(() => apex);
  }
  const radius = Math.max(EPS, ...source.map((vertex) => len(sub(vec(vertex.x, vertex.y, vertex.z), center))));
  const taperOffset = Math.tan((Number(config.taperAngle) || 0) * Math.PI / 180) * Math.abs(distance);
  const scale = clamp((radius + taperOffset) / radius, 0.02, 8);
  return source.map((vertex) => {
    const base = vec(vertex.x, vertex.y, vertex.z);
    const tapered = add(center, mul(sub(base, center), scale));
    return add(tapered, mul(normal, distance));
  });
}

function facePlaneUvAtPoint(face, point, sourceUv = cleanFaceBitmapUv(face)) {
  const verts = face.verts.map(vertexById).filter(Boolean);
  if (!sourceUv || sourceUv.length !== verts.length) return null;
  const basis = faceBasis(face);
  const local = (() => {
    const offset = sub(point, basis.center);
    return { x: dot(offset, basis.right), y: dot(offset, basis.up) };
  })();
  const samples = verts.map((vertex, index) => {
    const offset = sub(vec(vertex.x, vertex.y, vertex.z), basis.center);
    return {
      x: dot(offset, basis.right),
      y: dot(offset, basis.up),
      uv: sourceUv[index]
    };
  });
  let total = 0;
  let u = 0;
  let v = 0;
  for (const sample of samples) {
    const d2 = (sample.x - local.x) ** 2 + (sample.y - local.y) ** 2;
    if (d2 < 1e-8) return [round(sample.uv[0], 3), round(sample.uv[1], 3)];
    const weight = 1 / Math.max(1e-8, d2);
    total += weight;
    u += sample.uv[0] * weight;
    v += sample.uv[1] * weight;
  }
  return total > 0 ? [round(u / total, 3), round(v / total, 3)] : null;
}

function applyExtrudeSideFacePaint(sourceFace, sideFace, sidePoints) {
  if (!sourceFace || !sideFace) return;
  const faceColor = optionalHexColor(sourceFace.faceColor);
  if (faceColor) sideFace.faceColor = faceColor;
  const sourceUv = cleanFaceBitmapUv(sourceFace);
  const key = cleanBitmapKey(sourceFace.bitmapFaceKey);
  if (!key || !sourceUv) return;
  const sideUv = sidePoints.map((point) => facePlaneUvAtPoint(sourceFace, point, sourceUv));
  if (sideUv.length !== sideFace.verts.length || sideUv.some((point) => !point)) return;
  sideFace.bitmapFaceKey = key;
  const side = validBitmapFaceSide(sourceFace.bitmapSide);
  if (side) sideFace.bitmapSide = side;
  sideFace.bitmapUv = sideUv;
  sideFace.bitmapUvTemplate = cloneUvPoints(sideUv);
  delete sideFace.bitmapUvTransform;
  const baseW = Math.max(0, Math.round(Number(sourceFace.bitmapBaseW) || 0));
  const baseH = Math.max(0, Math.round(Number(sourceFace.bitmapBaseH) || 0));
  if (baseW && baseH) {
    sideFace.bitmapBaseW = baseW;
    sideFace.bitmapBaseH = baseH;
  }
  const angle = normalizeBitmapAngle(sourceFace.bitmapAngle);
  if (angle) sideFace.bitmapAngle = angle;
  if (sourceFace.bitmapMirrorX) sideFace.bitmapMirrorX = true;
  const wrap = cleanBitmapWrap(sourceFace.bitmapWrap);
  if (wrap !== "clip") sideFace.bitmapWrap = wrap;
}

function extrudeFaceGeometry(face, config, mirrored = false) {
  const sourceFaceId = face.id;
  const oldIds = orderedFaceVertexIds(face);
  const oldVerts = oldIds.map(vertexById);
  if (oldVerts.length < 3 || oldVerts.length !== oldIds.length) return null;
  const extrudeFace = faceWithOrderedVertices(face, oldIds);
  const newPoints = extrudedFacePoints(extrudeFace, config);
  if (newPoints.length !== oldIds.length) return null;
  const pointMode = cleanFaceExtrudeMode(config.mode) === "point";
  const newVerts = pointMode
    ? [addVertex(newPoints[0].x, newPoints[0].y, newPoints[0].z, null, false)]
    : newPoints.map((point) => addVertex(point.x, point.y, point.z, null, false));
  const newIds = newVerts.map((vertex) => vertex.id);
  const capFace = pointMode ? null : JSON.parse(JSON.stringify(face));
  if (capFace) {
    capFace.id = newId();
    capFace.verts = newIds;
    capFace.mirrored = !!mirrored;
  }
  if (config.deleteSource !== false) {
    state.faces = state.faces.filter((item) => item.id !== sourceFaceId);
    state.details = state.details.filter((detail) => Number(detail.faceId) !== sourceFaceId);
  }
  if (capFace) state.faces.push(capFace);
  if (config.deleteSource !== false) state.selectedFaceIds.delete(sourceFaceId);
  const sideFaces = [];
  for (let i = 0; i < oldIds.length; i++) {
    const next = (i + 1) % oldIds.length;
    const sideIds = pointMode
      ? [oldIds[i], oldIds[next], newIds[0]]
      : [oldIds[i], oldIds[next], newIds[next], newIds[i]];
    const sidePoints = pointMode
      ? [
        vec(oldVerts[i].x, oldVerts[i].y, oldVerts[i].z),
        vec(oldVerts[next].x, oldVerts[next].y, oldVerts[next].z),
        newPoints[i]
      ]
      : [
        vec(oldVerts[i].x, oldVerts[i].y, oldVerts[i].z),
        vec(oldVerts[next].x, oldVerts[next].y, oldVerts[next].z),
        newPoints[next],
        newPoints[i]
      ];
    const sideFace = addFace(sideIds, mirrored);
    if (sideFace) {
      applyExtrudeSideFacePaint(extrudeFace, sideFace, sidePoints);
      sideFaces.push(sideFace);
    }
    addEdge(oldIds[i], pointMode ? newIds[0] : newIds[i], "edge", mirrored);
    if (!pointMode) addEdge(newIds[i], newIds[next], "edge", mirrored);
  }
  return { capFace, sideFaces, newVerts, sourceFaceId, mode: pointMode ? "point" : "cap" };
}

function confirmFaceExtrudePreview() {
  if (!state.faceExtrudePreview) {
    setStatus("CHOOSE EXTRUDE FIRST.");
    return;
  }
  const face = selectedExtrudeFace();
  if (!face) {
    setStatus("SELECT A FACE OR ITS EDGE LOOP FIRST.");
    return;
  }
  const config = currentFaceExtrudeConfig();
  const { distance, taperAngle, deleteSource } = config;
  if (Math.abs(distance) < EPS) {
    setStatus("EXTRUDE DISTANCE MUST NOT BE ZERO.");
    return;
  }
  const mirror = mirrorActionsEnabled() ? mirroredFaceOf(face) : null;
  const primaryResult = extrudeFaceGeometry(face, config, false);
  const mirrorResult = mirror ? extrudeFaceGeometry(mirror, config, true) : null;
  if (!primaryResult) {
    setStatus(`FACE #${face.id} COULD NOT BE EXTRUDED.`);
    renderAll();
    return;
  }
  if (mirrorResult) inferMirrorVertexIds();
  state.selected = primaryResult.capFace
    ? { type: "face", id: primaryResult.capFace.id }
    : { type: "vertex", id: primaryResult.newVerts[0].id };
  state.selectedFaceIds.clear();
  state.selectedEdgeIds.clear();
  state.selectedDetailIds.clear();
  state.pick = [];
  setFaceExtrudePreview(false);
  const pointMode = cleanFaceExtrudeMode(config.mode) === "point";
  const taperText = !pointMode && Math.abs(taperAngle) > EPS ? `, TAPER ${round(taperAngle, 1)} DEG` : "";
  const sourceText = deleteSource === false ? ", SOURCE KEPT" : ", SOURCE DELETED";
  const resultText = pointMode
    ? `POINT EXTRUDED TO VERTEX #${primaryResult.newVerts[0].id}`
    : `FACE #${primaryResult.capFace.id} EXTRUDED`;
  setStatus(`${resultText} ${round(distance, 2)}${taperText}${sourceText}${mirrorResult ? " WITH MIRROR" : ""}.`);
  renderAll();
}

function detailPoints(face, inset = 0.42) {
  const c = faceCenter(face);
  return face.verts.map((id) => {
    const v = vertexById(id);
    return add(c, mul(sub(vec(v.x, v.y, v.z), c), inset));
  });
}

function insetPointOnFace(face, vertexId, inset = 0.42) {
  const v = vertexById(vertexId);
  if (!v) return null;
  const c = faceCenter(face);
  return add(c, mul(sub(vec(v.x, v.y, v.z), c), inset));
}

function detailModelPoints(detail) {
  if (detail.vertexId) {
    const v = vertexById(Number(detail.vertexId));
    return v ? [vec(v.x, v.y, v.z)] : [];
  }
  if (Array.isArray(detail.points)) {
    return detail.points
      .map((p) => Array.isArray(p) ? vec(Number(p[0]), Number(p[1]), Number(p[2])) : vec(Number(p.x), Number(p.y), Number(p.z)))
      .filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y) && Number.isFinite(p.z));
  }
  if (Array.isArray(detail.indices)) {
    return detail.indices
      .map((id) => vertexById(Number(id)))
      .filter(Boolean)
      .map((v) => vec(v.x, v.y, v.z));
  }
  const face = faceById(detail.faceId);
  if (!face) return [];
  const inset = detail.inset || 0.45;
  if (detail.type === "panel" && detail.segment?.length === 2) {
    return detail.segment
      .map((id) => insetPointOnFace(face, id, inset))
      .filter(Boolean);
  }
  const pts = detailPoints(face, inset);
  if (detail.type === "panel" && pts.length >= 2) return [...pts, pts[0]];
  return pts;
}

function addPanelDetails(face, normal) {
  const details = [];
  for (let i = 0; i < face.verts.length; i++) {
    details.push({
      id: newId(),
      type: "panel",
      faceId: face.id,
      inset: 0.66,
      color: "#ffd936",
      normal: toArray(normal),
      segment: [face.verts[i], face.verts[(i + 1) % face.verts.length]]
    });
  }
  state.details.push(...details);

  if (mirrorActionsEnabled()) {
    const mirrorFace = mirroredFaceOf(face);
    if (mirrorFace) {
      const mirrorNormal = faceNormal(mirrorFace);
      for (const detail of details) {
        const segment = mirrorIds(detail.segment);
        if (!segment) continue;
        state.details.push({
          ...detail,
          id: newId(),
          faceId: mirrorFace.id,
          normal: toArray(mirrorNormal),
          segment
        });
      }
    }
  }
  return details;
}

function selectedBeaconVertex() {
  const vertexId = state.selected?.type === "vertex"
    ? state.selected.id
    : state.pick.length === 1
      ? state.pick[0]
      : null;
  return vertexId ? vertexById(vertexId) : null;
}

function beaconTargetIds(vertex) {
  const ids = [vertex?.id].filter(Boolean);
  if (mirrorActionsEnabled() && vertex?.mirrorId && vertex.mirrorId !== vertex.id) {
    ids.push(vertex.mirrorId);
  }
  return [...new Set(ids.map(Number))];
}

function hasBeaconAtVertex(vertexId) {
  return state.details.some((detail) => detail.type === "beacon" && Number(detail.vertexId) === Number(vertexId));
}

function addBeaconDetail(options = {}) {
  cancelSurfaceInsertPreview({ redraw: false });
  const { stayInVertexMode = false } = options;
  const vertex = selectedBeaconVertex();
  if (!vertex) {
    setStatus("SELECT ONE VERTEX FIRST.");
    return;
  }
  const added = [];
  for (const vertexId of beaconTargetIds(vertex)) {
    if (hasBeaconAtVertex(vertexId)) continue;
    const d = {
      id: newId(),
      type: "beacon",
      vertexId,
      color: "#ffb642"
    };
    state.details.push(d);
    added.push(d);
  }
  if (!added.length) {
    setStatus("BEACON ALREADY EXISTS AT SELECTED VERTEX.");
    renderAll();
    return;
  }
  if (stayInVertexMode) {
    state.mode = "vertex";
    syncModeUi("vertex");
    state.selected = { type: "vertex", id: vertex.id };
  } else {
    state.mode = "detail";
    syncModeUi("detail");
    state.selected = { type: "detail", id: added[0].id };
  }
  setStatus(`${added.length > 1 ? "MIRRORED BEACONS" : "BEACON"} ADDED.`);
  renderAll();
}

function removeBeaconAtSelectedVertex() {
  cancelSurfaceInsertPreview({ redraw: false });
  const vertex = selectedBeaconVertex();
  if (!vertex) {
    setStatus("SELECT ONE VERTEX FIRST.");
    return;
  }
  const targets = new Set(beaconTargetIds(vertex));
  const before = state.details.length;
  state.details = state.details.filter((detail) => !(detail.type === "beacon" && targets.has(Number(detail.vertexId))));
  const removed = before - state.details.length;
  state.mode = "vertex";
  syncModeUi("vertex");
  state.selected = { type: "vertex", id: vertex.id };
  setStatus(removed ? `${removed > 1 ? "MIRRORED BEACONS" : "BEACON"} REMOVED.` : "NO BEACON AT SELECTED VERTEX.");
  renderAll();
}

function addDetail(type) {
  cancelSurfaceInsertPreview({ redraw: false });
  if (type === "beacon") {
    addBeaconDetail();
    return;
  }
  const face = selectedFace();
  if (!face) {
    setStatus("SELECT A FACE FIRST.");
    return;
  }
  const normal = faceNormal(face);
  if (type === "panel") {
    const details = addPanelDetails(face, normal);
    const count = details.length;
    if (details[0]) {
      state.mode = "detail";
      syncModeUi("detail");
      state.selected = { type: "detail", id: details[0].id };
      state.selectedDetailIds = new Set(details.map((detail) => detail.id));
    }
    setStatus(`${count} PANEL LINE${count === 1 ? "" : "S"} ADDED AS SURFACE DETAIL GROUP. DETAIL INSET READY.`);
    renderAll();
    return;
  }
  const d = {
    id: newId(),
    type,
    faceId: face.id,
    inset: type === "engine" ? 0.48 : 0.38,
    color: type === "engine" ? "#f7fff7" : type === "window" ? "#000000" : "#ffd936",
    normal: toArray(normal)
  };
  state.details.push(d);
  if (mirrorActionsEnabled()) {
    const mids = mirrorIds(face.verts);
    const mf = mids && state.faces.find((candidate) => sameIdSet(candidate.verts, mids));
    if (mf && mf.id !== face.id) {
      const mn = faceNormal(mf);
      state.details.push({ ...d, id: newId(), faceId: mf.id, normal: toArray(mn) });
    }
  }
  setStatus(`${type.toUpperCase()} DETAIL ADDED.`);
  renderAll();
}

function edgeComponentIsClosed(edges) {
  if (edges.length < 3) return false;
  const degree = new Map();
  for (const edge of edges) {
    degree.set(edge.a, (degree.get(edge.a) || 0) + 1);
    degree.set(edge.b, (degree.get(edge.b) || 0) + 1);
  }
  return degree.size >= 3 && [...degree.values()].every((count) => count === 2);
}

function inferFaceForEdgeVertices(vertexIds) {
  const ids = new Set(vertexIds);
  let best = null;
  let bestScore = 0;
  for (const face of state.faces) {
    const score = face.verts.reduce((count, id) => count + (ids.has(id) ? 1 : 0), 0);
    if (score > bestScore) {
      best = face;
      bestScore = score;
    }
  }
  if (bestScore >= 2) return best;
  const points = [...ids].map(vertexById).filter(Boolean).map((v) => vec(v.x, v.y, v.z));
  if (!points.length) return null;
  const center = mul(points.reduce((sum, point) => add(sum, point), vec()), 1 / points.length);
  const radius = modelRadius();
  let nearest = null;
  let nearestDistance = Infinity;
  for (const face of state.faces) {
    const n = faceNormal(face);
    const c = faceCenter(face);
    const distance = Math.abs(dot(sub(center, c), n));
    if (distance < nearestDistance) {
      nearest = face;
      nearestDistance = distance;
    }
  }
  return nearest && nearestDistance <= Math.max(4, radius * 0.18) ? nearest : null;
}

function detailColorForConvertedEdge(type) {
  if (type === "engine") return "#f7fff7";
  if (type === "window") return "#000000";
  if (type === DETAIL_TYPE_STATION_ENTRANCE) return "#06131f";
  return "#ffd936";
}

function convertedEdgeDetailLabel(type) {
  if (type === "panel") return "SURFACE DETAIL";
  if (type === DETAIL_TYPE_STATION_ENTRANCE) return "STATION ENTRANCE";
  return type.toUpperCase();
}

function detailTypeLabel(type) {
  if (type === "panel") return "surface detail";
  if (type === DETAIL_TYPE_STATION_ENTRANCE) return "station entrance";
  return type || "detail";
}

function edgeKindLabel(kind) {
  if (kind === EDGE_KIND_HIDDEN) return "HIDDEN EDGE";
  if (kind === "stick") return "STICK";
  if (kind === EDGE_KIND_STATION_ENTRANCE) return "STATION ENTRANCE";
  return "EDGE";
}

function edgeStrokeStyle(edge, selected = false) {
  if (selected) return "#ffd936";
  if (edge?.kind === EDGE_KIND_HIDDEN) return "rgba(255,217,54,.42)";
  if (edge?.kind === EDGE_KIND_STATION_ENTRANCE) return "#66e8ff";
  if (edge?.kind === "stick") return "#d9d9d9";
  return "rgba(85,255,78,.72)";
}

function edgeLineWidth(edge, selected = false) {
  if (selected) return 3;
  if (edge?.kind === EDGE_KIND_HIDDEN) return 1.4;
  if (edge?.kind === EDGE_KIND_STATION_ENTRANCE) return 2.4;
  if (edge?.kind === "stick") return 2.2;
  return 1.2;
}

function detailConvertibleVertexIds(detail) {
  const ids = Array.isArray(detail?.indices)
    ? detail.indices
    : Array.isArray(detail?.segment)
      ? detail.segment
      : [];
  return ids
    .map((id) => Number(id))
    .filter((id) => Number.isFinite(id) && vertexById(id));
}

function detailEdgePairsForConversion(detail) {
  const ids = detailConvertibleVertexIds(detail);
  if (ids.length < 2) return [];
  const pairs = [];
  for (let i = 0; i < ids.length - 1; i++) {
    if (ids[i] !== ids[i + 1]) pairs.push([ids[i], ids[i + 1]]);
  }
  const closedDetail = detail?.type === "window" || detail?.type === "engine" || detail?.type === DETAIL_TYPE_STATION_ENTRANCE;
  if (closedDetail && ids.length > 2 && ids[0] !== ids[ids.length - 1]) {
    pairs.push([ids[ids.length - 1], ids[0]]);
  }
  return pairs;
}

function detailIsSurfaceLine(detail) {
  return !!detail && (detail.type === "panel" || detail.type === "line" || detail.type === "polyline");
}

function detailComponentVertexIds(detail) {
  return [...new Set(detailConvertibleVertexIds(detail))];
}

function surfaceDetailComponentFrom(detail) {
  if (!detailIsSurfaceLine(detail)) return detail ? [detail] : [];
  const candidates = state.details.filter((item) =>
    detailIsSurfaceLine(item) &&
    item.faceId === detail.faceId &&
    detailComponentVertexIds(item).length >= 2
  );
  const remaining = new Set(candidates.map((item) => item.id));
  const component = [];
  const stack = [detail];
  while (stack.length) {
    const item = stack.pop();
    if (!item || !remaining.delete(item.id)) continue;
    component.push(item);
    const itemVertices = new Set(detailComponentVertexIds(item));
    for (const candidate of candidates) {
      if (!remaining.has(candidate.id)) continue;
      if (detailComponentVertexIds(candidate).some((id) => itemVertices.has(id))) stack.push(candidate);
    }
  }
  return component;
}

function selectedDetailSetDetails() {
  if (state.selected?.type !== "detail") return [];
  const selectedIds = state.selectedDetailIds?.size
    ? state.selectedDetailIds
    : new Set([state.selected.id]);
  return state.details.filter((detail) => selectedIds.has(detail.id));
}

function selectConnectedSurfaceDetails(detail) {
  if (!detailIsSurfaceLine(detail)) {
    setStatus("SELECT A SURFACE DETAIL LINE FIRST.");
    return false;
  }
  const component = surfaceDetailComponentFrom(detail);
  if (component.length < 2) {
    setStatus("NO CONNECTED SURFACE DETAIL LINES FOUND.");
    return false;
  }
  cancelSurfaceInsertPreview({ redraw: false });
  state.mode = "detail";
  state.selected = { type: "detail", id: detail.id };
  state.selectedDetailIds = new Set(component.map((item) => item.id));
  state.pick = [];
  state.selectedFaceIds.clear();
  state.selectedEdgeIds.clear();
  setToolTab("edit", { redraw: false });
  syncControlsWindowForSelection({ render: false });
  setStatus(`SURFACE DETAIL GROUP SELECTED (${component.length} LINES).`);
  renderAll();
  return true;
}

function clearSurfaceDetailGroup(statusText = "SURFACE DETAIL GROUP CLEARED.") {
  const hadGroup = state.selectedDetailIds.size > 1;
  state.selectedDetailIds.clear();
  if (hadGroup) {
    setStatus(statusText);
    renderAll();
  }
}

function selectedEdgeConversionComponent(edge) {
  if (!edge) return [];
  const selected = selectedEdgeSetEdges();
  if (selected.some((item) => item.id === edge.id)) return selected;
  const auditEdges = renderAuditEdges();
  return auditEdges.some((item) => item.id === edge.id)
    ? edgeComponentFrom(edge, auditEdges)
    : [edge];
}

function convertSelectedEdgeKind(kind) {
  if (kind === EDGE_KIND_STATION_ENTRANCE) {
    convertSelectedEdgeToDetail(DETAIL_TYPE_STATION_ENTRANCE);
    return;
  }
  const selectedEdge = state.selected?.type === "edge"
    ? state.edges.find((edge) => edge.id === state.selected.id)
    : null;
  if (!selectedEdge) {
    setStatus("SELECT AN EDGE OR AUDIT LOOP FIRST.");
    return;
  }
  const primaryEdges = selectedEdgeConversionComponent(selectedEdge);
  if (!primaryEdges.length) {
    setStatus("SELECTED EDGE LOOP NOT FOUND.");
    return;
  }
  const targetIds = new Set(primaryEdges.map((edge) => edge.id));
  if (mirrorActionsEnabled()) {
    const mirrorEdge = mirroredEdgeOf(selectedEdge);
    if (mirrorEdge && !targetIds.has(mirrorEdge.id)) {
      selectedEdgeConversionComponent(mirrorEdge).forEach((edge) => targetIds.add(edge.id));
    }
  }
  state.edges.forEach((edge) => {
    if (targetIds.has(edge.id)) edge.kind = kind;
  });
  state.selectedEdgeIds = new Set([...targetIds]);
  state.selectedDetailIds.clear();
  state.mode = "edge";
  syncModeUi("edge");
  setStatus(`${targetIds.size} EDGE${targetIds.size === 1 ? "" : "S"} CONVERTED TO ${edgeKindLabel(kind)}.`);
  renderAll();
}

function makeConvertedEdgeDetail(type, edges, preferredEdge) {
  const closed = edgeComponentIsClosed(edges);
  let vertexIds = orderedVerticesForEdges(edges, preferredEdge);
  if (type === "panel" && closed && vertexIds.length && vertexIds[0] !== vertexIds[vertexIds.length - 1]) {
    vertexIds = [...vertexIds, vertexIds[0]];
  }
  if (type !== "panel" && !closed) {
    setStatus(`${convertedEdgeDetailLabel(type)} CONVERSION NEEDS A CLOSED EDGE LOOP.`);
    return null;
  }
  if (vertexIds.length < (type === "panel" ? 2 : type === DETAIL_TYPE_STATION_ENTRANCE ? 4 : 3)) {
    setStatus(`${convertedEdgeDetailLabel(type)} CONVERSION NEEDS MORE LOOP POINTS.`);
    return null;
  }
  const face = inferFaceForEdgeVertices(vertexIds);
  if (!face && type !== DETAIL_TYPE_STATION_ENTRANCE) {
    setStatus("SELECTED EDGE LOOP DOES NOT SHARE A SURFACE FACE.");
    return null;
  }
  const points = vertexIds.map(vertexById).filter(Boolean).map((v) => vec(v.x, v.y, v.z));
  const normal = face ? faceNormal(face) : normalFromPoints(points);
  return {
    id: newId(),
    type,
    ...(face ? { faceId: face.id } : {}),
    indices: vertexIds,
    color: detailColorForConvertedEdge(type),
    normal: toArray(normal),
    lift: type === DETAIL_TYPE_STATION_ENTRANCE ? 0 : 0.5,
    ...(type === "engine" ? { stroke: "#ffffff" } : {})
  };
}

function convertSelectedEdgeToDetail(type) {
  cancelSurfaceInsertPreview({ redraw: false });
  const selectedEdge = state.selected?.type === "edge"
    ? state.edges.find((edge) => edge.id === state.selected.id)
    : null;
  if (!selectedEdge) {
    setStatus("SELECT AN EDGE OR AUDIT LOOP FIRST.");
    return;
  }
  const primaryEdges = selectedEdgeConversionComponent(selectedEdge);
  if (!primaryEdges.length) {
    setStatus("SELECTED EDGE LOOP NOT FOUND.");
    return;
  }
  const added = [];
  const removeIds = new Set();
  const primaryDetail = makeConvertedEdgeDetail(type, primaryEdges, selectedEdge);
  if (!primaryDetail) {
    renderAll();
    return;
  }
  added.push(primaryDetail);
  primaryEdges.forEach((edge) => removeIds.add(edge.id));

  if (mirrorActionsEnabled()) {
    const mirrorEdge = mirroredEdgeOf(selectedEdge);
    if (mirrorEdge && !removeIds.has(mirrorEdge.id)) {
      const mirrorEdges = selectedEdgeConversionComponent(mirrorEdge);
      const mirrorDetail = makeConvertedEdgeDetail(type, mirrorEdges, mirrorEdge);
      if (mirrorDetail) {
        added.push(mirrorDetail);
        mirrorEdges.forEach((edge) => removeIds.add(edge.id));
      }
    }
  }

  state.details.push(...added);
  state.edges = state.edges.filter((edge) => !removeIds.has(edge.id));
  state.selectedEdgeIds.clear();
  state.mode = "detail";
  syncModeUi("detail");
  state.selected = { type: "detail", id: primaryDetail.id };
  setStatus(`${added.length > 1 ? "MIRRORED " : ""}${convertedEdgeDetailLabel(type)} CONVERTED FROM ${removeIds.size} EDGE${removeIds.size === 1 ? "" : "S"}.`);
  renderAll();
}

function convertSelectedDetailToEdges(kind = "edge") {
  cancelSurfaceInsertPreview({ redraw: false });
  const selectedDetail = state.selected?.type === "detail" ? detailById(state.selected.id) : null;
  if (!selectedDetail) {
    setStatus("SELECT A SURFACE DETAIL FIRST.");
    return;
  }
  const primaryDetails = selectedDetailSetDetails();
  const primaryPairs = primaryDetails.flatMap(detailEdgePairsForConversion);
  if (!primaryPairs.length) {
    setStatus("SELECTED DETAIL HAS NO SOURCE VERTEX LOOP TO CONVERT.");
    return;
  }
  const detailsToRemove = new Set(primaryDetails.map((detail) => detail.id));
  const convertedEdges = [];
  const convertedKeys = new Set();
  const addConvertedPairs = (pairs, mirrored = false) => {
    for (const [a, b] of pairs) {
      const key = `${mirrored ? "m" : "p"}:${edgeKey(a, b)}`;
      if (!key || convertedKeys.has(key)) continue;
      convertedKeys.add(key);
      const edge = addEdge(a, b, kind, mirrored);
      if (edge) convertedEdges.push(edge);
    }
  };
  addConvertedPairs(primaryPairs, false);
  if (mirrorActionsEnabled()) {
    for (const detail of primaryDetails) {
      const mirrorDetail = mirroredDetailOf(detail);
      if (!mirrorDetail || detailsToRemove.has(mirrorDetail.id)) continue;
      const mirrorPairs = detailEdgePairsForConversion(mirrorDetail);
      if (mirrorPairs.length) {
        addConvertedPairs(mirrorPairs, true);
        detailsToRemove.add(mirrorDetail.id);
      }
    }
  }
  if (!convertedEdges.length) {
    setStatus(`${edgeKindLabel(kind)} CONVERSION FOUND MATCHING EDGES ALREADY.`);
    renderAll();
    return;
  }
  state.details = state.details.filter((detail) => !detailsToRemove.has(detail.id));
  state.mode = "edge";
  syncModeUi("edge");
  state.selected = { type: "edge", id: convertedEdges[0].id };
  state.selectedEdgeIds = new Set(convertedEdges.map((edge) => edge.id));
  state.selectedDetailIds.clear();
  setStatus(`${detailsToRemove.size > 1 ? `${detailsToRemove.size} ` : ""}${detailTypeLabel(selectedDetail.type).toUpperCase()} DETAIL${detailsToRemove.size === 1 ? "" : "S"} CONVERTED TO ${convertedEdges.length} ${edgeKindLabel(kind)} EDGE${convertedEdges.length === 1 ? "" : "S"}.`);
  renderAll();
}

function patchMirroredDetail(detail, patch) {
  if (!detail || !mirrorActionsEnabled()) return;
  const mirror = mirroredDetailOf(detail);
  if (mirror) Object.assign(mirror, patch);
}

function readProfileSideCount(input = els.profileSideCount) {
  return Math.round(clamp(Number(input?.value) || 4, 3, 16));
}

function readProfileRotationDeg(input = els.profileRotationDeg) {
  return normalizeBitmapAngle(Number(input?.value) || 0);
}

function readProfileConeMode(input = els.profileConeMode) {
  return !!input?.checked;
}

function resetPolygonProfile(sides = readProfileSideCount(), rotationDeg = readProfileRotationDeg(), cone = readProfileConeMode()) {
  resetGamePreviewSyncState();
  cancelSurfaceInsertPreview({ redraw: false });
  state.nextId = 1;
  state.verts = [];
  state.faces = [];
  state.edges = [];
  state.details = [];
  state.selected = null;
  state.selectedEdgeIds.clear();
  state.pick = [];

  const cleanSides = Math.round(clamp(Number(sides) || 4, 3, 16));
  const rotation = normalizeBitmapAngle(rotationDeg) * Math.PI / 180;
  const profile = [];
  const radiusX = 64;
  const radiusY = 42;
  const halfDepth = 72;
  for (let i = 0; i < cleanSides; i++) {
    const angle = rotation + i * TAU / cleanSides;
    profile.push({
      x: round(Math.sin(angle) * radiusX, 3),
      y: round(Math.cos(angle) * radiusY, 3)
    });
  }
  const back = profile.map((point) => addVertex(Math.abs(point.x) < .001 ? 0 : point.x, point.y, -halfDepth, null, Math.abs(point.x) < .001));
  addFace(back.map((vertex) => vertex.id));
  if (cone) {
    const apex = addCenterPoint(0, halfDepth);
    for (let i = 0; i < cleanSides; i++) {
      const next = (i + 1) % cleanSides;
      addFace([apex.id, back[next].id, back[i].id]);
    }
  } else {
    const front = profile.map((point) => addVertex(Math.abs(point.x) < .001 ? 0 : point.x, point.y, halfDepth, null, Math.abs(point.x) < .001));
    addFace(front.map((vertex) => vertex.id).reverse());
    for (let i = 0; i < cleanSides; i++) {
      const next = (i + 1) % cleanSides;
      addFace([front[i].id, front[next].id, back[next].id, back[i].id]);
    }
  }
  inferMirrorVertexIds();

  els.shipId.value = `custom_${cleanSides}_${cone ? "cone" : "profile"}`;
  els.shipName.value = `${cleanSides}-Sided ${cone ? "Cone" : "Profile"}`;
  state.sourceModelId = "";
  clearCurrentModelSavedSnapshot();
  syncSkinAngle(0, false);
  clearSkinBitmaps();
  setStatus(`NEW ${cleanSides}-SIDED ${cone ? "CONE" : "PROFILE"} CREATED.`);
  fitView();
  renderAll();
  scheduleGamePreviewSync(0, true);
}

function rotatePoint(v) {
  const { rx, ry } = state.view;
  const cy = Math.cos(ry), sy = Math.sin(ry);
  const cx = Math.cos(rx), sx = Math.sin(rx);
  const x1 = v.x * cy - v.z * sy;
  const z1 = v.x * sy + v.z * cy;
  const y1 = v.y * cx - z1 * sx;
  const z2 = v.y * sx + z1 * cx;
  return vec(x1, y1, z2);
}

function inverseRotatePoint(v) {
  const { rx, ry } = state.view;
  const cy = Math.cos(ry), sy = Math.sin(ry);
  const cx = Math.cos(rx), sx = Math.sin(rx);
  const y = v.y * cx + v.z * sx;
  const z1 = -v.y * sx + v.z * cx;
  const x = v.x * cy + z1 * sy;
  const z = -v.x * sy + z1 * cy;
  return vec(x, y, z);
}

function rotateViewPoint(v) {
  return rotatePoint(sub(v, modelCenter()));
}

function modelPointFromViewPoint(v, center = modelCenter()) {
  return add(inverseRotatePoint(v), center);
}

function normalizeRadians(value) {
  return Math.atan2(Math.sin(value), Math.cos(value));
}

function viewAnglesForVector(n) {
  if (len(n) < EPS) return null;
  const ry = Math.atan2(-n.x, -n.z);
  const sy = Math.sin(ry);
  const cy = Math.cos(ry);
  const z1 = n.x * sy + n.z * cy;
  const rx = Math.atan2(-n.y, -z1);
  return { rx: normalizeRadians(rx), ry: normalizeRadians(ry) };
}

function viewAnglesForCubeCornerVector(n) {
  return viewAnglesForVector({ x: -n.x, y: n.y, z: n.z });
}

function orientFaceViewAngles(face) {
  return viewAnglesForVector(faceNormal(face));
}

function orientFaceToView(face = selectedFace(), redraw = true, statusText = "") {
  if (!face) {
    setStatus("SELECT A FACE FIRST.");
    updateFaceUvAngleControls();
    return false;
  }
  setStandardView({ resetProjection: false });
  const view = orientFaceViewAngles(face);
  if (!view) {
    setStatus("FACE NORMAL IS TOO SMALL TO ORIENT VIEW.");
    return false;
  }
  state.view.rx = view.rx;
  state.view.ry = view.ry;
  if (statusText) setStatus(statusText);
  else setStatus(`FACE #${face.id} ORIENTED TO VIEW FROM STANDARD POSE.`);
  if (redraw) renderAll();
  return true;
}

function project3d(v, canvas) {
  const r = rotateViewPoint(v);
  const scale = state.view.zoom * Math.min(canvas.width, canvas.height) / 360;
  const perspective = state.view.orthographic ? 1 : 600 / (600 + r.z);
  return {
    x: canvas.width / 2 + state.view.panX + r.x * scale * perspective,
    y: canvas.height / 2 + state.view.panY - r.y * scale * perspective,
    z: r.z,
    perspective
  };
}

function gameRendererPreviewMode(value = els.previewRenderMode?.value || "gameOverlay") {
  return normalizePreviewRenderMode(value) === "gameOverlay";
}

function gameRendererOverlayMode(value = els.previewRenderMode?.value || "gameOverlay") {
  return normalizePreviewRenderMode(value) === "gameOverlay";
}

function gamePreviewRendererMode(value = els.previewRenderMode?.value || "gameOverlay") {
  // Game renderer preview stays solid; the editor canvas owns wire/selection diagnostics.
  return "solid";
}

function gamePreviewFxLevel(value = els.previewRenderMode?.value || "gameOverlay") {
  return "ultra";
}

function previewModeLabel(value = els.previewRenderMode?.value || "gameOverlay") {
  value = normalizePreviewRenderMode(value);
  if (value === "gameOverlay") return "Game Renderer + Overlay";
  if (value === "wireFaces") return "Builder Wire + Faces";
  if (value === "wire") return "Builder Wireframe";
  if (value === "wireBitmap") return "Builder Wire + Bitmap";
  if (value === "bitmap") return "Builder Bitmap Only";
  return value;
}

function normalizePreviewRenderMode(value) {
  if (value === "gameOnly") return "gameOverlay";
  return value || DEFAULT_PREVIEW_RENDER_MODE;
}

function setDefaultPreviewRenderMode() {
  if (!els.previewRenderMode) return;
  els.previewRenderMode.value = DEFAULT_PREVIEW_RENDER_MODE;
}

function syncPreviewModeButtons(mode = els.previewRenderMode?.value || DEFAULT_PREVIEW_RENDER_MODE) {
  mode = normalizePreviewRenderMode(mode);
  els.viewModeColumn?.querySelectorAll("[data-preview-mode]").forEach((button) => {
    const active = button.dataset.previewMode === mode;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", active ? "true" : "false");
  });
}

function setPreviewRenderMode(value) {
  if (!els.previewRenderMode || !value) return;
  value = normalizePreviewRenderMode(value);
  if (els.previewRenderMode.value !== value) {
    els.previewRenderMode.value = value;
  }
  renderAll();
  setStatus(`${previewModeLabel(value).toUpperCase()} VIEW.`);
}

function previewProjectionPointToCanvas(point, canvas) {
  if (!point) return null;
  const nx = Number(point.nx);
  const ny = Number(point.ny);
  return {
    x: Number.isFinite(nx) ? nx * canvas.width : Number(point.x) || 0,
    y: Number.isFinite(ny) ? ny * canvas.height : Number(point.y) || 0,
    z: Number(point.z) || 0,
    perspective: Number(point.s) || 1
  };
}

function renderableFaceVertexIds(face) {
  if (!face || !Array.isArray(face.verts)) return [];
  const vertexIds = new Set(state.verts.map((v) => v.id));
  return face.verts.filter((id) => vertexIds.has(id));
}

function renderableFaceIndex(target) {
  let index = 0;
  for (const face of state.faces) {
    if (renderableFaceVertexIds(face).length < 3) continue;
    if (face === target) return index;
    index++;
  }
  return -1;
}

function projectedMapForMain(canvas) {
  if (gameRendererOverlayMode() && state.gamePreviewProjection?.points?.length) {
    const map = new Map();
    state.verts.forEach((v, index) => {
      const point = previewProjectionPointToCanvas(state.gamePreviewProjection.points[index], canvas);
      if (point) map.set(v.id, point);
    });
    if (map.size) return map;
  }
  return new Map(state.verts.map((v) => [v.id, project3d(v, canvas)]));
}

function solveLinearSystem(matrix, values) {
  const n = values.length;
  if (!n || matrix.length !== n) return null;
  const rows = matrix.map((row, index) => [...row, values[index]]);
  for (let col = 0; col < n; col++) {
    let pivot = col;
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(rows[row][col]) > Math.abs(rows[pivot][col])) pivot = row;
    }
    if (Math.abs(rows[pivot][col]) < 1e-9) return null;
    if (pivot !== col) [rows[pivot], rows[col]] = [rows[col], rows[pivot]];
    const scale = rows[col][col];
    for (let item = col; item <= n; item++) rows[col][item] /= scale;
    for (let row = 0; row < n; row++) {
      if (row === col) continue;
      const factor = rows[row][col];
      if (Math.abs(factor) < 1e-12) continue;
      for (let item = col; item <= n; item++) rows[row][item] -= factor * rows[col][item];
    }
  }
  return rows.map((row) => row[n]);
}

function signedArea2(points) {
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    area += a.x * b.y - b.x * a.y;
  }
  return area;
}

function bestPointCombination(points, count) {
  if (points.length < count) return null;
  let best = null;
  let bestScore = -1;
  const visit = (start, combo) => {
    if (combo.length === count) {
      const src = combo.map((index) => points[index].source);
      const screen = combo.map((index) => points[index].screen);
      const score = Math.abs(signedArea2(src)) * Math.abs(signedArea2(screen));
      if (score > bestScore) {
        bestScore = score;
        best = combo.slice();
      }
      return;
    }
    for (let index = start; index <= points.length - (count - combo.length); index++) {
      combo.push(index);
      visit(index + 1, combo);
      combo.pop();
    }
  };
  visit(0, []);
  return bestScore > 1e-6 ? best : null;
}

function homographyProjector(pairs) {
  const indexes = bestPointCombination(pairs, 4);
  if (!indexes) return null;
  const rows = [];
  const values = [];
  for (const index of indexes) {
    const { source, screen } = pairs[index];
    const u = source.x;
    const v = source.y;
    rows.push([u, v, 1, 0, 0, 0, -u * screen.x, -v * screen.x]);
    values.push(screen.x);
    rows.push([0, 0, 0, u, v, 1, -u * screen.y, -v * screen.y]);
    values.push(screen.y);
  }
  const h = solveLinearSystem(rows, values);
  if (!h) return null;
  return (point) => {
    const den = h[6] * point.x + h[7] * point.y + 1;
    if (Math.abs(den) < 1e-9) return null;
    return {
      x: (h[0] * point.x + h[1] * point.y + h[2]) / den,
      y: (h[3] * point.x + h[4] * point.y + h[5]) / den
    };
  };
}

function affineProjector(pairs) {
  const indexes = bestPointCombination(pairs, 3);
  if (!indexes) return null;
  const rows = [];
  const values = [];
  for (const index of indexes) {
    const { source, screen } = pairs[index];
    rows.push([source.x, source.y, 1, 0, 0, 0]);
    values.push(screen.x);
    rows.push([0, 0, 0, source.x, source.y, 1]);
    values.push(screen.y);
  }
  const h = solveLinearSystem(rows, values);
  if (!h) return null;
  return (point) => ({
    x: h[0] * point.x + h[1] * point.y + h[2],
    y: h[3] * point.x + h[4] * point.y + h[5]
  });
}

function rendererFacePlaneProjector(face, projected) {
  if (!gameRendererOverlayMode() || !projected || !previewFaceForBuilderFace(face)?.visible) return null;
  const basis = faceBasis(face);
  const pairs = face.verts
    .map((id) => {
      const vertex = vertexById(id);
      const screen = projected.get(id);
      if (!vertex || !screen) return null;
      const offset = sub(vec(vertex.x, vertex.y, vertex.z), basis.center);
      return {
        source: { x: dot(offset, basis.right), y: dot(offset, basis.up) },
        screen
      };
    })
    .filter(Boolean);
  return homographyProjector(pairs) || affineProjector(pairs);
}

function previewFaceForBuilderFace(face) {
  if (!gameRendererOverlayMode() || !state.gamePreviewProjection?.faces?.length) return null;
  const index = renderableFaceIndex(face);
  if (index < 0) return null;
  return state.gamePreviewProjection.faces.find((item) => item?.faceIndex === index) || null;
}

function faceSortDepthForMain(face) {
  const previewFace = previewFaceForBuilderFace(face);
  return Number.isFinite(previewFace?.avgZ) ? previewFace.avgZ : faceDepth(face);
}

function gamePreviewProjectionSummary(info = state.gamePreviewInfo) {
  const projection = info?.projection;
  if (!projection?.faces) return null;
  const visibleFaces = projection.faces.filter((face) => face.visible).length;
  const projectedPoints = projection.points.filter(Boolean).length;
  const faceTextureRefs = projection.faces.filter((face) => face.bitmapKey).length;
  const missingUv = projection.faces.filter((face) => face.bitmapKey && !face.hasImageProjection).length;
  return {
    faces: info.faces || projection.faces.length,
    visibleFaces,
    projectedPoints,
    faceTextureRefs,
    missingUv
  };
}

function updatePreviewTrustUi() {
  const mode = normalizePreviewRenderMode(els.previewRenderMode?.value || "gameOverlay");
  if (els.previewRenderMode && els.previewRenderMode.value !== mode) els.previewRenderMode.value = mode;
  syncPreviewModeButtons(mode);
  const renderer = gameRendererPreviewMode(mode);
  const overlay = gameRendererOverlayMode(mode);
  els.mainPreviewStack?.classList.toggle("is-game-renderer", renderer);
  els.mainPreviewStack?.classList.toggle("is-game-overlay", overlay);
  els.mainPreviewStack?.classList.toggle("is-builder-diagnostic", !renderer);
  if (!els.previewTrustReadout) return;
  if (!renderer) {
    els.previewTrustReadout.textContent = `${previewModeLabel(mode)} | fallback preview path`;
    return;
  }
  const summary = gamePreviewProjectionSummary();
  if (!summary) {
    els.previewTrustReadout.textContent = gameRendererOverlayMode(mode)
      ? "Waiting for renderer projection packet..."
      : "Renderer-only preview active | projection diagnostics off";
    return;
  }
  const uvText = summary.missingUv
    ? `${summary.missingUv} UV gap${summary.missingUv === 1 ? "" : "s"}`
    : `${summary.faceTextureRefs} face UV${summary.faceTextureRefs === 1 ? "" : "s"}`;
  const overlayText = overlay ? "overlay on | renderer solid" : "overlay off | solid";
  const auditEdgeCount = renderAuditEdges().length;
  const auditFaceCount = renderAuditFaces().length;
  const auditParts = [
    auditEdgeCount ? `${auditEdgeCount} audit edge${auditEdgeCount === 1 ? "" : "s"}` : "",
    auditFaceCount ? `${auditFaceCount} warped face${auditFaceCount === 1 ? "" : "s"}` : ""
  ].filter(Boolean);
  const auditText = auditParts.length ? ` | ${auditParts.join(" | ")}` : "";
  const hiddenDetailCount = state.details.length - filteredDetailsForView().length;
  const detailFilterText = hiddenDetailCount ? ` | ${hiddenDetailCount} detail${hiddenDetailCount === 1 ? "" : "s"} hidden` : "";
  els.previewTrustReadout.textContent = `${summary.visibleFaces}/${summary.faces} visible faces | ${summary.projectedPoints} points | ${uvText} | ${overlayText}${auditText}${detailFilterText}`;
}

function drawGameRendererFaceNormals(ctx, canvas) {
  if (!els.showFaceNormals.checked || !state.gamePreviewProjection?.faces?.length) return;
  ctx.save();
  ctx.strokeStyle = "rgba(102,232,255,.78)";
  ctx.lineWidth = 1.2;
  for (const face of state.gamePreviewProjection.faces) {
    if (!face.visible || !face.normalLine?.from || !face.normalLine?.to) continue;
    const from = previewProjectionPointToCanvas(face.normalLine.from, canvas);
    const to = previewProjectionPointToCanvas(face.normalLine.to, canvas);
    if (!from || !to) continue;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  }
  ctx.restore();
}

function previewDetailForBuilderDetail(detail) {
  if (!gameRendererOverlayMode() || !state.gamePreviewProjection?.details?.length) return null;
  const stateIndex = state.details.indexOf(detail);
  const projectionIndex = state.gamePreviewDetailProjectionIndexByStateIndex.get(stateIndex);
  return Number.isInteger(projectionIndex) ? state.gamePreviewProjection.details[projectionIndex] || null : null;
}

function projectedDetailPointsForMain(detail, canvas = els.mainView) {
  const previewDetail = previewDetailForBuilderDetail(detail);
  if (previewDetail?.points?.length) {
    return previewDetail.points.map((point) => previewProjectionPointToCanvas(point, canvas)).filter(Boolean);
  }
  return detailModelPoints(detail).map((p) => project3d(p, canvas)).filter(Boolean);
}

function modelRadius() {
  return Math.max(1, ...state.verts.map((v) => Math.hypot(v.x, v.y, v.z)));
}

function modelBounds() {
  const emptyBounds = {
    minX: 0,
    maxX: 0,
    minY: 0,
    maxY: 0,
    minZ: 0,
    maxZ: 0
  };
  if (!state.verts.length) return emptyBounds;
  const bounds = state.verts.reduce((box, vertex) => ({
    minX: Math.min(box.minX, vertex.x),
    maxX: Math.max(box.maxX, vertex.x),
    minY: Math.min(box.minY, vertex.y),
    maxY: Math.max(box.maxY, vertex.y),
    minZ: Math.min(box.minZ, vertex.z),
    maxZ: Math.max(box.maxZ, vertex.z)
  }), {
    minX: Infinity,
    maxX: -Infinity,
    minY: Infinity,
    maxY: -Infinity,
    minZ: Infinity,
    maxZ: -Infinity
  });
  return Number.isFinite(bounds.minX) ? bounds : emptyBounds;
}

function modelCenter() {
  const bounds = modelBounds();
  return vec(
    (bounds.minX + bounds.maxX) * 0.5,
    (bounds.minY + bounds.maxY) * 0.5,
    (bounds.minZ + bounds.maxZ) * 0.5
  );
}

function modelOverallSize() {
  const bounds = modelBounds();
  return Math.max(bounds.maxX - bounds.minX, bounds.maxY - bounds.minY, bounds.maxZ - bounds.minZ, 1);
}

function faceDepth(face) {
  return face.verts.reduce((sum, id) => {
    const v = vertexById(id);
    return sum + (v ? rotateViewPoint(v).z : 0);
  }, 0) / face.verts.length;
}

function hexToRgb(hex, fallback = { r: 233, g: 242, b: 228 }) {
  const text = normalizeHexColor(hex);
  const n = Number.parseInt(text.slice(1), 16);
  return Number.isFinite(n)
    ? { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
    : fallback;
}

function shadedHullColor(n) {
  const light = norm(vec(-0.4, 0.75, 0.55));
  const d = clamp(dot(n, light), -0.25, 1);
  const mul = 0.42 + (d + 0.25) / 1.25 * 0.58;
  const base = hexToRgb(els.baseColor.value);
  return `rgb(${Math.round(base.r * mul)},${Math.round(base.g * mul)},${Math.round(base.b * mul)})`;
}

function shadedFaceColor(n, color = els.baseColor.value) {
  const light = norm(vec(-0.35, 0.7, 0.6));
  const d = clamp(dot(n, light), -0.4, 1);
  const mul = 0.46 + (d + 0.4) / 1.4 * 0.54;
  const base = hexToRgb(color);
  return `rgb(${Math.round(base.r * mul)},${Math.round(base.g * mul)},${Math.round(base.b * mul)})`;
}

function builderBitmapFill(n, face = null) {
  return shadedFaceColor(n, optionalHexColor(face?.faceColor) || els.baseColor.value);
}

function drawFace(ctx, pts, fill, stroke = "rgba(85,255,78,.46)", width = 1) {
  if (pts.length < 3) return;
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  if (width > 0) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = width;
    ctx.stroke();
  }
}

function drawFaceTextureGuide(ctx, pts, alpha = .18) {
  if (pts.length < 3) return;
  const minX = Math.min(...pts.map((p) => p.x));
  const maxX = Math.max(...pts.map((p) => p.x));
  const minY = Math.min(...pts.map((p) => p.y));
  const maxY = Math.max(...pts.map((p) => p.y));
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.closePath();
  ctx.clip();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 1;
  for (let x = minX - 80; x < maxX + 80; x += 24) {
    ctx.beginPath();
    ctx.moveTo(x, minY - 40);
    ctx.lineTo(x + 80, maxY + 40);
    ctx.stroke();
  }
  ctx.globalAlpha = alpha * .7;
  ctx.strokeStyle = "#ffd936";
  for (let y = minY + 18; y < maxY; y += 34) {
    ctx.beginPath();
    ctx.moveTo(minX, y);
    ctx.lineTo(maxX, y);
    ctx.stroke();
  }
  ctx.restore();
}

function drawArrow(ctx, a, b, color, width = 1.2) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const d = Math.hypot(dx, dy);
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
  if (d > 4) {
    const ux = dx / d;
    const uy = dy / d;
    const head = Math.min(8, Math.max(4, d * 0.28));
    const wing = head * 0.55;
    ctx.beginPath();
    ctx.moveTo(b.x, b.y);
    ctx.lineTo(b.x - ux * head - uy * wing, b.y - uy * head + ux * wing);
    ctx.lineTo(b.x - ux * head + uy * wing, b.y - uy * head - ux * wing);
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.arc(a.x, a.y, 3.2, 0, TAU);
    ctx.stroke();
  }
  ctx.restore();
}

function drawFaceNormal(ctx, face, projectFn, selected = false) {
  const center = faceCenter(face);
  const normal = faceNormal(face);
  const length = Math.max(18, modelRadius() * 0.16);
  const a = projectFn(center);
  const b = projectFn(add(center, mul(normal, length)));
  const color = selected ? "#ffd936" : "rgba(102,232,255,.62)";
  drawArrow(ctx, a, b, color, selected ? 2.3 : 1.1);
}

function drawFaceNormals(ctx, projectFn) {
  if (!els.showFaceNormals?.checked) return;
  const selectedFaceId = selectedFace()?.id || null;
  for (const face of state.faces) {
    if (face.id !== selectedFaceId) drawFaceNormal(ctx, face, projectFn, false);
  }
  const selected = selectedFaceId ? faceById(selectedFaceId) : null;
  if (selected) drawFaceNormal(ctx, selected, projectFn, true);
}

function faceUvTypeVisual(kind) {
  if (kind === "projected") return { color: "#66e8ff", label: "P" };
  if (kind === "flat") return { color: "#ffd936", label: "F" };
  if (kind === "side") return { color: "#55ff4e", label: "S" };
  return { color: "rgba(166,211,160,.78)", label: "A" };
}

function faceProjectedCentroid(face, projected) {
  const pts = face.verts.map((id) => projected.get(id)).filter(Boolean);
  if (pts.length < 3) return null;
  return {
    x: pts.reduce((sum, p) => sum + p.x, 0) / pts.length,
    y: pts.reduce((sum, p) => sum + p.y, 0) / pts.length
  };
}

function drawFaceUvTypePin(ctx, face, projected, selected = false, scale = 1) {
  const center = faceProjectedCentroid(face, projected);
  if (!center) return;
  const info = faceUvTypeInfo(face);
  const visual = faceUvTypeVisual(info.kind);
  const length = (selected ? 24 : 18) * scale;
  const radius = (selected ? 8 : 6) * scale;
  const end = { x: center.x, y: center.y - length };
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.shadowColor = "rgba(0,0,0,.9)";
  ctx.shadowBlur = 4 * scale;
  ctx.strokeStyle = visual.color;
  ctx.fillStyle = "rgba(0,0,0,.72)";
  ctx.lineWidth = selected ? 2.4 * scale : 1.4 * scale;
  ctx.beginPath();
  ctx.moveTo(center.x, center.y);
  ctx.lineTo(end.x, end.y);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(end.x, end.y, radius, 0, TAU);
  ctx.fill();
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.fillStyle = selected ? "#ffffff" : visual.color;
  ctx.font = `${Math.max(9, Math.round((selected ? 11 : 9) * scale))}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(visual.label, end.x, end.y + .5);
  ctx.restore();
}

function drawFaceUvTypeOverlay(ctx, projected, { scale = 1 } = {}) {
  if (!els.showFaceUvTypes?.checked) return;
  const selectedFaceId = selectedFace()?.id || null;
  for (const face of state.faces) {
    if (face.id !== selectedFaceId) drawFaceUvTypePin(ctx, face, projected, false, scale);
  }
  const selected = selectedFaceId ? faceById(selectedFaceId) : null;
  if (selected) drawFaceUvTypePin(ctx, selected, projected, true, scale);
}

function faceHasLoadedSideSkin(face) {
  const side = templateSideForFace(face);
  const img = state.skinImages?.[side];
  return !!(img?.complete && img.naturalWidth);
}

function faceHasUvCoverage(face, previewFace = null) {
  const hasFaceTexture = !!cleanBitmapKey(face?.bitmapFaceKey);
  if (hasFaceTexture) return previewFace?.hasImageProjection !== false;
  return faceHasLoadedSideSkin(face);
}

function drawBlankUvFaceOverlay(ctx, canvas, projected) {
  if (!els.showBlankUv?.checked) return;
  const gameOverlay = gameRendererOverlayMode();
  const faces = [...state.faces].sort((a, b) => faceSortDepthForMain(b) - faceSortDepthForMain(a));
  ctx.save();
  ctx.font = "10px Andale Mono, Menlo, Consolas, monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (const face of faces) {
    const previewFace = previewFaceForBuilderFace(face);
    if (gameOverlay && !previewFace?.visible) continue;
    if (faceHasUvCoverage(face, previewFace)) continue;
    const pts = face.verts.map((id) => projected.get(id)).filter(Boolean);
    if (pts.length < 3) continue;
    drawFace(ctx, pts, "rgba(69, 30, 104, .34)", "rgba(188, 112, 255, .95)", 1.8);
    const center = pts.reduce((sum, p) => ({ x: sum.x + p.x, y: sum.y + p.y }), { x: 0, y: 0 });
    center.x /= pts.length;
    center.y /= pts.length;
    const label = `NO UV #${face.id}`;
    const width = ctx.measureText(label).width + 8;
    ctx.fillStyle = "rgba(0,0,0,.74)";
    ctx.fillRect(center.x - width / 2, center.y - 8, width, 16);
    ctx.fillStyle = "#bc70ff";
    ctx.fillText(label, center.x, center.y + .5);
  }
  ctx.restore();
}

function drawStars(ctx, canvas) {
  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,.55)";
  for (let i = 0; i < 80; i++) {
    const x = (i * 137.31) % canvas.width;
    const y = (i * 71.17) % canvas.height;
    const a = 0.18 + ((i * 19) % 70) / 100;
    ctx.globalAlpha = a;
    ctx.fillRect(x, y, i % 7 === 0 ? 2 : 1, i % 11 === 0 ? 2 : 1);
  }
  ctx.restore();
}

function templateShipId() {
  return cleanBitmapKey(els.shipId.value, "custom_ship");
}

function mirrorHalfSkinsEnabled() {
  return !!els.mirrorHalfSkins?.checked;
}

function importMirroredSkinEnabled() {
  return !!els.importMirroredSkin?.checked;
}

function ratioClose(a, b, tolerance = .36) {
  return Number.isFinite(a) && Number.isFinite(b) && a > 0 && b > 0 && Math.abs(Math.log(a / b)) <= tolerance;
}

function normalizeBitmapAngle(value) {
  let n = Number(value) || 0;
  n = ((n + 180) % 360 + 360) % 360 - 180;
  if (Math.abs(n) < .0001) return 0;
  return Math.round(n * 100) / 100;
}

function sideSkinAngleDeg() {
  return normalizeBitmapAngle(state.sideSkinAngle);
}

function syncSkinAngle(value, redraw = true) {
  state.sideSkinAngle = normalizeBitmapAngle(value);
  updateFaceUvAngleControls();
  if (redraw) renderAll();
}

function selectedFaceUvAngle() {
  const face = selectedFace();
  return face ? normalizeBitmapAngle(face.bitmapAngle) : 0;
}

function setUvAngleInputs(value) {
  const n = normalizeBitmapAngle(value);
  if (els.skinAngle) els.skinAngle.value = String(Math.round(n));
  if (els.skinAngleValue) els.skinAngleValue.value = String(Math.round(n));
}

function updateFaceUvAngleControls() {
  const face = selectedFace();
  const enabled = !!face;
  setUvAngleInputs(enabled ? face.bitmapAngle : 0);
  if (els.importMirroredSkin && face && cleanBitmapKey(face.bitmapFaceKey)) {
    els.importMirroredSkin.checked = !!face.bitmapMirrorX;
  }
  for (const control of [els.skinAngle, els.skinAngleValue, els.orientUvToViewBtn, els.resetUvAngleBtn]) {
    if (control) control.disabled = !enabled;
  }
  document.querySelectorAll(".uv-rotate-btn").forEach((button) => { button.disabled = !enabled; });
  updateFaceColorControls();
  updateFaceUvTypeReadout();
  updateFaceUvTransformControls();
}

function updateFaceColorControls() {
  const face = selectedFace();
  const color = optionalHexColor(face?.faceColor);
  if (els.faceColor) {
    els.faceColor.disabled = !face;
    els.faceColor.value = color || normalizeHexColor(els.baseColor?.value);
  }
  if (els.clearFaceColorBtn) els.clearFaceColorBtn.disabled = !face || !color;
  if (els.averageFaceColorBtn) els.averageFaceColorBtn.disabled = !face || !currentSelectedFaceImage(face);
}

function setUvTransformInputs(transform = {}) {
  const clean = cleanBitmapUvTransform(transform);
  if (els.uvTransformX) els.uvTransformX.value = String(round(clean.x, 2));
  if (els.uvTransformXRange) els.uvTransformXRange.value = String(clamp(round(clean.x, 2), Number(els.uvTransformXRange.min), Number(els.uvTransformXRange.max)));
  if (els.uvTransformY) els.uvTransformY.value = String(round(clean.y, 2));
  if (els.uvTransformYRange) els.uvTransformYRange.value = String(clamp(round(clean.y, 2), Number(els.uvTransformYRange.min), Number(els.uvTransformYRange.max)));
  if (els.uvTransformRotation) els.uvTransformRotation.value = String(round(clean.rotation, 2));
  if (els.uvTransformRotationRange) els.uvTransformRotationRange.value = String(round(clean.rotation, 2));
  if (els.uvTransformScaleX) els.uvTransformScaleX.value = String(round(clean.scaleX, 3));
  if (els.uvTransformScaleXRange) els.uvTransformScaleXRange.value = String(clamp(round(clean.scaleX, 3), Number(els.uvTransformScaleXRange.min), Number(els.uvTransformScaleXRange.max)));
  if (els.uvTransformScaleY) els.uvTransformScaleY.value = String(round(clean.scaleY, 3));
  if (els.uvTransformScaleYRange) els.uvTransformScaleYRange.value = String(clamp(round(clean.scaleY, 3), Number(els.uvTransformScaleYRange.min), Number(els.uvTransformScaleYRange.max)));
}

function uvTransformControlPairs() {
  return [
    [els.uvTransformX, els.uvTransformXRange],
    [els.uvTransformY, els.uvTransformYRange],
    [els.uvTransformRotation, els.uvTransformRotationRange],
    [els.uvTransformScaleX, els.uvTransformScaleXRange],
    [els.uvTransformScaleY, els.uvTransformScaleYRange]
  ];
}

function uvTransformControls() {
  return uvTransformControlPairs().flat().filter(Boolean);
}

function uvScaleLinkEnabled() {
  return !!els.uvTransformScaleLink?.checked;
}

function setUvScaleControls(axis, value) {
  const numberControl = axis === "x" ? els.uvTransformScaleX : els.uvTransformScaleY;
  const rangeControl = axis === "x" ? els.uvTransformScaleXRange : els.uvTransformScaleYRange;
  const n = Number(value);
  if (!Number.isFinite(n)) return;
  const clean = round(clamp(n, 0.05, 20), 3);
  if (numberControl) numberControl.value = String(clean);
  if (rangeControl) rangeControl.value = String(clamp(clean, Number(rangeControl.min), Number(rangeControl.max)));
}

function syncLinkedUvScaleControls(source) {
  if (!uvScaleLinkEnabled()) return;
  if (source === els.uvTransformScaleX || source === els.uvTransformScaleXRange) {
    setUvScaleControls("y", source.value);
  } else if (source === els.uvTransformScaleY || source === els.uvTransformScaleYRange) {
    setUvScaleControls("x", source.value);
  }
}

function syncUvTransformControlPair(source) {
  const pair = uvTransformControlPairs().find(([numberControl, rangeControl]) => source === numberControl || source === rangeControl);
  if (!pair) return;
  const [numberControl, rangeControl] = pair;
  if (!numberControl || !rangeControl) return;
  if (source === rangeControl) {
    numberControl.value = rangeControl.value;
    syncLinkedUvScaleControls(source);
    return;
  }
  const value = Number(numberControl.value);
  if (!Number.isFinite(value)) return;
  rangeControl.value = String(clamp(value, Number(rangeControl.min), Number(rangeControl.max)));
  syncLinkedUvScaleControls(source);
}

function updateFaceUvTransformControls() {
  const targets = uvPropertyTargets();
  const face = targets[0] || null;
  const enabled = !!targets.length;
  const common = commonUvTransform(targets);
  setUvTransformInputs(common.transform);
  if (els.uvTransformWrap) {
    els.uvTransformWrap.value = cleanBitmapWrap(face?.bitmapWrap);
    els.uvTransformWrap.disabled = !enabled;
  }
  if (els.uvTransformScaleLink) els.uvTransformScaleLink.disabled = !enabled;
  if (els.copyFacePropertiesBtn) els.copyFacePropertiesBtn.disabled = !selectedFace();
  if (els.pasteFacePropertiesBtn) els.pasteFacePropertiesBtn.disabled = !targets.length || !state.facePropertyClipboard;
  if (els.removeFaceGroupUvBtn) els.removeFaceGroupUvBtn.disabled = selectedGroupTargetsForRemoval().length < 2;
  for (const control of [...uvTransformControls(), els.resetUvTransformBtn]) {
    if (control) control.disabled = !enabled;
  }
  if (els.uvPropertiesReadout) {
    if (!targets.length) {
      els.uvPropertiesReadout.textContent = "Select a face or face group to edit UV transform.";
    } else {
      const transform = common.transform;
      const uvInfo = faceUvTypeInfo(face);
      const mixed = common.mixed ? " | mixed" : "";
      const tileText = uvTileSummaryText(targets);
      els.uvPropertiesReadout.textContent = `${uvPropertyTargetLabel(targets)} | ${uvInfo.label} | ${cleanBitmapWrap(face.bitmapWrap)}${mixed}${tileText ? ` | ${tileText}` : ""} | X ${round(transform.x, 2)} Y ${round(transform.y, 2)} R ${round(transform.rotation, 2)} SX ${round(transform.scaleX, 3)} SY ${round(transform.scaleY, 3)}`;
    }
  }
}

function readUvTransformInputs() {
  return cleanBitmapUvTransform({
    x: els.uvTransformX?.value,
    y: els.uvTransformY?.value,
    rotation: els.uvTransformRotation?.value,
    scaleX: els.uvTransformScaleX?.value,
    scaleY: els.uvTransformScaleY?.value
  });
}

function applySelectedFaceUvTransformFromControls(options = {}) {
  const targets = uvPropertyTargets();
  if (!targets.length) {
    if (options.status !== false) setStatus("SELECT A FACE OR FACE GROUP FIRST.");
    updateFaceUvTransformControls();
    return;
  }
  const transform = readUvTransformInputs();
  const failed = targets.filter((face) => !bakeFaceUvTransform(face, transform, { updateControls: false })).length;
  updateFaceUvAngleControls();
  if (failed === targets.length) {
    if (options.status !== false) setStatus("SELECTION CANNOT BUILD A UV TEMPLATE.");
    updateFaceUvTransformControls();
    return;
  }
  if (options.normalizeInputs !== false) setUvTransformInputs(transform);
  if (options.status !== false) {
    const failedText = failed ? ` (${failed} skipped)` : "";
    setStatus(`${uvPropertyTargetLabel(targets).toUpperCase()} UV TEMPLATE TRANSFORM UPDATED${failedText}.`);
  }
  renderAll();
  syncLiveRenderPreviews();
}

function resetSelectedFaceUvTransform() {
  const targets = uvPropertyTargets();
  if (!targets.length) return setStatus("SELECT A FACE OR FACE GROUP FIRST.");
  const transform = { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 };
  const failed = targets.filter((face) => !bakeFaceUvTransform(face, transform, { updateControls: false })).length;
  updateFaceUvAngleControls();
  if (failed === targets.length) return setStatus("SELECTION CANNOT BUILD A UV TEMPLATE.");
  setUvTransformInputs(transform);
  const failedText = failed ? ` (${failed} skipped)` : "";
  setStatus(`${uvPropertyTargetLabel(targets).toUpperCase()} UV TEMPLATE TRANSFORM RESET${failedText}.`);
  renderAll();
  syncLiveRenderPreviews();
}

function setSelectedFaceBitmapWrap(value) {
  const targets = uvPropertyTargets();
  if (!targets.length) {
    setStatus("SELECT A FACE OR FACE GROUP FIRST.");
    updateFaceUvTransformControls();
    return;
  }
  const wrap = cleanBitmapWrap(value);
  for (const face of targets) {
    if (wrap === "clip") delete face.bitmapWrap;
    else face.bitmapWrap = wrap;
    if (mirrorActionsEnabled()) syncMirroredFace(face);
  }
  markPreviewSkinsDirty();
  setStatus(`${uvPropertyTargetLabel(targets).toUpperCase()} UV WRAP SET TO ${wrap.toUpperCase()}.`);
  renderAll();
  syncLiveRenderPreviews();
}

function setUvScaleLinkEnabled(enabled) {
  if (!els.uvTransformScaleLink) return;
  els.uvTransformScaleLink.checked = !!enabled;
  if (!enabled) return;
  setUvScaleControls("y", els.uvTransformScaleX?.value || 1);
  applySelectedFaceUvTransformFromControls({ normalizeInputs: false, status: false });
}

function cloneUvPoints(points) {
  return Array.isArray(points) ? points.map((p) => [round(Number(p[0]) || 0, 3), round(Number(p[1]) || 0, 3)]) : null;
}

function facePropertySnapshot(face) {
  if (!face) return null;
  const bitmapUv = cleanFaceBitmapUv(face);
  const bitmapUvTemplate = cleanFaceBitmapUvTemplate(face);
  const bitmapUvTransform = cleanBitmapUvTransform(face.bitmapUvTransform);
  const bitmapBaseW = Math.max(0, Math.round(Number(face.bitmapBaseW) || 0));
  const bitmapBaseH = Math.max(0, Math.round(Number(face.bitmapBaseH) || 0));
  const bitmapDecals = cleanFaceDecals(face.bitmapDecals);
  return {
    sourceFaceId: face.id,
    vertexCount: Array.isArray(face.verts) ? face.verts.length : 0,
    faceColor: optionalHexColor(face.faceColor) || "",
    bitmapSide: validBitmapFaceSide(face.bitmapSide) || "",
    bitmapFaceKey: cleanBitmapKey(face.bitmapFaceKey),
    bitmapUv: cloneUvPoints(bitmapUv),
    bitmapUvTemplate: cloneUvPoints(bitmapUvTemplate),
    bitmapUvTransform,
    bitmapBaseW,
    bitmapBaseH,
    bitmapAngle: normalizeBitmapAngle(face.bitmapAngle),
    bitmapMirrorX: !!face.bitmapMirrorX,
    bitmapWrap: cleanBitmapWrap(face.bitmapWrap),
    bitmapDecals: bitmapDecals.map((decal) => ({ ...decal }))
  };
}

function copySelectedFaceProperties() {
  const face = selectedFace();
  if (!face) {
    setStatus("SELECT A FACE TO COPY PROPERTIES FROM.");
    updateFaceUvTransformControls();
    return;
  }
  state.facePropertyClipboard = facePropertySnapshot(face);
  setStatus(`FACE #${face.id} PROPERTIES COPIED.`);
  updateFaceUvTransformControls();
}

function applyFacePropertySnapshot(face, props) {
  if (!face || !props) return false;
  const hasUvPayload = !!(props.bitmapUv?.length || props.bitmapUvTemplate?.length || props.bitmapBaseW || props.bitmapBaseH || !bitmapUvTransformIsDefault(props.bitmapUvTransform) || props.bitmapAngle);
  const uvCompatible = !hasUvPayload || Number(props.vertexCount) === (Array.isArray(face.verts) ? face.verts.length : 0);
  if (props.faceColor) face.faceColor = props.faceColor;
  else delete face.faceColor;
  if (props.bitmapSide) face.bitmapSide = props.bitmapSide;
  else delete face.bitmapSide;
  if (props.bitmapFaceKey) face.bitmapFaceKey = props.bitmapFaceKey;
  else delete face.bitmapFaceKey;
  if (props.bitmapMirrorX) face.bitmapMirrorX = true;
  else delete face.bitmapMirrorX;
  if (cleanBitmapWrap(props.bitmapWrap) !== "clip") face.bitmapWrap = cleanBitmapWrap(props.bitmapWrap);
  else delete face.bitmapWrap;
  if (props.bitmapDecals?.length) face.bitmapDecals = props.bitmapDecals.map((decal) => ({ ...decal }));
  else delete face.bitmapDecals;

  if (uvCompatible) {
    if (props.bitmapUv?.length) face.bitmapUv = cloneUvPoints(props.bitmapUv);
    else delete face.bitmapUv;
    if (props.bitmapUvTemplate?.length) face.bitmapUvTemplate = cloneUvPoints(props.bitmapUvTemplate);
    else delete face.bitmapUvTemplate;
    if (props.bitmapBaseW && props.bitmapBaseH) {
      face.bitmapBaseW = props.bitmapBaseW;
      face.bitmapBaseH = props.bitmapBaseH;
    } else {
      delete face.bitmapBaseW;
      delete face.bitmapBaseH;
    }
    if (bitmapUvTransformIsDefault(props.bitmapUvTransform)) delete face.bitmapUvTransform;
    else face.bitmapUvTransform = cleanBitmapUvTransform(props.bitmapUvTransform);
    if (props.bitmapAngle) face.bitmapAngle = props.bitmapAngle;
    else delete face.bitmapAngle;
  }
  if (mirrorActionsEnabled()) syncMirroredFace(face, { forceBitmapUv: uvCompatible });
  return !uvCompatible;
}

function pasteFacePropertiesToSelection() {
  const props = state.facePropertyClipboard;
  if (!props) {
    setStatus("COPY FACE PROPERTIES FIRST.");
    updateFaceUvTransformControls();
    return;
  }
  const targets = uniqueFaceList(selectedFacePropertyTargets());
  if (!targets.length) {
    setStatus("SELECT A FACE TO PASTE PROPERTIES TO.");
    updateFaceUvTransformControls();
    return;
  }
  const skippedUv = targets.filter((face) => applyFacePropertySnapshot(face, props)).length;
  markPreviewSkinsDirty();
  updateSkinReadout();
  updateFaceUvAngleControls();
  updateFaceUvTransformControls();
  updateFaceDecalControls();
  const targetText = targets.length === 1 ? `FACE #${targets[0].id}` : `${targets.length} FACES`;
  const skipText = skippedUv ? ` UV SKIPPED ON ${skippedUv} VERTEX-MISMATCHED FACE${skippedUv === 1 ? "" : "S"}.` : "";
  setStatus(`PASTED FACE #${props.sourceFaceId} PROPERTIES TO ${targetText}.${skipText}`);
  renderAll();
  syncLiveRenderPreviews();
}

function currentSelectedFaceImage(face = selectedFace()) {
  const key = cleanBitmapKey(face?.bitmapFaceKey);
  if (!key) return null;
  return state.faceSkinImages?.[key]?.naturalWidth ? state.faceSkinImages[key] : null;
}

function setSelectedFaceColor(value, message = "FACE COLOUR UPDATED.") {
  const face = selectedFace();
  if (!face) {
    setStatus("SELECT A FACE FIRST.");
    return;
  }
  const color = optionalHexColor(value);
  if (!color) {
    setStatus("CHOOSE A VALID FACE COLOUR.");
    updateFaceColorControls();
    return;
  }
  face.faceColor = color;
  if (mirrorActionsEnabled()) syncMirroredFace(face);
  setStatus(message);
  renderAll();
}

function clearSelectedFaceColor() {
  const face = selectedFace();
  if (!face) return setStatus("SELECT A FACE FIRST.");
  delete face.faceColor;
  if (mirrorActionsEnabled()) syncMirroredFace(face);
  setStatus(`FACE #${face.id} COLOUR CLEARED; BUILD WILL USE BITMAP AVERAGE WHEN AVAILABLE.`);
  renderAll();
}

function useSelectedFaceBitmapAverage() {
  const face = selectedFace();
  if (!face) return setStatus("SELECT A FACE FIRST.");
  const img = currentSelectedFaceImage(face);
  const color = averageImageColor(img);
  if (!color) return setStatus("NO LOADED FACE BITMAP TO SAMPLE.");
  setSelectedFaceColor(color, `FACE #${face.id} COLOUR SET FROM BITMAP AVERAGE (${color}).`);
}

function setSelectedFaceMirrorX(enabled) {
  const face = selectedFace();
  if (!face || !cleanBitmapKey(face.bitmapFaceKey)) return false;
  if (enabled) face.bitmapMirrorX = true;
  else delete face.bitmapMirrorX;
  if (mirrorActionsEnabled()) syncMirroredFace(face);
  markPreviewSkinsDirty();
  updateFaceUvAngleControls();
  setStatus(`FACE #${face.id} ${enabled ? "USES" : "CLEARED"} MIRRORED HALF UV.`);
  renderAll();
  return true;
}

function setFaceDecalControlValues(decal) {
  if (els.faceDecalX) els.faceDecalX.value = String(decal?.x ?? .5);
  if (els.faceDecalY) els.faceDecalY.value = String(decal?.y ?? .5);
  if (els.faceDecalScale) els.faceDecalScale.value = String(decal?.scale ?? .35);
  if (els.faceDecalAngle) els.faceDecalAngle.value = String(Math.round(decal?.angle || 0));
  if (els.faceDecalAlpha) els.faceDecalAlpha.value = String(decal?.alpha ?? .92);
}

function updateFaceDecalControls(preferredIndex = null) {
  const face = selectedFace();
  const decals = selectedFaceDecals(face);
  const previousValue = els.faceDecalSelector?.value || "";
  const selectedValue = preferredIndex == null ? previousValue : String(preferredIndex);
  const uiKey = JSON.stringify({
    faceId: face?.id || null,
    decals,
    selectedValue,
    hasFace: !!face
  });
  if (preferredIndex == null && state.faceDecalUiKey === uiKey) return;
  state.faceDecalUiKey = uiKey;
  const selector = els.faceDecalSelector;
  if (selector) {
    selector.replaceChildren();
    if (!decals.length) {
      const option = document.createElement("option");
      option.value = "";
      option.textContent = face ? "No face decals" : "Select a face";
      selector.append(option);
    } else {
      decals.forEach((decal, index) => {
        const option = document.createElement("option");
        option.value = String(index);
        option.textContent = `${index + 1}: ${decal.key}`;
        selector.append(option);
      });
      const current = Number(selectedValue);
      selector.value = String(clamp(current >= 0 ? current : 0, 0, decals.length - 1));
    }
  }
  const decal = selectedFaceDecal(face);
  setFaceDecalControlValues(decal);
  const enabled = !!decal;
  for (const control of [
    els.faceDecalSelector,
    els.faceDecalX,
    els.faceDecalY,
    els.faceDecalScale,
    els.faceDecalAngle,
    els.faceDecalAlpha,
    els.removeFaceDecalBtn,
    els.clearFaceDecalsBtn
  ]) {
    if (control) control.disabled = !face || (control !== els.clearFaceDecalsBtn && !enabled);
  }
}

function setSelectedFaceUvAngle(value, redraw = true, statusText = "") {
  const face = selectedFace();
  if (!face) {
    setStatus("SELECT A FACE FIRST.");
    updateFaceUvAngleControls();
    return false;
  }
  const angle = normalizeBitmapAngle(value);
  if (angle) face.bitmapAngle = angle;
  else delete face.bitmapAngle;
  if (mirrorActionsEnabled()) syncMirroredFace(face);
  setUvAngleInputs(angle);
  markPreviewSkinsDirty();
  if (statusText) setStatus(statusText);
  if (redraw) renderAll();
  return true;
}

function rotateSelectedFaceUvAngle(delta) {
  const face = selectedFace();
  const current = normalizeBitmapAngle(face ? face.bitmapAngle : 0);
  const next = normalizeBitmapAngle(current + Number(delta || 0));
  setSelectedFaceUvAngle(next, true, `FACE UV ANGLE ${next} DEGREES.`);
}

function skinAngleMetaValue(meta = {}) {
  const angle = meta.imageDecalAngle;
  if (Number.isFinite(angle)) return angle;
  if (angle && typeof angle === "object") {
    for (const side of ["top", "bottom", "back"]) {
      if (Number.isFinite(angle[side])) return angle[side];
    }
  }
  return 0;
}

function rotateTemplatePoint(p, width, height, angleDeg) {
  if (!angleDeg) return p;
  const a = angleDeg * Math.PI / 180;
  const c = Math.cos(a), s = Math.sin(a);
  const cx = width / 2, cy = height / 2;
  const dx = p.x - cx, dy = p.y - cy;
  return { x: cx + dx * c - dy * s, y: cy + dx * s + dy * c };
}

function mirroredTemplateU(u, foldX = TEMPLATE_SIZE / 2) {
  return clamp(foldX - Math.abs(foldX - u), 0, foldX);
}

function emptyMirrorFlags(value = false) {
  return { top: !!value, bottom: !!value, back: !!value };
}

function mirrorFlagsFromMeta(meta = {}) {
  const flags = meta.imageDecalMirrorX;
  if (flags === true) return emptyMirrorFlags(true);
  if (!flags || typeof flags !== "object") return emptyMirrorFlags(false);
  return {
    top: !!flags.top,
    bottom: !!flags.bottom,
    back: !!flags.back
  };
}

function emptySkinBundle(modelId = "", mirrorX = emptyMirrorFlags(false)) {
  return {
    modelId,
    top: null,
    bottom: null,
    back: null,
    mirrorX: { ...emptyMirrorFlags(false), ...mirrorX },
    source: { top: "", bottom: "", back: "" },
    urls: { top: "", bottom: "", back: "" },
    loaded: 0,
    failed: 0
  };
}

function skinSideMirrorX(side) {
  return !!state.skinImages?.mirrorX?.[side];
}

function currentModelMirrorFlags() {
  return mirrorFlagsFromMeta(gameLibrary()[templateShipId()]?.gameMeta || {});
}

function revokeSkinUrls(bundle = state.skinImages) {
  if (!bundle?.urls) return;
  for (const url of Object.values(bundle.urls)) {
    if (url) URL.revokeObjectURL(url);
  }
}

function revokeFaceSkinUrls() {
  for (const url of Object.values(state.faceSkinUrls || {})) {
    if (url) URL.revokeObjectURL(url);
  }
  state.faceSkinUrls = {};
}

function faceSkinCount() {
  return Object.values(state.faceSkinImages || {}).filter((img) => img?.complete && img.naturalWidth).length;
}

function markPreviewSkinsDirty() {
  state.previewSkinVersion = Math.max(Date.now(), (state.previewSkinVersion || 0) + 1);
}

function updateSkinReadout() {
  if (!els.skinReadout) return;
  const skin = state.skinImages;
  if (!skin?.modelId) {
    els.skinReadout.textContent = "No skin bitmaps loaded.";
    return;
  }
  const loaded = ["top", "bottom", "back"]
    .filter((side) => skin[side]?.complete && skin[side].naturalWidth)
    .map((side) => {
      const suffix = skin.source?.[side] === "imported" || skin.source?.[side] === "shelf" ? "*" : "";
      const mirror = skinSideMirrorX(side) ? " HALF" : "";
      return `${side.toUpperCase()} ${skin[side].naturalWidth}x${skin[side].naturalHeight}${mirror}${suffix}`;
    });
  const missing = 3 - loaded.length;
  const faceCount = faceSkinCount();
  const note = Object.values(skin.source || {}).some((source) => source === "imported" || source === "shelf")
    || Object.values(state.faceSkinSources || {}).some((source) => source === "imported" || source === "shelf")
    ? " *LOCAL" : "";
  els.skinReadout.textContent = `${skin.modelId.toUpperCase()} SKINS: ${loaded.length ? loaded.join(" / ") : "LOADING"}${faceCount ? ` / FACE ${faceCount}` : ""}${missing ? ` (${missing} missing/loading)` : ""}${note}`;
}

function skinPath(modelId, side) {
  return cacheBust(`../../assets/skins/${modelId}-${side}.png`);
}

function faceSkinPath(modelId, key) {
  return cacheBust(`../../assets/skins/${modelId}-face-${key}.png`);
}

function decalAssetPath(key) {
  const asset = state.toolServer.skins.find((item) => item.kind === "decal" && item.key === key);
  return asset?.url ? cacheBust(asset.url) : cacheBust(`../../assets/decals/${key}.png`);
}

function clearSkinBitmaps() {
  revokeSkinUrls();
  revokeFaceSkinUrls();
  state.skinImages = emptySkinBundle();
  state.faceSkinImages = {};
  state.faceSkinSources = {};
  state.decalImages = {};
  markPreviewSkinsDirty();
  updateSkinReadout();
  renderAll();
}

function loadSkinBitmaps(modelId = templateShipId(), mirrorX = null) {
  const cleanId = String(modelId || "").trim().replace(/[^a-zA-Z0-9_-]+/g, "_");
  if (!cleanId) return clearSkinBitmaps();
  revokeSkinUrls();
  revokeFaceSkinUrls();
  const bundle = emptySkinBundle(cleanId, mirrorX || mirrorFlagsFromMeta(gameLibrary()[cleanId]?.gameMeta || {}));
  state.skinImages = bundle;
  state.faceSkinImages = {};
  state.faceSkinSources = {};
  state.decalImages = {};
  markPreviewSkinsDirty();
  updateSkinReadout();
  const faceKeys = [...new Set(state.faces.map((face) => cleanBitmapKey(face.bitmapFaceKey)).filter(Boolean))];
  const textureLoad = {
    pending: 3 + faceKeys.length,
    settled: false
  };
  const settleTextureLoad = () => {
    if (state.skinImages !== bundle || textureLoad.settled) return;
    textureLoad.pending -= 1;
    if (textureLoad.pending > 0) return;
    textureLoad.settled = true;
    if (state.builderPreload.visible) {
      state.builderPreload.rendererResult = false;
      state.builderPreload.timeout = false;
      armBuilderPreloadTimeout("Post-texture renderer still warming; opening builder.");
    }
    markBuilderPreloadStep("textures", "Texture assets ready; warming renderer...");
    scheduleGamePreviewSync(0, true);
  };
  for (const side of ["top", "bottom", "back"]) {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      if (state.skinImages !== bundle) return;
      bundle.loaded++;
      bundle.source[side] = "asset";
      markPreviewSkinsDirty();
      updateSkinReadout();
      renderAll();
      settleTextureLoad();
    };
    img.onerror = () => {
      if (state.skinImages !== bundle) return;
      bundle.failed++;
      updateSkinReadout();
      settleTextureLoad();
    };
    img.src = skinPath(cleanId, side);
    bundle[side] = img;
  }
  for (const key of faceKeys) {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      if (state.skinImages !== bundle) return;
      state.faceSkinSources[key] = "asset";
      markPreviewSkinsDirty();
      updateSkinReadout();
      renderAll();
      settleTextureLoad();
    };
    img.onerror = () => {
      if (state.skinImages !== bundle) return;
      delete state.faceSkinImages[key];
      updateSkinReadout();
      settleTextureLoad();
    };
    img.src = faceSkinPath(cleanId, key);
    state.faceSkinImages[key] = img;
  }
  const decalKeys = [...new Set(state.faces.flatMap((face) => cleanFaceDecals(face.bitmapDecals).map((decal) => decal.key)))];
  for (const key of decalKeys) loadDecalImage(key);
  setTimeout(() => {
    if (state.skinImages !== bundle || textureLoad.settled) return;
    textureLoad.settled = true;
    if (state.builderPreload.visible) {
      state.builderPreload.rendererResult = false;
      state.builderPreload.timeout = false;
      armBuilderPreloadTimeout("Post-texture renderer still warming; opening builder.");
    }
    markBuilderPreloadStep("textures", "Texture requests still settling; opening builder.");
    scheduleGamePreviewSync(0, true);
  }, 2200);
}

function bitmapShelfItemById(id) {
  return state.bitmapShelf.find((entry) => entry.id === id) || null;
}

function selectedBitmapShelfItem() {
  return bitmapShelfItemById(state.selectedBitmapShelfId) || bitmapShelfItemById(els.bitmapShelfSelector?.value);
}

function bitmapShelfItemKind(item) {
  if (!item) return "";
  if (item.source === "imported") return "imported";
  return item.asset?.kind || "other";
}

function bitmapShelfItemCategory(item) {
  if (item?.source === "imported") return "imported";
  return item?.asset?.category || "other";
}

function bitmapShelfItemModel(item) {
  return item?.asset?.model || "";
}

function bitmapShelfItemTarget(item) {
  if (!item) return "";
  if (item.source === "imported") return "import";
  if (item.asset?.kind === "face") return "face";
  if (item.asset?.kind === "side") return item.asset.side || "side";
  return item.asset?.kind || "other";
}

function bitmapShelfItemTitle(item) {
  if (!item) return "UV asset";
  if (item.source === "imported") return item.name || "Imported UV";
  if (item.asset?.kind === "face") return item.asset.key || item.name || "face";
  if (item.asset?.kind === "decal") return item.asset.key || item.name || "decal";
  if (item.asset?.kind === "side") return item.asset.side || item.name || "side";
  return item.name || item.asset?.file || "UV asset";
}

function bitmapShelfItemMeta(item) {
  if (!item) return "";
  const dims = item.img?.naturalWidth && item.img?.naturalHeight
    ? `${item.img.naturalWidth}x${item.img.naturalHeight}`
    : "";
  if (item.source === "imported") return ["Imported", dims].filter(Boolean).join(" | ");
  const shared = Array.isArray(item.asset?.aliases) && item.asset.aliases.length > 1
    ? `shared x${item.asset.aliases.length}`
    : "";
  const models = Array.isArray(item.asset?.aliases)
    ? [...new Set(item.asset.aliases.map((asset) => asset.model).filter(Boolean))].join(", ")
    : item.asset?.model || "shared";
  const bits = [
    models || "shared",
    bitmapShelfItemTarget(item).toUpperCase(),
    shared,
    dims
  ].filter(Boolean);
  return bits.join(" | ");
}

function bitmapShelfItemSearchText(item) {
  return [
    item?.name,
    item?.source,
    item?.asset?.file,
    item?.asset?.model,
    item?.asset?.kind,
    item?.asset?.key,
    item?.asset?.side,
    item?.asset?.category,
    ...(Array.isArray(item?.asset?.aliases)
      ? item.asset.aliases.flatMap((asset) => [asset.file, asset.model, asset.key, asset.side, asset.category])
      : [])
  ].filter(Boolean).join(" ").toLowerCase();
}

function bitmapShelfFilters() {
  return {
    category: els.assetShelfCategory?.value || "all",
    kind: els.assetShelfKind?.value || "all",
    model: els.assetShelfModel?.value || "all",
    query: (els.assetShelfSearch?.value || "").trim().toLowerCase()
  };
}

function bitmapShelfItemMatchesFilters(item, filters = bitmapShelfFilters()) {
  if (!item) return false;
  if (filters.category !== "all" && bitmapShelfItemCategory(item) !== filters.category) return false;
  const kind = bitmapShelfItemKind(item);
  const target = bitmapShelfItemTarget(item);
  if (filters.kind === "imported" && item.source !== "imported") return false;
  if (filters.kind === "face" && kind !== "face") return false;
  if (filters.kind === "side" && kind !== "side") return false;
  if (filters.kind === "decal" && kind !== "decal") return false;
  if (["top", "bottom", "back"].includes(filters.kind) && target !== filters.kind) return false;
  if (filters.model === "current") {
    const model = bitmapShelfItemModel(item);
    if (model && model !== templateShipId()) return false;
  } else if (filters.model !== "all") {
    if (bitmapShelfItemModel(item) !== filters.model) return false;
  }
  if (filters.query && !bitmapShelfItemSearchText(item).includes(filters.query)) return false;
  return true;
}

function skinAssetMatchesFilters(asset, filters = bitmapShelfFilters()) {
  if (!asset) return false;
  if (filters.category !== "all" && asset.category !== filters.category) return false;
  if (filters.kind === "imported") return false;
  if (filters.kind === "face" && asset.kind !== "face") return false;
  if (filters.kind === "side" && asset.kind !== "side") return false;
  if (filters.kind === "decal" && asset.kind !== "decal") return false;
  if (["top", "bottom", "back"].includes(filters.kind) && asset.side !== filters.kind) return false;
  if (filters.model === "current" && asset.model && asset.model !== templateShipId()) return false;
  if (filters.model !== "all" && filters.model !== "current" && asset.model !== filters.model) return false;
  if (filters.query) {
    const text = [asset.file, asset.model, asset.kind, asset.key, asset.side, asset.category]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    if (!text.includes(filters.query)) return false;
  }
  return true;
}

function shelfHasAsset(asset) {
  if (!asset?.file) return false;
  return state.bitmapShelf.some((item) => {
    if (item.asset?.file === asset.file) return true;
    return Array.isArray(item.asset?.aliases) && item.asset.aliases.some((alias) => alias.file === asset.file);
  });
}

function assetAliasSummary(asset) {
  return {
    file: asset.file,
    model: asset.model,
    kind: asset.kind,
    key: asset.key,
    side: asset.side,
    category: asset.category,
    bytes: asset.bytes,
    hash: asset.hash,
    url: asset.url
  };
}

function skinAssetDuplicateGroupKey(asset) {
  if (!asset?.hash || asset.kind === "decal") return "";
  const target = asset.kind === "face"
    ? `face:${asset.key || ""}`
    : asset.kind === "side"
      ? `side:${asset.side || ""}`
      : asset.kind || "other";
  return `${target}:${asset.hash}`;
}

function collapseDuplicateSkinAssets(assets) {
  const groups = new Map();
  const passthrough = [];
  for (const asset of assets) {
    const key = skinAssetDuplicateGroupKey(asset);
    if (!key) {
      passthrough.push(asset);
      continue;
    }
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(asset);
  }
  const currentModel = templateShipId();
  const collapsed = [...groups.values()].map((group) => {
    const sorted = [...group].sort((a, b) => {
      const aCurrent = a.model === currentModel ? 0 : 1;
      const bCurrent = b.model === currentModel ? 0 : 1;
      return aCurrent - bCurrent || a.file.localeCompare(b.file);
    });
    if (sorted.length === 1) return sorted[0];
    const aliases = sorted.map(assetAliasSummary);
    return {
      ...sorted[0],
      aliases,
      duplicateCount: sorted.length,
      duplicateFiles: aliases.map((asset) => asset.file)
    };
  });
  return [...collapsed, ...passthrough].sort((a, b) => (a.file || "").localeCompare(b.file || ""));
}

function updateSelectedBitmapReadout() {
  const item = selectedBitmapShelfItem();
  if (!item) {
    if (els.selectedBitmapReadout) {
      els.selectedBitmapReadout.textContent = state.bitmapShelf.length
        ? "No UV selected."
        : "Load project UVs or add PNGs to start.";
    }
    if (els.selectedAssetThumb) {
      els.selectedAssetThumb.removeAttribute("src");
      els.selectedAssetThumb.classList.add("is-empty");
    }
    if (els.selectedAssetCard) {
      els.selectedAssetCard.setAttribute("aria-label", "Open asset library");
      els.selectedAssetCard.title = "Open asset library";
    }
    return;
  }
  const face = selectedFace();
  const target = face ? `FACE #${face.id}` : "NO FACE SELECTED";
  const title = bitmapShelfItemTitle(item);
  const meta = bitmapShelfItemMeta(item);
  if (els.selectedBitmapReadout) {
    els.selectedBitmapReadout.textContent = `${title} | ${meta} | TARGET ${target}`;
  }
  if (els.selectedAssetThumb) {
    els.selectedAssetThumb.src = item.img?.currentSrc || item.img?.src || item.asset?.url || "";
    els.selectedAssetThumb.classList.remove("is-empty");
  }
  if (els.selectedAssetCard) {
    els.selectedAssetCard.setAttribute("aria-label", `Selected asset ${title}; open asset library`);
    els.selectedAssetCard.title = `${title} | ${meta}`;
  }
}

function bitmapShelfItemBelongsToCurrentModel(item) {
  return item?.source === "asset" && skinAssetBelongsToCurrentModel(item.asset);
}

function bitmapShelfItemIsLocal(item) {
  return item && item.source !== "asset";
}

function bitmapShelfSharedItems() {
  const filters = bitmapShelfFilters();
  return state.bitmapShelf.filter((item) => item.source === "asset" && bitmapShelfItemMatchesFilters(item, filters));
}

function renderBitmapAssetCard(item, selectedId) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `bitmap-asset-card${item.id === selectedId ? " selected" : ""}`;
  button.dataset.shelfId = item.id;
  button.title = item.name || item.asset?.file || "UV asset";

  const thumb = document.createElement("span");
  thumb.className = "bitmap-asset-thumb";
  const img = document.createElement("img");
  img.alt = "";
  img.decoding = "async";
  img.src = item.img?.currentSrc || item.img?.src || item.asset?.url || "";
  thumb.append(img);

  const title = document.createElement("span");
  title.className = "bitmap-asset-title";
  title.textContent = bitmapShelfItemTitle(item);

  const meta = document.createElement("span");
  meta.className = "bitmap-asset-meta";
  meta.textContent = bitmapShelfItemMeta(item);

  const tag = document.createElement("span");
  tag.className = `bitmap-asset-tag bitmap-asset-tag-${bitmapShelfItemTarget(item)}`;
  tag.textContent = bitmapShelfItemTarget(item).toUpperCase();

  button.append(thumb, title, meta, tag);
  if (item.source === "asset" && item.asset?.file) {
    const replaceBtn = document.createElement("span");
    replaceBtn.className = "bitmap-asset-replace";
    replaceBtn.dataset.replaceAssetId = item.id;
    replaceBtn.title = `Replace ${item.asset.file}`;
    replaceBtn.textContent = "RPL";
    button.append(replaceBtn);

    const deleteBtn = document.createElement("span");
    deleteBtn.className = "bitmap-asset-delete";
    deleteBtn.dataset.deleteAssetId = item.id;
    deleteBtn.title = `Delete ${item.asset.file}`;
    deleteBtn.textContent = "DEL";
    button.append(deleteBtn);
  }
  return button;
}

function renderBitmapAssetGrid(grid, items, selectedId, emptyText) {
  if (!grid) return;
  grid.replaceChildren();
  if (!items.length) {
    const empty = document.createElement("div");
    empty.className = "bitmap-asset-empty";
    empty.textContent = emptyText;
    grid.append(empty);
    return;
  }
  for (const item of items) {
    grid.append(renderBitmapAssetCard(item, selectedId));
  }
}

function updateBitmapAssetGrid() {
  const selectedId = state.selectedBitmapShelfId || els.bitmapShelfSelector?.value || "";
  const currentItems = state.bitmapShelf.filter(bitmapShelfItemBelongsToCurrentModel);
  const localItems = state.bitmapShelf.filter(bitmapShelfItemIsLocal);
  const sharedItems = bitmapShelfSharedItems();
  const activeSelectedId = bitmapShelfItemById(selectedId) ? selectedId : "";
  renderBitmapAssetGrid(
    els.currentBitmapAssetGrid,
    currentItems,
    activeSelectedId,
    "No current ship UVs loaded. Use Load Current Ship UVs."
  );
  renderBitmapAssetGrid(
    els.localBitmapAssetGrid,
    localItems,
    activeSelectedId,
    "No loaded unsaved PNGs."
  );
  renderBitmapAssetGrid(
    els.bitmapAssetGrid,
    sharedItems,
    activeSelectedId,
    state.bitmapShelf.some((item) => item.source === "asset") ? "No shared UVs match these filters." : "No shared UV thumbnails loaded."
  );
  if (!activeSelectedId && state.bitmapShelf[0] && els.bitmapShelfSelector) {
    state.selectedBitmapShelfId = state.bitmapShelf[0].id;
    els.bitmapShelfSelector.value = state.bitmapShelf[0].id;
    updateBitmapAssetGrid();
    return;
  }
  updateSelectedBitmapReadout();
}

function selectBitmapShelfItem(id) {
  if (!els.bitmapShelfSelector || !id) return;
  state.selectedBitmapShelfId = id;
  els.bitmapShelfSelector.value = id;
  updateBitmapAssetGrid();
  updateSelectedBitmapReadout();
}

function populateAssetModelSelector(skins = state.toolServer.skins) {
  if (!els.assetShelfModel) return;
  const current = els.assetShelfModel.value || "all";
  const models = [...new Set([
    ...skins.map((skin) => skin.model).filter(Boolean),
    ...state.bitmapShelf.map((item) => item.asset?.model).filter(Boolean)
  ])].sort((a, b) => a.localeCompare(b));
  els.assetShelfModel.innerHTML = "";
  const base = [
    ["all", "All models"],
    ["current", "Current model"]
  ];
  for (const [value, label] of base) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label;
    els.assetShelfModel.append(option);
  }
  for (const model of models) {
    const option = document.createElement("option");
    option.value = model;
    option.textContent = model;
    els.assetShelfModel.append(option);
  }
  if ([...els.assetShelfModel.options].some((option) => option.value === current)) {
    els.assetShelfModel.value = current;
  }
}

function updateBitmapShelfSelector() {
  if (!els.bitmapShelfSelector) return;
  const current = els.bitmapShelfSelector.value;
  els.bitmapShelfSelector.innerHTML = "";
  if (!state.bitmapShelf.length) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "No imported bitmaps";
    els.bitmapShelfSelector.append(option);
    updateBitmapAssetGrid();
    return;
  }
  for (const item of state.bitmapShelf) {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = `${item.name} (${item.img.naturalWidth}x${item.img.naturalHeight})`;
    els.bitmapShelfSelector.append(option);
  }
  if (current && bitmapShelfItemById(current)) els.bitmapShelfSelector.value = current;
  if (state.selectedBitmapShelfId && !bitmapShelfItemById(state.selectedBitmapShelfId)) state.selectedBitmapShelfId = "";
  if (!state.selectedBitmapShelfId && current && bitmapShelfItemById(current)) state.selectedBitmapShelfId = current;
  updateBitmapAssetGrid();
}

function addBitmapToShelf(file, img, url) {
  const id = `bitmap_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  state.bitmapShelf.push({ id, name: file.name || "imported bitmap", img, url, source: "imported" });
  updateBitmapShelfSelector();
  selectBitmapShelfItem(id);
  return id;
}

function addBitmapAssetToShelf(asset) {
  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      const id = `asset_${asset.file}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
      const label = asset.kind === "face"
        ? `${asset.category}/${asset.model} face ${asset.key}`
        : asset.kind === "decal"
          ? `decal/${asset.key}`
          : `${asset.category}/${asset.model} ${asset.side}`;
      if (asset.kind === "decal" && asset.key) state.decalImages[asset.key] = img;
      state.bitmapShelf.push({
        id,
        name: label,
        img,
        url: "",
        source: "asset",
        asset
      });
      resolve(true);
    };
    img.onerror = () => resolve(false);
    img.src = cacheBust(asset.url);
  });
}

function assetAliasForCurrentModel(asset) {
  if (!asset || !Array.isArray(asset.aliases)) return asset;
  const currentModel = templateShipId();
  return asset.aliases.find((alias) => alias.model === currentModel) || asset;
}

function skinAssetBelongsToCurrentModel(asset) {
  const currentModel = templateShipId();
  if (!asset || !currentModel) return false;
  if (asset.model === currentModel) return true;
  return Array.isArray(asset.aliases) && asset.aliases.some((alias) => alias.model === currentModel);
}

function populateAssetCategorySelector(categories = []) {
  if (!els.assetShelfCategory) return;
  const current = els.assetShelfCategory.value || "all";
  const options = ["all", "imported", ...categories.filter((cat) => cat && cat !== "all" && cat !== "imported")];
  els.assetShelfCategory.innerHTML = "";
  for (const category of options) {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category === "all"
      ? "All assets"
      : category === "imported"
        ? "Imported"
        : category;
    els.assetShelfCategory.append(option);
  }
  if (options.includes(current)) els.assetShelfCategory.value = current;
}

async function refreshAvailableSkinAssets() {
  if (!await requireToolServer()) return null;
  const data = await apiJson("/api/skins", { method: "GET" });
  state.toolServer.skins = Array.isArray(data.skins) ? data.skins : [];
  populateAssetCategorySelector(data.categories || []);
  populateAssetModelSelector(state.toolServer.skins);
  return state.toolServer.skins;
}

async function loadAssetShelf() {
  try {
    const skins = await refreshAvailableSkinAssets();
    if (!skins) return;
    const filters = bitmapShelfFilters();
    const selected = collapseDuplicateSkinAssets(skins.filter((skin) => skinAssetMatchesFilters(skin, filters)));
    let loaded = 0;
    let skipped = 0;
    for (const asset of selected) {
      if (shelfHasAsset(asset)) {
        skipped++;
        continue;
      }
      if (await addBitmapAssetToShelf(asset)) loaded++;
    }
    updateBitmapShelfSelector();
    if (!selectedBitmapShelfItem() && state.bitmapShelf[0]) selectBitmapShelfItem(state.bitmapShelf[0].id);
    const skippedText = skipped ? `, ${skipped} ALREADY LOADED` : "";
    setStatus(`${loaded} MATCHING UV${loaded === 1 ? "" : "S"} LOADED${skippedText}.`);
  } catch (error) {
    setStatus(`ASSET SHELF LOAD FAILED: ${error.message}`);
  }
}

async function loadCurrentShipAssets() {
  try {
    const skins = await refreshAvailableSkinAssets();
    if (!skins) return;
    const selected = collapseDuplicateSkinAssets(skins.filter(skinAssetBelongsToCurrentModel));
    let loaded = 0;
    let skipped = 0;
    for (const asset of selected) {
      if (shelfHasAsset(asset)) {
        skipped++;
        continue;
      }
      if (await addBitmapAssetToShelf(asset)) loaded++;
    }
    updateBitmapShelfSelector();
    const firstCurrent = state.bitmapShelf.find(bitmapShelfItemBelongsToCurrentModel);
    if (firstCurrent) selectBitmapShelfItem(firstCurrent.id);
    const skippedText = skipped ? `, ${skipped} ALREADY LOADED` : "";
    setStatus(`${loaded} CURRENT SHIP UV${loaded === 1 ? "" : "S"} LOADED${skippedText}.`);
  } catch (error) {
    setStatus(`CURRENT SHIP UV LOAD FAILED: ${error.message}`);
  }
}

function currentModelUsageForAsset(asset) {
  const currentAsset = assetAliasForCurrentModel(asset);
  const modelId = templateShipId();
  if (!currentAsset || !modelId) return null;
  const faces = state.faces || [];
  let count = 0;
  if (currentAsset.kind === "face" && currentAsset.model === modelId) {
    count = faces.filter((face) => cleanBitmapKey(face.bitmapFaceKey) === currentAsset.key).length;
  } else if (currentAsset.kind === "side" && currentAsset.model === modelId) {
    count = faces.filter((face) => !cleanBitmapKey(face.bitmapFaceKey)).length;
  } else if (currentAsset.kind === "decal") {
    count = faces.reduce((sum, face) => {
      const decals = cleanFaceDecals(face.bitmapDecals);
      return sum + decals.filter((decal) => cleanBitmapKey(decal.key) === currentAsset.key).length;
    }, 0);
  }
  if (!count) return null;
  return {
    id: modelId,
    name: `${els.shipName.value.trim() || modelId} (current unsaved Builder model)`,
    file: "in memory",
    count,
    current: true
  };
}

function mergeAssetUsage(savedUsage = [], currentUsage = null) {
  const merged = Array.isArray(savedUsage) ? savedUsage.map((entry) => ({ ...entry })) : [];
  if (currentUsage) {
    const existing = merged.find((entry) => entry.id === currentUsage.id && entry.file !== "in memory");
    if (existing) existing.currentCount = currentUsage.count;
    else merged.unshift(currentUsage);
  }
  return merged;
}

function assetUsageLine(entry) {
  const bits = [`${entry.name || entry.id || "Unknown model"}`];
  if (entry.current) bits.push("current Builder model");
  else if (entry.currentCount) bits.push(`current Builder model ${entry.currentCount}`);
  if (Number.isFinite(Number(entry.count)) && entry.count > 0) bits.push(`${entry.count} reference${entry.count === 1 ? "" : "s"}`);
  if (entry.file && entry.file !== "in memory") bits.push(entry.file);
  return `- ${bits.join(" | ")}`;
}

async function assetUsageForConfirmation(asset) {
  const currentUsage = currentModelUsageForAsset(asset);
  const usageResult = await apiJson(`/api/skins/usage?file=${encodeURIComponent(asset.file)}`, { method: "GET" });
  return mergeAssetUsage(usageResult.usage, currentUsage);
}

function replacementMimeAllowed(asset, file) {
  const ext = String(asset?.file || "").split(".").pop()?.toLowerCase() || "";
  if (ext === "png") return file.type === "image/png";
  if (ext === "jpg" || ext === "jpeg") return file.type === "image/jpeg";
  if (ext === "svg") return file.type === "image/svg+xml";
  return file.type.startsWith("image/");
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Replacement image could not be read."));
    reader.readAsDataURL(file);
  });
}

let pendingReplaceAssetId = "";

function beginReplaceBitmapAsset(itemId) {
  const item = bitmapShelfItemById(itemId);
  if (!item?.asset?.file) {
    setStatus("SELECT A PROJECT ASSET TO REPLACE.");
    return;
  }
  pendingReplaceAssetId = itemId;
  if (els.replaceAssetInput) {
    els.replaceAssetInput.value = "";
    els.replaceAssetInput.click();
  }
}

function clearCurrentModelDeletedAssetReferences(asset) {
  const currentAsset = assetAliasForCurrentModel(asset);
  const modelId = templateShipId();
  if (!currentAsset || !modelId) return;
  let changed = false;
  if (currentAsset.kind === "face" && currentAsset.model === modelId) {
    for (const face of state.faces) {
      if (cleanBitmapKey(face.bitmapFaceKey) !== currentAsset.key) continue;
      delete face.bitmapFaceKey;
      delete face.bitmapUv;
      delete face.bitmapBaseW;
      delete face.bitmapBaseH;
      delete face.bitmapAngle;
      delete face.bitmapMirrorX;
      delete face.bitmapWrap;
      changed = true;
    }
  } else if (currentAsset.kind === "side" && currentAsset.model === modelId) {
    clearSkinSide(currentAsset.side);
    for (const face of state.faces) {
      if (face.bitmapSide !== currentAsset.side) continue;
      delete face.bitmapSide;
      changed = true;
    }
  } else if (currentAsset.kind === "decal") {
    for (const face of state.faces) {
      const decals = cleanFaceDecals(face.bitmapDecals);
      const next = decals.filter((decal) => cleanBitmapKey(decal.key) !== currentAsset.key);
      if (next.length === decals.length) continue;
      if (next.length) face.bitmapDecals = next;
      else delete face.bitmapDecals;
      changed = true;
    }
  }
  if (!changed) return;
  markPreviewSkinsDirty();
  updateFaceUvAngleControls();
  updateFaceDecalControls();
  renderAll();
}

async function replaceBitmapAsset(itemId, file) {
  const item = bitmapShelfItemById(itemId);
  const asset = item?.asset;
  if (!asset?.file || !file) return;
  if (!replacementMimeAllowed(asset, file)) {
    setStatus(`REPLACEMENT TYPE MUST MATCH ${asset.file}.`);
    return;
  }
  if (!await requireToolServer()) return;
  try {
    const usage = await assetUsageForConfirmation(asset);
    const usageText = usage.length
      ? usage.map(assetUsageLine).join("\n")
      : "- No saved or current model references found.";
    const aliasText = Array.isArray(asset.aliases) && asset.aliases.length > 1
      ? `\n\nThis thumbnail groups ${asset.aliases.length} identical asset files. This will replace only:\n${asset.file}`
      : "";
    const ok = confirmWrite(`Replace asset file ${asset.file} with ${file.name}?${aliasText}\n\nThis will change the appearance of:\n${usageText}`);
    if (!ok) {
      setStatus("ASSET REPLACE CANCELLED.");
      return;
    }
    const dataUrl = await fileToDataUrl(file);
    setStatus(`REPLACING ${asset.file}...`);
    const result = await apiJson("/api/skins", {
      method: "PUT",
      body: JSON.stringify({ file: asset.file, dataUrl })
    });
    state.assetVersion = Date.now();
    state.bitmapShelf = state.bitmapShelf.filter((entry) => entry.asset?.file !== asset.file);
    updateBitmapShelfSelector();
    await refreshAvailableSkinAssets();
    setStatus(`ASSET REPLACED: ${result.replaced}.`);
  } catch (error) {
    setStatus(`ASSET REPLACE FAILED: ${error.message}`);
  }
}

async function deleteBitmapAsset(itemId) {
  const item = bitmapShelfItemById(itemId);
  const asset = item?.asset;
  if (!asset?.file) {
    setStatus("SELECT A PROJECT ASSET TO DELETE.");
    return;
  }
  if (!await requireToolServer()) return;
  try {
    const usage = await assetUsageForConfirmation(asset);
    const usageText = usage.length
      ? usage.map(assetUsageLine).join("\n")
      : "- No saved or current model references found.";
    const aliasText = Array.isArray(asset.aliases) && asset.aliases.length > 1
      ? `\n\nThis thumbnail groups ${asset.aliases.length} identical asset files. This will delete only:\n${asset.file}`
      : "";
    const ok = confirmWrite(`Delete asset file ${asset.file}?${aliasText}\n\nUsed in:\n${usageText}`);
    if (!ok) {
      setStatus("ASSET DELETE CANCELLED.");
      return;
    }
    setStatus(`DELETING ${asset.file}...`);
    const result = await apiJson("/api/skins", {
      method: "DELETE",
      body: JSON.stringify({ file: asset.file })
    });
    clearCurrentModelDeletedAssetReferences(asset);
    state.assetVersion = Date.now();
    state.bitmapShelf = state.bitmapShelf.filter((entry) => entry.asset?.file !== asset.file);
    if (state.selectedBitmapShelfId && !bitmapShelfItemById(state.selectedBitmapShelfId)) state.selectedBitmapShelfId = "";
    updateBitmapShelfSelector();
    await refreshAvailableSkinAssets();
    setStatus(`ASSET DELETED: ${result.deleted}.`);
  } catch (error) {
    setStatus(`ASSET DELETE FAILED: ${error.message}`);
  }
}

function clearBitmapShelf() {
  for (const item of state.bitmapShelf) {
    if (item.url) URL.revokeObjectURL(item.url);
  }
  state.bitmapShelf = [];
  state.selectedBitmapShelfId = "";
  updateBitmapShelfSelector();
  populateAssetModelSelector();
  setStatus("BITMAP SHELF CLEARED.");
}

function setSkinSideFromImage(side, img, source = "imported", url = "", mirrorX = importMirroredSkinEnabled()) {
  const oldUrl = state.skinImages.urls?.[side];
  if (oldUrl && oldUrl !== url) URL.revokeObjectURL(oldUrl);
  if (!state.skinImages?.modelId) {
    state.skinImages = emptySkinBundle(templateShipId());
  }
  if (!state.skinImages.mirrorX) state.skinImages.mirrorX = emptyMirrorFlags(false);
  state.skinImages[side] = img;
  state.skinImages.mirrorX[side] = mirrorX == null ? !!currentModelMirrorFlags()[side] : !!mirrorX;
  state.skinImages.source[side] = source;
  state.skinImages.urls[side] = url;
  markPreviewSkinsDirty();
  updateSkinReadout();
  renderAll();
}

function loadDecalImage(key, url = "") {
  const cleanKey = cleanBitmapKey(key);
  if (!cleanKey) return null;
  if (state.decalImages[cleanKey]?.naturalWidth) return state.decalImages[cleanKey];
  const img = new Image();
  img.decoding = "async";
  img.onload = () => {
    markPreviewSkinsDirty();
    renderAll();
  };
  img.onerror = () => {
    delete state.decalImages[cleanKey];
    updateFaceDecalControls();
  };
  img.src = cacheBust(url || decalAssetPath(cleanKey));
  state.decalImages[cleanKey] = img;
  return img;
}

function selectedFaceSkinKey(face) {
  if (!face) return "";
  const fallback = `face-${face.id}`;
  return cleanBitmapKey(face.bitmapFaceKey, fallback);
}

function faceSkinKeyUsage(key, excludeFace = null) {
  const cleanKey = cleanBitmapKey(key);
  if (!cleanKey) return 0;
  return state.faces.filter((face) => face !== excludeFace && cleanBitmapKey(face.bitmapFaceKey) === cleanKey).length;
}

function uniqueFaceSkinKey(face, preferred = "") {
  const base = cleanBitmapKey(preferred || `face-${face?.id || Date.now()}`, `face-${face?.id || Date.now()}`);
  if (!faceSkinKeyUsage(base, face)) return base;
  const faceSuffix = cleanBitmapKey(`${base}-${face?.id || "copy"}`, base);
  if (!faceSkinKeyUsage(faceSuffix, face)) return faceSuffix;
  let i = 2;
  while (faceSkinKeyUsage(`${faceSuffix}-${i}`, face)) i++;
  return `${faceSuffix}-${i}`;
}

function selectedFaceSkinTargetKey(face, options = {}) {
  const requested = cleanBitmapKey(options.key);
  if (requested) return options.shareKey ? requested : uniqueFaceSkinKey(face, requested);
  const current = selectedFaceSkinKey(face);
  // Face import/update is face-only by default; shared assets stay shared only when deliberately selected.
  return faceSkinKeyUsage(current, face) ? uniqueFaceSkinKey(face) : current;
}

function faceSkinKeyUsageOutsideGroup(key, faces) {
  const cleanKey = cleanBitmapKey(key);
  if (!cleanKey) return 0;
  const group = new Set(faces);
  return state.faces.filter((face) => !group.has(face) && cleanBitmapKey(face.bitmapFaceKey) === cleanKey).length;
}

function uniqueFaceGroupSkinKey(preferred, faces) {
  const base = cleanBitmapKey(preferred || `face_group_${Date.now()}`, `face_group_${Date.now()}`);
  if (!faceSkinKeyUsageOutsideGroup(base, faces)) return base;
  const suffix = cleanBitmapKey(`${base}-group`, base);
  if (!faceSkinKeyUsageOutsideGroup(suffix, faces)) return suffix;
  let i = 2;
  while (faceSkinKeyUsageOutsideGroup(`${suffix}-${i}`, faces)) i++;
  return `${suffix}-${i}`;
}

function bitmapItemPreferredFaceKey(item) {
  if (!item) return "";
  const asset = item.source === "asset" ? assetAliasForCurrentModel(item.asset) : null;
  if (asset?.kind === "face" && asset.key) return asset.key;
  if (asset?.model && asset?.side) return `${asset.model}_${asset.side}`;
  if (asset?.model && asset?.key) return `${asset.model}_${asset.key}`;
  const name = String(item.name || "face_group").replace(/\.[^.]+$/, "");
  return cleanBitmapKey(name, "face_group");
}

function faceGroupSkinTargetKey(faces, item, options = {}) {
  const requested = cleanBitmapKey(options.key || bitmapItemPreferredFaceKey(item));
  const asset = item?.source === "asset" ? assetAliasForCurrentModel(item.asset) : null;
  const sameModelFaceAsset = !!asset && asset.kind === "face" && asset.model === templateShipId();
  if (requested && (options.shareKey || sameModelFaceAsset)) return requested;
  const existing = [...new Set(faces.map((face) => cleanBitmapKey(face.bitmapFaceKey)).filter(Boolean))];
  if (!requested && existing.length === 1) return existing[0];
  return uniqueFaceGroupSkinKey(requested || existing[0] || "face_group", faces);
}

function uniqueFaceList(faces) {
  const seen = new Set();
  const out = [];
  for (const face of faces) {
    if (!face || seen.has(face.id)) continue;
    seen.add(face.id);
    out.push(face);
  }
  return out;
}

function faceGroupProjectionTargets(faces) {
  return uniqueFaceList(faces);
}

function sharedFaceTextureGroup(face) {
  const key = cleanBitmapKey(face?.bitmapFaceKey);
  if (!key) return [];
  return state.faces.filter((candidate) => cleanBitmapKey(candidate.bitmapFaceKey) === key);
}

function faceHasUvSelectionTarget(face) {
  return !!face && (
    cleanBitmapKey(face.bitmapFaceKey) ||
    cleanFaceBitmapUv(face) ||
    cleanFaceBitmapUvTemplate(face) ||
    cleanFaceDecals(face.bitmapDecals).length ||
    validBitmapFaceSide(face.bitmapSide)
  );
}

function applyCurrentViewGroupUv(faces, img) {
  const templateSide = activeProjectionViewName();
  if (["top", "bottom", "back"].includes(templateSide)) {
    const project = templateProjection(templateSide, "footprint");
    const baseW = project.width || TEMPLATE_SIZE;
    const baseH = project.height || TEMPLATE_SIZE;
    for (const face of faces) {
      face.bitmapSide = templateSide;
      face.bitmapUv = face.verts.map((id) => {
        const v = vertexById(id);
        const p = project(v || vec());
        return [round(p.x, 3), round(p.y, 3)];
      });
      face.bitmapBaseW = baseW;
      face.bitmapBaseH = baseH;
      face.bitmapUvTemplate = face.bitmapUv.map(([x, y]) => [x, y]);
      face.bitmapUvTransform = { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 };
      delete face.bitmapAngle;
    }
    return true;
  }
  const verts = [];
  for (const face of faces) {
    for (const id of face.verts) {
      const v = vertexById(id);
      if (v) verts.push(rotatePoint(v));
    }
  }
  if (verts.length < 3) return false;
  const minX = Math.min(...verts.map((v) => v.x));
  const maxX = Math.max(...verts.map((v) => v.x));
  const minY = Math.min(...verts.map((v) => v.y));
  const maxY = Math.max(...verts.map((v) => v.y));
  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;
  const width = Math.max(1, Math.round(img?.naturalWidth || img?.width || TEMPLATE_SIZE));
  const height = Math.max(1, Math.round(img?.naturalHeight || img?.height || TEMPLATE_SIZE));
  for (const face of faces) {
    face.bitmapUv = face.verts.map((id) => {
      const v = vertexById(id);
      const p = rotatePoint(v || vec());
      return [round(((p.x - minX) / rangeX) * width, 3), round(((maxY - p.y) / rangeY) * height, 3)];
    });
    face.bitmapBaseW = width;
    face.bitmapBaseH = height;
    face.bitmapUvTemplate = face.bitmapUv.map(([x, y]) => [x, y]);
    face.bitmapUvTransform = { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 };
    delete face.bitmapAngle;
  }
  return true;
}

function setSelectedFaceSkinFromImage(img, source = "imported", url = "", name = "bitmap", options = {}) {
  const face = selectedFace();
  if (!face) {
    if (url) URL.revokeObjectURL(url);
    setStatus("SELECT A FACE FIRST.");
    return;
  }
  const previousKey = cleanBitmapKey(face.bitmapFaceKey);
  const key = selectedFaceSkinTargetKey(face, options);
  const forked = previousKey && previousKey !== key;
  const mirrorX = options.mirrorX == null ? importMirroredSkinEnabled() : !!options.mirrorX;
  clearFaceUvFields(face);
  face.bitmapFaceKey = key;
  if (mirrorX) face.bitmapMirrorX = true;
  else delete face.bitmapMirrorX;
  const averageColor = averageImageColor(img);
  if (averageColor) face.faceColor = averageColor;
  if (state.faceSkinUrls[key] && state.faceSkinUrls[key] !== url) URL.revokeObjectURL(state.faceSkinUrls[key]);
  state.faceSkinImages[key] = img;
  state.faceSkinSources[key] = source;
  if (url) state.faceSkinUrls[key] = url;
  if (options.orientToView) {
    orientFaceToView(face, false, "");
  }
  if (mirrorActionsEnabled()) syncMirroredFace(face, { forceBitmapUv: true });
  markPreviewSkinsDirty();
  updateSkinReadout();
  updateFaceUvAngleControls();
  const angleText = options.orientToView ? ", FACE ORIENTED TO VIEW" : "";
  const colorText = averageColor ? `, COLOUR ${averageColor}` : "";
  const forkText = forked ? `, FACE-ONLY COPY OF ${previousKey}` : "";
  setStatus(`${name} APPLIED TO FACE #${face.id} AS ${key}${forkText}${mirrorX ? " AS MIRRORED HALF UV" : ""}${angleText}${colorText}. SAVE AS ${templateShipId()}-face-${key}.png TO MAKE PERMANENT.`);
  renderAll();
}

function clearFaceUvFields(face) {
  delete face.bitmapSide;
  delete face.bitmapFaceKey;
  delete face.bitmapUv;
  delete face.bitmapUvTemplate;
  delete face.bitmapUvTransform;
  delete face.bitmapBaseW;
  delete face.bitmapBaseH;
  delete face.bitmapAngle;
  delete face.bitmapMirrorX;
  delete face.bitmapWrap;
}

function faceHasRemovableUvFields(face) {
  return !!face && (
    validBitmapFaceSide(face.bitmapSide) ||
    cleanBitmapKey(face.bitmapFaceKey) ||
    cleanFaceBitmapUv(face) ||
    cleanFaceBitmapUvTemplate(face) ||
    !bitmapUvTransformIsDefault(face.bitmapUvTransform) ||
    Number(face.bitmapBaseW) > 0 ||
    Number(face.bitmapBaseH) > 0 ||
    normalizeBitmapAngle(face.bitmapAngle) ||
    !!face.bitmapMirrorX ||
    cleanBitmapWrap(face.bitmapWrap) !== "clip"
  );
}

function selectedGroupTargetsForRemoval() {
  const grouped = selectedFaceGroup();
  if (grouped.length > 1) return uniqueFaceList(grouped);
  const face = selectedFace();
  const shared = sharedFaceTextureGroup(face);
  return shared.length > 1 ? uniqueFaceList(shared) : [];
}

function removeSelectedFaceGroupUv() {
  const targets = selectedGroupTargetsForRemoval();
  if (targets.length < 2) {
    setStatus("SELECT A FACE GROUP FIRST.");
    updateFaceUvTransformControls();
    return;
  }
  const uvTargets = targets.filter(faceHasRemovableUvFields);
  if (uvTargets.length) {
    const ok = window.confirm(`Remove this face group UV?\n\nThis will remove face texture/UV fields from ${uvTargets.length} face${uvTargets.length === 1 ? "" : "s"}. Geometry, decals and bitmap assets on disk will not be deleted.`);
    if (!ok) {
      setStatus("FACE GROUP UV REMOVAL CANCELLED.");
      return;
    }
    for (const face of uvTargets) {
      clearFaceUvFields(face);
      if (mirrorActionsEnabled()) syncMirroredFace(face, { forceBitmapUv: true });
    }
    markPreviewSkinsDirty();
    updateSkinReadout();
  }
  state.selectedFaceIds.clear();
  state.selected = null;
  state.selectedDetailIds.clear();
  updateFaceUvAngleControls();
  updateFaceUvTransformControls();
  updateFaceDecalControls();
  setStatus(uvTargets.length
    ? `FACE GROUP UV REMOVED FROM ${uvTargets.length} FACE${uvTargets.length === 1 ? "" : "S"}.`
    : "FACE GROUP SELECTION CLEARED; NO UV DATA FOUND.");
  renderAll();
  syncLiveRenderPreviews();
}

function setFaceGroupSkinFromImage(faces, img, source = "imported", url = "", name = "bitmap", options = {}) {
  const selectedTargets = uniqueFaceList(faces.filter(Boolean));
  if (!selectedTargets.length) {
    if (url) URL.revokeObjectURL(url);
    setStatus("SELECT ONE OR MORE FACES FIRST.");
    return;
  }
  const targets = faceGroupProjectionTargets(selectedTargets);
  const key = faceGroupSkinTargetKey(targets, options.item || null, options);
  const mirrorX = options.mirrorX == null ? importMirroredSkinEnabled() : !!options.mirrorX;
  const averageColor = averageImageColor(img);
  for (const face of targets) {
    clearFaceUvFields(face);
    face.bitmapFaceKey = key;
    if (mirrorX) face.bitmapMirrorX = true;
    else delete face.bitmapMirrorX;
    if (averageColor) face.faceColor = averageColor;
  }
  applyCurrentViewGroupUv(targets, img);
  if (state.faceSkinUrls[key] && state.faceSkinUrls[key] !== url) URL.revokeObjectURL(state.faceSkinUrls[key]);
  state.faceSkinImages[key] = img;
  state.faceSkinSources[key] = source;
  if (url) state.faceSkinUrls[key] = url;
  markPreviewSkinsDirty();
  updateSkinReadout();
  updateFaceUvAngleControls();
  const colorText = averageColor ? `, COLOUR ${averageColor}` : "";
  const mirrorText = targets.length !== selectedTargets.length ? ` (${targets.length - selectedTargets.length} MIRRORED)` : "";
  setStatus(`${name} APPLIED TO ${selectedTargets.length} FACE${selectedTargets.length === 1 ? "" : "S"}${mirrorText} AS ${key}${mirrorX ? " AS MIRRORED HALF UV" : ""}${colorText}. SAVE AS ${templateShipId()}-face-${key}.png TO MAKE PERMANENT.`);
  renderAll();
}

function clearSelectedFaceSkin() {
  const face = selectedFace();
  if (!face) {
    setStatus("SELECT A FACE FIRST.");
    return;
  }
  const key = cleanBitmapKey(face.bitmapFaceKey);
  clearFaceUvFields(face);
  if (mirrorActionsEnabled()) syncMirroredFace(face);
  markPreviewSkinsDirty();
  updateFaceUvAngleControls();
  setStatus(key ? `FACE TEXTURE ${key} CLEARED FROM FACE #${face.id}.` : "SELECTED FACE HAS NO FACE TEXTURE.");
  renderAll();
}

function clearSelectedFacePaint() {
  const face = selectedFace();
  if (!face) return setStatus("SELECT A FACE FIRST.");
  const hadPaint =
    cleanBitmapKey(face.bitmapFaceKey) ||
    (Array.isArray(face.bitmapUv) && face.bitmapUv.length >= 3) ||
    (Array.isArray(face.bitmapUvTemplate) && face.bitmapUvTemplate.length >= 3) ||
    !bitmapUvTransformIsDefault(face.bitmapUvTransform) ||
    validBitmapFaceSide(face.bitmapSide) ||
    normalizeBitmapAngle(face.bitmapAngle) ||
    face.bitmapMirrorX ||
    cleanBitmapWrap(face.bitmapWrap) !== "clip" ||
    cleanFaceDecals(face.bitmapDecals).length ||
    optionalHexColor(face.faceColor);
  clearFaceUvFields(face);
  delete face.bitmapDecals;
  delete face.faceColor;
  if (mirrorActionsEnabled()) syncMirroredFace(face);
  markPreviewSkinsDirty();
  updateFaceUvAngleControls();
  updateFaceDecalControls();
  setStatus(hadPaint ? `FACE #${face.id} PAINT, UVS AND DECALS CLEARED.` : "SELECTED FACE HAD NO PAINT TO CLEAR.");
  renderAll();
}

function clearAllFaceUv() {
  const affected = state.faces.filter((face) =>
    cleanBitmapKey(face.bitmapFaceKey)
    || (Array.isArray(face.bitmapUv) && face.bitmapUv.length >= 3)
    || (Array.isArray(face.bitmapUvTemplate) && face.bitmapUvTemplate.length >= 3)
    || !bitmapUvTransformIsDefault(face.bitmapUvTransform)
    || validBitmapFaceSide(face.bitmapSide)
    || normalizeBitmapAngle(face.bitmapAngle)
    || face.bitmapMirrorX
  );
  if (!affected.length) {
    setStatus("NO FACE UV ASSIGNMENTS TO CLEAR.");
    return;
  }
  const confirmClear = window.confirm(`Clear face UV assignments from ${affected.length} face${affected.length === 1 ? "" : "s"}?`);
  if (!confirmClear) return;
  for (const face of affected) {
    clearFaceUvFields(face);
  }
  if (mirrorActionsEnabled()) {
    for (const face of affected) syncMirroredFace(face);
  }
  markPreviewSkinsDirty();
  updateFaceUvAngleControls();
  setStatus(`${affected.length} FACE UV ASSIGNMENT${affected.length === 1 ? "" : "S"} CLEARED.`);
  renderAll();
}

function clearSkinSide(side) {
  if (!["top", "bottom", "back"].includes(side)) return;
  const img = state.skinImages?.[side];
  const url = state.skinImages?.urls?.[side];
  const hadSkin = !!img?.naturalWidth || !!url;
  if (url) URL.revokeObjectURL(url);
  if (!state.skinImages?.modelId) state.skinImages = emptySkinBundle(templateShipId());
  state.skinImages[side] = null;
  state.skinImages.source[side] = "";
  state.skinImages.urls[side] = "";
  if (state.skinImages.mirrorX) state.skinImages.mirrorX[side] = false;
  markPreviewSkinsDirty();
  updateSkinReadout();
  setStatus(hadSkin ? `${side.toUpperCase()} SKIN CLEARED FROM PREVIEW.` : `NO ${side.toUpperCase()} SKIN LOADED.`);
  renderAll();
}

function applyShelfBitmap(side) {
  const hadPickList = state.pick.length > 0;
  state.pick = [];
  const item = selectedBitmapShelfItem();
  if (!item) {
    setStatus("SELECT A UV THUMBNAIL FIRST.");
    if (hadPickList) renderAll();
    return;
  }
  const mirrored = importMirroredSkinEnabled();
  setSkinSideFromImage(side, item.img, "shelf", "", mirrored);
  setStatus(`${item.name} APPLIED TO ${side.toUpperCase()}${mirrored ? " AS MIRRORED HALF UV" : ""}${hadPickList ? "; VERTEX GROUP CLEARED" : ""}.`);
}

function selectedShelfFaceTextureOptions(options = {}) {
  const item = selectedBitmapShelfItem();
  if (!item) {
    setStatus("SELECT A UV THUMBNAIL FIRST.");
    return null;
  }
  const asset = item.source === "asset" ? assetAliasForCurrentModel(item.asset) : null;
  const assetKey = asset?.kind === "face" ? cleanBitmapKey(asset.key) : "";
  const sameModelAsset = !!asset && asset.model === templateShipId();
  const source = sameModelAsset ? "asset" : item.source === "asset" ? "shelf" : "imported";
  return {
    item,
    img: item.img,
    source,
    name: item.name,
    options: {
      ...options,
      item,
      ...(assetKey ? { key: assetKey, shareKey: sameModelAsset } : {})
    }
  };
}

function applyShelfBitmapToSelectedFace(options = {}) {
  const texture = selectedShelfFaceTextureOptions(options);
  if (!texture) return;
  const faces = selectedFaceGroup();
  if (faces.length) {
    setFaceGroupSkinFromImage(faces, texture.img, texture.source, "", texture.name, texture.options);
    return;
  }
  setSelectedFaceSkinFromImage(texture.img, texture.source, "", texture.name, texture.options);
}

function selectedFaceDecals(face = selectedFace()) {
  if (!face) return [];
  const decals = cleanFaceDecals(face.bitmapDecals);
  if (decals.length) face.bitmapDecals = decals;
  else delete face.bitmapDecals;
  return face.bitmapDecals || [];
}

function selectedFaceDecalIndex(face = selectedFace()) {
  const decals = selectedFaceDecals(face);
  const value = Number(els.faceDecalSelector?.value);
  return Number.isInteger(value) && value >= 0 && value < decals.length ? value : -1;
}

function selectedFaceDecal(face = selectedFace()) {
  const decals = selectedFaceDecals(face);
  const index = selectedFaceDecalIndex(face);
  return index >= 0 ? decals[index] : null;
}

function applyShelfBitmapAsDecal() {
  const face = selectedFace();
  const item = selectedBitmapShelfItem();
  if (!face) {
    setStatus("SELECT A FACE FIRST.");
    return;
  }
  if (!item) {
    setStatus("SELECT A DECAL THUMBNAIL FIRST.");
    return;
  }
  if (item.source === "imported" || item.asset?.kind !== "decal") {
    setStatus("SELECT A PROJECT DECAL ASSET. IMPORTED UVS CAN BE SAVED AS FACE TEXTURES FIRST.");
    return;
  }
  const key = cleanBitmapKey(item.asset?.key || item.name);
  if (!key) {
    setStatus("SELECTED DECAL HAS NO STABLE KEY.");
    return;
  }
  loadDecalImage(key, item.asset?.url || item.img?.src || "");
  const decals = selectedFaceDecals(face);
  decals.push({ key, x: .5, y: .5, scale: .35, angle: 0, alpha: .92 });
  if (mirrorActionsEnabled()) syncMirroredFace(face);
  markPreviewSkinsDirty();
  updateFaceDecalControls(decals.length - 1);
  setStatus(`${key} DECAL ADDED TO FACE #${face.id}.`);
  renderAll();
}

function removeSelectedFaceDecal() {
  const face = selectedFace();
  if (!face) return setStatus("SELECT A FACE FIRST.");
  const index = selectedFaceDecalIndex(face);
  const decals = selectedFaceDecals(face);
  if (index < 0) return setStatus("SELECT A FACE DECAL FIRST.");
  const [removed] = decals.splice(index, 1);
  if (!decals.length) delete face.bitmapDecals;
  if (mirrorActionsEnabled()) syncMirroredFace(face);
  markPreviewSkinsDirty();
  updateFaceDecalControls(Math.min(index, decals.length - 1));
  setStatus(`${removed?.key || "DECAL"} REMOVED FROM FACE #${face.id}.`);
  renderAll();
}

function clearSelectedFaceDecals() {
  const face = selectedFace();
  if (!face) return setStatus("SELECT A FACE FIRST.");
  const count = cleanFaceDecals(face.bitmapDecals).length;
  delete face.bitmapDecals;
  if (mirrorActionsEnabled()) syncMirroredFace(face);
  markPreviewSkinsDirty();
  updateFaceDecalControls();
  setStatus(count ? `${count} DECAL${count === 1 ? "" : "S"} CLEARED FROM FACE #${face.id}.` : "SELECTED FACE HAS NO DECALS.");
  renderAll();
}

function clearAllFaceDecals() {
  const affected = state.faces.filter((face) => cleanFaceDecals(face.bitmapDecals).length);
  const count = affected.reduce((sum, face) => sum + cleanFaceDecals(face.bitmapDecals).length, 0);
  if (!count) {
    setStatus("NO FACE DECALS TO CLEAR.");
    return;
  }
  const confirmClear = window.confirm(`Clear ${count} decal${count === 1 ? "" : "s"} from ${affected.length} face${affected.length === 1 ? "" : "s"}?`);
  if (!confirmClear) return;
  for (const face of affected) delete face.bitmapDecals;
  if (mirrorActionsEnabled()) {
    for (const face of affected) syncMirroredFace(face);
  }
  markPreviewSkinsDirty();
  updateFaceDecalControls();
  setStatus(`${count} DECAL${count === 1 ? "" : "S"} CLEARED FROM ${affected.length} FACE${affected.length === 1 ? "" : "S"}.`);
  renderAll();
}

function updateSelectedFaceDecalFromControls() {
  const face = selectedFace();
  const decal = selectedFaceDecal(face);
  if (!face || !decal) return;
  decal.x = round(clamp(Number(els.faceDecalX?.value), 0, 1), 3);
  decal.y = round(clamp(Number(els.faceDecalY?.value), 0, 1), 3);
  decal.scale = round(clamp(Number(els.faceDecalScale?.value), .02, 2), 3);
  decal.angle = normalizeBitmapAngle(els.faceDecalAngle?.value);
  decal.alpha = round(clamp(Number(els.faceDecalAlpha?.value), 0, 1), 3);
  if (mirrorActionsEnabled()) syncMirroredFace(face);
  markPreviewSkinsDirty();
  renderAll();
}

function importSkinFile(side, file, addToShelf = true) {
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    setStatus("SELECT AN IMAGE FILE.");
    return;
  }
  if (!state.skinImages?.modelId) {
    state.skinImages = emptySkinBundle(templateShipId());
  }
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => {
    clearEditorSelection({ redraw: false });
    const shelfId = addToShelf ? addBitmapToShelf(file, img, url) : "";
    const mirrored = importMirroredSkinEnabled();
    setSkinSideFromImage(side, img, addToShelf ? "shelf" : "imported", addToShelf ? "" : url, mirrored);
    if (shelfId) selectBitmapShelfItem(shelfId);
    updateSkinReadout();
    setStatus(`${side.toUpperCase()} SKIN IMPORTED (${img.naturalWidth}x${img.naturalHeight})${mirrored ? " AS MIRRORED HALF UV" : ""}.`);
    renderAll();
  };
  img.onerror = () => {
    URL.revokeObjectURL(url);
    setStatus(`${side.toUpperCase()} SKIN IMPORT FAILED.`);
  };
  img.src = url;
}

function importSelectedFaceSkinFile(file, addToShelf = true) {
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    setStatus("SELECT AN IMAGE FILE.");
    return;
  }
  const targets = selectedFaceGroup();
  const face = selectedFace();
  if (!targets.length && !face) {
    setStatus("SELECT ONE OR MORE FACES FIRST.");
    return;
  }
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => {
    const shelfId = addToShelf ? addBitmapToShelf(file, img, url) : "";
    if (targets.length) {
      setFaceGroupSkinFromImage(targets, img, addToShelf ? "shelf" : "imported", addToShelf ? "" : url, file.name || "FACE PNG", { key: cleanBitmapKey(file.name.replace(/\.[^.]+$/, ""), "face_group") });
    } else {
      setSelectedFaceSkinFromImage(img, addToShelf ? "shelf" : "imported", addToShelf ? "" : url, file.name || "FACE PNG", { orientToView: true });
    }
    if (shelfId) selectBitmapShelfItem(shelfId);
    renderAll();
  };
  img.onerror = () => {
    URL.revokeObjectURL(url);
    setStatus("FACE SKIN IMPORT FAILED.");
  };
  img.src = url;
}

function importBitmapShelfFiles(files) {
  const list = Array.from(files || []).filter((file) => file.type.startsWith("image/"));
  if (!list.length) {
    setStatus("SELECT IMAGE FILES FOR THE BITMAP SHELF.");
    return;
  }
  let pending = list.length;
  let imported = 0;
  for (const file of list) {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      addBitmapToShelf(file, img, url);
      imported++;
      pending--;
      if (!pending) setStatus(`${imported} BITMAP${imported === 1 ? "" : "S"} ADDED TO SHELF.`);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      pending--;
      if (!pending) setStatus(`${imported} BITMAP${imported === 1 ? "" : "S"} ADDED TO SHELF.`);
    };
    img.src = url;
  }
}

function templatePrimaryAxis() {
  const id = templateShipId();
  return id === "thargoid" || id === "thargon" ? "x" : "y";
}

function templateProjection(side, mode = "footprint") {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity, minZ = Infinity, maxZ = -Infinity;
  for (const p of state.verts) {
    minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
    minZ = Math.min(minZ, p.z); maxZ = Math.max(maxZ, p.z);
  }
  if (!state.verts.length) {
    minX = minY = minZ = -1;
    maxX = maxY = maxZ = 1;
  }
  const marginX = Math.max(1, (maxX - minX) * .08);
  const marginY = Math.max(1, (maxY - minY) * .08);
  const marginZ = Math.max(1, (maxZ - minZ) * .08);
  minX -= marginX; maxX += marginX;
  minY -= marginY; maxY += marginY;
  minZ -= marginZ; maxZ += marginZ;
  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;
  const rangeZ = maxZ - minZ || 1;
  const primaryAxis = templatePrimaryAxis();
  const squareFromAxes = (p, uAxis, vAxis, flipU = false, flipV = false) => {
    const mins = [minX, minY, minZ];
    const ranges = [rangeX, rangeY, rangeZ];
    const coords = [p.x, p.y, p.z];
    const rawU = ((coords[uAxis] - mins[uAxis]) / ranges[uAxis]) * TEMPLATE_SIZE;
    const rawV = ((coords[vAxis] - mins[vAxis]) / ranges[vAxis]) * TEMPLATE_SIZE;
    return { x: flipU ? TEMPLATE_SIZE - rawU : rawU, y: flipV ? TEMPLATE_SIZE - rawV : rawV };
  };
  const squareProject = (p) => {
    if (primaryAxis === "x" && side !== "back") return squareFromAxes(p, 1, 2, side === "bottom", true);
    if (side === "back") return squareFromAxes(p, 0, 1, true, true);
    return squareFromAxes(p, 0, 2, side === "bottom", true);
  };
  squareProject.width = TEMPLATE_SIZE;
  squareProject.height = TEMPLATE_SIZE;
  squareProject.centerlineX = TEMPLATE_SIZE / 2;
  squareProject.mode = "square";
  if (mode === "square") return squareProject;

  const footprintFromAxes = (uAxis, vAxis, flipU = false, flipV = false) => {
    const mins = [minX, minY, minZ];
    const ranges = [rangeX, rangeY, rangeZ];
    const scale = TEMPLATE_MAX_SIZE / Math.max(ranges[uAxis], ranges[vAxis], 1);
    const width = Math.max(16, Math.round(ranges[uAxis] * scale));
    const height = Math.max(16, Math.round(ranges[vAxis] * scale));
    const centerU = (0 - mins[uAxis]) * scale;
    const project = (p) => {
      const coords = [p.x, p.y, p.z];
      const rawU = (coords[uAxis] - mins[uAxis]) * scale;
      const rawV = (coords[vAxis] - mins[vAxis]) * scale;
      return { x: flipU ? width - rawU : rawU, y: flipV ? height - rawV : rawV };
    };
    project.width = width;
    project.height = height;
    project.centerlineX = flipU ? width - centerU : centerU;
    project.mode = "footprint";
    return project;
  };

  if (primaryAxis === "x" && side !== "back") return footprintFromAxes(1, 2, side === "bottom", true);
  if (side === "back") return footprintFromAxes(0, 1, true, true);
  return footprintFromAxes(0, 2, side === "bottom", true);
}

function templateProjectionFromAxes(uAxis, vAxis, flipU = false, flipV = true) {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity, minZ = Infinity, maxZ = -Infinity;
  for (const p of state.verts) {
    minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
    minZ = Math.min(minZ, p.z); maxZ = Math.max(maxZ, p.z);
  }
  if (!state.verts.length) {
    minX = minY = minZ = -1;
    maxX = maxY = maxZ = 1;
  }
  const marginX = Math.max(1, (maxX - minX) * .08);
  const marginY = Math.max(1, (maxY - minY) * .08);
  const marginZ = Math.max(1, (maxZ - minZ) * .08);
  minX -= marginX; maxX += marginX;
  minY -= marginY; maxY += marginY;
  minZ -= marginZ; maxZ += marginZ;
  const mins = [minX, minY, minZ];
  const ranges = [maxX - minX || 1, maxY - minY || 1, maxZ - minZ || 1];
  const scale = TEMPLATE_MAX_SIZE / Math.max(ranges[uAxis], ranges[vAxis], 1);
  const width = Math.max(16, Math.round(ranges[uAxis] * scale));
  const height = Math.max(16, Math.round(ranges[vAxis] * scale));
  const centerU = (0 - mins[uAxis]) * scale;
  const project = (p) => {
    const coords = [p.x, p.y, p.z];
    const rawU = (coords[uAxis] - mins[uAxis]) * scale;
    const rawV = (coords[vAxis] - mins[vAxis]) * scale;
    return { x: flipU ? width - rawU : rawU, y: flipV ? height - rawV : rawV };
  };
  project.width = width;
  project.height = height;
  project.centerlineX = flipU ? width - centerU : centerU;
  project.mode = "face";
  return project;
}

function polygonArea2d(pts) {
  let area = 0;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length];
    area += a.x * b.y - b.x * a.y;
  }
  return Math.abs(area) * .5;
}

function faceTextureProjection(face, fallbackProject) {
  const verts = face.verts.map(vertexById).filter(Boolean);
  if (cleanBitmapKey(face.bitmapFaceKey) || cleanFaceDecals(face.bitmapDecals).length) {
    const local = faceLocalTextureProjection(face);
    if (local) return local;
  }
  const fallbackPts = verts.map(fallbackProject);
  if (!cleanBitmapKey(face.bitmapFaceKey) || polygonArea2d(fallbackPts) >= 1) return fallbackProject;
  const n = faceNormal(face);
  const absX = Math.abs(n.x), absY = Math.abs(n.y), absZ = Math.abs(n.z);
  if (absZ >= absX && absZ >= absY) return templateProjectionFromAxes(0, 1, n.z < 0, true);
  if (absX >= absY && absX >= absZ) return templateProjectionFromAxes(2, 1, n.x > 0, true);
  return templateProjectionFromAxes(0, 2, n.y < 0, true);
}

function faceLocalTextureProjection(face) {
  const verts = face.verts.map(vertexById).filter(Boolean);
  if (verts.length < 3) return null;
  const n = faceNormal(face);
  let longest = null;
  for (let i = 0; i < verts.length; i++) {
    const a = verts[i];
    const b = verts[(i + 1) % verts.length];
    const edge = { x: b.x - a.x, y: b.y - a.y, z: b.z - a.z };
    const edgeLen = Math.hypot(edge.x, edge.y, edge.z);
    if (edgeLen > (longest?.edgeLen || 0)) longest = { edge, edgeLen };
  }
  if (!longest || longest.edgeLen < .001) return null;
  const uAxis = norm(longest.edge);
  const vAxis = norm(cross(n, uAxis));
  if (len(vAxis) < .001) return null;
  const coords = verts.map((p) => ({ id: p.id, u: dot(p, uAxis), v: dot(p, vAxis) }));
  const minU = Math.min(...coords.map((p) => p.u));
  const maxU = Math.max(...coords.map((p) => p.u));
  const minV = Math.min(...coords.map((p) => p.v));
  const maxV = Math.max(...coords.map((p) => p.v));
  const rangeU = maxU - minU;
  const rangeV = maxV - minV;
  if (rangeU < .001 || rangeV < .001) return null;
  const scale = TEMPLATE_MAX_SIZE / Math.max(rangeU, rangeV, 1);
  const uvById = new Map(coords.map((p) => [
    p.id,
    { x: (p.u - minU) * scale, y: (maxV - p.v) * scale }
  ]));
  const project = (p) => uvById.get(p.id) || { x: 0, y: 0 };
  project.width = Math.max(16, Math.round(rangeU * scale));
  project.height = Math.max(16, Math.round(rangeV * scale));
  project.centerlineX = project.width / 2;
  project.mode = "face-local";
  return project;
}

function autoTemplateSideForFace(face) {
  const n = faceNormal(face);
  const absX = Math.abs(n.x), absY = Math.abs(n.y), absZ = Math.abs(n.z);
  let side = n.z < -.42 && absZ >= absY * .86 && absZ >= absX * .65 ? "back" : n.y < 0 ? "bottom" : "top";
  if (templatePrimaryAxis() === "x" && absX >= absY * .86 && absX >= absZ * .65) {
    side = n.x < 0 ? "bottom" : "top";
  }
  return side;
}

function templateSideForFace(face) {
  return validBitmapFaceSide(face?.bitmapSide) || autoTemplateSideForFace(face);
}

function drawTemplateCenterline(ctx, x, top = 0, bottom = ctx.canvas.height, options = {}) {
  if (x < -1 || x > ctx.canvas.width + 1) return;
  const active = !!options.active;
  ctx.save();
  if (active) {
    ctx.strokeStyle = "rgba(0,0,0,.72)";
    ctx.lineWidth = 5;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(Math.round(x) + .5, top);
    ctx.lineTo(Math.round(x) + .5, bottom);
    ctx.stroke();
  }
  ctx.strokeStyle = active ? "#ff5ec4" : "rgba(255,255,255,.48)";
  ctx.lineWidth = active ? 2 : 1;
  ctx.setLineDash([7, 7]);
  ctx.beginPath();
  ctx.moveTo(Math.round(x) + .5, top);
  ctx.lineTo(Math.round(x) + .5, bottom);
  ctx.stroke();
  if (active && options.label) {
    ctx.setLineDash([]);
    const labelX = Math.max(4, Math.min(Math.max(4, ctx.canvas.width - 84), x + 7));
    const labelY = Math.max(4, top + 5);
    ctx.fillStyle = "rgba(0,0,0,.82)";
    ctx.fillRect(labelX, labelY, 76, 17);
    ctx.fillStyle = "#ff5ec4";
    ctx.font = "10px Andale Mono, Menlo, Consolas, monospace";
    ctx.textBaseline = "top";
    ctx.fillText(String(options.label).toUpperCase(), labelX + 4, labelY + 3);
  }
  ctx.restore();
}

function traceTemplatePoly(ctx, pts, close = true) {
  if (pts.length < 2) return;
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  if (close) ctx.closePath();
}

function drawTemplateDetail(ctx, detail, project, translate = (p) => p) {
  const pts = detailModelPoints(detail).map(project).map(translate);
  if (detail.type === "beacon") {
    const p = pts[0];
    if (!p) return;
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,.86)";
    ctx.fillStyle = "rgba(255,255,255,.35)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4, 0, TAU);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(p.x - 7, p.y);
    ctx.lineTo(p.x + 7, p.y);
    ctx.moveTo(p.x, p.y - 7);
    ctx.lineTo(p.x, p.y + 7);
    ctx.stroke();
    ctx.restore();
    return;
  }
  if (pts.length < 2) return;
  ctx.save();
  ctx.strokeStyle = detail.type === DETAIL_TYPE_STATION_ENTRANCE ? "#66e8ff" : detail.type === "window" ? "rgba(255,255,255,.86)" : detail.type === "engine" ? "#ffffff" : "rgba(255,255,255,.7)";
  ctx.fillStyle = "rgba(255,255,255,.08)";
  ctx.lineWidth = detail.type === "engine" || detail.type === DETAIL_TYPE_STATION_ENTRANCE ? 2 : 1;
  if (detail.type === "panel" || detail.type === "line" || detail.type === "polyline") {
    traceTemplatePoly(ctx, pts, false);
    ctx.stroke();
  } else {
    traceTemplatePoly(ctx, pts, true);
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}

function drawTemplateLabel(ctx, text) {
  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,.72)";
  ctx.font = "10px Andale Mono, Menlo, Consolas, monospace";
  ctx.textBaseline = "top";
  ctx.fillText(text.toUpperCase(), 10, 10);
  ctx.restore();
}

function createTemplateCanvas(side, half = mirrorHalfSkinsEnabled()) {
  const project = templateProjection(side, "footprint");
  const centerX = project.centerlineX ?? project.width / 2;
  const canvas = document.createElement("canvas");
  canvas.width = half ? Math.max(16, Math.ceil(centerX)) : project.width;
  canvas.height = project.height;
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawTemplateCenterline(ctx, centerX, 0, canvas.height, { active: half || skinSideMirrorX(side), label: "mirror" });

  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,.46)";
  ctx.lineWidth = 1;
  for (const face of state.faces) {
    const pts = face.verts.map(vertexById).filter(Boolean).map(project);
    traceTemplatePoly(ctx, pts, true);
    ctx.stroke();
  }
  ctx.restore();

  ctx.save();
  for (const edge of state.edges) {
    const a = vertexById(edge.a), b = vertexById(edge.b);
    if (!a || !b) continue;
    const pa = project(a), pb = project(b);
    ctx.strokeStyle = edge.kind === EDGE_KIND_STATION_ENTRANCE ? "rgba(102,232,255,.92)" : edge.kind === "stick" ? "rgba(255,255,255,.9)" : "rgba(255,255,255,.72)";
    ctx.lineWidth = edge.kind === EDGE_KIND_STATION_ENTRANCE ? 2.4 : edge.kind === "stick" ? 2 : 1;
    ctx.beginPath();
    ctx.moveTo(pa.x, pa.y);
    ctx.lineTo(pb.x, pb.y);
    ctx.stroke();
  }
  ctx.restore();

  for (const detail of state.details) drawTemplateDetail(ctx, detail, project);
  drawTemplateLabel(ctx, `${templateShipId()} ${side}${half ? " half" : ""}`);
  return canvas;
}

function createSelectedFaceTemplateCanvas() {
  const face = selectedFace();
  if (!face) {
    setStatus("SELECT A FACE FIRST.");
    return null;
  }
  const mapping = selectedFaceTextureMapping(face);
  if (!mapping || mapping.uv.length < 3) return null;
  const { side, project, minX, minY, pad, width, height } = mapping;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, width, height);
  const translate = (p) => ({ x: p.x - minX + pad, y: p.y - minY + pad });
  const faceMirror = faceTextureMirrorX(face);
  drawTemplateCenterline(ctx, width / 2, 0, height, { active: faceMirror, label: faceMirror ? "mirror" : "" });

  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,.96)";
  ctx.fillStyle = "rgba(255,255,255,.08)";
  ctx.lineWidth = 1;
  traceTemplatePoly(ctx, mapping.uv, true);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  for (const detail of state.details) {
    if (detail.faceId === face.id) drawTemplateDetail(ctx, detail, project, translate);
  }

  canvas.dataset.templateSide = side;
  canvas.dataset.templateFaceId = String(face.id);
  return canvas;
}

function selectedFaceTextureMapping(face, options = {}) {
  if (Array.isArray(face?.bitmapUv) && face.bitmapUv.length >= 3) {
    const rawUv = face.bitmapUv.map((p) => ({ x: Number(p[0]) || 0, y: Number(p[1]) || 0 }));
    const width = Math.max(1, Math.round(Number(face.bitmapBaseW) || TEMPLATE_SIZE));
    const height = Math.max(1, Math.round(Number(face.bitmapBaseH) || TEMPLATE_SIZE));
    const angle = options.applyAngle === false ? 0 : normalizeBitmapAngle(face.bitmapAngle);
    const uv = angle ? rawUv.map((p) => rotateTemplatePoint(p, width, height, angle)) : rawUv;
    return {
      side: templateSideForFace(face),
      project: (p) => p,
      uv,
      rawUv,
      angle,
      width,
      height,
      minX: 0,
      minY: 0,
      pad: 0
    };
  }
  const side = templateSideForFace(face);
  const project = faceTextureProjection(face, templateProjection(side, "footprint"));
  const pts = face.verts.map(vertexById).filter(Boolean).map(project);
  if (pts.length < 3) return null;
  const minX = Math.min(...pts.map((p) => p.x));
  const maxX = Math.max(...pts.map((p) => p.x));
  const minY = Math.min(...pts.map((p) => p.y));
  const maxY = Math.max(...pts.map((p) => p.y));
  const pad = 24;
  const width = Math.max(24, Math.ceil(maxX - minX + pad * 2));
  const height = Math.max(24, Math.ceil(maxY - minY + pad * 2));
  const rawUv = pts.map((p) => ({ x: p.x - minX + pad, y: p.y - minY + pad }));
  const angle = options.applyAngle === false ? 0 : normalizeBitmapAngle(face.bitmapAngle);
  if (!angle) return { side, project, uv: rawUv, rawUv, angle, width, height, minX, minY, pad };
  const rotatedUv = rawUv.map((p) => rotateTemplatePoint(p, width, height, angle));
  const minRotX = Math.min(...rotatedUv.map((p) => p.x));
  const maxRotX = Math.max(...rotatedUv.map((p) => p.x));
  const minRotY = Math.min(...rotatedUv.map((p) => p.y));
  const maxRotY = Math.max(...rotatedUv.map((p) => p.y));
  const fittedWidth = Math.max(24, Math.ceil(maxRotX - minRotX + pad * 2));
  const fittedHeight = Math.max(24, Math.ceil(maxRotY - minRotY + pad * 2));
  const uv = rotatedUv.map((p) => ({ x: p.x - minRotX + pad, y: p.y - minRotY + pad }));
  return { side, project, uv, rawUv, angle, width: fittedWidth, height: fittedHeight, minX, minY, pad };
}

function faceUvTemplateSource(face) {
  const template = cleanFaceBitmapUvTemplate(face);
  const cleanUv = cleanFaceBitmapUv(face);
  if (template) {
    return {
      uv: template.map(([x, y]) => ({ x, y })),
      width: Math.max(1, Math.round(Number(face.bitmapBaseW) || TEMPLATE_SIZE)),
      height: Math.max(1, Math.round(Number(face.bitmapBaseH) || TEMPLATE_SIZE))
    };
  }
  if (cleanUv) {
    return {
      uv: cleanUv.map(([x, y]) => ({ x, y })),
      width: Math.max(1, Math.round(Number(face.bitmapBaseW) || TEMPLATE_SIZE)),
      height: Math.max(1, Math.round(Number(face.bitmapBaseH) || TEMPLATE_SIZE))
    };
  }
  const mapping = selectedFaceTextureMapping(face, { applyAngle: false });
  if (!mapping?.rawUv?.length) return null;
  return {
    uv: mapping.rawUv.map((p) => ({ x: round(p.x, 3), y: round(p.y, 3) })),
    width: Math.max(1, Math.round(mapping.width || TEMPLATE_SIZE)),
    height: Math.max(1, Math.round(mapping.height || TEMPLATE_SIZE))
  };
}

function ensureFaceUvTemplate(face) {
  if (!face) return null;
  const source = faceUvTemplateSource(face);
  if (!source?.uv?.length) return null;
  face.bitmapUvTemplate = source.uv.map((p) => [round(p.x, 3), round(p.y, 3)]);
  face.bitmapBaseW = source.width;
  face.bitmapBaseH = source.height;
  if (!face.bitmapUvTransform) {
    const angle = normalizeBitmapAngle(face.bitmapAngle);
    face.bitmapUvTransform = angle ? { x: 0, y: 0, rotation: angle, scaleX: 1, scaleY: 1 } : { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 };
  } else {
    face.bitmapUvTransform = cleanBitmapUvTransform(face.bitmapUvTransform);
  }
  return { ...source, transform: cleanBitmapUvTransform(face.bitmapUvTransform) };
}

function transformedFaceUv(template, width, height, transform) {
  const clean = cleanBitmapUvTransform(transform);
  const cx = width / 2;
  const cy = height / 2;
  const a = clean.rotation * Math.PI / 180;
  const c = Math.cos(a);
  const s = Math.sin(a);
  return template.map((p) => {
    const dx = (p.x - cx) / clean.scaleX;
    const dy = (p.y - cy) / clean.scaleY;
    return [
      round(cx + dx * c - dy * s + clean.x, 3),
      round(cy + dx * s + dy * c + clean.y, 3)
    ];
  });
}

function bakeFaceUvTransform(face, transform = face?.bitmapUvTransform, options = {}) {
  const source = ensureFaceUvTemplate(face);
  if (!source) return false;
  const clean = cleanBitmapUvTransform(transform);
  face.bitmapUvTransform = clean;
  face.bitmapUv = transformedFaceUv(source.uv, source.width, source.height, clean);
  face.bitmapBaseW = source.width;
  face.bitmapBaseH = source.height;
  delete face.bitmapAngle;
  if (mirrorActionsEnabled() && options.syncMirror !== false) syncMirroredFace(face, { forceBitmapUv: true });
  markPreviewSkinsDirty();
  if (options.updateControls !== false) updateFaceUvAngleControls();
  return true;
}

function faceTextureMirrorX(face) {
  return !!face?.bitmapMirrorX;
}

function downloadCanvas(canvas, filename) {
  if (!canvas) return;
  canvas.toBlob((blob) => {
    if (!blob) return setStatus("PNG EXPORT FAILED.");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);
  }, "image/png");
}

function downloadTemplate(side) {
  const half = mirrorHalfSkinsEnabled();
  const canvas = createTemplateCanvas(side, half);
  downloadCanvas(canvas, `${templateShipId()}-${side}${half ? "-half" : ""}-${canvas.width}x${canvas.height}-template.png`);
  setStatus(`${side.toUpperCase()} TEMPLATE DOWNLOADED (${canvas.width}x${canvas.height}).`);
}

function downloadSelectedFaceTemplate() {
  const canvas = createSelectedFaceTemplateCanvas();
  if (!canvas) return;
  const side = canvas.dataset.templateSide || "face";
  const faceId = canvas.dataset.templateFaceId || "selected";
  downloadCanvas(canvas, `${templateShipId()}-face-${faceId}-${side}-${canvas.width}x${canvas.height}-template.png`);
  setStatus(`FACE ${faceId} TEMPLATE DOWNLOADED (${canvas.width}x${canvas.height}).`);
}

function drawTexturedTriangle(ctx, img, p0, p1, p2, uv0, uv1, uv2) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(p0.x, p0.y);
  ctx.lineTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.closePath();
  ctx.clip();

  let u1 = uv1.x - uv0.x, v1 = uv1.y - uv0.y;
  let u2 = uv2.x - uv0.x, v2 = uv2.y - uv0.y;
  const x1 = p1.x - p0.x, y1 = p1.y - p0.y;
  const x2 = p2.x - p0.x, y2 = p2.y - p0.y;
  const det = u1 * v2 - u2 * v1;
  if (Math.abs(det) < 1e-6) {
    ctx.restore();
    return;
  }
  const idet = 1 / det;
  const a = (v2 * x1 - v1 * x2) * idet;
  const b = (v2 * y1 - v1 * y2) * idet;
  const c = (u1 * x2 - u2 * x1) * idet;
  const d = (u1 * y2 - u2 * y1) * idet;
  const e = p0.x - a * uv0.x - c * uv0.y;
  const f = p0.y - b * uv0.x - d * uv0.y;
  ctx.transform(a, b, c, d, e, f);
  ctx.drawImage(img, 0, 0);
  ctx.restore();
}

function lerp2(a, b, t) {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

function clipTexturePolygon(poly, keepLeft, seamX) {
  const eps = 1e-5;
  const inside = (p) => keepLeft ? p.tex.x <= seamX + eps : p.tex.x >= seamX - eps;
  const intersect = (a, b) => {
    const dx = b.tex.x - a.tex.x;
    const t = Math.abs(dx) < eps ? 0 : Math.max(0, Math.min(1, (seamX - a.tex.x) / dx));
    return {
      screen: lerp2(a.screen, b.screen, t),
      tex: lerp2(a.tex, b.tex, t)
    };
  };
  const out = [];
  for (let i = 0; i < poly.length; i++) {
    const cur = poly[i];
    const prev = poly[(i + poly.length - 1) % poly.length];
    const curIn = inside(cur);
    const prevIn = inside(prev);
    if (curIn) {
      if (!prevIn) out.push(intersect(prev, cur));
      out.push(cur);
    } else if (prevIn) {
      out.push(intersect(prev, cur));
    }
  }
  return out;
}

function clipTexturePolygonByBounds(poly, bounds) {
  const eps = 1e-5;
  const clipEdge = (items, axis, limit, keepGreater) => {
    if (!items.length) return items;
    const inside = (p) => keepGreater ? p.tex[axis] >= limit - eps : p.tex[axis] <= limit + eps;
    const intersect = (a, b) => {
      const da = b.tex[axis] - a.tex[axis];
      const t = Math.abs(da) < eps ? 0 : clamp((limit - a.tex[axis]) / da, 0, 1);
      return {
        screen: lerp2(a.screen, b.screen, t),
        tex: lerp2(a.tex, b.tex, t)
      };
    };
    const out = [];
    for (let i = 0; i < items.length; i++) {
      const cur = items[i];
      const prev = items[(i + items.length - 1) % items.length];
      const curIn = inside(cur);
      const prevIn = inside(prev);
      if (curIn) {
        if (!prevIn) out.push(intersect(prev, cur));
        out.push(cur);
      } else if (prevIn) {
        out.push(intersect(prev, cur));
      }
    }
    return out;
  };
  return [
    ["x", bounds.minX, true],
    ["x", bounds.maxX, false],
    ["y", bounds.minY, true],
    ["y", bounds.maxY, false]
  ].reduce((items, args) => clipEdge(items, ...args), poly);
}

function textureTilePieces(poly, bounds, wrap = "clip") {
  const mode = cleanBitmapWrap(wrap);
  const width = Math.max(1e-5, bounds.maxX - bounds.minX);
  const height = Math.max(1e-5, bounds.maxY - bounds.minY);
  const localTex = (p, tileX, tileY) => {
    const localX = p.tex.x - tileX * width;
    const localY = p.tex.y - tileY * height;
    return {
      x: mode === "mirror" && Math.abs(tileX) % 2 === 1 ? bounds.maxX - (localX - bounds.minX) : localX,
      y: mode === "mirror" && Math.abs(tileY) % 2 === 1 ? bounds.maxY - (localY - bounds.minY) : localY
    };
  };
  const localize = (piece, tileX, tileY) => piece.map((p) => ({ ...p, tex: localTex(p, tileX, tileY) }));
  if (mode === "clip") {
    const clipped = clipTexturePolygonByBounds(poly, bounds);
    return clipped.length >= 3 ? [clipped] : [];
  }
  const minTexX = Math.min(...poly.map((p) => p.tex.x));
  const maxTexX = Math.max(...poly.map((p) => p.tex.x));
  const minTexY = Math.min(...poly.map((p) => p.tex.y));
  const maxTexY = Math.max(...poly.map((p) => p.tex.y));
  const startX = Math.floor((minTexX - bounds.minX) / width);
  const endX = Math.floor((maxTexX - bounds.minX) / width);
  const startY = Math.floor((minTexY - bounds.minY) / height);
  const endY = Math.floor((maxTexY - bounds.minY) / height);
  if ((endX - startX + 1) * (endY - startY + 1) > 441) return [];
  const pieces = [];
  for (let tileY = startY; tileY <= endY; tileY++) {
    for (let tileX = startX; tileX <= endX; tileX++) {
      const clipped = clipTexturePolygonByBounds(poly, {
        minX: bounds.minX + tileX * width,
        maxX: bounds.maxX + tileX * width,
        minY: bounds.minY + tileY * height,
        maxY: bounds.maxY + tileY * height
      });
      if (clipped.length >= 3) pieces.push(localize(clipped, tileX, tileY));
    }
  }
  return pieces;
}

function fillScreenPolygon(ctx, pts) {
  if (!pts || pts.length < 3) return;
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.closePath();
  ctx.fill();
}

function drawSelectedFaceUvGapOverlay(ctx, face, pts) {
  if (!face || selectedFace()?.id !== face.id || pts.length < 3) return;
  const faceKey = cleanBitmapKey(face.bitmapFaceKey);
  const faceImg = faceKey ? state.faceSkinImages?.[faceKey] : null;
  if (!faceImg?.complete || !faceImg.naturalWidth) return;
  const mapping = selectedFaceTextureMapping(face);
  if (!mapping?.uv?.length || mapping.uv.length !== pts.length) return;
  const poly = mapping.uv.map((tex, i) => ({ screen: pts[i], tex }));
  const coveredPieces = textureTilePieces(poly, {
    minX: 0,
    minY: 0,
    maxX: mapping.width,
    maxY: mapping.height
  }, face.bitmapWrap);
  const overlay = document.createElement("canvas");
  overlay.width = ctx.canvas.width;
  overlay.height = ctx.canvas.height;
  const oc = overlay.getContext("2d");
  oc.fillStyle = "rgba(255, 72, 58, .34)";
  fillScreenPolygon(oc, pts);
  if (coveredPieces.length) {
    oc.globalCompositeOperation = "destination-out";
    oc.fillStyle = "rgba(0, 0, 0, 1)";
    for (const covered of coveredPieces) fillScreenPolygon(oc, covered.map((p) => p.screen));
    oc.globalCompositeOperation = "source-over";
  }
  ctx.drawImage(overlay, 0, 0);
}

function drawTexturedPolygon(ctx, img, poly, sx, sy, mirrorX, foldX) {
  if (!poly || poly.length < 3) return;
  const uvFor = (p) => {
    const u = mirrorX ? mirroredTemplateU(p.tex.x, foldX) : p.tex.x;
    return { x: u * sx, y: p.tex.y * sy };
  };
  const uv0 = uvFor(poly[0]);
  for (let i = 1; i + 1 < poly.length; i++) {
    drawTexturedTriangle(ctx, img, poly[0].screen, poly[i].screen, poly[i + 1].screen, uv0, uvFor(poly[i]), uvFor(poly[i + 1]));
  }
}

function skinProjectionForImage(side, img) {
  const footprint = templateProjection(side, "footprint");
  const square = templateProjection(side, "square");
  const w = img?.naturalWidth || img?.width || 0;
  const h = img?.naturalHeight || img?.height || 0;
  const mirrorX = skinSideMirrorX(side);
  const footprintRatio = footprint.width / Math.max(1, footprint.height);
  const imageRatio = (mirrorX ? w * 2 : w) / Math.max(1, h);
  const useFootprint = mirrorX || ratioClose(imageRatio, footprintRatio, .3);
  return { project: useFootprint ? footprint : square, mirrorX, useFootprint };
}

function drawFaceBitmapSkin(ctx, face, pts) {
  const faceKey = cleanBitmapKey(face.bitmapFaceKey);
  const faceImg = faceKey ? state.faceSkinImages?.[faceKey] : null;
  if (faceImg?.complete && faceImg.naturalWidth && pts.length >= 3) {
    const mapping = selectedFaceTextureMapping(face);
    if (mapping && mapping.uv.length === pts.length) {
      const mirrorX = faceTextureMirrorX(face);
      const seamX = mapping.width / 2;
      const sx = faceImg.naturalWidth / (mirrorX ? Math.max(1, seamX) : mapping.width);
      const sy = faceImg.naturalHeight / mapping.height;
      const poly = mapping.uv.map((tex, i) => ({ screen: pts[i], tex }));
      const pieces = textureTilePieces(poly, { minX: 0, minY: 0, maxX: mapping.width, maxY: mapping.height }, face.bitmapWrap);
      ctx.save();
      ctx.globalAlpha = .98;
      for (const piece of pieces) {
        if (mirrorX) {
          drawTexturedPolygon(ctx, faceImg, clipTexturePolygon(piece, true, seamX), sx, sy, true, seamX);
          drawTexturedPolygon(ctx, faceImg, clipTexturePolygon(piece, false, seamX), sx, sy, true, seamX);
        } else {
          drawTexturedPolygon(ctx, faceImg, piece, sx, sy, false, seamX);
        }
      }
      ctx.restore();
      return true;
    }
  }
  const side = templateSideForFace(face);
  const img = state.skinImages?.[side];
  if (!img?.complete || !img.naturalWidth || pts.length < 3) return false;
  const { project, mirrorX } = skinProjectionForImage(side, img);
  const angle = sideSkinAngleDeg();
  const baseW = project.width || TEMPLATE_SIZE;
  const baseH = project.height || TEMPLATE_SIZE;
  const seamX = project.centerlineX ?? baseW / 2;
  const sx = img.naturalWidth / (mirrorX ? Math.max(1, seamX) : baseW);
  const sy = img.naturalHeight / baseH;
  const verts = face.verts.map(vertexById).filter(Boolean);
  if (verts.length !== pts.length) return false;
  const poly = verts.map((v, i) => {
    return {
      screen: pts[i],
      tex: rotateTemplatePoint(project(v), baseW, baseH, angle)
    };
  });
  ctx.save();
  ctx.globalAlpha = .96;
  if (mirrorX) {
    drawTexturedPolygon(ctx, img, clipTexturePolygon(poly, true, seamX), sx, sy, true, seamX);
    drawTexturedPolygon(ctx, img, clipTexturePolygon(poly, false, seamX), sx, sy, true, seamX);
  } else {
    drawTexturedPolygon(ctx, img, poly, sx, sy, false, seamX);
  }
  ctx.restore();
  return true;
}

function drawFaceBitmapDecals(ctx, face, pts) {
  const decals = cleanFaceDecals(face.bitmapDecals);
  if (!decals.length || pts.length < 3) return false;
  const mapping = selectedFaceTextureMapping(face);
  if (!mapping || mapping.uv.length !== pts.length) return false;
  const poly = mapping.uv.map((tex, i) => ({ screen: pts[i], tex }));
  let drawn = false;
  for (const decal of decals) {
    const img = state.decalImages[decal.key] || loadDecalImage(decal.key);
    if (!img?.complete || !img.naturalWidth) continue;
    const layer = document.createElement("canvas");
    layer.width = Math.max(8, Math.round(mapping.width));
    layer.height = Math.max(8, Math.round(mapping.height));
    const tc = layer.getContext("2d");
    const maxSide = Math.max(4, Math.min(layer.width, layer.height) * clamp(decal.scale, .02, 2));
    const aspect = img.naturalWidth / Math.max(1, img.naturalHeight);
    const drawW = aspect >= 1 ? maxSide : maxSide * aspect;
    const drawH = aspect >= 1 ? maxSide / aspect : maxSide;
    tc.save();
    tc.globalAlpha = clamp(decal.alpha, 0, 1);
    tc.translate(clamp(decal.x, 0, 1) * layer.width, clamp(decal.y, 0, 1) * layer.height);
    tc.rotate((decal.angle || 0) * Math.PI / 180);
    tc.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    tc.restore();
    ctx.save();
    drawTexturedPolygon(ctx, layer, poly, 1, 1, false, mapping.width / 2);
    ctx.restore();
    drawn = true;
  }
  return drawn;
}

function faceMirrorSeamPoints(face, pts) {
  if (!faceTextureMirrorX(face) || !pts || pts.length < 3) return [];
  const mapping = selectedFaceTextureMapping(face);
  if (!mapping || mapping.uv.length !== pts.length) return [];
  const seamX = mapping.width / 2;
  const eps = 1e-5;
  const poly = mapping.uv.map((tex, i) => ({ screen: pts[i], tex }));
  const seam = [];
  const addPoint = (screen, texY) => {
    if (!screen || !Number.isFinite(screen.x) || !Number.isFinite(screen.y)) return;
    if (seam.some((p) => Math.hypot(p.screen.x - screen.x, p.screen.y - screen.y) < .5)) return;
    seam.push({ screen, texY });
  };
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    const da = a.tex.x - seamX;
    const db = b.tex.x - seamX;
    if (Math.abs(da) <= eps) addPoint(a.screen, a.tex.y);
    if (da * db < 0) {
      const t = Math.max(0, Math.min(1, -da / (db - da)));
      addPoint(lerp2(a.screen, b.screen, t), a.tex.y + (b.tex.y - a.tex.y) * t);
    }
    if (Math.abs(db) <= eps) addPoint(b.screen, b.tex.y);
  }
  return seam.sort((a, b) => a.texY - b.texY).map((p) => p.screen);
}

function drawFaceMirrorSeam(ctx, face, pts) {
  const seam = faceMirrorSeamPoints(face, pts);
  if (seam.length < 2) return;
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "rgba(0,0,0,.82)";
  ctx.lineWidth = 6;
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(seam[0].x, seam[0].y);
  for (let i = 1; i < seam.length; i++) ctx.lineTo(seam[i].x, seam[i].y);
  ctx.stroke();
  ctx.strokeStyle = "#ff5ec4";
  ctx.lineWidth = 2.4;
  ctx.setLineDash([8, 5]);
  ctx.beginPath();
  ctx.moveTo(seam[0].x, seam[0].y);
  for (let i = 1; i < seam.length; i++) ctx.lineTo(seam[i].x, seam[i].y);
  ctx.stroke();
  ctx.setLineDash([]);
  for (const p of seam) {
    ctx.fillStyle = "rgba(0,0,0,.82)";
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4.5, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#ff5ec4";
    ctx.beginPath();
    ctx.arc(p.x, p.y, 2.4, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

function derivedFaceEdges() {
  const seen = new Set();
  const edges = [];
  const hidden = hiddenEdgeKeySet();
  for (const face of state.faces) {
    const ids = face.verts || [];
    for (let i = 0; i < ids.length; i++) {
      const a = ids[i];
      const b = ids[(i + 1) % ids.length];
      if (!Number.isFinite(a) || !Number.isFinite(b) || a === b) continue;
      const key = a < b ? `${a},${b}` : `${b},${a}`;
      if (hidden.has(key)) continue;
      if (seen.has(key)) continue;
      seen.add(key);
      edges.push({ a, b });
    }
  }
  return edges;
}

function hiddenEdgeKeySet() {
  return new Set(state.edges
    .filter((edge) => edge.kind === EDGE_KIND_HIDDEN)
    .map((edge) => edgeKey(edge.a, edge.b))
    .filter(Boolean));
}

function edgeKey(a, b) {
  const na = Number(a);
  const nb = Number(b);
  if (!Number.isFinite(na) || !Number.isFinite(nb) || na === nb) return "";
  return na < nb ? `${na},${nb}` : `${nb},${na}`;
}

function faceEdgeKeySet() {
  const keys = new Set();
  for (const face of state.faces) {
    const ids = face.verts || [];
    for (let i = 0; i < ids.length; i++) {
      const key = edgeKey(ids[i], ids[(i + 1) % ids.length]);
      if (key) keys.add(key);
    }
  }
  return keys;
}

function renderAuditEdges() {
  const faceEdges = faceEdgeKeySet();
  return state.edges.filter((edge) =>
    edge.kind !== EDGE_KIND_HIDDEN &&
    edge.kind !== "stick" &&
    edge.kind !== EDGE_KIND_STATION_ENTRANCE &&
    !faceEdges.has(edgeKey(edge.a, edge.b))
  );
}

function renderAuditFaces() {
  return state.faces
    .map((face) => ({ face, issue: stateFacePlanarityIssue(face) }))
    .filter((item) => item.issue);
}

function hiddenEdgesVisible() {
  return els.showHiddenEdges?.checked === true;
}

function edgeComponentFrom(edge, edges = state.edges) {
  if (!edge) return [];
  const remaining = new Set(edges.map((item) => item.id));
  const byVertex = new Map();
  for (const item of edges) {
    if (!byVertex.has(item.a)) byVertex.set(item.a, []);
    if (!byVertex.has(item.b)) byVertex.set(item.b, []);
    byVertex.get(item.a).push(item);
    byVertex.get(item.b).push(item);
  }
  const component = [];
  const stack = [edge];
  while (stack.length) {
    const item = stack.pop();
    if (!item || !remaining.delete(item.id)) continue;
    component.push(item);
    for (const vertexId of [item.a, item.b]) {
      for (const next of byVertex.get(vertexId) || []) {
        if (remaining.has(next.id)) stack.push(next);
      }
    }
  }
  return component;
}

function selectedEdgeSetEdges() {
  if (state.selected?.type !== "edge") return [];
  const selectedIds = state.selectedEdgeIds?.size
    ? state.selectedEdgeIds
    : new Set([state.selected.id]);
  return state.edges.filter((edge) => selectedIds.has(edge.id));
}

function selectedEdgeIdSetFor(edge, options = {}) {
  if (!edge) return new Set();
  if (Array.isArray(options.edgeIds) && options.edgeIds.length) return new Set(options.edgeIds);
  if (!options.audit) return new Set([edge.id]);
  return new Set(edgeComponentFrom(edge, renderAuditEdges()).map((item) => item.id));
}

function orderedVerticesForEdges(edges, preferredEdge = null) {
  if (!edges.length) return [];
  if (edges.length === 1) return [edges[0].a, edges[0].b];
  const byVertex = new Map();
  const add = (vertexId, edge) => {
    if (!byVertex.has(vertexId)) byVertex.set(vertexId, []);
    byVertex.get(vertexId).push(edge);
  };
  for (const edge of edges) {
    add(edge.a, edge);
    add(edge.b, edge);
  }
  const endpoints = [...byVertex.entries()].filter(([, items]) => items.length === 1).map(([id]) => id);
  const start = endpoints[0] ?? preferredEdge?.a ?? edges[0].a;
  const ordered = [start];
  const used = new Set();
  let current = start;
  while (used.size < edges.length) {
    const nextEdge = (byVertex.get(current) || []).find((edge) => !used.has(edge.id));
    if (!nextEdge) break;
    used.add(nextEdge.id);
    const nextVertex = nextEdge.a === current ? nextEdge.b : nextEdge.a;
    if (nextVertex === start && used.size === edges.length) break;
    ordered.push(nextVertex);
    current = nextVertex;
  }
  return ordered;
}

function sameDetailVertexLoop(detail, vertexIds) {
  if (detail?.type !== DETAIL_TYPE_STATION_ENTRANCE || !Array.isArray(detail.indices)) return false;
  if (detail.indices.length !== vertexIds.length) return false;
  const a = [...detail.indices].map(Number).sort((x, y) => x - y).join(",");
  const b = [...vertexIds].map(Number).sort((x, y) => x - y).join(",");
  return a === b;
}

function migrateStationEntranceEdgesToDetails(options = {}) {
  const legacyEdges = state.edges.filter((edge) => edge.kind === EDGE_KIND_STATION_ENTRANCE);
  if (!legacyEdges.length) return 0;
  const remaining = new Set(legacyEdges.map((edge) => edge.id));
  let added = 0;
  for (const edge of legacyEdges) {
    if (!remaining.has(edge.id)) continue;
    const component = edgeComponentFrom(edge, legacyEdges);
    component.forEach((item) => remaining.delete(item.id));
    if (!edgeComponentIsClosed(component)) continue;
    const vertexIds = orderedVerticesForEdges(component, edge);
    if (vertexIds.length < 4) continue;
    if (state.details.some((detail) => sameDetailVertexLoop(detail, vertexIds))) continue;
    const face = inferFaceForEdgeVertices(vertexIds);
    const points = vertexIds.map(vertexById).filter(Boolean).map((v) => vec(v.x, v.y, v.z));
    const normal = face ? faceNormal(face) : normalFromPoints(points);
    state.details.push({
      id: newId(),
      type: DETAIL_TYPE_STATION_ENTRANCE,
      ...(face ? { faceId: face.id } : {}),
      indices: vertexIds,
      color: detailColorForConvertedEdge(DETAIL_TYPE_STATION_ENTRANCE),
      normal: toArray(normal),
      lift: 0
    });
    added++;
  }
  if (options.removeEdges !== false) {
    state.edges = state.edges.filter((edge) => edge.kind !== EDGE_KIND_STATION_ENTRANCE);
  }
  return added;
}

function auditEdgeLabel(edge) {
  return `#${edge.id} ${edge.a}-${edge.b}`;
}

function selectEdge(edge, options = {}) {
  if (!edge) return;
  cancelSurfaceInsertPreview({ redraw: false });
  cancelFaceSplitPickMode();
  state.mode = "edge";
  state.selected = { type: "edge", id: edge.id };
  state.pick = [];
  state.selectedFaceIds.clear();
  state.selectedDetailIds.clear();
  state.selectedEdgeIds = selectedEdgeIdSetFor(edge, options);
  const loopText = state.selectedEdgeIds.size > 1 ? ` LOOP (${state.selectedEdgeIds.size} LINES)` : "";
  const label = options.audit ? `AUDIT EDGE${loopText} ${auditEdgeLabel(edge)}` : `${edgeKindLabel(edge.kind)} #${edge.id}`;
  setStatus(`${label} SELECTED.`);
  setToolTab("edit", { redraw: false });
  syncControlsWindowForSelection({ render: false });
  if (options.render !== false) renderAll();
}

function projectedPointDepth(point) {
  return Number.isFinite(point?.z) ? point.z : 0;
}

function averageProjectedDepth(points) {
  const zs = points.map(projectedPointDepth).filter(Number.isFinite);
  return zs.length ? zs.reduce((sum, z) => sum + z, 0) / zs.length : 0;
}

function edgeHitCandidates(point, projected, edges = state.edges, maxLineDist = 12, options = {}) {
  const candidates = [];
  for (const edge of edges) {
    if (edge.kind === EDGE_KIND_HIDDEN && !options.includeHidden && !hiddenEdgesVisible()) continue;
    const a = projected.get(edge.a), b = projected.get(edge.b);
    if (!a || !b) continue;
    const dist = distToSegment(point, a, b);
    if (dist > maxLineDist) continue;
    const edgeGroup = edgeComponentFrom(edge, edges);
    candidates.push({
      type: "edge",
      id: edge.id,
      edge,
      edgeIds: [edge.id],
      edgeGroupIds: edgeGroup.map((item) => item.id),
      audit: !!options.audit,
      distance: dist,
      depth: averageProjectedDepth([a, b])
    });
  }
  candidates.sort((a, b) => a.distance - b.distance || a.depth - b.depth || a.id - b.id);
  return candidates;
}

function nearestEdge(point, projected, edges = state.edges, maxLineDist = 12) {
  return edgeHitCandidates(point, projected, edges, maxLineDist)[0]?.edge || null;
}

function mirrorAffectedSelectionTargets() {
  const targets = {
    faceIds: new Set(),
    edgeIds: new Set(),
    detailIds: new Set(),
    vertexIds: new Set()
  };
  if (!mirrorActionsEnabled()) return targets;

  if (["face", "uv", "group"].includes(state.selected?.type)) {
    const sourceFaces = uniqueFaceList(selectedFacePropertyTargets());
    const sourceFaceIds = new Set(sourceFaces.map((face) => face.id));
    for (const face of sourceFaces) {
      const mirror = mirroredFaceOf(face);
      if (mirror && !sourceFaceIds.has(mirror.id)) targets.faceIds.add(mirror.id);
    }
  }

  if (state.selected?.type === "edge") {
    const sourceEdges = selectedEdgeSetEdges();
    const sourceEdgeIds = new Set(sourceEdges.map((edge) => edge.id));
    for (const edge of sourceEdges) {
      const mirror = mirroredEdgeOf(edge);
      if (mirror && !sourceEdgeIds.has(mirror.id)) targets.edgeIds.add(mirror.id);
    }
  }

  if (state.selected?.type === "detail") {
    const sourceDetails = selectedDetailSetDetails();
    const sourceDetailIds = new Set(sourceDetails.map((detail) => detail.id));
    for (const detail of sourceDetails) {
      const mirror = mirroredDetailOf(detail);
      if (mirror && !sourceDetailIds.has(mirror.id)) targets.detailIds.add(mirror.id);
    }
  }

  const sourceVertexIds = new Set(state.pick);
  if (state.selected?.type === "vertex") sourceVertexIds.add(state.selected.id);
  for (const id of sourceVertexIds) {
    const mirrorId = inferredMirrorVertexId(id);
    if (mirrorId && mirrorId !== id && !sourceVertexIds.has(mirrorId)) targets.vertexIds.add(mirrorId);
  }

  return targets;
}

function drawMirrorAffectedFaceHighlights(ctx, projected, faceIds, { gameOverlay = false } = {}) {
  if (!faceIds?.size) return;
  const faces = [...faceIds]
    .map(faceById)
    .filter(Boolean)
    .sort((a, b) => faceSortDepthForMain(b) - faceSortDepthForMain(a));
  if (!faces.length) return;
  ctx.save();
  ctx.setLineDash([7, 5]);
  ctx.lineJoin = "round";
  ctx.shadowColor = "rgba(0,0,0,.78)";
  ctx.shadowBlur = 5;
  for (const face of faces) {
    const pts = projectedFacePoints(face, projected);
    if (pts.length >= 3) drawFace(ctx, pts, MIRROR_AFFECTED_FILL, MIRROR_AFFECTED_COLOR, 2.4);
  }
  ctx.restore();
}

function drawMirrorAffectedEdgeHighlights(ctx, projected, edgeIds) {
  if (!edgeIds?.size) return;
  ctx.save();
  ctx.setLineDash([7, 5]);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.shadowColor = "rgba(0,0,0,.78)";
  ctx.shadowBlur = 5;
  ctx.strokeStyle = MIRROR_AFFECTED_COLOR;
  ctx.lineWidth = 3.2;
  for (const edge of state.edges) {
    if (!edgeIds.has(edge.id)) continue;
    const a = projected.get(edge.a);
    const b = projected.get(edge.b);
    if (!a || !b) continue;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }
  ctx.restore();
}

function drawSelectedFaceHighlights(ctx, projected) {
  const selected = selectedFace();
  const selectedId = selected?.id ?? null;
  const groupedFaces = [...state.selectedFaceIds]
    .filter((id) => id !== selectedId)
    .map(faceById)
    .filter(Boolean)
    .sort((a, b) => faceSortDepthForMain(b) - faceSortDepthForMain(a));
  for (const face of groupedFaces) {
    const pts = projectedFacePoints(face, projected);
    if (pts.length >= 3) drawFace(ctx, pts, "rgba(102,232,255,.15)", "#66e8ff", 2);
  }
  if (!selected) return;
  const pts = projectedFacePoints(selected, projected);
  if (pts.length < 3) return;
  drawSelectedFaceUvGapOverlay(ctx, selected, pts);
  drawFace(ctx, pts, "rgba(255,217,54,.16)", "#ffd936", 2.2);
  drawFaceMirrorSeam(ctx, selected, pts);
}

function drawAuditEdgeOverlay(ctx, projected, { label = true, scale = 1 } = {}) {
  if (!els.showAuditEdges?.checked) return 0;
  const auditEdges = renderAuditEdges();
  if (!auditEdges.length) return 0;
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.font = `${Math.max(10, Math.round(11 * scale))}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
  ctx.textBaseline = "middle";
  for (const edge of auditEdges) {
    const a = projected.get(edge.a), b = projected.get(edge.b);
    if (!a || !b) continue;
    const selected = state.selected?.type === "edge" && (state.selected.id === edge.id || state.selectedEdgeIds.has(edge.id));
    ctx.shadowColor = "rgba(0,0,0,.95)";
    ctx.shadowBlur = 5 * scale;
    ctx.strokeStyle = selected ? "#ffd936" : "rgba(255, 20, 20, .98)";
    ctx.lineWidth = selected ? 7 * scale : 5 * scale;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "rgba(255,255,255,.92)";
    ctx.lineWidth = Math.max(1, 1.4 * scale);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
    if (label) {
      const mx = (a.x + b.x) / 2;
      const my = (a.y + b.y) / 2;
      const text = `#${edge.id}`;
      const padX = 4 * scale;
      const w = ctx.measureText(text).width + padX * 2;
      const h = 14 * scale;
      ctx.fillStyle = "rgba(30,0,0,.86)";
      ctx.fillRect(mx - w / 2, my - h / 2, w, h);
      ctx.strokeStyle = "rgba(255,255,255,.84)";
      ctx.lineWidth = 1;
      ctx.strokeRect(mx - w / 2, my - h / 2, w, h);
      ctx.fillStyle = "#ff3030";
      ctx.fillText(text, mx - w / 2 + padX, my + .5);
    }
  }
  ctx.restore();
  return auditEdges.length;
}

function drawAuditFaceOverlay(ctx, projected, { label = true, scale = 1 } = {}) {
  if (!els.showAuditEdges?.checked) return 0;
  const auditFaces = renderAuditFaces();
  if (!auditFaces.length) return 0;
  ctx.save();
  ctx.lineJoin = "round";
  ctx.font = `${Math.max(10, Math.round(11 * scale))}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
  ctx.textBaseline = "middle";
  for (const { face, issue } of auditFaces) {
    const pts = projectedFacePoints(face, projected);
    if (pts.length < 3) continue;
    const selected = state.selected?.type === "face" && (state.selected.id === face.id || state.selectedFaceIds.has(face.id));
    drawFace(
      ctx,
      pts,
      selected ? "rgba(255,217,54,.18)" : "rgba(255,20,20,.18)",
      selected ? "#ffd936" : "rgba(255,20,20,.98)",
      selected ? 3 : 2.6
    );
    ctx.save();
    ctx.setLineDash([6 * scale, 4 * scale]);
    ctx.strokeStyle = "rgba(255,255,255,.84)";
    ctx.lineWidth = Math.max(1, 1.2 * scale);
    ctx.beginPath();
    pts.forEach((point, index) => index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y));
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
    if (label) {
      const cx = pts.reduce((sum, point) => sum + point.x, 0) / pts.length;
      const cy = pts.reduce((sum, point) => sum + point.y, 0) / pts.length;
      const text = `WARP #${face.id} ${issue.maxDistance.toFixed(1)}`;
      const padX = 4 * scale;
      const w = ctx.measureText(text).width + padX * 2;
      const h = 14 * scale;
      ctx.fillStyle = "rgba(30,0,0,.86)";
      ctx.fillRect(cx - w / 2, cy - h / 2, w, h);
      ctx.strokeStyle = "rgba(255,255,255,.84)";
      ctx.lineWidth = 1;
      ctx.strokeRect(cx - w / 2, cy - h / 2, w, h);
      ctx.fillStyle = "#ff3030";
      ctx.fillText(text, cx - w / 2 + padX, cy + .5);
    }
  }
  ctx.restore();
  return auditFaces.length;
}

function surfaceInsertPreviewProjectedPoints(face, canvas, projected) {
  const points = surfaceShapePoints(face);
  const projector = rendererFacePlaneProjector(face, projected);
  if (gameRendererOverlayMode() && !projector) return [];
  if (!projector) return points.map((point) => project3d(point, canvas)).filter(Boolean);
  const basis = faceBasis(face);
  return points
    .map((point) => {
      const offset = sub(point, basis.center);
      return projector({ x: dot(offset, basis.right), y: dot(offset, basis.up) });
    })
    .filter(Boolean);
}

function facePlanePreviewPoint(point, basis, projector) {
  const offset = sub(point, basis.center);
  return projector({ x: dot(offset, basis.right), y: dot(offset, basis.up) });
}

function faceNormalPreviewOffset(face, distance, canvas) {
  const normalLine = previewFaceForBuilderFace(face)?.normalLine;
  if (!normalLine?.from || !normalLine?.to) return null;
  const from = previewProjectionPointToCanvas(normalLine.from, canvas);
  const to = previewProjectionPointToCanvas(normalLine.to, canvas);
  if (!from || !to) return null;
  const normalLen = Math.max(8, modelRadius() * .09);
  const scale = (Number(distance) || 0) / normalLen;
  return {
    x: (to.x - from.x) * scale,
    y: (to.y - from.y) * scale
  };
}

function faceExtrudePreviewProjectedPoints(face, canvas, projected) {
  const basePoints = face.verts.map(vertexById).filter(Boolean);
  const capPoints = extrudedFacePoints(face);
  if (basePoints.length < 3 || capPoints.length !== basePoints.length) return null;
  const projector = rendererFacePlaneProjector(face, projected);
  if (gameRendererOverlayMode() && !projector) return null;
  if (!projector) {
    return {
      basePts: basePoints.map((point) => project3d(point, canvas)).filter(Boolean),
      capPts: capPoints.map((point) => project3d(point, canvas)).filter(Boolean)
    };
  }
  const basis = faceBasis(face);
  const distanceOffset = faceNormalPreviewOffset(face, currentFaceExtrudeConfig().distance, canvas);
  if (!distanceOffset) return null;
  const basePts = basePoints.map((point) => facePlanePreviewPoint(point, basis, projector)).filter(Boolean);
  const capPts = capPoints
    .map((point) => facePlanePreviewPoint(point, basis, projector))
    .filter(Boolean)
    .map((point) => ({
      x: point.x + distanceOffset.x,
      y: point.y + distanceOffset.y
    }));
  return { basePts, capPts };
}

function drawSurfaceInsertPreview(ctx, canvas, projected = null) {
  if (!state.surfaceInsertPreview) return;
  const face = selectedFace();
  if (!face || state.mode !== "face") return;
  const pts = surfaceInsertPreviewProjectedPoints(face, canvas, projected);
  if (pts.length < 3) return;
  ctx.save();
  ctx.setLineDash([8, 5]);
  drawFace(ctx, pts, "rgba(102,232,255,.12)", "#66e8ff", 2.2);
  ctx.setLineDash([]);
  ctx.fillStyle = "#66e8ff";
  ctx.strokeStyle = "rgba(0,0,0,.75)";
  ctx.lineWidth = 2;
  for (const point of pts) {
    ctx.beginPath();
    ctx.arc(point.x, point.y, 3.5, 0, TAU);
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}

function drawFaceExtrudePreview(ctx, canvas, projected = null) {
  if (!state.faceExtrudePreview) return;
  const face = selectedExtrudeFace();
  if (!face) return;
  const previewPoints = faceExtrudePreviewProjectedPoints(face, canvas, projected);
  if (!previewPoints) return;
  const { basePts, capPts } = previewPoints;
  if (basePts.length < 3 || capPts.length !== basePts.length) return;
  ctx.save();
  ctx.setLineDash([8, 5]);
  drawFace(ctx, capPts, "rgba(255,217,54,.12)", "#ffd936", 2.2);
  ctx.setLineDash([]);
  ctx.strokeStyle = "rgba(255,217,54,.82)";
  ctx.lineWidth = 1.4;
  for (let i = 0; i < basePts.length; i++) {
    ctx.beginPath();
    ctx.moveTo(basePts[i].x, basePts[i].y);
    ctx.lineTo(capPts[i].x, capPts[i].y);
    ctx.stroke();
  }
  ctx.fillStyle = "#ffd936";
  ctx.strokeStyle = "rgba(0,0,0,.75)";
  ctx.lineWidth = 2;
  for (const point of capPts) {
    ctx.beginPath();
    ctx.arc(point.x, point.y, 3.5, 0, TAU);
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}

function drawSelectionPickHover(ctx, canvas, projected) {
  const candidate = state.selectionPickHover;
  if (!candidate) return;
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,.8)";
  ctx.shadowBlur = 6;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.strokeStyle = "#66e8ff";
  ctx.fillStyle = "rgba(102,232,255,.14)";
  ctx.lineWidth = 3;
  if (["face", "uv", "group"].includes(candidate.type)) {
    const face = faceById(candidate.id);
    const pts = face ? projectedFacePoints(face, projected) : [];
    if (pts.length >= 3) drawFace(ctx, pts, "rgba(102,232,255,.18)", "#66e8ff", 3);
  } else if (candidate.type === "edge") {
    const sourceEdges = candidate.audit ? renderAuditEdges() : state.edges;
    const edgeIds = candidate.edgeIds?.length ? new Set(candidate.edgeIds) : new Set([candidate.id]);
    for (const edge of sourceEdges.filter((item) => edgeIds.has(item.id))) {
      const a = projected.get(edge.a);
      const b = projected.get(edge.b);
      if (!a || !b) continue;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
  } else if (candidate.type === "detail") {
    const detail = detailById(candidate.id);
    const pts = detail ? projectedDetailPointsForMain(detail, canvas) : [];
    if (detail?.type === "beacon" && pts[0]) {
      ctx.beginPath();
      ctx.arc(pts[0].x, pts[0].y, 9, 0, TAU);
      ctx.fill();
      ctx.stroke();
    } else if (pts.length >= 2) {
      ctx.beginPath();
      pts.forEach((point, index) => index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y));
      if (detail?.type === "window" || detail?.type === "engine" || detail?.type === DETAIL_TYPE_STATION_ENTRANCE) ctx.closePath();
      if (detail?.type === "window" || detail?.type === "engine") ctx.fill();
      ctx.stroke();
    }
  } else if (candidate.type === "vertex") {
    const p = projected.get(candidate.id);
    if (p) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 9, 0, TAU);
      ctx.fill();
      ctx.stroke();
    }
  } else if (candidate.type === "vertexGroup") {
    for (const id of candidate.vertexIds || state.pick) {
      const p = projected.get(id);
      if (!p) continue;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 9, 0, TAU);
      ctx.fill();
      ctx.stroke();
    }
  }
  ctx.restore();
}

function renderMain() {
  const canvas = els.mainView;
  const ctx = canvas.getContext("2d");
  const previewMode = normalizePreviewRenderMode(els.previewRenderMode?.value || "gameOverlay");
  const gameOverlay = gameRendererOverlayMode(previewMode);
  updatePreviewTrustUi();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!gameOverlay) drawStars(ctx, canvas);
  if (gameOverlay && !state.gamePreviewProjection?.points?.length) return;
  const projected = projectedMapForMain(canvas);
  const mirrorTargets = mirrorAffectedSelectionTargets();
  const drawFaces = previewMode !== "wire" && !gameOverlay;
  const drawWire = previewMode !== "bitmap" && !gameOverlay;
  const drawBitmapGuide = previewMode === "wireBitmap" || previewMode === "bitmap";

  if (drawFaces) {
    const sortedFaces = [...state.faces].sort((a, b) => faceDepth(b) - faceDepth(a));
    for (const face of sortedFaces) {
      const pts = face.verts.map((id) => projected.get(id)).filter(Boolean);
      const n = faceNormal(face);
      if (drawBitmapGuide) {
        drawFace(ctx, pts, builderBitmapFill(n, face), "rgba(0,0,0,0)", 0);
        const textured = drawFaceBitmapSkin(ctx, face, pts);
        drawFaceBitmapDecals(ctx, face, pts);
        if (!textured) drawFaceTextureGuide(ctx, pts, previewMode === "bitmap" ? .22 : .16);
        if (drawWire) drawFace(ctx, pts, "rgba(0,0,0,0)", "rgba(0,0,0,0)", 0);
      } else {
        drawFace(
          ctx,
          pts,
          shadedFaceColor(n, optionalHexColor(face.faceColor) || els.baseColor.value),
          "rgba(0,0,0,0)",
          0
        );
      }
    }
  }
  drawBlankUvFaceOverlay(ctx, canvas, projected);
  if (gameOverlay) drawGameRendererFaceNormals(ctx, canvas);
  else drawFaceNormals(ctx, (v) => project3d(v, canvas));
  drawFaceUvTypeOverlay(ctx, projected, { scale: 1.05 });

  if (drawWire) {
    ctx.strokeStyle = drawFaces ? "rgba(85,255,78,.32)" : "rgba(85,255,78,.58)";
    ctx.lineWidth = drawFaces ? 1 : 1.1;
    ctx.beginPath();
    for (const e of derivedFaceEdges()) {
      const a = projected.get(e.a), b = projected.get(e.b);
      if (!a || !b) continue;
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
    }
    ctx.stroke();
    for (const e of state.edges) {
      const selected = state.selected?.type === "edge" && (state.selected.id === e.id || state.selectedEdgeIds.has(e.id));
      if (e.kind === EDGE_KIND_HIDDEN && !selected && !hiddenEdgesVisible()) continue;
      const a = projected.get(e.a), b = projected.get(e.b);
      if (!a || !b) continue;
      ctx.strokeStyle = edgeStrokeStyle(e, selected);
      ctx.lineWidth = edgeLineWidth(e, selected);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
  }

  if (gameOverlay && state.selected?.type === "edge") {
    for (const edge of selectedEdgeSetEdges()) {
      const a = projected.get(edge.a);
      const b = projected.get(edge.b);
      if (!a || !b) continue;
      ctx.strokeStyle = "#ffd936";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
  }
  drawSelectedFaceHighlights(ctx, projected);
  drawMirrorAffectedFaceHighlights(ctx, projected, mirrorTargets.faceIds, { gameOverlay });
  drawMirrorAffectedEdgeHighlights(ctx, projected, mirrorTargets.edgeIds);

  drawSurfaceInsertPreview(ctx, canvas, projected);
  drawFaceExtrudePreview(ctx, canvas, projected);
  drawAuditFaceOverlay(ctx, projected, { label: true, scale: 1.15 });
  drawAuditEdgeOverlay(ctx, projected, { label: true, scale: 1.15 });

  for (const detail of state.details) {
    const selected = state.selected?.type === "detail" && (state.selected.id === detail.id || state.selectedDetailIds.has(detail.id));
    const mirrorAffected = mirrorTargets.detailIds.has(detail.id);
    const surfaceVisible = detailSurfaceVisibleInMain(detail, { gameOverlay, hiddenFaces: drawFaces || gameOverlay });
    if (!detailVisibleInView(detail) && !selected && !mirrorAffected) continue;
    if (!surfaceVisible && !selected && !mirrorAffected) continue;
    const pts = projectedDetailPointsForMain(detail, canvas);
    if (detail.type === "beacon") {
      const p = pts[0] || null;
      if (!p) continue;
      if (gameOverlay && !selectionFilterAllows("detail") && !selected && !mirrorAffected) continue;
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      if (mirrorAffected && !selected) ctx.setLineDash([5, 4]);
      ctx.fillStyle = selected ? "rgba(255,217,54,.95)" : mirrorAffected ? MIRROR_AFFECTED_FILL : `${detail.color || "#ffb642"}cc`;
      ctx.strokeStyle = selected ? "#ffd936" : mirrorAffected ? MIRROR_AFFECTED_COLOR : "rgba(255,255,255,.72)";
      ctx.lineWidth = selected ? 2.4 : mirrorAffected ? 2.1 : 1.2;
      ctx.beginPath();
      ctx.arc(p.x, p.y, selected ? 8 : mirrorAffected ? 7.2 : 5.5, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(p.x - 10, p.y);
      ctx.lineTo(p.x + 10, p.y);
      ctx.moveTo(p.x, p.y - 10);
      ctx.lineTo(p.x, p.y + 10);
      ctx.stroke();
      ctx.restore();
      continue;
    }
    if (pts.length < 2) continue;
    if (gameOverlay && !selectionFilterAllows("detail") && !selected && !mirrorAffected) continue;
    if (previewMode === "wire" && !selected && !mirrorAffected) continue;
    if (mirrorAffected && !selected) {
      ctx.save();
      ctx.setLineDash([7, 5]);
    }
    if (detail.type === "panel") {
      ctx.strokeStyle = selected ? "#ffd936" : mirrorAffected ? MIRROR_AFFECTED_COLOR : "rgba(255,217,54,.8)";
      ctx.lineWidth = selected ? 3 : mirrorAffected ? 2.6 : 1.4;
      ctx.beginPath();
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
    } else if (detail.type === DETAIL_TYPE_STATION_ENTRANCE) {
      ctx.strokeStyle = selected ? "#ffd936" : mirrorAffected ? MIRROR_AFFECTED_COLOR : "rgba(102,232,255,.82)";
      ctx.fillStyle = selected ? "rgba(255,217,54,.12)" : "rgba(102,232,255,.08)";
      ctx.lineWidth = selected ? 3 : mirrorAffected ? 2.6 : 1.8;
      ctx.beginPath();
      pts.forEach((point, index) => index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y));
      ctx.closePath();
      if (selected || mirrorAffected) ctx.fill();
      ctx.stroke();
    } else {
      const windowTransparent = detail.type === "window" && detail.baseTransparent === true;
      drawFace(
        ctx,
        pts,
        windowTransparent ? "rgba(0,0,0,0)" : mirrorAffected && !selected ? MIRROR_AFFECTED_FILL : detail.type === "engine" ? "rgba(247,255,247,.92)" : (optionalHexColor(detail.color) || "rgba(5,16,18,.92)"),
        selected ? "#ffd936" : mirrorAffected ? MIRROR_AFFECTED_COLOR : "rgba(255,255,255,.38)",
        selected ? 2 : mirrorAffected ? 2.4 : 1
      );
    }
    if (mirrorAffected && !selected) ctx.restore();
  }

  for (const v of state.verts) {
    const p = projected.get(v.id);
    if (!p) continue;
    const picked = state.pick.includes(v.id);
    const selected = state.selected?.type === "vertex" && state.selected.id === v.id;
    const mirrorAffected = mirrorTargets.vertexIds.has(v.id);
    const showIdleVertex = !gameOverlay && selectionFilterAllows("vertex") && previewMode !== "bitmap" && previewMode !== "wireBitmap";
    if (!picked && !selected && !mirrorAffected && !showIdleVertex) continue;
    if (picked) {
      ctx.strokeStyle = "#66e8ff";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(p.x, p.y, selected ? 8.5 : 7, 0, TAU);
      ctx.stroke();
    }
    if (mirrorAffected) {
      ctx.save();
      ctx.setLineDash([5, 4]);
      ctx.strokeStyle = MIRROR_AFFECTED_COLOR;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(p.x, p.y, selected ? 10 : 8, 0, TAU);
      ctx.stroke();
      ctx.restore();
    }
    ctx.fillStyle = selected ? "#ffd936" : picked ? "#66e8ff" : mirrorAffected ? MIRROR_AFFECTED_COLOR : v.center ? "rgba(255,255,255,.62)" : "rgba(85,255,78,.62)";
    ctx.strokeStyle = "rgba(0,0,0,.8)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(p.x, p.y, selected ? 6 : picked ? 5 : 4, 0, TAU);
    ctx.fill();
    ctx.stroke();
  }
  drawSelectionPickHover(ctx, canvas, projected);
}

function renderAll() {
  updateUi();
  updateProjectionViewButtons();
  updateSelectedBitmapReadout();
  updateFaceDecalControls();
  renderMain();
  updateExport();
  scheduleGamePreviewSync();
  markBuilderPreloadStep("rendered", "Builder canvas ready; warming renderer...");
}

function renderPreviewMotion() {
  updatePreviewTrustUi();
  renderMain();
  scheduleGamePreviewSync(320);
}

function cachedPreviewImageDataUrl(img) {
  if (!img?.naturalWidth || !img?.naturalHeight) return "";
  const cached = previewImageDataUrlCache.get(img);
  if (cached) return cached;
  const dataUrl = imageToPngDataUrl(img);
  previewImageDataUrlCache.set(img, dataUrl);
  return dataUrl;
}

function gamePreviewBitmapSkins() {
  const skins = {
    version: state.previewSkinVersion,
    mirrorX: state.skinImages?.mirrorX || emptyMirrorFlags(false),
    builderOverride: true,
    replaceBaseTexture: true,
    alpha: .96
  };
  let count = 0;
  for (const side of ["top", "bottom", "back"]) {
    const img = state.skinImages?.[side];
    if (!img?.naturalWidth) continue;
    skins[side] = cachedPreviewImageDataUrl(img);
    count++;
  }
  const faces = {};
  for (const [key, img] of Object.entries(state.faceSkinImages || {})) {
    if (!img?.naturalWidth) continue;
    faces[key] = cachedPreviewImageDataUrl(img);
    count++;
  }
  if (Object.keys(faces).length) skins.faces = faces;
  const decalKeys = [...new Set(state.faces.flatMap((face) => cleanFaceDecals(face.bitmapDecals).map((decal) => decal.key)))];
  const decals = {};
  for (const key of decalKeys) {
    const img = state.decalImages[key] || loadDecalImage(key);
    if (!img?.naturalWidth) continue;
    decals[key] = cachedPreviewImageDataUrl(img);
    count++;
  }
  if (Object.keys(decals).length) skins.decals = decals;
  const angle = sideSkinAngleDeg();
  if (angle) skins.angle = { top: angle, bottom: angle, back: angle };
  return skins;
}

function gamePreviewFitScale() {
  const canvas = els.mainView;
  const bounds = projectedModelBoundsAtZoomOne(canvas);
  if (!canvas || !bounds) return state.view.zoom * modelOverallSize() / 360;
  const width = Math.max(1, bounds.maxX - bounds.minX) * state.view.zoom;
  const height = Math.max(1, bounds.maxY - bounds.minY) * state.view.zoom;
  return Math.max(width, height) / Math.max(1, Math.min(canvas.width, canvas.height));
}

function projectedGamePreviewTargetScale() {
  const fitScale = gamePreviewFitScale();
  if (state.view.orthographic) return clamp(fitScale, GAME_PREVIEW_SCALE_MIN, 8);
  return clamp(fitScale * GAME_PREVIEW_PERSPECTIVE_SCALE, GAME_PREVIEW_SCALE_MIN, GAME_PREVIEW_PERSPECTIVE_SCALE_MAX);
}

function anchorGamePreviewTargetScale() {
  const scale = projectedGamePreviewTargetScale();
  state.gamePreviewScaleAnchor = {
    zoom: Math.max(EPS, state.view.zoom),
    scale,
    orthographic: !!state.view.orthographic
  };
  return scale;
}

function resetGamePreviewTargetScale() {
  state.gamePreviewScaleAnchor = null;
}

function gamePreviewTargetScale() {
  const max = state.view.orthographic ? 8 : GAME_PREVIEW_PERSPECTIVE_SCALE_MAX;
  const anchor = state.gamePreviewScaleAnchor;
  if (anchor && anchor.orthographic === !!state.view.orthographic && anchor.zoom > EPS) {
    return clamp(anchor.scale * state.view.zoom / anchor.zoom, GAME_PREVIEW_SCALE_MIN, max);
  }
  return anchorGamePreviewTargetScale();
}

function gamePreviewPayload(options = {}) {
  const force = !!options.force;
  const previewDetails = filteredDetailsForView();
  const previewDetailIndexes = previewDetails.map((detail) => state.details.indexOf(detail));
  const blueprint = derivedBlueprint({ details: previewDetails });
  state.gamePreviewDetailProjectionIndexByStateIndex = new Map(
    previewDetailIndexes.map((stateIndex, projectionIndex) => [stateIndex, projectionIndex])
  );
  const blueprintKey = JSON.stringify(blueprint);
  const skinVersion = state.previewSkinVersion || 0;
  const includeBlueprint = force || blueprintKey !== gamePreviewSentBlueprintKey || blueprintKey !== gamePreviewConfirmedBlueprintKey;
  const includeSkins = force || skinVersion !== gamePreviewSentSkinVersion;
  const mode = options.mode || gamePreviewRendererMode();
  const fxLevel = options.fxLevel || gamePreviewFxLevel();
  return {
    id: templateShipId(),
    name: els.shipName.value.trim() || templateShipId(),
    blueprintKey,
    bitmapSkinVersion: skinVersion,
    ...(includeBlueprint ? { blueprint } : {}),
    gameMeta: gameMetadata(),
    ...(includeSkins ? { bitmapSkins: gamePreviewBitmapSkins() } : {}),
    view: { rx: state.view.rx, ry: state.view.ry, roll: 0 },
    orthographic: !!state.view.orthographic,
    mode,
    fxLevel,
    quality: "live",
    lightMode: "front",
    projection: gameRendererOverlayMode(),
    allowClosePreview: true,
    targetScale: Number.isFinite(Number(options.targetScale)) ? Number(options.targetScale) : gamePreviewTargetScale()
  };
}

function gamePreviewSyncKey(payload) {
  return JSON.stringify({
    id: payload.id,
    blueprintKey: payload.blueprintKey,
    bitmapVersion: payload.bitmapSkinVersion || 0,
    view: {
      rx: Math.round((payload.view?.rx || 0) * 1000) / 1000,
      ry: Math.round((payload.view?.ry || 0) * 1000) / 1000,
      roll: Math.round((payload.view?.roll || 0) * 1000) / 1000
    },
    orthographic: !!payload.orthographic,
    mode: payload.mode,
    fxLevel: payload.fxLevel,
    quality: payload.quality,
    lightMode: payload.lightMode,
    projection: !!payload.projection,
    targetScale: payload.targetScale,
    baseColor: payload.gameMeta?.baseColor,
    decalRole: payload.gameMeta?.decalRole
  });
}

function gamePreviewViewPayload() {
  return {
    id: templateShipId(),
    name: els.shipName.value.trim() || templateShipId(),
    blueprintKey: gamePreviewSentBlueprintKey,
    bitmapSkinVersion: gamePreviewSentSkinVersion || state.previewSkinVersion || 0,
    view: { rx: state.view.rx, ry: state.view.ry, roll: 0 },
    orthographic: !!state.view.orthographic,
    mode: gamePreviewRendererMode(),
    fxLevel: gamePreviewFxLevel(),
    quality: "live",
    lightMode: "front",
    projection: gameRendererOverlayMode(),
    targetScale: gamePreviewTargetScale()
  };
}

function syncGamePreview(force = false) {
  const frame = els.gamePreviewFrame;
  if (!frame?.contentWindow) return;
  try {
    const payload = gamePreviewPayload({ force });
    const key = gamePreviewSyncKey(payload);
    if (!force && key === gamePreviewLastKey) return;
    gamePreviewLastKey = key;
    if (payload.blueprint) {
      gamePreviewSentBlueprintKey = payload.blueprintKey;
      gamePreviewConfirmedBlueprintKey = "";
    }
    if (Object.prototype.hasOwnProperty.call(payload, "bitmapSkins")) gamePreviewSentSkinVersion = payload.bitmapSkinVersion || 0;
    state.gamePreviewInfo = null;
    state.gamePreviewProjection = null;
    updatePreviewTrustUi();
    frame.contentWindow.postMessage({
      type: "ultra-elite-render-preview",
      payload
    }, "*");
    if (els.gamePreviewReadout) els.gamePreviewReadout.textContent = `${templateShipId().toUpperCase()} REFRESHING REAL RENDERER.`;
  } catch (error) {
    if (els.gamePreviewReadout) els.gamePreviewReadout.textContent = `GAME RENDER SYNC FAILED: ${error.message}`;
  }
}

function syncGamePreviewView() {
  const frame = els.gamePreviewFrame;
  if (!frame?.contentWindow || !gamePreviewSentBlueprintKey || gamePreviewConfirmedBlueprintKey !== gamePreviewSentBlueprintKey) return;
  const payload = gamePreviewViewPayload();
  const key = gamePreviewSyncKey(payload);
  if (key === gamePreviewLastKey) return;
  gamePreviewLastKey = key;
  frame.contentWindow.postMessage({
    type: "ultra-elite-render-preview",
    payload
  }, "*");
}

function queueGamePreviewViewSync() {
  if (gamePreviewViewFrame || !gamePreviewSentBlueprintKey || gamePreviewConfirmedBlueprintKey !== gamePreviewSentBlueprintKey) return;
  gamePreviewViewFrame = requestAnimationFrame(() => {
    gamePreviewViewFrame = 0;
    syncGamePreviewView();
  });
}

function resetGamePreviewSyncState() {
  clearTimeout(gamePreviewTimer);
  if (gamePreviewViewFrame) cancelAnimationFrame(gamePreviewViewFrame);
  gamePreviewViewFrame = 0;
  gamePreviewLastKey = "";
  gamePreviewSentBlueprintKey = "";
  gamePreviewConfirmedBlueprintKey = "";
  gamePreviewSentSkinVersion = 0;
  gamePreviewRetryCount = 0;
  resetGamePreviewTargetScale();
  state.gamePreviewInfo = null;
  state.gamePreviewProjection = null;
  state.gamePreviewDetailProjectionIndexByStateIndex.clear();
  updatePreviewTrustUi();
}

function spinPreviewPayload() {
  return {
    ...gamePreviewPayload({ force: true, mode: "solid", fxLevel: "ultra" }),
    view: { rx: state.view.rx, ry: state.view.ry, roll: 0 },
    mode: "solid",
    fxLevel: "ultra",
    projection: false,
    autoRotate: true,
    targetScale: .62
  };
}

function storeSpinPreviewPayload(payload) {
  try {
    localStorage.setItem(SPIN_PREVIEW_STORAGE_KEY, JSON.stringify({ savedAt: Date.now(), payload }));
  } catch (error) {
    console.warn("Spin preview local handoff failed", error);
  }
}

function broadcastSpinPreviewPayload(payload) {
  if (!("BroadcastChannel" in window)) return;
  const channel = new BroadcastChannel(SPIN_PREVIEW_CHANNEL);
  channel.postMessage({
    type: "ultra-elite-render-preview",
    payload
  });
  channel.close();
}

function postSpinPreviewPayload(targetWindow, payload = spinPreviewPayload()) {
  storeSpinPreviewPayload(payload);
  broadcastSpinPreviewPayload(payload);
  if (!targetWindow) return false;
  targetWindow.postMessage({
    type: "ultra-elite-render-preview",
    payload
  }, "*");
  return true;
}

function closeSpinPreviewWindow() {
  els.spinPreviewModal?.classList.add("is-hidden");
  const frame = els.spinPreviewFrame;
  if (frame?.contentWindow) {
    frame.contentWindow.postMessage({
      type: "ultra-elite-render-preview",
      payload: { autoRotate: false }
    }, "*");
  }
  if (frame) frame.src = "about:blank";
  setStatus("SPIN PREVIEW CLOSED.");
}

function openSpinPreviewWindow() {
  const payload = spinPreviewPayload();
  storeSpinPreviewPayload(payload);
  const frame = els.spinPreviewFrame;
  if (!frame) {
    setStatus("SPIN PREVIEW FRAME MISSING.");
    return;
  }
  els.spinPreviewModal?.classList.remove("is-hidden");
  setStatus("OPENING SPIN PREVIEW...");
  const sendSnapshot = () => {
    if (postSpinPreviewPayload(frame.contentWindow, payload)) setStatus("SPIN PREVIEW UPDATED.");
  };
  const handleReady = (event) => {
    if (event.source !== frame.contentWindow) return;
    if (event.data?.type !== "ultra-elite-render-preview-ready") return;
    window.removeEventListener("message", handleReady);
    sendSnapshot();
  };
  window.addEventListener("message", handleReady);
  frame.src = `render-preview.html?spin=1&embed=${Date.now()}`;
  setTimeout(sendSnapshot, 450);
  setTimeout(sendSnapshot, 1200);
}

function rendererBenchmarkFrames() {
  const frames = [];
  const addFrame = (rx, ry, phase, warmup = false) => frames.push({ rx, ry, phase, warmup });
  for (let i = 0; i < 6; i++) addFrame(-0.35, i * TAU / 6, "warmup", true);
  for (let i = 0; i < 36; i++) addFrame(-0.35, i * TAU / 36, "yaw");
  for (let i = 0; i < 28; i++) {
    const t = i / 27;
    addFrame(-1.05 + t * 2.1, 0.75, "pitch");
  }
  return frames;
}

function rendererBenchmarkStats(samples) {
  const valid = samples.filter((value) => Number.isFinite(value) && value > 0).slice().sort((a, b) => a - b);
  if (!valid.length) return { count: 0, filteredCount: 0, outliers: 0, avg: 0, rawAvg: 0, median: 0, p95: 0, max: 0, rawMax: 0, stdDev: 0, rawStdDev: 0, jitterPct: 0, spikeTax: 0 };
  const trim = valid.length >= 8 ? Math.max(1, Math.floor(valid.length * .05)) : 0;
  const sorted = valid.slice(0, Math.max(1, valid.length - trim));
  const pick = (items, q) => items[Math.min(items.length - 1, Math.max(0, Math.floor(q * (items.length - 1))))];
  const avgFor = (items) => items.reduce((sum, value) => sum + value, 0) / items.length;
  const stdFor = (items) => {
    if (items.length < 2) return 0;
    const avg = avgFor(items);
    return Math.sqrt(items.reduce((sum, value) => sum + (value - avg) ** 2, 0) / items.length);
  };
  const avg = avgFor(sorted);
  const rawAvg = avgFor(valid);
  const stdDev = stdFor(sorted);
  const rawStdDev = stdFor(valid);
  return {
    count: valid.length,
    filteredCount: sorted.length,
    outliers: valid.length - sorted.length,
    avg,
    rawAvg,
    median: pick(sorted, .5),
    p95: pick(sorted, .95),
    max: sorted[sorted.length - 1],
    rawMax: valid[valid.length - 1],
    stdDev,
    rawStdDev,
    jitterPct: avg ? stdDev / avg * 100 : 0,
    spikeTax: Math.max(0, rawAvg - avg)
  };
}

function rendererBenchmarkReport(stats, wallMs, frames) {
  const fps = stats.avg > 0 ? 1000 / stats.avg : 0;
  return `BENCH ${stats.count} FRAMES: MED ${stats.median.toFixed(1)}MS  P95 ${stats.p95.toFixed(1)}MS  SD ${stats.stdDev.toFixed(1)}MS  AVG ${stats.avg.toFixed(1)}MS (${fps.toFixed(0)} FPS)  OUTLIERS ${stats.outliers}  RAW MAX ${stats.rawMax.toFixed(1)}MS  SPIKE +${stats.spikeTax.toFixed(1)}MS  WALL ${(wallMs / 1000).toFixed(1)}S  WARMUP ${frames.filter((frame) => frame.warmup).length}`;
}

function waitForBenchmarkReady(frame, timeoutMs = 6000) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      window.removeEventListener("message", onMessage);
      reject(new Error("benchmark renderer timed out"));
    }, timeoutMs);
    const onMessage = (event) => {
      if (event.source !== frame.contentWindow) return;
      if (event.data?.type !== "ultra-elite-render-preview-ready") return;
      clearTimeout(timeout);
      window.removeEventListener("message", onMessage);
      resolve();
    };
    window.addEventListener("message", onMessage);
  });
}

function renderBenchmarkFrame(frame, payload, timeoutMs = 5000) {
  return new Promise((resolve, reject) => {
    const requestId = payload.benchmarkRequestId;
    const timeout = setTimeout(() => {
      window.removeEventListener("message", onMessage);
      reject(new Error(`benchmark frame ${requestId} timed out`));
    }, timeoutMs);
    const onMessage = (event) => {
      if (event.source !== frame.contentWindow) return;
      const data = event.data || {};
      if (data.type !== "ultra-elite-render-preview-result") return;
      if (data.benchmarkRequestId !== requestId) return;
      clearTimeout(timeout);
      window.removeEventListener("message", onMessage);
      resolve(data);
    };
    window.addEventListener("message", onMessage);
    frame.contentWindow.postMessage({
      type: "ultra-elite-render-preview",
      payload
    }, "*");
  });
}

function benchmarkFramePayload(basePayload, frame, runId, index) {
  const common = {
    id: basePayload.id,
    name: basePayload.name,
    blueprintKey: basePayload.blueprintKey,
    bitmapSkinVersion: basePayload.bitmapSkinVersion || 0,
    benchmarkRequestId: `${runId}:${index}`,
    view: { rx: frame.rx, ry: frame.ry, roll: 0 },
    mode: "solid",
    fxLevel: "ultra",
    quality: "live",
    projection: false,
    targetScale: .62
  };
  if (index === 0) {
    return {
      ...basePayload,
      ...common,
      projection: false,
      autoRotate: false
    };
  }
  return common;
}

async function runRendererBenchmark() {
  if (rendererBenchmarkRunning) return;
  rendererBenchmarkRunning = true;
  if (els.benchmarkRendererBtn) els.benchmarkRendererBtn.disabled = true;
  const frame = document.createElement("iframe");
  frame.className = "renderer-benchmark-frame";
  frame.title = "Renderer benchmark";
  document.body.append(frame);
  const ready = waitForBenchmarkReady(frame);
  frame.src = `render-preview.html?benchmark=${Date.now()}`;
  const runId = `bench_${Date.now().toString(36)}`;
  const frames = rendererBenchmarkFrames();
  const samples = [];
  const wallStart = performance.now();
  try {
    setStatus(`RENDER BENCHMARK STARTING (${frames.length} FRAMES)...`);
    if (els.gamePreviewReadout) els.gamePreviewReadout.textContent = "BENCHMARK: LOADING RENDERER...";
    await ready;
    const basePayload = {
      ...gamePreviewPayload({ force: true }),
      projection: false,
      targetScale: .62
    };
    for (let i = 0; i < frames.length; i++) {
      const sample = frames[i];
      if (els.gamePreviewReadout && (i === 0 || i % 10 === 0)) {
        els.gamePreviewReadout.textContent = `BENCHMARK: ${i + 1}/${frames.length} ${sample.phase.toUpperCase()}`;
      }
      const result = await renderBenchmarkFrame(frame, benchmarkFramePayload(basePayload, sample, runId, i));
      if (!sample.warmup) samples.push(Number(result.renderMs) || 0);
      await new Promise((resolve) => requestAnimationFrame(resolve));
    }
    const stats = rendererBenchmarkStats(samples);
    const report = rendererBenchmarkReport(stats, performance.now() - wallStart, frames);
    setStatus(report);
    if (els.gamePreviewReadout) els.gamePreviewReadout.textContent = report;
  } catch (error) {
    const message = `RENDER BENCHMARK FAILED: ${error.message}`;
    setStatus(message);
    if (els.gamePreviewReadout) els.gamePreviewReadout.textContent = message;
  } finally {
    frame.remove();
    if (els.benchmarkRendererBtn) els.benchmarkRendererBtn.disabled = false;
    rendererBenchmarkRunning = false;
  }
}

function scheduleGamePreviewSync(delay = 260, force = false) {
  if (!gameRendererPreviewMode()) return;
  if (force) {
    clearTimeout(gamePreviewTimer);
    if (gamePreviewViewFrame) cancelAnimationFrame(gamePreviewViewFrame);
    gamePreviewViewFrame = 0;
    gamePreviewTimer = setTimeout(() => syncGamePreview(true), Math.max(0, delay));
    return;
  }
  if (gamePreviewSentBlueprintKey) queueGamePreviewViewSync();
  clearTimeout(gamePreviewTimer);
  gamePreviewTimer = setTimeout(() => syncGamePreview(false), delay);
}

function syncLiveRenderPreviews(delay = 0) {
  scheduleGamePreviewSync(delay, true);
  if (!els.spinPreviewModal?.classList.contains("is-hidden")) {
    postSpinPreviewPayload(els.spinPreviewFrame?.contentWindow);
  }
}

function kickInitialGamePreviewSync() {
  if (!gameRendererPreviewMode()) return;
  syncGamePreview(true);
  requestAnimationFrame(() => syncGamePreview(true));
  setTimeout(() => syncGamePreview(true), 250);
  setTimeout(() => syncGamePreview(true), 900);
}

function summarizeGamePreviewInfo(info) {
  const summary = gamePreviewProjectionSummary(info);
  if (!summary) return "REAL RENDERER READY.";
  const suffix = summary.missingUv ? `  ${summary.missingUv} FACE UV GAP${summary.missingUv === 1 ? "" : "S"}` : "";
  return `REAL RENDERER: ${summary.visibleFaces}/${summary.faces} VISIBLE FACES  ${summary.projectedPoints} POINTS  ${summary.faceTextureRefs} FACE UVS${suffix}`;
}

function gamePreviewRenderReady(info) {
  if (!state.faces.length) return true;
  const summary = gamePreviewProjectionSummary(info);
  return !!summary && summary.faces > 0 && summary.visibleFaces > 0 && summary.projectedPoints > 0;
}

function retryGamePreviewWarmup() {
  if (gamePreviewRetryCount >= GAME_PREVIEW_WARMUP_RETRY_MAX) return false;
  gamePreviewRetryCount += 1;
  gamePreviewLastKey = "";
  const delay = 160 + gamePreviewRetryCount * 170;
  if (els.gamePreviewReadout) {
    els.gamePreviewReadout.textContent = `REAL RENDERER WARMING (${gamePreviewRetryCount}/${GAME_PREVIEW_WARMUP_RETRY_MAX})...`;
  }
  scheduleGamePreviewSync(delay, true);
  return true;
}

function handleGamePreviewResult(data) {
  if (state.faces.length && gamePreviewSentBlueprintKey && data?.blueprintKey !== gamePreviewSentBlueprintKey) {
    gamePreviewLastKey = "";
    scheduleGamePreviewSync(0, true);
    return;
  }
  const info = data?.info || null;
  if (!gamePreviewRenderReady(info)) {
    if (retryGamePreviewWarmup()) return;
    if (state.builderPreload.visible) {
      gamePreviewRetryCount = 0;
      setBuilderPreloadText("Renderer preview did not draw the model yet; retrying...");
      gamePreviewLastKey = "";
      scheduleGamePreviewSync(400, true);
      return;
    }
  }
  if (data?.blueprintKey && data.blueprintKey === gamePreviewSentBlueprintKey) {
    gamePreviewConfirmedBlueprintKey = data.blueprintKey;
  }
  gamePreviewRetryCount = 0;
  state.gamePreviewInfo = info;
  state.gamePreviewProjection = info?.projection || null;
  if (els.gamePreviewReadout) els.gamePreviewReadout.textContent = summarizeGamePreviewInfo(info);
  updatePreviewTrustUi();
  renderMain();
  markBuilderPreloadStep("rendererResult", "Renderer preview ready.");
}

function updateUi() {
  syncModeUi(panelModeForSelection());
  els.vertexCount.textContent = `${state.verts.length} vertices`;
  els.faceCount.textContent = `${state.faces.length} faces`;
  const auditEdges = renderAuditEdges();
  const auditEdgeCount = auditEdges.length;
  els.edgeCount.textContent = `${state.edges.length} lines${auditEdgeCount ? ` (${auditEdgeCount} audit)` : ""}`;
  const faceGroupText = state.selectedFaceIds.size
    ? ` | Face group ${[...state.selectedFaceIds].map((id) => `#${id}`).join(" ")}`
    : "";
  els.pickList.textContent = `${state.pick.length ? `Vertex group ${state.pick.map((id) => `#${id}`).join("  ")}` : "Vertex group empty"}${faceGroupText}`;

  if (!state.selected) els.selectionReadout.textContent = "Nothing selected";
  else if (state.selected.type === "vertex") {
    const v = vertexById(state.selected.id);
    const beaconText = v && hasBeaconAtVertex(v.id) ? "  beacon" : "";
    els.selectionReadout.textContent = v ? `Vertex #${v.id}  X ${round(v.x)}  Y ${round(v.y)}  Z ${round(v.z)}${v.mirrorId ? `  mirror #${v.mirrorId}` : "  centre"}${beaconText}` : "Missing vertex";
  } else if (state.selected.type === "vertexGroup") {
    els.selectionReadout.textContent = `Vertex Group ${state.pick.length} vertices  ${state.pick.map((id) => `#${id}`).join(" ")}`;
  } else if (["face", "uv", "group"].includes(state.selected.type)) {
    const face = selectedFace();
    const n = face ? faceNormal(face) : null;
    const autoSide = face ? autoTemplateSideForFace(face) : "";
    const bitmapSide = face ? (validBitmapFaceSide(face.bitmapSide) || `auto/${autoSide}`) : "";
    const faceSkin = face ? cleanBitmapKey(face.bitmapFaceKey) : "";
    const faceAngle = face ? normalizeBitmapAngle(face.bitmapAngle) : 0;
    const faceMirror = face?.bitmapMirrorX ? "  half-mirror" : "";
    const faceColor = optionalHexColor(face?.faceColor);
    const uvInfo = faceUvTypeInfo(face);
    const tileText = uvTileSummaryText(face ? [face] : []);
    const selectionLabel = state.selected.type === "group" ? "Group" : state.selected.type === "uv" ? "UV" : "Face";
    const groupText = state.selectedFaceIds.size > 1 ? `  group ${state.selectedFaceIds.size} faces` : "";
    els.selectionReadout.textContent = n
      ? `${selectionLabel} #${state.selected.id}${groupText}  normal X ${round(n.x, 2)}  Y ${round(n.y, 2)}  Z ${round(n.z, 2)}  uv ${uvInfo.short}  bitmap ${bitmapSide}${faceSkin ? `  face ${faceSkin}` : ""}${faceAngle ? `  angle ${faceAngle}` : ""}${faceMirror}${faceColor ? `  colour ${faceColor}` : ""}${tileText ? `  ${tileText}` : ""}`
      : `${selectionLabel} #${state.selected.id}`;
  } else if (state.selected.type === "edge") {
    const selectedEdges = selectedEdgeSetEdges();
    const edgeIds = selectedEdges.map((edge) => `#${edge.id}`).join(" ");
    els.selectionReadout.textContent = selectedEdges.length > 1
      ? `EDGE LOOP ${selectedEdges.length} lines  ${edgeIds}`
      : `EDGE #${state.selected.id}`;
  } else if (state.selected.type === "detail") {
    const selectedDetails = selectedDetailSetDetails();
    const detailIds = selectedDetails.map((detail) => `#${detail.id}`).join(" ");
    const detail = detailById(state.selected.id);
    els.selectionReadout.textContent = selectedDetails.length > 1
      ? `SURFACE DETAIL GROUP ${selectedDetails.length} lines  ${detailIds}`
      : detail ? `${detailTypeLabel(detail.type).toUpperCase()} #${detail.id}` : `DETAIL #${state.selected.id}`;
  } else {
    els.selectionReadout.textContent = `${state.selected.type.toUpperCase()} #${state.selected.id}`;
  }
  updateSliders();
  updateDetailControls();
  updateFaceBitmapSideControl();
  updateFaceUvAngleControls();
  renderSelectedObjectProperties();
}

function updateSliders() {
  const v = state.selected?.type === "vertex" ? vertexById(state.selected.id) : null;
  const fallback = v || { x: 0, y: 0, z: 0 };
  for (const axis of ["x", "y", "z"]) {
    els[`${axis}Slider`].value = Math.round(fallback[axis]);
    els[`${axis}Value`].value = Math.round(fallback[axis]);
    els[`${axis}Slider`].disabled = !v || (axis === "x" && v.center);
    els[`${axis}Value`].disabled = !v || (axis === "x" && v.center);
  }
}

function updateDetailControls() {
  const detail = state.selected?.type === "detail" ? detailById(state.selected.id) : null;
  const detailTargets = selectedDetailSetDetails();
  els.detailInset.disabled = !detail || !detail.faceId;
  els.detailColor.disabled = !detailTargets.length;
  if (detail) {
    els.detailInset.value = detail.inset ?? 0.45;
    els.detailColor.value = detail.color || (detail.type === "window" ? "#000000" : "#101915");
  }
}

function updateFaceBitmapSideControl() {
  if (!els.templateFaceSide) return;
  const face = selectedFace();
  els.templateFaceSide.disabled = !face;
  els.templateFaceSide.value = face ? (validBitmapFaceSide(face.bitmapSide) || "auto") : "auto";
}

function setSelectedFaceBitmapSide(value) {
  const face = selectedFace();
  if (!face) {
    setStatus("SELECT A FACE FIRST.");
    updateFaceBitmapSideControl();
    return;
  }
  const side = validBitmapFaceSide(value);
  if (side) face.bitmapSide = side;
  else delete face.bitmapSide;
  if (mirrorActionsEnabled()) syncMirroredFace(face);
  setStatus(side ? `FACE BITMAP SIDE SET TO ${side.toUpperCase()}.` : "FACE BITMAP SIDE SET TO AUTO.");
  renderAll();
}

function clearEditorSelection(options = {}) {
  cancelSurfaceInsertPreview({ redraw: false });
  cancelFaceSplitPickMode();
  state.selected = null;
  state.selectedFaceIds.clear();
  state.selectedEdgeIds.clear();
  state.selectedDetailIds.clear();
  state.pick = [];
  hideSelectionPickMenu();
  hideSelectionContextMenu();
  closeToolWindow({ redraw: false });
  if (options.redraw !== false) renderAll();
}

function clearSelectionForSelectorChange() {
  cancelSurfaceInsertPreview({ redraw: false });
  cancelFaceSplitPickMode();
  state.selected = null;
  state.selectedFaceIds.clear();
  state.selectedEdgeIds.clear();
  state.selectedDetailIds.clear();
  state.pick = [];
  state.drag = null;
  hideSelectionPickMenu();
  hideSelectionContextMenu();
  closeUvProperties({ redraw: false });
}

function selectionFilterAllows(type) {
  return !!state.selectionFilters?.[type];
}

function activeSelectionFilters() {
  return SELECTABLE_TYPES.filter(selectionFilterAllows);
}

function clearSelectionForDisabledFilter(type) {
  let cleared = false;
  if (state.faceSplitPick && (type === "vertex" || type === "face")) {
    cancelFaceSplitPickMode();
    state.pick = [];
    if (type === "face" && state.selected?.type === "face") state.selected = null;
    cleared = true;
  }
  if (type === "vertex" && (state.selected?.type === "vertex" || state.selected?.type === "vertexGroup" || state.pick.length)) {
    state.pick = [];
    if (state.selected?.type === "vertex" || state.selected?.type === "vertexGroup") state.selected = null;
    cleared = true;
  } else if (type === "face" && (state.selected?.type === "face" || state.selectedFaceIds.size)) {
    if (state.selected?.type === "face") state.selected = null;
    state.selectedFaceIds.clear();
    cleared = true;
  } else if (type === "edge" && (state.selected?.type === "edge" || state.selectedEdgeIds.size)) {
    if (state.selected?.type === "edge") state.selected = null;
    state.selectedEdgeIds.clear();
    cleared = true;
  } else if (type === "detail" && (state.selected?.type === "detail" || state.selectedDetailIds.size)) {
    state.selected = null;
    state.selectedDetailIds.clear();
    cleared = true;
  } else if (type === "uv" && state.selected?.type === "uv") {
    state.selected = null;
    state.selectedFaceIds.clear();
    closeUvProperties({ redraw: false });
    cleared = true;
  } else if (type === "group" && state.selected?.type === "group") {
    state.selected = null;
    state.selectedFaceIds.clear();
    closeUvProperties({ redraw: false });
    cleared = true;
  }
  if (!state.selected && cleared) closeToolWindow({ redraw: false });
  return cleared;
}

function orderedSelectionFilters() {
  const active = activeSelectionFilters();
  if (state.mode && active.includes(state.mode)) {
    return [state.mode, ...active.filter((type) => type !== state.mode)];
  }
  return active;
}

function panelModeForSelection() {
  if (state.selected?.type && SELECTABLE_TYPES.includes(state.selected.type)) return state.selected.type;
  const active = activeSelectionFilters();
  return active.length === 1 ? active[0] : state.mode;
}

function syncModeUi(mode = panelModeForSelection()) {
  els.toolsPanel.dataset.mode = mode;
  document.querySelectorAll(".mode-btn").forEach((b) => {
    const active = selectionFilterAllows(b.dataset.mode);
    b.classList.toggle("active", active);
    b.setAttribute("aria-pressed", active ? "true" : "false");
  });
}

function nearestVertex(point, projected, maxDist = 14) {
  let best = null;
  let bestDist = maxDist;
  for (const [id, p] of projected) {
    const d = Math.hypot(p.x - point.x, p.y - point.y);
    if (d < bestDist) {
      best = id;
      bestDist = d;
    }
  }
  return best;
}

function pointInPoly(point, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i], b = poly[j];
    if (((a.y > point.y) !== (b.y > point.y)) && point.x < (b.x - a.x) * (point.y - a.y) / ((b.y - a.y) || EPS) + a.x) inside = !inside;
  }
  return inside;
}

function distToSegment(p, a, b) {
  const dx = b.x - a.x, dy = b.y - a.y;
  const l2 = dx * dx + dy * dy || 1;
  const t = clamp(((p.x - a.x) * dx + (p.y - a.y) * dy) / l2, 0, 1);
  return Math.hypot(p.x - (a.x + dx * t), p.y - (a.y + dy * t));
}

function nearestDetail(point, maxLineDist = 10) {
  return detailHitCandidates(point, maxLineDist)[0]?.detail || null;
}

function detailHitCandidates(point, maxLineDist = 10) {
  const candidates = [];
  for (const d of state.details) {
    if (!detailVisibleInView(d)) continue;
    const pts = projectedDetailPointsForMain(d, els.mainView);
    const depth = averageProjectedDepth(pts);
    if (d.type === "beacon") {
      const p = pts[0];
      if (!p) continue;
      const dist = Math.hypot(p.x - point.x, p.y - point.y);
      if (dist <= maxLineDist) candidates.push({ type: "detail", id: d.id, detail: d, distance: dist, depth });
      continue;
    }
    if (pts.length < 2) continue;
    let bestDist = Infinity;
    if (d.type === "panel" || d.type === "line" || d.type === "polyline") {
      for (let i = 0; i < pts.length - 1; i++) {
        const dist = distToSegment(point, pts[i], pts[i + 1]);
        if (dist < bestDist) bestDist = dist;
      }
      if (bestDist <= maxLineDist) candidates.push({ type: "detail", id: d.id, detail: d, distance: bestDist, depth });
    } else if (pointInPoly(point, pts)) {
      candidates.push({ type: "detail", id: d.id, detail: d, distance: 0, depth });
    }
  }
  candidates.sort((a, b) => a.distance - b.distance || a.depth - b.depth || a.id - b.id);
  return candidates;
}

function hitFaceAtPoint(point, projected, options = {}) {
  const faces = [...state.faces].sort((a, b) => faceSortDepthForMain(a) - faceSortDepthForMain(b));
  return faces.find((face) => {
    if (options.uvOnly && !faceHasUvSelectionTarget(face)) return false;
    if (options.groupOnly && sharedFaceTextureGroup(face).length < 2) return false;
    return pointInPoly(point, face.verts.map((id) => projected.get(id)).filter(Boolean));
  }) || null;
}

function projectedFacePoints(face, projected) {
  return face.verts.map((id) => projected.get(id)).filter(Boolean);
}

function faceHitCandidates(point, projected, targetType = "face") {
  const candidates = [];
  const seen = new Set();
  for (const face of state.faces) {
    if (targetType === "uv" && !faceHasUvSelectionTarget(face)) continue;
    const group = sharedFaceTextureGroup(face);
    if (targetType === "group" && group.length < 2) continue;
    const pts = projectedFacePoints(face, projected);
    if (pts.length < 3 || !pointInPoly(point, pts)) continue;
    const key = targetType === "group" && cleanBitmapKey(face.bitmapFaceKey)
      ? `${targetType}:${cleanBitmapKey(face.bitmapFaceKey)}`
      : targetType === "uv" && group.length > 1 && cleanBitmapKey(face.bitmapFaceKey)
        ? `uv-group:${cleanBitmapKey(face.bitmapFaceKey)}`
        : `${targetType}:${face.id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    candidates.push({
      type: targetType,
      id: face.id,
      face,
      groupCount: group.length,
      groupKey: cleanBitmapKey(face.bitmapFaceKey),
      distance: 0,
      depth: faceSortDepthForMain(face)
    });
  }
  candidates.sort((a, b) => a.depth - b.depth || a.id - b.id);
  return candidates;
}

function vertexHitCandidates(point, projected, maxDist = 14) {
  const candidates = [];
  for (const [id, p] of projected) {
    const dist = Math.hypot(p.x - point.x, p.y - point.y);
    if (dist > maxDist) continue;
    candidates.push({
      type: "vertex",
      id,
      vertex: vertexById(id),
      distance: dist,
      depth: projectedPointDepth(p)
    });
  }
  candidates.sort((a, b) => a.distance - b.distance || a.depth - b.depth || a.id - b.id);
  return candidates;
}

function pickCandidateKey(candidate) {
  if (candidate.type === "vertexGroup") return "vertex-group:current";
  if (candidate.type === "edge" && candidate.edgeGroup && candidate.edgeIds?.length > 1) {
    return `${candidate.audit ? "audit-" : ""}edge-group:${[...candidate.edgeIds].sort((a, b) => a - b).join(",")}`;
  }
  if (candidate.type === "edge" && candidate.audit) return `audit-edge:${candidate.id}`;
  if ((candidate.type === "group" || candidate.type === "uv") && candidate.groupKey && candidate.groupCount > 1) {
    return `${candidate.type}-group:${candidate.groupKey}`;
  }
  return `${candidate.type}:${candidate.id}`;
}

function edgeGroupPickCandidate(candidate) {
  const edgeIds = Array.isArray(candidate.edgeGroupIds) ? candidate.edgeGroupIds : [];
  if (edgeIds.length < 2) return null;
  return {
    ...candidate,
    edgeGroup: true,
    edgeIds
  };
}

function vertexGroupPickCandidate() {
  if (!state.pick.length) return null;
  return {
    type: "vertexGroup",
    id: "current",
    vertexIds: [...state.pick],
    distance: Infinity,
    depth: Infinity,
    order: SELECTABLE_TYPES.length + 1
  };
}

function appendVertexGroupCandidate(candidates) {
  const candidate = vertexGroupPickCandidate();
  if (!candidate) return candidates;
  if (candidates.some((item) => pickCandidateKey(item) === pickCandidateKey(candidate))) return candidates;
  return [...candidates, { ...candidate, key: pickCandidateKey(candidate) }];
}

function selectionCandidatePriority(type) {
  if (type === "vertex") return 0;
  if (type === "detail") return 1;
  if (type === "edge") return 2;
  if (type === "face") return 3;
  if (type === "uv") return 4;
  if (type === "group") return 5;
  return SELECTABLE_TYPES.length + 1;
}

function collectSelectionCandidates(point) {
  const projected = projectedMapForMain(els.mainView);
  const candidates = [];
  const seen = new Set();
  const add = (candidate) => {
    const key = pickCandidateKey(candidate);
    if (seen.has(key)) return;
    seen.add(key);
    candidates.push({ ...candidate, key, order: selectionCandidatePriority(candidate.type) });
  };
  for (const type of SELECTABLE_TYPES) {
    if (!selectionFilterAllows(type)) continue;
    if (type === "vertex") vertexHitCandidates(point, projected).forEach(add);
    else if (type === "edge") {
      const addEdgeHit = (candidate) => {
        add(candidate);
        const groupCandidate = edgeGroupPickCandidate(candidate);
        if (groupCandidate) add(groupCandidate);
      };
      if (els.showAuditEdges?.checked) edgeHitCandidates(point, projected, renderAuditEdges(), SELECTION_EDGE_PICK_RADIUS, { audit: true }).forEach(addEdgeHit);
      edgeHitCandidates(point, projected, state.edges, SELECTION_EDGE_PICK_RADIUS).forEach(addEdgeHit);
    } else if (type === "detail") detailHitCandidates(point).forEach(add);
    else if (type === "face") faceHitCandidates(point, projected, "face").forEach(add);
    else if (type === "uv") faceHitCandidates(point, projected, "uv").forEach(add);
    else if (type === "group") faceHitCandidates(point, projected, "group").forEach(add);
  }
  candidates.sort((a, b) => a.order - b.order || a.distance - b.distance || a.depth - b.depth || a.id - b.id);
  return candidates;
}

function syncControlsWindowForSelection(options = {}) {
  if (state.selected) openToolWindow("edit", { focus: false, redraw: false });
  else closeToolWindow({ redraw: false });
  if (options.render !== false) renderSelectedObjectProperties();
}

function selectDetailTarget(detail, options = {}) {
  if (!detail) return false;
  cancelSurfaceInsertPreview({ redraw: false });
  cancelFaceSplitPickMode();
  state.mode = "detail";
  state.pick = [];
  state.selectedFaceIds.clear();
  state.selectedEdgeIds.clear();
  if (options.multiSelect && detailIsSurfaceLine(detail)) {
    const existingDetail = state.selected?.type === "detail" ? detailById(state.selected.id) : null;
    if (detailIsSurfaceLine(existingDetail)) state.selectedDetailIds.add(existingDetail.id);
    if (state.selectedDetailIds.has(detail.id)) {
      state.selectedDetailIds.delete(detail.id);
      const fallbackId = [...state.selectedDetailIds].at(-1);
      state.selected = fallbackId == null ? null : { type: "detail", id: fallbackId };
      setStatus(`SURFACE DETAIL #${detail.id} REMOVED FROM DETAIL GROUP (${state.selectedDetailIds.size} SELECTED).`);
    } else {
      state.selectedDetailIds.add(detail.id);
      state.selected = { type: "detail", id: detail.id };
      setStatus(`SURFACE DETAIL #${detail.id} ADDED TO DETAIL GROUP (${state.selectedDetailIds.size} SELECTED).`);
    }
  } else {
    state.selected = { type: "detail", id: detail.id };
    state.selectedDetailIds = new Set([detail.id]);
    setStatus(`${detailTypeLabel(detail.type).toUpperCase()} #${detail.id} SELECTED.`);
  }
  setToolTab("edit", { redraw: false });
  syncControlsWindowForSelection({ render: false });
  if (options.render !== false) renderAll();
  return true;
}

function selectFaceTarget(face, options = {}) {
  if (!face) return false;
  cancelSurfaceInsertPreview({ redraw: false });
  if (!options.keepFaceSplitPick) cancelFaceSplitPickMode();
  state.mode = "face";
  state.pick = [];
  state.selectedEdgeIds.clear();
  state.selectedDetailIds.clear();
  if (options.multiSelect) {
    if (state.selectedFaceIds.has(face.id)) {
      state.selectedFaceIds.delete(face.id);
      const fallbackId = [...state.selectedFaceIds].at(-1);
      state.selected = fallbackId == null ? null : { type: "face", id: fallbackId };
      setStatus(`FACE #${face.id} REMOVED FROM FACE GROUP (${state.selectedFaceIds.size} SELECTED).`);
    } else {
      state.selectedFaceIds.add(face.id);
      state.selected = { type: "face", id: face.id };
      setStatus(`FACE #${face.id} ADDED TO FACE GROUP (${state.selectedFaceIds.size} SELECTED).`);
    }
  } else {
    state.selected = { type: "face", id: face.id };
    state.selectedFaceIds.clear();
    setStatus(`FACE #${face.id} SELECTED. SHIFT-CLICK TO BUILD A FACE GROUP.`);
  }
  setToolTab("edit", { redraw: false });
  syncControlsWindowForSelection({ render: false });
  if (options.render !== false) renderAll();
  return true;
}

function selectUvTarget(face) {
  if (!face || !faceHasUvSelectionTarget(face)) return false;
  cancelSurfaceInsertPreview({ redraw: false });
  cancelFaceSplitPickMode();
  const group = sharedFaceTextureGroup(face);
  state.mode = group.length > 1 ? "group" : "uv";
  state.pick = [];
  state.selectedEdgeIds.clear();
  state.selectedDetailIds.clear();
  if (group.length > 1) {
    state.selected = { type: "group", id: face.id };
    state.selectedFaceIds = new Set(group.map((item) => item.id));
    setStatus(`UV GROUP ${cleanBitmapKey(face.bitmapFaceKey)} SELECTED (${group.length} FACES).`);
  } else {
    state.selected = { type: "uv", id: face.id };
    state.selectedFaceIds.clear();
    const info = faceUvTypeInfo(face);
    setStatus(`UV TARGET SELECTED: FACE #${face.id} ${info.label.toUpperCase()}.`);
  }
  setToolTab("edit", { redraw: false });
  syncControlsWindowForSelection({ render: false });
  renderAll();
  return true;
}

function selectGroupTarget(face) {
  const group = sharedFaceTextureGroup(face);
  if (group.length < 2) return false;
  cancelSurfaceInsertPreview({ redraw: false });
  cancelFaceSplitPickMode();
  state.mode = "group";
  state.selected = { type: "group", id: face.id };
  state.pick = [];
  state.selectedEdgeIds.clear();
  state.selectedDetailIds.clear();
  state.selectedFaceIds = new Set(group.map((item) => item.id));
  setToolTab("edit", { redraw: false });
  syncControlsWindowForSelection({ render: false });
  setStatus(`FACE TEXTURE GROUP ${cleanBitmapKey(face.bitmapFaceKey)} SELECTED (${group.length} FACES).`);
  renderAll();
  return true;
}

function selectionPickCandidateLabel(candidate) {
  if (candidate.type === "vertex") return `Vertex #${candidate.id}`;
  if (candidate.type === "vertexGroup") return `Vertex Group (${(candidate.vertexIds || state.pick).length})`;
  if (candidate.type === "face") return `Face #${candidate.id}`;
  if (candidate.type === "edge") {
    const edge = candidate.edge || (candidate.audit ? renderAuditEdges() : state.edges).find((item) => item.id === candidate.id);
    const loopText = candidate.edgeIds?.length > 1 ? ` Loop (${candidate.edgeIds.length})` : "";
    return candidate.audit
      ? `Audit Edge${loopText} ${auditEdgeLabel(edge || candidate)}`
      : `${edgeKindLabel(edge?.kind)}${loopText} #${candidate.id}`;
  }
  if (candidate.type === "detail") {
    const detail = candidate.detail || detailById(candidate.id);
    return `${detail?.type === "panel" ? "Surface Detail" : detail?.type || "Detail"} #${candidate.id}`;
  }
  if (candidate.type === "uv") {
    return candidate.groupCount > 1 && candidate.groupKey
      ? `UV Group ${candidate.groupKey}`
      : `UV Face #${candidate.id}`;
  }
  if (candidate.type === "group") return `Face Group ${candidate.groupKey || `#${candidate.id}`}`;
  return `${candidate.type} #${candidate.id}`;
}

function selectionPickCandidateMeta(candidate) {
  if (candidate.type === "vertexGroup") return "VERTEX GROUP | TRANSIENT";
  const depth = Number.isFinite(candidate.depth) ? `Z ${round(candidate.depth, 1)}` : "";
  const distance = Number.isFinite(candidate.distance) && candidate.distance > 0 ? `D ${round(candidate.distance, 1)}` : "";
  const count = candidate.groupCount > 1
    ? `${candidate.groupCount} faces`
    : candidate.type === "edge" && candidate.edgeIds?.length > 1
      ? `${candidate.edgeIds.length} lines`
      : "";
  return [candidate.type.toUpperCase(), count, depth, distance].filter(Boolean).join(" | ");
}

function selectSelectionCandidate(candidate, options = {}) {
  if (!candidate) return false;
  if (!options.keepPickMenu) hideSelectionPickMenu();
  if (candidate.type === "vertexGroup") {
    state.mode = "vertex";
    state.selected = state.pick.length ? { type: "vertexGroup", id: "current" } : null;
    state.selectedFaceIds.clear();
    state.selectedEdgeIds.clear();
    state.selectedDetailIds.clear();
    setToolTab("edit", { redraw: false });
    setStatus(`VERTEX GROUP SELECTED (${state.pick.length} VERTICES).`);
    syncControlsWindowForSelection({ render: false });
    renderAll();
    return true;
  }
  if (candidate.type === "vertex") {
    selectVertex(candidate.id, { multiSelect: options.multiSelect });
    return true;
  }
  if (candidate.type === "edge") {
    const edge = candidate.edge || (candidate.audit ? renderAuditEdges() : state.edges).find((item) => item.id === candidate.id);
    if (!edge) return false;
    selectEdge(edge, { audit: candidate.audit, edgeIds: candidate.edgeIds });
    return true;
  }
  if (candidate.type === "detail") return selectDetailTarget(candidate.detail || detailById(candidate.id), { multiSelect: options.multiSelect });
  if (candidate.type === "face") return selectFaceTarget(candidate.face || faceById(candidate.id), { multiSelect: options.multiSelect });
  if (candidate.type === "uv") return selectUvTarget(candidate.face || faceById(candidate.id));
  if (candidate.type === "group") return selectGroupTarget(candidate.face || faceById(candidate.id));
  return false;
}

function runSelectionAfterPick(selected, options = {}) {
  if (selected && options.afterPick === "properties") {
    showSelectedObjectProperties();
  }
  return selected;
}

function directMultiSelectCandidate(candidates, options = {}) {
  if (!options.multiSelect || !selectionFilterAllows("face")) return null;
  if (state.mode !== "face" && state.selected?.type !== "face") return null;
  return candidates.find((candidate) => candidate.type === "face") || null;
}

function hasEditorSelection() {
  return !!state.selected || !!state.pick.length || !!state.selectedFaceIds.size || !!state.selectedEdgeIds.size || !!state.selectedDetailIds.size;
}

function selectInMain(point, options = {}) {
  let candidates = collectSelectionCandidates(point);
  if (options.forcePickMenu) candidates = appendVertexGroupCandidate(candidates);
  if (!candidates.length) {
    const hadSelection = hasEditorSelection();
    if (options.clearOnEmpty !== false) clearEditorSelection();
    if (hadSelection && options.announceEmptyClear !== false) setStatus("SELECTION CLEARED.");
    return false;
  }
  if (state.faceSplitPick && !options.forcePickMenu) {
    const splitCandidate = faceSplitVertexCandidate(candidates);
    if (splitCandidate) return selectFaceSplitVertex(splitCandidate.id);
    const face = activeFaceSplitFace();
    if (face) setStatus(`FACE #${face.id} SPLIT: CLICK A VERTEX ON THE SELECTED FACE, OR CLICK EMPTY SPACE TO CANCEL.`);
    return false;
  }
  const directCandidate = options.forcePickMenu ? null : directMultiSelectCandidate(candidates, options);
  if (directCandidate) return runSelectionAfterPick(selectSelectionCandidate(directCandidate, options), options);
  if (options.forcePickMenu && options.allowPickMenu !== false && (candidates.length > 1 || options.pickMenuForSingle)) {
    openSelectionPickMenuAt(options.clientX, options.clientY, candidates, {
      afterPick: options.afterPick,
      cascade: options.cascade,
      multiSelect: options.multiSelect
    });
    const pickCount = candidates.length === 1 ? "1 SELECTABLE OBJECT" : `${candidates.length} SELECTABLE OBJECTS`;
    setStatus(options.afterPick === "properties"
      ? `${pickCount} UNDER POINTER. CHOOSE ONE FOR PROPERTIES.`
      : options.afterPick === "context"
        ? `${pickCount} UNDER POINTER. CHOOSE ONE FOR ACTIONS.`
        : `${pickCount} UNDER POINTER.`);
    return "menu";
  }
  return runSelectionAfterPick(selectSelectionCandidate(candidates[0], options), options);
}

function orientFaceAtMainPoint(point) {
  const candidate = collectSelectionCandidates(point).find((item) => item.type === "face");
  const face = candidate?.face || faceById(candidate?.id);
  if (!face) return false;
  hideSelectionPickMenu();
  hideSelectionContextMenu();
  selectFaceTarget(face, { render: false });
  return orientFaceToView(face, true, `FACE #${face.id} ORIENTED TO VIEW.`);
}

function selectVertex(id, options = {}) {
  const v = vertexById(id);
  if (!v) return;
  if (state.faceSplitPick && !options.ignoreFaceSplitPick) return selectFaceSplitVertex(id);
  cancelSurfaceInsertPreview({ redraw: false });
  cancelFaceSplitPickMode();
  state.mode = "vertex";
  state.selectedFaceIds.clear();
  state.selectedEdgeIds.clear();
  state.selectedDetailIds.clear();
  setToolTab("edit", { redraw: false });
  const existing = state.pick.indexOf(id);
  if (!options.multiSelect) {
    state.pick = [id];
    state.selected = { type: "vertex", id };
    setStatus(`VERTEX #${id} SELECTED. SHIFT-CLICK TO BUILD A VERTEX GROUP.`);
  } else if (existing >= 0) {
    state.pick.splice(existing, 1);
    const fallbackId = state.pick.at(-1);
    state.selected = fallbackId == null ? null : { type: "vertex", id: fallbackId };
    setStatus(`VERTEX #${id} REMOVED FROM VERTEX GROUP.`);
  } else {
    state.pick.push(id);
    state.selected = { type: "vertex", id };
    setStatus(`VERTEX #${id} ADDED TO VERTEX GROUP.`);
  }
  syncControlsWindowForSelection({ render: false });
  renderAll();
}

function getCanvasPoint(ev, canvas) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (ev.clientX - rect.left) * canvas.width / rect.width,
    y: (ev.clientY - rect.top) * canvas.height / rect.height
  };
}

function projectedModelBoundsAtZoomOne(canvas = els.mainView) {
  if (!canvas || !state.verts.length) return null;
  const baseScale = Math.min(canvas.width, canvas.height) / 360;
  const bounds = { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity };
  for (const vertex of state.verts) {
    const r = rotateViewPoint(vertex);
    const perspective = state.view.orthographic ? 1 : 600 / Math.max(80, 600 + r.z);
    const x = r.x * baseScale * perspective;
    const y = -r.y * baseScale * perspective;
    bounds.minX = Math.min(bounds.minX, x);
    bounds.maxX = Math.max(bounds.maxX, x);
    bounds.minY = Math.min(bounds.minY, y);
    bounds.maxY = Math.max(bounds.maxY, y);
  }
  if (!Number.isFinite(bounds.minX) || !Number.isFinite(bounds.minY)) return null;
  return bounds;
}

function fitView(options = {}) {
  const canvas = els.mainView;
  const bounds = projectedModelBoundsAtZoomOne(canvas);
  if (!canvas || !bounds) {
    const size = modelOverallSize();
    state.view.zoom = clamp(300 / size, VIEW_ZOOM_MIN, VIEW_ZOOM_MAX);
    state.view.panX = 0;
    state.view.panY = 0;
    anchorGamePreviewTargetScale();
    return;
  }
  const defaultMargin = state.view.orthographic ? VIEW_FIT_MARGIN : VIEW_FIT_PERSPECTIVE_MARGIN;
  const margin = Number.isFinite(Number(options.margin)) ? Number(options.margin) : defaultMargin;
  const width = Math.max(1, bounds.maxX - bounds.minX);
  const height = Math.max(1, bounds.maxY - bounds.minY);
  const targetZoom = Math.min(canvas.width * margin / width, canvas.height * margin / height);
  state.view.zoom = clamp(targetZoom, VIEW_ZOOM_MIN, VIEW_ZOOM_MAX);
  state.view.panX = -(bounds.minX + bounds.maxX) * 0.5 * state.view.zoom;
  state.view.panY = -(bounds.minY + bounds.maxY) * 0.5 * state.view.zoom;
  anchorGamePreviewTargetScale();
}

function setStandardView(options = {}) {
  state.activeViewCubeCornerKey = "";
  state.view.rx = STANDARD_VIEW.rx;
  state.view.ry = STANDARD_VIEW.ry;
  if (options.resetProjection !== false) state.view.orthographic = false;
  updateProjectionViewButtons();
}

function activeProjectionViewName() {
  for (const [name, view] of Object.entries(PROJECTION_VIEW_PRESETS)) {
    if (Math.abs(normalizeRadians(state.view.rx - view.rx)) < .001
      && Math.abs(normalizeRadians(state.view.ry - view.ry)) < .001) {
      return name;
    }
  }
  return "";
}

function viewCubeCornerKey(face, corner) {
  return `${face}:${corner}`;
}

function viewCubeCornerPreset(face, corner) {
  return VIEW_CUBE_CORNER_PRESETS[face]?.[corner] || null;
}

function sameViewCubeCornerVector(a, b) {
  return !!a && !!b && a.x === b.x && a.y === b.y && a.z === b.z;
}

function activeProjectionCornerKey() {
  for (const [face, corners] of Object.entries(VIEW_CUBE_CORNER_PRESETS)) {
    for (const [corner, preset] of Object.entries(corners)) {
      const view = viewAnglesForCubeCornerVector(preset.vector);
      if (!view) continue;
      if (Math.abs(normalizeRadians(state.view.rx - view.rx)) < .001
        && Math.abs(normalizeRadians(state.view.ry - view.ry)) < .001) {
        return viewCubeCornerKey(face, corner);
      }
    }
  }
  return "";
}

function clearViewCubeCornerHover() {
  els.viewCubeBody?.querySelectorAll(".corner-hover, .corner-adjacent, .corner-target-hover, .face-hover").forEach((node) => {
    node.classList.remove("corner-hover", "corner-adjacent", "corner-target-hover", "face-hover");
  });
}

function setViewCubeCornerHover(cornerEl) {
  const faceEl = cornerEl?.closest?.("[data-view-preset]");
  const face = faceEl?.dataset?.viewPreset;
  const corner = cornerEl?.dataset?.viewCorner;
  const preset = viewCubeCornerPreset(face, corner);
  if (!faceEl || !preset) return;
  clearViewCubeCornerHover();
  faceEl.classList.add("corner-target-hover");
  cornerEl.classList.add("corner-hover");
  preset.adjacent.forEach((name) => {
    const adjacentFace = els.viewCubeBody?.querySelector(`[data-view-preset="${name}"]`);
    adjacentFace?.classList.add("corner-target-hover");
    const match = Object.entries(VIEW_CUBE_CORNER_PRESETS[name] || {})
      .find(([, item]) => sameViewCubeCornerVector(item.vector, preset.vector));
    if (!match) return;
    adjacentFace?.querySelector(`[data-view-corner="${match[0]}"]`)?.classList.add("corner-adjacent");
  });
}

function rectContainsPoint(rect, x, y, padding = 0) {
  return x >= rect.left - padding && x <= rect.right + padding
    && y >= rect.top - padding && y <= rect.bottom + padding;
}

function smallestRectElementAtPoint(nodes, clientX, clientY, padding = 0) {
  return nodes
    .map((node) => ({ node, rect: node.getBoundingClientRect() }))
    .filter(({ rect }) => rectContainsPoint(rect, clientX, clientY, padding))
    .sort((a, b) => (a.rect.width * a.rect.height) - (b.rect.width * b.rect.height))[0]?.node || null;
}

function viewCubeFaceMetrics(faceEl) {
  const fallback = { depth: 0, normalZ: 1 };
  if (!faceEl || typeof DOMMatrix === "undefined") return fallback;
  try {
    const bodyTransform = getComputedStyle(els.viewCubeBody).transform;
    const faceTransform = getComputedStyle(faceEl).transform;
    const bodyMatrix = bodyTransform && bodyTransform !== "none" ? new DOMMatrix(bodyTransform) : new DOMMatrix();
    const faceMatrix = faceTransform && faceTransform !== "none" ? new DOMMatrix(faceTransform) : new DOMMatrix();
    const matrix = bodyMatrix.multiply(faceMatrix);
    let normalZ = matrix.m33 || 0;
    if (typeof DOMPoint !== "undefined") {
      normalZ = new DOMPoint(0, 0, 1, 0).matrixTransform(matrix).z;
    }
    return {
      depth: matrix.m43 || 0,
      normalZ
    };
  } catch (_) {
    return fallback;
  }
}

function frontmostFaceElementAtPoint(nodes, clientX, clientY, padding = 0) {
  const candidates = nodes
    .map((node) => ({ node, rect: node.getBoundingClientRect(), metrics: viewCubeFaceMetrics(node) }))
    .filter(({ rect }) => rectContainsPoint(rect, clientX, clientY, padding));
  const visible = candidates.filter(({ metrics }) => metrics.normalZ > EPS);
  return (visible.length ? visible : candidates)
    .sort((a, b) => (b.metrics.depth - a.metrics.depth) || (b.metrics.normalZ - a.metrics.normalZ) || ((a.rect.width * a.rect.height) - (b.rect.width * b.rect.height)))[0]?.node || null;
}

function cornerElementOnFaceAtPoint(faceEl, clientX, clientY, padding = 1) {
  if (!faceEl) return null;
  return smallestRectElementAtPoint([...faceEl.querySelectorAll("[data-view-corner]")], clientX, clientY, padding);
}

function viewCubePointerTargetAt(clientX, clientY) {
  if (!Number.isFinite(clientX) || !Number.isFinite(clientY) || !els.viewCubeBody) return null;
  const faces = [...els.viewCubeBody.querySelectorAll("[data-view-preset]")];
  const face = frontmostFaceElementAtPoint(faces, clientX, clientY, 2);
  if (!face) return null;
  return cornerElementOnFaceAtPoint(face, clientX, clientY) || face;
}

function setViewCubeFaceHover(faceEl) {
  clearViewCubeCornerHover();
  faceEl?.classList.add("face-hover");
}

function syncViewCubeHover(event) {
  const nativeTarget = event.target?.closest?.("[data-view-corner], [data-view-preset]") || null;
  const target = nativeTarget || viewCubePointerTargetAt(event.clientX, event.clientY);
  const corner = target?.closest?.("[data-view-corner]");
  if (corner) {
    setViewCubeCornerHover(corner);
    return;
  }
  const face = target?.closest?.("[data-view-preset]");
  if (face) {
    setViewCubeFaceHover(face);
    return;
  }
  clearViewCubeCornerHover();
}

function updateProjectionViewButtons() {
  const active = activeProjectionViewName();
  const activeCorner = active ? "" : (state.activeViewCubeCornerKey || activeProjectionCornerKey());
  document.querySelectorAll("[data-view-preset]").forEach((button) => {
    button.classList.toggle("active", button.dataset.viewPreset === active);
  });
  els.viewCubeBody?.querySelectorAll("[data-view-corner]").forEach((corner) => {
    const face = corner.closest("[data-view-preset]")?.dataset?.viewPreset || "";
    corner.classList.toggle("active", viewCubeCornerKey(face, corner.dataset.viewCorner) === activeCorner);
  });
  if (els.viewProjectionToggle) {
    els.viewProjectionToggle.setAttribute("aria-pressed", state.view.orthographic ? "true" : "false");
    els.viewProjectionToggle.setAttribute("aria-label", state.view.orthographic ? "Orthographic view" : "Perspective view");
    els.viewProjectionToggle.title = state.view.orthographic ? "Switch to perspective view" : "Switch to orthographic view";
  }
  if (els.viewCubeBody) {
    els.viewCubeBody.style.setProperty("--cube-rx", `${state.view.rx}rad`);
    els.viewCubeBody.style.setProperty("--cube-ry", `${normalizeRadians(state.view.ry + Math.PI)}rad`);
  }
}

function cancelViewTween() {
  if (!state.viewTweenFrame) return;
  cancelAnimationFrame(state.viewTweenFrame);
  state.viewTweenFrame = 0;
}

function setProjectionView(name, options = {}) {
  const preset = PROJECTION_VIEW_PRESETS[name];
  if (!preset) return false;
  cancelViewTween();
  state.activeViewCubeCornerKey = "";
  state.view.rx = preset.rx;
  state.view.ry = preset.ry;
  if (options.fit !== false) fitView();
  updateProjectionViewButtons();
  if (options.status !== false) setStatus(`${preset.label} ${state.view.orthographic ? "ORTHOGRAPHIC" : "PERSPECTIVE"} VIEW.`);
  if (options.redraw !== false) renderAll();
  return true;
}

function setProjectionCornerView(face, corner, options = {}) {
  const preset = viewCubeCornerPreset(face, corner);
  const view = preset ? viewAnglesForCubeCornerVector(preset.vector) : null;
  if (!preset || !view) return false;
  cancelViewTween();
  state.activeViewCubeCornerKey = viewCubeCornerKey(face, corner);
  state.view.rx = view.rx;
  state.view.ry = view.ry;
  if (options.fit !== false) fitView();
  updateProjectionViewButtons();
  if (options.status !== false) setStatus(`${preset.label} ${state.view.orthographic ? "ORTHOGRAPHIC" : "PERSPECTIVE"} VIEW.`);
  if (options.redraw !== false) renderAll();
  return true;
}

function setViewProjectionMode(orthographic, options = {}) {
  state.view.orthographic = !!orthographic;
  if (options.fit !== false) fitView();
  updateProjectionViewButtons();
  if (options.status !== false) setStatus(state.view.orthographic ? "ORTHOGRAPHIC VIEW." : "PERSPECTIVE VIEW.");
  if (options.redraw !== false) renderAll();
}

function rotateViewHorizontal(direction) {
  state.activeViewCubeCornerKey = "";
  animateViewRotation(state.view.ry + direction * VIEW_CUBE_BUTTON_STEP, direction < 0 ? "VIEW ROTATED LEFT." : "VIEW ROTATED RIGHT.");
}

function rotateViewVertical(direction) {
  state.activeViewCubeCornerKey = "";
  animateViewPitch(state.view.rx + direction * VIEW_CUBE_BUTTON_STEP, direction < 0 ? "VIEW ROTATED UP." : "VIEW ROTATED DOWN.");
}

function animateViewRotation(targetRy, statusText = "VIEW ROTATED.") {
  cancelViewTween();
  const startRy = state.view.ry;
  const delta = normalizeRadians(targetRy - startRy);
  const start = performance.now();
  const duration = 260;
  const ease = (t) => 1 - Math.pow(1 - t, 3);
  const step = (now) => {
    const t = clamp((now - start) / duration, 0, 1);
    state.view.ry = startRy + delta * ease(t);
    updateProjectionViewButtons();
    if (gameRendererPreviewMode()) renderPreviewMotion();
    else renderAll();
    if (t < 1) {
      state.viewTweenFrame = requestAnimationFrame(step);
      return;
    }
    state.viewTweenFrame = 0;
    state.view.ry = startRy + delta;
    updateProjectionViewButtons();
    setStatus(statusText);
    renderAll();
  };
  state.viewTweenFrame = requestAnimationFrame(step);
}

function animateViewPitch(targetRx, statusText = "VIEW ROTATED.") {
  cancelViewTween();
  const startRx = state.view.rx;
  const delta = targetRx - startRx;
  const start = performance.now();
  const duration = 260;
  const ease = (t) => 1 - Math.pow(1 - t, 3);
  const step = (now) => {
    const t = clamp((now - start) / duration, 0, 1);
    state.view.rx = startRx + delta * ease(t);
    updateProjectionViewButtons();
    if (gameRendererPreviewMode()) renderPreviewMotion();
    else renderAll();
    if (t < 1) {
      state.viewTweenFrame = requestAnimationFrame(step);
      return;
    }
    state.viewTweenFrame = 0;
    state.view.rx = targetRx;
    updateProjectionViewButtons();
    setStatus(statusText);
    renderAll();
  };
  state.viewTweenFrame = requestAnimationFrame(step);
}

function rotateViewFromCubeDrag(dx, dy) {
  cancelViewTween();
  state.activeViewCubeCornerKey = "";
  state.view.ry += dx * 0.006;
  state.view.rx = normalizeRadians(state.view.rx - dy * 0.006);
  updateProjectionViewButtons();
  if (gameRendererPreviewMode()) renderPreviewMotion();
  else renderAll();
}

function deleteSelected() {
  if (!state.selected) return;
  const { type, id } = state.selected;
  if (type === "uv" || type === "group") {
    state.selected = null;
    state.selectedFaceIds.clear();
    setStatus(`${type === "group" ? "GROUP" : "UV"} SELECTION CLEARED.`);
    renderAll();
    return;
  }
  if (type === "vertex") {
    const v = vertexById(id);
    const ids = new Set([id, mirrorActionsEnabled() ? v?.mirrorId : null].filter(Boolean));
    state.verts = state.verts.filter((item) => !ids.has(item.id));
    state.faces = state.faces.filter((f) => !f.verts.some((vid) => ids.has(vid)));
    state.edges = state.edges.filter((e) => !ids.has(e.a) && !ids.has(e.b));
    state.details = state.details.filter((d) => {
      if (d.vertexId) return !ids.has(Number(d.vertexId));
      return faceById(d.faceId);
    });
    state.pick = state.pick.filter((vid) => !ids.has(vid));
  } else if (type === "face") {
    const face = faceById(id);
    const mirror = face && mirrorActionsEnabled() ? mirroredFaceOf(face) : null;
    const ids = new Set([id, mirror?.id].filter(Boolean));
    state.faces = state.faces.filter((f) => !ids.has(f.id));
    state.details = state.details.filter((d) => !ids.has(d.faceId));
    for (const faceId of ids) state.selectedFaceIds.delete(faceId);
  } else if (type === "edge") {
    const edge = state.edges.find((e) => e.id === id);
    const mirror = edge && mirrorActionsEnabled() ? mirroredEdgeOf(edge) : null;
    const ids = new Set([
      ...(state.selectedEdgeIds?.size ? state.selectedEdgeIds : [id]),
      mirror?.id
    ].filter(Boolean));
    if (mirror && state.selectedEdgeIds?.size) {
      for (const item of edgeComponentFrom(mirror, renderAuditEdges())) ids.add(item.id);
    }
    state.edges = state.edges.filter((e) => !ids.has(e.id));
  } else if (type === "detail") {
    const details = selectedDetailSetDetails();
    const ids = new Set((details.length ? details : [detailById(id)].filter(Boolean)).map((detail) => detail.id));
    if (mirrorActionsEnabled()) {
      for (const detail of details) {
        const mirror = mirroredDetailOf(detail);
        if (mirror) ids.add(mirror.id);
      }
    }
    state.details = state.details.filter((d) => !ids.has(d.id));
  }
  state.selected = null;
  state.selectedEdgeIds.clear();
  state.selectedDetailIds.clear();
  setStatus("SELECTION DELETED.");
  renderAll();
}

function appendPickedToSelectedFace() {
  const face = state.selected?.type === "face" ? faceById(state.selected.id) : null;
  if (!face) return setStatus("SELECT A FACE FIRST.");
  const additions = state.pick.filter((id) => vertexById(id) && !face.verts.includes(id));
  if (!additions.length) return setStatus("PICK A NEW VERTEX FIRST.");
  face.verts.push(...additions);
  if (mirrorActionsEnabled()) syncMirroredFace(face);
  state.pick = [];
  setStatus("PICKED VERTEX ADDED TO FACE.");
  renderAll();
}

function removePickedFromSelectedFace() {
  const face = state.selected?.type === "face" ? faceById(state.selected.id) : null;
  if (!face) return setStatus("SELECT A FACE FIRST.");
  const removals = new Set(state.pick);
  if (!removals.size) return setStatus("PICK A FACE VERTEX FIRST.");
  const next = face.verts.filter((id) => !removals.has(id));
  if (next.length < 3) return setStatus("FACE NEEDS AT LEAST THREE VERTICES.");
  face.verts = next;
  if (mirrorActionsEnabled()) syncMirroredFace(face);
  state.pick = [];
  setStatus("PICKED VERTEX REMOVED FROM FACE.");
  renderAll();
}

function flipSelectedFace() {
  const face = state.selected?.type === "face" ? faceById(state.selected.id) : null;
  if (!face) return setStatus("SELECT A FACE FIRST.");
  face.verts.reverse();
  if (mirrorActionsEnabled()) syncMirroredFace(face);
  setStatus("FACE WINDING FLIPPED.");
  renderAll();
}

function alignFaceVerticesToViewDepth(face = selectedFace()) {
  if (!face) return setStatus("SELECT A FACE FIRST.");
  const ids = [...new Set(face.verts)].filter((id) => vertexById(id));
  if (ids.length < 3) return setStatus("FACE NEEDS AT LEAST THREE VERTICES.");
  const center = modelCenter();
  const beforeIssue = stateFacePlanarityIssue(face);
  const alignIds = (vertexIds) => {
    const vertices = vertexIds.map(vertexById).filter(Boolean);
    if (vertices.length < 3) return 0;
    const viewPoints = vertices.map((vertex) => rotatePoint(sub(vertex, center)));
    const targetZ = viewPoints.reduce((sum, point) => sum + point.z, 0) / viewPoints.length;
    let maxMove = 0;
    vertices.forEach((vertex, index) => {
      const viewPoint = { ...viewPoints[index], z: targetZ };
      const next = modelPointFromViewPoint(viewPoint, center);
      const previous = vec(vertex.x, vertex.y, vertex.z);
      vertex.x = vertex.center ? 0 : Math.abs(next.x) < EPS ? 0 : round(next.x);
      vertex.y = round(next.y);
      vertex.z = round(next.z);
      maxMove = Math.max(maxMove, len(sub(vec(vertex.x, vertex.y, vertex.z), previous)));
    });
    return maxMove;
  };
  let maxMove = alignIds(ids);
  const mirror = mirrorActionsEnabled() ? mirroredFaceOf(face) : null;
  if (mirror) maxMove = Math.max(maxMove, alignIds([...new Set(mirror.verts)]));
  syncModeUi("face");
  syncControlsWindowForSelection({ render: false });
  const afterIssue = stateFacePlanarityIssue(face);
  const beforeText = beforeIssue ? ` FROM ${beforeIssue.maxDistance.toFixed(2)}` : "";
  const afterText = afterIssue ? ` TO ${afterIssue.maxDistance.toFixed(2)}` : " TO PLANAR";
  setStatus(`FACE #${face.id} VERTICES ALIGNED TO VIEW DEPTH${beforeText}${afterText}. MAX MOVE ${round(maxMove, 2)}.`);
  renderAll();
  return true;
}

function faceCopyWithVerts(face, verts, mirrored = !!face?.mirrored) {
  const copy = { ...face, id: newId(), verts: [...verts], mirrored };
  for (const key of ["bitmapUv", "bitmapUvTemplate"]) {
    if (Array.isArray(copy[key]) && copy[key].length !== copy.verts.length) delete copy[key];
  }
  if (copy.bitmapUvTransform && (!copy.bitmapUvTemplate || copy.bitmapUvTemplate.length !== copy.verts.length)) delete copy.bitmapUvTransform;
  if (copy.bitmapBaseW && !copy.bitmapUv) delete copy.bitmapBaseW;
  if (copy.bitmapBaseH && !copy.bitmapUv) delete copy.bitmapBaseH;
  return copy;
}

function splitFaceVertexLoops(face, a, b) {
  const ids = face?.verts || [];
  const ia = ids.indexOf(a);
  const ib = ids.indexOf(b);
  if (ia < 0 || ib < 0 || ia === ib) return null;
  const loop = (start, end) => {
    const out = [ids[start]];
    for (let i = (start + 1) % ids.length; i !== end; i = (i + 1) % ids.length) out.push(ids[i]);
    out.push(ids[end]);
    return out;
  };
  const first = loop(ia, ib);
  const second = loop(ib, ia);
  return first.length >= 3 && second.length >= 3 ? [first, second] : null;
}

function cancelFaceSplitPickMode() {
  if (!state.faceSplitPick) return false;
  state.faceSplitPick = null;
  return true;
}

function activeFaceSplitFace() {
  const face = state.faceSplitPick ? faceById(state.faceSplitPick.faceId) : null;
  if (!face) cancelFaceSplitPickMode();
  return face;
}

function startFaceSplitPickMode(face, seedVertexIds = []) {
  if (!face) return false;
  cancelSurfaceInsertPreview({ redraw: false });
  const picked = [...new Set(seedVertexIds.filter((id) => face.verts.includes(id)))].slice(0, 2);
  state.faceSplitPick = { faceId: face.id, vertexIds: picked };
  state.mode = "face";
  state.selected = { type: "face", id: face.id };
  state.selectedFaceIds.clear();
  state.selectedEdgeIds.clear();
  state.selectedDetailIds.clear();
  state.pick = [...picked];
  setToolTab("edit", { redraw: false });
  syncControlsWindowForSelection({ render: false });
  setStatus(`FACE #${face.id} SPLIT: PICK ${2 - picked.length} MORE NON-ADJACENT VERTEX${picked.length === 1 ? "" : "ES"}.`);
  renderAll();
  return true;
}

function selectFaceSplitVertex(id) {
  const face = activeFaceSplitFace();
  if (!face) return false;
  if (!face.verts.includes(id)) {
    setStatus(`FACE #${face.id} SPLIT: PICK VERTICES ON THE SELECTED FACE.`);
    return false;
  }
  const picked = [...new Set(state.faceSplitPick.vertexIds.filter((vertexId) => face.verts.includes(vertexId)))];
  const existing = picked.indexOf(id);
  if (existing >= 0) {
    picked.splice(existing, 1);
    state.faceSplitPick.vertexIds = picked;
    state.pick = [...picked];
    setStatus(`FACE #${face.id} SPLIT: VERTEX #${id} REMOVED; PICK ${2 - picked.length} MORE.`);
    renderAll();
    return true;
  }
  if (picked.length === 1 && faceEdgeIndex(face, picked[0], id) >= 0) {
    setStatus(`FACE #${face.id} SPLIT: PICK A NON-ADJACENT VERTEX.`);
    return true;
  }
  picked.push(id);
  state.faceSplitPick.vertexIds = picked;
  state.pick = [...picked];
  if (picked.length < 2) {
    setStatus(`FACE #${face.id} SPLIT: PICK 1 MORE NON-ADJACENT VERTEX.`);
    renderAll();
    return true;
  }
  return splitSelectedFaceAlongPickedVertices({ face, vertexIds: picked });
}

function faceSplitVertexCandidate(candidates) {
  const face = activeFaceSplitFace();
  if (!face) return null;
  return candidates.find((candidate) => candidate.type === "vertex" && face.verts.includes(candidate.id)) || null;
}

function splitSelectedFaceAlongPickedVertices(options = {}) {
  cancelSurfaceInsertPreview({ redraw: false });
  const face = options.face
    || (options.faceId != null ? faceById(options.faceId) : null)
    || activeFaceSplitFace()
    || (state.selected?.type === "face" ? faceById(state.selected.id) : null);
  if (!face) return setStatus("SELECT A FACE FIRST.");
  const sourcePicked = options.vertexIds
    || (state.faceSplitPick?.faceId === face.id ? state.faceSplitPick.vertexIds : null)
    || state.pick;
  const picked = sourcePicked.filter((id) => face.verts.includes(id));
  const unique = [...new Set(picked)];
  if (unique.length !== 2) {
    startFaceSplitPickMode(face, unique);
    return false;
  }
  const [a, b] = unique;
  if (faceEdgeIndex(face, a, b) >= 0) return setStatus("PICK NON-ADJACENT FACE VERTICES FOR A SPLIT.");
  const loops = splitFaceVertexLoops(face, a, b);
  if (!loops) return setStatus("FACE SPLIT FAILED.");
  const mirror = mirrorActionsEnabled() ? mirroredFaceOf(face) : null;
  const splitFaces = loops.map((verts) => faceCopyWithVerts(face, verts));
  state.faces = state.faces.filter((item) => item.id !== face.id);
  state.faces.push(...splitFaces);
  state.details = state.details.filter((detail) => detail.faceId !== face.id);
  const hiddenEdge = addEdge(a, b, EDGE_KIND_HIDDEN, !!face.mirrored);
  state.selected = hiddenEdge ? { type: "edge", id: hiddenEdge.id } : { type: "face", id: splitFaces[0].id };
  state.selectedFaceIds = new Set(splitFaces.map((item) => item.id));
  state.selectedEdgeIds = hiddenEdge ? new Set([hiddenEdge.id]) : new Set();
  state.selectedDetailIds.clear();
  state.pick = [];
  state.faceSplitPick = null;

  if (mirrorActionsEnabled()) {
    if (mirror) {
      const ma = inferredMirrorVertexId(a);
      const mb = inferredMirrorVertexId(b);
      const mirrorLoops = ma != null && mb != null ? splitFaceVertexLoops(mirror, ma, mb) : null;
      if (mirrorLoops) {
        const mirrorFaces = mirrorLoops.map((verts) => faceCopyWithVerts(mirror, verts, true));
        state.faces = state.faces.filter((item) => item.id !== mirror.id);
        state.faces.push(...mirrorFaces);
        state.details = state.details.filter((detail) => detail.faceId !== mirror.id);
        const mirrorHidden = addEdge(ma, mb, EDGE_KIND_HIDDEN, true);
        mirrorFaces.forEach((item) => state.selectedFaceIds.add(item.id));
        if (mirrorHidden) state.selectedEdgeIds.add(mirrorHidden.id);
      }
    }
  }

  syncModeUi("face");
  syncControlsWindowForSelection({ render: false });
  setStatus(`FACE #${face.id} SPLIT ALONG #${a}-#${b}; DIAGONAL MARKED HIDDEN.`);
  renderAll();
}

function detailRenderIntent(detail) {
  const type = detail?.type === "panel" ? "line" : detail?.type;
  const line = type === "line" || type === "polyline";
  const beacon = type === "beacon";
  const engine = type === "engine";
  const windowDetail = type === "window";
  const stationEntrance = type === DETAIL_TYPE_STATION_ENTRANCE;
  return {
    kind: stationEntrance ? DETAIL_TYPE_STATION_ENTRANCE : beacon ? "beacon" : line ? "line" : "poly",
    solid: !line && !stationEntrance,
    wire: !beacon,
    glow: engine,
    glass: windowDetail,
    solidStroke: engine
  };
}

function withDetailRender(detail) {
  return {
    ...detail,
    detailRender: detailRenderIntent(detail)
  };
}

function detailViewCategory(detail) {
  const type = detail?.type;
  if (type === "window") return "window";
  if (type === "engine") return "engine";
  if (type === "beacon") return "beacon";
  if (type === DETAIL_TYPE_STATION_ENTRANCE) return "surface";
  return "surface";
}

function detailVisibleInView(detail) {
  const category = detailViewCategory(detail);
  if (category === "window") return els.showWindowDetails?.checked !== false;
  if (category === "engine") return els.showEngineDetails?.checked !== false;
  if (category === "beacon") return els.showBeaconDetails?.checked !== false;
  return els.showSurfaceDetails?.checked !== false;
}

function detailVertexIds(detail) {
  const ids = [];
  if (Number.isFinite(Number(detail?.vertexId))) ids.push(Number(detail.vertexId));
  if (Array.isArray(detail?.indices)) ids.push(...detail.indices.map(Number));
  if (Array.isArray(detail?.segment)) ids.push(...detail.segment.map(Number));
  return [...new Set(ids.filter((id) => Number.isFinite(id) && vertexById(id)))];
}

function detailOwnerFaces(detail) {
  const explicitFace = faceById(detail?.faceId);
  if (explicitFace) return [explicitFace];
  const ids = detailVertexIds(detail);
  if (!ids.length) return [];
  return state.faces.filter((face) => ids.every((id) => face.verts.includes(id)));
}

function normalFromDetailPoints(detail) {
  const points = detailModelPoints(detail);
  if (points.length < 3) return null;
  for (let i = 1; i < points.length - 1; i++) {
    const candidate = cross(sub(points[i], points[0]), sub(points[i + 1], points[0]));
    if (len(candidate) > EPS) return norm(candidate);
  }
  return null;
}

function detailNormal(detail) {
  if (Array.isArray(detail?.normal) && detail.normal.length >= 3) {
    const normal = vec(Number(detail.normal[0]) || 0, Number(detail.normal[1]) || 0, Number(detail.normal[2]) || 0);
    if (len(normal) > EPS) return norm(normal);
  }
  return normalFromDetailPoints(detail);
}

function detailFacesBuilderCamera(detail) {
  const normal = detailNormal(detail);
  if (!normal) return true;
  return rotatePoint(normal).z < -0.015;
}

function detailSurfaceVisibleInMain(detail, options = {}) {
  if (!options.hiddenFaces) return true;
  const faces = detailOwnerFaces(detail);
  if (!faces.length) return detailFacesBuilderCamera(detail);
  const faceVisible = (face) => {
    if (!face) return false;
    if (options.gameOverlay) {
      const previewFace = previewFaceForBuilderFace(face);
      return previewFace ? !!previewFace.visible : faceFacesBuilderCamera(face);
    }
    return faceFacesBuilderCamera(face);
  };
  return faces.some(faceVisible);
}

function filteredDetailsForView() {
  return state.details.filter((detail) => detailVisibleInView(detail));
}

const FACE_RENDER_FACE_TEXTURE = 1;
const FACE_RENDER_EXPLICIT_UV = 2;
const FACE_RENDER_DECAL = 4;
const FACE_RENDER_FALLBACK_COLOR = 8;
const FACE_RENDER_MIRROR_X = 16;
const FACE_RENDER_ANGLE = 32;
const FACE_RENDER_SIDE = 64;

function derivedBlueprint(options = {}) {
  const sourceDetails = Array.isArray(options.details) ? options.details : state.details;
  const indexById = new Map(state.verts.map((v, i) => [v.id, i]));
  const verts = state.verts.map((v) => [round(v.x), round(v.y), round(v.z)]);
  const renderableFaces = state.faces
    .map((face) => ({
      source: face,
      ids: face.verts.map((id) => indexById.get(id)).filter((i) => i !== undefined)
    }))
    .filter((face) => face.ids.length >= 3);
  const faces = renderableFaces.map((face) => face.ids);
  const normals = faces.map((ids) => {
    const a = vec(...verts[ids[0]]), b = vec(...verts[ids[1]]), c = vec(...verts[ids[2]]);
    const n = norm(cross(sub(b, a), sub(c, a)));
    return [round(n.x * 100), round(n.y * 100), round(n.z * 100)];
  });
  const edgeMap = new Map();
  const addDerivedEdge = (a, b, faceIndex = -1, kind = "edge") => {
    if (a === b) return;
    const key = a < b ? `${a},${b}` : `${b},${a}`;
    if (!edgeMap.has(key)) edgeMap.set(key, { edge: a < b ? [a, b] : [b, a], faces: [], kind });
    const entry = edgeMap.get(key);
    if (faceIndex >= 0) entry.faces.push(faceIndex);
    if (kind === EDGE_KIND_HIDDEN) entry.kind = EDGE_KIND_HIDDEN;
    else if (kind === "stick" && entry.kind !== EDGE_KIND_HIDDEN) entry.kind = "stick";
  };
  faces.forEach((ids, faceIndex) => {
    for (let i = 0; i < ids.length; i++) addDerivedEdge(ids[i], ids[(i + 1) % ids.length], faceIndex);
  });
  state.edges.forEach((e) => {
    if (e.kind === EDGE_KIND_STATION_ENTRANCE) return;
    const a = indexById.get(e.a), b = indexById.get(e.b);
    if (a !== undefined && b !== undefined) addDerivedEdge(a, b, -1, e.kind);
  });
  const edgeEntries = [...edgeMap.values()];
  const edges = edgeEntries.map((e) => e.edge);
  const edgeKinds = edgeEntries.map((e) => e.kind === EDGE_KIND_HIDDEN ? EDGE_KIND_HIDDEN : e.kind === "stick" ? "stick" : "edge");
  const edgeFaces = edgeEntries.map((e) => {
    const unique = [...new Set(e.faces)];
    if (!unique.length) return [-1, -1];
    if (unique.length === 1) return [unique[0], unique[0]];
    return [unique[0], unique[1]];
  });
  const edgeVisibility = edges.map(() => 31);
  const details = sourceDetails.map((d) => {
    if (d.type === "beacon") {
      const index = indexById.get(Number(d.vertexId));
      if (index === undefined) return null;
      return withDetailRender({
        type: "beacon",
        index,
        color: d.color || "#ffb642"
      });
    }
    const face = faceById(d.faceId);
    if (!face && (Array.isArray(d.points) || Array.isArray(d.indices))) {
      const detail = {
        type: d.type === "panel" ? "line" : d.type,
        color: d.color,
        ...(d.type === "window" && d.baseTransparent === true ? { baseTransparent: true } : {}),
        ...(d.type === "window" && optionalHexColor(d.glintDark) ? { glintDark: optionalHexColor(d.glintDark) } : {}),
        ...(d.type === "window" && optionalHexColor(d.glintBright) ? { glintBright: optionalHexColor(d.glintBright) } : {}),
        ...(d.stroke ? { stroke: d.stroke } : {}),
        ...(d.width ? { width: d.width } : {}),
        ...(d.lift ? { lift: d.lift } : {}),
        ...(d.cull === false ? { cull: false } : {}),
        ...(d.cullEpsilon !== undefined ? { cullEpsilon: d.cullEpsilon } : {}),
        normal: Array.isArray(d.normal) ? d.normal.map((n) => round(Number(n), 3)) : [0, 0, 1]
      };
      if (Array.isArray(d.indices)) {
        const mapped = d.indices
          .map((id) => indexById.get(Number(id)))
          .filter((i) => i !== undefined);
        if (mapped.length >= (d.type === DETAIL_TYPE_STATION_ENTRANCE ? 4 : 2)) {
          return withDetailRender({ ...detail, indices: mapped, ...(d.type === DETAIL_TYPE_STATION_ENTRANCE ? { lift: 0 } : {}) });
        }
      }
      const points = detailModelPoints(d).map(toArray);
      if (points.length >= 2) return withDetailRender({ ...detail, points });
      return null;
    }
    if (!face) return null;
    const normal = faceNormal(face);
    const points = detailModelPoints(d).map(toArray);
    const base = {
      type: d.type === "panel" ? "line" : d.type,
      color: d.color,
      ...(d.type === "window" && d.baseTransparent === true ? { baseTransparent: true } : {}),
      ...(d.type === "window" && optionalHexColor(d.glintDark) ? { glintDark: optionalHexColor(d.glintDark) } : {}),
      ...(d.type === "window" && optionalHexColor(d.glintBright) ? { glintBright: optionalHexColor(d.glintBright) } : {}),
      normal: toArray(normal),
      lift: d.type === DETAIL_TYPE_STATION_ENTRANCE ? 0 : 0.5
    };
    if (d.type === DETAIL_TYPE_STATION_ENTRANCE && Array.isArray(d.indices)) {
      const mapped = d.indices
        .map((id) => indexById.get(Number(id)))
        .filter((i) => i !== undefined);
      if (mapped.length >= 4) return withDetailRender({ ...base, indices: mapped });
    }
    if (d.type === "panel") {
      return withDetailRender({ ...base, type: "polyline", points, width: 1.2 });
    }
    return withDetailRender({ ...base, points, stroke: d.type === "engine" ? "#ffffff" : undefined });
  }).filter(Boolean);
  const projectionFaces = renderableFaces.map((face) => face.source);
  const faceSides = projectionFaces.map((f) => validBitmapFaceSide(f.bitmapSide) || null);
  const faceTextures = projectionFaces.map((f) => cleanBitmapKey(f.bitmapFaceKey) || null);
  const faceTextureUv = projectionFaces.map((f) => cleanFaceBitmapUv(f));
  const faceTextureBaseW = projectionFaces.map((f) => Number.isFinite(Number(f.bitmapBaseW)) && Number(f.bitmapBaseW) > 0 ? Math.round(Number(f.bitmapBaseW)) : null);
  const faceTextureBaseH = projectionFaces.map((f) => Number.isFinite(Number(f.bitmapBaseH)) && Number(f.bitmapBaseH) > 0 ? Math.round(Number(f.bitmapBaseH)) : null);
  const faceTextureWrap = projectionFaces.map((f) => {
    const wrap = cleanBitmapWrap(f.bitmapWrap);
    return wrap === "clip" ? null : wrap;
  });
  const faceColors = projectionFaces.map((f) => optionalHexColor(f.faceColor) || null);
  const faceAngles = projectionFaces.map((f) => normalizeBitmapAngle(f.bitmapAngle) || null);
  const faceMirrorX = projectionFaces.map((f) => !!f.bitmapMirrorX);
  const faceDecals = projectionFaces.map((f) => {
    const decals = cleanFaceDecals(f.bitmapDecals);
    return decals.length ? decals : null;
  });
  const faceRenderFlags = projectionFaces.map((f, index) => {
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
  const primaryAxis = templatePrimaryAxis();
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
  const hasImageProjection = !!imageProjection.primaryAxis || !!imageProjection.faceSides || !!imageProjection.faceTextures || !!imageProjection.faceTextureUv || !!imageProjection.faceTextureWrap || !!imageProjection.faceColors || !!imageProjection.faceAngles || !!imageProjection.faceMirrorX || !!imageProjection.faceDecals || !!imageProjection.faceRenderFlags;
  return {
    verts,
    faces,
    edges,
    edgeKinds,
    edgeFaces,
    edgeVisibility,
    normals,
    details,
    ...(hasImageProjection ? { imageProjection } : {}),
    gameMeta: gameMetadata()
  };
}

function numberFromInput(input, fallback = 0) {
  const n = Number(input.value);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeHexColor(value, fallback = "#e9f2e4") {
  const text = String(value || "").trim();
  return /^#[0-9a-f]{6}$/i.test(text) ? text : fallback;
}

function optionalHexColor(value) {
  const text = String(value || "").trim();
  return /^#[0-9a-f]{6}$/i.test(text) ? text.toLowerCase() : null;
}

function averageImageColor(img) {
  if (!img?.naturalWidth || !img?.naturalHeight) return null;
  const canvas = document.createElement("canvas");
  const sample = 64;
  const scale = Math.min(1, sample / Math.max(img.naturalWidth, img.naturalHeight));
  canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  try {
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let r = 0, g = 0, b = 0, aTotal = 0;
    for (let i = 0; i < data.length; i += 4) {
      const a = data[i + 3];
      if (a <= 8) continue;
      r += data[i] * a;
      g += data[i + 1] * a;
      b += data[i + 2] * a;
      aTotal += a;
    }
    if (!aTotal) return null;
    const toHex = (n) => Math.round(n / aTotal).toString(16).padStart(2, "0");
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  } catch {
    return null;
  }
}

function exportedImageDecalMirrorX() {
  const flags = {
    top: !!state.skinImages?.mirrorX?.top,
    bottom: !!state.skinImages?.mirrorX?.bottom,
    back: !!state.skinImages?.mirrorX?.back
  };
  return Object.values(flags).some(Boolean) ? flags : null;
}

function gameMetadata() {
  const radius = Math.round(modelRadius());
  const imageDecalMirrorX = exportedImageDecalMirrorX();
  const imageDecalAngle = sideSkinAngleDeg();
  return {
    class: els.shipClass.value,
    npcRole: els.npcRole.value,
    aiProfile: els.aiProfile.value,
    decalRole: els.decalRole.value,
    baseColor: normalizeHexColor(els.baseColor.value),
    description: els.shipDescription.value.trim(),
    missionLore: els.shipMissionLore.value.trim(),
    ...(imageDecalMirrorX ? { imageDecalMirrorX } : {}),
    ...(imageDecalAngle ? { imageDecalAngle: { top: imageDecalAngle, bottom: imageDecalAngle, back: imageDecalAngle } } : {}),
    valueCr: Math.max(0, Math.round(numberFromInput(els.shipValue, 0))),
    stats: {
      r: radius,
      hp: Math.max(1, Math.round(numberFromInput(els.shipHp, 80))),
      speed: round(clamp(numberFromInput(els.speedMul, 1), 0, 3), 2),
      cargo: Math.max(0, Math.round(numberFromInput(els.cargoTons, 0))),
      missiles: Math.max(0, Math.round(numberFromInput(els.missileCount, 0))),
      laser: els.laserClass.value
    },
    lists: {
      trader: els.flagTrader.checked,
      pirate: els.flagPirate.checked,
      police: els.flagPolice.checked,
      alien: els.flagAlien.checked
    },
    flags: {
      escapePod: els.flagEscapePod.checked,
      hiddenUntilDiscovered: els.flagHidden.checked
    }
  };
}

function builderExport() {
  return {
    format: "ultra-elite-ship-builder/v1",
    id: els.shipId.value.trim() || "custom_ship",
    name: els.shipName.value.trim() || "Custom Ship",
    symmetry: "x-locked",
    gameMeta: gameMetadata(),
    verts: state.verts.map((v) => ({ id: v.id, x: round(v.x), y: round(v.y), z: round(v.z), mirrorId: v.mirrorId, center: !!v.center })),
    faces: state.faces.map((f) => ({
      id: f.id,
      verts: f.verts,
      mirrored: !!f.mirrored,
      ...(optionalHexColor(f.faceColor) ? { faceColor: optionalHexColor(f.faceColor) } : {}),
      ...(validBitmapFaceSide(f.bitmapSide) ? { bitmapSide: f.bitmapSide } : {}),
      ...(cleanBitmapKey(f.bitmapFaceKey) ? { bitmapFaceKey: cleanBitmapKey(f.bitmapFaceKey) } : {}),
      ...(cleanFaceBitmapUv(f) ? { bitmapUv: cleanFaceBitmapUv(f) } : {}),
      ...(cleanFaceBitmapUvTemplate(f) ? { bitmapUvTemplate: cleanFaceBitmapUvTemplate(f) } : {}),
      ...(!bitmapUvTransformIsDefault(f.bitmapUvTransform) ? { bitmapUvTransform: cleanBitmapUvTransform(f.bitmapUvTransform) } : {}),
      ...(Number.isFinite(Number(f.bitmapBaseW)) && Number(f.bitmapBaseW) > 0 && Number.isFinite(Number(f.bitmapBaseH)) && Number(f.bitmapBaseH) > 0 ? { bitmapBaseW: Math.round(Number(f.bitmapBaseW)), bitmapBaseH: Math.round(Number(f.bitmapBaseH)) } : {}),
      ...(normalizeBitmapAngle(f.bitmapAngle) ? { bitmapAngle: normalizeBitmapAngle(f.bitmapAngle) } : {}),
      ...(f.bitmapMirrorX ? { bitmapMirrorX: true } : {}),
      ...(cleanBitmapWrap(f.bitmapWrap) !== "clip" ? { bitmapWrap: cleanBitmapWrap(f.bitmapWrap) } : {}),
      ...(cleanFaceDecals(f.bitmapDecals).length ? { bitmapDecals: cleanFaceDecals(f.bitmapDecals) } : {})
    })),
    edges: state.edges.map((e) => ({ id: e.id, a: e.a, b: e.b, kind: e.kind, mirrored: !!e.mirrored })),
    details: state.details.map((d) => ({ ...d })),
    blueprint: derivedBlueprint()
  };
}

function currentModelSnapshot() {
  try {
    return JSON.stringify(builderExport());
  } catch {
    return "";
  }
}

function updateEditHistoryControls() {
  const history = state.editHistory;
  if (els.undoEditBtn) {
    els.undoEditBtn.disabled = !history.undo.length;
    els.undoEditBtn.title = history.undo.length ? "Undo edit" : "Nothing to undo";
    els.undoEditBtn.setAttribute("aria-disabled", history.undo.length ? "false" : "true");
  }
  if (els.redoEditBtn) {
    els.redoEditBtn.disabled = !history.redo.length;
    els.redoEditBtn.title = history.redo.length ? "Redo edit" : "Nothing to redo";
    els.redoEditBtn.setAttribute("aria-disabled", history.redo.length ? "false" : "true");
  }
}

function trimEditHistoryStack(stack) {
  while (stack.length > EDIT_HISTORY_MAX) stack.shift();
}

function beginContinuousEditHistory() {
  const history = state.editHistory;
  if (history.restoring || history.continuousBaseSnapshot) return;
  history.continuousBaseSnapshot = history.lastSnapshot || currentModelSnapshot();
  history.continuousRecorded = false;
}

function endContinuousEditHistory() {
  const history = state.editHistory;
  history.continuousBaseSnapshot = "";
  history.continuousRecorded = false;
}

function recordEditHistorySnapshot(snapshot) {
  if (!snapshot) return;
  const history = state.editHistory;
  if (history.restoring) return;
  if (!history.initialized) {
    history.lastSnapshot = snapshot;
    history.initialized = true;
    updateEditHistoryControls();
    return;
  }
  if (snapshot === history.lastSnapshot) return;

  if (history.continuousBaseSnapshot) {
    if (!history.continuousRecorded && history.continuousBaseSnapshot !== snapshot) {
      history.undo.push(history.continuousBaseSnapshot);
      trimEditHistoryStack(history.undo);
      history.continuousRecorded = true;
    }
  } else if (history.lastSnapshot) {
    history.undo.push(history.lastSnapshot);
    trimEditHistoryStack(history.undo);
  }
  history.redo = [];
  history.lastSnapshot = snapshot;
  updateEditHistoryControls();
}

function selectExistingOption(select, value, fallback = "") {
  if (!select) return;
  const text = String(value || "");
  select.value = [...select.options].some((option) => option.value === text) ? text : fallback;
}

function applyBuilderDataToEditor(data, options = {}) {
  if (!data || !Array.isArray(data.verts) || !Array.isArray(data.faces)) throw new Error("Not builder JSON");
  if (options.resetPreview !== false) resetGamePreviewSyncState();
  cancelSurfaceInsertPreview({ redraw: false });
  state.nextId = 1;
  state.verts = data.verts.map((v, index) => {
    const vertex = sourceVertex(v, index);
    state.nextId = Math.max(state.nextId, vertex.id + 1);
    return vertex;
  });
  state.faces = (data.faces || []).map((f, index) => {
    const face = sourceFace(f, index);
    state.nextId = Math.max(state.nextId, face.id + 1);
    return face;
  });
  state.edges = (data.edges || []).map((e, index) => {
    const edge = sourceEdge(e, index);
    state.nextId = Math.max(state.nextId, edge.id + 1);
    return edge;
  });
  state.details = (data.details || []).map((d) => {
    const idNum = Number(d.id);
    if (Number.isFinite(idNum)) state.nextId = Math.max(state.nextId, idNum + 1);
    const faceId = Number(d.faceId);
    return {
      ...d,
      id: Number.isFinite(idNum) ? idNum : newId(),
      faceId: Number.isFinite(faceId) ? faceId : undefined,
      vertexId: Number.isFinite(Number(d.vertexId)) ? Number(d.vertexId) : undefined,
      indices: Array.isArray(d.indices) ? d.indices.map(Number) : undefined,
      segment: Array.isArray(d.segment) ? d.segment.map(Number) : undefined
    };
  });
  migrateStationEntranceEdgesToDetails();
  inferMirrorVertexIds();

  const meta = data.gameMeta || {};
  state.sourceModelId = options.sourceModelId ?? cleanBitmapKey(data.id || "");
  els.shipId.value = data.id || "custom_ship";
  els.shipName.value = data.name || "Custom Ship";
  els.shipDescription.value = meta.description || data.description || "";
  els.shipMissionLore.value = meta.missionLore || meta.mission || "";
  selectExistingOption(els.shipClass, meta.class, "ship");
  selectExistingOption(els.npcRole, meta.npcRole, "standard");
  selectExistingOption(els.aiProfile, meta.aiProfile, "standard");
  selectExistingOption(els.decalRole, meta.decalRole, "default");
  els.baseColor.value = normalizeHexColor(meta.baseColor);
  syncSkinAngle(skinAngleMetaValue(meta), false);
  els.shipValue.value = Number.isFinite(Number(meta.valueCr)) ? Math.round(Number(meta.valueCr)) : 0;
  const stats = meta.stats || {};
  els.shipHp.value = Number.isFinite(Number(stats.hp)) ? Math.round(Number(stats.hp)) : 80;
  els.speedMul.value = Number.isFinite(Number(stats.speed)) ? round(Number(stats.speed), 2) : 1;
  els.cargoTons.value = Number.isFinite(Number(stats.cargo)) ? Math.round(Number(stats.cargo)) : 0;
  els.missileCount.value = Number.isFinite(Number(stats.missiles)) ? Math.round(Number(stats.missiles)) : 0;
  selectExistingOption(els.laserClass, stats.laser, "pulse");
  const lists = meta.lists || {};
  els.flagTrader.checked = !!lists.trader;
  els.flagPirate.checked = !!lists.pirate;
  els.flagPolice.checked = !!lists.police;
  els.flagAlien.checked = !!lists.alien;
  const flags = meta.flags || {};
  els.flagEscapePod.checked = !!flags.escapePod;
  els.flagHidden.checked = !!flags.hiddenUntilDiscovered;

  state.selected = null;
  state.pick = [];
  state.selectedFaceIds.clear();
  state.selectedEdgeIds.clear();
  state.selectedDetailIds.clear();
  hideSelectionPickMenu({ redraw: false });
  hideSelectionContextMenu();
  closeUvProperties({ redraw: false });
  if (options.loadSkins !== false) loadSkinBitmaps(data.id || els.shipId.value, mirrorFlagsFromMeta(meta));
  if (options.fit) fitView();
}

function restoreEditHistorySnapshot(snapshot, statusText) {
  const history = state.editHistory;
  try {
    const data = JSON.parse(snapshot);
    history.restoring = true;
    applyBuilderDataToEditor(data, { loadSkins: true, resetPreview: true });
    renderAll();
    scheduleGamePreviewSync(0, true);
    history.lastSnapshot = currentModelSnapshot();
    setStatus(statusText);
  } catch (error) {
    setStatus(`UNDO RESTORE FAILED: ${error.message}`);
  } finally {
    history.restoring = false;
    updateEditHistoryControls();
  }
}

function undoEditHistory() {
  const history = state.editHistory;
  if (!history.undo.length) {
    setStatus("NOTHING TO UNDO.");
    return;
  }
  endContinuousEditHistory();
  const current = currentModelSnapshot();
  const previous = history.undo.pop();
  if (current && current !== previous) {
    history.redo.push(current);
    trimEditHistoryStack(history.redo);
  }
  restoreEditHistorySnapshot(previous, "UNDO.");
}

function redoEditHistory() {
  const history = state.editHistory;
  if (!history.redo.length) {
    setStatus("NOTHING TO REDO.");
    return;
  }
  endContinuousEditHistory();
  const current = currentModelSnapshot();
  const next = history.redo.pop();
  if (current && current !== next) {
    history.undo.push(current);
    trimEditHistoryStack(history.undo);
  }
  restoreEditHistorySnapshot(next, "REDO.");
}

function markCurrentModelSavedSnapshot(modelId = "") {
  const cleanId = cleanBitmapKey(modelId || els.shipId?.value || "");
  state.savedModelSnapshot = currentModelSnapshot();
  state.savedModelSnapshotId = cleanId;
}

function clearCurrentModelSavedSnapshot() {
  state.savedModelSnapshot = "";
  state.savedModelSnapshotId = "";
}

function currentModelUnsavedBenchmarkWarning() {
  const currentId = cleanBitmapKey(els.shipId?.value || "");
  if (!state.savedModelSnapshot) {
    return "Current builder model has not been saved or loaded from the generated library in this session.";
  }
  if (state.savedModelSnapshotId && currentId && state.savedModelSnapshotId !== currentId) {
    return `Current builder id is ${currentId}, but the saved snapshot is ${state.savedModelSnapshotId}.`;
  }
  if (currentModelSnapshot() !== state.savedModelSnapshot) {
    return "Current builder model has unsaved edits.";
  }
  return "";
}

function currentBuilderHasDiscardableModelData() {
  return !!(
    state.verts.length ||
    state.faces.length ||
    state.edges.length ||
    state.details.length
  );
}

function confirmDiscardCurrentModel(actionLabel = "Replace the current builder model") {
  if (!currentBuilderHasDiscardableModelData()) return true;
  const warning = currentModelUnsavedBenchmarkWarning();
  if (!warning) return true;
  return window.confirm(`${warning}\n\n${actionLabel} will discard the current builder model data. Continue?`);
}

function jsObject(value, indent = 2) {
  return JSON.stringify(value, null, indent)
    .replace(/"([a-zA-Z_$][\w$]*)":/g, "$1:")
    .replace(/"undefined"/g, "undefined");
}

function updateExport() {
  const data = builderExport();
  try {
    recordEditHistorySnapshot(JSON.stringify(data));
  } catch {
    // Export rendering still needs to continue even if history cannot serialize a transient edit.
  }
  if (els.exportKind.value === "builder") {
    els.exportText.value = JSON.stringify(data, null, 2);
  } else {
    const id = data.id.replace(/[^\w$]/g, "_") || "custom_ship";
    const bp = derivedBlueprint();
    els.exportText.value = `// Paste inside MODELS. gameMeta is deliberately kept with the model\n// so SHIP_STATS / role lists / lore can be wired from the same export.\n${id}: buildBlueprint(${jsObject(bp, 2)}),`;
  }
}

function importBuilderJson() {
  try {
    const data = JSON.parse(els.importText.value);
    if (!data || !Array.isArray(data.verts) || !Array.isArray(data.faces)) throw new Error("Not builder JSON");
    if (!confirmDiscardCurrentModel("Import builder JSON")) {
      setStatus("IMPORT CANCELLED.");
      return;
    }
    applyBuilderDataToEditor(data, { loadSkins: true, resetPreview: true, fit: true, sourceModelId: "" });
    clearCurrentModelSavedSnapshot();
    setStatus("BUILDER JSON IMPORTED.");
    renderAll();
    scheduleGamePreviewSync(0, true);
  } catch (err) {
    setStatus(`IMPORT FAILED: ${err.message}`);
  }
}

function gameLibrary() {
  return window.ULTRA_ELITE_MODEL_LIBRARY || {};
}

function gameLibraryDescriptions() {
  return window.ULTRA_ELITE_SHIP_DESCRIPTIONS || {};
}

function libraryDescription(source, id) {
  const meta = source?.gameMeta || {};
  const descriptions = gameLibraryDescriptions();
  return meta.description || source?.description || descriptions[source?.id] || descriptions[id] || "";
}

function modelAuditWarnings(model) {
  const warnings = [];
  const faceEdges = new Set();
  const sourceVerts = (Array.isArray(model?.verts) ? model.verts : []).map(sourceVertex);
  const sourceVertexById = new Map(sourceVerts.map((vertex) => [vertex.id, vertex]));
  const faces = Array.isArray(model?.faces) ? model.faces : [];
  const edges = Array.isArray(model?.edges) ? model.edges : [];
  for (const face of faces) {
    const ids = (Array.isArray(face) ? face : face?.verts || []).map(Number);
    for (let i = 0; i < ids.length; i++) {
      const key = edgeKey(ids[i], ids[(i + 1) % ids.length]);
      if (key) faceEdges.add(key);
    }
  }
  const sourceScale = pointsBoundsScale(sourceVerts.map((vertex) => vec(vertex.x, vertex.y, vertex.z)));
  faces.forEach((face, index) => {
    const source = sourceFace(face, index);
    const points = source.verts.map((id) => sourceVertexById.get(id)).filter(Boolean).map((vertex) => vec(vertex.x, vertex.y, vertex.z));
    const issue = facePlanarityIssueFromPoints(points, source.verts, sourceScale);
    if (issue) {
      warnings.push(`face ${source.id}: non-planar ${issue.vertices}-vertex face; vertex ${issue.vertexId} is ${issue.maxDistance.toFixed(2)} from plane`);
    }
  });
  const blueprint = model?.blueprint;
  if (Array.isArray(blueprint?.verts) && Array.isArray(blueprint?.faces)) {
    const blueprintVerts = blueprint.verts.map((vertex, index) => sourceVertex(vertex, index));
    const blueprintVertexById = new Map(blueprintVerts.map((vertex) => [vertex.id, vertex]));
    const blueprintScale = pointsBoundsScale(blueprintVerts.map((vertex) => vec(vertex.x, vertex.y, vertex.z)));
    blueprint.faces.forEach((face, index) => {
      const ids = (Array.isArray(face) ? face : face?.verts || []).map(Number);
      const points = ids.map((id) => blueprintVertexById.get(id)).filter(Boolean).map((vertex) => vec(vertex.x, vertex.y, vertex.z));
      const issue = facePlanarityIssueFromPoints(points, ids, blueprintScale);
      if (issue) {
        warnings.push(`blueprint face ${index}: non-planar ${issue.vertices}-vertex face; vertex ${issue.vertexId} is ${issue.maxDistance.toFixed(2)} from plane`);
      }
    });
  }
  edges.forEach((edge, index) => {
    const source = sourceEdge(edge, index);
    const key = edgeKey(source.a, source.b);
    const label = `edge ${source.id} ${source.a}-${source.b}`;
    if (!key) {
      warnings.push(`${label}: invalid endpoints`);
      return;
    }
    if (!["edge", "stick", EDGE_KIND_HIDDEN, EDGE_KIND_STATION_ENTRANCE].includes(source.kind)) warnings.push(`${label}: unknown kind ${source.kind}`);
    if (source.kind !== "stick" && source.kind !== EDGE_KIND_HIDDEN && source.kind !== EDGE_KIND_STATION_ENTRANCE && !faceEdges.has(key)) warnings.push(`${label}: orphan non-stick edge`);
  });
  (model?.details || []).forEach((detail, index) => {
    const type = String(detail?.type || "detail");
    const stroke = String(detail?.stroke || "");
    const rgb = /^#([0-9a-f]{6})$/i.exec(stroke)?.[1];
    const nearWhite = rgb
      ? [0, 2, 4].every((offset) => parseInt(rgb.slice(offset, offset + 2), 16) >= 235)
      : false;
    if (stroke && ["window", "glass", "portal", "forcefield", "forceField"].includes(type)) {
      warnings.push(`detail ${detail?.id ?? index}: ${type} carries a stroke`);
    }
    if (nearWhite && type !== "engine") warnings.push(`detail ${detail?.id ?? index}: non-engine near-white stroke`);
  });
  return warnings;
}

function modelBrowserEntries() {
  return Object.entries(gameLibrary())
    .filter(([, model]) => model?.verts?.length)
    .map(([id, model]) => ({ id, model, warnings: modelAuditWarnings(model) }));
}

function modelBrowserRenderIntel(model) {
  const faces = Array.isArray(model?.faces) ? model.faces : [];
  const details = Array.isArray(model?.details) ? model.details : [];
  let texturedFaces = 0;
  let wrappedFaces = 0;
  let faceDecals = 0;
  for (const face of faces) {
    if (cleanBitmapKey(face?.bitmapFaceKey) || cleanFaceBitmapUv(face)) texturedFaces++;
    if (cleanBitmapWrap(face?.bitmapWrap) !== "clip") wrappedFaces++;
    faceDecals += cleanFaceDecals(face?.bitmapDecals).length;
  }
  return {
    verts: model?.verts?.length || 0,
    faces: faces.length,
    edges: model?.edges?.length || 0,
    details: details.length,
    texturedFaces,
    wrappedFaces,
    faceDecals
  };
}

function appendModelBrowserMetric(parent, text, title, className = "") {
  const item = document.createElement("span");
  item.className = `model-browser-metric${className ? ` ${className}` : ""}`;
  item.textContent = text;
  item.title = title;
  parent.appendChild(item);
  return item;
}

function modelBrowserBenchmarkResult(id) {
  return state.modelBrowserBenchResults instanceof Map ? state.modelBrowserBenchResults.get(id) : null;
}

function modelBrowserBenchmarkStale(id) {
  return state.modelBrowserStaleModelIds instanceof Set && state.modelBrowserStaleModelIds.has(id);
}

function formatBenchMetric(value, places = 1) {
  const number = Number(value);
  return Number.isFinite(number) ? number.toFixed(places) : "--";
}

function modelBrowserBenchmarkIssues(bench) {
  if (!bench) return [];
  const issues = [];
  if (Number(bench.avgFps) > 0 && Number(bench.avgFps) < 120) {
    issues.push(`Filtered FPS ${formatBenchMetric(bench.avgFps, 0)} is below 120.`);
  }
  if (Number(bench.p95Ms) >= 8) {
    issues.push(`P95 frame time ${formatBenchMetric(bench.p95Ms, 1)}ms is high.`);
  }
  if (Number(bench.spikeTaxMs) >= 5) {
    issues.push(`Spike tax +${formatBenchMetric(bench.spikeTaxMs, 1)}ms suggests outlier/cache turbulence.`);
  }
  if (Number(bench.rawWorstMs) >= 120) {
    issues.push(`Raw worst frame ${formatBenchMetric(bench.rawWorstMs, 1)}ms needs attention.`);
  }
  if (Number(bench.runJitterPct) >= 12) {
    issues.push(`Run-to-run noise ${formatBenchMetric(bench.runJitterPct, 0)}% suggests this benchmark should be repeated or inspected.`);
  }
  return issues;
}

function modelBrowserEntryLabel(entry) {
  return entry?.model?.name || entry?.id || "";
}

function benchmarkSdSortValue(entry) {
  const bench = modelBrowserBenchmarkResult(entry.id);
  return Number(bench?.stdDevMs) || 0;
}

function modelBrowserSortedEntries(entries) {
  const alphaSort = (a, b) => modelBrowserEntryLabel(a).localeCompare(modelBrowserEntryLabel(b));
  if (state.modelBrowserView === "benchmark") {
    return entries.slice().sort((a, b) => {
      return benchmarkSdSortValue(b) - benchmarkSdSortValue(a);
    });
  }
  return entries.slice().sort(alphaSort);
}

function setModelBrowserView(view) {
  state.modelBrowserView = view === "benchmark" ? "benchmark" : "objects";
  const benchmarkView = state.modelBrowserView === "benchmark";
  els.modelBrowserObjectsViewBtn?.classList.toggle("active", state.modelBrowserView === "objects");
  els.modelBrowserBenchmarkViewBtn?.classList.toggle("active", benchmarkView);
  els.modelBrowserObjectsViewBtn?.setAttribute("aria-pressed", benchmarkView ? "false" : "true");
  els.modelBrowserBenchmarkViewBtn?.setAttribute("aria-pressed", benchmarkView ? "true" : "false");
  if (els.modelBrowserTitle) els.modelBrowserTitle.textContent = benchmarkView ? "Benchmark Browser" : "Object Browser";
  if (els.modelBrowserSectionTitle) els.modelBrowserSectionTitle.textContent = benchmarkView ? "Render Benchmark Results" : "Model Library";
  els.modelBrowserObjectActions?.classList.toggle("is-hidden", benchmarkView);
  els.modelBrowserBenchmarkActions?.classList.toggle("is-hidden", !benchmarkView);
  els.modelBrowserModal?.setAttribute("aria-label", benchmarkView ? "Benchmark browser" : "Object browser");
  updateModelBrowser();
}

function formatBenchmarkRunTime(value) {
  if (!value) return "";
  const time = Date.parse(value);
  if (!Number.isFinite(time)) return "";
  const ageMs = Date.now() - time;
  const minutes = Math.max(0, Math.round(ageMs / 60000));
  const age = minutes < 1 ? "just now" : minutes < 120 ? `${minutes}m ago` : minutes < 2880 ? `${Math.round(minutes / 60)}h ago` : `${Math.round(minutes / 1440)}d ago`;
  return `${new Date(time).toLocaleString()} (${age})`;
}

function preferredBenchmarkResults(report) {
  const results = Array.isArray(report?.results) ? report.results : [];
  const full = results.filter((result) => result.quality === "full");
  return full.length ? full : results;
}

function applyModelBrowserBenchmarkReport(report, { saved = false } = {}) {
  const results = preferredBenchmarkResults(report);
  state.modelBrowserBenchResults = new Map(results.map((result) => [result.model, result]));
  state.modelBrowserBenchSavedAt = report?.savedAt || new Date().toISOString();
  state.modelBrowserBenchSourceModels = report?.sourceModels || {};
  if (!saved) state.modelBrowserStaleModelIds = new Set();
}

function applyModelBrowserBenchmarkResult(result, savedAt = new Date().toISOString()) {
  if (!result?.model) return;
  if (!(state.modelBrowserBenchResults instanceof Map)) state.modelBrowserBenchResults = new Map();
  state.modelBrowserBenchResults.set(result.model, result);
  state.modelBrowserBenchSavedAt = savedAt;
  state.modelBrowserStaleModelIds?.delete?.(result.model);
}

async function currentSourceModelMtimeMs(source) {
  if (!source?.file) return 0;
  try {
    const response = await fetch(`../../${source.file}?mtime=${Date.now()}`, {
      method: "HEAD",
      cache: "no-store"
    });
    const modified = response.headers.get("last-modified");
    const time = modified ? Date.parse(modified) : 0;
    return Number.isFinite(time) ? time : 0;
  } catch {
    return 0;
  }
}

async function updateModelBrowserStaleModels(report) {
  const sourceModels = report?.sourceModels || {};
  const stale = new Set();
  await Promise.all(Object.entries(sourceModels).map(async ([id, source]) => {
    if (!Number.isFinite(Number(source?.mtimeMs))) return;
    const current = await currentSourceModelMtimeMs(source);
    if (current && current > Number(source.mtimeMs) + 1000) stale.add(id);
  }));
  state.modelBrowserStaleModelIds = stale;
}

function thumbnailModelData(model) {
  const verts = (model.verts || []).map(sourceVertex);
  const vertexBySourceId = new Map(verts.map((vertex) => [vertex.id, vertex]));
  const faces = (model.faces || [])
    .map(sourceFace)
    .filter((face) => face.verts.length >= 3 && face.verts.every((id) => vertexBySourceId.has(id)));
  const edges = (model.edges || [])
    .map(sourceEdge)
    .filter((edge) => edge.kind !== EDGE_KIND_HIDDEN && vertexBySourceId.has(edge.a) && vertexBySourceId.has(edge.b));
  return { verts, vertexBySourceId, faces, edges };
}

function rotateThumbnailPoint(v) {
  const ry = 0.74;
  const rx = -0.42;
  const cy = Math.cos(ry), sy = Math.sin(ry);
  const cx = Math.cos(rx), sx = Math.sin(rx);
  const x1 = v.x * cy - v.z * sy;
  const z1 = v.x * sy + v.z * cy;
  const y1 = v.y * cx - z1 * sx;
  const z2 = v.y * sx + z1 * cx;
  return vec(x1, y1, z2);
}

function drawModelBrowserThumbnail(canvas, model) {
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#010201";
  ctx.fillRect(0, 0, w, h);
  const data = thumbnailModelData(model);
  if (!data.verts.length) return;
  const rotated = new Map(data.verts.map((vertex) => [vertex.id, rotateThumbnailPoint(vertex)]));
  const xs = [...rotated.values()].map((p) => p.x);
  const ys = [...rotated.values()].map((p) => p.y);
  const rangeX = Math.max(1, Math.max(...xs) - Math.min(...xs));
  const rangeY = Math.max(1, Math.max(...ys) - Math.min(...ys));
  const scale = Math.min((w - 26) / rangeX, (h - 24) / rangeY);
  const centerX = (Math.max(...xs) + Math.min(...xs)) / 2;
  const centerY = (Math.max(...ys) + Math.min(...ys)) / 2;
  const project = (point) => ({
    x: w / 2 + (point.x - centerX) * scale,
    y: h / 2 - (point.y - centerY) * scale,
    z: point.z
  });
  const base = model?.gameMeta?.baseColor || "#e9f2e4";
  const sortedFaces = data.faces
    .map((face) => {
      const points = face.verts.map((id) => rotated.get(id)).filter(Boolean);
      const avgZ = points.reduce((sum, point) => sum + point.z, 0) / points.length;
      return { face, points, projected: points.map(project), avgZ };
    })
    .sort((a, b) => a.avgZ - b.avgZ);
  for (const item of sortedFaces) {
    const n = norm(cross(sub(item.points[1], item.points[0]), sub(item.points[2], item.points[0])));
    drawFace(ctx, item.projected, shadedFaceColor(n, optionalHexColor(item.face.faceColor) || base), "rgba(85,255,78,.2)", 0.7);
  }
  ctx.save();
  ctx.strokeStyle = "rgba(194,255,194,.38)";
  ctx.lineWidth = 1.05;
  ctx.beginPath();
  for (const edge of data.edges) {
    const a = rotated.get(edge.a);
    const b = rotated.get(edge.b);
    if (!a || !b) continue;
    const pa = project(a);
    const pb = project(b);
    ctx.moveTo(pa.x, pa.y);
    ctx.lineTo(pb.x, pb.y);
  }
  ctx.stroke();
  ctx.restore();
}

function updateModelBrowser() {
  if (!els.modelBrowserGrid) return;
  const benchmarkView = state.modelBrowserView === "benchmark";
  const entries = modelBrowserSortedEntries(modelBrowserEntries());
  els.modelBrowserGrid.dataset.view = benchmarkView ? "benchmark" : "objects";
  els.modelBrowserGrid.replaceChildren();
  if (els.modelBrowserReadout) {
    const warningCount = entries.filter((entry) => entry.warnings.length).length;
    const benchCount = state.modelBrowserBenchResults?.size || 0;
    const lastRun = formatBenchmarkRunTime(state.modelBrowserBenchSavedAt);
    const staleCount = state.modelBrowserStaleModelIds?.size || 0;
    const benchmarkProblemCount = entries.filter((entry) => modelBrowserBenchmarkIssues(modelBrowserBenchmarkResult(entry.id)).length).length;
    const benchResults = state.modelBrowserBenchResults instanceof Map ? [...state.modelBrowserBenchResults.values()] : [];
    const runs = Math.max(0, ...benchResults.map((bench) => Number(bench.runs) || 0));
    const settleRuns = Math.max(0, ...benchResults.map((bench) => Number(bench.settleRuns) || 0));
    els.modelBrowserReadout.textContent = benchmarkView
      ? `${benchCount || 0} benchmarked${runs ? ` | ${runs} runs averaged` : ""}${settleRuns ? ` | ${settleRuns} settle discarded` : ""} | ${benchmarkProblemCount} benchmark warnings${lastRun ? ` | last run ${lastRun}` : ""}${staleCount ? ` | ${staleCount} updated since` : ""}`
      : `${entries.length} objects | ${warningCount} with audit warnings`;
  }
  for (const entry of entries) {
    const intel = modelBrowserRenderIntel(entry.model);
    const bench = modelBrowserBenchmarkResult(entry.id);
    const stale = modelBrowserBenchmarkStale(entry.id);
    const benchmarkIssues = modelBrowserBenchmarkIssues(bench);
    const button = document.createElement("button");
    button.type = "button";
    button.className = `model-browser-card${benchmarkView ? " is-benchmark-card" : " is-object-card"}${!benchmarkView && entry.warnings.length ? " has-audit" : ""}${benchmarkView && benchmarkIssues.length ? " has-benchmark-warning" : ""}${benchmarkView && stale ? " has-stale-bench" : ""}`;
    button.dataset.modelId = entry.id;
    if (!benchmarkView && entry.warnings.length) button.title = entry.warnings.join("\n");
    if (benchmarkView && benchmarkIssues.length) button.title = benchmarkIssues.join("\n");

    const canvas = document.createElement("canvas");
    canvas.className = "model-browser-thumb";
    canvas.width = 260;
    canvas.height = 160;
    button.appendChild(canvas);

    if (!benchmarkView && entry.warnings.length) {
      const badge = document.createElement("span");
      badge.className = "model-browser-warning";
      badge.textContent = "!";
      badge.title = `${entry.warnings.length} audit warning${entry.warnings.length === 1 ? "" : "s"}`;
      button.appendChild(badge);
    }
    if (benchmarkView && benchmarkIssues.length) {
      const badge = document.createElement("span");
      badge.className = "model-browser-benchmark-warning";
      badge.textContent = "!";
      badge.title = benchmarkIssues.join("\n");
      button.appendChild(badge);
    }

    const title = document.createElement("span");
    title.className = "model-browser-title";
    title.textContent = entry.model.name || entry.id;
    button.appendChild(title);

    const meta = document.createElement("span");
    meta.className = "model-browser-meta";
    meta.textContent = entry.id;
    button.appendChild(meta);

    const metrics = document.createElement("span");
    metrics.className = `model-browser-metrics${benchmarkView ? " model-browser-bench" : ""}`;
    if (!benchmarkView) {
      appendModelBrowserMetric(metrics, `${intel.verts}v`, "Vertex count in the source model.");
      appendModelBrowserMetric(metrics, `${intel.faces}f`, "Face count in the source model.");
      appendModelBrowserMetric(metrics, `${intel.edges}e`, "Visible edge/stick count in the source model.");
      appendModelBrowserMetric(metrics, `${intel.details}d`, "Surface detail count: windows, engines, panels, beacons and related authored details.");
      appendModelBrowserMetric(metrics, `UV ${intel.texturedFaces}`, "Faces with explicit face texture keys or baked per-face UVs.");
      if (intel.wrappedFaces) appendModelBrowserMetric(metrics, `WRAP ${intel.wrappedFaces}`, "Faces using repeat or mirror wrapping; these can create multiple renderer tile pieces.", "is-warn");
      if (intel.faceDecals) appendModelBrowserMetric(metrics, `DECAL ${intel.faceDecals}`, "Face-local decal layer count.");
      if (entry.warnings.length) appendModelBrowserMetric(metrics, `WARN ${entry.warnings.length}`, "Audit warnings for non-planar faces, orphan non-stick edges, invalid edge kinds, or stroke hazards.", "is-warn");
    } else if (bench) {
      appendModelBrowserMetric(metrics, `RUNS ${bench.runs || 1}`, "Number of complete benchmark passes averaged for this result.");
      if (bench.settleRuns) appendModelBrowserMetric(metrics, `SETTLE ${bench.settleRuns}`, "Warm-cache settle passes run before measurement and discarded from the averaged result.");
      appendModelBrowserMetric(metrics, `FPS ${formatBenchMetric(bench.avgFps, 0)}`, "Filtered render FPS. High-end outlier frames are trimmed so startup/cache spikes do not poison the headline number.");
      appendModelBrowserMetric(metrics, `P95 ms ${formatBenchMetric(bench.p95Ms, 1)}`, "95th percentile filtered frame time in milliseconds; 95% of measured frames are this fast or faster.");
      appendModelBrowserMetric(metrics, `SD ${formatBenchMetric(bench.stdDevMs, 1)}`, "Filtered standard deviation in milliseconds. Lower means the normal render cost is more stable.");
      appendModelBrowserMetric(metrics, `RUN SD ${formatBenchMetric(bench.runStdDevMs, 2)}`, "Run-to-run standard deviation of average frame time. Lower means repeated benchmark passes agree with each other.");
      appendModelBrowserMetric(metrics, `JIT ${formatBenchMetric(bench.jitterPct, 0)}%`, "Jitter: filtered standard deviation divided by filtered average frame time.");
      appendModelBrowserMetric(metrics, `SPIKE +${formatBenchMetric(bench.spikeTaxMs, 1)}`, "Spike tax: how much raw average frame time was increased by outlier frames.");
      appendModelBrowserMetric(metrics, `OUT ${bench.outlierFrames || 0}`, "Outlier frame count removed from filtered FPS and filtered timing metrics.");
      if (stale) appendModelBrowserMetric(metrics, "STALE", "This source model file has changed since the saved benchmark report was generated.", "is-stale");
    } else {
      appendModelBrowserMetric(metrics, "NO BENCH", "Run Benchmark Library or npm run bench:render to measure filtered FPS, P95 ms, standard deviation, jitter, spike tax and outliers for every object.");
    }
    button.appendChild(metrics);

    els.modelBrowserGrid.appendChild(button);
    drawModelBrowserThumbnail(canvas, entry.model);
  }
}

function waitForModelBrowserBenchmark(frame, timeoutMs = 90000) {
  return new Promise((resolve, reject) => {
    const started = performance.now();
    const poll = () => {
      let summary = null;
      try {
        summary = frame.contentWindow?.__renderBenchSummary || null;
      } catch (error) {
        reject(error);
        return;
      }
      if (summary?.status === "batch-complete" && Array.isArray(summary.results)) {
        resolve(summary);
        return;
      }
      if (performance.now() - started > timeoutMs) {
        reject(new Error("library benchmark timed out"));
        return;
      }
      setTimeout(poll, 240);
    };
    frame.addEventListener("load", () => setTimeout(poll, 80), { once: true });
    poll();
  });
}

async function runModelBrowserBenchmark() {
  if (state.modelBrowserBenchmarkRunning) return;
  state.modelBrowserBenchmarkRunning = true;
  if (els.modelBrowserBenchmarkBtn) els.modelBrowserBenchmarkBtn.disabled = true;
  try {
    if (els.modelBrowserReadout) els.modelBrowserReadout.textContent = "Benchmarking library: full Ultra render path...";
    setStatus("MODEL LIBRARY RENDER BENCHMARK STARTED.");
    const summary = await runHiddenRenderBenchmark({ models: "all" });
    applyModelBrowserBenchmarkReport({ ...summary, savedAt: new Date().toISOString() });
    updateModelBrowser();
    const results = [...state.modelBrowserBenchResults.values()];
    const slowest = results.slice().sort((a, b) => (b.p95Ms || 0) - (a.p95Ms || 0)).slice(0, 3)
      .map((result) => `${result.modelName || result.model} ${formatBenchMetric(result.p95Ms, 1)}ms`)
      .join(", ");
    const spikiest = results.slice().sort((a, b) => (b.spikeTaxMs || 0) - (a.spikeTaxMs || 0))[0];
    const spikeText = spikiest ? ` | SPIKIEST ${spikiest.modelName || spikiest.model} +${formatBenchMetric(spikiest.spikeTaxMs, 1)}MS` : "";
    setStatus(`MODEL LIBRARY BENCHMARK COMPLETE: ${results.length} OBJECTS. SLOWEST P95: ${slowest}${spikeText}.`);
  } catch (error) {
    const message = `MODEL LIBRARY BENCHMARK FAILED: ${error.message}`;
    setStatus(message);
    if (els.modelBrowserReadout) els.modelBrowserReadout.textContent = message;
  } finally {
    state.modelBrowserBenchmarkRunning = false;
    if (els.modelBrowserBenchmarkBtn) els.modelBrowserBenchmarkBtn.disabled = false;
  }
}

async function runHiddenRenderBenchmark({ models = "all", iterations = 80, warmup = 20, runs = 3, settleRuns = 3, timeoutMs = 240000 } = {}) {
  const frame = document.createElement("iframe");
  frame.className = "renderer-benchmark-frame";
  frame.title = "Model library renderer benchmark";
  document.body.append(frame);
  try {
    const summaryPromise = waitForModelBrowserBenchmark(frame, timeoutMs);
    frame.src = `../render-bench/?batch=1&models=${encodeURIComponent(models)}&qualities=full&iterations=${iterations}&warmup=${warmup}&runs=${runs}&settleRuns=${settleRuns}&mode=solid&fx=ultra&lod=0&scale=46&shipbuilder=${Date.now()}`;
    return await summaryPromise;
  } finally {
    frame.remove();
  }
}

async function loadSavedModelBrowserBenchmarkReport(options = {}) {
  if (state.modelBrowserBenchmarkLoading) return;
  if (!options.force && state.modelBrowserBenchResults?.size) return;
  state.modelBrowserBenchmarkLoading = true;
  try {
    const response = await fetch(`../render-bench/reports/latest.json?cache=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) return;
    const report = await response.json();
    if (!Array.isArray(report?.results)) return;
    applyModelBrowserBenchmarkReport(report, { saved: true });
    await updateModelBrowserStaleModels(report);
    updateModelBrowser();
  } catch {
    // No saved benchmark yet, or the local server cannot expose the report.
  } finally {
    state.modelBrowserBenchmarkLoading = false;
  }
}

async function benchmarkSavedModelAfterBuild(modelId) {
  const cleanId = cleanBitmapKey(modelId);
  if (!cleanId) return { result: null, issues: ["Missing saved model id."] };
  setStatus(`POST-BUILD BENCHMARKING ${cleanId.toUpperCase()}...`);
  const summary = await runHiddenRenderBenchmark({ models: cleanId, timeoutMs: 45000 });
  const result = preferredBenchmarkResults(summary).find((item) => item.model === cleanId) || null;
  if (!result) return { result: null, issues: [`No benchmark result returned for ${cleanId}.`] };
  applyModelBrowserBenchmarkResult(result);
  const issues = modelBrowserBenchmarkIssues(result);
  return { result, issues };
}

function openModelBrowser() {
  if (!els.modelBrowserModal) return;
  if (els.modelBrowserProfileSides && els.profileSideCount) els.modelBrowserProfileSides.value = readProfileSideCount();
  if (els.modelBrowserProfileRotation && els.profileRotationDeg) els.modelBrowserProfileRotation.value = readProfileRotationDeg();
  if (els.modelBrowserProfileCone && els.profileConeMode) els.modelBrowserProfileCone.checked = readProfileConeMode();
  updateModelBrowser();
  loadSavedModelBrowserBenchmarkReport();
  els.modelBrowserModal.classList.remove("is-hidden");
}

function openObjectBrowser() {
  setModelBrowserView("objects");
  openModelBrowser();
}

function openBenchmarkBrowser() {
  const warning = currentModelUnsavedBenchmarkWarning();
  if (warning) {
    const ok = window.confirm(`${warning}\n\nThe benchmark browser uses saved generated-library data, so unsaved builder edits will not be measured. Open benchmark view anyway?`);
    if (!ok) {
      setStatus("BENCHMARK BROWSER CANCELLED: SAVE THE MODEL FIRST TO MEASURE CURRENT EDITS.");
      return;
    }
  }
  setModelBrowserView("benchmark");
  openModelBrowser();
}

function closeModelBrowser() {
  els.modelBrowserModal?.classList.add("is-hidden");
  renderAll();
}

function populateLibrarySelector() {
  const entries = Object.entries(gameLibrary())
    .filter(([, model]) => model?.verts?.length)
    .sort((a, b) => (a[1].name || a[0]).localeCompare(b[1].name || b[0]));
  if (!els.librarySelector) return;
  els.librarySelector.innerHTML = entries.map(([id, model]) =>
    `<option value="${id}">${model.name || id}</option>`
  ).join("");
}

function loadLibraryModel(id) {
  const source = gameLibrary()[id];
  if (!source) {
    setStatus("LIBRARY OBJECT NOT FOUND.");
    return false;
  }
  if (!confirmDiscardCurrentModel(`Load ${(source.name || id).toUpperCase()} from the game library`)) {
    setStatus("LOAD CANCELLED.");
    return false;
  }
  showBuilderPreloadSplash(`Loading ${(source.name || id).toUpperCase()}...`, { libraryReady: true, texturesReady: false });
  resetGamePreviewSyncState();
  cancelSurfaceInsertPreview({ redraw: false });
  state.nextId = 1;
  state.verts = (source.verts || []).map((v, index) => {
    const vertex = sourceVertex(v, index);
    state.nextId = Math.max(state.nextId, vertex.id + 1);
    return vertex;
  });
  state.faces = (source.faces || []).map((f, index) => {
    const face = sourceFace(f, index);
    state.nextId = Math.max(state.nextId, face.id + 1);
    return face;
  });
  state.edges = (source.edges || []).map((e, index) => {
    const edge = sourceEdge(e, index);
    state.nextId = Math.max(state.nextId, edge.id + 1);
    return edge;
  });
  state.details = (source.details || []).map((d) => {
    const idNum = Number(d.id);
    if (Number.isFinite(idNum)) state.nextId = Math.max(state.nextId, idNum + 1);
    const faceId = Number(d.faceId);
    return {
      ...d,
      id: Number.isFinite(idNum) ? idNum : newId(),
      faceId: Number.isFinite(faceId) ? faceId : undefined,
      vertexId: Number.isFinite(Number(d.vertexId)) ? Number(d.vertexId) : undefined,
      indices: Array.isArray(d.indices) ? d.indices.map(Number) : undefined,
      segment: Array.isArray(d.segment) ? d.segment.map(Number) : undefined
    };
  });
  migrateStationEntranceEdgesToDetails();
  inferMirrorVertexIds();
  const meta = source.gameMeta || {};
  state.sourceModelId = cleanBitmapKey(source.id || id);
  els.shipId.value = source.id || id;
  els.shipName.value = source.name || id;
  els.shipDescription.value = libraryDescription(source, id);
  els.shipMissionLore.value = meta.missionLore || meta.mission || "";
  syncSkinAngle(skinAngleMetaValue(meta), false);
  if (meta.class && [...els.shipClass.options].some((o) => o.value === meta.class)) els.shipClass.value = meta.class;
  if (meta.npcRole && [...els.npcRole.options].some((o) => o.value === meta.npcRole)) els.npcRole.value = meta.npcRole;
  if (meta.aiProfile && [...els.aiProfile.options].some((o) => o.value === meta.aiProfile)) els.aiProfile.value = meta.aiProfile;
  if (meta.decalRole && [...els.decalRole.options].some((o) => o.value === meta.decalRole)) els.decalRole.value = meta.decalRole;
  els.baseColor.value = normalizeHexColor(meta.baseColor);
  if (Number.isFinite(meta.valueCr)) els.shipValue.value = meta.valueCr;
  if (meta.stats) {
    if (Number.isFinite(meta.stats.hp)) els.shipHp.value = meta.stats.hp;
    if (Number.isFinite(meta.stats.speed)) els.speedMul.value = meta.stats.speed;
    if (Number.isFinite(meta.stats.cargo)) els.cargoTons.value = meta.stats.cargo;
    if (Number.isFinite(meta.stats.missiles)) els.missileCount.value = meta.stats.missiles;
    if (meta.stats.laser && [...els.laserClass.options].some((o) => o.value === meta.stats.laser)) els.laserClass.value = meta.stats.laser;
  }
  if (meta.lists) {
    els.flagTrader.checked = !!meta.lists.trader;
    els.flagPirate.checked = !!meta.lists.pirate;
    els.flagPolice.checked = !!meta.lists.police;
    els.flagAlien.checked = !!meta.lists.alien;
  }
  if (meta.flags) {
    els.flagEscapePod.checked = !!meta.flags.escapePod;
    els.flagHidden.checked = !!meta.flags.hiddenUntilDiscovered;
  }
  state.selected = null;
  state.pick = [];
  state.selectedFaceIds.clear();
  state.selectedEdgeIds.clear();
  state.selectedDetailIds.clear();
  loadSkinBitmaps(source.id || id, mirrorFlagsFromMeta(meta));
  markCurrentModelSavedSnapshot(source.id || id);
  fitView();
  setStatus(`LOADED ${els.shipName.value.toUpperCase()} FROM GAME LIBRARY.`);
  closeModelBrowser();
  renderAll();
  scheduleGamePreviewSync(0, true);
  return true;
}

function downloadShip() {
  const data = builderExport();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${data.id || "custom_ship"}.ultraship.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(a.href);
}

function imageToPngDataUrl(img) {
  if (!img?.naturalWidth || !img?.naturalHeight) throw new Error("Image is not loaded.");
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);
  return canvas.toDataURL("image/png");
}

function coalesceDuplicateVisibleFaceSkins() {
  const canonicalByImage = new Map();
  const replacements = new Map();
  for (const face of state.faces) {
    const key = cleanBitmapKey(face.bitmapFaceKey);
    const img = key ? state.faceSkinImages?.[key] : null;
    if (!img?.naturalWidth) continue;
    let dataUrl = "";
    try {
      dataUrl = imageToPngDataUrl(img);
    } catch {
      continue;
    }
    const canonical = canonicalByImage.get(dataUrl);
    if (!canonical) {
      canonicalByImage.set(dataUrl, key);
    } else if (canonical !== key) {
      replacements.set(key, canonical);
    }
  }
  if (!replacements.size) return { changedFaces: 0, replacements };

  let changedFaces = 0;
  for (const face of state.faces) {
    const key = cleanBitmapKey(face.bitmapFaceKey);
    const replacement = replacements.get(key);
    if (!replacement) continue;
    face.bitmapFaceKey = replacement;
    changedFaces++;
  }
  for (const [oldKey, newKey] of replacements) {
    if (!state.faceSkinImages[newKey] && state.faceSkinImages[oldKey]) state.faceSkinImages[newKey] = state.faceSkinImages[oldKey];
    if (!state.faceSkinSources[newKey] && state.faceSkinSources[oldKey]) state.faceSkinSources[newKey] = state.faceSkinSources[oldKey];
    const oldUrl = state.faceSkinUrls[oldKey];
    if (!state.faceSkinUrls[newKey] && oldUrl) state.faceSkinUrls[newKey] = oldUrl;
    else if (oldUrl && oldUrl !== state.faceSkinUrls[newKey]) URL.revokeObjectURL(oldUrl);
    delete state.faceSkinImages[oldKey];
    delete state.faceSkinSources[oldKey];
    delete state.faceSkinUrls[oldKey];
  }
  markPreviewSkinsDirty();
  updateSkinReadout();
  updateFaceUvAngleControls();
  renderAll();
  return { changedFaces, replacements };
}

function referencedVisibleFaceSkinUploads() {
  const keys = [...new Set(state.faces.map((face) => cleanBitmapKey(face.bitmapFaceKey)).filter(Boolean))];
  return keys.map((key) => {
    const img = state.faceSkinImages?.[key];
    if (!img?.naturalWidth) return null;
    return { key, img };
  }).filter(Boolean);
}

function referencedVisibleSideSkinUploads() {
  return ["top", "bottom", "back"].map((side) => {
    const img = state.skinImages?.[side];
    if (!img?.naturalWidth) return null;
    return { side, img };
  }).filter(Boolean);
}

async function uploadSideSkinAsset(model, side, img) {
  return apiJson("/api/skins", {
    method: "POST",
    body: JSON.stringify({
      kind: "side",
      model,
      side,
      dataUrl: imageToPngDataUrl(img)
    })
  });
}

async function uploadFaceSkinAsset(model, key, img) {
  return apiJson("/api/skins", {
    method: "POST",
    body: JSON.stringify({
      kind: "face",
      model,
      key,
      dataUrl: imageToPngDataUrl(img)
    })
  });
}

async function saveModelAsset() {
  try {
    if (!await requireToolServer()) return;
    const coalesced = coalesceDuplicateVisibleFaceSkins();
    const data = builderExport();
    const cleanId = cleanBitmapKey(data.id, "custom_ship");
    const previousId = cleanBitmapKey(state.sourceModelId || "");
    const renameCleanup = previousId && previousId !== cleanId && !!gameLibrary()[previousId];
    const sideSkins = referencedVisibleSideSkinUploads();
    const faceSkins = referencedVisibleFaceSkinUploads();
    const sideSkinFiles = sideSkins.map((skin) => `assets/skins/${cleanId}-${skin.side}.png`);
    const faceSkinFiles = faceSkins.map((skin) => `assets/skins/${cleanId}-face-${skin.key}.png`);
    const ok = await confirmProjectWriteSummary({
      title: "Save Ship",
      confirmLabel: "Build Assets",
      intro: `Save ${data.name || cleanId} as ${cleanId}, then rebuild the local dev.html test files. This does not publish anything.`,
      groups: [
        {
          title: "Model Asset",
          lines: [
            `assets/models/${cleanId}.ultraship.json`,
            `${state.verts.length} vertices, ${state.faces.length} faces, ${state.edges.length} edges`
          ]
        },
        {
          title: "Skin PNGs",
          lines: [
            ...sideSkinFiles,
            ...faceSkinFiles,
            coalesced.changedFaces ? `Reused matching face PNG keys on ${coalesced.changedFaces} face${coalesced.changedFaces === 1 ? "" : "s"} to avoid duplicate identical assets.` : "",
            !sideSkinFiles.length && !faceSkinFiles.length ? "No loaded/referenced skin PNGs will be written." : ""
          ]
        },
        ...(renameCleanup ? [{
          title: "Rename Cleanup",
          lines: [
            `Remove old model assets/models/${previousId}.ultraship.json`,
            `Remove old skins assets/skins/${previousId}-*.png`,
            "This is treated as a rename, so the old library entry will not remain as a duplicate."
          ]
        }] : []),
        {
          title: "Build Outputs",
          lines: [
            "tools/ship-builder/game-model-library.js",
            "src/generated/model-library.js",
            "src/generated/bitmap-skins.js",
            "dev.html",
            "index.html",
            "Ready to test through local dev.html after the build completes."
          ]
        }
      ]
    });
    if (!ok) {
      setStatus("MODEL SAVE CANCELLED.");
      return;
    }
    for (let i = 0; i < sideSkins.length; i++) {
      const skin = sideSkins[i];
      setStatus(`SAVING ${cleanId.toUpperCase()} ${skin.side.toUpperCase()} SKIN (${i + 1}/${sideSkins.length})...`);
      await uploadSideSkinAsset(cleanId, skin.side, skin.img);
      state.skinImages.source[skin.side] = "asset";
    }
    for (let i = 0; i < faceSkins.length; i++) {
      const skin = faceSkins[i];
      setStatus(`SAVING ${cleanId.toUpperCase()} FACE ${skin.key} (${i + 1}/${faceSkins.length})...`);
      await uploadFaceSkinAsset(cleanId, skin.key, skin.img);
      state.faceSkinSources[skin.key] = "asset";
    }
    setStatus(`SAVING ${cleanId.toUpperCase()} MODEL...`);
    const result = await apiJson(`/api/models/${encodeURIComponent(cleanId)}`, {
      method: "POST",
      body: JSON.stringify(data)
    });
    let cleanupResult = null;
    if (renameCleanup) {
      setStatus(`REMOVING OLD ${previousId.toUpperCase()} MODEL...`);
      cleanupResult = await apiJson(`/api/models/${encodeURIComponent(previousId)}`, { method: "DELETE" });
      if (window.ULTRA_ELITE_MODEL_LIBRARY) delete window.ULTRA_ELITE_MODEL_LIBRARY[previousId];
    }
    setStatus("REBUILDING LOCAL GAME FILES...");
    await apiJson("/api/rebuild", {
      method: "POST",
      body: JSON.stringify({ scope: "all" })
    });
    window.ULTRA_ELITE_MODEL_LIBRARY = window.ULTRA_ELITE_MODEL_LIBRARY || {};
    window.ULTRA_ELITE_MODEL_LIBRARY[cleanId] = { ...data, id: cleanId };
    populateLibrarySelector();
    if (els.librarySelector) els.librarySelector.value = cleanId;
    state.sourceModelId = cleanId;
    markCurrentModelSavedSnapshot(cleanId);
    state.assetVersion = Date.now();
    if (sideSkins.length || faceSkins.length) await refreshAvailableSkinAssets();
    const savedParts = [
      sideSkins.length ? `${sideSkins.length} SIDE PNG${sideSkins.length === 1 ? "" : "S"}` : "",
      faceSkins.length ? `${faceSkins.length} FACE PNG${faceSkins.length === 1 ? "" : "S"}` : ""
    ].filter(Boolean).join(", ");
    const cleanupText = cleanupResult?.deleted?.length ? `; OLD ${previousId} REMOVED` : "";
    let benchmarkText = "";
    try {
      const benchmark = await benchmarkSavedModelAfterBuild(cleanId);
      const bench = benchmark.result;
      if (bench) {
        benchmarkText = benchmark.issues.length
          ? ` Benchmark warning: ${benchmark.issues.join(" ")}`
          : ` Benchmark ok: FPS ${formatBenchMetric(bench.avgFps, 0)}, P95 ms ${formatBenchMetric(bench.p95Ms, 1)}, spike +${formatBenchMetric(bench.spikeTaxMs, 1)}.`;
      }
    } catch (error) {
      benchmarkText = ` Benchmark failed: ${error.message}.`;
    }
    setStatus(`MODEL UPDATED: ${result.path}${savedParts ? `; ${savedParts} SAVED` : ""}${cleanupText}.${benchmarkText}`);
    showBuildCompleteModal(`${data.name || cleanId} is built into the local dev.html test files.${benchmarkText ? ` ${benchmarkText}` : ""} Click below to test locally.`);
  } catch (error) {
    setStatus(`MODEL SAVE FAILED: ${error.message}`);
  }
}

async function uploadSkinSide(side) {
  try {
    if (!await requireToolServer()) return;
    const img = state.skinImages?.[side];
    if (!img?.naturalWidth) {
      setStatus(`NO ${side.toUpperCase()} SKIN LOADED.`);
      return;
    }
    const model = templateShipId();
    if (!confirmWrite(`Overwrite assets/skins/${model}-${side}.png and regenerate bitmap skins?`)) {
      setStatus("SKIN UPLOAD CANCELLED.");
      return;
    }
    setStatus(`UPLOADING ${model.toUpperCase()} ${side.toUpperCase()} SKIN...`);
    const result = await uploadSideSkinAsset(model, side, img);
    state.skinImages.source[side] = "asset";
    state.assetVersion = Date.now();
    loadSkinBitmaps(model, state.skinImages?.mirrorX || currentModelMirrorFlags());
    await refreshAvailableSkinAssets();
    setStatus(`SKIN UPDATED: ${result.path}.`);
  } catch (error) {
    setStatus(`SKIN UPLOAD FAILED: ${error.message}`);
  }
}

async function uploadSelectedFaceSkin() {
  try {
    if (!await requireToolServer()) return;
    const face = selectedFace();
    if (!face) {
      setStatus("SELECT A FACE FIRST.");
      return;
    }
    const key = selectedFaceSkinKey(face);
    const img = state.faceSkinImages?.[key];
    if (!img?.naturalWidth) {
      setStatus(`NO FACE SKIN LOADED FOR ${key}.`);
      return;
    }
    face.bitmapFaceKey = key;
    if (mirrorActionsEnabled()) syncMirroredFace(face);
    const model = templateShipId();
    const sharedCount = faceSkinKeyUsage(key, face);
    const sharedText = sharedCount
      ? `\n\nGlobal asset update: texture key ${key} is also used by ${sharedCount} other face${sharedCount === 1 ? "" : "s"} in this model. This overwrite will update all of them.`
      : "";
    if (!confirmWrite(`Overwrite assets/skins/${model}-face-${key}.png and regenerate bitmap skins?${sharedText}`)) {
      setStatus("FACE SKIN UPLOAD CANCELLED.");
      return;
    }
    setStatus(`UPLOADING ${model.toUpperCase()} FACE ${key}...`);
    const result = await uploadFaceSkinAsset(model, key, img);
    state.faceSkinSources[key] = "asset";
    state.assetVersion = Date.now();
    loadSkinBitmaps(model, state.skinImages?.mirrorX || currentModelMirrorFlags());
    await refreshAvailableSkinAssets();
    setStatus(`FACE SKIN UPDATED: ${result.path}.`);
  } catch (error) {
    setStatus(`FACE SKIN UPLOAD FAILED: ${error.message}`);
  }
}

async function rebuildGameFiles() {
  try {
    if (!await requireToolServer()) return;
    if (!confirmWrite("Regenerate model libraries, bitmap skin manifest, dev.html, and index.html?")) {
      setStatus("REBUILD CANCELLED.");
      return;
    }
    setStatus("REBUILDING MODEL/SKIN/GAME FILES...");
    const result = await apiJson("/api/rebuild", {
      method: "POST",
      body: JSON.stringify({ scope: "all" })
    });
    state.assetVersion = Date.now();
    loadSkinBitmaps(templateShipId(), state.skinImages?.mirrorX || currentModelMirrorFlags());
    await refreshAvailableSkinAssets();
    setStatus(`REBUILD COMPLETE (${result.steps?.length || 0} STEPS).`);
  } catch (error) {
    setStatus(`REBUILD FAILED: ${error.message}`);
  }
}

function copyExport() {
  navigator.clipboard?.writeText(els.exportText.value).then(
    () => setStatus("EXPORT COPIED."),
    () => setStatus("COPY FAILED; SELECT EXPORT TEXT MANUALLY.")
  );
}

function setExportVisible(visible) {
  els.workspace.classList.toggle("export-hidden", !visible);
  els.exportPanel.classList.toggle("is-hidden", !visible);
  els.toggleExportBtn.textContent = visible ? "Hide Advanced" : "Advanced";
  renderAll();
}

function setMode(mode, announce = true) {
  if (!SELECTABLE_TYPES.includes(mode)) return;
  state.selectionFilters = Object.fromEntries(SELECTABLE_TYPES.map((type) => [type, type === mode]));
  clearSelectionForSelectorChange();
  state.mode = mode;
  setToolTab(mode === "uv" || mode === "group" ? "paint" : "edit", { redraw: false });
  if (mode === "uv" || mode === "group") setPaintTab("face", { redraw: false });
  syncModeUi(mode);
  if (announce) setStatus(`${mode.toUpperCase()} SELECT FILTER.`);
  renderAll();
}

function toggleSelectionFilter(mode, options = {}) {
  if (!SELECTABLE_TYPES.includes(mode)) return;
  const wasEnabled = selectionFilterAllows(mode);
  state.selectionFilters[mode] = !selectionFilterAllows(mode);
  if (!activeSelectionFilters().length) state.selectionFilters[mode] = true;
  const clearedSelection = wasEnabled ? clearSelectionForDisabledFilter(mode) : false;
  hideSelectionPickMenu();
  hideSelectionContextMenu();
  state.mode = selectionFilterAllows(mode) ? mode : activeSelectionFilters()[0] || mode;
  if (!state.selected) {
    setToolTab(state.mode === "uv" || state.mode === "group" ? "paint" : "edit", { redraw: false });
    if (state.mode === "uv" || state.mode === "group") setPaintTab("face", { redraw: false });
  }
  syncModeUi(panelModeForSelection());
  const clearedText = clearedSelection ? ` ${mode.toUpperCase()} SELECTION CLEARED.` : "";
  setStatus(`SELECT FILTERS: ${activeSelectionFilters().map((type) => type.toUpperCase()).join(", ")}.${clearedText}`);
  renderAll();
}

function setToolTab(tab, options = {}) {
  if (tab === "paint") tab = "edit";
  els.toolsPanel.dataset.toolTab = tab;
  if (els.toolWindowTitle) els.toolWindowTitle.textContent = TOOL_WINDOW_TITLES[tab] || "Controls";
  document.querySelectorAll(".tool-tab-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.toolTabTarget === tab);
  });
  document.querySelectorAll(".tool-tab-panel").forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.toolTabPanel === tab);
  });
  if (options.redraw !== false) renderAll();
}

function toolWindowOpen() {
  return [els.toolsPanel, els.fileActionsWindow, els.gameInfoWindow].some((windowEl) => windowEl && !windowEl.classList.contains("is-hidden"));
}

function setStandaloneToolWindowVisible(windowEl, visible) {
  if (!windowEl) return;
  windowEl.classList.toggle("is-hidden", !visible);
  windowEl.setAttribute("aria-hidden", visible ? "false" : "true");
}

function openToolWindow(tab = "edit", options = {}) {
  if (!els.toolsPanel) return;
  setToolTab(tab, { redraw: false });
  closeFileWindow({ redraw: false });
  closeGameInfoWindow({ redraw: false });
  els.toolsPanel.classList.remove("is-hidden");
  els.toolsPanel.setAttribute("aria-hidden", "false");
  if (options.focus !== false) {
    const activeTab = els.toolsPanel.querySelector(`.tool-tab-btn[data-tool-tab-target="${tab}"]`);
    activeTab?.focus?.({ preventScroll: true });
  }
  if (options.redraw !== false) renderAll();
}

function closeToolWindow(options = {}) {
  setStandaloneToolWindowVisible(els.toolsPanel, false);
  if (options.redraw !== false) renderAll();
}

function openFileWindow(options = {}) {
  closeToolWindow({ redraw: false });
  closeGameInfoWindow({ redraw: false });
  setStandaloneToolWindowVisible(els.fileActionsWindow, true);
  if (options.focus !== false) els.closeFileWindowBtn?.focus?.({ preventScroll: true });
  if (options.redraw !== false) renderAll();
}

function closeFileWindow(options = {}) {
  setStandaloneToolWindowVisible(els.fileActionsWindow, false);
  if (options.redraw !== false) renderAll();
}

function openGameInfoWindow(options = {}) {
  closeToolWindow({ redraw: false });
  closeFileWindow({ redraw: false });
  setStandaloneToolWindowVisible(els.gameInfoWindow, true);
  if (options.focus !== false) els.closeGameInfoWindowBtn?.focus?.({ preventScroll: true });
  if (options.redraw !== false) renderAll();
}

function closeGameInfoWindow(options = {}) {
  setStandaloneToolWindowVisible(els.gameInfoWindow, false);
  if (options.redraw !== false) renderAll();
}

function closeAnyToolWindow(options = {}) {
  closeToolWindow({ redraw: false });
  closeFileWindow({ redraw: false });
  closeGameInfoWindow({ redraw: false });
  if (options.redraw !== false) renderAll();
}

function setPaintTab(tab, options = {}) {
  document.querySelectorAll(".paint-subtab-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.paintTabTarget === tab);
  });
  document.querySelectorAll(".paint-tab-panel").forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.paintTabPanel === tab);
  });
  if (options.redraw !== false) renderAll();
}

function openAssetLibrary() {
  if (!els.assetLibraryModal) return;
  els.assetLibraryModal.classList.remove("is-hidden");
  updateBitmapAssetGrid();
  loadCurrentShipAssets();
}

function closeAssetLibrary() {
  els.assetLibraryModal?.classList.add("is-hidden");
  renderAll();
}

function openUvProperties() {
  if (!els.uvPropertiesModal) return;
  updateFaceUvTransformControls();
  els.uvPropertiesModal.classList.remove("is-hidden");
}

function closeUvProperties(options = {}) {
  els.uvPropertiesModal?.classList.add("is-hidden");
  if (options.redraw !== false) renderAll();
}

function uvPropertiesOpen() {
  return !!els.uvPropertiesModal && !els.uvPropertiesModal.classList.contains("is-hidden");
}

function closeUvPropertiesOnOutsidePointer(event) {
  if (!uvPropertiesOpen()) return;
  if (els.uvPropertiesModal?.contains(event.target)) return;
  closeUvProperties();
}

function shelfItemIsDecal(item) {
  return item?.asset?.kind === "decal";
}

function selectionContext() {
  const selected = state.selected || null;
  const type = selected?.type || "";
  const face = ["face", "uv", "group"].includes(type) ? selectedFace() : null;
  const edge = type === "edge" ? state.edges.find((item) => item.id === selected.id) || null : null;
  const detail = type === "detail" ? detailById(selected.id) : null;
  const detailGroup = type === "detail" ? selectedDetailSetDetails() : [];
  const vertex = type === "vertex" ? vertexById(selected.id) : null;
  const incidentFaces = vertex ? facesUsingVertex(vertex.id) : [];
  const uvTargets = face ? uniqueFaceList(selectedFacePropertyTargets()) : [];
  const groupTargets = type === "group" ? selectedGroupTargetsForRemoval() : [];
  const shelfItem = selectedBitmapShelfItem();
  return {
    selected,
    type,
    vertex,
    face,
    edge,
    detail,
    detailGroup,
    edgeLoop: selectedEdgeSetEdges(),
    vertexIds: type === "vertexGroup" ? [...state.pick] : [],
    incidentFaces,
    uvTargets,
    groupTargets,
    shelfItem,
    hasShelfImage: !!shelfItem?.img?.naturalWidth,
    shelfIsDecal: shelfItemIsDecal(shelfItem),
    canPasteFaceProperties: !!state.facePropertyClipboard,
    hasVertexBeacon: !!(vertex && hasBeaconAtVertex(vertex.id)),
    mirror: mirrorActionsEnabled()
  };
}

function selectionContextForCandidate(candidate) {
  if (!candidate) return selectionContext();
  const face = ["face", "uv", "group"].includes(candidate.type) ? candidate.face || faceById(candidate.id) : null;
  const group = face ? sharedFaceTextureGroup(face) : [];
  const type = candidate.type === "uv" && group.length > 1 ? "group" : candidate.type;
  const edgeSource = candidate.audit ? renderAuditEdges() : state.edges;
  const edge = type === "edge" ? candidate.edge || edgeSource.find((item) => item.id === candidate.id) || null : null;
  const edgeIds = edge ? selectedEdgeIdSetFor(edge, { audit: candidate.audit, edgeIds: candidate.edgeIds }) : new Set();
  const detail = type === "detail" ? candidate.detail || detailById(candidate.id) : null;
  const detailGroup = detail ? [detail] : [];
  const vertex = type === "vertex" ? candidate.vertex || vertexById(candidate.id) : null;
  const incidentFaces = vertex ? facesUsingVertex(vertex.id) : [];
  const selected = { type, id: candidate.id };
  const shelfItem = selectedBitmapShelfItem();
  return {
    selected,
    type,
    vertex,
    face,
    edge,
    detail,
    detailGroup,
    edgeLoop: edgeSource.filter((item) => edgeIds.has(item.id)),
    vertexIds: candidate.type === "vertexGroup" ? [...(candidate.vertexIds || state.pick)] : [],
    incidentFaces,
    uvTargets: face ? uniqueFaceList(type === "group" ? group : [face]) : [],
    groupTargets: type === "group" ? uniqueFaceList(group) : [],
    shelfItem,
    hasShelfImage: !!shelfItem?.img?.naturalWidth,
    shelfIsDecal: shelfItemIsDecal(shelfItem),
    canPasteFaceProperties: !!state.facePropertyClipboard,
    hasVertexBeacon: !!(vertex && hasBeaconAtVertex(vertex.id)),
    mirror: mirrorActionsEnabled()
  };
}

function selectionContextLabel(ctx = selectionContext()) {
  if (!ctx.selected) return "No Selection";
  if (ctx.type === "vertex" && ctx.vertex) return `Vertex #${ctx.vertex.id}`;
  if (ctx.type === "vertexGroup") return `Vertex Group (${ctx.vertexIds.length || state.pick.length})`;
  if (ctx.type === "edge" && ctx.edge) {
    return ctx.edgeLoop.length > 1 ? `${edgeKindLabel(ctx.edge.kind)} Loop (${ctx.edgeLoop.length})` : `${edgeKindLabel(ctx.edge.kind)} #${ctx.edge.id}`;
  }
  if (ctx.type === "detail" && ctx.detailGroup?.length > 1) return `Surface Detail Group (${ctx.detailGroup.length})`;
  if (ctx.type === "detail" && ctx.detail) return `${detailTypeLabel(ctx.detail.type)} #${ctx.detail.id}`;
  if (ctx.type === "group" && ctx.face) return `Face Group (${ctx.uvTargets.length || ctx.groupTargets.length})`;
  if (ctx.type === "uv" && ctx.face) return `UV Face #${ctx.face.id}`;
  if (ctx.face) return `Face #${ctx.face.id}`;
  return `${ctx.type.toUpperCase()} #${ctx.selected.id}`;
}

function objectPropertyValueText(value) {
  return value == null || value === "" ? "none" : String(value);
}

function appendObjectPropertyRow(parent, labelText, valueText) {
  const row = document.createElement("div");
  row.className = "object-property-row";
  row.dataset.controlRole = "property";
  const label = document.createElement("span");
  label.className = "object-property-label";
  label.textContent = labelText;
  const value = document.createElement("span");
  value.className = "object-property-value";
  value.textContent = objectPropertyValueText(valueText);
  row.append(label, value);
  parent.appendChild(row);
}

function appendObjectNumberProperty(parent, labelText, key, value, options = {}) {
  const row = document.createElement("label");
  row.className = "object-property-row object-property-control";
  row.dataset.controlRole = "property";
  const label = document.createElement("span");
  label.className = "object-property-label";
  label.textContent = labelText;
  const input = document.createElement("input");
  input.type = "number";
  input.step = options.step ?? "1";
  if (options.min != null) input.min = String(options.min);
  if (options.max != null) input.max = String(options.max);
  input.value = String(value ?? 0);
  input.disabled = !!options.disabled;
  input.dataset.objectProperty = key;
  row.append(label, input);
  parent.appendChild(row);
}

function appendObjectRangeProperty(parent, labelText, key, value, options = {}) {
  const row = document.createElement("label");
  row.className = "object-property-row object-property-control";
  row.dataset.controlRole = "property";
  const label = document.createElement("span");
  label.className = "object-property-label";
  label.textContent = labelText;
  const input = document.createElement("input");
  input.type = "range";
  input.min = String(options.min ?? 0);
  input.max = String(options.max ?? 1);
  input.step = String(options.step ?? .01);
  input.value = String(value ?? 0);
  input.disabled = !!options.disabled;
  input.dataset.objectProperty = key;
  row.append(label, input);
  parent.appendChild(row);
}

function appendObjectColorProperty(parent, labelText, key, value, options = {}) {
  const row = document.createElement("label");
  row.className = "object-property-row object-property-control";
  row.dataset.controlRole = "property";
  const label = document.createElement("span");
  label.className = "object-property-label";
  label.textContent = labelText;
  const input = document.createElement("input");
  input.type = "color";
  input.value = optionalHexColor(value) || "#101915";
  input.disabled = !!options.disabled;
  input.dataset.objectProperty = key;
  row.append(label, input);
  parent.appendChild(row);
}

function appendObjectCheckboxProperty(parent, labelText, key, checked, options = {}) {
  const row = document.createElement("label");
  row.className = "object-property-row object-property-control object-property-checkbox";
  row.dataset.controlRole = "property";
  const label = document.createElement("span");
  label.className = "object-property-label";
  label.textContent = labelText;
  const input = document.createElement("input");
  input.type = "checkbox";
  input.checked = !!checked;
  input.disabled = !!options.disabled;
  input.dataset.objectProperty = key;
  row.append(label, input);
  parent.appendChild(row);
}

function appendObjectSelectProperty(parent, labelText, key, value, options) {
  const row = document.createElement("label");
  row.className = "object-property-row object-property-control";
  row.dataset.controlRole = "property";
  const label = document.createElement("span");
  label.className = "object-property-label";
  label.textContent = labelText;
  const select = document.createElement("select");
  select.dataset.objectProperty = key;
  for (const option of options) {
    const item = document.createElement("option");
    item.value = option.value;
    item.textContent = option.label;
    select.appendChild(item);
  }
  select.value = value || options[0]?.value || "";
  row.append(label, select);
  parent.appendChild(row);
}

function windowBaseMode(detail) {
  if (detail?.baseTransparent === true) return "transparent";
  return optionalHexColor(detail?.color) ? "solid" : "default";
}

function windowGlintIsDefault(detail) {
  return !optionalHexColor(detail?.glintDark) && !optionalHexColor(detail?.glintBright);
}

function appendObjectProperties(parent, ctx) {
  if (ctx.type === "vertexGroup") {
    appendObjectPropertyRow(parent, "Vertices", ctx.vertexIds.length);
    appendObjectPropertyRow(parent, "Ids", ctx.vertexIds.map((id) => `#${id}`).join(" "));
    appendObjectPropertyRow(parent, "Can Make Face", ctx.vertexIds.length >= 3 ? "yes" : "no");
    appendObjectPropertyRow(parent, "Can Make Line", ctx.vertexIds.length >= 2 ? "yes" : "no");
    return;
  }
  if (ctx.type === "vertex" && ctx.vertex) {
    appendObjectNumberProperty(parent, "X", "vertex-x", round(ctx.vertex.x), { disabled: ctx.vertex.center });
    appendObjectNumberProperty(parent, "Y", "vertex-y", round(ctx.vertex.y));
    appendObjectNumberProperty(parent, "Z", "vertex-z", round(ctx.vertex.z));
    appendObjectPropertyRow(parent, "Mirror", ctx.vertex.mirrorId ? `#${ctx.vertex.mirrorId}` : ctx.vertex.center ? "centre" : "none");
    appendObjectPropertyRow(parent, "Beacon", ctx.hasVertexBeacon ? "yes" : "no");
    return;
  }
  if (ctx.type === "edge" && ctx.edge) {
    appendObjectSelectProperty(parent, "Kind", "edge-kind", ctx.edge.kind || "edge", [
      { value: "edge", label: "Edge" },
      { value: "stick", label: "Stick" },
      { value: EDGE_KIND_HIDDEN, label: "Hidden Edge" }
    ]);
    appendObjectPropertyRow(parent, "Vertices", `#${ctx.edge.a} -> #${ctx.edge.b}`);
    appendObjectPropertyRow(parent, "Lines", ctx.edgeLoop.length || 1);
    appendObjectPropertyRow(parent, "Mirrored", ctx.edge.mirrored ? "yes" : "no");
    return;
  }
  if (ctx.type === "detail" && ctx.detail) {
    if (ctx.detailGroup?.length > 1) {
      appendObjectPropertyRow(parent, "Lines", ctx.detailGroup.length);
      appendObjectPropertyRow(parent, "Ids", ctx.detailGroup.map((detail) => `#${detail.id}`).join(" "));
    }
    appendObjectPropertyRow(parent, "Type", detailTypeLabel(ctx.detail.type));
    appendObjectPropertyRow(parent, "Face", ctx.detail.faceId != null ? `#${ctx.detail.faceId}` : "none");
    appendObjectPropertyRow(parent, "Vertex", ctx.detail.vertexId != null ? `#${ctx.detail.vertexId}` : "none");
    appendObjectRangeProperty(parent, "Inset", "detail-inset", ctx.detail.inset ?? 0.45, { min: .15, max: .9, step: .01, disabled: !ctx.detail.faceId });
    if (ctx.detail.type === "window") {
      const baseMode = windowBaseMode(ctx.detail);
      appendObjectSelectProperty(parent, "Base", "detail-base-mode", baseMode, [
        { value: "default", label: "Default" },
        { value: "solid", label: "Solid Colour" },
        { value: "transparent", label: "Transparent" }
      ]);
      appendObjectColorProperty(parent, "Colour", "detail-color", ctx.detail.color || "#000000", { disabled: baseMode !== "solid" });
      const defaultGlint = windowGlintIsDefault(ctx.detail);
      appendObjectCheckboxProperty(parent, "Default Glint", "detail-glint-default", defaultGlint);
      appendObjectColorProperty(parent, "Glint Dark", "detail-glint-dark", ctx.detail.glintDark || DEFAULT_WINDOW_GLINT_DARK, { disabled: defaultGlint });
      appendObjectColorProperty(parent, "Glint Bright", "detail-glint-bright", ctx.detail.glintBright || DEFAULT_WINDOW_GLINT_BRIGHT, { disabled: defaultGlint });
    } else {
      appendObjectColorProperty(parent, "Colour", "detail-color", ctx.detail.color || "#101915");
    }
    return;
  }
  if (ctx.face) {
    const n = faceNormal(ctx.face);
    appendObjectPropertyRow(parent, "Face", `#${ctx.face.id}`);
    appendObjectPropertyRow(parent, "Vertices", ctx.face.verts.map((id) => `#${id}`).join(" "));
    if (state.faceSplitPick?.faceId === ctx.face.id) {
      appendObjectPropertyRow(parent, "Split Pick", state.faceSplitPick.vertexIds.map((id) => `#${id}`).join(" ") || "none");
    }
    appendObjectPropertyRow(parent, "Normal", `X ${round(n.x, 2)} Y ${round(n.y, 2)} Z ${round(n.z, 2)}`);
    appendObjectPropertyRow(parent, "UV", faceUvTypeInfo(ctx.face).short);
    appendObjectPropertyRow(parent, "Targets", ctx.uvTargets.length || 1);
    appendObjectPropertyRow(parent, "Tiles", uvTileSummaryText(ctx.uvTargets.length ? ctx.uvTargets : [ctx.face]) || "none");
  }
}

function appendObjectQuickProperties(parent, ctx) {
  if (ctx.type === "vertexGroup") {
    appendObjectPropertyRow(parent, "Vertices", ctx.vertexIds.length);
    appendObjectPropertyRow(parent, "Ids", ctx.vertexIds.map((id) => `#${id}`).join(" "));
    appendObjectPropertyRow(parent, "Face", ctx.vertexIds.length >= 3 ? "available" : "needs 3");
    return;
  }
  if (ctx.type === "vertex" && ctx.vertex) {
    appendObjectPropertyRow(parent, "X", round(ctx.vertex.x));
    appendObjectPropertyRow(parent, "Y", round(ctx.vertex.y));
    appendObjectPropertyRow(parent, "Z", round(ctx.vertex.z));
    appendObjectPropertyRow(parent, "Mirror", ctx.vertex.mirrorId ? `#${ctx.vertex.mirrorId}` : ctx.vertex.center ? "centre" : "none");
    appendObjectPropertyRow(parent, "Beacon", ctx.hasVertexBeacon ? "yes" : "no");
    return;
  }
  if (ctx.type === "edge" && ctx.edge) {
    appendObjectPropertyRow(parent, "Kind", edgeKindLabel(ctx.edge.kind));
    appendObjectPropertyRow(parent, "Vertices", `#${ctx.edge.a} -> #${ctx.edge.b}`);
    appendObjectPropertyRow(parent, "Lines", ctx.edgeLoop.length || 1);
    appendObjectPropertyRow(parent, "Mirrored", ctx.edge.mirrored ? "yes" : "no");
    return;
  }
  if (ctx.type === "detail" && ctx.detail) {
    if (ctx.detailGroup?.length > 1) appendObjectPropertyRow(parent, "Lines", ctx.detailGroup.length);
    appendObjectPropertyRow(parent, "Type", detailTypeLabel(ctx.detail.type));
    appendObjectPropertyRow(parent, "Face", ctx.detail.faceId != null ? `#${ctx.detail.faceId}` : "none");
    appendObjectPropertyRow(parent, "Vertex", ctx.detail.vertexId != null ? `#${ctx.detail.vertexId}` : "none");
    appendObjectPropertyRow(parent, "Inset", ctx.detail.inset == null ? "none" : round(ctx.detail.inset, 2));
    return;
  }
  if (ctx.face) {
    appendObjectPropertyRow(parent, "Face", `#${ctx.face.id}`);
    appendObjectPropertyRow(parent, "Vertices", ctx.face.verts.map((id) => `#${id}`).join(" "));
    appendObjectPropertyRow(parent, "UV", faceUvTypeInfo(ctx.face).short);
    appendObjectPropertyRow(parent, "Targets", ctx.uvTargets.length || 1);
  }
}

function renderSelectedObjectProperties(ctx = selectionContext()) {
  const panel = els.objectPropertiesPanel;
  if (!panel) return;
  els.toolsPanel?.setAttribute("data-has-selection", ctx.selected ? "true" : "false");
  panel.replaceChildren();
  panel.classList.toggle("is-empty", !ctx.selected);

  const header = document.createElement("div");
  header.className = "object-properties-head";
  const title = document.createElement("h2");
  title.textContent = `Controls: ${selectionContextLabel(ctx)}`;
  header.appendChild(title);
  panel.appendChild(header);

  if (!ctx.selected) {
    const empty = document.createElement("div");
    empty.className = "object-properties-empty";
    empty.textContent = "No selection";
    panel.appendChild(empty);
    return;
  }

  const controls = document.createElement("div");
  controls.className = "object-control-list";
  appendObjectProperties(controls, ctx);

  const commands = visibleSelectionCommands(ctx)
    .filter((command) => !command.separator)
    .filter((command) => command.id !== "properties");
  for (const command of commands) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "object-command-control";
    button.dataset.objectAction = command.id;
    button.dataset.controlRole = "action";
    button.textContent = command.label;
    button.disabled = !selectionCommandEnabled(command, ctx);
    controls.appendChild(button);
  }
  panel.appendChild(controls);
}

function showSelectedObjectProperties(ctx = selectionContext()) {
  if (ctx.type === "vertex" || ctx.type === "vertexGroup" || ctx.type === "face" || ctx.type === "uv" || ctx.type === "group" || ctx.type === "edge" || ctx.type === "detail") {
    openToolWindow("edit", { focus: false });
    setStatus(`${selectionContextLabel(ctx).toUpperCase()} CONTROLS OPEN.`);
  }
}

function selectedContextTargetTypes(ctx) {
  if (!ctx?.type) return [];
  const types = [ctx.type];
  if (ctx.face && !types.includes("face-backed")) types.push("face-backed");
  if (ctx.type === "detail" && ctx.detailGroup?.length > 1) types.push("detailGroup");
  return types;
}

const SELECTION_COMMANDS = [
  {
    id: "properties",
    label: "Properties",
    targetTypes: ["vertex", "vertexGroup", "face", "edge", "detail", "uv", "group"],
    enabled: (ctx) => !!ctx.selected,
    run: showSelectedObjectProperties
  },
  { separator: true },
  {
    id: "face-flip",
    label: "Flip Face",
    targetTypes: ["face"],
    enabled: (ctx) => !!ctx.face,
    run: () => flipSelectedFace()
  },
  {
    id: "face-orient-uv",
    label: "Face UV To View",
    targetTypes: ["face", "uv"],
    enabled: (ctx) => !!ctx.face,
    run: () => orientFaceToView()
  },
  {
    id: "face-align-vertices-view",
    label: "Align Vertices To View",
    targetTypes: ["face"],
    enabled: (ctx) => !!ctx.face && ctx.face.verts.length >= 3,
    run: (ctx) => alignFaceVerticesToViewDepth(ctx.face)
  },
  {
    id: "face-select-vertices",
    label: "Select Face Vertices",
    targetTypes: ["face", "uv"],
    enabled: (ctx) => !!ctx.face,
    run: (ctx) => setVertexGroupFromFace(ctx.face)
  },
  {
    id: "face-append-picks",
    label: "Add Vertex Group To Face",
    targetTypes: ["face", "vertexGroup"],
    visible: () => state.pick.length > 0 && !state.faceSplitPick,
    enabled: (ctx) => !!ctx.face && state.pick.length > 0,
    run: () => appendPickedToSelectedFace()
  },
  {
    id: "face-remove-picks",
    label: "Remove Vertex Group From Face",
    targetTypes: ["face", "vertexGroup"],
    visible: () => state.pick.length > 0 && !state.faceSplitPick,
    enabled: (ctx) => !!ctx.face && state.pick.length > 0,
    run: () => removePickedFromSelectedFace()
  },
  {
    id: "face-split-picked",
    label: "Split Face Along Vertices",
    targetTypes: ["face"],
    enabled: (ctx) => !!ctx.face,
    run: (ctx) => splitSelectedFaceAlongPickedVertices({ face: ctx.face })
  },
  {
    id: "face-add-window",
    label: "Add Window",
    targetTypes: ["face"],
    enabled: (ctx) => !!ctx.face,
    run: () => addDetail("window")
  },
  {
    id: "face-add-engine",
    label: "Add Engine",
    targetTypes: ["face"],
    enabled: (ctx) => !!ctx.face,
    run: () => addDetail("engine")
  },
  {
    id: "face-add-panel",
    label: "Add Surface Detail",
    targetTypes: ["face"],
    enabled: (ctx) => !!ctx.face,
    run: () => addDetail("panel")
  },
  {
    id: "face-add-surface-polygon",
    label: "Add Surface Polygon",
    targetTypes: ["face"],
    enabled: (ctx) => !!ctx.face,
    run: () => prepareSurfaceInsertPreview()
  },
  {
    id: "face-extrude",
    label: "Extrude Face",
    targetTypes: ["face"],
    enabled: (ctx) => !!ctx.face,
    run: () => prepareFaceExtrudePreview()
  },
  {
    id: "face-point-extrude",
    label: "Point Extrude Face",
    targetTypes: ["face"],
    enabled: (ctx) => !!ctx.face,
    run: () => prepareFaceExtrudePreview("point")
  },
  {
    id: "face-apply-shelf",
    label: "Apply Selected Asset",
    targetTypes: ["face", "uv", "group"],
    visible: (ctx) => !!ctx.shelfItem && !ctx.shelfIsDecal,
    enabled: (ctx) => !!ctx.face && !!ctx.shelfItem && !ctx.shelfIsDecal,
    run: () => applyShelfBitmapToSelectedFace({ orientToView: true })
  },
  {
    id: "face-add-decal",
    label: "Add Selected Decal",
    targetTypes: ["face", "uv"],
    visible: (ctx) => !!ctx.shelfItem && ctx.shelfIsDecal,
    enabled: (ctx) => !!ctx.face && !!ctx.shelfItem && ctx.shelfIsDecal,
    run: () => applyShelfBitmapAsDecal()
  },
  { separator: true },
  {
    id: "edge-split",
    label: "Split + Triangulate",
    targetTypes: ["edge"],
    enabled: (ctx) => !!ctx.edge,
    run: () => splitSelectedLine()
  },
  {
    id: "edge-normal",
    label: "Convert To Edge",
    targetTypes: ["edge"],
    enabled: (ctx) => !!ctx.edge,
    run: () => convertSelectedEdgeKind("edge")
  },
  {
    id: "edge-stick",
    label: "Convert To Stick",
    targetTypes: ["edge"],
    enabled: (ctx) => !!ctx.edge,
    run: () => convertSelectedEdgeKind("stick")
  },
  {
    id: "edge-hidden",
    label: "Convert To Hidden Edge",
    targetTypes: ["edge"],
    enabled: (ctx) => !!ctx.edge,
    run: () => convertSelectedEdgeKind(EDGE_KIND_HIDDEN)
  },
  {
    id: "edge-entrance",
    label: "Convert To Station Entrance",
    targetTypes: ["edge"],
    enabled: (ctx) => !!ctx.edge,
    run: () => convertSelectedEdgeToDetail(DETAIL_TYPE_STATION_ENTRANCE)
  },
  {
    id: "edge-window",
    label: "Convert To Window",
    targetTypes: ["edge"],
    enabled: (ctx) => !!ctx.edge,
    run: () => convertSelectedEdgeToDetail("window")
  },
  {
    id: "edge-engine",
    label: "Convert To Engine",
    targetTypes: ["edge"],
    enabled: (ctx) => !!ctx.edge,
    run: () => convertSelectedEdgeToDetail("engine")
  },
  {
    id: "edge-panel",
    label: "Convert To Surface Detail",
    targetTypes: ["edge"],
    enabled: (ctx) => !!ctx.edge,
    run: () => convertSelectedEdgeToDetail("panel")
  },
  {
    id: "edge-extrude-loop",
    label: "Extrude Face From Edge",
    targetTypes: ["edge"],
    enabled: (ctx) => !!ctx.edge,
    run: () => prepareFaceExtrudePreview()
  },
  {
    id: "detail-select-connected",
    label: "Select Connected Surface Details",
    targetTypes: ["detail"],
    visible: (ctx) => !!ctx.detail && detailIsSurfaceLine(ctx.detail),
    enabled: (ctx) => !!ctx.detail && surfaceDetailComponentFrom(ctx.detail).length > 1,
    run: (ctx) => selectConnectedSurfaceDetails(ctx.detail)
  },
  {
    id: "detail-group-clear",
    label: "Clear Surface Detail Group",
    targetTypes: ["detailGroup"],
    enabled: (ctx) => ctx.detailGroup?.length > 1,
    run: () => clearSurfaceDetailGroup()
  },
  {
    id: "detail-edge",
    label: "Convert To Edge",
    targetTypes: ["detail"],
    enabled: (ctx) => !!ctx.detail && (ctx.detailGroup?.length ? ctx.detailGroup : [ctx.detail]).some((detail) => detailEdgePairsForConversion(detail).length > 0),
    run: () => convertSelectedDetailToEdges("edge")
  },
  {
    id: "detail-stick",
    label: "Convert To Stick",
    targetTypes: ["detail"],
    enabled: (ctx) => !!ctx.detail && (ctx.detailGroup?.length ? ctx.detailGroup : [ctx.detail]).some((detail) => detailEdgePairsForConversion(detail).length > 0),
    run: () => convertSelectedDetailToEdges("stick")
  },
  { separator: true },
  {
    id: "uv-copy-props",
    label: "Copy Face Props",
    targetTypes: ["face", "uv", "group"],
    enabled: (ctx) => !!ctx.face,
    run: () => copySelectedFaceProperties()
  },
  {
    id: "uv-paste-props",
    label: "Paste Face Props",
    targetTypes: ["face", "uv", "group"],
    enabled: (ctx) => !!ctx.face && ctx.canPasteFaceProperties,
    run: () => pasteFacePropertiesToSelection()
  },
  {
    id: "uv-reset",
    label: "Reset UV Transform",
    targetTypes: ["uv", "group"],
    enabled: (ctx) => !!ctx.uvTargets.length,
    run: () => resetSelectedFaceUvTransform()
  },
  {
    id: "face-clear-paint",
    label: "Clear Face Paint",
    targetTypes: ["face", "uv"],
    enabled: (ctx) => !!ctx.face,
    run: () => clearSelectedFacePaint()
  },
  {
    id: "group-remove-uv",
    label: "Remove Group UV",
    targetTypes: ["group"],
    enabled: (ctx) => ctx.groupTargets.length > 1,
    run: () => removeSelectedFaceGroupUv()
  },
  {
    id: "group-clear",
    label: "Clear Group Selection",
    targetTypes: ["group"],
    enabled: (ctx) => !!ctx.groupTargets.length || state.selectedFaceIds.size > 0,
    run: () => clearFaceGroup()
  },
  { separator: true },
  {
    id: "vertex-group-create-face",
    label: "Create Face From Vertices",
    targetTypes: ["vertexGroup"],
    enabled: (ctx) => ctx.vertexIds.length >= 3,
    run: () => createFaceFromVertexGroup()
  },
  {
    id: "vertex-group-create-edge",
    label: "Create Edge From First Two",
    targetTypes: ["vertexGroup"],
    enabled: (ctx) => ctx.vertexIds.length >= 2,
    run: () => createLineFromVertexGroup("edge")
  },
  {
    id: "vertex-group-create-stick",
    label: "Create Stick From First Two",
    targetTypes: ["vertexGroup"],
    enabled: (ctx) => ctx.vertexIds.length >= 2,
    run: () => createLineFromVertexGroup("stick")
  },
  {
    id: "vertex-group-clear",
    label: "Clear Vertex Group",
    targetTypes: ["vertexGroup"],
    enabled: (ctx) => ctx.vertexIds.length > 0,
    run: () => clearVertexGroup()
  },
  { separator: true },
  {
    id: "vertex-add-beacon",
    label: "Add Beacon",
    targetTypes: ["vertex"],
    visible: (ctx) => !ctx.hasVertexBeacon,
    enabled: (ctx) => !!ctx.vertex,
    run: () => addBeaconDetail({ stayInVertexMode: true })
  },
  {
    id: "vertex-remove-beacon",
    label: "Remove Beacon",
    targetTypes: ["vertex"],
    visible: (ctx) => ctx.hasVertexBeacon,
    enabled: (ctx) => !!ctx.vertex,
    run: () => removeBeaconAtSelectedVertex()
  },
  {
    id: "vertex-select-adjacent-faces",
    label: "Select Adjacent Faces",
    targetTypes: ["vertex"],
    enabled: (ctx) => !!ctx.vertex && ctx.incidentFaces.length > 0,
    run: (ctx) => selectAdjacentFacesForVertex(ctx.vertex)
  },
  { separator: true },
  {
    id: "selection-delete",
    label: "Delete Selection",
    targetTypes: ["vertex", "face", "edge", "detail"],
    enabled: (ctx) => !!ctx.selected && ["vertex", "face", "edge", "detail"].includes(ctx.type),
    run: () => deleteSelected()
  }
];

function selectionCommandApplies(command, ctx) {
  if (command.separator) return false;
  const targetTypes = command.targetTypes || [];
  return selectedContextTargetTypes(ctx).some((type) => targetTypes.includes(type));
}

function selectionCommandVisible(command, ctx) {
  if (!selectionCommandApplies(command, ctx)) return false;
  return command.visible ? command.visible(ctx) : true;
}

function selectionCommandEnabled(command, ctx) {
  return command.enabled ? command.enabled(ctx) : true;
}

function visibleSelectionCommands(ctx = selectionContext()) {
  return SELECTION_COMMANDS.filter((command) => command.separator || selectionCommandVisible(command, ctx));
}

function renderSelectionPickMenu(candidates, options = {}) {
  const menu = els.selectionPickMenu;
  if (!menu || !candidates.length) return false;
  state.selectionPickCandidates = candidates;
  state.selectionPickHover = null;
  menu.replaceChildren();

  const title = document.createElement("div");
  title.className = "selection-menu-title";
  title.textContent = options.afterPick === "properties" ? "Object Properties" : "Select Object";
  menu.appendChild(title);

  candidates.forEach((candidate, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.setAttribute("role", "menuitem");
    button.dataset.pickIndex = String(index);
    const label = document.createElement("span");
    label.className = "selection-pick-label";
    label.textContent = selectionPickCandidateLabel(candidate);
    const meta = document.createElement("span");
    meta.className = "selection-pick-meta";
    meta.textContent = selectionPickCandidateMeta(candidate);
    button.append(label, meta);
    menu.appendChild(button);
  });

  const divider = document.createElement("div");
  divider.className = "selection-context-menu-divider";
  menu.appendChild(divider);
  const clearButton = document.createElement("button");
  clearButton.type = "button";
  clearButton.setAttribute("role", "menuitem");
  clearButton.dataset.pickAction = "clear-selection";
  clearButton.className = "selection-pick-clear-btn";
  clearButton.textContent = "Clear Selection";
  clearButton.disabled = !state.selected && !state.pick.length && !state.selectedFaceIds.size && !state.selectedEdgeIds.size && !state.selectedDetailIds.size;
  menu.appendChild(clearButton);
  return true;
}

function hideSelectionPickMenu(options = {}) {
  const menu = els.selectionPickMenu;
  if (!menu) return;
  cancelSelectionPickHoverClear();
  const hadHover = !!state.selectionPickHover;
  menu.classList.add("is-hidden");
  menu.replaceChildren();
  state.selectionPickCandidates = [];
  state.selectionPickHover = null;
  state.selectionPickOptions = {};
  if (hadHover && options.redraw !== false) renderMain();
}

function selectionPickMenuOpen() {
  return !!els.selectionPickMenu && !els.selectionPickMenu.classList.contains("is-hidden");
}

function positionFloatingSelectionMenu(menu, clientX, clientY) {
  const stack = els.mainPreviewStack;
  if (!menu || !stack) return false;
  const rect = stack.getBoundingClientRect();
  const fallbackX = rect.left + rect.width * .5;
  const fallbackY = rect.top + rect.height * .5;
  const targetX = Number.isFinite(clientX) ? clientX : fallbackX;
  const targetY = Number.isFinite(clientY) ? clientY : fallbackY;
  const maxX = Math.max(8, rect.width - menu.offsetWidth - 8);
  const maxY = Math.max(8, rect.height - menu.offsetHeight - 8);
  menu.style.left = `${clamp(targetX - rect.left, 8, maxX)}px`;
  menu.style.top = `${clamp(targetY - rect.top, 8, maxY)}px`;
  return true;
}

function positionSelectionContextCascade(index) {
  const stack = els.mainPreviewStack;
  const pickMenu = els.selectionPickMenu;
  const menu = els.selectionContextMenu;
  const button = pickMenu?.querySelector(`[data-pick-index="${index}"]`);
  if (!stack || !pickMenu || !menu || !button) return false;
  const stackRect = stack.getBoundingClientRect();
  const pickRect = pickMenu.getBoundingClientRect();
  const buttonRect = button.getBoundingClientRect();
  const overlap = 1;
  const maxX = Math.max(8, stackRect.width - menu.offsetWidth - 8);
  const maxY = Math.max(8, stackRect.height - menu.offsetHeight - 8);
  const rightX = pickRect.right - stackRect.left - overlap;
  const leftX = pickRect.left - stackRect.left - menu.offsetWidth + overlap;
  const left = rightX <= maxX ? rightX : leftX;
  const top = buttonRect.top - stackRect.top - 5;
  menu.style.left = `${clamp(left, 8, maxX)}px`;
  menu.style.top = `${clamp(top, 8, maxY)}px`;
  return true;
}

function openSelectionPickCascade(index, options = {}) {
  const candidate = state.selectionPickCandidates[index] || null;
  const menu = els.selectionContextMenu;
  if (!candidate || !menu) {
    hideSelectionContextMenu();
    return false;
  }
  const ctx = selectionContextForCandidate(candidate);
  if (!renderSelectionContextMenu(ctx, { quickProperties: true, pickIndex: index })) {
    hideSelectionContextMenu();
    return false;
  }
  menu.classList.add("is-cascade");
  menu.classList.remove("is-hidden");
  positionSelectionContextCascade(index);
  if (options.focusFirstAction) {
    const first = menu.querySelector("button:not(:disabled)");
    first?.focus?.({ preventScroll: true });
  }
  return true;
}

function openSelectionPickMenuAt(clientX, clientY, candidates, options = {}) {
  const menu = els.selectionPickMenu;
  if (!menu || !renderSelectionPickMenu(candidates, options)) {
    hideSelectionPickMenu();
    return false;
  }
  state.selectionPickOptions = options;
  hideSelectionContextMenu();
  menu.classList.remove("is-hidden");
  positionFloatingSelectionMenu(menu, clientX, clientY);
  const first = menu.querySelector("button");
  first?.focus?.({ preventScroll: true });
  if (options.afterPick !== "context") setSelectionPickHover(0);
  return true;
}

function setSelectionPickHover(index) {
  cancelSelectionPickHoverClear();
  const candidate = state.selectionPickCandidates[index] || null;
  if (state.selectionPickHover?.key === candidate?.key) return;
  state.selectionPickHover = candidate;
  renderMain();
}

function cancelSelectionPickHoverClear() {
  if (!state.selectionPickHoverClearTimer) return;
  window.clearTimeout(state.selectionPickHoverClearTimer);
  state.selectionPickHoverClearTimer = null;
}

function clearSelectionPickHover(options = {}) {
  cancelSelectionPickHoverClear();
  const hadHover = !!state.selectionPickHover;
  state.selectionPickHover = null;
  if (hadHover && options.redraw !== false) renderMain();
}

function scheduleSelectionPickHoverClear(delay = 160) {
  cancelSelectionPickHoverClear();
  state.selectionPickHoverClearTimer = window.setTimeout(() => {
    state.selectionPickHoverClearTimer = null;
    clearSelectionPickHover();
  }, delay);
}

function runSelectionPick(index) {
  const candidate = state.selectionPickCandidates[index] || null;
  if (!candidate) return;
  const options = state.selectionPickOptions || {};
  if (options.afterPick === "context") {
    setSelectionPickHover(index);
    promoteSelectionPickToProperties(index);
    return;
  }
  runSelectionAfterPick(selectSelectionCandidate(candidate, options), options);
}

function promoteSelectionPickToProperties(index = null) {
  const candidate = Number.isInteger(index)
    ? state.selectionPickCandidates[index] || null
    : state.selectionPickHover || state.selectionPickCandidates[0] || null;
  if (!candidate) return false;
  const options = state.selectionPickOptions || {};
  const selected = selectSelectionCandidate(candidate, { ...options, keepPickMenu: false });
  if (!selected) return false;
  hideSelectionContextMenu();
  showSelectedObjectProperties(selectionContext());
  return true;
}

function renderSelectionContextMenu(ctx = selectionContext(), options = {}) {
  const menu = els.selectionContextMenu;
  if (!menu || !ctx.selected) return false;
  menu.replaceChildren();
  if (options.pickIndex == null) delete menu.dataset.pickIndex;
  else menu.dataset.pickIndex = String(options.pickIndex);

  const title = document.createElement("div");
  title.className = "selection-menu-title";
  title.textContent = selectionContextLabel(ctx);
  menu.appendChild(title);

  if (options.quickProperties) {
    const properties = document.createElement("div");
    properties.className = "selection-context-properties";
    appendObjectQuickProperties(properties, ctx);
    menu.appendChild(properties);
  }

  let rendered = 0;
  let pendingDivider = !!options.quickProperties;
  for (const command of visibleSelectionCommands(ctx)) {
    if (command.separator) {
      if (rendered) pendingDivider = true;
      continue;
    }
    if (pendingDivider) {
      const divider = document.createElement("div");
      divider.className = "selection-context-menu-divider";
      menu.appendChild(divider);
      pendingDivider = false;
    }
    const button = document.createElement("button");
    button.type = "button";
    button.setAttribute("role", "menuitem");
    button.dataset.commandId = command.id;
    button.textContent = command.label;
    button.disabled = !selectionCommandEnabled(command, ctx);
    menu.appendChild(button);
    rendered += 1;
  }
  return rendered > 0 || !!options.quickProperties;
}

function hideSelectionContextMenu() {
  const menu = els.selectionContextMenu;
  if (!menu) return;
  menu.classList.add("is-hidden");
  menu.classList.remove("is-cascade");
  delete menu.dataset.pickIndex;
  menu.replaceChildren();
}

function selectionContextMenuOpen() {
  return !!els.selectionContextMenu && !els.selectionContextMenu.classList.contains("is-hidden");
}

function openSelectionContextMenuAt(clientX, clientY, ctx = selectionContext()) {
  const menu = els.selectionContextMenu;
  if (!menu || !renderSelectionContextMenu(ctx)) {
    hideSelectionContextMenu();
    return false;
  }
  hideSelectionPickMenu();
  menu.classList.remove("is-cascade");
  menu.classList.remove("is-hidden");
  positionFloatingSelectionMenu(menu, clientX, clientY);
  const first = menu.querySelector("button:not(:disabled)");
  first?.focus?.({ preventScroll: true });
  return true;
}

function runSelectionContextCommand(commandId) {
  const cascadeIndexText = els.selectionContextMenu?.dataset.pickIndex;
  const cascadeIndex = cascadeIndexText == null || cascadeIndexText === "" ? NaN : Number(cascadeIndexText);
  if (Number.isInteger(cascadeIndex)) {
    const candidate = state.selectionPickCandidates[cascadeIndex] || null;
    if (candidate) selectSelectionCandidate(candidate, { ...(state.selectionPickOptions || {}) });
  }
  const command = SELECTION_COMMANDS.find((item) => item.id === commandId);
  const ctx = selectionContext();
  if (!command || !selectionCommandVisible(command, ctx) || !selectionCommandEnabled(command, ctx)) {
    hideSelectionPickMenu();
    hideSelectionContextMenu();
    return;
  }
  hideSelectionPickMenu();
  hideSelectionContextMenu();
  command.run(ctx);
}

function refreshAfterObjectPropertyEdit() {
  updateSliders();
  updateDetailControls();
  renderMain();
  updateExport();
  scheduleGamePreviewSync();
}

function handleObjectPropertyInput(event) {
  const control = event.target?.closest?.("[data-object-property]");
  if (!control) return;
  const key = control.dataset.objectProperty;
  if (key?.startsWith("vertex-")) {
    const vertex = state.selected?.type === "vertex" ? vertexById(state.selected.id) : null;
    if (!vertex) return;
    const axis = key.slice("vertex-".length);
    const value = Number(control.value);
    if (!Number.isFinite(value)) return;
    setVertex(
      vertex,
      axis === "x" ? value : vertex.x,
      axis === "y" ? value : vertex.y,
      axis === "z" ? value : vertex.z
    );
    refreshAfterObjectPropertyEdit();
    return;
  }
  if (key === "detail-inset") {
    const details = selectedDetailSetDetails().filter((detail) => detail.faceId);
    if (!details.length) return;
    const inset = Number(control.value);
    if (!Number.isFinite(inset)) return;
    for (const detail of details) {
      detail.inset = inset;
      patchMirroredDetail(detail, { inset });
    }
    refreshAfterObjectPropertyEdit();
    return;
  }
  if (key === "detail-color") {
    const details = selectedDetailSetDetails();
    if (!details.length) return;
    for (const detail of details) {
      detail.color = control.value;
      patchMirroredDetail(detail, { color: control.value });
    }
    refreshAfterObjectPropertyEdit();
    return;
  }
  if (key === "detail-base-mode") {
    const details = selectedDetailSetDetails().filter((detail) => detail.type === "window");
    if (!details.length) return;
    const mode = control.value === "solid" || control.value === "transparent" ? control.value : "default";
    for (const detail of details) {
      const mirror = mirroredDetailOf(detail);
      if (mode === "transparent") {
        detail.baseTransparent = true;
        patchMirroredDetail(detail, { baseTransparent: true });
      } else {
        delete detail.baseTransparent;
        if (mirror) delete mirror.baseTransparent;
      }
      if (mode === "default") {
        delete detail.color;
        if (mirror) delete mirror.color;
      } else if (mode === "solid" && !optionalHexColor(detail.color)) {
        detail.color = "#000000";
        patchMirroredDetail(detail, { color: "#000000" });
      }
    }
    renderSelectedObjectProperties();
    refreshAfterObjectPropertyEdit();
    return;
  }
  if (key === "detail-glint-default") {
    const details = selectedDetailSetDetails().filter((detail) => detail.type === "window");
    if (!details.length) return;
    const defaultGlint = control.checked === true;
    for (const detail of details) {
      const mirror = mirroredDetailOf(detail);
      if (defaultGlint) {
        delete detail.glintDark;
        delete detail.glintBright;
        if (mirror) {
          delete mirror.glintDark;
          delete mirror.glintBright;
        }
      } else {
        detail.glintDark = optionalHexColor(detail.glintDark) || DEFAULT_WINDOW_GLINT_DARK;
        detail.glintBright = optionalHexColor(detail.glintBright) || DEFAULT_WINDOW_GLINT_BRIGHT;
        patchMirroredDetail(detail, { glintDark: detail.glintDark, glintBright: detail.glintBright });
      }
    }
    renderSelectedObjectProperties();
    refreshAfterObjectPropertyEdit();
    return;
  }
  if (key === "detail-glint-dark" || key === "detail-glint-bright") {
    const details = selectedDetailSetDetails().filter((detail) => detail.type === "window");
    if (!details.length) return;
    const prop = key === "detail-glint-dark" ? "glintDark" : "glintBright";
    const color = optionalHexColor(control.value) || (prop === "glintDark" ? DEFAULT_WINDOW_GLINT_DARK : DEFAULT_WINDOW_GLINT_BRIGHT);
    for (const detail of details) {
      detail[prop] = color;
      patchMirroredDetail(detail, { [prop]: color });
    }
    refreshAfterObjectPropertyEdit();
  }
}

function handleObjectPropertyChange(event) {
  const control = event.target?.closest?.("[data-object-property]");
  if (!control) return;
  if (control.dataset.objectProperty === "edge-kind") {
    convertSelectedEdgeKind(control.value);
  } else {
    handleObjectPropertyInput(event);
    renderSelectedObjectProperties();
  }
}

function handleObjectPropertyAction(event) {
  const button = event.target?.closest?.("[data-object-action]");
  if (!button || button.disabled) return;
  runSelectionContextCommand(button.dataset.objectAction);
}

function isEditingFormControl(target) {
  return !!target?.closest?.("input, textarea, select, [contenteditable='true'], [contenteditable='']");
}

function modalIsOpen(...modals) {
  return modals.some((modal) => modal && !modal.classList.contains("is-hidden"));
}

function continuousHistoryTarget(target) {
  const field = target?.closest?.("input, textarea");
  if (!field || field.type === "file" || field.type === "checkbox" || field.type === "radio") return false;
  if (field.tagName === "TEXTAREA") return true;
  return ["range", "number", "text", "search", "color"].includes(String(field.type || "").toLowerCase());
}

function continueBuilderPreloadFromUserGesture(event = null) {
  if (!state.builderPreload.visible || !state.builderPreload.startup || state.builderPreload.userReady) return false;
  event?.preventDefault?.();
  event?.stopPropagation?.();
  state.builderPreload.userReady = true;
  invalidateBuilderPreloadRenderer("Entering fullscreen; refreshing renderer preview...");
  requestBuilderFullscreen(true);
  scheduleBuilderViewportRefresh(140, { invalidatePreload: true, message: "Fullscreen ready; confirming renderer preview..." });
  checkBuilderPreloadReady();
  return true;
}

function bindEvents() {
  els.builderFullscreenBtn?.addEventListener("click", (event) => {
    continueBuilderPreloadFromUserGesture(event);
  });
  els.undoEditBtn?.addEventListener("click", undoEditHistory);
  els.redoEditBtn?.addEventListener("click", redoEditHistory);
  document.addEventListener("input", (event) => {
    if (continuousHistoryTarget(event.target)) beginContinuousEditHistory();
  }, true);
  document.addEventListener("change", endContinuousEditHistory, true);
  document.addEventListener("pointerup", endContinuousEditHistory, true);
  document.addEventListener("pointercancel", endContinuousEditHistory, true);
  els.selectionPickMenu?.addEventListener("click", (event) => {
    const actionButton = event.target.closest("[data-pick-action]");
    if (actionButton?.dataset.pickAction === "clear-selection" && !actionButton.disabled) {
      clearEditorSelection();
      setStatus("SELECTION CLEARED.");
      return;
    }
    const button = event.target.closest("[data-pick-index]");
    if (!button) return;
    runSelectionPick(Number(button.dataset.pickIndex));
  });
  els.selectionPickMenu?.addEventListener("pointerover", (event) => {
    if (event.target.closest("[data-pick-action]")) {
      clearSelectionPickHover({ redraw: false });
      return;
    }
    const button = event.target.closest("[data-pick-index]");
    if (!button) return;
    setSelectionPickHover(Number(button.dataset.pickIndex));
  });
  els.selectionPickMenu?.addEventListener("focusin", (event) => {
    const button = event.target.closest("[data-pick-index]");
    if (!button) return;
    if (state.selectionPickOptions?.afterPick === "context") return;
    setSelectionPickHover(Number(button.dataset.pickIndex));
  });
  els.selectionPickMenu?.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowRight" || state.selectionPickOptions?.afterPick !== "context") return;
    const button = event.target.closest("[data-pick-index]");
    if (!button) return;
    event.preventDefault();
    promoteSelectionPickToProperties(Number(button.dataset.pickIndex));
  });
  els.selectionPickMenu?.addEventListener("pointerleave", (event) => {
    if (state.selectionPickOptions?.afterPick === "context" && state.selectionPickHover) {
      promoteSelectionPickToProperties();
      return;
    }
    clearSelectionPickHover();
  });
  els.selectionContextMenu?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-command-id]");
    if (!button || button.disabled) return;
    runSelectionContextCommand(button.dataset.commandId);
  });
  els.selectionContextMenu?.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" || !els.selectionContextMenu?.classList.contains("is-cascade")) return;
    event.preventDefault();
    const index = Number(els.selectionContextMenu.dataset.pickIndex);
    const button = els.selectionPickMenu?.querySelector(`[data-pick-index="${index}"]`);
    hideSelectionContextMenu();
    button?.focus?.({ preventScroll: true });
  });
  els.selectionContextMenu?.addEventListener("pointerenter", () => {
    if (!els.selectionContextMenu?.classList.contains("is-cascade")) return;
    cancelSelectionPickHoverClear();
  });
  els.selectionContextMenu?.addEventListener("pointerleave", (event) => {
    if (!els.selectionContextMenu?.classList.contains("is-cascade")) return;
    if (els.selectionPickMenu?.contains(event.relatedTarget)) return;
    scheduleSelectionPickHoverClear();
  });
  els.objectPropertiesPanel?.addEventListener("input", handleObjectPropertyInput);
  els.objectPropertiesPanel?.addEventListener("change", handleObjectPropertyChange);
  els.objectPropertiesPanel?.addEventListener("click", handleObjectPropertyAction);
  document.addEventListener("pointerdown", (event) => {
    const inPickMenu = !!els.selectionPickMenu?.contains(event.target);
    const inContextMenu = !!els.selectionContextMenu?.contains(event.target);
    if (selectionPickMenuOpen() && !inPickMenu && !inContextMenu) hideSelectionPickMenu();
    if (selectionContextMenuOpen() && !inContextMenu && !inPickMenu) hideSelectionContextMenu();
  });
  document.querySelectorAll(".tool-tab-btn").forEach((btn) => btn.addEventListener("click", () => {
    openToolWindow(btn.dataset.toolTabTarget);
  }));
  document.querySelectorAll(".paint-subtab-btn").forEach((btn) => btn.addEventListener("click", () => {
    setPaintTab(btn.dataset.paintTabTarget);
  }));
  document.querySelectorAll(".mode-btn").forEach((btn) => btn.addEventListener("click", (event) => {
    toggleSelectionFilter(btn.dataset.mode, { additive: event.shiftKey });
  }));
  document.querySelectorAll(".axis-btn").forEach((btn) => btn.addEventListener("click", () => {
    state.axis = btn.dataset.axis;
    document.querySelectorAll(".axis-btn").forEach((b) => b.classList.toggle("active", b === btn));
    renderAll();
  }));
  ["x", "y", "z"].forEach((axis) => {
    const apply = (value) => {
      const v = state.selected?.type === "vertex" ? vertexById(state.selected.id) : null;
      if (!v) return;
      setVertex(v, axis === "x" ? Number(value) : v.x, axis === "y" ? Number(value) : v.y, axis === "z" ? Number(value) : v.z);
      renderAll();
    };
    els[`${axis}Slider`].addEventListener("input", (ev) => apply(ev.target.value));
    els[`${axis}Value`].addEventListener("change", (ev) => apply(ev.target.value));
  });
  const viewCubeActionTarget = (target, event = null) => {
    const nativeTarget = target?.closest?.("[data-view-corner], [data-view-preset]") || null;
    if (nativeTarget) return nativeTarget;
    const pointerTarget = event ? viewCubePointerTargetAt(event.clientX, event.clientY) : null;
    return pointerTarget || null;
  };
  const runViewCubeTarget = (target, options = {}) => {
    if (!target) return false;
    if (target.dataset?.viewCorner) {
      const face = target.closest("[data-view-preset]")?.dataset?.viewPreset;
      return setProjectionCornerView(face, target.dataset.viewCorner, options);
    }
    if (target.dataset?.viewPreset) return setProjectionView(target.dataset.viewPreset, options);
    return false;
  };
  const beginViewCubePointer = (ev) => {
    if (ev.button !== 0) return;
    ev.stopPropagation();
    hideSelectionPickMenu();
    hideSelectionContextMenu();
    state.viewCubeDrag = {
      x: ev.clientX,
      y: ev.clientY,
      moved: false,
      target: viewCubeActionTarget(ev.target, ev),
      captureEl: ev.currentTarget
    };
    ev.currentTarget.classList.add("is-dragging");
    ev.currentTarget.setPointerCapture?.(ev.pointerId);
  };
  const moveViewCubePointer = (ev) => {
    if (!state.viewCubeDrag) return;
    ev.preventDefault();
    const dx = ev.clientX - state.viewCubeDrag.x;
    const dy = ev.clientY - state.viewCubeDrag.y;
    if (Math.abs(dx) + Math.abs(dy) > 2) state.viewCubeDrag.moved = true;
    state.viewCubeDrag.x = ev.clientX;
    state.viewCubeDrag.y = ev.clientY;
    rotateViewFromCubeDrag(dx, dy);
  };
  const suppressNextViewCubeClick = () => {
    state.viewCubeSuppressClick = true;
    setTimeout(() => { state.viewCubeSuppressClick = false; }, 0);
  };
  const endViewCubeDrag = (ev, options = {}) => {
    if (!state.viewCubeDrag) return;
    const drag = state.viewCubeDrag;
    if (ev?.pointerId != null && drag.captureEl?.hasPointerCapture?.(ev.pointerId)) {
      drag.captureEl.releasePointerCapture(ev.pointerId);
    }
    drag.captureEl?.classList.remove("is-dragging");
    state.viewCubeDrag = null;
    if (options.cancel) return;
    if (drag.moved) {
      suppressNextViewCubeClick();
      setStatus("VIEW ROTATED.");
      return;
    }
    if (runViewCubeTarget(drag.target, { fit: true })) {
      ev?.preventDefault?.();
      suppressNextViewCubeClick();
    }
  };
  const zoomMainViewFromWheel = (ev) => {
    if (ev.target?.closest?.("button, input, select, textarea, .preview-trust-strip, .view-cube, .selection-pick-menu, .selection-context-menu")) return;
    ev.preventDefault();
    state.view.zoom = clamp(state.view.zoom * (ev.deltaY > 0 ? 0.9 : 1.1), VIEW_ZOOM_MIN, VIEW_ZOOM_MAX);
    if (gameRendererPreviewMode()) renderPreviewMotion();
    else renderAll();
  };
  els.viewCubeBody?.addEventListener("pointerdown", beginViewCubePointer);
  els.viewCubeBody?.addEventListener("pointermove", moveViewCubePointer);
  els.viewCubeBody?.addEventListener("pointermove", (event) => {
    if (!state.viewCubeDrag) syncViewCubeHover(event);
  });
  els.viewCubeBody?.addEventListener("pointerup", endViewCubeDrag);
  els.viewCubeBody?.addEventListener("pointercancel", (ev) => endViewCubeDrag(ev, { cancel: true }));
  els.viewCubeBody?.addEventListener("pointerover", syncViewCubeHover);
  els.viewCubeBody?.addEventListener("pointerout", (event) => {
    if (els.viewCubeBody?.contains(event.relatedTarget)) return;
    clearViewCubeCornerHover();
  });
  els.viewCube?.querySelectorAll("[data-view-preset]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      if (state.viewCubeSuppressClick) return;
      runViewCubeTarget(viewCubeActionTarget(event.target, event) || button, { fit: true });
    });
  });
  els.viewProjectionToggle?.addEventListener("click", (event) => {
    event.stopPropagation();
    setViewProjectionMode(!state.view.orthographic);
  });
  els.fullscreenViewBtn?.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    event.currentTarget.dataset.pointerActivated = "1";
    toggleBuilderFullscreenFromUserGesture(event);
  });
  els.fullscreenViewBtn?.addEventListener("click", (event) => {
    event.stopPropagation();
    if (event.currentTarget.dataset.pointerActivated === "1") {
      delete event.currentTarget.dataset.pointerActivated;
      return;
    }
    toggleBuilderFullscreenFromUserGesture(event);
  });
  const bindViewCubeRotateButton = (button, rotate) => {
    if (!button) return;
    button.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) return;
      event.preventDefault();
      event.stopPropagation();
      button.dataset.pointerActivated = "1";
      rotate();
    });
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      if (button.dataset.pointerActivated === "1") {
        delete button.dataset.pointerActivated;
        return;
      }
      rotate();
    });
  };
  bindViewCubeRotateButton(els.viewCubeRotateLeft, () => rotateViewHorizontal(-1));
  bindViewCubeRotateButton(els.viewCubeRotateRight, () => rotateViewHorizontal(1));
  bindViewCubeRotateButton(els.viewCubeRotateUp, () => rotateViewVertical(-1));
  bindViewCubeRotateButton(els.viewCubeRotateDown, () => rotateViewVertical(1));
  const beginMainViewDrag = (ev) => {
    state.drag = {
      type: "main-rotate",
      pointerId: ev.pointerId,
      x: ev.clientX,
      y: ev.clientY,
      startX: ev.clientX,
      startY: ev.clientY,
      rotating: false,
      captureEl: ev.currentTarget
    };
    ev.currentTarget.setPointerCapture?.(ev.pointerId);
  };
  const moveMainViewDrag = (ev) => {
    const drag = state.drag;
    if (!drag || drag.type !== "main-rotate" || drag.pointerId !== ev.pointerId) return;
    const totalDx = ev.clientX - drag.startX;
    const totalDy = ev.clientY - drag.startY;
    if (!drag.rotating && Math.hypot(totalDx, totalDy) < MAIN_VIEW_DRAG_ROTATE_THRESHOLD) return;
    ev.preventDefault();
    hideSelectionPickMenu();
    hideSelectionContextMenu();
    drag.rotating = true;
    const dx = ev.clientX - drag.x;
    const dy = ev.clientY - drag.y;
    drag.x = ev.clientX;
    drag.y = ev.clientY;
    rotateViewFromCubeDrag(dx, dy);
  };
  const endMainViewDrag = (ev, options = {}) => {
    const drag = state.drag;
    if (!drag || drag.type !== "main-rotate" || (ev?.pointerId != null && drag.pointerId !== ev.pointerId)) return;
    if (ev?.pointerId != null && drag.captureEl?.hasPointerCapture?.(ev.pointerId)) {
      drag.captureEl.releasePointerCapture(ev.pointerId);
    }
    state.drag = null;
    if (!options.cancel && drag.rotating) {
      ev?.preventDefault?.();
      setStatus("VIEW ROTATED.");
    }
  };
  els.openFileWindowBtn?.addEventListener("click", openFileWindow);
  els.openGameInfoWindowBtn?.addEventListener("click", openGameInfoWindow);
  els.closeToolsWindowBtn?.addEventListener("click", () => closeToolWindow());
  els.closeFileWindowBtn?.addEventListener("click", () => closeFileWindow());
  els.closeGameInfoWindowBtn?.addEventListener("click", () => closeGameInfoWindow());
  els.mainView.addEventListener("pointerdown", (ev) => {
    ev.stopPropagation();
    if (selectionPickMenuOpen() || selectionContextMenuOpen()) {
      hideSelectionPickMenu();
      hideSelectionContextMenu();
    }
    const point = getCanvasPoint(ev, els.mainView);
    if (ev.button === 0) {
      const wantsPickMenu = ev.metaKey || ev.ctrlKey;
      if (wantsPickMenu) {
        ev.preventDefault();
      }
      selectInMain(point, {
        afterPick: wantsPickMenu ? "context" : undefined,
        cascade: wantsPickMenu ? "context" : undefined,
        multiSelect: ev.shiftKey,
        forcePickMenu: wantsPickMenu,
        pickMenuForSingle: wantsPickMenu,
        clientX: ev.clientX,
        clientY: ev.clientY
      });
      if (!wantsPickMenu) beginMainViewDrag(ev);
    }
  });
  els.mainView.addEventListener("contextmenu", (ev) => {
    ev.preventDefault();
    endMainViewDrag(ev, { cancel: true });
    const point = getCanvasPoint(ev, els.mainView);
    const picked = selectInMain(point, {
      afterPick: "context",
      cascade: "context",
      forcePickMenu: true,
      pickMenuForSingle: true,
      multiSelect: ev.shiftKey,
      clientX: ev.clientX,
      clientY: ev.clientY
    });
    if (!picked) {
      hideSelectionPickMenu();
      hideSelectionContextMenu();
      setStatus("NO CONTEXT ACTIONS FOR EMPTY SPACE.");
    }
  });
  els.mainView.addEventListener("dblclick", (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    endMainViewDrag(ev, { cancel: true });
    const point = getCanvasPoint(ev, els.mainView);
    if (!orientFaceAtMainPoint(point)) setStatus("DOUBLE-CLICK A FACE TO ORIENT VIEW.");
  });
  els.mainView.addEventListener("pointermove", moveMainViewDrag);
  els.mainView.addEventListener("pointerup", endMainViewDrag);
  els.mainView.addEventListener("pointercancel", (ev) => endMainViewDrag(ev, { cancel: true }));
  els.mainPreviewStack?.addEventListener("wheel", zoomMainViewFromWheel, { passive: false });
  const startNewProfile = (sideInput = els.profileSideCount, rotationInput = els.profileRotationDeg, coneInput = els.profileConeMode) => {
    if (!confirmDiscardCurrentModel("Create a new profile")) {
      setStatus("NEW PROFILE CANCELLED.");
      return;
    }
    closeModelBrowser();
    resetPolygonProfile(readProfileSideCount(sideInput), readProfileRotationDeg(rotationInput), readProfileConeMode(coneInput));
  };
  document.getElementById("newProfileBtn")?.addEventListener("click", () => startNewProfile());
  els.openBenchmarkBrowserBtn?.addEventListener("click", openBenchmarkBrowser);
  els.browseModelsBtn?.addEventListener("click", openObjectBrowser);
  els.modelBrowserNewProfileBtn?.addEventListener("click", () => startNewProfile(els.modelBrowserProfileSides, els.modelBrowserProfileRotation, els.modelBrowserProfileCone));
  els.modelBrowserObjectsViewBtn?.addEventListener("click", () => setModelBrowserView("objects"));
  els.modelBrowserBenchmarkViewBtn?.addEventListener("click", () => setModelBrowserView("benchmark"));
  els.modelBrowserBenchmarkBtn?.addEventListener("click", runModelBrowserBenchmark);
  els.closeModelBrowserBtn?.addEventListener("click", closeModelBrowser);
  els.modelBrowserGrid?.addEventListener("click", (event) => {
    const card = event.target.closest("[data-model-id]");
    if (!card) return;
    loadLibraryModel(card.dataset.modelId);
  });
  els.modelBrowserModal?.addEventListener("click", (event) => {
    if (event.target === els.modelBrowserModal) closeModelBrowser();
  });
  els.loadLibraryModelBtn.addEventListener("click", () => loadLibraryModel(els.librarySelector.value));
  els.toggleExportBtn.addEventListener("click", () => setExportVisible(els.exportPanel.classList.contains("is-hidden")));
  els.saveModelTopBtn?.addEventListener("click", saveModelAsset);
  els.rebuildGameTopBtn?.addEventListener("click", rebuildGameFiles);
  els.showFaceNormals.addEventListener("input", renderAll);
  els.showFaceUvTypes?.addEventListener("input", renderAll);
  els.showBlankUv?.addEventListener("input", renderAll);
  els.showAuditEdges?.addEventListener("input", renderAll);
  els.showHiddenEdges?.addEventListener("input", renderAll);
  for (const input of [els.showWindowDetails, els.showSurfaceDetails, els.showEngineDetails, els.showBeaconDetails]) {
    input?.addEventListener("input", () => {
      resetGamePreviewSyncState();
      renderAll();
      scheduleGamePreviewSync(0, true);
    });
  }
  els.viewModeColumn?.querySelectorAll("[data-preview-mode]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      setPreviewRenderMode(button.dataset.previewMode);
    });
  });
  els.previewRenderMode.addEventListener("input", renderAll);
  els.spinPreviewBtn?.addEventListener("click", openSpinPreviewWindow);
  els.closeSpinPreviewBtn?.addEventListener("click", closeSpinPreviewWindow);
  els.spinPreviewModal?.addEventListener("click", (event) => {
    if (event.target === els.spinPreviewModal) closeSpinPreviewWindow();
  });
  els.openAssetLibraryPaintBtn?.addEventListener("click", openAssetLibrary);
  els.closeAssetLibraryBtn?.addEventListener("click", closeAssetLibrary);
  els.assetLibraryModal?.addEventListener("click", (event) => {
    if (event.target === els.assetLibraryModal) closeAssetLibrary();
  });
  els.selectedAssetCard?.addEventListener("click", openAssetLibrary);
  els.selectedAssetCard?.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    openAssetLibrary();
  });
  els.openUvPropertiesBtn?.addEventListener("click", openUvProperties);
  els.closeUvPropertiesBtn?.addEventListener("click", closeUvProperties);
  els.uvPropertiesModal?.addEventListener("click", (event) => {
    if (event.target === els.uvPropertiesModal) closeUvProperties();
  });
  document.addEventListener("pointerdown", closeUvPropertiesOnOutsidePointer);
  els.confirmWriteSummaryBtn?.addEventListener("click", () => closeWriteSummaryModal(true));
  els.cancelWriteSummaryBtn?.addEventListener("click", () => closeWriteSummaryModal(false));
  els.writeSummaryModal?.addEventListener("click", (event) => {
    if (event.target === els.writeSummaryModal) closeWriteSummaryModal(false);
  });
  els.closeBuildCompleteBtn?.addEventListener("click", closeBuildCompleteModal);
  els.testBuildDevHtmlBtn?.addEventListener("click", openLocalDevHtmlTest);
  els.buildCompleteModal?.addEventListener("click", (event) => {
    if (event.target === els.buildCompleteModal) closeBuildCompleteModal();
  });
  window.addEventListener("keydown", (event) => {
    if ((event.code === "Space" || event.key === " " || event.key === "Spacebar")
      && continueBuilderPreloadFromUserGesture(event)) {
      return;
    }
    const shortcutKey = String(event.key || "").toLowerCase();
    const commandKey = event.metaKey || event.ctrlKey;
    const historyShortcutAllowed = commandKey
      && !isEditingFormControl(event.target)
      && !modalIsOpen(els.writeSummaryModal, els.buildCompleteModal, els.assetLibraryModal, els.modelBrowserModal, els.spinPreviewModal);
    if (historyShortcutAllowed && shortcutKey === "z") {
      event.preventDefault();
      if (event.shiftKey) redoEditHistory();
      else undoEditHistory();
      return;
    }
    if (historyShortcutAllowed && shortcutKey === "y") {
      event.preventDefault();
      redoEditHistory();
      return;
    }
    if ((event.key === "ContextMenu" || (event.key === "F10" && event.shiftKey))
      && state.selected
      && !isEditingFormControl(event.target)
      && !modalIsOpen(els.writeSummaryModal, els.buildCompleteModal, els.assetLibraryModal, els.modelBrowserModal, els.spinPreviewModal)) {
      event.preventDefault();
      openSelectionContextMenuAt(NaN, NaN);
      return;
    }
    if ((event.key === "Delete" || event.key === "Backspace")
      && state.selected
      && !isEditingFormControl(event.target)
      && !modalIsOpen(els.writeSummaryModal, els.buildCompleteModal, els.assetLibraryModal, els.modelBrowserModal, els.spinPreviewModal)) {
      event.preventDefault();
      deleteSelected();
      return;
    }
    if (event.key !== "Escape") return;
    if (selectionPickMenuOpen() && selectionContextMenuOpen()) {
      hideSelectionContextMenu();
      hideSelectionPickMenu();
      return;
    }
    if (selectionContextMenuOpen()) {
      hideSelectionContextMenu();
      return;
    }
    if (state.surfaceInsertPreview) {
      cancelSurfaceInsertPreview({ redraw: true });
      setStatus("SURFACE POLYGON CANCELLED.");
      return;
    }
    if (state.faceExtrudePreview) {
      cancelFaceExtrudePreview({ redraw: true });
      setStatus("FACE EXTRUDE CANCELLED.");
      return;
    }
    if (!els.writeSummaryModal?.classList.contains("is-hidden")) {
      closeWriteSummaryModal(false);
      return;
    }
    if (!els.buildCompleteModal?.classList.contains("is-hidden")) {
      closeBuildCompleteModal();
      return;
    }
    if (!els.assetLibraryModal?.classList.contains("is-hidden")) {
      closeAssetLibrary();
      return;
    }
    if (!els.uvPropertiesModal?.classList.contains("is-hidden")) {
      closeUvProperties();
      return;
    }
    if (!els.modelBrowserModal?.classList.contains("is-hidden")) {
      closeModelBrowser();
      return;
    }
    if (!els.spinPreviewModal?.classList.contains("is-hidden")) {
      closeSpinPreviewWindow();
      return;
    }
    if (toolWindowOpen()) closeAnyToolWindow();
  });
  els.importBitmapShelf.addEventListener("change", (ev) => {
    importBitmapShelfFiles(ev.target.files);
    ev.target.value = "";
  });
  els.replaceAssetInput?.addEventListener("change", (ev) => {
    const file = ev.target.files?.[0];
    const itemId = pendingReplaceAssetId;
    pendingReplaceAssetId = "";
    ev.target.value = "";
    if (file && itemId) replaceBitmapAsset(itemId, file);
  });
  const handleBitmapGridClick = (ev) => {
    const replaceTarget = ev.target.closest("[data-replace-asset-id]");
    if (replaceTarget) {
      ev.preventDefault();
      ev.stopPropagation();
      beginReplaceBitmapAsset(replaceTarget.dataset.replaceAssetId);
      return;
    }
    const deleteTarget = ev.target.closest("[data-delete-asset-id]");
    if (deleteTarget) {
      ev.preventDefault();
      ev.stopPropagation();
      deleteBitmapAsset(deleteTarget.dataset.deleteAssetId);
      return;
    }
    const card = ev.target.closest("[data-shelf-id]");
    if (!card) return;
    selectBitmapShelfItem(card.dataset.shelfId);
    const item = selectedBitmapShelfItem();
    if (!item) return;
    if (item.asset?.kind === "decal") {
      setPaintTab("decals");
      setStatus(`${bitmapShelfItemTitle(item)} DECAL SELECTED. USE ADD DECAL TO LAYER IT ON THE SELECTED FACE.`);
    } else if (selectedFace()) {
      setPaintTab("face");
      setStatus(`${bitmapShelfItemTitle(item)} SELECTED. USE THE APPLY BUTTONS TO PLACE IT.`);
    } else {
      setPaintTab("face");
      setStatus(`${bitmapShelfItemTitle(item)} SELECTED. SELECT A FACE TO APPLY IT.`);
    }
    closeAssetLibrary();
  };
  els.bitmapAssetGrid?.addEventListener("click", handleBitmapGridClick);
  els.currentBitmapAssetGrid?.addEventListener("click", handleBitmapGridClick);
  els.localBitmapAssetGrid?.addEventListener("click", handleBitmapGridClick);
  els.bitmapShelfSelector?.addEventListener("change", () => {
    state.selectedBitmapShelfId = els.bitmapShelfSelector.value || "";
    updateBitmapAssetGrid();
    updateSelectedBitmapReadout();
  });
  els.applyShelfTopBtn.addEventListener("click", () => applyShelfBitmap("top"));
  els.applyShelfBottomBtn.addEventListener("click", () => applyShelfBitmap("bottom"));
  els.applyShelfBackBtn.addEventListener("click", () => applyShelfBitmap("back"));
  els.applyShelfFaceBtn.addEventListener("click", () => applyShelfBitmapToSelectedFace({ orientToView: true }));
  els.addShelfDecalBtn?.addEventListener("click", applyShelfBitmapAsDecal);
  els.faceDecalSelector?.addEventListener("change", () => updateFaceDecalControls());
  for (const control of [els.faceDecalX, els.faceDecalY, els.faceDecalScale, els.faceDecalAlpha]) {
    control?.addEventListener("input", updateSelectedFaceDecalFromControls);
  }
  els.faceDecalAngle?.addEventListener("change", updateSelectedFaceDecalFromControls);
  els.removeFaceDecalBtn?.addEventListener("click", removeSelectedFaceDecal);
  els.clearFaceDecalsBtn?.addEventListener("click", clearSelectedFaceDecals);
  els.clearAllFaceDecalsBtn?.addEventListener("click", clearAllFaceDecals);
  els.clearBitmapShelfBtn.addEventListener("click", clearBitmapShelf);
  els.refreshAssetShelfBtn?.addEventListener("click", loadAssetShelf);
  els.loadCurrentShipAssetsBtn?.addEventListener("click", loadCurrentShipAssets);
  els.rebuildAssetsBtn?.addEventListener("click", rebuildGameFiles);
  els.uploadTopSkinBtn?.addEventListener("click", () => uploadSkinSide("top"));
  els.uploadBottomSkinBtn?.addEventListener("click", () => uploadSkinSide("bottom"));
  els.uploadBackSkinBtn?.addEventListener("click", () => uploadSkinSide("back"));
  els.uploadFaceSkinBtn?.addEventListener("click", uploadSelectedFaceSkin);
  els.assetShelfCategory?.addEventListener("change", () => {
    updateBitmapAssetGrid();
    if (state.toolServer.skins.length) setStatus(`${els.assetShelfCategory.value.toUpperCase()} ASSET CATEGORY SELECTED.`);
  });
  els.assetShelfKind?.addEventListener("change", updateBitmapAssetGrid);
  els.assetShelfModel?.addEventListener("change", updateBitmapAssetGrid);
  els.assetShelfSearch?.addEventListener("input", updateBitmapAssetGrid);
  els.importTopSkin.addEventListener("change", (ev) => {
    importSkinFile("top", ev.target.files?.[0]);
    ev.target.value = "";
  });
  els.importBottomSkin.addEventListener("change", (ev) => {
    importSkinFile("bottom", ev.target.files?.[0]);
    ev.target.value = "";
  });
  els.importBackSkin.addEventListener("change", (ev) => {
    importSkinFile("back", ev.target.files?.[0]);
    ev.target.value = "";
  });
  els.importFaceSkin.addEventListener("change", (ev) => {
    importSelectedFaceSkinFile(ev.target.files?.[0]);
    ev.target.value = "";
  });
  els.reloadSkinBitmapsBtn.addEventListener("click", () => loadSkinBitmaps(els.shipId.value, state.skinImages?.mirrorX || emptyMirrorFlags(false)));
  els.clearImportedSkinsBtn.addEventListener("click", clearSkinBitmaps);
  els.clearFaceSkinBtn.addEventListener("click", clearSelectedFacePaint);
  els.clearAllFaceUvBtn?.addEventListener("click", clearAllFaceUv);
  els.clearTopSkinBtn?.addEventListener("click", () => clearSkinSide("top"));
  els.clearBottomSkinBtn?.addEventListener("click", () => clearSkinSide("bottom"));
  els.clearBackSkinBtn?.addEventListener("click", () => clearSkinSide("back"));
  els.mirrorHalfSkins.addEventListener("input", () => {
    updateSkinReadout();
    renderAll();
  });
  els.importMirroredSkin?.addEventListener("input", () => {
    if (!setSelectedFaceMirrorX(els.importMirroredSkin.checked)) renderAll();
  });
  els.skinAngle?.addEventListener("input", (ev) => setSelectedFaceUvAngle(ev.target.value));
  els.skinAngleValue?.addEventListener("change", (ev) => setSelectedFaceUvAngle(ev.target.value));
  for (const control of uvTransformControls()) {
    control.addEventListener("input", (event) => {
      syncUvTransformControlPair(event.target);
      applySelectedFaceUvTransformFromControls({ normalizeInputs: false, status: false });
    });
    control.addEventListener("change", (event) => {
      syncUvTransformControlPair(event.target);
      applySelectedFaceUvTransformFromControls({ normalizeInputs: true, status: true });
    });
  }
  els.uvTransformWrap?.addEventListener("change", (event) => setSelectedFaceBitmapWrap(event.target.value));
  els.uvTransformScaleLink?.addEventListener("change", (event) => setUvScaleLinkEnabled(event.target.checked));
  els.copyFacePropertiesBtn?.addEventListener("click", copySelectedFaceProperties);
  els.pasteFacePropertiesBtn?.addEventListener("click", pasteFacePropertiesToSelection);
  els.resetUvTransformBtn?.addEventListener("click", resetSelectedFaceUvTransform);
  els.removeFaceGroupUvBtn?.addEventListener("click", removeSelectedFaceGroupUv);
  document.querySelectorAll(".uv-rotate-btn").forEach((button) => {
    button.addEventListener("click", () => rotateSelectedFaceUvAngle(button.dataset.uvRotate));
  });
  els.orientUvToViewBtn?.addEventListener("click", () => orientFaceToView());
  els.resetUvAngleBtn?.addEventListener("click", () => setSelectedFaceUvAngle(0, true, "FACE UV ANGLE RESET."));
  els.faceColor?.addEventListener("input", (ev) => setSelectedFaceColor(ev.target.value, "FACE COLOUR UPDATED."));
  els.averageFaceColorBtn?.addEventListener("click", useSelectedFaceBitmapAverage);
  els.clearFaceColorBtn?.addEventListener("click", clearSelectedFaceColor);
  els.downloadTopTemplateBtn.addEventListener("click", () => downloadTemplate("top"));
  els.downloadBottomTemplateBtn.addEventListener("click", () => downloadTemplate("bottom"));
  els.downloadBackTemplateBtn.addEventListener("click", () => downloadTemplate("back"));
  els.downloadFaceTemplateBtn.addEventListener("click", downloadSelectedFaceTemplate);
  els.templateFaceSide.addEventListener("change", (ev) => setSelectedFaceBitmapSide(ev.target.value));
  els.shipId.addEventListener("change", () => loadSkinBitmaps(els.shipId.value, state.skinImages?.mirrorX || emptyMirrorFlags(false)));
  document.getElementById("resetViewBtn").addEventListener("click", () => {
    setStandardView(); fitView(); renderAll();
  });
  document.getElementById("fitViewBtn").addEventListener("click", () => { fitView(); renderAll(); });
  els.benchmarkRendererBtn?.addEventListener("click", runRendererBenchmark);
  window.addEventListener("message", (event) => {
    if (event.source !== els.gamePreviewFrame?.contentWindow) return;
    if (event.data?.type === "ultra-elite-render-preview-ready") {
      if (els.gamePreviewReadout) els.gamePreviewReadout.textContent = "GAME RENDERER READY.";
      setBuilderPreloadText("Renderer connected; sending model snapshot...");
      syncGamePreview(true);
      return;
    }
    if (event.data?.type === "ultra-elite-render-preview-result") {
      handleGamePreviewResult(event.data);
    }
  });
  document.getElementById("addPointBtn").addEventListener("click", createPointPairFromAction);
  document.getElementById("addCenterPointBtn").addEventListener("click", createCenterPointFromAction);
  document.getElementById("deleteSelectionBtn").addEventListener("click", deleteSelected);
  document.getElementById("addVertexBeaconBtn").addEventListener("click", () => addBeaconDetail({ stayInVertexMode: true }));
  document.getElementById("removeVertexBeaconBtn").addEventListener("click", removeBeaconAtSelectedVertex);
  document.getElementById("deleteFaceBtn").addEventListener("click", () => {
    if (state.selected?.type === "face") deleteSelected();
  });
  document.getElementById("deleteEdgeBtn").addEventListener("click", () => {
    if (state.selected?.type === "edge") deleteSelected();
  });
  document.getElementById("appendFacePointBtn").addEventListener("click", appendPickedToSelectedFace);
  document.getElementById("removeFacePointBtn").addEventListener("click", removePickedFromSelectedFace);
  document.getElementById("flipFaceBtn").addEventListener("click", flipSelectedFace);
  els.clearFaceGroupBtn?.addEventListener("click", () => clearFaceGroup());
  document.getElementById("clearSelectionBtn").addEventListener("click", () => {
    clearEditorSelection();
    setStatus("SELECTION CLEARED.");
  });
  document.getElementById("addFaceBtn").addEventListener("click", () => {
    if (state.pick.length < 3) return setStatus("PICK AT LEAST THREE VERTICES.");
    addFaceMirrored(state.pick);
    state.pick = [];
    setStatus("FACE ADDED.");
    renderAll();
  });
  for (const control of surfaceInsertControls()) {
    control.addEventListener("input", (event) => {
      syncSurfaceInsertControlPair(event.target);
      if (state.surfaceInsertPreview) syncSurfaceInsertPreviewConfig();
      renderAll();
    });
    control.addEventListener("change", (event) => {
      syncSurfaceInsertControlPair(event.target);
      if (state.surfaceInsertPreview) syncSurfaceInsertPreviewConfig();
      renderAll();
    });
  }
  els.addSurfacePolygonBtn?.addEventListener("click", () => prepareSurfaceInsertPreview());
  els.closeSurfaceInsertMenuBtn?.addEventListener("click", () => {
    cancelSurfaceInsertPreview({ redraw: true });
    setStatus("SURFACE POLYGON CANCELLED.");
  });
  els.surfaceInsertLinkSize?.addEventListener("change", () => {
    if (linkedSurfaceSizeEnabled()) setSurfaceInputValue("H", readSurfaceInput("W", 48));
    if (state.surfaceInsertPreview) syncSurfaceInsertPreviewConfig();
    renderAll();
  });
  els.confirmSurfaceInsertBtn?.addEventListener("click", confirmSurfaceInsertPreview);
  for (const control of faceExtrudeControls()) {
    control.addEventListener("input", (event) => {
      syncFaceExtrudeControlPair(event.target);
      if (state.faceExtrudePreview) syncFaceExtrudePreviewConfig();
      renderAll();
    });
    control.addEventListener("change", (event) => {
      syncFaceExtrudeControlPair(event.target);
      if (state.faceExtrudePreview) syncFaceExtrudePreviewConfig();
      renderAll();
    });
  }
  els.addFaceExtrudeBtn?.addEventListener("click", () => prepareFaceExtrudePreview());
  els.addFacePointExtrudeBtn?.addEventListener("click", () => prepareFaceExtrudePreview("point"));
  els.extrudeEdgeLoopBtn?.addEventListener("click", () => prepareFaceExtrudePreview());
  els.closeFaceExtrudeMenuBtn?.addEventListener("click", () => {
    cancelFaceExtrudePreview({ redraw: true });
    setStatus("FACE EXTRUDE CANCELLED.");
  });
  document.querySelectorAll("input[name='faceExtrudeMode']").forEach((input) => {
    input.addEventListener("change", () => {
      if (state.faceExtrudePreview) {
        syncFaceExtrudePreviewConfig();
        syncFaceExtrudeModeUi(state.faceExtrudeConfig?.mode);
      }
      renderAll();
    });
  });
  els.faceExtrudeDeleteSource?.addEventListener("change", () => {
    if (state.faceExtrudePreview) syncFaceExtrudePreviewConfig();
  });
  els.confirmFaceExtrudeBtn?.addEventListener("click", confirmFaceExtrudePreview);
  document.getElementById("addEdgeBtn").addEventListener("click", () => {
    if (state.pick.length < 2) return setStatus("PICK TWO VERTICES.");
    addEdgeMirrored(state.pick[0], state.pick[1], "edge");
    state.pick = [];
    setStatus("EDGE ADDED.");
    renderAll();
  });
  document.getElementById("addStickBtn").addEventListener("click", () => {
    if (state.pick.length < 2) return setStatus("PICK TWO VERTICES.");
    addEdgeMirrored(state.pick[0], state.pick[1], "stick");
    state.pick = [];
    setStatus("STICK ADDED.");
    renderAll();
  });
  document.getElementById("splitEdgeBtn").addEventListener("click", splitSelectedLine);
  document.getElementById("convertEdgeNormalBtn")?.addEventListener("click", () => convertSelectedEdgeKind("edge"));
  document.getElementById("convertEdgeStickBtn")?.addEventListener("click", () => convertSelectedEdgeKind("stick"));
  document.getElementById("convertEdgeEntranceBtn")?.addEventListener("click", () => convertSelectedEdgeToDetail(DETAIL_TYPE_STATION_ENTRANCE));
  document.getElementById("convertEdgeWindowBtn")?.addEventListener("click", () => convertSelectedEdgeToDetail("window"));
  document.getElementById("convertEdgeEngineBtn")?.addEventListener("click", () => convertSelectedEdgeToDetail("engine"));
  document.getElementById("convertEdgeDetailBtn")?.addEventListener("click", () => convertSelectedEdgeToDetail("panel"));
  document.getElementById("addWindowBtn").addEventListener("click", () => addDetail("window"));
  document.getElementById("addEngineBtn").addEventListener("click", () => addDetail("engine"));
  document.getElementById("addPanelBtn").addEventListener("click", () => addDetail("panel"));
  document.getElementById("addBeaconBtn").addEventListener("click", () => addDetail("beacon"));
  document.getElementById("convertDetailEdgeBtn")?.addEventListener("click", () => convertSelectedDetailToEdges("edge"));
  document.getElementById("convertDetailStickBtn")?.addEventListener("click", () => convertSelectedDetailToEdges("stick"));
  document.getElementById("deleteDetailBtn").addEventListener("click", () => {
    if (state.selected?.type === "detail") deleteSelected();
  });
  els.detailInset.addEventListener("input", () => {
    const details = selectedDetailSetDetails().filter((detail) => detail.faceId);
    if (!details.length) return;
    const inset = Number(els.detailInset.value);
    for (const detail of details) {
      detail.inset = inset;
      patchMirroredDetail(detail, { inset });
    }
    renderAll();
  });
  els.detailColor.addEventListener("input", () => {
    const details = selectedDetailSetDetails();
    if (!details.length) return;
    const color = els.detailColor.value;
    for (const detail of details) {
      detail.color = color;
      patchMirroredDetail(detail, { color });
    }
    renderAll();
  });
  document.getElementById("downloadBtn")?.addEventListener("click", downloadShip);
  document.getElementById("copyBtn")?.addEventListener("click", copyExport);
  document.getElementById("importBtn").addEventListener("click", importBuilderJson);
  els.exportKind.addEventListener("change", updateExport);
  els.mirrorNewGeometry?.addEventListener("input", renderAll);
  [
    els.shipId, els.shipName, els.shipDescription, els.shipMissionLore, els.shipClass, els.npcRole, els.aiProfile, els.decalRole, els.baseColor,
    els.shipValue, els.shipHp, els.speedMul, els.cargoTons, els.missileCount, els.laserClass,
    els.flagTrader, els.flagPirate, els.flagPolice, els.flagAlien, els.flagEscapePod, els.flagHidden, els.mirrorHalfSkins, els.skinAngle, els.skinAngleValue, els.faceColor
  ].forEach((el) => el.addEventListener("input", updateExport));
  window.addEventListener("resize", () => {
    scheduleBuilderViewportRefresh(140, {
      invalidatePreload: state.builderPreload.visible,
      message: "Viewport resized; confirming renderer preview..."
    });
  });
  document.addEventListener("fullscreenchange", () => {
    scheduleBuilderViewportRefresh(180, {
      invalidatePreload: state.builderPreload.visible,
      message: "Fullscreen changed; confirming renderer preview..."
    });
  });
  document.addEventListener("webkitfullscreenchange", () => {
    scheduleBuilderViewportRefresh(180, {
      invalidatePreload: state.builderPreload.visible,
      message: "Fullscreen changed; confirming renderer preview..."
    });
  });
}

function applyToolSurfaceMode() {
  const params = new URLSearchParams(location.search);
  if (params.get("surface") !== "model") return;
  document.body.classList.add("model-surface-only");
  const paintButton = document.querySelector('.tool-tab-btn[data-tool-tab-target="paint"]');
  paintButton?.remove();
  const paintPanel = document.querySelector('.tool-tab-panel[data-tool-tab-panel="paint"]');
  paintPanel?.remove();
  setToolTab("edit", { redraw: false });
  document.title = "Ultra Elite Model Builder";
}

function installShipBuilderTestHooks() {
  const params = new URLSearchParams(location.search);
  if (!params.has("testHooks")) return;
  window.__shipBuilderTest = Object.freeze({
    state,
    clearEditorSelection,
    resetPolygonProfile,
    selectFaceTarget,
    selectDetailTarget,
    selectVertex,
    toggleSelectionFilter,
    selectInMain,
    rotateViewFromCubeDrag,
    addDetail,
    selectConnectedSurfaceDetails,
    selectedDetailSetDetails,
    controlsOpen: () => !!els.toolsPanel && !els.toolsPanel.classList.contains("is-hidden"),
    controlsTitle: () => els.objectPropertiesPanel?.querySelector("h2")?.textContent || "",
    selectedText: () => els.selectionReadout?.textContent || ""
  });
}

showBuilderPreloadSplash("Loading model library...", { startup: true, openModelBrowserOnHide: true });
applyToolSurfaceMode();
bindEvents();
installShipBuilderTestHooks();
setDefaultPreviewRenderMode();
populateLibrarySelector();
markBuilderPreloadStep("library", "Model library indexed; drawing builder...");
renderAll();
kickInitialGamePreviewSync();
checkLocalToolServer().then((ok) => {
  if (ok) refreshAvailableSkinAssets().catch(() => {});
});
