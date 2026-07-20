# Ultra Elite

A browser-based, non-commercial fan tribute to the original 1984 space trading game. Ultra Elite is developed from modular local source files and built into a single-file browser release.

- Play: [www.ultraelite.co.uk](https://www.ultraelite.co.uk)
- Source: [github.com/dansto1974/UltraElite](https://github.com/dansto1974/UltraElite)
- Current version: `1.0.21-beta`
- Release file: `index.html`
- Local dev entry: `dev.html`

## Development Structure

Ultra Elite still publishes as a generated single `index.html` file, but day-to-day development now uses modular local source files:

- `src/main.js` contains the game logic, renderer, data, UI and audio source.
- `src/game.css` contains the game styling.
- `src/index.template.html` is the template used to generate the deployable single-file page.
- `dev.html` is a generated local development shell that loads the CSS and JavaScript as separate files.
- `tools/build/` contains the build and validation scripts.
- `tools/ship-builder/` contains the local Ultra Elite ship authoring tool.
- `tools/sound-lab/` contains the local procedural sound design tool.

Useful commands:

```bash
npm run check
npm run build
npm run dev
npm run tools
```

`npm run check` validates the modular source and single-file build safety rules. `npm run build` regenerates both `index.html` and `dev.html`. `npm run dev` serves the project locally at [http://127.0.0.1:8765](http://127.0.0.1:8765). `npm run tools` starts the local Node tool server if needed and opens the tools hub.

For local development, use `dev.html`. For release testing and publishing, use the generated `index.html`. The public website should receive only `index.html` unless a future release deliberately adds more deployable assets.

## About

Five Days, Two AI Coding Agents and a Slightly Unnecessary Number of Supernovas

Back in the late 1980s, like thousands of other impressionable young computer owners, I became completely addicted to a game called Elite.

I first encountered it at the house of my best mate, Ronnie Barker, not, regrettably, the famous comedian, although the name did lend the whole arrangement a certain sitcom quality.

It was Ronnie's BBC Micro, which meant that he was naturally the commander-in-chief and I only occasionally got a turn at the controls. Most of the time, I served as navigator, trading adviser, back-seat pilot and unsolicited expert on how he should have handled the docking approach he had just completely ruined.

We staged several heroic all-night sessions, sustained by vast platefuls of ham-and-salad sandwiches made with Mighty White bread, several litres of Cherry Coke and some distinctly amateur experimentation with smoking.

The soundtrack was provided by two cassettes that seemed to play in an endless loop: Dire Straits' Love Over Gold, released in September 1982, and Genesis's Invisible Touch, released in June 1986.

Between them, they became the unofficial soundtrack to interstellar trading, piracy and repeated failure to dock properly. For hours, Mark Knopfler and Phil Collins took turns accompanying us around the galaxy while the cassette deck quietly prepared to play the whole lot again.

It was probably not a lifestyle recommended by doctors, parents, musicians or computer manufacturers, but at the time it felt like ideal preparation for a career in interstellar commerce.

For hours, we flew, traded, fought pirates and attempted to dock without converting the ship into an expensive cloud of wireframe debris. By morning, the room would be full of smoke, sandwich crumbs, cassette hiss and the glow of the television, while Ronnie and I remained completely convinced that travelling to another procedurally generated star system was far more important than sleep.

A couple of years after the BBC Master was released in 1986, my parents bought me one of my own.

At last, I no longer had to wait patiently for Ronnie to surrender the controls. I could now lose entire nights, crash into space stations and make catastrophic trading decisions in the comfort of my own home.

Ronnie had a colour monitor.

I got a green monochrome one.

At the time, this felt slightly less glamorous, but I suspect it left a permanent mark on me, because the HUD in Ultra Elite is green. I did not consciously set out to recreate my old monitor, but apparently some design decisions spend forty years quietly waiting for another opportunity.

## An Entire Universe in Almost No Memory

Elite was created by Ian Bell and David Braben and originally published by Acornsoft for the BBC Micro in 1984.

It was written largely in 6502 assembly language and was an astonishing feat of software engineering. The BBC Micro had just 32KB of RAM, a quantity of memory that modern software can now consume while deciding whether a button should have rounded corners.

Despite those constraints, Elite gave us fast wireframe 3D graphics, hidden-line removal, spaceships, space stations, trading, combat, docking, pirates, police, fuel scoops and the ever-present possibility of being murdered while carrying seven tonnes of luxury goods.

It also contained eight procedurally generated galaxies, each with 256 star systems.

Every system had its own name, economy, government, population, species and gloriously strange description. Because the generation was deterministic, everyone who played experienced the same universe. Lave was always Lave. Diso was always Diso. And somewhere out there was always a planet best known for its inhabitants' exciting new cuisine or their inexplicably passionate hatred of something very specific.

It was extraordinarily clever.

More than forty years later, I am still slightly baffled by what Bell and Braben managed to achieve with such limited memory and processing power. The entire game occupied less data than a fairly modest modern email attachment, yet somehow managed to make the BBC Micro feel as though it contained a complete universe.

The series eventually evolved through several sequels and, much later, into Elite Dangerous: an enormous online space-trading and combat simulator with multiplayer, planetary exploration, billions of star systems and more controls than the average commercial airliner.

But I have always retained enormous affection for the original.

For me, Elite was an introduction to what computer games could really be.

It was not merely a collection of blocks falling down a screen or a little man jumping between platforms. It felt like an actual universe, one that existed whether I was playing it or not.

## Watford Electronics and the World's Least Efficient Commute

A few years later, at the age of sixteen, Ronnie and I ended up with Saturday jobs at Watford Electronics, one of the best-known suppliers of BBC Micro hardware, upgrades and peripherals.

Getting there required a degree of commitment entirely out of proportion to the salary. We cycled roughly fifteen miles from Barnet to Watford, worked all day for the princely sum of GBP 1.15 an hour, and then cycled fifteen miles home again.

Not that much of the money ever made it home with us.

Most weeks, we spent our wages in the shop before leaving the building, buying computer parts, upgrades and assorted electronic treasures. Watford Electronics had effectively invented a closed-loop payroll system in which the money briefly appeared on our payslips before returning immediately to the till.

Unfortunately, they were not always the most inspiring employers.

On one memorable occasion, a customer came in with a faulty computer. I managed to work out what was wrong and fix it for them, which I rather naively assumed was exactly the sort of thing a computer shop might consider useful.

Instead, I got told off.

Apparently, diagnosing and repairing a customer's computer showed altogether too much initiative for a sixteen-year-old Saturday employee. I had crossed some invisible boundary between "cheap shop assistant" and "person who was actually helping."

So the employment package consisted of GBP 1.15 an hour, a thirty-mile bicycle commute, the opportunity to hand most of our wages straight back to our employer, and occasional disciplinary action for being competent.

Naturally, at the time, we still thought it was brilliant.

Having spent our childhoods staying up all night playing with BBC computers, Ronnie and I had somehow found jobs surrounded by the machines, upgrades and electronic components we obsessed over.

It was less a carefully planned career path than a failure to escape orbit.

## Enter the Machines

With the AI coding tools now at our disposal, I recently decided to conduct a small experiment.

I gave myself a few constraints.

I would create my own tribute to the original Elite: a browser-based space-trading and combat game inspired by the look, feel and systems of the 1984 original.

It would run in a web browser.

It would be contained in a single HTML file.

And I would not personally write a single line of code.

Five days later, having consumed virtually all my available credits, tokens and possibly several acres of data-centre cooling water, I had produced a surprisingly faithful recreation using Anthropic's Claude Code and OpenAI Codex.

Saying that it took five days is, however, slightly misleading.

The basic wireframe game was working after roughly two days.

The remaining three days were spent adding things that the project absolutely did not need.

This process is sometimes known as "scope creep."

In my case, it was less of a creep and more of a full-scale military invasion.

## Just One More Small Feature

I began with a simple wireframe homage to Elite.

Then I thought the ships might look better with proper surfaces.

So I added surfaces.

The surfaces looked a little plain, so I added textures.

The textures looked rather flat, so I added directional lighting, reflections and glow effects.

The engines still appeared slightly lifeless, so I added animated exhausts, ion trails and luminous engine flares.

Then the launch sequence seemed a bit abrupt, so I added a cinematic launch sequence.

Naturally, once I had a launch sequence, I needed a docking sequence.

And once I had docking and launch sequences, it seemed ridiculous not to build the interiors of the station hangars.

These became the game's loading and docked environments, complete with animated machinery, service vehicles, landing pads, atmospheric lighting and various pieces of equipment whose exact purpose remains a mystery even to me.

I added animated cockpit displays, targeting systems, pilot radio chatter and a more sophisticated rendering engine.

I added genuine 3D laser calculations, docking-computer guidance, collision detection, engine trails, weapon glows and cut-scene animations.

At some point, I apparently forgot that I was making a tribute to a wireframe game from 1984.

## A Glorious Geek-Fest of Elite

To make the underlying universe reasonably faithful, I turned to Mark Moxon's extraordinary Elite on the 6502 website.

The site is a glorious geek-fest of all things Elite: original source code, detailed annotations, technical explanations, comparisons between different versions, deep dives into the game's inner workings and enough historical and programming detail to make an entire weekend disappear without warning.

You can begin by reading about procedural galaxy generation and, several hours later, find yourself studying hidden-line removal, ship-drawing routines, flight mechanics and the ingenious tricks used to squeeze an entire universe into a few tens of kilobytes.

For this project, it proved invaluable.

Mark's research helped me understand and reconstruct the original procedural galaxy-generation system, so the familiar systems, economies, populations, governments and descriptions closely match those of the classic game.

The site also documents the ship blueprints and rendering data in a form considerably more approachable than the raw assembly language.

I used that information to rebuild the original vessels from their vertices and edges, creating an object library that remains recognisably faithful to the original designs.

Except that my versions now have surfaces.

And materials.

And lights.

And windows.

And rather more dramatic engines.

## Procedurally Generated Scope Creep

Then I made the mistake of thinking about planets.

Obviously, an industrial planet could not look the same as an agricultural planet.

Industrial worlds needed to appear darker, more urbanised and polluted. Agricultural and low-population worlds needed to look greener and bluer. Some required deserts, ice caps or cloud systems. Others needed rings or dusty, toxic atmospheres.

These details are generated from the properties and descriptions of each system, so the appearance of a planet reflects the information behind it rather than being selected entirely at random.

And if I was going to have different planets, I would clearly need different types and colours of stars.

Once the stars had different colours, their light obviously needed to be reflected in the windows and hulls of every nearby ship.

Anything less would have been completely unacceptable.

The background stars also looked slightly too peaceful, so I added the occasional supernova.

Again, essential.

## One Webpage, No Sensible Limits

The resulting game, now called Ultra Elite, is entirely open source and still publishes, rather improbably, as a single webpage: one generated HTML file containing its JavaScript, rendering code, game logic, ship data, procedural-generation system, audio, animations and all the other machinery required to make it work.

The development source has since been split into normal local JavaScript, CSS and template files, because even nostalgia has limits. The release build is still a single HTML file, now around 800KB and roughly 18,000 generated lines, which is either impressively compact or evidence that I have completely lost control of the project.

Despite all the textures, lighting, reflections, engine glows, atmospheric planets, supernovas and cinematic sequences, Ultra Elite still includes an old-school mode.

Switch it on and the fancy bits disappear. The ships return to wireframe, the visual effects are stripped back and the game once again looks much closer to the original BBC Micro version.

No textured hulls.

No glowing engines.

No dramatic atmospheric lighting.

Just crisp wireframes, black space, a green HUD and the persistent possibility of dying because you still cannot dock properly.

It felt important to preserve that mode. The modern effects are fun, but the stark wireframe look is what made the original Elite so distinctive, and, even after all these years, it still has a charm and atmosphere entirely of its own.

Nothing has been copied and pasted from the original game's source code.

It is a new implementation, built from scratch, but informed by research into how the original systems, ships and procedural universe worked.

What I have created is not intended to replace or compete with Elite.

It is a tribute to it: a celebration of the ideas, ingenuity and extraordinary technical skill behind the original.

It is also an experiment in what one person can now create with modern AI coding tools, even when that person repeatedly responds to a nearly finished project by saying:

"That looks good, but wouldn't it be better if the station had a fully modelled hangar?"

It is not quite finished.

There are still bugs to eliminate, systems to balance and features that could be improved.

There are also, almost certainly, several more entirely unnecessary visual effects waiting to be added.

But it is already playable, surprisingly satisfying and, considering that the public release still runs from one generated HTML file, I think it looks rather good.

I have also tested it extremely thoroughly.

By which I mean I have spent several hours flying around, trading, shooting things and repeatedly crashing into space stations while calling it software development.

I even pulled a full all-nighter while building it, which felt oddly appropriate.

In some respects, very little has changed since Ronnie's house.

The Mighty White ham-and-salad sandwiches have gone. Cherry Coke has been replaced by Coke Zero and industrial quantities of coffee.

I am, regrettably, still smoking, although I really must give some serious thought to stopping.

The technology has changed beyond recognition, but the basic ingredients remain remarkably familiar: too much caffeine, not enough sleep and a complete inability to leave Elite alone.

More than forty years later, I am still staying up all night because of the same game.

## Running Locally

For ordinary play, open `index.html` directly in a desktop browser.

For development, use the modular local shell:

```bash
npm run dev
```

Then open [http://127.0.0.1:8765/dev.html](http://127.0.0.1:8765/dev.html). To test the exact single-file release artefact, open [http://127.0.0.1:8765/index.html](http://127.0.0.1:8765/index.html) after running `npm run build`.

The game is currently designed for desktop. Mobile displays show a desktop-only message rather than trying to squeeze the cockpit into a tiny viewport.

## Current Features

- Deterministic Elite-style galaxy generation across eight galaxies and 256 systems each.
- Original-style markets, cargo, fuel, equipment, legal status, bounties, docking, hyperspace, galactic jumps and commander saves.
- BBC-inspired system names, economy/government/population/species data and procedural descriptions.
- A source-informed ship roster using original-style hull data baked into the generated release file.
- Ultra and Old School presentation presets: modern textured shaded rendering or crisp wireframe nostalgia.
- Solid shaded ships, stations, planets and stars with sun-based lighting, fixed object-space hull textures and cockpit glass.
- Procedural planets that reflect system descriptions, including agricultural worlds, industrial worlds, rocky barren worlds, gas giants, rings, debris fields, polar caps, city lights, clouds and craters.
- Varied stars following broad O/B/A/F/G/K/M-inspired colour and scale cues, including bright dwarfs, larger giants, local lens flare and background starfields.
- A modern cockpit/HUD with scanner, compass, shields, energy banks, speed/steering bars, cabin temperature, laser temperature and typed comms chatter.
- Combat with differentiated lasers, overheating, finite missiles, ECM, energy bombs, target prioritisation, ship-specific hit volumes, collision bounce and station no-fire consequences.
- NPC AI roles for traders, pirates, police and aliens, including fleeing, police response, station traffic, docking-computer traffic avoidance and Thargoid/Thargon encounters.
- Procedural faction liveries: commercial paint, pirate sigils, police strobes, alien trails, battle damage, smoke and engine haze.
- Audio generated through WebAudio: lasers, alarms, chatter, explosions, engine and transition effects.
- Cinematic hyperspace, galactic jumps, hangar launch/docking, escape-pod death sequences and game-over flow.
- Local browser saves plus commander import/export, with browser-save deletion in the status tools.
- Developer mode hidden behind the `D` + `E` + `V` key chord, with ship swapping, equipment controls, armada testing and unrestricted map jumps.
- Local build, sound-design and ship-builder tools for developing the project without hand-editing one enormous inline HTML file.

## Change Log

### 1.0.21-beta

- Ship Builder overhaul: added a fullscreen-ready workshop with undo/redo, view-cube controls, better selection tools, surface/extrude workflows, and refreshed Boa and Canister asset rendering.

### 1.0.20-beta

- Ship and station surface polish: optimized several model assets, refreshed Diamondback skin textures, and tightened station panel mapping for cleaner Ultra-mode rendering.

### 1.0.19-beta

- Mission and dockyard polish: active contracts now report ship requirements more clearly, mission completion debriefs wait until landing is complete, and transition cameras lock the cockpit view cleanly.

### 1.0.18-beta

- Launch loading now gates the cockpit until assets are ready, Safari planet shadows are safer, and station/police beacons have clearer sequenced strobe behaviour.

### 1.0.17-beta

- Polished station bitmap rendering, entrance forcefields, beacons and hangar transition visuals.

### 1.0.16-beta

- Fixed escape capsule recovery so ejecting clears legal status properly when the commander is recovered at Lave.

### 1.0.15-beta

- Fixed missing bitmap faces on station models, including Dodo front/back panels.
- Improved consistency between in-game bitmap rendering and the ship-builder preview.

### 1.0.14-beta

- Added an in-game pause control beside the HUD sliders.
- Raised the global audio output headroom so the volume slider has more useful range.
- Improved the ship-builder workshop with base hull colour support and face-normal preview aids.

### 1.0.13-beta

- Moved day-to-day development to modular source files while preserving the generated single-file browser release.
- Added a local Ultra Elite ship-builder workshop for authoring project-native ship models, metadata, surface details and future Project X craft.
- Improved ship-builder panel-line authoring so surface panel lines can be selected, mirrored, deleted individually and inset without leaving the workflow.
- Updated the public README to describe the new build structure and local tools.

### 1.0.0-beta

- Branded the project as Ultra Elite and prepared the public beta release.
- Added the modern cockpit surround, transparent HUD instrumentation, typed chatter and slide-out right panel.
- Added legal/about copy, public website deployment and release workflow support.
- Reworked the dashboard into fore/aft shields, fuel, cabin temperature, laser temperature, altitude, missile slots, speed, roll, dive/climb, yaw and four energy banks.
- Added local browser save loading on startup, delete-save support and commander file import/export.
- Added a desktop-only mobile gate.

### Flight, AI and Combat

- Reworked ship movement to be nose-led rather than sideways-drifting, with smoother control acceleration for fine aiming.
- Compared steering, ship speed and laser behaviour against the original source and added class-based speed/firepower tuning.
- Added distance-banded hostile AI, fleeing behaviour, police aggression, trader panic, alien hostility, Thargoid/Thargon encounters and NPC-vs-NPC targeting.
- Added station traffic, ships launching/docking, wider station orbit spacing and anti-collision behaviour for departing ships.
- Added docking-computer approach logic, go-around behaviour, trajectory HUD messages and collision avoidance.
- Added collision response so ships and objects bounce rather than passing through one another.
- Added station, planet, star and cargo-canister collision rules, with cargo scooping only when a fuel scoop is fitted.
- Added accurate laser hit volumes by ship size, better laser range handling, finite NPC missile logic and station laser-occlusion checks.
- Reworked player and enemy lasers into converging glowing beams, visible NPC shots, pulse/beam/military differences, temperature behaviour and HUD laser-temperature gating.
- Added explosions scaled by ship size, debris, fire, smoke, screen shake, deep rumble, escape pods, game-over flow and free hull repair on landing.

### Rendering and Models

- Replaced ad-hoc object geometry with source-informed ship/station model data.
- Fixed perspective projection, back-face culling, hidden-line wireframe behaviour and object draw ordering.
- Added solid shaded rendering with optional wire overlay, then made Ultra mode the default modern presentation.
- Added fixed object-space hull textures, perspective-correct texture subdivision for large near faces and notes to prevent screen-space texture regressions.
- Corrected ship blueprints, fins, protrusions, windows, engines, decals, surface details and back-face/detail culling.
- Added source-inspired cockpit windows, darker glass, bright engine faces, engine glow and ion trails.
- Added procedural ship decals by role and system: commercial branding, pirate markings, police strobes, alien colouring and battle damage.
- Added old-school mode that preserves wireframe presentation while keeping modern HUD conveniences.

### Planets, Stars and Space

- Added procedural planets tied to system data and descriptions: oceans, landmasses, ice caps, clouds, city lights, rocky worlds, industrial pollution, gas giants, storms, debris rings and asteroid/debris fields.
- Reworked planet lighting with real sun-facing hard terminators, subtle atmosphere and world-space cloud/surface projection to prevent roll-linked texture bugs.
- Added larger, shaded rings made from transparent 3D line bands with planet shadowing.
- Added varied star types including red giants, white dwarfs and larger stellar classes, then moved dangerous large stars farther away from stations.
- Added local star lens flare, background star dots and moving space-dust streaks for speed reference.
- Fixed starfield recycling so background motion remains stable while turning.

### Stations, Docking and Hangars

- Added richer station rendering with metal texture, pipes/greebles, wealth-based polish/rust and smaller-scale material detail.
- Added dark dock portals, hazard stripes, orange strobes, forcefields and a visible tunnel/hangar hint behind the entrance.
- Added cinematic hangar launch and docking sequences with a 3D hangar box, forcefield, lights, cargo containers, ship scaling, engine spool-up/spool-down, boost glow, camera shake and smooth ascent/descent.
- Kept old-school docking presentation simpler while preserving the welcome messaging.
- Added docked hangar loop with low-angle camera orbit and docked ship updates when the player swaps ships.

### Galaxy, Maps and UI

- Matched galaxy generation and system descriptions closely to the original Elite universe.
- Split commander status from selected-system map information.
- Reworked map page defaults, local-map zoom/pan, larger map text and larger planet/system hitboxes.
- Added unlimited dev-mode hyperspace range, map target selection safeguards and prevention of jumping to the current system.
- Added target list prioritisation and colour-coded HUD chatter.
- Added a compass beside/over the scanner and corrected scanner orientation.
- Added hover help for HUD controls, then removed intrusive HUD tooltips in favour of compact status panels for autopilot, launch and arrival messages.

### Audio and Effects

- Added WebAudio sound effects inspired by original behaviours, then tuned pitch downward for a deeper feel.
- Added differentiated laser sounds, explosion rumble, engine effects, alarms, alien chatter and generated station/pirate/police/trader comms.
- Added smoke puffs at hit locations, blue plasma streaks, ion trails, damage smoke and alien purple/green trail variants.
- Tuned Ultra effects for performance, trimming overly heavy chatter/spark rendering without removing the atmosphere.

### Persistence, Dev Tools and Release

- Added commander download/upload save files and browser-save deletion.
- Added hidden developer mode with equipment add/remove, ship swapping, armada spawning and unrestricted travel.
- Moved Armada into dev tools and sorted equipment/laser controls.
- Removed old OBJ export/external loading UI from normal play.
- Added the Ultra Elite release skill for update-log/version/commit/publish workflow.

## Possible Next Directions

- Higher-resolution Ultra-mode sound synthesis while keeping classic chip-style sounds available.
- Further cockpit polish and side/rear view framing.
- Seeded multi-body solar systems with moons, outposts, orbital motion, solar map navigation and in-system cruise.
- Frontier-style mission boards: delivery, courier, passenger, named bounty, military and reputation-driven tasks.
- Possible surface landing experiments after solar systems exist.
- Multiplayer only if a backend relay becomes a deliberate project goal.

## Legal Notice and Credits

This project is a non-commercial, open-source fan tribute developed solely for educational, archival and entertainment purposes. It is a work of reverse-engineered game logic built from scratch and is not an official release.

Elite (1984) is the property of its original creators, David Braben and Ian Bell. The broader Elite trademark and modern franchise assets are owned by Frontier Developments plc.

This project is not affiliated with, endorsed by or sponsored by David Braben, Ian Bell or Frontier Developments plc.

This game is completely free to play. The author does not generate revenue, host advertisements, accept donations or profit from this project in any way. If you enjoy this tribute, please support the creators by checking out the official modern space simulation, Elite Dangerous, available via Frontier Developments.
