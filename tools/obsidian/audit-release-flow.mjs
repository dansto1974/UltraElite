import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const nestedVaultRoot = path.join(projectRoot, "Ultra Elite Codex");
const root = fs.existsSync(path.join(nestedVaultRoot, "Knowledge")) ? nestedVaultRoot : projectRoot;
const failures = [];

function read(rel) {
  return fs.readFileSync(path.join(root, rel), "utf8");
}

function fail(message) {
  failures.push(message);
}

function mustContain(file, pattern, label) {
  const text = read(file);
  if (!pattern.test(text)) fail(`${file}: missing ${label}`);
  return text;
}

mustContain("project.md", /\[\[Knowledge\/Maps\/Task Router\|Task Router\]\]/, "Task Router startup link");
mustContain("Knowledge/Maps/Task Router.md", /\[\[Knowledge\/Maps\/Fresh Task Contract\|Fresh Task Contract\]\]/, "Fresh Task Contract link");
mustContain("Knowledge/Maps/Task Router.md", /\[\[Knowledge\/Maps\/Release Router\|Release Router\]\]/, "Release Router route");
mustContain("Knowledge/Maps/Fresh Task Contract.md", /Announce the route with `considering: `/, "considering route announcement");
mustContain("Knowledge/Maps/Fresh Task Contract.md", /\[\[Skills\/ultra-elite-build\/SKILL\|ultra-elite-build\]\]/, "build skill route");
mustContain("Knowledge/Maps/Fresh Task Contract.md", /\[\[Skills\/ultra-elite-release\/SKILL\|ultra-elite-release\]\]/, "release skill route");
mustContain("Knowledge/Maps/Release Router.md", /Build before every website publish\./, "build-before-publish rule");
mustContain("Skills/ultra-elite-project/SKILL.md", /Start replies with `considering: `/, "project considering rule");
mustContain("Skills/ultra-elite-release/SKILL.md", /\[\[Skills\/ultra-elite-build\/SKILL\|ultra-elite-build\]\]/, "release depends on build skill");

const buildSkill = mustContain("Skills/ultra-elite-build/SKILL.md", /Do not hand-edit generated `index\.html`/, "generated index guardrail");
for (const [command, label] of [
  ["npm run build", "build command"],
  ["npm run check", "check command"],
  ["git diff --check", "diff whitespace check"],
  ["inline app script syntax ok", "inline script validation"],
]) {
  if (!buildSkill.includes(command)) fail(`Skills/ultra-elite-build/SKILL.md: missing ${label}`);
}

const publishScriptPath = fs.existsSync(path.join(projectRoot, "tools/publish-site.mjs"))
  ? path.join(projectRoot, "tools/publish-site.mjs")
  : path.join(path.dirname(root), "tools/publish-site.mjs");
const publishScript = fs.readFileSync(publishScriptPath, "utf8");
if (!/indexPath\s*=\s*path\.join\(projectRoot,\s*"index\.html"\)/.test(publishScript)) {
  fail("tools/publish-site.mjs: publish source is not project index.html");
}
if (!/"--upload-file",\s*indexPath/.test(publishScript)) {
  fail("tools/publish-site.mjs: curl upload does not use indexPath");
}
if (!/remotePath\s*=\s*config\.ULTRA_ELITE_FTP_PATH\s*\|\|\s*"htdocs\/index\.html"/.test(publishScript)) {
  fail("tools/publish-site.mjs: default remote path is not htdocs/index.html");
}

if (failures.length) {
  console.error("Release flow audit failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Release flow audit ok.");
