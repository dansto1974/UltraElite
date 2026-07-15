# Fragile Areas

Read this before docking, launch/hangar/cinematics, model imports, station slots, missions, commander saves, markets, scooping, solar damage, or unusual world systems.

## Visual Systems

- Planet/ring/star visuals have separate maths from the mesh renderer and can regress independently.
- Docking, launch, and hangar cameras are easy to make cinematic but hard to keep physically coherent.
- Transitions and jump countdowns own player view state; block rear/side/external switches until control returns.
- Explosions, smoke, and impacts can still draw over ship hulls because some effects use bespoke passes.

## Stations

- Station slots are model-specific.
- Coriolis slot vertices are already in perimeter order.
- Dodo station raw slot vertices must be ordered `20-21-23-22`; raw last-four order draws a crossed portal.
- Station entrance/static portal frame geometry should move toward model-authored details.
- Animated forcefield/chevron/glow effects can remain effect layers, but anchors should come from station model data.

## World And Object Data

- Built-in model role lists are quarantined from generated asset metadata. If non-ship objects spawn as traders/pirates, check `BUILTIN_MODEL_IDS` and `modelCanImportRoleLists()`.
- If an object is rendered as a model in-game, add/update its `.ultraship.json` asset instead of hiding geometry in one code path.
- Custom ship authoring should use Ship Builder; generic Fusion FBX/OBJ import is parked.

## Gameplay Systems

- BBC Elite does not place the station in the local bubble immediately after hyperspace; Ultra keeps stations targetable on arrival but should start outside the safe zone.
- Autopilot/docking collision avoidance can accidentally avoid the station itself or orbit the slot.
- Fuel scooping and collision detection interact; scoopable objects should not be hard blockers when a scoop is fitted.
- Markets use deterministic generated prices/opening stock plus saved per-system stock overlays.
- Solar heat damage should respect shield/energy expectations.
- Commander saves are station-state saves, not full in-flight snapshots; keep save/export disabled unless docked.

## Missions

- Missions are saved commander state.
- Mission cargo consumes hold space but should not become normal sellable commodities.
- Active mission objects may carry sealed cargo, recovery cargo, target IDs, legal classes, requirements, loaned equipment, and unlock rewards.
- Station-destruction missions are a future special case; do not make stations casually destructible through ordinary mission target code.

## Cross-Links

- Station, hangar, docking, launch, and model visual hazards often also affect [rendering.md](rendering.md).
- Any source-faithful mechanic in these fragile systems should also check [source-fidelity.md](source-fidelity.md).
- Performance-sensitive fragile systems should also check [performance.md](performance.md).
- Release-facing changes to saves, missions, or player-visible stability should also check [release.md](release.md).
- Repeated fragile bug fixes should be summarized in [checkpoints.md](checkpoints.md).
