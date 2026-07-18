# Design QA — Porto Rocha restoration

**Evidence**

- Source visual truth: `/tmp/portfolio-design-qa/portorocha-home-desktop.png`, `/tmp/portfolio-design-qa/portorocha-all-desktop-top.png`, `/tmp/portfolio-design-qa/portorocha-all-mobile-top.png`, and `/tmp/portfolio-design-qa/portorocha-detail-mobile.png`.
- Implementation screenshots: `/tmp/portfolio-design-qa/alex-home-desktop-v3.png`, `/tmp/portfolio-design-qa/alex-all-desktop-v1.png`, `/tmp/portfolio-design-qa/alex-home-mobile-v1.png`, `/tmp/portfolio-design-qa/alex-all-mobile-v1.png`, `/tmp/portfolio-design-qa/alex-project-desktop-v1.png`, and `/tmp/portfolio-design-qa/alex-project-mobile-v1.png`.
- Viewports: 1440 × 1000 desktop and 390 × 844 mobile.
- States: homepage active project workspace; project index at top; Ping detail page at top; desktop and mobile responsive states.
- Full-view comparison evidence: `/tmp/portfolio-design-qa/home-desktop-comparison.png`, `/tmp/portfolio-design-qa/all-desktop-comparison.png`, and `/tmp/portfolio-design-qa/all-mobile-comparison.png`.
- Focused-region evidence: the mobile comparison keeps the 30 px controls, 8 px margins, card radii, typography, restored stills, captions, and one-column collapse legible at native resolution. The desktop comparison keeps the split rail/stage geometry and two-column index legible, so a second crop was not needed.

**Findings**

- No actionable P0, P1, or P2 differences remain.
- Fonts and typography: the reference uses SF Pro Text at 14 px with 1.25 line height. The implementation uses Alex's bundled Funktional Grotesk at the same scale and rhythm so the site remains self-contained. Large type is limited to restrained project titles; the previous oversized editorial treatment is gone.
- Spacing and layout rhythm: the homepage now uses the reference's fixed left rail, 8 px gutters, 10 px cards, large active-media stage, and compact content tiles. The project index intentionally uses two desktop columns instead of the reference's four because Alex explicitly requested two; mobile collapses to one 359 px column.
- Colors and visual tokens: black background, `#e2e6e3` foreground, 50% muted copy, soft `#1a1a1a` controls, and dark `#151716` content panels match the captured reference. The close control remains visible over both black and light project media.
- Image quality and asset fidelity: all homepage and index previews use Alex's restored original portfolio stills. Project motion uses Alex's local MP4 files and project pages retain every media item in the verified sequence. No generated, placeholder, or hotlinked media is present.
- Copy and content: the reference structure is populated only with Alex's identity, six verified project names, concise factual category descriptions, contact information, and portfolio media. The reference's search prompt was replaced with “Alex Infield” as requested.
- Icons: the static close mark is the existing bundled Lucide asset with its repository license; no temporary glyph or CSS drawing is used.
- Responsive behavior: no horizontal overflow was found at 1440 or 390 px. Mobile home becomes a full-height scrollable project rail; mobile detail keeps only the active project card before the hero and gallery; the index becomes one column.
- Accessibility: routes use semantic landmarks and links, visible focus treatment, accessible close labels, muted inline video, touch-safe still defaults, reduced-motion handling, and real selectable text.

**Primary Interactions Tested**

- All Projects contains six restored stills and five matching local hover videos; Mode intentionally remains still-only because no verified Mode motion asset exists.
- Molekule Go navigates from the index to the correct detail route.
- The project close control returns to `/all`.
- Molekule Go and Ping each render 17 gallery media items in their stored verified order.
- The homepage renders six active-preview panels backed by the corresponding local project motion files or the verified Mode still.
- Fresh-browser console errors checked after navigation and return: none.

**Comparison History**

- Pass 1 found a P1 hydration overlay caused by the live New York clock updating before the development renderer finished. The clock text now suppresses the expected client-only difference and runtime setup waits until page load; the clean desktop capture is `/tmp/portfolio-design-qa/alex-home-desktop-v3.png`.
- Pass 1 also found a P2 close-control contrast problem over light media. The control now has an opaque dark surface; the fix is visible in the desktop homepage and project screenshots.
- Pass 2 found no remaining P0/P1/P2 mismatch. Side-by-side desktop and mobile comparisons confirm the intended reference system plus the requested two-column and navigation deviations.

**Implementation Checklist**

- [x] Restore Porto Rocha split-rail homepage structure.
- [x] Replace the selector prompt with Alex Infield.
- [x] Preserve the circular X on internal routes and homepage.
- [x] Keep All Projects two columns on desktop and one on mobile.
- [x] Keep original stills as defaults with local motion available on hover/focus.
- [x] Preserve verified project order and complete galleries.
- [x] Verify responsive layout, navigation, static export, font paths, and browser console.

**Follow-up Polish**

- P3: project descriptions remain intentionally concise until project-specific case-study copy is sourced from Figma or Alex's approved text.

final result: passed
