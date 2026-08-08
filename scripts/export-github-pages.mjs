import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const output = join(root, "gh-pages");
const siteOrigin = (process.env.PORTFOLIO_SITE_ORIGIN ?? "https://alexinfield.com").replace(/\/+$/, "");
const allowIndexing = process.env.PORTFOLIO_ALLOW_INDEXING === "true";
const projectSlugs = ["ping", "molekule-go", "luma", "niche", "hyphae", "mode"];
const routes = [
  "/",
  "/etc",
  "/info",
  ...projectSlugs.map((slug) => `/projects/${slug}`),
];
const redirects = [
  { route: "/play", target: "/etc", relativeTarget: "../etc/" },
  { route: "/projects/pillar", target: "/projects/niche", relativeTarget: "../niche/" },
  { route: "/projects/furniture", target: "/projects/mode", relativeTarget: "../mode/" },
];

const workerUrl = new URL(`../dist/server/index.js?export=${Date.now()}`, import.meta.url);
const { default: worker } = await import(workerUrl.href);

await rm(output, { recursive: true, force: true });
await cp(join(root, "dist/client"), output, { recursive: true });

// Keep native and recovery sources in the repository/Drive, but do not spend
// the Pages budget on files that no published route references.
await rm(join(output, "assets", "figma-web"), { recursive: true, force: true });
await rm(join(output, "assets", "etc", "media", "desk-pen-img-1421.mp4"), { force: true });

// Vite emits imported fonts beside the generated stylesheet but keeps a
// root-relative /assets URL. Make those generated URLs stylesheet-relative so
// the same build works on both the custom domain and GitHub's repository path.
const generatedAssets = join(output, "assets");
let relativePreloadHelpers = 0;
for (const entry of await readdir(generatedAssets, { withFileTypes: true })) {
  if (!entry.isFile()) continue;
  const assetPath = join(generatedAssets, entry.name);

  if (entry.name.endsWith(".css")) {
    const css = await readFile(assetPath, "utf8");
    const patchedCss = css
      .replace(/url\((["']?)\/assets\//g, "url($1./")
      .replace(/url\((["']?)\/alex-os\//g, "url($1../alex-os/");
    await writeFile(assetPath, patchedCss);
  }

  if (entry.name.endsWith(".js")) {
    const javascript = await readFile(assetPath, "utf8");
    const patched = javascript.replaceAll(
      "return`/`+e",
      "return new URL(`../${e}`,import.meta.url).href",
    );
    if (patched !== javascript) {
      relativePreloadHelpers += 1;
      await writeFile(assetPath, patched);
    }
  }
}

if (relativePreloadHelpers === 0) {
  throw new Error("Could not make Vite's dynamic preload helper repository-path-safe");
}

function relativeRoot(route) {
  if (route === "/") return "./";
  if (route.startsWith("/projects/")) return "../../";
  return "../";
}

function staticHtml(html, route) {
  const base = relativeRoot(route);
  const canonicalPath = route === "/" ? "/" : route;
  let result = html
    .replace(/<link\b[^>]*rel=["']modulepreload["'][^>]*\/?>/gi, "")
    .replace(/\sdata-rsc-css-href=("[^"]*"|'[^']*')/gi, "")
    .replace(/\sdata-precedence=("[^"]*"|'[^']*')/gi, "")
    .replace(/(href|src|poster)=(['"])\/(?!\/)/gi, `$1=$2${base}`)
    .replaceAll('import("/assets/', `import("${base}assets/`)
    .replaceAll('"/assets/', `"${base}assets/`)
    .replaceAll('"/portfolio-runtime.js', `"${base}portfolio-runtime.js`)
    .replace(/<meta\s+name="robots"[^>]*>/gi, "")
    .replace(/<link rel="canonical" href="[^\"]*"\/>/gi, "");

  const robots = allowIndexing ? "" : '<meta name="robots" content="noindex,nofollow"/>';
  result = result.replace(
    "</head>",
    `<link rel="canonical" href="${siteOrigin}${canonicalPath}"/>${robots}</head>`,
  );

  return result;
}

async function renderRoute(route) {
  const response = await worker.fetch(
    new Request(`http://localhost${route}`, { headers: { accept: "text/html" } }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    { waitUntil() {}, passThroughOnException() {} },
  );

  if (!response.ok) throw new Error(`Failed to render ${route}: ${response.status}`);
  const html = staticHtml(await response.text(), route);
  const path = route === "/" ? join(output, "index.html") : join(output, route.slice(1), "index.html");
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, html);
  return html;
}

for (const route of routes) {
  await renderRoute(route);
}

for (const { route, target, relativeTarget } of redirects) {
  const path = join(output, route.slice(1), "index.html");
  const robots = allowIndexing ? "" : '<meta name="robots" content="noindex,nofollow">';
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Alex Infield</title><link rel="canonical" href="${siteOrigin}${target}">${robots}<meta http-equiv="refresh" content="0;url=${relativeTarget}"></head><body><a href="${relativeTarget}">Continue</a><script>location.replace(new URL(${JSON.stringify(relativeTarget)},location.href).href)</script></body></html>`;
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, html);
}

await writeFile(
  join(output, "404.html"),
  '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Not Found</title><style>html,body{background:#000;margin:0;min-height:100%}</style></head><body></body></html>',
);
await writeFile(join(output, ".nojekyll"), "");
await writeFile(
  join(output, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes
    .map((route) => `  <url><loc>${siteOrigin}${route === "/" ? "/" : route}</loc></url>`)
    .join("\n")}\n</urlset>\n`,
);
await writeFile(
  join(output, "robots.txt"),
  allowIndexing
    ? `User-agent: *\nAllow: /\nSitemap: ${siteOrigin}/sitemap.xml\n`
    : "User-agent: *\nDisallow: /\n",
);

const generatedHome = await readFile(join(output, "index.html"), "utf8");
if (generatedHome.includes("I want to see")) throw new Error("Legacy portfolio markup remains in export");

console.log(`Exported ${routes.length} live routes and ${redirects.length} legacy redirects to ${output}`);
