import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../..");

const paths = {
  template: path.join(root, "src/index.template.html"),
  css: path.join(root, "src/game.css"),
  missionNpcDefinitions: path.join(root, "src/mission-npc-definitions.js"),
  js: path.join(root, "src/main.js"),
  generatedModels: path.join(root, "src/generated/model-library.js"),
  generatedSkins: path.join(root, "src/generated/bitmap-skins.js"),
  output: path.join(root, "index.html"),
  devOutput: path.join(root, "dev.html"),
};

function read(file) {
  return fs.readFileSync(file, "utf8").trimEnd();
}

const template = fs.readFileSync(paths.template, "utf8");
const css = read(paths.css);
const missionNpcDefinitions = read(paths.missionNpcDefinitions);
const js = read(paths.js);
const generatedModels = fs.existsSync(paths.generatedModels) ? read(paths.generatedModels) : "globalThis.ULTRA_ELITE_MODEL_BLUEPRINTS = {}; globalThis.ULTRA_ELITE_MODEL_NAMES = {};";
const generatedSkins = fs.existsSync(paths.generatedSkins) ? read(paths.generatedSkins) : "globalThis.ULTRA_ELITE_BITMAP_SKINS = {};";
const generatedAssets = `${generatedModels}\n${generatedSkins}`;
const devStamp = Date.now().toString(36);

if (!template.includes("__ULTRA_ELITE_CSS__") || !template.includes("__ULTRA_ELITE_JS__") || !template.includes("__ULTRA_ELITE_GENERATED_ASSETS__")) {
  throw new Error("Template is missing one or more build placeholders.");
}

if (`${missionNpcDefinitions}\n${js}`.toLowerCase().includes("</script>")) {
  throw new Error("Runtime JS sources contain </script>, which would break the single-file build.");
}

if (css.toLowerCase().includes("</style>")) {
  throw new Error("src/game.css contains </style>, which would break the single-file build.");
}

const html = template
  .replace("__ULTRA_ELITE_CSS__", css)
  .replace("__ULTRA_ELITE_GENERATED_ASSETS__", generatedAssets)
  .replace("__ULTRA_ELITE_JS__", `${missionNpcDefinitions}\n${js}`);

const devHtml = template
  .replace("<body>", '<body data-ultra-elite-mode="dev">')
  .replace("  <style>\n__ULTRA_ELITE_CSS__\n  </style>", `  <link rel="stylesheet" href="src/game.css?v=${devStamp}">`)
  .replace("  <script>\n__ULTRA_ELITE_GENERATED_ASSETS__\n  </script>", [
    `  <script src="src/generated/model-library.js?v=${devStamp}"></script>`,
    `  <script src="src/generated/bitmap-skins.js?v=${devStamp}"></script>`
  ].join("\n"))
  .replace("  <script>\n__ULTRA_ELITE_JS__\n  </script>", [
    `  <script src="src/mission-npc-definitions.js?v=${devStamp}"></script>`,
    `  <script src="src/main.js?v=${devStamp}"></script>`
  ].join("\n"));

fs.writeFileSync(paths.output, html);
fs.writeFileSync(paths.devOutput, devHtml);

console.log(`Built ${path.relative(root, paths.output)} from modular sources`);
console.log(`Built ${path.relative(root, paths.devOutput)} for local modular testing`);
console.log(`CSS ${css.length.toLocaleString()} chars, JS ${js.length.toLocaleString()} chars, HTML ${html.length.toLocaleString()} chars`);
