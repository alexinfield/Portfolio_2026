import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import test from "node:test";

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

test("server-renders the approved two-column Alex Infield work feed", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Alex Infield/i);
  assert.match(html, />Alex Infield</);
  assert.match(html, /portfolio-index-page/);
  assert.match(html, /portfolio-grid/);
  assert.match(html, /data-hover-video/);
  assert.match(html, /Industrial designer working across products, interfaces/);
  assert.match(html, />Work</);
  assert.match(html, />Play</);
  assert.match(html, />Professional Work</);
  assert.match(html, />Alex OS</);
  assert.doesNotMatch(html, /I want to see/i);
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

  for (const title of ["Off Campus", "Inflating Chair", "Mycelium Panels"]) {
    assert.match(html, new RegExp(`>${title}<`));
  }

  assert.match(html, /Digital Product/);
  assert.match(html, /Product Design/);
  assert.match(html, /Material Research/);
  assert.match(html, /\/play\/off-campus\.webp/);
  assert.match(html, /portfolio-card/);
  assert.doesNotMatch(html, /Music|Beats/i);
});

test("Alex OS server-renders the desktop, real media, and app launch controls", async () => {
  const response = await render("/alex-os");
  assert.equal(response.status, 200);
  const html = await response.text();

  assert.match(html, /Alex Infield’s Computer/);
  assert.match(html, /RISD Projects/);
  assert.match(html, /aria-label="Open Music"/);
  assert.match(html, /aria-label="Open Video"/);
  await access(new URL("../public/alex-os/audio/sketch-01.m4a", import.meta.url));
  await access(new URL("../public/assets/niche/media/15-transcode.mp4", import.meta.url));
});

test("project and info pages keep the close control and responsive portfolio structure", async () => {
  const [projectResponse, infoResponse] = await Promise.all([render("/projects/ping"), render("/info")]);
  const [project, info] = await Promise.all([projectResponse.text(), infoResponse.text()]);

  assert.match(project, /aria-label="Close Ping"/);
  assert.match(project, /project-gallery/);
  assert.match(project, /project-workspace/);
  assert.match(project, /rail-project-card is-current/);
  assert.match(info, /aria-label="Close Info"/);
  assert.match(info, /portfolio-info-layout/);
  assert.match(info, /alex@infield\.net/);
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

  const [home, all, play, alexOs, info, ping, workflow] = await Promise.all([
    readFile(new URL("../gh-pages/index.html", import.meta.url), "utf8"),
    readFile(new URL("../gh-pages/all/index.html", import.meta.url), "utf8"),
    readFile(new URL("../gh-pages/play/index.html", import.meta.url), "utf8"),
    readFile(new URL("../gh-pages/alex-os/index.html", import.meta.url), "utf8"),
    readFile(new URL("../gh-pages/info/index.html", import.meta.url), "utf8"),
    readFile(new URL("../gh-pages/projects/ping/index.html", import.meta.url), "utf8"),
    readFile(new URL("../.github/workflows/deploy-pages.yml", import.meta.url), "utf8"),
  ]);

  assert.match(home, /href="\.\/play\/"/);
  assert.match(all, /src="\.\.\/portfolio-runtime\.js"/);
  assert.match(play, /href="\.\.\/play\/off-campus"/);
  assert.match(info, /href="\.\.\/"/);
  assert.match(ping, /src="\.\.\/\.\.\/assets\/ping/);
  assert.match(alexOs, /self\.__VINEXT_RSC_DONE__=true/);
  assert.match(alexOs, /<script id="_R_">import\("\.\.\/assets\/index-/);
  assert.doesNotMatch(alexOs, /import\("\/assets/);
  assert.doesNotMatch(alexOs, /src="\/portfolio-runtime/);
  assert.doesNotMatch(home, /rel="modulepreload"/);
  assert.match(workflow, /actions\/deploy-pages@v4/);
  assert.match(workflow, /npm run build:github/);
  assert.match(workflow, /path: \.\/gh-pages/);

  const generatedCssName = (await readdir(new URL("../gh-pages/assets/", import.meta.url)))
    .find((name) => /^index-.*\.css$/.test(name));
  assert.ok(generatedCssName, "generated stylesheet exists");
  const generatedCss = await readFile(
    new URL(`../gh-pages/assets/${generatedCssName}`, import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(generatedCss, /url\(\/assets\//);
  assert.match(generatedCss, /url\(\.\/home\/media\/.*FunktionalGrotesk-Regular/);

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
