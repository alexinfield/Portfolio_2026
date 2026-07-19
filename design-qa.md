# Design QA — Warm Editorial Styling Pass

Date: 2026-07-19

## Comparison target

- Source visual truth: `/Users/ainfield/.codex/generated_images/019f49e5-9a42-7292-9580-1c51c04f7b9b/exec-3f3d7e38-4987-4dad-8cc5-8cee36e385cd.png` (selected option 2), with the user-directed exception that the oversized introductory banner must be removed.
- Structural reference: `https://www.apple.com/macbook-pro/`, used for project-level hierarchy, local navigation, media pacing, and section clarity rather than Apple branding.
- Rendered homepage: `/tmp/portfolio-option2-home.png`.
- Rendered project page: `/tmp/portfolio-option2-project.png` and `/tmp/portfolio-option2-project-intro.png`.
- Combined full-view comparison: `/tmp/portfolio-qa-comparison.png`.
- Viewport: 1280 × 720 desktop; responsive metrics checked at 390 × 844.
- State: light mode, Work active, homepage at top; Molekule Go project at hero and overview positions.

## Full-view comparison evidence

- The implementation retains the selected direction’s warm bone canvas, near-black typography, fine rules, restrained orange signal color, compact active navigation, and uniform two-column image grid.
- The implementation intentionally removes the mockup’s oversized display statement and preserves the approved compact portfolio introduction, as explicitly requested.
- The work grid begins within the first viewport and preserves Alex’s original still imagery, metadata, project order, and video-on-hover behavior.
- The project presentation uses a separate sticky local bar, cinematic media, small chapter gaps, and a clear overview block, matching the organizational principles observed in the Apple reference without copying its identity.

## Focused-region comparison evidence

- Header: Alex’s existing navigation labels and theme control remain in the same positions; the active state now uses a precise two-pixel editorial block and orange signal dot.
- Project cards: real assets retain correct 16:9 crops; captions keep the requested title, domain, and year structure with increased typographic clarity and no hover underline.
- Project overview: title, introduction, role/type metadata, and year remain source-backed and are presented as one legible chapter below the hero.
- Mobile: measured layout width is 366 px inside a 390 px viewport, with a 390 px document width and no horizontal overflow. The grid becomes one column and the menu exposes all four sections.

## Required fidelity surfaces

- Fonts and typography: Funktional Grotesk is preserved; tighter tracking and larger card titles provide the selected editorial character without importing Suisse or SF Pro. No clipping or truncation was found.
- Spacing and layout rhythm: 3.25vw desktop gutters, compact intro spacing, 20 px grid gap, fine section rules, three-pixel media radii, and eight-pixel project chapter gaps are consistent. The intentional removal of the oversized banner is the only major source-layout deviation.
- Colors and visual tokens: warm bone `#f4f0e8`, near-black `#161411`, stepped warm neutrals, and restrained orange `#f04d25` track the selected direction. Dark mode uses the same hierarchy with warm-white text.
- Image quality and asset fidelity: all visible project media uses existing Alex source assets. No generated or placeholder assets were introduced, and original crops remain sharp.
- Copy and content: navigation, introduction, project titles, domains, years, case-study copy, and professional-work language remain unchanged except for the descriptive UI label “Project overview.”

## Interaction and browser checks

- Theme switching was tested after hydration in both directions and updates the document theme correctly.
- Mobile Menu opens, exposes Work, Play, Professional, and Info, reports `aria-expanded`, and closes correctly.
- Project Back and Next links remain visible in the local project bar.
- Hover-video behavior remains wired to the existing runtime and source video assets.
- Browser console check returned no errors or warnings.
- Build, GitHub Pages export, and all seven rendered-route tests pass.

## Findings

No actionable P0, P1, or P2 findings remain.

## Comparison history

- Initial implementation: selected option 2 palette and typographic treatment were applied while the oversized banner was deliberately omitted; no P0/P1/P2 mismatch was found in the combined desktop comparison.
- Responsive and interaction pass: mobile bounding-box checks showed no overflow; theme and menu interactions passed; no corrective visual iteration was required.

## Follow-up polish

- P3: Fine-tune the orange signal color after reviewing it on Alex’s preferred display if a slightly warmer or more muted accent feels more personal.

final result: passed
