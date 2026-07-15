# Rendering And Model Notes

Read this before renderer, model, skin, texture, decal, Ship Builder, UV Painter, station, hangar visual, or WYSIWYG preview work.

For the full current model -> UV -> generated metadata -> renderer contract, read [../renderpath.md](../renderpath.md).

## Canonical Mesh Path

- Mesh objects should enter the shared renderer through `renderObject(...)`, `drawModelEntity(...)`, and `modelMeshForRender(...)`.
- Normal flight ships, stations, external view, hangar ships, cargo props, cut-scene ships, and ship preview/library should stay on the shared path.
- Do not add another ship/object renderer because one scene feels awkward. Adapt the camera/entity/options and use the shared path.
- Special bespoke renderers are allowed for non-mesh systems: planet surfaces, rings, stars/lens flare, lasers, particles, smoke/explosions, galaxy backdrop, HUD/scanner/chart UI, hangar architecture panels and forcefields.

## Current Renderer Baseline

- The shared path owns camera transform, perspective projection, near clipping, culling, solid/wire/detail drawing, decals, metal texture, engine glow, ion trails, and LOD.
- Renderer preview projection packets are optional and should stay cheap unless explicitly requested.
- The render benchmark and render QA tools use `window.UltraEliteRenderBench.renderFrame(...)`.
- Ship Builder Game Renderer mode is the trusted WYSIWYG preview; old bitmap-only modes are diagnostics.

## Bitmap And UV Rules

- Authoring tools should bake explicit per-face UVs where possible.
- `assets/models/*.ultraship.json` face metadata is source of truth for `bitmapFaceKey`, `bitmapSide`, `bitmapUv`, `bitmapBaseW/H`, `bitmapAngle`, `bitmapMirrorX`, `faceColor`, and `bitmapDecals`.
- Generated `imageProjection.*` arrays are face-indexed and must stay aligned with source `faces[]`.
- Runtime `buildBlueprint()` may rotate/reverse face vertex order; `remapImageProjectionForBuiltFaces()` must preserve UV-to-vertex pairing.
- Runtime must prefer authored `faceTextureUv` over face-local or side-projection guesses.
- Side labels are texture routing metadata, not lighting/culling metadata.
- Per-face solid fallback colours are useful; missing/low-detail bitmaps should degrade to coloured panels, not generic hull colour.

## Mirroring And Templates

- Side/footprint skins may use runtime mirror folding.
- Per-face half-template art should normally bake mirrored UVs into `bitmapUv` and leave `bitmapMirrorX` off.
- Do not infer mirror mode from image dimensions.
- Top/bottom/back group UV bakes must use exported template footprint space: full model bounds plus 8% margin, scaled to template size.
- Do not normalize a selected face group's UVs to that group's bounds; it scales painted template art down.

## Protected Visual Contracts

- Protruding sticks/antennae draw once below hull masks and only repaint in front when not covered by closer hull masks. Do not restore a final-overlay stick pass.
- Old School hidden-line fixes belong in the shared renderer.
- Solid/Ultra mesh rendering should not draw old line/polyline surface details over bitmap hulls unless deliberately authored as current detail types.
- Model detail lift is intentionally shallow: default around `0.5` model units.
- Mesh beacons should obey hull visibility and should not move to a final always-on overlay.
- Station portal/interior effects are live overlays; static entrance/panel art belongs in model-authored face textures/details.

## Tool Notes

- `tools/render-bench/`: performance and visual renderer harness.
- `tools/render-qa/`: human-eyes model/skin sweep with local review status and renderer projection diagnostics.
- `tools/ship-builder/render-preview.html`: iframe-backed real renderer for Ship Builder.
- `tools/uv-painter/`: UV projection and bake tool; output should be explicit face UV metadata.

## Cross-Links

- Model/UV/bitmap pipeline changes must also check [../renderpath.md](../renderpath.md).
- Renderer changes that alter editor truth must check Ship Builder notes here and may need [fragile-areas.md](fragile-areas.md).
- LOD or render-cost changes also affect [performance.md](performance.md).
- Docking, launch, hangar, transition camera, or station visual changes also affect [fragile-areas.md](fragile-areas.md).
- Stable renderer discoveries should be captured in [checkpoints.md](checkpoints.md) when they explain why a path exists.
