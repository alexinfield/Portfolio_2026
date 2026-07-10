import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

const projectRoot = new URL("../", import.meta.url);

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
  assert.match(html, /assets\/home\/media\/67b7e8c2a408546fe61055f6_hero-hand\.jpg/);
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
    readFile(new URL("app/page.tsx", projectRoot), "utf8"),
  ]);

  assert.match(home, /data-page="home"/);
  assert.match(info, /data-page="info"/);
  assert.match(workflow, /actions\/deploy-pages@v4/);
  assert.match(workflow, /path: \.\/public/);
  assert.match(source, /\/assets\/home\/media\//);
});
