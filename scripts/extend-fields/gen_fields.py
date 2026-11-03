#!/usr/bin/env python3
"""Extend blur fields for every framed image and poster (the approved lab pipeline, gen_lab.py).

    node scripts/extend-blur.mjs jobs gh-pages /tmp/eb-jobs.json      # after a normal export
    python3 -I scripts/extend-fields/gen_fields.py /tmp/eb-jobs.json gh-pages lib/extend-fields.json [procs]

Each job: {key, src (relative to the export), mode cover|contain, frame [w,h], pos [x,y], theme}.
Output: {key: {"c": "rrggbb", "img": "data:image/webp;base64,..."} | null}. null = real transparency
(Info artwork, Niche panels, Book), which gets no field. Pure Python + Pillow, offline; the export
only reads the JSON. Re-run when media or frames change (a test fails on any missing key).
"""
import base64, io, json, multiprocessing as mp, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from PIL import Image
import gen_fills as G

ROOT = None


def has_alpha(im):
    if im.mode in ("RGBA", "LA") or (im.mode == "P" and "transparency" in im.info):
        # real transparency (~40% clear); resampled variants with a 1 px soft border (~0.3%) still get a field
        h = im.convert("RGBA").getchannel("A").histogram()
        return sum(h[:200]) / sum(h) > 0.02
    return False


def bake(colours, fw_r, fh_r, long_side=32):
    """Sample the fitted mesh into one 32 px lossless WebP: one cached layer instead of 25 gradients
    (as live CSS the gradient mesh cost about 1.5 GB and 10x CPU on Luma in Chromium)."""
    if fw_r >= fh_r: w, h = long_side, max(4, round(long_side * fh_r / fw_r))
    else: w, h = max(4, round(long_side * fw_r / fh_r)), long_side
    px = []
    for y in range(h):
        for x in range(w):
            wt = G.weights((x + .5) / w, (y + .5) / h)
            px.append(tuple(max(0, min(255, round(255 * sum(wt[i] * colours[i][c] for i in range(len(wt)))))) for c in range(3)))
    im = Image.new("RGB", (w, h)); im.putdata(px)
    buf = io.BytesIO(); im.save(buf, "WEBP", lossless=True, quality=100, method=6)
    return "data:image/webp;base64," + base64.b64encode(buf.getvalue()).decode()


def field(job):
    try:
        im = Image.open(os.path.join(ROOT, job["src"]))
        im.draft("RGB", (256, 256))
        if has_alpha(im): return job["key"], None
        im = im.convert("RGB"); im.thumbnail((320, 320))
        fw_r, fh_r = job["frame"]
        if fw_r >= fh_r: fw, fh = G.LONG, max(8, round(G.LONG * fh_r / fw_r))
        else: fw, fh = max(8, round(G.LONG * fw_r / fh_r)), G.LONG
        contain = job["mode"] == "contain"
        canvas, rect = G.place(im, fw, fh, job["mode"], tuple(job.get("pos", (.5, .5))))
        if contain: canvas = G.diffuse(canvas, fw, fh)
        f = G.blur(canvas, fw, fh, G.SIGMA * min(fw, fh))
        f = G.grade(f, fw, fh, job["theme"], rect if contain else None)
        colours, _ = G.fit(f, fw, fh, rect if contain else None)
        return job["key"], {"c": "%02x%02x%02x" % tuple(round(v * 255) for v in colours[0]), "img": bake(colours, fw_r, fh_r)}
    except Exception as e:  # unreadable source: no field, the page stays as without
        print("skip", job["src"], e, file=sys.stderr, flush=True)
        return job["key"], None


def init(root):
    global ROOT; ROOT = root


if __name__ == "__main__":
    jobs = json.load(open(sys.argv[1])); root = sys.argv[2]; out = sys.argv[3]
    procs = int(sys.argv[4]) if len(sys.argv) > 4 else 2
    res = {}
    with mp.Pool(procs, initializer=init, initargs=(root,)) as pool:
        for i, (k, v) in enumerate(pool.imap_unordered(field, jobs, chunksize=2)):
            res[k] = v
            if i % 25 == 0: print(f"{i + 1}/{len(jobs)}", flush=True)
    with open(out, "w") as fh:
        json.dump(dict(sorted(res.items())), fh, separators=(",", ":"))
        fh.write("\n")
    print("done", len(res), "fields", sum(v is not None for v in res.values()), "none", sum(v is None for v in res.values()))
