# Design QA — Exact Live Portfolio Clone

Audited: 2026-08-07 15:00 EDT

## Comparison target

- Sole visual and content authority: `https://alexinfield.com`
- Local implementation: `http://localhost:3000/`
- Desktop viewport: 1280 × 720
- Portrait-mobile viewport: 390 × 844
- Compared routes: `/`, `/projects/ping`, `/info`, and `/etc`
- Durable screenshot evidence: `/Users/ainfield/Library/CloudStorage/GoogleDrive-alex@infield.net/My Drive/Files/AI/Codex Hub/Projects/Personal/Portfolio Website/Deliverables/Exact Live Clone QA/Evidence/`

## Visual comparison

Source and implementation screenshots were captured at the same viewport and state, placed side by side, and inspected as combined comparison images.

| Surface | Viewport | Mean absolute RGB difference | Result |
| --- | --- | ---: | --- |
| Homepage | 1280 × 720 | 0.26 | Passed |
| Homepage | 390 × 844 | 0.11 | Passed |
| Ping project | 1280 × 720 | 0.08 | Passed |
| Info | 1280 × 720 | 0.08 | Passed |
| Etc | 1280 × 720 | 0.08 | Passed |

The remaining sub-pixel differences are consistent with capture timing and rendering noise. Layout, typography, color, spacing, crops, responsive behavior, and initial carousel state visually match the live source.

After the high-resolution Drive sources were promoted, Ping was captured again from the live site and local preview at the same in-app-browser viewport and state. The combined side-by-side comparison remained visually identical, including layout, typography, spacing, crops, and image sequence.

## Route and interaction checks

- The static export contains the nine live routes: `/`, six project routes, `/info`, and `/etc`.
- The live homepage order is preserved: Ping, Molekule Go, Luma, Niche, Hyphae, Mode.
- The three verified legacy redirects are preserved: `/play` → `/etc`, `/projects/pillar` → `/projects/niche`, and `/projects/furniture` → `/projects/mode`.
- The adaptive-archive-only routes are absent from the exported site.
- Work, Info, Etc, project-card, and logo/home navigation were exercised locally.
- Ping renders all 17 live media items in the original sequence.
- Etc carousels advance automatically and retain the live page's desktop and mobile structure.
- Every published route was reloaded in the in-app browser after the source promotion. All 256 local images decoded with nonzero natural dimensions, and all rendered image, video, and iframe media URLs remained local.
- Every project background video was scrolled onscreen and observed advancing with `readyState = 4` and no media error. Offscreen background videos intentionally pause through the intersection observer, matching the intended resource-saving behavior.
- The two Desk Pen carousels remain synchronized: only the active slide's two matching videos play, while hidden videos stay paused at time zero.
- The Hyphae narrative film is now a self-hosted 1920 × 1080 H.264/AAC file with a local poster and native controls. Browser QA confirmed manual playback, time advancement, and no media error; the page no longer depends on Vimeo for delivery.
- The generated site remains `noindex,nofollow`; Webflow, DNS, and `alexinfield.com` were not changed.

## Build verification

- `npm test`: 9 of 9 tests passed, including the production build, GitHub Pages export, local-media assertions, synchronized-carousel behavior, and route/asset coverage.
- `npm run lint`: completed with no errors. The remaining warnings are intentional raw-image and stylesheet-link warnings required for source-faithful rendering.
- All 256 image files passed decoder/metadata validation. Compared with the pre-promotion snapshot, 65 image files were upgraded and none became smaller or changed aspect ratio.
- All 17 repository MP4 files passed metadata probing; the deployable set uses browser-portable H.264 media, while the unused original Desk Pen HEVC source is excluded from the Pages export.
- Generated GitHub Pages payload: 423,090,020 bytes (403.49 MiB), 39.40% of a 1 GiB ceiling, leaving 620.51 MiB of headroom. Unpublished Figma assets and the unused 60.95 MiB Desk Pen HEVC master are excluded from the published payload.

## Finding history

- P1, resolved: The prior adaptive archive introduced unpublished routes, controls, and styling that did not match the live portfolio. The public surface has been replaced with the live site's route set, order, header, project galleries, Info page, and Etc page.
- P1, resolved: Hidden Etc labels were briefly exposed because of local CSS specificity. The exact live hidden state is restored and the corrected comparison passes.
- P1, resolved: Webflow's inherited `.w-background-video > video { z-index: -100 }` rule placed project videos behind the page background. Project video wrappers now establish a local stacking context, so the original videos remain visible without changing the live layout.
- P1, resolved: The Hyphae narrative film previously depended on a Vimeo iframe and therefore remained an external delivery dependency. The exact 85.824-second delivery copy and poster are now stored locally and served by the static site.
- P1, resolved: Hidden Desk Pen carousel videos could continue playing out of sync. Each carousel now explicitly resets and pauses inactive videos and starts only its active video.
- P2, source limitation: The original fifth Desk Pen carousel video, `IMG_1741`, is not present in the repository or unified Drive export library. Figma confirms the matching video node and hash but does not expose the source bytes through the connected API. The exact live poster is used for that frame, so the initial visual state matches while motion on that one carousel frame remains unavailable.

## Final assessment

The implementation faithfully duplicates the current live portfolio across every available route, uses the strongest verified Drive sources that fit the hosting budget, and serves all published media without Webflow or Vimeo delivery dependencies. The one unavailable Desk Pen source video is explicitly tracked and does not conceal a code or layout mismatch.

final result: passed
