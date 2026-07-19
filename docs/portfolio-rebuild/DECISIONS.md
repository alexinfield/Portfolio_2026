# Rebuild Decisions

## Header

- Use “Alex Infield” as the permanent left anchor.
- Replace Porto Rocha's “I want to see” field with the requested “Alex Infield” label on the project index.
- Use a compact `All projects` pill on the home and project workspaces.
- Home, index, info, and project routes keep the requested circular `×` close control.

## Project index

- Exactly two columns on desktop and tablet, one column on phone.
- Use the original project still as the default state.
- Reveal and play the project’s own muted video on desktop hover or keyboard focus.
- Keep the still on touch devices so tapping follows the project link predictably.
- Mode remains still-only because no verified Mode motion source exists in the downloaded site assets or the inspected Side Table Drive folder.

## Homepage

- Use Porto Rocha's split workspace: a fixed project rail and a large active project stage.
- Hovering or focusing a rail card changes the active project preview; mobile prioritizes the scrollable project rail.
- Keep project information compact and card-based instead of the previous oversized editorial hero.
- Use only Alex’s real project assets; no generated or placeholder artwork.

## Code organization

- Keep one project registry and one route implementation.
- Generate GitHub Pages output instead of maintaining static pages manually.
- Keep source manifests and verified gallery sequences because they provide an auditable link to downloaded assets.

## Source assets

The Drive folder at `Creative/Projects` is registered as the supplemental master library. Assets are only substituted when project identity can be matched confidently.

## Structure iteration — 2026-07-19

- Work is the primary feed of finished portfolio case studies.
- Play uses the same visual grammar as Work and contains smaller but still professionally presentable design projects.
- Alex OS is a separate launcher and environment for music, video sketches, experiments, RISD material, and deeper archive content.
- Work and Play cards remain visually uniform: 16:9 image, then project name, domain, and year.
- The former `All projects` destination remains as a compatibility route, but it is no longer promoted as a primary navigation action.
- Professional Work is represented as a restrained locked/request-access route until the final access model and content are approved.
- Alex OS uses maintained open-source drag/resize behavior and icon components while keeping its content model, visual system, and media local to the portfolio.

## Project navigation — revised 2026-07-19

- The collapsible drawer experiment is retired. Its screenshot was an information-architecture mock, not a final visual target.
- Project case studies return to the direct portfolio pattern: choose a project from Work, enter a full case-study viewer, and use the circular `×` to return.
- The same Work, Play, Professional Work, Info, theme, and Alex OS navigation now remains available across the homepage and project pages.
- The proposed rounded/circular viewer layer is intentionally deferred until its masking, surrounding canvas, and control hierarchy are approved visually.

## Alex OS research — 2026-07-19

- `os.ryo.lu` is a custom browser desktop with a virtual file system and web-native applications. Its genuine emulation comes from embedded Infinite Mac and v86/js-dos applications rather than from the outer desktop shell itself.
- Alex's fourth-grade year was primarily the OS X Mountain Lion era; fifth grade transitioned from Mountain Lion to Mavericks.
- A genuine Mountain Lion or Mavericks guest is not a practical browser target with the available open-source web emulators: Infinite Mac currently reaches Mac OS X 10.4, while v86 does not implement the 64-bit CPU extensions required by OS X 10.8/10.9.
- Recommended direction: keep the portfolio launcher lightweight, replace the current pretend desktop with a clearly authored Alex archive environment, and embed a genuine emulator as a featured application for compatible classic Mac software and games.
