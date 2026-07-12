import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../..");

const files = {
  devHtml: path.join(root, "dev.html"),
  template: path.join(root, "src/index.template.html"),
  css: path.join(root, "src/game.css"),
  js: path.join(root, "src/main.js"),
  generatedAssets: path.join(root, "src/generated/bitmap-skins.js"),
};

function read(file) {
  return fs.readFileSync(file, "utf8");
}

for (const file of Object.values(files)) {
  if (!fs.existsSync(file)) {
    throw new Error(`Missing ${path.relative(root, file)}`);
  }
}

const devHtml = read(files.devHtml);
const template = read(files.template);
const css = read(files.css);
const js = read(files.js);

if (!devHtml.includes('href="src/game.css"') || !devHtml.includes('src="src/main.js"')) {
  throw new Error("dev.html is not loading the modular CSS/JS sources.");
}
if (!devHtml.includes('src="src/generated/bitmap-skins.js"')) {
  throw new Error("dev.html is not loading the generated bitmap skin manifest.");
}

const cssPlaceholders = (template.match(/__ULTRA_ELITE_CSS__/g) || []).length;
const jsPlaceholders = (template.match(/__ULTRA_ELITE_JS__/g) || []).length;
const assetPlaceholders = (template.match(/__ULTRA_ELITE_GENERATED_ASSETS__/g) || []).length;
if (cssPlaceholders !== 1 || jsPlaceholders !== 1 || assetPlaceholders !== 1) {
  throw new Error("src/index.template.html must contain exactly one CSS and one JS placeholder.");
}

const expectedDevHtml = template
  .replace("  <style>\n__ULTRA_ELITE_CSS__\n  </style>", '  <link rel="stylesheet" href="src/game.css">')
  .replace("  <script>\n__ULTRA_ELITE_GENERATED_ASSETS__\n  </script>", '  <script src="src/generated/bitmap-skins.js"></script>')
  .replace("  <script>\n__ULTRA_ELITE_JS__\n  </script>", '  <script src="src/main.js"></script>');

if (devHtml !== expectedDevHtml) {
  throw new Error("dev.html is out of sync with src/index.template.html; run npm run build.");
}

if (js.toLowerCase().includes("</script>")) {
  throw new Error("src/main.js contains </script>, which would break inline builds.");
}

if (css.toLowerCase().includes("</style>")) {
  throw new Error("src/game.css contains </style>, which would break inline builds.");
}

if (!fs.existsSync(files.generatedAssets)) {
  throw new Error("Missing src/generated/bitmap-skins.js; run npm run skins or npm run build.");
}

new Function(js);
new Function(read(files.generatedAssets));

console.log("Ultra Elite modular source check passed");
