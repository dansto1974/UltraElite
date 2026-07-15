# Performance Notes

Read this before FPS, Armada, LOD, Safari, canvas-cost, or game-loop optimisation work.

## Baselines

- Armada mode is the stress test.
- Development machine baseline was about 120 FPS in normal play and about 50 FPS in heavy normal scenes with sun, planet and multiple ships visible.
- A forced full-render dev test with laser effects and engine glow/trails disabled still bottomed around 65 FPS in Ultra, while Old School stayed near 120 FPS.
- With about 16 objects visible/current in game space, pausing simulation and moving the camera returns to the 120 FPS cap even with full render.

## Interpretation

- Do not assume mesh rendering, lasers, or engine effects are the bottleneck without fresh evidence.
- Remaining Ultra slowdown is often more likely active simulation/event bookkeeping, canvas overdraw/compositing, HUD/label churn, background/planet/station passes, or game-loop bookkeeping.
- Use the FPS ticker's hot buckets (`SIM OBJECTS`, `SIM COLLIDE`, `SIM RENDER`, etc.) before optimising suspected subsystems.

## LOD Rules

- LOD should remove expensive texture, decal, damage, ion trail, and detail work at range while preserving motion cues.
- Ship surface details and explicit stick/detail edges are close-range readability features.
- Distant ships can become impostors/dots but should retain enough glow/colour to read as ships.
- Engine glow intensity must not invert across LOD distance.

## Browser Notes

- Avoid per-frame DOM churn in HUD labels, chatter, tooltips, and debug widgets.
- Safari can be sensitive to HUD/info-window flicker and canvas state churn.
- Benchmark with median and p95; do not let one Chrome/cache worst-frame spike drive architecture.

## Cross-Links

- Renderer LOD or texture/decal cost changes also affect [rendering.md](rendering.md).
- Simulation/event-loop discoveries may expose hazards for [fragile-areas.md](fragile-areas.md).
- If performance work changes build/benchmark commands, update [current.md](current.md).
- Accepted performance checkpoint lessons belong in [checkpoints.md](checkpoints.md).
