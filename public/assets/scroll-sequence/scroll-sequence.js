/* scroll-sequence.js: a scroll-scrubbed image sequence on one <canvas>. No dependencies.
 * Markup and config: HANDOFF.md. Every [data-scroll-sequence] on the page starts by itself.
 * Site copy (alexinfield.com), changed from the lab module for memory and phone weight (Nov 2):
 * - Frame sets by width: every landscape set in the config is a candidate; the player takes the
 *   smallest one at least as wide as the frame's device pixels (CSS width x min(DPR, 2), with 10 %
 *   slack), capped at the widest. If the frame grows a lot (rotation, a dual screen spanned) it
 *   upgrades once to the set that now fits; it never downgrades.
 * - Loading tiers: first-frame poster (in the HTML, high priority) > one low-res sprite of every
 *   lowStep'th frame (the scrub is usable once it lands) > full frames, but only after the first
 *   scroll, only about +-10 frames around the current one (ahead of the scroll direction first),
 *   3 requests at a time. Frames further away are released, so decoded memory stays at a window
 *   instead of the whole sequence. Each scroll position draws the nearest frame it has, so nothing
 *   goes blank.
 * - In the page flow (the site's case pages; no sticky track, no extra page height): the scrub runs
 *   over the block's own travel, from its top entering the bottom of the viewport to its bottom
 *   leaving under the header, eased at both ends. A sticky stage keeps the lab's track mapping.
 * iOS: one canvas, backing store capped at the frame's own pixel size and devicePixelRatio 2;
 * frames are decoded <img> elements, not createImageBitmap (WebKit bug 229825). */
(() => {
  "use strict";
  const RM = matchMedia("(prefers-reduced-motion: reduce)");
  const PORTRAIT = matchMedia("(orientation: portrait)");
  const WINDOW = 10, KEEP = 12, CONCURRENT = 3, SLACK = 0.9;

  function init(root) {
    if (root.ssInit) return;
    root.ssInit = 1;
    const cfg = JSON.parse(root.querySelector(".ss-config").textContent);
    const stage = root.querySelector(".ss-stage"), frame = root.querySelector(".ss-frame");
    const poster = root.querySelector(".ss-poster img"), canvas = root.querySelector("canvas");
    const n = cfg.count, step = cfg.lowStep || 4;
    const conn = navigator.connection || {}, lite = conn.saveData || /2g/.test(conn.effectiveType || "");
    const every = lite ? 2 : 1; // Save-Data and 2G: every other full frame
    let set, fmt, sprite, gen = 0, full = [], low = [], start = 0, range = 1, cur = 0, shown = null;
    let ticking = false, last = 0, begun = false, live = false, armed = false, active = 0, dir = 1, prev = 0, done = false, flow = false;
    const pending = new Set();

    const posterIn = () => {
      root.classList.add("has-poster");
      setTimeout(() => root.classList.add("no-lqip"), 300);
      if (begun && set && !full[0]) { full[0] = poster; request(); }
    };
    if (poster.complete && poster.naturalWidth) posterIn();
    else poster.addEventListener("load", posterIn);

    const ctx = canvas.getContext && canvas.getContext("2d", { alpha: false });
    if (!ctx) return;
    const url = (i) => `${set.path}/${fmt}/${String(i + 1).padStart(3, "0")}.${fmt}`;

    function choose() {
      if (PORTRAIT.matches && cfg.sets.portrait) return cfg.sets.portrait;
      const sets = Object.entries(cfg.sets).filter(([name]) => name !== "portrait").map(([, s]) => s).sort((a, b) => a.w - b.w);
      const need = frame.getBoundingClientRect().width * Math.min(devicePixelRatio || 1, 2) * SLACK;
      return sets.find((s) => s.w >= need) || sets[sets.length - 1];
    }

    function measure() {
      if (!set) return;
      const fit = choose();
      if (fit !== set && fit.w > set.w && set !== cfg.sets.portrait) { load(fit); return; } // upgrade, never downgrade
      const top = root.getBoundingClientRect().top + scrollY;
      flow = getComputedStyle(stage).position !== "sticky";
      if (flow) { // in the page flow: scrub over the block's own travel through the viewport
        const header = parseFloat(getComputedStyle(root).getPropertyValue("--ss-top")) || 0;
        const maxY = Math.max(0, document.documentElement.scrollHeight - innerHeight);
        start = Math.min(maxY, Math.max(0, top - innerHeight)); // its top enters the bottom of the viewport
        range = Math.max(1, Math.min(maxY, top + root.offsetHeight - header) - start); // its bottom leaves under the header
      } else { // sticky track (the lab layout)
        start = top - (parseFloat(getComputedStyle(stage).top) || 0);
        range = Math.max(1, root.offsetHeight - stage.offsetHeight);
      }
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

    function progress() {
      const p = Math.min(1, Math.max(0, (scrollY - start) / range));
      return (flow ? p * p * (3 - 2 * p) : p) * (n - 1); // in flow: eased, so it settles at both ends
    }

    function tick(now) {
      ticking = false;
      const target = progress();
      if (Math.abs(target - prev) > 0.01) { dir = target > prev ? 1 : -1; prev = target; }
      const dt = last ? Math.min(64, now - last) : 16.7; // frame-rate-independent easing
      last = now;
      cur += (target - cur) * (1 - Math.pow(0.7, dt / 16.7));
      if (Math.abs(target - cur) < 0.05) cur = target;
      paint();
      fill();
      if (cur !== target) request(); else last = 0;
    }

    function request() { if (!ticking) { ticking = true; requestAnimationFrame(tick); } }

    // The frames to hold: +-WINDOW around the current one, ahead of the scroll direction first.
    function wanted() {
      const c = Math.round(cur), out = [];
      for (let d = 0; d <= WINDOW; d++) for (const i of [c + d * dir, c - d * dir]) {
        const k = i === n - 1 ? i : i - (i % every);
        if (k >= 0 && k < n && !out.includes(k)) out.push(k);
      }
      return out;
    }

    function fill() {
      if (!armed || !set || (!sprite && !root.classList.contains("is-ready"))) return; // after the sprite pass
      const c = Math.round(cur), g = gen;
      // release: drop the frame and detach its source, so its decoded pixels go now, not at the next GC
      full.forEach((img, i) => { if (img !== poster && Math.abs(i - c) > KEEP) { delete full[i]; if (img !== shown) img.removeAttribute("src"); } });
      const list = wanted();
      for (const i of list) {
        if (active >= CONCURRENT) break;
        if (full[i] || pending.has(i)) continue;
        const img = new Image();
        active++; pending.add(i);
        img.decoding = "async";
        img.src = url(i);
        img.decode().then(() => {
          if (g !== gen) return;
          if (Math.abs(i - Math.round(cur)) <= KEEP) { full[i] = img; request(); } else img.removeAttribute("src"); // scrolled past
        }, () => {}).finally(() => {
          if (g !== gen) return;
          active--; pending.delete(i);
          fill();
        });
      }
      if (!done && list.every((i) => full[i])) {
        done = true;
        root.classList.add("is-loaded");
        root.dispatchEvent(new CustomEvent("scrollsequence:loaded"));
      }
    }

    function load(next) {
      gen++;
      active = 0; pending.clear(); done = false;
      full = []; low = []; shown = null; sprite = null;
      set = next || choose();
      const m = /\.(avif|webp|jpe?g)(\?|$)/.exec(poster.currentSrc || "");
      fmt = m ? (m[1][0] === "j" ? "jpg" : m[1]) : cfg.formats[cfg.formats.length - 1];
      if (poster.complete && poster.naturalWidth) full[0] = poster; // the poster is frame 1 (any set)
      measure();
      cur = prev = progress();
      if (cur > 0) armed = true; // restored mid-scrub: the visitor is already scrubbing
      const g = gen, lows = [], sp = new Image();
      for (let i = 0; i < n; i += step) lows.push(i);
      if (lows[lows.length - 1] !== n - 1) lows.push(n - 1);
      // First pass: one sprite of every lowStep'th frame. Full frames follow the scroll.
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
        fill();
      });
    }

    function begin() {
      if (begun || RM.matches) return;
      begun = true;
      if (!poster.currentSrc && !poster.complete) { // wait until the browser has picked a format
        poster.addEventListener("load", () => load(), { once: true });
        poster.addEventListener("error", () => load(), { once: true });
      } else load();
      addEventListener("scroll", () => { if (!armed) { armed = true; fill(); } request(); }, { passive: true });
      new ResizeObserver(measure).observe(frame);
      new ResizeObserver(measure).observe(root);
      addEventListener("resize", measure); // the viewport height sets the in-flow travel
      new ResizeObserver(measure).observe(document.body); // content above can move the block
      // Rotation swaps sets: wait for the <picture> to load the other poster, then reload frames.
      if (cfg.sets.portrait) PORTRAIT.addEventListener("change", () => { gen++; root.classList.remove("is-ready", "is-loaded"); poster.addEventListener("load", () => load(), { once: true }); });
    }

    // Start (poster + sprite) only when the sequence is within a screen of the viewport.
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { io.disconnect(); begin(); } }, { rootMargin: "100% 0px" });
    const watch = () => { if (!RM.matches) io.observe(root); };
    RM.addEventListener("change", watch);
    watch();
  }

  const all = () => document.querySelectorAll("[data-scroll-sequence]").forEach(init);
  window.ScrollSequence = { init };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", all); else all();
})();
