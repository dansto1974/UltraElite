# Ultra Elite Codex Handoff

We are working on Ultra Elite in `/Users/dan/Documents/Browser Elite`.

Before doing anything meaningful, read:

- `ROADMAP.md`
- `PROJECT_MEMORY.md`
- `LESSONS.md`

Use these skills when relevant:

- `ronnie-mode`
- `ultra-elite-render-rules`
- `ultra-elite-build`
- `ultra-elite-dev-checkpoint`
- `ultra-elite-performance-pass`
- `ultra-elite-release`
- `ultra-elite-source-check`
- `ultra-elite-audio-lab`
- `ultra-elite-cinematic-sequences`

## Blunt Handoff

The latest commit is **not known good**.

Dan reported that after the UV painter/Naga work, the wider in-game renderer was screwed up: missing UVs and stretched UVs across the rest of the game, including station faces. Do not assume the current HEAD is visually safe just because `npm run check` passes.

Current HEAD:

- `e9305fa Checkpoint current UV renderer investigation`
- This was committed only because Dan asked to checkpoint the exact current state before starting a new session.
- Treat it as an inspectable fallback point, not as a fix.

Previous checkpoint:

- `0d2151d Checkpoint UV painter and Naga assets`
- Adds the new UV Painter / Model Builder split, Naga assets, local server APIs, and renderer/painter changes from the session.
- Also not fully trusted for the wider renderer until inspected.

Latest published release:

- Version: `1.0.19-beta`
- Release commit: `90e89f7 Release Ultra Elite 1.0.19-beta`
- Published to `www.ultraelite.co.uk`

Recent pre-UV-painter known-good-ish work:

- `39c274a Fix splash version prefix loading state`
- `90e89f7 Release Ultra Elite 1.0.19-beta`
- `1d6f89c Refine ship builder assets and engine glows`

Suggested first move in the next session:

1. Do not continue polishing the UV painter blindly.
2. Inspect `git show --stat e9305fa` and `git diff 90e89f7..HEAD -- src/main.js tools/uv-painter tools/ship-builder assets/models src/generated`.
3. Decide whether to revert `e9305fa`, `0d2151d`, or only the shared renderer parts.
4. Verify the wider renderer visually with several ships/stations before touching Naga again.
5. If repairing, isolate UV Painter authoring from the production renderer. The production renderer must keep existing station/ship face textures stable.

The Naga itself was reported fine immediately before the stop, but that is not the issue. The issue is the rest of the game.

## Current Architecture

- Source lives in `src/`:
  - `src/main.js`
  - `src/game.css`
  - `src/index.template.html`
- `dev.html` is generated for local testing and loads modular files.
- `index.html` is generated single-file release output. Do not hand-edit it.
- Editable model source of truth is `assets/models/*.ultraship.json`.
- Bitmap skins/templates live in `assets/skins/` and `assets/templates/`.
- Reusable bitmap decals live in `assets/decals/`.
- Generated runtime data lives in `src/generated/`.
- `npm run build` regenerates model libraries, bitmap skin manifest, `dev.html`, and `index.html`.
- `npm run check` validates modular source, generated assets, renderer guards, and recurring bug tripwires.

## Known Good Validation

Run these after code changes unless the pass is docs-only:

```bash
npm run check
npm run build
git diff --check
node -e "const fs=require('fs'); const html=fs.readFileSync('index.html','utf8'); const scripts=[...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1].trim()).filter(Boolean); scripts.forEach((s,i)=>{new Function(s); console.log('inline script',i+1,'syntax ok',s.length);}); console.log('inline scripts checked',scripts.length);"
```

For renderer/UV issues, do not rely on syntax checks. Use human-eyes checks and/or the render tools:

- `tools/render-qa/`
- `tools/render-bench/`
- Ship Builder's real renderer overlay
- In-game station/ship views in `dev.html`

## Recent Session Summary

The session started with missions and dockyard work, then moved heavily into ship builder / UV painter work.

Major things that landed during the broader session:

- Missions and dockyard functionality were developed and tested enough for Dan to continue playing with them.
- Mission completion/debrief behaviour was improved.
- Dockyard/ship ownership work was added.
- Ship labels, mission target indications, and transition/view-lock fixes were worked on.
- Hidden ships/Naga/Nightlance asset work happened.
- Ship Builder UI was reorganised repeatedly.
- A new UV Painter was created to separate UV painting from model editing.
- A Model Builder wrapper was added.
- Naga replaced Nightlance as an asset/model state.

Important: the final UV renderer work went bad. Do not let the amount of effort invested bias you into preserving it.

## UV Painter / Renderer Warning

The failed path:

- The painter and renderer work blurred two different concepts:
  - side skins projected over a model (`top`, `bottom`, `back`)
  - per-face texture tiles with explicit face-local or baked UVs
- A runtime change allowed per-face textures with side labels to use whole-model side projection.
- That made some previews seem better locally, but it risked breaking existing per-face station/ship textures.
- Dan then reported the rest of the game was screwed up.

Current `e9305fa` includes:

- Naga face textures baked with explicit `bitmapUv`, `bitmapBaseW`, and `bitmapBaseH`.
- UV Painter now writes baked UVs when projecting selected faces.
- `src/main.js` no longer has the specific branch that treated `faceKey && authoredFaceSide` as whole-side projection.
- Generated files rebuilt from that state.

Even so, the current renderer state has not been accepted by Dan.

If undoing:

- Start with `src/main.js`, `tools/uv-painter/uv-painter.js`, `assets/models/naga.ultraship.json`, and generated files.
- Consider resetting to `39c274a` or `90e89f7` for renderer comparison, but do not destructive-reset without Dan's explicit go-ahead.
- Prefer creating a branch or targeted revert commits so the broken checkpoint stays inspectable.

## Very Important Renderer Rules

- Mesh objects should go through `renderObject(...) -> drawModelEntity(...) -> modelMeshForRender(...) / drawProjectedModelHull(...)`.
- Do not add new one-off ship/station/object renderers unless absolutely necessary.
- Shared mesh renderer owns camera transform, projection, near clipping, hidden-line behaviour, solid/wire/detail drawing, decals, bitmap skins, engine glows, trails, and LOD.
- Object-space details must not rotate with the player camera.
- Ship Builder preview uses the real renderer overlay path where possible; old builder render modes are diagnostic fallback only.
- Planet/ring/star visuals are bespoke and fragile; they can regress independently of mesh rendering.
- Station portal/forcefield drawing is allowed as a live effect overlay, but static entrance/panel art belongs to bitmap faces or authored decals.

## Protected Recurring Bugs / Guards

- Cobra/Krait/Asp-style nose sticks/antennae:
  - marked protruding sticks draw once below the hull
  - then only repaint in front if sampled points are not covered by a closer hull mask
  - do not restore a simple final-overlay/front-facing pass
- Face bitmap data is face-order authored data; face index must win over normal index.
- Bitmap mirror flags must be explicit metadata, never inferred from image dimensions.
- Runtime procedural bitmap skin/decal fallbacks are retired; missing artwork should degrade to lit solid faces.
- Solid/Ultra mesh rendering should not draw old procedural line/polyline details over bitmap hulls.
- Built-in generated model metadata must not add stations/rocks/cargo/props to NPC role lists.
- Safari must avoid the sampled planet terminator path that exposes shading tiles.
- Station slot beacons must use slot placement/facing rules, not generic hull point occlusion.

## Current Roadmap Focus

- Continue renderer module split behind existing `renderObject` seam.
- Continue world object/simulation architecture.
- Move explosions/smoke/impact effects into depth-aware shared ordering; currently some effects can draw over ships.
- Improve ship builder polish and confidence.
- Continue ship builder / renderer unification, but only after restoring game renderer confidence.
- Decide permanent station bitmap/material strategy.
- Eventually remove or shrink experimental bitmap payload where appropriate.

## Current Fragile Areas

- Ship builder bitmap projection/mirror preview can diverge from game renderer.
- UV Painter is new and not trusted yet.
- Planet/ring/star visuals are bespoke and browser-sensitive, especially Safari.
- Docking/launch/hangar cameras and forcefield ordering are visually fragile.
- Station slots are model-specific; Dodo slot order is special: `20-21-23-22`.
- Station slot beacons are fragile; keep exterior and transition gate beacon behaviour aligned.
- Commander saves should remain docked-only.
- Fuel scooping and collision logic interact.
- Markets must decrement stock on buy and increment on sell.
- Lens flare should stay world-ordered/occluded, not final overlay.
- Beacons/strobes must obey correct visibility rules, but station slot beacons are a special slot-face case.

## Workflow Preferences

- Be candid and opinionated when needed, Ronnie style, but keep it useful.
- Dan provides eyes/ears for subjective visual/audio checks.
- Avoid token-wasting visual guessing; create tools or hand over to Dan when eyesight/ears are the bottleneck.
- If a bug repeats, create an executable guard/test/check, not just another note.
- Commit after stable meaningful passes when Dan asks.
- For broad work, update `ROADMAP.md`, `PROJECT_MEMORY.md`, and/or `LESSONS.md` when architecture, process, or durable lessons change.

## Publishing

- Local publish config exists in ignored `.ultra-elite-publish.env`.
- Use `npm run publish:site -- --check` to verify config.
- Use `npm run publish:site` to upload generated `index.html` only.
- Do not print or store FTP credentials.
- GitHub remote is `origin git@github-ultraelite:dansto1974/UltraElite.git`.
- Push `main` after successful website upload when publishing.

Do not:

- Store credentials/tokens in repo docs.
- Revert unrelated dirty work.
- Hand-edit generated `index.html` unless recovering an emergency patch.
- Publish/upload unless explicitly asked.
