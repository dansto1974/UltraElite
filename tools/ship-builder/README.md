# Ultra Elite Ship Builder

Project-native model authoring tool for Ultra Elite custom ships.

Run the local tool server with `npm run dev:tools`, then open `http://127.0.0.1:8765/tools/ship-builder/`. The builder keeps ships X-axis symmetrical, provides a rotatable 3D preview plus top/front/side orthographic views, and can save directly into the project.

The Advanced export panel still provides fallback builder JSON / `buildBlueprint({ ... })` text, but normal project work should use the header `Save Model` button. Direct save writes `assets/models/<id>.ultraship.json` and regenerates the generated model libraries through the local server.

Use this before trying generic OBJ/FBX import. The game renderer expects deliberate low-poly blueprint data, not arbitrary CAD remeshing.

Model assets are source-of-truth JSON files in `assets/models/*.ultraship.json`.

Workflow:

1. Edit or import a ship/object in the builder.
2. Click `Save Model` and confirm the overwrite.
3. Use `Rebuild Game` when you want regenerated `dev.html` and `index.html` as well.

`Save Model` regenerates `tools/ship-builder/game-model-library.js` for the workshop and `src/generated/model-library.js` for the game runtime. `Rebuild Game` also regenerates bitmap manifests plus the playable HTML artefacts.

Avoid one-off runtime model exceptions. If an object is rendered as a model in the game, it belongs in `assets/models`.
