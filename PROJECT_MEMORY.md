# Ultra Elite Project Memory

Working notes for future Codex/Ronnie sessions. This is not public marketing copy; it is the project notebook that should survive context compaction.

## How To Use This File

- Read this with `ROADMAP.md` before meaningful Ultra Elite work. Read `LESSONS.md` when a pass changes how Dan and Codex should work together on future projects.
- Update it when a pass creates a durable rule, rejects an approach, or exposes a fragile system.
- At each major checkpoint, step back and record what changed, how it was achieved, what worked, what failed, and which future note belongs here, in `ROADMAP.md`, in `LESSONS.md`, or in a skill.
- Keep it concise. Put player-facing story and release notes in `README.md` or the in-game update log, not here.
- Do not store credentials, tokens, FTP passwords, or private keys here.

## Related Docs

- `README.md` is the public project overview.
- `ROADMAP.md` is the forward plan.
- `PROJECT_MEMORY.md` is Ultra Elite-specific working memory.
- `LESSONS.md` is reusable agentic-coding practice for future projects.

## Current Direction

- The game is Ultra Elite: a single-file browser tribute to classic Elite with an Ultra presentation layer and an Old School mode.
- Keep `index.html` playable after every scoped pass.
- Prefer small checkpoint commits after broad implementation passes.
- Public release work should update the in-game version/log only for player-visible changes.

## Known Good Checks

Run these after code changes unless the pass is docs-only:

```bash
node -e "const fs=require('fs'); const s=fs.readFileSync('index.html','utf8'); const m=s.match(/<script>([\s\S]*)<\/script>/); new Function(m[1]); console.log('inline script syntax ok');"
git diff --check
```

For release/publish passes, use the release skill's multi-script parse check and verify GitHub/FTP status separately.

## Renderer Rules

- Mesh objects should enter the shared renderer through `drawModelEntity` and `modelMeshForRender`.
- Normal flight ships, stations, external view, hangar ships, cargo props, cut-scene ships, and ship preview/library should stay on that shared path.
- The shared path owns camera transform, perspective projection, near-plane clipping, back-face/hidden-line behaviour, solid/wire/detail drawing, decals, metal texture, engine glow, ion trails, and LOD decisions.
- Wireframe hidden-line fixes belong in the shared renderer. The current Old School path draws cheap candidate edges first, paints slightly inset main hull face masks, then front-facing inset surface details, then double-sided sheet fills only if a cheap screen-space depth test says no closer hull mask covers that sheet. Do not sort Cougar-style sheet fills together with details: average-depth sorting lets flat sheets show through the hull and can bury forward windows. Avoid per-ship wing/nose exceptions unless a blueprint genuinely needs metadata.
- Old School line details default to surface-detail culling. Only deliberate protruding sticks/antennae should opt out with `cull: false`; otherwise transporter/panel strokes linger too long as the hull rotates away.
- In Old School wire mode, line details that duplicate explicitly marked protruding edges are skipped during the surface-detail pass. The edge pass draws them first so hull masks can hide the covered portion; redrawing the same stick as a later detail puts it incorrectly on top of the ship. Use `edgeCullNormals` as the stick marker, not a broad "any matching edge" test.
- Explicit wire-only edge cull normals are blueprint metadata for protruding edges, not visibility tests. When detail-edge LOD is active, marked sticks/antennae are always drawn as candidate edges; only later hull masks should hide the covered portion.
- Special bespoke renderers are allowed for things that are not mesh objects: planet surfaces, rings, stars/lens flare, lasers, particles, smoke, explosions, galaxy backdrop, HUD/scanner/chart UI, and hangar architecture panels/forcefields.
- Do not add another ship/object renderer because one scene feels awkward. Adapt the camera/entity input and use the shared path.
- Texture, cloud, crackle, ring, and decal bugs are often caused by tying object-space details to the player camera. World/object-space details must remain stable when the ship rotates.

## V2b Renderer Status

- V2b renderer convergence is complete enough to leave the roadmap. Treat future renderer work as maintenance unless a new feature deliberately needs architecture.
- The final close-out removed the obvious hidden `game.graphicsMode` dependency from `collectSolidDetails`, added the canonical mesh-render contract beside `modelMeshForRender`, audited the remaining direct model reads, and created the global `ultra-elite-render-rules` skill so the rules survive future sessions.
- Ongoing guardrails:
  - Document any deliberate bespoke renderer when touched.
  - Keep imported/custom ship work parked until there is a clean mesh import contract.
  - Treat blueprint SVG rendering as a technical drawing path, not the canonical flight renderer.

## Checkpoint Retrospectives

### V2b Renderer Close-Out

- Achieved: moved V2b renderer work off the active roadmap by closing the last obvious shared-renderer leak and preserving the rules in code, docs and a dedicated skill.
- How: audited the remaining direct model reads, confirmed live mesh render paths converge through `drawModelEntity` / `modelMeshForRender`, removed `collectSolidDetails`' hidden `game.graphicsMode` dependency, documented the canonical mesh path beside the code, and created `ultra-elite-render-rules`.
- What worked: Dan's pushback prevented a cosmetic roadmap close-out; the proper finish needed evidence, a small code fix, explicit exceptions, and a durable guardrail skill.
- What failed: the first pass treated documentation closure as equivalent to completing the work. That is not enough for architectural refactors.
- Future note: do not remove a major roadmap refactor item until the code path, known exceptions, validation, project memory and any needed workflow skill are all aligned.

### Workflow Housekeeping

- Achieved: aligned the roadmap's named skills with actual installed skills, created the missing performance/cinematic guardrails, added known-good validation commands, and set local Git author identity.
- How: kept the player-facing game untouched, updated repo docs only, then validated the new personal skills.
- Future note: if the roadmap names a reusable skill, either make it real or rename it to the skill that actually exists.

### Small/Medium Roadmap Close-Out

- Achieved: closed out stale next-up items that were already practically done: dynamic LOD/performance testing, hyperspace dust streaks, slide-out panel font cleanup, and Sound Lab/audio polish.
- How: Dan supplied real usage feedback, including normal 120 FPS and heavy-scene roughly 50 FPS on the development machine, plus acceptance of the hyperspace and audio work. The only small remaining cockpit issue, missile icon alignment, was fixed as a scoped CSS/layout change.
- What worked: using Dan's eyes, ears, and real external tester feedback is better than treating the roadmap as the source of truth.
- Future note: when a "next up" item becomes accepted through real play testing, move it to Done promptly so planning does not orbit stale work.

## Performance Rules

- Armada mode is the stress test.
- LOD should remove expensive texture, decal, damage, ion trail, and detail work at range while preserving motion cues.
- Ship surface details and explicit stick/detail edges are close-range readability features; they currently drop at roughly 900m, scaled by ship size using the shared model-distance LOD multiplier.
- Distant ships can become impostors/dots, but should retain enough glow/colour to read as ships.
- Avoid per-frame DOM churn in HUD labels, chatter, tooltips, or debug widgets.
- Safari can be more sensitive to HUD/info-window flicker and canvas state churn.
- Current performance pass is considered implemented and out for external low-spec testing. Development machine baseline is roughly 120 FPS in normal play and around 50 FPS in heavy normal scenes with sun, planet and multiple ships visible.

## Audio Rules

- Classic mode should preserve simple BBC-style audio boundaries.
- Ultra mode can be cinematic, but sounds should be useful and not tiring.
- Use shared `eliteAudio` helpers and Sound Lab presets rather than isolated oscillator blocks.
- Dan's ears win subjective sound calls. If it needs listening tests, make the smallest implementation change and hand it over.
- Persistent beds must be tested as loops, not only one-shot previews.

## Original Elite Fidelity

- Use Mark Moxon's BBC Elite source as the first reference for source-faithful questions.
- Preserve original galaxy/system identity where possible: names, economy/government/population/species, goat-soup descriptions, ship roles, and broad combat/legal behaviour.
- Ultra features may intentionally depart from the original when Dan has explicitly liked them, but call that out.

## Known Fragile Areas

- Planet/ring/star visuals have separate maths from the mesh renderer and can regress independently.
- Docking/launch/hangar cameras are easy to make cinematic but hard to keep physically coherent; keep storyboard timing explicit.
- Station slots are model-specific. Coriolis slot vertices are already in perimeter order, but Dodo station's raw slot vertices must be ordered `20-21-23-22`; using the raw last-four order draws a crossed hourglass portal and corrupts slot-frame maths.
- BBC Elite does not place the station in the local bubble immediately after hyperspace; `SOLAR` creates planet/sun, and `NWSPS` adds the station only when the player reaches the planet station zone. Ultra Elite keeps stations targetable on arrival, but arrivals should start outside the station safe zone so the lane has room for pirates/traders before docking.
- Autopilot/docking collision avoidance can accidentally avoid the station itself or orbit the slot.
- Fuel scooping and collision detection interact; scoopable objects should not be treated like hard blockers when a scoop is fitted.
- Markets use deterministic generated prices/opening stock, then a saved per-system stock overlay for transactions. Buying must decrement availability and selling must increment it.
- Solar heat damage should respect shield/energy expectations rather than jumping straight to hull unless deliberately changed.
- Commander saves are station-state saves, not full in-flight snapshots. Keep save/export disabled unless docked so refresh/load cannot become a free landing.
- Custom model import from Fusion FBX/OBJ is parked. Fusion remeshed and orientation/winding/detail assumptions were not reliable enough.

## Release And Publishing

- Release/publish means: update visible game version/log if appropriate, validate, commit, upload only `index.html`, then push GitHub when available.
- Do not publish hidden/dev/easter-egg work in the in-game update log unless Dan explicitly asks.
- Do not store website or GitHub credentials in repo docs or skills.
