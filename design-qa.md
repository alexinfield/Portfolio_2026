# Design QA — Contained Project Viewer, Professional Work, and Alex OS

Date: 2026-07-19

## Source and implementation evidence

- Desktop-computer reference: `https://os.ryo.lu/`.
- Official emulator reference: `https://infinitemac.org/embed-docs`.
- Same-state side-by-side comparison: `/tmp/portfolio-os-comparison.png` (two 720 × 997 views).
- Alex OS default Finder: `/tmp/portfolio-os-implementation.png`.
- Authentic Mac OS 9 boot and ready states: `/tmp/portfolio-os-classic-running.png` and `/tmp/portfolio-os-classic-ready.png`.
- Professional Work: `/tmp/portfolio-professional-implementation.png`.
- Project viewer, scrolled to 900 px: `/tmp/portfolio-project-nav-dark.png` and `/tmp/portfolio-project-nav-light.png`.
- Mobile OS and project viewer at 390 × 844: `/tmp/portfolio-os-mobile-final-390x844.png` and `/tmp/portfolio-project-mobile-390x844.png`.

## Full-view comparison

The ryOS reference and Alex OS implementation were placed together in one comparison input at the same visible size. The implementation retains the convincing computer hierarchy that matters in the reference—wallpaper, menu bar, desktop shortcuts, Finder, Dock, overlapping windows, and a real emulator—without copying its visual identity. Alex OS instead uses Alex's public portfolio structure, real media, a credited NASA wallpaper, and an embedded Mac OS 9 computer with Infinite HD.

The earlier generic liquid-glass mock looked like a reskinned web app. The current version reads as a usable archive computer: Finder history, grid/list views, search, folders, apps, draggable/resizable windows, playback, and a genuine bootable guest all work.

## Focused-region checks

- Project header: the universal navigation is a separate sticky rounded surface at the top of the page. At a 1280 × 720 desktop viewport it stays within a 74 px control band and never overlays the project canvas.
- Project canvas: a separate bordered, rounded presentation layer begins below the header. It was checked after scrolling in both dark and light themes.
- Professional Work: the shopping-bag-like lock icon and oversized card are gone. The page is now a quiet editorial access screen with small structured details and one request action.
- Homepage cards: title underline-on-hover is removed; the still-first/video-on-hover behavior remains intact.
- Mobile: the project header collapses to its two-row layout, the viewer remains inside the viewport, Finder becomes a compact single-window experience, and the Dock remains horizontally usable without a visible scrollbar.

## Fidelity review

- Typography: the portfolio keeps the existing neutral sans-serif system and compact metadata. Alex OS uses a small native-system UI scale that is appropriate for a desktop shell.
- Spacing and rhythm: project controls, viewer, Professional Work rows, Finder toolbar, file grid, and Dock all follow consistent compact spacing.
- Color and tokens: the project control surface uses the site's dark/light tokens and stronger glass opacity so content cannot show through while scrolling. Alex OS uses one coherent dark glass system over the M90 wallpaper.
- Asset quality: project covers, audio, and video come from the existing portfolio assets. The wallpaper is a downloaded, locally hosted NASA source asset. Icons come from the existing Phosphor library; no generated or placeholder imagery was introduced.
- Copy and privacy: Finder labels expose only curated portfolio categories and public project names. No private local path, account name, contact data, or personal file listing is present. The emulator is explicitly isolated from personal files.

## Interaction and runtime checks

- Work, Play, Professional Work, Info, theme, Alex OS, and close controls remain available across project pages.
- Light/dark switching works on the contained header and leaves the project presentation itself intact.
- Finder navigation, Back/Forward, search, list/grid switch, app launch, window controls, audio, video, and desktop links work.
- Starting Classic Mac boots Mac OS 9.0 on a Power Macintosh 9500 profile and reaches Infinite HD, including period games, graphics, multimedia, publishing, and utility folders.
- Desktop and 390 px mobile views show no page-level horizontal overflow.
- `npm test`: 7 of 7 passed.
- ESLint: 0 errors; six pre-existing deliberate static-image warnings.

## Comparison history

1. Earlier P2: the navigation visually overlaid project content while scrolling.
   - Fix: moved it into an opaque/blurred sticky control band and placed the project deck in a separate rounded canvas below.
   - Evidence: `/tmp/portfolio-project-nav-dark.png` and `/tmp/portfolio-project-nav-light.png` at scrollY 900.
2. Earlier P2: Professional Work used a giant card and an ambiguous lock that resembled a shopping bag.
   - Fix: removed the pictogram and replaced the card with restrained editorial rows.
   - Evidence: `/tmp/portfolio-professional-implementation.png`.
3. Earlier P2: Alex OS was a surface imitation with a generic background and no genuine computer layer.
   - Fix: rebuilt the outer archive environment and embedded the official Infinite Mac OS 9 configuration behind an explicit Start computer action.
   - Evidence: `/tmp/portfolio-os-comparison.png` and `/tmp/portfolio-os-classic-ready.png`.
4. Earlier P3: the compact Dock showed a browser scrollbar at 390 px.
   - Fix: reduced compact icon geometry and hid only the Dock's visual scrollbar while retaining horizontal scrolling.

## Remaining polish

- P3: the embedded Mac has a cold start of roughly 30–40 seconds before the full Infinite HD desktop is ready.
- P3: future public-safe content can be added to Finder one approved project folder at a time.

No actionable P0, P1, or P2 findings remain.

final result: passed
