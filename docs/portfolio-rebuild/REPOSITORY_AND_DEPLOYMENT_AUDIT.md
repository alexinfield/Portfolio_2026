# Repository and Deployment Audit

## Before

The repository contained two separately maintained websites:

- Next/vinext routes in `app/`.
- A second static copy in `public/index.html`, `public/info/`, `public/projects/`, `public/portfolio.css`, and `public/portfolio.js`.

The GitHub Pages workflow uploaded `public/` directly, so changes to the application routes could diverge from the live Pages site.

## After

- `app/` and `lib/portfolio.ts` are the single presentation and content source.
- `scripts/export-github-pages.mjs` renders the application routes into `gh-pages/` after a successful vinext build.
- `.github/workflows/deploy-pages.yml` installs dependencies, runs `npm run build:github`, and uploads `gh-pages/`.
- `gh-pages/` is generated and ignored by Git.
- The generated static HTML removes hydration-only scripts and rewrites links for GitHub project subpaths.
- The vinext/Sites build remains intact in `dist/`.

## Rollback

- Baseline commit: `6d665cf`
- Rollback tag: `backup/portfolio-pre-rebuild-20260718`
- Rebuild branch: `codex/portfolio-rebuild-20260718`

## Deployment boundary

The repository can be previewed and reviewed without changing the current custom-domain DNS. A merge to `main` triggers the GitHub Pages workflow; custom-domain cutover should happen only after the branch preview is approved.
