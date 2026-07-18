import { cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const output = join(root, "gh-pages");
const projectSlugs = ["molekule-go", "luma", "niche", "hyphae", "ping", "mode"];
const routes = ["/", "/all", "/info", ...projectSlugs.map((slug) => `/projects/${slug}`)];

const workerUrl = new URL(`../dist/server/index.js?export=${Date.now()}`, import.meta.url);
const { default: worker } = await import(workerUrl.href);

await rm(output, { recursive: true, force: true });
await cp(join(root, "dist/client"), output, { recursive: true });

// Vite emits imported fonts beside the generated stylesheet but keeps a
// root-relative /assets URL. Make those generated URLs stylesheet-relative so
// the same build works on both the custom domain and GitHub's repository path.
const generatedAssets = join(output, "assets");
for (const entry of await readdir(generatedAssets, { withFileTypes: true })) {
  if (!entry.isFile() || !entry.name.endsWith(".css")) continue;
  const cssPath = join(generatedAssets, entry.name);
  const css = await readFile(cssPath, "utf8");
  await writeFile(cssPath, css.replaceAll("url(/assets/", "url(./"));
}

function relativeRoot(route) {
  if (route === "/") return "./";
  if (route.startsWith("/projects/")) return "../../";
  return "../";
}

function staticHtml(html, route) {
  const base = relativeRoot(route);

  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, (tag) =>
      /^<script\b[^>]*\bsrc=["'][^"']*portfolio-runtime\.js["']/i.test(tag) ? tag : "",
    )
    .replace(/<link\b[^>]*rel=["']modulepreload["'][^>]*\/?>/gi, "")
    .replace(/\sdata-rsc-css-href=("[^"]*"|'[^']*')/gi, "")
    .replace(/\sdata-precedence=("[^"]*"|'[^']*')/gi, "")
    .replace(/(href|src|poster)=(['"])\/(?!\/)/gi, `$1=$2${base}`)
    .replace(/<link rel="canonical" href="[^\"]*"\/>/i, `<link rel="canonical" href="https://alexinfield.com${route === "/" ? "/" : `${route}/`}"/>`);
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

let home = "";
for (const route of routes) {
  const html = await renderRoute(route);
  if (route === "/") home = html;
}

await writeFile(join(output, "404.html"), home);
await writeFile(join(output, ".nojekyll"), "");

const generatedHome = await readFile(join(output, "index.html"), "utf8");
if (generatedHome.includes("I want to see")) throw new Error("Legacy portfolio markup remains in export");

console.log(`Exported ${routes.length} routes to ${output}`);
