# Alex Infield portfolio archive

This is a GitHub-ready local recreation of `alexinfield.com`. It contains the
live homepage artwork, the Info image, and complete visual galleries for Ping,
Molekule Go, Luma, Niche, Hyphae Light, and Mode.

## Publish from GitHub

The deploy workflow builds the Vinext application and publishes the generated
`gh-pages/` directory whenever `main` is pushed. In **Settings → Pages**, use
**GitHub Actions** as the publishing source. No separate build or hosting
service is needed.

The temporary `github.io` deployment is intentionally emitted with `noindex`
metadata and a restrictive `robots.txt`. Set `PORTFOLIO_ALLOW_INDEXING` to
`"true"` in `.github/workflows/deploy-pages.yml` only after `alexinfield.com`
is attached and the production deployment has passed QA.

If you want to replace the current `alexinfield.com` site, configure that
custom domain in GitHub Pages after the repository is online. That domain change
is intentionally not made by this repository.

## Source layout

- `public/` — source assets copied into the generated application build.
- `public/assets/home/` — homepage images, site CSS, and original font files.
- `public/assets/info/` — the Info-page image.
- `public/assets/{ping,molekule-go,luma,niche,hyphae,mode}/` — complete local
  case-study galleries, including video files.
- Each asset folder has `manifest.json`, recording the original source name,
  source URL, local `media/` file path, and whether it was directly recovered.
- `app/` — matching React/Vinext source used for local development.
- `scripts/export-github-pages.mjs` — renders every static route into
  `gh-pages/` and makes paths repository-subpath-safe.
- `.github/workflows/deploy-pages.yml` — GitHub Pages deployment workflow.

## Local preview

For local development, use:

```bash
npm ci
npm run dev
```

To build and validate the exact Pages output:

```bash
npm test
```

All artwork, fonts, and motion files were downloaded from the live source site;
no generated images are included.
