import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../..");
const registryPath = path.join(root, "tools/ship-builder/control-registry.json");

const args = new Map(process.argv.slice(2).map((arg) => {
  const match = arg.match(/^--([^=]+)=(.*)$/);
  return match ? [match[1], match[2]] : [arg.replace(/^--/, ""), "1"];
}));

const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const target = args.get("target") || "";
const surface = args.get("surface") || "";
const kind = args.get("kind") || "";
const family = args.get("family") || "";
const containerFilter = args.get("container") || "";
const controlType = args.get("control-type") || "";
const json = args.has("json");

const controlContainers = new Map();
for (const [containerId, container] of Object.entries(registry.containers || {})) {
  for (const controlId of container.controls || []) {
    const containers = controlContainers.get(controlId) || [];
    containers.push(containerId);
    controlContainers.set(controlId, containers);
  }
}

function rowsFor(entries, familyName) {
  return Object.entries(entries || {}).map(([id, entry]) => ({
    id,
    family: familyName,
    controlType: entry.controlType || "button",
    inputType: entry.inputType || "",
    surface: entry.surface,
    kind: entry.kind,
    controlRole: entry.controlRole || "",
    appliesTo: (entry.appliesTo || []).join(","),
    canonical: entry.canonical,
    container: (controlContainers.get(id) || []).join(","),
    propertyPath: entry.propertyPath || "",
    selector: entry.selector || "",
    selectionCommand: entry.selectionCommand || "",
    duplicate: entry.duplicateOf || entry.duplicates || ""
  }));
}

const rows = [
  ...rowsFor(registry.buttonControls, "button"),
  ...rowsFor(registry.fieldControls, "field"),
  ...rowsFor(registry.generatedControls, "generated"),
  ...rowsFor(registry.interactiveControls, "interactive")
]
  .filter((row) => !target || row.appliesTo.split(",").includes(target))
  .filter((row) => !surface || row.surface === surface)
  .filter((row) => !kind || row.kind === kind)
  .filter((row) => !family || row.family === family)
  .filter((row) => !containerFilter || row.container.split(",").includes(containerFilter))
  .filter((row) => !controlType || row.controlType === controlType || row.inputType === controlType)
  .sort((a, b) => a.appliesTo.localeCompare(b.appliesTo) || a.container.localeCompare(b.container) || a.surface.localeCompare(b.surface) || a.family.localeCompare(b.family) || a.id.localeCompare(b.id));

if (json) {
  console.log(JSON.stringify(rows, null, 2));
} else {
  console.table(rows);
  console.log(`${rows.length} controls${target ? ` applying to ${target}` : ""}${surface ? ` on ${surface}` : ""}${kind ? ` with kind ${kind}` : ""}${family ? ` in ${family}` : ""}${containerFilter ? ` in container ${containerFilter}` : ""}${controlType ? ` with control type ${controlType}` : ""}.`);
}
