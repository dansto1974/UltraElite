import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../..");
const shipBuilderDir = path.join(root, "tools/ship-builder");
const htmlPath = path.join(shipBuilderDir, "index.html");
const jsPath = path.join(shipBuilderDir, "ship-builder.js");
const registryPath = path.join(shipBuilderDir, "control-registry.json");

function read(file) {
  return fs.readFileSync(file, "utf8");
}

function unique(values) {
  return [...new Set(values)];
}

function fail(errors) {
  if (!errors.length) return;
  throw new Error(`Ship Builder control registry audit failed:\n- ${errors.join("\n- ")}`);
}

const html = read(htmlPath);
const js = read(jsPath);
const registry = JSON.parse(read(registryPath));
const controls = registry.buttonControls || {};
const errors = [];

const htmlIds = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]));
const htmlButtonIds = unique([...html.matchAll(/<button\b[^>]*\bid="([^"]+)"/g)].map((match) => match[1])).sort();
const registryButtonIds = Object.keys(controls).sort();

for (const id of htmlButtonIds) {
  if (!controls[id]) errors.push(`Button #${id} exists in tools/ship-builder/index.html but is missing from control-registry.json.`);
}

for (const id of registryButtonIds) {
  if (!htmlButtonIds.includes(id)) errors.push(`control-registry.json declares button #${id}, but no matching <button id="${id}"> exists.`);
  const entry = controls[id];
  for (const field of ["surface", "kind", "canonical"]) {
    if (!entry?.[field]) errors.push(`Button #${id} registry entry is missing ${field}.`);
  }
}

const duplicateGroups = new Map();
for (const [id, entry] of Object.entries(controls)) {
  const canonical = entry.canonical;
  if (!canonical) continue;
  if (!duplicateGroups.has(canonical)) duplicateGroups.set(canonical, []);
  duplicateGroups.get(canonical).push({ id, entry });
}

for (const [canonical, group] of duplicateGroups) {
  if (group.length < 2) continue;
  const primaries = group.filter((item) => item.entry.duplicates === "primary");
  if (primaries.length !== 1) {
    errors.push(`Duplicate canonical action "${canonical}" must declare exactly one primary entry.`);
    continue;
  }
  const primaryId = primaries[0].id;
  for (const item of group) {
    if (item.id === primaryId) continue;
    if (item.entry.duplicateOf !== primaryId) {
      errors.push(`Duplicate button #${item.id} for "${canonical}" must declare duplicateOf: "${primaryId}".`);
    }
  }
}

const commandBlock = js.match(/const SELECTION_COMMANDS = \[([\s\S]*?)\n\];/);
if (!commandBlock) {
  errors.push("Could not find SELECTION_COMMANDS in ship-builder.js.");
} else {
  const selectionCommandIds = new Set([...commandBlock[1].matchAll(/\bid:\s*"([^"]+)"/g)].map((match) => match[1]));
  for (const [id, entry] of Object.entries(controls)) {
    if (entry.selectionCommand && !selectionCommandIds.has(entry.selectionCommand)) {
      errors.push(`Button #${id} references missing SELECTION_COMMANDS id "${entry.selectionCommand}".`);
    }
  }
}

const domRefs = unique([
  ...[...js.matchAll(/document\.getElementById\("([^"]+)"\)/g)].map((match) => match[1]),
  ...[...js.matchAll(/document\.getElementById\('([^']+)'\)/g)].map((match) => match[1])
]).sort();
for (const id of domRefs) {
  if (!htmlIds.has(id)) errors.push(`ship-builder.js references missing DOM id #${id}.`);
}

fail(errors);
console.log(`Ship Builder control registry ok: ${htmlButtonIds.length} buttons, ${duplicateGroups.size} canonical actions.`);
