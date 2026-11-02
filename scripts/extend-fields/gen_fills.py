#!/usr/bin/env python3
"""Build-time "extend" fills: an Apple Photos Extend-style colour field per image.

For each job (an image placed in a frame), this:
  1. puts a small copy of the photo where it sits in the frame (cover or contain),
  2. diffuses the photo's edge colours outward to fill the empty canvas (contain only),
  3. blurs the whole field with a Gaussian sigma of about 14% of the frame's short side,
  4. grades it: saturation x1.18, contrast pulled 30% toward the mean, a small theme lift,
  5. fits the colours of a fixed 4x4 grid of eased radial-gradient blobs over a base colour
     (least squares; the geometry is shared CSS, so only 17 colours are emitted per image).

Pure Python + Pillow (no numpy). Outputs fills.json, extend-fill.css and grain.png.
Usage: gen_fills.py jobs.json out_dir
"""
import json, math, os, random, sys
from PIL import Image, ImageFilter

GRID = 5                # blobs per axis
R = 0.36               # blob radius as a fraction of the frame on each axis
STOPS = [0, .2, .4, .6, .8, 1]
PROFILE = [(1 - t * t) ** 2 for t in STOPS]   # smooth Gaussian-like falloff, flat at both ends
LONG = 64               # analysis grid, long side
SIGMA = 0.14            # blur, fraction of the frame's short side
SAT, CONTRAST = 1.18, 0.80
EDGE_BAND = 0.03      # contain: photo edge band (fraction of its short side) that seeds the field
GRADE_RAMP = 0.30       # contain: grade fades in over this distance from the photo (fraction of short side)
LIFT = {"dark": -0.08, "light": 0.06}
RIDGE = 0.02
INSIDE_WEIGHT = 0.01    # contain: the photo hides the field's middle, so it barely counts in the fit

def centers():
    out = []
    order = [(r, c) for r in range(GRID) for c in range(GRID)]
    # checkerboard draw order spreads which blob sits on top of which
    order.sort(key=lambda rc: ((rc[0] + rc[1]) % 2, rc[0], rc[1]))
    for r, c in order:
        out.append(((c + .5) / GRID, (r + .5) / GRID))
    return out
CENTERS = centers()

def alpha(t):
    if t >= 1: return 0.0
    for k in range(len(STOPS) - 1):
        if t <= STOPS[k + 1]:
            f = (t - STOPS[k]) / (STOPS[k + 1] - STOPS[k])
            return PROFILE[k] + (PROFILE[k + 1] - PROFILE[k]) * f
    return 0.0

def weights(u, v):
    """Source-over weights for base + blobs (bottom to top) at frame point (u, v)."""
    a = [alpha(math.hypot((u - cx) / R, (v - cy) / R)) for cx, cy in CENTERS]
    w = [0.0] * (len(a) + 1)
    cover = 1.0
    for i in range(len(a) - 1, -1, -1):
        w[i + 1] = a[i] * cover
        cover *= (1 - a[i])
    w[0] = cover
    return w

def place(img, fw, fh, mode, pos):
    """Return (canvas RGB list-of-rows or None, known mask) at the analysis grid size."""
    iw, ih = img.size
    canvas = [[None] * fw for _ in range(fh)]
    if mode == "cover":
        s = max(fw / iw, fh / ih)
        sw, sh = max(1, round(iw * s)), max(1, round(ih * s))
        small = img.resize((sw, sh), Image.BOX)
        px, py = pos
        ox, oy = round((sw - fw) * px), round((sh - fh) * py)
        small = small.crop((ox, oy, ox + fw, oy + fh))
        rect = (0, 0, fw, fh)
    else:
        s = min(fw / iw, fh / ih)
        sw, sh = max(1, round(iw * s)), max(1, round(ih * s))
        small = img.resize((sw, sh), Image.BOX)
        x0, y0 = (fw - sw) // 2, (fh - sh) // 2
        rect = (x0, y0, x0 + sw, y0 + sh)
    data = list(small.getdata())
    w = rect[2] - rect[0]
    # contain: only an edge band of the photo seeds the field, so the extension continues the
    # photo's own edges instead of pulling its centre outward
    band = max(1, round(EDGE_BAND * min(rect[2] - rect[0], rect[3] - rect[1]))) if mode == "contain" else 10 ** 6
    for y in range(rect[1], rect[3]):
        for x in range(rect[0], rect[2]):
            if min(x - rect[0], rect[2] - 1 - x, y - rect[1], rect[3] - 1 - y) < band:
                canvas[y][x] = [c / 255 for c in data[(y - rect[1]) * w + (x - rect[0])]]
    return canvas, rect

def diffuse(canvas, fw, fh, iters=500):
    known = [[canvas[y][x] is not None for x in range(fw)] for y in range(fh)]
    # seed unknown cells with the nearest known colour so diffusion converges fast
    pts = [(x, y) for y in range(fh) for x in range(fw) if known[y][x]]
    for y in range(fh):
        for x in range(fw):
            if not known[y][x]:
                bx, by = min(pts, key=lambda p: (p[0] - x) ** 2 + (p[1] - y) ** 2)
                canvas[y][x] = list(canvas[by][bx])
    unknown = [(x, y) for y in range(fh) for x in range(fw) if not known[y][x]]
    for _ in range(iters):
        for x, y in unknown:
            acc = [0.0, 0.0, 0.0]; n = 0
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nx, ny = x + dx, y + dy
                if 0 <= nx < fw and 0 <= ny < fh:
                    c = canvas[ny][nx]; acc[0] += c[0]; acc[1] += c[1]; acc[2] += c[2]; n += 1
            canvas[y][x] = [a / n for a in acc]
    return canvas

def to_image(canvas, fw, fh):
    im = Image.new("RGB", (fw, fh))
    im.putdata([tuple(max(0, min(255, round(c * 255))) for c in canvas[y][x]) for y in range(fh) for x in range(fw)])
    return im

def blur(canvas, fw, fh, sigma):
    # float separable Gaussian, edges clamped (the field continues past the frame)
    rad = int(sigma * 3) + 1
    k = [math.exp(-(i * i) / (2 * sigma * sigma)) for i in range(-rad, rad + 1)]
    s = sum(k); k = [v / s for v in k]
    tmp = [[[sum(k[j] * canvas[y][min(fw - 1, max(0, x + j - rad))][c] for j in range(len(k))) for c in range(3)] for x in range(fw)] for y in range(fh)]
    return [[[sum(k[j] * tmp[min(fh - 1, max(0, y + j - rad))][x][c] for j in range(len(k))) for c in range(3)] for x in range(fw)] for y in range(fh)]

def grade(canvas, fw, fh, theme, rect=None):
    n = fw * fh
    mean = [sum(canvas[y][x][c] for y in range(fh) for x in range(fw)) / n for c in range(3)]
    for y in range(fh):
        for x in range(fw):
            r0, g0, b0 = r, g, b = canvas[y][x]
            l =.2126 * r + .7152 * g + .0722 * b
            r, g, b = (l + (r - l) * SAT, l + (g - l) * SAT, l + (b - l) * SAT)
            if rect is None:   # loading fields only: a contain fill keeps its edges' own tone
                r, g, b = (mean[0] + (r - mean[0]) * CONTRAST, mean[1] + (g - mean[1]) * CONTRAST, mean[2] + (b - mean[2]) * CONTRAST)
            k = LIFT[theme]
            if k > 0: r, g, b = (r + (1 - r) * k, g + (1 - g) * k, b + (1 - b) * k)
            else: r, g, b = (r * (1 + k), g * (1 + k), b * (1 + k))
            if rect is not None:   # contain: ungraded at the seam, fully graded far out
                dx = max(rect[0] - x - .5, x + .5 - rect[2], 0); dy = max(rect[1] - y - .5, y + .5 - rect[3], 0)
                t = min(1, math.hypot(dx, dy) / (GRADE_RAMP * min(fw, fh))); t = t * t * (3 - 2 * t)
                r, g, b = (r0 + (r - r0) * t, g0 + (g - g0) * t, b0 + (b - b0) * t)
            canvas[y][x] = [min(1, max(0, v)) for v in (r, g, b)]
    return canvas

def solve(A, b):
    n = len(b); M = [row[:] + [b[i]] for i, row in enumerate(A)]
    for i in range(n):
        p = max(range(i, n), key=lambda r: abs(M[r][i])); M[i], M[p] = M[p], M[i]
        for r in range(n):
            if r != i and M[i][i]:
                f = M[r][i] / M[i][i]
                for c in range(i, n + 1): M[r][c] -= f * M[i][c]
    return [M[i][n] / M[i][i] for i in range(n)]

def fit(target, fw, fh, rect=None):
    """Least-squares colours for base + blobs. Contain: the visible field (outside the photo and
    its feather) counts fully, the hidden middle of the photo only 10%."""
    K = len(CENTERS) + 1
    W = [[weights((x + .5) / fw, (y + .5) / fh) for x in range(fw)] for y in range(fh)]
    M = [[1.0] * fw for _ in range(fh)]
    if rect is not None:
        for y in range(fh):
            for x in range(fw):
                if min(x - rect[0], rect[2] - 1 - x, y - rect[1], rect[3] - 1 - y) >= 2: M[y][x] = INSIDE_WEIGHT
    prior = [[sum(target[y][x][c] for y in range(fh) for x in range(fw)) / (fw * fh) for c in range(3)]]
    for cx, cy in CENTERS:
        prior.append(target[min(fh - 1, int(cy * fh))][min(fw - 1, int(cx * fw))])
    lam = RIDGE * sum(map(sum, M)) / K
    AtA = [[0.0] * K for _ in range(K)]
    for y in range(fh):
        for x in range(fw):
            w = W[y][x]; m = M[y][x]
            for i in range(K):
                if w[i] == 0: continue
                for j in range(K): AtA[i][j] += m * w[i] * w[j]
    for i in range(K): AtA[i][i] += lam
    cols = []
    for c in range(3):
        Atb = [lam * prior[i][c] for i in range(K)]
        for y in range(fh):
            for x in range(fw):
                w = W[y][x]; t = target[y][x][c] * M[y][x]
                for i in range(K): Atb[i] += w[i] * t
        cols.append(solve(AtA, Atb))
    colours = [[min(1, max(0, cols[c][i])) for c in range(3)] for i in range(K)]
    # mean abs error of the fitted mesh over the visible field (0-255)
    err = 0.0; n = 0
    for y in range(fh):
        for x in range(fw):
            if M[y][x] < 1: continue
            w = W[y][x]; n += 1
            for c in range(3):
                err += abs(sum(w[i] * colours[i][c] for i in range(K)) - target[y][x][c])
    return colours, err / (n * 3) * 255

def hexc(c):
    return "#%02x%02x%02x" % tuple(round(v * 255) for v in c)

def shared_css():
    def mix(var, p):
        return var if p >= .999 else ("#0000" if p <= .001 else f"color-mix(in srgb,{var} {round(p*100)}%,#0000)")
    layers = []
    for i in range(len(CENTERS) - 1, -1, -1):           # CSS lists the top layer first
        cx, cy = CENTERS[i]; v = f"var(--e{i+1})"
        stops = ",".join(f"{mix(v, p)}{'' if k in (0, len(STOPS)-1) else ' ' + str(round(t*100)) + '%'}" for k, (t, p) in enumerate(zip(STOPS, PROFILE)))
        layers.append(f"radial-gradient({round(R*100)}% {round(R*100)}% at {cx*100:g}% {cy*100:g}%,{stops})")
    field = ",\n  ".join(layers)
    return f"""/* Extend fill: build-time colour field (scripts/gen_fills.py). Per image: --e0 (base) to --e{len(CENTERS)}.
   Geometry is shared; only colours change. Grain dithers 8-bit banding. */
.eb-field {{
 background:
  url(grain.png) 0 0 / 64px 64px repeat,
  {field},
  var(--e0);
}}
"""

def grain(path):
    rnd = random.Random(7)
    im = Image.new("LA", (64, 64))
    im.putdata([((255 if rnd.random() < .5 else 0), rnd.randint(0, 3)) for _ in range(64 * 64)])
    im.save(path, optimize=True)

def main():
    jobs = json.load(open(sys.argv[1])); out = sys.argv[2]
    os.makedirs(out, exist_ok=True)
    result = {}
    for job in jobs:
        img = Image.open(job["src"]).convert("RGB")
        fw_r, fh_r = job["frame"]
        if fw_r >= fh_r: fw, fh = LONG, max(8, round(LONG * fh_r / fw_r))
        else: fw, fh = max(8, round(LONG * fw_r / fh_r)), LONG
        canvas, rect = place(img, fw, fh, job["mode"], job.get("pos", (.5, .5)))
        if job["mode"] == "contain": canvas = diffuse(canvas, fw, fh)
        field = blur(canvas, fw, fh, SIGMA * min(fw, fh))
        field = grade(field, fw, fh, job["theme"], rect if job["mode"] == "contain" else None)
        to_image(field, fw, fh).resize((fw * 8, fh * 8), Image.BICUBIC).save(os.path.join(out, f"target-{job['id']}.png"))
        colours, err = fit(field, fw, fh, rect if job["mode"] == "contain" else None)
        vars_ = ";".join(f"--e{i}:{hexc(c)}" for i, c in enumerate(colours))
        result[job["id"]] = {"style": vars_, "bytes": len(vars_), "fit_error_255": round(err, 2), "grid": [fw, fh], "photo_rect": rect}
        print(job["id"], f"{len(vars_)} B", f"fit err {err:.2f}/255", flush=True)
    json.dump(result, open(os.path.join(out, "fills.json"), "w"), indent=1)
    open(os.path.join(out, "extend-fill.css"), "w").write(shared_css())
    grain(os.path.join(out, "grain.png"))
    print("css bytes", os.path.getsize(os.path.join(out, "extend-fill.css")), "grain bytes", os.path.getsize(os.path.join(out, "grain.png")))

if __name__ == "__main__":
    main()
