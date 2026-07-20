import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const nestedVaultRoot = path.join(projectRoot, "Ultra Elite Codex");
const root = fs.existsSync(path.join(nestedVaultRoot, "Knowledge")) ? nestedVaultRoot : projectRoot;
const skillsDir = path.join(root, "Skills");
const failures = [];
const closedProjectPath = ["/Users/dan/Documents", "Browser " + "Elite"].join("/");
const oldExternalCodexPath = ["/Users/dan/Documents", "Ultra Elite Codex"].join("/");
const stalePatterns = [
  [/standalone Ultra Elite copy|standalone Obsidian copy|standalone copy/i, "stale standalone-copy wording"],
  [new RegExp(closedProjectPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), "routes to closed legacy project"],
  [
    new RegExp(`${oldExternalCodexPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:/|\`|\\s|$)`),
    "routes to old external private Codex docs",
  ],
  [/node tools\/obsidian\/audit-notes\.mjs/, "uses partial note audit instead of npm run audit:obsidian"],
];

for (const name of fs.readdirSync(skillsDir).sort()) {
  const dir = path.join(skillsDir, name);
  if (!fs.statSync(dir).isDirectory()) continue;

  const file = path.join(dir, "SKILL.md");
  if (!fs.existsSync(file)) {
    failures.push(`${name}: missing SKILL.md`);
    continue;
  }

  const text = fs.readFileSync(file, "utf8");
  const match = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) {
    failures.push(`${name}: missing YAML frontmatter`);
    continue;
  }

  const frontmatter = match[1];
  const skillName = frontmatter.match(/^name:\s*(.+)$/m)?.[1]?.trim();
  const description = frontmatter.match(/^description:\s*(.+)$/m)?.[1]?.trim();

  if (skillName !== name) failures.push(`${name}: frontmatter name is ${skillName || "missing"}`);
  if (!description) failures.push(`${name}: missing description`);
  if (!/\[\[[^\]]+\]\]/.test(text)) failures.push(`${name}: missing Obsidian links`);
  for (const [pattern, label] of stalePatterns) {
    if (pattern.test(text)) failures.push(`${name}: ${label}`);
  }
  for (const line of text.split(/\r?\n/)) {
    if (/hand-edit generated `?index\.html`?/i.test(line) && !/do not|never/i.test(line)) {
      failures.push(`${name}: permits hand-editing generated index.html`);
    }
  }
  if (name === "ultra-elite-build" && !/npm run build[\s\S]*npm run check[\s\S]*git diff --check[\s\S]*inline app script syntax ok/.test(text)) {
    failures.push(`${name}: missing release/checkpoint validation chain`);
  }
  if (name === "ultra-elite-project" && !/Start replies with `considering: `/.test(text)) {
    failures.push(`${name}: missing considering route announcement rule`);
  }
  if (name === "ultra-elite-release" && !/\[\[Skills\/ultra-elite-build\/SKILL\|ultra-elite-build\]\]/.test(text)) {
    failures.push(`${name}: release skill must route through ultra-elite-build before publish`);
  }
}

if (failures.length) {
  console.error("Local skill audit failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Local skill audit ok.");
