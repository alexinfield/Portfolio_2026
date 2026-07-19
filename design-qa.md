# Design QA — Portfolio Structure, Project Drawer, and Alex OS

## Comparison target

- Source visual truth:
  - `/Users/ainfield/.codex/generated_images/019f49e5-9a42-7292-9580-1c51c04f7b9b/exec-7406b9a5-cadf-41f0-b2a9-643db4f456c2.png` — approved portfolio-feed direction.
  - `/Users/ainfield/.codex/generated_images/019f49e5-9a42-7292-9580-1c51c04f7b9b/exec-9fa72d08-abfe-4531-bee7-8c95d5950838.png` — approved Alex OS concept, with the user's request to make the result more authentic than this mock.
  - `/private/tmp/portfolio-structure-refs/apple-macos27-liquid-glass.png` — official macOS 27 Liquid Glass visual reference captured during implementation.
- Browser-rendered implementation screenshots:
  - `/Users/ainfield/Documents/Portfolio/docs/portfolio-rebuild/qa/home-final.png`
  - `/Users/ainfield/Documents/Portfolio/docs/portfolio-rebuild/qa/play-desktop.png`
  - `/Users/ainfield/Documents/Portfolio/docs/portfolio-rebuild/qa/play-light.png`
  - `/Users/ainfield/Documents/Portfolio/docs/portfolio-rebuild/qa/alex-os-final.png`
  - `/Users/ainfield/Documents/Portfolio/docs/portfolio-rebuild/qa/alex-os-music-open.png`
- Viewports:
  - Desktop comparison: 1280 × 720 CSS pixels at DPR 2.
  - Mobile structural check: 390 × 844 CSS pixels.
- State:
  - Work in dark mode.
  - Play in dark and light modes.
  - Alex OS with Finder active, plus Music, maximize/restore, minimize, playback, and compact mobile app-switching states.

## Full-view comparison evidence

The approved feed mock and `home-final.png` were opened together in one comparison input. The implementation preserves the mock's restrained black-and-white palette, top navigation, two-column content rhythm, project-first imagery, and small metadata. The updated uniform 16:9 cards intentionally supersede the mock's mixed row heights because the user explicitly requested a Zeg Zulka-style uniform system.

The Alex OS concept, official macOS Liquid Glass reference, and `alex-os-final.png` were opened together in one comparison input. The implementation keeps the concept's Finder-led composition while moving closer to desktop conventions through a full menu bar, layered glass surfaces, toolbar controls, sidebar, dock, traffic-light window controls, focus ordering, and draggable/resizable windows. It uses Alex's real media and does not redistribute Apple-owned icons or system assets.

## Focused region comparison evidence

- Header and card metadata: checked name/domain/year alignment, active navigation underline, theme switch, launcher placement, card geometry, and image crop in `home-final.png`, `play-desktop.png`, and `play-light.png`.
- Alex OS Finder and Dock: checked toolbar density, sidebar hierarchy, app icons, surface opacity, window elevation, and bottom safe area in `alex-os-final.png`.
- Music and window controls: checked playback state, scrubber, volume, focus ordering, maximize/restore geometry, minimize behavior, and dock running indicators using `alex-os-music-open.png` plus live browser interaction.

## Findings

No actionable P0, P1, or P2 findings remain.

### Required fidelity surfaces

- Fonts and typography: the portfolio keeps the approved neutral sans-serif hierarchy with compact metadata and no oversized display text. Alex OS uses appropriate small UI weights and readable line heights across menu bar, Finder, and media windows.
- Spacing and layout rhythm: desktop Work and Play use equal two-column tracks and uniform 16:9 media. Mobile collapses to one column. Alex OS maintains window and dock safe areas without horizontal overflow at 390 px.
- Colors and visual tokens: dark and light portfolio tokens remain coherent and the switch persists. Alex OS glass, borders, highlights, shadows, and wallpaper contrast are internally consistent and closer to the supplied macOS reference than the earlier concept.
- Image quality and asset fidelity: all visible portfolio and Play imagery comes from Alex's existing site or project source files. Crops remain sharp and proportional. Icons come from a consistent maintained icon library; no placeholder emoji, copied Apple assets, or generated imagery were introduced.
- Copy and content: Work, Play, Professional Work, Info, and Alex OS now have distinct roles. Play contains smaller presentable design work, while music, video sketches, and archive material appear only inside Alex OS.

## Responsive and interaction checks

- Desktop and mobile routes have no horizontal overflow.
- Work cards preserve still-first behavior and reveal verified project video on pointer hover where available.
- Light/dark switching works and persists.
- Section and project close controls return to their parent context.
- Alex OS supports window focus, drag, resize, close, minimize, maximize, restore, dock launch, real audio play/pause/scrubbing/volume, and local video playback.
- At 390 × 844, Alex OS switches between active apps, hides the wide Finder sidebar, keeps the Finder grid within the viewport, and leaves the Dock accessible.
- Browser console checked after the primary Alex OS interactions: no errors or warnings.
- GitHub Pages repository-subpath simulation checked at `/Portfolio_2026/alex-os/`: lazy CSS, Finder, Dock, audio, video, and poster assets all resolved from the repository path with no current-host console errors.

## Comparison history

- Earlier P2: maximizing an Alex OS window changed position but retained its string-based dimensions, so the window did not fill the usable desktop.
  - Fix: maximize now calculates numeric viewport dimensions and preserves the prior bounds for restore.
  - Post-fix evidence: at 1280 × 720, the maximized Music window measured `x: 12`, `y: 44`, `width: 1256`, `height: 606`; Restore appeared and returned the previous window bounds.
- Earlier P2: the mobile desktop needed an explicit compact mode to prevent overlapping desktop windows and persistent controls.
  - Fix: compact mode shows one active app, collapses the Finder sidebar, tightens the grid, and preserves the Dock.
  - Post-fix evidence: at 390 × 844 the document width remained 390 px; Finder stayed within `x: 8–382`, the Dock within `x: 50–340`, and launching Music switched the active window without overflow.
- Publish verification issue, outside the visual-comparison loop: the first GitHub Pages deployment loaded the Work feed but Alex OS failed while preloading lazy CSS from the domain root instead of the repository path.
  - Fix: the static exporter now makes Vite's dynamic preload helper repository-relative, and Alex OS client-only media paths are route-relative.
  - Post-fix evidence: the exact `/Portfolio_2026/alex-os/` path rendered Finder and the Dock; audio and video reached ready state 4 from repository-relative URLs, and the current-host console log was empty.

## Implementation checklist

- [x] Uniform Work and Play cards.
- [x] Real source imagery and verified hover motion.
- [x] Persistent light/dark theme.
- [x] Functional close navigation.
- [x] Authentic desktop structure with real media.
- [x] Desktop and mobile browser checks.
- [x] Static GitHub Pages export and rendered-HTML tests.

## Follow-up polish

- P3: add dock magnification and fuller menu dropdown behavior in a later Alex OS expansion.
- P3: replace the three-project Play seed with the next approved batch of real projects once their metadata is selected.

## Project drawer iteration — 2026-07-19

- Source visual truth: `/var/folders/cr/qn1yz30s6jv0xl49c6pmykjh0000gn/T/codex-clipboard-14b93c61-9520-4522-b9ef-3e31b9a3af3b.png`.
- Browser-rendered implementation screenshots:
  - `/Users/ainfield/Documents/Portfolio/docs/portfolio-rebuild/qa/project-drawer-final.png` — desktop open state.
  - `/Users/ainfield/Documents/Portfolio/docs/portfolio-rebuild/qa/project-drawer-closed.png` — desktop collapsed state.
  - `/Users/ainfield/Documents/Portfolio/docs/portfolio-rebuild/qa/project-drawer-mobile-open.png` — mobile overlay state before the dismissal-target fix.
- Viewports: 1280 × 720 desktop and 390 × 844 mobile.
- State: dark theme, Molekule Go active, drawer open and closed.

### Full-view and focused comparison evidence

The supplied screenshot and `project-drawer-final.png` were opened together in the same comparison input. The implementation matches the reference's left-anchored dark panel, large two-by-two section navigation, compact About card, thumbnail project list, active-project treatment, and exposed edge handle. It intentionally omits the reference's `Frame 3 / Frame 4` prototype labels because they are not portfolio content. A focused pass checked the section-tile scale, drawer width, text density, thumbnail crops, active border, handle placement, and visible project canvas.

### Drawer findings

No actionable P0, P1, or P2 findings remain.

- Fonts and typography: the drawer uses the site's existing Funktional Grotesk, with large low-contrast section tiles and compact project metadata matching the reference hierarchy.
- Spacing and layout rhythm: the desktop drawer occupies 352 px at a 1280 px viewport, its 42 × 104 px handle remains centered on the edge, and the project canvas expands from 913 px to 1265 px when collapsed.
- Colors and visual tokens: panel, cards, active border, muted type, and handle glass reuse the portfolio's dark/light tokens while preserving the reference's near-black and neutral-gray composition.
- Image quality and asset fidelity: all six thumbnails use the existing project covers; no generated or placeholder imagery was introduced.
- Copy and content: Work, play, pro, info, About Alex, and all six projects are present. The Professional Work tile keeps its lock indicator.
- Accessibility and interaction: the handle exposes expanded state, the closed drawer is inert and hidden from assistive navigation, Escape closes it, the state persists while switching projects, and focus styles remain visible.

### Drawer comparison history

- Earlier P2: the first mobile overlay left only a narrow exposed strip, and the full-viewport scrim's click center sat behind the drawer, making outside-click dismissal unreliable.
  - Fix: the mobile drawer now reserves 72 px and the scrim begins at the drawer edge instead of underneath it.
  - Post-fix evidence: at 390 × 844 the drawer measured 318 px, the exposed scrim measured 57 px after the browser scrollbar, clicking it changed `aria-expanded` to `false`, moved the drawer edge to 0, removed the scrim, and produced no horizontal overflow.
- Desktop open, collapse, reopen, active-project switching to Luma, mobile overlay dismissal, Escape support, and session persistence were tested. No current-page console errors were recorded.

### Drawer implementation checklist

- [x] Two-by-two section tiles.
- [x] About card and complete project list.
- [x] Current-project state and real thumbnails.
- [x] Animated desktop push/collapse behavior.
- [x] Tablet/mobile overlay and outside-click dismissal.
- [x] Keyboard, accessibility, and persisted state.

final result: passed
