// Extend blur (Alex approved, Nov 2): an Apple Photos Extend-style colour field behind every framed
// image and video poster while it loads, and behind Personal's fit-filled photos for good.
// Port of the approved lab (/lab/extend/, 261102-extend-blur/scripts/build_lab.py) as an export step.
//
//   applyExtendBlur(html, rel, site, fields, basePath)   used by export-github-pages.mjs per page
//   node scripts/extend-blur.mjs jobs <export-dir> <jobs.json>   list one field job per media/frame;
//     scripts/extend-fields/gen_fields.py turns the jobs into lib/extend-fields.json (Pillow, offline)
//
// Per frame the export inlines --eb-c (base colour) and --eb-img (the fitted 5x5 mesh baked into a
// 32 px lossless WebP, ~0.7 KB). Hosts paint it on ::before; public/assets/eb/extend.css and
// extend.js do the 0.5 s fade-in and the on-screen-only 9 s drift (off under Reduce Motion).
// No field: Video 2018 (Alex), and images with real transparency (the generator returns null).
import { createHash } from "node:crypto";
import { existsSync, openSync, readSync, closeSync } from "node:fs";
import { readFile, writeFile, readdir } from "node:fs/promises";
import { join, dirname, normalize, relative } from "node:path";

const HOSTS = new Set(["portfolio-work-card", "portfolio-image", "personal-video", "case-panel", "case-video", "ss-poster", "ss-still", "portfolio-artwork"]);
const SKIP = ["p041-telefoni"]; // Video 2018: leave its black bars and media alone
const FEATHER = 10; // % of the photo's short side
const VOID = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"]);
const RAW = new Set(["script", "style", "textarea", "title"]);
const TAG = /<(\/?)([a-zA-Z][a-zA-Z0-9-]*)((?:"[^"]*"|'[^']*'|[^'">])*)>/g;
const ATTR = /([^\s=/>]+)(?:\s*=\s*("[^"]*"|'[^']*'|[^\s>]+))?/g;

// Minimal start/end tag scanner with a parent stack; positions are kept for in-place edits.
function scan(html) {
  const root = { name: "#root", children: [] }, stack = [root], nodes = [];
  const lower = html.toLowerCase();
  TAG.lastIndex = 0;
  let m;
  while ((m = TAG.exec(html))) {
    if (html.startsWith("<!--", m.index)) { const j = html.indexOf("-->", m.index); TAG.lastIndex = j >= 0 ? j + 3 : html.length; continue; }
    const [, closing, rawName, rest] = m, name = rawName.toLowerCase();
    if (closing) { for (let k = stack.length - 1; k > 0; k--) if (stack[k].name === name) { stack.length = k; break; } continue; }
    const node = { name, start: m.index, end: TAG.lastIndex, rest, parent: stack[stack.length - 1], children: [] };
    node.parent.children.push(node); nodes.push(node);
    if (RAW.has(name)) { const j = lower.indexOf(`</${name}`, TAG.lastIndex); TAG.lastIndex = j >= 0 ? j : html.length; continue; }
    if (!VOID.has(name) && !rest.trimEnd().endsWith("/")) stack.push(node);
  }
  return nodes;
}
function attrs(node) {
  const out = {};
  for (const m of node.rest.matchAll(ATTR)) { let v = m[2]; if (v && (v[0] === '"' || v[0] === "'")) v = v.slice(1, -1); out[m[1].toLowerCase()] = v ?? ""; }
  return out;
}
const classes = node => (attrs(node).class || "").split(/\s+/).filter(Boolean);
const styleGet = (style, prop) => { const m = new RegExp(`(?:^|;)\\s*${prop.replace(/[-]/g, "\\-")}\\s*:\\s*([^;]+)`).exec(style || ""); return m ? m[1].trim() : null; };

function resolve(rel, url, basePath) {
  url = url.split("?")[0].split("#")[0].replaceAll("&amp;", "&");
  if (!url || /^(data:|https?:|\/\/)/.test(url)) return null;
  if (url.startsWith("/")) { if (basePath && url.startsWith(basePath + "/")) url = url.slice(basePath.length); return url.replace(/^\/+/, ""); }
  return normalize(join(dirname(rel), url)).replaceAll("\\", "/");
}
// The smallest decodable raster at least 300 px wide from srcset, else src or poster.
function pickSource(rel, a, basePath) {
  let best = null;
  for (const part of (a.srcset || "").split(",")) {
    const bits = part.trim().split(/\s+/);
    if (bits.length === 2 && bits[1].endsWith("w") && !bits[0].toLowerCase().endsWith(".avif")) {
      const w = parseInt(bits[1], 10);
      if (w >= 300 && (!best || w < best[0])) best = [w, bits[0]];
    }
  }
  let url = best ? best[1] : ("poster" in a ? a.poster : a.src);
  if (!url || /\.(avif|svg|gif)$/i.test(url)) url = a.src || a.poster;
  return url ? resolve(rel, url, basePath) : null;
}
// Pixel size from the file header (PNG, JPEG, WebP), for media without width/height attributes.
function imageSize(file) {
  const fd = openSync(file, "r"), b = Buffer.alloc(65536); const n = readSync(fd, b, 0, b.length, 0); closeSync(fd);
  if (b.readUInt32BE(0) === 0x89504e47) return [b.readUInt32BE(16), b.readUInt32BE(20)];
  if (b.toString("latin1", 0, 4) === "RIFF" && b.toString("latin1", 8, 12) === "WEBP") {
    const kind = b.toString("latin1", 12, 16);
    if (kind === "VP8X") return [1 + b.readUIntLE(24, 3), 1 + b.readUIntLE(27, 3)];
    if (kind === "VP8L") { const v = b.readUInt32LE(21); return [1 + (v & 0x3fff), 1 + ((v >> 14) & 0x3fff)]; }
    return [b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff];
  }
  for (let i = 2; i < n - 9;) { // JPEG: walk the markers to the first SOFn
    if (b[i] !== 0xff) { i++; continue; }
    const mk = b[i + 1], len = b.readUInt16BE(i + 2);
    if (mk >= 0xc0 && mk <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(mk)) return [b.readUInt16BE(i + 7), b.readUInt16BE(i + 5)];
    i += 2 + len;
  }
  return [0, 0];
}

export function jobKey(job) {
  return createHash("sha256").update(JSON.stringify([job.src, job.mode, job.frame, job.pos, job.theme, job.frame_media ?? null])).digest("hex").slice(0, 12);
}
const r3 = v => Math.round(v * 1000) / 1000;

// [{node, host, job, fit, feather}] for one page.
function mediaJobs(site, rel, html, basePath) {
  const theme = rel.startsWith("personal/") ? "light" : "dark", out = [];
  for (const n of scan(html)) {
    if (n.name !== "img" && n.name !== "video") continue;
    const a = attrs(n), ref = (a.src || a.poster || "") + " " + (a.srcset || "");
    if (SKIP.some(s => ref.includes(s))) continue;
    if (n.name === "video" && !a.poster) continue;
    const src = pickSource(rel, a, basePath);
    if (!src || !existsSync(join(site, src))) continue;
    const p = n.parent, kids = p.children.filter(c => c.name === "img" || c.name === "video");
    const pc = new Set(p.name === "#root" ? [] : classes(p));
    const host = [...pc].some(c => HOSTS.has(c)) && kids.length === 1 ? p : null;
    const style = a.style || "";
    let mw = parseFloat(a.width) || 0, mh = parseFloat(a.height) || 0;
    if (!(mw && mh)) [mw, mh] = imageSize(join(site, src));
    if (!(mw && mh)) continue;
    const r = mw / mh;
    let fit = null, feather = null, mode = "cover", frame = [mw, mh], pos = [.5, .5];
    if (host && (pc.has("portfolio-image") || pc.has("personal-video"))) {
      frame = [4, 3];
      const w = styleGet(style, "width"), h = styleGet(style, "height");
      if (w && w.endsWith("%") && parseFloat(w) < 99.9) fit = "x";
      else if (h && h.endsWith("%") && parseFloat(h) < 99.9) fit = "y";
      if (fit) { mode = "contain"; feather = fit === "x" ? FEATHER * Math.min(r, 1) / r : FEATHER; }
      else {
        const op = (styleGet(style, "object-position") || "50% 50%").split(/\s+/);
        const x = parseFloat(op[0]) / 100, y = parseFloat(op[1]) / 100;
        if (Number.isFinite(x) && Number.isFinite(y)) pos = [x, y];
      }
    } else if (host && pc.has("portfolio-work-card")) frame = [16, 9];
    else { const mr = styleGet(style, "--media-ratio"); if (mr) frame = [1000, Math.round(parseFloat(mr) * 1000)]; }
    const job = { src, mode, frame: [r3(frame[0]), r3(frame[1])], pos: [r3(pos[0]), r3(pos[1])], theme };
    if (mode === "contain") job.frame_media = [mw, mh];
    job.key = jobKey(job);
    out.push({ node: n, host, job, fit, feather });
  }
  return out;
}

function addToTag(tag, extra, vars) {
  const m = /^<[a-zA-Z0-9-]+/.exec(tag);
  if (vars) {
    const sm = /\sstyle="([^"]*)"/.exec(tag);
    if (sm) { const at = sm.index + sm[0].indexOf('"') + 1; tag = tag.slice(0, at) + vars + ";" + tag.slice(at); }
    else extra += ` style="${vars}"`;
  }
  return tag.slice(0, m[0].length) + extra + tag.slice(m[0].length);
}

// Mark hosts and media and inline the field variables. Returns the page and what it did.
export function applyExtendBlur(html, rel, site, fields, basePath = "") {
  const stats = { media: 0, hosts: 0, self: 0, fit: 0, noField: 0, bytes: 0, missingKeys: [] }, edits = [];
  for (const { node, host, job, fit, feather } of mediaJobs(site, rel, html, basePath)) {
    if (!(job.key in fields)) stats.missingKeys.push(job.key); // regenerate lib/extend-fields.json
    const f = fields[job.key];
    if (!f) { stats.noField++; continue; } // null: real transparency, no field
    stats.media++;
    let vars = `--eb-c:#${f.c};--eb-img:url(${f.img})`;
    if (host) {
      stats.hosts++;
      let extra = ' data-eb-host=""';
      if (fit) { stats.fit++; extra += ` data-eb-fit="${fit}"`; vars += `;--eb-f:${feather.toFixed(2)}%`; }
      edits.push([host.start, host.end, addToTag(html.slice(host.start, host.end), extra, vars)]);
      edits.push([node.start, node.end, addToTag(html.slice(node.start, node.end), ' data-eb-media=""', null)]);
    } else {
      stats.self++;
      edits.push([node.start, node.end, addToTag(html.slice(node.start, node.end), ' data-eb-self=""', vars)]);
    }
    stats.bytes += vars.length;
  }
  for (const [s, e, t] of edits.sort((a, b) => b[0] - a[0])) html = html.slice(0, s) + t + html.slice(e);
  return { html, stats };
}

async function* pages(dir, root = dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* pages(p, root);
    else if (e.name.endsWith(".html")) yield [relative(root, p).replaceAll("\\", "/"), p];
  }
}

if (import.meta.url === `file://${process.argv[1]}` && process.argv[2] === "jobs") {
  const [, , , site, out] = process.argv, jobs = {};
  for await (const [rel, p] of pages(site)) for (const { job } of mediaJobs(site, rel, await readFile(p, "utf8"), "")) jobs[job.key] = job;
  await writeFile(out, JSON.stringify(Object.values(jobs), null, 0));
  console.log(Object.keys(jobs).length, "jobs,", new Set(Object.values(jobs).map(j => j.src)).size, "source files");
}
