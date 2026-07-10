import { mkdir, readdir, readFile, rename, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";

const assetRoot = new URL("../public/assets/", import.meta.url);
const entries = await readdir(assetRoot, { withFileTypes: true });

function cleanFilename(name) {
  return name
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

for (const entry of entries.filter((item) => item.isDirectory())) {
  const projectDirectory = join(assetRoot.pathname, entry.name);
  const manifestPath = join(projectDirectory, "manifest.json");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  const files = await readdir(projectDirectory);
  const mediaDirectory = join(projectDirectory, "media");
  await mkdir(mediaDirectory, { recursive: true });
  const usedNames = new Set();

  for (const asset of manifest.assets) {
    const sourceFile = files.find((file) => file.startsWith(`${asset.id}.`));
    if (!sourceFile) continue;

    const decodedName = decodeURIComponent(asset.name).split("/").at(-1);
    const fallbackExtension = extname(sourceFile);
    const baseName = cleanFilename(decodedName) || `${asset.id}${fallbackExtension}`;
    const extension = extname(baseName) || fallbackExtension;
    const stem = baseName.slice(0, -extension.length) || asset.id;
    let filename = `${stem}${extension}`;
    let suffix = 2;

    while (usedNames.has(filename)) {
      filename = `${stem}-${suffix}${extension}`;
      suffix += 1;
    }

    usedNames.add(filename);
    await rename(join(projectDirectory, sourceFile), join(mediaDirectory, filename));
    asset.path = `media/${filename}`;
  }

  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
}
