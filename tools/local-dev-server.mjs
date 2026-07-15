import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import crypto from "node:crypto";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const port = Number(process.env.PORT || process.argv.find((arg) => arg.startsWith("--port="))?.split("=")[1]) || 8765;
const host = process.env.HOST || "127.0.0.1";
const MAX_JSON_BYTES = 16 * 1024 * 1024;

const mimeTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".mjs", "text/javascript; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".svg", "image/svg+xml"],
  [".ico", "image/x-icon"],
  [".txt", "text/plain; charset=utf-8"]
]);

function sendJson(res, status, data) {
  const body = JSON.stringify(data, null, 2);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store"
  });
  res.end(body);
}

function cleanKey(value) {
  return String(value || "").trim().replace(/[^a-zA-Z0-9_-]+/g, "_").replace(/^_+|_+$/g, "");
}

function decodeRequestPath(url) {
  try {
    return decodeURIComponent(new URL(url, `http://${host}:${port}`).pathname);
  } catch {
    return "/";
  }
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_JSON_BYTES) {
        reject(new Error("JSON body is too large."));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      try {
        const text = Buffer.concat(chunks).toString("utf8");
        resolve(text ? JSON.parse(text) : {});
      } catch (error) {
        reject(new Error(`Invalid JSON: ${error.message}`));
      }
    });
    req.on("error", reject);
  });
}

function runNodeScript(script, args = []) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [script, ...args], {
      cwd: root,
      stdio: ["ignore", "pipe", "pipe"]
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => { stdout += chunk.toString(); });
    child.stderr.on("data", (chunk) => { stderr += chunk.toString(); });
    child.on("error", reject);
    child.on("close", (code) => {
      const result = { code, stdout: stdout.trim(), stderr: stderr.trim() };
      if (code === 0) resolve(result);
      else reject(Object.assign(new Error(`${script} exited ${code}`), result));
    });
  });
}

async function rebuildScope(scope = "all") {
  const steps = [];
  const run = async (script, args = []) => {
    const result = await runNodeScript(script, args);
    steps.push({ script, ...result });
  };
  if (scope === "models") {
    await run("tools/build/generate-model-library.mjs");
  } else if (scope === "skins") {
    await run("tools/build/generate-bitmap-skins.mjs");
  } else if (scope === "single") {
    await run("tools/build/build-single-file.mjs");
  } else {
    await run("tools/build/generate-model-library.mjs");
    await run("tools/build/generate-bitmap-skins.mjs");
    await run("tools/build/build-single-file.mjs");
  }
  return steps;
}

function listSkinAssets() {
  const skinDir = path.join(root, "assets/skins");
  const files = fs.existsSync(skinDir)
    ? fs.readdirSync(skinDir).filter((file) => file.endsWith(".png")).sort((a, b) => a.localeCompare(b))
    : [];
  return files.map((file) => {
    const face = file.match(/^(.+)-face-(.+)\.png$/);
    const side = file.match(/^(.+)-(top|bottom|back)\.png$/);
    const filePath = path.join(skinDir, file);
    const stat = fs.statSync(filePath);
    const hash = crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
    if (face) {
      return {
        file,
        model: face[1],
        kind: "face",
        key: face[2],
        category: face[2].split("_")[0] || "face",
        bytes: stat.size,
        hash,
        url: `/assets/skins/${file}`
      };
    }
    if (side) {
      return {
        file,
        model: side[1],
        kind: "side",
        side: side[2],
        category: side[2],
        bytes: stat.size,
        hash,
        url: `/assets/skins/${file}`
      };
    }
    return {
      file,
      model: "",
      kind: "other",
      category: "other",
      bytes: stat.size,
      hash,
      url: `/assets/skins/${file}`
    };
  });
}

function listDecalAssets() {
  const decalDir = path.join(root, "assets/decals");
  const allowed = new Set([".png", ".jpg", ".jpeg", ".svg"]);
  const files = fs.existsSync(decalDir)
    ? fs.readdirSync(decalDir).filter((file) => allowed.has(path.extname(file).toLowerCase())).sort((a, b) => a.localeCompare(b))
    : [];
  return files.map((file) => {
    const filePath = path.join(decalDir, file);
    const stat = fs.statSync(filePath);
    const key = cleanKey(path.basename(file, path.extname(file)));
    return {
      file,
      model: "",
      kind: "decal",
      key,
      category: "decal",
      bytes: stat.size,
      hash: crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex"),
      url: `/assets/decals/${file}`
    };
  });
}

function listModelAssets() {
  const modelDir = path.join(root, "assets/models");
  if (!fs.existsSync(modelDir)) return [];
  return fs.readdirSync(modelDir)
    .filter((file) => file.endsWith(".ultraship.json"))
    .sort((a, b) => a.localeCompare(b))
    .map((file) => {
      const filePath = path.join(modelDir, file);
      try {
        const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
        return {
          id: cleanKey(data.id || path.basename(file, ".ultraship.json")),
          name: String(data.name || data.id || path.basename(file, ".ultraship.json")),
          file,
          data
        };
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

function assetByFile(file) {
  const cleanFile = path.basename(String(file || ""));
  if (!cleanFile || cleanFile !== String(file || "")) return null;
  return [...listSkinAssets(), ...listDecalAssets()].find((asset) => asset.file === cleanFile) || null;
}

function assetDirectory(asset) {
  if (asset?.kind === "decal") return path.join(root, "assets/decals");
  if (asset?.kind === "face" || asset?.kind === "side" || asset?.kind === "other") return path.join(root, "assets/skins");
  return "";
}

function usageForAsset(asset) {
  if (!asset) return [];
  const usage = [];
  const models = listModelAssets();
  for (const model of models) {
    const faces = Array.isArray(model.data?.faces) ? model.data.faces : [];
    let count = 0;
    if (asset.kind === "face") {
      count = faces.filter((face) => cleanKey(face?.bitmapFaceKey) === asset.key && model.id === asset.model).length;
    } else if (asset.kind === "side") {
      count = model.id === asset.model
        ? faces.filter((face) => cleanKey(face?.bitmapFaceKey) === "").length
        : 0;
    } else if (asset.kind === "decal") {
      count = faces.reduce((sum, face) => {
        const decals = Array.isArray(face?.bitmapDecals) ? face.bitmapDecals : [];
        return sum + decals.filter((decal) => cleanKey(decal?.key) === asset.key).length;
      }, 0);
    }
    if (count > 0) {
      usage.push({
        id: model.id,
        name: model.name,
        file: model.file,
        count
      });
    }
  }
  if (!usage.length && asset.model) {
    usage.push({
      id: asset.model,
      name: asset.model,
      file: `${asset.model}.ultraship.json`,
      count: 0
    });
  }
  return usage.sort((a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id));
}

function disabledBitmapSides(meta = {}) {
  return new Set(Array.isArray(meta.imageDecalDisabledSides)
    ? meta.imageDecalDisabledSides.filter((side) => ["top", "bottom", "back"].includes(side))
    : []);
}

function mutateModelForDeletedAsset(model, asset) {
  const data = model.data;
  const faces = Array.isArray(data.faces) ? data.faces : [];
  let changed = false;
  if (asset.kind === "face" && model.id === asset.model) {
    for (const face of faces) {
      if (cleanKey(face?.bitmapFaceKey) !== asset.key) continue;
      delete face.bitmapFaceKey;
      delete face.bitmapAngle;
      delete face.bitmapMirrorX;
      changed = true;
    }
  } else if (asset.kind === "side" && model.id === asset.model) {
    data.gameMeta = data.gameMeta || {};
    const disabled = disabledBitmapSides(data.gameMeta);
    if (!disabled.has(asset.side)) {
      disabled.add(asset.side);
      data.gameMeta.imageDecalDisabledSides = [...disabled];
      changed = true;
    }
    if (data.gameMeta.imageDecalMirrorX?.[asset.side] != null) {
      delete data.gameMeta.imageDecalMirrorX[asset.side];
      if (!Object.values(data.gameMeta.imageDecalMirrorX).some(Boolean)) delete data.gameMeta.imageDecalMirrorX;
      changed = true;
    }
    if (data.gameMeta.imageDecalAngle?.[asset.side] != null) {
      delete data.gameMeta.imageDecalAngle[asset.side];
      if (!Object.keys(data.gameMeta.imageDecalAngle).length) delete data.gameMeta.imageDecalAngle;
      changed = true;
    }
    for (const face of faces) {
      if (face?.bitmapSide !== asset.side) continue;
      delete face.bitmapSide;
      changed = true;
    }
  } else if (asset.kind === "decal") {
    for (const face of faces) {
      const decals = Array.isArray(face?.bitmapDecals) ? face.bitmapDecals : [];
      const next = decals.filter((decal) => cleanKey(decal?.key) !== asset.key);
      if (next.length !== decals.length) {
        if (next.length) face.bitmapDecals = next;
        else delete face.bitmapDecals;
        changed = true;
      }
    }
  }
  return changed;
}

function clearDeletedAssetReferences(asset) {
  const changed = [];
  for (const model of listModelAssets()) {
    if (!mutateModelForDeletedAsset(model, asset)) continue;
    const filePath = path.join(root, "assets/models", model.file);
    fs.writeFileSync(filePath, `${JSON.stringify(model.data, null, 2)}\n`);
    changed.push({ id: model.id, name: model.name, file: model.file });
  }
  return changed;
}

async function skinUsage(req, res) {
  const params = new URL(req.url, `http://${host}:${port}`).searchParams;
  const file = params.get("file") || "";
  const asset = assetByFile(file);
  if (!asset) return sendJson(res, 404, { ok: false, error: "Asset file not found." });
  return sendJson(res, 200, {
    ok: true,
    asset,
    usage: usageForAsset(asset)
  });
}

async function deleteSkin(req, res) {
  const body = await readJsonBody(req);
  const asset = assetByFile(body.file);
  if (!asset) return sendJson(res, 404, { ok: false, error: "Asset file not found." });
  const dir = assetDirectory(asset);
  if (!dir) return sendJson(res, 400, { ok: false, error: "Unsupported asset type." });
  const filePath = path.resolve(dir, asset.file);
  if (!filePath.startsWith(dir + path.sep)) return sendJson(res, 403, { ok: false, error: "Forbidden asset path." });
  const usage = usageForAsset(asset);
  const changedModels = clearDeletedAssetReferences(asset);
  fs.unlinkSync(filePath);
  const steps = await rebuildScope("all");
  return sendJson(res, 200, {
    ok: true,
    deleted: path.relative(root, filePath),
    asset,
    usage,
    changedModels,
    steps
  });
}

async function saveModel(req, res, modelId) {
  const body = await readJsonBody(req);
  const cleanId = cleanKey(modelId || body.id);
  if (!cleanId) return sendJson(res, 400, { ok: false, error: "Missing model id." });
  if (!body || !Array.isArray(body.verts) || !Array.isArray(body.faces)) {
    return sendJson(res, 400, { ok: false, error: "Model JSON must include verts and faces arrays." });
  }
  const data = { ...body, id: cleanId };
  const filePath = path.join(root, "assets/models", `${cleanId}.ultraship.json`);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`);
  const steps = await rebuildScope("models");
  return sendJson(res, 200, {
    ok: true,
    model: cleanId,
    path: path.relative(root, filePath),
    steps
  });
}

async function getModels(req, res) {
  return sendJson(res, 200, {
    ok: true,
    models: listModelAssets().map((model) => ({
      id: model.id,
      name: model.name,
      file: model.file,
      data: model.data
    }))
  });
}

async function getModel(req, res, modelId) {
  const cleanId = cleanKey(modelId);
  const model = listModelAssets().find((item) => item.id === cleanId);
  if (!model) return sendJson(res, 404, { ok: false, error: "Model not found." });
  return sendJson(res, 200, {
    ok: true,
    id: model.id,
    name: model.name,
    file: model.file,
    data: model.data
  });
}

async function deleteModel(req, res, modelId) {
  const cleanId = cleanKey(modelId);
  if (!cleanId) return sendJson(res, 400, { ok: false, error: "Missing model id." });

  const deleted = [];
  const modelPath = path.join(root, "assets/models", `${cleanId}.ultraship.json`);
  if (fs.existsSync(modelPath)) {
    fs.unlinkSync(modelPath);
    deleted.push(path.relative(root, modelPath));
  }

  const skinDir = path.join(root, "assets/skins");
  if (fs.existsSync(skinDir)) {
    for (const file of fs.readdirSync(skinDir)) {
      const isSideSkin = file === `${cleanId}-top.png` || file === `${cleanId}-bottom.png` || file === `${cleanId}-back.png`;
      const isFaceSkin = file.startsWith(`${cleanId}-face-`) && file.endsWith(".png");
      if (!isSideSkin && !isFaceSkin) continue;
      const filePath = path.join(skinDir, file);
      fs.unlinkSync(filePath);
      deleted.push(path.relative(root, filePath));
    }
  }

  const steps = await rebuildScope("all");
  return sendJson(res, 200, {
    ok: true,
    model: cleanId,
    deleted,
    steps
  });
}

function decodePngDataUrl(dataUrl) {
  const match = String(dataUrl || "").match(/^data:image\/png;base64,([a-zA-Z0-9+/=]+)$/);
  if (!match) throw new Error("Expected a PNG data URL.");
  return Buffer.from(match[1], "base64");
}

function decodeImageDataUrl(dataUrl) {
  const match = String(dataUrl || "").match(/^data:(image\/(?:png|jpeg|jpg|svg\+xml));base64,([a-zA-Z0-9+/=]+)$/);
  if (!match) throw new Error("Expected a PNG, JPEG, or SVG image data URL.");
  return { mime: match[1], bytes: Buffer.from(match[2], "base64") };
}

function assetMimeMatchesFile(asset, mime) {
  const ext = path.extname(asset?.file || "").toLowerCase();
  if (ext === ".png") return mime === "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return mime === "image/jpeg" || mime === "image/jpg";
  if (ext === ".svg") return mime === "image/svg+xml";
  return false;
}

async function saveSkin(req, res) {
  const body = await readJsonBody(req);
  const model = cleanKey(body.model);
  const kind = body.kind === "side" ? "side" : "face";
  const side = cleanKey(body.side);
  const key = cleanKey(body.key);
  if (!model) return sendJson(res, 400, { ok: false, error: "Missing model id." });
  if (kind === "side" && !["top", "bottom", "back"].includes(side)) {
    return sendJson(res, 400, { ok: false, error: "Side skins must be top, bottom, or back." });
  }
  if (kind === "face" && !key) return sendJson(res, 400, { ok: false, error: "Missing face texture key." });
  const bytes = decodePngDataUrl(body.dataUrl);
  const filename = kind === "side" ? `${model}-${side}.png` : `${model}-face-${key}.png`;
  const filePath = path.join(root, "assets/skins", filename);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, bytes);
  const steps = await rebuildScope("skins");
  return sendJson(res, 200, {
    ok: true,
    path: path.relative(root, filePath),
    bytes: bytes.length,
    steps
  });
}

async function replaceSkin(req, res) {
  const body = await readJsonBody(req);
  const asset = assetByFile(body.file);
  if (!asset) return sendJson(res, 404, { ok: false, error: "Asset file not found." });
  const dir = assetDirectory(asset);
  if (!dir) return sendJson(res, 400, { ok: false, error: "Unsupported asset type." });
  const filePath = path.resolve(dir, asset.file);
  if (!filePath.startsWith(dir + path.sep)) return sendJson(res, 403, { ok: false, error: "Forbidden asset path." });
  const { mime, bytes } = decodeImageDataUrl(body.dataUrl);
  if (!assetMimeMatchesFile(asset, mime)) {
    return sendJson(res, 400, { ok: false, error: `Replacement image type must match ${path.extname(asset.file) || "asset"} file.` });
  }
  const usage = usageForAsset(asset);
  fs.writeFileSync(filePath, bytes);
  const steps = await rebuildScope("skins");
  return sendJson(res, 200, {
    ok: true,
    replaced: path.relative(root, filePath),
    asset,
    usage,
    bytes: bytes.length,
    steps
  });
}

function serveStatic(req, res) {
  const pathname = decodeRequestPath(req.url);
  const normalized = pathname === "/" ? "/dev.html" : pathname;
  const filePath = path.resolve(root, `.${normalized}`);
  if (!filePath.startsWith(root + path.sep) && filePath !== root) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }
  let finalPath = filePath;
  if (fs.existsSync(finalPath) && fs.statSync(finalPath).isDirectory()) {
    finalPath = path.join(finalPath, "index.html");
  }
  if (!fs.existsSync(finalPath) || !fs.statSync(finalPath).isFile()) {
    res.writeHead(404);
    res.end("Not found");
    return;
  }
  const ext = path.extname(finalPath).toLowerCase();
  res.writeHead(200, {
    "content-type": mimeTypes.get(ext) || "application/octet-stream",
    "cache-control": normalized.includes("/assets/") || normalized.includes("/src/generated/")
      ? "no-store"
      : "no-cache"
  });
  fs.createReadStream(finalPath).pipe(res);
}

const server = http.createServer(async (req, res) => {
  try {
    const pathname = decodeRequestPath(req.url);
    if (req.method === "GET" && pathname === "/api/status") {
      return sendJson(res, 200, {
        ok: true,
        name: "Ultra Elite local tool server",
        root,
        version: Date.now()
      });
    }
    if (req.method === "GET" && pathname === "/api/skins") {
      const skins = [...listSkinAssets(), ...listDecalAssets()];
      const categories = [...new Set(skins.map((skin) => skin.category))].sort((a, b) => a.localeCompare(b));
      return sendJson(res, 200, { ok: true, skins, categories });
    }
    if (req.method === "GET" && pathname === "/api/skins/usage") return skinUsage(req, res);
    const modelMatch = pathname.match(/^\/api\/models\/([^/]+)$/);
    if (req.method === "GET" && pathname === "/api/models") return getModels(req, res);
    if (req.method === "GET" && modelMatch) return getModel(req, res, modelMatch[1]);
    if (req.method === "POST" && modelMatch) return saveModel(req, res, modelMatch[1]);
    if (req.method === "DELETE" && modelMatch) return deleteModel(req, res, modelMatch[1]);
    if (req.method === "POST" && pathname === "/api/skins") return saveSkin(req, res);
    if (req.method === "PUT" && pathname === "/api/skins") return replaceSkin(req, res);
    if (req.method === "DELETE" && pathname === "/api/skins") return deleteSkin(req, res);
    if (req.method === "POST" && pathname === "/api/rebuild") {
      const body = await readJsonBody(req);
      const scope = ["models", "skins", "single", "all"].includes(body.scope) ? body.scope : "all";
      const steps = await rebuildScope(scope);
      return sendJson(res, 200, { ok: true, scope, steps });
    }
    if (req.method === "GET" || req.method === "HEAD") return serveStatic(req, res);
    sendJson(res, 405, { ok: false, error: "Method not allowed." });
  } catch (error) {
    sendJson(res, 500, {
      ok: false,
      error: error.message,
      stdout: error.stdout,
      stderr: error.stderr,
      code: error.code
    });
  }
});

server.listen(port, host, () => {
  console.log(`Ultra Elite local tool server running at http://${host}:${port}/`);
  console.log(`Tools Hub: http://${host}:${port}/tools/`);
  console.log(`Model Builder: http://${host}:${port}/tools/model-builder/`);
  console.log(`UV Painter: http://${host}:${port}/tools/uv-painter/`);
  console.log(`Legacy Ship Builder: http://${host}:${port}/tools/ship-builder/`);
});
