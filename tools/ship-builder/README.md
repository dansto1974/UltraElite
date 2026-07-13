# Ultra Elite Ship Builder

Project-native model authoring tool for Ultra Elite custom ships.

Open `tools/ship-builder/index.html` directly in a browser. The builder keeps ships X-axis symmetrical, provides a rotatable 3D preview plus top/front/side orthographic views, and exports:

- editable `.ultraship.json` builder data
- paste-ready `buildBlueprint({ ... })` geometry for `src/main.js`
- `gameMeta` hints for stats, role lists, AI profile, decals, base hull colour, price/value and Project X mission/easter-egg intent

Use this before trying generic OBJ/FBX import. The game renderer expects deliberate low-poly blueprint data, not arbitrary CAD remeshing.

Model assets are source-of-truth JSON files in `assets/models/*.ultraship.json`.

Workflow:

1. Edit or import a ship/object in the builder.
2. Download the `.ultraship.json` export.
3. Save it as `assets/models/<id>.ultraship.json`.
4. Run `npm run build`.

The build regenerates `tools/ship-builder/game-model-library.js` for the workshop and `src/generated/model-library.js` for the game runtime before creating `index.html`.

Avoid one-off runtime model exceptions. If an object is rendered as a model in the game, it belongs in `assets/models`.
