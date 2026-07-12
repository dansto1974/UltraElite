import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../..");

const paths = {
  template: path.join(root, "src/index.template.html"),
  css: path.join(root, "src/game.css"),
  js: path.join(root, "src/main.js"),
  generatedAssets: path.join(root, "src/generated/bitmap-skins.js"),
  output: path.join(root, "index.html"),
  devOutput: path.join(root, "dev.html"),
};

function read(file) {
  return fs.readFileSync(file, "utf8").trimEnd();
}

const template = fs.readFileSync(paths.template, "utf8");
const css = read(paths.css);
const js = read(paths.js);
const generatedAssets = fs.existsSync(paths.generatedAssets) ? read(paths.generatedAssets) : "globalThis.ULTRA_ELITE_BITMAP_SKINS = {};";

if (!template.includes("__ULTRA_ELITE_CSS__") || !template.includes("__ULTRA_ELITE_JS__") || !template.includes("__ULTRA_ELITE_GENERATED_ASSETS__")) {
  throw new Error("Template is missing one or more build placeholders.");
}

if (js.toLowerCase().includes("</script>")) {
  throw new Error("src/main.js contains </script>, which would break the single-file build.");
}

if (css.toLowerCase().includes("</style>")) {
  throw new Error("src/game.css contains </style>, which would break the single-file build.");
}

const html = template
  .replace("__ULTRA_ELITE_CSS__", css)
  .replace("__ULTRA_ELITE_GENERATED_ASSETS__", generatedAssets)
  .replace("__ULTRA_ELITE_JS__", js);

const devHtml = template
  .replace("  <style>\n__ULTRA_ELITE_CSS__\n  </style>", '  <link rel="stylesheet" href="src/game.css">')
  .replace("  <script>\n__ULTRA_ELITE_GENERATED_ASSETS__\n  </script>", '  <script src="src/generated/bitmap-skins.js"></script>')
  .replace("  <script>\n__ULTRA_ELITE_JS__\n  </script>", '  <script src="src/main.js"></script>');

fs.writeFileSync(paths.output, html);
fs.writeFileSync(paths.devOutput, devHtml);

console.log(`Built ${path.relative(root, paths.output)} from modular sources`);
console.log(`Built ${path.relative(root, paths.devOutput)} for local modular testing`);
console.log(`CSS ${css.length.toLocaleString()} chars, JS ${js.length.toLocaleString()} chars, HTML ${html.length.toLocaleString()} chars`);
