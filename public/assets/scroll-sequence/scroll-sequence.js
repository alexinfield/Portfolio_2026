/* scroll-sequence.js: a scroll-scrubbed image sequence on one <canvas>. No dependencies.
 * Markup and config: HANDOFF.md. Every [data-scroll-sequence] on the page starts by itself.
 * Loading tiers: blurred inline placeholder > first-frame poster (in the HTML, high priority) >
 * a low-res pass of every lowStep'th frame (the scrub is usable once it lands) > full frames,
 * coarse to fine. Each scroll position always draws the nearest frame it has, so nothing goes blank.
 * iOS: one canvas, backing store capped at the frame's own pixel size and devicePixelRatio 2;
 * frames are decoded <img> elements, not createImageBitmap (WebKit bug 229825). */
(() => {
  "use strict";
  const RM = matchMedia("(prefers-reduced-motion: reduce)");
  const PORTRAIT = matchMedia("(orientation: portrait)");

  function order(list) { // first, last, then halves, quarters...
    const out = [], seen = new Set(), push = (i) => { if (i !== undefined && !seen.has(i)) { seen.add(i); out.push(i); } };
    push(list[0]); push(list[list.length - 1]);
    for (let s = 1 << Math.floor(Math.log2(list.length)); s >= 1; s >>= 1) for (let j = 0; j < list.length; j += s) push(list[j]);
    return out;
  }

  function init(root) {
    if (root.ssInit) return;
    root.ssInit = 1;
    const cfg = JSON.parse(root.querySelector(".ss-config").textContent);
    const stage = root.querySelector(".ss-stage"), frame = root.querySelector(".ss-frame");
    const poster = root.querySelector(".ss-poster img"), canvas = root.querySelector("canvas");
    const n = cfg.count, step = cfg.lowStep || 4;
    const conn = navigator.connection || {}, lite = conn.saveData || /2g/.test(conn.effectiveType || "");
    let set, fmt, sprite, gen = 0, full = [], low = [], start = 0, range = 1, cur = 0, shown = null;
    let ticking = false, last = 0, begun = false, live = false;

    const posterIn = () => {
      root.classList.add("has-poster"); // fades the blurred placeholder out...
      setTimeout(() => root.classList.add("no-lqip"), 300); // ...then drops it, so the canvas scrubs alone
      if (begun && set && !full[0]) { full[0] = poster; request(); }
    };
    if (poster.complete && poster.naturalWidth) posterIn();
    else poster.addEventListener("load", posterIn);

    const ctx = canvas.getContext && canvas.getContext("2d", { alpha: false });
    if (!ctx) return;
    const url = (i) => `${set.path}/${fmt}/${String(i + 1).padStart(3, "0")}.${fmt}`;

    function measure() {
      if (!set) return;
      start = root.getBoundingClientRect().top + scrollY - (parseFloat(getComputedStyle(stage).top) || 0);
      range = Math.max(1, root.offsetHeight - stage.offsetHeight);
      const dpr = Math.min(devicePixelRatio || 1, 2);
      const w = Math.max(1, Math.min(set.w, Math.round(frame.getBoundingClientRect().width * dpr)));
      const h = Math.round(w * set.h / set.w);
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; shown = null; paint(); }
      request();
    }

    function pick(i) { // nearest full frame; a low-res one only if it is 2+ frames closer
      let lo, loD;
      for (let d = 0; d < n; d++) {
        const f = full[i - d] || full[i + d];
        if (f) return f;
        if (!lo && (lo = low[i - d] || low[i + d])) loD = d;
        if (lo && d >= loD + 2) return lo;
      }
      return lo;
    }

    function paint() {
      const img = pick(Math.round(cur));
      if (!img || img === shown) return;
      if (img > 0) { // a slot in the low-res sprite (1-based)
        const j = img - 1;
        ctx.drawImage(sprite, (j % set.cols) * set.lw, Math.floor(j / set.cols) * set.lh, set.lw, set.lh, 0, 0, canvas.width, canvas.height);
      } else ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      shown = img;
      if (!live) { live = true; root.classList.add("is-live"); }
    }

    function progress() { return Math.min(1, Math.max(0, (scrollY - start) / range)) * (n - 1); }

    function tick(now) {
      ticking = false;
      const target = progress();
      const dt = last ? Math.min(64, now - last) : 16.7; // frame-rate-independent easing
      last = now;
      cur += (target - cur) * (1 - Math.pow(0.7, dt / 16.7));
      if (Math.abs(target - cur) < 0.05) cur = target;
      paint();
      if (cur !== target) request(); else last = 0;
    }

    function request() { if (!ticking) { ticking = true; requestAnimationFrame(tick); } }

    function fetchAll(list, conc, done) {
      const g = gen;
      let k = 0, active = 0, finished = 0;
      if (!list.length) return done();
      const next = () => {
        while (active < conc && k < list.length) {
          const i = list[k++], img = new Image();
          active++;
          img.decoding = "async";
          img.src = url(i);
          img.decode().then(() => {
            if (g !== gen) return;
            full[i] = img; low[i] = undefined;
            request();
          }, () => {}).finally(() => {
            if (g !== gen) return;
            active--;
            if (++finished === list.length) done(); else next();
          });
        }
      };
      next();
    }

    function load() {
      gen++;
      full = []; low = []; shown = null; sprite = null;
      set = (PORTRAIT.matches && cfg.sets.portrait) || cfg.sets.landscape;
      const m = /\.(avif|webp|jpe?g)(\?|$)/.exec(poster.currentSrc || "");
      fmt = m ? (m[1][0] === "j" ? "jpg" : m[1]) : cfg.formats[cfg.formats.length - 1];
      if (poster.complete && poster.naturalWidth) full[0] = poster; // the poster is frame 1 of this set
      measure();
      cur = progress();
      const g = gen, lows = [], all = [], sp = new Image();
      for (let i = 0; i < n; i += step) lows.push(i);
      if (lows[lows.length - 1] !== n - 1) lows.push(n - 1);
      for (let i = 0; i < n; i += lite ? 2 : 1) all.push(i);
      if (all[all.length - 1] !== n - 1) all.push(n - 1);
      // First pass: one sprite of every lowStep'th frame. Then the full frames, coarse to fine.
      sp.decoding = "async";
      sp.src = `${set.path}/low.${fmt}`;
      sp.decode().then(() => {
        if (g !== gen) return;
        sprite = sp;
        lows.forEach((i, j) => { if (!full[i]) low[i] = j + 1; });
        request();
      }, () => {}).finally(() => {
        if (g !== gen) return;
        root.classList.add("is-ready");
        root.dispatchEvent(new CustomEvent("scrollsequence:ready"));
        fetchAll(order(all).filter((i) => !full[i]), 6, () => {
          if (!lite) { low = []; sprite = null; } // every frame is in at full size: free the sprite
          shown = shown > 0 ? null : shown;
          request();
          root.classList.add("is-loaded");
          root.dispatchEvent(new CustomEvent("scrollsequence:loaded"));
        });
      });
    }

    function begin() {
      if (begun || RM.matches) return;
      begun = true;
      if (!poster.currentSrc && !poster.complete) { // wait until the browser has picked a format
        poster.addEventListener("load", load, { once: true });
        poster.addEventListener("error", load, { once: true });
      } else load();
      addEventListener("scroll", request, { passive: true });
      new ResizeObserver(measure).observe(frame);
      new ResizeObserver(measure).observe(root);
      // Rotation swaps sets: wait for the <picture> to load the other poster, then reload frames.
      if (cfg.sets.portrait) PORTRAIT.addEventListener("change", () => { gen++; root.classList.remove("is-ready", "is-loaded"); poster.addEventListener("load", load, { once: true }); });
    }

    // Start loading frames only when the sequence is within a screen of the viewport.
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { io.disconnect(); begin(); } }, { rootMargin: "100% 0px" });
    const watch = () => { if (!RM.matches) io.observe(root); };
    RM.addEventListener("change", watch);
    watch();
  }

  const all = () => document.querySelectorAll("[data-scroll-sequence]").forEach(init);
  window.ScrollSequence = { init };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", all); else all();
})();
