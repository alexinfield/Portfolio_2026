import { execFile } from "node:child_process";
import { mkdtemp, readdir, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, extname, join } from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const execute = promisify(execFile);
const root = fileURLToPath(new URL("../", import.meta.url));
const assetRoot = join(root, "public", "assets");
const widths = [960, 1600, 2600];
const supportedExtensions = new Set([".avif", ".jpeg", ".jpg", ".png", ".webp"]);
const force = process.argv.includes("--force");

async function walk(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(path)));
    else files.push(path);
  }
  return files;
}

async function dimensions(path) {
  const { stdout } = await execute("ffprobe", [
    "-v", "error",
    "-select_streams", "v:0",
    "-show_entries", "stream=width,height",
    "-of", "csv=p=0:s=x",
    path,
  ]);
  const [width, height] = stdout.trim().split("x").map(Number);
  if (!width || !height) throw new Error(`Could not read dimensions for ${path}`);
  return { width, height };
}

function outputPath(source, width) {
  return source.replace(/\.[^.]+$/, `-w${width}.webp`);
}

async function encode(source, output, width, extension) {
  const outputExists = await stat(output).then(() => true, () => false);
  if (outputExists && !force) return false;

  const cwebpArgs = extension === ".png"
    ? ["-quiet", "-lossless", "-m", "6", "-exact", "-metadata", "none"]
    : ["-quiet", "-q", "92", "-m", "6", "-sharp_yuv", "-alpha_q", "100", "-metadata", "none", "-mt"];

  if (extension === ".avif") {
    const temporary = await mkdtemp(join(tmpdir(), "portfolio-responsive-"));
    const png = join(temporary, `${basename(source, extension)}-${width}.png`);
    try {
      await execute("ffmpeg", [
        "-y", "-loglevel", "error",
        "-i", source,
        "-vf", `scale=${width}:-2:flags=lanczos`,
        "-frames:v", "1",
        png,
      ]);
      await execute("cwebp", [...cwebpArgs, png, "-o", output]);
    } finally {
      await rm(temporary, { recursive: true, force: true });
    }
  } else {
    await execute("cwebp", [...cwebpArgs, "-resize", String(width), "0", source, "-o", output]);
  }

  const result = await stat(output);
  if (result.size === 0) throw new Error(`Empty responsive image: ${output}`);
  return true;
}

const sources = (await walk(assetRoot)).filter((path) => {
  const extension = extname(path).toLowerCase();
  const name = basename(path);
  return supportedExtensions.has(extension)
    && !/-w(?:960|1600|2600)\.webp$/i.test(name)
    && !/poster/i.test(name);
});

const tasks = [];
for (const source of sources) {
  const { width } = await dimensions(source);
  for (const candidateWidth of widths.filter((value) => value < width)) {
    tasks.push({
      source,
      output: outputPath(source, candidateWidth),
      width: candidateWidth,
      extension: extname(source).toLowerCase(),
    });
  }
}

let cursor = 0;
let generated = 0;
async function worker() {
  while (cursor < tasks.length) {
    const task = tasks[cursor++];
    if (await encode(task.source, task.output, task.width, task.extension)) generated += 1;
    if ((generated + cursor) % 25 === 0) {
      process.stdout.write(`Processed ${cursor}/${tasks.length} responsive candidates\n`);
    }
  }
}

await Promise.all(Array.from({ length: Math.min(4, tasks.length) }, () => worker()));
process.stdout.write(`Responsive media ready: ${generated} generated, ${tasks.length - generated} already present\n`);
