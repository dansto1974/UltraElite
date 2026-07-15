# Current Project Notes

Read this for ordinary Ultra Elite implementation work after `project.md`.

## Direction

- Ultra Elite is a single-file browser tribute to classic Elite with an Ultra presentation layer and an Old School mode.
- Keep `index.html` playable after every scoped pass.
- Prefer local checkpoint commits after broad implementation or fragile visual passes.
- Public release notes should mention player-visible changes, not hidden/dev/easter-egg work unless Dan asks.

## Source Layout

- Modular source of truth: `src/main.js`, `src/game.css`, `src/index.template.html`.
- Generated local/dev artefacts: `dev.html`, `index.html`.
- Editable model source: `assets/models/*.ultraship.json`.
- Bitmap skins/templates: `assets/skins/`, `assets/templates/`.
- Generated runtime model/skin data: `src/generated/`.
- Main local tool server: `npm run dev:tools` at `http://127.0.0.1:8765/`.
- Tools hub: `npm run tools` or `tools/Launch Tools.command`.

## Workflow Defaults

- Start with `git status --short` and a narrow read of relevant files.
- Use `rg` for file/text search.
- Use `apply_patch` for manual edits.
- Build from source rather than hand-editing generated shells.
- If a direct emergency fix lands in `index.html`, port it back to source before the next build.
- Use Dan's eyes for visual judgement; automate only objective checks or hard-to-see regressions.

## Known Good Checks

Use the validation block in `project.md` for code/model changes.

For generated app script syntax, use the multi-script version from `project.md`; simple greedy `<script>` regex checks can catch the generated asset script and fail misleadingly.

## Public Docs

- `README.md` is public project overview and player-facing history.
- `ROADMAP.md` is planning.
- `project.md` and `codex/*.md` are Codex working memory.
- `LESSONS.md` is reusable agentic-coding practice across projects.

## Cross-Links

- Renderer, model, skin, UV, or editor preview changes usually affect [rendering.md](rendering.md) and [../renderpath.md](../renderpath.md).
- Build/release changes usually affect [release.md](release.md).
- Repeated bug or parked hazard discoveries usually affect [fragile-areas.md](fragile-areas.md).
- Performance-sensitive implementation usually affects [performance.md](performance.md).
