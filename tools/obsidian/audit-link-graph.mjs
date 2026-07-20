import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const nestedVaultRoot = path.join(projectRoot, "Ultra Elite Codex");
const root = fs.existsSync(path.join(nestedVaultRoot, "Knowledge")) ? nestedVaultRoot : projectRoot;
const copiedRoot = "Knowledge/Copied Codex";
const archiveCatalogue = `${copiedRoot}/Archive Catalogue.md`;
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

function numberedCopiedFolders() {
  const folders = new Map();

  for (const rel of markdownFiles) {
    if (!rel.startsWith(`${copiedRoot}/`)) continue;
    const basename = path.posix.basename(rel);
    const match = basename.match(/^(\d\d) /);
    if (!match) continue;

    const folder = path.posix.dirname(rel);
    if (!folders.has(folder)) folders.set(folder, []);
    folders.get(folder).push({ rel, number: Number(match[1]) });
  }

  return folders;
}

function nextTarget(rel) {
  for (const link of wikiLinks(read(rel))) {
    if (link.alias.toLowerCase() !== "next") continue;
    const resolved = resolveLink(rel, link.target);
    return resolved.file || null;
  }
  return null;
}

const startupReachable = reachableFrom(startupFiles);
const catalogueReachable = markdownSet.has(archiveCatalogue) ? reachableFrom([archiveCatalogue]) : new Set();
const copiedFolders = numberedCopiedFolders();
const catalogueLinks = new Set(linksByFile.get(archiveCatalogue) || []);

if (!markdownSet.has(archiveCatalogue)) {
  fail(`missing ${archiveCatalogue}`);
}

for (const rel of markdownFiles.filter((file) => file.startsWith("Knowledge/Maps/"))) {
  if (!startupReachable.has(rel)) fail(`${rel}: router is not reachable from startup`);
}

for (const [folder, entries] of [...copiedFolders.entries()].sort()) {
  const sorted = entries.sort((a, b) => a.number - b.number || a.rel.localeCompare(b.rel));
  const first = sorted.find((entry) => entry.number === 1)?.rel;
  const numbers = sorted.map((entry) => entry.number);
  const expected = Array.from({ length: sorted.length }, (_, index) => index + 1);
  const byNumber = new Map(sorted.map((entry) => [entry.number, entry.rel]));

  if (!first) {
    fail(`${folder}: missing 01 entry note`);
    continue;
  }

  if (numbers.join(",") !== expected.join(",")) {
    fail(`${folder}: skipped or duplicated numbers; found ${numbers.join(",")}`);
  }

  if (!catalogueLinks.has(first)) {
    fail(`${folder}: 01 entry is missing from Archive Catalogue`);
  }

  if (!startupReachable.has(first) && !catalogueReachable.has(first)) {
    fail(`${folder}: 01 entry is not reachable from startup or Archive Catalogue`);
  }

  for (let number = 1; number <= sorted.length; number++) {
    const rel = byNumber.get(number);
    if (!rel) continue;

    const next = nextTarget(rel);
    const expectedNext = byNumber.get(number + 1) || null;

    if (next !== expectedNext) {
      const label = next || "missing";
      fail(`${rel}: next chain expected ${expectedNext || "end"} but found ${label}`);
    }
  }
}

for (const [folder, entries] of copiedFolders) {
  const first = entries.find((entry) => entry.number === 1)?.rel;
  if (!first) continue;

  const text = read(first);
  const upLinks = wikiLinks(text).filter((link) => /^up:\s*\[\[/.test(text.split(/\r?\n/).find((line) => line.includes(`[[${link.raw}]]`)) || ""));

  for (const link of upLinks) {
    const up = resolveLink(first, link.target).file;
    if (!up || !up.startsWith("Knowledge/Maps/")) continue;
    const routerLinks = new Set(linksByFile.get(up) || []);
    if (!routerLinks.has(first) && !catalogueLinks.has(first)) {
      fail(`${first}: parent router ${up} does not link back and catalogue does not cover it`);
    }
  }
}

if (failures.length) {
  console.error("Obsidian link graph audit failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(
  `Obsidian link graph audit ok: ${markdownFiles.length} Markdown files, ${copiedFolders.size} copied index chains.`
);
