# QA Report

Date: 2026-07-18

## Automated checks

Command: `npm test`

Result: 5 tests passed.

The suite verifies:

- Editorial homepage content and removal of “I want to see”.
- Correct Figma project order and cover mapping.
- Hover-video markup and still-only Mode behavior.
- Close controls on project and info pages.
- GitHub Pages export with relative links and no hydration payload.
- Complete downloaded manifests with zero recorded failures.
- Gallery counts, uniqueness, asset existence, and video-poster links for all six projects.

## Visual checks

| Viewport | Pages checked | Result |
| --- | --- | --- |
| 1440 × 1000 | Home, All projects | Passed; two columns, correct crops, fixed header, correct order |
| 1024 × 768 | Responsive structure | Passed by breakpoint/style inspection |
| 768 × 1024 | Home | Passed; two-column tablet presentation, no horizontal overflow |
| 390 × 844 | Home, All projects, Ping | Passed; one-column cards, still-first behavior, close control, 17 Ping slides |
| 375 × 667 | Responsive rules | Covered by the same phone breakpoint and overflow checks |

## Direct design comparison

- Figma `Portfolio v1` and the rebuilt `/all` were placed side by side at the same visible state. The project order, two-column geometry, 16:9 covers, black canvas, and visual hierarchy align.
- Figma `Portfolio v1.1` and the rebuilt homepage were placed side by side. The header language, two-column opening, black canvas, Molekule/Luma asset pairing, and editorial direction align; the implementation intentionally makes the opening more immersive before continuing into the selected-work narrative.

## Interaction checks

- Five cards have verified project-specific hover videos.
- Mode has no video overlay.
- The browser connection confirmed all five project-specific hover videos and the fine-pointer media-query path. Its test cursor does not expose a CSS hover state, so final pointer-event behavior is also covered by the runtime wiring and markup tests.
- On the phone breakpoint, hover video opacity remains zero and taps remain normal project links.

## Known source limitation

The Figma MCP could enumerate and identify the Ping page, but broad extraction of that unusually large page timed out. Ping therefore uses the already downloaded, verified 17-slide sequence as the order authority, with the Figma page retained as its identity source.
