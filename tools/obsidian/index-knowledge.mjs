import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const nestedVaultRoot = path.join(projectRoot, "Ultra Elite Codex");
const vaultRoot = fs.existsSync(path.join(nestedVaultRoot, "Knowledge")) ? nestedVaultRoot : projectRoot;
const indexJsonRel = ".codex-index/knowledge-index.json";
const indexMdRel = "Knowledge/Index.md";
const ignoredDirs = new Set([".git", ".obsidian", "node_modules", ".codex-index"]);
const generatedMarkdown = new Set([indexMdRel]);

function toPosix(file) {
  return file.replace(/\\/g, "/");
}

function read(rel) {
  return fs.readFileSync(path.join(vaultRoot, rel), "utf8");
}

function write(rel, text) {
  const abs = path.join(vaultRoot, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, text);
}

function walk(dir, files = []) {
  for (const name of fs.readdirSync(dir)) {
    if (ignoredDirs.has(name)) continue;
    const abs = path.join(dir, name);
    const stat = fs.statSync(abs);
    if (stat.isDirectory()) walk(abs, files);
    else if (name.endsWith(".md")) {
      const rel = toPosix(path.relative(vaultRoot, abs));
      if (!generatedMarkdown.has(rel)) files.push(rel);
    }
  }
  return files;
}

function titleFor(rel, text) {
  const heading = text.match(/^#\s+(.+)$/m)?.[1]?.trim();
  return heading || path.posix.basename(rel, ".md");
}

function noteType(rel) {
  if (rel.startsWith("Knowledge/Maps/")) return "router";
  if (rel.startsWith("Skills/")) return "skill";
  if (rel.startsWith("Knowledge/Public/")) return "public";
  if (rel.startsWith("Knowledge/")) return "knowledge";
  return "root";
}

function wordCount(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function wikiLinks(text) {
  return [...text.matchAll(/\[\[([^\]]+)\]\]/g)].map((match) => {
    const [targetPart, aliasPart = ""] = match[1].split("|");
    const [target, heading = ""] = targetPart.split("#");
    return {
      raw: match[1],
      target: target.trim(),
      heading: heading.trim(),
      alias: aliasPart.trim(),
    };
  });
}

function tagsFor(text) {
  const tags = new Set();
  for (const match of text.matchAll(/(^|[\s(])#([A-Za-z][A-Za-z0-9_-]*)\b/g)) {
    tags.add(match[2].toLowerCase());
  }
  return [...tags].sort();
}

function headingsAndSections(text) {
  const lines = text.split(/\r?\n/);
  const headingRows = [];

  for (let index = 0; index < lines.length; index++) {
    const match = lines[index].match(/^(#{1,6})\s+(.+)$/);
    if (!match) continue;
    headingRows.push({
      level: match[1].length,
      text: match[2].trim(),
      line: index + 1,
      index,
    });
  }

  return headingRows.map((heading, index) => {
    const next = headingRows[index + 1]?.index ?? lines.length;
    const body = lines.slice(heading.index + 1, next).join("\n").trim();
    return {
      level: heading.level,
      heading: heading.text,
      line: heading.line,
      words: wordCount(body),
      text: body,
    };
  });
}

function linkTarget(rel, heading = "") {
  const target = rel.replace(/\.md$/i, "");
  return heading ? `${target}#${heading}` : target;
}

function wikiTarget(rel, label, heading = "") {
  const target = linkTarget(rel, heading);
  return `[[${target}|${label}]]`;
}

function buildIndex() {
  const files = walk(vaultRoot).sort();
  const records = files.map((rel) => {
    const abs = path.join(vaultRoot, rel);
    const text = read(rel);
    const sections = headingsAndSections(text);
    const links = wikiLinks(text);
    const lines = text.trimEnd().split(/\r?\n/).length;

    return {
      path: rel,
      title: titleFor(rel, text),
      type: noteType(rel),
      lines,
      words: wordCount(text),
      bytes: Buffer.byteLength(text),
      tags: tagsFor(text),
      headings: sections.map((section) => ({
        level: section.level,
        text: section.heading,
        line: section.line,
        words: section.words,
      })),
      links,
      backlinks: [],
      searchText: text.replace(/\s+/g, " ").trim(),
    };
  });

  const byStem = new Map();
  const byBase = new Map();
  for (const record of records) {
    const stem = record.path.replace(/\.md$/i, "");
    byStem.set(stem.toLowerCase(), record.path);
    const base = path.posix.basename(stem).toLowerCase();
    if (!byBase.has(base)) byBase.set(base, []);
    byBase.get(base).push(record.path);
  }

  function resolve(from, target) {
    if (!target) return null;
    let normalized = toPosix(target);
    if (normalized.endsWith(".md")) normalized = normalized.slice(0, -3);
    const direct = byStem.get(normalized.toLowerCase());
    if (direct) return direct;
    const relative = byStem.get(path.posix.join(path.posix.dirname(from), normalized).toLowerCase());
    if (relative) return relative;
    const baseMatches = byBase.get(path.posix.basename(normalized).toLowerCase()) || [];
    return baseMatches.length === 1 ? baseMatches[0] : null;
  }

  const byPath = new Map(records.map((record) => [record.path, record]));
  for (const record of records) {
    for (const link of record.links) {
      const resolved = resolve(record.path, link.target);
      if (resolved && byPath.has(resolved)) byPath.get(resolved).backlinks.push(record.path);
    }
  }
  for (const record of records) record.backlinks = [...new Set(record.backlinks)].sort();

  const stats = {
    files: records.length,
    bytes: records.reduce((sum, record) => sum + record.bytes, 0),
    links: records.reduce((sum, record) => sum + record.links.length, 0),
    headings: records.reduce((sum, record) => sum + record.headings.length, 0),
    tags: [...new Set(records.flatMap((record) => record.tags))].length,
  };

  return {
    schema: 1,
    vaultRoot,
    generatedBy: "tools/obsidian/index-knowledge.mjs",
    stats,
    records,
  };
}

function renderJson(index) {
  return `${JSON.stringify(index, null, 2)}\n`;
}

function renderMarkdown(index) {
  const groups = [
    ["Active Routers", "router"],
    ["Local Skills", "skill"],
    ["Active Knowledge", "knowledge"],
    ["Public Notes", "public"],
    ["Root Notes", "root"],
  ];

  const lines = [
    "# Knowledge Index",
    "up: [[Knowledge/00 Home|Knowledge Home]]",
    "related: [[Knowledge/Maps/Task Router|Task Router]], [[plantoindex|Plan To Index]]",
    "",
    "Generated by `npm run index:obsidian`; edit outside the auto-index markers only.",
    "",
    "<!-- AUTO-INDEX:START -->",
    `Indexed ${index.stats.files} notes, ${index.stats.headings} headings, ${index.stats.links} wiki links, and ${index.stats.tags} tags.`,
  ];

  const tagCounts = new Map();
  for (const record of index.records) {
    for (const tag of record.tags) tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
  }
  const commonTags = [...tagCounts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  if (commonTags.length) {
    lines.push("", "## Tags");
    for (const [tag, count] of commonTags) lines.push(`- #${tag} (${count})`);
  }

  for (const [title, type] of groups) {
    const records = index.records.filter((record) => record.type === type);
    if (!records.length) continue;
    lines.push("", `## ${title}`);
    for (const record of records) {
      const label = record.title.replace(/\|/g, "-");
      const link = wikiTarget(record.path, label);
      const bits = [`${record.words} words`];
      if (record.headings.length) bits.push(`${record.headings.length} headings`);
      if (record.tags.length) bits.push(record.tags.map((tag) => `#${tag}`).join(" "));
      lines.push(`- ${link} (${bits.join(", ")})`);
      for (const heading of record.headings.filter((item) => item.level === 2).slice(0, 6)) {
        const headingLabel = `${label} / ${heading.text}`.replace(/\|/g, "-");
        lines.push(`  - ${wikiTarget(record.path, headingLabel, heading.text)}`);
      }
    }
  }

  lines.push("<!-- AUTO-INDEX:END -->", "");
  return `${lines.join("\n")}`;
}

function ensureCurrent() {
  const index = buildIndex();
  const expectedJson = renderJson(index);
  const expectedMd = renderMarkdown(index);
  const actualJson = fs.existsSync(path.join(vaultRoot, indexJsonRel)) ? read(indexJsonRel) : "";
  const actualMd = fs.existsSync(path.join(vaultRoot, indexMdRel)) ? read(indexMdRel) : "";
  const stale = [];
  if (actualJson !== expectedJson) stale.push(indexJsonRel);
  if (actualMd !== expectedMd) stale.push(indexMdRel);
  return { index, expectedJson, expectedMd, stale };
}

function build() {
  const { index, expectedJson, expectedMd } = ensureCurrent();
  write(indexJsonRel, expectedJson);
  write(indexMdRel, expectedMd);
  console.log(
    `Knowledge index built: ${index.stats.files} notes, ${index.stats.headings} headings, ${index.stats.links} links.`
  );
}

function check() {
  const { stale } = ensureCurrent();
  if (stale.length) {
    console.error(`Knowledge index is stale: ${stale.join(", ")}`);
    console.error("Run `npm run index:obsidian`.");
    process.exit(1);
  }
  console.log("Knowledge index ok.");
}

function loadOrBuild() {
  const file = path.join(vaultRoot, indexJsonRel);
  if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, "utf8"));
  return buildIndex();
}

function search(query) {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) {
    console.error("Usage: node tools/obsidian/index-knowledge.mjs --search <query>");
    process.exit(1);
  }
  const tagFilters = terms
    .filter((term) => term.startsWith("tag:") || term.startsWith("#"))
    .map((term) => term.replace(/^tag:|^#/, ""));
  const textTerms = terms.filter((term) => !term.startsWith("tag:") && !term.startsWith("#"));

  const index = loadOrBuild();
  const matches = [];
  for (const record of index.records) {
    const recordTags = record.tags || [];
    if (tagFilters.some((tag) => !recordTags.includes(tag))) continue;
    const haystack = {
      title: record.title.toLowerCase(),
      path: record.path.toLowerCase(),
      headings: record.headings.map((heading) => heading.text).join(" ").toLowerCase(),
      tags: recordTags.join(" ").toLowerCase(),
      body: record.searchText.toLowerCase(),
    };
    let tagScore = 0;
    let textScore = 0;
    for (const tag of tagFilters) {
      if (recordTags.includes(tag)) tagScore += 40;
    }
    for (const term of textTerms) {
      if (haystack.title.includes(term)) textScore += 20;
      if (haystack.headings.includes(term)) textScore += 12;
      if (haystack.path.includes(term)) textScore += 8;
      if (haystack.body.includes(term)) textScore += 2;
    }
    if (textTerms.length && textScore === 0) continue;
    let score = tagScore + textScore;
    if (score > 0) {
      if (record.type === "router") score += 50;
      if (record.type === "skill") score += 25;
      if (record.type === "knowledge") score += 15;
      matches.push({ record, score });
    }
  }

  matches.sort((a, b) => b.score - a.score || a.record.path.localeCompare(b.record.path));
  for (const { record, score } of matches.slice(0, 12)) {
    const heading = record.headings.find((item) =>
      item.level > 1 &&
      terms.some((term) => item.text.toLowerCase().includes(term))
    );
    const suffix = heading ? `#${heading.text}` : "";
    const label = heading ? `${record.title} / ${heading.text}` : record.title;
    console.log(`${score.toString().padStart(3, " ")} ${record.type.padEnd(14)} ${wikiTarget(record.path, label, heading?.text || "")}`);
    if (suffix) console.log(`    ${record.path}${suffix}`);
    else console.log(`    ${record.path}`);
  }
}

const args = process.argv.slice(2);
if (!args.length || args.includes("--build")) build();
else if (args.includes("--check")) check();
else if (args.includes("--search")) search(args.slice(args.indexOf("--search") + 1).join(" "));
else {
  console.error("Usage: index-knowledge.mjs [--build|--check|--search <query>]");
  process.exit(1);
}
