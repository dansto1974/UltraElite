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

function sorted(values) {
  return [...values].sort();
}

function fail(errors) {
  if (!errors.length) return;
  throw new Error(`Ship Builder control registry audit failed:\n- ${errors.join("\n- ")}`);
}

const html = read(htmlPath);
const js = read(jsPath);
const registry = JSON.parse(read(registryPath));
const containers = registry.containers || {};
const controls = registry.buttonControls || {};
const fieldControls = registry.fieldControls || {};
const generatedControls = registry.generatedControls || {};
const interactiveControls = registry.interactiveControls || {};
const errors = [];
const allowedAppliesTo = new Set([
  "asset",
  "build",
  "detail",
  "edge",
  "face",
  "file",
  "global",
  "group",
  "history",
  "modal",
  "model",
  "property",
  "selection",
  "side",
  "startup",
  "uv",
  "vertex",
  "vertexGroup",
  "view"
]);
const allowedControlRoles = new Set(["action", "navigation", "property"]);

const htmlIds = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]));
const htmlButtonIds = unique([...html.matchAll(/<button\b[^>]*\bid="([^"]+)"/g)].map((match) => match[1])).sort();
const htmlIdTags = new Map([...html.matchAll(/<([a-zA-Z0-9-]+)\b[^>]*\bid="([^"]+)"[^>]*>/g)].map((match) => [match[2], match[1].toLowerCase()]));
const htmlFieldControls = unique([...html.matchAll(/<(input|select|textarea)\b([^>]*)\bid="([^"]+)"([^>]*)>/g)].map((match) => {
  const [, tag, beforeId, id, afterId] = match;
  const attrs = `${beforeId} ${afterId}`;
  return {
    id,
    controlType: tag,
    inputType: tag === "input" ? (attrs.match(/\btype="([^"]+)"/)?.[1] || "text").toLowerCase() : tag
  };
})).sort((a, b) => a.id.localeCompare(b.id));
const registryButtonIds = Object.keys(controls).sort();
const registryFieldIds = Object.keys(fieldControls).sort();
const registryGeneratedIds = Object.keys(generatedControls).sort();
const registryInteractiveIds = Object.keys(interactiveControls).sort();

function validateControlEntry(id, entry, label) {
  for (const field of ["surface", "kind", "canonical"]) {
    if (!entry?.[field]) errors.push(`${label} #${id} registry entry is missing ${field}.`);
  }
  if (!Array.isArray(entry?.appliesTo) || !entry.appliesTo.length) {
    errors.push(`${label} #${id} registry entry is missing non-empty appliesTo.`);
  } else {
    for (const target of entry.appliesTo) {
      if (!allowedAppliesTo.has(target)) errors.push(`${label} #${id} has unknown appliesTo target "${target}".`);
    }
  }
  if (entry?.controlRole && !allowedControlRoles.has(entry.controlRole)) {
    errors.push(`${label} #${id} has unknown controlRole "${entry.controlRole}".`);
  }
}

for (const id of htmlButtonIds) {
  if (!controls[id]) errors.push(`Button #${id} exists in tools/ship-builder/index.html but is missing from control-registry.json.`);
}

for (const id of registryButtonIds) {
  if (!htmlButtonIds.includes(id)) errors.push(`control-registry.json declares button #${id}, but no matching <button id="${id}"> exists.`);
  validateControlEntry(id, controls[id], "Button");
}

for (const field of htmlFieldControls) {
  if (!fieldControls[field.id]) errors.push(`${field.controlType} #${field.id} exists in tools/ship-builder/index.html but is missing from control-registry.json fieldControls.`);
}

for (const id of registryFieldIds) {
  const htmlField = htmlFieldControls.find((control) => control.id === id);
  if (!htmlField) {
    errors.push(`control-registry.json declares field #${id}, but no matching <input>, <select>, or <textarea> id exists.`);
    continue;
  }
  const entry = fieldControls[id];
  validateControlEntry(id, entry, "Field");
  if (entry.controlType !== htmlField.controlType) {
    errors.push(`Field #${id} registry controlType "${entry.controlType}" does not match HTML <${htmlField.controlType}>.`);
  }
  if (entry.inputType !== htmlField.inputType) {
    errors.push(`Field #${id} registry inputType "${entry.inputType}" does not match HTML type "${htmlField.inputType}".`);
  }
  if (!entry.propertyPath) errors.push(`Field #${id} registry entry is missing propertyPath.`);
}

for (const [id, entry] of Object.entries(generatedControls)) {
  validateControlEntry(id, entry, "Generated control");
  if (!entry.selector) errors.push(`Generated control #${id} registry entry is missing selector.`);
  if (!entry.controlType) errors.push(`Generated control #${id} registry entry is missing controlType.`);
  if (entry.selector && !html.includes(entry.selector.replace(/^#/, "id=\"").replace(/^\./, "class=\"").split("[")[0])) {
    const classMatch = entry.selector.match(/\.([a-zA-Z0-9_-]+)/);
    const idMatch = entry.selector.match(/#([a-zA-Z0-9_-]+)/);
    const nameMatch = entry.selector.match(/\[name="([^"]+)"\]/);
    const dataMatch = entry.selector.match(/\[([a-zA-Z0-9_-]+)(?:=|])/);
    const hasAnchor = (classMatch && html.includes(classMatch[1]))
      || (idMatch && htmlIds.has(idMatch[1]))
      || (nameMatch && html.includes(`name="${nameMatch[1]}"`))
      || (dataMatch && html.includes(dataMatch[1]));
    if (!hasAnchor) errors.push(`Generated control #${id} selector "${entry.selector}" does not appear to match the Ship Builder HTML.`);
  }
}

for (const [id, entry] of Object.entries(interactiveControls)) {
  validateControlEntry(id, entry, "Interactive control");
  if (!entry.controlType) errors.push(`Interactive control #${id} registry entry is missing controlType.`);
  if (!htmlIds.has(id)) {
    errors.push(`Interactive control #${id} is declared in control-registry.json, but no matching id exists in the Ship Builder HTML.`);
  }
  if (entry.controlType === "role-button") {
    const tag = htmlIdTags.get(id);
    const elementPattern = new RegExp(`<${tag}[^>]*\\bid="${id}"[^>]*>`, "i");
    const elementHtml = tag ? html.match(elementPattern)?.[0] || "" : "";
    if (!elementHtml.includes("role=\"button\"")) errors.push(`Interactive control #${id} is registered as role-button but the HTML element is missing role="button".`);
  }
}

const duplicateGroups = new Map();
for (const [id, entry] of Object.entries({ ...controls, ...interactiveControls })) {
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
  const selectionCommandTargets = new Map();
  for (const match of commandBlock[1].matchAll(/\bid:\s*"([^"]+)"[\s\S]*?targetTypes:\s*\[([^\]]*)\]/g)) {
    selectionCommandTargets.set(match[1], [...match[2].matchAll(/"([^"]+)"/g)].map((target) => target[1]));
  }
  const selectionCommandIds = new Set(selectionCommandTargets.keys());
  for (const [id, entry] of Object.entries(controls)) {
    if (entry.selectionCommand && !selectionCommandIds.has(entry.selectionCommand)) {
      errors.push(`Button #${id} references missing SELECTION_COMMANDS id "${entry.selectionCommand}".`);
    } else if (entry.selectionCommand) {
      const commandTargets = new Set(selectionCommandTargets.get(entry.selectionCommand) || []);
      for (const target of entry.appliesTo || []) {
        if (!commandTargets.has(target)) {
          errors.push(`Button #${id} appliesTo target "${target}" is not supported by SELECTION_COMMANDS "${entry.selectionCommand}" targetTypes [${sorted(commandTargets).join(", ")}].`);
        }
      }
    }
  }
}

const allRegisteredControls = {
  ...Object.fromEntries(Object.entries(controls).map(([id, entry]) => [id, { family: "button", entry }])),
  ...Object.fromEntries(Object.entries(fieldControls).map(([id, entry]) => [id, { family: "field", entry }])),
  ...Object.fromEntries(Object.entries(generatedControls).map(([id, entry]) => [id, { family: "generated", entry }])),
  ...Object.fromEntries(Object.entries(interactiveControls).map(([id, entry]) => [id, { family: "interactive", entry }]))
};
const containerAssignments = new Map();
if (!Object.keys(containers).length) {
  errors.push("control-registry.json is missing containers; every registered control must have an owning menu, toolbar, window, or modal container.");
}

for (const [containerId, container] of Object.entries(containers)) {
  for (const field of ["type", "surface"]) {
    if (!container?.[field]) errors.push(`Container #${containerId} is missing ${field}.`);
  }
  if (!Array.isArray(container?.appliesTo) || !container.appliesTo.length) {
    errors.push(`Container #${containerId} is missing non-empty appliesTo.`);
  } else {
    for (const target of container.appliesTo) {
      if (!allowedAppliesTo.has(target)) errors.push(`Container #${containerId} has unknown appliesTo target "${target}".`);
    }
  }
  if (!Array.isArray(container?.controls) || !container.controls.length) {
    errors.push(`Container #${containerId} is missing non-empty controls.`);
    continue;
  }
  for (const controlId of container.controls) {
    const registered = allRegisteredControls[controlId];
    if (!registered) {
      errors.push(`Container #${containerId} references unknown control "${controlId}".`);
      continue;
    }
    const assignments = containerAssignments.get(controlId) || [];
    assignments.push(containerId);
    containerAssignments.set(controlId, assignments);
    if (container.strictTargets === false) continue;
    const containerTargets = new Set(container.appliesTo || []);
    const controlTargets = registered.entry.appliesTo || [];
    const targetMatches = controlTargets.some((target) => containerTargets.has(target));
    const modalChromeAllowed = controlTargets.includes("modal") && (container.allowModalControls !== false);
    if (!targetMatches && !modalChromeAllowed) {
      errors.push(`Container #${containerId} applies to [${sorted(containerTargets).join(", ")}] but includes ${registered.family} control #${controlId} applying to [${sorted(controlTargets).join(", ")}].`);
    }
  }
}

for (const controlId of Object.keys(allRegisteredControls).sort()) {
  const assignments = containerAssignments.get(controlId) || [];
  const entry = allRegisteredControls[controlId].entry;
  if (!assignments.length && !entry.containerless) {
    errors.push(`Registered ${allRegisteredControls[controlId].family} control #${controlId} is not assigned to any container.`);
  }
  if (assignments.length > 1 && !entry.reusable) {
    errors.push(`Registered ${allRegisteredControls[controlId].family} control #${controlId} appears in multiple containers [${assignments.join(", ")}] but is not marked reusable.`);
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
console.log(`Ship Builder control registry ok: ${htmlButtonIds.length} buttons, ${htmlFieldControls.length} fields, ${registryGeneratedIds.length} generated control groups, ${registryInteractiveIds.length} interactive controls, ${Object.keys(containers).length} containers, ${duplicateGroups.size} canonical actions, appliesTo checked.`);
