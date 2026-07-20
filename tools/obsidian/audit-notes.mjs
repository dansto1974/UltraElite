import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const nestedVaultRoot = path.join(projectRoot, "Ultra Elite Codex");
const root = fs.existsSync(path.join(nestedVaultRoot, "Knowledge")) ? nestedVaultRoot : projectRoot;
const maxLines = 24;
const maxWords = 220;
const markdownFiles = [];

function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    if (name === ".git" || name === "node_modules" || name === ".obsidian") continue;
    const abs = path.join(dir, name);
    const stat = fs.statSync(abs);
    if (stat.isDirectory()) walk(abs);
    else if (name.endsWith(".md")) markdownFiles.push(abs);
  }
}

function wordCount(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

walk(root);

const failures = [];
const noteTargets = new Set();

for (const file of markdownFiles) {
  const rel = path.relative(root, file).replace(/\\/g, "/");
  noteTargets.add(rel.replace(/\.md$/i, ""));
  noteTargets.add(path.basename(rel, ".md"));
}

for (const file of markdownFiles.sort((a, b) => a.localeCompare(b))) {
  const rel = path.relative(root, file);
  const text = fs.readFileSync(file, "utf8");
  const lines = text.trimEnd().split(/\r?\n/).length;
  const words = wordCount(text);
  const hasBacklink = /\[\[[^\]]+\]\]/.test(text);
  const brokenLinks = [...text.matchAll(/\[\[([^\]|#]+)(?:[#|][^\]]*)?\]\]/g)]
    .map((match) => match[1].trim())
    .filter((target) => !noteTargets.has(target));

  if (lines > maxLines || words > maxWords || !hasBacklink || brokenLinks.length) {
    failures.push({ rel, lines, words, hasBacklink, brokenLinks });
  }
}

if (failures.length) {
  console.error("Obsidian note audit failed:");
  for (const item of failures) {
    console.error(
      `${item.rel}: ${item.lines} lines, ${item.words} words, links=${item.hasBacklink}` +
        (item.brokenLinks.length ? `, broken=${item.brokenLinks.join(", ")}` : "")
    );
  }
  process.exit(1);
}

console.log(`Obsidian note audit ok: ${markdownFiles.length} Markdown files checked.`);
