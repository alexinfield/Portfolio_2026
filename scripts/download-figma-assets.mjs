import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const [inputPath, outputRoot] = process.argv.slice(2);

if (!inputPath || !outputRoot) {
  throw new Error("Usage: node scripts/download-figma-assets.mjs <manifest.json> <output-root>");
}

const input = JSON.parse(await readFile(inputPath, "utf8"));
const extensionFor = {
  "image/avif": ".avif",
  "image/gif": ".gif",
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/svg+xml": ".svg",
  "image/webp": ".webp",
  "video/mp4": ".mp4",
  "video/webm": ".webm",
};

function filenameFor(name, index) {
  const kebab = name
    .replace(/^img/, "")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

  return `${String(index + 1).padStart(3, "0")}-${kebab || "asset"}`;
}

async function downloadProject(slug, project) {
  const projectDir = path.resolve(outputRoot, slug);
  await mkdir(projectDir, { recursive: true });

  const downloaded = [];
  let cursor = 0;

  async function worker() {
    while (cursor < project.assets.length) {
      const index = cursor++;
      const asset = project.assets[index];

      if (!asset.url.startsWith("https://www.figma.com/api/mcp/asset/")) {
        throw new Error(`Rejected unexpected Figma asset URL for ${slug}`);
      }

      const response = await fetch(asset.url);
      if (!response.ok) {
        throw new Error(`Failed ${response.status} for ${slug}/${asset.name}`);
      }

      const contentType = (response.headers.get("content-type") ?? "application/octet-stream")
        .split(";", 1)[0]
        .trim();
      const extension = extensionFor[contentType] ?? ".bin";
      const filename = `${filenameFor(asset.name, index)}${extension}`;
      const bytes = new Uint8Array(await response.arrayBuffer());

      await writeFile(path.join(projectDir, filename), bytes);
      downloaded[index] = {
        figmaName: asset.name,
        file: filename,
        contentType,
        bytes: bytes.byteLength,
      };
    }
  }

  await Promise.all(Array.from({ length: Math.min(6, project.assets.length) }, () => worker()));

  const manifest = {
    source: {
      fileKey: "7PpAg91SXB1rB4EnUqfuBc",
      nodeId: project.nodeId,
    },
    downloadedAt: new Date().toISOString(),
    assets: downloaded,
  };

  await writeFile(path.join(projectDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  return { slug, count: downloaded.length, bytes: downloaded.reduce((sum, asset) => sum + asset.bytes, 0) };
}

const results = [];
for (const [slug, project] of Object.entries(input)) {
  if (!project.assets.length) continue;
  results.push(await downloadProject(slug, project));
}

process.stdout.write(`${JSON.stringify(results, null, 2)}\n`);
