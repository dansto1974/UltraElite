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

function decodePngDataUrl(dataUrl) {
  const match = String(dataUrl || "").match(/^data:image\/png;base64,([a-zA-Z0-9+/=]+)$/);
  if (!match) throw new Error("Expected a PNG data URL.");
  return Buffer.from(match[1], "base64");
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
    const modelMatch = pathname.match(/^\/api\/models\/([^/]+)$/);
    if (req.method === "POST" && modelMatch) return saveModel(req, res, modelMatch[1]);
    if (req.method === "POST" && pathname === "/api/skins") return saveSkin(req, res);
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
  console.log(`Ship Builder: http://${host}:${port}/tools/ship-builder/`);
});
