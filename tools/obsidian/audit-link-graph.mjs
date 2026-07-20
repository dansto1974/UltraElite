import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const nestedVaultRoot = path.join(projectRoot, "Ultra Elite Codex");
const root = fs.existsSync(path.join(nestedVaultRoot, "Knowledge")) ? nestedVaultRoot : projectRoot;
const startupFiles = ["project.md", "Knowledge/Maps/Task Router.md"];
const failures = [];

function toPosix(file) {
  return file.replace(/\\/g, "/");
}

function walk(dir, files = []) {
  for (const name of fs.readdirSync(dir)) {
    if (name === ".git" || name === "node_modules" || name === ".obsidian") continue;
    const abs = path.join(dir, name);
    const stat = fs.statSync(abs);
    if (stat.isDirectory()) walk(abs, files);
    else if (name.endsWith(".md")) files.push(toPosix(path.relative(root, abs)));
  }
  return files;
}

function read(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

function wikiLinks(text) {
  return [...text.matchAll(/\[\[([^\]]+)\]\]/g)].map((match) => {
    const [targetPart, aliasPart = ""] = match[1].split("|");
    return {
      raw: match[1],
      target: targetPart.split("#")[0].trim(),
      alias: aliasPart.trim(),
    };
  });
}

function fail(message) {
  failures.push(message);
}

const markdownFiles = walk(root).sort();
const markdownSet = new Set(markdownFiles);
const byPath = new Map();
const byBasename = new Map();

for (const rel of markdownFiles) {
  const noExt = rel.replace(/\.md$/i, "");
  byPath.set(noExt.toLowerCase(), rel);

  const base = path.posix.basename(noExt).toLowerCase();
  if (!byBasename.has(base)) byBasename.set(base, []);
  byBasename.get(base).push(rel);
}

function resolveLink(from, target) {
  let normalized = toPosix(target);
  if (normalized.endsWith(".md")) normalized = normalized.slice(0, -3);

  const direct = byPath.get(normalized.toLowerCase());
  if (direct) return { file: direct };

  const relative = byPath.get(path.posix.join(path.posix.dirname(from), normalized).toLowerCase());
  if (relative) return { file: relative };

  const basenameMatches = byBasename.get(path.posix.basename(normalized).toLowerCase()) || [];
  if (basenameMatches.length === 1) return { file: basenameMatches[0] };
  if (basenameMatches.length > 1) return { ambiguous: basenameMatches };

  return {};
}

const linksByFile = new Map();

for (const rel of markdownFiles) {
  const out = [];
  for (const link of wikiLinks(read(rel))) {
    if (!link.target) continue;
    const resolved = resolveLink(rel, link.target);
    if (resolved.file) {
      out.push(resolved.file);
    } else if (resolved.ambiguous) {
      fail(`${rel}: ambiguous link [[${link.raw}]] -> ${resolved.ambiguous.join(", ")}`);
    } else {
      fail(`${rel}: unresolved link [[${link.raw}]]`);
    }
  }
  linksByFile.set(rel, [...new Set(out)]);
}

function reachableFrom(starts) {
  const seen = new Set();
  const queue = [];

  for (const start of starts) {
    if (!markdownSet.has(start)) {
      fail(`missing startup file: ${start}`);
      continue;
    }
    seen.add(start);
    queue.push(start);
  }

  for (let index = 0; index < queue.length; index++) {
    const current = queue[index];
    for (const next of linksByFile.get(current) || []) {
      if (seen.has(next)) continue;
      seen.add(next);
      queue.push(next);
    }
  }

  return seen;
}

const startupReachable = reachableFrom(startupFiles);

for (const rel of markdownFiles.filter((file) => file.startsWith("Knowledge/Maps/"))) {
  if (!startupReachable.has(rel)) fail(`${rel}: router is not reachable from startup`);
}

if (failures.length) {
  console.error("Obsidian link graph audit failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  `Obsidian link graph audit ok: ${markdownFiles.length} Markdown files.`
);
