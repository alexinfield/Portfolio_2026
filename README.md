# Alex Infield portfolio

Source for [alexinfield.com](https://alexinfield.com), a static portfolio hosted on GitHub Pages. The current refresh uses the pinned Compass 1.0 package, the approved 16-entry Personal collection and the existing six image-based cases. See [DESIGN.md](DESIGN.md) for the accepted design.

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

Browser verification runs on Infield with `node tests/verify-browser.mjs <export> <evidence> [preview-export]`, using existing Playwright and Chromium paths in `PORTFOLIO_PLAYWRIGHT_MODULE` and `PORTFOLIO_CHROMIUM_PATH`; it installs nothing.

The site is built from the React source in `app/`, the small project registry in
`lib/`, and the self-hosted production media in `public/assets/`. Pushing
`main` runs the GitHub Pages deployment workflow.
