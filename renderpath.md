# Ultra Elite Model, UV, And Render Path

This document describes the current ship/model bitmap path after the Naga UV repair checkpoint.

The important principle is simple: authoring tools should do the projection work and store explicit per-face UV data wherever possible. The browser renderer should render the resolved data, not rediscover the artist's intent from side labels, image sizes, or camera angle.

## Source Model Data

Editable model source lives in `assets/models/*.ultraship.json`.

The editable face records are the source of truth for bitmap authoring:

- `verts`: authored face vertex ids, in authored face order.
- `bitmapFaceKey`: named face texture in `assets/skins/<model>-face-<key>.png`.
- `bitmapSide`: routing label: `top`, `bottom`, or `back`.
- `bitmapUv`: explicit per-vertex UV coordinates for that face.
- `bitmapBaseW` / `bitmapBaseH`: the coordinate space for `bitmapUv`.
- `bitmapAngle`: legacy/extra rotation for generated face-local UVs. Avoid it when UVs are already baked to a bitmap.
- `bitmapMirrorX`: runtime mirror fold flag. Use sparingly; for per-face half-template art, prefer baking the mirrored UVs into `bitmapUv` and leaving this off.
- `faceColor`: solid fallback colour when the bitmap is missing, too distant, or intentionally disabled.
- `bitmapDecals`: reusable face-local decal overlays.

For baked face UVs, `bitmapUv.length` must match the number of face vertices. Invalid partial UV arrays are discarded by the Ship Builder and rejected by build checks.

## Authoring Tools

### Ship Builder

Main file: `tools/ship-builder/ship-builder.js`.

The Ship Builder has two kinds of preview:

- Old diagnostic bitmap modes draw directly from `state.faces`.
- Game Renderer mode sends a custom blueprint to `tools/ship-builder/render-preview.js`, which renders through the shared game renderer.

Game Renderer mode is the trusted preview. It must remain consistent with in-game rendering.

The builder export path is:

1. `derivedBlueprint()` builds a transient game blueprint from editable state.
2. It now includes `faces` as well as `verts`, `edges`, `edgeFaces`, and `normals`.
3. It copies face bitmap data into `imageProjection.faceSides`, `faceTextures`, `faceTextureUv`, `faceTextureBaseW`, `faceTextureBaseH`, `faceAngles`, `faceMirrorX`, `faceColors`, and `faceDecals`.
4. `render-preview.js` passes that blueprint to `UltraEliteRenderBench.renderFrame()`.

Including `faces` in the custom blueprint matters because the shared renderer rebuilds face vertex order from edges/normals. Without the source face list, UVs can attach to the wrong rebuilt vertex order.

For top/bottom/back group projection, `applyCurrentViewGroupUv()` uses the same full-model footprint space as template export: model bounds plus 8% margin, scaled to the template size. It must not normalize UVs to the selected face group bounds, or the painted template appears scaled down in-game.

### UV Painter

Main file: `tools/uv-painter/uv-painter.js`.

The UV Painter is for projection and UV baking, not for inventing runtime renderer behaviour.

For fixed top/bottom/back projections it uses `templateProjectionForCurrentView()`, matching the exported skin template footprint:

- full model bounds,
- 8% margin,
- `TEMPLATE_MAX_SIZE`,
- exported `bitmapBaseW` / `bitmapBaseH` matching that coordinate space.

The output is written back to source faces as `bitmapUv`, `bitmapBaseW`, `bitmapBaseH`, `bitmapSide`, and selected face texture metadata.

## Build And Generated Data

Main file: `tools/build/generate-model-library.mjs`.

The build converts editable model files into runtime data:

- `tools/ship-builder/game-model-library.js`
- `src/generated/model-library.js`
- embedded generated model data in `index.html` and `dev.html`

`sourceImageProjection(data)` reads source face bitmap fields and creates `blueprint.imageProjection`.

The generated `imageProjection` object is face-indexed in authored face order:

- `faceSides`
- `faceTextures`
- `faceTextureUv`
- `faceTextureBaseW`
- `faceTextureBaseH`
- `faceColors`
- `faceAngles`
- `faceMirrorX`
- `faceDecals`

These arrays must stay aligned with source `faces[]`. `npm run check` verifies that source model metadata, embedded blueprint metadata, and generated model-library metadata are in sync.

## Runtime Blueprint Build

Main file: `src/main.js`.

Runtime models are normalized by `buildBlueprint(data)`.

`buildBlueprint()` reconstructs drawable faces from `edges`, `edgeFaces`, and `normals`. During that process, it may rotate or reverse vertex order so that winding and normals work for culling and lighting.

That rebuild is correct for geometry, but dangerous for UVs: authored UV arrays are in source face vertex order.

`remapImageProjectionForBuiltFaces(data, entries)` fixes that by:

1. Reading the source face list from `data.faces`.
2. Mapping each authored UV point to its source vertex index.
3. Reordering the UVs to match the rebuilt renderer face order.
4. Remapping face-indexed bitmap metadata from normal/source face order to the compact built face order.

After this, `model.imageProjection` and `model.imageProjectionUV` are in renderer face order.

## Runtime UV Resolution

Main function: `buildProjectedImageDecalUV(...)` in `src/main.js`.

For each renderer face it resolves:

- broad side projection UVs for side skins,
- explicit authored `faceUv` for per-face textures,
- face-local generated UVs for face textures without authored UVs,
- reusable decal UVs,
- base dimensions and mirror/angle metadata.

The priority rule is:

1. If a face has `faceKey` and valid authored `faceTextureUv`, use the authored UVs.
2. Otherwise, if a face texture or decal exists, generate a face-local UV box.
3. Otherwise, use broad top/bottom/back projection.

The retired bad path was treating a per-face texture plus `bitmapSide` as a request to do whole-model side projection. That broke existing per-face station/ship textures. The renderer should not do that.

## Drawing

The shared mesh route is:

1. `drawSceneModel()` / preview / hangar calls
2. `renderObject()`
3. `drawModelEntity()`
4. `modelMeshForRender()`
5. `drawProjectedModelHull()`
6. `collectSolidFaces()`
7. `drawSolidItems()`
8. `drawFaceTexture()`

`collectSolidFaces()` handles visibility, culling, lighting, and attaching `imageProjectionUV[faceIndex]` to each drawable item.

`drawFaceTexture()` draws:

- metal/noise texture if enabled,
- explicit face textures from `imageDecals.faces[faceKey]`,
- broad projected side skins,
- face-local reusable decals,
- post-texture lighting/shadow overlay.

Small projected polygons are allowed to skip generic texture work, but not explicit authored face textures. This is why the Naga stern faces now draw their face crop instead of falling back to a solid colour.

## Mirroring Rules

There are two different mirroring concepts. Do not mix them.

Side/footprint skins may use runtime mirror folding. This is for broad top/bottom/back projection where one half of the footprint texture is folded across a centreline.

Per-face half-template art should normally bake the mirrored result into `bitmapUv` and leave `bitmapMirrorX` off. If a face crop is already a half-template, runtime fold logic can send parts of a face into blank pixels or collapse the useful bitmap region.

The Naga stern fix uses direct per-face UVs into `naga-face-nightlance-back-half-300x91-template.png`, no runtime mirror, no runtime angle.

## Naga Checkpoint

The Naga is the current proof case for the full path:

- Top and bottom skins are baked in exported template footprint space.
- Back face crop UVs are explicit per-face data.
- Ship Builder Game Renderer mode and in-game rendering now match.
- Old Ship Builder bitmap-only modes are useful diagnostics, but the shared renderer result is the truth.

For the four Naga stern faces, the current contract is:

- `bitmapFaceKey`: `nightlance-back-half-300x91-template`
- `bitmapBaseW`: `300`
- `bitmapBaseH`: `91`
- no `bitmapMirrorX`
- no `bitmapAngle`
- UVs sample the visible right-hand band of the PNG.

## Guard Rails

Run these after changing model UV data or renderer bitmap code:

```bash
npm run build
npm run check
git diff --check
node -e "const fs=require('fs'); const s=fs.readFileSync('index.html','utf8'); const scripts=[...s.matchAll(/<script>([\s\S]*?)<\/script>/g)]; new Function(scripts.at(-1)[1]); console.log('inline app script syntax ok');"
```

`tools/build/check.mjs` currently guards:

- UV painter syntax.
- Generated model-library sync for face sides, textures, UVs, base sizes, colours, angles, mirror flags, and decals.
- `bitmapUv` point count matching face vertex count.
- Authored UVs having base dimensions.
- The retired `authoredFaceSide` renderer path staying dead.
- The presence of `remapImageProjectionForBuiltFaces()`.

## Design Direction

The preferred direction is more precomputation, not more runtime guessing.

Good:

- Store explicit `bitmapUv` per face.
- Store base dimensions with those UVs.
- Keep authoring projections aligned with exported templates.
- Let the renderer draw resolved per-face texture coordinates.

Bad:

- Inferring mirror mode from image size.
- Treating side labels as geometry/culling/lighting hints.
- Letting runtime side projection override explicit face UVs.
- Maintaining separate "almost the same" renderers for the builder and the game.

The long-term ideal is for Ship Builder/UV Painter to author complete face texture mapping, and for the shared browser renderer to stay fast, boring, and deterministic.
