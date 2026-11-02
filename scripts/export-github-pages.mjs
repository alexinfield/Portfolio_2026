import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { applyExtendBlur } from "./extend-blur.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const output = join(root, process.env.PORTFOLIO_EXPORT_DIR || "gh-pages");
const siteOrigin = (process.env.PORTFOLIO_SITE_ORIGIN ?? "https://alexinfield.com").replace(/\/+$/, "");
const allowIndexing = process.env.PORTFOLIO_ALLOW_INDEXING === "true";
const basePath = process.env.PORTFOLIO_BASE_PATH ?? "";
if (!["", "/next"].includes(basePath) || (basePath && allowIndexing)) throw new Error("Invalid private export configuration");
const mount = value => !basePath || value === basePath || value.startsWith(basePath+"/") ? value : basePath+value;
const projectSlugs = ["ping", "molekule-go", "luma", "niche", "hyphae", "mode"];
const routes = [
  "/",
  "/personal",
  "/info",
  ...projectSlugs.map((slug) => `/projects/${slug}`),
];
const redirects = [
  { route: "/etc", target: "/personal", relativeTarget: "../personal/" },
  { route: "/play", target: "/personal", relativeTarget: "../personal/" },
  { route: "/projects/pillar", target: "/projects/niche", relativeTarget: "../niche/" },
  { route: "/projects/furniture", target: "/projects/mode", relativeTarget: "../mode/" },
];

const workerUrl = new URL(`../dist/server/index.js?export=${Date.now()}`, import.meta.url);
const { default: worker } = await import(workerUrl.href);

await rm(output, { recursive: true, force: true });
await cp(join(root, "dist/client"), output, { recursive: true });
for(const name of ["_headers",".assetsignore",".vite"])await rm(join(output,name),{recursive:true,force:true});

// Hidden Personal entries keep their record and media in the repository, but
// media used only by hidden entries is never published. Retired media (kept
// files no entry references any more) is withheld the same way.
const personalPackage = JSON.parse(await readFile(join(root, "lib/personal.json"), "utf8"));
const mediaSources = item => [item.cover, ...item.gallery].flatMap(function sources(media) {
  return [media.src, ...(media.variants ?? []).map(variant => variant.src), ...(media.poster ? sources(media.poster) : [])];
});
const publishedMedia = new Set(personalPackage.items.filter(item => !item.hidden).flatMap(mediaSources));
const withheldMedia = [...new Set([...personalPackage.items.filter(item => item.hidden).flatMap(mediaSources), ...(personalPackage.retired_media ?? [])])].filter(source => !publishedMedia.has(source));
for (const source of withheldMedia) await rm(join(output, "assets/personal", source), { force: true });

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
      .replace(/url\((["']?)\/assets\//g, "url($1./");
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

if (!basePath && relativePreloadHelpers === 0) {
  throw new Error("Could not make Vite's dynamic preload helper repository-path-safe");
}

// Fixed script URLs are cached for up to 10 minutes on GitHub Pages; stamp each
// reference with the exported file's content hash so HTML and scripts always match.
const scriptVersions = {};
for (const [name, path] of [["portfolio-runtime.js", "portfolio-runtime.js"], ["portfolio-analytics.js", "portfolio-analytics.js"], ["scroll-sequence.js", "assets/scroll-sequence/scroll-sequence.js"], ["scroll-sequence.css", "assets/scroll-sequence/scroll-sequence.css"], ["extend.js", "assets/eb/extend.js"], ["extend.css", "assets/eb/extend.css"]]) {
  scriptVersions[name] = createHash("sha256").update(await readFile(join(output, path))).digest("hex").slice(0, 8);
}
const versionScripts = html => html.replace(/(portfolio-(?:runtime|analytics)\.js|scroll-sequence\.(?:js|css))(?=\\?["'])/g, name => `${name}?v=${scriptVersions[name]}`);

// Extend blur fields (scripts/extend-fields/gen_fields.py writes lib/extend-fields.json offline).
const extendFields = JSON.parse(await readFile(join(root, "lib/extend-fields.json"), "utf8").catch(() => "{}"));
const extendReport = {pages: {}, missing: []};
function withExtendBlur(html, route) {
  const rel = route === "/" ? "index.html" : `${route.slice(1)}/index.html`;
  const before = html;
  const { html: out, stats } = applyExtendBlur(html, rel, output, extendFields, basePath);
  extendReport.pages[rel] = stats;
  extendReport.missing.push(...stats.missingKeys.map(key => `${rel} ${key}`));
  if (!stats.media) return before;
  const at = basePath ? `${basePath}/assets/eb/` : `${relativeRoot(route)}assets/eb/`;
  return out
    .replace("</head>", `<link rel="stylesheet" href="${at}extend.css?v=${scriptVersions["extend.css"]}"/></head>`)
    .replace("</body>", `<script src="${at}extend.js?v=${scriptVersions["extend.js"]}" defer=""></script></body>`);
}

function relativeRoot(route) {
  if (route === "/" || route === "/404") return "./";
  if (route.startsWith("/projects/")) return "../../";
  return "../";
}

function staticHtml(html, route) {
  const base = relativeRoot(route);
  const canonicalPath = route === "/" ? "/" : route;
  // Only the interactive shell pages hydrate. Cases/404 use the small static
  // appearance/media controller and retain native links without shipping React.
  const hydratedRoutes = new Set(["/personal", "/projects/hyphae"]);
  let result = hydratedRoutes.has(route.replace(/\/+$/, "") || "/")
    ? html
    : html
        .replace(/<script\s+id=["']_R_["'][^>]*>[\s\S]*?<\/script>/gi, "")
        .replace(
          /<script>self\.__VINEXT_RSC_(?:PARAMS|NAV|CHUNKS|DONE)__[\s\S]*?<\/script>/gi,
          "",
        );

  if (!basePath) result = result
    .replace(/srcset=(["'])(.*?)\1/gi, (_match, quote, value) => {
      const rewritten = value.replace(/(^|,\s*)\/(?!\/)/g, `$1${base}`);
      return `srcset=${quote}${rewritten}${quote}`;
    })
    .replace(/<link\b[^>]*rel=["']modulepreload["'][^>]*\/?>/gi, "")
    .replace(/\sdata-rsc-css-href=("[^"]*"|'[^']*')/gi, "")
    .replace(/\sdata-precedence=("[^"]*"|'[^']*')/gi, "")
    .replace(/(href|src|poster)=(['"])\/(?!\/)/gi, `$1=$2${base}`)
    .replaceAll('import("/assets/', `import("${base}assets/`)
    .replaceAll('"/assets/', `"${base}assets/`)
    .replaceAll('"/portfolio-runtime.js', `"${base}portfolio-runtime.js`)
    .replaceAll('"/favicon.png', `"${base}favicon.png`)
    .replace(/<meta\b(?=[^>]*\bname=["']robots["'])[^>]*>/gi, "")
    .replace(/<link rel="canonical" href="[^\"]*"\/>/gi, "");

  if(basePath){
    result=result.replace(/<[^!][^>]*>/g,tag=>tag
      .replace(/(href|src|poster)=(["'])\/(?!\/)(.*?)\2/gi,(_m,attr,q,value)=>`${attr}=${q}${mount("/"+value)}${q}`)
      .replace(/srcset=(["'])(.*?)\1/gi,(_m,q,value)=>`srcset=${q}${value.replace(/(^|,\s*)\/(?!\/)([^,\s]+)/g,(_n,sep,path)=>sep+mount("/"+path))}${q}`));
    const navPattern=/self\.__VINEXT_RSC_NAV__=(\{[^<]*?\})(?=<\/script>)/;
    if(hydratedRoutes.has(route)){
      if(!navPattern.test(result))throw Error("Missing mounted hydration navigation state");
      result=result.replace(navPattern,(_m,json)=>{const nav=JSON.parse(json);nav.pathname=mount(route)+(route==="/"?"":"/");return "self.__VINEXT_RSC_NAV__="+JSON.stringify(nav).replaceAll("<","\\u003c");});
    }
  }
  result = result
    .replace(/<link\b[^>]*rel=["']modulepreload["'][^>]*\/?>/gi, "")
    .replace(/\sdata-rsc-css-href=("[^"]*"|'[^']*')/gi, "")
    .replace(/\sdata-precedence=("[^"]*"|'[^']*')/gi, "")
    .replace(/<meta\b(?=[^>]*\bname=["']robots["'])[^>]*>/gi, "")
    .replace(/<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>/gi, "");

  const robots = allowIndexing ? "" : '<meta name="robots" content="noindex,nofollow"/>';
  result = result.replace(
    "</head>",
    `<link rel="canonical" href="${siteOrigin}${canonicalPath}"/>${robots}</head>`,
  );

  result = versionScripts(result);
  const palette = route === "/personal" ? "light" : "dark";
  result = result.replace(/(<html\b[^>]*class=")[^"]*(")/, `$1${palette === "dark" ? "dark" : ""}$2`)
    .replace(/(<html\b[^>]*data-theme=")[^"]*(")/, `$1${palette}$2`)
    .replace(/(<html\b[^>]*style=")[^"]*(")/, `$1color-scheme:${palette}$2`);
  return result;
}

async function renderRoute(route) {
  const response = await worker.fetch(
    new Request(`http://localhost${basePath}${route}`, { headers: { accept: "text/html" } }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    { waitUntil() {}, passThroughOnException() {} },
  );

  if (!response.ok) throw new Error(`Failed to render ${route}: ${response.status}`);
  const html = withExtendBlur(staticHtml(await response.text(), route), route);
  const path = route === "/" ? join(output, "index.html") : join(output, route.slice(1), "index.html");
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, html);
  return html;
}

for (const route of routes) {
  await renderRoute(route);
}

// Render the real application 404 so recovery keeps the same header and type.
const missing = await worker.fetch(
  new Request(`http://localhost${basePath}/phase-b-intended-missing-page`, { headers: { accept: "text/html" } }),
  { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
  { waitUntil() {}, passThroughOnException() {} },
);
if (missing.status !== 404) throw new Error(`Expected a 404 response, got ${missing.status}`);
const missingHtml = staticHtml(await missing.text(), "/404")
  // A missing URL can be arbitrarily deep. Resolve its relative assets and Work
  // links from the configured site root, not from that unknown URL.
  .replace(/(href|src|poster)=(['"])\.\//gi, `$1=$2${(basePath || new URL(siteOrigin).pathname.replace(/\/?$/, "")) + "/"}`)
  .replace(/srcset=(["'])(.*?)\1/gi, (_match, quote, value) => `srcset=${quote}${value.replace(/(^|,\s*)\.\//g, `$1${(basePath || new URL(siteOrigin).pathname.replace(/\/?$/, "")) + "/"}`)}${quote}`)
  .replace(/<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>/gi, "")
  .replace(/<meta\b(?=[^>]*\bproperty=["']og:url["'])[^>]*>/gi, "")
  .replace(/(<meta[^>]*(?:property="og:title"|name="twitter:title") content=")[^"]*/g, "$1Page not found — Alex Infield")
  // Preserve main's untracked-404 behavior: metadata repair adds no analytics scope.
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, script => /dataLayer|clarity|googletagmanager|portfolio-analytics/.test(script) ? "" : script)
  .replace(/<title>[^<]*<\/title>/, "<title>Page not found — Alex Infield</title>")
  .replace(/<meta\b(?=[^>]*\bname=["']robots["'])[^>]*>/gi, "")
  .replace("</head>", '<meta name="robots" content="noindex,nofollow"/></head>');
await writeFile(join(output, "404.html"), missingHtml);

// Redirect fallbacks reuse the real Compass 404 shell/components. Only their
// destination and explanatory copy change; no second handmade UI system.
for (const { route, target, relativeTarget } of redirects) {
  const path = join(output, route.slice(1), "index.html");
  const label = target === "/personal" || target === "/etc" ? "Personal" : target.endsWith("mode") ? "Folio" : "Niche";
  const html = missingHtml
    .replaceAll("Page not found", "Page moved")
    .replace(">404</p>", `>Continue to ${label}.</p>`)
    .replace(/(<div class="portfolio-actions">)([\s\S]*?)(<\/div>)/, (_match, open, actions, close) => open + actions.replace(/(<a\b[^>]*href=")[^"]*("[^>]*>)Work(<\/a>)/, `$1${relativeTarget}$2Continue to ${label}$3`) + close)
    .replace("</head>", `<link rel="canonical" href="${siteOrigin}${target}"/><meta http-equiv="refresh" content="0;url=${relativeTarget}"></head>`)
    .replace("</body>", `<script>location.replace(new URL(${JSON.stringify(relativeTarget)},location.href).href)</script></body>`);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, html);
}

await writeFile(join(output, ".nojekyll"), "");
// Build record (not exported): which pages carry fields and any media whose field is missing.
await writeFile(join(root, "dist/extend-blur.json"), JSON.stringify(extendReport, null, 1));
if (!basePath) await writeFile(
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
