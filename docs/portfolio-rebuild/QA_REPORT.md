# Portfolio QA Report

Date: 2026-07-19

## Current pass

- PASS — Project navigation stays in a separate sticky rounded control band and no longer overlays the scrolling case-study deck.
- PASS — The case-study canvas has its own rounded border and remains visually separated in both dark and light themes.
- PASS — Professional Work no longer uses an oversized lock card or ambiguous shopping-bag-like icon.
- PASS — Homepage project titles no longer gain an underline on hover.
- PASS — Alex OS uses a locally hosted credited wallpaper, curated public-safe Finder, real media apps, and a real Mac OS 9 guest through Infinite Mac.
- PASS — Compact Alex OS and project views were checked at 390 × 844.
- PASS — Desktop Alex OS, Professional Work, and scrolled project states were checked in the in-app browser.
- PASS — The ryOS source and Alex OS implementation were reviewed in one same-size comparison input.

## Automated checks

Command: `npm test`

Result: 7 tests passed.

The suite verifies the two-column Work feed, original cover and hover-video behavior, Play structure, curated Alex OS server output, authentic Mac launch configuration, public-safe content boundary, project close controls, complete source assets, GitHub Pages export, and verified gallery order.

Command: `npm run lint`

Result: 0 errors and six warnings for intentional static `<img>` elements.

## Visual evidence

| State | Evidence | Result |
| --- | --- | --- |
| ryOS vs. Alex OS, same-size desktop views | `/tmp/portfolio-os-comparison.png` | Passed |
| Mac OS 9 fully booted to Infinite HD | `/tmp/portfolio-os-classic-ready.png` | Passed |
| Professional Work | `/tmp/portfolio-professional-implementation.png` | Passed |
| Project viewer, dark, scrollY 900 | `/tmp/portfolio-project-nav-dark.png` | Passed |
| Project viewer, light, scrollY 900 | `/tmp/portfolio-project-nav-light.png` | Passed |
| Mobile Alex OS, 390 × 844 | `/tmp/portfolio-os-mobile-final-390x844.png` | Passed |
| Mobile project viewer, 390 × 844 | `/tmp/portfolio-project-mobile-390x844.png` | Passed |

## Known low-priority constraints

- The emulator's cold boot can take roughly 30–40 seconds before Infinite HD is fully ready.
- The current Professional Work route requests access by email; the final protected-content system remains a future product decision.
