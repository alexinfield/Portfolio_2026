import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import test from "node:test";
import { curatedArchiveIndex, orderArchiveProjects } from "../lib/archive-order.mjs";

function assetKey(asset) {
  const sourceName = decodeURIComponent(asset.name).split("/").pop();
  const sourceId = sourceName.match(/[a-f\d]{24}/i)?.[0] ?? asset.id;
  return `${asset.kind}:${sourceId}`;
}

async function worker() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  return (await import(workerUrl.href)).default;
}

async function render(pathname = "/") {
  const app = await worker();
  return app.fetch(
    new Request(`http://localhost${pathname}`, { headers: { accept: "text/html" } }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the adaptive archive with preserved project content", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Alex Infield/i);
  assert.match(html, />Alex Infield</);
  assert.match(html, /adaptive-archive-page/);
  assert.match(html, /archive-feed-grid/);
  assert.doesNotMatch(html, /archive-brand-overlay/);
  assert.doesNotMatch(html, /archive-project-number/);
  assert.match(html, /class="archive-project project-card is-emphasized"/);
  assert.match(html, /aria-label="Portfolio collections"/);
  assert.match(html, /class="archive-wordmark is-active"/);
  assert.match(html, /aria-label="Alex Infield — show all projects"/);
  assert.match(html, />Selected</);
  assert.match(html, />Independent</);
  assert.match(html, />Archive</);
  assert.match(html, />Final</);
  assert.match(html, />Process</);
  assert.match(html, />Rendering</);
  assert.match(html, />Photo</);
  assert.match(html, />Prototypes</);
  assert.match(html, />Team</);
  assert.match(html, />Making</);
  assert.match(html, /aria-label="Project sorting"/);
  assert.match(html, />Curated</);
  assert.match(html, />Newest</);
  assert.match(html, />Relevance</);
  assert.match(html, /Shuffle/);
  assert.match(html, /data-hover-video/);
  assert.match(html, />Play</);
  assert.match(html, />Info</);
  assert.match(html, />Contact</);
  assert.match(html, />Off Campus</);
  assert.doesNotMatch(html, /is-receded/);
  assert.doesNotMatch(html, />All<\/button>/);
  assert.doesNotMatch(html, />Professional</);
  assert.doesNotMatch(html, />Experience</);
  assert.doesNotMatch(html, />Filter \+</);
  assert.doesNotMatch(html, />Index</);
  assert.doesNotMatch(html, /Industrial designer working across products, interfaces/);
  assert.doesNotMatch(html, /archive-introduction/);
  assert.doesNotMatch(html, />Match</i);
  assert.doesNotMatch(html, />Alex OS</);
  assert.doesNotMatch(html, /I want to see/i);
  assert.doesNotMatch(html, />Overview<\/button>/i);

  const curatedTitles = ["Ping", "Molekule Go", "Luma", "Niche", "Hyphae Light", "Mode"];
  let previousCuratedTitle = -1;
  for (const title of curatedTitles) {
    const titleIndex = html.indexOf(`>${title}<`);
    assert.ok(titleIndex > previousCuratedTitle, `${title} follows the public portfolio's curated order`);
    previousCuratedTitle = titleIndex;
  }
});

test("archive ordering reflows by collection and filter relevance without mutating source order", () => {
  const canonical = [
    { slug: "alpha", emphasized: false, collectionMatch: false, filterMatch: true, slides: [{}], canonicalIndex: 0, curatedIndex: 0, year: 2023 },
    { slug: "beta", emphasized: true, collectionMatch: true, filterMatch: true, slides: [{}], canonicalIndex: 1, curatedIndex: 1, year: 2025 },
    { slug: "gamma", emphasized: true, collectionMatch: true, filterMatch: true, slides: [{}, {}, {}], canonicalIndex: 2, curatedIndex: 2, year: 2025 },
    { slug: "delta", emphasized: false, collectionMatch: true, filterMatch: false, slides: [], canonicalIndex: 3, curatedIndex: 3, year: 2026 },
  ];
  const canonicalSnapshot = canonical.map(({ slug }) => slug);
  const filtered = orderArchiveProjects(canonical, { hasFilter: true, sort: "relevance" });
  const newest = orderArchiveProjects(
    canonical.map((item) => ({ ...item, emphasized: true, collectionMatch: true, filterMatch: true })),
    { hasFilter: false, sort: "newest" },
  );
  const boundedNewest = orderArchiveProjects(canonical, { hasFilter: false, sort: "newest" });
  const defaultOrder = orderArchiveProjects(
    canonical.map((item) => ({ ...item, emphasized: true, collectionMatch: true, filterMatch: true })),
    { hasFilter: false, sort: "curated" },
  );
  const relevanceWithoutFilter = orderArchiveProjects(
    canonical.map((item) => ({ ...item, emphasized: true, collectionMatch: true, filterMatch: true })),
    { hasFilter: false, sort: "relevance" },
  );

  assert.deepEqual(filtered.map(({ slug }) => slug), ["gamma", "beta", "delta", "alpha"]);
  assert.deepEqual(newest.map(({ slug }) => slug), ["delta", "beta", "gamma", "alpha"]);
  assert.deepEqual(boundedNewest.map(({ slug }) => slug), ["beta", "gamma", "delta", "alpha"]);
  assert.deepEqual(defaultOrder.map(({ slug }) => slug), canonicalSnapshot);
  assert.deepEqual(relevanceWithoutFilter.map(({ slug }) => slug), canonicalSnapshot);
  assert.deepEqual(canonical.map(({ slug }) => slug), canonicalSnapshot);
  assert.notEqual(filtered, canonical);
  assert.equal(curatedArchiveIndex("ping", 4), 0);
  assert.ok(curatedArchiveIndex("new-project", 0) > curatedArchiveIndex("mode", 5));
});

test("all-projects page uses verified order, original covers, and hover motion", async () => {
  const response = await render("/all");
  assert.equal(response.status, 200);
  const html = await response.text();
  const expectedOrder = ["Molekule Go", "Luma", "Niche", "Hyphae Light", "Ping", "Mode"];
  let previous = -1;

  for (const title of expectedOrder) {
    const index = html.indexOf(`>${title}<`);
    assert.ok(index > previous, `${title} is in verified Figma order`);
    previous = index;
  }

  assert.match(html, /67b7e8c2a408546fe61055f6_hero-hand\.jpg/);
  assert.match(html, /68cc87ee027f56988fed41fe_hero\.webp/);
  assert.match(html, /689b274b032bfbc9129efc47_homePage\.webp/);
  assert.match(html, /673e50477b24902040693b05_15-hero\.jpg/);
  assert.match(html, /692fb99b7ff154a13bde26f2_251202-Hero-Hand\.webp/);
  assert.match(html, /data-hover-video/);
  assert.match(html, /site-header-index/);
  assert.match(html, />Alex Infield</);

  const modeCard = html.slice(html.indexOf('/projects/mode"'));
  assert.doesNotMatch(modeCard.slice(0, modeCard.indexOf("</a>")), /data-hover-video/);
});

test("play uses real source projects and the same uniform card system as work", async () => {
  const response = await render("/play");
  assert.equal(response.status, 200);
  const html = await response.text();

  for (const title of ["Off Campus", "Wave Shaper", "Juicebox", "Desk Pen", "Mycelium Panels"]) {
    assert.match(html, new RegExp(`>${title}<`));
  }

  assert.match(html, /Digital Product/);
  assert.match(html, /Interaction Design/);
  assert.match(html, /Material Research/);
  assert.match(html, /\/play\/off-campus\.webp/);
  assert.match(html, /portfolio-card/);
  assert.doesNotMatch(html, /Music|Beats/i);
});

test("Alex OS server-renders the curated Finder, real media, and authentic Mac launch controls", async () => {
  const response = await render("/alex-os");
  assert.equal(response.status, 200);
  const html = await response.text();

  assert.match(html, /Macintosh HD/);
  assert.match(html, /Creative/);
  assert.match(html, /RISD Projects/);
  assert.match(html, /aria-label="Open Music"/);
  assert.match(html, /aria-label="Open Video"/);
  assert.match(html, /aria-label="Open Classic Mac"/);
  assert.doesNotMatch(html, /Library\/CloudStorage|@infield\.net|628-224|Backup DesktopDownloads/);
  const alexOsSource = await readFile(new URL("../app/alex-os/AlexOS.tsx", import.meta.url), "utf8");
  assert.match(alexOsSource, /Start Mac OS 9/);
  assert.match(alexOsSource, /infinitemac\.org\/embed\?disk=Mac\+OS\+9\.0/);
  assert.match(alexOsSource, /infinite_hd=true/);
  await access(new URL("../public/alex-os/audio/sketch-01.m4a", import.meta.url));
  await access(new URL("../public/alex-os/m90-wallpaper.jpg", import.meta.url));
  await access(new URL("../public/assets/niche/media/15-transcode.mp4", import.meta.url));
});

test("project and info pages keep predictable navigation and responsive portfolio structure", async () => {
  const [projectResponse, infoResponse] = await Promise.all([render("/projects/ping"), render("/info")]);
  const [project, info] = await Promise.all([projectResponse.text(), infoResponse.text()]);

  assert.match(project, />Back to work</);
  assert.match(project, />Next: Mode</);
  assert.match(project, /project-gallery/);
  assert.match(project, /project-workspace/);
  assert.match(project, /project-section-navigator/);
  assert.match(project, /data-archive-slide/);
  assert.match(project, /id="project-start"/);
  assert.match(project, /id="overview"/);
  assert.match(project, /data-slide-order="17"/);
  assert.match(project, /class="portfolio-nav portfolio-nav-desktop"/);
  assert.match(project, />Work</);
  assert.match(project, />Play</);
  assert.match(project, />About</);
  assert.match(project, />Contact</);
  assert.doesNotMatch(project, />Experience</);
  assert.doesNotMatch(project, /figma-project-intro/);
  assert.doesNotMatch(project, /figma-project-section/);
  assert.doesNotMatch(project, /figma-project-transcript/);
  assert.doesNotMatch(project, /Showing .* match/);
  assert.doesNotMatch(project, />Alex OS</);
  assert.doesNotMatch(project, /project-drawer/);
  assert.doesNotMatch(project, /project-rail/);
  assert.doesNotMatch(info, /aria-label="Close Info"/);
  assert.match(info, /portfolio-info-layout/);
  assert.match(info, /alex@infield\.net/);
});

test("uses a dense three-column archive and flush project presentations", async () => {
  const css = await readFile(new URL("../app/portfolio.css", import.meta.url), "utf8");
  const archiveCss = css.slice(
    css.indexOf("/* Image-led studio direction */"),
    css.indexOf("/* Canonical project slides */"),
  );
  const portraitStart = css.indexOf("@media (max-width: 760px) and (orientation: portrait)");
  const portraitCss = css.slice(
    portraitStart,
    css.indexOf("@media (prefers-reduced-motion: reduce)", portraitStart),
  );

  assert.match(archiveCss, /\.archive-feed-grid\s*\{[^}]*grid-template-columns:\s*repeat\(3,/s);
  assert.match(css, /\.project-page \.project-workspace\s*\{[^}]*padding:\s*0;/s);
  assert.match(css, /\.project-gallery\s*\{[^}]*display:\s*block;[^}]*gap:\s*0;[^}]*padding:\s*0;/s);
  assert.match(css, /\.project-slide,\s*\.figma-project-section,\s*\.next-project\s*\{[^}]*border-radius:\s*0;/s);
  assert.match(archiveCss, /\.adaptive-archive-page\s*\{[^}]*background:\s*#000;/s);
  assert.match(archiveCss, /\.archive-project\.is-receded:hover,[^}]*opacity:\s*1;/s);
  assert.match(archiveCss, /\.archive-project-media\s*\{[^}]*border-radius:\s*5px;/s);
  assert.match(archiveCss, /\.archive-project-media img,\s*\.archive-project-media video\s*\{[^}]*aspect-ratio:\s*16 \/ 9;/s);
  assert.match(archiveCss, /\.archive-feed-grid\s*\{[^}]*gap:\s*20px 10px;[^}]*padding:\s*104px 8px 20px;/s);
  assert.match(archiveCss, /\.archive-sort-controls button\.is-active,[^}]*border-bottom-color:\s*currentColor;/s);
  assert.doesNotMatch(archiveCss, /aspect-ratio:\s*4 \/ 3;/);
  assert.doesNotMatch(archiveCss, /\.archive-project-number/);
  assert.doesNotMatch(archiveCss, /border-radius:\s*999px;/);
  assert.match(archiveCss, /\.archive-nav-secondary\s*\{[^}]*top:\s*52px;[^}]*bottom:\s*auto;/s);
  assert.match(css, /\.archive-mobile-sort-button\s*\{[^}]*display:\s*inline-flex;/s);
  assert.match(css, /@media \(max-width: 760px\) and \(orientation: portrait\)/);
  assert.match(portraitCss, /\.archive-nav-primary\s*\{[^}]*top:\s*auto;[^}]*bottom:\s*0;/s);
  assert.match(portraitCss, /\.archive-feed-grid\s*\{[^}]*padding-top:\s*8px;[^}]*padding-bottom:\s*calc\(150px \+ env\(safe-area-inset-bottom\)\);/s);
  assert.doesNotMatch(css, /\.archive-brand-overlay/);
  assert.doesNotMatch(css, /--portfolio-accent:\s*#(?:ff5a36|f04d25)/i);
});

test("keeps complete source assets and exports one GitHub Pages presentation", async () => {
  const assetRoot = new URL("../public/assets/", import.meta.url);
  const projectFolders = (await readdir(assetRoot, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  assert.deepEqual(projectFolders, [
    "figma-web",
    "home",
    "hyphae",
    "info",
    "luma",
    "mode",
    "molekule-go",
    "niche",
    "ping",
  ]);

  for (const project of projectFolders.filter((project) => project !== "figma-web")) {
    const manifest = JSON.parse(
      await readFile(new URL(`../public/assets/${project}/manifest.json`, import.meta.url), "utf8"),
    );
    assert.equal(manifest.failures.length, 0);
    assert.ok(manifest.assets.length > 0);
  }

  const [home, all, play, alexOs, info, ping, workflow, robots] = await Promise.all([
    readFile(new URL("../gh-pages/index.html", import.meta.url), "utf8"),
    readFile(new URL("../gh-pages/all/index.html", import.meta.url), "utf8"),
    readFile(new URL("../gh-pages/play/index.html", import.meta.url), "utf8"),
    readFile(new URL("../gh-pages/alex-os/index.html", import.meta.url), "utf8"),
    readFile(new URL("../gh-pages/info/index.html", import.meta.url), "utf8"),
    readFile(new URL("../gh-pages/projects/ping/index.html", import.meta.url), "utf8"),
    readFile(new URL("../.github/workflows/deploy-pages.yml", import.meta.url), "utf8"),
    readFile(new URL("../gh-pages/robots.txt", import.meta.url), "utf8"),
  ]);

  assert.match(home, /href="\.\/play\/off-campus"/);
  assert.match(all, /src="\.\.\/portfolio-runtime\.js"/);
  assert.match(play, /href="\.\.\/play\/off-campus"/);
  assert.match(info, /href="\.\.\/"/);
  assert.match(ping, /src="\.\.\/\.\.\/assets\/ping/);
  assert.match(alexOs, /self\.__VINEXT_RSC_DONE__=true/);
  assert.match(alexOs, /<script id="_R_">import\("\.\.\/assets\/index-/);
  assert.doesNotMatch(alexOs, /import\("\/assets/);
  assert.doesNotMatch(alexOs, /src="\/portfolio-runtime/);
  assert.doesNotMatch(home, /rel="modulepreload"/);
  assert.match(home, /<meta name="robots" content="noindex,nofollow"\/>/);
  assert.equal(robots, "User-agent: *\nDisallow: /\n");
  assert.match(workflow, /actions\/deploy-pages@v4/);
  assert.match(workflow, /actions\/upload-pages-artifact@v4/);
  assert.match(workflow, /npm run build:github/);
  assert.match(workflow, /path: \.\/gh-pages/);
  assert.match(workflow, /PORTFOLIO_ALLOW_INDEXING: "false"/);

  const generatedCssNames = (await readdir(new URL("../gh-pages/assets/", import.meta.url)))
    .filter((name) => name.endsWith(".css"));
  assert.ok(generatedCssNames.length > 0, "generated stylesheets exist");
  const generatedCss = (await Promise.all(
    generatedCssNames.map((name) => readFile(
      new URL(`../gh-pages/assets/${name}`, import.meta.url),
      "utf8",
    )),
  )).join("\n");
  assert.doesNotMatch(generatedCss, /url\(\/assets\//);
  assert.doesNotMatch(generatedCss, /url\(["']?\/alex-os\//);
  assert.match(generatedCss, /url\(\.\/home\/media\/.*FunktionalGrotesk-Regular/);
  assert.match(generatedCss, /url\(["']?\.\.\/alex-os\/m90-wallpaper\.jpg/);

  const generatedJavascript = await Promise.all(
    (await readdir(new URL("../gh-pages/assets/", import.meta.url)))
      .filter((name) => name.endsWith(".js"))
      .map((name) => readFile(new URL(`../gh-pages/assets/${name}`, import.meta.url), "utf8")),
  );
  const javascriptBundle = generatedJavascript.join("\n");
  assert.doesNotMatch(javascriptBundle, /return`\/`\+e/);
  assert.match(javascriptBundle, /return new URL\(`\.\.\/\$\{e\}`/);
  assert.doesNotMatch(javascriptBundle, /[`"]\/assets\/niche\/media/);
  assert.match(javascriptBundle, /\.\.\/alex-os\/audio\/sketch-01\.m4a/);
  assert.match(javascriptBundle, /\.\.\/assets\/niche\/media\/15-transcode\.mp4/);
});

test("keeps each project gallery in its verified live-site sequence", async () => {
  const sequences = JSON.parse(
    await readFile(new URL("../public/gallery-sequences.json", import.meta.url), "utf8"),
  );
  const expectedSlideCounts = {
    ping: 17,
    "molekule-go": 17,
    luma: 22,
    niche: 20,
    hyphae: 26,
    mode: 17,
  };

  for (const [slug, expectedCount] of Object.entries(expectedSlideCounts)) {
    const manifest = JSON.parse(
      await readFile(new URL(`../public/assets/${slug}/manifest.json`, import.meta.url), "utf8"),
    );
    const assetsByKey = new Map(manifest.assets.map((asset) => [assetKey(asset), asset]));
    const sequence = sequences[slug];

    assert.equal(sequence.order.length, expectedCount, `${slug} slide count`);
    assert.equal(new Set(sequence.order).size, sequence.order.length, `${slug} has no duplicate slides`);

    for (const key of sequence.order) {
      const asset = assetsByKey.get(key);
      assert.ok(asset, `${slug} includes ${key}`);
      await access(new URL(`../public/assets/${slug}/${asset.path}`, import.meta.url));
    }

    for (const [videoKey, posterKey] of Object.entries(sequence.posters)) {
      assert.match(videoKey, /^video:/);
      assert.match(posterKey, /^image:/);
      assert.ok(assetsByKey.get(videoKey), `${slug} includes ${videoKey}`);
      assert.ok(assetsByKey.get(posterKey), `${slug} includes ${posterKey}`);
    }
  }
});
