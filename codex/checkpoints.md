# Checkpoint History

Read this when resuming after compaction, asking why an architecture exists, or deciding whether an old approach should be revived.

## Renderer Close-Out

- V2b renderer convergence is complete enough to leave the roadmap.
- The major lesson: do not close a roadmap refactor until code path, known exceptions, validation, project memory, and skill guardrails are all aligned.
- The shared mesh path is the contract; bespoke renderers must be deliberate non-mesh exceptions.

## Modular Build Pipeline

- Ultra Elite keeps a single-file public artefact while day-to-day work happens in modular source.
- `npm run build` regenerates `dev.html`, `index.html`, generated model data, and generated bitmap data.
- Emergency direct edits to `index.html` must be ported back to source.

## Ship Builder And Model Assets

- `assets/models/*.ultraship.json` is the editable model source of truth.
- `tools/ship-builder/` is the project-native authoring path; generic OBJ/FBX import is parked because winding/orientation/detail assumptions were unreliable.
- The Ship Builder now has a real-renderer overlay and should not duplicate renderer maths except as fallback diagnostics.

## Render Bench And QA

- `tools/render-bench/` exposes the real renderer without the full game loop.
- Batch bench is useful for median/p95 render changes; worst-frame spikes are often cache/Chrome noise.
- `tools/render-qa/` is the human-eyes sweep surface for bitmap/model rendering.

## Bitmap Skin And UV Work

- Bitmap skins moved from experiment to authored-asset workflow.
- Runtime procedural hull livery and generated fallback paint systems were removed.
- Per-face texture tiles, reusable decals, and fallback face colours are first-class model data.
- Naga became the proof case that UV Painter, Ship Builder renderer mode, and in-game can agree through the same path.

## Simulation And Missions

- World-object scaffolding added snapshots, phase timing, cached object lists, broad collision candidate filtering, and render packet prep.
- Mission board first pass added composable courier/freight/bounty/recovery/naval contracts, mission cargo, target IDs, rewards, and saved active mission state.
- Mission objectives should stay boring and composable; flavour belongs in text/rewards.

## Repeated Lesson

When a visual bug repeats, add a code/build guard where possible. Documentation is the map; checks are the fence.

## Local-Only Checkpoints

- Codex docs should be committed in the local repo with the related work so future sessions inherit the reasoning.
- Treat local Codex-doc commits as private/operator memory. Do not push them to GitHub or publish them unless Dan explicitly asks.
- If preparing a GitHub/public release, separate public code/release changes from private Codex-memory changes.

## Cross-Links

- Renderer/UV checkpoint lessons should be reflected in [rendering.md](rendering.md) and, for model pipeline details, [../renderpath.md](../renderpath.md).
- Performance checkpoint lessons should be reflected in [performance.md](performance.md).
- Mission, station, docking, import, or save-system lessons should be reflected in [fragile-areas.md](fragile-areas.md).
- Release workflow lessons should be reflected in [release.md](release.md).
- Broad planning changes should also update [../ROADMAP.md](../ROADMAP.md).
