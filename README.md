# Alex Infield portfolio

Source for [alexinfield.com](https://alexinfield.com), a static portfolio hosted on GitHub Pages.

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

The site is built from the React source in `app/`, the small project registry in
`lib/`, and the self-hosted production media in `public/assets/`. Pushing
`main` runs the GitHub Pages deployment workflow.
