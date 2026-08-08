import assert from "node:assert/strict";
import { access, readFile, readdir, stat } from "node:fs/promises";
import test from "node:test";

const publishedProjects = ["ping", "molekule-go", "luma", "niche", "hyphae", "mode"];
const publishedTitles = ["Ping", "Molekule Go", "Luma", "Niche", "Hyphae Light", "Mode"];

async function worker() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${Math.random()}`);
  return (await import(workerUrl.href)).default;
}

async function render(pathname = "/") {
  const app = await worker();
  return app.fetch(
    new Request(`http://localhost${pathname}`, { headers: { accept: "text/html" } }),
    {
      ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
    },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

async function directorySize(path) {
  let total = 0;
  for (const entry of await readdir(path, { withFileTypes: true })) {
    const child = new URL(`${entry.name}${entry.isDirectory() ? "/" : ""}`, path);
    total += entry.isDirectory() ? await directorySize(child) : (await stat(child)).size;
  }
  return total;
}

test("homepage reproduces the live portfolio grid and published order", async () => {
  const response = await render("/");
  assert.equal(response.status, 200);
  const html = await response.text();

  assert.match(html, /<title>Alex Infield<\/title>/);
  assert.match(html, /class="home-body"/);
  assert.match(html, /class="w-layout-grid grid"/);
  assert.match(html, /class="header"/);
  assert.match(html, /aria-current="page"[^>]*class="five link w--current"[^>]*>Work</);
  assert.match(html, /href="mailto:alex@infield\.net"/);

  let previous = -1;
  for (const [index, title] of publishedTitles.entries()) {
    const titleIndex = html.indexOf(`>${title}<`);
    assert.ok(titleIndex > previous, `${title} follows the live homepage order`);
    previous = titleIndex;
    assert.match(html, new RegExp(`href="/projects/${publishedProjects[index]}"`));
  }

  assert.match(html, /692fb99b7ff154a13bde26f2_251202-Hero-Hand\.webp/);
  assert.match(html, /665fb92ad4fed8da46bf0271_DSC_5550\.avif/);
  assert.doesNotMatch(html, /Adaptive Archive|Selected|Final|Process|Rendering|Shuffle|Relevance/);
  assert.doesNotMatch(html, /Industrial designer working across|archive-feed-grid|portfolio-card/);
});

test("published project routes are flush live-site presentations", async () => {
  for (const slug of publishedProjects) {
    const response = await render(`/projects/${slug}`);
    assert.equal(response.status, 200, slug);
    const html = await response.text();
    assert.match(html, /class="header"/);
    assert.match(html, new RegExp(`/assets/${slug}/media/`));
    assert.doesNotMatch(html, /Next project|Back to work|project-section-navigator|project-workspace/);
    assert.doesNotMatch(html, /Role|Contribution|Overview|Process|Outcome/);
  }

  const ping = await (await render("/projects/ping")).text();
  assert.match(ping, /class="body-molekule"/);
  assert.match(ping, /background-video-11 w-background-video/);
  assert.match(ping, /background-video-12-copy w-background-video/);
  assert.match(ping, /background-video-12 w-background-video/);

  const hyphae = await (await render("/projects/hyphae")).text();
  assert.match(hyphae, /hyphae-light-film\.mp4/);
  assert.match(hyphae, /hyphae-light-film-poster\.jpg/);
  assert.match(hyphae, /<video[^>]*controls/);
  assert.doesNotMatch(hyphae, /player\.vimeo\.com|vimeocdn\.com/);
  assert.match(hyphae, /slide-video-right-hyphae/);
  assert.match(hyphae, /slide-video-right-hyphae-2/);
  assert.equal((hyphae.match(/growth-sim-transcode\.mp4/g) ?? []).length > 0, true);
});

test("info matches the live image-only two-column page", async () => {
  const response = await render("/info");
  assert.equal(response.status, 200);
  const html = await response.text();

  assert.match(html, /<title>Info<\/title>/);
  assert.match(html, /class="info"/);
  assert.match(html, /class="w-layout-grid grid-2"/);
  assert.match(html, /67aca18a869f9276f4c0ef01_IMG_0019\.png/);
  assert.match(html, /aria-current="page"[^>]*class="five link w--current"[^>]*>Info</);
  assert.doesNotMatch(html, /Industrial designer|Selected work spanning|>alex@infield\.net</);
});

test("etc reproduces the live three-column play feed with local media", async () => {
  const response = await render("/etc");
  assert.equal(response.status, 200);
  const html = await response.text();
  const documentHtml = html.slice(0, html.indexOf("</html>") + 7);

  assert.match(documentHtml, /<title>Etc<\/title>/);
  assert.match(documentHtml, /class="play-body"/);
  assert.equal((documentHtml.match(/play-column w-col w-col-4 w-col-stack/g) ?? []).length, 3);
  assert.equal((documentHtml.match(/>Desk pen</g) ?? []).length, 2);
  for (const label of ["Hyphae Light", "Stool", "CNC", "Book", "Wall mounts", "Hyundai, research", "Mycelium"]) {
    assert.match(documentHtml, new RegExp(`>${label}<`));
  }
  for (const asset of [
    "desk-pen.png",
    "desk-pen-a31.mp4",
    "desk-pen-a2.mp4",
    "desk-pen-img-1421-web.mp4",
    "desk-pen-img-1741-poster.jpg",
    "stool.avif",
    "cnc.avif",
    "wall-mounts.jpeg",
    "hyundai-research.gif",
    "mycelium.jpeg",
  ]) {
    assert.match(documentHtml, new RegExp(asset.replaceAll(".", "\\.")));
  }
  assert.doesNotMatch(documentHtml, /<video[^>]*autoplay/i);
  assert.doesNotMatch(documentHtml, /desk-pen-img-1421\.mp4/);
  assert.doesNotMatch(documentHtml, /IMG_1741[^"']*\.mp4/);
});

test("source stylesheet and small clone layer preserve the live measurements", async () => {
  const [webflowCss, cloneCss] = await Promise.all([
    readFile(new URL("../public/assets/home/media/ainfield.webflow.shared.5c0f55512.min.css", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(webflowCss, /\.header\{[^}]*backdrop-filter:blur\(24px\)[^}]*padding:5px 20px/);
  assert.match(webflowCss, /\.grid\{[^}]*grid-column-gap:10px;grid-row-gap:20px;margin:10px 10px 20px/);
  assert.match(webflowCss, /\.home-image-hero-hyphae\{[^}]*aspect-ratio:16\/9[^}]*border-radius:5px/);
  assert.match(webflowCss, /\.home-project-title\{[^}]*color:#999[^}]*font-size:24px/);
  assert.match(webflowCss, /\.body-molekule\{[^}]*background-color:#000[^}]*padding-top:30px/);
  assert.match(webflowCss, /\.play-column\{[^}]*padding-left:5px;padding-right:5px/);
  assert.match(webflowCss, /@media screen and \(max-width:767px\)[\s\S]*\.grid\{grid-template-columns:1fr\}/);
  assert.match(cloneCss, /FunktionalGrotesk-Light\.woff2/);
  assert.match(cloneCss, /\.hyphae-vimeo-frame\s*\{[^}]*aspect-ratio: 16 \/ 9/s);
  assert.match(cloneCss, /\.hyphae-vimeo-frame > video\s*\{[^}]*object-fit: cover/s);
  assert.match(cloneCss, /main\.body-molekule \.w-background-video,[\s\S]*isolation: isolate/);
  assert.doesNotMatch(cloneCss, /orange|#ff5a36|border-radius:\s*999px/i);
});

test("self-hosted carousel videos use synchronized playback and a portable web derivative", async () => {
  const [carouselSource, derivative] = await Promise.all([
    readFile(new URL("../app/etc/etc-carousel.tsx", import.meta.url), "utf8"),
    stat(new URL("../public/assets/etc/media/desk-pen-img-1421-web.mp4", import.meta.url)),
  ]);

  assert.match(carouselSource, /video\.pause\(\)/);
  assert.match(carouselSource, /video\.currentTime = 0/);
  assert.match(carouselSource, /video\.play\(\)/);
  assert.ok(derivative.size < 25_000_000, `portable derivative is ${(derivative.size / 1_000_000).toFixed(1)} MB`);
});

test("published HTML serves portfolio images and videos locally", async () => {
  for (const pathname of ["/", "/etc", "/info", ...publishedProjects.map((slug) => `/projects/${slug}`)]) {
    const html = await (await render(pathname)).text();
    assert.doesNotMatch(html, /(?:src|poster)="https:\/\/(?:cdn\.prod\.website-files\.com|uploads-ssl\.webflow\.com)/, pathname);
    assert.doesNotMatch(html, /player\.vimeo\.com|i\.vimeocdn\.com/, pathname);
  }
});

test("every live gallery sequence resolves to a local source asset", async () => {
  const sequences = JSON.parse(await readFile(new URL("../public/gallery-sequences.json", import.meta.url), "utf8"));
  const expectedCounts = { ping: 17, "molekule-go": 17, luma: 22, niche: 20, hyphae: 26, mode: 17 };

  for (const slug of publishedProjects) {
    assert.equal(sequences[slug].order.length, expectedCounts[slug], slug);
    const manifest = JSON.parse(await readFile(new URL(`../public/assets/${slug}/manifest.json`, import.meta.url), "utf8"));
    const sourceIds = new Set(manifest.assets.map((asset) => {
      const sourceName = decodeURIComponent(asset.name).split("/").pop();
      return sourceName.match(/[a-f\d]{24}/i)?.[0] ?? asset.id;
    }));
    for (const key of sequences[slug].order) {
      assert.ok(sourceIds.has(key.split(":")[1]), `${slug} resolves ${key}`);
    }
  }
});

test("GitHub Pages export contains only live routes plus verified legacy redirects", async () => {
  const [home, etc, info, ping, playRedirect, pillarRedirect, furnitureRedirect, robots, workflow] = await Promise.all([
    readFile(new URL("../gh-pages/index.html", import.meta.url), "utf8"),
    readFile(new URL("../gh-pages/etc/index.html", import.meta.url), "utf8"),
    readFile(new URL("../gh-pages/info/index.html", import.meta.url), "utf8"),
    readFile(new URL("../gh-pages/projects/ping/index.html", import.meta.url), "utf8"),
    readFile(new URL("../gh-pages/play/index.html", import.meta.url), "utf8"),
    readFile(new URL("../gh-pages/projects/pillar/index.html", import.meta.url), "utf8"),
    readFile(new URL("../gh-pages/projects/furniture/index.html", import.meta.url), "utf8"),
    readFile(new URL("../gh-pages/robots.txt", import.meta.url), "utf8"),
    readFile(new URL("../.github/workflows/deploy-pages.yml", import.meta.url), "utf8"),
  ]);

  assert.match(home, /href="\.\/projects\/ping"/);
  assert.match(home, /href="\.\/assets\/home\/media\/ainfield\.webflow/);
  assert.match(etc, /src="\.\.\/assets\/etc\/media\/desk-pen/);
  assert.match(info, /src="\.\.\/assets\/info\/media/);
  assert.match(ping, /src="\.\.\/\.\.\/assets\/ping\/media/);
  assert.match(playRedirect, /url=\.\.\/etc\//);
  assert.match(pillarRedirect, /url=\.\.\/niche\//);
  assert.match(furnitureRedirect, /url=\.\.\/mode\//);
  assert.match(home, /<meta name="robots" content="noindex,nofollow"\/>/);
  assert.equal(robots, "User-agent: *\nDisallow: /\n");
  assert.match(workflow, /actions\/deploy-pages@v4/);
  assert.match(workflow, /npm run build:github/);

  for (const removed of ["all", "alex-os", "professional-work"]) {
    await assert.rejects(access(new URL(`../gh-pages/${removed}/index.html`, import.meta.url)));
  }

  await assert.rejects(access(new URL("../gh-pages/assets/figma-web/", import.meta.url)));
  await assert.rejects(access(new URL("../gh-pages/assets/etc/media/desk-pen-img-1421.mp4", import.meta.url)));
  await access(new URL("../gh-pages/assets/etc/media/desk-pen-img-1421-web.mp4", import.meta.url));

  const bytes = await directorySize(new URL("../gh-pages/", import.meta.url));
  assert.ok(bytes < 1_000_000_000, `GitHub Pages payload is ${(bytes / 1_000_000).toFixed(1)} MB`);
});
