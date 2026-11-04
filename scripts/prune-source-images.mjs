import {readdir, readFile, rm, stat} from 'node:fs/promises';
import {join} from 'node:path';

// Full-resolution masters stay in source control for future derivatives. The
// responsive loader serves only its width candidates; do not publish the unused
// masters. Preserve any master explicitly referenced by a rendered attribute.
export async function pruneSourceImages(output) {
  let documents = '';
  async function collect(dir) {
    for (const entry of await readdir(dir, {withFileTypes:true})) {
      const file = join(dir, entry.name);
      if (entry.isDirectory()) await collect(file);
      else if (/\.html$/.test(entry.name)) documents += await readFile(file, 'utf8');
    }
  }
  await collect(output);
  const removed = [];
  for (const group of ['home','info','ping','luma','mode','niche','hyphae']) {
    const dir = join(output,'assets',group,'media');
    for (const name of await readdir(dir)) {
      if (!/\.(png|jpe?g|webp|avif)$/i.test(name) || /-w\d+\.webp$/.test(name)) continue;
      const derivative = name.replace(/\.[^.]+$/, '-w768.webp');
      if (!await stat(join(dir,derivative)).catch(()=>null)) continue;
      // Attribute values are checked rather than serialized component inputs:
      // hydration passes those inputs through ResponsiveImage again.
      const escaped = name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
      if (new RegExp(`(?:src|srcset|href|poster|content)=["'][^"']*/${escaped}(?=["'\\s,?])`).test(documents)) continue;
      await rm(join(dir,name));
      removed.push(`assets/${group}/media/${name}`);
    }
  }
  return removed;
}
