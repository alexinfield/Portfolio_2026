# Alex Infield portfolio

Source for [alexinfield.com](https://alexinfield.com), a static portfolio hosted on GitHub Pages. Palettes are fixed: Personal is light and every other page is dark. This draft branch pins reviewed Compass 1.2.1 for seamless Personal galleries and adds Original Tracks, an inline player whose script and font load near the viewport. Recording audio loads only on Play. Its three recordings and no-JS file links come from `public/assets/original-tracks/tracks.json`; new entries need no React changes. The existing collection and six cases remain. See [DESIGN.md](DESIGN.md). No PR, push or deployment is part of this draft.

## Local development

```bash
npm ci
npm run dev
```

## Validate the production export

```bash
npm test
npm run lint
```

Builds and browser verification for this draft run on Outfield through the shared heavy-job gate. The existing browser helpers use Playwright and Chromium paths in `PORTFOLIO_PLAYWRIGHT_MODULE` and `PORTFOLIO_CHROMIUM_PATH`; they install nothing. `PORTFOLIO_DRAFT_LINK_MEDIA=true` reduces local flash writes by reusing immutable media during export; default release builds retain normal copying.

The site is built from the React source in `app/`, the small project registry in
`lib/`, and the self-hosted production media in `public/assets/`. Pushing
`main` runs the GitHub Pages deployment workflow.
