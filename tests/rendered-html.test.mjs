import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import test from "node:test";

const projectRoot = new URL("../", import.meta.url);

function assetKey(asset) {
  const sourceName = decodeURIComponent(asset.name).split("/").pop();
  const sourceId = sourceName.match(/[a-f\d]{24}/i)?.[0] ?? asset.id;
  return `${asset.kind}:${sourceId}`;
}

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the Alex Infield portfolio", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Alex Infield/i);
  assert.match(html, /Ping/);
  assert.match(html, /Molekule Go/);
  assert.match(html, /Hyphae Light/);
  assert.match(html, /placeholder="I want to see\.\.\."/);
  assert.match(html, /assets\/home\/media\/67b7e8c2a408546fe61055f6_hero-hand\.jpg/);
  assert.match(html, /assets\/home\/media\/68cc87ee027f56988fed41fe_hero\.webp/);
});

test("keeps complete source assets and a GitHub Pages publish copy", async () => {
  const assetRoot = new URL("../public/assets/", import.meta.url);
  const projects = (await readdir(assetRoot, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  assert.deepEqual(projects, [
    "home",
    "hyphae",
    "info",
    "luma",
    "mode",
    "molekule-go",
    "niche",
    "ping",
  ]);

  for (const project of projects) {
    const manifest = JSON.parse(
      await readFile(new URL(`../public/assets/${project}/manifest.json`, import.meta.url), "utf8"),
    );
    assert.equal(manifest.failures.length, 0);
    assert.ok(manifest.assets.length > 0);
  }

  const [home, info, workflow, source] = await Promise.all([
    readFile(new URL("../public/index.html", import.meta.url), "utf8"),
    readFile(new URL("../public/info/index.html", import.meta.url), "utf8"),
    readFile(new URL("../.github/workflows/deploy-pages.yml", import.meta.url), "utf8"),
    readFile(new URL("app/portfolio-grid.tsx", projectRoot), "utf8"),
  ]);

  assert.match(home, /data-page="home"/);
  assert.match(info, /data-page="info"/);
  assert.match(workflow, /actions\/deploy-pages@v4/);
  assert.match(workflow, /path: \.\/public/);
  assert.match(source, /\/assets\/home\/media\/67b7e8c2a408546fe61055f6_hero-hand\.jpg/);
  assert.match(source, /\/assets\/home\/media\//);
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
