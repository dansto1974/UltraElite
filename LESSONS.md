# Agentic Coding Lessons

Reusable notes from the Ultra Elite experiment. These are project-agnostic lessons for working with AI coding agents on ambitious software builds.

## Core Lesson

Agentic coding works best when the human supplies taste, intent, and sensory judgement, while the agent supplies mechanical persistence, codebase memory, implementation speed, and careful verification.

The strongest results came from treating the agent as a collaborator with a process, not as a one-shot code generator.

At each major checkpoint, deliberately step back and ask:

- What did we achieve?
- How did we achieve it?
- What did we learn?
- Which notes will help Future Us avoid relearning the same lesson?

Then consolidate the useful bits into project docs or skills immediately. Digital memory and biological memory are both unreliable; versioned notes are the handrail.

## What Worked Well

- Keep a durable project notebook. Context compaction is real; store decisions, fragile systems, rejected approaches, and architectural rules in a repo file such as `PROJECT_MEMORY.md`.
- Use a roadmap for direction, not micromanagement. `ROADMAP.md` should say what matters next and why, while implementation details can evolve.
- Use checkpoint retrospectives. After a major pass, summarize what changed, what approach worked, what failed, and whether `ROADMAP.md`, `PROJECT_MEMORY.md`, `LESSONS.md`, or a skill should be updated.
- Define done before removing major roadmap work. A refactor is not complete just because the roadmap says so; the code path, known exceptions, validation, durable docs, and any guardrail skills must all line up.
- Make small scoped passes. Big rewrites became safer when broken into checkpoints that left the game playable.
- Commit after stable passes. Local commits created rollback points and reduced fear during refactors.
- Prefer shared systems over one-off fixes. The V2b renderer improved once ships, previews, hangar scenes, and cutscenes all used the same render path.
- Use the human for subjective checks. Eyes and ears beat token-heavy guessing for visuals and sound.
- Build tools when iteration gets repetitive. The Sound Lab turned audio tuning from blind parameter guessing into a collaborative workflow.
- Preserve known-good behaviours. Old School mode, Classic-style audio, and original Elite fidelity gave useful boundaries when Ultra features expanded.
- Let the agent push back. Useful friction prevented some bad rabbit holes and clarified what actually needed fixing.
- Prefer reversible experiments for uncertain visual architecture. Try the smallest test that can prove or disprove an idea, then keep the result that human eyes accept rather than defending the clever theory.

## Skill Creation Lessons

- Skills should be short procedural reminders, not giant memory dumps.
- Put durable facts in repo docs, then make skills tell the agent when to read those docs.
- A roadmap works best when paired with a workflow skill that tells the agent to check and update it. Without that habit, the roadmap becomes a stale wish list.
- If a roadmap names reusable skills or tools, make them real or rename/remove them. Aspirational tool names are just another kind of stale TODO.
- A good skill answers: when to trigger, what to inspect first, what rules must not be broken, how to validate, and what to report.
- Split skills by workflow:
  - development checkpoint
  - release/publish
  - audio design
  - original-source comparison
  - collaboration style
- Do not store secrets in skills.
- Update skills when the workflow changes, but keep project-specific evolving detail in repo files.
- Validate skills after editing their YAML/frontmatter.

## Documentation Pattern

Use this split on future projects:

- `README.md`: public overview, setup, usage, credits.
- `ROADMAP.md`: planned work and broad priorities.
- `PROJECT_MEMORY.md`: durable working memory for agents and future maintainers.
- `LESSONS.md`: reusable agentic-development lessons that may apply to future projects.
- Skills: concise workflows that point agents to the right docs and validation steps.

The useful pattern is not just "write docs"; it is "make the agent maintain the docs as part of the workflow." A commit/checkpoint skill should ask whether `ROADMAP.md`, `PROJECT_MEMORY.md`, or `LESSONS.md` changed before committing.

## Working With Code

- Read the codebase before acting. Existing patterns matter.
- Search with `rg` first.
- Use shared helpers and existing abstractions before inventing new ones.
- Add abstraction only when it removes real duplication or prevents repeated bugs.
- For architectural work, prove completion with an audit of remaining exceptions. Do not treat documentation or intent as evidence that the implementation is finished.
- Keep manual edits scoped.
- Validate syntax and whitespace after each pass.
- Avoid reverting unrelated dirty files.
- When a system feels repeatedly hard to change, stop and inspect the architecture instead of adding another patch.
- When model metadata exists, use it deliberately. Do not reinterpret a marker as a behaviour rule without checking the intended rendering flow.

## Working With Visuals

- If a bug is visual, decide whether it is objective or subjective.
- Objective visual bugs need code inspection and reproducible reasoning.
- Subjective look-and-feel needs fast iteration and human eyes.
- Stable coordinate spaces matter: textures, decals, clouds, rings, and surface details should not rotate with the camera unless deliberately screen-space.
- Reuse the game renderer for cutscenes/previews when possible. Duplicated rendering logic creates duplicated bugs.
- Sometimes a deliberately simple visual trick is better than a mathematically grand one. Ultra Elite's Old School wireframe improved when black inset fills masked hidden lines and broke antialiased show-through, producing a more authentic retro look at low cost.

## Working With Sound

- Procedural audio needs listening loops, not just code changes.
- Separate one-shot effects from persistent beds.
- Preview looped ambience as a loop; a one-shot preview can be misleading.
- Keep sound routing centralized.
- Name presets clearly and keep the sound design tool close to the actual game audio architecture.
- The human ear wins.

## Working With Source Fidelity

- When recreating old game behaviour, check primary/source material before relying on memory.
- First state what the original did, then what the current implementation does, then the intended change.
- Matching the spirit can be better than blindly matching the original when modern additions deliberately change the experience.

## Collaboration Lessons

- Banter helps, but only if the work keeps moving.
- Strong opinions are useful when grounded in evidence.
- The agent should admit uncertainty early and become decisive once the code confirms the shape of the problem.
- The human should interrupt when something looks or sounds wrong; that feedback is data.
- A named collaboration mode can help preserve tone and habits across sessions, but it should not become theatre.

## Anti-Patterns

- Huge undocumented rewrites.
- Fixing the same class of bug in five places instead of finding the shared cause.
- Public README as project scratchpad.
- Skills that contain everything instead of pointing to versioned docs.
- Visual/audio guessing without human feedback.
- Letting hidden global state leak into reusable helpers.
- Treating generated/imported assets as trustworthy before checking coordinate conventions, scale, orientation, and winding.

## Future Project Checklist

At the start of a new agentic project:

1. Create `README.md`, `ROADMAP.md`, and `PROJECT_MEMORY.md` early.
2. Add a checkpoint workflow skill once repeated development patterns emerge.
3. Add a release skill before the first publish.
4. Add domain-specific skills only after the process repeats enough to justify them.
5. Commit after each stable pass.
6. Keep one visible validation command for the main artifact.
7. Record durable lessons immediately after the mistake or breakthrough, not a week later.
