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

## Project navigation drawer — 2026-07-19

- Project case studies use a collapsible left drawer rather than a permanently allocated rail.
- The open drawer contains four large section tiles, About Alex, and the complete Work list with the active project highlighted.
- On desktop the drawer reduces the project canvas while open and restores the full canvas when collapsed.
- On tablet and mobile it overlays the case study, reserves a reliable outside-dismiss target, and leaves a compact edge handle when closed.
- Drawer state persists while moving between project pages during the current browser session.
