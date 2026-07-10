# Ultra Elite Ship Builder

Project-native model authoring tool for Ultra Elite custom ships.

Open `tools/ship-builder/index.html` directly in a browser. The builder keeps ships X-axis symmetrical, provides a rotatable 3D preview plus top/front/side orthographic views, and exports:

- editable `.ultraship.json` builder data
- paste-ready `buildBlueprint({ ... })` geometry for `index.html`
- `gameMeta` hints for stats, role lists, AI profile, decals, price/value and hidden mission/easter-egg intent

Use this before trying generic OBJ/FBX import. The game renderer expects deliberate low-poly blueprint data, not arbitrary CAD remeshing.
