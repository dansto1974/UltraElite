import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const nestedVaultRoot = path.join(projectRoot, "Ultra Elite Codex");
const vaultRoot = fs.existsSync(path.join(nestedVaultRoot, "Knowledge")) ? nestedVaultRoot : projectRoot;
const copiedRoot = path.join(vaultRoot, "Knowledge/Copied Codex");
const publicReadmeRoot = path.join(vaultRoot, "Knowledge/Public/README Archive");
const generatedMarker = "<!-- GENERATED-BY: tools/obsidian/collate-knowledge-notes.mjs -->";
const generatedMarkers = [generatedMarker];
const collator = new Intl.Collator("en", { numeric: true, sensitivity: "base" });

const topicRoutes = new Map([
  ["codex-audio", ["Knowledge/Audio/Audio Notes.md", "Audio Notes", "Knowledge/Maps/Audio Router"]],
  ["codex-checkpoints", ["Knowledge/Handover/Checkpoint Notes.md", "Checkpoint Notes", "Knowledge/Handover/Handover Hub"]],
  ["codex-current", ["Knowledge/Current/Current Notes.md", "Current Notes", "Knowledge/Maps/Current Direction"]],
  ["codex-doc-coverage", ["Knowledge/Docs/Doc Coverage Notes.md", "Doc Coverage Notes", "Knowledge/Maps/Repo Boundaries"]],
  ["codex-doc-hygiene", ["Knowledge/Docs/Doc Hygiene Notes.md", "Doc Hygiene Notes", "Knowledge/Maps/Repo Boundaries"]],
  ["codex-fragile-areas", ["Knowledge/Fragile Areas/Fragile Areas Notes.md", "Fragile Areas Notes", "Knowledge/Maps/Fragile Areas Router"]],
  ["codex-handoff", ["Knowledge/Handover/Handoff Notes.md", "Handoff Notes", "Knowledge/Handover/Handover Hub"]],
  ["codex-performance", ["Knowledge/Performance/Performance Notes.md", "Performance Notes", "Knowledge/Maps/Performance Router"]],
  ["codex-release", ["Knowledge/Release/Release Notes.md", "Release Notes", "Knowledge/Maps/Release Router"]],
  ["codex-rendering", ["Knowledge/Render/Rendering Notes.md", "Rendering Notes", "Knowledge/Maps/Render Router"]],
  ["codex-request-log", ["Knowledge/Requests/Request Log.md", "Request Log", "Knowledge/Maps/Task Router"]],
  ["codex-source-fidelity", ["Knowledge/Source Fidelity/Source Fidelity Notes.md", "Source Fidelity Notes", "Knowledge/Maps/Source Fidelity Router"]],
  ["lessons", ["Knowledge/Lessons/Lessons Notes.md", "Lessons Notes", "Knowledge/Maps/Lessons Router"]],
  ["project", ["Knowledge/Project/Project Notes.md", "Project Notes", "project"]],
  ["project-memory", ["Knowledge/Project/Project Memory Notes.md", "Project Memory Notes", "PROJECT_MEMORY"]],
  ["readme", ["Knowledge/Public/README Source Notes.md", "README Source Notes", "Knowledge/Public/Public Overview"]],
  ["renderpath", ["Knowledge/Render/Renderpath Notes.md", "Renderpath Notes", "Knowledge/Maps/Render Router"]],
  ["renderpath-authoring-tools", ["Knowledge/Ship Builder/Authoring Tools.md", "Authoring Tools", "Knowledge/Maps/Ship Builder Router"]],
  ["renderpath-generated-data", ["Knowledge/Render/Generated Data Notes.md", "Generated Data Notes", "Knowledge/Maps/Render Router"]],
  ["renderpath-guardrails-direction", ["Knowledge/Render/Guardrails Direction Notes.md", "Guardrails Direction Notes", "Knowledge/Maps/Render Router"]],
  ["renderpath-mirroring-naga", ["Knowledge/Render/Mirroring Naga Notes.md", "Mirroring Naga Notes", "Knowledge/Maps/Render Router"]],
  ["renderpath-runtime-drawing", ["Knowledge/Render/Runtime Drawing Notes.md", "Runtime Drawing Notes", "Knowledge/Maps/Render Router"]],
  ["renderpath-runtime-remap", ["Knowledge/Render/Runtime Remap Notes.md", "Runtime Remap Notes", "Knowledge/Maps/Render Router"]],
  ["renderpath-ship-builder-architecture", ["Knowledge/Ship Builder/Architecture Notes.md", "Ship Builder Architecture Notes", "Knowledge/Maps/Ship Builder Router"]],
  ["renderpath-ship-builder-command-map", ["Knowledge/Ship Builder/Command Map.md", "Command Map", "Knowledge/Maps/Ship Builder Router"]],
  ["renderpath-source-model-data", ["Knowledge/Render/Source Model Data Notes.md", "Source Model Data Notes", "Knowledge/Maps/Render Router"]],
  ["roadmap", ["Knowledge/Roadmap/Roadmap Notes.md", "Roadmap Notes", "Knowledge/Maps/Roadmap Router"]],
  ["roadmap-big-rocks", ["Knowledge/Roadmap/Big Rocks.md", "Big Rocks", "Knowledge/Maps/Roadmap Router"]],
  ["roadmap-done", ["Knowledge/Roadmap/Done Notes.md", "Done Notes", "Knowledge/Maps/Roadmap Router"]],
  ["roadmap-next", ["Knowledge/Roadmap/Next Notes.md", "Next Notes", "Knowledge/Maps/Roadmap Router"]],
  ["roadmap-skills", ["Knowledge/Roadmap/Skills Roadmap Notes.md", "Skills Roadmap Notes", "Knowledge/Maps/Roadmap Router"]],
  ["skills-index", ["Knowledge/Skills/Skills Index Notes.md", "Skills Index Notes", "Knowledge/Maps/Project Skills Router"]],
  ["skills-ultra-elite-audio-lab-skill", ["Knowledge/Skills/Ultra Elite Audio Lab Skill Notes.md", "Ultra Elite Audio Lab Skill Notes", "Knowledge/Maps/Project Skills Router"]],
  ["skills-ultra-elite-build-skill", ["Knowledge/Skills/Ultra Elite Build Skill Notes.md", "Ultra Elite Build Skill Notes", "Knowledge/Maps/Project Skills Router"]],
  ["skills-ultra-elite-cinematic-sequences-skill", ["Knowledge/Skills/Ultra Elite Cinematic Sequences Skill Notes.md", "Ultra Elite Cinematic Sequences Skill Notes", "Knowledge/Maps/Project Skills Router"]],
  ["skills-ultra-elite-dev-checkpoint-skill", ["Knowledge/Skills/Ultra Elite Dev Checkpoint Skill Notes.md", "Ultra Elite Dev Checkpoint Skill Notes", "Knowledge/Maps/Project Skills Router"]],
  ["skills-ultra-elite-performance-pass-skill", ["Knowledge/Skills/Ultra Elite Performance Pass Skill Notes.md", "Ultra Elite Performance Pass Skill Notes", "Knowledge/Maps/Project Skills Router"]],
  ["skills-ultra-elite-project-skill", ["Knowledge/Skills/Ultra Elite Project Skill Notes.md", "Ultra Elite Project Skill Notes", "Knowledge/Maps/Project Skills Router"]],
  ["skills-ultra-elite-release-skill", ["Knowledge/Skills/Ultra Elite Release Skill Notes.md", "Ultra Elite Release Skill Notes", "Knowledge/Maps/Project Skills Router"]],
  ["skills-ultra-elite-render-rules-skill", ["Knowledge/Skills/Ultra Elite Render Rules Skill Notes.md", "Ultra Elite Render Rules Skill Notes", "Knowledge/Maps/Project Skills Router"]],
  ["skills-ultra-elite-session-closeout-skill", ["Knowledge/Skills/Ultra Elite Session Closeout Skill Notes.md", "Ultra Elite Session Closeout Skill Notes", "Knowledge/Maps/Project Skills Router"]],
  ["skills-ultra-elite-source-check-skill", ["Knowledge/Skills/Ultra Elite Source Check Skill Notes.md", "Ultra Elite Source Check Skill Notes", "Knowledge/Maps/Project Skills Router"]],
  ["templates-new-game-doc-creation-plan", ["Knowledge/Templates/New Game Doc Creation Plan Notes.md", "New Game Doc Creation Plan Notes", "Knowledge/Maps/Template Router"]],
  ["templates-new-game-knowledge-base-structure", ["Knowledge/Templates/New Game Knowledge Base Structure Notes.md", "New Game Knowledge Base Structure Notes", "Knowledge/Maps/Template Router"]],
  ["templates-new-game-project-skills-summary", ["Knowledge/Templates/New Game Project Skills Summary Notes.md", "New Game Project Skills Summary Notes", "Knowledge/Maps/Template Router"]],
  ["templates-readme", ["Knowledge/Templates/README Template Notes.md", "README Template Notes", "Knowledge/Maps/Template Router"]],
  ["public-readme-archive", ["Knowledge/Public/README Notes.md", "README Notes", "Knowledge/Public/Public Overview"]],
]);

function toPosix(file) {
  return file.replace(/\\/g, "/");
}

function titleCase(value) {
  const keepUpper = new Set(["README", "UI", "UV", "LOD", "FPS", "QA"]);
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((word) => {
      const upper = word.toUpperCase();
      if (keepUpper.has(upper)) return upper;
      if (word.toLowerCase() === "codex") return "Codex";
      return `${word.slice(0, 1).toUpperCase()}${word.slice(1)}`;
    })
    .join(" ");
}

function routeFor(name) {
  const mapped = topicRoutes.get(name);
  if (mapped) return { rel: mapped[0], title: mapped[1], up: mapped[2] };
  const title = `${titleCase(name)} Notes`;
  return { rel: `Knowledge/Project/${title.replace(/[/:]/g, " -")}.md`, title, up: "Knowledge/Maps/Task Router" };
}

function tagsFor(name) {
  const tags = new Set(["reference"]);
  const lower = name.toLowerCase();
  if (lower.includes("audio")) tags.add("audio");
  if (lower.includes("render")) tags.add("render");
  if (lower.includes("ship-builder")) tags.add("ship-builder");
  if (lower.includes("release")) tags.add("release");
  if (lower.includes("source-fidelity")) tags.add("source-fidelity");
  if (lower.includes("performance")) tags.add("performance");
  if (lower.includes("roadmap")) tags.add("roadmap");
  if (lower.includes("template")) tags.add("template");
  if (lower.includes("skill")) tags.add("skill");
  if (lower.includes("lesson")) tags.add("lesson");
  if (lower.includes("handoff")) tags.add("handover");
  if (lower.includes("readme")) tags.add("public");
  return [...tags].sort();
}

function markdownFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith(".md"))
    .sort(collator.compare)
    .map((name) => path.join(dir, name));
}

function sourceLine(text) {
  return text.match(/^source:\s+`([^`]+)`/m)?.[1] || "";
}

function cleanPart(text) {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  let start = 0;

  if (/^#\s+/.test(lines[0] || "")) {
    start = 1;
    while (start < lines.length && lines[start].trim() !== "") start += 1;
    while (start < lines.length && lines[start].trim() === "") start += 1;
  }

  return lines
    .slice(start)
    .filter((line) => !/^(source|part|up|previous|next):\s/.test(line.trim()))
    .filter((line) => !line.includes("[[Knowledge/Copied Codex/"))
    .filter((line) => !line.includes("[[Knowledge/Public/README Archive/"))
    .join("\n")
    .replace(/^(#{1,5})\s+/gm, "$1# ")
    .trim();
}

function topicRecord(name, dir) {
  const files = markdownFiles(dir);
  if (!files.length) return null;

  const parts = files.map((file) => {
    const text = fs.readFileSync(file, "utf8");
    return {
      source: sourceLine(text),
      body: cleanPart(text),
    };
  });
  const route = routeFor(name);
  const sources = [...new Set(parts.map((part) => part.source).filter(Boolean))];
  const tags = tagsFor(name);

  return {
    name,
    rel: route.rel,
    title: route.title,
    up: route.up,
    files,
    sources,
    text: renderTopic({ name, title: route.title, up: route.up, parts, sources, tags }),
  };
}

function renderTopic({ name, title, up, parts, sources, tags }) {
  const lines = [
    generatedMarker,
    `# ${title}`,
    `up: [[${up}|${path.posix.basename(up)}]]`,
    "related: [[Knowledge/Index|Knowledge Index]]",
    `tags: ${tags.map((tag) => `#${tag}`).join(" ")}`,
    "",
    `Current project reference collated from ${parts.length} source note${parts.length === 1 ? "" : "s"}.`,
  ];

  if (sources.length) lines.push(`Original source${sources.length === 1 ? "" : "s"}: ${sources.map((source) => `\`${source}\``).join(", ")}`);

  lines.push("", "## Notes");

  for (const [index, part] of parts.entries()) {
    if (!part.body) continue;
    if (index > 0) lines.push("");
    lines.push(part.body);
  }

  lines.push("");
  return lines.join("\n");
}

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const name of fs.readdirSync(dir)) {
    if (name === ".git" || name === "node_modules" || name === ".obsidian" || name === ".codex-index") continue;
    const abs = path.join(dir, name);
    const stat = fs.statSync(abs);
    if (stat.isDirectory()) walk(abs, files);
    else if (name.endsWith(".md")) files.push(abs);
  }
  return files;
}

function removeGeneratedOutput() {
  for (const file of walk(vaultRoot)) {
    const text = fs.readFileSync(file, "utf8");
    if (generatedMarkers.some((marker) => text.includes(marker))) fs.unlinkSync(file);
  }
}

function discoverTopics() {
  const topics = [];

  if (fs.existsSync(copiedRoot)) {
    for (const name of fs.readdirSync(copiedRoot).sort(collator.compare)) {
      const abs = path.join(copiedRoot, name);
      if (fs.statSync(abs).isDirectory()) {
        const record = topicRecord(name, abs);
        if (record) topics.push(record);
      }
    }
  }

  const publicReadme = topicRecord("public-readme-archive", publicReadmeRoot);
  if (publicReadme) topics.push(publicReadme);

  return topics.sort((a, b) => collator.compare(a.rel, b.rel));
}

function build() {
  const topics = discoverTopics();
  removeGeneratedOutput();

  for (const topic of topics) {
    const abs = path.join(vaultRoot, topic.rel);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, topic.text);
  }

  console.log(`Collated ${topics.length} project reference topics into active knowledge routes.`);
  console.log(`Generated ${topics.map((topic) => topic.rel).join(", ")}`);
}

if (process.argv.includes("--build") || process.argv.length === 2) {
  build();
} else {
  console.error("Usage: node tools/obsidian/collate-knowledge-notes.mjs --build");
  process.exit(2);
}
