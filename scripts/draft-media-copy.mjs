import { mkdir, readdir, link, copyFile } from "node:fs/promises";
import { join } from "node:path";

// Local draft builds on Outfield's USB flash reuse immutable portfolio media.
// Text, generated code and player assets always get independent copies. Release
// builds keep the ordinary copy path. The result contains regular files only.
export async function copyDraftTree(source, destination, relative = "") {
  await mkdir(destination, { recursive: true });
  for (const entry of await readdir(source, { withFileTypes: true })) {
    const from = join(source, entry.name), to = join(destination, entry.name);
    const path = relative ? `${relative}/${entry.name}` : entry.name;
    if (entry.isDirectory()) await copyDraftTree(from, to, path);
    else if (!entry.isFile()) throw new Error("Unexpected draft asset type");
    else if (path.startsWith("assets/") && /\.(?:webp|avif|png|jpe?g|mp4|webm|woff2)$/.test(path)) {
      await link(from, to);
    } else await copyFile(from, to);
  }
}
