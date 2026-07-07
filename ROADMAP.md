# Vector Elite — Roadmap

Working list of targets, roughly ordered by dependency and effort. Done items stay for history.

## Done
- Procedural ship decals (big-cat stripes: system government/wealth + role, damage bands)
- Eject effects (NPC pod-pop ring, player capsule transition beat)
- Old School / Ultra Elite presentation presets (`game.fxLevel`)
- NPC chatter + HUD comms log (situation-driven generated lines)
- Pirate bounties — **already in the game**: pirates spawn with 75–175 CR bounties, paid on player kills only. A richer "bounty board" with named marks belongs to Missions below.
- View switching (fwd/rear/left/right + external chase cam)

## Next up (small/medium)
- **Hi-res sound in Ultra** — `eliteAudio` gets a second sample set / richer synthesis (layered noise, filter sweeps, reverb tail) used when `fxLevel === "ultra"`; classic keeps the chip-style beeps. Pure WebAudio, no asset files needed unless we want real samples.
- **Graphic cockpit** — a drawn cockpit frame (canopy struts, console silhouette, subtle reflections) overlaid on the fwd view in Ultra; rear/side views get matching bulkhead framing. Canvas-drawn so it stays procedural and resolution-independent. Classic mode keeps the bare vector view.

## Big rocks (in dependency order)
- **V2b engine refactor** — turn the current collection of one-off renderers into a small reusable engine layer. Promote the existing good pieces (`cameraTransform`, `project`, near/frustum clipping, face collection, texture subdivision, solid/wire/detail drawing, engine glow/trails) into one canonical render path used by normal flight, external view, ship preview, docking/launch/death cutscenes and hangar scenes. Add distance-based quality/LOD so decals, texture subdivision, glow, trails and surface detail can fade out or simplify when they stop adding visible value. Goal: fewer duplicated behaviours, fewer transform bugs, smoother armada test performance, and cutscenes that use the same ship movement/effects as gameplay.
- **Procedural solar systems** — the foundation piece; do this before missions/landing. Replace the single planet+sun of `buildSystemBodies` with a seeded system: N planets in orbits around the sun, moons orbiting planets, multiple stations (main Coriolis/Dodo + outposts near outer planets). Everything orbits in real time (slow). Needs: a **solar map** panel mode (top-down orbital view, stations marked, planet names), **nav target selection** on that map, and a HUD tracking marker + distance for the selected in-system target. In-system jump/cruise mechanic to make distances playable.
- **Missions à la Frontier** — mission board at stations (deliver cargo to system X by date, courier passenger, assassinate named pirate = the bounty board, military recon). Needs mission state in the save schema, deadlines driven by a game clock, destination hooks into the nav/solar-map targeting above, and reputation/rank consequences. Chatter panel already gives mission-giver comms for free.
- **Planet landing?** — only worth attempting after solar systems. Frontier-style: approach corridor, altitude HUD, procedural terrain horizon (heightline wireframe fits the aesthetic), landing pads at surface stations. Big rendering + gameplay chunk; scope a minimal "land at a beacon on a flat pad" first.
- **Multiplayer?** — breaks the no-backend constraint; needs a small WebSocket relay (chat first, shared in-system ships later). The comms log is already built as the chat UI. Parked until deliberately chosen.
