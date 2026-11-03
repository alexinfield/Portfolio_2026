import assert from "node:assert/strict";

// Case-study media runs edge to edge and stacks with no gap, border or seam.
// Geometry: every case at phone, tablet and desktop widths. Pixels: every
// boundary of two long cases is screenshotted and scanned for seam rows, a thin
// line (1..DPR+1 device px) that differs from the rows on both sides while
// those rows match each other.
const caseSlugs = ["molekule-go", "ping", "luma", "niche", "hyphae", "mode"];
const geometryWidths = [393, 1024, 1440];
const pixelCases = ["molekule-go", "ping", "mode"], pixelWidths = [393, 1440], pixelScales = [1, 2];

const measure = () => {
  const vw = document.documentElement.clientWidth, header = document.querySelector(".portfolio-header").getBoundingClientRect().bottom;
  const boxes = [...document.querySelectorAll(".portfolio-case-stack img:not(.ss img), .portfolio-case-stack .case-video, .portfolio-case-stack .case-sequence")]
    .filter(element => element.getClientRects().length && !element.closest("[hidden],noscript"))
    .map(element => { const host=element.matches('img')?(element.closest('.case-composite')||element.closest('.case-panel')):null;
      const logical=host?.getBoundingClientRect().width?host:element;
      const r = logical.getBoundingClientRect(); const style = getComputedStyle(logical);
      return {top: r.top + scrollY, bottom: r.bottom + scrollY, left: r.left, right: r.right, border: style.borderTopWidth + style.borderBottomWidth, radius: style.borderTopLeftRadius, margin: style.marginTop + style.marginBottom}; });
  const first = document.querySelector(".portfolio-case-stack .case-sequence, .portfolio-case-stack img:not(.ss img), .portfolio-case-stack video:not(.ss video)").getBoundingClientRect().top + scrollY;
  return {vw, scrollWidth: document.documentElement.scrollWidth, header, scrollY, boxes, first};
};

function rowsOf(boxes) {
  const rows = [];
  for (const box of [...boxes].sort((a, b) => a.top - b.top || a.left - b.left)) {
    const row = rows.find(candidate => Math.abs(candidate.top - box.top) < 0.5);
    if (row) row.boxes.push(box); else rows.push({top: box.top, boxes: [box]});
  }
  return rows.map(row => ({top: row.top, bottom: Math.max(...row.boxes.map(b => b.bottom)), left: Math.min(...row.boxes.map(b => b.left)), right: Math.max(...row.boxes.map(b => b.right)), heights: row.boxes.map(b => b.bottom - b.top)}));
}

// Runs in the page: decode a PNG screenshot and return seam rows.
async function seamRows({base64, maxThickness}) {
  const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
  const bitmap = await createImageBitmap(new Blob([bytes], {type: "image/png"}));
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height), context = canvas.getContext("2d");
  context.drawImage(bitmap, 0, 0);
  const {data, width, height} = context.getImageData(0, 0, bitmap.width, bitmap.height), T = 16, found = [];
  const diff = (x, y1, y2) => { const a = (y1 * width + x) * 4, b = (y2 * width + x) * 4; return Math.max(Math.abs(data[a] - data[b]), Math.abs(data[a + 1] - data[b + 1]), Math.abs(data[a + 2] - data[b + 2])); };
  for (let t = 1; t <= maxThickness; t++) for (let line = 1; line + t < height; line++) {
    const above = line - 1, below = line + t; let flagged = 0, run = 0, best = 0;
    for (let x = 0; x < width; x++) {
      let hit = diff(x, above, below) <= T;
      for (let s = line; hit && s < line + t; s++) hit = diff(x, s, above) > T && diff(x, s, below) > T;
      if (hit) { flagged++; run++; best = Math.max(best, run); } else run = 0;
    }
    if (flagged > width * 0.02 && best >= 24) found.push({line, thickness: t, flagged, best});
  }
  return found;
}

export async function runCaseStackRegressions(browser, baseURL) {
  const results = [], origin = new URL(baseURL).origin;
  const check = async (name, action) => {
    try { const detail = await action(); results.push({suite: "case-stack", name, pass: true, ...(detail ? {detail} : {})}); console.log(`case-stack PASS: ${name}`); }
    catch (error) { results.push({suite: "case-stack", name, pass: false, error: error.message.slice(0, 1800)}); console.log(`case-stack FAIL: ${name}: ${error.message.slice(0, 200)}`); }
  };
  const open = async scale => {
    const context = await browser.newContext({viewport: {width: 1440, height: 900}, deviceScaleFactor: scale, reducedMotion: "reduce"});
    context.setDefaultTimeout(60000);
    await context.route("**/*", route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
    return {context, page: await context.newPage()};
  };
  const {context, page} = await open(1);
  try {
    for (const width of geometryWidths) for (const slug of caseSlugs) {
      await check(`case media edge to edge with zero gaps: ${slug} @ ${width}`, async () => {
        await page.setViewportSize({width, height: 900}); await page.goto(`${baseURL}/projects/${slug}/`);
        const m = await page.evaluate(measure), rows = rowsOf(m.boxes);
        assert.ok(rows.length > 1, "case has stacked media");
        assert.equal(m.scrollWidth, m.vw, "no horizontal scroll");
        assert.ok(Math.abs(m.boxes[0].top - (m.header + m.scrollY)) < 0.01, `first media meets the header (${m.boxes[0].top} vs ${m.header})`);
        assert.ok(Math.abs(m.first - (m.header + m.scrollY)) < 0.01, `first media element starts at the header (${m.first} vs ${m.header})`);
        for (const box of m.boxes) { assert.equal(box.border, "0px0px"); assert.equal(box.radius, "0px"); assert.equal(box.margin, "0px0px"); }
        rows.forEach((row, index) => {
          // Media boxes overscan 2 px each side (the stack clips them) so no edge column shows.
          assert.ok(row.left <= 0.01 && row.right >= m.vw - 0.01, `row ${index} spans the full width (${row.left}..${row.right} of ${m.vw})`);
          assert.ok(Math.max(...row.heights) - Math.min(...row.heights) < 0.01, `row ${index} side-by-side media share one height`);
          if (index) assert.ok(Math.abs(row.top - rows[index - 1].bottom) < 0.01, `row ${index} gap ${row.top - rows[index - 1].bottom}px`);
        });
        return {rows: rows.length};
      });
    }
  } finally { await context.close(); }
  for (const scale of pixelScales) {
    const {context: scaled, page: scan} = await open(scale);
    try {
      for (const width of pixelWidths) for (const slug of pixelCases) {
        await check(`no seam rows between case media: ${slug} @ ${width} x${scale}`, async () => {
          await scan.setViewportSize({width, height: 900}); await scan.goto(`${baseURL}/projects/${slug}/`);
          const rows = rowsOf((await scan.evaluate(measure)).boxes), seams = [];
          for (let index = 1; index < rows.length; index++) {
            await scan.evaluate(y => scrollTo(0, y), Math.max(0, rows[index].top - 450));
            await scan.evaluate(async () => { await Promise.all([...document.querySelectorAll(".portfolio-case-stack img")].filter(image => { const r = image.getBoundingClientRect(); return r.bottom > -100 && r.top < innerHeight + 100; })
              .map(image => { image.loading = "eager"; return Promise.race([image.decode().catch(() => {}), new Promise(done => setTimeout(done, 15000))]); })); });
            await scan.waitForTimeout(200);
            const m = await scan.evaluate(measure), boundary = rowsOf(m.boxes)[index].top - m.scrollY;
            const shot = await scan.screenshot({clip: {x: 0, y: boundary - 8, width, height: 16}, animations: "disabled", timeout: 60000});
            const found = await scan.evaluate(seamRows, {base64: shot.toString("base64"), maxThickness: scale + 1});
            if (found.length) seams.push({boundary: index, found});
          }
          assert.deepEqual(seams, [], `seam rows at ${JSON.stringify(seams).slice(0, 400)}`);
          return {boundaries: rows.length - 1};
        });
      }
    } finally { await scaled.close(); }
  }
  return results;
}
