# Portfolio Rebuild Execution Log

Date: 2026-07-18

## Outcome

The portfolio is now implemented as one responsive Next/vinext codebase. The former duplicate hand-maintained GitHub Pages HTML, CSS, and JavaScript were retired. GitHub Pages output is generated from the same routes and data used by the application build.

## Completed work

- Audited the existing GitHub Pages site and `alexinfield.com`.
- Captured and compared the supplied Porto Rocha, Chris Jing, Zeg Zulka, and Mouthwash references.
- Mapped the active Figma project pages and the two website-design frames.
- Created and pushed rollback tag `backup/portfolio-pre-rebuild-20260718`.
- Created branch `codex/portfolio-rebuild-20260718`.
- Rebuilt `/`, `/all`, `/info`, and all six `/projects/:slug` routes.
- Replaced “I want to see” with “Alex Infield”.
- Preserved the close `×` control on page and project headers.
- Corrected the project cover mapping after a visual cross-check showed the old files had been assigned one project off.
- Restored the verified Figma order: Molekule Go, Luma, Niche, Hyphae Light, Ping, Mode.
- Added still-first, video-on-hover project cards wherever a real project video exists.
- Added a build-time GitHub Pages exporter and updated the Pages workflow.
- Verified desktop, tablet, and mobile layouts in the in-app browser.

## Source hierarchy used

1. Figma project pages for project identity, order, and presentation intent.
2. Existing portfolio manifests and verified gallery sequences for published slide order.
3. Existing `alexinfield.com` assets for the original project covers.
4. Google Drive `Creative/Projects` as a supplemental master-asset source.
5. Reference sites for layout rhythm and interaction patterns only.

## Safe handoff

No DNS or `alexinfield.com` production setting was changed. The rollback tag remains available, and the rebuild stays isolated on its own branch until review or merge.

## 2026-07-19 structure and Alex OS pass

- Started from the approved responsive branch on `codex/portfolio-structure-os-20260719`.
- Replaced the homepage workspace with the approved restrained two-column Work feed.
- Standardized Work and Play on uniform 16:9 cards with name, domain, and year.
- Seeded Play with three real projects from the Drive master library: Off Campus, Inflating Chair, and Mycelium Panels.
- Kept music, video sketches, and raw archive material out of Play and inside Alex OS.
- Added a functional Alex OS with Finder, Dock, focus ordering, draggable/resizable windows, minimize/maximize/restore controls, and compact mobile app switching.
- Added real local audio and video playback using Alex's existing source media.
- Added light/dark persistence, the Alex OS launcher, and close navigation across secondary routes.
- Expanded the GitHub Pages exporter to 15 routes while preserving client hydration and route-relative assets.
- Made lazy-loaded CSS and Alex OS media repository-path-safe after the first live Pages check exposed root-relative client asset loading.
- Passed the rendered-route test suite and browser design QA at desktop and mobile sizes.
- Rebuilt project navigation as a screenshot-matched collapsible drawer with section tiles, About card, complete project list, desktop push behavior, and a dismissible mobile overlay.
- Retired that drawer after the screenshot was clarified as a rough information-architecture mock rather than a final design.
- Restored a direct full-width case-study viewer and made the approved Work, Play, Professional Work, Info, theme, Alex OS, and close controls universal on project pages.
- Inspected ryOS directly and verified that its outer desktop is a browser application while its genuine Mac/PC execution comes from Infinite Mac and v86/js-dos integrations.
- Rebuilt Alex OS around a public-safe Finder structure modeled on the recognizable top-level organization of Alex's creative archive without publishing private names, paths, or files.
- Added a local NASA M90 wallpaper asset with visible credit.
- Added a real Mac OS 9.0 / Power Macintosh 9500 computer through the official Infinite Mac embed, including Infinite HD's compatible software and games.
- Separated the universal project navigation into its own sticky rounded control surface and contained each case-study deck in a rounded canvas below it.
- Simplified Professional Work into a restrained access page and removed the ambiguous lock icon and oversized card.
- Removed homepage project-title underlines on hover.
- Re-ran the complete static export and route suite: 7 tests passed; lint reported 0 errors and six deliberate static-image warnings.
- Compared the Alex OS source and implementation side by side and checked project viewer dark, light, desktop, and mobile states in the in-app browser.
