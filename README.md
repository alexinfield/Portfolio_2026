# Alex Infield portfolio archive

This is a GitHub-ready local recreation of `alexinfield.com`. It contains the
live homepage artwork, the Info image, and complete visual galleries for Ping,
Molekule Go, Luma, Niche, Hyphae Light, and Mode.

## Publish from GitHub

The deploy workflow publishes `public/` to GitHub Pages whenever `main` is
pushed. After creating and pushing a GitHub repository, open **Settings →
Pages** and select **GitHub Actions** as the source. No build service is needed
for the Pages copy.

If you want to replace the current `alexinfield.com` site, configure that
custom domain in GitHub Pages after the repository is online. That domain change
is intentionally not made by this repository.

## Source layout

- `public/` — ready-to-publish static site for GitHub Pages.
- `public/assets/home/` — homepage images, site CSS, and original font files.
- `public/assets/info/` — the Info-page image.
- `public/assets/{ping,molekule-go,luma,niche,hyphae,mode}/` — complete local
  case-study galleries, including video files.
- Each asset folder has `manifest.json`, recording the original source name,
  source URL, local `media/` file path, and whether it was directly recovered.
- `app/` — matching React/Vinext source used for local development.
- `.github/workflows/deploy-pages.yml` — GitHub Pages deployment workflow.

## Local preview

The static copy is in `public/`; a simple local static-server preview is enough.
For the React source version, use:

```bash
npm install
npm run dev
```

All artwork, fonts, and motion files were downloaded from the live source site;
no generated images are included.
