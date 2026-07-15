# Ultra Elite Codex Project Router

Read this first for every Ultra Elite / Browser Elite task. Then read only the linked docs that match the request.

## Core Rules

- Work in `/Users/dan/Documents/Browser Elite` unless Dan explicitly points elsewhere.
- Keep `index.html` playable after every scoped pass.
- Source edits normally belong in `src/`, `assets/models/`, `assets/skins/`, or `tools/`; generated `index.html`, `dev.html`, and `src/generated/*` are refreshed by `npm run build`.
- Preserve user and previous-agent changes. Never revert unrelated dirty files.
- Prefer small, checkpointable passes. If a stable visual state is reached, commit it before further experiments.
- Every checkpoint should update the relevant `codex/*.md` file when the pass changes a durable rule, fragile area, architecture decision, validation habit, or retrospective lesson.
- Codex/project-specific docs are local-only unless Dan explicitly asks to publish them.
- Do not store credentials, FTP details, tokens, private keys, or hidden release secrets in repo docs or skills.
- For subjective visual/audio tuning, use Dan's eyes/ears. Do not waste usage on screenshot analysis when a human check is quicker and better.
- If context feels overloaded, stop loading broad docs and route through this file again.

## Local Repo, Not GitHub

- Codex working docs belong in this local repository so they can be checkpointed with the code they explain.
- `project.md`, `codex/*.md`, `renderpath.md`, `ROADMAP.md`, `LESSONS.md`, and handoff notes are local Codex/operator memory, not public project documentation.
- Local checkpoint commits may include Codex docs. Do not push those docs to GitHub or publish them unless Dan explicitly asks.
- `README.md` is the public overview. Release notes and website copy should be written separately from Codex memory.

## Validation

For code/model/render changes, normally run:

```bash
npm run build
npm run check
git diff --check
node -e "const fs=require('fs'); const s=fs.readFileSync('index.html','utf8'); const scripts=[...s.matchAll(/<script>([\s\S]*?)<\/script>/g)]; new Function(scripts.at(-1)[1]); console.log('inline app script syntax ok');"
```

For docs-only changes, `git diff --check` is usually enough.

## Read Next

- [codex/current.md](codex/current.md): current project direction, source layout, known-good checks, and workflow defaults. Read for most implementation tasks.
- [ROADMAP.md](ROADMAP.md): forward plan and priority context. Read when choosing what to do next or moving roadmap items.
- [codex/rendering.md](codex/rendering.md): renderer invariants, mesh path, WYSIWYG preview, bitmap/UV rules, and visual-render traps. Read before render, model, skin, texture, decal, Ship Builder, UV Painter, station, or hangar visual work.
- [renderpath.md](renderpath.md): detailed model -> UV -> generated metadata -> runtime renderer path. Read before changing UV projection, face texture metadata, `buildBlueprint`, or `drawFaceTexture`.
- [codex/checkpoints.md](codex/checkpoints.md): compact history of major implementation checkpoints and lessons. Read when a task asks "why is it like this?" or when resuming after compaction.
- [codex/performance.md](codex/performance.md): FPS, Armada, LOD, browser and simulation-performance notes. Read before optimization work.
- [codex/audio.md](codex/audio.md): Classic/Ultra audio rules and listening workflow. Read before sound changes.
- [codex/source-fidelity.md](codex/source-fidelity.md): original Elite fidelity rules and BBC source-check expectations. Read before changing mechanics intended to match Elite.
- [codex/fragile-areas.md](codex/fragile-areas.md): recurring bug zones and parked hazards. Read before docking, missions, model imports, stations, commander saves, or special world systems.
- [codex/release.md](codex/release.md): release, publish, generated artefact, and update-log rules. Read before versioning, upload, GitHub, or site-publish work.
- [LESSONS.md](LESSONS.md): reusable agentic-coding practice beyond Ultra Elite. Read when the work teaches a general workflow lesson.
- [CODEX_HANDOFF.md](CODEX_HANDOFF.md): session-specific handoff/archive. Read only when explicitly resuming that handoff or debugging an old session's unfinished state.

## Skill Routing

- Use `ultra-elite-project` first for general Ultra Elite work; it points back here.
- Use `ultra-elite-render-rules` for renderer/camera/texture/LOD/mesh visual work.
- Use `ultra-elite-build` when source changes require generated `index.html` / `dev.html`.
- Use `ultra-elite-release` for version/update-log/publish work.
- Use `ultra-elite-audio-lab` for sound design.
- Use `ultra-elite-performance-pass` for FPS/LOD/Safari/Armada work.
- Use `ultra-elite-cinematic-sequences` for docking, launch, hyperspace, death/eject, hangar or transition camera work.
- Use `ultra-elite-source-check` for source-faithful Elite behaviour.
