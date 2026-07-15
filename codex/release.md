# Release And Publishing Notes

Read this before versioning, update logs, publishing, FTP, GitHub push, or public release work.

## Release Meaning

Release/publish means:

1. Update visible game version/log if appropriate.
2. Validate.
3. Commit.
4. Upload only generated `index.html`.
5. Push GitHub when available/requested.

## Rules

- Do not publish hidden/dev/easter-egg work in the in-game update log unless Dan explicitly asks.
- Codex working docs are local-repo memory, not GitHub/public-release material. Keep them out of public pushes unless Dan explicitly asks.
- Do not store website or GitHub credentials in repo docs or skills.
- Local FTP publish credentials live only in ignored `.ultra-elite-publish.env` on Dan's Mac.
- Use `npm run publish:site -- --check` to verify local config.
- Use `npm run publish:site` to upload generated `index.html`.
- `index.html` is generated; edit source and build before publishing.

## Cross-Links

- Player-visible renderer/model/skin changes may need notes from [rendering.md](rendering.md).
- Player-visible mission, save, docking, or stability changes may need notes from [fragile-areas.md](fragile-areas.md).
- Performance release claims should be backed by [performance.md](performance.md).
- Major release checkpoints should update [checkpoints.md](checkpoints.md) and, when priorities change, [../ROADMAP.md](../ROADMAP.md).
