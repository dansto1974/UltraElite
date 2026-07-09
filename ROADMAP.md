# Vector Elite — Roadmap

Working list of targets, roughly ordered by dependency and effort. Done items stay for history.

Before broad implementation, release, or refactor work, read `PROJECT_MEMORY.md` as the durable project notebook. Keep it updated when decisions, renderer rules, or fragile-system notes change.

## Done
- Procedural ship decals (big-cat stripes: system government/wealth + role, damage bands)
- Eject effects (NPC pod-pop ring, player capsule transition beat)
- Old School / Ultra Elite presentation presets (`game.fxLevel`)
- NPC chatter + HUD comms log (situation-driven generated lines)
- Pirate bounties — **already in the game**: pirates spawn with 75–175 CR bounties, paid on player kills only. A richer "bounty board" with named marks belongs to Missions below.
- View switching (fwd/rear/left/right + external chase cam)
- **V2b renderer convergence** — normal flight, external view, ship preview/library, hangar ships, cargo props and cut-scene ships now share the same `drawModelEntity` / `modelMeshForRender` path, including clipping, culling, solid/wire/detail drawing, decals, engine glows and trails. The final polish removed the last obvious hidden `game.graphicsMode` dependency from solid detail collection and documented the canonical mesh render path in code.

## Next up (small/medium)
- **Performance sanity pass** — use `ultra-elite-performance-pass` with Armada/FPS as the stress test before adding heavier systems. Tune LOD, particles and HUD churn without losing motion cues.
- **Hi-res sound in Ultra, ongoing polish** — `eliteAudio` now has richer Ultra synthesis, beds and transition sounds; keep tuning with Sound Lab presets while preserving Classic-style audio boundaries.
- **Graphic cockpit, ongoing polish** — Ultra cockpit/HUD frame exists; continue small visual improvements only where they help readability or atmosphere.

## Project skills / reusable memory
- **`ultra-elite-audio-lab`** — procedural hi-fi Ultra sound design: Web Audio buses, layered lasers/explosions, engine beds, hyperspace soundscapes, station/hangar audio, voice caps and Classic-mode preservation.
- **`ultra-elite-render-rules`** — created from the V2b close-out; preserves hard-won renderer rules: world/object-space textures, shared camera transforms, near-plane clipping, glow ordering, ring/station portal behaviour and Old School visual boundaries.
- **`ultra-elite-performance-pass`** — repeatable optimisation workflow using armada as the stress test, with LOD, particle caps, HUD churn, Safari quirks and motion-cue preservation.
- **`ultra-elite-source-check`** — comparison workflow for original Elite source behaviour: galaxy generation, ship stats, AI aggression, lasers, legal/station rules and goat-soup descriptions.
- **`ultra-elite-cinematic-sequences`** — storyboard and implementation rules for docking, launch, hyperspace, death, hangar shots and shared-renderer cutscenes.

## Big rocks (in dependency order)
- **Procedural solar systems** — the foundation piece; do this before missions/landing. Replace the single planet+sun of `buildSystemBodies` with a seeded system: N planets in orbits around the sun, moons orbiting planets, multiple stations (main Coriolis/Dodo + outposts near outer planets). Everything orbits in real time (slow). Needs: a **solar map** panel mode (top-down orbital view, stations marked, planet names), **nav target selection** on that map, and a HUD tracking marker + distance for the selected in-system target. In-system jump/cruise mechanic to make distances playable.
- **Missions à la Frontier** — mission board at stations (deliver cargo to system X by date, courier passenger, assassinate named pirate = the bounty board, military recon). Needs mission state in the save schema, deadlines driven by a game clock, destination hooks into the nav/solar-map targeting above, and reputation/rank consequences. Chatter panel already gives mission-giver comms for free.
- **Planet landing?** — only worth attempting after solar systems. Frontier-style: approach corridor, altitude HUD, procedural terrain horizon (heightline wireframe fits the aesthetic), landing pads at surface stations. Big rendering + gameplay chunk; scope a minimal "land at a beacon on a flat pad" first.
- **Multiplayer?** — breaks the no-backend constraint; needs a small WebSocket relay (chat first, shared in-system ships later). The comms log is already built as the chat UI. Parked until deliberately chosen.
